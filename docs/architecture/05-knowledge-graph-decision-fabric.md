# 05 — Knowledge Graph & Decision Fabric

**Target System:** Salience Atlas Knowledge Graph, Graph Algorithms & Decision Fabric  
**Scope:** Graph Traversal (BFS), Collusion Detection, Causal Reasoning, Impact Analysis  
**Auditor:** Principal Enterprise AI Architect & Graph Analytics Specialist  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

Salience Atlas positions the **Enterprise Knowledge Graph** as the central nervous system connecting operational telematics, procurement bids, corporate intelligence, and grid contingencies.

An empirical inspection reveals that the platform possesses **genuine, working in-memory graph algorithms** (Breadth-First Search traversal, shortest path calculation, multi-hop impact radius assessment, and bidder collusion detection). These algorithms are accessible via the `/api/v3/graph` endpoints and visualized by the frontend using D3 and custom canvas renderers.

However, the Knowledge Graph is currently **isolated in Node.js process memory** (`KnowledgeGraphService`), seeded with 14 static demo nodes, and only partially populated from the rich 93-table SQLite database.

---

## 2. Graph Service Architecture (`backend/evaluation/knowledge-graph.ts`)

### 2.1 Graph Data Structures
The core graph engine is implemented as a singleton in `KnowledgeGraphService`:
```ts
export class KnowledgeGraphService {
  private static instance: KnowledgeGraphService;
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  ...
}
```
Each node adheres to the `GraphNode` contract (`id`, `type`, `label`, `category`, `properties`, `provenance`).  
Each edge adheres to the `GraphEdge` contract (`id`, `source`, `target`, `type`, `confidence`, `properties`, `provenance`).

### 2.2 Seed Topology (Initial State)
Upon instantiation, `seedInitialGraph()` populates 14 baseline nodes representing key entities in a public power grid procurement tender:
- **Procuring Entity:** `ent-ketraco` (KETRACO)
- **Tender:** `tender-2026-08` (Supply of Conductor Spares)
- **Bidders:** `supplier-shanghai` (Shanghai Grid Metal Corp, IP: 192.168.1.50), `supplier-siemens` (Siemens Energy Ltd, IP: 192.168.1.50)
- **Directors:** `director-liang` (Chinese), `director-jane` (Kenyan)
- **Statutory Rules:** `rule-ppada-71` (Section 71 Mandatory Compliance)
- **Physical Assets:** `contract-suswa-04`, `project-suswa-04`, `shipment-cable-01`, `warehouse-embakasi`, `asset-suswa-transformer`, `risk-shipment-delay`

The edges link the tender to the procuring entity, bidders to shared IP addresses, bidders to common directors, and shipments to delivery warehouses.

---

## 3. Implemented Graph Reasoning Algorithms

The graph service implements algorithmic capabilities across four key operational areas:

```
                            KNOWLEDGE GRAPH REASONING CAPABILITIES
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  1. Breadth-First Traversal (BFS)                                                             │
│  • Endpoint: GET /api/v3/graph/traverse/:id?depth=N                                           │
│  • Traverses outbound and inbound edges to depth N, collecting subgraphs for visualization.   │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│  2. Shortest Path Search (Dijkstra / BFS)                                                     │
│  • Endpoint: GET /api/v3/graph/path?from=A&to=B&depth=N                                       │
│  • Identifies indirect relational bridges (e.g. Director X → Holding Co → Winning Bidder).   │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│  3. Upstream & Downstream Impact Radius                                                       │
│  • Endpoint: GET /api/v3/graph/impact/:id?depth=N                                             │
│  • Traces failure propagation: Delayed Conductor Shipment → Delayed Line Stringing →          │
│    Unavailability of Suswa Transformer → Regional Voltage Stability Degradation.             │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│  4. Anti-Collusion Intelligence Engine                                                        │
│  • Implementation: backend/evaluation/collusion-intelligence.ts                               │
│  • Analyzes graph cliques for shared physical addresses, shared IP subnets, shared corporate  │
│    directors, and correlated bid pricing matrices.                                            │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Empirical Algorithm Verification: Collusion Engine
The `CollusionDetectionEngine` (`backend/evaluation/collusion-intelligence.ts`) demonstrates legitimate algorithmic reasoning:
- **IP Clustering:** Scans bidder nodes for identical `ipAddress` attributes or CIDR ranges. In the seed dataset, `supplier-shanghai` and `supplier-siemens` both exhibit `ipAddress: '192.168.1.50'`, which immediately flags a HIGH-SEVERITY collusion anomaly under PPADA Section 80.
- **Director Overlap:** Traverses bipartite bidder-director subgraphs to discover undisclosed beneficial ownership or cross-board participation.
- **Score Calculation:** Computes a normalized collusion probability score `[0.0, 1.0]` based on weighted indicator thresholds.

---

## 4. Frontend Graph Visualization & Digital Twin Integration

The frontend features several advanced graph exploration interfaces:
1. `src/components/graph/RelationshipExplorer.tsx`:
   Interactive Force-Directed Graph powered by D3.js, rendering node clusters with semantic color codes (Blue = Tender, Emerald = Supplier, Amber = Risk, Violet = Physical Asset).
2. `src/components/ketraco/command-center/GridGraphExplorer.tsx`:
   Command Center modal displaying electrical bus connectivity, line reactances, and substation transformers.
3. `src/components/ketraco/ProcurementGraphCenter.tsx`:
   Dedicated procurement audit workbench rendering tender evidence trees and disqualified bidder nodes.

---

## 5. Architectural Gap: The In-Memory Island Problem

Despite the quality of the graph algorithms, a major architectural gap exists:
- **No Dedicated Graph Database:** There is no Neo4j, Memgraph, or FalkorDB engine deployed. All graph structures reside in Node.js heap memory (`Map<string, GraphNode>`).
- **Graph Ingestion Disconnect:** Although `backend/finance/graph-sync.ts` can ingest rows from SQLite into the graph, this sync process is triggered only by specific manual routes and does not run as a continuous background daemon.
- **Memory Scaling Limits:** An in-memory JavaScript graph with tens of thousands of telemetry points or grid sensor readings will cause Node.js GC pauses and potential V8 heap exhaustion (`FATAL ERROR: Ineffective mark-compacts near heap limit`).

---

## 6. Target Production Strategy

```
                                TARGET GRAPH ARCHITECTURE
┌───────────────────────────────────────────────────────────────────────────────────────────────┐
│  Phase 1 (Immediate Hardening):                                                               │
│  • Persist graph nodes and edges into SQLite tables `kg_nodes` and `kg_edges`.                │
│  • Bootstrapping loads from SQLite rather than static JavaScript array literals.               │
│  • Maintain in-memory LRU cache for high-speed BFS traversals (<10ms).                        │
├───────────────────────────────────────────────────────────────────────────────────────────────┤
│  Phase 2 (Enterprise Graph Scalability):                                                      │
│  • Introduce an embedded or containerized graph store (e.g. Memgraph or SQLite R*Tree/FTS5)   │
│  • Implement automated CDC (Change Data Capture) triggers in SQLite:                          │
│    When a new invoice, shipment, or telemetry alarm is inserted, an edge is emitted           │
│    to the graph bus automatically.                                                            │
└───────────────────────────────────────────────────────────────────────────────────────────────┘
```
