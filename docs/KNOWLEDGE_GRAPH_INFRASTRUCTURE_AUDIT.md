# Knowledge Graph Infrastructure Audit & Technical Reconnaissance

**System**: Salience Atlas Enterprise Intelligence Platform  
**Subsystem**: Knowledge Graph & Digital Twin Control Plane  
**Audit Date**: September 25, 2026  
**Classification Baseline**: ISO/IEC 25010 Enterprise Architecture Verification  

---

## Executive Audit Summary

A comprehensive architectural and infrastructure audit of the Salience Atlas Knowledge Graph was conducted across the frontend application (`src/components/graph`, `src/components/twin`, `src/components/ketraco`), backend routing layer (`server.ts`, `backend/evaluation/v3-routes.ts`), core graph engines (`backend/evaluation/knowledge-graph.ts`, `backend/digital-twin/knowledge-graph-engine.ts`), persistence infrastructure (`data/salience_atlas.db`, `backend/database/migration-012-platform-foundation.ts`), security models (`backend/security/authorization-service.ts`), cryptographic audit ledgers (`immutable-audit-ledger.ts`), and event streaming fabric (`backend/event-fabric/event-bus.ts`).

The Knowledge Graph operates as a **hybrid high-performance in-memory graph engine with persistent relational backing in SQLite (`salience_atlas.db`)**. There are no external native graph databases (e.g. Neo4j, Memgraph) or vector databases installed in the environment; all graph traversals, impact analyses, neighborhood expansions, and BFS pathfinding execute natively in TypeScript memory via indexed Map data structures, backed by durable SQLite tables (`graph_nodes`, `graph_edges`, `ontology_entities`, `ontology_relationships`).

---

## 1. Infrastructure Dependency Classification

Every architectural dependency of the Knowledge Graph has been verified and classified according to its operational state:

| Infrastructure Component | Dependency Target | Operational Classification | Technical Summary & Evidence |
| :--- | :--- | :--- | :--- |
| **Relational Database** | SQLite3 (`data/salience_atlas.db`) / PostgreSQL (Prisma ready) | **REAL & FUNCTIONAL** | `DatabaseCore` singleton handles 13 schema migrations including `migration-012-platform-foundation.ts`. Fallback in-memory persistence operates seamlessly when native bindings are uncompiled. |
| **In-Memory Graph Engine** | TypeScript `Map<string, GraphNode>` / `Map<string, GraphEdge>` | **REAL & FUNCTIONAL** | `KnowledgeGraphService.getInstance()` maintains canonical graph state, supporting `addNode`, `addEdge`, `traverse`, `findPath`, `findImpact`, `getNeighbors`, and `search`. |
| **Graph Database** | Neo4j / Memgraph / Graphology | **MISSING** | No external graph driver libraries exist in `package.json`. Graph traversal is executed in-memory via optimized BFS/DFS algorithms. |
| **Vector Database** | Pinecone / Qdrant / PgVector | **MISSING (SIMULATED SEARCH)** | Entity and relationship search relies on substring text matching across labels and properties metadata. |
| **Digital Twin Topology Engine**| `DigitalTwinService` & `knowledge-graph-engine.ts` | **REAL & FUNCTIONAL** | Transmission grid spatial twin, N-1 contingency simulations, equipment reconciliation across SCADA/GIS/SAP EAM, and Digital Twin synthesis for suppliers, tenders, and organizations. |
| **Collusion Detection Engine** | `CollusionDetectionEngine` (`collusion-intelligence.ts`) | **REAL & FUNCTIONAL** | Graph-based horizontal bidder collusion detection analyzing shared ownership, common directors, matching IP addresses, and bidding pattern anomalies. |
| **Authorization Framework** | `AuthorizationService` (`authorization-service.ts`) | **REAL & FUNCTIONAL** | Combined RBAC + ABAC policy engine enforcing 13 domain roles, multi-tenant boundaries (`tenantId`), Segregation of Duties (SoD), spending approval limits, and security clearances. |
| **Cryptographic Audit Ledger** | `ImmutableAuditLedgerService` & `ontology_actions_audit` | **REAL & FUNCTIONAL** | Immutable block ledger recording graph mutations, entity inspections, sensitive searches, and AI-assisted investigations with SHA-256 block hashing. |
| **Event Streaming Fabric** | `EventBus` (`backend/event-fabric/event-bus.ts`) & SSE `/api/twin/stream` | **REAL & FUNCTIONAL** | Central EventEmitter pub/sub managing 6 default event topics (`telemetry`, `protection`, `alarms`, `outages`, `forecasts`, `incidents`) with real-time SSE client push. |
| **AI Federation Gateway** | `AtlasAiGateway` (`backend/ai-federation/gateway/AtlasAiGateway.ts`) | **REAL & FUNCTIONAL** | Multi-provider AI orchestration supporting Google Gemini & local Ollama models with context grounding, cost tracking, and fallback circuit breakers. |

---

## 2. API Surface Audit

### Mounted Routers
* **`/api/v3/graph`**: Main versioned graph REST API.
* **`/api/knowledge-graph`**: Canonical enterprise alias router mapped directly to the versioned graph controller in `server.ts`.
* **`/api/v3/twin`**: Digital Twin graph synthesis endpoints (`/supplier/:id`, `/tender/:id`, `/organization/:id`).
* **`/api/v3/collusion`**: Collusion intelligence scan engine endpoint (`/analyze`).

### Discovered Route Discrepancies & Resolutions
1. **Unmapped Top-Level Route**: Previously, client calls to `/api/knowledge-graph/*` received Express `404 Endpoint not found`.  
   * **Resolution**: Added `app.use('/api/knowledge-graph', createV3ApiRouter());` in `server.ts` to provide canonical top-level API resolution.
2. **Missing Canonical Rest Endpoints**: Standard REST endpoints like `/entities/:id`, `/neighborhood`, `/stats`, `/ontology`, and `/temporal` were missing from the V3 router.  
   * **Resolution**: Added full REST endpoint implementations in `backend/evaluation/v3-routes.ts`.

---

## 3. Data Storage & Schema Audit

### SQLite Persistence Layer (`migration-012-platform-foundation.ts`)
```sql
CREATE TABLE IF NOT EXISTS graph_nodes (
    node_id TEXT PRIMARY KEY,
    node_type TEXT NOT NULL,
    name TEXT NOT NULL,
    metadata_json TEXT,
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS graph_edges (
    edge_id TEXT PRIMARY KEY,
    from_node TEXT NOT NULL,
    to_node TEXT NOT NULL,
    relation TEXT NOT NULL,
    weight REAL DEFAULT 1.0,
    metadata_json TEXT,
    tenant_id TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_node) REFERENCES graph_nodes(node_id),
    FOREIGN KEY (to_node) REFERENCES graph_nodes(node_id)
);

CREATE TABLE IF NOT EXISTS ontology_entities (
    entity_id TEXT PRIMARY KEY,
    schema_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    name TEXT NOT NULL,
    properties_json TEXT,
    version INTEGER DEFAULT 1,
    tenant_id TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ontology_relationships (
    relationship_id TEXT PRIMARY KEY,
    source_id TEXT NOT NULL,
    target_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    properties_json TEXT,
    tenant_id TEXT NOT NULL
);
```

---

## 4. Operational Risk & Governance Remediation

1. **Zero Mock Policy Enforcement**: Removed offline fallback dummy objects in production execution modes. All responses return live graph nodes from `KnowledgeGraphService`.
2. **Unwired Handler Elimination**: All UI controls in `RelationshipExplorer.tsx`, `ProcurementGraphCenter.tsx`, and Twin views have been wired to backend API handlers or given explicit disabled states when external infrastructure is required.
3. **Audit Trail Guarantee**: Every entity selection, neighborhood expansion, path search, and collusion scan emits an audit log event to `ImmutableAuditLedgerService`.
