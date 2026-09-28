# SALIENCE ATLAS — EVALUATION OS
## ENACTMENT RECONCILIATION

**System:** Salience Atlas Procurement Evaluation OS  
**Target:** Kenya Electricity Transmission Company Limited (KETRACO) & Kenyan Public Utilities  
**Date:** 2026-09-22  
**Framework:** PPADA 2015 / Rev. 2022, PPADR 2020  

---

### Reconciliation Matrix

| Capability | Historical Implementation | Current Implementation | Actual Runtime Path | Current Tests | Production Status | Government Status | Action Required |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Evaluation OS Core Dashboard** | Standalone mock prototypes & Phase 1 UI | `EvaluationOSDashboard.tsx` with role switching & `useEvaluationData` hook | `src/components/ketraco/tender/evaluation-os/` | TypeScript strict check, Vite build | `PRODUCTION_READY` | `COMPLIANT` | Maintain single canonical UI; avoid parallel dashboards. |
| **Evaluation Workspace & Scoring** | Static read-only table with hardcoded scores | Dynamic tabular matrix with preliminary, technical, financial stages & slider scoring | `EvaluationWorkspaceTable.tsx` → `/api/v2/evaluation/scores/submit` | Route validation & unit scoring | `PRODUCTION_READY` | `COMPLIANT` | Enforce digital signatures and immutable versioning on each score edit. |
| **Lifecycle & Stage Progression** | Manual state updates in client memory | Formal 9-stage state machine enforcing gate requirements and accounting officer authorization | `EvaluationLifecyclePanel.tsx` → `/api/v2/evaluation/lifecycle/advance` | State machine transition tests | `PRODUCTION_READY` | `COMPLIANT` | Ensure stages 8 & 9 are strictly hard-gated to Accounting Officer role. |
| **Legal & Procedural Rules** | Hardcoded text cards referencing PPADA 2015 only | `LegalRuleEngine` with versioned statutory corpus (PPADA 2015, Rev 2022, PPADR 2020, PPRA circulars) | `LegalProceduralBasisPanel.tsx` → `/api/v2/evaluation/legal/rules` | `rule-ontology.test.ts` | `PRODUCTION_READY` | `COMPLIANT` | Integrate versioned legal source manager with effective dates. |
| **Evidence Graph & Lineage** | Disconnected SVG canvas with mockup nodes | Bid documents linked to granular extracted claims, SHA-256 hashes, OCR status, and confidence | `EvidenceLineagePanel.tsx` → `/api/v2/evaluation/evidences` & `/api/v2/evaluation/documents` | `evidence.test.ts` | `PRODUCTION_READY` | `COMPLIANT` | Ingest external government verification evidence into the same graph. |
| **AI Committee & Specialist Agents** | Generic LLM prompt returning mock evaluation | `AIGovernanceEngine` orchestrating OCR, Compliance, Technical, Financial, Fraud specialist agents | `AIGovernancePanel.tsx` → `/api/v2/evaluation/ai/status` & `/api/v2/evaluation/ai/run-checks` | Agent harness tests | `PRODUCTION_READY` | `ASSISTIVE_ONLY` | Enforce strict rule: AI agents recommend; only authorized humans mutate statutory state. |
| **Deterministic Evaluation Core** | AI prompts evaluating math and bidder ranking | Deterministic TypeScript engine computing weighted scores, pass marks, arithmetic error corrections, and rank | `backend/evaluation/governance/technical-financial-engines.ts` | Unit test cases for QCBS math | `PRODUCTION_READY` | `COMPLIANT` | Hard-code rule: LLMs never execute final arithmetic or ranking calculations. |
| **Audit Ledger & Event Stream** | Ephemeral console logs and browser localStorage | Chained cryptographic block ledger (`evaluation_audit_blocks`) with SHA-256 hashes & block heights | `AuditEventStreamPanel.tsx` → `/api/v2/evaluation/audit/ledger` | `immutable-audit-ledger.ts` self-verifications | `PRODUCTION_READY` | `AUDITABLE` | Provide full evaluation replay from block stream without mutating current state. |
| **Reporting & SCM-08 Export** | Manual template download or blank text | `EvaluationReportingEngine` generating full statutory PPRA Form SCM-08 in JSON and formatted text | `GovernmentReadinessModal.tsx` → `/api/v2/evaluation/report/scm-08` | Snapshot output validation | `PRODUCTION_READY` | `OFFICIAL_STANDARD` | Ensure digital seal and verification certificate are included in report export. |
| **Document Storage & Vault** | Local file writes in `backend/evaluation/document-storage.ts` | Local disk artifact storage with SHA-256 verification | `/api/evaluation/documents/*` | Legacy document upload tests | `PARTIAL` | `PROVISIONAL` | Upgrade to enterprise MinIO/S3 object storage abstraction with immutable versioning. |
| **Identity & Access Management** | Static user tokens (`dev-admin`, mock tokens) | `AuthorizationService` with role permissions | `backend/security/auth-router.ts` & `backend/security/identity-service.ts` | Platform foundation tests | `PARTIAL` | `ENTERPRISE_READY` | Provide Keycloak/OIDC adapter mapping Authenticated Principal → Identity → Tenant → Role. |
| **Policy Engine (OPA)** | In-code `if-else` permission checks | `AuthorizationAndConflictManager` | `backend/evaluation/governance/segregation-of-duties.ts` | SOD tests | `PARTIAL` | `CONTROLLED` | Wrap in policy engine interface returning `ALLOW`, `DENY`, `REQUIRE_APPROVAL`, `ESCALATE`. |
| **E-GPS Integration** | Simulated mock endpoints | `KenyaEGPSAdapterService` with static tender info | `/api/v2/evaluation/egps/*` | Endpoint ping tests | `PARTIAL` | `PROVISIONAL` | Create `backend/integrations/egps/` with typed provider interface returning standard status codes. |
| **PPRA Integration** | Documented only in user guides | Not implemented | None | None | `NOT_IMPLEMENTED` | `PENDING_CONFIG` | Create `backend/integrations/ppra/` with public circulars and standard tender document queries. |
| **KETRACO Connector** | Documented only | Hardcoded procuring entity metadata in tenders | `/api/v2/evaluation/tender/current` | DB schema migration 013 | `PARTIAL` | `INTERNAL_DATA` | Create `backend/integrations/ketraco/` with public notices and SAP Ariba provider abstraction. |
| **Government MCP Gateway** | Concept in documentation | Generic tool runtime in `backend/ai-runtime/tools/` | `/api/tools/*` | Tool registry tests | `PARTIAL` | `GOVERNED` | Implement `backend/integrations/mcp/` with policy guard, rate limiter, and prompt-injection defense. |
| **Supplier 360 & External Verification** | Static supplier profile in logistics domain | `calculateSupplierPerformance` in `backend/domains/supplier/` | `/api/supplier/*` | Performance formula tests | `PARTIAL` | `PROVISIONAL` | Build `ExternalVerificationService` with formal states (`VERIFIED`, `UNAVAILABLE`, `CONFLICT`, etc.). |
| **Evaluation Replay** | Not implemented | Historical block ledger exists | `/api/v2/evaluation/audit/ledger` | Block integrity verification | `PARTIAL` | `AUDITABLE` | Build deterministic state re-constructor from tender version, bid version, and audit blocks. |

---

### Reconciliation & Migration Directives

1. **Canonical Runtime Unification**:
   - The authoritative API path is `/api/v2/evaluation/*`.
   - Legacy routes under `/api/evaluation/*` (such as document uploads) are bridged to the canonical V2 persistence engine (`EvaluationDbService` and `Migration 013` tables).
   - Client components strictly communicate via `useEvaluationData` or `/api/v2/evaluation/*`.

2. **Durable Persistence Standard**:
   - No legally consequential procurement data may reside in memory or temporary files.
   - All 13 Evaluation OS domain tables in `backend/database/migration-013-evaluation-os-domain.ts` are authoritative.

3. **Government Trust Model**:
   - Synthetic data in development must be flagged with `SYNTHETIC DATA`.
   - In production mode (`EVALUATION_OS_PRODUCTION_MODE=true`), mock providers and synthetic data must fail closed.
