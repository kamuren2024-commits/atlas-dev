# SALIENCE ATLAS — UI TRANSFORMATION AUDIT
## Phase 0: Repository Forensic Audit
### Audit Generated: 2026-09-02
### Platform: KETRACO Atlas v5.1.0 — Enterprise Intelligence OS

---

## 1. FRAMEWORK & STACK IDENTIFICATION

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Rendering | React | 19.0.1 | StrictMode enabled |
| Bundler | Vite | 6.2.3 | HMR conditional via DISABLE_HMR |
| Styling | Tailwind CSS | 4.1.14 | Via @tailwindcss/vite plugin |
| Theme | CSS `@theme` block | — | Defined in `src/index.css` |
| Animation | Framer Motion | 12.23.24 | `motion/react` imports |
| Advanced Motion | GSAP | 3.15.0 | Numeric counters, complex sequences |
| Charts | Recharts | 3.9.0 + D3 7.9.0 | Bar/Line/Pie + D3 utilities |
| 3D/Spatial | Three.js | 0.185.1 | Drone/GIS modules only |
| Icons | Lucide React | 0.546.0 | Consistent icon library |
| State | React Context + useState | — | TenantContext, ShellContext, FinanceDataContext |
| Routing | Custom state-based | — | `window.history.replaceState` + `activeModule` state in App.tsx |
| Auth | Custom JWT | — | fetch interceptor + localStorage tokens |
| Fonts | Inter, Space Grotesk, JetBrains Mono | Google Fonts | Sans / Display / Mono trinity |

### Package Inventory (core)
- `@tailwindcss/vite` — Tailwind v4 Vite integration
- `@vitejs/plugin-react` — React 19 support
- `lucide-react` — Enterprise iconography
- `motion` (Framer Motion) — UI transitions
- `recharts` — Data visualization
- `d3` — Advanced charting utilities
- `three` — 3D spatial intelligence
- `gsap` — High-performance animation
- `@prisma/client` 5.22 — ORM

---

## 2. MODULE INVENTORY & TRANSFORMATION PRIORITY MATRIX

> **PROTECTED BOUNDARY**: `overview` module = Command Center. DO NOT MODIFY under any circumstance.
> All modules below are candidates for transformation unless marked PROTECTED.

### 2.1 Module Registry

| # | Module ID | Route | Label | Group | Purpose | Transform Priority |
|---|-----------|-------|-------|-------|---------|-------------------|
| 0 | `overview` | `/overview` | Command Center | **COMMAND** | Central spatial intelligence operations | 🔴 **PROTECTED — DO NOT MODIFY** |
| 1 | `drone-intelligence` | `/drone-intelligence` | Drone Intelligence | INTELLIGENCE | Inspection, defect detection, asset corridor intelligence | 🟢 P0 — HIGH |
| 2 | `logistics` | `/logistics` | Logistics Command | INTELLIGENCE | Maritime shipping, port ETA models, cargo tracking | 🟢 P0 — HIGH |
| 3 | `procurement-graph` | `/procurement-graph` | Graph & Digital Twin | INTELLIGENCE | Relationship Knowledge Graph, entity twins | 🟡 P1 — MEDIUM |
| 4 | `intelligence` | `/intelligence` | Decision Intelligence | INTELLIGENCE | Predictive Watch Center + Case Management | 🟢 P0 — HIGH |
| 5 | `twin` | `/twin` | SCM Digital Twin | INTELLIGENCE | Disruption stressors, failure sandbox simulation | 🟡 P1 — MEDIUM |
| 6 | `tender` | `/tender` | Tender Intelligence | OPERATIONS | Bid evaluations, scoring matrix, PPADA compliance | 🟢 P0 — HIGH |
| 7 | `project` | `/project` | Project Supply Nexus | OPERATIONS | Material readiness, BOM paths, project costing | 🟡 P1 — MEDIUM |
| 8 | `inventory` | `/inventory` | Inventory Intelligence | OPERATIONS | Depot stocks, deadstock forecasting, warehouse | 🟢 P0 — HIGH |
| 9 | `supplier` | `/supplier` | Supplier Network | OPERATIONS | Vendor reliability, scoring, performance | 🟡 P1 — MEDIUM |
| 10 | `sourcing` | `/sourcing` | Strategic Sourcing | OPERATIONS | Spend optimization, savings indices | 🟡 P1 — MEDIUM |
| 11 | `acin` | `/acin` | Contract Intelligence | OPERATIONS | Autonomous Obligation Twins, clause simulator | 🟢 P0 — HIGH |
| 12 | `executive` | `/executive` | Executive Board | OPERATIONS | Board briefings, portfolio KPI summaries | 🟢 P0 — HIGH |
| 13 | `risk` | `/risk` | Risk & Compliance | FINANCE & RISK | Fraud auditing, conflict triggers, PPADA | 🟢 P0 — HIGH |
| 14 | `decision` | `/decision` | Decision & Audit Hub | FINANCE & RISK | PPADA statutory signs, trust ledger, approvals | 🟡 P1 — MEDIUM |
| 15 | `finance` | `/finance` | Finance Intelligence | FINANCE & RISK | Budget, commitments, payments, CAPEX/OPEX | 🟢 P0 — HIGH |
| 16 | `agents` | `/agents` | Agent Platform | AI | Agent SDK Runtime & Orchestration | 🟡 P1 — MEDIUM |
| 17 | `ai-ops` | `/ai-ops` | AI Operations Center | AI | Provider resilience, cost telemetry, gateways | 🟡 P1 — MEDIUM |
| 18 | `ai-runtime` | `/ai-runtime` | AI Runtime Platform | AI | Enterprise AI Governance & Inference Gateway | 🟡 P1 — MEDIUM |
| 19 | `admin` | `/admin` | Administration OS | SYSTEM | RBAC controls, multi-tenant telemetry | 🟠 P2 — LOW |

### 2.2 Module Detailed Audit

---

#### MODULE 0: overview (Command Center) — PROTECTED
- **Route**: `/overview`
- **Component**: `OverviewController.tsx` → `CommandCenterShell.tsx`
- **Primary workflows**: Centralized operational dashboards, GIS mapping, live telemetry
- **Major components**: CommandCenterShell (encapsulated)
- **Data surfaces**: GIS, grid assets, mission telemetry
- **API dependencies**: `/api/scm/telemetry`, `/api/auth/*`
- **Current UI maturity**: Production-grade, cohesive design language
- **Major defects**: NONE (PROTECTED boundary)
- **Transformation priority**: SKIP — DO NOT MODIFY

---

#### MODULE 1: drone-intelligence — P0
- **Route**: `/drone-intelligence`
- **Component**: `DroneIntelligenceModule.tsx`
- **Primary workflows**: Mission review, asset inspection, defect triage, corridor mapping
- **Major components**: Mission list, defect gallery, 3D asset view, corridor map
- **Data surfaces**: Missions, Assets, Defects, Inspections, Media
- **API dependencies**: Grid domain entities (Mission, Asset, Defect, Media)
- **Current UI maturity**: Beta — functional, prototype styling
- **Major defects**: Generic cards, no KPI sparklines, weak loading states, Three.js may be overused
- **Transformation priority**: P0 — Showcases core intelligence capability

---

#### MODULE 2: logistics — P0
- **Route**: `/logistics`
- **Component**: `LogisticsView.tsx` (from `components/logistics/`)
- **Primary workflows**: Shipment tracking, port ETA, customs hold monitoring, route optimization
- **Major components**: LogisticsShell, LogisticsView, CommandCenter (in logistics folder - separate from main CC)
- **Data surfaces**: Shipments, Ports, Routes, Carriers, Customs
- **API dependencies**: `/api/scm/telemetry` fallback
- **Current UI maturity**: Beta — has own shell and Command Center variant
- **Major defects**: Own styling conventions diverge from global; inconsistent with new shell design
- **Transformation priority**: P0 — High visual impact for investor demo

---

#### MODULE 3: procurement-graph — P1
- **Route**: `/procurement-graph`
- **Component**: `ProcurementGraphCenter.tsx`
- **Primary workflows**: Entity relationship exploration, knowledge graph traversal, digital twin views
- **Major components**: Graph visualization, node inspector, twin viewer
- **Data surfaces**: Suppliers, Contracts, Tenders, Projects, Assets relationships
- **API dependencies**: Graph queries, entity resolution APIs
- **Current UI maturity**: Prototype — functional graph, weak IA
- **Major defects**: Poor legend/clarity, graph controls overwhelming, no contextual side panels
- **Transformation priority**: P1 — Impressive but needs refinement

---

#### MODULE 4: intelligence — P0
- **Route**: `/intelligence`
- **Sub-tabs**: Watch Center, Case Management
- **Components**: `ProcurementWatchCenter.tsx`, `CaseManagementSystem.tsx`
- **Primary workflows**: Predictive alerting, anomaly detection, case triage, investigation
- **Major components**: Alert feed, case queue, evidence panel, timeline
- **Data surfaces**: Alerts, Cases, Evidence, Risk scores
- **API dependencies**: Intelligence services, AI inference
- **Current UI maturity**: Prototype — tab wrapper uses white bg (theme clash)
- **Major defects**: Tab bar uses white/slate on dark body (inconsistent), generic card layouts
- **Transformation priority**: P0 — AI/decision intelligence is a core differentiator

---

#### MODULE 5: twin (SCM Digital Twin) — P1
- **Route**: `/twin`
- **Component**: `ScmDigitalTwin.tsx`
- **Primary workflows**: Disruption simulation, stress testing, failure mode sandbox
- **Major components**: Simulation controls, scenario inputs, impact dashboard
- **Data surfaces**: Scenarios, impact metrics, supply chain nodes
- **API dependencies**: Simulation engine, twin APIs
- **Current UI maturity**: Prototype
- **Major defects**: Weak visual hierarchy, simulation controls unintuitive
- **Transformation priority**: P1 — Powerful but needs UX simplification

---

#### MODULE 6: tender — P0
- **Route**: `/tender`
- **Component**: `TenderStudio.tsx`
- **Primary workflows**: Tender creation, bid evaluation, scoring matrix, compliance checks
- **Major components**: TenderCard, TenderTable, TenderEvaluationWorkspace, EnterpriseEvaluationEngine, TenderDialog
- **Data surfaces**: Tenders, Bids, Suppliers, Criteria, Scores, Contracts
- **API dependencies**: Heavy mock data usage (`TenderMockData.ts`), `/api/scm/*` endpoints with fallbacks
- **Current UI maturity**: Beta — feature-rich but complex
- **Major defects**: Massive component file (>100 imports), heavy mock data, dense layout, inconsistent styling, GSAP counters everywhere
- **Transformation priority**: P0 — Core procurement workflow

---

#### MODULE 7: project (Project Supply Nexus) — P1
- **Route**: `/project`
- **Component**: `ProjectSupplyNexus` (from `ScmModules.tsx`)
- **Primary workflows**: BOM management, material readiness, project supply tracking
- **Major components**: Project list, BOM explorer, material status dashboard
- **Data surfaces**: Projects, BOMs, Materials, Purchase orders
- **API dependencies**: SCM project APIs
- **Current UI maturity**: Prototype
- **Major defects**: Standard dashboard cards, no intelligence surfaces
- **Transformation priority**: P1 — Important but less visual

---

#### MODULE 8: inventory — P0
- **Route**: `/inventory`
- **Component**: `InventoryHub.tsx`
- **Primary workflows**: Stock visibility, warehouse, forecasting, deadstock, reorder decisions
- **Major components**: ItemMasterPanel, WarehouseMapPanel, LedgerEnginePanel, ReceivingIntelPanel, IssuingIntelPanel, ForecastingPanel, OptimizationPanel, AuditGovernancePanel, AiAgentsPanel
- **Data surfaces**: Items, Stock levels, Warehouses, Receipts, Issues, Forecasts
- **API dependencies**: Inline mock interfaces, no external API integration visible
- **Current UI maturity**: Beta — Good modular sub-panel structure
- **Major defects**: All state is local/mock, inline interface definitions, needs consolidated KPI surfaces
- **Transformation priority**: P0 — High data density showcase

---

#### MODULE 9: supplier (Supplier Network) — P1
- **Route**: `/supplier`
- **Component**: `SupplierIntelligence` (from `ScmModules.tsx`)
- **Primary workflows**: Vendor scoring, reliability metrics, performance tracking, onboarding
- **Major components**: Supplier grid, scorecards, risk matrix
- **Data surfaces**: Suppliers, Scores, Contracts, Performance history
- **API dependencies**: SCM supplier APIs
- **Current UI maturity**: Prototype
- **Major defects**: Generic dashboards, weak scoring visualization
- **Transformation priority**: P1

---

#### MODULE 10: sourcing (Strategic Sourcing) — P1
- **Route**: `/sourcing`
- **Component**: `StrategicSourcing` (from `ScmModules.tsx`)
- **Primary workflows**: Spend analysis, savings tracking, category optimization
- **Major components**: Spend breakdown, savings dashboard, category manager
- **Data surfaces**: Spend data, Savings, Categories, RFx events
- **API dependencies**: Sourcing analytics APIs
- **Current UI maturity**: Prototype
- **Major defects**: Generic charts, no insight surfaces
- **Transformation priority**: P1

---

#### MODULE 11: acin (Contract Intelligence) — P0
- **Route**: `/acin`
- **Component**: `ScmContractIntelligence.tsx`
- **Primary workflows**: Obligation extraction, clause twins, risk simulation, assurance monitoring
- **Major components**: Contract list, clause explorer, obligation tracker, simulation panel
- **Data surfaces**: Contracts, Clauses, Obligations, Risks, Events
- **API dependencies**: Contract AI services
- **Current UI maturity**: Beta
- **Major defects**: Complex IA, weak status communication, generic document UI
- **Transformation priority**: P0 — Unique AI capability

---

#### MODULE 12: executive (Executive Board) — P0
- **Route**: `/executive`
- **Component**: `ExecutiveIntelligence` (from `ScmModules.tsx`)
- **Primary workflows**: Board briefings, KPI rollup, portfolio summaries, action items
- **Major components**: Executive dashboard, KPI cards, briefing generator, action tracker
- **Data surfaces**: KPIs, Portfolios, Briefings, Actions
- **API dependencies**: Rollup/analytics APIs
- **Current UI maturity**: Prototype
- **Major defects**: Critical first-impression module, needs premium executive polish
- **Transformation priority**: P0 — Investors/executives land here first

---

#### MODULE 13: risk — P0
- **Route**: `/risk`
- **Component**: `RiskComplianceCenter` (from `ScmModules.tsx`)
- **Primary workflows**: Fraud detection, conflict of interest, PPADA compliance, audit trails
- **Major components**: Risk matrix, alert feed, compliance checklist, audit viewer
- **Data surfaces**: Risks, Alerts, Controls, Audits
- **API dependencies**: Risk engine, compliance APIs
- **Current UI maturity**: Prototype
- **Major defects**: Weak severity visualization, generic tables
- **Transformation priority**: P0 — Governance credibility

---

#### MODULE 14: decision (Decision & Audit Hub) — P1
- **Route**: `/decision`
- **Component**: `DecisionApprovalCenter.tsx`
- **Primary workflows**: PPADA sign-offs, trust ledger, multi-party approvals, audit chain
- **Major components**: Approval queue, decision timeline, trust ledger viewer
- **Data surfaces**: Decisions, Approvals, Signatures, Audit events
- **API dependencies**: Workflow, audit APIs
- **Current UI maturity**: Prototype
- **Major defects**: Generic forms, no signature/audit visualization
- **Transformation priority**: P1

---

#### MODULE 15: finance — P0
- **Route**: `/finance`
- **Component**: `FinanceModule.tsx` → `FinanceShell.tsx`
- **Primary workflows**: Budget management, commitments, AP/AR, payments, CAPEX/OPEX, forecasting
- **Major components**: FinanceShell (encapsulated), FinanceDataContext
- **Data surfaces**: Budgets, Commitments, Invoices, Payments, Journals, CAPEX, OPEX
- **API dependencies**: `/api/finance/*` endpoints, Finance domain entities
- **Current UI maturity**: WIP — Has own shell, separate theming
- **Major defects**: Divergent styling from global shell, owns tokens separately (`finance/tokens/tailwind.css`)
- **Transformation priority**: P0 — Core finance intelligence, new Phase 01 module

---

#### MODULE 16-18: AI Platform (agents, ai-ops, ai-runtime) — P1
- **Routes**: `/agents`, `/ai-ops`, `/ai-runtime`
- **Components**: `AgentPlatform.tsx`, `AiOperationsCenter.tsx`, `AIRuntimeDashboard.tsx`
- **Primary workflows**: Agent orchestration, provider ops, runtime governance, inference gateway
- **Major components**: Agent grid, provider dashboard, runtime metrics, prompt registry
- **Data surfaces**: Agents, Providers, Runs, Tokens, Latency, Cost
- **API dependencies**: AI runtime APIs, `/api/auth/config`
- **Current UI maturity**: Prototype/Beta
- **Major defects**: Technical UIs need enterprise polish, dashboard generic
- **Transformation priority**: P1 — Important for AI platform credibility

---

#### MODULE 19: admin — P2
- **Route**: `/admin`
- **Component**: `AdministrationOS` (from `ScmModules.tsx`)
- **Primary workflows**: RBAC, tenant config, system telemetry, user management
- **Major components**: User manager, role editor, tenant config, telemetry viewer
- **Data surfaces**: Users, Roles, Tenants, Permissions, Logs
- **API dependencies**: Auth, telemetry, admin APIs
- **Current UI maturity**: Functional
- **Major defects**: Low visual priority, utilitarian
- **Transformation priority**: P2 — Utilitarian, rarely demoed

---

## 3. SHARED COMPONENTS & SHELL AUDIT

### 3.1 Application Shell (Shared — needs upgrade, Command Center regresses tested)

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| GlobalHeader | `components/shell/GlobalHeader.tsx` | Beta | Good structure, needs visual polish + enterprise status surface |
| GlobalSidebar | `components/shell/GlobalSidebar.tsx` | Beta | Good grouping logic, inconsistent active states, needs hover refinement |
| MinimalPageHero | `components/shell/MinimalPageHero.tsx` | Alpha | Too minimal — needs full module header pattern |
| TransparentFooter | `components/shell/TransparentFooter.tsx` | Alpha | Barely visible, needs system status + health indicators |
| ScmCopilot | (inline in App.tsx) | Beta | Right-side copilot drawer, needs consistency upgrade |
| ShellContext | `components/shell/ShellContext.tsx` | Good | Breakpoint detection, collapse state |
| TenantContext | `context/TenantContext.tsx` | Good | Multi-tenant, user profile, module enablement |

### 3.2 Design System Tokens (Fragmented — needs consolidation)

| Token File | Location | Status |
|------------|----------|--------|
| Colors | `design-system/tokens/colors.ts` | Partial — logistics + generic mixed |
| Radius | `design-system/tokens/radius.ts` | Exists |
| Typography | `design-system/tokens/typography.ts` | Exists |
| Spacing | `design-system/tokens/spacing.ts` | Exists |
| Shadows | `design-system/tokens/shadows.ts` | Exists |
| Motion | `design-system/tokens/motion.ts` | Exists |
| Tailwind theme | `index.css` `@theme` block | Partial — custom slate scale + accent colors |
| Finance tokens | `components/ketraco/finance/tokens/tailwind.css` | ISOLATED — diverges from global |

**DEFECT**: No consolidated index/barrel export. EnterpriseComponents imports tokens individually from 6 files.

### 3.3 UI Primitives (EnterpriseComponents.tsx & misc)

| Component | Location | Maturity | Defects |
|-----------|----------|----------|---------|
| EnterpriseCard | `ui/EnterpriseComponents.tsx` | Beta | Border highlight classes hardcoded hex, not tokens |
| MetricPanel | `ui/EnterpriseComponents.tsx` | Beta | No sparkline, no status badge |
| StatusIndicator | `ui/EnterpriseComponents.tsx` | Beta | Limited status enum |
| TenantBadge | `ui/EnterpriseComponents.tsx` | Good | — |
| PermissionBadge | `ui/EnterpriseComponents.tsx` | Good | — |
| TenderCard/TenderTable/TenderBadge | `ketraco/tender/TenderAITheme.tsx` | Siloed | Tender-scoped, not reusable |
| FinanceShell components | `ketraco/finance/*` | Siloed | Finance-scoped, isolated theming |

**DEFECT**: No unified component architecture. Modules build own primitives instead of sharing.

---

## 4. AUTHENTICATION & ONBOARDING SURFACES

| Surface | Location | Maturity | Notes |
|---------|----------|----------|-------|
| Cinematic Intro | `App.tsx` L611-667 | Unique | 12s startup sequence, 3 steps, particle canvas |
| Login Gate (Security Gateway) | `App.tsx` L670-780 | Beta | Good visual, 3 tenant selector, role picker, passphrase |
| Dev Auth Bypass | `App.tsx` L388-405 | Functional | Bypasses via `/api/auth/config` |
| Fetch JWT Interceptor | `App.tsx` L199-258 | Good | Injects Bearer token on /api requests |

**DEFECT**: Cinematic intro 12s may be too long for demo (investor impatience risk). Consider skip option.

---

## 5. CURRENT UI / UX MAJOR DEFECTS SUMMARY

### 5.1 Visual System
- Fragmented design tokens (6 files + 1 tailwind.css + 1 finance override)
- Inconsistent border radii (some rounded-xl, rounded-2xl, rounded-[10px])
- Hardcoded hex colors mixed with Tailwind theme classes (e.g. `text-[#00D9FF]`)
- Over-reliance on `bg-[#xxxxxx]` arbitrary values instead of theme tokens
- Finance module has its own isolated Tailwind theme that diverges
- Ambient particle canvas on EVERY screen (performance + visual noise concern)

### 5.2 Component System
- No reusable `AtlasKPI`, `AtlasTable`, `AtlasPanel` primitives
- Each module reinvents cards, status badges, headers
- Tender module has own Tender* components that should be generalized
- Inventory module has 9 sub-panels with zero shared layout primitives
- `GsapCounter` defined inline in TenderStudio — should be shared

### 5.3 Information Architecture
- MinimalPageHero is too minimal — no module descriptions, status, or CTAs
- Sidebar has 7 groups but some groups contain only 1 item (COMMAND, SYSTEM)
- No breadcrumb trail beyond tenant name
- Tab bar in "intelligence" module uses WHITE background on dark body (severe visual clash at L989)

### 5.4 Data Surfaces
- Tables are basic — no sorting, filtering, column visibility, density controls
- KPI cards lack: sparklines, deltas, status, period context
- Charts are basic recharts defaults — no thresholds, annotations, drill-down
- Empty/loading/error states: mostly non-existent (raw data gaps)
- Mock data heavy: TenderMockData, Inventory inline interfaces

### 5.5 Responsive & Accessibility
- Breakpoint handling exists in ShellContext (desktop/mobile)
- Most modules likely break on small screens (dense layouts)
- No keyboard navigation focus styles (`.atlas-shell-focus` exists but scope unclear)
- No `prefers-reduced-motion` handling for GSAP animations
- Color-only status indicators (no icons + text reinforcement per WCAG)

### 5.6 Performance
- `AmbientParticleCanvas` renders a static 14-node texture and redraws only on resize
- GSAP used in multiple counters — may conflict with React rendering
- StrictMode + HMR disabled comment — investigate stability
- No visible lazy loading/Code Splitting

---

## 6. API INTEGRATION AUDIT

| API Pattern | Endpoints | Integration Maturity | Notes |
|-------------|-----------|---------------------|-------|
| Auth | `/api/auth/login`, `/api/auth/logout`, `/api/auth/config` | Production | JWT + refresh, dev bypass, fetch interceptor |
| SCM Telemetry | `/api/scm/telemetry` | Beta | Fallback hardcoded logs on failure |
| SCM Context | `/api/scm/context`, `/api/scm/knowledge-retrieval`, `/api/scm/twin-simulation`, `/api/scm/agent-gateway/call`, `/api/scm/human-oversight/resolve` | Mock Fallback | `getEndpointDefaultPayload` — returns inline JSON if API fails |
| AI Utilities | `/api/*` via `processAIRequest`, `checkSystemHealth` | Beta | Gemini config status check |
| Finance | `/api/finance/*` | WIP Phase 01 | Domain entities defined, API integration in progress |
| Grid Domain | Grid assets, missions via Prisma | Alpha | Domain types exist in `packages/domain/index.ts` |

---

## 7. TRANSFORMATION READINESS

### Protected Boundary Confirmation
Command Center (`overview` / `CommandCenterShell.tsx` / `Logistics/CommandCenter.tsx`) is explicitly identified and will not be modified.

### Graph Engineering Dependencies (Before shared component changes)
- GlobalHeader used in: App.tsx (all routes)
- GlobalSidebar used in: App.tsx (all routes)
- MinimalPageHero used in: App.tsx (all routes except Command Center implicitly)
- EnterpriseCard/MetricPanel used in: Unknown — grep needed before change
- index.css global styles: Affects ALL modules
- Tailwind theme tokens: Affects ALL modules (finance module has overrides)

### Execution Order Recommendation
1. Consolidate design system tokens → ONE barrel export + ONE Tailwind theme
2. Upgrade shell components with regression test against Command Center
3. Build Atlas* primitives (KPI, Table, Panel, Header, Drawer)
4. Apply to P0 modules in order: executive → tender → inventory → finance → drone-intelligence → intelligence → logistics → acin → risk
5. Apply to P1 modules
6. Apply to P2 admin
7. Responsive sweep + accessibility pass
8. Full QA walkthrough

---

## 8. ROUTE INVENTORY

All routes are state-based (not React Router), mapped via `activeModule` in App.tsx L329.

| Route Path | Module ID | Component |
|------------|-----------|-----------|
| `/overview` | overview | OverviewController → CommandCenterShell |
| `/drone-intelligence` | drone-intelligence | DroneIntelligenceModule |
| `/tender` | tender | TenderStudio |
| `/project` | project | ProjectSupplyNexus |
| `/inventory` | inventory | InventoryHub |
| `/supplier` | supplier | SupplierIntelligence |
| `/logistics` | logistics | LogisticsView |
| `/risk` | risk | RiskComplianceCenter |
| `/decision` | decision | DecisionApprovalCenter |
| `/acin` | acin | ScmContractIntelligence |
| `/procurement-graph` | procurement-graph | ProcurementGraphCenter |
| `/intelligence` | intelligence | ProcurementWatchCenter / CaseManagementSystem |
| `/twin` | twin | ScmDigitalTwin |
| `/sourcing` | sourcing | StrategicSourcing |
| `/executive` | executive | ExecutiveIntelligence |
| `/agents` | agents | AgentPlatform |
| `/ai-ops` | ai-ops | AiOperationsCenter |
| `/ai-runtime` | ai-runtime | AIRuntimeDashboard |
| `/admin` | admin | AdministrationOS |
| `/finance` | finance | FinanceModule → FinanceShell |

---

**END OF AUDIT — Phase 0 Complete**
Next: PHASE 1 — Consolidate Atlas Design System
