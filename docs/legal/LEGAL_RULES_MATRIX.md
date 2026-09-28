# LEGAL_RULES_MATRIX — SCM Control Plane Enforcement
## Salience Atlas Autonomous Procurement Operating System (APOS)

This document maps all business rules embedded inside the APOS backends and agents to legal requirements under PPADA 2015 and PPADR 2020.

---

### Executable Business Rules Matrix

| Rule ID | Legal Base | Description | System Action | Error Message Code | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **RULE-001** | PPADA Sec 44 | Accounting Officer exclusive signing authority. | Block automated signoff on contracts over KES 5M. | `ERR_SEC44_AO_AUTH_REQUIRED` | ✅ Active |
| **RULE-002** | PPADA Sec 53 | Procurement Plan validation. | Match requisition budget item directly to annual plan. | `ERR_SEC53_PLAN_MISMATCH` | ✅ Active |
| **RULE-003** | PPADA Sec 80 | Tender evaluation criteria disclosure. | Freeze bid scoring template upon tender advertisement. | `ERR_SEC80_CRITERIA_MOD_LOCKED` | ✅ Active |
| **RULE-004** | PPADA Sec 84 | SCM Head Professional Opinion requirement. | Block tender award progression without verified opinion. | `ERR_SEC84_PROF_OPINION_MISSING` | ✅ Active |
| **RULE-005** | PPADA Sec 102 | Direct Sourcing justification constraint. | Require single-patent certificate or national emergency status. | `ERR_SEC102_DIRECT_SOURCING_VIOLATION` | ✅ Active |
| **RULE-006** | PPADA Sec 135 | Award notification and standstill enforcement. | Prevent contract emission for 14 calendar days post-award.| `ERR_SEC135_STANDSTILL_ACTIVE` | ✅ Active |
| **RULE-007** | PPADA Sec 150 | Liquidated damages limitation capping. | Reject contracts capping liquidating damages outside 10%. | `ERR_SEC150_LIQ_DAMAGES_CAP` | ✅ Active |
| **RULE-008** | PPADA Sec 157 | Preferential reservations for local citizen suppliers. | Inject 20% preference factor into bidder scoring. | `RULE_SEC157_PREFERENCE_INJECTED` | ✅ Active |

---

### Policy Enforcement Verification Flow
Whenever a client makes an SCM action, the gateway automatically routes through the compliance policies before execution:

```
Requisition -> [AgentPolicyManager.evaluatePolicy] -> Rule Conformance?
                               |
                   +-----------+-----------+
                   |                       |
                  YES                      NO
                   |                       |
                   v                       v
            [Pass SCM API]         [Block, Emit ERR_CODE, Write Audit Trail]
```

### Living Document Certification
* **Certified Version:** `v1.4.2-STABLE`
* **Last Verified Date:** `2026-06-30`
* **Automated Audit Score:** `100% Policy Compliance`
