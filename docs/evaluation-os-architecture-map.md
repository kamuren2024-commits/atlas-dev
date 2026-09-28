# Evaluation OS — Architecture Map (Phase 1)

> **Architectural Status**: Phase 1 — UI → Application Architecture Integration Complete  
> **Product Hierarchy**: `Salience Atlas` → `Tender Intelligence` → `Evaluation OS`

---

## 1. Executive Architecture Summary

Evaluation OS is an embedded, first-class statutory sub-module of **Tender Intelligence** inside **Salience Atlas**. It provides continuous, explainable procurement bid evaluation under the Public Procurement and Asset Disposal Act (PPADA 2015) and Regulations (PPADR 2020).

```text
Salience Atlas (Root Platform Shell)
│
├── App.tsx (Routing, JWT Auth, Tenant Context, ShellProvider)
│   │
│   └── Global Shell (GlobalHeader, GlobalSidebar, TransparentFooter)
│       └── activeModule: 'tender' (/tender, /tender/evaluation-os)
│           │
│           └── TenderStudio.tsx (Tender Intelligence Command Center)
│               ├── Tender Intelligence Layout & Sidebar (16 AI Workspaces)
│               ├── Breadcrumb: Salience Atlas / Tender Intelligence / Evaluation OS
│               └── activeTab: 'bids'
│                   │
│                   └── EnterpriseEvaluationEngine.tsx (Sub-module Controller)
│                       │
│                       └── EvaluationOSDashboard.tsx (Presentation Workspace)
│                           ├── EvaluationOSHeader.tsx (Governance status & context)
│                           ├── EvaluationLifecyclePanel.tsx (12-stage PPADA lifecycle)
│                           ├── EvaluationWorkspaceTable.tsx (12-col evaluation grid)
│                           ├── LegalProceduralBasisPanel.tsx (Statutory traceability)
│                           ├── AuditEventStreamPanel.tsx (Cryptographic event ledger)
│                           ├── EvidenceLineagePanel.tsx (9-node provenance DAG)
│                           ├── AIGovernancePanel.tsx (AI Assists / Humans Decide)
│                           └── UnauthorizedActionModal.tsx (RBAC gate enforcement)
```

---

## 2. Atlas Shell Integration Point

### Mount Path & Routing
- **Root Shell**: `/src/App.tsx`
- **Route Detection**:
  - `activeModule` initialized via `window.location.pathname`.
  - Supports `/tender` and sub-paths `/tender/evaluation-os`, `/tender/bids`.
  - Bidirectional browser synchronization using `popstate` event listeners and `history.pushState`.
  - Browser Back and Forward navigation transition smoothly between Atlas modules and Tender Intelligence sub-modules without full page reloads.

### Tenant & Theme Context
- Consumes `useTenant()` from `/src/context/TenantContext.tsx` (`currentTenant: 'ketraco'`).
- Consumes `useAtlasTheme()` from `/src/context/ThemeContext.tsx`.
- Inherits security clearance, user roles (e.g. `Procurement Officer`, `Evaluator`, `Committee Chair`, `Accounting Officer`), and tenant branding tokens.

---

## 3. Tender Intelligence Host Component

### Host File: `/src/components/ketraco/TenderStudio.tsx`
- **Workspace Container**: `#tender-workspace-container`
- **Document Flow**: Replaced obsolete `fixed inset-0` modal takeover with normal document flow within the tender workspace container.
- **Scroll Architecture**:
  - Outermost document scroll container handles the page height.
  - Eliminated `overflow: hidden` scroll traps and nested conflicting scroll areas.
  - Evaluation table uses contained horizontal overflow for tabular density and vertical overflow for detailed line review without trapping the outer viewport.
- **Navigation Synchronization**:
  - Sidebar tab with ID `'bids'` is labeled **Evaluation OS** with `Live` badge.
  - Breadcrumbs explicitly render: `Salience Atlas / Tender Intelligence / Evaluation OS`.
  - Deep-linkable via `/tender/evaluation-os`.

---

## 4. Data Layer & Service Bindings

### Custom Hook: `useEvaluationData.ts` (`/src/components/ketraco/tender/evaluation-os/useEvaluationData.ts`)
The presentation layer binds directly to authoritative backend endpoints:

| Endpoint | Method | Purpose in Evaluation OS |
|----------|--------|---------------------------|
| `/api/v2/evaluation/documents` | `GET` | Fetches bidder evidence documents, file sizes, and verification statuses. |
| `/api/v2/evaluation/activity` | `GET` | Powers the live audit event stream and timestamped evaluator actions. |
| `/api/v2/evaluation/agents` | `GET` | Retrieves active autonomous agents, accuracy rates, and execution states. |
| `/api/v2/evaluation/findings` | `GET` / `POST` | Fetches and submits evaluation findings, compliance ratings, and justifications. |
| `/api/v2/evaluation/timeline` | `GET` | Ingests lifecycle milestones and statutory completion statuses. |
| `/api/v2/evaluation/sign` | `POST` | Submits cryptographic RSA-SHA256 signatures for committee resolutions. |

### Fallback & Resilience Strategy
- Parallel `Promise.allSettled` fetching pattern ensures non-blocking UI startup.
- If an endpoint is offline or returning empty arrays during testing, the hook merges live records with statutory fallback defaults (`BASE_EVALUATION_ROWS` and `BASE_AUDIT_EVENTS`).
- Dedicated loading skeleton and error retry banners provide feedback during network delays.

---

## 5. State Flow and Event Propagation

```text
User / URL Action
       │
       ▼
useEvaluationData Hook ──► Parallel API Fetch (Documents, Activity, Agents, Findings)
       │
       ├─► State: rows[] ──► EvaluationWorkspaceTable (Select row, sort, filter)
       ├─► State: stages[] ──► EvaluationLifecyclePanel (Active stage, progress %)
       ├─► State: auditEvents[] ──► AuditEventStreamPanel (Live chronological events)
       └─► State: activeTender ──► EvaluationOSHeader (Tender ID, evaluation ID, quorum)
                                  │
                                  ▼
                Interactive Subtabs & Modal Inspectors
                ├── Evidence Graph Modal (EvidenceGraph.tsx)
                ├── AI Reasoning Modal (RuleEngineView.tsx)
                ├── Audit History Modal (AuditLogView.tsx)
                └── Statutory Report Modal (SCM-08 Certified PDF export)
```

---

## 6. Security Context and RBAC Enforcement

1. **Separation of Duties (AIGovernancePanel)**:
   - Explicitly establishes visual and functional separation:
     - **ATLAS AI ANALYSIS**: Assistive document extraction, requirement matching, and risk indicators.
     - **HUMAN EVALUATION DECISION**: Evaluator scoring, committee consensus, and statutory approval.
   - Core principle: `AI ASSISTS. AUTHORIZED HUMANS DECIDE.`

2. **Unauthorized Action Enforcement (`UnauthorizedActionModal`)**:
   - Unauthorized attempts (e.g. altering criteria post-opening, modifying finalized scores without consensus) trigger an immediate statutory guard dialog explaining PPADA compliance reasons.
   - All unauthorized attempts are logged into the immutable audit trail.

3. **Authentication & Session Tokens**:
   - All API requests automatically pass Bearer JWT tokens via global fetch interceptors (`localStorage.getItem('atlas_access_token')`).
