// ============================================================================
// SALIENCE ATLAS AI FEDERATION — OLLAMA PROVIDER TYPES
// Type contracts for the local Ollama runtime integration.
// No hardcoded model names — all models are dynamically discovered.
// ============================================================================

/** A single installed Ollama model as returned by GET /api/tags */
export interface OllamaModelTag {
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    parent_model?: string;
    format?: string;
    family?: string;
    families?: string[];
    parameter_size?: string;
    quantization_level?: string;
    context_length?: number;
    embedding_length?: number;
  };
  capabilities?: string[];
}

/** Normalized local model descriptor registered in the Atlas Model Registry */
export interface LocalModel {
  id: string;
  name: string;
  provider: 'ollama';
  size?: number;
  modifiedAt?: Date;
  digest?: string;
  parameterSize?: string;
  quantizationLevel?: string;
  family?: string;
  contextLength?: number;
  deployment: 'LOCAL';
  status: 'AVAILABLE' | 'UNKNOWN';
  capabilities: string[];
}

/** Health check result for the Ollama runtime */
export interface OllamaHealth {
  reachable: boolean;
  modelCount: number;
  modelNames: string[];
  latencyMs: number;
  checkedAt: string;
  error?: string;
}

/** Ollama inference response (non-streaming), matching /api/generate or /api/chat */
export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  done_reason?: string;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
  message?: {
    role: string;
    content: string;
  };
}

export interface OllamaChatRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant' | 'tool';
    content: string;
  }>;
  temperature?: number;
  num_predict?: number;
  stream?: boolean;
  options?: Record<string, unknown>;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  num_predict?: number;
  stream?: boolean;
  options?: Record<string, unknown>;
}
