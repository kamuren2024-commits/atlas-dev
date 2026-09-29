# Phase 06 Runtime Inventory

**Inspection date:** 2026-09-28  
**Scope:** Current repository runtime wiring for the Evaluation OS. This is a forensic inventory, not a claim of production readiness or external integration.

## Executive finding

There is no single authoritative, production-usable evaluation lifecycle in the current runtime. The richest implementation is the `/api/v2/evaluation` route family backed by `EvaluationDbService` and the SQLite-oriented `DatabaseCore`, but its domain migration seeds fabricated KETRACO/tender/bidder records and the service explicitly rejects production startup until a PostgreSQL repository is injected. The Evaluation OS UI independently declares synthetic tender, bidder, score, lifecycle, and audit fixtures and falls back to them when API data is missing. A second `/api/evaluation` API provides filesystem document storage but no authoritative evaluation lifecycle. These paths compete and must not be treated as one verified system.

No code is classified `AUTHORITATIVE` for a real procurement evaluation in the deployed/production sense. `AUTHORITATIVE` below means the intended domain owner in this repository, not that real records, production persistence, or statutory validity have been demonstrated.

## Runtime entry points and API map

| Capability | Runtime surface | Classification | Evidence / current limitation |
|---|---|---|---|
| Server/API mounting | `server.ts` mounts `/api/evaluation`, `/api/v2/evaluation`, `/api/v3`, `/api/knowledge-graph`, `/api/procurement`, and `/api/events`. | `INCOMPLETE` | `/api/evaluation` and `/api/v2/evaluation` are separately implemented and both are active. |
| Tender APIs | `/api/v2/evaluation` exposes `GET /governance/status` and contract/gate metadata; `/api/procurement` is a separate procurement domain router. | `INCOMPLETE` | No complete tender create/read/version/lock API exists in the v2 evaluation route family. `/api/procurement` is not wired to the evaluation plan/version contract. |
| Tender version APIs | No dedicated versioned tender-version API found in the mounted Evaluation OS routes. `EvaluationContractManager` holds a seeded in-memory contract and amendment shape. | `INCOMPLETE` | No durable immutable `TenderVersion` record or evaluation-to-version foreign key is established by the inspected schema. |
| Bid APIs | No canonical bid submission/opening API found in the evaluation route families. `evaluation_bidders` is populated by the domain migration. | `INCOMPLETE` | Bidder rows are not a substitute for immutable bid submission/opening records. |
| Evaluation APIs | `/api/v2/evaluation/rows`, `/tasks`, `/activity`, `/findings`, `/agents`, and `/search`. | `DUPLICATE` | These routes use `EvaluationDbService` plus in-memory governance singletons; several return synthetic/default values. |
| Legacy document APIs | `/api/evaluation/documents/upload`, `/documents`, `/:documentId`, `/:documentId/status`, `/:documentId/extracted-text`, `/:documentId/trigger`, and `DELETE /:documentId`. | `LEGACY` | Uses `documentStorage` filesystem artifacts and `documentProcessor`; separate from v2 `evaluation_documents`/`evaluation_evidences`. |
| V2 document/evidence APIs | `/api/v2/evaluation/documents`, `/:id`, and `/documents/upload`. | `INCOMPLETE` | Uses `EvaluationDbService`; evidence references have partial document/hash representation, but no complete provenance-aware evidence lifecycle or verifier authorization was verified. |
| Requirement APIs | `/api/v2/evaluation/governance/mandatory/:bidderId`; requirements/criteria are read internally by the DB service. | `INCOMPLETE` | No canonical requirement CRUD/version/decision API. Mandatory endpoint derives bidder naming from hardcoded ID cases and an in-memory engine. |
| Scoring APIs | `/api/v2/evaluation/scores/submit`. | `INCOMPLETE` | Checks evidence and recusal, but derives actor identity from request fields outside production mode and updates an existing evaluator score row in place on resubmission. There is no append-only amendment/version record. |
| Committee APIs | `/api/v2/evaluation/committee/session` and `/committee/consensus`. | `INCOMPLETE` | Persistence exists for committee sessions, but request data/default actors and in-memory workflow state do not demonstrate authenticated, versioned committee decisions. |
| Decision APIs | No distinct evaluation decision, professional-opinion, approval, notification, award, or contract decision endpoint found in the inspected evaluation routers. | `NOT_IMPLEMENTED` | The v2 workflow transition route is not a substitute for separately governed decision gates. |
| Approval APIs | No distinct approval API found in the Evaluation OS route families. | `NOT_IMPLEMENTED` | Approval-like states exist in workflow/contracts but no durable human approval command with actor authorization was found. |
| Audit APIs | `/api/v2/evaluation/audit/blocks`, `/audit/verify-db`, `/audit/reconstruct-db`, `/governance/audit/verify`, and `/governance/audit/reconstruct`. | `INCOMPLETE` | `evaluation_audit_blocks` is database-backed and hash-chained, while `ImmutableAuditLedgerService` is a separate in-memory ledger; the UI also has static audit fallback data. Chain integrity does not itself establish append-only database enforcement. |
| Reporting APIs | `/api/v2/evaluation/reports/:type` and `/governance/reports/scm08`. | `INCOMPLETE` | Reporting engine exists, but report snapshots/immutable versions and the full decision package were not verified. |
| External reporting | `/api/v2/evaluation/governance/egps/sync`. | `MOCK` | `KenyaEGPSAdapterService` is not evidence of authorized/configured/verified external connectivity. Never present a simulated sync as a submission. |
| Knowledge graph/twin APIs | `/api/v3/*` and alias `/api/knowledge-graph/*`. | `DUPLICATE` | Separate in-memory graph/twin/collusion implementations; not authoritative evaluation/evidence state. Some twin endpoints synthesize fallback supplier/tender data. |

## Frontend routes, hooks, and runtime data

| Surface | Classification | Evidence / current limitation |
|---|---|---|
| `src/components/ketraco/TenderStudio.tsx` | `INCOMPLETE` | Main tender shell mounts the Evaluation OS but retains default tender identifiers and other demo-state wiring. |
| `src/components/ketraco/tender/enterprise-evaluation/EnterpriseEvaluationEngine.tsx` | `DUPLICATE` | Presentation wrapper delegates to the Evaluation OS dashboard; older enterprise subcomponents remain exported. |
| `src/components/ketraco/tender/evaluation-os/EvaluationOSDashboard.tsx` | `INCOMPLETE` | Central workspace layout exists; defaults selected evaluation identity and presents API-backed actions, but depends on the hook's fallback behavior. |
| `src/components/ketraco/tender/evaluation-os/useEvaluationData.ts` | `MOCK` | Contains `DEFAULT_TENDER_CONTEXT`, `DEFAULT_LIFECYCLE_STAGES`, `BASE_EVALUATION_ROWS`, `BASE_AUDIT_EVENTS`; fixed tender IDs in requests; substitutes static rows/events on empty or failed API requests. |
| `src/components/ketraco/tender/TenderMockData.ts` | `MOCK` | Static tender, bidder, contract, bid, and plan datasets. Not authoritative procurement records. |
| Other UI modules under `src/components/ketraco/tender/evaluation-os/` | `INCOMPLETE` | Lifecycle, table, audit, evidence, and governance panels are present, but visual controls must be traced to the server command and authorization before being considered operational. |
| `src/components/ketraco/tender/enterprise-evaluation/` | `LEGACY` | Retained inspection/intelligence screens and components; overlaps with the newer Evaluation OS workspace. |

## Domain services and persistence

| Component | Classification | Evidence / current limitation |
|---|---|---|
| `backend/evaluation/evaluation-db-service.ts` | `INCOMPLETE` | Most substantial relational evaluation service. Uses `DatabaseCore`; production constructor throws until PostgreSQL repository injection. `getEvaluationRows` falls back to a hardcoded tender ID when the requested tender is absent. |
| `backend/database/db-core.ts` | `INCOMPLETE` | SQLite/development-oriented core, migrations, and transaction methods are used by server/test startup. |
| `backend/database/postgres.ts` | `INCOMPLETE` | PostgreSQL connection and transaction primitives exist, but the Evaluation OS service is not injected with this repository. |
| `backend/database/migration-013-evaluation-os-domain.ts` | `MOCK` | Creates 13 domain tables, then seeds a KETRACO tender and related evaluation data when absent. This is synthetic seed data, not verified government data, and the seed is not guarded as test/demo-only in this migration. |
| `backend/database/repositories.ts`, `persistence-contract.ts` | `INCOMPLETE` | Shared persistence contracts/repositories exist; no evidence they are the single active repository for evaluation commands. |
| `backend/evaluation/document-storage.ts` and `document-processor.ts` | `LEGACY` | Filesystem document/artifact processing path. Separate from v2 relational document/evidence persistence. |
| `backend/evaluation/evidence-repository.ts`, `evidence-schema.ts`, `evidence-validator.ts`, `evidence-extractor.ts` | `INCOMPLETE` | Evidence domain code exists, but these components do not establish that every evaluation decision references verified, versioned, tenant-scoped object-store evidence. |
| `backend/evaluation/digital-twin-service.ts` | `DUPLICATE` | Separate twin representation; not an authoritative versioned source for tender or bid records. |

## Workflow, scoring, policy, events, and audit

| Component | Classification | Evidence / current limitation |
|---|---|---|
| `backend/evaluation/governance/workflow-state-machine.ts` | `MOCK` | In-memory singleton seeds `TND-2026-08` in `TECHNICAL` with a fabricated transition history and actors. Fixed global stages are not tender-plan-driven. |
| `backend/evaluation/governance/evaluation-contract.ts` | `MOCK` | In-memory singleton seeds a locked tender contract, criteria, and committee. It is not tied to an immutable persisted tender version. |
| `backend/evaluation/governance/technical-financial-engines.ts` | `INCOMPLETE` | Deterministic engine exists but must not override tender-specific plan methodology or replace persisted input/evidence/version/calculation provenance. |
| `backend/evaluation/governance/mandatory-engine.ts` | `INCOMPLETE` | Mandatory engine exists, but route integration uses synthetic bidder naming and is not the sole persisted requirement-decision path. |
| `backend/evaluation/governance/segregation-of-duties.ts` | `INCOMPLETE` | Authorization/conflict rules exist; v2 handlers construct principals from request data in non-production mode and synthesize assignment scope. |
| `backend/evaluation/governance/immutable-audit-ledger.ts` | `DUPLICATE` | Separate in-memory ledger alongside database `evaluation_audit_blocks`. |
| `backend/event-fabric/*` | `INCOMPLETE` | Event bus/fabric, SQLite persistence, idempotency, and API are implemented as platform capabilities; evaluation command-to-event publication and transactional outbox behavior were not established as a single integrated flow. |
| `backend/workflow/durable-workflow.ts` | `INCOMPLETE` | Durable workflow infrastructure exists but is not demonstrated as the workflow engine backing v2 evaluation state transitions. |
| `backend/governance/policy-engine.ts`, `backend/security/authorization-service.ts`, `backend/security/api-gateway-middleware.ts` | `INCOMPLETE` | Policy/identity infrastructure exists. V2 router applies authentication only in production mode; non-production command routes accept client-provided actors/roles. Production cannot currently use v2 because of the repository guard above. |
| `backend/observability/audit-logger.ts` | `INCOMPLETE` | General audit logging exists, but no evidence every material evaluation command, replay, export, and reporting action is correlated and durably recorded through it. |

## Duplicates and source-of-truth decision

1. `/api/v2/evaluation` plus `EvaluationDbService` is the closest intended evaluation domain surface, but it is **not currently an operational authority**: synthetic migration seed data, SQLite-only service injection, in-memory governance singletons, and incomplete command authorization/versioning prevent that designation.
2. `/api/evaluation` plus `documentStorage`/`documentProcessor` is a legacy document pipeline and must not be expanded into a second evaluation engine.
3. `EvaluationContractManager`, `ProcurementWorkflowStateMachine`, and `ImmutableAuditLedgerService` duplicate the purposes of relational criteria/workflow/audit tables and are in-memory. They must not be assumed to override or represent persisted state.
4. The current frontend mock fallback and `TenderMockData.ts` are mock sources, not a fail-closed empty state.
5. The Procurement router, event fabric, durable workflow, PostgreSQL primitives, and policy services are adjacent infrastructure; their existence alone does not prove Evaluation OS integration.

## Required remediation order

1. Keep this inventory as the baseline; preserve the currently dirty, unrelated `GlobalSidebar.tsx` and `ShellContext.tsx` changes.
2. Stop static frontend fallback from rendering as real procurement/evaluation state. Display an explicit empty/error state when the API has no authoritative records.
3. Stop seeding fabricated procurement records through normal runtime migrations; allow synthetic fixtures only in explicitly isolated test/demo environments.
4. Choose one persistence-backed application service and route family before implementing new lifecycle behavior. Do not add another database or competing score/workflow implementation.
5. Replace client-supplied actor/role defaults with authenticated principal, tenant, assignment, and policy checks for all commands.
6. Preserve score/evidence/audit history append-only; add concurrency/idempotency and tenant isolation at the persistence boundary.
7. Make each later Phase 06 capability and its status explicit in its own model, API, UI path, and regression/acceptance tests before claiming completion.

## Validation status

This inventory is based on source inspection. It does not claim that the end-to-end UI, database, authorization, event, workflow, replay, or external reporting acceptance scenarios pass. The authoritative commands and focused test coverage are to be run after the first runtime correction.
