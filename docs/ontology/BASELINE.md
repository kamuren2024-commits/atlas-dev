# Ontology & Knowledge Graph Baseline

## 1. Executive summary

This repository contains both a durable SQLite-backed persistence layer and a separate in-memory graph service. The durable layer is real and exercised by tests; the live graph API surfaces are currently being fed by an in-memory graph seeded with fixture-like data. This makes the system partially production-capable, but not yet a single canonical source of truth for ontology/graph state.

This document records the current evidence-based baseline and the initial P0/P1 candidates that should be addressed before claiming production readiness.

## 2. Repository forensics

- Branch: `main`
- Latest HEAD: `116a38e` — `Add National Grid GIS Phase IX report and update meeting intelligence APIs`
- Upstream: `origin/main`
- Working tree state: dirty, with uncommitted changes in `backend/config/index.ts`, `backend/security/cryptography-service.ts`, `backend/security/identity-service.ts`, `backend/security/secrets-manager.ts`, `src/core/shared/crypto.ts`, `vite.config.ts`, and a new test file `backend/tests/security-secrets.test.ts`.
- Package manager: npm-based; `package.json` contains Vite, TypeScript, tsx, sqlite3, and Prisma dependencies.
- Runtime/toolchain: TypeScript `~5.8.2`, Vite `^6.2.3`, React `^19.0.1`, Node type definitions `@types/node` `^22.14.0`; `tsconfig.json` targets `ES2022` and uses the browser bundle configuration.

## 3. Verified component inventory

| Classification | Component | Evidence | Assessment |
|---|---|---|---|
| VERIFIED_REAL | SQLite database core and migrations | `backend/database/db-core.ts` creates `data/salience_atlas.db` and runs migrations. | Real durable persistence is present and is intentionally enforced in production mode. |
| VERIFIED_REAL | Persistent graph engine | `backend/graph/persistent-graph.ts` implements `upsertNode`, `upsertEdge`, traversal, shortest-path, and collision logic against `graph_nodes` / `graph_edges`. | This is the strongest durable graph implementation in the repo. |
| VERIFIED_REAL | Canonical ontology schema engine | `backend/ontology/canonical-ontology.ts` writes to `ontology_schemas`, `ontology_entities`, `ontology_relationships`, and `ontology_actions_audit`. | The canonical ontology abstraction exists and is backed by SQLite. |
| VERIFIED_REAL | Graph API wiring | `server.ts` mounts production routers under `/api/finance`, `/api/logistics`, `/api/project-supply`, and `/api/procurement`. | The platform exposes graph-aware routes in actual Express middleware. |
| PARTIALLY_IMPLEMENTED | Ontology coverage | `CanonicalOntologyEngine.seedCanonicalSchemas()` seeds a subset of entity schemas and states that it is the canonical 54-entity runtime contract. | The code declares a broader ontology than it currently seeds and validates in runtime. |
| SIMULATED_OR_FIXTURE_BACKED | In-memory graph service | `backend/evaluation/knowledge-graph.ts` calls `seedInitialGraph()` in the constructor and populates `Map` instances with hardcoded nodes such as `ent-ketraco`, `supplier-shanghai`, and `risk-shipment-delay`. | This graph is effectively fixture-backed and not source-driven from the durable graph layer. |
| VOLATILE_OR_NON_DURABLE | Live graph API service | `KnowledgeGraphService` maintains `private nodes: Map<string, GraphNode>` and `private edges: Map<string, GraphEdge>` and `getGraph()` returns arrays created from those in-memory maps. | A process restart clears the authoritative graph state unless it is rehydrated from a durable source. |
| DEAD_OR_DUPLICATED | Competing graph stores | `KnowledgeGraphService`, `PersistentKnowledgeGraph`, and `OntologyStore` each maintain graph/ontology state in different ways and are not clearly reconciled. | There is no single canonical graph state layer, which increases drift risk. |
| MISSING | Reconciliation pipeline | No code path was identified that loads the durable `graph_nodes` / `graph_edges` state into the live `KnowledgeGraphService` graph or syncs the two on mutation. | Runtime behavior is vulnerable to split-brain state between the in-memory and durable layers. |

## 4. Evidence from the codebase

### 4.1 Durable graph persistence is real

`backend/graph/persistent-graph.ts` is a concrete, SQLite-backed implementation. It stores and retrieves nodes and edges using `DatabaseCore` and uses `graph_nodes` and `graph_edges` tables.

Key evidence:

- `upsertNode()` writes to `graph_nodes` with `node_id`, `node_type`, `name`, `metadata_json`, `tenant_id`, `created_at`, and `updated_at`.
- `upsertEdge()` writes to `graph_edges` with `edge_id`, `from_node`, `to_node`, `relation`, `weight`, and metadata.
- `getEdges()`, `traverse()`, and `findShortestPath()` operate on the durable SQL-backed state.
- `backend/tests/run-tests.ts` asserts that `graph_nodes`, `graph_edges`, and related ontology tables exist and validates shortest-path traversal.

### 4.2 The live graph API is seeded from memory, not from durable storage

`backend/evaluation/knowledge-graph.ts` contains a `KnowledgeGraphService` singleton that instantiates state in memory and calls `seedInitialGraph()` from the constructor.

The seed data includes explicit fixture values such as:

- `ent-ketraco`
- `tender-2026-08`
- `supplier-shanghai`
- `supplier-siemens`
- `risk-shipment-delay`

The same file exposes `getGraph()` as a direct snapshot of the `Map` state, and `createV3ApiRouter()` in `backend/evaluation/v3-routes.ts` wires `/api/v3/graph` and `/api/knowledge-graph` to that memory-backed implementation.

### 4.3 The application mounts graph-aware routes against the memory graph

`server.ts` initializes:

- `const kgService = KnowledgeGraphService.getInstance();`
- `const kg = kgService.getGraph();`

It then mounts:

- `app.use('/api/finance', createFinanceApiRouter({ db, kg: kg as any, authz, audit }))`
- `app.use('/api/logistics', createLogisticsApiRouter({ db, kg: kg as any, authz, audit }))`
- `app.use('/api/project-supply', createProjectSupplyApiRouter({ db, kg: kg as any, authz, audit }))`
- `app.use('/api/procurement', createProcurementApiRouter({ db, kg: kg as any, authz, audit }))`

This means the production API layer is currently consuming a graph snapshot that is not reconciled with the durable SQLite graph engine.

## 5. P0/P1 baseline candidates

### P0 — Graph state drift between durable and in-memory engines

- File: `backend/evaluation/knowledge-graph.ts`, `backend/graph/persistent-graph.ts`, `server.ts`
- Observed behavior: the runtime graph API and the durable graph DB are separate implementations; the API layer uses the in-memory graph, while tests validate the durable graph separately.
- Reproduction evidence: `KnowledgeGraphService` uses `Map<string, GraphNode>` and `Map<string, GraphEdge>` instead of the durable DB. `PersistentKnowledgeGraph` writes to SQLite but is not used by the live API server.
- Impact: graphs can diverge across API calls, restarts, or adjacent domain routers. A graph can appear to be live while the authoritative persistent graph is stale or empty.
- Confidence: High

### P0 — Fixture-backed graph is presented as live canonical graph data

- File: `backend/evaluation/knowledge-graph.ts`
- Observed behavior: `seedInitialGraph()` creates a fixed graph with synthetic enterprise identities and relationships;
  the constructor runs automatically on singleton creation.
- Reproduction evidence: nodes/edges are hardcoded in `seedInitialGraph()` and labeled with `atlas-seed-adapter` provenance. There is no code path that loads from the canonical database or external source before the graph is returned.
- Impact: a demo graph can be mistaken for production truth, especially in UI and graph analytics flows.
- Confidence: High

### P1 — Canonical ontology contract is smaller than the declared runtime contract

- File: `backend/ontology/canonical-ontology.ts`
- Observed behavior: the file header describes a canonical 54-entity / 65+ relationship runtime contract, but the actual `canonicalSchemas` array seeds only a small set of example entities (`Substation`, `TransmissionLine`, `Transformer`, `Tender`, `Supplier`, `Contract`, `BudgetLine`, etc.).
- Reproduction evidence: the list is limited and does not reflect the full declared enterprise ontology contract.
- Impact: partial schema coverage can produce inconsistent node typing, edge validation gaps, and migration surprises.
- Confidence: Medium

### P1 — No explicit reconciliation or ownership boundary between graph stores

- File: `backend/evaluation/knowledge-graph.ts`, `backend/graph/persistent-graph.ts`, `platform/persistence/index.ts`
- Observed behavior: multiple persistence adapters (`DatabaseCore`, `OntologyStore`, `PersistentKnowledgeGraph`) define graph and ontology storage patterns without one canonical owner or sync contract.
- Reproduction evidence: `OntologyStore` writes to `ontology_entities` and `ontology_relationships`, while `KnowledgeGraphService` serves the live graph from memory, and the persistent graph engine is a separate singleton.
- Impact: there is no clear authority for what is canonical, which entities are authoritative, or how updates propagate between layers.
- Confidence: Medium

## 6. Operational assessment

### Verified facts

- SQLite persistence and schema tooling are present and active.
- There are concrete graph and ontology storage abstractions built on SQLite.
- There are graph-aware routes in the Express server.
- Tests validate database schema presence and persistent graph operations.

### Hypotheses requiring confirmation before production claims

- The live graph API is currently a fixture-backed runtime slice rather than the authoritative persistent graph.
- The in-memory graph is intended as a cache or projection, but that contract is not explicitly enforced or documented.
- The canonical ontology engine and the durable graph are expected to converge, but no mechanism was found that ensures that convergence.

## 7. Baseline conclusion

The repository is not yet a single, durable, canonical ontology/knowledge graph implementation. It contains the ingredients for a durable graph and ontology architecture, but the live graph API surfaces are materially separate from the SQLite-backed graph store and are seeded with hardcoded data. The repo should therefore be classified as:

- VERIFIED_REAL: SQLite persistence and durable graph/ontology tables
- PARTIALLY_IMPLEMENTED: canonical ontology coverage and reconciliation layer
- SIMULATED_OR_FIXTURE_BACKED: in-memory graph state and seed graph used by the live API
- VOLATILE_OR_NON_DURABLE: live graph API state in memory
- DEAD_OR_DUPLICATED: multiple graph/ontology ownership patterns without clear canonical reconciliation

This is the correct baseline for any subsequent production-hardening effort. The system is not yet production-ready as a single source of truth for ontology or graph state.
