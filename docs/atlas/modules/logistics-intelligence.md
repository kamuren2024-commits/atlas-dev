# Module

## Module ID

`logistics-intelligence`

## Business Mission

Provide an operational intelligence function for logistics and supply chain coordination across shipments, fleet movement, inventory, and route risk. The module must make live operating conditions intelligible to planners without replacing the protected Executive Command Center or broader Atlas platform.

## Operational Problem

The project already contains a logistics domain with APIs and a command center surface, but the implementation is split across UI, backend routes, DB/service abstractions, and security/audit integration. The challenge is not to rebuild the domain but to preserve the working module while documenting its true route, dependencies, and integration boundaries.

## Users

- Dispatch planners
- Fleet and warehouse coordinators
- Operations managers
- Cross-module planning teams
- Executive leadership consuming summary views

## User Roles

- `planner`
- `operations-manager`
- `executive-reviewer`
- `tenant-user`

## Decisions

- Preserve the existing `LogisticsView` + `CommandCenter` surface and avoid a full UI replacement.
- Keep API routing under `/api/logistics` and bind it through the existing server middleware path.
- Treat the logistics domain as an implemented subset rather than a fully canonicalized module until source freshness, dependency events, and graph integration are validated.
- Prefer adapters and contracts over duplicate models.

## Existing Capabilities

- Logistics overview KPIs and status summaries
- Shipment listing and detail querying
- Inventory and warehouse summaries
- Fleet and operational event summaries
- Ongoing command center UI shell with status cards and timeline views
- Security and audit hooks integrated at route boundaries
- Tenant-scoped source freshness and import-data availability reporting

## Existing Routes

- `GET /api/logistics/overview`
- `GET /api/logistics/shipments`
- `GET /api/logistics/shipments/:id`
- `GET /api/logistics/inventory`
- `GET /api/logistics/fleet`
- `GET /api/logistics/warehouses`
- `GET /api/logistics/events`
- `GET /api/logistics/twin/:entityId`
- `GET /api/logistics/data-quality`

Evidence:
- `backend/domains/logistics/api-routes.ts`
- `server.ts` route mount block for `/api/logistics`

## Existing Components

- `src/components/logistics/LogisticsView.tsx`
- `src/components/logistics/CommandCenter.tsx`
- `src/components/logistics/index.ts`
- `src/App.tsx` entry point wiring `LogisticsView` into the module shell

## Existing APIs

- Logistics API router created by `createLogisticsApiRouter(deps)`
- Database-backed operations using `DatabaseCore`
- Optional knowledge graph dependency `kg?: KnowledgeGraph`
- External auth and audit dependencies wired in `server.ts`

## Existing Database Models

The logistics module currently relies on SQLite-backed tables via `DatabaseCore` and the migration/domain scaffolding, including operational patterns aligned to:

- logistics orders
- logistics inventory/stock
- vehicle and fleet state
- facilities / warehouses
- logistics events

Evidence:
- `backend/database/db-core.ts`
- `backend/database/migration-004-logistics-domain.ts`
- `prisma/schema-logistics.prisma`
- `backend/domains/logistics/data-quality.ts`

## Existing Data Sources

- SQLite domain store via `DatabaseCore`
- Optional knowledge graph integration
- Event and audit traversals via the platform middleware layer
- UI-driven fetches from the logistics API

## Existing AI Capabilities

No dedicated AI model execution is implemented for this module in the current route layer. The module is operationally data-driven rather than LLM-driven. It remains tied to the shared Atlas platform and security/audit context rather than a dedicated autonomous agent workflow.

Import/customs/port milestones and predictive ETA remain unverified until
validated source contracts are persisted.

## Existing Graph Relationships

The module is not yet fully canonicalized to a complete graph model, but the architecture is intended to integrate with the shared Atlas graph abstraction and the lower-level domain service layer. It currently behaves as a domain adapter consuming platform services rather than a full graph-native implementation.

## Existing Workflows

- KPI overview generation from live database queries
- Shipment and inventory result assembly
- Fleet readiness summaries
- Security/access gate checks before read actions
- Audit logging for overview and data access events

## Existing Integrations

- Authentication middleware mounted above `/api/logistics`
- Authorization service injected into the logistics API router
- Audit logger adapter from `server.ts`
- Knowledge graph service optional injection path
- App-level navigation uses `LogisticsView`

## Current UX Assessment

The UI is a working command-center experience with operational language, KPI cards, and live status surfaces. It is not a placeholder shell, but it remains a domain-contained experience rather than a fully graph-aware operational workspace. The current UX is acceptable for a production subset but not yet the final canonical Atlas UX.

## Target Operational Experience

- Unified operational overview across shipments, inventory, fleet, risk, and SLA
- Clear live status and freshness indicators
- Cross-module context for project, asset, and supplier dependency awareness
- More explicit relationship and event-driven dependency tracking, without redesigning the protected command center

## Graph Model

Target shape:

- `Tenant -> LogisticsDomain`
- `LogisticsDomain -> Shipment`
- `LogisticsDomain -> Warehouse`
- `LogisticsDomain -> FleetAsset`
- `LogisticsDomain -> InventoryItem`
- `Shipment -> Supplier`
- `Shipment -> Project`
- `Shipment -> Location`
- `Asset -> LogisticsEvent`

This is the intended canonical relationship layer, but it is not yet fully enforced at runtime.

## Intelligence Model

The module currently operationalizes intelligence as:

- KPI aggregation
- event and risk categorization
- status classification (healthy/warning/critical)
- route and SLA evaluation based on live data

The model is not yet a full causal or graph-native intelligence model; it is a practical operational model using existing service boundaries.

## Workflow Model

1. Request enters `/api/logistics` route
2. Authentication and path middleware run
3. Authorization check is evaluated for resource access
4. Query is assembled against database layer
5. Response is normalized into overview, shipment, inventory, or fleet payloads
6. Audit log records event metadata
7. UI consumes the payload in the logistics view
8. `/data-quality` reports persisted source timestamps and unavailable import
   sources explicitly

## UI Architecture

- Domain entry view: `LogisticsView`
- Primary operational workspace: `CommandCenter`
- KPI cards, shipment list, operational events, and operations status surfaces
- React UI remains inside the protected command center pattern without global redesign

## Implementation Plan

1. Preserve the current command-center UI and route definitions.
2. Validate the route and dependency contract as the source of truth.
3. Document the actual data model and graph relationships.
4. Add freshness and dependency event hooks only where they are required by the current module.
5. Avoid speculative refactoring outside the logistics surface.

## Validation

Validated through:

- targeted TypeScript checks for logistics primitives
- `npm run build` (production build pass)

Observed current evidence:
- `backend/domains/logistics/api-routes.ts`
- `server.ts` route mount and middleware integration
- `src/components/logistics/CommandCenter.tsx`
- `src/components/logistics/LogisticsView.tsx`

## Regression

Primary regression risk:

- route contract drift between the app layer and server/domain layer
- mismatched auth/audit dependency signatures
- module-level dependency on database and graph infrastructure without canonical graph integration

Mitigation:

- preserve route shape
- keep contracts narrow and compatible
- validate app bundle and TypeScript contract after each module-specific change

## Known Limitations

- Graph relationships remain incomplete and not fully canonical.
- Event freshness is exposed as a source-quality contract, but import
  dependency streams are not yet integrated.
- The module is implemented as a partial subset rather than a fully standardized Atlas module.
- Some operational intelligence remains encoded in KPI heuristics instead of graph-informed decisions.

## Technical Debt

- Module boundary is integrated but not fully canonicalized.
- Shared contracts between UI, route layer, auth, and audit are still partly adapter-based.
- Cross-module dependency events and source freshness are not yet standardized.

## Change Log

- 2026-09-03: Documented current logistics module route, UI, data source, and contract architecture.
- 2026-09-03: Confirmed route mounting in `server.ts` and relevant domain files.
- 2026-09-03: Validated build and TypeScript health against the observed implementation.

## Future Evolution

The next controlled evolution for this module should be:

- canonical source freshness events
- dependency-linking between logistics, assets, and projects
- stronger graph-backed relationship mapping
- a closer integration between logistics data and supply nexus planning contexts

This should remain additive, not a rebuild.
