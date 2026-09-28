import { randomUUID } from 'crypto';
import { generateShortId } from '../../src/core/shared/crypto';

export interface TraceSpan {
  spanId: string;
  parentSpanId?: string;
  traceId: string;
  name: string;
  source: string;
  startedAt: string;
  completedAt?: string;
  status: 'active' | 'success' | 'error';
  metadata: Record<string, any>;
  durationMs?: number;
  errorMessage?: string;
}

export class ObservabilityEngine {
  private static activeSpans = new Map<string, TraceSpan>();
  private static spanHistory: TraceSpan[] = [];

  /**
   * Generates a zero-dependency RFC4122 v4 compliant UUID
   */
  public static uuidv4(): string {
    return randomUUID();
  }

  public static generateTraceId(): string {
    return `trc-${this.uuidv4()}`;
  }

  public static generateSpanId(): string {
    return generateShortId('spn');
  }

  public static generateCorrelationId(): string {
    return `corr-${this.uuidv4().substring(0, 13)}`;
  }

  /**
   * Begin recording an execution span
   */
  public static startSpan(
    name: string,
    source: string,
    metadata: Record<string, any> = {},
    parentSpanId?: string,
    providedTraceId?: string
  ): TraceSpan {
    const spanId = this.generateSpanId();
    const traceId = providedTraceId || this.generateTraceId();
    
    const span: TraceSpan = {
      spanId,
      parentSpanId,
      traceId,
      name,
      source,
      startedAt: new Date().toISOString(),
      status: 'active',
      metadata
    };

    this.activeSpans.set(spanId, span);
    return span;
  }

  /**
   * Conclude an active span
   */
  public static endSpan(spanId: string, status: 'success' | 'error' = 'success', errorMsg?: string): void {
    const span = this.activeSpans.get(spanId);
    if (!span) return;

    span.completedAt = new Date().toISOString();
    span.durationMs = Date.now() - new Date(span.startedAt).getTime();
    span.status = status;
    
    if (errorMsg) {
      span.errorMessage = errorMsg;
    }

    this.activeSpans.delete(spanId);
    this.spanHistory.push(span);

    // Keep span history capped to prevent memory leaks (capped at 500 records)
    if (this.spanHistory.length > 500) {
      this.spanHistory.shift();
    }
  }

  /**
   * High-Level auto-trace Wrapper for clean operations
   */
  public static async traceAction<T>(
    name: string,
    source: string,
    metadata: Record<string, any>,
    action: () => Promise<T>,
    traceId?: string,
    parentSpanId?: string
  ): Promise<T> {
    const span = this.startSpan(name, source, metadata, parentSpanId, traceId);
    try {
      const result = await action();
      this.endSpan(span.spanId, 'success');
      return result;
    } catch (err: any) {
      this.endSpan(span.spanId, 'error', err instanceof Error ? err.message : String(err));
      throw err;
    }
  }

  public static getActiveSpans(): TraceSpan[] {
    return Array.from(this.activeSpans.values());
  }

  public static getSpanHistory(): TraceSpan[] {
    return this.spanHistory;
  }

  /**
   * Retrieves full end-to-end trace tree path
   */
  public static getTraceTree(traceId: string): TraceSpan[] {
    return this.spanHistory.filter(s => s.traceId === traceId);
  }
}
