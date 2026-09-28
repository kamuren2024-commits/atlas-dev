// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AI OBSERVABILITY
// Trace the complete cognitive execution path
// ============================================================================

import { generateId } from '../../../src/core/shared/crypto';

export interface Span {
  spanId: string;
  traceId: string;
  parentSpanId?: string;
  name: string;
  component: string;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  status: 'active' | 'success' | 'error';
  attributes: Record<string, any>;
  error?: string;
}

export interface Trace {
  traceId: string;
  name: string;
  missionId?: string;
  agentId?: string;
  startedAt: number;
  completedAt?: number;
  status: 'active' | 'success' | 'error';
  spans: Span[];
}

export interface MetricPoint {
  name: string;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

export class AIObservability {
  private static traces: Map<string, Trace> = new Map();
  private static activeSpans: Map<string, Span> = new Map();
  private static metrics: MetricPoint[] = [];
  private static maxTraces = 1000;
  private static maxMetrics = 10000;

  /**
   * Begin a new trace (distributed trace of cognitive execution)
   */
  static startTrace(name: string, options?: { missionId?: string; agentId?: string; parentTraceId?: string }): string {
    const traceId = generateId('trc');
    this.traces.set(traceId, {
      traceId,
      name,
      missionId: options?.missionId,
      agentId: options?.agentId,
      startedAt: Date.now(),
      status: 'active',
      spans: [],
    });
    return traceId;
  }

  /**
   * Complete a trace
   */
  static endTrace(traceId: string, status: 'success' | 'error' = 'success'): void {
    const trace = this.traces.get(traceId);
    if (!trace) return;

    trace.completedAt = Date.now();
    trace.status = status;

    // Cap stored traces
    if (this.traces.size > this.maxTraces) {
      const keys = Array.from(this.traces.keys()).slice(0, this.traces.size - this.maxTraces);
      for (const key of keys) this.traces.delete(key);
    }
  }

  /**
   * Start a span within a trace
   */
  static startSpan(
    traceId: string,
    name: string,
    component: string,
    attributes: Record<string, any> = {},
    parentSpanId?: string
  ): string {
    const span: Span = {
      spanId: generateId('spn'),
      traceId,
      parentSpanId,
      name,
      component,
      startedAt: Date.now(),
      status: 'active',
      attributes,
    };

    const trace = this.traces.get(traceId);
    if (trace) {
      trace.spans.push(span);
    }

    this.activeSpans.set(span.spanId, span);
    return span.spanId;
  }

  /**
   * End an active span
   */
  static endSpan(spanId: string, status: 'success' | 'error' = 'success', error?: string): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.completedAt = Date.now();
    span.durationMs = span.completedAt - span.startedAt;
    span.status = status;
    span.error = error;

    // Also update the span in the trace
    const trace = this.traces.get(span.traceId);
    if (trace) {
      const traceSpan = trace.spans.find(s => s.spanId === spanId);
      if (traceSpan) {
        Object.assign(traceSpan, span);
      }
    }

    this.activeSpans.delete(spanId);
  }

  /**
   * Convenience wrapper for tracing an async operation
   */
  static async trace<T>(
    traceId: string,
    name: string,
    component: string,
    fn: () => Promise<T>,
    attributes: Record<string, any> = {}
  ): Promise<T> {
    const spanId = this.startSpan(traceId, name, component, attributes);
    try {
      const result = await fn();
      this.endSpan(spanId, 'success');
      return result;
    } catch (err: any) {
      this.endSpan(spanId, 'error', err.message);
      throw err;
    }
  }

  /**
   * Record a metric
   */
  static metric(name: string, value: number, labels: Record<string, string> = {}): void {
    this.metrics.push({ name, value, labels, timestamp: Date.now() });
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2);
    }
  }

  /**
   * Get a trace by ID
   */
  static getTrace(traceId: string): Trace | undefined {
    return this.traces.get(traceId);
  }

  /**
   * Get all traces (optionally filtered)
   */
  static getTraces(filters?: { missionId?: string; agentId?: string; status?: string; limit?: number }): Trace[] {
    let results = Array.from(this.traces.values());
    if (filters?.missionId) results = results.filter(t => t.missionId === filters.missionId);
    if (filters?.agentId) results = results.filter(t => t.agentId === filters.agentId);
    if (filters?.status) results = results.filter(t => t.status === filters.status);
    results.sort((a, b) => b.startedAt - a.startedAt);
    if (filters?.limit) results = results.slice(0, filters.limit);
    return results;
  }

  /**
   * Get metric timeseries
   */
  static getMetricSeries(name: string, since?: number): MetricPoint[] {
    let points = AIObservability.metrics.filter(m => m.name === name);
    if (since) points = points.filter(p => p.timestamp >= since);
    return points;
  }

  /**
   * Compute trace statistics
   */
  static getStats(): {
    totalTraces: number;
    activeTraces: number;
    successRate: number;
    averageDurationMs: number;
    recentErrors: Array<{ traceId: string; spanName: string; component: string; error: string; timestamp: number }>;
  } {
    const traces = Array.from(AIObservability.traces.values());
    const completed = traces.filter(t => t.completedAt && t.status !== 'active');
    const success = completed.filter(t => t.status === 'success');
    const durations = completed.map(t => (t.completedAt! - t.startedAt));
    const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    const recentErrors = traces
      .flatMap(t => t.spans.filter(s => s.status === 'error'))
      .slice(-20)
      .map(s => ({
        traceId: s.traceId,
        spanName: s.name,
        component: s.component,
        error: s.error || 'unknown',
        timestamp: s.startedAt,
      }));

    return {
      totalTraces: traces.length,
      activeTraces: AIObservability.activeSpans.size,
      successRate: completed.length > 0 ? (success.length / completed.length) * 100 : 0,
      averageDurationMs: avgDuration,
      recentErrors,
    };
  }
}
