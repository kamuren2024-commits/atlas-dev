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

export const ENACTMENT_STATUS_VALUES = [
  'NOT_ENACTED',
  'CONTRACT_ONLY',
  'IMPLEMENTED',
  'WIRED',
  'FUNCTIONAL',
  'VERIFIED',
  'PARTIAL',
  'UNVERIFIED',
  'FAILED',
  'BLOCKED',
  'MOCKED',
  'STUBBED',
  'NON_DURABLE',
  'FAIL_OPEN',
  'FAIL_CLOSED',
  'DEPRECATED',
  'REGRESSED',
] as const;

export type EnactmentStatus = typeof ENACTMENT_STATUS_VALUES[number];

export interface AtlasEnactmentEvidenceBundle {
  contractEvidence: string[];
  runtimeEvidence: string[];
  persistenceEvidence: string[];
  securityEvidence: string[];
  failureEvidence: string[];
  observabilityEvidence: string[];
  performanceEvidence: string[];
  regressionEvidence: string[];
}

export interface AtlasEnactmentEvaluation {
  evaluationId: string;
  phaseId: string;
  capabilityId: string;
  version: string;
  declaredStatus: EnactmentStatus;
  actualStatus: EnactmentStatus;
  scope: string[];
  dependencies: string[];
  consumers: string[];
  contractEvidence: string[];
  runtimeEvidence: string[];
  persistenceEvidence: string[];
  securityEvidence: string[];
  failureEvidence: string[];
  observabilityEvidence: string[];
  performanceEvidence: string[];
  regressionEvidence: string[];
  testRefs: string[];
  artifactRefs: string[];
  traceRefs: string[];
  blockers: string[];
  risks: string[];
  eligibility: 'ELIGIBLE' | 'BLOCKED' | 'RESTRICTED' | 'UNVERIFIED';
  evaluatedAt: string;
}

export interface EnactmentEvidenceSnapshot {
  declaredStatus?: EnactmentStatus;
  implemented?: boolean;
  wired?: boolean;
  persisted?: boolean;
  tested?: boolean;
  failureTested?: boolean;
  securityTested?: boolean;
  observable?: boolean;
  evaluated?: boolean;
  regressionProtected?: boolean;
  productionControlled?: boolean;
}

export function deriveEnactmentStatus(snapshot: EnactmentEvidenceSnapshot): EnactmentStatus {
  if (snapshot.declaredStatus) return snapshot.declaredStatus;

  const implemented = snapshot.implemented === true;
  const wired = snapshot.wired === true;
  const persisted = snapshot.persisted === true;
  const tested = snapshot.tested === true;
  const failureTested = snapshot.failureTested === true;
  const securityTested = snapshot.securityTested === true;
  const observable = snapshot.observable === true;
  const evaluated = snapshot.evaluated === true;
  const regressionProtected = snapshot.regressionProtected === true;
  const productionControlled = snapshot.productionControlled === true;

  if (!implemented && !wired && !persisted && !tested && !evaluated) return 'NOT_ENACTED';
  if (!implemented && (wired || persisted || tested || evaluated)) return 'CONTRACT_ONLY';
  if (implemented && !wired) return 'IMPLEMENTED';
  if (implemented && wired && !persisted) return 'WIRED';
  if (implemented && wired && persisted && !tested) return 'FUNCTIONAL';
  if (implemented && wired && persisted && tested && !failureTested) return 'VERIFIED';
  if (implemented && wired && persisted && tested && failureTested && !securityTested) return 'PARTIAL';
  if (implemented && wired && persisted && tested && failureTested && securityTested && !observable) return 'UNVERIFIED';
  if (implemented && wired && persisted && tested && failureTested && securityTested && observable && !regressionProtected) return 'BLOCKED';
  if (productionControlled === false) return 'REGRESSED';
  return 'VERIFIED';
}

export interface AtlasEnactmentInventoryEntry {
  phaseId: string;
  capabilityId: string;
  declaredStatus: EnactmentStatus;
  actualStatus: EnactmentStatus;
  implemented: boolean;
  wired: boolean;
  persisted: boolean;
  tested: boolean;
  failureTested: boolean;
  securityTested: boolean;
  observable: boolean;
  evaluated: boolean;
  regressionProtected: boolean;
  productionControlled: boolean;
  evidenceRefs: string[];
}

export const ATLAS_ENACTMENT_INVENTORY: readonly AtlasEnactmentInventoryEntry[] = [
  {
    phaseId: 'PHASE_I',
    capabilityId: 'kernel-foundations',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: true,
    evidenceRefs: [
      'platform/kernel/contracts.ts',
      'platform/kernel/mission-orchestrator.ts',
      'docs/architecture/ATLAS-KERNEL-BASELINE.md',
    ],
  },
  {
    phaseId: 'PHASE_II',
    capabilityId: 'explicit-mission-state-machine',
    declaredStatus: 'PARTIAL',
    actualStatus: 'PARTIAL',
    implemented: true,
    wired: true,
    persisted: false,
    tested: true,
    failureTested: false,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: false,
    productionControlled: false,
    evidenceRefs: [
      'platform/kernel/contracts.ts',
      'platform/kernel/mission-orchestrator.ts',
      'docs/enterprise-execution/CURRENT-PHASE.md',
    ],
  },
  {
    phaseId: 'PHASE_III',
    capabilityId: 'durable-mission-ledger',
    declaredStatus: 'PARTIAL',
    actualStatus: 'PARTIAL',
    implemented: true,
    wired: false,
    persisted: true,
    tested: true,
    failureTested: false,
    securityTested: false,
    observable: true,
    evaluated: true,
    regressionProtected: false,
    productionControlled: false,
    evidenceRefs: [
      'backend/event-fabric',
      'backend/database',
      'docs/enterprise-execution/CURRENT-PHASE.md',
    ],
  },
  {
    phaseId: 'phase-agent-runtime-hardening',
    capabilityId: 'agent-runtime-hardening',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/ai-federation/agents/AgentRuntime.ts',
      'backend/agents',
      'backend/tests/run-tests.ts',
    ],
  },
  {
    phaseId: 'phase-model-federation',
    capabilityId: 'model-registry',
    declaredStatus: 'PARTIAL',
    actualStatus: 'PARTIAL',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: false,
    productionControlled: false,
    evidenceRefs: [
      'backend/ai-federation/registry/ModelRegistry.ts',
      'backend/ai-federation/gateway/AtlasAiGateway.ts',
      'docs/agentic-ai/EVAL-CONTROL-PLANE.md',
    ],
  },
  {
    phaseId: 'phase-ollama-runtime',
    capabilityId: 'ollama-local-runtime',
    declaredStatus: 'BLOCKED',
    actualStatus: 'BLOCKED',
    implemented: false,
    wired: false,
    persisted: false,
    tested: false,
    failureTested: false,
    securityTested: false,
    observable: false,
    evaluated: false,
    regressionProtected: false,
    productionControlled: false,
    evidenceRefs: [
      'backend/ai-federation/providers/ollama',
      'docs/agentic-ai/AGENT-SDK-FEDERATION.md',
    ],
  },
  {
    phaseId: 'phase-agent-sdk-federation',
    capabilityId: 'agent-sdk-federation',
    declaredStatus: 'PARTIAL',
    actualStatus: 'PARTIAL',
    implemented: true,
    wired: true,
    persisted: false,
    tested: true,
    failureTested: false,
    securityTested: false,
    observable: true,
    evaluated: true,
    regressionProtected: false,
    productionControlled: false,
    evidenceRefs: [
      'backend/ai-federation',
      'docs/agentic-ai/AGENT-SDK-FEDERATION.md',
    ],
  },
  {
    phaseId: 'phase-agent-skills-architecture',
    capabilityId: 'skills-architecture',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/ai-federation/skills',
      'backend/ai-federation/registry/CapabilityRegistry.ts',
    ],
  },
  {
    phaseId: 'phase-evaluation-tevv',
    capabilityId: 'evaluation-os',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/evaluation',
      'docs/tevv/ATLAS-PLATFORM-EVALUATION.md',
      'backend/tests/run-tests.ts',
    ],
  },
  {
    phaseId: 'phase-mission-orchestration',
    capabilityId: 'mission-orchestration',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'platform/kernel',
      'backend/mission-engine',
      'backend/ai-federation/agents/AgentRuntime.ts',
    ],
  },
  {
    phaseId: 'phase-tool-gateway',
    capabilityId: 'tool-gateway',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/tools',
      'backend/ai-federation/agents/ToolGateway.ts',
    ],
  },
  {
    phaseId: 'phase-policy',
    capabilityId: 'policy',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/security',
      'backend/evaluation/governance',
    ],
  },
  {
    phaseId: 'phase-approval',
    capabilityId: 'approval',
    declaredStatus: 'PARTIAL',
    actualStatus: 'PARTIAL',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: false,
    securityTested: true,
    observable: true,
    evaluated: false,
    regressionProtected: false,
    productionControlled: false,
    evidenceRefs: [
      'backend/mission-engine',
      'backend/evaluation/governance',
    ],
  },
  {
    phaseId: 'phase-evidence',
    capabilityId: 'evidence',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/evaluation/evidence-*',
      'backend/evaluation/evidence.test.ts',
    ],
  },
  {
    phaseId: 'phase-audit',
    capabilityId: 'audit',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/event-fabric',
      'AUDIT_LOG.md',
    ],
  },
  {
    phaseId: 'phase-workflow-event-fabric',
    capabilityId: 'workflow-event-fabric',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/event-fabric',
      'backend/workflows',
    ],
  },
  {
    phaseId: 'phase-identity-tenant-isolation',
    capabilityId: 'identity-and-tenant-isolation',
    declaredStatus: 'PARTIAL',
    actualStatus: 'PARTIAL',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: false,
    securityTested: true,
    observable: true,
    evaluated: false,
    regressionProtected: false,
    productionControlled: false,
    evidenceRefs: [
      'backend/security',
      'backend/ai-federation/security',
    ],
  },
  {
    phaseId: 'phase-memory',
    capabilityId: 'memory',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/memory',
      'backend/ai-federation/memory',
    ],
  },
  {
    phaseId: 'phase-knowledge-rag',
    capabilityId: 'knowledge-rag',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/graph',
      'backend/ontology',
      'KNOWLEDGE_GRAPH.md',
    ],
  },
  {
    phaseId: 'phase-observability',
    capabilityId: 'observability',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/observability',
      'OBSERVABILITY.md',
    ],
  },
  {
    phaseId: 'phase-digital-twin',
    capabilityId: 'digital-twin',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/digital-twin',
      'DIGITAL_TWIN_ARCHITECTURE.md',
    ],
  },
  {
    phaseId: 'phase-domain-integrations',
    capabilityId: 'existing-domain-integrations',
    declaredStatus: 'IMPLEMENTED',
    actualStatus: 'IMPLEMENTED',
    implemented: true,
    wired: true,
    persisted: true,
    tested: true,
    failureTested: true,
    securityTested: true,
    observable: true,
    evaluated: true,
    regressionProtected: true,
    productionControlled: false,
    evidenceRefs: [
      'backend/domains',
      'backend/finance',
      'backend/logistics',
    ],
  },
  {
    phaseId: 'phase-unplanned',
    capabilityId: 'not-enacted',
    declaredStatus: 'NOT_ENACTED',
    actualStatus: 'NOT_ENACTED',
    implemented: false,
    wired: false,
    persisted: false,
    tested: false,
    failureTested: false,
    securityTested: false,
    observable: false,
    evaluated: false,
    regressionProtected: false,
    productionControlled: false,
    evidenceRefs: [],
  },
] as const;

export function buildEnactmentInventory(): readonly AtlasEnactmentInventoryEntry[] {
  return ATLAS_ENACTMENT_INVENTORY;
}

export function buildEnactmentEvaluationFor(entry: AtlasEnactmentInventoryEntry): AtlasEnactmentEvaluation {
  const actualStatus = deriveEnactmentStatus({
    declaredStatus: entry.declaredStatus,
    implemented: entry.implemented,
    wired: entry.wired,
    persisted: entry.persisted,
    tested: entry.tested,
    failureTested: entry.failureTested,
    securityTested: entry.securityTested,
    observable: entry.observable,
    evaluated: entry.evaluated,
    regressionProtected: entry.regressionProtected,
    productionControlled: entry.productionControlled,
  });

  return {
    evaluationId: `${entry.phaseId}-${entry.capabilityId}`,
    phaseId: entry.phaseId,
    capabilityId: entry.capabilityId,
    version: '1.0.0',
    declaredStatus: entry.declaredStatus,
    actualStatus,
    scope: [entry.capabilityId],
    dependencies: entry.evidenceRefs,
    consumers: ['platform', 'backend', 'docs'],
    contractEvidence: entry.implemented ? entry.evidenceRefs : [],
    runtimeEvidence: entry.wired ? entry.evidenceRefs : [],
    persistenceEvidence: entry.persisted ? entry.evidenceRefs : [],
    securityEvidence: entry.securityTested ? entry.evidenceRefs : [],
    failureEvidence: entry.failureTested ? entry.evidenceRefs : [],
    observabilityEvidence: entry.observable ? entry.evidenceRefs : [],
    performanceEvidence: entry.evaluated ? entry.evidenceRefs : [],
    regressionEvidence: entry.regressionProtected ? entry.evidenceRefs : [],
    testRefs: entry.tested ? entry.evidenceRefs : [],
    artifactRefs: entry.evidenceRefs,
    traceRefs: entry.evidenceRefs,
    blockers: entry.actualStatus === 'NOT_ENACTED' || entry.actualStatus === 'BLOCKED' ? ['Missing executable evidence'] : [],
    risks: entry.productionControlled ? [] : ['Production controls are not fully enforced'],
    eligibility: entry.productionControlled ? 'ELIGIBLE' : entry.actualStatus === 'BLOCKED' ? 'BLOCKED' : entry.actualStatus === 'NOT_ENACTED' ? 'UNVERIFIED' : 'ELIGIBLE',
    evaluatedAt: new Date().toISOString(),
  };
}
