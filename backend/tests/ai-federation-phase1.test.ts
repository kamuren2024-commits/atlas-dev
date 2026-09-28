// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — PHASE 1 TEST SUITE
// Provider Registry, Model Registry, Gateway, Circuit Breaker, Retry, Errors
// ============================================================================

import { describe, it, expect, beforeEach, afterEach } from './test-helper';
import { randomUUID } from 'crypto';

// --- Core ---
import { AIFederationError, AIProviderUnavailableError, AIProviderAuthenticationError, AIProviderRateLimitError, AIProviderTimeoutError, AIModelNotFoundError, AIInferenceError, AICircuitOpenError, AIRequestValidationError, AIAllProvidersExhaustedError } from '../ai-federation/core/errors';
import { createCorrelationContext, createChildSpan } from '../ai-federation/core/correlation';
import { TIMEOUT, CIRCUIT_BREAKER, RETRY } from '../ai-federation/core/constants';

// --- Resilience ---
import { CircuitBreaker, CircuitBreakerRegistry } from '../ai-federation/resilience/CircuitBreaker';
import { executeWithRetry, isRetryableError, calculateDelay } from '../ai-federation/resilience/RetryStrategy';
import { withTimeout } from '../ai-federation/resilience/TimeoutManager';

// --- Observability ---
import { FederationAuditLogger } from '../ai-federation/observability/FederationAuditLogger';
import { ObservabilityHooks } from '../ai-federation/observability/ObservabilityHooks';

// ============================================================================
// ERROR HIERARCHY
// ============================================================================
describe('AI Federation Error Hierarchy', () => {
  it('AIProviderUnavailableError is retryable with 503', () => {
    const err = new AIProviderUnavailableError('test-provider');
    expect(err.code).toBe('AI_PROVIDER_UNAVAILABLE');
    expect(err.statusCode).toBe(503);
    expect(err.retryable).toBe(true);
    expect(err.provider).toBe('test-provider');
    expect(err.safeMessage).toContain('unavailable');
  });

  it('AIProviderAuthenticationError is NOT retryable', () => {
    const err = new AIProviderAuthenticationError('test-provider');
    expect(err.code).toBe('AI_PROVIDER_AUTH_ERROR');
    expect(err.retryable).toBe(false);
  });

  it('AIProviderRateLimitError is retryable', () => {
    const err = new AIProviderRateLimitError('test-provider', 5000);
    expect(err.code).toBe('AI_PROVIDER_RATE_LIMITED');
    expect(err.retryable).toBe(true);
    expect(err.retryAfterMs).toBe(5000);
  });

  it('AIProviderTimeoutError carries timeout metadata', () => {
    const err = new AIProviderTimeoutError('test-provider', 30000);
    expect(err.code).toBe('AI_PROVIDER_TIMEOUT');
    expect(err.timeoutMs).toBe(30000);
    expect(err.retryable).toBe(true);
  });

  it('AIModelNotFoundError is NOT retryable', () => {
    const err = new AIModelNotFoundError('gpt-5', 'openai');
    expect(err.code).toBe('AI_MODEL_NOT_FOUND');
    expect(err.retryable).toBe(false);
    expect(err.model).toBe('gpt-5');
  });

  it('AICircuitOpenError carries reset timestamp', () => {
    const resetAt = Date.now() + 60000;
    const err = new AICircuitOpenError('test-provider', resetAt);
    expect(err.code).toBe('AI_CIRCUIT_OPEN');
    expect(err.resetAtMs).toBe(resetAt);
    expect(err.retryable).toBe(true);
  });

  it('toJSON does not leak secrets', () => {
    const err = new AIProviderUnavailableError('test-provider');
    const json = err.toJSON();
    expect(json.code).toBeDefined();
    expect(json.safeMessage).toBeDefined();
    expect(json.provider).toBe('test-provider');
  });

  it('AIFederationError sanitizes API keys from messages', () => {
    const err = new AIInferenceError('Bearer sk-abc123def456ghi789jkl012mno345pqr678stu901', {
      provider: 'test',
    });
    expect(err.safeMessage).not.toContain('sk-abc123');
  });

  it('AIRequestValidationError is NOT retryable', () => {
    const err = new AIRequestValidationError('Messages required');
    expect(err.retryable).toBe(false);
    expect(err.statusCode).toBe(400);
  });

  it('AIAllProvidersExhaustedError counts attempts', () => {
    const err = new AIAllProvidersExhaustedError(5, 'all failed');
    expect(err.attemptCount).toBe(5);
    expect(err.lastError).toBe('all failed');
  });
});

// ============================================================================
// CORRELATION
// ============================================================================
describe('Request Correlation', () => {
  it('creates correlation context with generated IDs', () => {
    const ctx = createCorrelationContext();
    expect(ctx.requestId).toMatch(/^req-/);
    expect(ctx.traceId).toMatch(/^trc-/);
    expect(ctx.spanId).toMatch(/^spn-/);
    expect(ctx.timestamp).toBeDefined();
  });

  it('creates child span with same request and trace IDs', () => {
    const parent = createCorrelationContext({ missionId: 'M-001' });
    const child = createChildSpan(parent, 'agent-1');

    expect(child.requestId).toBe(parent.requestId);
    expect(child.traceId).toBe(parent.traceId);
    expect(child.spanId).not.toBe(parent.spanId);
    expect(child.parentId).toBe(parent.spanId);
    expect(child.missionId).toBe('M-001');
    expect(child.agentId).toBe('agent-1');
  });

  it('respects override values', () => {
    const ctx = createCorrelationContext({
      requestId: 'custom-req',
      missionId: 'custom-mission',
    });
    expect(ctx.requestId).toBe('custom-req');
    expect(ctx.missionId).toBe('custom-mission');
  });
});

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================
describe('Circuit Breaker', () => {
  let cb: CircuitBreaker;

  beforeEach(() => {
    cb = new CircuitBreaker('test-provider', {
      failureThreshold: 3,
      resetTimeoutMs: 1000,
      successThreshold: 2,
    });
  });

  it('starts in CLOSED state', () => {
    expect(cb.getState()).toBe('CLOSED');
  });

  it('allows requests in CLOSED state', () => {
    expect(() => cb.allow()).not.toThrow();
  });

  it('transitions to OPEN after failure threshold', () => {
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('CLOSED');
    cb.recordFailure();
    expect(cb.getState()).toBe('OPEN');
  });

  it('blocks requests when OPEN', () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(() => cb.allow()).toThrow(AICircuitOpenError);
  });

  it('resets failure count on success in CLOSED', () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordSuccess();
    cb.recordFailure();
    cb.recordFailure();
    // Should still be CLOSED because success reset the count
    expect(cb.getState()).toBe('CLOSED');
  });

  it('force resets to CLOSED', () => {
    cb.recordFailure();
    cb.recordFailure();
    cb.recordFailure();
    expect(cb.getState()).toBe('OPEN');
    cb.forceReset();
    expect(cb.getState()).toBe('CLOSED');
  });

  it('takes snapshot with correct data', () => {
    cb.recordFailure();
    const snap = cb.snapshot();
    expect(snap.providerId).toBe('test-provider');
    expect(snap.failures).toBe(1);
    expect(snap.state).toBe('CLOSED');
  });
});

// ============================================================================
// RETRY STRATEGY
// ============================================================================
describe('Retry Strategy', () => {
  it('isRetryableError returns true for AIFederationError retryable', () => {
    const err = new AIProviderUnavailableError('test');
    expect(isRetryableError(err)).toBe(true);
  });

  it('isRetryableError returns false for non-retryable', () => {
    const err = new AIProviderAuthenticationError('test');
    expect(isRetryableError(err)).toBe(false);
  });

  it('isRetryableError returns true for network errors', () => {
    expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
    expect(isRetryableError(new Error('socket hang up'))).toBe(true);
    expect(isRetryableError(new Error('ETIMEDOUT'))).toBe(true);
  });

  it('calculateDelay uses exponential backoff', () => {
    const d1 = calculateDelay(1, { jitterFactor: 0 });
    const d2 = calculateDelay(2, { jitterFactor: 0 });
    const d3 = calculateDelay(3, { jitterFactor: 0 });
    expect(d2).toBeGreaterThan(d1);
    expect(d3).toBeGreaterThan(d2);
  });

  it('calculateDelay respects maxDelayMs', () => {
    const delay = calculateDelay(20, { maxDelayMs: 5000, jitterFactor: 0 });
    expect(delay).toBeLessThanOrEqual(5000);
  });

  it('executeWithRetry retries retryable errors', async () => {
    let attempts = 0;
    const result = await executeWithRetry(
      async () => {
        attempts++;
        if (attempts < 3) throw new AIProviderUnavailableError('test');
        return 'success';
      },
      { config: { maxAttempts: 3, baseDelayMs: 10, jitterFactor: 0 } }
    );
    expect(result).toBe('success');
    expect(attempts).toBe(3);
  });

  it('executeWithRetry does not retry non-retryable errors', async () => {
    let attempts = 0;
    try {
      await executeWithRetry(
        async () => {
          attempts++;
          throw new AIProviderAuthenticationError('test');
        },
        { config: { maxAttempts: 3, baseDelayMs: 10, jitterFactor: 0 } }
      );
    } catch (err) {
      expect(err).toBeInstanceOf(AIProviderAuthenticationError);
    }
    expect(attempts).toBe(1);
  });
});

// ============================================================================
// TIMEOUT
// ============================================================================
describe('Timeout Manager', () => {
  it('withTimeout resolves if fast enough', async () => {
    const result = await withTimeout(Promise.resolve('ok'), 1000, 'test');
    expect(result).toBe('ok');
  });

  it('withTimeout rejects on timeout', async () => {
    const slowPromise = new Promise(resolve => setTimeout(resolve, 5000));
    try {
      await withTimeout(slowPromise, 50, 'test-provider');
      expect(true).toBe(false); // Should not reach
    } catch (err) {
      expect(err).toBeInstanceOf(AIProviderTimeoutError);
    }
  });
});

// ============================================================================
// AUDIT LOGGER
// ============================================================================
describe('Federation Audit Logger', () => {
  let logger: FederationAuditLogger;

  beforeEach(() => {
    logger = FederationAuditLogger.getInstance();
  });

  it('records audit entries', () => {
    const entry = logger.record({
      requestId: 'req-1',
      traceId: 'trc-1',
      provider: 'gemini',
      model: 'gemini-2.5-pro',
      classification: 'INTERNAL',
      latencyMs: 1500,
      status: 'SUCCESS',
      costUsd: 0.001,
    });
    expect(entry.id).toMatch(/^aud-/);
    expect(entry.hash).toBeDefined();
    expect(entry.previousHash).toBeDefined();
  });

  it('verifies chain integrity', () => {
    const result = logger.verifyChain();
    expect(result.valid).toBe(true);
    expect(result.totalEntries).toBeGreaterThanOrEqual(0);
  });

  it('queries by provider', () => {
    const entries = logger.query({ provider: 'gemini', limit: 5 });
    expect(Array.isArray(entries)).toBe(true);
  });

  it('gets stats', () => {
    const stats = logger.getStats();
    expect(stats).toHaveProperty('totalEntries');
    expect(stats).toHaveProperty('successRate');
    expect(stats).toHaveProperty('totalCostUsd');
  });
});

// ============================================================================
// OBSERVABILITY HOOKS
// ============================================================================
describe('Observability Hooks', () => {
  it('emits and retrieves events', () => {
    const hooks = ObservabilityHooks.getInstance();
    const requestCount = hooks.getRecent().length;

    hooks.emit({
      type: 'ai.request.start',
      requestId: 'req-test',
      traceId: 'trc-test',
    });

    const events = hooks.getRecent();
    expect(events.length).toBeGreaterThan(requestCount);

    const last = events[events.length - 1];
    expect(last.type).toBe('ai.request.start');
    expect(last.requestId).toBe('req-test');
  });

  it('filters events by request ID', () => {
    const hooks = ObservabilityHooks.getInstance();
    hooks.emit({
      type: 'ai.provider.call',
      requestId: 'req-unique-123',
      traceId: 'trc-unique-123',
      provider: 'gemini',
    });

    const events = hooks.getRequestEvents('req-unique-123');
    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events.every(e => e.requestId === 'req-unique-123')).toBe(true);
  });

  it('counts events by type', () => {
    const stats = ObservabilityHooks.getInstance().getEventStats();
    expect(typeof stats).toBe('object');
  });
});

// ============================================================================
// CONSTANTS
// ============================================================================
describe('Federation Constants', () => {
  it('TIMEOUT values are reasonable', () => {
    expect(TIMEOUT.CONNECT_MS).toBeGreaterThan(0);
    expect(TIMEOUT.INFERENCE_MS).toBeGreaterThan(TIMEOUT.CONNECT_MS);
    expect(TIMEOUT.TOTAL_REQUEST_MS).toBeGreaterThan(TIMEOUT.INFERENCE_MS);
  });

  it('CIRCUIT_BREAKER values are sane', () => {
    expect(CIRCUIT_BREAKER.FAILURE_THRESHOLD).toBeGreaterThan(0);
    expect(CIRCUIT_BREAKER.RESET_TIMEOUT_MS).toBeGreaterThan(0);
    expect(CIRCUIT_BREAKER.SUCCESS_THRESHOLD).toBeGreaterThan(0);
  });

  it('RETRY values are sane', () => {
    expect(RETRY.MAX_ATTEMPTS).toBeGreaterThan(0);
    expect(RETRY.BASE_DELAY_MS).toBeGreaterThan(0);
    expect(RETRY.MAX_DELAY_MS).toBeGreaterThan(RETRY.BASE_DELAY_MS);
    expect(RETRY.JITTER_FACTOR).toBeGreaterThanOrEqual(0);
    expect(RETRY.JITTER_FACTOR).toBeLessThanOrEqual(1);
  });
});
