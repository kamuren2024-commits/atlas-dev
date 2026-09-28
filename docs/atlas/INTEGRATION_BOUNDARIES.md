# Atlas Integration Boundaries

## Current boundaries

- Existing domain APIs remain owners of their behavior and persistence.
- `packages/platform` owns shared metadata contracts and registries.
- `packages/contracts` owns cross-module envelopes and shared vocabularies.
- Existing AI Federation remains the owner of provider routing.
- Existing event-fabric and loop event systems remain operational; no mass migration occurs.
- Existing authentication and authorization remain authoritative.

## Connector policy

Future SAP, SCADA, GIS, Ariba, and document connectors must report one of `NOT_CONFIGURED`, `CONFIGURED`, `HEALTHY`, `DEGRADED`, `OFFLINE`, or `ERROR`. No connector may display `HEALTHY` without a verified health check.
