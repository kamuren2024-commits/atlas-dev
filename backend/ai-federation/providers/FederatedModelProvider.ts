// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — FEDERATED MODEL PROVIDER
// Unified interface that all provider adapters must implement
// ============================================================================

import {
  InferenceRequest,
  InferenceResponse,
  InferenceChunk,
  InferenceEstimate,
  ProviderHealth,
  ModelIdentity,
  ModelCapabilities,
} from '../federation/types';

export interface FederatedModelProvider {
  identity: ModelIdentity;
  capabilities: ModelCapabilities;

  /**
   * Check provider health status
   */
  health(): Promise<ProviderHealth>;

  /**
   * Execute a single inference request
   */
  infer(request: InferenceRequest): Promise<InferenceResponse>;

  /**
   * Stream inference response
   */
  stream(request: InferenceRequest): AsyncIterable<InferenceChunk>;

  /**
   * Estimate cost and latency for a request
   */
  estimate(request: InferenceRequest): Promise<InferenceEstimate>;
}
