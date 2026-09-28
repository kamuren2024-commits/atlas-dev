# 04 — Enterprise Ontology & Schema Foundation

**Target System:** Salience Atlas Domain Ontology Engine & Schema Fabric  
**Scope:** Canonical Entity Models, Relationship Taxonomies, In-Memory vs Persistent Graph Schemas  
**Auditor:** Principal Enterprise Ontology & Information Architect  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

Salience Atlas embodies an extensive and highly developed ontology model tailored specifically to the dual domains of **National High-Voltage Power Transmission** and **Kenyan Public Procurement (PPADA 2015 & PFM Act)**. 

The ontology layer defines over **50 canonical entity types** and **60 relationship classes** spanning physical electrical grid components, drone surveillance observations, statutory legal clauses, corporate meeting transcripts, financial chart of accounts, and supply chain logistics convoys.

However, the architecture currently exhibits **three independent, partially disconnected ontology engines**:
1. `packages/graph-schema/index.ts`: The static type taxonomy (`GRID_GRAPH_NODE_TYPES` and `GRID_GRAPH_EDGE_TYPES`).
2. `platform/ontology/OntologyEngine.ts`: The dynamic entity/schema registry with dynamic validation.
3. `backend/finance/ontology-mapping.ts` & `backend/digital-twin/knowledge-graph-engine.ts`: Domain-specific graph projectors that map relational SQL records into ontology nodes and edges.

---

## 2. Canonical Node & Edge Taxonomy (`packages/graph-schema`)

The root ontology taxonomy in `packages/graph-schema/index.ts` formalizes the complete enterprise vocabulary into strongly typed constants:

### 2.1 Node Taxonomy (54 Types)

```
                              ENTERPRISE ONTOLOGY NODE TAXONOMY
┌────────────────────────────────────────────────────────────────────────────────────────────────┐
│  PHYSICAL GRID ASSETS                                                                          │
│  GRID • REGION • CORRIDOR • LINE • SUBSTATION • BAY • TOWER • TOWER_COMPONENT                  │
│  CONDUCTOR • INSULATOR • HARDWARE • PROTECTION_ASSET • TRANSFORMER • BREAKER • DISCONNECTOR   │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  SURVEILLANCE & FIELD OPERATIONS                                                               │
│  TELEMETRY_POINT • DRONE • MISSION • INSPECTION • IMAGE • VIDEO • FRAME • DEFECT               │
│  CONDITION • RISK • WORK_ORDER • MAINTENANCE_EVENT • ENGINEER • TEAM • CONTRACTOR              │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  ENVIRONMENTAL & INCIDENTS                                                                     │
│  LOCATION • WEATHER_EVENT • OUTAGE • INCIDENT • DOCUMENT • STANDARD                            │
├────────────────────────────────────────────────────────────────────────────────────────────────┤
│  FINANCE & STATUTORY INTELLIGENCE                                                              │
│  FINANCE_SOURCE • FINANCE_BATCH • FINANCE_RECORD • FINANCIAL_PERIOD • CHART_OF_ACCOUNTS        │
│  ACCOUNT • COST_CENTRE • PROFIT_CENTRE • DEPARTMENT • BUDGET • BUDGET_LINE • BUDGET_REVISION   │
│  BUDGET_ALLOCATION • COMMITMENT • ENCUMBRANCE • INVOICE • PAYMENT • RECEIPT • JOURNAL          │
│  JOURNAL_ENTRY • EXPENSE • REVENUE • FUNDING • GRANT • LOAN • LIABILITY • RECEIVABLE • PAYABLE │
│  CASH_ACCOUNT • BANK_TRANSACTION • ASSET_VALUE • DEPRECIATION • CAPEX • OPEX                  │
│  PROJECT_FINANCE • PROJECT_COST • COST_TO_COMPLETE • FINANCIAL_RISK • FINANCIAL_METRIC        │
│  FINANCIAL_FORECAST • FINANCIAL_DECISION • FINANCIAL_REPORT • FINANCE_DATA_QUALITY            │
└────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Edge Taxonomy (65+ Relationship Classes)

Key relationship classes establish the semantic linkages between disparate domains:
- **Spatial / Containment:** `LINE_CONTAINS_TOWER`, `TOWER_HAS_COMPONENT`, `ASSET_LOCATED_AT`, `BUDGET_LINE_BELONGS_TO_BUDGET`.
- **Observation & Inspection:** `MISSION_INSPECTS`, `DEFECT_OBSERVED_IN`, `OBSERVATION_CAPTURED_BY`, `ENGINEER_REVIEWED`.
- **Causal & Degradation:** `DEFECT_AFFECTS`, `DEFECT_PRECEDES`, `DEFECT_WORSENED_TO`, `INCIDENT_ASSOCIATED_WITH`.
- **Cross-Domain Finance ↔ Asset:**
  - `CAPEX_CAPITALIZES_ASSET`: Links a capital expenditure approval directly to a physical 400kV transformer or conductor stringing project.
  - `COMMITMENT_RELATES_TO_CONTRACT`: Connects treasury commitments to legally binding vendor awards.
  - `PAYMENT_SETTLES_INVOICE`: Enforces the statutory invoice payment timeline mandated by National Treasury PFM regulations.
  - `FINANCIAL_RISK_AFFECTS_PROJECT`: Correlates budget variance or delayed exchequer issues to substation commissioning milestones.

---

## 3. Dynamic Ontology Engine (`platform/ontology/OntologyEngine.ts`)

### 3.1 Capabilities:
The `OntologyEngine` class provides runtime metadata validation and schema evolution:
- **Schema Registration:** `registerSchema(def: EntityDefinition)` validates property specifications (`type: string | number | boolean | date`, `required: boolean`).
- **Entity Validation:** `createEntity(id, typeId, properties)` verifies that all required properties exist before accepting an entity into the active state.
- **Relationship Indexing:** Tracks directed relationships (`awarded`, `funds`, `affects`, `supplies`, `monitors`, `contains`) in an in-memory index.

### 3.2 Architectural Disconnect:
Lines 52-56 and 77-80 of `OntologyEngine.ts` call:
```ts
OntologyStore.saveSchema(def.typeId, ...).catch(err => ...);
OntologyStore.saveEntity(id, typeId, properties).catch(err => ...);
OntologyStore.saveRelationship(...).catch(err => ...);
```
As audited in Document 03, `OntologyStore` in `platform/persistence/index.ts` delegates to `getPrisma()`, which resolves to `null` because no PostgreSQL connection or Prisma schema exists. Consequently:
- **All schema registrations succeed only in memory** (inside `schemaDefinitions: Map<string, EntityDefinition>`).
- **All entity creations persist only in memory** (inside `activeEntities: Map<string, OntologyEntity>`).
- If the Node process restarts, all dynamic ontology extensions and registered instances evaporate.

---

## 4. Relational-to-Ontology Projectors

A major triumph of the codebase is found in the domain projectors:
1. `backend/finance/ontology-mapping.ts` & `backend/finance/graph-sync.ts`:
   Reads rows from `finance_budgets`, `finance_commitments`, and `finance_invoices` in SQLite and projects them as `KnowledgeGraphNode` and `KnowledgeGraphEdge` instances with verified cryptographic provenance metadata.
2. `backend/digital-twin/knowledge-graph-engine.ts`:
   Extracts high-voltage busbars, substations, and transmission lines from `twin_assets` and constructs spatial adjacency graphs for N-1 contingency analysis.

---

## 5. Ontology Architecture Evaluation & Upgrades

| Dimension | Current State | Target Architecture | Gap Severity |
|---|---|---|---|
| **Taxonomy Completeness** | Exceptional (54 node types, 65+ edge types) | Standardized W3C OWL / RDF & JSON-LD | LOW (Vocabulary is mature) |
| **Runtime Persistence** | In-memory `Map` (database write calls fail) | Backed by SQLite table `ontology_entities` & `ontology_relationships` | HIGH (Volatile state) |
| **Validation Enforcement** | Basic required-property checking | Rich semantic constraints (cardinality, range, enum) | MEDIUM |
| **Cross-Module Graph Integration** | Independent graph instances in different services | Unified Knowledge Graph Service querying SQLite view | HIGH |

### Recommendations:
1. **Add Ontology Tables to SQLite:** Add `ontology_schemas`, `ontology_entities`, and `ontology_relationships` to `db-core.ts` so `OntologyStore` saves to SQLite rather than failing on Prisma.
2. **Expose Ontology Inspector in UI:** Connect the frontend `/components/graph` viewers directly to the ontology engine to allow operators to inspect entity attributes and relationship graphs dynamically.
