# SALIENCE ATLAS — AUTONOMY TRANSFORMATION ROADMAP

**Version:** 1.0.0 — Executive Implementation Roadmap  
**Target Platform:** Salience Atlas National Intelligence Operating System  
**Deployment Context:** KETRACO National Grid Command Center & Public Procurement Authority  
**Author:** Principal Enterprise AI Architect, Platform SRE & Lead Systems Engineer  
**Date:** Q3 2026  
**Status:** APPROVED FOR ENACTMENT  

---

## 1. Executive Summary

This Roadmap charts the phased engineering transformation of Salience Atlas from its current **Phase 01 Assessment Baseline** (rich frontend domain models with in-memory simulation scaffolding) to a **Production-Grade Autonomous Enterprise AI Operating System**.

The roadmap is governed by the core non-negotiable directive:
**UPGRADE. DO NOT REPLACE. DO NOT RESET. DO NOT REWRITE THE PLATFORM FROM SCRATCH.**

---

## 2. Phased Transformation Schedule

```
                     SALIENCE ATLAS AUTONOMY IMPLEMENTATION TIMELINE
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHASE 01: ASSESSMENT & DISCOVERY (COMPLETED)                                               │
│  • Comprehensive 15-document architectural assessment suite created in docs/architecture/    │
│  • Empirical audit of SQLite 93-table schema, in-memory simulations, and Prisma disconnect  │
│  • Risk register and 24-subsystem readiness matrix established                              │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  PHASE 02: FOUNDATIONAL BRIDGING & CRITICAL DEFECT REMEDIATION (Weeks 1 - 3)                │
│  • Fix broken relative import paths in backend/tests/event-fabric.*.test.ts                 │
│  • Configure unified npm test harness using Node 22 native test runner                      │
│  • Eliminate AgentRegistry Prisma crash by introducing SQLite table registered_agents       │
│  • Mount missing /api/ai/chat and /api/ai/status routes in server.ts                        │
│  • Connect AIFederationService to server-side @google/genai (Gemini 2.5) and local Ollama   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  PHASE 03: PERSISTENCE HARDENING & KNOWLEDGE FABRIC ACTIVATION (Weeks 4 - 6)                │
│  • Persist EventFabric events to SQLite append-only event_ledger table                      │
│  • Persist Knowledge Graph nodes and edges to SQLite kg_nodes / kg_edges tables             │
│  • Connect BaseSCMAgent memory registers to SQLite ai_memory table                          │
│  • Expose Server-Sent Events (SSE) stream at /api/events/stream for real-time SCADA HUD     │
│  • Mount unmounted compliance capabilities from backend/chrome-extension-api.ts             │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│  PHASE 04: AUTONOMOUS AGENT ORCHESTRATION & ZERO-TRUST SECURITY (Weeks 7 - 10)              │
│  • Promote StandardLoopEngine (src/core/loop) to universal execution runtime for all agents │
│  • Replace substring keyword routing with LLM intent classification in SCMOrchestrator     │
│  • Implement real domain tools executing queries against the 93 SQLite tables               │
│  • Migrate static ENTERPRISE_USERS to SQLite users table with bcrypt hashed passwords       │
│  • Enforce strict production JWT secrets and role-based clearance checks (Levels 1 - 4)     │
│  • Expose Prometheus metrics at /metrics and validate CI automated tests                    │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Work Package Breakdowns

### Work Package 1: Test Suite & Tooling Unification (Phase 02)
- **Objective:** Enable automated verification so that every code modification is validated by automated tests.
- **Tasks:**
  1. Update `package.json` with `"test": "tsx --test src/core/**/tests/*.test.ts backend/tests/*.unit.test.ts"`.
  2. Refactor `backend/tests/event-fabric.unit.test.ts` imports from `../../event-fabric/` to `../event-fabric/`.
  3. Migrate tests from `@jest/globals` to standard `node:test` and `node:assert`.
  4. Verify that `npm test` runs and passes across all unit suites.
- **Deliverable:** Green automated test execution pipeline.

### Work Package 2: Real AI Gateway Activation (Phase 02)
- **Objective:** Eliminate the mock `/api/ai` endpoints and connect the frontend Copilot to real inference models.
- **Tasks:**
  1. Add `GeminiProvider` using `@google/genai` (lazy initialized with `process.env.GEMINI_API_KEY`).
  2. Implement `POST /api/ai/chat` and `GET /api/ai/status` in `server.ts` delegating to `AIFederationService`.
  3. Log every inference request, latency, token count, and cost estimate into SQLite `ai_execution_logs`.
  4. Verify that the frontend Copilot chat receives live, context-grounded AI responses.
- **Deliverable:** Live multi-model AI federation handling real user queries.

### Work Package 3: Database & Agent Registry Realism (Phase 02 - 03)
- **Objective:** Eliminate the phantom Prisma dependency and provide real persistence for agents.
- **Tasks:**
  1. Add migration `011_registered_agents` in `backend/database/db-core.ts` creating `registered_agents` table.
  2. Update `backend/agents/registry.ts` to write to `DatabaseCore.getInstance()` instead of calling `this.prisma.agent.upsert()`.
  3. Add `event_ledger`, `kg_nodes`, and `kg_edges` tables to `db-core.ts` for persistent Event Fabric and Knowledge Graph state.
  4. Generate a clean `prisma/schema.prisma` file accurately mirroring the 93 tables in `data/salience_atlas.db`.
- **Deliverable:** 100% crash-free agent registration and persistent graph/event state surviving restarts.

### Work Package 4: Autonomous ReAct Engine Deployment (Phase 04)
- **Objective:** Upgrade simulated agents into true autonomous agents running the `StandardLoopEngine`.
- **Tasks:**
  1. Refactor `backend/agents/instances.ts` to execute `StandardLoopEngine` with dynamic step planning.
  2. Bind real database tools:
     - `GridTelemetryTool`: Queries `twin_telemetry` and `twin_asset_health`.
     - `TenderComplianceTool`: Queries `procurement_case` and `procurement_rules`.
     - `FinanceLedgerTool`: Queries `finance_budgets` and `finance_commitments`.
     - `FleetTrackingTool`: Queries `logistics_fleet` and `logistics_cargo`.
  3. Enforce cryptographic SHA-256 audit log generation for every completed agent plan.
- **Deliverable:** Fully autonomous, verifiable SCM agent workforce.

---

## 4. Governance & Verification Metrics

Every phase must satisfy strict exit criteria before advancing:

| Milestone Gate | Verification Method | Exit Criteria |
|---|---|---|
| **Gate 01: Baseline Reconnaissance** | Audit Document Suite Review | All 15 architecture docs, Roadmap, and Enactment Log complete and committed. |
| **Gate 02: Test & Routing Health** | `npm test` & HTTP probe | All unit tests pass; `/api/ai/chat` and `/api/ai/status` return 200 OK. |
| **Gate 03: State Durability** | Container Restart Test | Container restarted; active events, graph nodes, and agent leases persist from SQLite. |
| **Gate 04: Production Readiness** | End-to-End Task Execution | Copilot executes multi-step ReAct loop; audit signature written to `audit_logs`. |
