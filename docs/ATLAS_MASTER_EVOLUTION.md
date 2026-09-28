# Salience Atlas Master Evolution Ledger

## Phase 0 — Repository Audit and Target Mapping

**Date:** 2026-09-02  
**Scope:** Discovery, mapping, and gap analysis only. No mission module was rebuilt or replaced.

## Executive summary

Salience Atlas is a TypeScript/React/Vite application with an Express backend and a mixed SQLite/PostgreSQL persistence strategy. It already contains meaningful platform foundations: tenant-aware UI navigation, evaluation and procurement services, AI federation/runtime components, agent orchestration, loop/workflow runtimes, event-fabric packages, graph and digital-twin services, finance and logistics APIs, security bootstrap code, and a broad test inventory.

The current maturity is **platform foundation / progressive integration**, not a validated autonomous enterprise platform. The repository contains many architectural shells and service names that are ahead of their verified production contracts. The largest architectural risk is fragmentation: the legacy `src/core` runtimes, `backend/*` platform services, `packages/*` contracts, and `services/*` domain services coexist without a single documented ownership boundary. The second risk is production truthfulness: demo/synthetic data and mocked workers are present and must be clearly separated from live integrations.

The existing Command Center is protected as requested. Phase 0 does not change it.

## Phase 0 evidence

- Frontend composition and tenant modules: [`src/App.tsx`](../src/App.tsx), [`src/context/TenantContext.tsx`](../src/context/TenantContext.tsx)
- Backend composition and route mounting: [`server.ts`](../server.ts)
- Canonical contract candidates: [`packages/contracts/index.ts`](../packages/contracts/index.ts), [`packages/domain/index.ts`](../packages/domain/index.ts), [`packages/graph-schema/index.ts`](../packages/graph-schema/index.ts)
- Shared platform runtimes: [`backend/agents`](../backend/agents), [`backend/ai-federation`](../backend/ai-federation), [`backend/ai-runtime`](../backend/ai-runtime), [`backend/event-fabric`](../backend/event-fabric), [`backend/mission-engine`](../backend/mission-engine), [`src/core`](../src/core)
- Existing graph/twin API client: [`src/utils/graph-service.ts`](../src/utils/graph-service.ts)
- Existing loop engine: [`src/core/loop/engine/loop-engine.ts`](../src/core/loop/engine/loop-engine.ts)
- Existing database models and migration direction: [`prisma/schema.prisma`](../prisma/schema.prisma)
- Existing ADR register: [`docs/adr/README.md`](adr/README.md)

## Architecture scorecard

Scores are Phase 0 evidence estimates, not certification. A score reflects discoverable implementation plus validation evidence in this repository.

| Dimension | Score / 100 | Status | Evidence |
|---|---:|---|---|
| Frontend | 72 | Broad UI coverage; integration consistency unverified | React modules, shell, tenant navigation, Command Center, graph/twin views |
| Backend | 68 | Many services/routes; ownership and contract consistency incomplete | Express composition, domain services, evaluation/finance/logistics APIs |
| Data | 55 | Rich operational schema; canonical cross-domain model incomplete | Prisma schema, SQLite bootstrap, data-fabric directories |
| AI | 60 | Federation, runtime, model/prompt registries exist; provider truth needs validation | `backend/ai-federation`, `backend/ai-runtime`, `utils/ai.ts` |
| Graph | 58 | Graph schema/service and graph UI exist; enterprise-wide adoption incomplete | `packages/graph-schema`, `services/graph`, graph components |
| Workflow | 62 | Loop/workflow engines and queue primitives exist; governance path needs end-to-end proof | `src/core/loop`, `core/workflow`, `backend/mission-engine` |
| Security | 62 | Startup validation, auth, gateway, authorization, and secret scanning exist; route coverage needs audit | `backend/security`, server middleware/bootstrap |
| Observability | 48 | Telemetry/health packages and services exist; unified runtime coverage is not proven | `packages/observability`, `services/telemetry`, agent health |
| Production readiness | 42 | Build/lint scripts and tests exist; live integration and regression evidence are incomplete | `package.json`, repository tests, mocked workers/data |

## P0 blockers

1. **Persistence topology is not yet governed as one contract.** Prisma declares PostgreSQL while the server bootstraps an evaluation SQLite database. Before cross-module writes are introduced, ownership, transaction boundaries, migration policy, and tenant isolation must be made explicit.
2. **Production/demo boundary is not consistently demonstrated.** The server registers workers that only delay and log, and multiple UI/service areas use fixture or synthetic data. The runtime must expose provider/data-source status and label demonstration data.
3. **Cross-module authorization and tenant isolation require a complete route audit.** Security middleware is present, but the Phase 0 evidence does not prove every route and service path enforces tenant-aware authorization.

## Recommended Phase 1

1. Establish one canonical platform boundary and service ownership map.
2. Define and validate tenant context propagation for every API, event, workflow, graph, and persistence operation.
3. Create a canonical entity/relationship adapter layer over existing procurement, logistics, finance, evaluation, and grid records.
4. Standardize event envelope and correlation fields across existing event catalogs and loop events.
5. Add runtime truth indicators for provider, data source, freshness, and synthetic/demo mode.
6. Validate the protected Command Center through integration contracts rather than redesigning it.
7. Run the existing lint/build/test commands and document failures before the first implementation batch.

## Ledger rules

- No module is marked complete without backend, UI, error-state, and validation evidence.
- New work extends existing services and contracts; it does not create parallel AI, graph, identity, workflow, or observability stacks.
- High-risk autonomous actions remain approval-gated.
- This ledger is updated at the end of each validated phase.

## Phase 1 — Architectural Baseline, Platform Contracts & Non-Destructive Integration Foundation

**Date:** 2026-09-02  
**Status:** COMPLETE  
**Scope:** Shared platform foundation, module registry, entity registry, and cross-module contracts

### Phase 1 Summary

The first non-destructive integration batch is complete. Shared platform registries and contracts were added under [`packages/platform/index.ts`](../packages/platform/index.ts), while canonical event metadata was added optionally to the existing event-fabric types. Existing module implementations, routes, databases, providers, workflows, and the Command Center were preserved.

### Files Created

1. [`packages/platform/index.ts`](../packages/platform/index.ts) — Module registry, entity registry, platform contracts
2. [`packages/contracts/atlas-fabric.ts`](../packages/contracts/atlas-fabric.ts) — Canonical identity and event envelope
3. [`docs/atlas/PHASE_1_IMPLEMENTATION.md`](atlas/PHASE_1_IMPLEMENTATION.md) — Phase 1 design and scope
4. [`docs/atlas/PLATFORM_CONTRACTS.md`](atlas/PLATFORM_CONTRACTS.md) — Contract reference
5. [`docs/atlas/MODULE_REGISTRY.md`](atlas/MODULE_REGISTRY.md) — Registered modules
6. [`docs/atlas/CANONICAL_ENTITIES.md`](atlas/CANONICAL_ENTITIES.md) — Entity definitions
7. [`docs/atlas/EVENT_CATALOG.md`](atlas/EVENT_CATALOG.md) — Cross-module events
8. [`docs/atlas/MODULE_COMPATIBILITY_MATRIX.md`](atlas/MODULE_COMPATIBILITY_MATRIX.md) — Integration matrix
9. [`docs/atlas/INTEGRATION_BOUNDARIES.md`](atlas/INTEGRATION_BOUNDARIES.md) — Integration policies
10. [`docs/atlas/PHASE_1_COMPLETION_REPORT.md`](atlas/PHASE_1_COMPLETION_REPORT.md) — Completion report

### Files Modified

1. [`packages/contracts/index.ts`](../packages/contracts/index.ts) — Re-export atlas-fabric contracts
2. [`backend/event-fabric/types.ts`](../backend/event-fabric/types.ts) — Optional Atlas metadata fields on BaseEvent (backward-compatible)

### Contracts Implemented

- Module Registry (5 modules registered)
- Entity Registry (13 entities registered)
- Intelligence Request/Response
- Atlas Context
- Audit Event
- Integration Health
- Event Envelope (tenant-scoped identity, provenance)

### Validation

- ✅ Smoke test: 5 modules loaded, 13 entities loaded
- ✅ Production build passed
- ✅ No breaking changes to existing modules
- ✅ Command Center preserved
- ✅ All existing routes, APIs, services, databases operational

### Preserved Capabilities

- Executive Command Center (operational)
- Procurement Intelligence (operational)
- Logistics Intelligence (operational)
- Inventory Intelligence Hub (operational)
- Enterprise AI & Knowledge (operational)
- All event-fabric patterns (event emission, consumption, correlation)
- All workflow and loop runtimes
- Authentication and authorization
- Database models and migrations
- Express backend and React frontend

### Known Limitations

- Entity adapters deferred to Phase 2
- Event instrumentation deferred to Phase 2
- Graph projection deferred to Phase 2
- Tenant isolation audit deferred to Phase 2

### Recommended Phase 2

1. Implement entity adapters (Supplier, Project, Contract canonical mappings)
2. Instrument existing event emitters with Atlas envelope metadata
3. Validate tenant context propagation across all routes
4. Wire intelligence contracts to existing AI Federation
5. Full regression test and compatibility matrix update
# Phase 2 — Graph and module platform increment

The existing graph service now supports provenance-aware bounded relationship, path, and impact queries. A reusable `atlas-demo` module demonstrates the shared module contract and enterprise UI primitives against actual graph relationships. Existing modules and the protected Command Center remain unchanged.
