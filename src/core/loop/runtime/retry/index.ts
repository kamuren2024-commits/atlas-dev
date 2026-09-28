/**
 * Loop Runtime Engine — Retry Strategies & Circuit Breaker Policy
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export type RetryStrategyType = 'FIXED' | 'LINEAR' | 'EXPONENTIAL' | 'EXPONENTIAL_JITTER';

export interface RetryPolicy {
  strategy: RetryStrategyType;
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffFactor?: number;
}

export class RetryEngine {
  private static circuitBreakerFailures = new Map<string, number>();
  private static circuitBreakerThreshold = 5;
  private static circuitBreakerResetMs = 60000;
  private static circuitBreakerLastFailureTime = new Map<string, number>();

  public static getDelay(attempt: number, policy: RetryPolicy): number {
    if (attempt >= policy.maxAttempts) {
      return -1; // Retry limit exceeded
    }

    let delay = policy.baseDelayMs;
    const factor = policy.backoffFactor ?? 2;

    switch (policy.strategy) {
      case 'LINEAR':
        delay = policy.baseDelayMs * (attempt + 1);
        break;
      case 'EXPONENTIAL':
        delay = policy.baseDelayMs * Math.pow(factor, attempt);
        break;
      case 'EXPONENTIAL_JITTER':
        const expDelay = policy.baseDelayMs * Math.pow(factor, attempt);
        // Fully jittered: random number between 0 and expDelay
        delay = Math.random() * expDelay;
        break;
      case 'FIXED':
      default:
        delay = policy.baseDelayMs;
        break;
    }

    return Math.min(delay, policy.maxDelayMs);
  }

  public static isCircuitBreakerOpen(key: string): boolean {
    const failures = this.circuitBreakerFailures.get(key) || 0;
    if (failures >= this.circuitBreakerThreshold) {
      const lastFailure = this.circuitBreakerLastFailureTime.get(key) || 0;
      if (Date.now() - lastFailure > this.circuitBreakerResetMs) {
        // Reset/Half-open
        this.circuitBreakerFailures.set(key, 0);
        return false;
      }
      return true;
    }
    return false;
  }

  public static recordFailure(key: string): void {
    const current = this.circuitBreakerFailures.get(key) || 0;
    this.circuitBreakerFailures.set(key, current + 1);
    this.circuitBreakerLastFailureTime.set(key, Date.now());
  }

  public static recordSuccess(key: string): void {
    this.circuitBreakerFailures.delete(key);
    this.circuitBreakerLastFailureTime.delete(key);
  }
}
