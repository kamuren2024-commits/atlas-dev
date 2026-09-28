# REGULATORY CLASSIFICATION MAPPING

This document maps system components and workflows to governing Kenyan public procurement statutes.

---

## 1. PPADA-2015 Legislative Mapping

Our microservice boundaries are designed to enforce specific sections of the PPADA-2015 act:

```
  [ Sourcing Module ]  ──► Enforces ──► [ PPADA Section 74: Tender Documents ]
  [ Scoring Module ]   ──► Enforces ──► [ PPADA Section 80: Evaluation of Bids ]
  [ Auditing Module ]  ──► Enforces ──► [ PPADA Section 84: Compliance Signoff ]
```

---

## 2. Automated Regulatory Checks

Every transaction passing through the bidding pipelines triggers a regulatory scan to verify compliance with bidding rules, single-source ceilings, and local content thresholds.
