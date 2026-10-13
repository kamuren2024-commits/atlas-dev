# Tender Intelligence Dependency Graph

## Executive summary

The authoritative Tender Intelligence surface is the `tender` module mounted from the top-level Atlas shell. It is rendered through the main application shell, wrapped by the fail-closed Evaluation OS boundary, and backed by procurement-oriented API contracts and persistence tables.

## Graph overview

```mermaid
graph TD
  A[App shell /src/App.tsx] --> B[Atlas module registry /src/modules/atlas-module-registry.ts]
  B --> C[/tender route]
  C --> D[activeModule === 'tender']
  D --> E[TenderStudio /src/components/ketraco/TenderStudio.tsx]
  E --> F[EvaluationOSModuleBoundary /src/components/ketraco/tender/evaluation-os/EvaluationOSModuleBoundary.tsx]
  E --> G[EnterpriseEvaluationEngine /src/components/ketraco/tender/enterprise-evaluation/EnterpriseEvaluationEngine.tsx]
  G --> H[EvaluationOSDashboard /src/components/ketraco/tender/evaluation-os/EvaluationOSDashboard.tsx]
  E --> I[TenderAITheme /src/components/ketraco/tender/TenderAITheme.tsx]
  E --> J[TenderMockData /src/components/ketraco/tender/TenderMockData.ts]
  E --> K[processAIRequest /src/utils/ai]

  L[backend/chrome-extension-api.ts] --> M[/api/scm/context]
  L --> N[/api/scm/guidance]
  L --> O[/api/scm/knowledge-retrieval]
  L --> P[/api/scm/twin-simulation]
  L --> Q[/api/scm/agent-gateway/call]
  L --> R[/api/scm/human-oversight/resolve]

  S[backend/domains/procurement/api-routes.ts] --> T[AuthorizationService]
  S --> U[GET /summary]
  S --> V[GET /cases]
  S --> W[GET /cases/:caseId]
  S --> X[GET /market]
  S --> Y[GET /suppliers]
  S --> Z[GET /contracts]
  S --> AA[GET /timeline]
  S --> AB[GET /risk]

  AC[backend/database/migration-006-national-procurement.ts] --> AD[procurement_case]
  AC --> AE[procurement_case_event]
  AC --> AF[procurement_price_observation]

  U --> AD
  V --> AD
  W --> AD
  X --> AF
```

## Verified route trace

### Route: `/tender`

- Source: `src/modules/atlas-module-registry.ts`
- Module ID: `tender`
- Shell selection: `src/App.tsx`
- Rendered component: `src/components/ketraco/TenderStudio.tsx`
- Safety wrapper: `src/components/ketraco/tender/evaluation-os/EvaluationOSModuleBoundary.tsx`

### Deep link: `/tender/evaluation-os`

- Triggered in `src/components/ketraco/TenderStudio.tsx`
- URL sync uses `window.history.pushState({ tab: 'bids' }, '', '/tender/evaluation-os')`
- Route is legal because the parent module still resolves as `tender` and not as a new, parallel Atlas module

## Shared dependencies and ownership

### Shell / module registry

- `src/App.tsx` owns the top-level module navigation and state machine
- `src/modules/atlas-module-registry.ts` owns canonical module ids and route resolution

### Tender UI

- `src/components/ketraco/TenderStudio.tsx` owns the primary workspace, tabs, workflow state, and deep-link behavior
- `src/components/ketraco/tender/TenderAITheme.tsx` owns the command-center styling and UI primitives
- `src/components/ketraco/tender/TenderMockData.ts` supplies authoritative mock data for the UI and scenario context

### Evaluation OS boundary

- `src/components/ketraco/tender/evaluation-os/EvaluationOSModuleBoundary.tsx` is intentionally fail-closed
- It protects the workspace rendering path without changing the evaluation pipeline itself

### Backend contracts

- `backend/chrome-extension-api.ts` exposes the agent and operational route surfaces around SCM context and guidance
- `backend/domains/procurement/api-routes.ts` exposes the data layer for procurement summary, cases, market data, risks, timelines, and contracts
- `backend/security/authorization-service` is the authorization boundary used for procurement read access

### Persistence

- `backend/database/migration-006-national-procurement.ts` creates the persistence layer for procurement intelligence data
- Primary tables:
  - `procurement_case`
  - `procurement_case_event`
  - `procurement_price_observation`

## Relationship inventory

- Imports: `App.tsx` imports `TenderStudio`, `EvaluationOSModuleBoundary`, and registry helpers
- Renders: `App.tsx` mounts the Tender module conditionally on the active module
- Routes-to-components: `/tender` -> `TenderStudio` -> `EvaluationOSBoundary` -> `EnterpriseEvaluationEngine`
- Components-to-API: `TenderStudio` has endpoint payloads for `context`, `twin-simulation`, and human oversight operations
- API routes-to-services: `procurement/api-routes.ts` calls `AuthorizationService`, `DatabaseCore`, and `AuditLogger`
- Services-to-repositories: procurement routes read from `procurement_case` and related tables
- Authorization dependencies: `AuthorizationService` gate is present before data is returned
- Event subscriptions: not required in the verified base architecture for this module
- Tests: repository test suite is present but not tender-specific; no dedicated harness was identified in the UI path as of baseline

## Verified notes

- The route is real and mounted in the Atlas shell.
- The production path is not a competing implementation; it is the active module already wired in `App.tsx`.
- The Evaluation OS boundary is a protected integration boundary and not part of the UI redesign surface.
- The procurement backend surfaces are authoritative and persist in the database migration layer.

## Acceptance status

VERIFIED: route-to-component-to-backend-to-persistence chain is established for the Tender Intelligence workspace.
