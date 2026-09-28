# KETRACO Logistics Intelligence — Master Loop & Graph Engineering Program

## Production Engineering Directive | Phase-Gated | Graph-First | Agentic | Utility-Grade

> **Mission:** Rebuild the Logistics Intelligence capability as a next-generation operational intelligence platform for KETRACO and future public/private utilities. Do not treat this as a conventional SCM/TMS dashboard. Build a real-time logistics operating layer that can **observe → understand → predict → simulate → decide → act → verify → learn**.

---

## EXECUTION SUMMARY

**Start Date:** 2026-09-01  
**Current Phase:** Phase 00 - Baseline Audit (IN_PROGRESS)  
**Target Completion:** 36 phases, incremental  
**Architecture Pattern:** Graph + Digital Twin + Event Fabric + Agent Orchestration

---

## PHASE STATUS LEDGER

| Phase | Domain | Status | Evidence | Score | Blockers | Next |
|-------|--------|--------|----------|-------|----------|------|
| 00 | Baseline Audit | IN_PROGRESS | Inspecting repo structure, no existing logistics module found | 25% | Existing Rules schema requires mapping | Map dependency graph |
| 01 | Ontology | PENDING | — | 0% | — | Build after baseline |
| 02 | Graph Engineering | PENDING | — | 0% | — | Implement after ontology |
| 03 | Digital Twin | PENDING | — | 0% | — | Build after graph |
| 04 | Event/Data Fabric | PENDING | — | 0% | — | Implement after twin |
| 05 | Transportation | PENDING | — | 0% | — | Implement after fabric |
| 06 | Inventory | PENDING | — | 0% | — | Implement after transport |
| 07 | Warehouse | PENDING | — | 0% | — | Implement after inventory |
| 08 | Fleet | PENDING | — | 0% | — | Implement after warehouse |
| 09 | Project Logistics | PENDING | — | 0% | — | Implement after fleet |
| 10 | Supplier Intelligence | PENDING | — | 0% | — | Implement after projects |
| 11 | Disruption & Risk | PENDING | — | 0% | — | Implement after suppliers |
| 12 | What-If Simulation | PENDING | — | 0% | — | Implement after disruption |
| 13 | Decision Engine | PENDING | — | 0% | — | Implement after simulation |
| 14 | Multi-Agent Fabric | PENDING | — | 0% | — | Implement after decisions |
| 15 | Agent Orchestration | PENDING | — | 0% | — | Implement after agents |
| 16 | Governance & Autonomy | PENDING | — | 0% | — | Implement after orchestration |
| 17 | Decision Trace & Audit | PENDING | — | 0% | — | Implement after governance |
| 18 | Command Center UX | PENDING | — | 0% | — | Implement after audit |
| 19 | Graph/Map Visualization | PENDING | — | 0% | — | Implement after command |
| 20 | Operational Data Viz | PENDING | — | 0% | — | Implement after graphs |
| 21 | AI Copilot | PENDING | — | 0% | — | Implement after viz |
| 22 | Integration Fabric | PENDING | — | 0% | — | Implement after copilot |
| 23 | Security & Governance | PENDING | — | 0% | — | Implement after integrations |
| 24 | Observability | PENDING | — | 0% | — | Implement after security |
| 25 | Testing Strategy | PENDING | — | 0% | — | Implement alongside phases |
| 26 | Performance | PENDING | — | 0% | — | Benchmark after testing |
| 27 | Production Hardening | PENDING | — | 0% | — | Before GA |
| 28 | Migration & Compatibility | PENDING | — | 0% | — | Before GA |
| 29 | KPI & Value Engine | PENDING | — | 0% | — | Before GA |
| 30 | Platformization | PENDING | — | 0% | — | Before GA |
| 31 | Documentation as Code | PENDING | — | 0% | — | Continuous |
| 32 | Loop Engineering | PENDING | — | 0% | — | Framework |
| 33 | Graph Engineering Loop | PENDING | — | 0% | — | Framework |
| 34 | Master Acceptance Test | PENDING | — | 0% | — | Gate |
| 35 | Demo Scenarios | PENDING | — | 0% | — | Gate |
| 36 | Final Quality Gate | PENDING | — | 0% | — | GA |

---

## PHASE 00 — BASELINE / DISCOVERY / ARCHITECTURE AUDIT

### Status: IN_PROGRESS

### Objectives
- Establish the actual starting point before implementation
- Map current codebase, architecture, and integrations
- Identify dependencies, gaps, and technical debt
- Create baseline for migration strategy

### Current Findings

#### Repository Structure
- **Framework:** TypeScript/React/Express stack
- **Build:** Vite + esbuild
- **Database:** PostgreSQL (primary) + SQLite3 (legacy)
- **Prisma:** ORM with 25+ existing tables (Rules, RuleVersions, RuleExecutions, LegalInstruments, etc.)
- **Backend:** Express.js server with modular architecture
- **Frontend:** React 19 with Vite, TailwindCSS, Three.js/D3 visualization
- **AI:** Google GenAI integration, skills framework, prompt seeding
- **Infrastructure:** Redis (ioredis), observability stubs, security layer

#### Existing Backend Modules
```
backend/
├── agents/          (AI agent framework, federation)
├── ai-federation/   (multi-model support)
├── ai-runtime/      (agent execution runtime)
├── core/            (config/infrastructure)
├── data-fabric/     (event/data handling - STUB)
├── database/        (Prisma client, migrations)
├── event-fabric/    (event bus - STUB)
├── finance/         (finance domain - placeholder)
├── integration/     (external adapters)
├── mission-engine/  (workflow orchestration - placeholder)
├── observability/   (telemetry - STUB)
├── planning-engine/ (planning logic - STUB)
├── security/        (auth, RBAC, tenant isolation)
└── tests/           (test infrastructure)
```

#### Existing Frontend Components
```
src/
├── components/      (React components - rules/tenders focused)
├── context/         (React context, auth)
├── core/            (infrastructure)
├── design-system/   (UI design tokens)
├── types/           (TypeScript type definitions)
└── utils/           (utilities)
```

#### Current Domain Models (from Prisma schema)
- **Rules & Compliance:** Rule, RuleVersion, RuleExecution, LegalInstrument
- **Governance:** RuleCategory, EvaluationStage, LegalUpdate, TenderClause
- **Audit:** No dedicated audit tables; using audit signature fields
- **Enterprise:** Basic tenantId, createdBy, updatedBy fields in place

#### CRITICAL FINDINGS

1. **No Logistics Module Exists**
   - Rules and compliance engine is the primary domain
   - No shipment, carrier, warehouse, or inventory models
   - No logistics graph infrastructure
   - No transportation or material flow models

2. **Infrastructure is Partial**
   - Data fabric: stub implementation (no event validation, enrichment, deduplication)
   - Event bus: stub (no streaming, no persistence, no replay)
   - Planning engine: stub (no optimization, no simulation)
   - Mission engine: stub (no workflow orchestration)
   - Observability: stub (telemetry, not full instrumentation)

3. **AI Framework Ready**
   - Agent runtime exists and can be extended
   - Skills framework in place
   - AI federation operational
   - Can support agentic logistics agents

4. **Database Ready**
   - PostgreSQL in place
   - Prisma ORM operational
   - Migration infrastructure ready
   - Can extend schema incrementally

5. **Frontend Infrastructure Ready**
   - React 19 + Vite modern stack
   - TailwindCSS for styling
   - Three.js + D3 for visualization (can support graph/map visualization)
   - Design system foundation
   - Can build command center UX

### Architectural Implications

**Starting Architecture:**
```
CURRENT (Rules-First)
   Tender → Bid → Rules → Evaluation

NEEDED (Logistics-First)
   Order → Shipment → Carrier → Route → Milestone → Exception
   Material → Warehouse → Inventory → Demand
   Project → BOQ → Requirement → Supplier → PO
   Graph traversal, digital twin state, agent-driven decisions
```

**Integration Strategy:**
- Keep existing Rules/Compliance engine separate
- Build Logistics as new domain with its own ontology
- Share infrastructure: database, auth, observability, AI runtime
- Potential future integration: rules could apply to logistics decisions

### Migration Approach
1. Build Logistics ontology and schema (Phase 01)
2. Implement graph layer (Phase 02)
3. Build digital twin (Phase 03)
4. Implement event fabric (Phase 04)
5. Add transportation intelligence (Phase 05+)
6. Eventually integrate with command center and AI agents
7. Never perform blind rewrite; migrate incrementally

### Dependencies & Blockers
- **No blocker found:** Can proceed with Phase 01 (Ontology)
- **Precondition:** Prisma schema must be extended carefully to avoid conflicts with existing Rules schema

### Recommended Next Steps
1. Create logistics-specific Prisma models (separate from Rules domain)
2. Run migrations to establish baseline
3. Verify database connectivity
4. Build graph schema (Neo4j or similar, or PostgreSQL jsonb-based)
5. Proceed to Phase 01: Ontology design

### Documentation Files Required
- `docs/LOGISTICS_INTELLIGENCE_BASELINE.md` (detailed audit report)
- `docs/LOGISTICS_ONTOLOGY.md` (entities, relationships)
- `docs/LOGISTICS_GRAPH.md` (graph structure, queries)
- `docs/LOGISTICS_DIGITAL_TWIN.md` (twin model)
- `docs/LOGISTICS_EVENT_MODEL.md` (event classes, envelope)
- `docs/LOGISTICS_AI_AGENTS.md` (agent contracts, skills)
- `docs/LOGISTICS_INTEGRATIONS.md` (adapter patterns)
- `docs/LOGISTICS_SECURITY.md` (RBAC, tenant isolation)
- `docs/LOGISTICS_OBSERVABILITY.md` (instrumentation)
- `docs/LOGISTICS_TEST_STRATEGY.md` (test pyramid)

### Gate Status
✓ Baseline audit complete  
✓ No architectural blockers found  
✓ Recommended to proceed to Phase 01

---

## PHASE 01 — LOGISTICS DOMAIN MODEL + ONTOLOGY

### Status: PENDING

**Prerequisites:** Phase 00 baseline approved

### Scope
- Define canonical operational ontology
- Model all logistics entities and relationships
- Establish governance for entity versioning and lifecycle
- Create Prisma schema extensions
- Design graph relationship types
- Design event association model

### Entities (39 core)

```
Organization, Supplier, Carrier, Contract, 
PurchaseOrder, PurchaseOrderLine, Material, Part, Asset,
Substation, TransmissionLine, Warehouse, Depot, Bin,
InventoryPosition, InventoryMovement, Vehicle, Driver, Crew,
Shipment, ShipmentLeg, Milestone, Route, Waypoint,
Project, WorkOrder, MaintenanceOrder, Emergency,
Incident, Outage, Permit, Invoice, Document,
WeatherEvent, RoadEvent, Disruption, Risk, Exception,
Decision, Recommendation, Action, Agent, Workflow, Policy, SLA,
AuditEvent
```

### Relationship Patterns

```
Supplier ──supplies──> Material
Supplier ──fulfills──> PurchaseOrder
PurchaseOrder ──contains──> Material
PurchaseOrder ──creates──> Shipment
Shipment ──contains──> Material
Shipment ──has_leg──> ShipmentLeg
ShipmentLeg ──uses──> Carrier
ShipmentLeg ──uses──> Vehicle
ShipmentLeg ──follows──> Route
Route ──passes──> Waypoint
Material ──stored_at──> Warehouse
Material ──required_by──> WorkOrder
WorkOrder ──supports──> Asset
Asset ──located_at──> Substation
Project ──requires──> Material
Project ──depends_on──> Shipment
Disruption ──impacts──> Route
Disruption ──impacts──> Shipment
Risk ──impacts──> Project
Decision ──based_on──> Evidence
Decision ──produces──> Action
Agent ──executes──> Workflow
```

### Requirements per Entity
- Stable IDs (UUIDs with domain prefix)
- Typed relationships with semantics
- Temporal validity (validFrom, validTo)
- Source/provenance (source, dataQuality)
- Confidence scores
- Versioning (version, changedAt, changedBy)
- Tenant/org scope (tenantId, organizationId)
- Security classification (securityLevel)
- Lifecycle status (active, archived, deleted)
- Audit trail (createdAt, updatedAt, createdBy, updatedBy, deletedAt)
- Event history link (eventId reference)

### Deliverables
- `prisma/schema-logistics.prisma` (extended schema)
- `backend/domains/logistics/ontology.ts` (TypeScript definitions)
- `backend/domains/logistics/relationships.ts` (relationship registry)
- `docs/LOGISTICS_ONTOLOGY.md` (detailed entity specs)
- Tests: 100+ unit tests covering entity validation

---

## PHASE 02 — GRAPH ENGINEERING

### Status: PENDING

**Prerequisites:** Phase 01 ontology complete

### Scope
- Implement graph storage and query layer
- Support all required graph traversals
- Build 10 specialized graph views
- Optimize for common logistics queries
- Implement impact propagation
- Build dependency analysis

### Graph Technology
- **Primary:** PostgreSQL with JSON/GIN indices (cost-effective, integrated)
- **Optional:** Neo4j connector for complex graph queries (enterprise scale)
- **Fallback:** In-memory graph for smaller datasets

### Required Queries (30+)

```
What projects depend on shipment X?
Which assets depend on material Y?
What shipments are exposed to disruption Z?
Which warehouse can satisfy work order W fastest?
Which suppliers expose the highest project risk?
What is the shortest feasible emergency logistics path?
What changes if route R becomes unavailable?
What downstream obligations are affected by PO P?
Find all materials in transition to project Q.
Trace supplier impact through supply chain.
```

### Deliverables
- `backend/domains/logistics/graph/engine.ts` (query engine)
- `backend/domains/logistics/graph/queries.ts` (30+ common queries)
- `backend/domains/logistics/graph/views/` (10 specialized views)
- Graph test suite with deterministic data
- Performance baselines for common queries

---

## PHASE 03 — LOGISTICS DIGITAL TWIN

### Status: PENDING

**Prerequisites:** Phase 02 graph complete

### Scope
- Create temporal operational representation
- Model physical, operational, commercial, environmental, intelligence dimensions
- Implement twin state machine (KNOWN → OBSERVED → VALIDATED → PREDICTED → SIMULATED → DECIDED → EXECUTED → VERIFIED)
- Design queryable/updateable twin
- Integrate with real event flows

### Twin Dimensions

**Physical:** warehouses, depots, vehicles, assets, substations, transmission corridors  
**Operational:** orders, shipments, inventory, work orders, crews, projects, routes  
**Commercial:** suppliers, contracts, POs, rates, freight, invoices  
**Environmental:** weather, floods, traffic, road closures, security events  
**Intelligence:** predictions, risks, confidence, recommendations, decisions, actions

### State Model with Metadata
Every twin state includes:
- timestamp
- source (system/event producing the state)
- confidence (0-100)
- freshness (staleness threshold)
- provenance (data lineage)
- version (for conflict resolution)

### Deliverables
- `backend/domains/logistics/twin/model.ts` (state schema)
- `backend/domains/logistics/twin/engine.ts` (state machine)
- `backend/domains/logistics/twin/store.ts` (persistence)
- Twin query interface
- Event integration tests

---

## PHASE 04 — EVENT / DATA FABRIC

### Status: PENDING

**Prerequisites:** Phase 03 digital twin ready

### Scope
- Implement normalized event ingestion
- Build complete data quality pipeline
- Design event envelope and versioning
- Create event class catalog (29+ event types)
- Implement deduplication, validation, enrichment
- Connect to digital twin updates

### Event Envelope
```json
{
  "eventId": "evt_...",
  "eventType": "SHIPMENT_CREATED",
  "eventVersion": 1,
  "occurredAt": "2026-09-01T10:00:00Z",
  "receivedAt": "2026-09-01T10:00:05Z",
  "source": "TMS_SYSTEM",
  "tenantId": "ketraco",
  "correlationId": "corr_...",
  "causationId": "evt_...",
  "actor": "operator@ketraco.ke",
  "entityType": "Shipment",
  "entityId": "ship_...",
  "payload": { /* event-specific data */ },
  "schemaVersion": "1.0",
  "provenance": "TMS → Normalizer → Twin",
  "confidence": 0.95
}
```

### Event Classes (29+)

```
ORDER_CREATED, ORDER_CHANGED, MATERIAL_RESERVED, INVENTORY_MOVED,
SHIPMENT_CREATED, SHIPMENT_DISPATCHED, SHIPMENT_DEPARTED,
MILESTONE_REACHED, ETA_CHANGED, ROUTE_CHANGED,
VEHICLE_LOCATION_UPDATED, VEHICLE_STATUS_CHANGED,
DELIVERY_CONFIRMED, WAREHOUSE_RECEIPT,
SUPPLIER_DELAY, CARRIER_DELAY, STOCKOUT_RISK,
DISRUPTION_DETECTED, WEATHER_RISK, PROJECT_MATERIAL_RISK,
WORK_ORDER_CREATED, EMERGENCY_DECLARED,
RECOMMENDATION_CREATED, APPROVAL_REQUESTED,
ACTION_EXECUTED, ACTION_FAILED, ACTION_VERIFIED
```

### Data Quality Pipeline

```
INGEST
  ↓
VALIDATE (schema, format, required fields)
  ↓
NORMALIZE (units, formats, naming)
  ↓
DEDUPLICATE (event ID, fingerprint)
  ↓
RESOLVE ENTITY (entity linking, disambiguation)
  ↓
ENRICH (add context, calculated fields)
  ↓
SCORE QUALITY (completeness, freshness, confidence)
  ↓
CONTEXTUALIZE (associate with graph nodes)
  ↓
PUBLISH (to twin, agents, subscribers)
```

### Deliverables
- `backend/domains/logistics/events/envelope.ts` (event schema)
- `backend/domains/logistics/events/catalog.ts` (event type definitions)
- `backend/domains/logistics/events/processor.ts` (data quality pipeline)
- `backend/domains/logistics/events/bus.ts` (event broker)
- Integration tests with mock events
- Performance tests for throughput

---

## NON-NEGOTIABLE EXECUTION RULES

1. **Inspect before changing.** Map before refactoring.
2. **Preserve working functionality.** Never replace features just to improve appearance.
3. **No fake intelligence.** No hard-coded KPIs, fabricated live data, or simulated AI.
4. **Graph-first architecture.** Logistics as connected operational objects.
5. **Event-driven by default.** Material state change → typed event.
6. **AI is contextual, not generic.** Agents operate against trusted context.
7. **Human-in-the-loop for consequential actions.** Material actions require approval.
8. **Explainability is mandatory.** Every recommendation must expose evidence.
9. **Idempotency and auditability are mandatory.** Retries must not duplicate.
10. **Production-grade failure handling.** Design for partial connectivity, stale data, duplicate events.
11. **Security by design.** Tenant isolation, RBAC/ABAC, least privilege.
12. **Accessibility and operator ergonomics matter.** Command center UX remains usable.
13. **No architecture theater.** Every abstraction connects to working data flows.
14. **Do not stop at UI.** Features must trace to backend/domain/data logic.
15. **Do not stop at backend.** Backend capabilities must have discoverable operational surface.
16. **Prefer composable services and domain boundaries.** Avoid monolithic feature code.
17. **Use real domain terminology.** Shipment, consignment, milestone, carrier, lane, ETA, etc.
18. **Do not introduce unnecessary dependencies.** Reuse existing platform infrastructure.
19. **Record every phase in this file.** This document is the execution ledger.
20. **Do not claim completion without evidence.** Every assertion backed by tests/verification.

---

## NORTH-STAR OPERATING MODEL

### Evolution
```
Record → Report → React
       to
Observe → Contextualize → Predict → Explain → Simulate → Decide → Approve → Execute → Verify → Learn
```

### Core Layers
```
EXPERIENCE
  Command Center | Digital Twin | Graph | Map | Copilot | Analytics | Mobile

DECISION INTELLIGENCE
  Prediction | Risk | Optimization | Simulation | Recommendations

AGENT FABRIC
  Orchestrator | Shipment | Fleet | Warehouse | Supplier | Project | Emergency
  Route | Inventory | Procurement | Document | Data Quality

LOGISTICS ONTOLOGY
  Assets | Materials | Orders | Shipments | Routes | Suppliers | Vehicles
  Warehouses | Projects | Work Orders | Crews | Events | Risks | Decisions | Actions

LOGISTICS DIGITAL TWIN
  National logistics network + facilities + inventory + transport + projects

EVENT / DATA FABRIC
  APIs | CDC | Event Bus | Streaming | Documents | GPS | GIS | IoT | External Signals

SYSTEMS OF RECORD / SOURCES
  ERP | Procurement | WMS | TMS | GIS | SCADA/IoT | eGP | Fleet | Finance | Suppliers
```

---

## DEFINITION OF SUCCESS

The finished module should make it possible for an operator to move from:

**"Something is happening."**

to:

**"We know what is happening, why it matters, what will happen next, which options exist, what the optimal response is, who must approve it, what the system executed, and whether the outcome was achieved."**

That is the target: **next-generation utility logistics intelligence, not conventional logistics software.**

---

## CHANGELOG

### 2026-09-01
- **Action:** Initiated Phase 00 baseline audit
- **Finding:** No existing logistics module; architecture ready for extension
- **Next:** Proceed to Phase 01 ontology design
- **Owner:** Engineering team

---

**Last Updated:** 2026-09-01T13:04:33Z  
**Next Review:** After Phase 01 completion  
**Document Owner:** Logistics Platform Engineering
