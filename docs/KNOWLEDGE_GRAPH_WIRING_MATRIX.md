# Knowledge Graph UI → Backend Wiring Matrix

**System**: Salience Atlas Enterprise Intelligence Platform  
**Subsystem**: Knowledge Graph & Digital Twin Control Plane  
**Specification**: Full Architectural Lineage & Control Execution Mapping  

---

## Complete Control Execution Matrix

The following matrix documents every interactive control, button, input field, tab, inspector tool, and intelligence trigger present on the Knowledge Graph interface, tracing its end-to-end execution path from the frontend UI handler down to the underlying database, authorization guard, audit log, and event fabric emission.

| # | UI Control | Frontend Handler | API Endpoint | Service Method | Data Source | Auth Guard | Audit Requirement | Event Emission | UI State Update |
|---| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Search Bar & Search Button** | `handleSearch()` in `RelationshipExplorer` | `GET /api/v3/graph/search?q=:q` | `KnowledgeGraphService.search()` | SQLite `graph_nodes` & In-Memory Map | RBAC: `read:graph` | Log Search Query | `GRAPH_SEARCH_EXECUTED` | Updates `nodes` & `edges` state, re-renders D3 force graph canvas |
| **2** | **D3 Node Selection Click** | `node.on('click')` in `RelationshipExplorer` | `GET /api/v3/graph/traverse/:id?depth=1` | `KnowledgeGraphService.traverse()` | In-Memory Graph Map | ABAC: `tenantId` match | Log Entity Access | `ENTITY_INVESTIGATED` | Sets `selectedNode`, opens right-side Node Inspector drawer |
| **3** | **Expand Neighborhood** | `handleExpandNeighborhood()` in `RelationshipExplorer` | `GET /api/v3/graph/traverse/:id?depth=2` | `KnowledgeGraphService.traverse()` | In-Memory Graph Map | RBAC: `read:graph` | Log Neighborhood Expansion | `GRAPH_NEIGHBORHOOD_EXPANDED` | Merges new nodes & edges into graph state without page reload |
| **4** | **Analyze Risks (Node Inspector)** | `handleAnalyzeRisks()` in `RelationshipExplorer` | `GET /api/v3/graph/impact/:id` | `KnowledgeGraphService.findImpact()` | In-Memory Graph Map | RBAC: `read:risk` | Log Risk Analysis | `RISK_PROPAGATION_ANALYZED` | Opens Risk Intelligence panel showing connected risk nodes & impact score |
| **5** | **View Digital Twin (Node Inspector)** | `handleViewDigitalTwin()` in `RelationshipExplorer` | `GET /api/v3/twin/:type/:id` | `DigitalTwinService.generate*Twin()` | In-Memory Graph + SCADA/GIS | RBAC: `read:twin` | Log Twin Inspection | `TWIN_STATE_ACCESSED` | Switches active view tab to corresponding Digital Twin (Supplier/Tender/Org) |
| **6** | **Trace Path Tool** | `handleFindPath()` in `RelationshipExplorer` | `GET /api/v3/graph/path?from=:from&to=:to` | `KnowledgeGraphService.findPath()` | BFS Graph Traversal Engine | RBAC: `read:graph` | Log Pathfinding Query | `PATH_ANALYZED` | Renders path sequence or displays "NO VERIFIED PATH FOUND" banner |
| **7** | **Layer Filters (Checkboxes)** | `handleToggleLayer()` in `RelationshipExplorer` | Client-side Canvas Filter | N/A (State Filter) | Active Canvas Graph State | N/A | None | `LAYER_FILTER_TOGGLED` | Filters SVG node/edge elements by node category (`SUPPLIER`, `TENDER`, `RISK`, etc.) |
| **8** | **Focus Node** | `handleFocusNode()` in `RelationshipExplorer` | D3 Zoom Transform | N/A | Active Canvas Graph State | N/A | None | `GRAPH_NODE_FOCUSED` | Smoothly pans & zooms SVG viewport to center selected node |
| **9** | **Isolate Neighborhood** | `handleIsolateNode()` in `RelationshipExplorer` | Client-side Subgraph Filter | `KnowledgeGraphService.traverse()` | In-Memory Graph Map | RBAC: `read:graph` | Log Isolation View | `GRAPH_ISOLATED` | Temporarily hides all nodes outside 1-hop neighborhood of selected node |
| **10** | **Reset View** | `handleResetView()` in `RelationshipExplorer` | Client-side State Restore | `KnowledgeGraphService.getGraph()` | Full Canonical Graph | N/A | None | `GRAPH_VIEW_RESET` | Restores full graph state, clears search/isolation filters, resets D3 zoom |
| **11** | **Run Collusion Intelligence Scan** | `handleRunCollusion()` in `ProcurementGraphCenter` | `GET /api/v3/collusion/analyze` | `CollusionDetectionEngine.analyzeCollusion()` | In-Memory Graph Map | RBAC: `read:fraud_audit` | Log Audit Scan | `COLLUSION_SCAN_EXECUTED` | Opens Collusion Findings drawer with shared director & IP analysis |
| **12** | **Traverse Entity Graph** | `handleTraverseGraph()` in `ProcurementGraphCenter` | `GET /api/v3/graph/traverse/ent-ketraco?depth=2` | `KnowledgeGraphService.traverse()` | In-Memory Graph Map | RBAC: `read:graph` | Log Traversal Query | `GRAPH_TRAVERSED` | Resets graph focus to central organization node & expands 2-hop graph |
| **13** | **Supplier Twin Tab** | `setActiveTab('supplier')` in `ProcurementGraphCenter` | `GET /api/v3/twin/supplier/:id` | `DigitalTwinService.generateSupplierTwin()` | SQLite + GIS + SCADA | RBAC: `read:supplier` | Log Twin Access | `SUPPLIER_TWIN_VIEWED` | Renders Supplier Digital Twin (Ownership, active bids, compliance, risk flags) |
| **14** | **Tender Twin Tab** | `setActiveTab('tender')` in `ProcurementGraphCenter` | `GET /api/v3/twin/tender/:id` | `DigitalTwinService.generateTenderTwin()` | SQLite + PPADA Rules | RBAC: `read:tender` | Log Twin Access | `TENDER_TWIN_VIEWED` | Renders Tender Digital Twin (Timeline, bidders, legal knowledge graph) |
| **15** | **Organization Twin Tab** | `setActiveTab('organization')` in `ProcurementGraphCenter` | `GET /api/v3/twin/organization/:id` | `DigitalTwinService.generateOrganizationTwin()` | SQLite + Enterprise Metrics | RBAC: `read:organization` | Log Twin Access | `ORG_TWIN_VIEWED` | Renders Procuring Entity Digital Twin (Departmental workload, cycle times) |
| **16** | **Agent Pulse Toggle** | `setAgentsOpen()` in `ProcurementGraphCenter` | SSE Stream Listener | `EventBus.subscribe()` | Real-Time Telemetry Stream | RBAC: `read:telemetry` | None | `AGENT_PULSE_TOGGLED` | Expands bottom rail showing live agent health, memory load & task logs |

---

## Behavioral Rules & Enforcement

1. **Zero Fake Success**: If an endpoint returns an error, the UI displays an explicit error state (`AtlasErrorState`) with actionable diagnostics.
2. **Zero Dead Buttons**: Every button attached to an interactive capability invokes a typed handler or exhibits a clear disabled state with tooltip explanation when unavailable.
3. **No Unchecked State Mutations**: All graph manipulations perform authorization check before rendering data to client.
