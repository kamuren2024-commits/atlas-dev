# Phase 02 Database Architecture

Status: `PARTIALLY_IMPLEMENTED`

Production target: Evaluation OS services -> repository interfaces -> PostgreSQL.
`backend/database/postgres.ts` provides bounded pooling, statement/connection
timeouts, health checks, transactions, and structured infrastructure errors.
`postgres-migrations.ts` creates migration tracking, durable outbox events,
append-only audit events, and policy-decision persistence.

The existing SQLite `DatabaseCore` remains the development/test implementation.
It is rejected by the production guard and is not claimed as PostgreSQL support.
`EvaluationDbService` now fails construction in production until repository
injection is complete. Full aggregate migration and repository injection remain
required.
