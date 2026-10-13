# Tender Intelligence Technical Debt Register

## Purpose

This register captures the issues that materially affect the Tender Intelligence command center, route integrity, documentation, and upgrade safety as observed in the repository baseline.

| ID | Category | Exact file / route / component | Severity | Status | Root cause | Remediation phase |
|---|---|---|---|---|---|---|
| TI-UI-001 | Documentation & traceability | `docs/tender-intelligence/*` (missing before baseline) | P1 | MISSING | The module route, route contract, API contract, and persistence chain were not formally documented in a dedicated tender-intelligence dossier | Phase 0 |
| TI-UI-002 | Route integrity | `src/modules/atlas-module-registry.ts`, `src/App.tsx` | P2 | PARTIAL | Module registration exists, but the route metadata and deep-link behavior are not explicitly documented as an integration contract | Phase 0 |
| TI-UI-003 | Protected-boundary governance | `src/components/ketraco/tender/evaluation-os/EvaluationOSModuleBoundary.tsx` | P1 | VERIFIED | The boundary is fail-closed and must be preserved, but its role in the upgrade path was not clearly logged as a protected contract | Phase 0 |
| TI-UI-004 | API contract visibility | `backend/domains/procurement/api-routes.ts`, `backend/chrome-extension-api.ts` | P2 | VERIFIED | Contract surfaces exist but are not visibly linked to the UI route in a single dependency graph document | Phase 0 |

## Detailed debt records

### TI-UI-001 — Missing Tender Intelligence documentation dossier
- Category: Documentation & traceability
- Exact file: `docs/tender-intelligence/*` (missing before baseline)
- Evidence: No dedicated Tender Intelligence architecture or enactment records existed in the repository before the baseline audit
- Severity: P1
- Status classification: MISSING
- Operational impact: High risk of drift between the route, the UI shell, and the API/persistence layer
- Procurement/governance impact: Moderate — approval and evidence traceability for tender workflows is harder to audit
- Security/data-integrity impact: Low to moderate — without an explicit route and contract record, change tracking is weaker
- Root cause: Missing operational dossier for an active mission-critical app surface
- Proposed resolution: Create the tender-intelligence documentation set and maintain route-to-persistence traceability
- Dependencies: App route registry, API routes, database migrations, evaluation boundary
- Effort range: S (1-2 days)
- Regression risks: Low if documents remain descriptive and non-authoritative
- Acceptance criteria: Route, component, API, and data dependencies are explicitly captured and reviewed
- Test evidence: Verified absence before creation; repository audit confirms the gap
- Current remediation phase: Phase 0

### TI-UI-002 — Route metadata not explicitly codified
- Category: Route integrity
- Exact files: `src/modules/atlas-module-registry.ts`, `src/App.tsx`
- Evidence: The route exists and is wired, but the formal route-to-component contract is not captured in a dedicated Tender Intelligence design doc
- Severity: P2
- Status classification: PARTIAL
- Operational impact: Low to moderate — route behavior is present, but path contract ownership is implicit
- Procurement/governance impact: Moderate — deep-linking and approval paths need traceability
- Security/data-integrity impact: Low
- Root cause: Custom route resolution is logic-driven but lacks explicit documentation
- Proposed resolution: Document the route mapping and deep-link path in the dependency graph and remediation roadmap
- Dependencies: App shell, module registry, evaluation deep link
- Effort range: S
- Regression risks: Very low
- Acceptance criteria: Route mappings are explicitly recorded and match runtime behavior
- Test evidence: Verified in code and module render tree
- Current remediation phase: Phase 0

### TI-UI-003 — Evaluation OS guardrail is protected but under-documented
- Category: Protected-boundary governance
- Exact file: `src/components/ketraco/tender/evaluation-os/EvaluationOSModuleBoundary.tsx`
- Evidence: Class boundary uses `getDerivedStateFromError` and displays a fail-closed shell
- Severity: P1
- Status classification: VERIFIED
- Operational impact: Moderate — this boundary prevents a bad render from destabilizing the workflow
- Procurement/governance impact: High — authority and evidence provenance must remain outside the UI risk surface
- Security/data-integrity impact: Moderate — fail-closed protects against unauthorized or unstable evaluation rendering
- Root cause: Boundary protection exists, but not fully documented as a protected interface boundary
- Proposed resolution: Preserve the fail-closed contract and reference it in architecture and roadmaps
- Dependencies: Tender UI, Evaluation OS, module export boundaries
- Effort range: S
- Regression risks: Medium if modified by UI work
- Acceptance criteria: The Evaluation OS boundary remains untouched while the Tender UI is upgraded
- Test evidence: Runtime-shell implementation observed in the code
- Current remediation phase: Phase 0

### TI-UI-004 — API contracts lack a single UI-to-backend lineage record
- Category: API contract visibility
- Exact files: `backend/domains/procurement/api-routes.ts`, `backend/chrome-extension-api.ts`
- Evidence: API contracts are present in code, but not part of a route-trace architecture file
- Severity: P2
- Status classification: VERIFIED
- Operational impact: Moderate — API integration changes can be difficult to track without a formal route lineage
- Procurement/governance impact: Moderate — approval and evidence data may be misread when route ownership is not captured
- Security/data-integrity impact: Low to moderate — tenant-scoped auth should remain explicit as changes proceed
- Root cause: Contract existence is not paired with a visible dependency graph or route trace
- Proposed resolution: Add `DEPENDENCY-GRAPH.md` with explicit route-to-component-to-API-to-persistence mapping
- Dependencies: App render tree, procurement APIs, procurement migrations
- Effort range: S
- Regression risks: Low
- Acceptance criteria: A single dependency graph names every material API route and persistence node tied to Tender Intelligence
- Test evidence: Verified in the source tree
- Current remediation phase: Phase 0

## Ranking and priority

1. TI-UI-001 — Missing architecture dossier
2. TI-UI-003 — Protected boundary governance
3. TI-UI-004 — API contract traceability
4. TI-UI-002 — Route metadata documentation

## Residual risk

This register documents the major known debt after repository baseline discovery. The module is present and mounted, but the documentation backbone and route trace remain incomplete. The highest risk is not a broken route; it is the lack of a documented and reviewed integration boundary for future UI hardening work.
