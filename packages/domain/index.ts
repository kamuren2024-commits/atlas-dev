export const GRID_PLATFORM_FOUNDATION = {
  name: 'KETRACO Grid Intelligence Platform',
  phase: 'PHASE_0_FOUNDATION',
  status: 'ACTIVE',
  version: '0.1.0',
  enterpriseOwner: 'KETRACO Grid Operations'
} as const;

export const GRID_MISSION_STATE_SEQUENCE = [
  'MISSION_CREATED',
  'DRONE_DATA_RECEIVED',
  'MEDIA_VALIDATED',
  'MEDIA_NORMALIZED',
  'TELEMETRY_EXTRACTED',
  'ASSET_MATCHED',
  'FRAME_EXTRACTION',
  'OBJECT_DETECTION',
  'DEFECT_DETECTION',
  'TEMPORAL_TRACKING',
  'SPATIAL_CORRELATION',
  'CONDITION_ASSESSMENT',
  'DEGRADATION_ANALYSIS',
  'RISK_ANALYSIS',
  'ENGINEERING_REVIEW',
  'ACTION_RECOMMENDED',
  'APPROVAL_REQUIRED',
  'WORKFLOW_DISPATCHED',
  'FIELD_ACTION',
  'VERIFICATION',
  'CLOSED'
] as const;

export type MissionState = (typeof GRID_MISSION_STATE_SEQUENCE)[number];

export type AssetKind =
  | 'GRID'
  | 'REGION'
  | 'CORRIDOR'
  | 'LINE'
  | 'SUBSTATION'
  | 'BAY'
  | 'TOWER'
  | 'TOWER_COMPONENT'
  | 'CONDUCTOR'
  | 'INSULATOR'
  | 'HARDWARE'
  | 'PROTECTION_ASSET'
  | 'TRANSFORMER'
  | 'BREAKER'
  | 'DISCONNECTOR'
  | 'TELEMETRY_POINT'
  | 'DRONE'
  | 'MISSION'
  | 'INSPECTION'
  | 'IMAGE'
  | 'VIDEO'
  | 'FRAME'
  | 'DEFECT'
  | 'CONDITION'
  | 'RISK'
  | 'WORK_ORDER'
  | 'MAINTENANCE_EVENT'
  | 'ENGINEER'
  | 'TEAM'
  | 'CONTRACTOR'
  | 'LOCATION'
  | 'WEATHER_EVENT'
  | 'OUTAGE'
  | 'INCIDENT'
  | 'DOCUMENT'
  | 'STANDARD';

export type SeverityLevel = 'MONITOR' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RiskLevel = 'MONITOR' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ConfidenceBand = 'HIGH' | 'STRONG' | 'REVIEW' | 'UNCERTAIN';
export type HumanReviewState = 'NOT_REQUIRED' | 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
export type HealthState = 'HEALTHY' | 'DEGRADED' | 'PARTIAL' | 'FAILED' | 'UNKNOWN';
export type UserRole =
  | 'ADMIN'
  | 'ASSET_MANAGER'
  | 'MAINTENANCE_ENGINEER'
  | 'FIELD_ENGINEER'
  | 'CONTROL_ROOM'
  | 'EXECUTIVE'
  | 'SCM_OFFICER'
  | 'SAFETY_OFFICER'
  | 'ENGINEER'
  | 'AUDITOR'
  | 'FINANCE_VIEWER'
  | 'FINANCE_ANALYST'
  | 'FINANCE_OFFICER'
  | 'FINANCE_MANAGER'
  | 'FINANCE_DIRECTOR'
  | 'FINANCE_ADMIN';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  altitudeM?: number;
  corridor?: string;
}

export interface TelemetrySnapshot {
  gps: GeoLocation;
  altitudeM: number;
  headingDeg: number;
  pitchDeg: number;
  rollDeg: number;
  yawDeg: number;
  droneId?: string;
  cameraId?: string;
  captureTimestamp: string;
}

export interface Mission {
  id: string;
  name: string;
  status: MissionState;
  createdAt: string;
  owner: string;
  droneId?: string;
  route?: string;
  tenantId: string;
}

export interface Asset {
  id: string;
  kind: AssetKind;
  name: string;
  location: GeoLocation;
  criticality: SeverityLevel;
  status: 'ACTIVE' | 'MONITOR' | 'RETIRED';
  owner?: string;
  tenantId: string;
  tags: string[];
}

export type MediaType = 'IMAGE' | 'VIDEO' | 'IMAGE_SEQUENCE';
export type MediaProcessingStatus = 'RECEIVED' | 'VALIDATED' | 'NORMALIZED' | 'REJECTED' | 'RESUMABLE';
export type QualityIssueCode =
  | 'CORRUPT_MEDIA'
  | 'INSUFFICIENT_RESOLUTION'
  | 'MOTION_BLUR'
  | 'SEVERE_GLARE'
  | 'POOR_ILLUMINATION'
  | 'OBSTRUCTION'
  | 'EXCESSIVE_COMPRESSION'
  | 'MISSING_TELEMETRY'
  | 'DUPLICATE_FRAME'
  | 'UNUSABLE_VIEWING_ANGLE';

export interface CameraMetadata {
  cameraId?: string;
  make?: string;
  model?: string;
  lens?: string;
  resolution?: string;
  focalLengthMm?: number;
  headingDeg?: number;
  pitchDeg?: number;
  rollDeg?: number;
}

export interface MissionMetadata {
  route?: string;
  operatorId?: string;
  operatorName?: string;
  droneId?: string;
  inspectionRoute?: string;
  weather?: string;
  remarks?: string;
}

export interface QualityGateResult {
  qualityScore: number;
  status: 'PASS' | 'REVIEW' | 'REJECT';
  issues: QualityIssueCode[];
  warnings: string[];
}

export interface ResumableUploadSession {
  sessionId: string;
  missionId: string;
  mediaId?: string;
  mediaType: MediaType;
  totalBytes: number;
  receivedBytes: number;
  chunkCount: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'FAILED';
  updatedAt: string;
}

export interface MediaIngestionRequest {
  sessionId?: string;
  missionId: string;
  inspectionId?: string;
  mediaId?: string;
  mediaType: MediaType;
  fileName?: string;
  mimeType?: string;
  sizeBytes?: number;
  fileHash?: string;
  captureTimestamp: string;
  location?: GeoLocation;
  telemetry?: Partial<TelemetrySnapshot>;
  camera?: CameraMetadata;
  metadata?: MissionMetadata;
  content?: string;
  frameIndex?: number;
  isDuplicateFrame?: boolean;
  resolution?: { width?: number; height?: number; };
  imageMetrics?: {
    blurScore?: number;
    glareScore?: number;
    illuminationScore?: number;
    compressionRatio?: number;
    viewingAngleDeg?: number;
  };
}

export interface MediaIngestionResult {
  mediaId: string;
  missionId: string;
  inspectionId?: string;
  mediaType: MediaType;
  fileName?: string;
  sourceHash: string;
  captureTimestamp: string;
  location?: GeoLocation;
  telemetry?: Partial<TelemetrySnapshot>;
  camera?: CameraMetadata;
  qualityScore: number;
  processingStatus: MediaProcessingStatus;
  chainOfCustody: string;
  qualityIssues: QualityIssueCode[];
  qualityWarnings: string[];
  uploadSession?: ResumableUploadSession;
}

export interface EvidenceArtifact {
  id: string;
  missionId: string;
  inspectionId: string;
  mediaId: string;
  sourceHash: string;
  captureTimestamp: string;
  location: GeoLocation;
  telemetry: TelemetrySnapshot;
  qualityScore: number;
  processingStatus: 'RECEIVED' | 'VALIDATED' | 'NORMALIZED' | 'REJECTED';
  chainOfCustody: string;
}

export interface DefectObservation {
  id: string;
  assetId: string;
  componentId?: string;
  inspectionId: string;
  mediaId: string;
  defectType: string;
  severity: SeverityLevel;
  confidence: number;
  location: GeoLocation;
  evidence: string[];
  firstObserved: string;
  previousObserved?: string;
  progression: 'NEW' | 'PERSISTENT' | 'WORSENING' | 'REPAIRED' | 'RECURRING';
  estimatedDegradation: number;
  recommendedAction: string;
  engineeringStatus: 'UNREVIEWED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';
  reviewStatus: HumanReviewState;
}

export interface ConditionAssessment {
  assetId: string;
  assessedAt: string;
  score: number;
  primaryDrivers: Array<{ label: string; delta: number; remark: string }>;
  structural: number;
  electrical: number;
  mechanical: number;
  environmental: number;
  vegetation: number;
  corrosion: number;
  historicalDegradation: number;
}

export interface RiskAssessment {
  assetId: string;
  level: RiskLevel;
  explanation: string[];
  probabilityOfFailure: number;
  consequenceOfFailure: number;
  exposure: number;
  degradationRate: number;
  calculatedAt: string;
}

export interface WorkflowState {
  id: string;
  targetAssetId: string;
  currentStage: MissionState;
  owner: string;
  dueAt?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'APPROVED' | 'COMPLETED' | 'ESCALATED';
  slaHours: number;
}

export interface FieldVerificationRecord {
  id: string;
  assetId: string;
  workOrderId: string;
  defectType: string;
  status: 'PASS' | 'FAIL' | 'MONITOR' | 'ESCALATED';
  evidenceQualityScore: number;
  fieldConditionScore: number;
  confidence: number;
  requiredFollowUp: boolean;
  closureRecommendation: 'CLOSE' | 'MONITOR' | 'ESCALATE';
  recordedAt: string;
}

export interface WorkOrderClosureRecord {
  workOrderId: string;
  assetId: string;
  defectType: string;
  status: 'CLOSED' | 'MONITOR' | 'ESCALATED';
  resolutionSummary: string;
  evidenceSummary: string[];
  humanApprovalRequired: boolean;
  closedAt: string;
}

export interface AssetHistorySnapshot {
  assetId: string;
  defectType: string;
  lastInspectionAt: string;
  lastRepairAt?: string;
  degradationTrend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  issueCount: number;
  maintenanceEvents: number;
  reliabilityScore: number;
  recommendation: string;
}

export interface HistoricalLearningInsight {
  id: string;
  assetId: string;
  defectType: string;
  trend: 'IMPROVING' | 'STABLE' | 'WORSENING';
  confidence: number;
  evidenceSummary: string[];
  recommendation: string;
  generatedAt: string;
}

export interface ExecutivePortfolioBrief {
  portfolioId: string;
  reportingWindow: string;
  networkHealthScore: number;
  riskExposureScore: number;
  priorityAssets: string[];
  criticalActions: string[];
  recommendedBoardActions: string[];
  generatedAt: string;
}

export interface StrategicPortfolioPlan {
  planId: string;
  portfolioId: string;
  investmentPriority: 'LOW' | 'MEDIUM' | 'HIGH';
  maintenanceRegime: 'ROUTINE' | 'ENHANCED' | 'CRITICAL';
  budgetRecommendation: number;
  priorityProjects: string[];
  mitigationActions: string[];
  generatedAt: string;
}

export interface AuditEvent {
  id: string;
  actor: string;
  action: string;
  source: string;
  timestamp: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  approval?: string;
  model?: string;
  evidence?: string[];
}

export interface GridPlatformUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  tenantId: string;
  accessLevel: string;
  clearance: string;
}

export const GRID_DEFAULT_AUDIT_EVENT: AuditEvent = {
  id: 'audit-default',
  actor: 'system',
  action: 'platform_initialized',
  source: 'phase0-foundation',
  timestamp: new Date().toISOString(),
  approval: 'system-bootstrap'
};

export const GRID_ASSET_KINDS: AssetKind[] = [
  'GRID', 'REGION', 'CORRIDOR', 'LINE', 'SUBSTATION', 'BAY', 'TOWER', 'TOWER_COMPONENT',
  'CONDUCTOR', 'INSULATOR', 'HARDWARE', 'PROTECTION_ASSET', 'TRANSFORMER', 'BREAKER', 'DISCONNECTOR',
  'TELEMETRY_POINT', 'DRONE', 'MISSION', 'INSPECTION', 'IMAGE', 'VIDEO', 'FRAME', 'DEFECT',
  'CONDITION', 'RISK', 'WORK_ORDER', 'MAINTENANCE_EVENT', 'ENGINEER', 'TEAM', 'CONTRACTOR',
  'LOCATION', 'WEATHER_EVENT', 'OUTAGE', 'INCIDENT', 'DOCUMENT', 'STANDARD'
];

// ============================================================================
// FINANCE DOMAIN (Phase 01-01 — Finance Entity Types)
// ============================================================================
//
// Finance Bounded Context — embedded as a sibling to the Grid/GIS domain
// to preserve the single monolithic package layout without introducing a
// competing ontology.  Extends KETRACO Enterprise Ontology per Directive §3.
//
// Every canonical finance entity supports the source-tracking field set
//   id, externalId, sourceSystem, sourceRecordId, status,
//   createdAt, updatedAt, version
// plus effectiveDate, organizationId, ownerId, provenanceId where applicable
// (Directive §4 "Every entity requiring source tracking must support...").
// ============================================================================

export const FINANCE_PLATFORM_FOUNDATION = {
  name: 'KETRACO Finance Intelligence OS',
  phase: 'PHASE_01_FINANCE_DATA_FABRIC',
  status: 'ACTIVE',
  version: '0.1.0',
  enterpriseOwner: 'KETRACO Finance — Office of the CFO'
} as const;

// --- Finance Roles + Permissions (§01-18) -----------------------------------
// Mirrors the AssetKind / FINANCE_SOURCE_TYPES deterministic-array pattern so
// consumers can enumerate roles and permission actions without duplicating them.

export const FinanceUserRoles = [
  'FINANCE_VIEWER',
  'FINANCE_ANALYST',
  'FINANCE_OFFICER',
  'FINANCE_MANAGER',
  'FINANCE_DIRECTOR',
  'FINANCE_ADMIN',
  'AUDITOR',
  'EXECUTIVE'
] as const;

export type FinanceUserRole = (typeof FinanceUserRoles)[number];

export const FinancePermissionActions = [
  'view',
  'create',
  'update',
  'ingest',
  'export',
  'configure_source',
  'approve',
  'execute_financial_action'
] as const;

export type FinancePermissionAction = (typeof FinancePermissionActions)[number];

// --- Finance Enumerations ---------------------------------------------------

export type FinanceSourceType =
  | 'ERP'
  | 'SAP_S4HANA'
  | 'SAP_ARIBA'
  | 'EXCEL'
  | 'CSV'
  | 'DATABASE'
  | 'API'
  | 'BANK'
  | 'PROJECT_SYSTEM'
  | 'PROCUREMENT_SYSTEM'
  | 'ASSET_SYSTEM'
  | 'DOCUMENT_SYSTEM'
  | 'MANUAL_ENTRY'
  | 'OTHER';

export const FINANCE_SOURCE_TYPES: FinanceSourceType[] = [
  'ERP','SAP_S4HANA','SAP_ARIBA','EXCEL','CSV','DATABASE','API','BANK',
  'PROJECT_SYSTEM','PROCUREMENT_SYSTEM','ASSET_SYSTEM','DOCUMENT_SYSTEM',
  'MANUAL_ENTRY','OTHER'
];

export type FinanceConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'DEGRADED'
  | 'AUTH_FAILED'
  | 'ERROR'
  | 'DISABLED';

export type FinanceBatchStatus =
  | 'CREATED'
  | 'INGESTING'
  | 'VALIDATING'
  | 'NORMALIZING'
  | 'RESOLVING'
  | 'MAPPING'
  | 'PERSISTING'
  | 'SYNCING_GRAPH'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED'
  | 'QUARANTINED'
  | 'CANCELLED';

export type FinanceRecordStatus =
  | 'RAW'
  | 'VALIDATED'
  | 'WARNING'
  | 'NORMALIZED'
  | 'REJECTED'
  | 'QUARANTINED'
  | 'RESOLVED'
  | 'UNRESOLVED'
  | 'MAPPED'
  | 'PERSISTED'
  | 'SYNCED'
  | 'ARCHIVED';

export type FinanceValidationSeverity =
  | 'VALID'
  | 'WARNING'
  | 'INVALID';

export type FinanceAccountClass =
  | 'ASSET'
  | 'LIABILITY'
  | 'EQUITY'
  | 'REVENUE'
  | 'EXPENSE'
  | 'CONTRA_ASSET'
  | 'CONTRA_LIABILITY';

export type FinanceBudgetStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'AMENDED'
  | 'EXPIRED'
  | 'ARCHIVED'
  | 'REJECTED'
  | 'CANCELLED';

export type FinanceCommitmentStatus =
  | 'PRE_COMMITMENT'
  | 'DRAFT'
  | 'FIRM'
  | 'OBLIGATED'
  | 'PARTIALLY_INVOICED'
  | 'FULLY_INVOICED'
  | 'PARTIALLY_PAID'
  | 'SETTLED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'DISPUTED';

export type FinanceInvoiceStatus =
  | 'RECEIVED'
  | 'VALIDATED'
  | 'MATCHED'
  | 'EXCEPTION'
  | 'APPROVED_FOR_PAYMENT'
  | 'POSTED'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'CREDITED'
  | 'CANCELLED'
  | 'DISPUTED';

export type FinancePaymentStatus =
  | 'PROPOSED'
  | 'SUBMITTED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'IN_TRANSIT'
  | 'RELEASED'
  | 'CLEARED'
  | 'RECONCILED'
  | 'FAILED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'REVERSED';

export type FinanceJournalStatus =
  | 'DRAFT'
  | 'POSTING'
  | 'POSTED'
  | 'REVERSED'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ARCHIVED';

export type FinanceExpenditureClass =
  | 'CAPEX'
  | 'OPEX';

export type FinanceRiskLevel =
  | 'MONITOR'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type FinanceDataAvailability =
  | 'REAL'
  | 'DEVELOPMENT_FIXTURE'
  | 'STALE'
  | 'PARTIAL'
  | 'UNAVAILABLE';

// --- Finance Entity Kind (parallel to AssetKind) ----------------------------

export type FinanceEntityKind =
  | 'FINANCIAL_PERIOD'
  | 'ACCOUNT'
  | 'CHART_OF_ACCOUNTS'
  | 'COST_CENTRE'
  | 'PROFIT_CENTRE'
  | 'DEPARTMENT'
  | 'BUDGET'
  | 'BUDGET_LINE'
  | 'BUDGET_REVISION'
  | 'BUDGET_ALLOCATION'
  | 'COMMITMENT'
  | 'ENCUMBRANCE'
  | 'INVOICE'
  | 'PAYMENT'
  | 'RECEIPT'
  | 'JOURNAL'
  | 'JOURNAL_ENTRY'
  | 'EXPENSE'
  | 'REVENUE'
  | 'FUNDING'
  | 'GRANT'
  | 'LOAN'
  | 'LIABILITY'
  | 'RECEIVABLE'
  | 'PAYABLE'
  | 'CASH_ACCOUNT'
  | 'BANK_TRANSACTION'
  | 'ASSET_VALUE'
  | 'DEPRECIATION'
  | 'CAPEX'
  | 'OPEX'
  | 'PROJECT_FINANCE'
  | 'PROJECT_COST'
  | 'COST_TO_COMPLETE'
  | 'FINANCIAL_RISK'
  | 'FINANCIAL_METRIC'
  | 'FINANCIAL_FORECAST'
  | 'FINANCIAL_DECISION'
  | 'FINANCIAL_REPORT';

export const FINANCE_ENTITY_KINDS: FinanceEntityKind[] = [
  'FINANCIAL_PERIOD','ACCOUNT','CHART_OF_ACCOUNTS','COST_CENTRE','PROFIT_CENTRE',
  'DEPARTMENT','BUDGET','BUDGET_LINE','BUDGET_REVISION','BUDGET_ALLOCATION',
  'COMMITMENT','ENCUMBRANCE','INVOICE','PAYMENT','RECEIPT','JOURNAL','JOURNAL_ENTRY',
  'EXPENSE','REVENUE','FUNDING','GRANT','LOAN','LIABILITY','RECEIVABLE','PAYABLE',
  'CASH_ACCOUNT','BANK_TRANSACTION','ASSET_VALUE','DEPRECIATION','CAPEX','OPEX',
  'PROJECT_FINANCE','PROJECT_COST','COST_TO_COMPLETE','FINANCIAL_RISK',
  'FINANCIAL_METRIC','FINANCIAL_FORECAST','FINANCIAL_DECISION','FINANCIAL_REPORT'
];

// --- Canonical source-tracked base fields -----------------------------------

export interface FinanceTrackedEntity {
  id: string;
  externalId?: string;
  sourceSystem?: FinanceSourceType;
  sourceRecordId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  effectiveDate?: string;
  organizationId?: string;
  ownerId?: string;
  provenanceId?: string;
  tenantId?: string;
  // Per Rule 23: fixtures explicitly marked so PROD_MODE filter can exclude.
  isFixture?: boolean;
  environment?: 'development' | 'staging' | 'production';
}

// --- Core Finance structural entities ---------------------------------------

export interface FinancialPeriod extends FinanceTrackedEntity {
  kind: 'FINANCIAL_PERIOD';
  fiscalYearId: string;
  periodNumber: number;
  startDate: string;
  endDate: string;
  isAdjustmentPeriod?: boolean;
  closeStatus?: 'OPEN' | 'SOFT_CLOSE' | 'HARD_CLOSED' | 'REOPENED';
  closedAt?: string;
  closedBy?: string;
}

export interface Account extends FinanceTrackedEntity {
  kind: 'ACCOUNT';
  code: string;
  name: string;
  accountClass: FinanceAccountClass;
  chartOfAccountsId: string;
  parentAccountId?: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  isCashflowRelevant?: boolean;
  isCapex?: boolean;
  isOpex?: boolean;
  description?: string;
  currency: string;
}

export interface ChartOfAccounts extends FinanceTrackedEntity {
  kind: 'CHART_OF_ACCOUNTS';
  code: string;
  name: string;
  jurisdiction?: string;
  currency: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface CostCentre extends FinanceTrackedEntity {
  kind: 'COST_CENTRE';
  code: string;
  name: string;
  departmentId?: string;
  managerId?: string;
  parentCostCentreId?: string;
  currency: string;
}

export interface ProfitCentre extends FinanceTrackedEntity {
  kind: 'PROFIT_CENTRE';
  code: string;
  name: string;
  departmentId?: string;
  managerId?: string;
  currency: string;
}

export interface Department extends FinanceTrackedEntity {
  kind: 'DEPARTMENT';
  code: string;
  name: string;
  headOfDepartmentId?: string;
  parentDepartmentId?: string;
  organizationId: string;
}

// --- Budgeting entities -----------------------------------------------------

export interface Budget extends FinanceTrackedEntity {
  kind: 'BUDGET';
  code: string;
  name: string;
  budgetStatus: FinanceBudgetStatus;
  fiscalYearId: string;
  departmentId?: string;
  costCentreId?: string;
  projectId?: string;
  profitCentreId?: string;
  currency: string;
  totalAmount: number;
  approvedAmount?: number;
  revisedAmount?: number;
  budgetClass?: FinanceExpenditureClass;
  fundingSourceId?: string;
  approvedBy?: string;
  approvedAt?: string;
  description?: string;
}

export interface BudgetLine extends FinanceTrackedEntity {
  kind: 'BUDGET_LINE';
  budgetId: string;
  lineNumber: number;
  accountId: string;
  costCentreId?: string;
  projectId?: string;
  departmentId?: string;
  financialPeriodId?: string;
  amount: number;
  expenditureClass?: FinanceExpenditureClass;
  description?: string;
  currency: string;
}

export interface BudgetRevision extends FinanceTrackedEntity {
  kind: 'BUDGET_REVISION';
  budgetId: string;
  revisionNumber: number;
  previousRevisionId?: string;
  justification: string;
  deltaAmount: number;
  newTotalAmount: number;
  revisionStatus: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'APPLIED';
  approverId?: string;
  approvedAt?: string;
  workflowId?: string;
}

export interface BudgetAllocation extends FinanceTrackedEntity {
  kind: 'BUDGET_ALLOCATION';
  budgetId?: string;
  budgetLineId?: string;
  projectId?: string;
  commitmentId?: string;
  fundingId?: string;
  amount: number;
  allocationDate: string;
  currency: string;
  allocationBasis?: string;
  narrative?: string;
}

// --- Procurement chain entities ---------------------------------------------

export interface Commitment extends FinanceTrackedEntity {
  kind: 'COMMITMENT';
  commitmentStatus: FinanceCommitmentStatus;
  commitmentNumber?: string;
  budgetLineId?: string;
  budgetId?: string;
  projectId?: string;
  purchaseOrderId?: string;
  contractId?: string;
  supplierId?: string;
  originalAmount: number;
  variationAmount?: number;
  currentAmount: number;
  invoicedAmount?: number;
  paidAmount?: number;
  currency: string;
  committedDate: string;
  description?: string;
  encumbranceId?: string;
  // Rule 9: idempotency key (sourceSystem + sourceRecordId + version)
  idempotencyKey?: string;
}

export interface Encumbrance extends FinanceTrackedEntity {
  kind: 'ENCUMBRANCE';
  commitmentId: string;
  budgetLineId: string;
  amount: number;
  currency: string;
  encumberedAt: string;
  releasedAt?: string;
  encumbranceStatus: 'ACTIVE' | 'RELEASED' | 'PARTIALLY_RELEASED';
}

export interface Invoice extends FinanceTrackedEntity {
  kind: 'INVOICE';
  invoiceNumber: string;
  supplierId?: string;
  purchaseOrderId?: string;
  commitmentId?: string;
  contractId?: string;
  budgetLineId?: string;
  invoiceDate: string;
  dueDate?: string;
  taxAmount?: number;
  discountAmount?: number;
  grossAmount: number;
  netAmount: number;
  paidAmount?: number;
  outstandingAmount?: number;
  currency: string;
  invoiceStatus: FinanceInvoiceStatus;
  paymentTermsDays?: number;
  threeWayMatched?: boolean;
  matchedBy?: string;
  approvedForPaymentAt?: string;
  approverId?: string;
  idempotencyKey?: string;
}

export interface Payment extends FinanceTrackedEntity {
  kind: 'PAYMENT';
  paymentNumber?: string;
  paymentStatus: FinancePaymentStatus;
  payerId?: string;
  payeeSupplierId?: string;
  payeeBankAccountId?: string;
  cashAccountId?: string;
  currency: string;
  amount: number;
  paymentDate: string;
  valueDate?: string;
  method?: 'EFT' | 'CHEQUE' | 'CASH' | 'CARD' | 'OTHER';
  reference?: string;
  bankTransactionId?: string;
  releasedBy?: string;
  releasedAt?: string;
  reconciledAt?: string;
  idempotencyKey?: string;
}

export interface Receipt extends FinanceTrackedEntity {
  kind: 'RECEIPT';
  receiptNumber?: string;
  payerId?: string;
  receivableId?: string;
  cashAccountId?: string;
  currency: string;
  amount: number;
  receiptDate: string;
  valueDate?: string;
  method?: 'EFT' | 'CHEQUE' | 'CASH' | 'CARD' | 'OTHER';
  reference?: string;
  bankTransactionId?: string;
  reconciledAt?: string;
}

// --- Accounting entities ----------------------------------------------------

export interface Journal extends FinanceTrackedEntity {
  kind: 'JOURNAL';
  journalNumber?: string;
  journalType: 'MANUAL' | 'AUTO_INVOICE' | 'AUTO_PAYMENT' | 'AUTO_RECEIPT'
                | 'ACCRUAL' | 'REVALUATION' | 'CLOSE' | 'REVERSAL' | 'OTHER';
  journalStatus: FinanceJournalStatus;
  financialPeriodId: string;
  currency: string;
  postingDate: string;
  description?: string;
  totalDebit: number;
  totalCredit: number;
  postedBy?: string;
  approvedBy?: string;
  approvedAt?: string;
  reversedJournalId?: string;
  chainHashPrevious?: string;
  chainHash?: string;
  idempotencyKey?: string;
}

export interface JournalEntry extends FinanceTrackedEntity {
  kind: 'JOURNAL_ENTRY';
  journalId: string;
  lineNumber: number;
  accountId: string;
  costCentreId?: string;
  departmentId?: string;
  projectId?: string;
  profitCentreId?: string;
  description?: string;
  debitAmount: number;
  creditAmount: number;
  currency: string;
  linkedEntityKind?: FinanceEntityKind;
  linkedEntityId?: string;
}

// --- P&L / Funding entities -------------------------------------------------

export interface Expense extends FinanceTrackedEntity {
  kind: 'EXPENSE';
  accountId: string;
  costCentreId?: string;
  departmentId?: string;
  projectId?: string;
  assetId?: string;
  invoiceId?: string;
  journalEntryId?: string;
  amount: number;
  currency: string;
  expenditureClass: FinanceExpenditureClass;
  category?: string;
  description?: string;
  expenseDate: string;
}

export interface Revenue extends FinanceTrackedEntity {
  kind: 'REVENUE';
  accountId: string;
  profitCentreId?: string;
  departmentId?: string;
  projectId?: string;
  receivableId?: string;
  receiptId?: string;
  journalEntryId?: string;
  amount: number;
  currency: string;
  category?: string;
  description?: string;
  revenueDate: string;
}

export interface Funding extends FinanceTrackedEntity {
  kind: 'FUNDING';
  fundingType: 'GRANT' | 'LOAN' | 'EQUITY' | 'APPROPRIATION' | 'DONATION' | 'REVENUE_REINVEST' | 'OTHER';
  name: string;
  code?: string;
  provider?: string;
  currency: string;
  totalAmount: number;
  disbursedAmount?: number;
  committedAmount?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  terms?: string;
  restrictions?: string;
}

export interface Grant extends FinanceTrackedEntity {
  kind: 'GRANT';
  fundingId: string;
  grantNumber?: string;
  donorName?: string;
  donorReference?: string;
  startDate: string;
  endDate?: string;
  totalAmount: number;
  currency: string;
  drawdownRules?: string;
  reportingFrequency?: string;
  conditions?: string;
}

export interface Loan extends FinanceTrackedEntity {
  kind: 'LOAN';
  fundingId: string;
  lenderName?: string;
  loanReference?: string;
  principalAmount: number;
  currency: string;
  interestRateType: 'FIXED' | 'FLOATING' | 'VARIABLE';
  interestRate: number;
  originationDate: string;
  maturityDate: string;
  disbursedAmount?: number;
  outstandingPrincipal?: number;
  repaymentFrequency?: string;
  collateral?: string;
}

export interface Liability extends FinanceTrackedEntity {
  kind: 'LIABILITY';
  liabilityType: 'LOAN' | 'PAYABLE' | 'ACCRUED_EXPENSE' | 'DEFERRED_REVENUE' | 'LEASE' | 'OTHER';
  loanId?: string;
  accountId: string;
  amount: number;
  currency: string;
  incurrenceDate: string;
  maturityDate?: string;
  description?: string;
}

export interface Receivable extends FinanceTrackedEntity {
  kind: 'RECEIVABLE';
  customerId?: string;
  revenueId?: string;
  invoiceReference?: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate?: string;
  paidAmount?: number;
  outstandingAmount: number;
  daysOverdue?: number;
}

export interface Payable extends FinanceTrackedEntity {
  kind: 'PAYABLE';
  supplierId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  dueDate?: string;
  paidAmount?: number;
  outstandingAmount: number;
  daysOverdue?: number;
}

// --- Treasury / Cash --------------------------------------------------------

export interface CashAccount extends FinanceTrackedEntity {
  kind: 'CASH_ACCOUNT';
  code: string;
  name: string;
  bankName?: string;
  accountNumber?: string;
  accountType?: 'OPERATING' | 'PAYROLL' | 'ESCROW' | 'RESERVE' | 'PETTY_CASH' | 'INVESTMENT' | 'OTHER';
  currency: string;
  openingBalance: number;
  currentBalance: number;
  lastReconciledAt?: string;
  ledgerAccountId?: string;
  signatories?: string[];
}

export interface BankTransaction extends FinanceTrackedEntity {
  kind: 'BANK_TRANSACTION';
  cashAccountId: string;
  txnDate: string;
  valueDate?: string;
  direction: 'DEBIT' | 'CREDIT';
  amount: number;
  currency: string;
  counterparty?: string;
  reference?: string;
  narrative?: string;
  reconciliationStatus: 'UNMATCHED' | 'PROVISIONAL_MATCH' | 'MATCHED' | 'INVESTIGATE' | 'WRITTEN_OFF';
  matchedPaymentId?: string;
  matchedReceiptId?: string;
  matchedBy?: string;
  matchedAt?: string;
  closingBalance?: number;
}

// --- Asset Capitalization ---------------------------------------------------

export interface AssetValue extends FinanceTrackedEntity {
  kind: 'ASSET_VALUE';
  assetId: string;
  valuationType: 'HISTORICAL_COST' | 'CAPITALIZATION' | 'REVALUATION' | 'FAIR_VALUE' | 'IMPAIRMENT' | 'NET_BOOK_VALUE';
  currency: string;
  amount: number;
  valuationDate: string;
  capexId?: string;
  journalEntryId?: string;
  notes?: string;
}

export interface Depreciation extends FinanceTrackedEntity {
  kind: 'DEPRECIATION';
  assetValueId: string;
  assetId?: string;
  financialPeriodId: string;
  method: 'STRAIGHT_LINE' | 'REDUCING_BALANCE' | 'UNITS_OF_PRODUCTION' | 'IMPAIRMENT';
  depreciationAmount: number;
  accumulatedDepreciation: number;
  currency: string;
  nbvAfter: number;
  journalEntryId?: string;
}

export interface CAPEX extends FinanceTrackedEntity {
  kind: 'CAPEX';
  code?: string;
  name?: string;
  projectId?: string;
  budgetId?: string;
  budgetLineId?: string;
  assetId?: string;
  commitmentId?: string;
  category?: string;
  amount: number;
  currency: string;
  capitalizedDate?: string;
  description?: string;
}

export interface OPEX extends FinanceTrackedEntity {
  kind: 'OPEX';
  code?: string;
  name?: string;
  projectId?: string;
  costCentreId?: string;
  departmentId?: string;
  assetId?: string;
  budgetId?: string;
  budgetLineId?: string;
  category: string;
  amount: number;
  currency: string;
  description?: string;
}

// --- Project Finance --------------------------------------------------------

export interface ProjectFinance extends FinanceTrackedEntity {
  kind: 'PROJECT_FINANCE';
  projectId: string;
  currency: string;
  approvedBudget?: number;
  revisedBudget?: number;
  actualCostToDate?: number;
  commitmentsTotal?: number;
  forecastCostAtCompletion?: number;
  fundingCommitted?: number;
  fundingSecured?: number;
  projectStartDate?: string;
  projectEndDate?: string;
  financialProgressPct?: number;
  physicalProgressPct?: number;
  healthScore?: number;
}

export interface ProjectCost extends FinanceTrackedEntity {
  kind: 'PROJECT_COST';
  projectFinanceId: string;
  projectId: string;
  financialPeriodId?: string;
  currency: string;
  approvedBudget?: number;
  revisedBudget?: number;
  actualCost?: number;
  commitments?: number;
  forecastCost?: number;
}

export interface CostToComplete extends FinanceTrackedEntity {
  kind: 'COST_TO_COMPLETE';
  projectFinanceId: string;
  projectId: string;
  method: 'CPI' | 'SPI_CPI' | 'LINEAR' | 'MANUAL' | 'SUBJECTIVE_OVERRIDE';
  earnedValueToDate?: number;
  actualCostToDate?: number;
  budgetAtCompletion?: number;
  cpi?: number;
  spi?: number;
  estimateAtCompletion: number;
  costToComplete: number;
  currency: string;
  assumptions?: string[];
  modelVersion?: string;
  calculatedAt: string;
}

// --- Analytics / Governance entities ----------------------------------------

export interface FinancialRisk extends FinanceTrackedEntity {
  kind: 'FINANCIAL_RISK';
  code?: string;
  title: string;
  riskType: string;
  level: FinanceRiskLevel;
  probability: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  impact: 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE' | 'CATASTROPHIC';
  exposureAmount?: number;
  currency?: string;
  drivers?: string[];
  evidenceIds?: string[];
  mitigations?: string[];
  ownerId?: string;
  affectedEntityKind?: FinanceEntityKind;
  affectedEntityId?: string;
}

export interface FinancialMetric extends FinanceTrackedEntity {
  kind: 'FINANCIAL_METRIC';
  metricId: string;
  name: string;
  description?: string;
  formula: string;
  sources?: string[];
  dimensions?: string[];
  refreshFrequency?: string;
  ownerId?: string;
  permissions?: string[];
  lineage?: string;
  metricVersion: string;
  status: 'DRAFT' | 'ACTIVE' | 'DEPRECATED';
}

export interface FinancialForecast extends FinanceTrackedEntity {
  kind: 'FINANCIAL_FORECAST';
  subjectKind: FinanceEntityKind | 'PORTFOLIO' | 'CASH' | 'OPEX' | 'CAPEX' | 'REVENUE';
  subjectId?: string;
  model: string;
  modelVersion: string;
  trainingDataWindow?: { from: string; to: string };
  forecastHorizon: string;
  horizonStart: string;
  horizonEnd: string;
  assumptions?: string[];
  errorMetrics?: { mae?: number; mape?: number; rmse?: number; status?: string };
  ciLowSeries?: number[];
  ciHighSeries?: number[];
  forecastSeries: number[];
  baselineSeries?: number[];
  scenarioId?: string;
  currency?: string;
  publishedAt?: string;
  publishedBy?: string;
}

export interface FinancialDecision extends FinanceTrackedEntity {
  kind: 'FINANCIAL_DECISION';
  title: string;
  summary?: string;
  trigger?: string;
  lifecycleStage: 'DETECT' | 'INVESTIGATE' | 'MODEL' | 'SIMULATE'
                 | 'RECOMMEND' | 'APPROVE' | 'EXECUTE' | 'VERIFY' | 'CLOSED' | 'REJECTED';
  decisionStatus?: 'OPEN' | 'PENDING' | 'APPROVED' | 'EXECUTED' | 'VERIFIED' | 'CLOSED' | 'REJECTED';
  affectedEntityKind?: FinanceEntityKind;
  affectedEntityId?: string;
  evidenceBagIds?: string[];
  scenarioRunIds?: string[];
  approverIds?: string[];
  approvedAt?: string;
  executedAt?: string;
  varianceResult?: string;
}

export interface FinancialReport extends FinanceTrackedEntity {
  kind: 'FINANCIAL_REPORT';
  code?: string;
  title: string;
  reportType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'AD_HOC' | 'BOARD' | 'AUDIT' | 'DONOR';
  financialPeriodId?: string;
  fiscalYearId?: string;
  currency?: string;
  metricIds?: string[];
  narrative?: string;
  attachmentHash?: string;
  publishedBy?: string;
  publishedAt?: string;
  distributionList?: string[];
}
