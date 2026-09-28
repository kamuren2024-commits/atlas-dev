// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — MINIMAX PROVIDER
// OpenAI-compatible adapter for MiniMax
// ============================================================================

import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ModelCapabilities, ProviderStatus,
} from '../federation/types';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';

export class MiniMaxProvider implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'MiniMax-Text-01', providerId: 'minimax', providerCategory: 'CHINESE',
    displayName: 'MiniMax Text-01', version: 'MiniMax-Text-01', deploymentMode: 'CLOUD',
    dataResidency: ['CN'], allowedClassifications: ['PUBLIC', 'INTERNAL'],
  };

  capabilities: ModelCapabilities = {
    reasoning: 78, coding: 72, analysis: 75, creative: 82, multilingual: 72,
    contextWindow: 245000, maxOutputTokens: 8192, structuredOutput: true,
    toolCalling: true, vision: false, embedding: false, streaming: true,
    functionCalling: true, jsonMode: true,
    costPerMillionInput: 0.80, costPerMillionOutput: 3.00,
    avgLatencyMs: 2200, throughputTokensPerSec: 40,
  };

  async health(): Promise<ProviderHealth> {
    const creds = KeysVault.getCredentials('minimax');
    return { status: (creds.apiKey ? 'ACTIVE' : 'DISABLED') as ProviderStatus, latencyMs: 0, availability: creds.apiKey ? 80 : 0, uptime: 98.0, lastCheck: new Date().toISOString(), consecutiveFailures: 0, errorRate: 0 };
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    const creds = KeysVault.getCredentials('minimax');
    if (!creds.apiKey) throw new Error('MiniMax API key not configured');

    const messages: any[] = [];
    if (request.system) messages.push({ role: 'system', content: request.system });
    for (const msg of request.messages) {
      if (msg.role === 'system' && request.system) continue;
      messages.push({ role: msg.role, content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) });
    }

    const response = await fetch(creds.apiBase || 'https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${creds.apiKey}` },
      body: JSON.stringify({ model: this.identity.id, messages, temperature: request.temperature ?? 0.7, max_tokens: request.maxTokens ?? 4096 }),
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) { const e = await response.text(); ProviderHealthRegistry.recordRequest('minimax', latencyMs, false, response.status, 0, 0); throw new Error(`MiniMax API Error: ${response.status} - ${e}`); }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || data.reply || '';
    const pt = data.usage?.prompt_tokens || Math.round(JSON.stringify(messages).length / 4);
    const ct = data.usage?.completion_tokens || Math.round(text.length / 4);
    const cost = this.estimateCost(pt, ct);
    ProviderHealthRegistry.recordRequest('minimax', latencyMs, true, response.status, pt + ct, cost);

    return { id: `minimax_${Date.now()}`, text, finishReason: 'STOP', model: this.identity.id, provider: 'minimax', usage: { promptTokens: pt, completionTokens: ct, totalTokens: pt + ct, costUsd: cost }, latencyMs, metadata: { requestId: request.metadata.requestId, traceId: `trc_${request.metadata.requestId}`, modelId: this.identity.id, providerId: 'minimax', cached: false, fallback: false, circuitBroken: false, governancePassed: true, timestamp: new Date().toISOString() } };
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> { const r = await this.infer(request); for (const w of r.text.split(' ')) yield { id: r.id, delta: w + ' ' }; }

  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    const pt = Math.round(JSON.stringify(request.messages).length / 4); const ct = request.maxTokens ?? 1000;
    return { estimatedPromptTokens: pt, estimatedCompletionTokens: ct, estimatedCostUsd: this.estimateCost(pt, ct), estimatedLatencyMs: this.capabilities.avgLatencyMs, recommendedProvider: 'minimax', recommendedModel: this.identity.id, alternatives: [] };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return (promptTokens * this.capabilities.costPerMillionInput / 1000000) + (completionTokens * this.capabilities.costPerMillionOutput / 1000000);
  }
}
