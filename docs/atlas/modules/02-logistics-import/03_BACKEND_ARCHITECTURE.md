# Backend Architecture

`createLogisticsApiRouter` remains mounted under `/api/logistics` behind the
existing authentication middleware. Queries use `DatabaseCore`, authorization
uses `AuthorizationService`, and access is audited by `AuditLogger`.
`data-quality.ts` is a pure source-freshness contract; it does not create
synthetic timestamps or external import state.
