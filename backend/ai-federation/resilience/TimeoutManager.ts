// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — TIMEOUT MANAGER
// Layered timeouts: connection, inference, streaming, total request
// ============================================================================

import { TIMEOUT } from '../core/constants';
import { AIProviderTimeoutError } from '../core/errors';

export interface TimeoutConfig {
  connectMs: number;
  inferenceMs: number;
  streamIdleMs: number;
  totalRequestMs: number;
}

/**
 * Wraps a promise with a timeout. Rejects with AIProviderTimeoutError on expiry.
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  provider: string,
  requestId?: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new AIProviderTimeoutError(provider, timeoutMs, { requestId }));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer!);
  });
}

/**
 * Creates an AbortController with a timeout that auto-aborts.
 */
export function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => {
    if (!controller.signal.aborted) {
      controller.abort();
    }
  }, timeoutMs);
  return controller;
}

/**
 * Provides layered timeout configuration per provider.
 */
export class TimeoutManager {
  private static instance: TimeoutManager;
  private providerTimeouts: Map<string, TimeoutConfig> = new Map();

  private constructor() {}

  static getInstance(): TimeoutManager {
    if (!TimeoutManager.instance) {
      TimeoutManager.instance = new TimeoutManager();
    }
    return TimeoutManager.instance;
  }

  /**
   * Register timeout configuration for a provider.
   */
  register(providerId: string, config: Partial<TimeoutConfig>): void {
    const existing = this.providerTimeouts.get(providerId) || this.getDefault();
    this.providerTimeouts.set(providerId, {
      ...existing,
      ...config,
    });
  }

  /**
   * Get timeout configuration for a provider.
   */
  get(providerId: string): TimeoutConfig {
    return this.providerTimeouts.get(providerId) || this.getDefault();
  }

  /**
   * Get default timeout configuration.
   */
  getDefault(): TimeoutConfig {
    return {
      connectMs: TIMEOUT.CONNECT_MS,
      inferenceMs: TIMEOUT.INFERENCE_MS,
      streamIdleMs: TIMEOUT.STREAM_IDLE_MS,
      totalRequestMs: TIMEOUT.TOTAL_REQUEST_MS,
    };
  }
}
