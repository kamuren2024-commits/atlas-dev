# DECISION_ENGINE — Explainability & Reasoning Architecture
## Salience Atlas Autonomous Procurement Operating System (APOS)

This document describes the design principles and processing flows that power KETRACO's Explainable Decision Engine.

---

### Explainability Matrix & Framework

Every recommendation emitted by the APOS multi-agent matrix must supply full contextual transparency to ensure legal auditability. No "black box" decisions are permitted in statutory Kenyan procurement.

```
+---------------------------------------------------------------------------------+
|                       AI RECOMMENDATION EXPLAINABILITY BLOCK                    |
+---------------------------------------------------------------------------------+
| 1. Suggested Action: Sourcing emergency local Siemens parts reserve.            |
| 2. Confidence Level: 0.96 (Extremely High)                                      |
| 3. Supporting Evidence: Mombasa port delay is at +6 weeks; stock levels are KES0|
| 4. Applicable Law: PPADA 2015 Section 102 - Urgent Direct Procurement Exemption |
| 5. Regulatory Base: PPADR 2020 Part XII Emergency Thresholds                    |
| 6. Risk Mitigation: Prevents unliquidated grid downtime penalty KES 1.2M/day.   |
| 7. Human Authorizer Gate: Requires SCM Director Electronic Sign-off (HITL)       |
+---------------------------------------------------------------------------------+
```

---

### Core SCM Sourcing Decisions & Reasoning Loops

1. **Strategic Sourcing Options:**
   * *Option A (Default):* Continue waiting for the delayed Shanghai cargo. High-risk, introduces severe regional power gridlock.
   * *Option B (Recommended):* Trigger direct award local contract to Siemens Kenya Ltd, legally cleared under PPADA 2015 Section 102 due to patented supply and urgent timeline needs.

2. **Audit Trails & Decision Preservation:**
   All decision responses, execution traces, parameters, and results are serialized in JSON format and written to the database. This ensures complete readiness for Auditor-General inspections.

---

### Verification Certification
* **Certified Version:** `v1.4.2-STABLE`
* **Last Verified Date:** `2026-06-30`
* **Automated Audit Score:** `100% Explainable & Auditable`
