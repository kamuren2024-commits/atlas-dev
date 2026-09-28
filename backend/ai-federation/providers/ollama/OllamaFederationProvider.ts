// ============================================================================
// SALIENCE ATLAS AI FEDERATION — OLLAMA FEDERATION PROVIDER (V3)
// A FederatedModelProvider backed by the REAL local Ollama runtime with
// dynamic model discovery. Models are resolved at request time from
// /api/tags — never hardcoded. Falls back to an explicit resolution policy.
// ============================================================================

import {
  FederatedModelProvider,
} from '../FederatedModelProvider';
import {
  InferenceRequest,
  InferenceResponse,
  InferenceChunk,
  InferenceEstimate,
  ProviderHealth,
  ModelIdentity,
  ModelCapabilities,
} from '../../federation/types';
import { OllamaClient, OllamaError } from './OllamaClient';
import { OllamaModelDiscovery } from './OllamaModelDiscovery';
import { OllamaHealthService } from './OllamaHealthService';
import { InferenceQueue } from './InferenceQueue';
import { OllamaModelTag } from './types';
import { mapToProviderHealth, mapToCapabilities } from './OllamaMapper';
import { LocalModel } from './types';

export interface OllamaProviderResolution {
  requestedModel?: string;
  requestedProvider?: string;
  capability?: string;
  mission?: string;
}

export class OllamaFederationProvider implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'ollama-local',
    providerId: 'ollama',
    providerCategory: 'LOCAL',
    displayName: 'Ollama Local Inference',
    version: 'dynamic',
    deploymentMode: 'LOCAL',
    dataResidency: ['LOCAL'],
    allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'KETRACO_CRITICAL'],
  };

  capabilities: ModelCapabilities = mapToCapabilities({ name: 'ollama-local', contextLength: 8192, family: 'qwen' });

  private client: OllamaClient;
  private discovery: OllamaModelDiscovery;
  private healthService: OllamaHealthService;
  private queue: InferenceQueue;

  constructor(customClient?: OllamaClient) {
    this.client = customClient ?? new OllamaClient();
    this.discovery = new OllamaModelDiscovery(this.client);
    this.healthService = new OllamaHealthService(this.client);
    this.queue = new InferenceQueue();
  }

  /** Access to the underlying client (for model registry sync). */
  getClient(): OllamaClient {
    return this.client;
  }

  /** Access to discovery (for registry sync). */
  getDiscovery(): OllamaModelDiscovery {
    return this.discovery;
  }

  /** Access to health service (for status reporting). */
  getHealthService(): OllamaHealthService {
    return this.healthService;
  }

  /** Queue stats for observability. */
  getQueueStats() {
    return this.queue.getStats();
  }

  /** Force an immediate health check. */
  async refreshHealth(): Promise<ProviderHealth> {
    const snapshot = await this.healthService.check();
    return mapToProviderHealth(snapshot.reachable, snapshot.modelCount, snapshot.latencyMs, snapshot.error);
  }

  /** Discover all installed models as LocalModel descriptors. */
  async listModels(): Promise<LocalModel[]> {
    return this.discovery.discover();
  }

  /** Resolve the model to use for a given request following the routing policy. */
  async resolveModel(opts?: OllamaProviderResolution): Promise<OllamaModelTag> {
    const resolved = await this.discovery.resolveDefaultModel(
      opts?.requestedModel || process.env.OLLAMA_DEFAULT_MODEL
    );
    if (!resolved) {
      throw new OllamaError('MODEL_NOT_FOUND', 'No Ollama models available for inference', { retryable: false });
    }
    const tag = await this.client.getModel(resolved.id);
    return tag || { name: resolved.id, model: resolved.id, modified_at: '', size: 0, digest: '' };
  }

  /**
   * FederatedModelProvider: health().
   */
  async health(): Promise<ProviderHealth> {
    const snapshot = this.healthService.getSnapshot();
    if (!snapshot.lastCheckedAt) {
      // No cached snapshot yet — run a real check.
      const live = await this.healthService.check();
      return mapToProviderHealth(live.reachable, live.modelCount, live.latencyMs, live.error);
    }
    return mapToProviderHealth(snapshot.reachable, snapshot.modelCount, snapshot.latencyMs, snapshot.error);
  }

  /**
   * FederatedModelProvider: infer().
   * Executes a real inference request against the local Ollama runtime,
   * gated through the local inference queue.
   */
  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    return this.queue.run(async () => {
      const start = Date.now();
      const modelTag = await this.resolveModel({});

      // Chat-style if there is a message list with roles; else generate.
      const messages = request.messages.map(m => ({
        role: (m.role || 'user') as 'system' | 'user' | 'assistant' | 'tool',
        content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
      }));

      const useChat = request.messages.length > 1 || messages.some(m => m.role !== 'user');
      let raw;
      if (useChat) {
        const chatRes = await this.client.chat({
          model: modelTag.name,
          messages: messages.length > 0 ? messages : [{ role: 'user', content: messages[0]?.content || '' }],
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 2048,
          options: {},
        });
        raw = chatRes;
      } else {
        const genRes = await this.client.generate({
          model: modelTag.name,
          prompt: messages[0]?.content || '',
          system: request.system,
          temperature: request.temperature ?? 0.7,
          num_predict: request.maxTokens ?? 2048,
          options: {},
        });
        raw = genRes;
      }

      const { mapToInferenceResponse } = await import('./OllamaMapper');
      return mapToInferenceResponse(request, raw, modelTag.name, Date.now() - start);
    });
  }

  /**
   * FederatedModelProvider: stream(). Streams real Qwen tokens from Ollama.
   */
  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> {
    const modelTag = await this.resolveModel({});
    const messages = request.messages.map(m => ({
      role: (m.role || 'user') as 'system' | 'user' | 'assistant' | 'tool',
      content: typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
    }));

    const useChat = request.messages.length > 1 || messages.some(m => m.role !== 'user');
    if (useChat) {
      for await (const delta of this.client.streamChat({
        model: modelTag.name,
        messages,
        temperature: request.temperature ?? 0.7,
        num_predict: request.maxTokens ?? 2048,
        options: {},
      })) {
        yield { id: `oll_${Date.now()}`, delta, finishReason: undefined };
      }
    } else {
      for await (const delta of this.client.streamGenerate({
        model: modelTag.name,
        prompt: messages[0]?.content || '',
        system: request.system,
        temperature: request.temperature ?? 0.7,
        num_predict: request.maxTokens ?? 2048,
        options: {},
      })) {
        yield { id: `oll_${Date.now()}`, delta, finishReason: undefined };
      }
    }
  }

  /**
   * FederatedModelProvider: estimate().
   */
  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    const modelTag = await this.resolveModel({});
    const pt = Math.round(JSON.stringify(request.messages).length / 4);
    const ct = request.maxTokens ?? 1000;
    return {
      estimatedPromptTokens: pt,
      estimatedCompletionTokens: ct,
      estimatedCostUsd: 0,
      estimatedLatencyMs: this.capabilities.avgLatencyMs,
      recommendedProvider: 'ollama',
      recommendedModel: modelTag.name,
      alternatives: [],
    };
  }

  estimateCost(): number {
    return 0;
  }
}
