// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — FEDERATION INDEX
// Central export point for the entire AI Federation
// ============================================================================

// Core Types
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
} from './types';

// The EvidenceProvenance data type (interface) conflicts with the
// EvidenceProvenance governance service class name. Export the type here
// under its canonical name; the service is exported as EvidenceProvenanceService.
export type { EvidenceProvenance } from './types';

// Federation Core
export { AIOrchestrator } from './AIOrchestrator';
export { IntelligentRouter } from './ModelRouter';
export { FailoverEngine } from './FailoverEngine';
export { CapabilityResolver, CAPABILITY_PROFILES } from './CapabilityResolver';

// Providers
export type { FederatedModelProvider } from '../providers/FederatedModelProvider';

// Registries
export { ModelRegistry } from '../registry/ModelRegistry';
export { CapabilityRegistry, ENTERPRISE_CAPABILITIES } from '../registry/CapabilityRegistry';
export { ProviderRegistry } from '../registry/ProviderRegistry';

// Governance
export { PolicyEngine } from '../governance/PolicyEngine';
export { AuditTrail } from '../governance/AuditTrail';
export { EvidenceProvenance as EvidenceProvenanceService } from '../governance/EvidenceProvenance';

// Memory
export { OperationalMemory } from '../memory/OperationalMemory';
export { EpisodicMemory } from '../memory/EpisodicMemory';
export { SemanticMemory } from '../memory/SemanticMemory';
export { InstitutionalMemory } from '../memory/InstitutionalMemory';

// Agent OS
export { AgentRuntime } from '../agents/AgentRuntime';
export { ToolGateway } from '../agents/ToolGateway';

// Evaluation
export { AgentEvaluator } from '../evaluation/AgentEvaluator';
export { ModelEvaluator, ENTERPRISE_BENCHMARKS } from '../evaluation/ModelEvaluator';
