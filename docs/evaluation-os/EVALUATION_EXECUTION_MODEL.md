# Evaluation Execution Model

**Status: PARTIAL / DEVELOPMENT PERSISTENCE ONLY**

## Current runtime path

The Evaluation OS dashboard is mounted from `TenderStudio`. The UI requests workspace rows and activity through `/api/v2/evaluation`; those routes use `EvaluationDbService`, which accesses the SQLite-oriented `DatabaseCore`. The UI now starts with empty row, audit, and stage collections and reports request errors instead of inserting hardcoded evaluation fixtures. The Evaluation OS is not passed TenderStudio's static selected tender as an authoritative tender.

`EvaluationDbService` refuses production construction until PostgreSQL repository injection is available. `server.ts` also blocks production startup when SQLite fallback is selected. A standalone PostgreSQL connection/transaction implementation exists, but it is not the repository used by the Evaluation OS.

The older `/api/evaluation` document endpoints use local filesystem storage and are not the authoritative evaluation application service. They remain a duplicate/legacy integration surface.

## Active safeguards in this change

- Unknown tender IDs return no evaluation rows; the service no longer substitutes `TND-2026-08`.
- Workspace row, document, activity, task, search, clarification, and audit reads require an explicit `tenderId` instead of defaulting to a seeded record.
- UI errors are surfaced; no bundled bidder/score/audit rows are displayed as live state.
- In-memory workflow, criteria, findings, agent, AI, external connector, and report endpoints that could imply authoritative results now return explicit unavailable/not-configured responses.
- Score service resubmission is rejected rather than updating a prior evaluator score in place. The REST score command remains unavailable until assignment and policy authorization are enforced.

## Not implemented

There is no production repository injection, authoritative tender/version API, tenant boundary in the Evaluation OS schema, persisted command authorization, bid lifecycle, event/outbox integration, configured workflow engine, or completed end-to-end UI workflow. Do not infer these capabilities from adjacent platform packages.
