// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — TRACING
// Distributed tracing for AI inference requests
// ============================================================================

import { AIObservability } from './AIObservability';

export const Tracing = {
  startTrace: AIObservability.startTrace,
  endTrace: AIObservability.endTrace,
  startSpan: AIObservability.startSpan,
  endSpan: AIObservability.endSpan,
  trace: AIObservability.trace,
  getTrace: AIObservability.getTrace,
  getTraces: AIObservability.getTraces,
};
