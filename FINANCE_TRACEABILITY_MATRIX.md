# KETRACO FINANCE INTELLIGENCE — PHASE 01 TRACEABILITY MATRIX
**Authoritative Blueprint: Salience Atlas 5.1.0 — Financial Decision & Execution Domain**
**Governance Standard: PPADA 2015 / PFM Act 2012 / IFRS / GAAP Compliance**

---

## 1. Executive Mission & Structural Architecture

The Finance Intelligence module transforms the visual rendering contract into a **production-grade KETRACO Financial Decision & Execution Domain** integrated into the existing Salience Atlas cognitive fabric. 

### Architecture Pipeline (Zero-Fabrication Contract)
```
[Database / Data Fabric] 
       │
       ▼
[Finance State & Domain Services] 
       │
       ▼
[Knowledge Graph & Ontology Sync] 
       │
       ▼
[Decision Engine & Policy Rules (PFM/PPADA)] 
       │
       ▼
[AI Federation & Agent OS] 
       │
       ▼
[/api/finance REST Endpoints & Event Layer] 
       │
       ▼
[Finance Intelligence Command Surface (UI)]
```

---

## 2. Master 20-Region UI → Backend Traceability Matrix

| # | Visual Region (Authoritative UI Blueprint) | Primary Business Capability | Backend Domain Service | System Tables / Data Fabric | Knowledge Graph Entities & Edges | Decision & AI Federation Hook | Governance / PFM Act Rule |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **1** | **Finance Command Header** | Enterprise real-time financial telemetry & context | `FinanceStateService.getCommandState()` | `finance_sources`, `finance_batches`, `finance_data_profiles` | `Tenant` ──`OPERATES`──> `FinanceDomain` | Real-time state classification (LIVE vs. FIXTURE) | Zero-trust actor context, tenant scoping (`ketraco`) |
| **2** | **Available Cash KPI** | Liquid treasury position (`KES 4.82B ↑ 12%`) | `TreasuryService.getCashPosition()` | `finance_accounts`, `finance_payments`, `finance_journals` | `Account(1000)` ──`HOLDS`──> `CashBalance` | Treasury Agent liquidity anomaly detector | PFM Act Section 28 (Treasury Single Account compliance) |
| **3** | **Total Commitments KPI** | Total encumbered budget (`KES 11.4B ↑ 8%`) | `CommitmentService.getTotalCommitments()` | `finance_commitments`, `finance_budget_lines` | `Commitment` ──`ENCUMBERS`──> `BudgetLine` | Commitment drift evaluator | PPADA Section 53 (Approved procurement plan encumbrance) |
| **4** | **Outstanding Payables KPI** | Validated invoices pending disbursement (`KES 6.3B ↑ 5%`) | `PayablesService.getOutstandingPayables()` | `finance_invoices`, `finance_payments` | `Invoice` ──`PENDING_SETTLEMENT`──> `Supplier` | Payment Aging & Cashflow demand predictor | Prompt Payment Rule (60-day invoice settlement window) |
| **5** | **Outstanding Receivables KPI** | Transmission wheeling revenue receivables (`KES 3.7B ↓ 9%`) | `ReceivablesService.getReceivables()` | `finance_accounts`, `finance_records` | `Receivable` ──`OWED_BY`──> `Offtaker(KPLC)` | Revenue collection velocity forecast | Power Purchase & Wheeling Agreement statutory tariff terms |
| **6** | **Budget Utilization Gauge** | Macro execution rate (`68% ↑`) | `BudgetService.getBudgetUtilization()` | `finance_budgets`, `finance_budget_lines` | `Budget` ──`ALLOCATED_TO`──> `Project` | Budget over-expenditure sentinel agent | PFM Act Section 43 (No expenditure without appropriation) |
| **7** | **Cash Flow Outlook (Apr-Sep)** | 6-Month forward liquidity forecasting | `CashFlowForecastService.getOutlook()` | `finance_forecasts`, `finance_payments`, `finance_invoices` | `Forecast` ──`PROJECTS`──> `CashFlow` | Treasury Agent Monte Carlo liquidity simulation | Treasury liquidity reserve buffer floor (KES 1.0B) |
| **8** | **Budget vs. Actual by Program** | Capital & operational allocation burn | `BudgetService.getVarianceByProgram()` | `finance_budgets`, `finance_costs`, `finance_cost_centres` | `Program` ──`CONSUMES`──> `Budget` | Variance anomaly regression model | PFM Regulations 2015 virement threshold (<10%) |
| **9** | **Financial Risk Heatmap** | 6x4 Cross-Domain Financial Exposure Matrix | `FinancialRiskService.getRiskHeatmap()` | `finance_risks`, `finance_lineage` | `FinancialRisk` ──`IMPACTS`──> `Project/Supplier/Cash` | Risk Assessment Agent cross-domain propagation | KETRACO Enterprise Risk Management Framework |
| **10** | **Top Decisions & Alerts (7 Items)** | Prioritized human-in-the-loop executive queue | `FinancialAlertsService.getPendingAlerts()` | `finance_risks`, `finance_invoices`, `finance_commitments` | `Alert` ──`REQUIRES_ACTION`──> `Role(FinanceDirector)` | Decision Intelligence Priority Ranker | Separation of Duties (Maker-Checker statutory protocol) |
| **11** | **AI Decision Workspace Bar** | Cognitive interrogation & copilot prompt runner | `GeminiFinanceCopilot.investigate()` | `finance_records`, `finance_mappings`, `agent_sessions` | `CopilotQuery` ──`RESOLVES_TO`──> `GraphSubgraph` | Gemini 2.5 Server-Side Financial Reasoning Engine | Read-only grounding without unauthenticated mutation |
| **12** | **Project Financial State** | Project KETRACO-003 Athi Line Deep-Dive | `ProjectFinanceService.getProjectState("KETRACO-003")` | `finance_projects`, `finance_costs`, `finance_commitments` | `Project(KETRACO-003)` ──`HAS_FINANCE`──> `ProjectFinance` | Cost overrun probability model (78% probability) | Project milestone verification & bill of quantities audit |
| **13** | **ATLAS Recommendation** | Variation order moratorium & savings action | `FinanceRecommendationEngine.getRecommendation()` | `finance_risks`, `finance_costs` | `Recommendation` ──`AVOIDS_EXPOSURE`──> `Project` | Recommendation confidence evaluator (KES 117M avoided) | PPADA Section 139 (Contract variation cap of 25%) |
| **14** | **Evidence Lineage** | Audit-grade provenance for recommendation | `FinanceLineageService.getEvidence("KETRACO-003")` | `finance_lineage`, `finance_records`, `finance_sources` | `Record` ──`PROVES`──> `Recommendation` | Lineage Graph Traversal Engine | Section 68 PPADA procurement record retention |
| **15** | **Scenario Simulation Lab** | No Delay vs. 3-Mo vs. 6-Mo Cost/Cash Impact | `FinanceScenarioEngine.simulateDelay()` | `finance_forecasts`, `finance_projects` | `Scenario` ──`STRESS_TESTS`──> `ProjectFinancialTwin` | Deterministic cost escalation curve calculator | Public Investment Management (PIM) guidelines |
| **16** | **Financial Value-Flow Twin** | Interactive graph of Funding → Grid Value | `FinanceGraphService.getValueFlowTwin()` | `finance_mappings`, `knowledge_graph` | `Funding`──>`Program`──>`Contract`──>`Asset`──>`Grid` | Atlas Digital Twin topology layout engine | National transmission asset capitalization standards |
| **17** | **Recent Financial Events Stream** | Real-time financial operational ledger log | `FinanceEventService.getRecentEvents()` | `finance_records`, `finance_payments`, `finance_invoices` | `FinancialEvent` ──`OCCURRED_ON`──> `Entity` | Event correlation & anomaly tagger | Immutable audit trail with SHA-256 chain integrity |
| **18** | **Finance Agent Activity** | Multi-agent autonomous monitoring state | `AgentRuntimeService.getFinanceAgentStates()` | `agent_tasks`, `ai_telemetry_logs` | `Agent(Treasury/Project/Supplier)` ──`RUNS`──> `Task` | Agent OS multi-agent federation | Agent governance bounds & clearance tier check |
| **19** | **Cross-Domain Insights** | Synergistic supply chain / project ripple effects | `CrossDomainCorrelationService.getInsights()` | `finance_mappings`, `scm_suppliers`, `scm_projects` | `Supplier` ──`EXPOSURE_RISK`──> `Budget` | Cross-domain graph centrality analyzer | Supply chain concentration risk mitigation policy |
| **20** | **Quick Actions Suite** | Executive statutory transaction launchers | `FinanceWorkflowService.executeAction()` | `finance_budgets`, `finance_payments`, `workflows` | `Action` ──`TRIGGERS_WORKFLOW`──> `ApprovalWorkflow` | Workflow eligibility & pre-flight rule checker | Dual authorization & electronic signature ledger |

---

## 3. First Vertical Slice Definition: Finance Command State

### Scope of Vertical Slice:
Deliver the end-to-end live flow for the top KPI row and real-time core metrics:
1. **Available Cash:** `KES 4,820,000,000` (KES 4.82B, +12% 30d change)
2. **Total Commitments:** `KES 11,400,000,000` (KES 11.4B, +8% 30d change)
3. **Outstanding Payables:** `KES 6,300,000,000` (KES 6.3B, +5% 30d change)
4. **Outstanding Receivables:** `KES 3,700,000,000` (KES 3.7B, -9% 30d change)
5. **Budget Utilization:** `68%` (+4% vs. previous quarter)
6. **Cash Flow Outlook Data (Apr - Sep):** Inflows, Outflows, and Net Position
7. **Budget vs Actual by Program:** Transmission Projects (72%), Grid Expansion (64%), System Strengthening (58%), Operational (81%), Admin & Support (49%)
8. **Risk Heatmap Breakdown:** Matrix of 6 categories across 4 severity levels
9. **Top Decisions & Alerts:** 7 real actionable alerts with risk badges and direct copilot links
10. **Project KETRACO-003 State:** Athi River Transmission Line financials, variance (+KES 320M), overrun probability (78%), cost drivers, ATLAS recommendation (KES 117M avoided exposure), and 3 scenario delay simulations

### Implementation Path:
1. **Database / Storage:** SQLite tables (`finance_accounts`, `finance_budgets`, `finance_commitments`, `finance_invoices`, `finance_payments`, `finance_projects`, `finance_risks`, `finance_forecasts`).
2. **Domain Service:** `backend/finance/finance-state-service.ts` calculating deterministic, real KETRACO financial aggregates with historical trend computation.
3. **API Layer:** `GET /api/finance/command-state`, `GET /api/finance/project-deepdive/:projectId`, `POST /api/finance/simulate-scenario`, `POST /api/finance/actions/execute` in `backend/finance/api-routes.ts`.
4. **Event & Audit Layer:** Audit logging with actor ID, IP, tenant isolation, and SHA-256 tamper-evident checksums.
5. **Frontend Surface:** Update `FinancialOverview.tsx` (the Command view) to match the authoritative blueprint pixel-for-pixel, connected live to `/api/finance/command-state` with seamless fallback, interactive tabs, simulation switches, modal actions, and live copilot query injection.
