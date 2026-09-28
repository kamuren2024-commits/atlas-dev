// ============================================================================
// SALIENCE ATLAS AI FEDERATION — OLLAMA PROVIDER MODULE EXPORTS
// ============================================================================

export { OllamaClient, OllamaError } from './OllamaClient';
export type { OllamaClientConfig, OllamaErrorCode } from './OllamaClient';
export { OllamaModelDiscovery } from './OllamaModelDiscovery';
export { OllamaHealthService } from './OllamaHealthService';
export type { OllamaStatusSnapshot, OllamaStatus } from './OllamaHealthService';
export { InferenceQueue } from './InferenceQueue';
export type { QueueStats } from './InferenceQueue';
export { OllamaFederationProvider } from './OllamaFederationProvider';
export type { OllamaProviderResolution } from './OllamaFederationProvider';
export { mapToInferenceResponse, mapToStreamChunk, mapToProviderHealth, mapToCapabilities } from './OllamaMapper';
export type {
  LocalModel,
  OllamaModelTag,
  OllamaHealth,
  OllamaGenerateResponse,
} from './types';
