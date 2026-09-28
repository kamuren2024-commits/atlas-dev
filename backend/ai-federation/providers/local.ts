// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — LOCAL INFRASTRUCTURE PROVIDERS
// vLLM, SGLang, and llama.cpp adapters for local enterprise inference
// ============================================================================

import { OpenAICompatibleProvider, OpenAICompatibleConfig } from './openai-compatible';
import { ModelCapabilities, DataClassification } from '../federation/types';

// ---------------------------------------------------------------------------
// vLLM — Local enterprise GPU inference server
// ---------------------------------------------------------------------------

export class VLLMProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      providerId: 'vllm',
      displayName: 'vLLM (Local GPU)',
      apiBase: process.env.VLLM_HOST || 'http://localhost:8000/v1/chat/completions',
      defaultModel: process.env.VLLM_MODEL || 'qwen-72b',
      apiKeyEnv: 'VLLM_API_KEY',
      category: 'LOCAL',
      deploymentMode: 'LOCAL',
      allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'KETRACO_CRITICAL'],
      capabilities: {
        reasoning: 70, coding: 72, analysis: 70, creative: 65, multilingual: 80,
        contextWindow: 32000, maxOutputTokens: 8192, structuredOutput: true,
        toolCalling: true, vision: false, embedding: false, streaming: true,
        functionCalling: true, jsonMode: true,
        costPerMillionInput: 0, costPerMillionOutput: 0,
        avgLatencyMs: 800, throughputTokensPerSec: 200,
      },
    });

    this.capabilities.embedding = true;
  }
}

// ---------------------------------------------------------------------------
// SGLang — Local enterprise inference server
// ---------------------------------------------------------------------------

export class SGLangProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      providerId: 'sglang',
      displayName: 'SGLang (Local GPU)',
      apiBase: process.env.SGLANG_HOST || 'http://localhost:30000/v1/chat/completions',
      defaultModel: process.env.SGLANG_MODEL || 'deepseek-v3',
      apiKeyEnv: 'SGLANG_API_KEY',
      category: 'LOCAL',
      deploymentMode: 'LOCAL',
      allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'KETRACO_CRITICAL'],
      capabilities: {
        reasoning: 72, coding: 74, analysis: 71, creative: 65, multilingual: 78,
        contextWindow: 64000, maxOutputTokens: 8192, structuredOutput: true,
        toolCalling: true, vision: false, embedding: false, streaming: true,
        functionCalling: true, jsonMode: true,
        costPerMillionInput: 0, costPerMillionOutput: 0,
        avgLatencyMs: 900, throughputTokensPerSec: 180,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// llama.cpp — Local CPU/GPU inference
// ---------------------------------------------------------------------------

export class LlamaCppProvider extends OpenAICompatibleProvider {
  constructor() {
    super({
      providerId: 'llamacpp',
      displayName: 'llama.cpp (Local)',
      apiBase: process.env.LLAMACPP_HOST || 'http://localhost:8080/v1/chat/completions',
      defaultModel: process.env.LLAMACPP_MODEL || 'llama-3-8b',
      apiKeyEnv: 'LLAMACPP_API_KEY',
      category: 'LOCAL',
      deploymentMode: 'LOCAL',
      allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'KETRACO_CRITICAL'],
      capabilities: {
        reasoning: 55, coding: 58, analysis: 55, creative: 50, multilingual: 60,
        contextWindow: 8192, maxOutputTokens: 4096, structuredOutput: true,
        toolCalling: true, vision: false, embedding: false, streaming: true,
        functionCalling: true, jsonMode: true,
        costPerMillionInput: 0, costPerMillionOutput: 0,
        avgLatencyMs: 500, throughputTokensPerSec: 30,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Embedding Provider (local, for semantic search)
// ---------------------------------------------------------------------------

import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ProviderStatus,
} from '../federation/types';

export class LocalEmbeddingProvider implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'bge-large-en',
    providerId: 'embeddings',
    providerCategory: 'LOCAL',
    displayName: 'Local Embedding (BGE)',
    version: 'bge-large-en',
    deploymentMode: 'LOCAL',
    dataResidency: ['LOCAL'],
    allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'KETRACO_CRITICAL'],
  };

  capabilities: ModelCapabilities = {
    reasoning: 0, coding: 0, analysis: 0, creative: 0, multilingual: 60,
    contextWindow: 512, maxOutputTokens: 0, structuredOutput: false,
    toolCalling: false, vision: false, embedding: true, streaming: false,
    functionCalling: false, jsonMode: false,
    costPerMillionInput: 0, costPerMillionOutput: 0,
    avgLatencyMs: 50, throughputTokensPerSec: 500,
  };

  async health(): Promise<ProviderHealth> {
    return { status: 'ACTIVE' as ProviderStatus, latencyMs: 5, availability: 99, uptime: 99.9, lastCheck: new Date().toISOString(), consecutiveFailures: 0, errorRate: 0 };
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    // HuggingFace inference endpoint for embeddings
    const text = request.messages.map(m => typeof m.content === 'string' ? m.content : '').join(' ');
    const response = await fetch(process.env.HF_ENDPOINT || 'http://localhost:8001/embed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text }),
    });

    if (!response.ok) throw new Error(`Embedding API Error: ${response.status}`);
    const data = await response.json();
    const embedding = data.embedding || data[0];

    return this.buildEmbeddingResponse(request, embedding);
  }

  private buildEmbeddingResponse(request: InferenceRequest, embedding: number[]): InferenceResponse {
    return {
      id: `emb_${Date.now()}`,
      text: JSON.stringify({ embedding }),
      finishReason: 'STOP',
      model: this.identity.id,
      provider: 'embeddings',
      usage: { promptTokens: 0, completionTokens: embedding.length, totalTokens: embedding.length, costUsd: 0 },
      latencyMs: 50,
      metadata: {
        requestId: request.metadata.requestId, traceId: `trc_${request.metadata.requestId}`,
        modelId: this.identity.id, providerId: 'embeddings', cached: false, fallback: false,
        circuitBroken: false, governancePassed: true, timestamp: new Date().toISOString(),
      },
    };
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> {
    const r = await this.infer(request);
    yield { id: r.id, delta: r.text };
  }

  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    return {
      estimatedPromptTokens: 0, estimatedCompletionTokens: 1024, estimatedCostUsd: 0,
      estimatedLatencyMs: 50, recommendedProvider: 'embeddings', recommendedModel: this.identity.id, alternatives: [],
    };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return 0;
  }
}
