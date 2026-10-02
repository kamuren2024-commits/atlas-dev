# Command Center Engineering Capability Boundary

This document records the internal, fail-closed backend boundary added for future engineering workflow work. It does not make the Digital Twin's reference topology, simulated telemetry, or existing heuristic engines an authoritative operational source.

## Source and value semantics

`backend/digital-twin/engineering-contracts.ts` defines versioned grid state, topology, asset, telemetry, source, provenance, scenario, simulation, event, audit, and future tool contracts.

Value state (`OBSERVED`, `DERIVED`, `SIMULATED`, `PREDICTED`, `UNAVAILABLE`) is separate from source mode (`LIVE`, `SIMULATION`, `SNAPSHOT`, `IMPORTED`, `DEMO`, `UNAVAILABLE`, `STALE`) and source availability (`SOURCE_NOT_CONFIGURED`, `SOURCE_UNAVAILABLE`, `SOURCE_STALE`, `SOURCE_ERROR`). These values must not be substituted for one another.

Grid and topology providers are injected at the API boundary. The default providers return `SOURCE_NOT_CONFIGURED` / `TOPOLOGY_SOURCE_UNAVAILABLE`; they do not adapt seeded Digital Twin reference data into operational state. State and topology must include tenant identity, provenance, freshness, source mode, and stable versions. Live data must claim authority explicitly. Stale or freshness-unknown inputs are rejected for scenario creation/execution. A scenario pins the exact state and topology versions, and execution loads those versions again rather than silently using newer input.

Scenario changes are separate hypothesis data. The scenario service has no write method to the grid-state or topology providers. The default simulation provider advertises no capabilities and returns `UNAVAILABLE`, with no findings or artifacts. A provider claiming a completed simulation must return simulation provenance (`sourceMode: SIMULATION`, `confidenceState: SIMULATED`) across results, findings, warnings, and artifacts. The service rejects a completed result with mismatched identity/version or non-simulation provenance.

## API boundary

All routes are mounted beneath `/api/twin/engineering`, authenticated with the existing Atlas `ApiGatewayMiddleware`, scoped to `req.user.tenantId`, and checked against the distinct `grid_engineering` resource in the existing authorization service. With no registered `grid_engineering` grants, non-wildcard users are denied by default; operations require explicit grants. The API never accepts tenant, owner, or role identity from the request body as authority. Scenario reads and writes are limited to the authenticated owner in the authenticated tenant.

| Method | Route | Required action | Result |
|---|---|---|---|
| POST | `/scenarios` | `grid_engineering:create` | Creates a version-pinned scenario only when state and topology providers return validated, fresh snapshots. |
| GET | `/scenarios` | `grid_engineering:read` | Lists only the authenticated owner's scenarios in the authenticated tenant. |
| GET | `/scenarios/:scenarioId` | `grid_engineering:read` | Retrieves an owned scenario; foreign tenant/owner IDs resolve as not found. |
| PATCH | `/scenarios/:scenarioId` | `grid_engineering:update` | Adds an immutable scenario-definition version; only drafts can be edited. |
| GET | `/scenarios/:scenarioId/audit` | `grid_engineering:read` | Retrieves durable audit events for an owned scenario. |
| POST | `/scenarios/:scenarioId/simulations` | `grid_engineering:admin` | Requires `Idempotency-Key`; persists request/run lifecycle. Default response is `UNAVAILABLE`, never a synthetic engineering result. |
| GET | `/simulations/:runId` | `grid_engineering:read` | Retrieves run status only when the caller owns its scenario. |
| GET | `/simulations/:runId/result` | `grid_engineering:read` | Retrieves the version-checked result and writes a durable `RESULT_ACCESSED` audit event before responding. |
| POST | `/simulations/:runId/cancel` | `grid_engineering:admin` | Cancels only a queued run, with an immutable lifecycle event and audit entry. |

Every response includes a correlation identifier. Source configuration and validation errors are surfaced as explicit error codes. `POST /scenarios` fails with `SOURCE_NOT_CONFIGURED` or `TOPOLOGY_SOURCE_UNAVAILABLE` until real/certified providers are injected. The older Digital Twin `/scenarios/run` response remains unchanged and unavailable; it is not a second solver implementation.

## Persistence, audit, and lifecycle events

Migration 015 extends the existing SQLite migration lifecycle with:

- `engineering_scenarios`: tenant and owner scoped current scenario document.
- `engineering_scenario_versions`: immutable scenario-definition snapshots.
- `engineering_simulation_runs`: pinned state/topology/scenario versions, idempotency key, status, provenance, and result document.
- `engineering_run_events`: durable typed simulation lifecycle event records with correlation and version identifiers.

Foreign keys and unique indexes prevent cross-tenant run references, duplicate tenant idempotency keys, and more than one active run per scenario. Operations that modify scenario/run state append their records and audit event within one database transaction. Per-service transaction serialization plus database uniqueness protects concurrent scenario/run requests.

Lifecycle event contract includes creation, queueing, start, progress, warning, completion, failure, cancellation, and unavailable states. Current code persists created/queued/started/terminal events; it does not publish them through WebSocket/SSE yet. Simulation progress must remain distinct from grid telemetry. Wire delivery only after the existing realtime transport is authenticated, tenant-filtered, and tested.

Audit reuses the existing immutable `logistics_governance_audit` table with resource values under `grid_engineering.*`, JSON details using the typed engineering audit event, tenant hash chaining, and immutable table triggers. The existing logistics response-finish audit writer is asynchronous and not atomic with business writes; engineering lifecycle writes are instead inserted in the same transaction as their scenario/run changes. The existing table's hash chain can still be contended by other domain writers that use the non-transactional hook. A shared cross-domain audit append primitive and chain verification are prerequisites for a system-wide tamper-evident guarantee.

## Future internal tool boundary; no MCP server exposed

The `EngineeringToolCapability` type reserves internal capability metadata only. No new externally reachable MCP endpoint or autonomous control capability is implemented.

| Future capability | Input contract | Output contract | Authorization | Audit | Provenance | Safety constraints |
|---|---|---|---|---|---|---|
| `get_grid_state` | Tenant from authenticated identity; optional correlation ID | Versioned `GridState` or explicit source error | `grid_engineering:read` | Access recorded by caller/runtime | Required; preserve source mode and value state | Never return mock as live; unavailable is not null/zero |
| `get_asset` | Asset ID; tenant from authenticated identity | `GridAsset` with provenance | `grid_engineering:read` | Access recorded by caller/runtime | Required | No fallback to another tenant or fabricated asset |
| `get_topology` | Tenant from authenticated identity; optional version | Versioned `TopologySnapshot` or explicit unavailable | `grid_engineering:read` | Access recorded by caller/runtime | Required authority/staleness/source mode | No invented topology or authority |
| `create_scenario` | Scenario class, change set, assumptions, requested analyses; server binds owner/tenant/state versions | Versioned `EngineeringScenario` | `grid_engineering:create` | `SCENARIO_CREATED` | Required and pinned | No mutation of live state |
| `run_simulation` | Scenario ID plus idempotency key | `SimulationRun` / `SimulationResult` | `grid_engineering:admin` | Request and lifecycle events | Required on every result | No output absent a provider; no live control |
| `get_simulation_result` | Run ID; tenant from identity | Version-checked result or unavailable/not found | `grid_engineering:read` | `RESULT_ACCESSED` | Required | Enforce owner, tenant, and pinned-version access |
| `replay_event` | Event/run identifier and requested range; tenant from identity | Persisted events with original correlation/version | `grid_engineering:read` | Read access recorded by caller/runtime | Required | No simulated lifecycle event represented as telemetry |

No tool is permitted to open breakers, issue switching orders, dispatch generation, or otherwise control the grid. Exposing any tools through MCP requires a separately reviewed transport/authentication boundary and explicit permission grants.

## Deliberately unavailable

- Live grid-state and authoritative topology retrieval (no operational provider configured).
- Any validated power-flow, contingency, N-1/N-2, restoration, or other engineering solver (no solver provider configured).
- Simulation progress delivery over WebSocket/SSE (events are persisted, not broadcast).
- Event replay as authoritative operational history (no validated source ingestion/retention path).
- External MCP exposure and all grid-control tools.

No engineering calculation, operational readiness, N-1 compliance, or grid-stability claim is made by this implementation.
