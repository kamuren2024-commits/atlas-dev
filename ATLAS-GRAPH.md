# SALIENCE ATLAS — MASTER IMPLEMENTATION GRAPH

> Live dependency + status map. Status legend:
> - **GREEN** = implemented + verified live
> - **AMBER** = partially implemented (in-memory / unwired / some mocked outputs)
> - **RED** = missing / broken / stub / unguarded
> - **BLUE** = architectural dependency (implemented but not yet connected to traffic)
> - **PURPLE** = AI capability (real when a provider key is configured)
>
> This graph maps every capability to its layers (UI → API → Service → Data → Graph → AI → Agent → Workflow → Event → Memory → Governance → Observability → Test). A missing edge is flagged.

---

## 1. Cognitive Fabric (shared platform capabilities)

### A. Knowledge Graph / Ontology
| Capability | UI | API | Service | Data | Graph | Verified |
|-----------|----|-----|---------|------|-------|----------|
| Graph query/traverse | RelationshipExplorer, ProcurementGraphCenter | `/api/v3/graph*` | `KnowledgeGraphService` (`backend/evaluation/knowledge-graph.ts`) | in-memory Map (14 nodes/11 edges seeded) | node/edge types via `packages/graph-schema` (55 node / 35 edge types) | **GREEN** (live) |
| Impact analysis | AtlasModuleWorkspace | `/api/v3/graph/impact/:id` | KG service | in-memory | — | GREEN |
| Collusion detection | (via graph) | `/api/v3/collusion/analyze` | KG service | in-memory | — | GREEN |
| Traversal typed schema | — | — | — | — | `GRID_GRAPH_NODE_TYPES`/`EDGE_TYPES` | GREEN (schema) |
| Ontology engine | — | — | `platform/ontology/OntologyEngine.ts` | — | — | **BLUE/RED** (stub, unwired) |
| Persistent graph store | — | — | — | — | pg / dedicated graph DB | **RED** (memory only) |

### B. Digital Twin
| Capability | UI | API | Service | Data | Verified |
|-----------|----|-----|---------|------|----------|
| Entity twin | Supplier/Tender/Org twin views, ScmDigitalTwin | `/api/v3/twin/*` | `DigitalTwinService` | `DigitalTwinRegistry` (in-memory, 3 entities) | **GREEN** (live API, **AMBER** data) |
| Telemetry/history | ScmDigitalTwin (hardcoded) | `/api/scm/fabric/digital-twin/*` | fabric registry | in-memory | **AMBER** (hardcoded observable) |
| Grid digital twin | GridDigitalTwin3D | (local) | `SimulationDataProvider` | `grid-canonical-data.ts` | **RED/mock** (SCADA presented as LIVE) |

### C. AI Federation / Agent OS
| Capability | UI | API | Service | Data | Verified |
|-----------|----|-----|---------|------|----------|
| Provider abstraction | AIRuntimeDashboard | `/api/ai/runtime*`, `/api/ai` | `ModelRouter` + AIGateway | env-backed registry | **GREEN/PURPLE** |
| Provider failover | — | `/api/ai` | ModelRouter | — | GREEN |
| **Silent stream()/embed() mocks** | any streaming UI | — | gemini/groq/etc adapters | — | **RED — PRODUCTION MOCK** |
| Agent registry | AIOpsCenter | `/api/scm/fabric/health` | `AgentRegistry` (`backend/agents/registry.ts`) | in-memory + Redis | GREEN |
| Agent reasoning (real) | ScmCopilot, AgentPlatform | `/api/scm/orchestrate` | SCMOrchestrator | — | **AMBER** (deterministic/hardcoded reasoning) |

### D. Workflow / Event Fabric
The canonical **DETECTED→CLASSIFIED→…→LEARNED** lifecycle is **NOT present anywhere**. 
| Capability | UI | API | Service | Verified |
|-----------|----|-----|---------|----------|
| AutonomousProcurementEngine loops | TenderStudio, DecisionApprovalCenter | `/api/scm/procurement-intelligence*` | `backend/agents/procurement-engine.ts` | **GREEN loop** (in-memory), AMBER lifecycle |
| AutonomousWorkflowEngine | AgentPlatform | `/api/scm/fabric/workflows*` | `backend/agents/fabric.ts` | **AMBER** (2 hardcoded workflows) |
| **Event Fabric (full)** | (none — not surfaced) | `backend/event-fabric/` (unwired) | `InMemoryEventStore`, WS/SSE | **BLUE — not mounted** |
| LoopEventSystem | (in-memory pub/sub) | — | `backend/loop/` | GREEN (in-memory) |
| Temporal / durable workflows | — | — | — | **RED — absent** |

### E. Memory Architecture
| Kind | UI | Service | Data | Verified |
|------|----|---------|------|----------|
| SHORT / EPISODIC / SEMANTIC / PROCEDURAL / OPERATIONAL split | — | `src/core/memory/` | in-memory + Redis | **AMBER** (types + logic real; persistence in-memory) |
| Vector/embedding retrieval | KnowledgeCortex, RAG | `EnterpriseKnowledgeRetrieval` | 5 hardcoded docs; `embed()` fake vector | **RED — mock** |

### F. Governance Graph
| Capability | UI | API | Service | Verified |
|-----------|----|-----|---------|----------|
| Approval gates (HITL) | DecisionApprovalCenter | `/api/scm/human-oversight*` | `GovernanceManager` | **AMBER** (2 hardcoded, in-memory) |
| RBAC/ABAC core | — | — | `platform/Governance.ts` `AuthorizationService` | **GREEN core** |
| Route-level enforcement | — | — | guards in server.ts | **RED on /api/v3 /api/v4 /api/platform /api/drone /api/inventory** |

### G. Observability
| Capability | UI | API | Service | Verified |
|-----------|----|-----|---------|----------|
| correlationId middleware | — | — | `ApiGatewayMiddleware.correlationId` | GREEN |
| Telemetry metrics | AIOpsCenter, AIRuntimeDashboard | `/api/ai-federation/telemetry`, `/api/ai/runtime*` | `AIOperationsCenter` | GREEN (in-memory) |
| Audit logger | AdministrationOS | `/api/auth/security-audit` | `backend/observability/audit-logger.ts` | **RED — stub** |
| OpenTelemetry | — | — | — | **RED — absent** |

---

## 2. The three Stakeholder Vertical Slices

### SLICE 1 — SUPPLY INTELLIGENCE ✅ (priority target)
```
Supplier Event → Risk Detection → Knowledge Graph → AI Investigation → Recommendation → Approval → Workflow → Result
```
| Edge | Layered via | Live? |
|------|-------------|-------|
| UI | SupplierIntelligence / Supply Nexus (transformed) | frontend wiring in progress |
| API | `/api/scm/procurement-intelligence/entities` (+ gates, + logs) | **GREEN** |
| Service | `AutonomousProcurementEngine` (real reasoning cycles) | **GREEN** |
| Data | in-memory entity Map (19 entities) | **AMBER** (not persisted) |
| Graph | `KnowledgeGraphService` (supplier ↔ equals ↔ risk) | GREEN |
| AI | ModelRouter / Gemini when key present | **PURPLE** |
| Agent | procurement/risk agents + governance gates | AMBER |
| Workflow | autonomous reasoning loop | GREEN loop / AMBER lifecycle |
| Event | `LoopEventSystem.publish` | GREEN |
| Memory | in-memory | AMBER |
| Governance | approval gates | AMBER |
| Observability | execution logs | GREEN |

### SLICE 2 — ASSET INTELLIGENCE
`Asset Signal → Digital Twin → Anomaly → Graph Dependencies → AI Prediction → Maintenance → Work Order → Verification`
- Twin + graph APIs live (GREEN); telemetry/anomaly/prediction data **mocked** (RED); work-order lifecycle lives only in `MissionState` (drone-flavored), not unified.

### SLICE 3 — PROCUREMENT
`Tender → Supplier Data → Evaluation → Risk Intelligence → AI Analysis → Human Review → Decision → Audit`
- Evaluation engine pipeline **GREEN and REAL** (`/api/evaluation/*`, `/api/v2/evaluation/*`); **strongest real backend**; audit persisted to SQLite. This is the most complete vertical slice today.

---

## 3. Cross-cutting missing edges
1. No unified **DETECTED→…→LEARNED** workflow lifecycle (every engine uses its own bespoke state machine).
2. No **durable event fabric** mounted (event-fabric is dead code).
3. **RAG/embedding** returns fabricated vectors — corrupts any semantic search/graph ranking.
4. **RBAC** not enforced on 5 route namespaces.
5. **Audit logger** is an interface stub.
6. No **OpenTelemetry**; no per-request trace across UI→API→Agent→Model→Tool→DB.
7. 15+ in-memory stores not persisted → **no crash-consistent enterprise state**.
