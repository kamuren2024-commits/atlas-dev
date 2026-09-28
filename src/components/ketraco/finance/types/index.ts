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

export type DataState =
  | 'REAL'
  | 'DEVELOPMENT_FIXTURE'
  | 'STALE'
  | 'PARTIAL'
  | 'UNAVAILABLE'
  | 'LOADING'
  | 'ERROR';

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

export interface FinanceSource {
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
  isFixture: boolean;
  environment: 'development' | 'staging' | 'production' | 'test';
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceBatch {
  batchId: string;
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
  isFixture: boolean;
  environment: string;
  dataState?: DataState;
  tenantId?: string;
}

export interface FinanceAccount {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  parentAccountId?: string;
  costCentreId?: string;
  isActive: boolean;
  isFixture: boolean;
  tenantId?: string;
  createdAt: string;
}

export interface FinanceCostCentre {
  costCentreId: string;
  code: string;
  name: string;
  department?: string;
  manager?: string;
  budget?: number;
  spent?: number;
  isActive: boolean;
  isFixture: boolean;
  tenantId?: string;
}

export interface FinanceBudget {
  budgetId: string;
  name: string;
  budgetCode: string;
  financialYear: string;
  department?: string;
  costCentreId?: string;
  projectId?: string;
  accountType: 'CAPEX' | 'OPEX';
  approvedAmount: number;
  revisedAmount: number;
  committedAmount: number;
  actualAmount: number;
  paidAmount: number;
  forecastAmount: number;
  remainingAmount: number;
  variance: number;
  variancePct: number;
  currency: string;
  status: 'ACTIVE' | 'FROZEN' | 'CLOSED' | 'DRAFT';
  isFixture: boolean;
  tenantId?: string;
  createdAt: string;
}

export interface FinanceCommitment {
  commitmentId: string;
  reference: string;
  description: string;
  budgetId?: string;
  projectId?: string;
  contractId?: string;
  supplierId?: string;
  supplierName?: string;
  amount: number;
  currency: string;
  committedDate: string;
  expiryDate?: string;
  invoicedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'ACTIVE' | 'FULFILLED' | 'EXPIRED' | 'CANCELLED' | 'DISPUTED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isFixture: boolean;
  tenantId?: string;
  createdAt: string;
}

export interface FinanceInvoice {
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  supplierId?: string;
  commitmentId?: string;
  projectId?: string;
  contractId?: string;
  amount: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  invoiceDate: string;
  dueDate: string;
  receivedDate: string;
  status: 'RECEIVED' | 'VALIDATED' | 'APPROVED' | 'REJECTED' | 'PAID' | 'DISPUTED';
  paymentId?: string;
  costCentreId?: string;
  isFixture: boolean;
  tenantId?: string;
  createdAt: string;
}

export interface FinancePayment {
  paymentId: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierName: string;
  supplierId?: string;
  amount: number;
  currency: string;
  paymentDate?: string;
  scheduledDate: string;
  method: 'BANK_TRANSFER' | 'CHEQUE' | 'MPESA' | 'RTGS' | 'RTA';
  status: 'SCHEDULED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  reference?: string;
  projectId?: string;
  costCentreId?: string;
  isFixture: boolean;
  tenantId?: string;
  createdAt: string;
}

export interface FinanceProject {
  projectId: string;
  projectCode: string;
  name: string;
  description?: string;
  department?: string;
  manager?: string;
  totalBudget: number;
  committedAmount: number;
  actualAmount: number;
  paidAmount: number;
  forecastAmount: number;
  costToComplete: number;
  forecastCompletionCost: number;
  variance: number;
  variancePct: number;
  startDate?: string;
  expectedEndDate?: string;
  status: 'PLANNING' | 'APPROVED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  capexOpex: 'CAPEX' | 'OPEX' | 'BOTH';
  isFixture: boolean;
  tenantId?: string;
  createdAt: string;
}

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
  actorId?: string;
  isFixture: boolean;
  environment: string;
  tenantId?: string;
  occurredAt: string;
}

export interface DataQualityScore {
  qualityId: string;
  batchId?: string;
  sourceId?: string;
  completenessScore: number;
  validityScore: number;
  uniquenessScore: number;
  consistencyScore: number;
  timelinessScore: number;
  referentialIntegrityScore: number;
  sourceReliabilityScore: number;
  overallScore: number;
  isFixture: boolean;
  calculatedAt: string;
}

export interface FinanceMetric {
  metricId: string;
  name: string;
  category: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit: string;
  period: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  isFixture: boolean;
}

export interface FinanceFinancialPeriod {
  periodId: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  status: 'OPEN' | 'CLOSED' | 'ARCHIVED';
}

export type FinanceView =
  | 'overview'
  | 'budgets'
  | 'projects'
  | 'capex-opex'
  | 'commitments'
  | 'payments'
  | 'performance'
  | 'graph'
  | 'data-fabric'
  | 'lineage';

export interface FinanceNavItem {
  id: FinanceView;
  label: string;
  icon: string;
}

export interface FinanceOverviewKPI {
  label: string;
  value: number;
  formattedValue: string;
  previousValue?: number;
  unit: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendPct?: number;
  category: 'budget' | 'commitment' | 'payment' | 'forecast' | 'risk' | 'variance';
  dataState: DataState;
}
