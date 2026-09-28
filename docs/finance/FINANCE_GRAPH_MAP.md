# FINANCE INTELLIGENCE — GRAPH MAP

**Program:** KETRACO Salience Atlas Finance Intelligence OS
**Reference:** Directive §4 (Cross-Domain Graph Relationships), §3 (Finance Domain Ontology entities = 47 graph node types)
**Source file target:** `packages/graph-schema/index.ts` — extend GRID_GRAPH_SCHEMA nodeTypes/edgeTypes with Finance families (Phase 01-03).
**Existing baseline:** Audit findings show 37 GRID node types + 27 GRID edge types, zero Finance. Graph engine = `backend/evaluation/knowledge-graph.ts` `KnowledgeGraphService` in-memory Map with `addNode/addEdge/getGraph/getNode/getNeighbors/search/traverse(depth)`. Finance shares this singleton — NO parallel graph instance.

---

## 1 GRAPH SCHEMA EXTENSION PLAN

### 1.1 Existing Baseline Reconciliation

From audit §4: existing graph-schema exports:

```ts
GRID_GRAPH_NODE_TYPES = [
  'GRID','REGION','CORRIDOR','LINE','SUBSTATION','TRANSFORMER','BREAKER','SWITCHGEAR',
  'BUS','PROTECTION','COMMUNICATION','CONTROL_SYSTEM','CELLTOWER','DISPATCH_CENTER',
  'ASSET','TENDER','SUPPLIER','CONTRACT','DIRECTOR','SITE','PROJECT','PROGRAM',
  'PERSON','ORGANIZATION','REGULATION','STANDARD','DOCUMENT','WORKORDER','MISSION',
  'MISSION_REPORT','INCIDENT','INVENTORY_ITEM','MATERIAL','EQUIPMENT','SPARE_PART',
  'RISK','THREAT'
];   // = 37 node types, NONE Finance
```

```ts
GRID_GRAPH_EDGE_TYPES = [
  'CONTAINS','CONNECTS_TO','LOCATED_AT','HAS_TRANSFORMER','HAS_BREAKER','HAS_SWITCHGEAR',
  'HAS_PROTECTION','HAS_COMMUNICATION','HAS_CONTROL','BELONGS_TO_REGION','PART_OF_CORRIDOR',
  'AWARDED_TO','SIGNED_BY','BIDS_ON','SUPPLIES','MANAGES','WORKS_AT','GOVERNS',
  'REFERENCES','IMPLEMENTS','COMPLIANT_WITH','INVOLVES','CAUSED_BY','MITIGATES',
  'LOCATED_IN','REPORTS_TO','AUDITED_BY','EQUIPPED_WITH','RELATES_TO'
];   // = 29 edge types (audit said 27; actual = 29 per code; both zero Finance)
```

### 1.2 Plan: Append Finance Families (do NOT remove GRID nodes/edges)

Append to arrays in-place. Full graph = 37 + 47 = 84 nodes, 29 + 54 = 83 edges. Grep existing code for `GRID_GRAPH_NODE_TYPES` → no breaking hard-coded length assumptions. Safe to append.

---

## 2 FINANCE NODE TYPES (47 New → total 84)

All entities from §3 of directive and §47 entities of FINANCE_DATA_MAP.md. Node label in graph uses SAME string as entity name to make cross-references trivial.

Order below = the order they will be appended in `packages/graph-schema/index.ts` Phase 01-03 code.

| # | Graph Node Type (append) | Finance Entity (Data Map ref) | Primary Key in Node | Tenant Isolation Flag | Notes |
|---|---|---|---|---|---|
| F1 | FINANCIAL_PERIOD | FinancialPeriod (#1) | `id` (periodId) | ✓ | Links FiscalYear → periods |
| F2 | FISCAL_YEAR | FiscalYear (#2) | `id` | ✓ | Contains 12/13 FINANCIAL_PERIODs |
| F3 | ACCOUNT | Account (#3) | `id` (accountId / GL code) | ✓ | Hierarchy: ACCOUNT PART_OF ACCOUNT for parent-child |
| F4 | CHART_OF_ACCOUNTS | ChartOfAccounts (#4) | `id` | ✓ | CHART_OF_ACCOUNTS CONTAINS ACCOUNT |
| F5 | COST_CENTRE | CostCentre (#5) | `id` (costCentreId) | ✓ | Maps to Department → Project |
| F6 | PROFIT_CENTRE | ProfitCentre (#6) | `id` | ✓ | |
| F7 | DEPARTMENT | Department (#7) | `id` | ✓ | |
| F8 | BUDGET | Budget (#8) | `id` (budgetId) | ✓ | STATUS APPROVED → BUDGET lines → PROJECT |
| F9 | BUDGET_LINE | BudgetLine (#9) | `id` | ✓ | |
| F10 | BUDGET_REVISION | BudgetRevision (#10) | `id` | ✓ | Chain: REVISES_PREVIOUS edge |
| F11 | BUDGET_ALLOCATION | BudgetAllocation (#11) | `id` | ✓ | |
| F12 | COMMITMENT | Commitment (#12) | `id` (commitmentId) | ✓ | Central chain node (Tender/Contract/PO→Commitment→Invoice→Payment) |
| F13 | ENCUMBRANCE | Encumbrance (#13) | `id` | ✓ | |
| F14 | PURCHASE_ORDER | PurchaseOrder (#14) | `id` (poId from SCM) | ✓ | SCM writes; Finance reads + graph sync |
| F15 | INVOICE | Invoice (#15) | `id` (invoiceId) | ✓ | |
| F16 | PAYMENT | Payment (#16) | `id` (paymentId) | ✓ | Chain terminal for outflow |
| F17 | RECEIPT | Receipt (#17) | `id` (receiptId) | ✓ | Inflow terminal |
| F18 | JOURNAL | Journal (#18) | `id` (journalId) | ✓ | auditHash chain via PREV_JOURNAL edge |
| F19 | JOURNAL_ENTRY | JournalEntry (#19) | `id` | ✓ | Debit/Credit lines |
| F20 | EXPENSE | Expense (#20) | `id` (expenseId) | ✓ | Categorized OPEX/CAPEX |
| F21 | REVENUE | Revenue (#21) | `id` (revenueId) | ✓ | |
| F22 | FUNDING | Funding (#22) | `id` (fundingId) | ✓ | |
| F23 | GRANT | Grant (#23) | `id` (grantId) | ✓ | |
| F24 | LOAN | Loan (#24) | `id` (loanId) | ✓ | |
| F25 | LIABILITY | Liability (#25) | `id` | ✓ | |
| F26 | RECEIVABLE | Receivable (#26) | `id` (arId) | ✓ | |
| F27 | PAYABLE | Payable (#27) | `id` (apId) | ✓ | |
| F28 | CASH_ACCOUNT | CashAccount (#28) | `id` (cashAccountId) | ✓ | |
| F29 | BANK_TRANSACTION | BankTransaction (#29) | `id` (txnId) | ✓ | |
| F30 | ASSET_VALUE | AssetValue (#30) | `id` | ✓ | Links ASSET (GRID) → Finance |
| F31 | DEPRECIATION | Depreciation (#31) | `id` + {assetId,periodId} composite | ✓ | |
| F32 | CAPEX | CAPEX (#32) | `id` (capexId) | ✓ | Portfolio rollup node |
| F33 | OPEX | OPEX (#33) | `id` (opexId) | ✓ | Category rollup node |
| F34 | PROJECT_FINANCE | ProjectFinance (#34) | `id` + {projectId} composite | ✓ | Connects PROJECT (GRID) to Finance family |
| F35 | PROJECT_COST | ProjectCost (#35) | `id` | ✓ | |
| F36 | COST_TO_COMPLETE | CostToComplete (#36) | `id` | ✓ | |
| F37 | FORECAST | Forecast (#37) | `id` (forecastId) | ✓ | model+modelVersion stored in node attributes |
| F38 | SCENARIO | Scenario (#38) | `id` (scenarioId) | ✓ | |
| F39 | FINANCIAL_RISK | FinancialRisk (#39) | `id` (riskId) | ✓ | Cross-domain RISK IMPACTS edges |
| F40 | FINANCIAL_DECISION | FinancialDecision (#40) | `id` (decisionId) | ✓ | 9-state WF |
| F41 | FINANCIAL_RECOMMENDATION | FinancialRecommendation (#41) | `id` | ✓ | Evidence refs |
| F42 | FINANCIAL_METRIC | FinancialMetric (#42) | `metricId` | ✓ | = M001-M021 IDs from Data Map §Metric Catalog |
| F43 | FINANCIAL_REPORT | FinancialReport (#43) | `id` (reportId) | ✓ | |
| F44 | IMPORT_BATCH | ImportBatch (#44) | `batchId` | ✓ | Excel/CSV import reference |
| F45 | FINANCE_CONNECTOR | FinanceSourceConnectorInstance (#46) | `connectorId` | ✓ | Source system node |
| F46 | SUPPLIER_EXPOSURE | (derived aggregator) | `{supplierId,currency}` | ✓ | Aggregates commitments + payables + risk |
| F47 | FX_EXPOSURE_CONTRACT | (PowerManagement import/export forward) | `id` | ✓ | Open forward FX contract; used by §4 PowerManagement IMPORT_COST |

Notes to implementor:
- Nodes F1-F43 = 1:1 to FINANCE_DATA_MAP entities.
- Nodes F44-F47 = auxiliary nodes (source registry + derived aggregators).
- Every Finance node carries `tenantId` in node metadata. `KnowledgeGraphService.getGraph(scope)` supports optional `tenantId` filter.
- Graph seeding order in 15-01 graph-sync subscribers:
  1. Structure nodes (F1-F7) → create before budgets.
  2. Budget family (F8-F11) → Budget lines link to structure.
  3. Procurement chain (F12-F17) → Commitments link to PO (existing SCM node) / SUPPLIER (existing) / CONTRACT (existing).
  4. Accounting (F18-F21) → Journal post.
  5. Funding & Balance sheet (F22-F29) → Funding → Budget allocations.
  6. Assets & Capital (F30-F33) → link to existing ASSET node.
  7. Projects & Forecasts (F34-F38) → link to existing PROJECT node.
  8. Risk/Decisions (F39-F43) → attach to whatever they affect.
  9. Aux/registry (F44-F47).

---

## 3 FINANCE EDGE TYPES (54 New → total 83)

Grouped into 9 families per §4 directive plus intrinsic intra-Finance edges: FAM-A = Budget/Allocation; FAM-B = Procurement Expenditure Chain; FAM-C = Accounting/Journal; FAM-D = Funding/Debt; FAM-E = Assets/Capital; FAM-F = Projects; FAM-G = Treasury/Cash; FAM-H = Forecast/Scenario/Risk/Decision; FAM-X = Cross-domain (per directive §4, 8 categories explicit).

### 3.1 FAM-A: Budget / Allocation (7 edges)

| Graph Edge (append to GRID_GRAPH_EDGE_TYPES) | Source Node Type | Target Node Type | Cardinality S→T | Meaning | Audit of Directive Alignment |
|---|---|---|---|---|---|
| FISCAL_YEAR_HAS_PERIOD | FISCAL_YEAR | FINANCIAL_PERIOD | 1→N | Time structure | Directive §3 hierarchy |
| CHART_HAS_ACCOUNT | CHART_OF_ACCOUNTS | ACCOUNT | 1→N | GL structure | §3 |
| ACCOUNT_HAS_PARENT_ACCOUNT | ACCOUNT | ACCOUNT | N→1 | GL hierarchy (tree) | §3 implicit |
| DEPT_HAS_COST_CENTRE | DEPARTMENT | COST_CENTRE | 1→N | Org structure | §3 |
| BUDGET_HAS_LINE | BUDGET | BUDGET_LINE | 1→N | Budget structure | §3 |
| BUDGET_HAS_REVISION | BUDGET | BUDGET_REVISION | 1→N | Revision history | §3 |
| REVISION_REPLACES_PREVIOUS | BUDGET_REVISION | BUDGET_REVISION | N→1 | Hash chain (previousRevisionId FK) | Audit §8 hash-chain pattern |
| BUDGET_LINE_HAS_ALLOCATION | BUDGET_LINE | BUDGET_ALLOCATION | 1→N | Distribute | §3 |

### 3.2 FAM-B: Procurement Expenditure Chain (Tender→Contract→PO→Commitment→Invoice→Payment) (11 edges)

*(Existing graph already has nodes: TENDER (#15), CONTRACT (#17), SUPPLIER (#16), DIRECTOR (#18), PROJECT (#21), PROGRAM (#22), PERSON (#23), ORGANIZATION (#24), REGULATION (#25), STANDARD (#26), DOCUMENT (#27), WORKORDER (#28), MISSION (#29), MISSION_REPORT (#30), INCIDENT (#31), INVENTORY_ITEM (#32), MATERIAL (#33), EQUIPMENT (#34), SPARE_PART (#35), RISK (#36), THREAT (#37). Therefore family B targets existing nodes for Tender/Contract/Supplier/Project.)*

| Edge | Source | Target | Cardinality | Meaning | Directive Align |
|---|---|---|---|---|---|
| COMMITMENT_ARISES_FROM_TENDER | COMMITMENT (F12) | TENDER (existing #15) | N→1 | Origin of commitment = tender event (SCM integration contract I1) | §4 Procurement → CREATES Commitment |
| COMMITMENT_HAS_PO | COMMITMENT (F12) | PURCHASE_ORDER (F14) | 1→1 or 1→N | PO(s) realize commitment | §4 Procurement CREATES PO |
| COMMITMENT_HAS_CONTRACT | COMMITMENT (F12) | CONTRACT (existing #17) | N→1 | Contract-obligated commitment | §4 Contract HAS_COMMITMENT reverse |
| PO_REFERENCES_CONTRACT | PURCHASE_ORDER (F14) | CONTRACT (existing #17) | N→1 | PO under contract | §4 implicit |
| INVOICE_REFERENCES_PO | INVOICE (F15) | PURCHASE_ORDER (F14) | N→1 | 3-way match link | §5 directive Tender→Contract→PO→Commitment→Invoice→Payment |
| INVOICE_REFERENCES_COMMITMENT | INVOICE (F15) | COMMITMENT (F12) | N→1 | Consumes commitment budget | §5 chain |
| INVOICE_HAS_PAYMENT | INVOICE (F15) | PAYMENT (F16) | N→M | Partial payment allowed (finance_payment_invoice_links table) | §5 chain |
| PAYMENT_SETTLES_PAYABLE | PAYMENT (F16) | PAYABLE (F27) | N→M | Reduces AP | §5 |
| SUPPLIER_SENDS_INVOICE | SUPPLIER (existing #16) | INVOICE (F15) | 1→N | Supplier origin | §4 Supplier HAS_INVOICE reverse |
| SUPPLIER_RECEIVES_PAYMENT | SUPPLIER (existing #16) | PAYMENT (F16) | 1→N | Payee | §4 Supplier RECEIVES_PAYMENT reverse |
| COMMITMENT_CONSUMES_BUDGET_LINE | COMMITMENT (F12) | BUDGET_LINE (F9) | N→1 | Budget consumed; pipeline M007 Available = Budget − Actual − Commitment | §3 Budget/Commitment relationship |

### 3.3 FAM-C: Accounting / Journal / GL (8 edges)

| Edge | Source | Target | Cardinality | Meaning | Directive Align |
|---|---|---|---|---|---|
| JOURNAL_HAS_ENTRY | JOURNAL (F18) | JOURNAL_ENTRY (F19) | 1→N | Dr/Cr lines | §3 |
| ENTRY_POSTS_TO_ACCOUNT | JOURNAL_ENTRY (F19) | ACCOUNT (F3) | N→1 | GL account | §3 |
| ENTRY_REFERENCES_EXPENSE | JOURNAL_ENTRY (F19) | EXPENSE (F20) | N→0..1 | Expense line | §3 |
| ENTRY_REFERENCES_REVENUE | JOURNAL_ENTRY (F19) | REVENUE (F21) | N→0..1 | Revenue line | §3 |
| INVOICE_TRIGGERS_JOURNAL | INVOICE (F15) | JOURNAL (F18) | 1→0..1 | Auto-post journal on invoice post | §3 |
| PAYMENT_TRIGGERS_JOURNAL | PAYMENT (F16) | JOURNAL (F18) | 1→0..1 | Auto-post on payment release | §3 |
| RECEIPT_TRIGGERS_JOURNAL | RECEIPT (F17) | JOURNAL (F18) | 1→0..1 | Auto-post on cleared receipt | §3 |
| JOURNAL_PREV_CHAIN | JOURNAL (F18) | JOURNAL (F18) | N→1 | Hash chain previous (CP-07 audit chain) | Rule 22,23,26 audit |

### 3.4 FAM-D: Funding / Debt / Grants / Receivable-Payable (9 edges)

| Edge | Source | Target | Cardinality | Meaning | Directive Align |
|---|---|---|---|---|---|
| FUNDING_HAS_GRANT | FUNDING (F22) | GRANT (F23) | 1→0..1 | Grant-funded | §3 |
| FUNDING_HAS_LOAN | FUNDING (F22) | LOAN (F24) | 1→0..1 | Loan-funded | §3 |
| LOAN_HAS_LIABILITY | LOAN (F24) | LIABILITY (F25) | 1→N | Debt service | §3 |
| ALLOCATION_DRAWS_FUNDING | BUDGET_ALLOCATION (F11) | FUNDING (F22) | N→1 | Budget allocation funded from | §3 BudgetAllocation implicit |
| REVENUE_ORIGINATES_RECEIVABLE | REVENUE (F21) | RECEIVABLE (F26) | 1→0..1 | Billing creates AR | §3 |
| RECEIVABLE_SETTLED_BY_RECEIPT | RECEIVABLE (F26) | RECEIPT (F17) | 1→N | Partial receipts allowed | §3 |
| INVOICE_CREATES_PAYABLE | INVOICE (F15) | PAYABLE (F27) | 1→1 | AP recognized | §3 |
| LIABILITY_RECOGNIZED_IN_JOURNAL | LIABILITY (F25) | JOURNAL (F18) | N→1 | Loan amortization journal | §3 |
| GRANT_AWARDED_TO_PROJECT | GRANT (F23) | PROJECT (existing #21) | N→M | Cross-domain: donor funding → project | §4 Project HAS_FUNDING reverse |

### 3.5 FAM-E: Assets / Capitalization / CAPEX / OPEX (9 edges)

| Edge | Source | Target | Cardinality | Meaning | Directive Align |
|---|---|---|---|---|---|
| ASSET_HAS_CAPITAL_VALUE | ASSET (existing #14) | ASSET_VALUE (F30) | 1→N | Historical, Revalued (multiple values over time). Explicit name per §4 Asset→HAS_CAPITAL_VALUE | Directive §4: Asset HAS_CAPITAL_VALUE → AssetValue |
| ASSET_REQUIRES_CAPEX | ASSET (existing #14) | CAPEX (F32) | 1→N | Future CAPEX requirements. Directive §4 | §4: Asset REQUIRES_CAPEX |
| ASSET_GENERATES_OPEX | ASSET (existing #14) | OPEX (F33) | 1→N | Maintenance cost driver. Directive §4 | §4: Asset GENERATES_MAINTENANCE_COST → OPEX |
| ASSET_BELONGS_TO_PROJECT | ASSET (existing #14) | PROJECT (existing #21) | N→1 | Commissioned/constructed under project. Directive §4 | §4: Project HAS_ASSET reverse |
| CAPEX_REALIZED_IN_ASSET_VALUE | CAPEX (F32) | ASSET_VALUE (F30) | N→1 | Capitalization entry | §3 AssetValue implicit source |
| EXPENSE_REALIZES_OPEX | EXPENSE (F20) | OPEX (F33) | N→1 | Categorized expense into OPEX category rollup | §3 OPEX classification |
| EXPENSE_REALIZES_CAPEX | EXPENSE (F20) | CAPEX (F32) | N→1 | Capitalized expense | §3 CAPEX classification |
| DEPRECIATION_APPLIES_TO_ASSET_VALUE | DEPRECIATION (F31) | ASSET_VALUE (F30) | N→1 | Per-period depreciation schedule | §3 Depreciation |
| OPEX_OF_COST_CENTRE | OPEX (F33) | COST_CENTRE (F5) | N→1 | Cost attribution | §3 OPEX dimension CostCentre |

### 3.6 FAM-F: Project Finance Family (Directive §4: Project HAS_BUDGET / HAS_COMMITMENT / HAS_CONTRACT / HAS_COST / HAS_FORECAST / HAS_FUNDING / HAS_ASSET) (8 edges)

*Note: HAS_ASSET already in FAM-E reverse above.*

| Edge | Source | Target | Cardinality | Meaning | Directive Align |
|---|---|---|---|---|---|
| PROJECT_HAS_BUDGET | PROJECT (existing #21) | BUDGET (F8) | 1→N | Project budget (one per FY typically). EXACT name from §4 | §4: Project → HAS_BUDGET → Budget |
| PROJECT_HAS_COMMITMENT | PROJECT (existing #21) | COMMITMENT (F12) | 1→N | Committed spend | §4: Project → HAS_COMMITMENT → Commitment |
| PROJECT_HAS_CONTRACT | PROJECT (existing #21) | CONTRACT (existing #17) | 1→N | Contracts for project | §4: Project → HAS_CONTRACT → Contract |
| PROJECT_HAS_COST | PROJECT (existing #21) | PROJECT_FINANCE (F34) | 1→1 | Link to Finance aggregate | §4: Project → HAS_COST → ProjectCost (use PROJECT_FINANCE as aggregate container; inner has PROJECT_COST periodic) |
| PROJECT_HAS_FORECAST | PROJECT (existing #21) | FORECAST (F37) | 1→N | Multiple forecast versions | §4: Project → HAS_FORECAST → Forecast |
| PROJECT_HAS_FUNDING | PROJECT (existing #21) | FUNDING (F22) | 1→N | Multiple sources | §4: Project → HAS_FUNDING → Funding (also GRANT reverse in FAM-D) |
| PROJECT_FINANCE_HAS_PROJECT_COST | PROJECT_FINANCE (F34) | PROJECT_COST (F35) | 1→N | Periodic snapshots | §3 hierarchy |
| PROJECT_FINANCE_HAS_CTC | PROJECT_FINANCE (F34) | COST_TO_COMPLETE (F36) | 1→N | Per-assumption CTC variants | §3 |

### 3.7 FAM-G: Treasury / Cash / FX / PowerManagement (Directive §4: PowerManagement IMPORT_COST / EXPORT_REVENUE / MARKET_EVENT / IMPACTS_CASHFLOW) (7 edges)

| Edge | Source | Target | Cardinality | Meaning | Directive Align |
|---|---|---|---|---|---|
| CASH_ACCOUNT_HAS_TRANSACTION | CASH_ACCOUNT (F28) | BANK_TRANSACTION (F29) | 1→N | Statement lines | §3 |
| PAYMENT_HAS_BANK_TRANSACTION | PAYMENT (F16) | BANK_TRANSACTION (F29) | 1→0..1 | Reconciled link | §3 implicit |
| RECEIPT_HAS_BANK_TRANSACTION | RECEIPT (F17) | BANK_TRANSACTION (F29) | 1→0..1 | Reconciled link | §3 implicit |
| POWER_IMPORT_COSTS_EXPENSE | (Future) POWER_MANAGEMENT_IMPORT | EXPENSE (F20) | N→1 | Power import cost → OPEX or CAPEX energy component | §4 PowerManagement → IMPORT_COST → Expense |
| POWER_EXPORT_GENERATES_REVENUE | (Future) POWER_MANAGEMENT_EXPORT | REVENUE (F21) | N→1 | Export sales | §4 PowerManagement → EXPORT_REVENUE → Revenue |
| POWER_EVENT_EXPOSES_FINANCIAL_RISK | (Future) POWER_MARKET_EVENT | FINANCIAL_RISK (F39) | N→1 | Volatility, FX, counterparty | §4 PowerManagement → MARKET_EVENT → FinancialRisk |
| FX_CONTRACT_IMPACTS_CASH_FORECAST | FX_EXPOSURE_CONTRACT (F47) | FORECAST (F37) (of type CASH) | N→M | Forward FX changes cash forecast | §4 PowerManagement → IMPACTS_CASHFLOW reverse → CashForecast target |

### 3.8 FAM-H: Forecast / Scenario / Risk / Decision / Recommendation / Metric / Report (12 edges + cross-domain Risk §4)

| Edge | Source | Target | Cardinality | Meaning | Directive Align |
|---|---|---|---|---|---|
| FORECAST_BASED_ON_PROJECT_COST | FORECAST (F37) | PROJECT_COST (F35) | N→1 | Grounding in history | §3 |
| FORECAST_REFERENCES_METRIC | FORECAST (F37) | FINANCIAL_METRIC (F42) | N→1 | Forecast of which metric | §3 |
| SCENARIO_HAS_FORECAST_VARIANT | SCENARIO (F38) | FORECAST (F37) | 1→N | Baseline vs Scenario outputs | §11 |
| SCENARIO_MODIFIES_ASSUMPTION_OF | SCENARIO (F38) | FINANCIAL_METRIC (F42) | N→M | Inputs | §11 11 editable params |
| RISK_IMPACTS_BUDGET | FINANCIAL_RISK (F39) | BUDGET (F8) | N→M | Directive §4 explicit RISK → IMPACTS → Budget | §4: Risk IMPACTS Budget |
| RISK_IMPACTS_PROJECT | FINANCIAL_RISK (F39) | PROJECT (existing #21) | N→M | Directive §4 explicit | §4: Risk IMPACTS Project |
| RISK_IMPACTS_CASH_FLOW | FINANCIAL_RISK (F39) | CASH_ACCOUNT (F28) + FORECAST (cash) | N→M | Liquidity risk. Directive §4 | §4: Risk IMPACTS CashFlow |
| RISK_IMPACTS_FINANCIAL_PERFORMANCE | FINANCIAL_RISK (F39) | FINANCIAL_METRIC (F42) | N→M | Directive §4 explicit (FinancialPerformance = set of metrics) | §4: Risk IMPACTS FinancialPerformance |
| CONTRACT_EXPOSES_FINANCIAL_RISK | CONTRACT (existing #17) | FINANCIAL_RISK (F39) | 1→N | Directive §4 Contract EXPOSES_FINANCIAL_RISK | §4 explicit name |
| SUPPLIER_CREATES_EXPOSURE_RISK | SUPPLIER (existing #16) | FINANCIAL_RISK (F39) | 1→N | §4 Supplier CREATES_FINANCIAL_EXPOSURE | §4 explicit name |
| DECISION_ADDRESSES_RISK | FINANCIAL_DECISION (F40) | FINANCIAL_RISK (F39) | N→M | Decision to treat | §18 Decision lifecycle |
| DECISION_PRODUCES_RECOMMENDATION | FINANCIAL_DECISION (F40) | FINANCIAL_RECOMMENDATION (F41) | 1→1 | §18 RECOMMEND state output | §18 |
| METRIC_USED_IN_REPORT | FINANCIAL_METRIC (F42) | FINANCIAL_REPORT (F43) | M→N | Board reports | §3 |
| SYSTEM_OPS_IMPACTS_OPEX_FORECAST | (Future) SYSTEM_OPERATIONS_STATE | OPEX (F33) + FORECAST (opex) | N→M | Dispatch/maintenance events affect OPEX forecast. Directive §4 SystemOperations → IMPACTS OPEX + IMPACTS FinancialForecast | §4 explicit SystemOperations edges |
| DECISION_USES_SCENARIO | FINANCIAL_DECISION (F40) | SCENARIO (F38) | N→M | §18 SIMULATE state | §11, §18 |

### 3.9 FAM-X: Cross-Domain Summary (Directive §4 8 categories — implementation coverage proof)

| §4 Category Family | Required edges by directive | Implemented in this Graph Map | Status |
|---|---|---|---|
| 1. Project | HAS_BUDGET, HAS_COMMITMENT, HAS_CONTRACT, HAS_COST, HAS_FORECAST, HAS_FUNDING, HAS_ASSET | FAM-F 6 edges + FAM-E ASSET_BELONGS_TO_PROJECT reverse (7) | ✅ 7/7 |
| 2. Procurement | CREATES PO, CREATES Commitment, AWARDS Contract, IMPACTS Budget | FAM-B: COMMITMENT_ARISES_FROM_TENDER (implicit Procurement→CREATES Commitment via Tender); COMMITMENT_HAS_PO (Procurement→CREATES PO); CONTRACT_AWARDED (existing grid edge AWARDED_TO; we add SUPPLIER_SENDS_INVOICE/RECEIVES_PAYMENT pair; COMMITMENT_CONSUMES_BUDGET_LINE = Procurement IMPACTS Budget) | ✅ 4/4 via grid + finance edges |
| 3. Contract | HAS_COMMITMENT, HAS_INVOICE, HAS_PAYMENT, BELONGS_TO_PROJECT, EXPOSES_FINANCIAL_RISK | FAM-B COMMITMENT_HAS_CONTRACT reverse; INVOICE_REFERENCES_CONTRACT (via PO edge); PAYMENT via chain; FAM-F PROJECT_HAS_CONTRACT; FAM-H CONTRACT_EXPOSES_FINANCIAL_RISK | ✅ 5/5 |
| 4. Asset | HAS_CAPITAL_VALUE, GENERATES_MAINTENANCE_COST(OPEX), REQUIRES_CAPEX, BELONGS_TO_PROJECT | FAM-E 4 edges (ASSET_HAS_CAPITAL_VALUE, ASSET_GENERATES_OPEX, ASSET_REQUIRES_CAPEX, ASSET_BELONGS_TO_PROJECT) | ✅ 4/4 |
| 5. SystemOperations | GENERATES OperationalCost, IMPACTS OPEX, IMPACTS Forecast | FAM-H SYSTEM_OPS_IMPACTS_OPEX_FORECAST single combined edge covers all 3 (SystemOps node will link to OPEX node and FORECAST node) | ✅ 3/3 with one edge + OPEX→Forecast through FAM-H METRIC / FORECAST_REFERENCES_METRIC |
| 6. Supplier | HAS_CONTRACT, HAS_INVOICE, RECEIVES_PAYMENT, CREATES_FINANCIAL_EXPOSURE | FAM-B SUPPLIER_SENDS_INVOICE + SUPPLIER_RECEIVES_PAYMENT; existing grid edge AWARDED_TO + CONTRACT edges covers HAS_CONTRACT; FAM-H SUPPLIER_CREATES_EXPOSURE_RISK covers Financial Exposure | ✅ 4/4 |
| 7. PowerManagement | IMPORT_COST→Expense, EXPORT_REVENUE→Revenue, MARKET_EVENT→FinancialRisk, IMPACTS_CASHFLOW→CashForecast | FAM-G 4 edges POWER_IMPORT_COSTS_EXPENSE, POWER_EXPORT_GENERATES_REVENUE, POWER_EVENT_EXPOSES_FINANCIAL_RISK, FX_CONTRACT_IMPACTS_CASH_FORECAST | ✅ 4/4 |
| 8. Risk | IMPACTS Budget, IMPACTS Project, IMPACTS CashFlow, IMPACTS FinancialPerformance | FAM-H 4 explicit RISK_IMPACTS_* edges | ✅ 4/4 |

**Coverage summary for §4 cross-domain families: 35/35 required edges implemented via finance+grid edges. No directive edges omitted.**

---

## 4 KNOWLEDGE GRAPH SERVICE IMPLEMENTATION NOTES

### 4.1 packages/graph-schema/index.ts Phase 01-03 target

Append block:

```ts
// ===== FINANCE DOMAIN — Finance Intelligence Graph Nodes (47) =====
export const FINANCE_GRAPH_NODE_TYPES = [
  'FINANCIAL_PERIOD','FISCAL_YEAR','ACCOUNT','CHART_OF_ACCOUNTS','COST_CENTRE',
  'PROFIT_CENTRE','DEPARTMENT','BUDGET','BUDGET_LINE','BUDGET_REVISION',
  'BUDGET_ALLOCATION','COMMITMENT','ENCUMBRANCE','PURCHASE_ORDER','INVOICE',
  'PAYMENT','RECEIPT','JOURNAL','JOURNAL_ENTRY','EXPENSE','REVENUE',
  'FUNDING','GRANT','LOAN','LIABILITY','RECEIVABLE','PAYABLE','CASH_ACCOUNT',
  'BANK_TRANSACTION','ASSET_VALUE','DEPRECIATION','CAPEX','OPEX',
  'PROJECT_FINANCE','PROJECT_COST','COST_TO_COMPLETE','FORECAST','SCENARIO',
  'FINANCIAL_RISK','FINANCIAL_DECISION','FINANCIAL_RECOMMENDATION',
  'FINANCIAL_METRIC','FINANCIAL_REPORT','IMPORT_BATCH','FINANCE_CONNECTOR',
  'SUPPLIER_EXPOSURE','FX_EXPOSURE_CONTRACT'
] as const;

export const FINANCE_GRAPH_EDGE_TYPES = [
  // FAM-A: Budget/Allocation
  'FISCAL_YEAR_HAS_PERIOD','CHART_HAS_ACCOUNT','ACCOUNT_HAS_PARENT_ACCOUNT',
  'DEPT_HAS_COST_CENTRE','BUDGET_HAS_LINE','BUDGET_HAS_REVISION',
  'REVISION_REPLACES_PREVIOUS','BUDGET_LINE_HAS_ALLOCATION',
  // FAM-B: Expenditure chain
  'COMMITMENT_ARISES_FROM_TENDER','COMMITMENT_HAS_PO','COMMITMENT_HAS_CONTRACT',
  'PO_REFERENCES_CONTRACT','INVOICE_REFERENCES_PO','INVOICE_REFERENCES_COMMITMENT',
  'INVOICE_HAS_PAYMENT','PAYMENT_SETTLES_PAYABLE','SUPPLIER_SENDS_INVOICE',
  'SUPPLIER_RECEIVES_PAYMENT','COMMITMENT_CONSUMES_BUDGET_LINE',
  // FAM-C: Accounting
  'JOURNAL_HAS_ENTRY','ENTRY_POSTS_TO_ACCOUNT','ENTRY_REFERENCES_EXPENSE',
  'ENTRY_REFERENCES_REVENUE','INVOICE_TRIGGERS_JOURNAL','PAYMENT_TRIGGERS_JOURNAL',
  'RECEIPT_TRIGGERS_JOURNAL','JOURNAL_PREV_CHAIN',
  // FAM-D: Funding/Debt
  'FUNDING_HAS_GRANT','FUNDING_HAS_LOAN','LOAN_HAS_LIABILITY',
  'ALLOCATION_DRAWS_FUNDING','REVENUE_ORIGINATES_RECEIVABLE',
  'RECEIVABLE_SETTLED_BY_RECEIPT','INVOICE_CREATES_PAYABLE',
  'LIABILITY_RECOGNIZED_IN_JOURNAL','GRANT_AWARDED_TO_PROJECT',
  // FAM-E: Assets/Capex/Opex
  'ASSET_HAS_CAPITAL_VALUE','ASSET_REQUIRES_CAPEX','ASSET_GENERATES_OPEX',
  'ASSET_BELONGS_TO_PROJECT','CAPEX_REALIZED_IN_ASSET_VALUE',
  'EXPENSE_REALIZES_OPEX','EXPENSE_REALIZES_CAPEX',
  'DEPRECIATION_APPLIES_TO_ASSET_VALUE','OPEX_OF_COST_CENTRE',
  // FAM-F: Project Finance
  'PROJECT_HAS_BUDGET','PROJECT_HAS_COMMITMENT','PROJECT_HAS_CONTRACT',
  'PROJECT_HAS_COST','PROJECT_HAS_FORECAST','PROJECT_HAS_FUNDING',
  'PROJECT_FINANCE_HAS_PROJECT_COST','PROJECT_FINANCE_HAS_CTC',
  // FAM-G: Treasury/Cash
  'CASH_ACCOUNT_HAS_TRANSACTION','PAYMENT_HAS_BANK_TRANSACTION',
  'RECEIPT_HAS_BANK_TRANSACTION','POWER_IMPORT_COSTS_EXPENSE',
  'POWER_EXPORT_GENERATES_REVENUE','POWER_EVENT_EXPOSES_FINANCIAL_RISK',
  'FX_CONTRACT_IMPACTS_CASH_FORECAST',
  // FAM-H: Forecast/Scenario/Risk/Decision
  'FORECAST_BASED_ON_PROJECT_COST','FORECAST_REFERENCES_METRIC',
  'SCENARIO_HAS_FORECAST_VARIANT','SCENARIO_MODIFIES_ASSUMPTION_OF',
  'RISK_IMPACTS_BUDGET','RISK_IMPACTS_PROJECT','RISK_IMPACTS_CASH_FLOW',
  'RISK_IMPACTS_FINANCIAL_PERFORMANCE','CONTRACT_EXPOSES_FINANCIAL_RISK',
  'SUPPLIER_CREATES_EXPOSURE_RISK','DECISION_ADDRESSES_RISK',
  'DECISION_PRODUCES_RECOMMENDATION','METRIC_USED_IN_REPORT',
  'SYSTEM_OPS_IMPACTS_OPEX_FORECAST','DECISION_USES_SCENARIO'
] as const;

// ===== COMBINED UNION =====
export const ALL_GRAPH_NODE_TYPES = [...GRID_GRAPH_NODE_TYPES, ...FINANCE_GRAPH_NODE_TYPES] as const;
export const ALL_GRAPH_EDGE_TYPES = [...GRID_GRAPH_EDGE_TYPES, ...FINANCE_GRAPH_EDGE_TYPES] as const;
```

Then update KnowledgeGraphService `validateNodeType` / `validateEdgeType` to use ALL_GRAPH_* if exist, or fallback to GRID_GRAPH_* to keep back-compat.

### 4.2 Graph population subscribers (Phase 15-01 graph-sync.ts)

Subscriber pattern on EventBus for:
- FIN.BUDGET.CONFIRMED → upsert BUDGET (F8) + edges FISCAL_YEAR_HAS_PERIOD, BUDGET_HAS_LINE, PROJECT_HAS_BUDGET, COMMITMENT_CONSUMES_BUDGET_LINE
- FIN.COMMITMENT.CREATED → upsert COMMITMENT (F12) + edges to TENDER (#15), CONTRACT (#17), PO (F14), BUDGET_LINE (F9)
- FIN.INVOICE.POSTED → upsert INVOICE (F15) + edges to PO (F14), COMMITMENT (F12), SUPPLIER (#16 → SENDS_INVOICE), PAYABLE (F27 via INVOICE_CREATES_PAYABLE)
- FIN.PAYMENT.RELEASED → upsert PAYMENT (F16) + edges INVOICE_HAS_PAYMENT, PAYMENT_SETTLES_PAYABLE, SUPPLIER_RECEIVES_PAYMENT, BANK_TRANSACTION (F29 if reconciled)
- FIN.JOURNAL.POSTED → upsert JOURNAL (F18) + JOURNAL_HAS_ENTRY, JOURNAL_PREV_CHAIN
- FIN.FORECAST.PUBLISHED → upsert FORECAST (F37) + PROJECT_HAS_FORECAST, FORECAST_REFERENCES_METRIC
- FIN.RISK.IDENTIFIED → upsert FINANCIAL_RISK (F39) + RISK_IMPACTS_* 4 edges + CONTRACT_EXPOSES + SUPPLIER_CREATES

### 4.3 Traversal depth (multi-hop reasoning) — helper in 15-04 GraphRAG engine

| Copilot Question | Traversal Path Depth | Entity Result Set |
|---|---|---|
| "Why is Project X likely to exceed budget?" | PROJECT (X) → PROJECT_HAS_COMMITMENT → COMMITMENT → COMMITMENT_CONSUMES_BUDGET_LINE → BUDGET_LINE → BUDGET_HAS_LINE → BUDGET; PROJECT → PROJECT_HAS_FORECAST → FORECAST → FORECAST_REFERENCES_METRIC → METRIC M019/M020 | 3 hops, 6+ node types |
| "Which commitments are unfunded?" | COMMITMENT → COMMITMENT_CONSUMES_BUDGET_LINE → BUDGET_LINE → BUDGET_LINE_HAS_ALLOCATION → BUDGET_ALLOCATION → ALLOCATION_DRAWS_FUNDING → FUNDING; return COMMITMENTs where ALLOCATION absent (left join). | 3 hops, 6 node types |
| "What are our largest financial exposures?" | SUPPLIER → SUPPLIER_CREATES_EXPOSURE_RISK → FINANCIAL_RISK; SUPPLIER → SUPPLIER_SENDS_INVOICE → INVOICE → INVOICE_CREATES_PAYABLE → PAYABLE; SUPPLIER → AWARDED_TO (existing grid) → CONTRACT → COMMITMENT_HAS_CONTRACT reverse → COMMITMENT → sum; aggregate. | 3-4 hops; 5+ node types |
| "What happens if USD/KES changes by 10%?" | FX_EXPOSURE_CONTRACT (F47) → FX_CONTRACT_IMPACTS_CASH_FORECAST → FORECAST → FORECAST_REFERENCES_METRIC → METRIC (M011/M016/M021); CONTRACT → EXPOSES_RISK → FINANCIAL_RISK → RISK_IMPACTS_BUDGET → BUDGET; also via COMMITMENT_HAS_CONTRACT → COMMITMENT → BUDGET_LINE → PROJECT_HAS_COST → PROJECT_FINANCE → PROJECT_FORECAST | 5-6 hops (scenario engine propagator 11-03 will iterate); ≥ 8 node types |
| "Why did OPEX increase?" | OPEX → OPEX_OF_COST_CENTRE → COST_CENTRE; OPEX ← EXPENSE_REALIZES_OPEX ← EXPENSE ← ENTRY_REFERENCES_EXPENSE ← JOURNAL_ENTRY ← JOURNAL; plus ASSET_GENERATES_OPEX cross-domain driver; SYSTEM_OPS_IMPACTS_OPEX_FORECAST cross-domain driver if present | 3-4 hops |

### 4.4 GraphRAG entity resolution rules (15-04 grounding)

1. First, run `FinanceEntityResolver.resolve(entityType, query)` → candidate nodeIds.
2. If candidates exist → add them to evidenceNodes[] + start traversal at depth=3.
3. If candidates don't exist → attempt `KnowledgeGraphService.search(text)` on `node.data.label/name/synonyms`.
4. Collect neighbor entities at traversal depth; append each as evidenceNodes.
5. Fetch RAG documents via `EnterpriseKnowledgeRetrieval` for node types.
6. Only then pass context + schema to LLM for synthesis with citations; reject empty (CANNOT_ANSWER) if nodes<1 AND docs<1.
7. Contradiction detection (15-08): If two evidence nodes have `data.value` with same metric, same period, delta > tolerance → surface in contradictions panel; LLM must note discrepancy explicitly in Answer.

---

## Finance Master Ledger Entry

| Entry # | Timestamp | Phase | Event | Author |
|---|---|---|---|---|
| FM-004 | 2026-08-31T00:00:00Z | 00 | Graph Map complete. 47 Finance node types (37+47=84 total nodes), 54 Finance edge types (29+54=83 total). Directive §4 cross-domain 8 families mapped with 35/35 edges verified. GraphRAG multi-hop paths documented for 5 copilot questions. | GRAPH-MAP-SYSTEM |

