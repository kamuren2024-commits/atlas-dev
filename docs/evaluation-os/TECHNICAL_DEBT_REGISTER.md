# Evaluation OS Technical Debt Register

Status: forensic baseline, 2026-09-22. This register is based on source inspection and completed commands; it is not a claim that every item is remediated.

| Debt ID | Severity | Component / files | Current behavior | Impact | Remediation | Status |
|---|---|---|---|---|---|---|
| TD-P0-001 | P0 | `backend/evaluation/evaluation-db-service.ts`, `backend/evaluation/v2-routes.ts` | V2 application mutations still reach `DatabaseCore`/SQLite. | Statutory state is not PostgreSQL-authoritative in the current runtime. | Inject PostgreSQL repositories for tender, bid, score, evidence, workflow, and audit operations; retain SQLite only for development/tests. | BLOCKED: repository migration incomplete |
| TD-P0-002 | P0 | `backend/evaluation/governance/mandatory-engine.ts` | Seeded/demo documents and `Record<string, any>` are present in a legal evaluation component. | Risk of confusing synthetic fixtures with authoritative evidence. | Move fixtures to test-only modules; production constructor must require repository-backed evidence. | PARTIAL: documented; code migration remains |
| TD-P0-003 | P0 | `backend/evaluation/decision-engine.ts` | In-memory singleton recommendations can look like decision state. | Non-reconstructible and non-durable material decision path. | Use `DecisionTraceRepository`; keep recommendations advisory and require persisted human decision. | PARTIAL: trace repository added |
| TD-P1-001 | P1 | `backend/evaluation/governance/workflow-state-machine.ts` | In-memory workflow state machine remains active compatibility path. | Restart/lifecycle and legal-gate reliability risk. | Replace production wiring with durable workflow adapter and reject in-memory provider in production. | OPEN |
| TD-P1-002 | P1 | `backend/event-fabric/event-bus.ts`, `sqlite-event-store.ts` | In-process and SQLite event paths remain available. | Duplicate production event authority and replay inconsistency. | Route production events through PostgreSQL outbox and Kafka-compatible publisher. | OPEN |
| TD-P1-003 | P1 | `backend/security/api-gateway-middleware.ts` | Production OIDC path exists; local identity remains outside production. | Configuration drift can create an unsafe deployment. | Keep startup fail-closed and add deployment-backed OIDC tests. | PARTIAL |
| TD-P1-004 | P1 | MCP security and connector modules | Allowlist/DNS checks exist but redirect/rebinding/response-size enforcement is incomplete. | SSRF and connector abuse risk. | Pin validated addresses at connection time, disable redirects by default, enforce ports and response limits. | OPEN |
| TD-P2-001 | P2 | `backend/ai-federation/**` | Multiple provider and gateway abstractions exist. | Provider leakage and inconsistent provenance/timeout behavior. | Make one production AI gateway boundary and require provenance on material outputs. | OPEN |
| TD-P2-002 | P2 | `package.json`, `package-lock.json` | Production audit previously reported 7 vulnerabilities; forced upgrade was not safe. | Dependency exposure requires a planned compatibility upgrade. | Review advisories, upgrade in tested batches, and remove unused packages only after reference analysis. | OPEN |
| TD-P3-001 | P3 | backend test harness | Unified tests use broad `any`/console output and do not cover live PostgreSQL/OPA/Redpanda. | Lower diagnostic and contract confidence. | Add architecture/contract/security suites when services are available. | PARTIAL |

## Classification rules

- P0: production blocker or legal/data-integrity risk.
- P1: serious architecture, security, or reliability risk.
- P2: maintainability or performance risk.
- P3: quality and cleanup risk.

## Current counts

P0: 3 (0 fully remediated, 3 partial/blocked); P1: 4 (0 fully remediated, 4 partial/open); P2: 2 open; P3: 1 partial.
