# Backend Architecture

`createProjectSupplyApiRouter` authenticates at `/api/project-supply`, checks
tenant/resource authorization, loads requirements with bounded pagination-free
project scope, aggregates logistics stock and order-item evidence, calculates
positions using a pure function, emits audit records, and returns explicit
data status. The route does not execute procurement or workflow actions.

Change IDs: `ATLAS-PSN-BE-001`, `ATLAS-PSN-SEC-001`, `ATLAS-PSN-OBS-001`.
