// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — UNIFIED CONTRACT TYPES
// Enterprise Cognitive Fabric Hardening
// ============================================================================

// ---------------------------------------------------------------------------
// Model Identity
// ---------------------------------------------------------------------------

export type ProviderCategory = 'LOCAL' | 'FRONTIER' | 'SPECIALIST' | 'CHINESE' | 'OPENAI_COMPATIBLE';

export type DeploymentMode = 'LOCAL' | 'CLOUD' | 'PRIVATE' | 'HYBRID';

export type DataClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED'
  | 'TOP_SECRET'
  | 'KETRACO_CRITICAL';

export interface ModelIdentity {
  id: string;
  providerId: string;
  providerCategory: ProviderCategory;
  displayName: string;
  version: string;
  deploymentMode: DeploymentMode;
  region?: string;
  dataResidency: string[];
  allowedClassifications: DataClassification[];
}

// ---------------------------------------------------------------------------
// Model Capabilities
// ---------------------------------------------------------------------------

export interface ModelCapabilities {
  reasoning: number;        // 0-100 logical/mathematical reasoning score
  coding: number;           // 0-100 code generation/analysis score
  analysis: number;         // 0-100 document/structured analysis score
  creative: number;         // 0-100 creative generation score
  multilingual: number;     // 0-100 multilingual support score
  contextWindow: number;    // max context tokens
  maxOutputTokens: number;  // max completion tokens
  structuredOutput: boolean;
  toolCalling: boolean;
  vision: boolean;
  embedding: boolean;
  streaming: boolean;
  functionCalling: boolean;
  jsonMode: boolean;
  costPerMillionInput: number;
  costPerMillionOutput: number;
  avgLatencyMs: number;
  throughputTokensPerSec: number;
}

// ---------------------------------------------------------------------------
// Provider Health
// ---------------------------------------------------------------------------

export type ProviderStatus = 'ACTIVE' | 'DEGRADED' | 'RATE_LIMITED' | 'UNAVAILABLE' | 'DISABLED' | 'CIRCUIT_BROKEN';

export interface ProviderHealth {
  status: ProviderStatus;
  latencyMs: number;
  availability: number;     // 0-100 rolling availability score
  uptime: number;           // percentage
  lastCheck: string;
  consecutiveFailures: number;
  errorRate: number;        // 0-100
  rateLimitRemaining?: number;
  rateLimitReset?: string;
}

// ---------------------------------------------------------------------------
// Inference Request / Response (Unified Contract)
// ---------------------------------------------------------------------------

export type MessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface Message {
  role: MessageRole;
  content: string | MessagePart[];
  name?: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface MessagePart {
  type: 'text' | 'image_url' | 'image_base64';
  text?: string;
  imageUrl?: { url: string; detail?: 'auto' | 'low' | 'high' };
  imageBase64?: { data: string; mediaType: string };
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: { name: string; arguments: string };
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface InferenceRequest {
  messages: Message[];
  system?: string;
  tools?: ToolDefinition[];
  outputSchema?: Record<string, any>;
  temperature?: number;
  topP?: number;
  topK?: number;
  maxTokens?: number;
  stopSequences?: string[];
  seed?: number;
  metadata: RequestMetadata;
}

export interface RequestMetadata {
  requestId: string;
  missionId?: string;
  agentId?: string;
  agentDepth: number;
  userId?: string;
  tenantId: string;
  module: string;
  workflow?: string;
  dataClassification: DataClassification;
  requiredCapabilities: string[];
  preferredDeployment?: DeploymentPreference;
  latencyRequirementMs?: number;
  budgetUsd?: number;
  auditRequired: boolean;
  citationRequired: boolean;
  timestamp: string;
}

export type DeploymentPreference = 'LOCAL_ONLY' | 'CLOUD_ONLY' | 'LOCAL_OR_PRIVATE' | 'ANY';

export interface InferenceResponse {
  id: string;
  text: string;
  finishReason: 'STOP' | 'MAX_TOKENS' | 'TOOL_CALL' | 'LENGTH' | 'CONTENT_FILTER';
  model: string;
  provider: string;
  usage: TokenUsage;
  latencyMs: number;
  toolCalls?: ToolCall[];
  structuredOutput?: Record<string, any>;
  metadata: ResponseMetadata;
}

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
}

export interface ResponseMetadata {
  requestId: string;
  traceId: string;
  modelId: string;
  providerId: string;
  cached: boolean;
  fallback: boolean;
  fallbackReason?: string;
  circuitBroken: boolean;
  governancePassed: boolean;
  auditId?: string;
  evaluationId?: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Streaming
// ---------------------------------------------------------------------------

export interface InferenceChunk {
  id: string;
  delta: string;
  finishReason?: InferenceResponse['finishReason'];
  usage?: Partial<TokenUsage>;
}

// ---------------------------------------------------------------------------
// Cost & Estimate
// ---------------------------------------------------------------------------

export interface InferenceEstimate {
  estimatedPromptTokens: number;
  estimatedCompletionTokens: number;
  estimatedCostUsd: number;
  estimatedLatencyMs: number;
  recommendedProvider: string;
  recommendedModel: string;
  alternatives: Array<{
    provider: string;
    model: string;
    estimatedCostUsd: number;
    estimatedLatencyMs: number;
    qualityScore: number;
  }>;
}

// ---------------------------------------------------------------------------
// Routing
// ---------------------------------------------------------------------------

export interface RoutingRequest {
  task: TaskDefinition;
  dataClassification: DataClassification;
  latencyRequirementMs?: number;
  budgetUsd?: number;
  requiredCapabilities: string[];
  contextSize?: number;
  preferredDeployment?: DeploymentPreference;
  missionId?: string;
  agentId?: string;
}

export interface TaskDefinition {
  type: 'REASONING' | 'CODING' | 'ANALYSIS' | 'GENERATION' | 'EMBEDDING' | 'CLASSIFICATION' | 'EXTRACTION' | 'SUMMARIZATION' | 'CONVERSATION';
  domain?: string;
  complexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  volume: 'SINGLE' | 'BATCH' | 'STREAMING';
}

export interface RoutingDecision {
  selectedProvider: string;
  selectedModel: string;
  score: number;
  scores: RoutingScores;
  fallbackChain: string[];
  reason: string;
  estimatedCost: number;
  estimatedLatency: number;
}

export interface RoutingScores {
  capability: number;
  quality: number;
  latency: number;
  cost: number;
  security: number;
  availability: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Failover
// ---------------------------------------------------------------------------

export interface FailoverPolicy {
  missionCriticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  maxLatencyMs: number;
  allowCloud: boolean;
  minimumQuality: number;
  maxRetries: number;
  retryDelayMs: number;
  enableCircuitBreaker: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerCooldownMs: number;
}

export interface FailoverResult {
  attempts: Array<{
    provider: string;
    model: string;
    success: boolean;
    error?: string;
    latencyMs: number;
  }>;
  finalResponse?: InferenceResponse;
  exhausted: boolean;
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

export interface ModelEvaluation {
  modelId: string;
  providerId: string;
  benchmarkId: string;
  score: number;
  qualityScore: number;
  factualityScore: number;
  hallucinationRate: number;
  citationAccuracy: number;
  structuredOutputAccuracy: number;
  evaluatedAt: string;
  sampleSize: number;
}

export interface AgentEvaluation {
  agentId: string;
  taskId: string;
  qualityScore: number;
  factualityScore: number;
  citationScore: number;
  latencyMs: number;
  costUsd: number;
  humanFeedback?: number;
  evaluatedAt: string;
}

// ---------------------------------------------------------------------------
// Evidence Provenance
// ---------------------------------------------------------------------------

export interface Evidence {
  sourceId: string;
  sourceType: 'DOCUMENT' | 'DATABASE' | 'API' | 'KNOWLEDGE_GRAPH' | 'DIGITAL_TWIN' | 'EVENT';
  timestamp: string;
  hash: string;
  content?: string;
  confidence: number;
  provenance: EvidenceProvenance;
}

export interface EvidenceProvenance {
  collectedBy: string;
  collectedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  chainOfCustody: Array<{
    handler: string;
    action: string;
    timestamp: string;
    hash: string;
  }>;
}

// ---------------------------------------------------------------------------
// AI Gateway Request (High-Level Entry Point)
// ---------------------------------------------------------------------------

export interface AIGatewayRequest {
  mission: string;
  task: string;
  context: Record<string, any>;
  governance: {
    classification: DataClassification;
    requireAudit: boolean;
    requireCitation: boolean;
    requireApproval?: boolean;
    approvalLevel?: 'NONE' | 'SUPERVISOR' | 'EXECUTIVE';
  };
  options?: {
    model?: string;
    provider?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
  };
}

export interface AIGatewayResponse {
  success: boolean;
  text: string;
  model: string;
  provider: string;
  costUsd: number;
  latencyMs: number;
  traceId: string;
  auditId?: string;
  evaluationId?: string;
  evidence?: Evidence[];
  requiresHumanApproval: boolean;
  approvalId?: string;
  error?: string;
}
