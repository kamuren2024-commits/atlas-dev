# Command Center Infrastructure Assessment

**Assessment scope:** Existing Salience Atlas Command Center, traced from UI through available API, service, persistence, or external-source paths.  
**Assessment date:** 2026-09-30  
**Method:** Repository implementation and tests were treated as evidence. Product and architecture documentation was not treated as proof that a capability is operational. No application code, grid data, or Command Center behavior was changed for this assessment.

## Executive baseline

The repository has substantial reusable application, data-fabric, Digital Twin, event, persistence, security, and AI infrastructure. It does **not** demonstrate a live connection to SCADA/EMS, a production grid asset/GIS authority, or an operational outage-management source in its normal Command Center data path.

The current Command Center therefore combines:

- **Real infrastructure:** React application/module loading, Express APIs, database and migration infrastructure, auth/session and authorization primitives, event schemas/APIs, AI/agent interfaces, and several tested domain services.
- **Partial capabilities:** Digital Twin engines/API, provider/data-fabric integration points, map loading, event delivery, persistence and audit/observability integration, and operator workflow surfaces.
- **Simulation/reference behavior:** Command Center KPI provider, default SCADA adapter telemetry, seeded canonical grid data, fixed server telemetry, and some AI fallback responses.

The presence of an engine, endpoint, map, or control in the UI does not establish an operational data connection. In particular, the Digital Twin API gates state-dependent results when SCADA is not connected, while the examined SCADA provider itself uses generated data and can mark itself connected without a real protocol connection. Treat such results as non-operational unless source identity, data quality, freshness, authority, and runtime wiring are independently verified.

## Classification key

| Classification | Meaning |
|---|---|
| REAL | Functioning implementation or data path demonstrated by source/tests; does not imply suitability for grid operational authority. |
| PARTIAL | Some implementation exists, but runtime wiring, production integration, persistence, controls, or end-to-end proof is incomplete. |
| SIMULATION | Deliberately generated/simulated behavior. |
| MOCK | Placeholder, demo, fixed, or fake data/behavior. |
| BROKEN | Intended normal runtime behavior is shown to fail or is not wired where required. |
| MISSING | No implementation was found for the operational capability. |
| SECURITY/PRODUCTION RISK | Existing implementation has an identified production safety, security, reliability, or governance risk. |

Full machine-readable details—including implementation, files, paths, sources, persistence, dependencies, runtime, tests, risks, and next enactment for each capability—are in [COMMAND_CENTER_INFRASTRUCTURE_ASSESSMENT.json](./COMMAND_CENTER_INFRASTRUCTURE_ASSESSMENT.json).

## Capability register

| Capability | Classification | Baseline |
|---|---|---|
| Frontend entry and Command Center modules | REAL / PARTIAL | Existing React shell and substantial Command Center component set; no demonstrated route-level authorization boundary or comprehensive browser coverage. |
| Backend API and service composition | REAL / PARTIAL / SIMULATION | Express APIs and domain services are present; `/api/scm/telemetry` returns fixed values, and authentication/authorization is not uniformly applied at a single server boundary. |
| Grid topology and asset model | REAL model / REFERENCE DATA / PARTIAL | Canonical grid model and topology API exist, but seeded in-memory/reference topology is not proven to be synchronized to an authoritative network/GIS source; frontend has a separate canonical dataset. |
| SCADA/EMS and telemetry | SIMULATION / MOCK / PARTIAL | Provider abstraction exists, but the examined SCADA adapter generates mock values and may report connected without connecting to a SCADA protocol. |
| Digital Twin | PARTIAL / SIMULATION | Existing service and analysis engines are valuable; operational state-based results depend on a real connected state source not demonstrated by the default runtime. |
| Google Maps and grid visualization | REAL map integration / PARTIAL / SIMULATION | Google Maps library loader and sophisticated grid views exist; displayed grid features use reference/local topology rather than a demonstrated live GIS feed. |
| Outage and incident handling | PARTIAL / SIMULATION | Incident/outage concepts and engines exist; production OMS linkage and persistent operational incident history are unproven. |
| Contingency analysis | PARTIAL / SIMULATION | Engine and API exist, but live-state route checks block results when SCADA is unavailable; no production power-flow solver/source is demonstrated. |
| Scenario management and simulation | PARTIAL / SIMULATION | Scenario UI/engine and explicit logistics simulation exist; production-grade grid study solver and durable scenario lifecycle are not demonstrated. |
| Event fabric, incidents, and replay | REAL / PARTIAL / SIMULATION | Event types, API, query/subscription behavior, and tests exist; real operational event ingestion and durable operational replay are not proven. |
| WebSocket / SSE / realtime | PARTIAL / MISSING end-to-end proof | WebSocket handler exists, but normal server initialization and frontend consumption are not evidenced; SSE is not demonstrated as an active stream. |
| Restoration workflows | PARTIAL / MISSING operational execution | Advisory/mission/workflow primitives and UI concepts exist; there is no demonstrated end-to-end, authorized grid restoration execution path backed by operational switching/OMS systems. |
| Engineering analytics | PARTIAL / SIMULATION | Twin analysis engines and analytics surfaces exist; operational validity is constrained by synthetic/reference inputs and lack of validated engineering solver integration. |
| AI engineering copilot readiness | REAL platform primitives / PARTIAL / MOCK fallback risk | AI runtime, federation, safety and tool infrastructure are reusable; a validated grid-data-grounded copilot and complete Command Center tool chain are not demonstrated. |
| Persistence | REAL / PARTIAL / SECURITY-PRODUCTION RISK | SQLite database/migrations are real; grid reference state is in memory, while PostgreSQL/Prisma/Redis are not established as the normal Command Center runtime. |
| Authentication and authorization | REAL / PARTIAL / SECURITY-PRODUCTION RISK | Sessions, JWT, rate limiting, and authorization primitives exist; browser token storage, plaintext password comparison, and inconsistent route enforcement are risks. |
| Audit and governance | REAL primitives / PARTIAL / SECURITY-PRODUCTION RISK | Dedicated AI/auth audit structures exist, but main server's generic audit implementation is console-only and not a durable audit ledger. |
| Health and observability | REAL basics / PARTIAL | Health/config/SLO/AI observability components exist; aggregate health does not prove grid source freshness, authority, or operational readiness. |
| MCP and tool interfaces | REAL internal registry / PARTIAL / MISSING external MCP proof | Permission/audit-aware tool metadata and runtime interfaces exist; externally exposed standards-compliant MCP service and full grid-tool path are not evidenced. |
| Tests and operational evidence | REAL baseline / PARTIAL coverage | Infrastructure and selected integration tests exist; live provider, grid UI E2E, realtime delivery, tenant-isolation coverage, and operational data provenance are gaps. |
| Data provenance and source modes | SIMULATION / MOCK / PARTIAL | Simulation signals exist in several paths, but provenance is not shown to be consistently mandatory and visible across every grid response and consumer. |

## Trace findings and implications

### Frontend and API

The application entry is [src/App.tsx](../src/App.tsx), which loads modules through [src/modules/atlas-module-registry.ts](../src/modules/atlas-module-registry.ts). Command Center surfaces live in [src/components/ketraco/command-center/](../src/components/ketraco/command-center/). Some surfaces call APIs; others use local engines/providers. A UI capability is therefore not evidence of an API-backed or persisted capability.

The backend entry and route composition are in [server.ts](../server.ts). It mounts a broad set of API domains, including Digital Twin and event endpoints, and also returns fixed telemetry from `/api/scm/telemetry`. Route-level authentication and authorization are applied through differing router patterns rather than a demonstrated uniform boundary for all Command Center routes.

### Grid data and Digital Twin

The backend reference grid model is [backend/digital-twin/canonical-model.ts](../backend/digital-twin/canonical-model.ts); topology/asset routes are in [backend/digital-twin/api-routes.ts](../backend/digital-twin/api-routes.ts). The frontend maintains a separate dataset in [src/components/ketraco/command-center/grid-canonical-data.ts](../src/components/ketraco/command-center/grid-canonical-data.ts). The model and engines are reusable, but neither the in-memory seeded assets nor duplicated frontend constants constitute a verified live network model.

The provider contracts and fabric are in [backend/data-fabric/](../backend/data-fabric/). The examined implementation [backend/data-fabric/adapters/scada-ems-provider.ts](../backend/data-fabric/adapters/scada-ems-provider.ts) generates synthetic telemetry and does not establish a SCADA protocol connection. The Command Center frontend provider [src/components/ketraco/command-center/providers/GridDataProvider.ts](../src/components/ketraco/command-center/providers/GridDataProvider.ts) is explicitly simulation-oriented. Digital Twin state-dependent endpoints check connection state and may return unavailable responses; this is preferable to presenting invented state as live, but does not provide an operational source.

The Digital Twin service and engine decomposition under [backend/digital-twin/](../backend/digital-twin/) should be preserved. Before extending engineering analysis, establish and validate its authoritative input and provenance path rather than replacing the twin.

### Visualization and operational studies

The Google Maps loader [src/components/ketraco/command-center/google-maps-loader.ts](../src/components/ketraco/command-center/google-maps-loader.ts) is a real library integration, with key configuration and load failure handling. Grid map, topology, and 3D views are implemented, but a production GIS-to-grid-model synchronization path is not evidenced.

Contingency, risk, predictive, outage, scenario, and advisory components exist in the Digital Twin and Command Center. Their operational authority is constrained by the absence of a demonstrated live, validated grid state and production solver/source integration. Logistics simulation endpoints are explicit simulations and must not be mistaken for grid studies.

No complete operational restoration chain was demonstrated from recommendation through approval, command authorization, switching execution, feedback, and auditable closeout. Existing mission, workflow, advisory, event, and audit components are potential reusable foundations, not proof of control-room execution.

### Events, persistence, security, and governance

The event fabric API, types, and bus live under [backend/event-fabric/](../backend/event-fabric/), with unit and integration coverage. A WebSocket handler is present, but initialization from normal server startup and frontend end-to-end consumption were not established. An event API or replay UI alone does not establish persisted, complete operational history.

Database lifecycle and migration infrastructure are in [backend/database/](../backend/database/). SQLite is the demonstrated default; additional PostgreSQL, Prisma, Redis, outbox, and idempotency pieces are present but are not proven to back the normal grid Command Center path.

Auth/session code in [backend/security/auth-router.ts](../backend/security/auth-router.ts), authorization in [backend/security/authorization-service.ts](../backend/security/authorization-service.ts), and tests are reusable. Production hardening must address localStorage tokens, the configured-password comparison behavior, consistent endpoint policy enforcement, and tenant-scoped queries.

Audit, health, and observability have useful existing foundations, but the generic server audit adapter is console output. Application health must not be represented as grid operational readiness; data-source connection, freshness, quality, provenance, and authority need distinct status.

### AI, tools, and testing

AI runtime/federation, safety, evaluation, agent, and tool registry components provide reusable platform primitives. The frontend AI utility has mock-shaped fallback behavior, so successful-looking output does not prove live model inference or grid-data grounding. The internal tool registry is not evidence of an externally exposed MCP endpoint.

Relevant existing tests include:

- [backend/tests/event-fabric.unit.test.ts](../backend/tests/event-fabric.unit.test.ts)
- [backend/tests/event-fabric.integration.test.ts](../backend/tests/event-fabric.integration.test.ts)
- [backend/tests/server-config.test.ts](../backend/tests/server-config.test.ts)
- [backend/tests/platform-foundation.test.ts](../backend/tests/platform-foundation.test.ts)
- [backend/tests/demo-login-e2e.test.ts](../backend/tests/demo-login-e2e.test.ts)
- [backend/tests/logistics-security.integration.test.ts](../backend/tests/logistics-security.integration.test.ts)
- [backend/tests/agent-control-plane.test.ts](../backend/tests/agent-control-plane.test.ts)
- [backend/tests/ai-federation-phase1.test.ts](../backend/tests/ai-federation-phase1.test.ts)
- [src/modules/atlas-module-registry.test.ts](../src/modules/atlas-module-registry.test.ts)

These tests provide meaningful infrastructure coverage, but not end-to-end proof of live grid source integration or operational engineering correctness.

## Reusable infrastructure — preserve and extend

1. Existing React Command Center modules and visualizations under [src/components/ketraco/command-center/](../src/components/ketraco/command-center/).
2. Existing Digital Twin model, service, and engines under [backend/digital-twin/](../backend/digital-twin/).
3. Data-fabric provider contracts and provider registry under [backend/data-fabric/](../backend/data-fabric/).
4. Express route composition and existing domain services in [server.ts](../server.ts) and [backend/](../backend/).
5. Database lifecycle, migrations, repository foundations, and outbox/idempotency components under [backend/database/](../backend/database/).
6. Event schemas, API, bus, and transport implementation under [backend/event-fabric/](../backend/event-fabric/).
7. Authentication, authorization, audit, policy, and governance foundations under [backend/security/](../backend/security/) and [backend/audit/](../backend/audit/).
8. AI runtime, federation, agent, safety, evaluation, and tool infrastructure under [backend/ai-runtime/](../backend/ai-runtime/), [backend/ai-federation/](../backend/ai-federation/), [backend/agents/](../backend/agents/), and [backend/tools/](../backend/tools/).
9. Existing backend integration/unit tests and evaluation harnesses.

## Recommended enactment sequence

1. **Define source-of-truth and operating modes:** explicitly separate mock, simulation, staging, and operational modes; do not allow mock connectivity to be represented as live.
2. **Prove one real/certified staging grid source:** connect a real or certified staging SCADA/EMS source through the existing data-fabric contract and test connection loss, quality, freshness, and recovery.
3. **Enforce provenance end to end:** attach source, timestamp/freshness, quality, connection state, authority, and simulation/live mode to every grid response and preserve them through API and UI consumers.
4. **Reconcile topology authority:** designate one versioned canonical source and a controlled synchronization path; do not fabricate or silently merge grid topology.
5. **Wire existing realtime infrastructure:** explicitly initialize the chosen WebSocket/SSE transport and event persistence path in server startup; prove frontend delivery and replay through tests.
6. **Validate studies with engineering owners:** verify assumptions, inputs, solver/model capability, reproducibility, and review/approval boundaries for contingency, outage, restoration, and analytics.
7. **Harden production boundaries:** address credentials/token handling, uniform route authorization, tenant isolation, durable audit, production database deployment, and operational readiness reporting.
8. **Ground future AI only in governed sources/tools:** retain the existing AI platform; require provenance, permission checks, audit, evaluation, and explicit simulation-vs-live labeling.

## End-state snapshot

### SAFE TO EXTEND

- Existing Command Center UI and visualization components.
- Existing Digital Twin engine/API decomposition as a reference/simulation platform.
- Provider/data-fabric interfaces, once a real source is implemented and verified.
- Event types, APIs, and current tested event-bus behavior.
- Database migration/repository foundations and AI/agent/tool primitives.

### NEEDS HARDENING

- SCADA provider semantics and data-fabric runtime wiring.
- Topology authority and duplicated canonical data.
- Provenance/freshness/quality and separation of application health from grid readiness.
- Realtime server initialization and end-to-end delivery.
- Auth token/password handling, route policy consistency, tenant isolation.
- Durable domain audit, production persistence, AI fallback signaling, engineering validation and test coverage.

### BLOCKED

- Operational live-grid state, switching/outage authority, and operationally valid state-based studies until an authoritative source and production-safe integration are established.
- Event replay as an authoritative operational history until ingestion and durable retention are proven.
- An engineering copilot that can make operational claims until data grounding, tools, permissions, provenance, and evaluation are validated.

### MISSING

- Demonstrated live SCADA/EMS protocol integration in the default Command Center path.
- Demonstrated authoritative grid GIS/asset synchronization.
- Demonstrated production power-flow/contingency solver integration.
- Demonstrated end-to-end operational restoration command/approval/execution path.
- Demonstrated fully wired, tested Command Center WebSocket/SSE consumer path.
- Demonstrated externally exposed MCP service for Command Center engineering tools.
