# Atlas Gap Analysis

## P0 — architecture, security, or data-integrity blockers

| Gap | Evidence | Impact | Required response |
|---|---|---|---|
| Split persistence strategy | Prisma targets PostgreSQL; evaluation bootstrap uses SQLite | Inconsistent writes, migration and tenant risks | Define store ownership and canonical transaction boundaries |
| Inconsistent production/demo boundary | Mock workers and fixture-oriented UI/service surfaces exist | Users may interpret synthetic results as live intelligence | Add source/provider/freshness truth to contracts and UI |
| Incomplete tenant authorization proof | Gateway and authorization code exist, but route-wide evidence is absent | Cross-tenant leakage risk | Audit every route, service, event, graph query, and job |

## P1 — core platform capability gaps

- One canonical entity adapter layer is not yet demonstrably used across all domains.
- Event catalogs exist, but loop events and domain events do not yet share one documented envelope.
- Agent and workflow abstractions exist in both `backend/*` and `src/core/*`; ownership and interoperability are unresolved.
- Unified observability coverage across APIs, workflows, agents, AI providers, and data pipelines is not proven.
- Runtime smoke/regression evidence is not represented in a release ledger.

## P2 — mission intelligence gaps

- Land/wayleave, workforce, and community/stakeholder missions have no dedicated implementation evidence.
- Asset lifecycle, predictive maintenance, GIS enrichment, and resilience are present as partial capabilities rather than complete cross-module missions.
- Procurement, logistics, inventory, finance, supplier, and contract capabilities need shared project/asset/supplier relationships.
- Recommendations need consistent evidence, confidence, model/source, and approval semantics.

## P3 — enhancements

- Split the oversized Express composition root after route contracts are covered.
- Consolidate duplicate naming and legacy APOS/EAF terminology.
- Add module-level operational, exception, intelligence, evidence, and action UX consistently.
- Add contract-level loading, empty, and error-state verification for all visible panels.

## P4 — future integrations

- Live SAP/Ariba, SCADA/IoT, GIS, document, and external market connectors.
- Production-grade graph database and vector retrieval infrastructure where justified.
- Verified autonomous remediation beyond detection/retry, under policy control.

## Mock and synthetic-data audit targets

The next phase must inspect and label fixture/mock usage in `src/components/ketraco/*`, `services/*`, AI provider fallbacks, Redis workers in [`server.ts`](../../server.ts), and local SQLite bootstrap data. No such surface should imply live enterprise connectivity without runtime evidence.
