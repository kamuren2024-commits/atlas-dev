# Technical Debt Register

## 1. Scope

This register distinguishes verified findings from hypotheses and tracks the graph/ontology debt that materially affects production readiness.

## 2. Verified P0 / P1 findings

| ID | Severity | Status | Component | Evidence | Impact | Confidence |
|---|---|---|---|---|---|---|
| TD-001 | P0 | Verified | `backend/evaluation/knowledge-graph.ts` + `server.ts` + `backend/evaluation/v3-routes.ts` | `KnowledgeGraphService` owns a live in-memory `Map` and `getGraph()` is used by `/api/v3/graph` and by the domain API routers. `PersistentKnowledgeGraph` writes to SQLite separately. | Split-brain graph state; the API sees one graph and durable storage sees another. | High |
| TD-002 | P0 | Verified | `backend/evaluation/knowledge-graph.ts` | `seedInitialGraph()` creates fixed ids such as `ent-ketraco`, `supplier-shanghai`, and `risk-shipment-delay` with `sourceSystem: 'atlas-seed-adapter'`. | Fixture data can masquerade as production graph truth. | High |
| TD-003 | P1 | Verified | `backend/evaluation/v3-routes.ts` + `server.ts` | `/api/v3/graph` and `/api/knowledge-graph` are mounted without auth middleware or tenant checks. | Cross-tenant or unauthenticated access is not blocked on the graph route. | High |
| TD-004 | P1 | Verified | `backend/graph/persistent-graph.ts` | `upsertEdge()` creates missing nodes automatically and does not reject invalid references or prohibited relationship types. | Broken graph integrity and non-authoritative edge creation. | High |
| TD-005 | P1 | Verified | `backend/graph/persistent-graph.ts` + `backend/evaluation/knowledge-graph.ts` | The persistent class and live class are independent singletons with no synchronization or reconciliation contract. | Graph mutation writes are not consistently reflected across the system. | High |
| TD-006 | P1 | Verified | `src/utils/graph-service.ts` | Client fetch helpers return empty arrays/nulls on any non-OK status instead of surfacing a service failure or incomplete graph status. | UI can silently downgrade to false-negative or empty states. | Medium |
| TD-007 | P1 | Verified | `backend/ontology/canonical-ontology.ts` | The class claims a `54 entity / 65+ relationship` runtime contract but the actual `canonicalSchemas` array seeds only a small subset. | Ontology contract mismatch between declared and actual runtime coverage. | Medium |

## 3. Hypotheses requiring Phase 1 proof

| ID | Severity | Status | Component | Evidence | Note |
|---|---|---|---|---|---|
| TH-001 | P2 | Hypothesis | `backend/evaluation/knowledge-graph.ts` + `backend/ontology/canonical-ontology.ts` | There is no reconciliation mechanism between `KnowledgeGraphService` and `CanonicalOntologyEngine`. | Requires definition of the canonical ownership and sync policy. |
| TH-002 | P2 | Hypothesis | Event fabric / graph ingestion path | Event bus and ontology audit logs are emitted but no graph event consumer reconciles them into the authoritative graph. | Requires instrumentation and proof of idempotent event replay. |
| TH-003 | P2 | Hypothesis | `DatabaseCore.runMigrations()` | Full migrations are expensive and not suited for a minimal isolated graph proof harness. | This is an operational concern but not yet a defect in the graph contract itself. |

## 4. Baseline defect summary

The highest-risk defect is the split authority between the live graph API and the durable graph store. Until this is resolved, the system cannot credibly claim a canonical ontology or graph source of truth.

The second critical problem is the fixture-seeded live graph: production routes and UI are reading content generated from a synthetic graph definition rather than the durable store. That directly compromises the integrity of enterprise graph data and any derived risk assessment.

## 5. Phase 1 target area

Phase 1 should focus on a narrowly scoped canonical-authority unification:

- Define a single authoritative graph state owner.
- Reconcile durable graph writes to the live graph service or route the API to the durable service directly.
- Add validation for invalid references and prohibited relationship types.
- Add tenant/auth checks for graph API routes.
- Add idempotent write semantics and atomic mutation protection.
- Write regression tests that fail before the fix and pass after it.
