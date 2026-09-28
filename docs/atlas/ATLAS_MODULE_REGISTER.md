# Atlas Module Register

This register tracks the canonical operational modules for Salience Atlas and preserves the current engineering status without inventing completion states.

Phase 05 update: `ATLAS-NPI-001` adds the National Procurement evidence-backed read contract. Existing fixture-backed procurement UI remains partial.

## Active target module

- TARGET_MODULE: `logistics-intelligence`
- Current route: `src/components/logistics` + `/api/logistics`
- Current implementation: `LogisticsView`, `CommandCenter`, `backend/domains/logistics/api-routes.ts`, and the source freshness contract

## Canonical 20-module register

| MODULE_ID | MODULE_NAME | BUSINESS_MISSION | CURRENT_STATUS | CURRENT_ROUTE | CURRENT_IMPLEMENTATION | GRAPH_STATUS | AI_STATUS | WORKFLOW_STATUS | UI_STATUS | DATA_STATUS | SECURITY_STATUS | DOCUMENTATION_STATUS | LAST_CHANGE | NEXT_ACTION |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| exec-command-center | Executive Mission Control | Provide enterprise command and oversight across operating domains | Partial | `src/components/ketraco/command-center` | Protected command shell and mission surfaces | Partial | Partial | Partial | Implemented subset | Partial | Partial | Partial | 2026-09-03 | Integrate canonical graph and event contracts without redesign |
| national-grid-intelligence | National Grid Intelligence | Observe and reason over transmission and distribution grid states | Partial | `src/components/ketraco/command-center` + grid domains | Grid telemetry, outage, and planning surfaces | Partial | Partial | Partial | Partial | Partial | Partial | Partial | 2026-09-03 | Canonical asset/twin and live-source contracts |
| capital-projects-intelligence | Capital Projects Intelligence | Track project health, dependencies, and supply impacts | Implemented subset | `/api/project-supply` + `src/components/ketraco/ScmModules` | Tenant-scoped requirements, supply positions, bounded graph projection | Partial | Partial | Not started | Partial | Partial | Validated subset | Partial | 2026-09-06 | Canonical milestones, contracts, site delivery, cost and governed workflows |
| procurement-intelligence | Procurement Intelligence | Manage procurement lifecycle, tender evaluation, rules, and evidence | Implemented subset | `backend/domains/procurement`, `/api/procurement`, `migration-006` | Evaluation, graph, and audit services | Partial | Partial | Implemented subset | Implemented subset | Implemented subset | Partial | Partial | 2026-09-03 | Connect canonical requisition, bid, award, contract, market, event, workflow, and AI sources |
| supplier-market-intelligence | Supplier & Market Intelligence | Model supplier networks, risk, and market exposure | Implemented subset | `/api/suppliers` + `src/components/twin/SupplierTwin` | Governed supplier graph neighborhood and order-derived performance | Partial | Not started | Partial | Partial | Partial | Partial | Implemented subset | 2026-09-06 | Canonical supplier master, compliance, documents, spend and governed analyst tools |
| commercial-intelligence | Contract & Commercial Intelligence | Govern contracts, obligations, payments, and claims | Partial | contract intelligence surfaces | Contract components and evaluation services | Partial | Partial | Partial | Partial | Partial | Partial | Partial | 2026-09-03 | Obligation, claim, payment, and provenance contracts |
| land-wayleave-intelligence | Land & Wayleave Intelligence | Manage parcels, permits, easements, and access rights | Planned | None identified | No reliable implementation evidence | Planned | Planned | Planned | Planned | Planned | Planned | Planned | 2026-09-03 | Define parcel/wayleave ontology and GIS integration |
| gis-spatial-intelligence | GIS & Spatial Intelligence | Combine spatial context with operational planning and assets | Partial | graph and location-related surfaces | Map/location and spatial-aware components | Partial | Partial | Partial | Partial | Partial | Partial | Partial | 2026-09-03 | Horizontal spatial enrichment service |
| logistics-intelligence | Logistics & Supply Chain Intelligence | Monitor shipments, inventory, fleet readiness, and route risk | Implemented subset | `/api/logistics` + `src/components/logistics` | Logistics API router, LogisticsView, CommandCenter | Partial | Partial | Partial | Implemented subset | Implemented subset | Partial | Implemented subset | 2026-09-03 | Source freshness and cross-module dependency events |
| inventory-intelligence | Inventory & Critical Spares Intelligence | Maintain stock visibility, criticality, and replenishment signals | Implemented subset | `src/components/ketraco/InventoryHub` + logistics domain | Inventory Hub and logistics inventory flow | Partial | Partial | Partial | Implemented subset | Partial | Partial | Partial | 2026-09-03 | Canonical material/warehouse/asset-demand model |
| asset-lifecycle-intelligence | Asset Lifecycle Intelligence | Track asset lifecycle, state history, and digital twin continuity | Partial | digital twin and asset surfaces | Asset resolution and twin services | Partial | Partial | Partial | Partial | Partial | Partial | Partial | 2026-09-03 | Persistent lifecycle identity and state history |
| predictive-maintenance-intelligence | Predictive Maintenance & Inspection | Detect and act on maintenance and inspection risk | Partial | drone/vision and maintenance logic | Drone and maintenance planning interfaces | Partial | Partial | Partial | Partial | Partial | Partial | Partial | 2026-09-03 | Inspection and maintenance contracts with evidence |
| finance-investment-intelligence | Finance & Investment Intelligence | Link cost, CAPEX/OPEX, and investment decisions | Implemented subset | finance module and APIs | Finance module and contract tests | Partial | Partial | Implemented subset | Implemented subset | Partial | Partial | Partial | 2026-09-03 | Cross-link CAPEX/OPEX to projects and assets |
| security-safety-resilience | Security, Safety & Resilience | Protect operations and assure resilience and major incident response | Partial | security and resilience surfaces | Security services and operator UI surfaces | Partial | Partial | Partial | Partial | Partial | Implemented subset | Partial | 2026-09-03 | Unified incident/HSE/cyber/resilience ontology |
| workforce-capability-intelligence | Workforce & Capability Intelligence | Match workforce capacity to operational demand | Planned | None identified | No reliable implementation evidence | Planned | Planned | Planned | Planned | Planned | Planned | Planned | 2026-09-03 | Workforce capability ontology and governed connectors |
| community-stakeholder-intelligence | Community & Stakeholder Intelligence | Manage stakeholder, grievance, and communication exposure | Planned | None identified | No reliable implementation evidence | Planned | Planned | Planned | Planned | Planned | Planned | Planned | 2026-09-03 | Stakeholder/grievance/compensation relationships |
| governance-risk-compliance | Governance, Risk & Compliance Intelligence | Coordinate risk controls, compliance posture, and remediation | Implemented subset | risk/compliance UI + auth services | Risk/compliance interfaces and authorization layer | Partial | Partial | Partial | Implemented subset | Partial | Implemented subset | Partial | 2026-09-03 | Cross-domain control evidence and remediation |
| audit-assurance-intelligence | Audit & Assurance Intelligence | Preserve decision provenance and assurance evidence | Implemented subset | audit and evidence surfaces | Audit services, evidence, and explainability surfaces | Partial | Partial | Partial | Partial | Partial | Partial | Partial | 2026-09-03 | Decision provenance coverage and continuous controls |
| enterprise-knowledge-ai | Enterprise Knowledge & AI Intelligence | Ground operations in canonical knowledge, AI runtime, and retrieval | Implemented subset | AI runtime, graph, and knowledge surfaces | AtlasChat, KnowledgeGraph, AI federation and runtime | Partial | Implemented subset | Partial | Implemented subset | Partial | Partial | Partial | 2026-09-03 | Grounded retrieval and source/provider truth |
| autonomous-operations-evolution | Autonomous Operations & Evolution | Enable feedback, learning, and operational evolution from production telemetry | Partial | agent health and observability surfaces | Agent health, telemetry, and recovery services | Partial | Partial | Partial | Partial | Partial | Partial | Partial | 2026-09-03 | Detection-first operational feedback loop |

## Status legend

- `Implemented subset`: a real capability exists, but the module is not yet complete or fully integrated.
- `Partial`: available in adjacent surfaces, but not yet canonicalized or fully governed.
- `Planned`: no reliable implementation evidence was found in the repository.

## Engineering rule

The register is intentionally conservative: it documents observed implementation, not aspirational architecture.
