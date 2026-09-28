// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — FEDERATION INDEX
// Backward-compatible exports + new V2 exports
// ============================================================================

// --- Existing V1 exports (backward compatibility) ---
export { AIService } from './agents/compatibility';
export { ModelRouter } from './routing/model-router';
export type { RouteOptions } from './routing/model-router';
export { ProviderHealthRegistry } from './health/health-registry';
export type { ProviderMetric } from './health/health-registry';
export { CostGovernor } from './costs/cost-governor';
export type { CostRecord } from './costs/cost-governor';
export { AuditLedger } from './compliance/audit-ledger';
export type { AuditInteraction } from './compliance/audit-ledger';
export { AIOperationsCenter } from './telemetry/operations-center';
export type { OperationsCenterData } from './telemetry/operations-center';
export { FederationCache } from './cache/federation-cache';
export { KeysVault } from './security/keys-vault';
export type { AIProvider, AIResponse } from './providers/base';
export { ProviderLoader } from './config/provider-loader';
export { ProviderRegistry as LegacyProviderRegistry } from './config/provider-registry';
export { ProviderValidator } from './config/provider-validator';
export { AIConfig } from './config/provider-config';
export type { ProviderInfo, AIEnvironmentConfig } from './config/provider-types';
export { ProviderStatusService } from './health/provider-status-service';
export type { ProviderStatus as LegacyProviderStatus } from './health/provider-status-service';

// --- V2 Federation exports ---
// Core types
export type {
  ModelIdentity,
  ModelCapabilities,
  ProviderCategory,
  DeploymentMode,
  DataClassification,
  ProviderHealth,
  ProviderStatus,
  Message,
  MessagePart,
  ToolCall,
  ToolDefinition,
  InferenceRequest,
  InferenceResponse,
  InferenceChunk,
  InferenceEstimate,
  RequestMetadata,
  ResponseMetadata,
  TokenUsage,
  RoutingRequest,
  RoutingDecision,
  RoutingScores,
  TaskDefinition,
  FailoverPolicy,
  FailoverResult,
  DeploymentPreference,
  AIGatewayRequest,
  AIGatewayResponse,
  ModelEvaluation,
  AgentEvaluation,
  Evidence,
} from './federation/types';

// The EvidenceProvenance data type (interface) conflicts with the
// EvidenceProvenance governance service class. Export the type here under its
// canonical name; the service is exported as EvidenceProvenanceService below.
export type { EvidenceProvenance } from './federation/types';

// Federation core
export { AIOrchestrator } from './federation/AIOrchestrator';
export { IntelligentRouter } from './federation/ModelRouter';
export { FailoverEngine } from './federation/FailoverEngine';
export { CapabilityResolver, CAPABILITY_PROFILES } from './federation/CapabilityResolver';

// Providers (V2 hardened adapters)
export type { FederatedModelProvider } from './providers/FederatedModelProvider';
export { OpenAIProvider } from './providers/openai';
export { GeminiProviderV2 } from './providers/gemini-v2';
export { AnthropicProvider } from './providers/anthropic';
export { OllamaProviderV2 } from './providers/ollama-v2';
export { QwenProvider } from './providers/qwen';
export { DeepSeekProvider } from './providers/deepseek';
export { ZhipuProvider } from './providers/zhipu';
export { MoonshotProvider } from './providers/moonshot';
export { MiniMaxProvider } from './providers/minimax';
export { OpenAICompatibleProvider } from './providers/openai-compatible';
export { VLLMProvider, SGLangProvider, LlamaCppProvider, LocalEmbeddingProvider } from './providers/local';
export { ProviderFactory } from './providers/factory';

// Ollama Local Runtime (dynamic model discovery + real inference queue)
export { OllamaFederationProvider } from './providers/ollama/OllamaFederationProvider';
export { OllamaClient, OllamaError } from './providers/ollama/OllamaClient';
export { OllamaModelDiscovery } from './providers/ollama/OllamaModelDiscovery';
export { OllamaHealthService } from './providers/ollama/OllamaHealthService';
export { InferenceQueue } from './providers/ollama/InferenceQueue';
export type { LocalModel, OllamaModelTag, OllamaHealth, OllamaGenerateResponse } from './providers/ollama/types';

// Enterprise AI Service boundary
export { AIFederationService } from './AIFederationService';
export type { ChatRequest, ChatResult, ModelRegistryEntry, ProviderStatusEntry } from './AIFederationService';

// Registries (V2)
export { ModelRegistry as FederationModelRegistry } from './registry/ModelRegistry';
export { CapabilityRegistry, ENTERPRISE_CAPABILITIES } from './registry/CapabilityRegistry';
export { ProviderRegistry } from './registry/ProviderRegistry';

// Governance
export { PolicyEngine } from './governance/PolicyEngine';
export { AuditTrail } from './governance/AuditTrail';
export { EvidenceProvenance as EvidenceProvenanceService } from './governance/EvidenceProvenance';

// Memory
export { OperationalMemory } from './memory/OperationalMemory';
export { EpisodicMemory } from './memory/EpisodicMemory';
export { SemanticMemory } from './memory/SemanticMemory';
export { InstitutionalMemory } from './memory/InstitutionalMemory';

// Agent OS
export { AgentRuntime } from './agents/AgentRuntime';
export { ToolGateway } from './agents/ToolGateway';
export {
  AgentAdapterRegistry,
  AgentEligibilityGate,
  AgentOrchestrator,
  AtlasNativeAdapter,
} from './agents/AgentControlPlane';
export type {
  AdapterStatus,
  AgentAdapter,
  AgentCapability,
  AgentEligibilityDecision,
  AgentGateChecks,
  AgentEvaluationProfile,
  AgentExecutionContext,
  AgentExecutionResult,
  AgentRunStatus,
  AgentRuntimeHealth,
  AgentTrace,
  AtlasAgent,
  AtlasAgentDescriptor,
  AtlasAgentRequest,
  AtlasAgentResponse,
  AtlasRuntimeAgentDefinition,
  AtlasRuntimeBridge,
  EligibilityCheck,
  EvalArtifact,
  EvalAssertion,
  EvalCase,
  EvalDecision,
  EvalFailure,
  EvalMetric,
  EvalObservation,
  EvalRun,
  EvalStatus,
  EvalSuite,
  ExecutionPolicy,
  ModelPolicy,
  SkillRef,
  TenantScope,
  ToolRef,
} from './agents/AgentControlPlane';
export { SkillRegistry } from './skills/SkillRegistry';
export type {
  LoadedSkill,
  SkillAuthorizer,
  SkillEvaluationProfile,
  SkillMetadata,
  SkillRecord,
  SkillStatus,
} from './skills/SkillRegistry';

// Evaluation
export { AgentEvaluator } from './evaluation/AgentEvaluator';
export { ModelEvaluator, ENTERPRISE_BENCHMARKS } from './evaluation/ModelEvaluator';

// --- Phase 1 Enterprise Hardening Exports ---

// Core contracts
export { AIFederationError, AIProviderUnavailableError, AIProviderAuthenticationError, AIProviderRateLimitError, AIProviderTimeoutError, AIModelNotFoundError, AIInferenceError, AIPolicyViolationError, AICircuitOpenError, AIRequestValidationError, AIAllProvidersExhaustedError } from './core/errors';
export { TIMEOUT, CIRCUIT_BREAKER, RETRY, HEALTH, AUDIT, CACHE, AGENT_MAX_DEPTH, PROVIDER_STATES, REQUEST_DEFAULTS } from './core/constants';
export type { ProviderLifecycleState } from './core/constants';
export { createCorrelationContext, createChildSpan, extractCorrelationFromHeaders, correlationToHeaders } from './core/correlation';
export type { CorrelationContext } from './core/correlation';

// Resilience
export { CircuitBreaker, CircuitBreakerRegistry } from './resilience/CircuitBreaker';
export type { CircuitState, CircuitBreakerSnapshot } from './resilience/CircuitBreaker';
export { executeWithRetry, isRetryableError, isRetryableStatus, calculateDelay } from './resilience/RetryStrategy';
export type { RetryConfig, RetryAttempt } from './resilience/RetryStrategy';
export { withTimeout, createTimeoutController, TimeoutManager } from './resilience/TimeoutManager';
export type { TimeoutConfig } from './resilience/TimeoutManager';
export { ProviderHealthMonitor } from './resilience/HealthMonitor';
export type { HealthCheckResult, HealthMonitorEntry } from './resilience/HealthMonitor';

// Enterprise Gateway
export { AIFederationGateway } from './gateway/AIFederationGateway';
export type { GatewayRequest, GatewayResponse } from './gateway/AIFederationGateway';

// Observability
export { ObservabilityHooks, trace } from './observability/ObservabilityHooks';
export type { TraceEvent, TraceEventType } from './observability/ObservabilityHooks';
export { FederationAuditLogger } from './observability/FederationAuditLogger';
export type { AuditEntry } from './observability/FederationAuditLogger';
