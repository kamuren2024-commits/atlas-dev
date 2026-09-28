// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — OLLAMA PROVIDER (HARDENED)
// NO fabricated responses. NO simulated fallbacks. Real health validation.
// ============================================================================

import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ModelCapabilities, ProviderStatus,
} from '../federation/types';
import { ProviderHealthRegistry } from '../health/health-registry';
import {
  AIProviderUnavailableError,
  AIProviderAuthenticationError,
  AIModelNotFoundError,
  AIInferenceError,
} from '../core/errors';
import { withTimeout, createTimeoutController } from '../resilience/TimeoutManager';
import { TIMEOUT } from '../core/constants';
import { KeysVault } from '../security/keys-vault';

export class OllamaProviderV2 implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'llama3',
    providerId: 'ollama',
    providerCategory: 'LOCAL',
    displayName: 'Ollama Local Inference',
    version: 'llama3',
    deploymentMode: 'LOCAL',
    dataResidency: ['LOCAL'],
    allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED', 'TOP_SECRET', 'KETRACO_CRITICAL'],
  };

  capabilities: ModelCapabilities = {
    reasoning: 70,
    coding: 65,
    analysis: 68,
    creative: 60,
    multilingual: 55,
    contextWindow: 8192,
    maxOutputTokens: 4096,
    structuredOutput: false,
    toolCalling: false,
    vision: false,
    embedding: true,
    streaming: true,
    functionCalling: false,
    jsonMode: false,
    costPerMillionInput: 0,
    costPerMillionOutput: 0,
    avgLatencyMs: 500,
    throughputTokensPerSec: 30,
  };

  private get baseUrl(): string {
    const creds = KeysVault.getCredentials('ollama');
    return creds.apiBase || process.env.OLLAMA_HOST || 'http://localhost:11434';
  }

  private get model(): string {
    return process.env.OLLAMA_MODEL || 'llama3';
  }

  async health(): Promise<ProviderHealth> {
    const startTime = Date.now();
    try {
      const controller = createTimeoutController(TIMEOUT.HEALTH_CHECK_MS);
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: controller.signal,
      });

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        ProviderHealthRegistry.recordRequest('ollama', latencyMs, false, response.status, 0, 0);
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

      const data = await response.json();
      const modelAvailable = data.models?.some((m: any) => m.name?.includes(this.model));

      ProviderHealthRegistry.recordRequest('ollama', latencyMs, true, 200, 0, 0);

      return {
        status: modelAvailable ? 'ACTIVE' : 'DEGRADED',
        latencyMs,
        availability: modelAvailable ? 100 : 50,
        uptime: 100,
        lastCheck: new Date().toISOString(),
        consecutiveFailures: 0,
        errorRate: 0,
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      ProviderHealthRegistry.recordRequest('ollama', latencyMs, false, 503, 0, 0);
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
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();

    // First: verify Ollama is reachable
    const health = await this.health();
    if (health.status === 'UNAVAILABLE') {
      throw new AIProviderUnavailableError('ollama', { requestId: request.metadata.requestId });
    }

    const prompt = request.messages
      .map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content))
      .join('\n');

    const body: any = {
      model: this.model,
      prompt,
      stream: false,
      options: {
        temperature: request.temperature ?? 0.3,
        num_predict: request.maxTokens ?? 2048,
      },
    };

    if (request.system) {
      body.system = request.system;
    }

    try {
      const controller = createTimeoutController(TIMEOUT.INFERENCE_MS);
      const fetchPromise = fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const response = await withTimeout(fetchPromise, TIMEOUT.INFERENCE_MS, 'ollama', request.metadata.requestId);

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        ProviderHealthRegistry.recordRequest('ollama', latencyMs, false, response.status, 0, 0);

        if (response.status === 404) {
          throw new AIModelNotFoundError(body.model, 'ollama', { requestId: request.metadata.requestId });
        }

        throw new AIInferenceError(`Ollama API Error: ${response.status} - ${errorText}`, {
          provider: 'ollama',
          model: body.model,
          requestId: request.metadata.requestId,
        });
      }

      const data = await response.json();
      const text = data.response || '';
      const promptTokens = Math.round(prompt.length / 4) + 10;
      const completionTokens = Math.round(text.length / 4) || 10;
      const cost = 0; // Local model = $0

      ProviderHealthRegistry.recordRequest('ollama', latencyMs, true, 200, promptTokens + completionTokens, cost);

      return {
        id: `oll_${Date.now()}`,
        text,
        finishReason: data.done ? 'STOP' : 'MAX_TOKENS',
        model: body.model,
        provider: 'ollama',
        usage: {
          promptTokens,
          completionTokens,
          totalTokens: promptTokens + completionTokens,
          costUsd: cost,
        },
        latencyMs,
        metadata: {
          requestId: request.metadata.requestId,
          traceId: `trc_${request.metadata.requestId}`,
          modelId: body.model,
          providerId: 'ollama',
          cached: false,
          fallback: false,
          circuitBroken: false,
          governancePassed: true,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      ProviderHealthRegistry.recordRequest('ollama', latencyMs, false, 500, 0, 0);

      if (err instanceof AIProviderUnavailableError || err instanceof AIModelNotFoundError) {
        throw err;
      }

      throw new AIInferenceError(err.message || 'Ollama inference failed', {
        provider: 'ollama',
        model: this.model,
        requestId: request.metadata.requestId,
        cause: err,
      });
    }
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> {
    const prompt = request.messages
      .map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content))
      .join('\n');

    const body: any = {
      model: this.model,
      prompt,
      stream: true,
      options: {
        temperature: request.temperature ?? 0.3,
        num_predict: request.maxTokens ?? 2048,
      },
    };

    if (request.system) {
      body.system = request.system;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new AIProviderUnavailableError('ollama', { requestId: request.metadata.requestId });
      }

      const reader = response.body?.getReader();
      if (!reader) throw new AIProviderUnavailableError('ollama', { requestId: request.metadata.requestId });

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const chunk = JSON.parse(line);
            if (chunk.response) {
              yield {
                id: `oll_${Date.now()}`,
                delta: chunk.response,
                finishReason: chunk.done ? 'STOP' : undefined,
              };
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      if (err instanceof AIProviderUnavailableError) throw err;
      throw new AIInferenceError('Ollama streaming failed', {
        provider: 'ollama',
        model: this.model,
        requestId: request.metadata.requestId,
        cause: err,
      });
    }
  }

  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    const pt = Math.round(JSON.stringify(request.messages).length / 4);
    const ct = request.maxTokens ?? 1000;
    return {
      estimatedPromptTokens: pt,
      estimatedCompletionTokens: ct,
      estimatedCostUsd: 0,
      estimatedLatencyMs: this.capabilities.avgLatencyMs,
      recommendedProvider: 'ollama',
      recommendedModel: this.model,
      alternatives: [],
    };
  }

  estimateCost(): number {
    return 0; // Local model = $0
  }
}
