# Atlas Module Map

Status meanings: **Implemented** means discoverable UI/backend capability exists; **Partial** means a shell, subset, or adjacent capability exists; **Planned** means no reliable implementation evidence was found. No target module is marked complete in Phase 0.

| # | Target mission module | Existing implementation mapping | Status | Next boundary |
|---:|---|---|---|---|
| 1 | Executive Mission Control | Protected Command Center in `src/components/ketraco/command-center`, `src/components/logistics/CommandCenter.tsx`, executive service | Partial | Integrate canonical graph/events without redesign |
| 2 | National Grid Intelligence | Grid command-center components, grid domain packages, graph/risk/vision services | Partial | Canonical asset/twin and live-source contracts |
| 3 | Capital Projects Intelligence | `ProjectSupplyNexus`, project agents, strategic service | Partial | Project health/dependency model |
| 4 | Procurement Intelligence | Tender Studio, evaluation APIs/services, rules/evidence | Implemented subset | Consolidate procurement ontology and approval workflow |
| 5 | Supplier & Market Intelligence | Supplier components/agent, evaluation and graph services | Partial | Ownership, market, and concentration graph |
| 6 | Contract & Commercial Intelligence | Contract components/agent, evaluation services | Partial | Obligation, claim, payment, and provenance contracts |
| 7 | Land & Wayleave Intelligence | No dedicated module identified | Planned | Parcel/wayleave ontology and GIS integration |
| 8 | GIS & Spatial Intelligence | Graph/map components and location-related grid capabilities | Partial | Horizontal spatial enrichment service |
| 9 | Logistics & Supply Chain Intelligence | Logistics UI, service, API, agent | Implemented subset | Source freshness and cross-module dependency events |
| 10 | Inventory & Critical Spares Intelligence | `InventoryHub`, inventory agent, logistics domain | Implemented subset | Canonical material/warehouse/asset-demand model |
| 11 | Asset Lifecycle Intelligence | Digital twin services/components and asset-resolution service | Partial | Persistent lifecycle identity and state history |
| 12 | Predictive Maintenance & Inspection | Drone/vision/anomaly/forecast services and UI | Partial | Inspection and maintenance contracts with evidence |
| 13 | Finance & Investment Intelligence | Finance module/API, finance contracts/tests | Implemented subset | Cross-link CAPEX/OPEX to projects and assets |
| 14 | Security, Safety & Resilience | Security backend and grid resilience UI | Partial | Unified incident/HSE/cyber/resilience ontology |
| 15 | Workforce & Capability Intelligence | No dedicated module identified | Planned | Workforce capability ontology and governed connectors |
| 16 | Community & Stakeholder Intelligence | No dedicated module identified | Planned | Stakeholder/grievance/compensation relationships |
| 17 | Governance, Risk & Compliance Intelligence | Risk/compliance UI, rules, authorization, security packages | Implemented subset | Cross-domain control evidence and remediation |
| 18 | Audit & Assurance Intelligence | Audit ledger/services, evidence, explainability, audit UI surfaces | Implemented subset | Decision provenance coverage and continuous controls |
| 19 | Enterprise Knowledge & AI Intelligence | AtlasChat, KnowledgeCortex, document intelligence, AI runtime/federation | Implemented subset | Grounded retrieval and source/provider truth |
| 20 | Autonomous Operations & Evolution | Agent health, telemetry, observability, recovery/learning services | Partial | Detection-first operational feedback loop |

## Existing UI inventory

Notable UI surfaces include Command Center, Mission Control, Executive Command, Agent Studio/Platform, AI runtime, graph/relationship exploration, digital twin, tender, supplier, contracts, inventory, logistics, finance, risk/compliance, workflow, document, and knowledge intelligence components. These are mapped by capability rather than renamed.

## Preservation decisions

- Preserve the existing Command Center and its visual benchmark.
- Preserve existing procurement/evaluation, logistics, inventory, finance, graph, twin, agent, and AI-runtime capabilities.
- Prefer adapters and shared contracts over duplicated domain models.
