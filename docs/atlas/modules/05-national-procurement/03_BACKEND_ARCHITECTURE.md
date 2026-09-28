# Backend Architecture

**Change ID:** ATLAS-NPI-BE-001

`DatabaseCore` applies migration 006. `createProcurementApiRouter` is mounted
at `/api/procurement` after authentication and delegates authorization to
`AuthorizationService`. No procurement write route is exposed.
