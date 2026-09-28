// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — CIRCUIT BREAKER
// Per-provider circuit breaker with CLOSED → OPEN → HALF_OPEN → CLOSED
// ============================================================================

import { CIRCUIT_BREAKER } from '../core/constants';
import { AICircuitOpenError } from '../core/errors';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  successThreshold: number;
  halfOpenMaxConcurrent: number;
}

export interface CircuitBreakerSnapshot {
  providerId: string;
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  openedAt?: number;
  nextTestAt?: number;
}

/**
 * Enterprise circuit breaker for AI providers.
 * Prevents cascading failures by blocking requests to failing providers.
 */
export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures = 0;
  private successes = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private openedAt?: number;
  private halfOpenInflight = 0;

  private readonly config: CircuitBreakerConfig;
  private readonly providerId: string;

  constructor(
    providerId: string,
    config?: Partial<CircuitBreakerConfig>
  ) {
    this.providerId = providerId;
    this.config = {
      failureThreshold: config?.failureThreshold ?? CIRCUIT_BREAKER.FAILURE_THRESHOLD,
      resetTimeoutMs: config?.resetTimeoutMs ?? CIRCUIT_BREAKER.RESET_TIMEOUT_MS,
      successThreshold: config?.successThreshold ?? CIRCUIT_BREAKER.SUCCESS_THRESHOLD,
      halfOpenMaxConcurrent: config?.halfOpenMaxConcurrent ?? CIRCUIT_BREAKER.HALF_OPEN_MAX_CONCURRENT,
    };
  }

  /**
   * Check if the circuit is allowing requests through.
   * Returns normally if allowed, throws AICircuitOpenError if blocked.
   */
  allow(): void {
    if (this.state === 'CLOSED') return;

    if (this.state === 'OPEN') {
      // Check if reset timeout has elapsed → transition to HALF_OPEN
      if (this.openedAt && Date.now() - this.openedAt >= this.config.resetTimeoutMs) {
        this.transitionTo('HALF_OPEN');
        this.halfOpenInflight = 0;
      } else {
        const nextTest = (this.openedAt || 0) + this.config.resetTimeoutMs;
        throw new AICircuitOpenError(this.providerId, nextTest);
      }
    }

    // HALF_OPEN: allow limited requests
    if (this.state === 'HALF_OPEN') {
      if (this.halfOpenInflight >= this.config.halfOpenMaxConcurrent) {
        const nextTest = (this.openedAt || 0) + this.config.resetTimeoutMs;
        throw new AICircuitOpenError(this.providerId, nextTest);
      }
      this.halfOpenInflight++;
    }
  }

  /**
   * Record a successful request.
   */
  recordSuccess(): void {
    this.lastSuccessTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      this.halfOpenInflight = Math.max(0, this.halfOpenInflight - 1);
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo('CLOSED');
      }
    } else {
      // In CLOSED: reset failure count on success
      this.failures = 0;
    }
  }

  /**
   * Record a failed request.
   */
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === 'HALF_OPEN') {
      // Any failure in half-open immediately opens the circuit
      this.halfOpenInflight = Math.max(0, this.halfOpenInflight - 1);
      this.transitionTo('OPEN');
    } else if (this.failures >= this.config.failureThreshold) {
      this.transitionTo('OPEN');
    }
  }

  /**
   * Get current circuit state.
   */
  getState(): CircuitState {
    // Auto-transition OPEN → HALF_OPEN if timeout elapsed
    if (this.state === 'OPEN' && this.openedAt && Date.now() - this.openedAt >= this.config.resetTimeoutMs) {
      this.transitionTo('HALF_OPEN');
    }
    return this.state;
  }

  /**
   * Get a snapshot for observability.
   */
  snapshot(): CircuitBreakerSnapshot {
    // Ensure state is current
    this.getState();
    return {
      providerId: this.providerId,
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      openedAt: this.openedAt,
      nextTestAt: this.openedAt ? this.openedAt + this.config.resetTimeoutMs : undefined,
    };
  }

  /**
   * Force reset the circuit to CLOSED (for manual recovery).
   */
  forceReset(): void {
    this.transitionTo('CLOSED');
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (newState === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
      this.openedAt = undefined;
      this.halfOpenInflight = 0;
    } else if (newState === 'OPEN') {
      this.openedAt = Date.now();
      this.successes = 0;
    } else if (newState === 'HALF_OPEN') {
      this.successes = 0;
      this.halfOpenInflight = 0;
    }

    console.log(`[CIRCUIT-BREAKER] ${this.providerId}: ${oldState} → ${newState}`);
  }
}

/**
 * Registry of circuit breakers per provider.
 */
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private breakers: Map<string, CircuitBreaker> = new Map();

  private constructor() {}

  static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  get(providerId: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(providerId)) {
      this.breakers.set(providerId, new CircuitBreaker(providerId, config));
    }
    return this.breakers.get(providerId)!;
  }

  getAll(): CircuitBreakerSnapshot[] {
    return Array.from(this.breakers.values()).map(b => b.snapshot());
  }

  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.forceReset();
    }
  }
}
