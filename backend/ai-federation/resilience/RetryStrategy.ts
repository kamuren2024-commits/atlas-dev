// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — RETRY STRATEGY
// Exponential backoff with jitter for retryable AI provider failures
// ============================================================================

import { RETRY } from '../core/constants';
import { AIFederationError } from '../core/errors';

export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterFactor: number;
  retryableStatusCodes: number[];
}

export interface RetryAttempt {
  attempt: number;
  delayMs: number;
  error?: string;
  provider?: string;
}

/**
 * Determines if an error is retryable based on its type and status code.
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AIFederationError) {
    return error.retryable;
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    // Network-level retryable conditions
    if (msg.includes('econnreset') || msg.includes('econnrefused') || msg.includes('socket hang up')) return true;
    if (msg.includes('etimedout') || msg.includes('network')) return true;
    if (msg.includes('fetch failed') || msg.includes('connection refused')) return true;
  }
  return false;
}

/**
 * Determines if an HTTP status code is retryable.
 */
export function isRetryableStatus(statusCode: number): boolean {
  return (RETRY.RETRYABLE_STATUS_CODES as readonly number[]).includes(statusCode);
}

/**
 * Calculates delay for a given attempt using exponential backoff + jitter.
 */
export function calculateDelay(attempt: number, config?: Partial<RetryConfig>): number {
  const baseDelayMs = config?.baseDelayMs ?? RETRY.BASE_DELAY_MS;
  const maxDelayMs = config?.maxDelayMs ?? RETRY.MAX_DELAY_MS;
  const jitterFactor = config?.jitterFactor ?? RETRY.JITTER_FACTOR;
  const exponentialDelay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
  const jitter = exponentialDelay * jitterFactor * Math.random();
  return Math.round(exponentialDelay + jitter);
}

/**
 * Retry executor — wraps an async operation with configurable retry logic.
 * Only retries errors classified as retryable.
 */
export async function executeWithRetry<T>(
  fn: () => Promise<T>,
  options?: {
    config?: Partial<RetryConfig>;
    onRetry?: (attempt: RetryAttempt) => void;
    provider?: string;
  }
): Promise<T> {
  const config = { ...RETRY, ...options?.config };
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry if not retryable or last attempt
      if (!isRetryableError(error) || attempt >= config.maxAttempts) {
        throw error;
      }

      const delayMs = calculateDelay(attempt, config);

      const retryInfo: RetryAttempt = {
        attempt,
        delayMs,
        error: error instanceof Error ? error.message : String(error),
        provider: options?.provider,
      };

      console.warn(
        `[RETRY] Attempt ${attempt}/${config.maxAttempts} for ${options?.provider || 'unknown'} — waiting ${delayMs}ms`
      );

      options?.onRetry?.(retryInfo);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
