# DECISION TRACEABILITY STANDARDS

This document enforces standard tracking models to record and audit automated SCM system decisions.

---

## 1. Traceability Record Schema

Every automated decision must create a permanent audit log detailing the exact inputs, model execution runs, and authorizers:

```json
{
  "decision_id": "dec-aud-20260628-88",
  "timestamp": "2026-06-28T16:42:00Z",
  "decision_type": "TenderBidAudit",
  "target_entity": "supplier-bid-044",
  "underlying_inputs": {
    "bid_value_kes": 48000000,
    "scanned_rules_count": 14
  },
  "applied_rules": ["rule-ppada-clause-4", "rule-anti-collusion"],
  "outcome": "REJECT",
  "confidence_score": 0.98,
  "human_reviewer_id": "usr-auditor-02"
}
```

---

## 2. Immutable Ledger Storage

Decision logs are written instantly to write-once-read-many (WORM) storage. Any attempts to alter historical outcome files violate platform operational integrity.
