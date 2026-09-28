// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — ZHIPU (GLM) PROVIDER
// Zhipu AI GLM adapter for OpenAI-compatible API
// ============================================================================

import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ModelCapabilities, ProviderStatus,
} from '../federation/types';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';

export class ZhipuProvider implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'glm-4-plus', providerId: 'zhipu', providerCategory: 'CHINESE',
    displayName: 'Zhipu GLM-4 Plus', version: 'glm-4-plus', deploymentMode: 'CLOUD',
    dataResidency: ['CN'], allowedClassifications: ['PUBLIC', 'INTERNAL'],
  };

  capabilities: ModelCapabilities = {
    reasoning: 82, coding: 78, analysis: 80, creative: 75, multilingual: 75,
    contextWindow: 128000, maxOutputTokens: 4096, structuredOutput: true,
    toolCalling: true, vision: true, embedding: true, streaming: true,
    functionCalling: true, jsonMode: true,
    costPerMillionInput: 0.50, costPerMillionOutput: 1.50,
    avgLatencyMs: 1800, throughputTokensPerSec: 50,
  };

  async health(): Promise<ProviderHealth> {
    const creds = KeysVault.getCredentials('zhipu');
    return { status: (creds.apiKey ? 'ACTIVE' : 'DISABLED') as ProviderStatus, latencyMs: 0, availability: creds.apiKey ? 85 : 0, uptime: 99.0, lastCheck: new Date().toISOString(), consecutiveFailures: 0, errorRate: 0 };
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials('zhipu');
    if (!creds.apiKey) throw new Error('Zhipu API key not configured');

    const messages: any[] = [];
    if (request.system) messages.push({ role: 'system', content: request.system });
    for (const msg of request.messages) {
      if (msg.role === 'system' && request.system) continue;
      messages.push({ role: msg.role, content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) });
    }

    const response = await fetch(creds.apiBase || 'https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creds.apiKey}` },
      body: JSON.stringify({ model: this.identity.id, messages, temperature: request.temperature ?? 0.7, max_tokens: request.maxTokens ?? 4096 }),
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) { const e = await response.text(); ProviderHealthRegistry.recordRequest('zhipu', latencyMs, false, response.status, 0, 0); throw new Error(`Zhipu API Error: ${response.status} - ${e}`); }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const pt = data.usage?.prompt_tokens || Math.round(JSON.stringify(messages).length / 4);
    const ct = data.usage?.completion_tokens || Math.round(text.length / 4);
    const cost = this.estimateCost(pt, ct);
    ProviderHealthRegistry.recordRequest('zhipu', latencyMs, true, response.status, pt + ct, cost);

    return { id: `zhipu_${Date.now()}`, text, finishReason: 'STOP', model: this.identity.id, provider: 'zhipu', usage: { promptTokens: pt, completionTokens: ct, totalTokens: pt + ct, costUsd: cost }, latencyMs, metadata: { requestId: request.metadata.requestId, traceId: `trc_${request.metadata.requestId}`, modelId: this.identity.id, providerId: 'zhipu', cached: false, fallback: false, circuitBroken: false, governancePassed: true, timestamp: new Date().toISOString() } };
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> { const r = await this.infer(request); for (const w of r.text.split(' ')) yield { id: r.id, delta: w + ' ' }; }

  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    const pt = Math.round(JSON.stringify(request.messages).length / 4); const ct = request.maxTokens ?? 1000;
    return { estimatedPromptTokens: pt, estimatedCompletionTokens: ct, estimatedCostUsd: this.estimateCost(pt, ct), estimatedLatencyMs: this.capabilities.avgLatencyMs, recommendedProvider: 'zhipu', recommendedModel: this.identity.id, alternatives: [] };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return (promptTokens * this.capabilities.costPerMillionInput / 1000000) + (completionTokens * this.capabilities.costPerMillionOutput / 1000000);
  }
}
