/**
 * 01-20 — FINANCE OBSERVABILITY
 *
 * Structured counters, latency trackers, and audit logging for all
 * operations listed in the Phase 01 observability section:
 *   ingestion latency, records ingested, records accepted, records rejected,
 *   validation failures, normalization failures, entity resolution rate,
 *   unresolved entity rate, graph sync failures, data quality,
 *   source freshness, API latency, API errors.
 *
 * Uses a simple in-memory counters store suitable for local runs; in a
 * deployed environment these are expected to be wired into OpenTelemetry
 * / existing Atlas observability.
 *
 * Never logs credentials, tokens, or secrets.
 */

export interface FinanceMetricsSnapshot {
  counters: Record<string, number>;
  gauges: Record<string, number>;
  latencies: Record<string, { count: number; sumMs: number; maxMs: number; p95EstimateMs: number }>;
  errors: Record<string, number>;
  refreshedAt: string;
}

export type FinanceCounterName =
  | 'finance_ingest_runs_started'
  | 'finance_ingest_runs_completed'
  | 'finance_ingest_runs_failed'
  | 'finance_records_ingested'
  | 'finance_records_accepted_valid'
  | 'finance_records_warning'
  | 'finance_records_quarantined'
  | 'finance_records_rejected'
  | 'finance_normalization_success'
  | 'finance_normalization_failed'
  | 'finance_validation_errors'
  | 'finance_validation_invalid'
  | 'finance_entity_resolution_attempted'
  | 'finance_entity_resolution_resolved'
  | 'finance_entity_resolution_unresolved'
  | 'finance_entity_resolution_ambiguous'
  | 'finance_graph_sync_node_created'
  | 'finance_graph_sync_node_updated'
  | 'finance_graph_sync_edge_created'
  | 'finance_graph_sync_idempotent_skip'
  | 'finance_graph_sync_failed'
  | 'finance_quality_scores_calculated'
  | 'finance_lineage_events_recorded'
  | 'finance_mappings_written'
  | 'finance_fixture_blocked_cp03'
  | 'finance_events_emitted'
  | 'finance_api_calls_total'
  | 'finance_api_calls_2xx'
  | 'finance_api_calls_4xx'
  | 'finance_api_calls_5xx';

export type FinanceLatencyName =
  | 'finance_ingest_total_ms'
  | 'finance_normalize_ms'
  | 'finance_validate_ms'
  | 'finance_resolve_ms'
  | 'finance_ontology_map_ms'
  | 'finance_persist_ms'
  | 'finance_graph_sync_ms'
  | 'finance_quality_ms'
  | 'finance_profile_ms'
  | 'finance_api_route_ms';

export class FinanceObservability {
  private counters: Record<string, number> = {};
  private gauges: Record<string, number> = {};
  private latencyBuckets: Record<string, { values: number[]; count: number; sum: number; max: number }> = {};
  private errors: Record<string, number> = {};

  private sanitizeKey(k: string) {
    return k.replace(/[^a-zA-Z0-9_:]/g, '_');
  }

  count(name: FinanceCounterName | string, n = 1) {
    const k = this.sanitizeKey(name);
    this.counters[k] = (this.counters[k] ?? 0) + n;
  }

  setGauge(name: string, value: number) {
    this.gauges[this.sanitizeKey(name)] = value;
  }

  recordLatency(name: FinanceLatencyName | string, ms: number) {
    const k = this.sanitizeKey(name);
    const b = this.latencyBuckets[k] ?? { values: [], count: 0, sum: 0, max: 0 };
    b.values.push(ms);
    if (b.values.length > 10_000) b.values.shift();
    b.count++; b.sum += ms; b.max = Math.max(b.max, ms);
    this.latencyBuckets[k] = b;
  }

  recordError(kind: string, messageOrCode: string) {
    const key = `${this.sanitizeKey(kind)}:${this.sanitizeKey(messageOrCode)}`;
    this.errors[key] = (this.errors[key] ?? 0) + 1;
    this.count('finance:errors_total', 1);
  }

  /**
   * Measure a synchronous or promise-returning function's latency in ms.
   * Automatically records success vs error counts.
   */
  async measure<T>(name: FinanceLatencyName | string, fn: () => Promise<T> | T): Promise<{ value: T; error?: unknown; ms: number }> {
    const t0 = performance.now();
    try {
      const value = await fn();
      const ms = performance.now() - t0;
      this.recordLatency(name, ms);
      return { value, ms };
    } catch (e) {
      const ms = performance.now() - t0;
      this.recordLatency(name, ms);
      this.recordError(name, 'exception');
      return { value: undefined as any, error: e, ms };
    }
  }

  snapshot(): FinanceMetricsSnapshot {
    const latencies: FinanceMetricsSnapshot['latencies'] = {};
    for (const [k, b] of Object.entries(this.latencyBuckets)) {
      const sorted = b.values.slice().sort((a, c) => a - c);
      const p95Idx = Math.max(0, Math.floor(sorted.length * 0.95) - 1);
      latencies[k] = {
        count: b.count,
        sumMs: Math.round(b.sum),
        maxMs: Math.round(b.max),
        p95EstimateMs: Math.round(sorted[p95Idx] ?? 0)
      };
    }
    return {
      counters: { ...this.counters },
      gauges: { ...this.gauges },
      latencies,
      errors: { ...this.errors },
      refreshedAt: new Date().toISOString()
    };
  }

  /**
   * Structured audit log — outputs a single-line JSON event with no
   * secrets.  Caller is responsible for ensuring PII/secret scrubbing
   * via the provided sanitization callback before passing attributes.
   */
  audit(severity: 'info' | 'warn' | 'error', actor: string, action: string, attributes: Record<string, unknown> = {}) {
    const safe = JSON.stringify(attributes, (_k, v) => {
      if (typeof v === 'string' && /(secret|token|password|private_key|credential|auth)/i.test(_k)) return '[REDACTED]';
      return v;
    });
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      severity, actor, action,
      ...(safe ? JSON.parse(safe) : {})
    });
    if (severity === 'error') console.error('[FINANCE][AUDIT]', line);
    else if (severity === 'warn') console.warn('[FINANCE][AUDIT]', line);
    else console.log('[FINANCE][AUDIT]', line);
  }
}

// Singleton for the Atlas runtime.
export const financeObservability = new FinanceObservability();
