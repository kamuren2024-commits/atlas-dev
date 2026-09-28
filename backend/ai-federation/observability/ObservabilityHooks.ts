// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — OBSERVABILITY HOOKS
// Structured telemetry for AI request lifecycle
// ============================================================================

export type TraceEventType =
  | 'ai.request.start'
  | 'ai.request.end'
  | 'ai.provider.resolve'
  | 'ai.provider.health'
  | 'ai.provider.call'
  | 'ai.provider.response'
  | 'ai.provider.error'
  | 'ai.circuit.open'
  | 'ai.circuit.close'
  | 'ai.circuit.half_open'
  | 'ai.retry'
  | 'ai.timeout'
  | 'ai.cache.hit'
  | 'ai.cache.miss'
  | 'ai.policy.check'
  | 'ai.policy.deny'
  | 'ai.audit.record'
  | 'ai.fallback.activate'
  | 'ai.observability.span';

export interface TraceEvent {
  type: TraceEventType;
  timestamp: string;
  requestId: string;
  traceId: string;
  spanId?: string;
  provider?: string;
  model?: string;
  latencyMs?: number;
  status?: 'OK' | 'ERROR' | 'TIMEOUT' | 'RATE_LIMITED';
  metadata?: Record<string, any>;
}

/**
 * Observability pipeline — emits structured trace events.
 * Does not emit API keys, authorization headers, or raw secrets.
 */
export class ObservabilityHooks {
  private static instance: ObservabilityHooks;
  private events: TraceEvent[] = [];
  private listeners: Array<(event: TraceEvent) => void> = [];
  private maxEvents = 10_000;

  private constructor() {}

  static getInstance(): ObservabilityHooks {
    if (!ObservabilityHooks.instance) {
      ObservabilityHooks.instance = new ObservabilityHooks();
    }
    return ObservabilityHooks.instance;
  }

  /**
   * Emit a trace event.
   */
  emit(event: Omit<TraceEvent, 'timestamp'>): void {
    const fullEvent: TraceEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.events.push(fullEvent);

    // Cap memory
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-Math.floor(this.maxEvents / 2));
    }

    // Notify listeners
    for (const listener of this.listeners) {
      try {
        listener(fullEvent);
      } catch {
        // Don't let listener errors break observability
      }
    }
  }

  /**
   * Subscribe to trace events.
   */
  subscribe(listener: (event: TraceEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Get recent events.
   */
  getRecent(limit?: number): TraceEvent[] {
    return limit ? this.events.slice(-limit) : [...this.events];
  }

  /**
   * Get events for a specific request.
   */
  getRequestEvents(requestId: string): TraceEvent[] {
    return this.events.filter(e => e.requestId === requestId);
  }

  /**
   * Get event counts by type.
   */
  getEventStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    for (const event of this.events) {
      stats[event.type] = (stats[event.type] || 0) + 1;
    }
    return stats;
  }
}

// Convenience emit functions for common events
export const trace = {
  requestStart(requestId: string, traceId: string, metadata?: Record<string, any>) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.request.start',
      requestId,
      traceId,
      metadata,
    });
  },

  requestEnd(requestId: string, traceId: string, latencyMs: number, status: TraceEvent['status']) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.request.end',
      requestId,
      traceId,
      latencyMs,
      status,
    });
  },

  providerCall(requestId: string, traceId: string, provider: string, model?: string) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.provider.call',
      requestId,
      traceId,
      provider,
      model,
    });
  },

  providerResponse(requestId: string, traceId: string, provider: string, model: string, latencyMs: number) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.provider.response',
      requestId,
      traceId,
      provider,
      model,
      latencyMs,
      status: 'OK',
    });
  },

  providerError(requestId: string, traceId: string, provider: string, error: string) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.provider.error',
      requestId,
      traceId,
      provider,
      status: 'ERROR',
      metadata: { error },
    });
  },

  retry(requestId: string, traceId: string, provider: string, attempt: number, delayMs: number) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.retry',
      requestId,
      traceId,
      provider,
      metadata: { attempt, delayMs },
    });
  },

  circuitOpen(provider: string) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.circuit.open',
      requestId: 'system',
      traceId: 'system',
      provider,
    });
  },

  cacheHit(requestId: string, traceId: string, provider: string) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.cache.hit',
      requestId,
      traceId,
      provider,
    });
  },

  cacheMiss(requestId: string, traceId: string) {
    ObservabilityHooks.getInstance().emit({
      type: 'ai.cache.miss',
      requestId,
      traceId,
    });
  },
};
