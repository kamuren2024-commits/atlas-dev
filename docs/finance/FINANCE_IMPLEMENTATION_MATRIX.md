# FINANCE INTELLIGENCE — IMPLEMENTATION MATRIX

**Program:** Salience Atlas / KETRACO Enterprise Intelligence OS
**Module:** Finance Intelligence (FIN-INTEL)
**Phase Reference:** Directive Phases 00 → 18
**Generated:** Phase 00 Audit Output
**Dependency:** FINANCE_ARCHITECTURE_AUDIT.md (GATE-00 findings)

---

## MATRIX CONVENTIONS

| Column | Meaning |
|---|---|
| **DIRECTIVE PHASE** | The numbered phase from the Master Directive (00 → 18) |
| **TASK ID** | Finer-grained deliverable within the phase |
| **WHAT TO BUILD** | Concrete artifact or capability |
| **REUSE FROM** | Specific existing Atlas component / pattern reused |
| **WHERE (PATH)** | File system target location |
| **GATE CRITERIA** | What "done" means |
| **EST. COMPLEXITY** | LOW / MEDIUM / HIGH / CRITICAL |
| **DEPENDENCIES** | Task IDs that must be complete first |

---

## PHASE 00 — DISCOVERY + ARCHITECTURE AUDIT

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 00-01 | FINANCE_ARCHITECTURE_AUDIT.md | Audit pattern | `docs/finance/` | ✅ GENERATED | LOW | (none) |
| 00-02 | FINANCE_IMPLEMENTATION_MATRIX.md | This file | `docs/finance/` | ✅ GENERATED | LOW | 00-01 |
| 00-03 | FINANCE_DATA_MAP.md | Domain model conventions | `docs/finance/` | PENDING | LOW | 00-01 |
| 00-04 | FINANCE_GRAPH_MAP.md | GRID_GRAPH_SCHEMA pattern | `docs/finance/` | PENDING | LOW | 00-01 |
| 00-05 | FINANCE_INTELLIGENCE_MASTER.md | CHANGELOG pattern from Audit §9 | `docs/finance/` | PENDING | LOW | 00-01..04 |

---

## PHASE 01 — FINANCE DATA FABRIC

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 01-01 | `packages/domain` Finance entity type exports (FinancialPeriod, FiscalYear, Account, ChartOfAccounts, CostCentre, ProfitCentre, Department, Budget, BudgetLine, BudgetRevision, BudgetAllocation, Commitment, Encumbrance, PurchaseOrder, Invoice, Payment, Receipt, Journal, JournalEntry, Expense, Revenue, Funding, Grant, Loan, Liability, Receivable, Payable, CashAccount, BankTransaction, AssetValue, Depreciation, CAPEX, OPEX, ProjectFinance, ProjectCost, CostToComplete, Forecast, Scenario, FinancialRisk, FinancialDecision, FinancialRecommendation, FinancialMetric, FinancialReport) | Existing `AssetKind`, `Mission`, `GeoLocation` patterns in [domain/index.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/packages/domain/index.ts) | `packages/domain/index.ts` — append Finance types block | TS compiles; every entity has `id`, `externalId?`, `sourceSystem?`, `status`, `owner`, `effectiveDate`, `createdAt`, `updatedAt`, `version`, `provenance?`, `tenantId` | HIGH | 00-05 |
| 01-02 | `packages/contracts` PHASE11_FINANCE events + route contracts | Existing PHASE0..10 pattern in [contracts/index.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/packages/contracts/index.ts) | Same file, append block | ≥ 30 event types, ≥ 25 route contracts defined | MEDIUM | 01-01 |
| 01-03 | `packages/graph-schema` Finance node/edge types | [GRID_GRAPH_SCHEMA](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/packages/graph-schema/index.ts) node/edge arrays | Same file, append Finance `nodeTypes` and `edgeTypes` | Graph schema validates against cross-domain relationships from §4 of directive | MEDIUM | 01-01 |
| 01-04 | `packages/ui` Finance UI panel contracts | [PHASE0_UI_CONTRACTS](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/packages/ui/index.ts) pattern | Same file, append `PHASE11_FINANCE_UI_CONTRACTS` | 1 panel per core capability (Budget, Commitment, Project Finance, CAPEX, OPEX, Cash, Forecast, Scenario, Risk, Anomaly, Copilot, Decision) | LOW | 01-01 |
| 01-05 | Database migration: `003_finance_schema` SQL | [db-core.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/database/db-core.ts) existing migration pattern + `bidders/documents/pipeline_stages/audit_logs/...` tables | Add to `migrationsList` array in `DatabaseCore.runMigrations()` | ≥ 25 new `finance_*` tables created, FK chains validated, migration applies idempotently | CRITICAL | 01-01 |
| 01-06 | Repositories: BudgetRepository, CommitmentRepository, InvoiceRepository, PaymentRepository, JournalRepository, ForecastRepository, ScenarioRepository, FinancialMetricRepository, FinancialRiskRepository, FinancialDecisionRepository | [TenderRepository](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/database/repositories.ts#L196-Lf) pattern | New file: `backend/database/finance-repositories.ts` OR append inline to existing repositories.ts (prefer append for single import surface) | CRUD + query methods for every entity in 01-01. 100% table coverage. | HIGH | 01-05 |
| 01-07 | `FinanceSourceRegistry` — list of registered source systems (ERP, SAP, Ariba, Bank, Excel, CSV, API, Project-Systems, Procurement-Systems, Asset-Systems, Operational-Systems, External-Data) | ConnectorConfig + ConnectorRegistry pattern in [connector-framework.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/integration/connector-framework.ts) | `backend/finance/source-registry.ts` | Registry exposes `list()`, `register()`, `get()`, `health()`; 11 source system prototypes registered as templates | LOW | 01-05 |
| 01-08 | `FinanceDataCatalog` — dataset metadata registry (owned by, owner, steward, refresh frequency, PII classification, lineage) | `MasterDataService` pattern in [master-data-service.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/integration/master-data-service.ts) | `backend/finance/data-catalog.ts` | ≥ `listCatalogEntries`, `getDataset`, `registerDataset`, `updateLineage` | LOW | 01-07 |
| 01-09 | `FinanceDataConnector` abstract + 3 starter concrete (ExcelConnector, CsvConnector, MockErpConnector for dev-fixtures) | `BaseConnector` abstract in [connector-framework.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/integration/connector-framework.ts), extend it | `backend/finance/connectors/` subfolder: `base-finance-connector.ts`, `excel-connector.ts`, `csv-connector.ts`, `mock-erp-connector.ts` | Each connector implements `test()`, `sync()`, `health()`; Excel/Csv accept file upload buffer or path; MockErp returns fixture data explicitly tagged FIXTURE | MEDIUM | 01-07,01-08 |
| 01-10 | `FinanceDataNormalizer` — normalizes incoming records to canonical Finance entities (from connector-specific schema → canonical TS types from 01-01) | Event `normalizer.ts` in [event-fabric/normalizer.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/event-fabric/normalizer.ts) | `backend/finance/normalizer.ts` | Normalizer returns typed Finance entities + `normalization_warnings[]` per record. At least Excel sheet→Budget, Excel sheet→Invoice, Excel sheet→Payment pipelines working | MEDIUM | 01-01,01-09 |
| 01-11 | `FinanceDataValidator` — per-entity rules (type checks, referential integrity, date ordering, sign rules, currency consistency, fiscal period boundaries) | `CrossFieldValidationEngine` pattern in [evaluation-engine.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/evaluation/evaluation-engine.ts#L246-Lf) | `backend/finance/validator.ts` | Validator returns `{ isValid: boolean, issues: [{code, severity, entity, field, message}] }` with deterministic severity codes not AI-derived | MEDIUM | 01-01,01-10 |
| 01-12 | `FinanceDataProfiler` — column-level cardinality, null-rate, min/max, distribution hints, duplicates, outliers, top-N values | `DocumentQualityAssessor` pattern for structure vs quality in [evaluation-engine.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/evaluation/evaluation-engine.ts#L180-Lf) | `backend/finance/profiler.ts` | Returns `DataProfile` per dataset. Used for Excel Phase 02 preview. | LOW | 01-09 |
| 01-13 | `FinanceDataQualityEngine` — scores quality (completeness, uniqueness, validity, accuracy proxy, timeliness, consistency) | `MEDIA_QUALITY_GATE_RULES` pattern in [ingestion/index.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/services/ingestion/index.ts) | `backend/finance/data-quality-engine.ts` | Returns 0-100 score + 6 dimension scores. Never random; formula documented in engine. | MEDIUM | 01-11,01-12 |
| 01-14 | `FinanceDataLineage` — record-level lineage tracker (sourceSystem → connector → normalizer → validator → canonical entity → graph node → metric → dashboard UI). Every transformation step tracked. | `EvidenceCorrelation` pattern in repositories.ts | `backend/finance/lineage.ts` | Any Finance entity retrievable with its lineage chain: `getLineage(entityId) → [{step, actor, timestamp, inputHash, outputHash, rule}]` | HIGH | 01-06,01-10 |
| 01-15 | `FinanceEntityResolver` — resolve Supplier, CostCentre, Account, Project from free-text / partial-key / synonym input (used in Excel upload and copilot lookups) | `EntityResolutionEngine` in [entity-resolution.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/evaluation/entity-resolution.ts) | `backend/finance/entity-resolver.ts` | `resolve(entityType, query)` → candidates[] with deterministic match quality score (Jaro-Winkler + synonym dictionary + edit distance). No AI scores. | MEDIUM | 01-01,01-06 |
| 01-16 | `/api/finance/data-fabric/*` REST API surface + mounting in server.ts | SCM `/api/scm/*` pattern in [server.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/server.ts#L1192-Lf) | New file: `backend/finance/routes/data-fabric-routes.ts` + import+mount in server.ts | Endpoints: GET /health, POST /connectors/{id}/sync, GET /connectors, GET /catalog, POST /upload/excel, POST /upload/csv, POST /validate, POST /normalize, GET /lineage/{entityId}, GET /quality/{datasetId} | MEDIUM | 01-06..01-15 |
| 01-17 | Redis workers: `finance_reconciliation`, `finance_ingestion_batch` | Existing pattern in [server.ts#L131-L152](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/server.ts#L131-L152) | Append to same `redisService.registerWorker()` block | 2 workers registered, process next job on queue enqueue | LOW | 01-16 |
| 01-18 | Authorization — Finance roles + permissions + ABAC thresholds | `AuthorizationService.ROLE_PERMISSIONS` in [authorization-service.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/security/authorization-service.ts#L9-L44) | Append Finance block to existing map | New roles: CFO, FINANCE_DIRECTOR, FPA_MANAGER, TREASURY_ANALYST, COST_ACCOUNTANT, INTERNAL_AUDIT_FINANCE. ≥ 20 finance-specific permissions. ABAC: Delegation-of-authority thresholds (e.g. < KES 500k = Cost Accountant, < 5M = Finance Director, ≥ 5M = CFO + Board). Period close lock ABAC. Journal segregation (poster ≠ approver). | HIGH | 00-05 |

**GATE 01 PASS:** Task 01-05 runs against test DB; 01-06 CRUD round-trips for 6 core entities; 01-16 endpoints alive via `/health`; 01-18 policy unit tests pass.

---

## PHASE 02 — EXCEL FINANCE INTELLIGENCE (FLAGSHIP)

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 02-01 | Excel/CSV upload endpoint with resumable session | DroneMediaIngestionService pattern in [services/ingestion/index.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/services/ingestion/index.ts) — session + chunk model | `backend/finance/excel-ingestion-service.ts` (reuse same session semantics) | `createUploadSession()`, `applyChunk()`, `finalizeWorkbook()` API works for Excel (xlsx via a library like `xlsx` if available; if library absent: install `xlsx` as dependency and document). Respect Rule 28: Never silently overwrite source data | MEDIUM | 01-09,01-16 |
| 02-02 | Workbook inspector: sheet enumeration, row counts, table detection, header detection, formula audit, merged cells, hidden sheets, currency detection, date column detection, totals row detection | New, but quality-gate rules pattern from MEDIA_QUALITY_GATE_RULES | `backend/finance/excel-intelligence/workbook-inspector.ts` | Returns `WorkbookProfile` with per-sheet info | HIGH | 02-01 |
| 02-03 | Schema inference engine for sheets → candidate Finance entity types | `FinanceEntityResolver` + type classifier from column headers + column content heuristics | `backend/finance/excel-intelligence/schema-inferencer.ts` | Given a sheet, returns ranked candidate entities: `[{entity: 'BudgetLine', confidence: 0.92, fieldMappings: {...}}]`. Confidence is deterministic (feature weight sum), not LLM | HIGH | 01-15,02-02 |
| 02-04 | Ontology mapping: columns → canonical Account/CostCentre/Project/Supplier/Department | FinanceEntityResolver plus MasterDataService lookups | `backend/finance/excel-intelligence/ontology-mapper.ts` | Produces `OntologyMapping{column, targetEntity, targetField, resolver, matchQuality, evidence[]}` | MEDIUM | 02-03,01-15 |
| 02-05 | Field-level value validation (currency codes, fiscal period membership, sign conventions, IBAN-like sanity for bank refs, numeric range vs type) | FinanceDataValidator with Excel-specific overrides | `backend/finance/excel-intelligence/field-validator.ts` | Returns validation result per cell range | MEDIUM | 01-11,02-04 |
| 02-06 | Data quality scoring per workbook / per sheet | FinanceDataQualityEngine scoped to workbook | Uses 01-13 | `WorkbookQualityScore` (0-100) + 6 dims with source features | LOW | 01-13,02-02 |
| 02-07 | Duplicate + missing + anomaly detection in workbook rows | `CollusionDetectionEngine` + duplicate detection patterns | `backend/finance/excel-intelligence/anomaly-detector.ts` | Duplicate detection deterministic (hash keys). Missing: null ratio per column with configured thresholds. Anomaly: Z-score (if n≥30) or IQR for small samples | MEDIUM | 01-12,02-02 |
| 02-08 | Reconciliation — 2-way match (uploaded totals vs expected), 3-way match (PO-Invoice-amount) if both exist in workbook | VerificationFramework pattern in [verification-framework.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/integration/verification-framework.ts) | `backend/finance/excel-intelligence/reconciler.ts` | Outputs `ReconciliationReport {matches[], mismatches[], unmatched[], netDiff}` | HIGH | 01-06,02-05 |
| 02-09 | Aggregate outputs: WorkbookProfile, DataQualityReport, OntologyMapping (JSON), FinancialReconciliation, AnomalyReport, ImportPreview — served as API response + not written to canonical tables until user confirms | All previous 02-* outputs bundled | Bundle logic inside `finalizeWorkbook()` route response | Preview payload ≤ 500 rows or paginated; NO canonical writes on preview | LOW | 02-01..02-08 |
| 02-10 | Confirm-import action: applies preview to canonical tables, emits events `FIN.IMPORT_RECORDED`, records provenance `provenance.source = 'EXCEL_IMPORT::{workbookId}'`, attaches workbook hash (SHA-256) — per Rule 28: source workbook file also saved to `data/finance/uploads/` with hash, never overwritten | EventBus + provenance fields on all Finance entities; DB `finance_import_batches` table | `POST /api/finance/excel/{sessionId}/confirm` | Confirm creates batch record, all inserted rows carry `importBatchId` → FK; source file persisted with hash; idempotent on duplicate sessionId | HIGH | 01-05,02-09 |
| 02-11 | Frontend: Excel Upload flow component — drag-drop, session progress, Workbook Profile accordion, Data Quality Report panel, Ontology Mapping review (user corrects mappings before confirm), Anomaly Report, Import Preview grid, Confirm-Import with double-sign pattern (import + approve checkboxes) | TenderStudio pattern + ScmCopilot contextual AI buttons | `src/components/ketraco/finance/ExcelFinanceIntelligence.tsx` | Full UX flow uploads 3 workbooks correctly against dev fixtures. | HIGH | 02-01,02-09,01-18 |
| 02-12 | Frontend: Excel Upload route + module nav entry | App.tsx menuItems → add 'finance-intelligence' or embed under broader Finance module shell | Append case in `activeModule` switcher in [App.tsx](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/src/App.tsx) | Route `/finance/excel` loads Excel Finance component | LOW | 02-11 |

**GATE 02 PASS:** Excel workbook with 3 sheets (Budget Lines, Invoices, Payments) produces correct canonical entities through confirm-import. Every entity queryable by importBatchId with full lineage chain.

---

## PHASE 03 — FINANCE SEMANTIC LAYER

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 03-01 | `FinancialMetric` entity + DB table `finance_metrics` with columns: metricId, name, description, formula (structured expression AST or JSON-formula string), source[], dimensions[], refreshFrequency, owner, permissions[], lineage, version | 01-01 entity definitions | 01-05 already defines table; this task = concrete implementation of the definition | Table exists; ≥ 1 seed rows for each of the 20 mandatory metrics | HIGH | 01-05 |
| 03-02 | Mandatory 20 metric catalog definitions (Revenue, OPEX, CAPEX, Budget, Actual, Commitments, Available Budget, Budget Utilization, Budget Variance, Forecast Variance, Cash Balance, Cash Inflow, Cash Outflow, Accounts Payable, Accounts Receivable, Working Capital, Debt, Liquidity, Project Cost, Cost To Complete, Financial Exposure) | 03-01 rows | `backend/finance/metric-catalog.ts` — default seed catalog | 21 definitions; every formula is a deterministic parseable string (not prose). E.g. "BudgetUtilization = Actual / Budget * 100" | HIGH | 03-01 |
| 03-03 | Metric Computation Engine — evaluates formula against canonical tables, respects dimensions (period, cost-centre, project, etc.), returns MetricValue | FinancialMetric + repositories; use an expression evaluator (new JS tiny expression evaluator inline — no new lib unless needed) | `backend/finance/metric-engine.ts` | `compute(metricId, filters) → MetricValue{value, asOf, dimensionsApplied, inputs[], calculationTrace[]}`. Every value has deterministic calculationTrace for audit | CRITICAL | 03-02,01-06 |
| 03-04 | Metric API routes: GET /metrics (list catalog), GET /metrics/{id}/definition, POST /metrics/compute, POST /metrics/batch-compute, GET /metrics/{id}/lineage | SCM telemetry API pattern | `backend/finance/routes/metric-routes.ts` | All 5 endpoints respond; smoke test computes BudgetUtilization for test fixture project | MEDIUM | 03-03,01-16 |
| 03-05 | Frontend: Metric Catalog browser (definition + formula + lineage) + Metric Explorer UI for dimension filters | TenderEvaluationWorkspace pattern | `src/components/ketraco/finance/MetricCatalog.tsx`, `MetricExplorer.tsx` | Render 21 catalog entries; any metric explorable by period + cost-centre | MEDIUM | 03-04 |
| 03-06 | Frontend: No-undefined-metric rule enforcement — any Finance UI panel that displays a KPI must reference a metricId; at render time verify definition exists in catalog. Violation: UI renders placeholder grey badge "UNREGISTERED METRIC". Engineering rule #3 phase 03. | N/A — runtime hook | Add useMetricGuard() React hook; wrap KPI renders | Static code review + runtime checks confirm no orphan numeric KPIs exist | LOW | 03-02 |

**GATE 03 PASS:** Manual + automated review confirms every Finance KPI in UI resolves to a registered metric with a formula. `POST /metrics/compute` returns calculationTrace for 6 sample metrics.

---

## PHASE 04 — BUDGET INTELLIGENCE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 04-01 | Budget Management CRUD + full lifecycle service (Draft → Submitted → Approved → Active → Revision-Requested → Amended → Archived → Closed) | Workflow Engine pattern; existing `pipeline_stages` pattern | `backend/finance/budget-service.ts` | 8 budget states with valid transitions; state machine unit tests | HIGH | 01-06,04-null (start) |
| 04-02 | Budget Allocation engine — distribute Budget amounts across lines/dimensions (Department, CostCentre, Project, Program, Account, Period, FundingSource, CAPEX/OPEX). Allocations are immutable entries; never modify parent Budget directly (creates Revision on conflict). | Workflow Checkpoint pattern; immutable entry pattern from LedgerEnginePanel but done correctly with sha256 chains | `backend/finance/allocation-engine.ts` | `allocate(budgetId, lines[]) → AllocationResult` emits events + writes rows | HIGH | 04-01,01-05 |
| 04-03 | Budget Revision — controlled mutation path. Creates `BudgetRevision` row with justification, version-bump, delta list, approval workflow requirement | RuleEngine: budget revision as approval workflow; DecisionApprovalCenter UI pattern | `backend/finance/budget-revision-service.ts` + workflow WF_BUDGET_REVISION | Every revision leaves an immutable audit chain | MEDIUM | 04-01 |
| 04-04 | Budget Utilization calculation = Actual + Commitments vs Approved, by dimension. Metric engine in 03-03 provides the number; Budget service provides breakdown drill-down. | 03-03 MetricEngine output | Append dimensional drill methods to metric-engine.ts or wrap in budget-service | Drill-down from Utilization % → 2 levels | MEDIUM | 03-03 |
| 04-05 | Budget Variance + primary drivers (which cost-centre / account / project lines are the top 5 contributors to over/underspend). Deterministic driver ranking by absolute variance. | New analytical, but use existing ranking patterns from RiskAssessmentService | `backend/finance/variance-driver-analyzer.ts` | `analyzeVariance(budgetId) → {overallVariance, topDrivers[{dimension,value,delta,pctOfTotal}], trend}` | MEDIUM | 04-04 |
| 04-06 | Budget Burn Rate — actuals per day / week / period, extrapolated EOY projection, naive linear + moving-average extrapolation (no confidence — not a forecast model yet) | NationalForecastWall display pattern; calculation inline | `backend/finance/burn-rate.ts` | Returns burn rates; deterministic extrapolation endpoints; no confidence numbers | LOW | 04-04 |
| 04-07 | Budget Forecast (simple) — linear burn-rate project forward; mark as `FORECAST_METHOD = BURN_RATE_LINEAR`; phase 10 forecasting replaces this. | 04-06 outputs | budget-service.ts methods | Explicitly labeled SIMPLE method in Forecast table modelVersion | LOW | 04-06,10-null |
| 04-08 | Budget Reallocation Analysis — given underspent line X and overspent line Y, quantify reallocation feasibility (amount available, periods remaining, funding source compatibility, approval level required) | Variance + Allocation engines together | `backend/finance/reallocation-analyzer.ts` | `analyzeReallocations(budgetId) → candidates[]` with feasibility score (rule based) | MEDIUM | 04-02,04-05 |
| 04-09 | Budget Risk scoring — deterministic risk score = function(pct_utilized vs period_elapsed, variance_acceleration, available_buffer, commitments_pipeline). Scale 0-100. | RiskAssessmentService pattern in [services/risk/index.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/services/risk/index.ts) | `backend/finance/budget-risk.ts` | `scoreBudgetRisk(budgetId) → {riskLevel, score, drivers, evidence, mitigations}` | MEDIUM | 04-06,04-05,01-05 |
| 04-10 | Material variance explanation generator — if |variance| ≥ 10% OR absolute_variance ≥ threshold, generate AI-crafted narrative (via AIGateway) grounded on: primary drivers, trend line, commitments pipeline, Forecast 04-07 impact, and candidate 04-08 reallocations. | ExecutiveIntelligenceService.buildBrief pattern + AIGateway LLM call | `backend/finance/variance-narrative.ts` | Narrative returned with citations = driver rows. If drivers absent → return "INSUFFICIENT DATA" instead of hallucinating | MEDIUM | 04-05,04-07,04-08,01-03 (LLM) |
| 04-11 | Frontend: Budget Workspace — list, create/edit, lifecycle, allocations drill, variances table, driver analysis, burn chart, reallocation suggestions, risk badge | ProjectSupplyNexus UX conventions | `src/components/ketraco/finance/BudgetWorkspace.tsx` | Full budget CRUD + drill into 1 sample budget from fixtures | HIGH | 04-01..04-10 |
| 04-12 | API routes `/api/finance/budgets/*` | SCM routes pattern | `backend/finance/routes/budget-routes.ts` | CRUD + compute endpoints | MEDIUM | 04-11 |

**GATE 04 PASS:** Budget created → approved → allocation created → actuals fixture → variance narrative generated with driver list displayed in UI.

---

## PHASE 05 — COMMITMENT + EXPENDITURE INTELLIGENCE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 05-01 | Commitment service with full entity lifecycle + 3-tier: Draft (from tender event) → Firm (PO issued) → Obligated (contract signed). Encumbrance table updated parallel. | Budget 04-01 lifecycle pattern; Events from SCM (I1-I3 in audit) | `backend/finance/commitment-service.ts` | Events subscriptions for SCM.TENDER_AWARDED, SCM.PO_ISSUED, SCM.CONTRACT_EXECUTED → automatic lifecycle transitions | HIGH | 01-06, 00 (§5 I1/I2/I3) |
| 05-02 | Tender → Contract → PO → Commitment → Invoice → Payment chain integrity with referential links + chain integrity hash every step. Deterministic `chainHash` field. | LedgerEnginePanel hash pattern but cryptographically via crypto service | `backend/finance/expenditure-chain.ts` | `buildChain(referenceId) → {steps[], chainValid, lastHash, breaks[]}` | HIGH | 05-01, cryptography-service |
| 05-03 | Pipeline calculation per Budget line: Approved Budget − Committed − Invoiced − Paid = Remaining. Compute all 7 buckets (Approved/Committed/Invoiced/Paid/Remaining/Forecast/Available) | 03 metric-engine with chain filters; inline computation helper methods | `backend/finance/commitment-pipeline.ts` | `computePipeline(budgetLineId) → 7-tuple` with trace to every source row | MEDIUM | 05-02,03-03 |
| 05-04 | Over-commitment detection — rules: Commitments > Budget; Commitments > Remaining after pipeline; Commitment acceleration above trailing-3-month average + 2σ. Deterministic. | CollusionDetectionEngine anomaly pattern | `backend/finance/detectors/overcommitment-detector.ts` | `scan(budgetId) → findings[]` with severity + evidence | MEDIUM | 05-03 |
| 05-05 | Budget exhaustion monitoring: Budget forecast runway (days) = remaining_daily_burn / remaining_balance. Below-threshold alerts. | Burn Rate 04-06 | `backend/finance/detectors/exhaustion-monitor.ts` | `runwayDays(budgetId)` | LOW | 04-06,05-03 |
| 05-06 | Duplicate commitment detection (same supplier, same contract reference, same amount ±0.5%, within 30 days) | CollusionDetectionEngine | `backend/finance/detectors/duplicate-commitment-detector.ts` | Deterministic scan produces evidence rows | LOW | 05-01 |
| 05-07 | Unusual commitment growth detection: month-over-month %, YoY %, peer-group quartile comparison within cost-centre. | Predictive baseline pattern; statistical inline | `backend/finance/detectors/commitment-growth-detector.ts` | Uses 3 trailing months if data exists; degrades gracefully ("insufficient history" when n<3) | LOW | 05-01 |
| 05-08 | Unfunded commitments: Commitments lacking a budget-allocation match; detected via missing / unmatched `BudgetAllocation.ref` | 04-02 Allocation engine refs | `backend/finance/detectors/unfunded-commitment-detector.ts` | `scan() → commitmentsWithoutAllocation[]` | LOW | 04-02,05-01 |
| 05-09 | Late invoices: Invoice date vs receipt date window, invoice-to-payment aging buckets (30/60/90/>90 days) | Aging pattern vanilla | `backend/finance/detectors/invoice-aging-detector.ts` | Aging buckets with supplier counts + totals | LOW | 05-01 |
| 05-10 | Payment bottlenecks: Invoices Approved > N days awaiting Payment release, by approver / cost-centre / workflow-stage | Workflow engine pending queue stats | `backend/finance/detectors/payment-bottleneck-detector.ts` | `detect() → bottlenecks[{stage, count, avgDays, topApprover}]` | LOW | Workflow |
| 05-11 | Frontend: Commitment & Expenditure workspace — pipeline dashboard, chain integrity view, alerts list from detectors 05-04 to 05-10 | ProcurementWatchCenter display pattern | `src/components/ketraco/finance/CommitmentExpenditure.tsx` | Pipeline 7-tuple rendered for ≥1 budget; at least one detector finding rendered as clickable alert | HIGH | 05-03..05-10 |
| 05-12 | API routes `/api/finance/commitments/*` + alerts | Standard pattern | `backend/finance/routes/commitment-routes.ts` | CRUD + pipeline + alerts endpoints alive | MEDIUM | 05-11 |

**GATE 05 PASS:** Fixture with 1 budget line, 2 POs, 3 invoices, 2 payments. Pipeline 7-tuple calculates correctly. Duplicate commitment detection fires on 1 seeded duplicate. Aging 60+ shows 1 seeded late invoice.

---

## PHASE 06 — PROJECT FINANCE INTELLIGENCE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 06-01 | Project ↔ Budget link + HAS_BUDGET graph edge (populate graph after confirm) | 01-03 GRAPH_SCHEMA edge types + 05-01 commitment pipeline; Graph correlation in services/graph | `backend/finance/project-finance-service.ts` — plus graph node creation in KnowledgeGraphService after Finance writes | Projects ontology node connected via graph | HIGH | 05-03, 01-03, KnowledgeGraphService |
| 06-02 | Project cost pipeline (Approved / Revised / Actual / Commitments / Forecast) computed per project id across all linked budget lines. | 05-03 pipeline pattern scoped by project | project-finance-service.ts aggregation methods | 5-tuple for a project; trace per budget line | MEDIUM | 06-01,05-03 |
| 06-03 | Cost-To-Complete (CTC) Engine — Estimate At Completion (EAC) methods: EAC = Actual + (Budget − Actual) × (CPI⁻¹) if Actuals>0; CPI = Actual / Earned. Earned = Budget × physical_progress_% (linked to project phase if available). Degrades gracefully to linear when no physical progress. | PredictiveService pattern; all formulas documented inline | `backend/finance/cost-to-complete-engine.ts` | `computeCTC(projectId) → {EAC, CTC, method, inputs, assumptions: [], fallbackUsed}` — no confidence values | HIGH | 06-02 |
| 06-04 | Physical vs Financial Progress tracking. Physical progress from Projects module (if provided via event). Financial progress = Actual / ApprovedBudget. Schedule Variance SV = (Physical% − Financial%). Cost Variance CV = EarnedValue − ActualCost | CPI calculation in 06-03 | `backend/finance/project-progress.ts` | If physical data absent, render FINANCIAL ONLY banner | MEDIUM | 06-03 |
| 06-05 | Forecast Final Cost = CTC from 06-03 + actual so far. Mark modelVersion as `PROJECT_FINANCE_V1` | 06-03 | Append to forecast rows (entity in 01-05 table) with forecastMethod = EAC_CPI | LOW | 06-03,10-null |
| 06-06 | Funding Position — sum of Funding allocations to project − Commitments; identify funding gap | Funding entity; Allocation engine patterns | `backend/finance/funding-position.ts` | `position(projectId) → {funded, committed, gap}` | LOW | 04-02,05-03 |
| 06-07 | Project Financial Health Score (0-100). Weighted deterministic index = CostVariance(30%) + ScheduleVariance(25%) + BudgetUtilization(15%) + BurnRunway(15%) + FundingGapAbsence(15%). Thresholds: ≥80 Healthy, 60-79 Watch, 40-59 At Risk, <40 Critical | Similar to networkHealthScore 84 pattern in ExecutiveIntelligence | `backend/finance/project-health.ts` | `score(projectId) → {score, level, components[], contributors}` | MEDIUM | 06-04,04-06,06-06 |
| 06-08 | Cost Overrun Probability. Deterministic mapping: if CPI<0.85 AND project≥30% complete → HIGH (70%). If CPI<0.95 AND ≥15% → MEDIUM (40%). Otherwise LOW (15%). Do NOT call this AI confidence. Label explicitly as `RISK_RATING`. Rule 11: No random confidence scores. | RiskAssessmentService pattern | `backend/finance/cost-overrun-risk.ts` | `rate(projectId) → {rating: LOW/MEDIUM/HIGH, triggerConditions[], explicitNote_Not_A_Confidence_Interval}` | LOW | 06-03 |
| 06-09 | Project Cash Forecast — by month, outflow = expected payments derived from Commitments × payment terms calendar + CTC phased by remaining duration. | Cash Command Center (Phase 09) scaffolding | `backend/finance/project-cash-forecast.ts` | `forecast(projectId, horizonMonths) → months[]`; degrades to linear spread if calendar absent | MEDIUM | 06-03 |
| 06-10 | Project Funding Risk — commitments > funding, approaching budget ceiling, CPI<0.9 → rating | Funding position + CPI together | `backend/finance/project-funding-risk.ts` | `assess(projectId) → risks[]` | LOW | 06-06,06-08 |
| 06-11 | Frontend: Project Finance dashboard per project — 7-box (Approved/Revised/Actual/Commitments/Forecast/CTC/Funding), CV/SV bullets, Health Scorecard with break-down, CTC method, overrun risk, funding gap, cash forecast mini-chart | GridIntelligenceScorecard layout conventions | `src/components/ketraco/finance/ProjectFinance.tsx` | Single-project drill works for fixture project | HIGH | 06-01..06-10 |
| 06-12 | API routes `/api/finance/projects/*` | Standard pattern | `backend/finance/routes/project-finance-routes.ts` | Per-project endpoints respond | MEDIUM | 06-11 |

**GATE 06 PASS:** Fixture project with 2 budget lines + 3 commitments + partial actuals → all boxes populated. Cash forecast 12 months displayed.

---

## PHASE 07 — CAPEX INTELLIGENCE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 07-01 | CAPEX tagging on Budget + BudgetLine + Commitment + Actual lines (CAPEX/OPEX enum dimension). 04-02 already supports dimension; this task = enforce + seed CAPEX lines. | Budget service 04-01/04-02 dimension handling | Update budget service to require capex/opex classification if project has asset-capitalization flag | Classifications visible + validated | MEDIUM | 04-02,06-01 |
| 07-02 | CAPEX Portfolio aggregation — roll-up across projects/programs to portfolio level | Budget variances + pipeline | `backend/finance/capex/portfolio-service.ts` | Portfolio KPIs: Total Approved, Total Committed, Total Actual, Forecast At Completion, Utilization %, Overrun Count | MEDIUM | 06-02,07-01 |
| 07-03 | Portfolio analytics: CAPEX concentration (top-10 projects share of total), under-spend (<70% at year-mid), overrun (>10% vs baseline), at-risk (Health Score <60), cost-to-complete total, funding gap total. | 04-05 driver analyzer pattern | `backend/finance/capex/portfolio-analytics.ts` | All 7 analytics returned deterministic | MEDIUM | 07-02,06-07,06-06 |
| 07-04 | AssetValue + Depreciation. Simple straight-line + reducing balance methods. Link via graph to Asset entity (Asset HAS_CAPITAL_VALUE → AssetValue). | Graph schema; deprecation formula inline deterministic | `backend/finance/capex/asset-value-service.ts` + graph population | `computeDepreciation(assetId, periods) → schedule[]` | HIGH | 06-01,01-03 AssetValue node |
| 07-05 | Frontend: CAPEX Portfolio dashboard + drill | ScmModules ExecutiveIntelligence KPI block style | `src/components/ketraco/finance/CapexPortfolio.tsx` | Portfolio tiles + drill | MEDIUM | 07-01..07-04 |
| 07-06 | API routes `/api/finance/capex/*` | Standard pattern | `backend/finance/routes/capex-routes.ts` | Portfolio + per-asset depreciation endpoints | LOW | 07-05 |

**GATE 07 PASS:** 3 fixture projects with capex lines → dashboard renders all 7 analytics. Depreciation schedule for 1 asset over 10 years correct by manual calculation.

---

## PHASE 08 — OPEX INTELLIGENCE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 08-01 | OPEX categories (Operations, Maintenance, Personnel, Fleet, Facilities, ICT, Consultancy, Travel, Utilities, Security, Other) as Account/CostCentre classification dimensions. Seed accounts with default category. | Budget classification (07-01) mirror | `backend/finance/opex/categories.ts` | 11 categories defined as enum + seed | LOW | 03-02 metric catalog |
| 08-02 | OPEX trend (period-over-period % change, moving average) per category and total | NationalForecastWall / BurnRate patterns | `backend/finance/opex/trend-service.ts` | `trend(costCentreId?, category?, periods) → series[]` | LOW | 08-01 |
| 08-03 | OPEX driver analysis: top-N categories by absolute contribution to variance; if maintenance is available as operational driver (work order cost from AM), link. | 04-05 variance drivers | `backend/finance/opex/driver-analyzer.ts` | Top-5 variance drivers with drill-down | MEDIUM | 08-02,04-05 |
| 08-04 | OPEX variance per category + total | 04-05 budget variance | Reuse analyzer with OPEX filter | Consistent with Phase 04 | LOW | 04-05 |
| 08-05 | OPEX forecast (simple, same as 04-07) | 04-07 | Reuse pattern | Explicit SIMPLE marker | LOW | 08-02 |
| 08-06 | OPEX anomaly detection (IQR on monthly spend per category, sudden jump on single invoice > category-3-month-average*3) | 02-07 anomaly pattern | `backend/finance/opex/anomaly-detector.ts` | Deterministic anomaly events | LOW | 08-02,02-07 |
| 08-07 | OPEX optimization opportunities: underspent vendor contracts (actual vs contract-commitment), duplicate line-item spends across cost-centres, category concentration | 05-* detectors + sourcing module pattern | `backend/finance/opex/opportunity-scanner.ts` | Opportunities list with evidence | MEDIUM | 08-06,05-* |
| 08-08 | Operational driver link — if maintenance work-order costs are available, OPEX Maintenance forecast adjusts accordingly (else ignored). Deferred without data. | Integration point with future Asset Management; use graph node ASSET_GENERATES_MAINTENANCE_COST → OPEX | `backend/finance/opex/operational-drivers.ts` | If data absent: render "NO OPERATIONAL DRIVER DATA" badge; do not invent | LOW | 06-01 graph |
| 08-09 | Frontend: OPEX Intelligence dashboard — categories, trends, variances, anomalies, forecast panel, optimization opportunities | MetricExplorer style | `src/components/ketraco/finance/OpexIntelligence.tsx` | 11 categories tiled | MEDIUM | 08-01..08-08 |
| 08-10 | API routes `/api/finance/opex/*` | Standard pattern | `backend/finance/routes/opex-routes.ts` | Endpoints alive | LOW | 08-09 |

**GATE 08 PASS:** OPEX fixture data for 6 periods → Trend + variance + 1 seeded anomaly displayed correctly.

---

## PHASE 09 — CASH + TREASURY INTELLIGENCE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 09-01 | CashAccount + BankTransaction tables; transaction ingestion via connectors (01-09) | DB 01-05 entity tables | Implement 01-05 tables with seed data | Tables populated from fixture CSV | HIGH | 01-05,01-09 |
| 09-02 | Cash flow statement computation (Operating/Investing/Financing inflows & outflows). Opening + Closing balance. | Metric engine 03-03 + specific formulas | `backend/finance/cash/flow-engine.ts` | `cashFlow(period) → {operating:{in,out}, investing, financing, opening, closing}` deterministic by category mapping | HIGH | 09-01,08-01 |
| 09-03 | Committed Payments vs Expected Payments vs Paid buckets (from commitment pipeline 05-03 + invoice aging 05-09) | 05-03 pipeline | `backend/finance/cash/payment-timeline.ts` | `outflowBuckets(horizonDays) → {committed, expected, paid, pastDue}` | MEDIUM | 05-03,05-09 |
| 09-04 | Receivables & Payables aging (30/60/90/>90) | 05-09 aging pattern expanded | `backend/finance/cash/aging.ts` | Receivable + payable aging | LOW | 05-09 |
| 09-05 | Working Capital = Current Assets (AR + Cash) − Current Liabilities (AP + short-term debt). Liquidity = Quick Ratio / Current Ratio formulas. | Metric catalog 03-02 | Implement as formula in metric-engine 03-03 (already catalogued in 03-02), verify | `POST /metrics/compute` for WorkingCapital succeeds | LOW | 03-03,09-04 |
| 09-06 | Cash forecast horizons (7d, 30d, 90d, 6mo, 12mo) using: known committed outflows + expected receivables pattern + OPEX burn rate. Do NOT invent confidence. Explicitly mark assumptions used (AR collection days assumption, AP payment terms assumption, OPEX linearity assumption) | 06-09 project-cash + 08-05 opex forecast | `backend/finance/cash/forecast-service.ts` | Forecast returned for each horizon with assumption list; NO confidence numbers | HIGH | 09-03,08-05,06-09 |
| 09-07 | Liquidity alerts — when forecast balance below configured threshold (per CostCentre / Treasury). Generate RISK events. | Risk events pattern + forecast 09-06 | `backend/finance/cash/liquidity-alerts.ts` | `checkLiquidity(thresholds) → alerts[]` with breaches | LOW | 09-06 |
| 09-08 | Frontend: Cash Command Center — Opening Cash, Inflows tile, Outflows tile, Committed/Expected, AR/AP aging widgets, Working Capital, forecast curves per horizon (5 chart), liquidity alert feed | GridKpiStrip + NationalForecastWall layout | `src/components/ketraco/finance/CashCommandCenter.tsx` | Cash dashboard load with fixtures | HIGH | 09-01..09-07 |
| 09-09 | API routes `/api/finance/cash/*` | Standard pattern | `backend/finance/routes/cash-routes.ts` | Endpoints alive | LOW | 09-08 |

**GATE 09 PASS:** Balance sheet snapshot + forecast 12 months render with assumptions visible. Alert triggers when low-threshold applied in test.

---

## PHASE 10 — FORECASTING ENGINE (PRODUCTION)

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 10-01 | ForecastService class with registry of forecasting methods + models. Forecast = Model(series, horizon, assumptions). | PredictiveService.ts pattern | `backend/finance/forecast/forecast-service.ts` | Registry + dispatch + common result schema | HIGH | 01-05 Forecast table |
| 10-02 | Baseline forecast: naive (repeat last period), seasonal naive, moving average, simple exponential smoothing. All deterministic formulas; no randomness; no confidence numbers unless n ≥ 2×horizon AND residual-based CI computable. | Inline formulas + statistical rules | `backend/finance/forecast/methods/baseline.ts` | For each method: `forecast(series, horizon) → {values[], modelVersion, residuals[], ciLow?:[], ciHigh?:[], errorMetrics: {MAE, MAPE, RMSE}}` | HIGH | 10-01 |
| 10-03 | Rolling forecast = re-run baseline methods on latest `window` trailing points each period. | 10-02 + scheduler via AgentScheduler | `backend/finance/forecast/rolling-forecast.ts` | `runRolling(entityId, asOf, horizon, method)` | MEDIUM | 10-02 |
| 10-04 | Conservative / Expected / Stress scenario-forecast variants as per §10 directive inputs. Conservative = Baseline × 0.9 on inflows, ×1.1 on outflows. Expected = Baseline. Stress = Baseline × 0.7 inflows, ×1.3 outflows. | 10-02 results scaled deterministically | `backend/finance/forecast/scenario-variants.ts` | 5 variants (baseline, rolling, conservative, expected, stress) implemented | LOW | 10-03 |
| 10-05 | Strategic forecast = incorporates external drivers (inflation%, FX%, interest rate%) by applying scalar adjustments to formulas. Each adjustment explicit, user-tunable, stored as assumption. | 10-04 scale approach | `backend/finance/forecast/strategic-adjustment.ts` | Adjustment factors persisted; no hidden scalar | LOW | 10-04 |
| 10-06 | Error metrics (MAE, MAPE, RMSE) backtest via walk-forward validation. If n < 2×horizon: `errorMetrics.status = INSUFFICIENT_HISTORY` instead of inventing quality. | Walk-forward inline | `backend/finance/forecast/backtest.ts` | Backtest returns status + metrics or INSUFFICIENT | LOW | 10-02 |
| 10-07 | Forecast storage + versioning (forecast table with modelVersion, trainingDataWindow, forecastHorizon, assumptions JSON, errorMetrics JSON, timestamp). Reuse entity 01-05. | 01-05 already seeded; implement repo methods | 01-06 ForecastRepository | `save(fc)`, `get(entityId, asOf, horizon) → latest` | LOW | 01-06,10-01 |
| 10-08 | Redis worker `finance_forecast_batch` for async large-portfolio forecast runs. | 01-17 existing worker registration | server.ts worker block + `backend/finance/forecast/worker.ts` | Worker can enqueue + dequeue a portfolio backfill job | MEDIUM | 10-07,01-17 |
| 10-09 | API routes `/api/finance/forecasts/*` | Standard pattern | `backend/finance/routes/forecast-routes.ts` | Endpoints: compute, save, get history, backtest, variants | MEDIUM | 10-08 |
| 10-10 | Frontend: Forecasting workspace — entity picker, method chooser, horizon, assumptions panel, chart (historical + forecast + CI shaded if CI computable), error metrics table, saved versions list | NationalForecastWall UX conventions + scenario tabs | `src/components/ketraco/finance/ForecastingWorkspace.tsx` | A seeded 24-point OPEX series can run Baseline 6M forecast; CI shows shaded; MAPE prints | HIGH | 10-09 |

**GATE 10 PASS:** 36 months of fixture monthly OPEX data → 12 month forecast with MAPE + walk-forward validation renders. Assumptions list displayed verbatim next to chart.

---

## PHASE 11 — FINANCIAL SCENARIO ENGINE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 11-01 | Scenario entity CRUD + snapshot capability — user creates Scenario with name, description, modified assumptions, baseline ref. Snapshot baseline data = SHA-256 hash of input datasets for reproducibility. | Scenario Lab (`ScenarioLab.tsx`) pattern; snapshot pattern from `WorkflowCheckpoint` | `backend/finance/scenario/scenario-service.ts` | CRUD + createSnapshot; snapshots stored with hash | HIGH | 01-06,10-07 |
| 11-02 | Scenario editable parameters: FX%, inflation%, interest rate%, project schedule shift (±days), project cost %, procurement timing shift, payment timing shift, funding $ amount, revenue %, OPEX %, CAPEX %. | User input fields + typed param enum | Scenario service params schema | 11 params as per directive | LOW | 11-01 |
| 11-03 | Graph impact propagation: USD/KES change → imported equipment contract exposure → project cost → CAPEX forecast → cash requirement → budget position → financial risk. Use graph traversal (Finance Graph relationships §4 of directive) over in-memory snapshot to find impacted entities and recompute. | KnowledgeGraphService.traverse pattern + metric-engine recompute | `backend/finance/scenario/impact-propagator.ts` | `runScenario(scenarioId) → impactChain[]` where each element = {entity, delta, reason, sourceParam}. Chain of ≥ 6 hops for FX example | CRITICAL | 11-02,KnowledgeGraphService,03-03 |
| 11-04 | Save each Scenario run = reproducible. Stored as `ScenarioRun` with inputSnapshot + outputSnapshot + parameters JSON, so that same scenario inputs always reproduce the same outputs (deterministic). | 11-01 scenario + 01-14 lineage | Scenario service saveRun() | `reproduceRun(runId) → result === savedResult` test passes | HIGH | 11-03,01-14 |
| 11-05 | Frontend: Financial Scenario Lab — parameter sliders (11 params), baseline vs scenario delta KPI tiles in 2 columns, impact chain visualization (list or node graph), scenario runs history, reproduce button | GridResilienceModal + ScenarioLab UX conventions | `src/components/ketraco/finance/FinancialScenarioLab.tsx` | FX +10% scenario runs and shows 6-hop impact chain for fixture contract/project | HIGH | 11-01..11-04 |
| 11-06 | API routes `/api/finance/scenarios/*` | Standard pattern | `backend/finance/routes/scenario-routes.ts` | CRUD + run + reproduce endpoints | MEDIUM | 11-05 |

**GATE 11 PASS:** Run scenario `FX_USD_UP_10` on fixture data → reproduceRun returns identical run. Chain includes CAPEX forecast + cash + budget + risk impact tiles in UI.

---

## PHASE 12 — FINANCIAL DIGITAL TWIN

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 12-01 | Twin entity registration in `DigitalTwinRegistry` (extends existing SCM pattern from `backend/agents/fabric.ts` DigitalTwinRegistry) | Existing twin registry + SupplierTwin / TenderTwin | Append Finance twin type registrations + `OrganizationTwin` budget view | Finance Twin nodes discoverable | MEDIUM | fabric.ts DigitalTwinRegistry |
| 12-02 | Finance Twin state = {BudgetsActive, CommitmentsOpen, CashBalance, AR, AP, Funding, Debt, RevenueYTD, OPEXYTD, CAPEXYTD, RiskExposures, Forecasts}. Snapshottable. | `ScmDigitalTwin.tsx` state model | `backend/finance/twin/finance-twin-state.ts` | `getState(orgId) → state object`; `snapshot(state) → hash` | MEDIUM | 12-01 |
| 12-03 | State inspection endpoint — user can see any Finance Twin entity current-state with last-update + provenance source for each field. | ScmDigitalTwin detail view pattern | `backend/finance/twin/state-inspector.ts` | `inspect(entityRef) → {state, perFieldProvenance}` | LOW | 12-02,01-14 |
| 12-04 | Dependency analysis: given a target (e.g. "Project X cash position"), return a graph of what entities/twins affect it (linked via graph). Use knowledge graph traverse. | KnowledgeGraphService.traverse | `backend/finance/twin/dependency-analyzer.ts` | `dependencies(entityId, depth) → nodes[],edges[]` | MEDIUM | 12-02,Graph |
| 12-05 | Financial stress testing: apply Phase 11 scenario parameters to twin state snapshot → compute stressed state → identify breached thresholds. | 11-03 propagator + twin state | `backend/finance/twin/stress-test.ts` | `stressTest(twinState, scenario) → stressedState, breaches[]` | HIGH | 11-03,12-02 |
| 12-06 | Frontend: Financial Digital Twin viewer — twin-node list, state inspection modal, dependency graph visualization, stress-test runner, scenario comparison (Baseline vs Stress) KPI side-by-side | ScmDigitalTwin.tsx UX conventions | `src/components/ketraco/finance/FinancialDigitalTwin.tsx` | UI list state + drill for 8 entity types | HIGH | 12-01..12-05 |
| 12-07 | Connect Finance Twin to broader KETRACO Enterprise/Digital Twin: ensure project/asset/supplier twins are linked via edges from §4 map. Single viewer filters by twin domain. | ProcurementGraphCenter component pattern + ScmDigitalTwin already connected to org chart | Finance twin nodes appended to graph explorer when domain filter applied | Graph explorer with domain=Finance toggle works | MEDIUM | 12-06, ProcurementGraphCenter |

**GATE 12 PASS:** FinanceTwin state inspection displays 10+ attributes with provenance. Stress test with 20% USD shock shows breach of budget threshold for fixture project.

---

## PHASE 13 — FINANCIAL RISK ENGINE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 13-01 | FinancialRisk entity lifecycle (IDENTIFIED → ASSESSED → MITIGATED → CLOSED), CRUD, `FinancialRiskRepository` (impl 01-06), risk scorecard per type. | RiskAssessmentService | `backend/finance/risk/risk-service.ts` | 13 risk types in directive implemented | CRITICAL | 01-06 |
| 13-02 | Per-risk-type deterministic scoring function for each of 13 types (budget risk, liquidity risk, project cost risk, funding risk, FX risk, interest-rate risk, supplier financial risk, contract exposure, payment risk, revenue risk, compliance risk, fraud/anomaly risk). Score = weighted drivers; every driver documented inline; NO RANDOM SCORES. | RiskAssessmentService pattern with rule functions | `backend/finance/risk/scorecards/*.ts` one file per risk type or one big switch with formula comments | 13 risk types each with ≥3 drivers; all formulas exposed via endpoint | CRITICAL | 13-01 |
| 13-03 | Standard `Risk` return structure per directive: risk, probability (deterministic level, not % unless data-backed), impact (monetary or qualitative), exposure (monetary), drivers[{name,value,evidence}], evidence[], mitigations[], owner, status. | 13-01 risk service | Common RiskResult type exported | Each risk scan returns RiskResult list | MEDIUM | 13-02 |
| 13-04 | Budget risk = 04-09 scaled → map to risk entity. | 04-09 results | Adapter from 04-09 into 13-01 entities | | LOW | 04-09 |
| 13-05 | Liquidity risk = 09-07 + cash-forecast breach probability level (deterministic thresholds) → risk entity | 09-07 | Adapter | | LOW | 09-07 |
| 13-06 | Project cost risk = 06-07 Health + 06-08 Overrun → risk entity | 06-07,06-08 | Adapters | | LOW | 06-07,06-08 |
| 13-07 | Funding risk = 06-06 gap → risk entity | 06-06 | Adapter | | LOW | 06-06 |
| 13-08 | FX risk = open-USD-contract-exposure × |current FX-rate − base-rate| ÷ base; severity bands 5%/10%/20%; create risk if exposure>KES 50M+ and band>5% | Calculation inline | New risk function file | | MEDIUM | 01-06 (open commitments w/ currency) |
| 13-09 | Interest-rate risk: floating-rate-loan portfolios × shift (100/200/300 bps) → period-interest-change; create risk if impact >1% of OPEX. | Deterministic multiplication | New file; Loan data from fixtures for now | | MEDIUM | 01-06 Loans table |
| 13-10 | Supplier financial risk = reliability-index (from SCM if available) + unpaid-invoice-count (aging 90+) + open-exposure-total; composite level LOW/MEDIUM/HIGH. | SCM supplier intelligence; 05-09 aging | New file | If SCM data absent: compute from finance data alone + mark UNCERTAIN badge | MEDIUM | 05-09, Supplier intel |
| 13-11 | Contract exposure = total contract value remaining × concentration (top single supplier share of total) + penalty clauses / uncapped liability flags (if contract twin exposes these) | Commitment pipeline + contract twin data | New file | | MEDIUM | 05-02, Contract |
| 13-12 | Payment risk = pending payments past due × payment bottlenecks 05-10 × risk of cash-shortfall per 09-06 | Combined detectors | New file | | LOW | 05-10,09-06 |
| 13-13 | Revenue risk = forecast-revenue gap vs baseline (use 10-02 forecast). If actuals trend 3M below forecast, create risk with LOW/MEDIUM/HIGH by % gap. | Forecast service | New file | | LOW | 10-02 |
| 13-14 | Compliance risk = failed internal financial controls × open regulatory findings × audit observation count; via RuleEngine results. | RuleEngine (existing) + Control results | New file | | MEDIUM | Phase 14 controls |
| 13-15 | Fraud/Anomaly risk = findings from Phase 14 detectors. Risk probability level = number of independent anomaly-signals firing for same entity (1=LOW, 2=MEDIUM, 3+=HIGH) — call it SIGNAL DENSITY not "probability". Rule 14 Directive (§14 "Do not automatically label FRAUDULENT") → always ANOMALY + EVIDENCE + RISK ASSESSMENT path. | Phase 14 detectors output | Aggregation adapter; labels enforced as ANOMALY not FRAUD | | CRITICAL | Phase 14 |
| 13-16 | Frontend: Financial Risk workspace — 13 risk type tiles, risk register table with 8 required columns (risk/level/impact/exposure/drivers/evidence/mitigations/owner/status), drill-down by risk, new risk form, close with mitigation | RiskIntelligence view pattern in Tender enterprise-evaluation | `src/components/ketraco/finance/FinancialRisk.tsx` | ≥ 6 seeded risks display + filter + sort works | HIGH | 13-01..13-15 |
| 13-17 | API routes `/api/finance/risks/*` | Standard pattern | `backend/finance/routes/risk-routes.ts` | CRUD + scans + export | MEDIUM | 13-16 |

**GATE 13 PASS:** At least one risk of each 13 types is fireable from fixtures/scenarios; 8 show up in risk register. Random risk score audit (unit test) confirms ZERO scores come from Math.random.

---

## PHASE 14 — ANOMALY + CONTROL INTELLIGENCE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 14-01 | Duplicate invoice detector: same vendor, same invoiceNo (or null if matched on amount±0.5% + invoiceDate ±7 days + line-item count match). Deterministic. | 05-06 duplicate pattern; hash concat of fields | `backend/finance/anomaly/duplicate-invoice.ts` | `scan() → matches[]` with fields-matched evidence list | HIGH | 01-06 Invoice |
| 14-02 | Duplicate payment detector: same vendor, same amount, same invoice ref or no ref + date ±3 days, bank-transaction text similarity (Levenshtein on ref if present). Hash match | 14-01 pattern on payments | `backend/finance/anomaly/duplicate-payment.ts` | Same style | HIGH | 09-01 Payment/BankTransaction |
| 14-03 | Unusual journals: single journal round amounts (>99% of lines end in .00), off-hours posting (weekend / 22:00–06:00 local), journal void-then-repost pattern within 7 days, poster same user as approver (violates SoD via 01-18 ABAC). Rule-based. | Deterministic time + amount heuristics | `backend/finance/anomaly/unusual-journal.ts` | Detectors 4+ independent signals | HIGH | Journal, 01-18 SoD policy |
| 14-04 | Unusual supplier activity: new supplier with >KES 10M payment in first 30 days; one supplier with sudden +50% volume MoM; dormant supplier (>365 days) reactivated then immediate payment. | Supplier-creation-date + payments history rolling | `backend/finance/anomaly/unusual-supplier.ts` | 3 sub-rules; each produces evidence | MEDIUM | 01-06 Supplier, 05-xx history |
| 14-05 | Unusual amounts: Benford's law first-digit test on invoices/payments (when n≥500), single invoice > 3× category-24-month average; amount distribution in high rounded clusters | Benford inline + z-test or chi squared; if n<500 skip Benford and label with LOW SAMPLE | `backend/finance/anomaly/unusual-amounts.ts` | Benford degrades with LOW SAMPLE instead of fake | HIGH | n/a math |
| 14-06 | Split transactions: single vendor single day 2-6 payments each just below single-signer DOA threshold. Signature-threshold from 01-18 ABAC. | 01-18 thresholds + time bucket aggregate | `backend/finance/anomaly/split-transactions.ts` | Bucket algorithm per vendor per day | HIGH | 01-18 |
| 14-07 | Unusual payment timing: payment made before invoice due date minus 15 days (early pay without discount capture); duplicate pay-run on same day for same cost-centre; payment after period close backdated into closed period (requires 01-18 close lock check). | Due date + period close rules | `backend/finance/anomaly/unusual-payment-timing.ts` | 3 sub-rules | MEDIUM | 01-18 period close |
| 14-08 | Budget manipulation indicators: last-week-of-period journal spikes that reverse first-week next-period; repeated budget-revision-request pattern after 75% utilization each period; cost-centre consistently re-allocated underspend just before close. | Period bucketing + sequence pattern matching | `backend/finance/anomaly/budget-manipulation.ts` | 3 sub-rules | HIGH | Budget Revision service 04-03 |
| 14-09 | Abnormal price movements: same item code (UNSPSC/GL) across invoices shows +2σ price jump vs trailing 12 months same-item average; percentage deviation. | UNSPSC or GL account group → trailing avg + 2σ | `backend/finance/anomaly/price-movements.ts` | If <10 samples per item, flag LOW SAMPLE | MEDIUM | Invoice lines |
| 14-10 | Unexpected account movements: GL-account-month balance z-score vs 36 month trailing; degrades with LOW SAMPLE. | z-score inline | `backend/finance/anomaly/account-movements.ts` | Same pattern | LOW | Journal entries by account |
| 14-11 | Control intelligence module: financial controls library (segregation of duties, delegated authority, period close, budget ceiling, 3-way match, data reconciliation completeness) compiled via RuleEngine; run-controls endpoint returns pass/warn/fail per control with evidence. | Existing RuleEngine/RuleCompiler in [rule-engine.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/evaluation/rule-engine.ts), [rule-compiler.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/evaluation/rule-compiler.ts) | `backend/finance/controls/` — control rule defs + runner | ≥10 finance control rules compiled & runnable; pass/warn/fail outputs for sample org | HIGH | rule-engine,01-18 |
| 14-12 | Anomaly → Investigation case lifecycle: findings auto-create cases in CaseManagementSystem (existing component). Case state: NEW → UNDER_INVESTIGATION → CONFIRMED_LEGITIMATE / FALSE_POSITIVE / REFERRED_TO_AUDIT. Case notes + assignment + history. User can NEVER click "Mark as Fraudulent"; only the above 4 terminal states. | CaseManagementSystem.tsx component already exists; reuse with category = FINANCIAL_ANOMALY | `backend/finance/anomaly/case-integration.ts` + workflow WF_FINANCIAL_CASE | Cases opened from findings; UI explicitly forbids "FRAUDULENT" label; terminal states match Directive §14 | CRITICAL | CaseManagementSystem.tsx, 14-01..14-10 |
| 14-13 | Frontend: Controls & Anomaly Center — control pass dashboard (10+ controls), anomaly findings per-type, case queue with drill-down + terminal-state buttons (4 options only) + evidence sidebar | DecisionIntelligenceWorkspace UX + CaseManagementSystem together | `src/components/ketraco/finance/AnomalyControlCenter.tsx` | 10 control tiles + ≥ 3 seeded findings; case queue new→investigated→closed cycle works | HIGH | 14-11,14-12 |
| 14-14 | API routes `/api/finance/anomaly/*` + `/api/finance/controls/*` | Standard pattern | `backend/finance/routes/anomaly-routes.ts` | Scan endpoints + case lifecycle endpoints alive | MEDIUM | 14-13 |

**GATE 14 PASS:** Seeded duplicate invoice (+ payment) pair is detected; case created → user assigns → closes as FALSE_POSITIVE. Control dashboard shows 10 rules with ≥1 WARN.

---

## PHASE 15 — FINANCE KNOWLEDGE GRAPH + GRAPHRAG

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 15-01 | Knowledge Graph Finance node seeding: after each canonical write (Budget/Commitment/Invoice/Payment/Project/Asset/Supplier/Contract/Account/CostCentre/Funding/Risk/Decision), create/update corresponding graph node. | After-create hook via EventBus subscriber on FIN.* events | Event subscribers in `backend/finance/graph-sync.ts` | Graph contains nodes of all Finance entity types after fixtures loaded | HIGH | 01-03,01-02 |
| 15-02 | Graph Finance edges populated from cross-domain map §4 of directive: Project HAS_BUDGET, HAS_COMMITMENT, HAS_CONTRACT, HAS_COST, HAS_FORECAST, HAS_FUNDING, HAS_ASSET; Procurement CREATES PurchaseOrder/Commitment etc.; Supplier HAS_CONTRACT etc.; PowerManagement IMPORT_COST etc.; Risk IMPACTS etc. | KnowledgeGraphService.addEdge | Same graph-sync.ts | Edges between Finance nodes exist per §4 map | HIGH | 15-01,01-03 edge types |
| 15-03 | Finance document upload (contracts, board papers, policies, audit findings, tender documents) → reuse DocumentIntelligence pipeline; add Finance categories. RAG document store via existing memory or EnterpriseKnowledgeRetrieval. | `EvaluationService.ingestDocument()` + `/api/v2/evaluation/ingest`; `EnterpriseKnowledgeRetrieval` in fabric.ts | Finance category constants; new upload wrapper `finance/documents/` | `uploadFinanceDoc(category, file, tags)` → indexed in RAG store | HIGH | EvaluationService, EnterpriseKnowledgeRetrieval |
| 15-04 | GraphRAG: given user question, (a) entity resolution to find nodes, (b) traverse 2-3 hops for related entities, (c) fetch RAG docs matched to node types, (d) synthesize grounded answer with citations to nodes + docs. | KnowledgeGraphService.search/traverse + RAG retrieval (existing memory) + AIGateway for synthesis | `backend/finance/graphrag/graph-rag-engine.ts` | `answer(question) → {answer, evidenceNodes[], citations[{doc, quote, page?}], contradictions[], assumptions[]}` — never answers without at least evidenceNodes or citations; returns CANNOT_ANSWER if grounding insufficient | CRITICAL | 15-01..03, AI Gateway |
| 15-05 | Semantic retrieval over finance policy / board / audit documents using existing vector / keyword retrieval infrastructure | EnterpriseKnowledgeRetrieval.getDocuments pattern; if no vectors exist: use deterministic keyword + synonym search (degrade) | Under 15-04 or sibling module | If AI gateway embeddings down: answer uses keyword search only and labels WEAK_RETRIEVAL | MEDIUM | 15-03 |
| 15-06 | Multi-hop reasoning helper: traverse for "Which budgets are affected by Supplier X liquidity issues" → walk Supplier→Contract→Commitment→Budget→Risk IMPACTS Budget | 15-02 populated graph | helper methods in 15-04 | Unit test for 2-hop query on fixture data returns exactly expected node set | MEDIUM | 15-02 |
| 15-07 | Source attribution & citation: answer includes nodeId + entity type for each cited entity; for each cited doc includes docId+name+page/paragraph if extractor gave it | Evidence extraction patterns in evaluation/evidence-extractor.ts | Use existing extractor if available; attach per-paragraph refs to doc chunks at upload | Every answer sentence has either a [nodeRef] or [docRef] inline | HIGH | 15-04, evidence-extractor |
| 15-08 | Contradiction detection: compare answer-grounding statements across 2 sources; flag inconsistent numeric claims. | Deterministic numeric delta + unit match | helper within 15-04 answer pipeline | | MEDIUM | 15-07 |
| 15-09 | Frontend: Knowledge Cortex Finance tab — GraphRAG question bar, answer with node citations (clickable → entity drawer), doc citations (clickable → excerpt drawer), contradictions panel, "CANNOT ANSWER — insufficient evidence" mode | KnowledgeCortex.tsx existing component structure; add Finance domain tab | `src/components/ketraco/finance/FinanceKnowledgeCortex.tsx` | 3 sample questions answered with grounding; one deliberately-impossible question answered as CANNOT_ANSWER | HIGH | 15-04..08 |
| 15-10 | API routes `/api/finance/knowledge/*` | Standard pattern | `backend/finance/routes/knowledge-routes.ts` | answer() + citations + graphBrowse endpoints alive | MEDIUM | 15-09 |

**GATE 15 PASS:** "Why is Project X forecast to overspend?" resolves through 2-3 hops, cites nodes+docs, answers with specific drivers. Impossible question returns CANNOT_ANSWER with reason.

---

## PHASE 16 — FINANCE AGENT WORKFORCE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 16-01 | `BaseFinanceAgent extends BaseSCMAgent` with Finance-specific memory slots (budgetMemory, commitmentMemory, cashMemory, metricMemory, riskMemory) + shared capabilities | `BaseSCMAgent` in [instances.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/agents/instances.ts#L69-L190) | `backend/finance/agents/base-finance-agent.ts` | Inherits observe/recommend/reasoning/execute/learn/collaborate | LOW | instances BaseSCMAgent |
| 16-02 | 16 create-* functions in instances.ts mirroring existing createProcurementAgent pattern: FinanceIntelligenceAgent, BudgetAgent, FPandAAgent, ForecastingAgent, TreasuryAgent, CapexAgent, OpexAgent, ProjectFinanceAgent, ProcurementFinanceAgent, RevenueIntelligenceAgent, FinancialRiskAgent, FinancialControlsAgent, AuditIntelligenceAgent, ManagementReportingAgent, ScenarioAgent, FinanceDataAnalystAgent | createProcurementAgent function pattern in instances.ts | Append block in same `backend/agents/instances.ts` or parallel `backend/finance/agents/instances.ts` and import into main instances | 16 factory functions. Each declares goals, tools, capabilities, memory. | HIGH | 16-01 |
| 16-03 | Register Finance agents in server.ts alongside existing SCM agents. Use `AgentManager.registerAgent()` | [server.ts lines 232-242](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/server.ts#L232-L242) | server.ts append block | All 16 visible via `/api/scm/fabric/health` or equivalent list endpoint | LOW | 16-02 |
| 16-04 | CFO Orchestrator mirrors SCMOrchestrator.orchestrate. Intent router parses user question → selects which of 16 agents → runs them sequentially/parallel → combines findings → synthesizes via ModelRouter (or fallback offline synthesis) with evidence. | `SCMOrchestrator.orchestrate` in [orchestrator.ts](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/backend/agents/orchestrator.ts) | `backend/finance/agents/cfo-orchestrator.ts` | `CFO_Orchestrator.orchestrate(prompt) → {agentReasoningChain[], finalSynthesis, sources[]}` | HIGH | 16-02, SCMOrchestrator pattern |
| 16-05 | Intelligent Agent Router expansion to recognize Finance intents: budget, opex, capex, cash, forecast, scenario, risk, invoice, payment, project_finance, treasury, audit, KPI_reporting, procurement_finance, supplier_finance, revenue, decision, anomaly, controls, graph_query | `IntelligentAgentRouter.routeQuery` keyword pattern in fabric.ts | Append Finance clauses into same router or extend with subclass decorator | Finance keywords dispatch to finance agents (visible in routingResult.selectedAgents) | MEDIUM | fabric.ts router |
| 16-06 | Orchestrator endpoint `/api/finance/orchestrate` analogous to `/api/scm/orchestrate`. Same auth + AI synthesis pattern with fallback in case of LLM 503. | SCM orchestrate endpoint | server.ts + `backend/finance/routes/cfo-routes.ts` | Endpoint returns structured result | MEDIUM | 16-04 |
| 16-07 | Governance & security: Finance agents inherit user permissions through authorization-service. Agent cannot bypass controls — every write must call checkPermission before executing. 01-18 RBAC/ABAC integrated into agent execution. | AgentPolicyManager pattern in fabric.ts, plus AuthorizationService.checkPermission | Wrapper in BaseFinanceAgent.execute that pre/post-gates every operation with policy evaluation | Unit test: agent attempting `payment:release` above user threshold → DENY instead of perform | CRITICAL | 16-01,01-18 |
| 16-08 | Frontend: Finance Agent Workforce dashboard (register, health, capabilities, telemetry logs, ad-hoc run of CFO orchestrator from a prompt box with evidence trace). | AiOperationsCenter + AgentPlatform pattern | `src/components/ketraco/finance/FinanceAgentWorkforce.tsx` | 16 agents rendered; orchestrator prompt with example works | HIGH | 16-01..06 |
| 16-09 | Idempotency for all agent-initiated financial actions: agent request id → dedupe check before journal/commitment/payment write. | Idempotency via DB unique constraint on actionId + hash | Repository-level guard in 01-06 write methods | Retry same action twice → second returns existing, no duplicate | HIGH | 01-06 |
| 16-10 | Agent audit events: every agent-initiated financial write produces auditable event with agentId, actingOnBehalfOfUserId, decisionId, rationale; logged to shared audit_logs (existing). | Audit log writes already done in repositories; include agent fields | Extend audit entry with agent-origin info | Audit log entry contains agentId for agent actions | LOW | audit repository |

**GATE 16 PASS:** "Why is Project X likely to exceed budget?" CFO orchestrator calls ProjectFinanceAgent + BudgetAgent + ProcurementFinanceAgent + ForecastAgent + RiskAgent, synthesizes evidence-backed answer. Agent threshold bypass attempted → DENY + audit log.

---

## PHASE 17 — FINANCE COPILOT (ASK FINANCE)

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 17-01 | Ask Finance response type: {Answer, Evidence[{type:entity|document|metric|calculation, ref, summary, url?}], AffectedEntities[], Calculations[{formula, inputs, result}], Assumptions[], ConfidenceUncertainty[NOT_APPLICABLE / DATA_GAP(label) / EXTRAPOLATION(label) — NO PERCENT NUMBERS], PolicyConsiderations[{policyId, text, requiresApproval?: boolean}], RecommendedActions[], DeepLinks[{panel, queryParams}]} | ScmCopilot UX but stronger schema; Directive §17 mandatory fields | `backend/finance/copilot/response-schema.ts` | TypeScript interface + validation | MEDIUM | None |
| 17-02 | Intent-to-answer router: map each of the 11 canonical Ask Finance questions (Why did OPEX?; Which projects exceed?; Projected cash?; Unfunded commitments?; Largest exposures?; Require management attention?; What caused variance?; FX 10% what-if?; Largest supplier exposure?; Preserve liquidity actions?; plus free-form) to specific engine / agent calls. | CFO orchestrator 16-04 or degenerate to orchestrator for complex | `backend/finance/copilot/ask-finance-router.ts` | 11 canonical question templates route to specific engines (budget variance, forecast, etc.) | HIGH | 16-04,11-03,13-xx,09-xx |
| 17-03 | Evidence assembly: for canonical question, attach relevant metric definitions, graph nodes, risk items, scenario assumptions, documents, policy references. | GraphRAG 15-04 | helper in copilot package | Canonical question returns ≥3 evidence items always | MEDIUM | 15-04 |
| 17-04 | Policy considerations: check every recommendation against AuthorizationService thresholds + rules; flag requiresApproval=true if exceeds role; include Regulation (e.g. National Treasury / PPADA / KETRACO finance policies) references if Policy KB exists, else "SEEK LEGAL/COMPLIANCE REVIEW". Never hallucinate statute text; refer to rule IDs only. | AuthorizationService + control results 14-11 | Policy resolver helper | Recommendation > threshold => requiresApproval | MEDIUM | 01-18,14-11 |
| 17-05 | Deep links: each recommendation maps to a Finance UI panel with parameters (e.g. BudgetWorkspace with budgetId). | Module/panel routing defined in frontend shell structure | `src/components/ketraco/finance/deep-links.ts` registry + navigate handler | Click recommendation → navigates + filters correctly | MEDIUM | 17-01 |
| 17-06 | Frontend: Ask Finance chat panel embedded in Finance module shell; every response renders the 8-section schema cards (Answer / Evidence / Affected / Calculations / Assumptions / Uncertainty / Policy / Recommended Actions with Deep Links) | ScmCopilot pattern but richer sections | `src/components/ketraco/finance/FinanceCopilot.tsx` | Chat renders the 11 canonical questions as chips; each clicked returns correctly-structured answer. | CRITICAL | 17-01..05 |
| 17-07 | Contextual-AI buttons throughout Finance module (like ScmModules contextual buttons today): one-click prompts on Budget variance row, commitment alert, project health, liquidity alert, risk finding, anomaly case — prefill Ask Finance with context-rich prompt | Existing contextual AI buttons in ScmModules | Finance UI modules (Phase 04-14) each include contextual copilot launch buttons | One click from variance → Ask Finance opens with prefilled question + context | MEDIUM | 17-06 + all phases UI |
| 17-08 | `/api/finance/copilot/ask` endpoint with authN + authZ (aiGuard) for LLM-backed parts; all grounding done server-side before LLM call | SCM orchestrate endpoint aiGuard pattern | `backend/finance/routes/copilot-routes.ts` + server authZ | LLM-free path still works (offline synthesis) and returns same schema minus polished prose | MEDIUM | 17-06, aiGateway |

**GATE 17 PASS:** Click FX 10% what-if chip → scenario runs, recommendation shows: Answer+Evidence+Affected+Calculations+Assumptions+Uncertainty+Policy(requiresApproval if needed)+RecommendedActions(deepLink). No % confidence numbers visible anywhere except statistically-validated Forecast CI.

---

## PHASE 18 — FINANCIAL DECISION ENGINE

| TASK ID | WHAT TO BUILD | REUSE FROM | WHERE | GATE CRITERIA | COMPLEXITY | DEPENDENCIES |
|---|---|---|---|---|---|---|
| 18-01 | FinancialDecision entity + repository + lifecycle state machine: DETECT → INVESTIGATE → MODEL → SIMULATE → RECOMMEND → APPROVE → EXECUTE → VERIFY → CLOSED / REJECTED at any stage. | Workflow engine pattern; DecisionApprovalCenter; DecisionIntelligenceEngine pattern | `backend/finance/decision/decision-service.ts` + WF_FIN_DECISION workflow definition | 9-state transitions valid; reject/closes absorb at any state | CRITICAL | 01-06, workflow engine |
| 18-02 | Auto-decision detection: detector subscriptions (budgets, risks, anomalies, scenario shocks, cash alerts) → auto-create Decision in DETECT state with triggerEvidence. | Event fabric subscriptions on FIN.*_ALERT events | Event handlers in `backend/finance/decision/detectors-connector.ts` | 04-09 budget risk → auto-creates a decision | HIGH | 13-xx,09-07,11-03 |
| 18-03 | INVESTIGATE state: launch relevant Finance agents (CFO orchestrator or targeted) → gather evidence, write to Decision evidence bag. | 16-04 CFO orchestrator | Investigate step in decision service | decisionInvestigate(id) → updated evidence[] | MEDIUM | 16-04 |
| 18-04 | MODEL state: attach metric snapshots, scenario parameters, forecast model versions, entity states as at model-time (deterministic timestamped snapshot). Use 03-03 / 06-03 / 09-06 / 10-02 / 11-03 as applicable. | All engines from previous phases | Model step | decisionModel(id) → modelSnapshot persisted | MEDIUM | all engines |
| 18-05 | SIMULATE state: run 1+ Phase 11 scenarios against decision subject → store ScenarioRun refs on decision. Simulation always reproducible via 11-04 guarantee. | Scenario service 11 | Simulate step | decisionSimulate(id, scenarios[]) → stored scenario refs | MEDIUM | 11-04 |
| 18-06 | RECOMMEND state: recommendation object with {decisionId, recommendation: APPROVE / REJECT / DEFER / AMEND_AND_RESUBMIT, rationale, evidence[], policyGates[{ruleId, passed, comment}], riskMitigations[], assumptions[]}. Requires ≥3 pieces of evidence; else cannot enter RECOMMEND (returns INSUFFICIENT_EVIDENCE). | RecommendationService pattern | Recommend step | | HIGH | 17-04 policy |
| 18-07 | APPROVE state: Human-in-the-loop required for all consequential decisions. Uses existing DecisionApprovalCenter component + Workflow engine; ABAC 01-18 gate on amount + role. Approval signature = userId + timestamp + decisionId hash. Multi-approval if needed per policy. | DecisionApprovalCenter + 01-18 policy | UI + workflow approval step | Cannot approve without sufficient role; audit log; idempotent re-approve | CRITICAL | 01-18, DecisionApprovalCenter |
| 18-08 | EXECUTE state: apply the approved recommendation to canonical entities (e.g. budget reallocation, payment release, PO approval, forecast revision publish). Every action idempotent, auditable, event-emitting. Only reachable from APPROVED. | Repository write methods + idempotency guard 16-09 | Execute step | Execute action twice → same result; audit entries created | CRITICAL | 16-09 |
| 18-09 | VERIFY state: post-execution variance check (expected vs actual). Compute delta, mark VERIFIED_PASS or VERIFY_DEVIATION with explanation. If deviation > threshold, reopen to INVESTIGATE. | Variance analyzer (04-05 pattern) | Verify step | decisionVerify(id) → PASS or DEVIATION | MEDIUM | 04-05 |
| 18-10 | Decision ledger persisted in `finance_decisions` table (01-05 already) + decision events publish to EventBus. Decision traceability: API `GET /api/finance/decisions/{id}` returns full lifecycle with all 9 states, who did what when, evidence, rationale. | Repositories; EventBus | Decision routes | Decision accessible + JSON dump contains 9-step audit | MEDIUM | 18-01..09 |
| 18-11 | Frontend: Financial Decision Hub — open decisions list (by state), DETECT → INVESTIGATE progress, MODEL attachments, SIMULATE scenario comparison cards, RECOMMEND evidence list, APPROVE sign panel, EXECUTE verification, VERIFY variance. Integrate with DecisionApprovalCenter. | DecisionApprovalCenter + DecisionIntelligenceWorkspace UX conventions | `src/components/ketraco/finance/FinancialDecisionHub.tsx` | End-to-end user journey on a seeded budget-overrun decision: DETECT→INV→MOD→SIM→REC→APP→EXE→VER all clickable through | CRITICAL | 18-01..10 |
| 18-12 | API routes `/api/finance/decisions/*` for lifecycle. | Standard pattern | `backend/finance/routes/decision-routes.ts` | All 9 step endpoints alive + get endpoint returns full history | MEDIUM | 18-11 |

**GATE 18 PASS:** E2E seeded-decision flow completes 9 states. Approver below threshold attempts approve → ABORT + explicit ABAC failure message. Deviation on verify → decision re-opened to INVESTIGATE.

---

## PHASE GATE SUMMARY (DIRECTIVE §31)

Per Directive rule 31: "After every phase update the Finance master MD ledger." Each gate PASS writes to `FINANCE_INTELLIGENCE_MASTER.md` (task 00-05). Gate PASS criteria per phase listed above.

| PHASE | GATE NAME | PRIMARY VERIFICATION MECHANISM |
|---|---|---|
| 00 | Gate 00 — Audit & Matrix | Documents complete (this file + FINANCE_ARCHITECTURE_AUDIT.md + DATA_MAP + GRAPH_MAP + MASTER) |
| 01 | Gate 01 — Data Fabric | DB migration applies; CRUD 6 entities; API alive; policy unit tests |
| 02 | Gate 02 — Excel Intelligence | 3-sheet workbook → confirm-import → full lineage queryable by importBatchId |
| 03 | Gate 03 — Semantic Layer | Zero orphan KPIs; 6 metric smoke tests return calculationTrace |
| 04 | Gate 04 — Budget Intel | Budget lifecycle → Approved; Allocation; Variance narrative with drivers displayed |
| 05 | Gate 05 — Commitment Pipeline | 7-tuple pipeline computes; 5 detectors fire on seeded anomalies |
| 06 | Gate 06 — Project Finance | Project 7-box, CTC method deterministic, Health score, funding gap |
| 07 | Gate 07 — CAPEX Intel | Portfolio 7 analytics, depreciation schedule hand-calc validated |
| 08 | Gate 08 — OPEX Intel | 11 categories + trend + variance + 1 seeded anomaly displayed |
| 09 | Gate 09 — Cash/Treasury | Forecast curves + assumptions visible; low-threshold alert triggers |
| 10 | Gate 10 — Forecasting | 36-mo → 12-mo forecast with walk-forward MAPE. No invented CIs |
| 11 | Gate 11 — Scenarios | FX +10% scenario → 6-hop impact chain; reproduceRun returns identical run |
| 12 | Gate 12 — Finance Twin | State inspection per-field provenance; stress-test breach shown |
| 13 | Gate 13 — Risk Engine | 13 risk types fireable; ZERO Math.random in scorecard (unit test) |
| 14 | Gate 14 — Anomaly/Control | Duplicate detected → case → false-positive close. Control 10+ rules runnable |
| 15 | Gate 15 — GraphRAG | 2-hop query grounds with evidence; impossible question → CANNOT_ANSWER |
| 16 | Gate 16 — Agents | 16 agents visible; "Why exceed budget?" orchestrator chains 5 agents; DOA bypass denied |
| 17 | Gate 17 — Copilot | FX chip → 8-section schema; no % confidences; requiresApproval flags |
| 18 | Gate 18 — Decisions | E2E 9-state completes; below-threshold approver blocked; deviation reopens |

---

## CROSS-PHASE PLATFORM TASKS (not numbered as directive phases but required)

| TASK ID | WHAT | REUSE | WHERE | GATE | COMPLEXITY |
|---|---|---|---|---|---|
| CP-01 | Finance module shell in App.tsx: new `activeModule` key 'finance', new menuItems entry, routing switch case, lazy-load sub-workspaces | App.tsx existing structure | [App.tsx](file:///c:/Users/kamuren/Desktop/Hacker_1/Salience_Atlas_v5.1.0/src/App.tsx) | Gate 02 requires UI | HIGH |
| CP-02 | Finance module shell route guard + permission-aware menu filter (only show Budget/Cash/Risk if user role has view permissions) | 01-18 roles, TenantContext | App.tsx shell | Always | LOW |
| CP-03 | Finance test fixtures: explicitly tagged DEV_FIXTURE (never production) — sample COA, 5 cost-centres, 2 departments, 3 budgets with lines, 6 commitments, 9 invoices, 6 payments, 2 projects, 12 periods of OPEX, supplier list, bank transactions 3 months, 1 loan, FX rates history 24 months | TenderMockData.ts pattern | `backend/finance/fixtures/dev-fixtures.ts` + `fixtures/FIXTURES_ARE_NOT_PRODUCTION.md` manifest | All phases require fixtures; manifest prevents prod use | HIGH |
| CP-04 | Finance-specific unit tests (Phase 01 migrations idempotent, 01-18 policy thresholds, 03-03 metric calc, 04-01 budget states, 06-03 CTC hand-math, 10-02 forecast MAE, 11-04 scenario reproducibility, 13-* risk-no-random, 14-* anomaly detection dup-pair, 16-07 agent DOA, 18-07 approval threshold) | Jest-like tests using bun test or tsx runner if configured; backend already has `.test.ts` files (evidence.test.ts, rule-ontology.test.ts, event-fabric.unit.test.ts, event-fabric.integration.test.ts, loop-engine.test.ts, workflow.test.ts, runtime.test.ts, memory.test.ts, agent.test.ts, redis-service.test.ts) | `backend/tests/finance-*.unit.test.ts` + `backend/tests/finance-*.integration.test.ts` | All gates must have at least one test; aggregate tests pass before Phase Gate | CRITICAL |
| CP-05 | Finance Telemetry — each phase's core service publishes status, latency, error counts via SCMTelemetry or new FinanceTelemetry (reuse pattern) | `SCMTelemetry.log` pattern in instances.ts | `backend/finance/telemetry.ts` | AiOps center can filter to Finance module health | LOW |
| CP-06 | Finance Observability targets for Phase 0 observability package | PHASE0_OBSERVABILITY_TARGETS pattern | Append to observability package (parallel) | 30+ Finance targets defined | LOW |
| CP-07 | Audit chain: canonical Finance entity write → hash chain entry in previous-hash-linked `finance_audit_chain` table (mirrors but separate from inventory LedgerEnginePanel). All journal entries, payment releases, budget approvals write to chain. | cryptography-service SHA | append migration + write hooks | Valid hash chain verifiable via API endpoint `GET /api/finance/audit-chain/verify` | CRITICAL |
| CP-08 | Excel / CSV parser dependency: install `xlsx` (SheetJS community) library if not yet in package.json, for Phase 02. | N/A | package.json + bun install | package.json includes xlsx | LOW |
| CP-09 | docs/finance/FINANCE_INTELLIGENCE_MASTER.md ledger append after every gate | CHANGELOG pattern | docs/finance/FINANCE_INTELLIGENCE_MASTER.md after each gate | 18 gate entries + each CP task entry | LOW |

---

## DELIVERABLES COUNT

- Total directive phases: 19 (00-18)
- Total tasks (excluding CP): 180+ (per above 5-18 per phase)
- Cross-phase platform tasks: 9
- New backend files (approx): 100+
- New frontend components (approx): 22+
- New DB tables (approx): ≥ 25 finance_* tables
- New REST endpoints (approx): ≥ 90
- New event types (approx): ≥ 30
- New graph node/edge types: ≥ 25 nodes / ≥ 40 edges

---

## ESTIMATED PHASE PROGRESSION (COMPLEXITY-DRIVEN, NOT CALENDAR)

1. Phase 00 (done) → Gate 00
2. Phases 01-03 (platform foundation) → Gate 01-03
3. Phases 04-05 (Budget + Commitments = core value backbone) → Gate 04-05
4. Phases 06-09 (Project / CAPEX / OPEX / Cash) → Gate 06-09
5. Phases 10-12 (Forecast / Scenario / Twin) → Gate 10-12
6. Phases 13-15 (Risk / Anomaly / GraphRAG) → Gate 13-15
7. Phases 16-18 (Agents / Copilot / Decisions) → Gate 16-18

### Finance Master Ledger Entry

| Entry # | Timestamp | Phase | Event | Author |
|---|---|---|---|---|
| FM-002 | 2026-08-31T00:00:00Z | 00 | Implementation Matrix complete. 18 phases × 180+ tasks mapped. 9 cross-phase tasks defined. All 13 risk scorecards + 10 anomaly detectors individually spec'd. | MATRIX-SYSTEM |
