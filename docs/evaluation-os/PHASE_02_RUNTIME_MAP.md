# Phase 02 Runtime Map

## Runtime classification

| Classification | Implementation | Evidence |
|---|---|---|
| `CURRENT_RUNTIME` | `server.ts` Express process | Mounts `/api/evaluation`, `/api/v2/evaluation`, auth, AI, logistics, and event routers |
| `AUTHORITATIVE_RUNTIME` | `/api/v2/evaluation/*` plus `EvaluationDbService` | V2 router is mounted in `server.ts`; it calls the evaluation database service and governance engines |
| `LEGACY_RUNTIME` | `/api/evaluation/*` and `backend/evaluation/api-routes.ts` | Legacy router is mounted separately and remains for backward compatibility |
| `FALLBACK_RUNTIME` | `DatabaseCore` SQLite fallback | Used only outside production mode; production mode now rejects it |
| `MOCK_RUNTIME` | Development identity users, AI provider fallbacks, fixture data | Used by local development/test paths; not valid for production |
| `TEST_RUNTIME` | `backend/tests/run-tests.ts`, evaluation harnesses | Executable test-only workflows |

## Phase 02 infrastructure status

The PostgreSQL connection, transaction, migration, outbox, OIDC validation,
policy, audit-chain, and replay primitives are implemented as infrastructure
boundaries. They are not yet the authoritative persistence path for all V2 domain
services. `EvaluationDbService` still directly depends on `DatabaseCore`; therefore
production readiness remains `PARTIALLY_IMPLEMENTED` until repository injection
and aggregate migrations are completed.

Redis remains limited to cache, rate limiting, sessions, and ephemeral coordination.
Scores, evidence, approvals, audit, tender state, and verification state must be
persisted through the authoritative repository boundary.
