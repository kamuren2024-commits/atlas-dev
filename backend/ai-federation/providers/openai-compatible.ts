// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — OPENAI-COMPATIBLE PROVIDER BASE
// Generic adapter for any OpenAI-compatible inference endpoint
// ============================================================================

import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ModelCapabilities, ProviderStatus,
  ProviderCategory, DeploymentMode, DataClassification,
} from '../federation/types';
import { ProviderHealthRegistry } from '../health/health-registry';

export interface OpenAICompatibleConfig {
  providerId: string;
  displayName: string;
  apiBase: string;
  defaultModel: string;
  apiKeyEnv: string;
  category: ProviderCategory;
  deploymentMode: DeploymentMode;
  allowedClassifications: DataClassification[];
  capabilities: ModelCapabilities;
}

export class OpenAICompatibleProvider implements FederatedModelProvider {
  identity: ModelIdentity;
  capabilities: ModelCapabilities;
  private apiBase: string;
  private apiKeyEnv: string;

  constructor(config: OpenAICompatibleConfig) {
    this.apiBase = config.apiBase;
    this.apiKeyEnv = config.apiKeyEnv;

    this.identity = {
      id: config.defaultModel,
      providerId: config.providerId,
      providerCategory: config.category,
      displayName: config.displayName,
      version: config.defaultModel,
      deploymentMode: config.deploymentMode,
      dataResidency: config.deploymentMode === 'LOCAL' ? ['LOCAL'] : ['CLOUD'],
      allowedClassifications: config.allowedClassifications,
    };

    this.capabilities = config.capabilities;
  }

  async health(): Promise<ProviderHealth> {
    const apiKey = process.env[this.apiKeyEnv];
    const enabled = process.env[`${this.providerId.toUpperCase()}_ENABLED`] === 'true';
    return { status: (enabled && apiKey ? 'ACTIVE' : enabled ? 'DEGRADED' : 'DISABLED') as ProviderStatus, latencyMs: 0, availability: enabled ? 90 : 0, uptime: 99.0, lastCheck: new Date().toISOString(), consecutiveFailures: 0, errorRate: 0 };
  }

  get providerId(): string { return this.identity.providerId; }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    const apiKey = process.env[this.apiKeyEnv];
    if (!apiKey) throw new Error(`${this.providerId} API key not configured`);

    const messages: any[] = [];
    if (request.system) messages.push({ role: 'system', content: request.system });
    for (const msg of request.messages) {
      if (msg.role === 'system' && request.system) continue;
      messages.push({ role: msg.role, content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) });
    }

    const body: any = {
      model: this.identity.id,
      messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.maxTokens ?? 4096,
    };
    if (request.tools && request.tools.length > 0) body.tools = request.tools;
    if (request.outputSchema) body.response_format = { type: 'json_object' };

    const response = await fetch(this.apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });

    const latencyMs = Date.now() - startTime;
    if (!response.ok) {
      const e = await response.text();
      ProviderHealthRegistry.recordRequest(this.providerId, latencyMs, false, response.status, 0, 0);
      throw new Error(`${this.providerId} API Error: ${response.status} - ${e}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const pt = data.usage?.prompt_tokens || Math.round(JSON.stringify(messages).length / 4);
    const ct = data.usage?.completion_tokens || Math.round(text.length / 4);
    const cost = this.estimateCost(pt, ct);
    ProviderHealthRegistry.recordRequest(this.providerId, latencyMs, true, response.status, pt + ct, cost);

    return {
      id: `${this.providerId}_${Date.now()}`,
      text, finishReason: 'STOP', model: this.identity.id, provider: this.providerId,
      usage: { promptTokens: pt, completionTokens: ct, totalTokens: pt + ct, costUsd: cost },
      latencyMs,
      metadata: {
        requestId: request.metadata.requestId, traceId: `trc_${request.metadata.requestId}`,
        modelId: this.identity.id, providerId: this.providerId, cached: false, fallback: false,
        circuitBroken: false, governancePassed: true, timestamp: new Date().toISOString(),
      },
    };
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> {
    const r = await this.infer(request);
    for (const w of r.text.split(' ')) yield { id: r.id, delta: w + ' ' };
  }

  async estimate(request: InferenceRequest): Promise<InferenceEstimate> {
    const pt = Math.round(JSON.stringify(request.messages).length / 4);
    const ct = request.maxTokens ?? 1000;
    return {
      estimatedPromptTokens: pt, estimatedCompletionTokens: ct,
      estimatedCostUsd: this.estimateCost(pt, ct),
      estimatedLatencyMs: this.capabilities.avgLatencyMs,
      recommendedProvider: this.providerId, recommendedModel: this.identity.id, alternatives: [],
    };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return (promptTokens * this.capabilities.costPerMillionInput / 1000000) +
           (completionTokens * this.capabilities.costPerMillionOutput / 1000000);
  }
}
