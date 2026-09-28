# DECISION ESCALATION & RESOLUTION

This document details escalation rules, threshold crossings, and notifications of the Autonomy Governance framework.

---

## 1. Escalation Routing DAG

When a safety or financial limit is crossed, actions are systematically routed up the executive hierarchy:

```
  [ Limit Crossed ] ──► [ Department Head Alert ] ──► [ Executive Review Board (if > $50K) ]
```

---

## 2. Escalation Thresholds

* **Financial Bounds**: Any purchase suggestion exceeding `$10,000` must escalate to the procurement supervisor.
* **Risk Score Crossings**: Any plan where composite risk rises above `0.55` requires a compliance team manual signoff.
* **SLA Drift Warnings**: Any logistics task projecting a delivery delay greater than 7 days escalates to the SRE Lead.
