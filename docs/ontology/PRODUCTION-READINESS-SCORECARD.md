# Production Readiness Scorecard

## 1. Scoring rubric

- Score range: 0 to 10 per dimension
- 0 = not implemented or actively contradictory
- 10 = clear evidence of authoritative implementation and recovery behavior
- Unresolved P0 findings override the aggregate result

## 2. Independent dimension assessment

| Dimension | Acceptance criterion | Evidence | Score | Confidence | Unresolved blockers |
|---|---|---|---:|---|---|
| Canonical state authority | There is one authoritative graph/ontology source of truth used by API and domain modules. | `KnowledgeGraphService` and `PersistentKnowledgeGraph` are separate, and the live API reads the memory graph while the durable store is separate. | 2/10 | High | Split-brain state and no reconciliation contract |
| Persistence and restart recovery | Graph writes survive process restart and can be rehydrated from durable storage. | Durable SQLite schema exists in `graph_nodes` / `graph_edges`; however, the live API does not read it. | 6/10 | Medium | Live API not rehydrated from durable source |
| Ontology contract integrity | Ontology schema coverage and relational semantics match the declared runtime contract. | `CanonicalOntologyEngine` describes a broader ontology but seeds only a subset in `canonicalSchemas`. | 4/10 | Medium | Contract gap between declared and implemented registry |
| Entity/relationship consistency | Invalid refs and prohibited types are rejected; duplicate writes are idempotent and atomic. | `PersistentKnowledgeGraph.upsertEdge()` auto-creates nodes and does not validate edge validity. | 3/10 | High | No input validation and no atomic mutation boundary |
| API and module integration | Graph API and domain consumers read the same canonical graph state. | `server.ts` passes `kgService.getGraph()` to finance, logistics, project-supply, and procurement routers; those consumers do not share the durable graph. | 3/10 | High | Live route and durable route diverge |
| Security and tenant isolation | Graph routes enforce auth and tenant boundaries before returning data. | `/api/v3/graph` and `/api/knowledge-graph` are mounted without auth middleware. | 2/10 | High | No tenant isolation on V3 route |
| Event consistency | Graph updates and ontology action events reconcile into a single persisted state. | `CanonicalOntologyEngine` emits events but there is no graph reconciliation consumer or event replay contract. | 4/10 | Medium | Missing durable event-to-graph reconciliation |
| Evidence provenance | Every graph fact includes source, confidence, and lineage metadata. | `KnowledgeGraphService` seed graph uses `atlas-seed-adapter` provenance but no real source lineage; no enforced provenance contract. | 5/10 | Medium | Synthetic source records are treated as effective live evidence |
| Observability and operations | Graph health, persistence mode, and reconciliation status are visible and actionable. | Database health exists in `DatabaseCore`, but graph authority health is not surfaced; no reconciliation metrics exist. | 5/10 | Medium | No graph-authority health path |
| Test coverage and reproducibility | The graph stack has isolated, deterministic regression tests and explicit baseline defect coverage. | The Phase 0 harness exists and reproduces the known defects in a temp DB environment. | 4/10 | High | Defects are reproduced, but production fixes are not yet implemented |

## 3. Aggregate result

- Verified score: 38/100
- Overall readiness posture: Not production-capable for canonical graph authority
- P0 override: Yes, split-brain graph state and fixture-led live graph authority remain unresolved

## 4. Known blockers

1. `KnowledgeGraphService` is authoritative in runtime but not durable.
2. `PersistentKnowledgeGraph` is durable but not selected by the live server routes.
3. Graph route has no auth or tenant enforcement.
4. Invalid edge creation is accepted instead of rejected.
5. The seeded graph is not source-verified and can silently masquerade as production data.

## 5. Phase 1 decision gate

Phase 1 should proceed only with a narrowly defined canonical-authority fix and explicit regression gates for graph validation, auth, and reconciliation.
