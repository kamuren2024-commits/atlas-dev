# Atlas Architecture Map

## Current runtime topology

```text
React/Vite UI
  -> src/App.tsx, src/components, src/context, src/design-system
  -> fetch clients and feature services
Express server
  -> security/config bootstrap
  -> domain services and backend routers
  -> SQLite evaluation bootstrap, Redis service, optional PostgreSQL Prisma path
  -> Vite middleware (development) or dist static serving (production)
Shared platform contracts
  -> packages/domain, contracts, graph-schema, security, observability, ai, ui
Platform runtimes
  -> backend/agents, ai-federation, ai-runtime, event-fabric, mission-engine,
     planning-engine, observability, data-fabric, integration
Legacy/core runtimes
  -> src/core/agents, loop, memory, workflow
```

## Node map

| Node class | Current locations | Role |
|---|---|---|
| User/tenant | `src/context/TenantContext.tsx`, `backend/security` | Tenant selection, permissions, identity/security |
| UI shell | `src/components/shell`, `src/App.tsx` | Navigation and mission entrypoints |
| Mission UI | `src/components/ketraco`, `src/components/logistics`, `src/components/intelligence` | Domain workspaces |
| API host | `server.ts` | Bootstrap, middleware, routes, static serving |
| Domain services | `services/*`, `backend/domains/*`, `backend/finance` | Ingestion, graph, risk, workflow, operations, finance, logistics |
| AI platform | `backend/ai-federation`, `backend/ai-runtime`, `utils/ai.ts` | Provider routing, model/prompt registry, AI calls |
| Agent platform | `backend/agents`, `src/core/agents` | Registration, lifecycle, health, orchestration |
| Loop/workflow | `src/core/loop`, `src/core/workflow`, `backend/mission-engine`, `backend/planning-engine` | Plan/execute/verify/reflection and orchestration |
| Graph/twin | `packages/graph-schema`, `services/graph`, `backend/evaluation/knowledge-graph`, `backend/evaluation/digital-twin-service` | Relationships, traversal, digital-twin operations |
| Data stores | `data/salience_atlas.db`, Prisma schema, Redis service | Evaluation persistence, relational target, queues/cache |
| Events | `packages/contracts`, `backend/event-fabric`, `src/core/loop/events` | Domain and loop event propagation |

## Key architectural observations

1. The platform has multiple valid-looking abstractions for agents, workflows, events, and graph services. Phase 1 must select ownership and define adapters rather than add another abstraction.
2. `server.ts` is a large composition root and currently exposes the dependency graph directly. Splitting it should be incremental and route-compatible.
3. The protected Command Center has both logistics and KETRACO grid implementations. They should share contracts, not be visually or behaviorally rewritten.
4. The canonical ontology is currently distributed among Prisma models, domain constants, evaluation entities, and graph schema. [`ONTOLOGY.md`](ONTOLOGY.md) defines the consolidation target.
