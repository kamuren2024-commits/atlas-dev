# Evaluation OS — UI-Only System Integration Documentation

> **Mandatory Architectural Statement**:  
> *This phase changes the Evaluation OS presentation layer only. The underlying procurement, evaluation, governance, audit, AI, workflow and data systems remain authoritative.*

---

## 1. Product Hierarchy & Context

Evaluation OS operates strictly as an embedded sub-module inside Tender Intelligence within the Salience Atlas platform:

```text
Salience Atlas
└── Tender Intelligence
    └── Evaluation OS
```

- **Global Shell**: Preserved Atlas global navigation, theme system, notifications, and tenant context.
- **Breadcrumb**: `SALIENCE ATLAS / TENDER INTELLIGENCE / EVALUATION OS`
- **Contextual Navigation Tabs**: Seamless switching between Tender Overview, Bid Intelligence, Evaluation OS, Compliance, Evidence, and Audit.

---

## 2. Previous vs. New UI Architecture

### Previous UI Architecture
- Flat tabular view or multi-tab split with scattered sub-views across disparate tabs.
- Low visual differentiation between AI predictions and human statutory decisions.
- Provenance and legal basis were hidden inside unstructured text or raw JSON inspection drawers.
- Life cycle progression was obscured, making statutory stage tracking difficult.

### New UI Architecture
- **Evaluation OS Header & Governance Bar**: Real-time evaluation metadata (Tender ID, Evaluation ID, Committee Code, Stage, Security Classification) paired with 7 live governance flags (`IDENTITY VERIFIED`, `ROLE AUTHORIZED`, `CRITERIA LOCKED`, `AUDIT ACTIVE`, `EVIDENCE LINKED`, `HUMAN APPROVAL REQUIRED`, `LEGAL BASIS AVAILABLE`).
- **12-Stage Evaluation Lifecycle Panel**: Fully visualized statutory PPADA workflow (Tender Published → Bid Receipt → Bid Opening → Preliminary Evaluation → Technical Evaluation → Financial Evaluation → Clarifications → Consensus → Committee Review → Approval → Award Recommendation → Audit Archive) showing active, completed, and pending stages.
- **Evaluation Workspace Table**: 12-column comprehensive evaluation matrix (`Bidder | Requirement | Evidence | Criterion | Weight | AI Analysis | Human Score | Variance | Evaluator | Compliance | Legal Basis | Audit`) with expandable drawers featuring:
  - Document Evidence Details (filename, size, extracted key proof points).
  - AI Analysis Metrics (Confidence, OCR accuracy, Collusion risk).
  - Evaluator Comments & Justification timestamps.
  - Interactive Action Pipeline (`ACTION → LAW → EVIDENCE → DECISION`).
- **Legal & Procedural Basis Panel**: Contextual traceability panel mapping every evaluation action to statutory procurement regulations (PPADA 2015 Sections 79/80/84, PPADR 2020 Regulations 74/77), accountable human actors, and timestamped audit references.
- **Audit Event Stream Panel**: Live cryptographic event stream capturing every evaluation decision with immutable event hashes, human actors, and statutory compliance status.
- **Evidence Lineage Panel**: 9-node deterministic DAG graph linking:
  `Tender Requirement → Evaluation Criterion → Bidder Evidence → AI Extraction → Evaluator Review → Legal Basis → Committee Consensus → Approval → Audit Record`
- **AI Governance Panel**: Strict visual separation of **ATLAS AI ANALYSIS** (assistive extraction and scoring recommendations) versus **HUMAN EVALUATION DECISION** (evaluator scores, consensus, statutory sign-off) under the persistent principle:
  `AI ASSISTS. AUTHORIZED HUMANS DECIDE.`
- **Unauthorized Action Experience**: Dedicated modal enforcing strict RBAC whenever restricted actions (e.g., criteria modification or score override) are triggered without required statutory roles.

---

## 3. Components Changed & Created

| Component | Path | Description |
|-----------|------|-------------|
| `EvaluationOSDashboard.tsx` | `/src/components/ketraco/tender/evaluation-os/EvaluationOSDashboard.tsx` | Main Evaluation OS presentation workspace integrating lifecycle, workspace table, legal basis, audit stream, lineage, and AI governance panels. |
| `EvaluationOSHeader.tsx` | `/src/components/ketraco/tender/evaluation-os/EvaluationOSHeader.tsx` | Header bar with procurement metadata, contextual tabs, and 7 governance badges. |
| `EvaluationLifecyclePanel.tsx` | `/src/components/ketraco/tender/evaluation-os/EvaluationLifecyclePanel.tsx` | Interactive 12-stage statutory lifecycle display. |
| `EvaluationWorkspaceTable.tsx` | `/src/components/ketraco/tender/evaluation-os/EvaluationWorkspaceTable.tsx` | 12-column core evaluation grid with expandable drawers and interactive score adjusting/exporting. |
| `LegalProceduralBasisPanel.tsx` | `/src/components/ketraco/tender/evaluation-os/LegalProceduralBasisPanel.tsx` | Contextual statutory grounding panel. |
| `AuditEventStreamPanel.tsx` | `/src/components/ketraco/tender/evaluation-os/AuditEventStreamPanel.tsx` | Live chronological audit event ledger. |
| `EvidenceLineagePanel.tsx` | `/src/components/ketraco/tender/evaluation-os/EvidenceLineagePanel.tsx` | 9-node deterministic provenance graph. |
| `AIGovernancePanel.tsx` | `/src/components/ketraco/tender/evaluation-os/AIGovernancePanel.tsx` | AI vs. Human Decision boundary panel. |
| `UnauthorizedActionModal.tsx` | `/src/components/ketraco/tender/evaluation-os/UnauthorizedActionModal.tsx` | RBAC security enforcement dialog. |
| `types.ts` | `/src/components/ketraco/tender/evaluation-os/types.ts` | Shared type contracts for Evaluation OS rows, lifecycle stages, and audit events. |
| `EnterpriseEvaluationEngine.tsx` | `/src/components/ketraco/tender/enterprise-evaluation/EnterpriseEvaluationEngine.tsx` | Updated presentation wrapper mounting the new `EvaluationOSDashboard` while re-exporting all preserved sub-components. |
| `GlobalHeader.tsx` | `/src/components/shell/GlobalHeader.tsx` | Enhanced breadcrumb to reflect `SALIENCE ATLAS / TENDER INTELLIGENCE / EVALUATION OS` when activeModule is 'tender'. |
| `TenderStudio.tsx` | `/src/components/ketraco/TenderStudio.tsx` | Labeled sidebar tab to 'Evaluation OS' and connected context tab navigation. |

---

## 4. Preserved Backend Services, Routes & APIs

No backend endpoints, database schemas, or API contracts were modified or mocked:
- `GET /api/v2/evaluation/documents` — Preserved and fetched for managed evidence documents.
- `GET /api/v2/evaluation/activity` — Preserved and fetched for live evaluation activity streams.
- `GET /api/v2/evaluation/agents` — Preserved for autonomous agent evaluation state.
- `GET /api/v2/evaluation/timeline` — Preserved for statutory milestone tracking.
- `POST /api/v2/evaluation/findings` — Preserved for evaluation finding submissions.
- `POST /api/v2/evaluation/sign` — Preserved for digital signatures and statutory sign-offs.

---

## 5. Security & Authorization

- **RBAC Enforcement**: The UI does not bypass security checks. If a user attempts to override locked criteria, modify consensus scores, or sign without necessary authority, the `UnauthorizedActionModal` is displayed and logs the attempt to the audit trail.
- **Separation of Duties**: AI suggestions are visually quarantined from authorized human evaluator inputs.

---

## 6. Accessibility & Performance Considerations

- **WCAG AA Compliance**: High-contrast dark palette (`#06080f`, `#0b1220`, `#0c1527`) paired with crisp cyan (`#00e1ff`), emerald (`#10b981`), amber (`#f59e0b`), and white text.
- **Horizontal & Vertical Responsiveness**: Optimized for 1920×1080 and standard enterprise laptop resolutions (1366×768 to 1600×900) using fluid CSS grid and flex layouts with contained scrolling.
- **Zero Heavy Render Overhead**: Efficient 2D SVG iconography and targeted Framer Motion animations with no unneeded WebGL or high-frequency polling.

---

## 7. Deferred Backend Requirements

As specified in the system instructions, backend statutory hardening, custom PDF rendering pipelines, and production database migrations remain deferred to their dedicated subsequent engineering phase.
