# Atlas Dependency Graph

## High-level edges

```text
Tenant/Identity
  -> API Gateway -> Domain APIs -> Domain Services
  -> Authorization -> Agents/Workflows/Actions

Domain Services
  -> Canonical Entity Adapters -> Graph Schema/Knowledge Graph
  -> Event Fabric -> Mission/Workflow/Agent Runtime
  -> Evidence/Audit -> Decision Intelligence

AI Federation/Runtime
  -> Agents, Ask Atlas, prediction and recommendation services

Operational Stores
  -> Integration/Data Fabric -> Canonical Entities
  -> Graph/Digital Twin -> Context and decisions
```

## Direct dependency groups

| Source | Depends on | Risk |
|---|---|---|
| `src/App.tsx` | many KETRACO, logistics, intelligence, shell components | High composition coupling |
| `server.ts` | nearly every backend/package/service boundary | High change blast radius |
| Evaluation services | SQLite bootstrap, rules, evidence, graph/twin/decision services | Medium; persistence boundary must be explicit |
| AI routes | auth gateway, provider loader, model router, audit/cost controls | High; provider and permission truth required |
| Agents | registry/lifecycle/health, orchestration, memory, event streams | Medium; two agent frameworks coexist |
| Workflows/loops | events, termination, checkpoints, telemetry, memory | Medium; event envelope alignment needed |
| Finance/logistics APIs | auth, authorization, domain service, database | Medium; cross-module identifiers not yet canonical |

## Impact map for Phase 1

Any canonicalization change affects:

1. `packages/*` contracts and schemas
2. backend adapters and route payloads
3. event correlation and audit records
4. graph/twin identifiers
5. UI fetch clients and loading/error states
6. workflow and agent context
7. tenant authorization and data migration

## Dependency governance

- `server.ts` remains the composition root until route extraction is validated.
- `packages/*` owns shared contracts; domain services own behavior.
- UI components must consume APIs/contracts, not reach across domain internals.
- Event handlers must be idempotent and carry correlation and tenant context.
