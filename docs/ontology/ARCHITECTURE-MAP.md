# Graph Architecture Map

## 1. System boundary

The graph and ontology surface is split between three implementations that currently do not share a single authoritative state owner:

1. `backend/evaluation/knowledge-graph.ts` — fixture-seeded in-memory graph service used by the live API routes.
2. `backend/graph/persistent-graph.ts` — SQLite-backed persistent graph engine used by graph tests and durable graph operations.
3. `backend/ontology/canonical-ontology.ts` — SQLite-backed ontology engine that writes canonical ontology records but does not currently reconcile with the live graph service.

The runtime is served by `server.ts` and the versioned graph router `backend/evaluation/v3-routes.ts`.

## 2. Actual call graph

### 2.1 Live graph API path

- `server.ts`
  - `const kgService = KnowledgeGraphService.getInstance();`
  - `const kg = kgService.getGraph();`
- `server.ts` mounts:
  - `app.use('/api/logistics', createLogisticsApiRouter({ db, kg: kg as any, authz, audit }))`
  - `app.use('/api/finance', createFinanceApiRouter({ db, kg: kg as any, authz, audit }))`
  - `app.use('/api/project-supply', createProjectSupplyApiRouter({ db, kg: kg as any, authz, audit }))`
  - `app.use('/api/procurement', createProcurementApiRouter({ db, kg: kg as any, authz, audit }))`
- `server.ts`
  - `const v3GraphRouter = createV3ApiRouter();`
  - `app.use('/api/v3', v3GraphRouter);`
  - `app.use('/api/knowledge-graph', v3GraphRouter);`

This means the production-facing graph route and domain routers read a snapshot from `KnowledgeGraphService` rather than from the durable graph store.

### 2.2 V3 graph router path

- `backend/evaluation/v3-routes.ts`
  - `const kgService = KnowledgeGraphService.getInstance();`
  - `router.get('/graph', ...) => kgService.getGraph()`
  - `router.get('/graph/traverse/:id', ...) => kgService.traverse()`
  - `router.get('/graph/search', ...) => kgService.search()`
  - `router.get('/graph/impact/:id', ...) => kgService.findImpact()`
  - `router.get('/graph/path', ...) => kgService.findPath()`

There is no authentication middleware and no tenant enforcement in the v3 route itself.

### 2.3 Durable graph backend path

- `backend/graph/persistent-graph.ts`
  - `PersistentKnowledgeGraph.getInstance()`
  - `upsertNode()` writes to `graph_nodes`
  - `upsertEdge()` writes to `graph_edges`
  - `getNode()`, `getEdges()`, `traverse()`, `findShortestPath()` query the SQLite DB

This is the only implementation that currently reads and writes graph state to durable storage.

### 2.4 Ontology path

- `backend/ontology/canonical-ontology.ts`
  - `CanonicalOntologyEngine.getInstance()`
  - `seedCanonicalSchemas()` inserts into `ontology_schemas`
  - `upsertEntity()` inserts/updates `ontology_entities`
  - `upsertRelationship()` not directly implemented in this file, but `recordActionAudit()` writes `ontology_actions_audit`

This engine is capable of durable ontology records and action auditing, but it is not wired as the live graph source of truth.

## 3. Storage authority matrix

| Component | Actual storage authority | Persistence | Reads/Writes | Tenant/auth enforcement | Fixture risk |
|---|---|---|---|---|---|
| `KnowledgeGraphService` | In-memory `Map` instance | Non-durable | `getGraph()`, `search()`, `traverse()`, `findImpact()` | None in route layer | High |
| `PersistentKnowledgeGraph` | SQLite `graph_nodes` and `graph_edges` | Durable | Persistent node/edge CRUD and traversal | Not enforced in this class itself | Low |
| `CanonicalOntologyEngine` | SQLite `ontology_*` tables | Durable | Schema/entity/audit records | `checkActionPermission()` only for governed actions | Medium |
| `server.ts` + API routes | Snapshot from `KnowledgeGraphService` | Depends on route input | Graph snapshot passed to domain routers | Domain routers evaluate auth separately | High |

## 4. UI and client integration

- `src/utils/graph-service.ts` fetches from `/api/v3/graph`, `/api/v3/graph/traverse/:id`, `/api/v3/graph/path`, `/api/v3/graph/impact/:id`, and `/api/v3/graph/stats`.
- Error handling in this client layer is fail-open: any non-OK fetch returns empty arrays or nulls, which can silently mask upstream authority or route failures.
- This means a graph route that is backed by fixture data can still appear as valid data to the UI because the client treats empty/fallback responses as a valid absence rather than as service failure.

## 5. Dependency and mutation handling

- There is no graph reconciliation layer between `PersistentKnowledgeGraph` and `KnowledgeGraphService`.
- There is no event-based propagation from durable writes into the in-memory service.
- `KnowledgeGraphService.seedInitialGraph()` populates a synthetic graph with `atlas-seed-adapter` provenance and no source verification gate.
- `PersistentKnowledgeGraph.upsertEdge()` can create unknown endpoints automatically instead of rejecting invalid references; this is the opposite of the expected contract for authoritative graph mutation.
- `CanonicalOntologyEngine.executeGovernedAction()` emits an event to `EventPersistenceManager`, but the live graph route does not use those events to reconcile the service graph.

## 6. Verified facts

- `KnowledgeGraphService` is the live graph used by `server.ts` and `createV3ApiRouter()`.
- `PersistentKnowledgeGraph` is the durable graph backed by SQLite.
- The live graph is seeded with fixture values and is not rehydrated from SQLite.
- The `v3` route is not tenant-scoped or authentication-gated.
- Domain Graph consumers in Finance, Logistics, Project Supply, and Procurement receive a static graph snapshot from `KnowledgeGraphService.getGraph()`, not a synced authoritative graph state.

## 7. Conclusion

The current graph architecture is split-brain: a durable graph store exists, but the live API stack and the domain consumers read a separate in-memory snapshot. That is the main reason the system cannot yet be called a single-source-of-truth ontology/knowledge graph authority.
