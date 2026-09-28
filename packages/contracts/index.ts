export const PHASE0_EVENT_CATALOG = [
  'InspectionCreated',
  'MediaUploaded',
  'MediaValidated',
  'MediaProcessingStarted',
  'AssetResolved',
  'ObjectDetected',
  'DefectDetected',
  'DefectUpdated',
  'ConditionCalculated',
  'RiskCalculated',
  'AlertCreated',
  'EngineerReviewed',
  'RecommendationGenerated',
  'ApprovalRequested',
  'ApprovalGranted',
  'WorkOrderCreated',
  'WorkOrderAssigned',
  'MaintenanceCompleted',
  'VerificationStarted',
  'VerificationPassed',
  'VerificationFailed',
  'InspectionClosed'
] as const;

export const PHASE0_ROUTE_CONTRACTS = [
  'POST /missions',
  'POST /missions/{id}/media',
  'GET /missions/{id}',
  'GET /assets/{id}',
  'GET /assets/{id}/health',
  'GET /assets/{id}/timeline',
  'GET /assets/{id}/defects',
  'GET /assets/{id}/risk',
  'GET /assets/{id}/graph',
  'POST /defects/{id}/review',
  'POST /defects/{id}/approve',
  'POST /work-orders',
  'POST /work-orders/{id}/verify',
  'GET /intelligence/hotspots',
  'GET /intelligence/degradation',
  'GET /intelligence/alerts'
] as const;

export const PHASE1_INGESTION_EVENTS = [
  'MediaUploadStarted',
  'MediaChunkReceived',
  'MediaValidated',
  'MediaNormalized',
  'TelemetryExtracted',
  'QualityGateFailed',
  'DuplicateFrameDetected',
  'EvidenceHashRecorded',
  'MediaRejected',
  'MediaReadyForVision'
] as const;

export const PHASE1_ROUTE_CONTRACTS = [
  'POST /api/platform/ingestion/session',
  'POST /api/platform/ingestion/session/{sessionId}/chunk',
  'POST /api/platform/ingestion/media',
  'POST /api/missions/{id}/media',
  'GET /api/platform/ingestion/quality-gates',
  'GET /api/platform/ingestion/health'
] as const;

export const PHASE2_VISION_EVENTS = [
  'FrameExtracted',
  'ObjectDetected',
  'DefectCandidateCreated',
  'SpatialCorrelationComputed',
  'ConditionAssessmentCreated',
  'EngineeringReviewRequired',
  'HumanReviewRequested'
] as const;

export const PHASE2_VISION_ROUTE_CONTRACTS = [
  'POST /api/platform/vision/pipeline',
  'POST /api/platform/vision/detect',
  'GET /api/platform/vision/health',
  'GET /api/platform/vision/config'
] as const;

export const PHASE3_ASSET_RESOLUTION_EVENTS = [
  'AssetMatched',
  'AssetResolutionReviewRequired',
  'AssetCandidateGenerated',
  'GraphCorrelationUpdated',
  'AssetMismatchEscalated'
] as const;

export const PHASE3_ASSET_RESOLUTION_ROUTE_CONTRACTS = [
  'POST /api/platform/asset-resolution/resolve',
  'GET /api/platform/asset-resolution/health',
  'GET /api/platform/asset-resolution/catalog'
] as const;

export const PHASE4_GRAPH_EVENTS = [
  'GraphCorrelationStarted',
  'AssetLinkedToDefect',
  'EvidenceLinkedToAsset',
  'RiskContextAttached',
  'GraphCorrelationVerified'
] as const;

export const PHASE4_GRAPH_ROUTE_CONTRACTS = [
  'POST /api/platform/graph/correlate',
  'GET /api/platform/graph/health',
  'GET /api/platform/graph/schema'
] as const;

export const PHASE5_RISK_EVENTS = [
  'ConditionAssessmentCreated',
  'RiskCalculated',
  'PriorityAssigned',
  'RecommendationGenerated',
  'ApprovalRequired'
] as const;

export const PHASE5_RISK_ROUTE_CONTRACTS = [
  'POST /api/platform/risk/assess',
  'GET /api/platform/risk/health',
  'POST /api/platform/workflow/route',
  'GET /api/platform/workflow/health'
] as const;

export const PHASE6_DECISION_EVENTS = [
  'GridStateComputed',
  'PriorityQueueUpdated',
  'CrossDomainCorrelationCompleted',
  'OperationalDecisionBriefGenerated',
  'HumanReviewRequested'
] as const;

export const PHASE6_DECISION_ROUTE_CONTRACTS = [
  'POST /api/platform/decision/grid-state',
  'POST /api/platform/decision/priority',
  'POST /api/platform/decision/correlation',
  'POST /api/platform/decision/brief',
  'GET /api/platform/decision/health'
] as const;

export const PHASE7_VERIFICATION_EVENTS = [
  'FieldInspectionStarted',
  'FieldEvidenceCaptured',
  'VerificationCompleted',
  'WorkOrderClosed',
  'ReinspectionRequired',
  'SafetyEscalationRaised'
] as const;

export const PHASE7_VERIFICATION_ROUTE_CONTRACTS = [
  'POST /api/platform/verification/assess',
  'POST /api/platform/verification/close',
  'GET /api/platform/verification/health',
  'GET /api/platform/verification/history'
] as const;

export const PHASE8_LEARNING_EVENTS = [
  'AssetHistoryRecorded',
  'MaintenanceOutcomeLearned',
  'DefectTrendUpdated',
  'LearningInsightGenerated',
  'AssetReliabilityRecomputed'
] as const;

export const PHASE8_LEARNING_ROUTE_CONTRACTS = [
  'POST /api/platform/learning/asset-history',
  'POST /api/platform/learning/insights',
  'GET /api/platform/learning/health',
  'GET /api/platform/learning/summary'
] as const;

export const PHASE9_EXECUTIVE_EVENTS = [
  'PortfolioBriefGenerated',
  'LeadershipAlertRaised',
  'RiskExposureUpdated',
  'BoardRecommendationIssued',
  'PortfolioStatusPublished'
] as const;

export const PHASE9_EXECUTIVE_ROUTE_CONTRACTS = [
  'POST /api/platform/executive/brief',
  'GET /api/platform/executive/health',
  'GET /api/platform/executive/portfolio',
  'GET /api/platform/executive/alerts'
] as const;

export const PHASE10_STRATEGIC_EVENTS = [
  'PortfolioPlanGenerated',
  'CapitalPriorityAssigned',
  'MaintenanceRegimeUpdated',
  'StrategicRecommendationIssued',
  'BoardInvestmentDecisionPrepared'
] as const;

export const PHASE10_STRATEGIC_ROUTE_CONTRACTS = [
  'POST /api/platform/strategic/plan',
  'GET /api/platform/strategic/health',
  'GET /api/platform/strategic/portfolio',
  'GET /api/platform/strategic/summary'
] as const;

export const PHASE0_DOMAIN_MODELS = [
  'domain.model',
  'event.model',
  'asset.model',
  'inspection.model',
  'evidence.model',
  'defect.model',
  'condition.model',
  'risk.model',
  'workflow.model',
  'user.role.model',
  'audit.model',
  'ai.inference.model',
  'model.version.model',
  'graph.schema',
  'api.contracts',
  'event.contracts',
  'frontend.contracts',
  'observability.contracts'
] as const;

export * from './atlas-fabric';

export interface PlatformContractEnvelope<T> {
  status: 'OK' | 'WARN' | 'ERROR';
  phase: 'PHASE_0';
  data: T;
  generatedAt: string;
}

export interface Phase0FoundationSummary {
  architecture: {
    apps: string[];
    services: string[];
    packages: string[];
  };
  contracts: {
    events: readonly string[];
    routes: readonly string[];
    domainModels: readonly string[];
  };
  gate: {
    name: 'Gate A';
    passed: boolean;
    checks: string[];
  };
}

// ============================================================================
// PHASE 11 FINANCE — FINANCE INTELLIGENCE CONTRACT CATALOG (Phase 01-02/17/25)
// ============================================================================
//
// Finance Bounded Context contracts: events, route surface, domain models.
// All Finance events inherit BaseEvent category=FINANCIAL_EVENT.
// DO NOT remove PHASE0..10 above (backward compat). Append Finance blocks only.
// ============================================================================

// --- Phase 01-17 Finance Event Catalog (Directive §25 minimum set) ----------
export const PHASE11_FINANCE_EVENTS = [
  // Source registry
  'FinanceSourceRegistered',
  'FinanceSourceUpdated',
  'FinanceSourceDisabled',
  'FinanceSourceConnectionTested',
  // Ingestion lifecycle
  'FinanceIngestionStarted',
  'FinanceIngestionCompleted',
  'FinanceIngestionFailed',
  'FinanceIngestionPartiallyCompleted',
  'FinanceIngestionCancelled',
  // Record-level
  'FinanceRecordValidated',
  'FinanceRecordRejected',
  'FinanceRecordQuarantined',
  'FinanceRecordNormalized',
  'FinanceRecordPersisted',
  // Entity resolution
  'FinanceEntityResolved',
  'FinanceEntityUnresolved',
  'FinanceResolutionReviewRequired',
  // Graph
  'FinanceGraphSynchronized',
  'FinanceGraphSyncFailed',
  'FinanceGraphNodeCreated',
  'FinanceGraphEdgeCreated',
  // Quality
  'FinanceDataQualityCalculated',
  'FinanceDataQualityDegraded',
  // Lineage & audit
  'FinanceLineageRecorded',
  'FinanceBatchLineageComplete',
  // Authorization / security
  'FinanceAuthorizationDenied',
  'FinanceFixtureBlockedInProd',
  'FinanceActionApproved',
  'FinanceActionRejected'
] as const;

// --- Phase 01-16 / 21 Route surface ------------------------------------------
export const PHASE11_FINANCE_ROUTE_CONTRACTS = [
  // Source registry (01-03)
  'GET  /api/finance/sources',
  'POST /api/finance/sources',
  'GET  /api/finance/sources/:id',
  'PATCH /api/finance/sources/:id',
  'POST /api/finance/sources/:id/test',
  // Ingestion (01-07)
  'POST /api/finance/ingestion',
  'GET  /api/finance/ingestion',
  'GET  /api/finance/ingestion/:batchId',
  'POST /api/finance/ingestion/:batchId/cancel',
  'POST /api/finance/ingestion/:batchId/retry',
  // Batch records
  'GET  /api/finance/batches/:batchId/records',
  'GET  /api/finance/batches/:batchId/records/rejected',
  // Data quality (01-11)
  'GET  /api/finance/quality',
  'GET  /api/finance/quality/:batchId',
  'GET  /api/finance/quality/sources/:sourceId',
  // Lineage (01-15)
  'GET  /api/finance/lineage/:entityId',
  'GET  /api/finance/lineage/batches/:batchId',
  // Entity endpoints (01-06 repositories)
  'GET  /api/finance/accounts',
  'GET  /api/finance/accounts/:id',
  'GET  /api/finance/cost-centres',
  'GET  /api/finance/cost-centres/:id',
  'GET  /api/finance/budgets',
  'GET  /api/finance/budgets/:id',
  'GET  /api/finance/budgets/:id/lines',
  'GET  /api/finance/commitments',
  'GET  /api/finance/commitments/:id',
  'GET  /api/finance/invoices',
  'GET  /api/finance/invoices/:id',
  'GET  /api/finance/payments',
  'GET  /api/finance/payments/:id',
  'GET  /api/finance/projects',
  'GET  /api/finance/projects/:id',
  // Health
  'GET  /api/finance/health',
  'GET  /api/finance/health/sources',
  'GET  /api/finance/health/graph-sync'
] as const;

// --- Phase 11 domain model reference list ------------------------------------
export const PHASE11_FINANCE_DOMAIN_MODELS = [
  'finance.source.model',
  'finance.batch.model',
  'finance.record.model',
  'finance.account.model',
  'finance.chart_of_accounts.model',
  'finance.cost_centre.model',
  'finance.department.model',
  'finance.budget.model',
  'finance.budget_line.model',
  'finance.commitment.model',
  'finance.invoice.model',
  'finance.payment.model',
  'finance.receipt.model',
  'finance.journal.model',
  'finance.expense.model',
  'finance.revenue.model',
  'finance.funding.model',
  'finance.cash_account.model',
  'finance.bank_transaction.model',
  'finance.asset_value.model',
  'finance.capex.model',
  'finance.opex.model',
  'finance.project_finance.model',
  'finance.project_cost.model',
  'finance.financial_risk.model',
  'finance.financial_metric.model',
  'finance.financial_forecast.model',
  'finance.financial_decision.model',
  'finance.quality.model',
  'finance.lineage.model',
  'finance.mapping.model',
  'finance.validation.model',
  'finance.normalization.model',
  'finance.ontology.mapping.model',
  'finance.rbac.model',
  'finance.abac.model',
  'finance.fixture.model',
  'finance.event.contracts',
  'finance.api.contracts',
  'finance.graph.contracts'
] as const;

// ============================================================================
// PHASE 01-02 FINANCE DOMAIN CONTRACTS (strongly typed ingestion pipeline)
// ============================================================================
// Directive §6 (01-02): "Use TypeScript types/interfaces. Do not allow any
// objects to become financial domain records. External data must first enter
// through a controlled contract."
// ============================================================================

import type {
  FinanceSourceType, FinanceConnectionStatus, FinanceBatchStatus,
  FinanceRecordStatus, FinanceValidationSeverity, FinanceEntityKind
} from '../domain';

export interface FinanceSource {
  sourceId: string;
  name: string;
  type: FinanceSourceType;
  system?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DEPRECATED';
  owner: string;
  connectionStatus: FinanceConnectionStatus;
  lastSuccessfulSync?: string;
  lastAttemptedSync?: string;
  schemaVersion: string;
  dataClassification: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'SECRET';
  isFixtureOnly?: boolean; // Rule 12/19/24 enforcement
  credentialRef?: string;   // Secret ref, never the credential itself
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  tenantId?: string;
}

export interface FinanceBatch {
  batchId: string;
  runId: string;
  correlationId: string;
  sourceId: string;
  status: FinanceBatchStatus;
  recordCount: number;
  successCount: number;
  warningCount: number;
  failureCount: number;
  quarantineCount: number;
  unresolvedCount: number;
  startedAt: string;
  completedAt?: string;
  failedAt?: string;
  cancelledAt?: string;
  trigger: 'SCHEDULED' | 'MANUAL' | 'EVENT' | 'RETRY' | 'FIXTURE';
  operatorId?: string;
  idempotencyKey?: string;
  qualityScore?: number;
  isFixture?: boolean;
  tenantId?: string;
  errors?: Array<{ code: string; message: string; timestamp: string }>;
}

export interface FinanceRawRecord {
  recordId: string;
  batchId: string;
  sourceId: string;
  sourceSystem?: FinanceSourceType;
  sourceRecordId?: string;
  recordVersion?: number;
  effectiveDate?: string;
  rawPayload: Record<string, unknown>;
  rawHash: string; // SHA-256 of rawPayload (Rule 14/22: source provenance)
  detectedEntityKind?: FinanceEntityKind | 'UNKNOWN';
  recordStatus: FinanceRecordStatus;
  ingestedAt: string;
  tenantId?: string;
  isFixture?: boolean;
}

export interface FinanceIngestionResult {
  batch: FinanceBatch;
  recordsProcessed: number;
  recordsPersisted: number;
  recordsRejected: number;
  recordsQuarantined: number;
  recordsUnresolved: number;
  graphSynced: boolean;
  lineageRecorded: boolean;
  qualityScore?: number;
  durationMs?: number;
  traceId?: string;
}

export interface FinanceValidationIssue {
  code: string;
  severity: FinanceValidationSeverity;
  field?: string;
  actualValue?: unknown;
  expectedCondition?: string;
  message: string;
  ruleId?: string;
}

export interface FinanceValidationResult {
  recordId: string;
  batchId: string;
  isValid: boolean;
  issues: FinanceValidationIssue[];
  severity: FinanceValidationSeverity;
  validatedAt: string;
  validationRuleVersion: string;
}

export interface FinanceNormalizationStep {
  field: string;
  rawValue: unknown;
  normalizedValue: unknown;
  normalizationRule: string;
  appliedAt: string;
}

export interface FinanceNormalizationResult {
  recordId: string;
  batchId: string;
  steps: FinanceNormalizationStep[];
  normalizedPayload: Record<string, unknown>;
  normalizedAt: string;
}

export interface FinanceQualityDimension {
  name: 'Completeness' | 'Validity' | 'Uniqueness' | 'Consistency' | 'Timeliness' | 'ReferentialIntegrity' | 'SourceReliability';
  score: number; // 0..100, deterministic
  weight: number; // 0..1
  evidence: string[];
  formula: string;
}

export interface FinanceQualityResult {
  batchId?: string;
  sourceId?: string;
  entityKind?: FinanceEntityKind;
  overallScore: number; // weighted sum of dimension scores
  dimensions: FinanceQualityDimension[];
  calculatedAt: string;
  formula: string; // reproduceable overall formula
  dataAvailability: 'REAL' | 'DEVELOPMENT_FIXTURE' | 'STALE' | 'PARTIAL' | 'UNAVAILABLE';
  n: number; // population size for statistical transparency
}

export interface FinanceMappingCandidate {
  entityKind: FinanceEntityKind | 'UNKNOWN';
  entityId?: string;
  confidence: number; // deterministic 0..1 feature-sum NOT LLM
  featureWeights: Record<string, number>;
  evidence: string[];
  reviewRequired: boolean;
}

export interface FinanceMappingResult {
  recordId: string;
  batchId: string;
  candidates: FinanceMappingCandidate[];
  bestCandidate?: FinanceMappingCandidate;
  ontologyBranch?: 'Finance' | 'Procurement' | 'Projects' | 'Asset' | 'SystemOperations' | 'Supplier' | 'PowerManagement' | 'Risk';
  mappedAt: string;
}

export interface FinanceLineageHop {
  hopIndex: number;
  hopType: 'SOURCE_RECORD' | 'RAW_RECORD' | 'VALIDATION' | 'NORMALIZATION'
          | 'ENTITY_RESOLUTION' | 'ONTOLOGY_MAP' | 'CANONICAL_ENTITY'
          | 'GRAPH_NODE' | 'GRAPH_EDGE' | 'METRIC_COMPUTE' | 'ANALYTIC_CONSUMER';
  fromRef?: string; // entity/record id
  toRef?: string;
  rule: string;     // transformation description
  actor?: string;   // user/agent/system
  timestamp: string;
  inputHash?: string;
  outputHash?: string;
  metadata?: Record<string, unknown>;
}

export interface FinanceLineageRecord {
  lineageId: string;
  rootEntityKind: FinanceEntityKind | 'BATCH';
  rootEntityId: string;
  batchId?: string;
  hops: FinanceLineageHop[];
  recordedAt: string;
  schemaVersion: string;
}

// Finance API response envelopes (reuse style of PlatformContractEnvelope above)
export interface FinanceContractEnvelope<T> {
  status: 'OK' | 'WARN' | 'ERROR' | 'DATA_UNAVAILABLE' | 'FIXTURE_BLOCKED';
  phase: 'PHASE_01_FINANCE_DATA_FABRIC';
  data?: T;
  dataAvailability: 'REAL' | 'DEVELOPMENT_FIXTURE' | 'STALE' | 'PARTIAL' | 'UNAVAILABLE';
  generatedAt: string;
  correlationId?: string;
  message?: string;
  warnings?: string[];
}
