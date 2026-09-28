// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — QWEN PROVIDER
// Alibaba Qwen adapter for OpenAI-compatible API
// ============================================================================

import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ModelCapabilities, ProviderStatus,
} from '../federation/types';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';

export class QwenProvider implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'qwen-max',
    providerId: 'qwen',
    providerCategory: 'CHINESE',
    displayName: 'Alibaba Qwen Max',
    version: 'qwen-max',
    deploymentMode: 'CLOUD',
    dataResidency: ['CN'],
    allowedClassifications: ['PUBLIC', 'INTERNAL'],
  };

  capabilities: ModelCapabilities = {
    reasoning: 85,
    coding: 82,
    analysis: 80,
    creative: 78,
    multilingual: 90,
    contextWindow: 128000,
    maxOutputTokens: 8192,
    structuredOutput: true,
    toolCalling: true,
    vision: true,
    embedding: true,
    streaming: true,
    functionCalling: true,
    jsonMode: true,
    costPerMillionInput: 0.40,
    costPerMillionOutput: 1.20,
    avgLatencyMs: 1500,
    throughputTokensPerSec: 60,
  };

  async health(): Promise<ProviderHealth> {
    const creds = KeysVault.getCredentials('qwen');
    return {
      status: (creds.apiKey ? 'ACTIVE' : 'DISABLED') as ProviderStatus,
      latencyMs: 0, availability: creds.apiKey ? 90 : 0, uptime: 99.5,
      lastCheck: new Date().toISOString(), consecutiveFailures: 0, errorRate: 0,
    };
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials('qwen');
    if (!creds.apiKey) throw new Error('Qwen API key not configured');

    const messages: any[] = [];
    if (request.system) messages.push({ role: 'system', content: request.system });
    for (const msg of request.messages) {
      if (msg.role === 'system' && request.system) continue;
      messages.push({ role: msg.role, content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) });
    }

    const body: any = {
      model: this.identity.id, messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
    };

    const response = await fetch(creds.apiBase || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creds.apiKey}` },
      body: JSON.stringify(body),
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      const errorText = await response.text();
      ProviderHealthRegistry.recordRequest('qwen', latencyMs, false, response.status, 0, 0);
      throw new Error(`Qwen API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const promptTokens = data.usage?.prompt_tokens || Math.round(JSON.stringify(messages).length / 4);
    const completionTokens = data.usage?.completion_tokens || Math.round(text.length / 4);
    const cost = this.estimateCost(promptTokens, completionTokens);
    ProviderHealthRegistry.recordRequest('qwen', latencyMs, true, response.status, promptTokens + completionTokens, cost);

    return {
      id: `qwen_${Date.now()}`, text, finishReason: 'STOP',
      model: this.identity.id, provider: 'qwen',
      usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, costUsd: cost },
      latencyMs,
      metadata: {
        requestId: request.metadata.requestId, traceId: `trc_${request.metadata.requestId}`,
        modelId: this.identity.id, providerId: 'qwen', cached: false, fallback: false,
        circuitBroken: false, governancePassed: true, timestamp: new Date().toISOString(),
      },
    };
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> {
    const response = await this.infer(request);
    for (const word of response.text.split(' ')) {
      yield { id: response.id, delta: word + ' ' };
    }
  }

  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    const pt = Math.round(JSON.stringify(request.messages).length / 4);
    const ct = request.maxTokens ?? 1000;
    return {
      estimatedPromptTokens: pt, estimatedCompletionTokens: ct,
      estimatedCostUsd: this.estimateCost(pt, ct), estimatedLatencyMs: this.capabilities.avgLatencyMs,
      recommendedProvider: 'qwen', recommendedModel: this.identity.id, alternatives: [],
    };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return (promptTokens * this.capabilities.costPerMillionInput / 1000000) +
           (completionTokens * this.capabilities.costPerMillionOutput / 1000000);
  }
}
