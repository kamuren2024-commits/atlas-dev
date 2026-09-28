# FINANCE INTELLIGENCE — DATA MAP

**Program:** KETRACO Salience Atlas Finance Intelligence OS
**Reference:** Directive §3 (Finance Domain Ontology — 47 entities), §01-03 (Semantic Layer Metric Catalog)
**Purpose:** Canonical entity definitions, database table mapping, source systems, ownership & RBAC, field templates, and metric catalog defaults.

---

## DATA MAP STRUCTURE

Each entity is documented with:

| Column | Description |
|---|---|
| **Entity Name** | Canonical class (TypeScript type + DB table) from Directive §3 |
| **TS Type** | TypeScript export in `packages/domain/index.ts` — Phase 01 Task 01-01 |
| **SQLite Table** | `finance_*` table name. Migration 003 in Phase 01-05. |
| **Source Systems** | Which system(s) populate this entity (from Phase 01 inputs: ERP/SAP/Ariba/Excel/CSV/Bank/Project/Procurement/Asset/Ops/External) |
| **Owner Role** | Default RBAC owner for entity lifecycle (from Phase 01-18 roles) |
| **RBAC: Read** | Roles permitted to read |
| **RBAC: Write** | Roles permitted to write / mutate lifecycle |
| **RBAC: Delete** | Usually NONE (Finance entities immutable or archival only — rule 19,22) |
| **Key Rel** | Cardinality to adjacent canonical entities |
| **Canonical Fields ✓** | Whether every entity supports the 17 Directive §3 fields |

---

## UNIVERSAL CANONICAL FIELD SET (Directive §3)

Applied to every Finance entity unless noted N/A:

```
id:                     string  (ULID/UUIDv7, internal PK, required)
externalId:             string? (source-system key, nullable)
sourceSystem:           string? (ERP / SAP_S4 / SAP_ARIBA / EXCEL / CSV / BANK /
                                 PROJECT_SYSTEM / PROCUREMENT_SYSTEM / ASSET_SYSTEM /
                                 OPERATIONAL_SYSTEM / EXTERNAL_ECON / MANUAL_INPUT /
                                 ATLAS_AGENT)
sourceRecordId:         string? (native PK or composite hash from source)
status:                 FinanceEntityStatus (DRAFT/PENDING/ACTIVE/LOCKED/ARCHIVED
                                 /REVERSED/CANCELLED/CLOSED — per entity)
owner:                  string (userId or default role identifier; required)
organization:           string? (KETRACO org unit / dept / cost-centre / tenantId)
effectiveDate:          ISO8601 (in-period date; required)
createdAt:              ISO8601 (auto; required)
updatedAt:              ISO8601 (auto; required)
version:                integer (auto-increment on mutate; ≥1; required)
provenance:             JSON?  {
                                    type: 'INGEST'|'API'|'UI'|'AGENT'|'SYSTEM',
                                    actor: string,
                                    importBatchId?: string,
                                    workflowId?: string,
                                    decisionId?: string,
                                    sourceFileHash?: SHA256,
                                    previousHash?: SHA256 (for chain),
                                    lineageVersion: number
                                }
permissions:            JSON?  { rbac: {role: [actions]}, abac: {conditions[]} }
auditHistory:           JSON?  (array of {timestamp, actor, action, field, before, after})
relationships:          JSON?  { edges: [{targetEntity, targetId, edgeType,
                                                    confidence, source}] }
tenantId:               string  (MULTI-TENANT ISOLATION — rule 26, directive's
                                 implicit tenant requirement)
```

### Notes:
- **Rule 22 idempotency**: unique constraint on `(tenantId, externalId, sourceSystem, effectiveDate)` where applicable.
- **Rule 23 audit**: `auditHistory` append-only. Writes via trigger or repository wrapper; never editable by user.
- **Rule 16 evidence**: for agent-created entities, `provenance.actor` = `AGENT::{agentName}`.
- **Rule 14 provenance**: `provenance` non-null on write (reject at DB level if source is not `MANUAL_INPUT` and provenance is null).
- **Directive §2.8**: NEVER hard-code KETRACO financial values. Seed defaults are for STAGING ONLY; production values must come from source systems or user-uploaded data.

---

## ENTITY ROSTER (47 Entities)

### TABLE 1 — FOUNDATION / STRUCTURE

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | FinancialPeriod | FinancialPeriod | finance_financial_periods | ERP/SAP/EXCEL/MANUAL | FPA_MANAGER | All Finance roles | FPA_MANAGER, CFO | NONE | 1→N BudgetLines, 1→N Journals, 1→N BankTransactions | ✓ |
| 2 | FiscalYear | FiscalYear | finance_fiscal_years | ERP/SAP/MANUAL | CFO | All Finance roles | CFO | NONE | 1→N FinancialPeriods, 1→N Budgets | ✓ |
| 3 | Account | Account | finance_accounts | ERP/SAP/CHART_OF_ACCOUNTS_IMPORT | FPA_MANAGER | All Finance roles | FPA_MANAGER, CFO | NONE | 1→N JournalEntries, 1→N BudgetLines, 1→N Expense/Revenue lines | ✓ |
| 4 | ChartOfAccounts | ChartOfAccounts | finance_chart_of_accounts | ERP/SAP/MANUAL | CFO | All Finance roles | CFO | NONE | 1→N Accounts | ✓ |
| 5 | CostCentre | CostCentre | finance_cost_centres | ERP/SAP/HR/MANUAL | COST_ACCOUNTANT (data steward) | All Finance roles | COST_ACCOUNTANT, FINANCE_DIRECTOR | NONE | 1→N BudgetLines, 1→N Commitments, 1→N OPEX aggregations | ✓ |
| 6 | ProfitCentre | ProfitCentre | finance_profit_centres | ERP/SAP/MANUAL | FPA_MANAGER | All Finance roles | FPA_MANAGER, CFO | NONE | 1→N Revenue lines, 1→N ProjectFinance | ✓ |
| 7 | Department | Department | finance_departments | ERP/HR/SAP/MANUAL | HR (steward), FINANCE_DIRECTOR (finance view) | All Finance roles | FINANCE_DIRECTOR, CFO | NONE | 1→N CostCentres, 1→N Budgets | ✓ |

### TABLE 2 — BUDGETING

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 8 | Budget | Budget | finance_budgets | ERP/SAP/EXCEL/MANUAL/PROJECT_SYSTEM | BUDGET_OWNER (per-budget assignment), default FPA_MANAGER + dept head | Owner, Finance roles, Budget line managers | FPA_MANAGER, FINANCE_DIRECTOR, BUDGET_OWNER in DRAFT only | NONE | N:1 FiscalYear, N:1 Department, 1→N BudgetLines, 1→N BudgetRevisions, 1→N BudgetAllocations | ✓ |
| 9 | BudgetLine | BudgetLine | finance_budget_lines | ERP/SAP/EXCEL/MANUAL | COST_ACCOUNTANT | All Finance roles, Budget owner | FPA_MANAGER, COST_ACCOUNTANT | NONE | N:1 Budget, N:1 Account, N:1 CostCentre, N:1 Project (optional), N:1 FinancialPeriod, 1→N Commitments, 1→N ActualExpense lines | ✓ |
| 10 | BudgetRevision | BudgetRevision | finance_budget_revisions | WORKFLOW/MANUAL | FINANCE_DIRECTOR (reviser), CFO (approver) | Finance roles + affected owner | FINANCE_DIRECTOR (create), CFO (approve) | NONE | N:1 Budget (FK + immutable chain via previousRevisionId) | ✓ |
| 11 | BudgetAllocation | BudgetAllocation | finance_budget_allocations | MANUAL/WORKFLOW/BUDGET_SERVICE | FPA_MANAGER | All Finance roles | FPA_MANAGER, FINANCE_DIRECTOR | NONE | N:1 Budget, N:1 BudgetLine (optional), N:1 Project, N:1 Funding, N:1 Commitment (1:1 coverage) | ✓ |

### TABLE 3 — PROCUREMENT / COMMITMENT / EXPENDITURE CHAIN

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 12 | Commitment | Commitment | finance_commitments | SCM_MODULE (PO/Contract events), ERP/SAP/ARIBA/MANUAL | PROCUREMENT_FINANCE_ANALYST (Finance side; procurement owner in SCM) | Finance roles + SCM counterparts | PROCUREMENT_FINANCE, CFO | NONE | N:1 BudgetLine, N:1 Encumbrance (1:0..1), N:1 PurchaseOrder, N:1 Contract, 1→N Invoices (via edges), N:1 Project, N:1 Supplier | ✓ |
| 13 | Encumbrance | Encumbrance | finance_encumbrances | ERP/SAP/MANUAL | FPA_MANAGER (budget control) | Finance roles | FPA_MANAGER | NONE | N:1 Commitment (1:1), N:1 BudgetLine | ✓ |
| 14 | PurchaseOrder | PurchaseOrder | finance_purchase_orders | SCM_MODULE (SCM routes), ARIBA, ERP/SAP | SCM_OWNER (source side, not Finance bounded context — but finance records copy for integrity), Finance side read-only mirrored from SCM via contract I1 | Same as SCM + Finance roles | Finance side = REPLICATED (NO direct Finance writes — writes via SCM events only) | NONE | 1→N Commitments, N:1 Contract, N:1 Supplier, N:1 Project | ✓ (provenance.sourceSystem = SCM_MODULE on write) |
| 15 | Invoice | Invoice | finance_invoices | ARIBA, ERP/SAP, EXCEL, SCM_MODULE | ACCOUNTS_PAYABLE_CLERK (steward), FINANCE_DIRECTOR approve | Finance roles + SCM + Supplier via portal restricted view | AP_CLERK create, FINANCE_DIRECTOR approve/post | NONE | N:1 PurchaseOrder, N:1 Commitment, N:1 Contract, N:1 Supplier, 1→N Payments (partial), N:1 Journal (posting) | ✓ |
| 16 | Payment | Payment | finance_payments | ERP/SAP, BANK (reconciled), EXCEL | TREASURY_ANALYST initiate, CFO sign | Finance roles + Audit | TREASURY create+submit, CFO release (> threshold 01-18) | NONE | N:M Invoices (splits) via finance_payment_invoice_links, N:1 Supplier, N:1 BankTransaction, N:1 Journal (posting) | ✓ |
| 17 | Receipt | Receipt | finance_receipts | BANK (inflow), ERP/SAP, EXCEL | TREASURY_ANALYST | Finance roles | TREASURY create | NONE | N:1 Receivable (settles), N:1 BankTransaction, N:1 Revenue line | ✓ |
| 18 | Journal | Journal | finance_journals | ERP/SAP, EXCEL, AUTO_POST (Payment/Invoice), MANUAL | COST_ACCOUNTANT (create), INTERNAL_AUDIT (view only) | Finance roles, Audit | COST_ACCOUNTANT, FINANCE_DIRECTOR; Journal poster ≠ approver (SoD 01-18 ABAC) | NONE | 1→N JournalEntries, N:1 FinancialPeriod, N:1 FiscalYear, posted vs draft status | ✓ + chainHash (CP-07) |
| 19 | JournalEntry | JournalEntry | finance_journal_entries | Journal above | same as Journal | same as Journal | same as Journal — poster≠approver | NONE | N:1 Journal, N:1 Account, N:1 CostCentre (optional), Dr/Cr amounts balanced | ✓ |

### TABLE 4 — REVENUE / EXPENSE / FUNDING

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 20 | Expense | Expense | finance_expenses | ERP/SAP, EXCEL, WORK_ORDER (if AM) | COST_ACCOUNTANT, AP_CLERK | Finance roles | COST_ACCOUNTANT classify; AP create | NONE | N:1 Account, N:1 CostCentre, N:1 Invoice (1:0..1), N:1 JournalEntry, N:1 Project, CAPEX/OPEX flag | ✓ |
| 21 | Revenue | Revenue | finance_revenues | BANK (receipt match), ERP/SAP, MARKET_OPS_SYSTEM if power sales | FPA_MANAGER, REVENUE_ANALYST | Finance roles, Corp Gov | REVENUE_ANALYST create; FPA approve | NONE | N:1 Receivable (origin), N:1 Receipt (settled), N:1 ProfitCentre, N:1 Account | ✓ |
| 22 | Funding | Funding | finance_fundings | ERP/SAP, GRANT_DONOR_REPORTS, LOAN_SYSTEM, TREASURY_SYSTEM, MANUAL, EXTERNAL_ECON | FPA_MANAGER (source tracking), CFO approve | Finance roles + Corp Gov + Donor audit (restricted) | FPA create; CFO sign-off | NONE | 1→N BudgetAllocations, 1→N Grants, 1→N Loans, N:1 Project (optional) | ✓ |
| 23 | Grant | Grant | finance_grants | EXTERNAL (donor systems), GRANT_DONOR_REPORTS, MANUAL | FPA_MANAGER grant steward; INTERNAL_AUDIT restricted view | Finance roles, donor-restricted portal view | FPA create; CFO approve | NONE | N:1 Funding, N:M Projects via project_funding links, Compliance milestones JSON | ✓ |
| 24 | Loan | Loan | finance_loans | TREASURY_SYSTEM, BANK_REPORTS, ERP/SAP, DEBT_SYSTEMS, EXTERNAL_ECON (rates) | TREASURY_ANALYST loan steward; CFO approve borrowing | Finance roles (Treasury/CFO view full; others summary) | TREASURY create; CFO sign | NONE | N:1 Funding, 1→N Liability (debt service schedule), 1→N Interest (expense) | ✓ |

### TABLE 5 — BALANCE SHEET / POSITIONS

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 25 | Liability | Liability | finance_liabilities | ERP/SAP, LOAN_SYSTEM, TREASURY, EXCEL | TREASURY_ANALYST, FINANCE_DIRECTOR | Finance roles, Audit | TREASURY, FINANCE_DIRECTOR | NONE | N:1 Loan (if loan), N:1 Account (GL), N:M JournalEntry (amortization/posting) | ✓ |
| 26 | Receivable | Receivable | finance_receivables | ERP/SAP, MARKET_OPS_SYSTEM, MANUAL | REVENUE_ANALYST; INTERNAL_AUDIT view | Finance roles | REVENUE_ANALYST; FINANCE_DIRECTOR write-off (>threshold = CFO) | NONE | 1→N Receipt (settlements partial allowed), N:1 Revenue (origin), N:1 Customer (internal or external) | ✓ |
| 27 | Payable | Payable | finance_payables | ERP/SAP, INVOICE_POST, MANUAL | AP_CLERK; FINANCE_DIRECTOR view; TREASURY view payments | Finance roles + SCM limited view | AP_CLERK; FINANCE_DIRECTOR approve | NONE | N:1 Invoice (1:1 mirror of unpaid Invoice balance), 1→N Payments (partial) | ✓ |
| 28 | CashAccount | CashAccount | finance_cash_accounts | BANK, ERP/SAP, TREASURY_SYSTEM | TREASURY_ANALYST; CFO view full, others summary | Treasury roles + CFO + Audit | TREASURY create/update balance; CFO authorize new accounts | NONE | 1→N BankTransactions, Opening/Closing balance per period (via period-close snapshot) | ✓ |
| 29 | BankTransaction | BankTransaction | finance_bank_transactions | BANK (statement import: CSV/MT940/BAI2/API), EXCEL | TREASURY_ANALYST (reconciler); BANK feed read-only by default | Treasury + Audit | TREASURY reconcile match; BANK source immutable; MANUAL adjustments only via Journal (not direct edit) | NONE | N:1 CashAccount, N:1 Payment (reconciled), N:1 Receipt (reconciled), ReconciliationStatus {MATCHED/UNMATCHED/INVESTIGATE} | ✓ |

### TABLE 6 — ASSETS / CAPITALIZATION

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 30 | AssetValue | AssetValue | finance_asset_values | ASSET_SYSTEM (SCM Asset Register), ERP/SAP, PROJECT_SYSTEM (commissioning/handover), MANUAL | FIXED_ASSET_ACCOUNTANT (steward); Asset Mgmt read-only limited view | Finance roles + Asset Mgmt org read | FIXED_ASSET_ACCOUNTANT create; FINANCE_DIRECTOR revaluation approve | NONE | N:1 Asset (from KETRACO Asset Ontology §AssetManagement via id), 1→N Depreciation, N:1 CAPEX (capitalization source) | ✓ |
| 31 | Depreciation | Depreciation | finance_depreciation_schedule | COMPUTED (engine output), ERP/SAP comparison | FIXED_ASSET_ACCOUNTANT; AUDIT view | Finance roles + Asset Mgmt limited | ENGINE writes rows; FIXED_ASSET_ACCOUNTANT can override only via approved Adjustment (Decision 18 WF) | NONE | N:1 AssetValue, N:1 FinancialPeriod, N:1 JournalEntry (posting) | ✓ |
| 32 | CAPEX | CAPEX | finance_capex | PROJECT_SYSTEM, SCM (contract/PO/Invoice actuals), BUDGET_LINES tagged CAPEX | CAPEX_STEWARD default = FPA_MANAGER with CAPEX_STEWARD extra role; FM_01-18 | Finance roles, Corp Gov, Board if portfolio reporting | CAPEX_STEWARD; CFO threshold | NONE | N:1 Project, N:M BudgetAllocations (project budget split), N:M Commitments, 1→N AssetValue (capitalized), N:1 Account | ✓ |
| 33 | OPEX | OPEX | finance_opex | EXPENSE lines grouped; ERP/SAP; OPERATIONAL_SYSTEM work orders | OPEX_STEWARD default = COST_ACCOUNTANT + OPEX category stewards | Finance roles | OPEX_STEWARD classify | NONE | N:1 Expense (per line), N:1 CostCentre, categorized by 08-01 enum (11 categories), linked Operational driver when available | ✓ |

### TABLE 7 — PROJECTS & FORECASTING

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 34 | ProjectFinance | ProjectFinance | finance_project_finance | COMPUTED (aggregate), MANUAL overrides via Decision 18 WF, PROJECT_SYSTEM progress | PROJECT_FINANCE_ANALYST steward; FPA_MANAGER owner | Finance roles, Project managers (own project only), Corp Gov, Board (aggregate) | PROJECT_FINANCE create; FINANCE_DIRECTOR approve override | NONE | N:1 Project (from KETRACO Projects Ontology §Projects), 1→N ProjectCost (periodic), 1→N CostToComplete snapshots, 1→N Forecasts (per project) | ✓ |
| 35 | ProjectCost | ProjectCost | finance_project_cost_periodic | COMPUTED (pipeline aggregate), PROJECT_SYSTEM events | PROJECT_FINANCE_ANALYST | Same as ProjectFinance | ENGINE writes; manual revise via BudgetRevision style chain | NONE | N:1 ProjectFinance, N:1 FinancialPeriod, Approved/Revised/Actual/Commitments/Forecast (5-tuple per period) | ✓ |
| 36 | CostToComplete | CostToComplete | finance_cost_to_complete | COMPUTED (Engine 06-03) | PROJECT_FINANCE_ANALYST review | Same as ProjectFinance | ENGINE writes; adjustment via Decision 18 | NONE | N:1 ProjectFinance, modelVersion = 'CTC_V1', inputs JSON with CPI/EV etc., assumptions JSON | ✓ |
| 37 | Forecast | Forecast | finance_forecasts | COMPUTED (Engine 10-*), MANUAL, SCENARIO variant | FPandA_AGENT (auto), FPA_MANAGER review, FORECASTING_AGENT (auto), CFO publish approve | Finance roles + Corp Gov, Budget line managers own | FPA_MANAGER; CFO publish | NONE | forecastId (PK), N:1 Entity (Budget/Project/Cash/OPEX/Revenue via forecastSubject {type,id}), model, modelVersion, trainingDataWindow {from,to}, forecastHorizon, assumptions JSON, ciLow/cHigh nullable, errorMetrics JSON, timestamp | ✓ + lineage CP-07 |
| 38 | Scenario | Scenario | finance_scenarios | USER_CREATED via Phase 11 UI, AGENT_CREATED via Decision 18 SIMULATE step | SCENARIO_AGENT author, user = owner; defaults role = FPA_MANAGER | Finance roles, Decision participants | Owner, FPA_MANAGER duplicate/version; CFO can delete sandbox drafts only | NONE | 1→N ScenarioRuns, N:M Forecasts (scenario-variant forecast rows), baseForecastId FK (nullable to Forecast) | ✓ |

### TABLE 8 — RISK / DECISION / REPORTING / METRICS

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 39 | FinancialRisk | FinancialRisk | finance_financial_risks | COMPUTED (risk engine 13-*), MANUAL, AGENT_CREATED, EVENT_TRIGGERED (detector alerts) | RISK_OWNER per-risk (default per type: e.g. Treasury for FX/Funding/liquidity; FPA for budget/cost overrun); FINANCIAL_RISK_AGENT steward | Finance roles, Risk dept, Corp Gov, Board (aggregate), Audit | Risk owners update status/mitigations; Risk engine opens new | NONE | risk, probability level (LOW/MED/HIGH/CRITICAL — NOT %), impact, exposure, drivers, evidence[], mitigations[{desc,owner,status}], owner, status (IDENTIFIED→ASSESSED→MITIGATED→CLOSED), linked FKs (Budget/Project/Cash/Supplier) | ✓ + SIGNAL DENSITY field for fraud-type risks per 13-15 |
| 40 | FinancialDecision | FinancialDecision | finance_financial_decisions | AUTO_CREATE (18-02 detectors), MANUAL, COPILOT_RECOMMEND, AGENT_CREATED | DECISION_OWNER dynamic per decision; approvers via ABAC 01-18 thresholds | Finance roles + DecisionParticipants[] (whitelist) + Audit | Owner lifecycle; approvers approve (18-07); others read-only unless whitelisted | NONE | 9-state DETECT→INVESTIGATE→MODEL→SIMULATE→RECOMMEND→APPROVE→EXECUTE→VERIFY→CLOSED/REJECTED, decisionId PK, triggerEvidence, evidenceBag, modelSnapshot, scenarioRunIds[], recommendation, approvalChain[], executePlan, varianceResult | ✓ + hash chain CP-07 |
| 41 | FinancialRecommendation | FinancialRecommendation | finance_financial_recommendations | DECISION (output), COPILOT (output), AGENT (output) | Recommender (agent or user), CFO approval before publish | Finance roles + Decision participants | Creator; CFO approve consequential (Rule 17) | NONE | N:1 FinancialDecision (optional), recommendation enum, rationale text, evidence[] refs, policyGates JSON, riskMitigations[], assumptions[], requiresApproval bool, recommendedActions[] | ✓ + Rule 17 evidence always attached |
| 42 | FinancialMetric | FinancialMetric | finance_metric_catalog | SEEDED (Phase 03-02) + MANUAL new metrics | Metric Steward = FPA_MANAGER + CFO; OWNER per-metric assignment | All Finance roles + dashboard viewers | Steward new/edit; CFO publish to production UI (03-06 guard) | NONE | metricId PK, name, description, formula (parseable AST/string), source array, dimensions[], refreshFrequency, owner, permissions JSON, lineage (semantic lineage), version | ✓ + 03-06 runtime guard |
| 43 | FinancialReport | FinancialReport | finance_financial_reports | COMPILED (ManagementReportingAgent), USER_CREATED, EXCEL (ingested as snapshot), AGENT_CREATED | REPORT_OWNER per report; ManagementReportingAgent auto author | Finance roles + Board + Audit + External Stakeholders (restricted distribution) | Author; CFO publish sign-off | NONE | reportId PK, period N:1, reportPeriodType (monthly/quarterly/yearly/ad-hoc), sections JSON, metricRefs[], narrative, attachmentHash, publishedAt, distributionList[] | ✓ + audit chain CP-07 |

### TABLE 9 — SUPPORT / REGISTRY / TENANT

| # | Entity Name | TS Type | SQLite Table | Source Systems | Owner Role | Read | Write | Delete | Key Rel | Universal Fields |
|---|---|---|---|---|---|---|---|---|---|---|
| 44 | ImportBatch | ImportBatch | finance_import_batches | EXCEL/CSV (02-10), API ingestion (01-16), BATCH ingestion | INGESTION_STEWARD default = FPA_MANAGER; AGENT in provenance.actor | Finance roles, Audit | Steward confirm-import (02-10); agent close batch | NONE | batchId PK, sessionId, workbookName, sourceFileHash SHA-256, uploaderId, sourceSystem, entityCounts JSON, qualityScore (0-100), confirmStatus {PENDING/APPROVED/REJECTED}, confirmedBy, confirmedAt | ✓ — all imported entities carry `provenance.importBatchId` |
| 45 | FinanceUserRoleAssignment | FinanceUserRoleAssignment | finance_user_role_assignments | IDP sync, MANUAL, RBAC_ADMIN | RBAC_ADMIN + CFO | Admin roles; Audit view | RBAC_ADMIN; CFO approve threshold roles | NONE | userId, role (from 01-18 list), tenantId, effectiveFrom, effectiveTo, delegationThreshold {currency,amount}, assignedBy | — tenant-level |
| 46 | FinanceSourceConnectorInstance | FinanceSourceConnectorInstance | finance_source_connector_instances | SourceRegistry (01-07), MANUAL | INTEGRATION_ENGINEER + CFO | Finance roles (health only), Integration roles | Integration, Finance (enable/disable) | NONE | connectorId PK, connectorType enum (11 types from 01-07), config JSON (secrets via env/vault not DB!), healthStatus, lastSyncAt, errorCount, enabled | ✓ |
| 47 | FinanceAuditChainLink | FinanceAuditChainLink | finance_audit_chain_links | AUTO (every material write) | INTERNAL_AUDIT_FINANCE (viewers only); SYSTEM WRITER | Audit roles only; others need explicit escalation Decision | NONE (system writes only) | NONE | linkId PK, entityRef {type,id}, action (POSTED/APPROVED/RELEASED/REVISED), actor, timestamp, previousHash SHA-256, thisHash SHA-256 (previous + payload + nonce), payloadHash | — CP-07 chain |

---

## SEMANTIC LAYER METRIC CATALOG (Directive Phase 03 minimum set)

Each row defines: MetricId, Name, Category, Deterministic Formula String, Source Entities, Default Dimensions, Default Refresh, Owner, RBAC Visibility, Lineage Origin, Version, Notes.

**Engineering Rule:** UI cannot display numeric KPI unless it references a metricId with a formula entry here.

| metricId | Name | Category | Formula | Source Tables/Entities | Default Dimensions | Refresh | Default Owner | Visibility (roles) | Lineage Origin | Ver |
|---|---|---|---|---|---|---|---|---|---|---|
| M001 | Revenue | P&L | `SUM(SELECT amount FROM finance_revenues WHERE periodId = @period AND status = 'RECOGNIZED')` | Revenue, Receivable, Receipt | period, department, profitCentre, account | Daily @ 06:00 | FPA_MANAGER | All Finance, Corp Gov, Board | Revenue → Receivable → Receipt chain | v1 |
| M002 | OPEX | P&L / OPEX | `SUM(SELECT amount FROM finance_expenses WHERE periodId = @period AND capex_opex = 'OPEX')` | Expense, OPEX, JournalEntry | period, costCentre, category(11), department, account | Daily | OPEX_STEWARD | All Finance, Budget owners | OPEX→Expense→Invoice→Payment→Journal | v1 |
| M003 | CAPEX | Balance / CAPEX | `SUM(SELECT amount FROM finance_expenses WHERE periodId = @period AND capex_opex = 'CAPEX') + SUM(SELECT capitalizedAmount FROM finance_capex WHERE periodId = @period)` | CAPEX, Expense, AssetValue, ProjectCost | period, project, program, capexPortfolio, account | Daily | CAPEX_STEWARD | All Finance, Corp Gov, Board | CAPEX→BudgetAllocation→Commitment→Payment | v1 |
| M004 | Budget | Budget | `SUM(SELECT amount FROM finance_budget_lines WHERE budgetId = @budgetId AND status = 'APPROVED')` | Budget, BudgetLine | period, department, costCentre, project, capex_opex, account, fundingSource | On budget approve | FPA_MANAGER | All Finance, Budget owners | Budget → Revision chain → Allocations | v1 |
| M005 | Actual | Budget Pipeline | `SUM(SELECT amount FROM finance_expenses WHERE budgetLineId IN (...lines of @budgetId))` | Expense, BudgetLine, JournalEntry | Same as M004 + any Budget dimension | Daily | FPA_MANAGER | All Finance, Budget owners | Actuals → Expense → Invoice/PO → Commitment → BudgetLine | v1 |
| M006 | Commitments | Budget Pipeline | `SUM(SELECT amount FROM finance_commitments WHERE status IN ('FIRM','OBLIGATED') AND budgetLineId IN (...lines of @budgetId))` | Commitment, Encumbrance, PO | Same as M004 | Near realtime on commitment event | PROCUREMENT_FINANCE | All Finance, SCM, Budget owners | Commitment → PO → Contract → Tender → Award | v1 |
| M007 | Available Budget | Budget Pipeline | `M004(@budgetId) - M005(@budgetId) - M006(@budgetId)` | Budget (M004-M006 derived) | Same as M004 | Daily | FPA_MANAGER | All Finance, Budget owners | M004, M005, M006 | v1 |
| M008 | Budget Utilization % | Budget Health | `(M005 + M006) / M004 * 100` where M004 > 0; NULL if M004 ≤ 0 | Derived | Same as M004 + period_elapsed_% for burn context | Daily | FPA_MANAGER | All Finance, Budget owners | M004-M007 | v1 |
| M009 | Budget Variance | Budget Health | `M005 - M004 * period_elapsed_pct` period_elapsed_pct = (today − periodStart) / (periodEnd − periodStart) if period active, else 1.0 | Derived + FinancialPeriod calendar | Same as M004 | Daily | FPA_MANAGER | All Finance, Budget owners | M004,M005 + calendar | v1 |
| M010 | Forecast Variance | Forecast Quality | `FORECAST_VALUE(subject, horizon, published 1 period ago) − ACTUAL_VALUE(actual_period)` — requires matching forecast publish | Forecast, Actual (M005) | subject (project/budget/cash), horizon, method | Monthly after close | FORECASTING_AGENT owner (system); FPA review | All Finance | Forecast → subject entity → actuals chain | v1 |
| M011 | Cash Balance | Treasury | `SUM(openingBalance) − SUM(outflows) + SUM(inflows)` for period; or latest balance from BankTransaction reconciled totals | CashAccount, BankTransaction (reconciled), Receipt, Payment | cashAccount, currency, period | Intraday (bank feed) / Daily | TREASURY_ANALYST; CFO full, others summary only | Treasury + CFO + Audit | CashAccount → BankTx → Payment/Receipt → Invoice/Revenue | v1 |
| M012 | Cash Inflow | Treasury | `SUM(SELECT amount FROM finance_receipts WHERE period = @period AND status = 'CLEARED') + SUM(non-receipt bank inflows from BankTx reconciled)` | Receipt, BankTransaction | period, cashAccount, currency, inflowType (receivable/loan/grant/other) | Daily | TREASURY_ANALYST | Treasury + CFO + Audit | Receipt → Receivable → Revenue | v1 |
| M013 | Cash Outflow | Treasury | `SUM(SELECT amount FROM finance_payments WHERE period = @period AND status = 'RELEASED') + SUM(non-payment bank outflows reconciled)` | Payment, BankTransaction | period, cashAccount, currency, payableCategory | Daily | TREASURY_ANALYST | Treasury + CFO + Audit | Payment → Invoice → PO → Commitment | v1 |
| M014 | Accounts Payable (AP) | Working Capital | `SUM(SELECT openBalance FROM finance_payables WHERE asOfDate = TODAY)` | Payable, Invoice (open), Payment (partial offsets) | period, supplier, costCentre, agingBucket | Daily | AP_CLERK, FINANCE_DIRECTOR view | AP, Finance, Treasury, Audit | Payable → Invoice → PO → Commitment | v1 |
| M015 | Accounts Receivable (AR) | Working Capital | `SUM(SELECT openBalance FROM finance_receivables WHERE asOfDate = TODAY)` | Receivable, Revenue, Receipt (partial offsets) | period, customer, agingBucket, currency | Daily | REVENUE_ANALYST, FPA_MANAGER | Finance, Treasury, Audit | Receivable → Revenue → Invoice (if billed) | v1 |
| M016 | Working Capital | Liquidity | `(M011_cash_only + M015_AR) − M014_AP` — Current Assets (cash + net AR) − Current Liabilities (net AP) | Derived M011/M015/M014 | period, currency, department (if AR/AP allocable) | Daily | TREASURY_ANALYST; CFO, Board for aggregate | Finance, Treasury, Board, Audit | M011/M014/M015 | v1 |
| M017 | Debt | Balance Sheet | `SUM(SELECT outstandingPrincipal FROM finance_liabilities WHERE type IN ('LOAN','BOND','LEASING') AND status = 'ACTIVE') + SUM(Loan outstanding)` | Liability, Loan, Debt | period, debtType, lender, currency, maturityBucket | Monthly | TREASURY_ANALYST; CFO full; others summary with thresholds | Treasury, CFO, Board, Audit | Liability → Loan → Funding → BankTx | v1 |
| M018 | Liquidity (Quick Ratio) | Liquidity | `(M011 + M015_short_term) / M014_current` where short_term = aging < 90d; current = AP due within 12 months | Derived | period, currency, department (allocable) | Daily | TREASURY_ANALYST | Treasury, CFO, Board, Audit | M011/M014/M015 with aging filters | v1 |
| M019 | Project Cost | Project Finance | `SELECT (actualCost + commitmentCost) FROM finance_project_cost_periodic WHERE project = @project AND periodId = @current OR latest_as_of` | ProjectCost, ProjectFinance, Commitment, Expense | project, period, costBucket (approved/revised/actual/commitment/forecast) | Daily / On project event | PROJECT_FINANCE_ANALYST | Finance roles, Project manager own-project only, Corp Gov, Board (portfolio) | ProjectFinance → Budget → Commitment → PO → Invoice → Payment | v1 |
| M020 | Cost To Complete | Project Finance | `EAC = actualCost + (budget_at_completion − actualCost) / CPI` where CPI = earnedValue / actualCost; earnedValue = BAC × physicalProgress_pct if available. If physicalProgress unavailable → linear CPI = 1.0 fallback. | CostToComplete, ProjectCost, Forecast | project, method (CPI/LINEAR/SUBJECTIVE_OVERRIDE), assumptions | Daily on new actual/commit | PROJECT_FINANCE_ANALYST | Finance roles, Project managers, Corp Gov, Board | ProjectCost → CTC engine inputs → Forecast → Scenario | v1 |
| M021 | Financial Exposure | Risk | `SUM(openCommitmentAmount WHERE supplier = @supplier) + SUM(outstandingLoan WHERE lender = @lender) + SUM(openAR WHERE customer = @customer) + FX open contracts USD/KES exposure value` | Commitment, Loan, Receivable, BankTx open FX contracts | counterparty, exposureType (supplier/lender/customer/FX/other), currency, riskLevel | Daily / realtime on risk event | FINANCIAL_RISK_AGENT system owner; RISK_OWNERS per row | Finance, Risk, Board (Top-N exposures), Audit | Commitment/Contract/PO/Supplier → Exposure rollup; Loan/Liability → Lender exposure; Receivable → Customer exposure; Open forward contracts → FX | v1 |

---

## SOURCE SYSTEM MATRIX (Directive Phase 01 inputs × Entities populated)

| Source System | Entities Primarily Populated | Ingestion Pattern (§01) | Notes |
|---|---|---|---|
| ERP (generic) | FinancialPeriod, FiscalYear, Account, COA, CostCentre, ProfitCentre, Dept, Budget, BudgetLine, Commitment, PO, Invoice, Payment, Journal, Expense, Revenue, AP, AR, Liability, CashAccount, Depreciation, CAPEX, OPEX, Funding, Loan | scheduled + event + batch + incremental | Primary GL/AP/AR source |
| SAP S/4HANA | Same as ERP, plus BankTransaction if SAP cash management | Same as ERP + API | Standard SAP GL, MM, FI-CA interfaces; use existing ConnectorFramework BaseConnector |
| SAP Ariba | PurchaseOrder, Invoice (supplier self-service), Supplier master refs | Scheduled + event | Ariba Network cXML / API |
| Finance databases | Any — direct DB extract via Connector | batch/incremental | Use ConnectorConfig type = FINANCE |
| Excel (.xlsx) | Budget, BudgetLine, Invoice, Payment, Receipt, BankTransaction, Forecast (human-reviewed), FinancialReport snapshots | Excel upload (Phase 02 flagship) + EXPLICIT SOURCE HASH + confirm-before-write Rule 28 | NEVER silent overwrite. Source file SHA-256 required. |
| CSV (flat) | Same as Excel; Bank statement CSV/MT940 style | Excel upload equivalent pipeline; identical confirm-before-write | Same provenance as Excel; different connector |
| PDF (invoice / bank statement / report) | Invoice, BankTransaction, Expense claim, FinancialReport document indexing | DocumentIntelligence pipeline existing → Finance category tagging. No direct write to canonical tables without HUMAN REVIEW confirm (Rule 28 anti-silent-overwrite). | EvaluationService.ingestDocument() + Finance category constants; data written ONLY after human confirm-import or agent-with-HITL decision |
| Bank Data | BankTransaction, CashAccount, Payment reconciliation matches, Receipt reconciliation matches | Scheduled (nightly) + event (real-time if API), API ingestion | BAI2 / MT940 / bank API. Reconciled via 09-01 match engine. BANK source transactions immutable. |
| Project systems (Primavera, MS Project, in-house) | Project entity link to Finance, Physical Progress %, Project Cost feeds, Forecast dates, Funding sources | Event + scheduled batch | Cross-domain §4 Project HAS_BUDGET/HAS_COST/HAS_FORECAST/HAS_FUNDING/HAS_ASSET |
| Procurement systems (SCM ARIBA) | Tender → Contract → PO → Commitment chain events | Event fabric contracts I1-I3 (from Audit doc §5 I1,I2,I3) | Finance bounded context NEVER writes SCM-owned objects directly; reads events and creates Finance mirror rows with provenance.sourceSystem = SCM_MODULE |
| Asset systems (AM module/EAM/CMMS) | AssetValue link (ASSET id), Maintenance work orders → OPEX operational driver link, Asset commissioning date trigger for capitalization | Event + batch | Cross-domain §4 Asset HAS_CAPITAL_VALUE / REQUIRES_CAPEX / GENERATES_MAINTENANCE_COST |
| Operational systems (Grid Ops / SCADA / Dispatch) | OPEX operational drivers (SystemOperations events → operational cost), PowerManagement events (import/export) | Event fabric + connector | Cross-domain §4 SystemOperations IMPACTS OPEX / PowerManagement IMPORT_COST / EXPORT_REVENUE |
| External economic data providers (CBK, KNBS, IMF, FX market, rates) | FX rates, inflation rates, interest rates, sector/economy KPIs, energy price indices | Scheduled batch (hourly/daily) + external connector | Stored as lookup tables (finance_fx_rates, finance_inflation_series, finance_interest_rates) + available as assumption parameters in Forecast (10-05)/Scenario (11-02). NEVER fabricate rates. |

---

## SECURITY / RBAC REFERENCE (Directive §2 Rules 16,17,18,19,20,22,24,27)

### Default Finance Role Set (Phase 01-18, AuthorizationService ROLE_PERMISSIONS map extension)

| Role Key | Display Name | Typical Permissions in this Data Map | Delegation of Authority Threshold (Default, KES) |
|---|---|---|---|
| CFO | Chief Financial Officer | finance:* (all); decision:approve_final; budget:approve_any; payment:release_any; forecast:publish; report:publish_board; role:assign_any_threshold_role | Unlimited (Board required for > statutory thresholds) |
| FINANCE_DIRECTOR | Finance Director / Deputy CFO | budgets:approve_major; payments:approve_large; journals:approve; allocations:revise; revisions:sign_off; role:assign_staff_roles; read:all_finance_details | ≤ 5,000,000 (single payment / commitment / budget revision) |
| FPA_MANAGER | FP&A / Budget Manager | budgets:create; allocations:create; revisions:request; forecasts:create/edit; metrics:edit_stewardship; reports:create; decisions:create_investigate; read:all_finance_details | ≤ 500,000 |
| TREASURY_ANALYST | Treasury Analyst & Cash | payments:create/submit_not_release; receipts:create; bank_tx:reconcile; cash:reclassify; loans:manage_stewardship; debt:read_full; read:cash_debt_full_details | Submit payments ≤ CFO threshold; CANNOT release alone above 50k; ≥ 50k needs second signer Finance_Director |
| COST_ACCOUNTANT | Cost / Management Accountant | expenses:classify; journals:create_not_post; capex_opex:reclassify_request; actuals:adjust_small_via_journal; depreciation:override_via_workflow; read:all_finance_details; SoD: cannot approve own journals (Rule 18, 14-03) | ≤ 50,000 journal adjustments; SOUND POSTER ≠ APPROVER ENFORCED by ABAC 01-18 |
| AP_CLERK | Accounts Payable Clerk | invoices:create/post_to_draft; payables:maintain; payments:submit_small; read:ap_details; CANNOT approve invoices ≥ 50k (FINANCE_DIRECTOR approval) | ≤ 50,000 invoice post; payment submit ≤ 50k; CANNOT release |
| REVENUE_ANALYST | Revenue / AR Analyst | receivables:maintain; revenue:classify; receipts:match; read:ar_details; write_off_request_submit | ≤ 250,000 write-off request; actual write-off approval ≥ FINANCE_DIRECTOR per 01-18 |
| PROCUREMENT_FINANCE | Procurement Finance / Contract Finance Analyst | commitments:analyst_write; po:read_from_scm; contract:read; commitment:create_from_scm_event; budget_available:check; overcommitment_alert:resolve_owner | Commitment analyst edits only; threshold rules apply to approvals; SCM bounded context writes PO/Contract/Tender |
| PROJECT_FINANCE_ANALYST | Project Finance / PMO Finance | projects:finance_read_write; ctc:override_request; project_forecast:input; budget_allocations_per_project; read:own_projects | Within assigned project budget; revisions via standard BudgetRevision WF |
| INTERNAL_AUDIT_FINANCE | Internal Audit (Finance Scope) | read:ALL_FINANCE_ENTITIES + audit chain; cases:review; anomaly:investigate_without_close (close still Finance Director / CFO signoff per 14-12 terminal states) | READ-ONLY DEFAULT. WRITE limited to CaseManagementSystem notes + recommendation to escalate. CANNOT approve/close. |
| AUDIT_COMMITTEE (Board sub) | Audit Committee Member | read:summary_financial_reports; risk_register:view_full; anomaly_cases:view_closed; decisions:view_final_closed; CANNOT see individual salaries/bank account numbers at transaction granularity unless authorized by CFO escalation Decision | Aggregated / masked by default; drill-down requires decision 18 escalation WF |
| BUDGET_LINE_MANAGER (non-finance) | Cost Centre / Dept Head (non-Finance) | budgets:read_own_cost_centre; budget_utilization:view; anomaly_alerts:acknowledge_owner_view_only; requests:submit_budget_revision_owned; CANNOT approve; CANNOT see other cost-centres unless parent dept aggregator | Read + Request Only; no direct Finance entity mutation |
| SCM_FINANCE_VIEWER | SCM counterparty viewer (CPO, Procurement Director, Evaluation teams) | commitments:read; PO finance mirror:read; contract:value+exposure read; invoice status own-contracts; supplier exposure aggregate view; CANNOT see payments, journals, bank tx, salaries, debts | Read-only limited scope. Write only via SCM bounded context events (not direct Finance writes) |
| PROJECT_MANAGER_VIEWER | Project Manager (non-Finance) | projects:finance_read_own (7-box per 06-02); project_health:view_own; commitment read own project; invoices status own; CANNOT see payments/bank tx/salaries | Read-only per-project scoped to assigned project |

### RBAC ENFORCEMENT RULES (non-negotiable)

1. **AuthorizationService middleware mandatory** on every `/api/finance/*` route (Phase 01-16 mounting pattern after SCM block in server.ts).
2. **ABAC rules (Directive Rules 18,19,20)**: Every consequential write = evaluated through ABAC:
   - Delegation thresholds (payment/commitment/budget revision amount)
   - Segregation of Duties (SoD): Journal poster ≠ approver, Invoice creator ≠ payment releaser for the same vendor+amount±tolerance, Budget revision requester ≠ approver
   - Period close lock: After FinancialPeriod.status = CLOSED → no Journal, Expense, Revenue, Payment, Receipt writes to that period EXCEPT via explicit Reopen Decision (state 18) with CFO + Audit signoff
   - Tenant isolation: Every query includes `tenantId`; results filtered
3. **Rule 19 Agents inherit user permissions**: Agent write context includes `provenance.actor = AGENT::name` AND `provenance.onBehalfOfUser = userId`. Authorization check uses USER permissions NOT agent. Agent cannot grant itself extra permissions. (Task 16-07 enforcement)
4. **Rule 20 No financial control bypass**: FinancialControl module (Phase 14-11) runs BEFORE any material write; if any control FAILs with severity=CRITICAL, write is aborted regardless of RBAC. Decision 18 WF can override specific FAIL controls with documented rationale + CFO/Board approval + Audit record.
5. **Rule 21 Idempotency**: Every mutation endpoint accepts `idempotencyKey` header or body field; unique constraint `(tenantId, idempotencyKey, entityType)` — same key twice returns first-write result (no second write).
6. **Rule 22 Auditable events**: Every material mutation emits event FIN.{{ENTITY}}.{{ACTION}} to EventBus (BaseEvent category=FINANCIAL_EVENT). Audit log row written. For consequential: payment release, budget approve, journal post, forecast publish, decision approve → extra hash chain link in FinanceAuditChainLink (CP-07).
7. **Rule 23 Lineage**: Every metric (M001-M021) has lineage defined here in §Metric Catalog; every canonical entity has provenance.sourceRecordId; every Excel import has importBatchId; every Forecast has trainingDataWindow + inputs.

---

## INTEGRITY & NON-FABRICATION RULES (Directive §2 Rules 8-15, 24-27)

- **Rule 8 — No hard-coded KETRACO values**: Seed dev fixture values (CP-03) MUST be tagged `provenance.sourceSystem = FIXTURE`, status `DRAFT/FIXTURE`, hidden from production UI via a tenant-level flag `PROD_MODE` that filters FIXTURE rows.
- **Rule 9 — No fabricated KPIs**: Any number in UI must resolve to MetricCatalog (M001-M021 or user-registered with formula).
- **Rule 10 — No fabricated forecasts**: Forecast entity always has `model`, `modelVersion`, `trainingDataWindow`, `assumptions`, `timestamp`. If actuals<2×horizon, CI values = NULL and errorMetrics.status = INSUFFICIENT_HISTORY (10-06 backtest rule).
- **Rule 11 — No random confidence**: Risk engine returns `probability_level = LOW / MEDIUM / HIGH / CRITICAL`; never a %. Anomaly signal = SIGNAL_DENSITY (1/2/3+). Forecast CIs = residual-backed or NULL.
- **Rule 12 — No mock as production**: `PROD_MODE` = true → fixture rows invisible; `PROD_MODE` = false → dev fixtures rendered with "DEVELOPMENT FIXTURE" banner in UI (Finance shell CP-02 displays banner).
- **Rule 13 — Fixture isolation**: Manifest `backend/finance/fixtures/FIXTURES_ARE_NOT_PRODUCTION.md`; CI/CD script checks PROD_MODE before deploy.
- **Rule 14 — Provenance**: Every Finance entity.provenance non-null; Excel import hash + sourceFileHash + importBatchId stored.
- **Rule 15 — Deterministic formulas**: Metric formulas written to parseable string; 03-03 MetricEngine evaluates with trace.
- **Rule 24 — Forecast horizon/model version**: Forecast entity fields enforced; UI displays.
- **Rule 25 — Reproducible scenarios**: ScenarioRun reproduce(id) returns same result (hash-identical inputs).
- **Rule 26 — Traceable decisions**: Decision 18 full lifecycle audit + hash chain CP-07.
- **Rule 27 — Integration failure handling**: Every connector has health check; sync job returns failure with retryable flag; fallback EXCEL pathway exists if ERP/SAP unavailable (data fabric 01-07 source-registry prioritizes primary source then fallbacks).

---

## Finance Master Ledger Entry

| Entry # | Timestamp | Phase | Event | Author |
|---|---|---|---|---|
| FM-003 | 2026-08-31T00:00:00Z | 00 | Data Map complete. 47 Finance entities documented. 21 canonical financial metrics with formulas defined. 13 source systems × entities mapped. 13 RBAC roles with delegation thresholds. Security & integrity rules enumerated. | DATA-MAP-SYSTEM |

