export type KernelStatus = 'DRAFT' | 'ACTIVE' | 'BLOCKED' | 'FAILED' | 'COMPLETED' | 'CANCELLED' | 'REVOKED';
export type MissionStatus = 'DRAFT' | 'PLANNED' | 'POLICY_REVIEW' | 'APPROVAL_REQUIRED' | 'APPROVED' | 'EXECUTING' | 'VERIFYING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'BLOCKED';
export type EligibilityStatus = 'DISCOVERED' | 'EVALUATING' | 'PASSED' | 'PASSED_WITH_RESTRICTIONS' | 'FAILED' | 'EXPIRED' | 'REVOKED' | 'UNVERIFIED';
export type VerificationState = 'REQUESTED' | 'VERIFIED' | 'NOT_VERIFIED' | 'CONFLICT' | 'EXPIRED' | 'UNAVAILABLE' | 'REVOKED';
export type PolicyDecision = 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'REQUIRE_REVIEW';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'CANCELLED';

export interface KernelMetadata {
  source?: string;
  traceId?: string;
  classification?: string;
  labels?: Record<string, string>;
}

export interface KernelEntity {
  id: string;
  version: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  status: KernelStatus | MissionStatus | EligibilityStatus | ApprovalStatus;
  metadata: KernelMetadata;
}

export interface AtlasMission extends KernelEntity {
  status: MissionStatus;
  principalId: string;
  objective: string;
  constraints: Record<string, unknown>;
  classification: string;
  context: Record<string, unknown>;
  agentRequirements: string[];
  skillRequirements: string[];
  toolRequirements: string[];
  workflowId?: string;
  policyContext: Record<string, unknown>;
  approvalRequirements: string[];
  evidenceRefs: string[];
  evaluationRefs: string[];
}

export interface AtlasAgent extends KernelEntity {
  status: KernelStatus;
  capabilities: string[];
  requiredSkills: string[];
  allowedTools: string[];
  evaluationStatus: EligibilityStatus;
}

export interface AtlasSkill extends KernelEntity {
  contentHash: string;
  requiredCapabilities: string[];
  requiredTools: string[];
  evaluationStatus: EligibilityStatus;
}

export interface AtlasModel extends KernelEntity {
  provider: string;
  capabilities: string[];
  evaluationStatus: EligibilityStatus;
}

export interface AtlasTool extends KernelEntity {
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  riskClass: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sideEffectClass: 'READ_ONLY' | 'REVERSIBLE' | 'IRREVERSIBLE' | 'FINANCIAL' | 'EXTERNAL_COMMUNICATION' | 'PRIVILEGED';
  requiredPermissions: string[];
  tenantScope: string;
  timeoutMs: number;
  idempotent: boolean;
  retryPolicy?: {
    maxAttempts: number;
    backoffMs: number;
  };
}

export interface AtlasEvidence extends KernelEntity {
  source: string;
  sourceType: string;
  contentHash: string;
  provenance: Record<string, unknown>;
  classification: string;
  verificationState: VerificationState;
  missionId?: string;
  agentId?: string;
  modelId?: string;
  skillId?: string;
}

export interface AtlasEvaluation extends KernelEntity {
  subjectType: string;
  subjectId: string;
  status: EligibilityStatus;
  testSuite: string;
  evidenceRefs: string[];
  failureReason?: string;
}

export interface AtlasPolicyDecision extends KernelEntity {
  subject: string;
  action: string;
  resource: string;
  decision: PolicyDecision;
  reasons: string[];
  obligations: string[];
  policyVersion: string;
}

export interface AtlasApproval extends KernelEntity {
  missionId: string;
  actionId?: string;
  requestedBy: string;
  requiredRole: string;
  requiredApprovals: number;
  currentApprovals: number;
  approvalStatus: ApprovalStatus;
  expiresAt?: string;
  decisionEvidence: string[];
}

export interface AtlasWorkflow extends KernelEntity {
  missionId: string;
  definitionVersion: string;
  state: string;
  checkpoint?: string;
  runId?: string;
}

export interface AtlasEvent<T = Record<string, unknown>> {
  id: string;
  version: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  status: KernelStatus;
  metadata: KernelMetadata;
  eventType: string;
  missionId?: string;
  traceId: string;
  actorId: string;
  payload: T;
}

export interface AtlasKnowledgeObject extends KernelEntity {
  objectType: string;
  sourceRefs: string[];
  properties: Record<string, unknown>;
}

export interface AtlasMemoryObject extends KernelEntity {
  memoryType: 'WORKING' | 'EPISODIC' | 'SEMANTIC' | 'INSTITUTIONAL';
  content: string;
  provenanceRefs: string[];
}

export interface AtlasDigitalTwin extends KernelEntity {
  twinType: string;
  observedAt: string;
  entityRefs: string[];
  evidenceRefs: string[];
}

export interface AtlasIdentity extends KernelEntity {
  principalId: string;
  roles: string[];
  permissions: string[];
  authenticationMethod: string;
}

export interface AtlasAuditRecord extends KernelEntity {
  action: string;
  actorId: string;
  resource: string;
  missionId?: string;
  traceId: string;
  outcome: 'SUCCESS' | 'DENIED' | 'FAILED';
  details: Record<string, unknown>;
}

export interface AtlasSimulation extends KernelEntity {
  missionId: string;
  baseline: Record<string, unknown>;
  scenario: Record<string, unknown>;
  assumptions: string[];
  inputs: Record<string, unknown>;
  model: string;
  outputs: Record<string, unknown>;
  uncertainty: Record<string, unknown>;
  evidenceRefs: string[];
  resultState: 'OBSERVED' | 'FORECAST' | 'SIMULATED' | 'ASSUMED';
}

export const MISSION_TRANSITIONS: Readonly<Record<MissionStatus, readonly MissionStatus[]>> = {
  DRAFT: ['PLANNED', 'CANCELLED', 'FAILED'],
  PLANNED: ['POLICY_REVIEW', 'BLOCKED', 'CANCELLED', 'FAILED'],
  POLICY_REVIEW: ['APPROVAL_REQUIRED', 'APPROVED', 'BLOCKED', 'FAILED'],
  APPROVAL_REQUIRED: ['APPROVED', 'CANCELLED', 'BLOCKED', 'FAILED'],
  APPROVED: ['EXECUTING', 'CANCELLED', 'FAILED'],
  EXECUTING: ['VERIFYING', 'FAILED', 'CANCELLED', 'BLOCKED'],
  VERIFYING: ['COMPLETED', 'FAILED', 'BLOCKED'],
  COMPLETED: [],
  FAILED: [],
  CANCELLED: [],
  BLOCKED: ['POLICY_REVIEW', 'CANCELLED', 'FAILED'],
};

export function assertMissionTransition(from: MissionStatus, to: MissionStatus): void {
  if (!MISSION_TRANSITIONS[from].includes(to)) {
    throw new Error(`MISSION_INVALID_TRANSITION:${from}->${to}`);
  }
}
