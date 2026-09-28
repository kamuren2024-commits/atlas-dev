import type {
  FinanceSource,
  FinanceBatch,
  FinanceAccount,
  FinanceCostCentre,
  FinanceBudget,
  FinanceCommitment,
  FinanceInvoice,
  FinancePayment,
  FinanceProject,
  FinanceLineageRecord,
  DataQualityScore,
} from '../types';

// ---------------------------------------------------------------------------
// CP-03 FIXTURE DATA — clearly marked development data
// All values are deterministic. No random or fabricated production metrics.
// ---------------------------------------------------------------------------

export const FIXTURE_SOURCES: FinanceSource[] = [
  {
    sourceId: 'src-sap-001',
    name: 'SAP S/4HANA Finance',
    sourceType: 'SAP_S4HANA',
    system: 'SAP S/4HANA 2023',
    status: 'ENABLED',
    owner: 'finance-ops',
    connectionStatus: 'CONNECTED',
    lastSuccessfulSync: '2026-09-01T08:15:00Z',
    lastAttemptedSync: '2026-09-01T08:15:00Z',
    schemaVersion: '2.1.0',
    dataClassification: 'FINANCE_SENSITIVE',
    isFixture: true,
    environment: 'development',
    tenantId: 'ketraco',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-09-01T08:15:00Z',
  },
  {
    sourceId: 'src-ariba-002',
    name: 'SAP Ariba Procurement',
    sourceType: 'SAP_ARIBA',
    system: 'SAP Ariba 24R2',
    status: 'ENABLED',
    owner: 'procurement-ops',
    connectionStatus: 'CONNECTED',
    lastSuccessfulSync: '2026-09-01T07:30:00Z',
    lastAttemptedSync: '2026-09-01T07:30:00Z',
    dataClassification: 'CONFIDENTIAL',
    isFixture: true,
    environment: 'development',
    tenantId: 'ketraco',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-09-01T07:30:00Z',
  },
  {
    sourceId: 'src-excel-003',
    name: 'Monthly Budget Sheets',
    sourceType: 'EXCEL',
    status: 'ENABLED',
    owner: 'finance-analyst',
    connectionStatus: 'CONNECTED',
    lastSuccessfulSync: '2026-08-30T14:00:00Z',
    dataClassification: 'INTERNAL',
    isFixture: true,
    environment: 'development',
    tenantId: 'ketraco',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-08-30T14:00:00Z',
  },
  {
    sourceId: 'src-bank-004',
    name: 'KCB Bank Feed',
    sourceType: 'BANK',
    status: 'CONFIGURED',
    owner: 'treasury',
    connectionStatus: 'DISCONNECTED',
    dataClassification: 'FINANCE_SENSITIVE',
    isFixture: true,
    environment: 'development',
    tenantId: 'ketraco',
    createdAt: '2026-04-01T00:00:00Z',
    updatedAt: '2026-08-15T00:00:00Z',
  },
  {
    sourceId: 'src-proj-005',
    name: 'Project Management System',
    sourceType: 'PROJECT_SYSTEM',
    status: 'ENABLED',
    owner: 'pmo',
    connectionStatus: 'CONNECTED',
    lastSuccessfulSync: '2026-09-01T06:00:00Z',
    dataClassification: 'CONFIDENTIAL',
    isFixture: true,
    environment: 'development',
    tenantId: 'ketraco',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-09-01T06:00:00Z',
  },
];

export const FIXTURE_BATCHES: FinanceBatch[] = [
  {
    batchId: 'bat-001',
    sourceId: 'src-sap-001',
    startedAt: '2026-09-01T08:00:00Z',
    completedAt: '2026-09-01T08:15:00Z',
    status: 'COMPLETED',
    recordCount: 2847,
    successCount: 2801,
    warningCount: 32,
    failureCount: 14,
    quarantinedCount: 14,
    isFixture: true,
    environment: 'development',
    tenantId: 'ketraco',
  },
  {
    batchId: 'bat-002',
    sourceId: 'src-ariba-002',
    startedAt: '2026-09-01T07:15:00Z',
    completedAt: '2026-09-01T07:30:00Z',
    status: 'COMPLETED',
    recordCount: 156,
    successCount: 154,
    warningCount: 2,
    failureCount: 0,
    quarantinedCount: 0,
    isFixture: true,
    environment: 'development',
    tenantId: 'ketraco',
  },
];

export const FIXTURE_ACCOUNTS: FinanceAccount[] = [
  { accountId: 'acc-001', accountCode: '1000', accountName: 'Cash & Bank', accountType: 'ASSET', isActive: true, isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z' },
  { accountId: 'acc-002', accountCode: '1100', accountName: 'Accounts Receivable', accountType: 'ASSET', isActive: true, isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z' },
  { accountId: 'acc-003', accountCode: '1200', accountName: 'Fixed Assets', accountType: 'ASSET', isActive: true, isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z' },
  { accountId: 'acc-004', accountCode: '2000', accountName: 'Accounts Payable', accountType: 'LIABILITY', isActive: true, isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z' },
  { accountId: 'acc-005', accountCode: '3000', accountName: 'Capital Reserve', accountType: 'EQUITY', isActive: true, isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z' },
  { accountId: 'acc-006', accountCode: '4000', accountName: 'Transmission Revenue', accountType: 'REVENUE', isActive: true, isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z' },
  { accountId: 'acc-007', accountCode: '5100', accountName: 'Project Expenditure', accountType: 'EXPENSE', isActive: true, isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z' },
  { accountId: 'acc-008', accountCode: '5200', accountName: 'Operating Expenditure', accountType: 'EXPENSE', isActive: true, isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z' },
];

export const FIXTURE_COST_CENTRES: FinanceCostCentre[] = [
  { costCentreId: 'cc-001', code: 'CC-TRANS', name: 'Transmission Infrastructure', department: 'Engineering', manager: 'Eng. Mwangi', budget: 4800000000, spent: 3120000000, isActive: true, isFixture: true, tenantId: 'ketraco' },
  { costCentreId: 'cc-002', code: 'CC-DIST', name: 'Distribution Network', department: 'Operations', manager: 'Eng. Ochieng', budget: 2400000000, spent: 1680000000, isActive: true, isFixture: true, tenantId: 'ketraco' },
  { costCentreId: 'cc-003', code: 'CC-ADM', name: 'Administration & Corporate', department: 'Corporate Services', manager: 'Mrs. Wanjiku', budget: 960000000, spent: 720000000, isActive: true, isFixture: true, tenantId: 'ketraco' },
  { costCentreId: 'cc-004', code: 'CC-IT', name: 'IT & Digital', department: 'ICT', manager: 'Mr. Omondi', budget: 480000000, spent: 336000000, isActive: true, isFixture: true, tenantId: 'ketraco' },
  { costCentreId: 'cc-005', code: 'CC-HR', name: 'Human Resources', department: 'HR', manager: 'Mrs. Njeri', budget: 360000000, spent: 264000000, isActive: true, isFixture: true, tenantId: 'ketraco' },
];

export const FIXTURE_BUDGETS: FinanceBudget[] = [
  {
    budgetId: 'bud-001', name: 'Loyangalani-Suswa HV Transmission', budgetCode: 'BUD-2026-001',
    financialYear: 'FY2025-2026', department: 'Engineering', costCentreId: 'cc-001', projectId: 'proj-001',
    accountType: 'CAPEX', approvedAmount: 1200000000, revisedAmount: 1280000000,
    committedAmount: 1056000000, actualAmount: 768000000, paidAmount: 624000000,
    forecastAmount: 1152000000, remainingAmount: 224000000, variance: -48000000,
    variancePct: -3.75, currency: 'KES', status: 'ACTIVE', isFixture: true, tenantId: 'ketraco', createdAt: '2025-07-01T00:00:00Z',
  },
  {
    budgetId: 'bud-002', name: 'National Grid Maintenance', budgetCode: 'BUD-2026-002',
    financialYear: 'FY2025-2026', department: 'Operations', costCentreId: 'cc-002',
    accountType: 'OPEX', approvedAmount: 800000000, revisedAmount: 800000000,
    committedAmount: 560000000, actualAmount: 480000000, paidAmount: 416000000,
    forecastAmount: 760000000, remainingAmount: 32000000, variance: 40000000,
    variancePct: 5.0, currency: 'KES', status: 'ACTIVE', isFixture: true, tenantId: 'ketraco', createdAt: '2025-07-01T00:00:00Z',
  },
  {
    budgetId: 'bud-003', name: 'Embu-Meru 220kV Line', budgetCode: 'BUD-2026-003',
    financialYear: 'FY2025-2026', department: 'Engineering', costCentreId: 'cc-001', projectId: 'proj-002',
    accountType: 'CAPEX', approvedAmount: 960000000, revisedAmount: 1020000000,
    committedAmount: 816000000, actualAmount: 528000000, paidAmount: 432000000,
    forecastAmount: 912000000, remainingAmount: 192000000, variance: -108000000,
    variancePct: -10.59, currency: 'KES', status: 'ACTIVE', isFixture: true, tenantId: 'ketraco', createdAt: '2025-07-01T00:00:00Z',
  },
  {
    budgetId: 'bud-004', name: 'ICT Infrastructure Upgrade', budgetCode: 'BUD-2026-004',
    financialYear: 'FY2025-2026', department: 'ICT', costCentreId: 'cc-004',
    accountType: 'CAPEX', approvedAmount: 320000000, revisedAmount: 360000000,
    committedAmount: 288000000, actualAmount: 192000000, paidAmount: 168000000,
    forecastAmount: 336000000, remainingAmount: 72000000, variance: -24000000,
    variancePct: -6.67, currency: 'KES', status: 'ACTIVE', isFixture: true, tenantId: 'ketraco', createdAt: '2025-07-01T00:00:00Z',
  },
  {
    budgetId: 'bud-005', name: 'Corporate Operations', budgetCode: 'BUD-2026-005',
    financialYear: 'FY2025-2026', department: 'Corporate Services', costCentreId: 'cc-003',
    accountType: 'OPEX', approvedAmount: 600000000, revisedAmount: 600000000,
    committedAmount: 420000000, actualAmount: 372000000, paidAmount: 336000000,
    forecastAmount: 576000000, remainingAmount: 24000000, variance: 24000000,
    variancePct: 4.0, currency: 'KES', status: 'ACTIVE', isFixture: true, tenantId: 'ketraco', createdAt: '2025-07-01T00:00:00Z',
  },
];

export const FIXTURE_COMMITMENTS: FinanceCommitment[] = [
  {
    commitmentId: 'com-001', reference: 'PO-2026-00412', description: 'HV Cable Supply — Loyangalani-Suswa',
    budgetId: 'bud-001', projectId: 'proj-001', contractId: 'con-001', supplierName: 'Nairobi Cables Ltd',
    amount: 480000000, currency: 'KES', committedDate: '2026-02-15T00:00:00Z', expiryDate: '2026-12-31T00:00:00Z',
    invoicedAmount: 336000000, paidAmount: 264000000, remainingAmount: 144000000,
    status: 'ACTIVE', riskLevel: 'LOW', isFixture: true, tenantId: 'ketraco', createdAt: '2026-02-15T00:00:00Z',
  },
  {
    commitmentId: 'com-002', reference: 'PO-2026-00387', description: 'Transmission Tower Erection Works',
    budgetId: 'bud-001', projectId: 'proj-001', contractId: 'con-002', supplierName: 'China Yangtze Power',
    amount: 360000000, currency: 'KES', committedDate: '2026-01-20T00:00:00Z',
    invoicedAmount: 288000000, paidAmount: 240000000, remainingAmount: 72000000,
    status: 'ACTIVE', riskLevel: 'LOW', isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-20T00:00:00Z',
  },
  {
    commitmentId: 'com-003', reference: 'PO-2026-00421', description: 'Substation Equipment — Embu',
    budgetId: 'bud-003', projectId: 'proj-002', supplierName: 'Siemens East Africa',
    amount: 216000000, currency: 'KES', committedDate: '2026-03-10T00:00:00Z', expiryDate: '2026-09-30T00:00:00Z',
    invoicedAmount: 144000000, paidAmount: 108000000, remainingAmount: 72000000,
    status: 'ACTIVE', riskLevel: 'MEDIUM', isFixture: true, tenantId: 'ketraco', createdAt: '2026-03-10T00:00:00Z',
  },
  {
    commitmentId: 'com-004', reference: 'PO-2026-00398', description: 'Network Maintenance Services',
    budgetId: 'bud-002', supplierName: 'KEPSA Maintenance Co.',
    amount: 180000000, currency: 'KES', committedDate: '2026-01-05T00:00:00Z',
    invoicedAmount: 144000000, paidAmount: 132000000, remainingAmount: 36000000,
    status: 'ACTIVE', riskLevel: 'LOW', isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-05T00:00:00Z',
  },
  {
    commitmentId: 'com-005', reference: 'PO-2026-00445', description: 'Cloud ERP Licensing',
    budgetId: 'bud-004', supplierName: 'SAP East Africa',
    amount: 96000000, currency: 'KES', committedDate: '2026-04-01T00:00:00Z', expiryDate: '2027-03-31T00:00:00Z',
    invoicedAmount: 48000000, paidAmount: 48000000, remainingAmount: 0,
    status: 'FULFILLED', riskLevel: 'LOW', isFixture: true, tenantId: 'ketraco', createdAt: '2026-04-01T00:00:00Z',
  },
];

export const FIXTURE_INVOICES: FinanceInvoice[] = [
  {
    invoiceId: 'inv-001', invoiceNumber: 'INV-NCL-2026-089', supplierName: 'Nairobi Cables Ltd',
    commitmentId: 'com-001', projectId: 'proj-001', amount: 108000000, taxAmount: 17280000, totalAmount: 125280000,
    currency: 'KES', invoiceDate: '2026-08-01T00:00:00Z', dueDate: '2026-09-30T00:00:00Z',
    receivedDate: '2026-08-05T00:00:00Z', status: 'APPROVED', costCentreId: 'cc-001',
    isFixture: true, tenantId: 'ketraco', createdAt: '2026-08-05T00:00:00Z',
  },
  {
    invoiceId: 'inv-002', invoiceNumber: 'INV-CYP-2026-156', supplierName: 'China Yangtze Power',
    commitmentId: 'com-002', projectId: 'proj-001', amount: 96000000, taxAmount: 15360000, totalAmount: 111360000,
    currency: 'KES', invoiceDate: '2026-08-15T00:00:00Z', dueDate: '2026-10-15T00:00:00Z',
    receivedDate: '2026-08-18T00:00:00Z', status: 'VALIDATED', costCentreId: 'cc-001',
    isFixture: true, tenantId: 'ketraco', createdAt: '2026-08-18T00:00:00Z',
  },
  {
    invoiceId: 'inv-003', invoiceNumber: 'INV-SIE-2026-034', supplierName: 'Siemens East Africa',
    commitmentId: 'com-003', projectId: 'proj-002', amount: 72000000, taxAmount: 11520000, totalAmount: 83520000,
    currency: 'KES', invoiceDate: '2026-07-20T00:00:00Z', dueDate: '2026-09-20T00:00:00Z',
    receivedDate: '2026-07-22T00:00:00Z', status: 'PAID', costCentreId: 'cc-001',
    isFixture: true, tenantId: 'ketraco', createdAt: '2026-07-22T00:00:00Z',
  },
  {
    invoiceId: 'inv-004', invoiceNumber: 'INV-KMC-2026-210', supplierName: 'KEPSA Maintenance Co.',
    commitmentId: 'com-004', amount: 48000000, taxAmount: 7680000, totalAmount: 55680000,
    currency: 'KES', invoiceDate: '2026-08-10T00:00:00Z', dueDate: '2026-09-10T00:00:00Z',
    receivedDate: '2026-08-12T00:00:00Z', status: 'RECEIVED', costCentreId: 'cc-002',
    isFixture: true, tenantId: 'ketraco', createdAt: '2026-08-12T00:00:00Z',
  },
];

export const FIXTURE_PAYMENTS: FinancePayment[] = [
  {
    paymentId: 'pay-001', paymentNumber: 'PAY-2026-1045', invoiceId: 'inv-003', invoiceNumber: 'INV-SIE-2026-034',
    supplierName: 'Siemens East Africa', amount: 83520000, currency: 'KES',
    paymentDate: '2026-08-28T00:00:00Z', scheduledDate: '2026-08-30T00:00:00Z',
    method: 'RTGS', status: 'COMPLETED', projectId: 'proj-002', costCentreId: 'cc-001',
    isFixture: true, tenantId: 'ketraco', createdAt: '2026-08-28T00:00:00Z',
  },
  {
    paymentId: 'pay-002', paymentNumber: 'PAY-2026-1038', invoiceId: 'inv-001', invoiceNumber: 'INV-NCL-2026-089',
    supplierName: 'Nairobi Cables Ltd', amount: 62400000, currency: 'KES',
    paymentDate: '2026-08-20T00:00:00Z', scheduledDate: '2026-08-22T00:00:00Z',
    method: 'BANK_TRANSFER', status: 'COMPLETED', projectId: 'proj-001', costCentreId: 'cc-001',
    isFixture: true, tenantId: 'ketraco', createdAt: '2026-08-20T00:00:00Z',
  },
  {
    paymentId: 'pay-003', paymentNumber: 'PAY-2026-1052', invoiceId: 'inv-004', invoiceNumber: 'INV-KMC-2026-210',
    supplierName: 'KEPSA Maintenance Co.', amount: 55680000, currency: 'KES',
    scheduledDate: '2026-09-10T00:00:00Z',
    method: 'BANK_TRANSFER', status: 'SCHEDULED', costCentreId: 'cc-002',
    isFixture: true, tenantId: 'ketraco', createdAt: '2026-09-01T00:00:00Z',
  },
];

export const FIXTURE_PROJECTS: FinanceProject[] = [
  {
    projectId: 'proj-001', projectCode: 'PRJ-2026-001', name: 'Loyangalani-Suswa 400kV HVDC Transmission Line',
    description: '422km HVDC transmission line from Loyangalani to Suswa substation',
    department: 'Engineering', manager: 'Eng. James Mwangi',
    totalBudget: 1280000000, committedAmount: 1056000000, actualAmount: 768000000,
    paidAmount: 624000000, forecastAmount: 1152000000, costToComplete: 384000000,
    forecastCompletionCost: 1152000000, variance: -48000000, variancePct: -3.75,
    startDate: '2025-04-01T00:00:00Z', expectedEndDate: '2027-06-30T00:00:00Z',
    status: 'IN_PROGRESS', capexOpex: 'CAPEX', isFixture: true, tenantId: 'ketraco', createdAt: '2025-04-01T00:00:00Z',
  },
  {
    projectId: 'proj-002', projectCode: 'PRJ-2026-002', name: 'Embu-Meru 220kV Transmission Line',
    description: '186km 220kV double circuit line connecting Embu and Meru substations',
    department: 'Engineering', manager: 'Eng. Grace Wambui',
    totalBudget: 1020000000, committedAmount: 816000000, actualAmount: 528000000,
    paidAmount: 432000000, forecastAmount: 912000000, costToComplete: 384000000,
    forecastCompletionCost: 912000000, variance: -108000000, variancePct: -10.59,
    startDate: '2025-06-01T00:00:00Z', expectedEndDate: '2027-03-31T00:00:00Z',
    status: 'IN_PROGRESS', capexOpex: 'CAPEX', isFixture: true, tenantId: 'ketraco', createdAt: '2025-06-01T00:00:00Z',
  },
  {
    projectId: 'proj-003', projectCode: 'PRJ-2026-003', name: 'Nairobi Metro Grid Reinforcement',
    description: 'Urban grid reinforcement including new 132kV substations',
    department: 'Engineering', manager: 'Eng. Peter Omondi',
    totalBudget: 640000000, committedAmount: 384000000, actualAmount: 192000000,
    paidAmount: 160000000, forecastAmount: 576000000, costToComplete: 384000000,
    forecastCompletionCost: 576000000, variance: -64000000, variancePct: -10.0,
    startDate: '2026-01-01T00:00:00Z', expectedEndDate: '2027-12-31T00:00:00Z',
    status: 'IN_PROGRESS', capexOpex: 'CAPEX', isFixture: true, tenantId: 'ketraco', createdAt: '2026-01-01T00:00:00Z',
  },
];

export const FIXTURE_LINEAGE: FinanceLineageRecord[] = [
  {
    lineageId: 'lin-001', entityKind: 'Budget', entityId: 'bud-001', batchId: 'bat-001', sourceId: 'src-sap-001',
    transformationType: 'SOURCE_RECEIVE', transformationRule: 'SAP_BUDGET_IMPORT_V2',
    isFixture: true, environment: 'development', tenantId: 'ketraco', occurredAt: '2026-09-01T08:00:00Z',
  },
  {
    lineageId: 'lin-002', entityKind: 'Budget', entityId: 'bud-001', parentLineageId: 'lin-001',
    transformationType: 'VALIDATE', transformationRule: 'BUDGET_AMOUNT_CHECK',
    isFixture: true, environment: 'development', tenantId: 'ketraco', occurredAt: '2026-09-01T08:02:00Z',
  },
  {
    lineageId: 'lin-003', entityKind: 'Budget', entityId: 'bud-001', parentLineageId: 'lin-002',
    transformationType: 'NORMALIZE', transformationRule: 'CURRENCY_KES_NORMALIZE',
    isFixture: true, environment: 'development', tenantId: 'ketraco', occurredAt: '2026-09-01T08:03:00Z',
  },
  {
    lineageId: 'lin-004', entityKind: 'Budget', entityId: 'bud-001', parentLineageId: 'lin-003',
    transformationType: 'GRAPH_CREATE_NODE', transformationRule: 'BUDGET_NODE_CREATE',
    fromEntityKind: 'FinanceRecord', toEntityKind: 'Budget',
    isFixture: true, environment: 'development', tenantId: 'ketraco', occurredAt: '2026-09-01T08:05:00Z',
  },
  {
    lineageId: 'lin-005', entityKind: 'Commitment', entityId: 'com-001', batchId: 'bat-002', sourceId: 'src-ariba-002',
    transformationType: 'SOURCE_RECEIVE', transformationRule: 'ARIBA_PO_IMPORT',
    isFixture: true, environment: 'development', tenantId: 'ketraco', occurredAt: '2026-09-01T07:15:00Z',
  },
  {
    lineageId: 'lin-006', entityKind: 'Commitment', entityId: 'com-001', parentLineageId: 'lin-005',
    transformationType: 'RESOLVE_ENTITY', transformationRule: 'SUPPLIER_MATCH_BY_TAX_ID',
    fromEntityKind: 'Supplier', toEntityKind: 'Commitment',
    isFixture: true, environment: 'development', tenantId: 'ketraco', occurredAt: '2026-09-01T07:18:00Z',
  },
  {
    lineageId: 'lin-007', entityKind: 'Commitment', entityId: 'com-001', parentLineageId: 'lin-006',
    transformationType: 'GRAPH_CREATE_EDGE', transformationRule: 'COMMITMENT_TO_BUDGET_EDGE',
    fromEntityKind: 'Commitment', toEntityKind: 'Budget',
    isFixture: true, environment: 'development', tenantId: 'ketraco', occurredAt: '2026-09-01T07:20:00Z',
  },
];

export const FIXTURE_QUALITY: DataQualityScore[] = [
  {
    qualityId: 'dq-001', batchId: 'bat-001', sourceId: 'src-sap-001',
    completenessScore: 0.96, validityScore: 0.94, uniquenessScore: 0.99,
    consistencyScore: 0.92, timelinessScore: 0.98, referentialIntegrityScore: 0.95,
    sourceReliabilityScore: 0.97, overallScore: 0.96,
    isFixture: true, calculatedAt: '2026-09-01T08:20:00Z',
  },
  {
    qualityId: 'dq-002', batchId: 'bat-002', sourceId: 'src-ariba-002',
    completenessScore: 0.98, validityScore: 0.97, uniquenessScore: 1.0,
    consistencyScore: 0.95, timelinessScore: 0.96, referentialIntegrityScore: 0.93,
    sourceReliabilityScore: 0.98, overallScore: 0.97,
    isFixture: true, calculatedAt: '2026-09-01T07:35:00Z',
  },
];
