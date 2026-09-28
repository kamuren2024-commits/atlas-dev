# BUDGET POLICIES & COMPLIANCE ALERTS

This document specifies the billing budgets, threshold warning loops, and notification routes.

---

## 1. Budget Alerts Threshold Warning Loops

We configure budget thresholds at the GCP billing account level to trigger automated alerts:

```
  [ GCP Billing Alarm ] ──► [ Cloud PubSub ] ──► [ SRE Webhook Router ]
```

### Alert Thresholds:
* **Level 1 (50% of budget)**: Emits warning notifications to SRE Slack channels.
* **Level 2 (80% of budget)**: Escalates alerting to regional operations email groups.
* **Level 3 (100% of budget)**: Automatically halts non-critical background developer testing clusters.

---

## 2. Hard Limits Controls

The monthly sandbox budget for developers is hard-capped at **$2,000 USD**. Upon reaching this cap, cloud IAM policies automatically revoke write permissions for sandbox projects until the next billing cycle begins, preventing unexpected charges.
