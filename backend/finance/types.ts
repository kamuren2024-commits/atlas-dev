/**
 * 01-01 + 01-02 — FINANCE DOMAIN TYPES + CONTRACT TYPES
 *
 * Reinforces packages/domain Finance entities with in-code runtime types
 * used by the backend/finance module.  Cross-module contracts live here
 * as well so that repositories, ingestion, and API stay consistent.
 *
 * All records enforce:
 *   - idempotency (unique sourceSystem + sourceRecordId)
 *   - provenance  (sourceSystem, sourceRecordId, provenance)
 *   - CP-03 flags (isFixture, environment)
 */

import type {
  FinancialPeriod as DomFinancialPeriod,
  Account as DomAccount,
  CostCentre as DomCostCentre,
  Budget as DomBudget,
  Commitment as DomCommitment,
  Invoice as DomInvoice,
  Payment as DomPayment,
  ProjectCost as DomProjectCost,
  FinancialMetric as DomFinanceMetric
} from '../../packages/domain';

// ----------------------------------------------------------------------
// SOURCE REGISTRY — 01-03
// ----------------------------------------------------------------------
export type FinanceSourceType =
  | 'SAP_S4HANA'
  | 'SAP_ARIBA'
  | 'ERP'
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

export type ConnectionStatus =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'AUTHENTICATING'
  | 'AUTHENTICATED'
  | 'FAILED';

export type SourceStatus =
  | 'REGISTERED'
  | 'CONFIGURED'
  | 'ENABLED'
  | 'DISABLED'
  | 'ERROR'
  | 'DECOMMISSIONED';

export type DataClassification =
  | 'PUBLIC'
  | 'INTERNAL'
  | 'CONFIDENTIAL'
  | 'RESTRICTED'
  | 'FINANCE_SENSITIVE';

export interface FinanceSourceRecord {
  sourceId: string;
  name: string;
  sourceType: FinanceSourceType;
  system?: string;
  status: SourceStatus;
  owner?: string;
  connectionStatus: ConnectionStatus;
  lastSuccessfulSync?: string;
  lastAttemptedSync?: string;
  schemaVersion?: string;
  dataClassification?: DataClassification;
  credentialReference?: string;
  configuration?: Record<string, unknown>;
  isFixture: boolean;
  environment: 'development' | 'staging' | 'production' | 'test';
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

// ----------------------------------------------------------------------
// INGESTION BATCH + RECORD — 01-07
// ----------------------------------------------------------------------
export type BatchStatus =
  | 'CREATED'
  | 'CONNECTING'
  | 'FETCHING'
  | 'VALIDATING'
  | 'NORMALIZING'
  | 'RESOLVING'
  | 'ONTOLOGY_MAPPING'
  | 'PERSISTING'
  | 'GRAPH_SYNCING'
  | 'QUALITY_CALCULATING'
  | 'COMPLETED'
  | 'PARTIAL'
  | 'FAILED';

export interface FinanceBatch {
  batchId: string;
  runId?: string;
  correlationId?: string;
  sourceId: string;
  startedAt: string;
  completedAt?: string;
  status: BatchStatus;
  recordCount: number;
  successCount: number;
  warningCount: number;
  failureCount: number;
  quarantinedCount: number;
  errorSummary?: string;
  checkpoint?: Record<string, unknown>;
  isFixture: boolean;
  environment: string;
  dataState?: DataState;
  tenantId?: string;
  actorId?: string;
}

export type RecordStatus =
  | 'RAW'
  | 'VALIDATED'
  | 'NORMALIZED'
  | 'RESOLVED'
  | 'MAPPED'
  | 'PERSISTED'
  | 'GRAPH_SYNCED'
  | 'COMPLETE'
  | 'QUARANTINED'
  | 'REJECTED';

export type ValidationSeverity = 'VALID' | 'WARNING' | 'INVALID';

export interface FinanceRawRecord {
  recordId: string;
  batchId: string;
  sourceId: string;
  sourceSystem?: string;
  sourceRecordId: string;
  recordVersion: number;
  rawHash?: string;
  rawPayload: Record<string, unknown>;
  normalizedPayload?: Record<string, unknown>;
  recordStatus: RecordStatus;
  validationSeverity: ValidationSeverity;
  validationErrors?: ValidationError[];
  normalizationRules?: NormalizationTrace[];
  entityKind?: string;
  resolvedEntityId?: string;
  ontologyMappings?: OntologyMapping[];
  ingestedAt: string;
  effectiveDate?: string;
  isFixture: boolean;
  environment: string;
  dataState?: DataState;
  tenantId?: string;
}

// ----------------------------------------------------------------------
// NORMALIZATION / VALIDATION — 01-08 / 01-09
// ----------------------------------------------------------------------
export interface NormalizationTrace {
  field: string;
  rawValue: unknown;
  normalizedValue: unknown;
  normalizationRule: string;
  appliedAt: string;
  actor: string;
}

export interface ValidationError {
  record: string;
  field: string;
  rule: string;
  actualValue: unknown;
  expectedCondition: string;
  severity: ValidationSeverity;
  message: string;
}

// ----------------------------------------------------------------------
// PROFILING — 01-10
// ----------------------------------------------------------------------
export interface DataProfile {
  profileId: string;
  sourceId: string;
  batchId: string;
  datasetName: string;
  rowCount: number;
  columnCount: number;
  nullRates: Record<string, number>;
  duplicateRate: number;
  uniqueRates: Record<string, number>;
  typeDistribution: Record<string, string>;
  dateRange?: { min?: string; max?: string; field: string };
  amountRange?: { min?: number; max?: number; field: string };
  currencyDistribution: Record<string, number>;
  schemaChangeSignature?: string;
  inferredEntities: string[];
  isFixture: boolean;
  environment: string;
  tenantId?: string;
  profiledAt: string;
}

// ----------------------------------------------------------------------
// DATA QUALITY — 01-11
// ----------------------------------------------------------------------
export interface QualityDimension {
  name: 'Completeness' | 'Validity' | 'Uniqueness' | 'Consistency' | 'Timeliness' | 'Referential Integrity' | 'Source Reliability';
  score: number;
  weight: number;
  checks: QualityCheck[];
  formula: string;
}

export interface QualityCheck {
  checkId: string;
  name: string;
  passed: boolean;
  metric?: number;
  threshold: number;
  message?: string;
}

export interface DataQualityScore {
  qualityId: string;
  batchId?: string;
  recordId?: string;
  entityKind?: string;
  entityId?: string;
  sourceId?: string;
  completenessScore: number;
  validityScore: number;
  uniquenessScore: number;
  consistencyScore: number;
  timelinessScore: number;
  referentialIntegrityScore: number;
  sourceReliabilityScore: number;
  overallScore: number;
  dimensions: QualityDimension[];
  formulaVersion: string;
  failingChecks: QualityCheck[];
  warnings: QualityCheck[];
  qualityAgent: string;
  isFixture: boolean;
  environment: string;
  tenantId?: string;
  calculatedAt: string;
}

// ----------------------------------------------------------------------
// ENTITY RESOLUTION — 01-12
// ----------------------------------------------------------------------
export type ResolutionStatus = 'RESOLVED' | 'UNRESOLVED' | 'AMBIGUOUS' | 'REQUIRES_REVIEW';

export interface EntityResolutionResult {
  mappingId: string;
  financeEntityKind: string;
  financeEntityId?: string;
  remoteDomain: 'projects' | 'procurement' | 'contracts' | 'suppliers' | 'assets' | 'operations' | 'power' | 'governance';
  remoteEntityKind: string;
  remoteEntityId?: string;
  mappingType: 'DIRECT' | 'INFERRED' | 'MANUAL' | 'UNRESOLVED';
  confidenceLevel: 'STRONG' | 'MEDIUM' | 'WEAK' | 'UNKNOWN';
  status: ResolutionStatus;
  resolvedBy: string;
  resolvedAt: string;
  mappingRule?: string;
}

// ----------------------------------------------------------------------
// ONTOLOGY MAPPING — 01-13
// ----------------------------------------------------------------------
export interface OntologyMapping {
  sourceField: string;
  targetOntologyClass: string;
  targetOntologyAttribute?: string;
  mappingRule: string;
  status: ResolutionStatus;
  candidateId?: string;
  confidence?: number;
}

// ----------------------------------------------------------------------
// LINEAGE — 01-15
// ----------------------------------------------------------------------
export type TransformationType =
  | 'SOURCE_RECEIVE'
  | 'RAW_RECORD_CREATE'
  | 'VALIDATE'
  | 'NORMALIZE'
  | 'RESOLVE_ENTITY'
  | 'ONTOLOGY_MAP'
  | 'PERSIST'
  | 'GRAPH_CREATE_NODE'
  | 'GRAPH_CREATE_EDGE'
  | 'QUALITY_SCORE'
  | 'EVENT_EMIT'
  | 'ANALYTIC_CONSUME'
  | 'RETRY'
  | 'QUARANTINE'
  | 'REJECT';

export interface FinanceLineageRecord {
  lineageId: string;
  entityKind?: string;
  entityId?: string;
  recordId?: string;
  batchId?: string;
  sourceId?: string;
  parentLineageId?: string;
  transformationType: TransformationType;
  transformationRule?: string;
  fromEntityKind?: string;
  fromEntityId?: string;
  toEntityKind?: string;
  toEntityId?: string;
  fieldMappings?: Record<string, string>;
  formulaUsed?: string;
  actorId?: string;
  traceHash?: string;
  isFixture: boolean;
  environment: string;
  tenantId?: string;
  occurredAt: string;
}

// ----------------------------------------------------------------------
// DATA STATE (CP-03)
// ----------------------------------------------------------------------
export type DataState =
  | 'REAL'
  | 'DEVELOPMENT_FIXTURE'
  | 'STALE'
  | 'PARTIAL'
  | 'UNAVAILABLE';

// ----------------------------------------------------------------------
// DOMAIN ENTITY ALIASES (import from packages/domain)
// ----------------------------------------------------------------------
export type FinancialPeriod = DomFinancialPeriod;
export type Account = DomAccount;
export type CostCentre = DomCostCentre;
export type Budget = DomBudget;
export type Commitment = DomCommitment;
export type Invoice = DomInvoice;
export type Payment = DomPayment;
export type ProjectCost = DomProjectCost;
export type FinanceMetricEntity = DomFinanceMetric;
