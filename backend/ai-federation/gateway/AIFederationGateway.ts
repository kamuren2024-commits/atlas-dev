// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — ENTERPRISE AI GATEWAY
// Primary execution boundary for all AI inference requests
// Pipeline: Validate → Correlate → Policy → Resolve → CircuitBreak → Execute → Normalize → Observe → Respond
// ============================================================================

import {
  InferenceRequest,
  InferenceResponse,
  RequestMetadata,
  DataClassification,
  Message,
} from '../federation/types';
import { ModelRegistry, RegisteredModel } from '../registry/ModelRegistry';
import { ProviderHealthMonitor } from '../resilience/HealthMonitor';
import { CircuitBreakerRegistry } from '../resilience/CircuitBreaker';
import { executeWithRetry, isRetryableError } from '../resilience/RetryStrategy';
import { withTimeout } from '../resilience/TimeoutManager';
import { TimeoutManager } from '../resilience/TimeoutManager';
import { createCorrelationContext, CorrelationContext } from '../core/correlation';
import { FederationAuditLogger } from '../observability/FederationAuditLogger';
import { trace } from '../observability/ObservabilityHooks';
import {
  AIRequestValidationError,
  AIProviderUnavailableError,
  AIAllProvidersExhaustedError,
  AIFederationError,
} from '../core/errors';
import { TIMEOUT, RETRY, REQUEST_DEFAULTS } from '../core/constants';

export interface GatewayRequest {
  messages: Message[];
  system?: string;
  temperature?: number;
  maxTokens?: number;
  /** Preferred provider (bypasses routing) */
  preferredProvider?: string;
  /** Preferred model (bypasses routing) */
  preferredModel?: string;
  metadata: Partial<RequestMetadata>;
}

export interface GatewayResponse {
  success: boolean;
  text: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    costUsd: number;
  };
  latencyMs: number;
  correlation: CorrelationContext;
  auditId?: string;
  error?: string;
  retryCount: number;
  fromCache: boolean;
}

/**
 * Enterprise AI Federation Gateway.
 * Single entry point for all AI inference. Handles the full request lifecycle.
 */
export class AIFederationGateway {
  private static instance: AIFederationGateway;
  private modelRegistry: ModelRegistry;
  private healthMonitor: ProviderHealthMonitor;
  private circuitBreakers: CircuitBreakerRegistry;
  private auditLogger: FederationAuditLogger;
  private timeoutManager: TimeoutManager;

  private constructor() {
    this.modelRegistry = ModelRegistry.getInstance();
    this.healthMonitor = ProviderHealthMonitor.getInstance();
    this.circuitBreakers = CircuitBreakerRegistry.getInstance();
    this.auditLogger = FederationAuditLogger.getInstance();
    this.timeoutManager = TimeoutManager.getInstance();
  }

  static getInstance(): AIFederationGateway {
    if (!AIFederationGateway.instance) {
      AIFederationGateway.instance = new AIFederationGateway();
    }
    return AIFederationGateway.instance;
  }

  /**
   * Primary execution entry point.
   */
  async execute(request: GatewayRequest): Promise<GatewayResponse> {
    const startTime = Date.now();

    // 1. Validate request
    this.validateRequest(request);

    // 2. Create correlation context
    const correlation = createCorrelationContext({
      requestId: request.metadata.requestId,
      traceId: request.metadata.requestId ? `trc_${request.metadata.requestId}` : undefined,
      missionId: request.metadata.missionId,
      workflowId: request.metadata.workflow,
      agentId: request.metadata.agentId,
      userId: request.metadata.userId,
    });

    trace.requestStart(correlation.requestId, correlation.traceId, {
      module: request.metadata.module,
      classification: request.metadata.dataClassification,
    });

    // 3. Build full metadata
    const metadata: RequestMetadata = {
      requestId: correlation.requestId,
      missionId: correlation.missionId,
      agentId: correlation.agentId,
      agentDepth: request.metadata.agentDepth || 0,
      userId: correlation.userId,
      tenantId: request.metadata.tenantId || REQUEST_DEFAULTS.TENANT,
      module: request.metadata.module || REQUEST_DEFAULTS.MODULE,
      workflow: correlation.workflowId,
      dataClassification: request.metadata.dataClassification || REQUEST_DEFAULTS.CLASSIFICATION,
      requiredCapabilities: request.metadata.requiredCapabilities || [],
      preferredDeployment: request.metadata.preferredDeployment,
      latencyRequirementMs: request.metadata.latencyRequirementMs,
      budgetUsd: request.metadata.budgetUsd,
      auditRequired: request.metadata.auditRequired ?? true,
      citationRequired: request.metadata.citationRequired ?? false,
      timestamp: new Date().toISOString(),
    };

    // 4. Build inference request
    const inferenceRequest: InferenceRequest = {
      messages: request.messages,
      system: request.system,
      temperature: request.temperature ?? REQUEST_DEFAULTS.TEMPERATURE,
      maxTokens: request.maxTokens ?? REQUEST_DEFAULTS.MAX_TOKENS,
      metadata,
    };

    // 5. Resolve provider
    const { provider, providerInstance } = await this.resolveProvider(
      request.preferredProvider,
      request.preferredModel
    );

    const providerId = provider.identity.providerId;
    const modelId = provider.identity.id;

    trace.providerCall(correlation.requestId, correlation.traceId, providerId, modelId);

    // 6. Circuit breaker check
    const cb = this.circuitBreakers.get(providerId);
    cb.allow(); // throws AICircuitOpenError if open

    // 7. Execute with retry
    let retryCount = 0;
    let lastError: string | undefined;

    const timeoutConfig = this.timeoutManager.get(providerId);

    try {
      const result = await executeWithRetry<InferenceResponse>(
        async () => {
          return await withTimeout<InferenceResponse>(
            providerInstance.infer(inferenceRequest) as Promise<InferenceResponse>,
            timeoutConfig.inferenceMs,
            providerId,
            correlation.requestId
          );
        },
        {
          config: {
            maxAttempts: RETRY.MAX_ATTEMPTS,
            baseDelayMs: RETRY.BASE_DELAY_MS,
          },
          provider: providerId,
          onRetry: (attempt) => {
            retryCount = attempt.attempt;
            trace.retry(correlation.requestId, correlation.traceId, providerId, attempt.attempt, attempt.delayMs);
          },
        }
      );

      // Record success
      cb.recordSuccess();

      trace.providerResponse(
        correlation.requestId,
        correlation.traceId,
        providerId,
        modelId,
        result.latencyMs
      );

      // 8. Audit
      let auditId: string | undefined;
      if (metadata.auditRequired) {
        const auditEntry = this.auditLogger.record({
          requestId: correlation.requestId,
          traceId: correlation.traceId,
          provider: providerId,
          model: modelId,
          classification: metadata.dataClassification,
          latencyMs: result.latencyMs,
          status: 'SUCCESS',
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          costUsd: result.usage.costUsd,
          agentId: metadata.agentId,
          userId: metadata.userId,
          missionId: metadata.missionId,
          workflowId: metadata.workflow,
        });
        auditId = auditEntry.id;
      }

      const totalLatency = Date.now() - startTime;
      trace.requestEnd(correlation.requestId, correlation.traceId, totalLatency, 'OK');

      return {
        success: true,
        text: result.text,
        model: result.model,
        provider: providerId,
        usage: {
          promptTokens: result.usage.promptTokens,
          completionTokens: result.usage.completionTokens,
          totalTokens: result.usage.totalTokens,
          costUsd: result.usage.costUsd,
        },
        latencyMs: totalLatency,
        correlation,
        auditId,
        retryCount,
        fromCache: false,
      };
    } catch (err: any) {
      // Record failure
      cb.recordFailure();

      lastError = err instanceof AIFederationError ? err.safeMessage : err.message;
      const totalLatency = Date.now() - startTime;

      trace.providerError(correlation.requestId, correlation.traceId, providerId, lastError!);
      trace.requestEnd(correlation.requestId, correlation.traceId, totalLatency, 'ERROR');

      // Audit failure
      if (metadata.auditRequired) {
        this.auditLogger.record({
          requestId: correlation.requestId,
          traceId: correlation.traceId,
          provider: providerId,
          model: modelId,
          classification: metadata.dataClassification,
          latencyMs: totalLatency,
          status: err instanceof AIFederationError && err.code === 'AI_PROVIDER_TIMEOUT' ? 'TIMEOUT' : 'FAILED',
          agentId: metadata.agentId,
          userId: metadata.userId,
          missionId: metadata.missionId,
          workflowId: metadata.workflow,
          errorCategory: err instanceof AIFederationError ? err.code : 'UNKNOWN',
        });
      }

      return {
        success: false,
        text: '',
        model: modelId,
        provider: providerId,
        usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, costUsd: 0 },
        latencyMs: totalLatency,
        correlation,
        error: lastError,
        retryCount,
        fromCache: false,
      };
    }
  }

  /**
   * Get gateway health status.
   */
  getHealth(): {
    status: string;
    registeredProviders: number;
    healthyProviders: number;
    circuitBreakers: any[];
    auditStats: any;
  } {
    const allModels = this.modelRegistry.getAllRegisteredModels();
    const providerIds = [...new Set(allModels.map(m => m.identity.providerId))];
    const healthyProviders = providerIds.filter(id => {
      const entry = this.healthMonitor.getStatus(id);
      return entry && (entry.status === 'ACTIVE' || entry.status === 'DEGRADED');
    });

    return {
      status: healthyProviders.length > 0 ? 'OPERATIONAL' : 'DEGRADED',
      registeredProviders: providerIds.length,
      healthyProviders: healthyProviders.length,
      circuitBreakers: this.circuitBreakers.getAll(),
      auditStats: this.auditLogger.getStats(),
    };
  }

  private validateRequest(request: GatewayRequest): void {
    if (!request.messages || request.messages.length === 0) {
      throw new AIRequestValidationError('Request must contain at least one message');
    }

    if (request.metadata.agentDepth && request.metadata.agentDepth > 20) {
      throw new AIRequestValidationError('Agent depth exceeds maximum allowed (20)');
    }
  }

  private async resolveProvider(
    preferredProvider?: string,
    preferredModel?: string
  ): Promise<{ provider: RegisteredModel; providerInstance: any }> {
    // If preferred provider specified, try to find it
    if (preferredProvider) {
      const providerInstance = this.modelRegistry.getProvider(preferredProvider);
      if (providerInstance) {
        const allModels = this.modelRegistry.getAllRegisteredModels();
        const model = allModels.find(m => m.identity.providerId === preferredProvider);
        if (model) {
          return { provider: this.modelRegistry.getModel(`${preferredProvider}:${preferredModel || model.identity.id}`)!, providerInstance };
        }
      }
    }

    // If preferred model specified
    if (preferredModel) {
      const model = this.modelRegistry.getModel(preferredModel);
      if (model) {
        return { provider: model, providerInstance: model.provider };
      }
    }

    // Default: pick first available healthy provider
    const allModels = this.modelRegistry.getAllRegisteredModels();
    if (allModels.length === 0) {
      throw new AIProviderUnavailableError('none', { requestId: undefined });
    }

    const first = allModels[0];
    return { provider: this.modelRegistry.getModel(`${first.identity.providerId}:${first.identity.id}`)!, providerInstance: first.provider };
  }
}
