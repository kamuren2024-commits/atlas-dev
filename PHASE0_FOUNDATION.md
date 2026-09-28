# Phase 0 Foundation Audit and Implementation Plan

## 1. Current architecture map

The repository currently contains a KETRACO enterprise intelligence platform, but it is procurement/SCM-centric rather than drone-inspection-centric. The main architecture is:

- Front-end: React + Vite SPA under `src/` with operational dashboards and command-center surfaces.
- API layer: Express server in `server.ts` with route groups for auth, AI runtime, evaluation, SCM orchestration, Redis, and agent fabric.
- Enterprise platform core: `backend/security`, `backend/database`, `backend/ai-federation`, `backend/agents`, `backend/evaluation`.
- Knowledge and governance layers: `platform/` and `docs/` contain governance, observability, ontology, memory, workflow, and policy modules.
- Storage: SQLite via `backend/database/db-core.ts`; Redis for queueing and transient state; no dedicated graph database or object store is yet isolated as a first-class Phase 0 contract.

## 2. Existing services

Current service areas identified in the repo:

- `backend/security` – auth, RBAC, auditing, secrets, gateway middleware
- `backend/database` – SQLite bootstrap, migration, health checks, Redis integration
- `backend/ai-federation` – provider registry, routing, telemetry, cost controls
- `backend/agents` – orchestrator, procurement agents, digital twin, knowledge graph
- `backend/evaluation` – evaluation engine, rule engine, decision intelligence
- `src/components/ketraco` – overview, tender studio, digital twin, copilot, approval
- `src/components/intelligence` – monitoring, case management, agent platform
- `platform/*` – self-optimization, governance, workflow, observability, knowledge graph

## 3. Existing database schema

The active transactional database is SQLite and is bootstrapped in `backend/database/db-core.ts`.

Current schema includes tables such as:

- `bidders`
- `documents`
- `pipeline_stages`
- `procurement_rules`
- `audit_logs`
- `ai_execution_logs` (used by runtime and governance)

This is a strong base for enterprise transactional state, but it does not yet include the grid-specific entities required by the prompt: `mission`, `asset`, `inspection`, `evidence`, `defect`, `condition`, `risk`, `work_order`, or `model_version` as first-class tables.

## 4. Existing graph capabilities

The repo clearly contains graph and knowledge-layer concepts through:

- `platform/knowledge-graph`
- `backend/evaluation/knowledge-graph.ts`
- `src/components/ketraco/ProcurementGraphCenter.tsx`
- Agent and ontology modules in `platform/ontology`, `platform/knowledge-lineage`, and the agent fabric.

The current graph layer is conceptually present, but not yet mapped to the KETRACO grid domain or normalized through explicit graph schema and source-of-truth reconciliation rules.

## 5. Existing AI capabilities

The repo already demonstrates:

- provider federation with failover and routing
- model registry and prompt registry
- execution logging and governance
- AI runtime gateway patterns
- multi-agent orchestration and knowledge retrieval

Important implementation detail: the repository already supports a provider abstraction pattern, which aligns well with the Phase 0 requirement to keep AI architecture provider-agnostic.

## 6. Existing UI surfaces

There are multiple operational interfaces already in `src/components`:

- command center and overview surfaces
- digital twin and graph surfaces
- AI runtime dashboards
- agent platforms
- case management and intelligence views
- executive dashboards

These provide a strong UI foundation for the future KETRACO command center, but they still represent the current procurement-oriented domain rather than the transmission-grid evidence chain.

## 7. Existing authentication

Authentication is already implemented in `backend/security/auth-router.ts` and `backend/security/api-gateway-middleware.ts`.

The platform includes:

- tenant-aware auth
- login/refresh/logout flows
- RBAC/ABAC patterns
- session tracking
- audit ledger integration
- authorization middleware

This satisfies the Phase 0 requirement for enterprise identity controls.

## 8. Existing event infrastructure

The repo already has event-like infrastructure through:

- `AgentEventStream`
- `AgentMessageBus`
- `AuditLedger`
- `SCMTelemetry`
- Redis worker queues and event-driven processing patterns

This is sufficient as a foundation for the required grid events, but the canonical event catalog must be explicitly aligned to the inspection pipeline and evidence chain.

## 9. Existing storage

Current storage pattern is:

- SQLite for transactional state
- Redis for transient queueing and worker coordination
- server-side app memory for some runtime state
- no dedicated object storage abstraction for media evidence
- no explicit vector-search or graph-database service layer separated by clear responsibility

This is acceptable for Phase 0 as a foundation, but the platform needs explicit storage responsibilities before moving to media ingestion and visual AI.

## 10. Existing reusable components

The repo already contains reusable enterprise elements:

- authentication and API security
- event and audit abstractions
- AI provider federation
- UI dashboard scaffolding
- graph and digital twin display patterns
- orchestration and agent abstractions

These components are highly reusable for the KETRACO grid intelligence platform, provided they are wrapped behind domain-specific contracts rather than being forced into the current procurement vocabulary.

## 11. Missing capabilities

The key missing capabilities for Phase 0 are:

- explicit `apps/command-center`, `inspection-studio`, `engineering-workbench`, `field-operations`, `executive-intelligence` structure
- explicit `services/ingestion`, `vision`, `asset-resolution`, `graph`, `risk`, `workflow`, `notifications`, `telemetry`, `audit`, `model-serving` structure
- dedicated domain package for mission, asset, defect, condition, workflow, and evidence models
- dedicated contract packages for API and event schemas
- dedicated graph schema package for KETRACO transmission assets
- dedicated UI evidence contracts and observability contracts
- explicit source-of-truth reconciliation rules between transactional DB and graph
- health and audit documentation aligned to the inspection pipeline

## 12. Architecture conflicts

The main conflict is domain mismatch:

- The current repo is procurement-first, not grid-inspection-first.
- The conceptual architecture is strong, but it uses SCM and procurement language and workflows rather than transmission-inspection semantics.

This is not a fatal issue because the repository already has the right architectural qualities: layered APIs, governance, observability, AI federation, and UI shells. The required fix is to add a grid-intelligence domain layer and contracts without disrupting the existing enterprise foundations.

## 13. Phase 0 implementation plan

1. Establish monorepo skeleton under `apps/`, `services/`, and `packages/`.
2. Define canonical domain model for mission, asset, inspection, evidence, defect, condition, risk, workflow, user, and audit.
3. Define versioned event contracts for the inspection state machine.
4. Define graph schema anchored to transmission assets and evidence relationships.
5. Define API contract and UI evidence contract surfaces.
6. Define security and observability contracts.
7. Expose a Phase 0 diagnostics endpoint and keep it isolated from future AI/vision logic.
8. Validate TypeScript compilation and contract coherence before moving to Phase 1.

## 14. Risk register

- Domain mismatch between procurement and grid operations.
- Potential confusion between existing SCM app and new KETRACO mission requirements.
- Risk of prematurely adding vision and workflow logic before contracts are stable.
- Risk of graph and relational database divergence without a reconciliation plan.
- Risk of overbuilding without first proving compile-time contract consistency.

## 15. Dependency graph

The Phase 0 dependencies are intentionally narrow:

- `domain` -> `contracts` -> `graph-schema`
- `contracts` -> `security` / `observability` / `ui`
- `graph-schema` -> `domain`
- `apps/*` and `services/*` depend on the shared package contracts
- `server.ts` exposes the Phase 0 summary endpoint and consumes the shared foundation modules

## 16. Acceptance criteria

Phase 0 is considered complete when all of the following are true:

- the repository has the expected `apps/`, `services/`, and `packages/` structure
- domain models reflect the mission/inspection/evidence chain
- event contracts are versioned and internally consistent
- graph schema is defined for key grid entities and relationships
- API contracts and UI evidence contracts exist
- security and observability contracts are declared
- the codebase compiles without breaking existing behavior
- the architecture is explicitly documented and ready to support media ingestion without advanced AI logic

## Implementation status

This repository already contains a strong enterprise foundation. The missing step was to add a grid-intelligence-specific Phase 0 foundation layer without dismantling the current working architecture. The repository now includes the Phase 0 skeleton under `apps/`, `services/`, and `packages/`, plus the canonical contracts needed for the next phases.
