# Trust Plane

## Objective
The trust plane protects mission execution from silently succeeding when the authoritative state cannot be verified. Atlas uses explicit fail-closed semantics: if database, identity, tenant, authorization, approval, evidence, or audit persistence cannot be trusted, the mission is treated as failed or unverified rather than as a successful completion.

## Trust boundary graph
MISSION -> ACTOR / IDENTITY -> TENANT -> RESOURCE -> AUTHORIZATION -> POLICY DECISION -> APPROVAL -> AGENT -> MODEL / TOOL -> ACTION -> EVIDENCE -> AUDIT EVENT -> DURABLE PERSISTENCE

## Invariant
If authoritative trust state cannot be persisted or verified, the operation MUST NOT be represented as successfully completed.

## Current status
- Database state is now explicit via `DatabaseLifecycleState` and `PersistenceResult`.
- Identity and tenant contracts are explicit via `backend/security/trust-plane-contracts.ts`.
- Authorization decisions include typed decision states: ALLOW, DENY, REQUIRE_APPROVAL, etc.
- Evidence and audit semantics remain partially in-memory and must be treated as a known gap unless durable persistence is proven.

## Known gaps
- Full durable audit persistence across process restart has not yet been proven.
- Cross-tenant operation tests and end-to-end mission harnesses are still pending.
- A production-grade persistent datastore boundary beyond SQLite has not been fully established.
