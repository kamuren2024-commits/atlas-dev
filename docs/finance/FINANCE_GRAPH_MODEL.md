# KETRACO FINANCE INTELLIGENCE — FINANCE GRAPH MODEL (Phase 01)

**Program:** Salience Atlas / KETRACO Enterprise Intelligence OS
**Module:** Finance Intelligence (FIN-INTEL) — Phase 01 Finance Data Fabric
**Owner:** Office of the CFO — Finance Engineering
**Status:** COMPLETE (evidence-verified)

Graph vocabulary facts recorded in this document are real and code-verified:

- Node types: `packages/graph-schema/index.ts` L8-L19 (46 finance node types).
- Edge types: `packages/graph-schema/index.ts` L43-L73 (29 finance edge types).
- Runtime graph API: `backend/evaluation/knowledge-graph.ts` —
  `getGraph(): KnowledgeGraph` where `KnowledgeGraph = { nodes, edges }`.
- Graph sync: `backend/finance/graph-sync.ts` — writes superset
  `GraphEdge`/`GraphNode` shapes so graph integrity + integrity checks coexist.
- DB↔graph lineage: `backend/finance/entity-resolution.ts`.

## 1. SOURCE OF TRUTH

> "Transactional database is canonical. Graph is derived and reconciled via
> immutable events." — `GRID_GRAPH_SCHEMA.sourceOfTruth`

## 2. NODE VOCABULARY (46 finance node types)

Source lineage: `FINANCE_SOURCE → FINANCE_BATCH → FINANCE_RECORD`.

Financial periods & chart: `FINANCIAL_PERIOD, CHART_OF_ACCOUNTS, ACCOUNT,
COST_CENTRE, PROFIT_CENTRE, DEPARTMENT`.

Budget & commit cycle: `BUDGET, BUDGET_LINE, BUDGET_REVISION, BUDGET_ALLOCATION,
COMMITMENT, ENCUMBRANCE`.

Payables / receivables: `INVOICE, PAYMENT, RECEIPT`.

Accounting: `JOURNAL, JOURNAL_ENTRY, EXPENSE, REVENUE`.

Funding & treasury: `FUNDING, GRANT, LOAN, LIABILITY, RECEIVABLE, PAYABLE,
CASH_ACCOUNT, BANK_TRANSACTION`.

Asset economics: `ASSET_VALUE, DEPRECIATION, CAPEX, OPEX`.

Projects & lifecycle: `PROJECT_FINANCE, PROJECT_COST, COST_TO_COMPLETE`.

Intelligence: `FINANCIAL_RISK, FINANCIAL_METRIC, FINANCIAL_FORECAST,
FINANCIAL_DECISION, FINANCIAL_REPORT`.

Phase 01 plumbing: `FINANCE_DATA_QUALITY, FINANCE_DATA_PROFILE, FINANCE_LINEAGE,
FINANCE_MAPPING`.

## 3. EDGE VOCABULARY (29 finance edge types)

Enterprise ontology:
`BUDGET_ALLOCATED_TO_PROJECT, BUDGET_LINE_BELONGS_TO_BUDGET,
BUDGET_REVISION_AMENDS_BUDGET, COMMITMENT_RELATES_TO_CONTRACT,
COMMITMENT_AGAINST_BUDGET, INVOICE_RELATES_TO_COMMITMENT, INVOICE_FOR_SUPPLIER,
PAYMENT_SETTLES_INVOICE, PAYMENT_FROM_CASH_ACCOUNT, PROJECT_COST_BELONGS_TO_PROJECT,
CAPEX_CAPITALIZES_ASSET, OPEX_RELATES_TO_DEPARTMENT, OPEX_RELATES_TO_ASSET,
OPEX_RELATES_TO_PROJECT, PROJECT_FINANCE_FUNDS_PROJECT,
FINANCIAL_RISK_AFFECTS_PROJECT, FINANCIAL_RISK_AFFECTS_BUDGET`.

Source / lineage:
`BATCH_FROM_SOURCE, RECORD_FROM_BATCH, LINEAGE_DERIVED_FROM,
MAPPING_BETWEEN_ENTITIES, QUALITY_SCORES_ENTITY`.

Cross-domain:
`FINANCE_RECORD_RELATES_TO_PROJECT, FINANCE_RECORD_RELATES_TO_SUPPLIER,
FINANCE_RECORD_RELATES_TO_ASSET, FINANCE_RECORD_RELATES_TO_CONTRACT,
FINANCE_RECORD_RELATES_TO_DEPARTMENT, FINANCE_REPORT_COVERS_PERIOD,
FORECAST_FOR_PERIOD`.

## 4. RUNTIME SHAPE

Routes call `kg.getGraph()` and receive `{ nodes, edges }` (no nesting).
Graph edges written by sync use superset shape:
`{ id, source, target, type, relationship, weight, attributes, properties }`
with idempotency keys tolerant of both `from/to` and `source/target` variants.
Node writes include `category`, `attributes`, `properties`.

## 5. INTEGRITY RULES (GRID_GRAPH_SCHEMA.rules)

- Every asset carries a unique identifier and spatial metadata.
- Every defect links to both asset and inspection evidence.
- Every workflow/risk object is traceable to an approval or baseline.
- Graph writes are replayable and synchronized through event-driven reconciliation.