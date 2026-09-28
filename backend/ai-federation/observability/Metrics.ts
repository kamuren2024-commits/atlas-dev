// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — METRICS
// Enterprise AI metrics collection
// ============================================================================

import { AIObservability } from './AIObservability';

export const Metrics = {
  record: AIObservability.metric,
  getSeries: AIObservability.getMetricSeries,
};

// Standard metric names
export const METRIC_NAMES = {
  REQUEST_TOTAL: 'ai.requests.total',
  REQUEST_SUCCESS: 'ai.requests.success',
  REQUEST_ERROR: 'ai.requests.error',
  REQUEST_LATENCY_MS: 'ai.requests.latency_ms',
  TOKENS_INPUT: 'ai.tokens.input',
  TOKENS_OUTPUT: 'ai.tokens.output',
  COST_USD: 'ai.cost.usd',
  PROVIDER_FAILOVER: 'ai.provider.failover',
  PROVIDER_CIRCUIT_BREAKER: 'ai.provider.circuit_breaker',
  MODEL_QUALITY: 'ai.model.quality',
  CACHE_HIT: 'ai.cache.hit',
  CACHE_MISS: 'ai.cache.miss',
} as const;
