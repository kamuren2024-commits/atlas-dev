# NATIONAL_GRID_GIS_PHASE_IX_REPORT

## 1. Baseline and inspected files

The starting worktree was clean. The previous same-timestamp/versionless ordering change was present in the current baseline; it was verified by code inspection and the focused tests rather than assumed from the prior report.

Files inspected:

- `backend/event-fabric/state-store.ts`
- `backend/event-fabric/normalizer.ts`
- `backend/event-fabric/event-fabric.ts`
- `backend/event-fabric/projection-adapter.ts`
- `backend/event-fabric/canonical-asset-resolver.ts`
- `backend/event-fabric/types.ts`
- `backend/event-fabric/event-bus.ts`
- `backend/event-fabric/event-api-routes.ts`
- `backend/tests/event-fabric.unit.test.ts`
- `backend/tests/event-fabric.integration.test.ts`
- `backend/digital-twin/canonical-model.ts`
- `server.ts`
- `src/components/ketraco/command-center/CommandCenterShell.tsx`
- `src/components/ketraco/command-center/GridMapCanvas.tsx`
- `src/components/ketraco/command-center/SubstationDetailsPanel.tsx`
- `src/components/ketraco/command-center/grid-canonical-data.ts`
- `package.json`

Changed files:

- `backend/event-fabric/event-fabric.ts`
- `backend/event-fabric/normalizer.ts`
- `backend/event-fabric/projection-adapter.ts`
- `backend/event-fabric/state-store.ts`
- `backend/tests/event-fabric.integration.test.ts`
- `backend/tests/event-fabric.unit.test.ts`
- This report.

No Evaluation OS files or unrelated dirty files were changed.

## 2. Actual architecture and propagation evidence

The backend event path is:

1. `EventFabric.publishEvent()` validates a canonical event with `EventNormalizer`.
2. `EventStateStore.updateFromEvent()` applies the version/idempotency decision and updates accepted asset state.
3. For an accepted event, `SpatialProjectionAdapter` resolves a canonical asset against `CanonicalGridModel` and writes a `SpatialProjectionState`.
4. The event bus delivers to matching subscribers and records event history; persistence, WebSocket and SSE broadcasts are then attempted by `EventFabric`.
5. The HTTP event router exposes event queries and state reads.

The new integration regression uses `SUB_SUSWA`, which exists in the backend canonical model. It demonstrates that the accepted event updates that asset’s state and projection, carries its event ID and voltage data into the projection, and does not create state for `SUB_ISINYA`. Replaying the same event and then an older event leaves the asset event count, last event and projection unchanged.

The UI path is not connected to this backend flow in the inspected implementation:

- `GridMapCanvas` selects an ID from `CANONICAL_SUBSTATIONS`; `CommandCenterShell` then resolves that ID from its in-memory `substations` object and passes the local object directly to `SubstationDetailsPanel`.
- The shell initializes map data from `grid-canonical-data.ts` and updates a selected substation’s load through a deterministic two-second local loop. Its state is marked `OPERATIONAL_SIMULATION` / `SIMULATED`.
- No event-fabric API, WebSocket, SSE, or subscription consumer was found in the Command Center map/panel code. The map-to-panel path therefore does not demonstrate an event-driven UI update.
- The frontend Suswa ID is `suswa`; the backend model ID is `SUB_SUSWA`. The resolver uses exact normalized identifiers and does not establish that these identifiers resolve to each other.

Accordingly, backend state-to-projection propagation is verified; Digital Twin/GIS projection-to-selected-UI propagation is **NOT VERIFIED**.

## 3. Confirmed defects and severity

| Severity | Finding | Evidence / status |
|---|---|---|
| High | Accepted events were version-committed twice before spatial projection. `updateFromEvent()` recorded the event identity/version, then `applyEvent()` attempted to record it again and treated the same event as a duplicate. The initial canonical-asset integration assertion failed because no projection was created. **Corrected and regression-tested.** | `stateStore.updateFromEvent()` return decision now gates projection creation; `applyAcceptedEvent()` projects without making a second version decision. |
| High | Event REST endpoints are mounted without the existing `AuthorizationService` or tenant/resource checks. `createEventApiRouter()` is constructed without authorization dependencies and exposes state, asset-state and event-query routes, as well as subscription management. No tenant filter is applied. **Not corrected in this iteration.** | `server.ts` mounts `/api/events` directly; the event router has no auth middleware. Unauthorized and cross-tenant reads are not denied by this route implementation. |
| Medium | Malformed event timestamps were accepted by validation when non-empty, and an invalid first timestamp could be committed as the version watermark. That could prevent later properly timestamped updates from being ordered. **Corrected and regression-tested** by rejecting invalid/missing timestamps before mutation. | `EventNormalizer.validateEvent()` and `EventStateStore.evaluateSpatialProjectionVersion()` now reject unparseable/missing `timestamp` and invalid supplied `observedAt`. |
| High / acceptance blocker | The current selected-substation UI is backed by local canonical/operational-simulation state and has no demonstrated event-fabric subscription or state fetch. Its selected map ID is not proven to match the backend canonical ID. **Not corrected in this iteration.** | Command Center local initialization/update loop and the separate backend event API; no frontend consumer was found. |

## 4. Surgical changes

- `EventStateStore.updateFromEvent()` now returns the acceptance decision. `EventFabric.publishEvent()` uses that single committed decision to determine whether the spatial adapter may project the event, preventing the second version check from suppressing the first accepted projection.
- `SpatialProjectionAdapter` now shares its accepted-event projection logic between its standalone guarded `applyEvent()` path and the event-fabric accepted-event path. Removed an unused projection-version object that did not participate in the decision.
- Normalizer and state-store timestamp guards reject invalid time input instead of substituting a current timestamp or storing an invalid watermark.
- Regression tests cover distinct versionless events at equal timestamps, strictly older versionless events, duplicates, newer/older versioned events, mixed versionless/versioned ordering, invalid/missing timestamps, and a canonical Suswa event reaching the projection without changing another asset.

Ordering policy exercised and documented in the state-store implementation: omitted versions are treated as version `0`; a lower version is rejected; equal versions are ordered by `observedAt`, and an equal timestamp is accepted when the event identity differs; exact event identity duplicates are rejected. Invalid canonical timestamps or invalid supplied `observedAt` are rejected using the existing `rejected_stale` result to preserve the API’s current decision vocabulary.

## 5. Commands and results

| Command | Exit | Result |
|---|---:|---|
| `node --import tsx --test backend/tests/event-fabric.integration.test.ts` (new projection assertion, before implementation correction) | 1 | Reproduced: expected canonical projection to be defined, actual was `undefined`. |
| `node --import tsx --test backend/tests/event-fabric.unit.test.ts backend/tests/event-fabric.integration.test.ts` | 0 | 38 tests passed; 0 failed, skipped or cancelled. Includes state ordering and canonical event-to-projection regression. |
| `npm run lint` | 0 | `tsc --noEmit` passed. |
| `npm run build` | 0 | Vite production build and bundled server completed. Vite reported existing chunks over 500 kB. |
| `git diff --check` | 0 | No whitespace errors. |

The event-fabric tests emitted persistence shutdown warnings because the test process has `DATABASE_INITIALIZING`; these did not fail the test run. They do not establish persistent-storage behavior.

No browser/UI test was found for the Command Center map or details panel. No live grid provider or authorized GIS runtime was exercised.

## 6. Security, authority, freshness and performance

- **Security:** Event REST state and query routes are publicly mounted in the inspected server composition. No authentication, authorization, tenant isolation or asset-level access check exists in this router. This is a confirmed access-control gap; no security runtime test was run.
- **Authority and provenance:** Spatial projection types include authority/freshness fields, but the adapter assigns `LIVE_AUTHORITATIVE` and `AUTHORITATIVE` to every projected event. A source ID, source authority contract and independent freshness check are not required by that adapter. The inspected panel receives local fixture objects and does not consume the projection’s provenance. End-user traceability is therefore not established.
- **Simulation labeling:** The Command Center code uses `OPERATIONAL_SIMULATION` and `SIMULATED` state and deterministic local changes, not demonstrated live telemetry. The UI itself was not launched to verify the prominence of those labels against its “live SCADA” copy.
- **Performance/resilience:** The event bus bounds retained history at 100,000 entries and existing subscription delivery/error tests pass. No event load, reconnect, repeated UI navigation/remount, selection stability, or whole-grid refresh measurement was run. The local shell’s periodic update clones the substations map; performance at national-grid scale is unmeasured.

## 7. Score (evidence-weighted)

| Criterion | Score | Evidence |
|---|---:|---|
| GIS navigation, selection and spatial drill-down | 6/10 | Map and selection components exist; no browser/runtime verification. |
| Canonical asset identity and substation detail | 5/10 | Backend resolver and detail panel exist, but frontend/backend ID mapping is unproven and data is local. |
| Event ordering, idempotency and state integrity | 14/15 | Deterministic unit regressions cover timestamp, version, duplicate and mixed-version cases. |
| Accepted event to Digital Twin/GIS propagation | 10/20 | Backend canonical state-to-projection integration is now proven; selected UI propagation is absent/unverified. |
| Authority, provenance and freshness | 3/10 | Vocabulary exists, but adapter asserts authoritative/live without verifying source authority or freshness. |
| Transmission topology and connected assets | 3/5 | Static canonical lines and topology display exist; event-linked topology was not verified. |
| Failure recovery and subscription lifecycle | 2/5 | Backend delivery errors are handled/tested; UI reconnect/remount behavior is not implemented or verified here. |
| Authentication, authorization and tenant isolation | 0/10 | Event API is mounted without authorization or tenant/resource checks. |
| Regression coverage, type safety and build health | 9/10 | 38 focused tests, typecheck and build pass; persistence is unavailable in test shutdown, and bundle-size warnings remain. |
| Performance and bounded update behavior | 2/5 | Event history has a cap; national-grid update cost and runtime latency were not measured. |
| **Total** | **54/100** | Backend projection link repaired; live GIS/UI acceptance remains blocked. |

## 8. Remaining blockers and decision

Not verified:

- A live publisher/normalizer event reaches the actual map-selected substation panel.
- The selected UI ID maps to the backend canonical ID without name guessing.
- UI state updates only the selected asset while retaining event provenance and timestamp.
- Older API responses cannot overwrite event-driven UI state.
- UI subscriptions are cleaned up across remounts/navigation and recover after disconnect.
- Live source authority/freshness, topology updates, and map/provider failure behavior.
- Authentication, authorization and cross-tenant denial on GIS/event state routes.
- Browser rendering, actual source data availability, and national-grid performance.

**Recommendation: BLOCK progression to operational GIS acceptance and production claims.** The event-to-backend-projection defect is corrected and verified, but it does not establish the required selected-substation UI propagation. Address the unprotected event API and the missing canonical frontend/backend identity and transport integration in the next hardening iteration before claiming the end-to-end success condition.
