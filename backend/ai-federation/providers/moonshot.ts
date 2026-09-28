// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — MOONSHOT (KIMI) PROVIDER
// OpenAI-compatible adapter for Moonshot Kimi
// ============================================================================

import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ModelCapabilities, ProviderStatus,
} from '../federation/types';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';

export class MoonshotProvider implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'moonshot-v1-128k', providerId: 'moonshot', providerCategory: 'CHINESE',
    displayName: 'Moonshot Kimi', version: 'moonshot-v1-128k', deploymentMode: 'CLOUD',
    dataResidency: ['CN'], allowedClassifications: ['PUBLIC', 'INTERNAL'],
  };

  capabilities: ModelCapabilities = {
    reasoning: 80, coding: 75, analysis: 82, creative: 70, multilingual: 70,
    contextWindow: 128000, maxOutputTokens: 4096, structuredOutput: true,
    toolCalling: true, vision: false, embedding: false, streaming: true,
    functionCalling: true, jsonMode: true,
    costPerMillionInput: 0.60, costPerMillionOutput: 2.50,
    avgLatencyMs: 2000, throughputTokensPerSec: 45,
  };

  async health(): Promise<ProviderHealth> {
    const creds = KeysVault.getCredentials('moonshot');
    return { status: (creds.apiKey ? 'ACTIVE' : 'DISABLED') as ProviderStatus, latencyMs: 0, availability: creds.apiKey ? 82 : 0, uptime: 98.5, lastCheck: new Date().toISOString(), consecutiveFailures: 0, errorRate: 0 };
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials('moonshot');
    if (!creds.apiKey) throw new Error('Moonshot API key not configured');

    const messages: any[] = [];
    if (request.system) messages.push({ role: 'system', content: request.system });
    for (const msg of request.messages) {
      if (msg.role === 'system' && request.system) continue;
      messages.push({ role: msg.role, content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) });
    }

    const response = await fetch(creds.apiBase || 'https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creds.apiKey}` },
      body: JSON.stringify({ model: this.identity.id, messages, temperature: request.temperature ?? 0.7, max_tokens: request.maxTokens ?? 4096 }),
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) { const e = await response.text(); ProviderHealthRegistry.recordRequest('moonshot', latencyMs, false, response.status, 0, 0); throw new Error(`Moonshot API Error: ${response.status} - ${e}`); }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const pt = data.usage?.prompt_tokens || Math.round(JSON.stringify(messages).length / 4);
    const ct = data.usage?.completion_tokens || Math.round(text.length / 4);
    const cost = this.estimateCost(pt, ct);
    ProviderHealthRegistry.recordRequest('moonshot', latencyMs, true, response.status, pt + ct, cost);

    return { id: `moonshot_${Date.now()}`, text, finishReason: 'STOP', model: this.identity.id, provider: 'moonshot', usage: { promptTokens: pt, completionTokens: ct, totalTokens: pt + ct, costUsd: cost }, latencyMs, metadata: { requestId: request.metadata.requestId, traceId: `trc_${request.metadata.requestId}`, modelId: this.identity.id, providerId: 'moonshot', cached: false, fallback: false, circuitBroken: false, governancePassed: true, timestamp: new Date().toISOString() } };
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> { const r = await this.infer(request); for (const w of r.text.split(' ')) yield { id: r.id, delta: w + ' ' }; }

  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    const pt = Math.round(JSON.stringify(request.messages).length / 4); const ct = request.maxTokens ?? 1000;
    return { estimatedPromptTokens: pt, estimatedCompletionTokens: ct, estimatedCostUsd: this.estimateCost(pt, ct), estimatedLatencyMs: this.capabilities.avgLatencyMs, recommendedProvider: 'moonshot', recommendedModel: this.identity.id, alternatives: [] };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return (promptTokens * this.capabilities.costPerMillionInput / 1000000) + (completionTokens * this.capabilities.costPerMillionOutput / 1000000);
  }
}
