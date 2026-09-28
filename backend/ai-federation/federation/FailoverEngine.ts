// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — FAILOVER ENGINE
// Dynamic, policy-aware failover with circuit breakers
// ============================================================================

import {
  InferenceRequest,
  InferenceResponse,
  FailoverPolicy,
  FailoverResult,
} from './types';
import { IntelligentRouter } from './ModelRouter';
import { ModelRegistry } from '../registry/ModelRegistry';
import { ProviderHealthRegistry } from '../health/health-registry';
import { AuditLedger } from '../compliance/audit-ledger';
import { FederationCache } from '../cache/federation-cache';

interface CircuitBreakerState {
  failures: number;
  lastFailureTime: number;
  isOpen: boolean;
}

export class FailoverEngine {
  private static instance: FailoverEngine;
  private router: IntelligentRouter;
  private modelRegistry: ModelRegistry;
  private healthRegistry: ProviderHealthRegistry;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();

  private static readonly DEFAULT_POLICY: FailoverPolicy = {
    missionCriticality: 'MEDIUM',
    maxLatencyMs: 30000,
    allowCloud: true,
    minimumQuality: 50,
    maxRetries: 3,
    retryDelayMs: 1000,
    enableCircuitBreaker: true,
    circuitBreakerThreshold: 3,
    circuitBreakerCooldownMs: 60000,
  };

  private constructor() {
    this.router = IntelligentRouter.getInstance();
    this.modelRegistry = ModelRegistry.getInstance();
    this.healthRegistry = ProviderHealthRegistry;
  }

  public static getInstance(): FailoverEngine {
    if (!FailoverEngine.instance) {
      FailoverEngine.instance = new FailoverEngine();
    }
    return FailoverEngine.instance;
  }

  /**
   * Execute inference with intelligent routing and failover
   */
  async executeWithFailover(
    request: InferenceRequest,
    policy?: Partial<FailoverPolicy>
  ): Promise<{ success: boolean; response?: InferenceResponse; error?: string }> {
    const fullPolicy = { ...FailoverEngine.DEFAULT_POLICY, ...policy };
    const { metadata } = request;

    // 1. Check cache first
    const cacheKey = this.buildCacheKey(request);
    const cached = await FederationCache.get(cacheKey, metadata.module);
    if (cached) {
      console.log(`[FAILOVER] Cache hit for request [${metadata.requestId}]`);
      return {
        success: true,
        response: {
          ...cached.response,
          metadata: {
            ...cached.response.metadata,
            cached: true,
          },
        },
      };
    }

    // 2. Get routing decision
    const routingDecision = await this.router.route({
      task: {
        type: this.inferTaskType(request),
        complexity: this.inferComplexity(request),
        volume: 'SINGLE',
      },
      dataClassification: metadata.dataClassification,
      latencyRequirementMs: metadata.latencyRequirementMs,
      budgetUsd: metadata.budgetUsd,
      requiredCapabilities: metadata.requiredCapabilities,
      preferredDeployment: metadata.preferredDeployment,
      missionId: metadata.missionId,
      agentId: metadata.agentId,
    });

    // 3. Build failover chain
    const chain = [`${routingDecision.selectedProvider}:${routingDecision.selectedModel}`, ...routingDecision.fallbackChain];

    console.log(`[FAILOVER] Chain for [${metadata.requestId}]: ${chain.join(' -> ')}`);

    // 4. Execute with failover
    const attempts: FailoverResult['attempts'] = [];
    let lastError: string | undefined;

    for (let i = 0; i < Math.min(chain.length, fullPolicy.maxRetries + 1); i++) {
      const [providerId, modelId] = chain[i].split(':');

      // Circuit breaker check
      if (fullPolicy.enableCircuitBreaker && this.isCircuitOpen(providerId)) {
        console.warn(`[FAILOVER] Circuit breaker open for [${providerId}], skipping`);
        attempts.push({
          provider: providerId,
          model: modelId,
          success: false,
          error: 'Circuit breaker open',
          latencyMs: 0,
        });
        continue;
      }

      const startTime = Date.now();

      try {
        console.log(`[FAILOVER] Attempt ${i + 1}: provider=${providerId} model=${modelId}`);

        const provider = this.modelRegistry.getProvider(providerId);
        if (!provider) {
          throw new Error(`Provider ${providerId} not registered`);
        }

        const response = await provider.infer(request);
        const latencyMs = Date.now() - startTime;

        // Record success
        this.recordSuccess(providerId);

        attempts.push({
          provider: providerId,
          model: modelId,
          success: true,
          latencyMs,
        });

        // Cache successful response
        await FederationCache.set(cacheKey, response, providerId, modelId, metadata.module);

        // Audit
        AuditLedger.append(
          request.messages.map(m => typeof m.content === 'string' ? m.content : '').join(' '),
          response.text,
          providerId,
          modelId,
          response.usage.costUsd,
          latencyMs,
          metadata.userId || 'system',
          metadata.workflow || 'federation',
          i > 0 ? ['FALLBACK_USED'] : []
        );

        return { success: true, response };
      } catch (err: any) {
        const latencyMs = Date.now() - startTime;
        lastError = err.message;

        console.warn(`[FAILOVER] Provider [${providerId}] failed: ${err.message}`);

        this.recordFailure(providerId, fullPolicy);

        attempts.push({
          provider: providerId,
          model: modelId,
          success: false,
          error: err.message,
          latencyMs,
        });

        // Delay before retry (except last)
        if (i < chain.length - 1) {
          await this.delay(fullPolicy.retryDelayMs * (i + 1));
        }
      }
    }

    // All attempts exhausted
    console.error(`[FAILOVER] All ${attempts.length} attempts exhausted for [${metadata.requestId}]`);

    return {
      success: false,
      error: `All ${attempts.length} providers failed. Last error: ${lastError}`,
    };
  }

  private isCircuitOpen(providerId: string): boolean {
    const state = this.circuitBreakers.get(providerId);
    if (!state || !state.isOpen) return false;

    // Check if cooldown has elapsed
    if (Date.now() - state.lastFailureTime > FailoverEngine.DEFAULT_POLICY.circuitBreakerCooldownMs) {
      state.isOpen = false;
      state.failures = 0;
      console.log(`[CIRCUIT-BREAKER] Reset for [${providerId}]`);
      return false;
    }

    return true;
  }

  private recordFailure(providerId: string, policy: FailoverPolicy): void {
    const state = this.circuitBreakers.get(providerId) || { failures: 0, lastFailureTime: 0, isOpen: false };
    state.failures++;
    state.lastFailureTime = Date.now();

    if (state.failures >= policy.circuitBreakerThreshold) {
      state.isOpen = true;
      console.warn(`[CIRCUIT-BREAKER] Opened for [${providerId}] after ${state.failures} failures`);
    }

    this.circuitBreakers.set(providerId, state);
  }

  private recordSuccess(providerId: string): void {
    const state = this.circuitBreakers.get(providerId);
    if (state) {
      state.failures = Math.max(0, state.failures - 1);
      if (state.failures === 0) {
        state.isOpen = false;
      }
    }
  }

  private buildCacheKey(request: InferenceRequest): string {
    const msgContent = request.messages.map(m => typeof m.content === 'string' ? m.content : '').join('|');
    return `${msgContent.substring(0, 200)}_${request.temperature || 0.7}`;
  }

  private inferTaskType(request: InferenceRequest): any {
    const text = request.messages.map(m => typeof m.content === 'string' ? m.content : '').join(' ').toLowerCase();
    if (text.includes('code') || text.includes('function') || text.includes('implement')) return 'CODING';
    if (text.includes('analyze') || text.includes('evaluate') || text.includes('assess')) return 'ANALYSIS';
    if (text.includes('reason') || text.includes('explain') || text.includes('why')) return 'REASONING';
    return 'GENERATION';
  }

  private inferComplexity(request: InferenceRequest): any {
    const totalLength = request.messages.reduce((sum, m) => {
      return sum + (typeof m.content === 'string' ? m.content.length : 0);
    }, 0);
    if (totalLength > 10000) return 'CRITICAL';
    if (totalLength > 5000) return 'HIGH';
    if (totalLength > 1000) return 'MEDIUM';
    return 'LOW';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
