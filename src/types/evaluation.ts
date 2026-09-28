export type EvaluationStage = 
  | 'INTAKE' | 'CLASSIFICATION' | 'OCR' | 'METADATA' | 'LEGAL_VALIDATION' 
  | 'MANDATORY' | 'TECHNICAL' | 'FINANCIAL' | 'RISK_ASSESSMENT' 
  | 'CROSS_VALIDATION' | 'RECOMMENDATION' | 'OFFICER_APPROVAL' | 'POST_QUALIFICATION' | 'AWARD';

export type DocumentClassification = 
  | 'TENDER_DOCUMENT' | 'BID_SUBMISSION' | 'TAX_CERTIFICATE' | 'KRA_PIN' | 'CR12' 
  | 'BUSINESS_REGISTRATION' | 'MANUFACTURER_AUTHORIZATION' | 'AUDITED_ACCOUNTS' 
  | 'BANK_STATEMENT' | 'POWER_OF_ATTORNEY' | 'PROFESSIONAL_LICENSE' 
  | 'TECHNICAL_PROPOSAL' | 'FINANCIAL_PROPOSAL' | 'CONFIDENTIAL' | 'OTHER';

export interface EvidenceAnchor {
  documentId: string;
  page?: number;
  paragraph?: string;
  section?: string;
  tableId?: string;
  imageHash?: string;
  legalReference?: string;
}

export interface ProcurementRule {
  id: string;
  legalSource: string; // e.g., "PPADA 2015"
  section: string;      // e.g., "Section 71"
  description: string;
  severity: 'MANDATORY' | 'HIGH' | 'MEDIUM' | 'LOW';
  agentOwnerId: string;
  evidenceRequirements: string[];
  effectiveDate: string;
  version: string;
}

export interface EvaluationFinding {
  id: string;
  ruleId: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'INCONCLUSIVE' | 'OVERRIDDEN';
  confidence: number;
  evidence: EvidenceAnchor[];
  officerNotes?: string;
  officerSignature?: string;
  timestamp: string;
  reasoningChain: string[];
}

export interface AgentStatus {
  id: string;
  name: string;
  status: 'IDLE' | 'RUNNING' | 'WAITING' | 'COMPLETED' | 'ERROR' | 'MAINTENANCE';
  currentTask?: string;
  progress: number; // 0-100
  lastOutput?: string;
  confidence?: number;
  riskScore?: number;
  evidenceAnchor?: EvidenceAnchor;
  startTime?: string;
  durationMs?: number;
  version: string;
  owner: string;
  legalAuthority: string;
  dependencies: string[];
  health: number; // 0-1
}

export interface EvaluationPipelineStage {
  id: EvaluationStage;
  name: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  progress: number;
  timestamp?: string;
  output?: any;
}

export interface RiskProfile {
  legal: number;
  financial: number;
  technical: number;
  operational: number;
  integrity: number;
  supplier: number;
  compliance: number;
  fraud: number;
}

export interface ScorecardRequirement {
  id: string;
  label: string;
  weight: number;
  score: number;
  confidence: number;
  evidence: EvidenceAnchor[];
  legalReference: string;
  risk: number;
  agentId: string;
  officerDecision?: 'APPROVED' | 'REJECTED' | 'NOTES';
}

export interface ConsensusResult {
  verdict: 'PASSED' | 'FAILED' | 'REVIEW_REQUIRED';
  overallConfidence: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  minorityOpinions: string[];
  conflictingFindings: string[];
  consensusScore: number;
}

export interface ProcurementEvent {
  id: string;
  title: string;
  type: 'DOCUMENT_UPLOAD' | 'AGENT_COMPLETION' | 'OFFICER_ACTION' | 'MILESTONE';
  timestamp: string;
  description: string;
  metadata?: any;
}

export interface ManagedDocument {
  id: string;
  name: string;
  hash: string;
  size: number;
  type: string;
  classification: DocumentClassification;
  confidence: number;
  uploader: string;
  timestamp: string;
  version: number;
  stage: EvaluationStage;
  riskScore: number;
  metadata: Record<string, any>;
  path: string;
}

export interface GraphNode {
  id: string;
  type: 'PERSON' | 'ORGANIZATION' | 'EMPLOYEE' | 'SUPPLIER' | 'DIRECTOR' | 'TENDER' | 'BID' | 'EVALUATION' | 'LOT' | 'CONTRACT' | 'PROJECT' | 'PROGRAM' | 'ASSET' | 'SUBSTATION' | 'TRANSFORMER' | 'TRANSMISSION_LINE' | 'TOWER' | 'SHIPMENT' | 'CONTAINER' | 'WAREHOUSE' | 'INVENTORY_ITEM' | 'INVOICE' | 'PAYMENT' | 'RISK' | 'INCIDENT' | 'DOCUMENT' | 'LOCATION' | 'COUNTY' | 'PARCEL' | 'WAYLEAVE' | 'COMMUNITY' | 'REGULATION' | 'POLICY' | 'CONTROL' | 'WORKFLOW' | 'TASK' | 'MISSION' | 'DECISION' | 'AGENT' | 'AI_MODEL' | 'RULE' | 'EVIDENCE' | 'OFFICER' | 'ENTITY';
  label: string;
  properties: Record<string, any>;
}

export type GraphFactStatus = 'VERIFIED' | 'SYSTEM_DERIVED' | 'AI_INFERRED' | 'USER_DECLARED' | 'UNVERIFIED';
export type GraphRelationshipClass = 'DIRECT' | 'INDIRECT' | 'INFERRED' | 'POTENTIAL';

export interface GraphProvenance {
  source: string;
  sourceRecordId?: string;
  observedAt: string;
  createdBy?: string;
  verificationStatus: GraphFactStatus;
  confidence?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string; // e.g., "DIRECTOR_OF", "SUBMITTED_BID", "EVALUATED_BY"
  properties: Record<string, any>;
  confidence: number;
  provenance?: GraphProvenance;
  relationshipClass?: GraphRelationshipClass;
}

export interface DigitalTwin {
  id: string;
  type: 'SUPPLIER' | 'TENDER' | 'ORGANIZATION';
  nodes: GraphNode[];
  edges: GraphEdge[];
  lastUpdated: string;
  riskScore: number;
  complianceStatus: string;
}

export interface ProcurementHistory {
  id: string;
  entityId: string;
  version: number;
  timestamp: string;
  changes: any;
  officerSignature: string;
}

export interface DecisionRecommendation {
  id: string;
  evaluationId: string;
  decision: 'AWARD' | 'REJECT' | 'CLARIFY' | 'FLAG_FOR_AUDIT';
  confidence: number;
  evidence: string[];
  applicableLaws: string[];
  riskAssessment: {
    score: number;
    findings: string[];
  };
  alternatives: string[];
  outcomes: string[];
  status: 'DRAFT' | 'OFFICER_REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface PredictiveInsight {
  type: 'DELAY' | 'COST_ESCALATION' | 'PERFORMANCE' | 'COMPLIANCE' | 'FRAUD';
  probability: number;
  impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  expectedValue: any;
  evidence: string[];
  historicalBasis: string;
}

export interface ProcurementCase {
  id: string;
  type: 'COMPLIANCE' | 'FRAUD' | 'APPEAL' | 'CLARIFICATION' | 'DISPUTE' | 'AUDIT';
  title: string;
  description: string;
  status: 'OPEN' | 'IN_INVESTIGATION' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedOfficer: string;
  timeline: { timestamp: string; event: string; officer: string }[];
  evidence: string[];
  linkedEntities: string[]; // IDs of suppliers, tenders, etc.
}

export interface OfficerComment {
  id: string;
  parentId?: string;
  author: string;
  content: string;
  timestamp: string;
  mentions: string[];
  attachments: string[];
}

export interface AuditEntry {
  id: string;
  userId: string;
  timestamp: string;
  action: string;
  reason: string;
  previousValue?: any;
  newValue?: any;
  ruleId?: string;
  evidenceId?: string;
  officerSignature?: string;
}
