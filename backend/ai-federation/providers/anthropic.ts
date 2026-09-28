// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — ANTHROPIC PROVIDER
// Dedicated Anthropic Claude adapter with normalized federation contract
// ============================================================================

import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ModelCapabilities, ProviderStatus,
} from '../federation/types';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';
import { AIProviderAuthenticationError, AIProviderUnavailableError, AIInferenceError } from '../core/errors';
import { withTimeout } from '../resilience/TimeoutManager';
import { TIMEOUT } from '../core/constants';

export class AnthropicProvider implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'claude-opus',
    providerId: 'anthropic',
    providerCategory: 'FRONTIER',
    displayName: 'Anthropic Claude Opus',
    version: 'claude-opus',
    deploymentMode: 'CLOUD',
    dataResidency: ['US'],
    allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
  };

  capabilities: ModelCapabilities = {
    reasoning: 95,
    coding: 92,
    analysis: 93,
    creative: 88,
    multilingual: 87,
    contextWindow: 200000,
    maxOutputTokens: 16384,
    structuredOutput: true,
    toolCalling: true,
    vision: true,
    embedding: false,
    streaming: true,
    functionCalling: true,
    jsonMode: false,
    costPerMillionInput: 15.00,
    costPerMillionOutput: 75.00,
    avgLatencyMs: 3000,
    throughputTokensPerSec: 60,
  };

  async health(): Promise<ProviderHealth> {
    const creds = KeysVault.getCredentials('anthropic');
    const status = creds.apiKey ? 'ACTIVE' : 'DISABLED';
    return {
      status: status as ProviderStatus,
      latencyMs: 0,
      availability: creds.apiKey ? 95 : 0,
      uptime: 99.9,
      lastCheck: new Date().toISOString(),
      consecutiveFailures: 0,
      errorRate: 0,
    };
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials('anthropic');
    if (!creds.apiKey) {
      throw new AIProviderAuthenticationError('anthropic', { requestId: request.metadata.requestId });
    }

    const messages = this.normalizeMessages(request);

    const body: any = {
      model: this.identity.id,
      messages,
      max_tokens: request.maxTokens ?? 4096,
      temperature: request.temperature ?? 0.7,
    };

    if (request.system) {
      body.system = request.system;
    }

    if (request.tools && request.tools.length > 0) {
      body.tools = request.tools.map(t => ({
        name: t.function.name,
        description: t.function.description,
        input_schema: t.function.parameters,
      }));
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-api-key': creds.apiKey,
      'anthropic-version': '2023-06-01',
    };

    const apiBase = creds.apiBase || 'https://api.anthropic.com/v1/messages';

    try {
      const fetchPromise = fetch(apiBase, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      const response = await withTimeout(fetchPromise, TIMEOUT.INFERENCE_MS, 'anthropic', request.metadata.requestId);

      const latencyMs = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        ProviderHealthRegistry.recordRequest('anthropic', latencyMs, false, response.status, 0, 0);

        if (response.status === 401 || response.status === 403) {
          throw new AIProviderAuthenticationError('anthropic', { requestId: request.metadata.requestId });
        }
        throw new AIInferenceError(`Anthropic API Error: ${response.status}`, {
          provider: 'anthropic',
          model: this.identity.id,
          requestId: request.metadata.requestId,
        });
      }

      const data = await response.json();
      const text = data.content?.[0]?.text || '';
      const promptTokens = data.usage?.input_tokens || Math.round(JSON.stringify(messages).length / 4);
      const completionTokens = data.usage?.output_tokens || Math.round(text.length / 4);
      const cost = this.estimateCost(promptTokens, completionTokens);

      ProviderHealthRegistry.recordRequest('anthropic', latencyMs, true, response.status, promptTokens + completionTokens, cost);

      const toolCalls = data.content
        ?.filter((c: any) => c.type === 'tool_use')
        .map((c: any) => ({
          id: c.id,
          type: 'function' as const,
          function: { name: c.name, arguments: JSON.stringify(c.input) },
        }));

      return {
        id: `ant_${Date.now()}`,
        text,
        finishReason: this.mapStopReason(data.stop_reason),
        model: this.identity.id,
        provider: 'anthropic',
        usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, costUsd: cost },
        latencyMs,
        toolCalls: toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
        metadata: {
          requestId: request.metadata.requestId,
          traceId: `trc_${request.metadata.requestId}`,
          modelId: this.identity.id,
          providerId: 'anthropic',
          cached: false,
          fallback: false,
          circuitBroken: false,
          governancePassed: true,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      ProviderHealthRegistry.recordRequest('anthropic', latencyMs, false, 500, 0, 0);

      if (err instanceof AIProviderAuthenticationError || err instanceof AIProviderUnavailableError) {
        throw err;
      }

      throw new AIInferenceError(err.message || 'Anthropic inference failed', {
        provider: 'anthropic',
        model: this.identity.id,
        requestId: request.metadata.requestId,
        cause: err,
      });
    }
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> {
    const response = await this.infer(request);
    const words = response.text.split(' ');
    for (const word of words) {
      yield { id: response.id, delta: word + ' ' };
    }
  }

  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    const pt = Math.round(JSON.stringify(request.messages).length / 4);
    const ct = request.maxTokens ?? 1000;
    return {
      estimatedPromptTokens: pt,
      estimatedCompletionTokens: ct,
      estimatedCostUsd: this.estimateCost(pt, ct),
      estimatedLatencyMs: this.capabilities.avgLatencyMs,
      recommendedProvider: 'anthropic',
      recommendedModel: this.identity.id,
      alternatives: [],
    };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return (promptTokens * this.capabilities.costPerMillionInput / 1000000) +
           (completionTokens * this.capabilities.costPerMillionOutput / 1000000);
  }

  private normalizeMessages(request: InferenceRequest): any[] {
    const messages: any[] = [];
    for (const msg of request.messages) {
      if (msg.role === 'system') continue; // System is handled separately for Anthropic
      const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
      messages.push({ role: msg.role === 'tool' ? 'user' : msg.role, content });
    }
    if (messages.length === 0 || messages[0].role !== 'user') {
      messages.unshift({ role: 'user', content: request.system || 'Hello' });
    }
    return messages;
  }

  private mapStopReason(reason?: string): InferenceResponse['finishReason'] {
    switch (reason) {
      case 'end_turn': return 'STOP';
      case 'max_tokens': return 'MAX_TOKENS';
      case 'tool_use': return 'TOOL_CALL';
      case 'stop_sequence': return 'STOP';
      default: return 'STOP';
    }
  }
}
