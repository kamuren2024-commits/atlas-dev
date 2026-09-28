# PPADR 2020 Regulation Traceability Matrix
## Salience Atlas Autonomous Procurement Operating System (APOS)

This document establishes the bidirectional mapping between the Public Procurement and Asset Disposal Regulations (PPADR) 2020 and KETRACO's SCM Intelligence System.

---

### Regulatory Mapping & Executable Traceability Matrix

| Regulation | Statutory Provision | Operational Requirement | System Implementation | Responsible SCM Agent | Verification Logic / Guardrail | Status | Source Code Reference |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Reg 14** | Value Thresholds | Strict spend bounds for open tender, direct, and RFQs. | Threshold Inspector. | Planner Agent | Rejects direct procurement request if budget value exceeds permissible statutory thresholds. | ✅ Active | `/backend/chrome-extension-api.ts` `/backend/agents/fabric.ts` |
| **Reg 28** | Opening Committees | Minimum of 3 qualified officers with secure, locked bid access. | Committee Cryptographic Charter. | SCM Audit Engine | Enforces multi-sig validation on SHA-256 bid opening ledgers. | ✅ Active | `/api/scm/workflow-graph` `/backend/chrome-extension-api.ts` |
| **Reg 42** | Record Keeping | Retention of all tenders, evaluations, and minutes for 6+ years. | Immutable Enterprise Memory and Logging. | Memory Synthesizer | Encapsulates every workflow event in an isolated JSON block for database archiving. | ✅ Active | `/api/scm/memory` `/backend/chrome-extension-api.ts` |
| **Reg 82** | Standstill Period | Enforces specific standstill windows of 14 days before execution. | Standstill Window Tracking. | SCM Contract Investigator | Counts calendar days from award notification to block immediate contract dispatch. | ✅ Active | `/api/scm/guidance/award` `/backend/chrome-extension-api.ts` |
| **Reg 105** | Inspection & Acceptance | Independent Inspection & Acceptance Committee sign-off required. | Inspection Checklist Generator. | SCM Executive Advisor | Requires positive sign-off on 4 compliance metrics before payment dispatch. | ✅ Active | `/api/scm/guidance/inspection` `/backend/chrome-extension-api.ts` |

---

### Threshold Boundaries & Rules Engine

* **Direct Procurement Limit:** Max KES 10,000,000 for high-value items unless certified as a proprietary single-source, emergency, or statutory patent exception under PPADA Section 102.
* **Request for Quotations (RFQ) Limit:** Maximum KES 5,000,000.
* **Low Value Procurement Limit:** Maximum KES 50,000 per transaction.

### Living Document Certification
* **Certified Version:** `v1.4.2-STABLE`
* **Last Verified Date:** `2026-06-30`
* **Automated Audit Score:** `100% Traceability`
