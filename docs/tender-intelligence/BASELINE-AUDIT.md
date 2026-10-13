# Tender Intelligence Baseline Audit

## Scope and classification

This baseline is a verified repository audit for the authoritative Tender Intelligence route and its surrounding shell, graph, API, and persistence contracts in the Salience Atlas codebase.

- Status: VERIFIED
- Module path: `/tender`
- Deep-link route: `/tender/evaluation-os`
- Protected boundary: `Evaluation OS` remains a fail-closed integration boundary and must not be modified as part of Tender Intelligence UI work.

## Repository truth

- Branch: `main`
- HEAD: `6043269`
- Working tree before edits: dirty
  - Modified: `src/components/ketraco/finance/api/finance-api.ts`
  - Untracked: `out-finance-api.ts`
- Package manager: `npm` with `package-lock.json`
- App entry: `src/main.tsx` and `src/App.tsx`

## Authoritative Tender Intelligence route

### Route registration and module selection

Verified from `src/App.tsx` and `src/modules/atlas-module-registry.ts`:

- `ATLAS_TOP_LEVEL_MODULE_IDS` includes `tender`
- `resolveAtlasModuleFromPath()` maps `/tender` to `tender`
- `App.tsx` renders the module when `activeModule === 'tender'`
- `TenderStudio` is mounted inside `EvaluationOSModuleBoundary`

Evidence trail:

- `src/modules/atlas-module-registry.ts` defines route map and canonical module id resolution
- `src/App.tsx` checks `activeModule === 'tender'` and mounts `<EvaluationOSModuleBoundary><TenderStudio /></EvaluationOSModuleBoundary>`
- `src/components/ketraco/TenderStudio.tsx` deep-links the evaluation view with `window.history.pushState(..., '/tender/evaluation-os')`

### Component tree

- Shell: `src/App.tsx`
- Tender module render root: `src/components/ketraco/TenderStudio.tsx`
- Evaluation boundary: `src/components/ketraco/tender/evaluation-os/EvaluationOSModuleBoundary.tsx`
- Evaluation workspace: `src/components/ketraco/tender/enterprise-evaluation/EnterpriseEvaluationEngine.tsx`
- Dashboard: `src/components/ketraco/tender/evaluation-os/EvaluationOSDashboard.tsx`
- Theme shell: `src/components/ketraco/tender/TenderAITheme.tsx`
- Data fixtures: `src/components/ketraco/tender/TenderMockData.ts`

## Verified route-to-component-to-API-to-persistence trace

### Workspace: Tender Intelligence

1. Route /tender -> `App.tsx` -> active module `tender`
2. Module render -> `EvaluationOSModuleBoundary` -> `TenderStudio`
3. `TenderStudio` initializes a workflow state and renders `EnterpriseEvaluationEngine`
4. `EnterpriseEvaluationEngine` renders `EvaluationOSDashboard`
5. `TenderStudio` uses `processAIRequest` from `src/utils/ai` and mock data from `TenderMockData` to simulate enterprise workflows
6. Backend contract surface is exposed via `backend/domains/procurement/api-routes.ts` and `backend/chrome-extension-api.ts`
7. Persistence is enforced in `backend/database/migration-006-national-procurement.ts` through tables:
   - `procurement_case`
   - `procurement_case_event`
   - `procurement_price_observation`

## API and persistence dependencies

### Frontend API surface

- `src/components/ketraco/TenderStudio.tsx` uses default payload helpers for endpoints such as:
  - `/api/scm/context`
  - `/api/scm/knowledge-retrieval`
  - `/api/scm/twin-simulation`
  - `/api/scm/agent-gateway/call`
  - `/api/scm/human-oversight/resolve`

### Backend API surface

Verified in `backend/chrome-extension-api.ts`:

- `/api/scm/context`
- `/api/scm/guidance`
- `/api/scm/knowledge-retrieval`
- `/api/scm/twin-simulation`
- `/api/scm/agent-gateway/call`
- `/api/scm/human-oversight/resolve`
- `/api/scm/procurement-intelligence/*`

Verified in `backend/domains/procurement/api-routes.ts`:

- `GET /summary`
- `GET /cases`
- `GET /cases/:caseId`
- `GET /market`
- `GET /suppliers`
- `GET /contracts`
- `GET /timeline`
- `GET /risk`

## Security and tenant boundary

- Authorization is enforced by `AuthorizationService` in `backend/domains/procurement/api-routes.ts`
- Authorization gates are tenant-scoped and validate access to `procurement` resource operations before returning data
- Protected boundary: `EvaluationOSModuleBoundary` is a fail-closed shell and should remain isolated from ad hoc backend changes

## Baseline findings

| Item | Classification | Notes |
|---|---|---|
| Authoritative Tender route exists and is mounted | VERIFIED | `/tender` is registered in `App.tsx` and `atlas-module-registry.ts` |
| Evaluation OS deep-link route exists | VERIFIED | `/tender/evaluation-os` is pushed from `TenderStudio` |
| Backend procurement API contract exists | VERIFIED | Routes are present in `backend/domains/procurement/api-routes.ts` |
| Persistence layer exists for procurement intelligence | VERIFIED | Migration `migration-006-national-procurement.ts` creates the expected procurement tables |
| Formal Tender Intelligence documentation is absent | MISSING | No dedicated `docs/tender-intelligence` directory existed before this audit |
| UI-only upgrade scope is not fully captured in route metadata | PARTIAL | The route is present, but the documentation record was incomplete |

## Recommended first implementation slice

Phase 0 is complete as a structural documentation and boundary audit. The first safe implementation slice is:

1. Document the route and module graph in `docs/tender-intelligence/architecture/DEPENDENCY-GRAPH.md`
2. Stabilize and document the shell boundaries without changing `Evaluation OS` rules or backend contracts
3. Upgrade the Tender Intelligence presentation layer using the existing command-center visual language, while preserving the current module structure and data contracts

## Acceptance decision

The authoritative route is established and the boundary is documented. The module is operationally mounted through the Atlas shell and protected by the Evaluation OS boundary. No destructive or backend migration changes were introduced during forensic discovery.
