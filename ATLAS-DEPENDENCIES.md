# SALIENCE ATLAS — DEPENDENCY INVENTORY

> Concrete caller→callee inventory for every backend router and every frontend module.
> Format: **Consumer** → **Provider** (status).

---

## 1. Frontend module → backend endpoint map

| Frontend module | File | Backend endpoints consumed | Data state |
|-----------------|------|----------------------------|------------|
| GlobalHeader/App login | src/App.tsx | POST /api/auth/login, /logout, GET /api/auth/config, GET /api/scm/telemetry | REAL |
| ScmCopilot | src/components/ketraco/ScmCopilot.tsx | POST /api/scm/orchestrate | **REAL w/ simulated fallback** |
| Admin OS | ScmModules.tsx | /api/auth/sessions, /sessions/terminate, /security-audit | REAL |
| ProcurementGraphCenter | src/components/ketraco/ProcurementGraphCenter.tsx | /api/v3/graph, /api/v3/twin/* | REAL |
| RelationshipExplorer | src/components/graph/RelationshipExplorer.tsx | /api/v3/graph/traverse/:id, /search | REAL |
| twin views | src/components/twin/*.tsx | /api/v3/twin/* (prop) | REAL |
| AgentPlatform | src/components/intelligence/AgentPlatform.tsx | /api/scm/fabric/* (health, workflows, governance, twin, rag, route) | **REAL calls, MOCKED data** |
| TenderStudio | src/components/ketraco/TenderStudio.tsx | /api/scm/procurement-intelligence/*, /api/evaluation/*, /api/v2/evaluation/* | **MIXED (TenderMockData + real APIs)** |
| TenderEvaluationWorkspace | src/components/ketraco/tender/ | /api/evaluation/* (bidders, docs, audit, upload, override, approve, simulate) | REAL |
| LogisticsCommand | src/components/logistics/CommandCenter.tsx | /api/logistics/overview, /events, /shipments | REAL |
| AiOperationsCenter | src/components/ketraco/AiOperationsCenter.tsx | /api/ai-federation/telemetry, /maintenance, /api/ai | REAL |
| AIRuntimeDashboard | src/components/ai-runtime/AIRuntimeDashboard.tsx | /api/ai/runtime/* (5) | REAL |
| CaseManagementSystem | src/components/intelligence/CaseManagementSystem.tsx | /api/v4/cases | REAL |
| DecisionIntelligenceWorkspace | src/components/intelligence/DecisionIntelligenceWorkspace.tsx | /api/v4/decisions/generate | REAL |
| EnterpriseEvaluationEngine | src/components/ketraco/tender/enterprise-evaluation/ | /api/v2/evaluation/* | REAL |
| FinanceModule | src/components/ketraco/finance/ | /api/finance/* (12) | **REAL w/ fixture fallback flagged** |
| MissionControl | src/components/*/MissionControl.tsx | /api/missions* (**NOT MOUNTED — dead**), /api/v3 | **BLUE — endpoint dead** |
| **Command Center** | src/components/ketraco/command-center/ | **NONE** (all local engines) | **HARDCODED (SCADA-as-LIVE)** |
| Supply Nexus | ScmModules.tsx ProjectSupplyNexus | none | **HARDCODED** |
| Supplier Intelligence | ScmModules.tsx SupplierIntelligence | none | **HARDCODED** |
| Inventory / Risk / Executive / Strategic / Drone / DecisionApproval / ProcurementWatch | various | none | **HARDCODED** |
| AtlasAgentOS / AtlasAgentPulse | src/components/platform, ui/atlas | none | **HARDCODED (DEFAULT_ENTERPRISE_AGENTS)** |

---

## 2. Backend router → service → data map

| Router | Handler location | Service(s) | Data backing | Status |
|--------|------------------|-----------|--------------|--------|
| /api/auth | auth-router.ts | IdentityService, AuthorizationService, AuditLedger | Redis sessions; env-backed demo users | GREEN |
| /api/scm | server.ts:1219+, chrome-extension-api.ts | SCMOrchestrator, AutonomousProcurementEngine, GovernanceManager, DigitalTwinRegistry, AgentManager, EnterpriseKnowledgeRetrieval | in-memory | **GREEN routes / MOCKED data** |
| /api/v2/evaluation | backend/evaluation/api-routes.ts | EvaluationService | SQLite + Gemini | GREEN |
| /api/evaluation | server.ts:1694+ | EvaluationWorkflowEngine, RuleRegistry | SQLite | GREEN |
| /api/ai | server.ts:283+ | ModelRouter, AIGateway, ModelRegistry | env providers | GREEN/PURPLE |
| /api/finance | backend/finance/api-routes.ts | FinanceService, connectors, observability | SQLite | GREEN |
| /api/logistics | backend/domains/logistics/api-routes.ts | LogisticsService | SQLite | GREEN |
| /api/v3 | server.ts:1470+ | KnowledgeGraphService, DigitalTwinService, collusion | in-memory graph | GREEN |
| /api/v4 | server.ts:1567+ | DecisionIntelligenceEngine, PredictiveProcurementService, CaseManagementService | in-memory | GREEN |
| /api/platform | server.ts:505-1216 | platform pipeline phase services | in-memory | GREEN logic / some MOCKED outputs |
| /api/drone | server.ts:383-502 | — | hardcoded | **MOCKED** |
| /api/inventory | server.ts:1604-1692 | — | in-memory/hardcoded | **MOCKED** |
| /api/event-fabric (dead) | backend/event-fabric/ | InMemoryEventStore, WS/SSE | in-memory | **BLUE — not mounted** |
| /api/missions (dead) | backend/mission-engine/ | mission engine | in-memory | **BLUE — not mounted** |
| /api/planning (dead) | backend/planning-engine/ | planning engine | in-memory | **BLUE — not mounted (TS errors)** |
| /api/fabric (dead) | backend/integration/ | data-fabric adapters | in-memory | **BLUE — not mounted** |

---

## 3. Key shared-platform dependencies (logical, currently unwired or partial)

- **Event Fabric** should sit between all engines and Observability — currently only in-memory `LoopEventSystem`/`AgentEventStream` are live; the full `backend/event-fabric/` is dead code.
- **Governance** is a singleton (`platform/Governance.ts`) used inconsistently; `GovernanceManager` (SCM) is a separate hardcoded queue.
- **Memory** has a rich `src/core/memory/` model but no persistent store; `EnterpriseKnowledgeRetrieval` is 5 hardcoded docs + fake `embed()` vectors.
- **Model Router** is the AI chokepoint; all providers default disabled. `stream()`/`embed()` silently mock.

---

## 4. Critical dependency risks
1. **`onAskCopilot` contract** — consumed by 12+ modules; must remain `(prompt) => void`. Any change must keep the ScmCopilot → `/api/scm/orchestrate` path intact.
2. **`window.fetch` global interceptor** (App.tsx) injects Bearer token — any new `/api` call is automatically authenticated; must not break existing callers.
3. **Tenant module gating** — module render is gated by `TenantContext.modules`; adding a real-data module must respect per-tenant enablement.
4. Dead-code routers (event/mission/planning/integration) have **TS errors** (planning) — wiring them requires fixing compile errors first.
