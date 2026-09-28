# Backend Architecture

`createSupplierApiRouter` is mounted at `/api/suppliers` after authentication.
It uses `AuthorizationService`, `AuditLogger`, `DatabaseCore` and the shared
`KnowledgeGraphService` projection. Performance calculations are pure and
provider-neutral in `backend/domains/supplier/intelligence.ts`.
