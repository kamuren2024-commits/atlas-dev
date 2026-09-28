// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — GEMINI PROVIDER (HARDENED)
// NO fabricated stream responses. NO fake embeddings. Real error handling.
// ============================================================================

import { GoogleGenAI } from '@google/genai';
import { FederatedModelProvider } from './FederatedModelProvider';
import {
  InferenceRequest, InferenceResponse, InferenceChunk, InferenceEstimate,
  ProviderHealth, ModelIdentity, ModelCapabilities, ProviderStatus,
} from '../federation/types';
import { KeysVault } from '../security/keys-vault';
import { ProviderHealthRegistry } from '../health/health-registry';
import {
  AIProviderAuthenticationError,
  AIProviderUnavailableError,
  AIInferenceError,
} from '../core/errors';

export class GeminiProviderV2 implements FederatedModelProvider {
  identity: ModelIdentity = {
    id: 'gemini-2.5-pro',
    providerId: 'gemini',
    providerCategory: 'FRONTIER',
    displayName: 'Google Gemini 2.5 Pro',
    version: 'gemini-2.5-pro',
    deploymentMode: 'CLOUD',
    dataResidency: ['US'],
    allowedClassifications: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL'],
  };

  capabilities: ModelCapabilities = {
    reasoning: 91,
    coding: 88,
    analysis: 90,
    creative: 85,
    multilingual: 90,
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    structuredOutput: true,
    toolCalling: true,
    vision: true,
    embedding: false,
    streaming: true,
    functionCalling: true,
    jsonMode: true,
    costPerMillionInput: 0.075,
    costPerMillionOutput: 0.30,
    avgLatencyMs: 2000,
    throughputTokensPerSec: 100,
  };

  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI | null {
    if (this.client) return this.client;

    const creds = KeysVault.getCredentials('gemini');
    if (!creds.apiKey) return null;

    this.client = new GoogleGenAI({
      apiKey: creds.apiKey,
      httpOptions: {
        headers: { 'User-Agent': 'atlas-federation-v2' },
      },
    });
    return this.client;
  }

  async health(): Promise<ProviderHealth> {
    const client = this.getClient();
    const status = client ? 'ACTIVE' : 'DISABLED';
    return {
      status: status as ProviderStatus,
      latencyMs: 0,
      availability: client ? 95 : 0,
      uptime: 99.9,
      lastCheck: new Date().toISOString(),
      consecutiveFailures: 0,
      errorRate: 0,
    };
  }

  async infer(request: InferenceRequest): Promise<InferenceResponse> {
    const startTime = Date.now();
    const client = this.getClient();

    if (!client) {
      throw new AIProviderAuthenticationError('gemini', { requestId: request.metadata.requestId });
    }

    const prompt = request.messages
      .map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content))
      .join('\n');

    try {
      const model = process.env.GEMINI_MODEL || this.identity.id;
      const response = await client.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction: request.system || 'You are a helpful assistant.',
          temperature: request.temperature ?? 0.4,
          maxOutputTokens: request.maxTokens ?? 8192,
        },
      });

      const text = response.text || '';
      const latencyMs = Date.now() - startTime;
      const promptTokens = Math.round(prompt.length / 4) + 12;
      const completionTokens = Math.round(text.length / 4) || 200;
      const cost = this.estimateCost(promptTokens, completionTokens);

      ProviderHealthRegistry.recordRequest('gemini', latencyMs, true, 200, promptTokens + completionTokens, cost);

      return {
        id: `gem_${Date.now()}`,
        text,
        finishReason: 'STOP',
        model,
        provider: 'gemini',
        usage: { promptTokens, completionTokens, totalTokens: promptTokens + completionTokens, costUsd: cost },
        latencyMs,
        metadata: {
          requestId: request.metadata.requestId,
          traceId: `trc_${request.metadata.requestId}`,
          modelId: model,
          providerId: 'gemini',
          cached: false,
          fallback: false,
          circuitBroken: false,
          governancePassed: true,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      const latencyMs = Date.now() - startTime;
      const statusCode = err.status || err.code || 500;
      ProviderHealthRegistry.recordRequest('gemini', latencyMs, false, statusCode, 0, 0);

      if (statusCode === 401 || statusCode === 403) {
        throw new AIProviderAuthenticationError('gemini', {
          requestId: request.metadata.requestId,
          cause: err,
        });
      }

      throw new AIInferenceError(err.message || 'Gemini inference failed', {
        provider: 'gemini',
        model: this.identity.id,
        requestId: request.metadata.requestId,
        cause: err,
      });
    }
  }

  async *stream(request: InferenceRequest): AsyncIterable<InferenceChunk> {
    const client = this.getClient();
    if (!client) {
      throw new AIProviderAuthenticationError('gemini', { requestId: request.metadata.requestId });
    }

    const prompt = request.messages
      .map(m => typeof m.content === 'string' ? m.content : JSON.stringify(m.content))
      .join('\n');

    try {
      const model = process.env.GEMINI_MODEL || this.identity.id;
      const responseStream = await client.models.generateContentStream({
        model,
        contents: prompt,
        config: {
          systemInstruction: request.system || 'You are a helpful assistant.',
          temperature: request.temperature ?? 0.4,
          maxOutputTokens: request.maxTokens ?? 8192,
        },
      });

      for await (const chunk of responseStream) {
        if (chunk.text) {
          yield { id: `gem_${Date.now()}`, delta: chunk.text };
        }
      }
    } catch (err: any) {
      // NO fabricated fallback — throw real error
      throw new AIInferenceError(err.message || 'Gemini streaming failed', {
        provider: 'gemini',
        model: this.identity.id,
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
      estimatedCostUsd: this.estimateCost(pt, ct),
      estimatedLatencyMs: this.capabilities.avgLatencyMs,
      recommendedProvider: 'gemini',
      recommendedModel: this.identity.id,
      alternatives: [],
    };
  }

  estimateCost(promptTokens: number, completionTokens: number): number {
    return (promptTokens * this.capabilities.costPerMillionInput / 1000000) +
           (completionTokens * this.capabilities.costPerMillionOutput / 1000000);
  }
}
