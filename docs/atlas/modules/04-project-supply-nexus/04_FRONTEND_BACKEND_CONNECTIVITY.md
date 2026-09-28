# Frontend/Backend Connectivity

| Page/component | Hook/client | API/data source | Status |
|---|---|---|---|
| `ProjectSupplyNexus` | direct fetch | `/api/project-supply/projects/project-suswa-04` | PARTIAL; empty requirement set is UNAVAILABLE |
| Existing procurement watch | direct fetch | `/api/scm/procurement-intelligence/entities` | Removed from Nexus readiness path |
| Project planning map | direct engine import | synthetic planning engine | DEGRADED / fixture-modelled |

No UI percentage is presented as live readiness without persisted requirement
evidence.
