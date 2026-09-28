export interface EvaluationTableRow {
  id: string;
  bidderId: string;
  bidderName: string;
  requirement: string;
  evidenceDocId: string;
  evidenceDocName: string;
  evidenceDocSize: string;
  criterionId: string;
  criterionName: string;
  weightPercent: number;
  aiAnalysisPercent: number;
  humanScore: number;
  variancePercent: number;
  evaluatorId: string;
  evaluatorName: string;
  isCompliant: boolean;
  legalBasis: string;
  legalBasisStatus: 'VERIFIED PROVISION' | 'VERIFIED REGULATION' | 'GUIDELINE' | 'POLICY';
  auditEventId: string;
  extractedInfo: string[];
  evaluatorComment: string;
  evaluatorCommentDate: string;
  justification: string;
  aiMetrics: {
    confidence: number;
    requirementMatch: number;
    completeness: number;
    riskLevel: 'Low' | 'Medium' | 'High';
  };
}

export interface LifecycleStageItem {
  stageNumber: number;
  name: string;
  role: string;
  dateStr: string;
  docCount: number;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'BLOCKED';
}

export interface EvaluationAuditEvent {
  id: string;
  time: string;
  actor: string;
  action: string;
  bidder: string;
  evidence: string;
  criterion: string;
  legalBasis: string;
  status: 'COMPLIANT' | 'FLAGGED' | 'RESOLVED';
}

export interface ActiveTenderContext {
  id: string;
  refNumber: string;
  title: string;
  category: string;
  estimatedValue: string;
  currency: string;
  status: string;
  stage: string;
  committeeCode: string;
  evaluationId: string;
  procurementMethod: string;
  quorumStatus: string;
  submissionDeadline?: string;
}

export interface EvaluationDataState {
  loading: boolean;
  error: string | null;
  activeTender: ActiveTenderContext;
  rows: EvaluationTableRow[];
  stages: LifecycleStageItem[];
  auditEvents: EvaluationAuditEvent[];
  agents: Array<{ id: string; name: string; role: string; status: string; progress: number }>;
  findings: Array<{ id: string; severity: string; title: string; description: string; status: string }>;
}
