# Phase 02 Completion Gap

Status: `PARTIALLY_IMPLEMENTED`

This matrix is based on the current runtime imports. The V2 router resolves
`EvaluationDbService`, and `EvaluationDbService` directly resolves
`DatabaseCore`; therefore the production V2 mutation path still reaches SQLite
until repository injection is completed.

| Operation | Current persistence | Required persistence | Audit | Outbox | Policy | Status |
|---|---|---|---|---|---|---|
| Tender creation | Legacy/V2 service path | PostgreSQL tender/version repository | Partial legacy ledger | Missing | Partial RBAC | BLOCKED |
| Tender update/lock | SQLite domain tables | PostgreSQL immutable version | Partial legacy ledger | Missing | Partial | BLOCKED |
| Bid creation/submission | SQLite domain tables | PostgreSQL bid/version repository | Partial | Missing | Partial | BLOCKED |
| Evaluation creation/start | SQLite workflow/domain state | PostgreSQL evaluation/version repository | Partial | Missing | Partial | BLOCKED |
| Committee assignment | SQLite committee tables | PostgreSQL committee/member repository | Partial | Missing | Partial | BLOCKED |
| Requirement evaluation | SQLite requirements/evidence tables | PostgreSQL requirement/response repository | Partial | Missing | Partial | BLOCKED |
| Score submission | `EvaluationDbService` -> `DatabaseCore` in development; production now fails closed | PostgreSQL score/version repository | Same SQLite transaction in development | PostgreSQL helper exists but not wired | Route RBAC; OPA client exists but not wired | BLOCKED |
| Score modification | In-place SQLite update plus version integer | Append-only PostgreSQL score version | Partial | Missing | No OPA decision | BLOCKED |
| Evidence creation | SQLite metadata and local file path | PostgreSQL metadata plus MinIO/S3 object version | Partial | Missing | Partial | BLOCKED |
| Verification | In-memory service contract | PostgreSQL verification/version repository | Missing | Missing | Partial | BLOCKED |
| Finding creation | Existing domain services | PostgreSQL finding/evidence references | Partial | Missing | Partial | BLOCKED |
| Approval decision | Workflow/domain services | PostgreSQL approval/decision repository | Partial | Missing | Partial | BLOCKED |
| Evaluation finalization | Workflow state machine and SQLite | PostgreSQL immutable decision/version | Partial | Missing | Partial | BLOCKED |

## Implemented foundations

- PostgreSQL pool, transaction manager, health check, and schema foundation exist.
- OIDC/JWKS validation is wired into production authentication middleware.
- Outbox and audit tables exist in the PostgreSQL foundation migration.
- Replay and audit-chain primitives exist.

## Completion blockers

1. Inject repository interfaces into `EvaluationDbService`.
2. Migrate statutory aggregate operations to PostgreSQL repositories.
3. Couple material mutations to PostgreSQL audit and outbox writes.
4. Connect actual OPA and S3-compatible services.
5. Execute deployment-backed PostgreSQL, OPA, MinIO, OIDC, and cross-service tests.

## New enforcement

- `EVALUATION_OS_PRODUCTION_MODE=true` cannot construct `EvaluationDbService`
  while it still depends on `DatabaseCore`.
- PostgreSQL foundation migration includes scoped idempotency records.
- `claimIdempotencyKey` distinguishes replay from conflicting payload reuse.
- `S3ObjectStore` performs real S3-compatible upload, metadata readback, and
  content-hash verification.
