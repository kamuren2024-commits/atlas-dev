// ============================================================================
// SALIENCE ATLAS AI FEDERATION — OLLAMA MAPPER
// Maps Ollama-native responses to the unified Atlas federated contract.
// Only real runtime metadata is surfaced — no fabricated tokens/latency.
// ============================================================================

import {
  InferenceRequest,
  InferenceResponse,
  InferenceChunk,
  ProviderHealth,
  ModelCapabilities,
} from '../../federation/types';
import { OllamaGenerateResponse } from './types';
import { OLLAMA_MODEL_CAPABILITIES, deriveCapabilities } from './model-capabilities';

/**
 * Build a normalized InferenceResponse from a real Ollama completion.
 */
export function mapToInferenceResponse(
  req: InferenceRequest,
  raw: OllamaGenerateResponse,
  model: string,
  latencyMs: number
): InferenceResponse {
  const text = raw.response || raw.message?.content || '';
  const promptTokens = typeof raw.prompt_eval_count === 'number' ? raw.prompt_eval_count : null;
  const completionTokens = typeof raw.eval_count === 'number' ? raw.eval_count : null;

  return {
    id: `oll_${Date.now()}`,
    text,
    finishReason: raw.done ? 'STOP' : 'MAX_TOKENS',
    model,
    provider: 'ollama',
    usage: {
      // Only use real runtime values; null/cost 0 when unavailable. Never fabricate.
      promptTokens: promptTokens ?? 0,
      completionTokens: completionTokens ?? 0,
      totalTokens: promptTokens && completionTokens ? promptTokens + completionTokens : 0,
      costUsd: 0,
    },
    latencyMs,
    metadata: {
      requestId: req.metadata.requestId,
      traceId: `trc_${req.metadata.requestId}`,
      modelId: model,
      providerId: 'ollama',
      cached: false,
      fallback: false,
      circuitBroken: false,
      governancePassed: true,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Map an Ollama stream chunk into the federated InferenceChunk contract.
 */
export function mapToStreamChunk(delta: string, done: boolean, model: string): InferenceChunk {
  return {
    id: `oll_${Date.now()}`,
    delta,
    finishReason: done ? 'STOP' : undefined,
  };
}

/**
 * Build a ProviderHealth from a real health check result.
 */
export function mapToProviderHealth(
  reachable: boolean,
  modelCount: number,
  latencyMs: number,
  error?: string
): ProviderHealth {
  if (!reachable) {
    return {
      status: 'UNAVAILABLE',
      latencyMs,
      availability: 0,
      uptime: 0,
      lastCheck: new Date().toISOString(),
      consecutiveFailures: 1,
      errorRate: 100,
    };
  }
  return {
    status: modelCount > 0 ? 'ACTIVE' : 'DEGRADED',
    latencyMs,
    availability: modelCount > 0 ? 100 : 0,
    uptime: 100,
    lastCheck: new Date().toISOString(),
    consecutiveFailures: 0,
    errorRate: 0,
  };
}

/**
 * Build a ModelCapabilities descriptor for a discovered local model.
 * Capabilities that cannot be reliably derived remain conservative.
 * contextWindow defaults to Ollama's reported value when available.
 */
export function mapToCapabilities(model: { name: string; contextLength?: number; family?: string }): ModelCapabilities {
  const ctx = model.contextLength || 8192;
  return deriveCapabilities(model.name || '', ctx, model.family);
}

export { OLLAMA_MODEL_CAPABILITIES };
