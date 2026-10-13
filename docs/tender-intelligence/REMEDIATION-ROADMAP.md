# Tender Intelligence Remediation Roadmap

## Objective

Protect the authoritative Tender Intelligence module while improving its UI clarity, route traceability, and operational documentation without modifying the protected Evaluation OS or altering backend governance rules.

## Phase 0 — Baseline and boundary protection

### Goal

Establish the true route, shell, component chain, API contracts, and persistence dependencies.

### Deliverables

- `docs/tender-intelligence/BASELINE-AUDIT.md`
- `docs/tender-intelligence/TECHNICAL-DEBT-REGISTER.md`
- `docs/tender-intelligence/architecture/DEPENDENCY-GRAPH.md`
- `docs/tender-intelligence/ENACTMENT-LOG.md`

### Verified state

- `/tender` is the active module route
- `/tender/evaluation-os` is the deep link used within the Tender Studio
- `EvaluationOSModuleBoundary` is fail-closed and protected
- Procurement backend contracts and database tables are present and tenant-scoped

### Acceptance gate

- Route is verified
- Boundary is documented
- Dependencies are traced
- No unauthorized backend changes are introduced

## Phase 1 — Enterprise UI upgrade

### Goal

Enhance the existing Tender Intelligence presentation layer with the Atlas command-center visual language while preserving the current architecture and data contracts.

### Safe scope

- UI refinement only in `src/components/ketraco/TenderStudio.tsx` and shared theme primitives in `src/components/ketraco/tender/TenderAITheme.tsx`
- Preserve `EvaluationOSModuleBoundary` as the protective wrapper
- Leave `backend` logic, route contracts, and database schema untouched pending explicit approval

### Acceptance gate

- The UI remains mounted under the same `/tender` route
- No blank workspace, broken tab, or shell clipping issue is introduced
- Loading, empty, error, and unauthorized states remain honest and operational

## Phase 2 — Functional and data integrity remediation

### Goal

Harden the Tender Intelligence module for data integrity and contract compatibility after the visual layer is stable.

### Safe scope

- Review API compatibility between UI payloads and backend routes
- Validate downstream procurement data objects and tenant scoping
- Confirm `procurement_case` and price observation access remains consistent with the UI surface

### Acceptance gate

- Route and data compatibility are maintained
- Authorization is preserved
- Known debt items move from `PARTIAL` or `MISSING` to `VERIFIED` and `RESOLVED`

## Phase 3 — Operating maturity and governance

### Goal

Convert the module from a working interface to a traceable operational asset.

### Safe scope

- Add or refine automated UI tests for route reachability and state transitions
- Maintain the enactment log and technical debt register
- Review whether new data or contract requirements warrant explicit governance documentation

### Acceptance gate

- Documentation and test evidence remain current
- Dev-to-ops handoff is repeatable
- Procurement evidence stays aligned with the business process

## Dependency order

1. Route and ownership baseline
2. Protected boundary preservation
3. UI presentation upgrade
4. API and data integrity recheck
5. Governance and operational documentation

## Current recommendation

Proceed with a documentation-first Phase 0 and UI-preserving visual upgrade, and treat the `Evaluation OS` boundary as a protected dependency rather than a design target.
