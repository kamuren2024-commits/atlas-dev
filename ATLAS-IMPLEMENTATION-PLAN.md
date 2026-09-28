# SALIENCE ATLAS — IMPLEMENTATION PLAN

> Execution plan following the Loop Engineering model: DISCOVER → MAP → PRIORITIZE → IMPLEMENT → CONNECT → TEST → VERIFY → DOCUMENT → CONTINUE.
> Every work item maps to the Master Implementation Graph (`ATLAS-GRAPH.md`) and Risk Register (`ATLAS-RISK-REGISTER.md`).

## Phase LOOP-0 / 1 (COMPLETE)
- ✅ Full repository discovery (backend, DB, frontend, AI/agent/workflow/event/memory/governance/observability, mock audit, graph/twin deep-dive).
- ✅ Implementation graph mapped (ATLAS-GRAPH.md), dependencies inventoried (ATLAS-DEPENDENCIES.md), risks registered (ATLAS-RISK-REGISTER.md).
- ✅ `tsc --noEmit` and `vite build` verified GREEN for the current codebase.

## P0 — STABILITY & SECURITY
1. ✅ **R-001** Hardcoded credentials → `DEMO_DEV_PASSWORD` env + warning (DONE).
2. [ ] **R-002** Enforce auth/RBAC on `/api/v3`, `/api/v4`, `/api/platform`, `/api/drone`, `/api/inventory`.
3. [ ] **R-003** Implement persistent audit logger (SQLite-backed).
4. [ ] Re-verify `tsc` + `build` after each P0 change.

## P1-A — STAKEHOLDER EXPERIENCE (72h demo path)
Goal: perfect the flagship surfaces AND back them with real (not fabricated) data where the real infrastructure exists.
1. **SLICE 1 — Supply Intelligence (end-to-end real)**:
   - Wire `SupplierIntelligence` + `ProjectSupplyNexus` to `/api/scm/procurement-intelligence/entities` (`AutonomousProcurementEngine`) + `/api/v3/graph` (KnowledgeGraphService) + governance gates.
   - Render real entity status/healthScore, real graph relationships, real approval-gate queue; preserve the MissionBrief/AgentPulse design already in place.
   - Flag any fabricated telemetry as SIMULATED/non-live per AI-quality gates.
2. **SLICE 3 — Procurement** (already strong real backend): connect `TenderStudio` to fully drop `TenderMockData` for the evaluation path.
3. **Command Center**: replace SCADA-as-LIVE jitter with an explicitly-labelled simulation provider (no fabricated `freshness:'LIVE'`).
4. Global shell / Mission Control / Agent OS / Knowledge Graph / Digital Twin polish (already substantially done).

## P1-B — AUTONOMOUS INFRASTRUCTURE
1. **R-006** Mount `backend/event-fabric/` (REST + WS/SSE); bridge `LoopEventSystem` → event fabric.
2. **R-007** Persist Knowledge Graph + Digital Twin + procurement entities to SQLite.
3. **R-008** Adopt canonical DETECTED→…→LEARNED lifecycle in the autonomous engine(s) + surface trace in UI.
4. **R-005** Make AI `stream()`/`embed()` fallbacks explicit and guarded (surface SIMULATED state; no silent fake vectors).
5. **R-009** Converge in-memory stores on SQLite + Redis with replayable events.

## P2 — SCALE
1. **R-010** Prisma migrations + reconcile Postgres as runtime source of truth.
2. **R-011** OpenTelemetry + distributed trace propagation.
3. **R-012** Fix + mount Planning Engine.
4. Real providers (Gemini etc.) enabled behind keys; richer analytics; remaining modules; real vector memory.

## Definition of Done (per item)
A capability is done only when: UI + API + Service + Persistence + Graph relationship + AI (where applicable) + Agent (where applicable) + Workflow/Event (where applicable) + AuthN + AuthZ + Audit + Observability + Error handling + Tests + Build + Runtime verification + Stakeholder UX. "Looks finished" or "code exists" or "build passes" alone is NOT done.

## Continuous loop
After every meaningful change:
```
TYPECHECK → LINT → UNIT → INTEGRATION → BUILD → START → HEALTH → API → UI → LOG
```
Classify failures; on failure follow the self-healing loop (CAPTURE → CLASSIFY → LOCATE GRAPH NODE → IDENTIFY DEPENDENTS → PATCH → TEST → REBUILD → VERIFY → UPDATE GRAPH).
