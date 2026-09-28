# SALIENCE ATLAS — MASTER ARCHITECTURE

> Status: **LIVE baseline** · Grounded in the actual repository (v5.1.0) · Updated continuously during enactment.
> This document describes the *real* architecture as it exists today, distinguishing implemented (GREEN), partial (AMBER), missing (RED), architectural-dependency (BLUE) and AI capability (PURPLE) layers. It is **not** aspirational.

---

## 1. System Shape

Salience Atlas is a **single-tenant-by-multi-tenant React 19 SPA** over an **Express + SQLite/Postgres + Redis + AI-federation** backend. There is **no router**; module switching is state-based in `src/App.tsx` with URL sync via `history.replaceState`.

```
┌───────────────────────────────────────────────────────────────┐
│  ATLAS UI/UX — React SPA (Vite 6, Tailwind v4, motion)         │
│  src/App.tsx (21 modules) · src/design-system (18 primitives)   │
│  TenantProvider × 3 (ketraco/kengen/kplc) · ShellProvider        │
└────────────────────────────┬──────────────────────────────────┘
                             │ fetch() + global Bearer interceptor
┌────────────────────────────▼──────────────────────────────────┐
│  EXPRESS API — server.ts (2368 lines) · multiple routers        │
│  /api/auth /api/scm /api/evaluation /api/ai /api/finance        │
│  /api/logistics /api/v2 /api/v3 /api/v4 /api/platform /api/drone│
└─────────────┬──────────────────────────────────────────────────┘
              │
   ┌──────────┼────────────────────────┐
   ▼          ▼                        ▼
 SQLite    Redis (ioredis)        AI Federation
 (active)  w/ in-memory           (Gemini + ModelRouter)
 Postgres  fallback                Agents
 (target)                          Workflows, Events
```

---

## 2. Layer Inventory (real state)

### 2.1 Persistence
| Layer | Location | State | Notes |
|-------|----------|-------|-------|
| SQLite (active) | `backend/database/db-core.ts` → `data/salience_atlas.db` | **GREEN** | ~44 tables via 4 programmatic migrations (rule-ontology, evidence, finance, logistics) |
| Postgres/Prisma (target) | `prisma/schema.prisma` + `prisma/schema-logistics.prisma` | **AMBER** | ~64 models defined; **no `prisma/migrations/` directory yet** — declared but not migrated/verified |
| Redis | `backend/database/redis-service.ts` | **GREEN** (in-memory fallback) | `REDIS_ENABLED=true` but no `REDIS_URL` → uses Map fallback |
| In-memory stores | various (`event-fabric`, `knowledge-graph`, `agents`, `procurement-engine`) | **AMBER** | 15+ independent Map/Array stores; none persisted beyond SQLite |

### 2.2 API surface (server.ts mounted)
- **Auth** — `/api/auth/*` (login/refresh/logout/sessions/security-audit) — real JWT + Redis session, **but demo identities are env-backed** (post P0 fix).
- **SCM** — `/api/scm/*` (orchestrate, telemetry, fabric, procurement-intelligence, human-oversight, agent-gateway).
- **Evaluation** — `/api/evaluation/*` + `/api/v2/evaluation/*` — **real** document pipeline (Gemini when key present).
- **AI** — `/api/ai/*` — real ModelRouter + AIGateway; provider-failover real; `stream()`/`embed()` have silent simulated fallbacks (**PRODUCTION MOCK — flagged**).
- **Finance** — `/api/finance/*` — **real** CRUD + RBAC + DB + connector pattern.
- **Logistics** — `/api/logistics/*` — **real** SQLite queries.
- **Procurement graph/twin** — `/api/v3/*` — **real** (in-memory) Knowledge Graph + Digital Twin.
- **Decision/v4** — `/api/v4/*` — **real** (in-memory) decision/case management.
- **Platform/drone/inventory** — `/api/platform/*`, `/api/drone/*`, `/api/inventory/*` — **much MOCKED** (hardcoded responses).

### 2.3 AuthN/AuthZ
| Concern | State |
|---------|-------|
| JWT access+refresh, HS256, secrets-manager auto-heal | GREEN |
| Redis-backed sessions + rotation (RTR) | GREEN |
| Path auth guards (`/api/scm/*`, `/api/ai/*`, `/api/finance/*`, `/api/logistics/*`) | GREEN |
| RBAC enforcement on `/api/v3`, `/api/v4`, `/api/platform`, `/api/drone`, `/api/inventory` | **RED — unguarded** |
| Audit logger | **RED — interface stub only** (`backend/observability/audit-logger.ts`) |

### 2.4 AI / Agent / Workflow / Event / Memory / Observability / Governance
Detailed in `ATLAS-GRAPH.md`. Summary:
- **AI federation** — GREEN infrastructure (ModelRouter, provider adapters, failover, cost governance). PURPLE when key present.
- **Agents** — AMBER: real AgentRegistry (`backend/agents/registry.ts`), AgentManager, in-memory procurement engine; but agent "intelligence" responses are deterministic/hardcoded (RED at produce-real-reasoning level).
- **Workflows** — AMBER: real `AutonomousProcurementEngine` + `AutonomousWorkflowEngine` (in-memory, hardcoded workflow templates). No Temporal. No DETECTED→…→LEARNED lifecycle anywhere.
- **Events** — AMBER: the full `backend/event-fabric/` (REST/WS/SSE/store) exists **but is NOT mounted in server.ts (dead code)**; only the in-memory `LoopEventSystem`/`AgentEventStream` are live.
- **Memory** — AMBER: architecture split into SHORT/EPISODIC/SEMANTIC/PROCEDURAL/OPERATIONAL (`src/core/memory/`) but persistence is in-memory; `EnterpriseMemory.md` overstates production readiness.
- **Observability** — AMBER: custom correlationId + telemetry; **no OpenTelemetry**; audit logger is a stub.
- **Governance** — AMBER: `Governance.ts`/`GovernanceManager` RBAC+ABAC+approval queue real but in-memory; many data surfaces unguarded.

---

## 3. Dead code / not wired (BLUE — architectural dependency, not yet connected)

These are **implemented but not mounted in `server.ts`** and therefore do not serve traffic. They are candidates to WIRE (not rewrite):

- `backend/event-fabric/` — event-api-routes, websocket-handler, sse-handler, store, state-store
- `backend/mission-engine/` — mission-api-routes (17 routes)
- `backend/planning-engine/` — planning-api-routes (26 routes, has TS errors)
- `backend/integration/` — fabric-api-routes (11 routes) + data-fabric adapters
- `platform/*` engines (workflow-engine, decision-intelligence, event-fabric, knowledge-graph, ontology, etc.) — singletons/stubs, unwired

---

## 4. Frontend (consumer) shape

- Shell: `GlobalHeader`, `GlobalSidebar`, `MinimalPageHero`, `TransparentFooter`, Command Palette, `ScmCopilot` (3-state), `ExecutiveDemoMode`.
- Design system: 18 primitives + token layers in `src/design-system/`.
- Data provenance split:
  - **REAL-data modules**: ProcurementGraphCenter, RelationshipExplorer, twin views, AgentPlatform, LogisticsCommand, AdministrationOS, TenderEvaluationWorkspace, EnterpriseEvaluation, CaseManagement, DecisionIntelligenceWorkspace, AIRuntimeDashboard, AiOperationsCenter, FinanceModule (fixture-fallback flagged).
  - **HARDCODED modules (PRODUCTION MOCK)**: CommandCenter (grid-canonical-data + jitter), Supply Nexus, SupplierIntelligence, RiskComplianceCenter, ExecutiveIntelligence, StrategicSourcing, InventoryHub, DroneIntelligence, DecisionApprovalCenter, ProcurementWatchCenter, TenderStudio (TenderMockData), AtlasAgentOS.

---

## 5. Priority roadmap (see ATLAS-IMPLEMENTATION-PLAN.md)

- **P0 (stability/security):** hardcoded credentials (DONE), unguarded RBAC routes, audit-logger stub, build/runtime reds.
- **P1 (stakeholder + infra):** perfect Command Center/Shell/Mission Control/Agent OS/Knowledge Graph/Digital Twin/Supply Nexus/Procurement; then wire dead-code fabric (events, missions, planning, integration) to real data paths.
- **P2 (scale):** remaining modules, real providers, richer analytics, real memory persistence, OpenTelemetry.
