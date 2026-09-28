# DECISION MODEL DESIGNS

This document details the mathematical and logical structures of SCM scoring models.

---

## 1. Decision Tree Formats

We run a composite scoring logic combining deterministic PPADA rule checks with machine-learned compliance models:

```yaml
model_id: "mod-bid-score-v2"
version: "2.1.0"
type: "DecisionTree"
features:
  - name: "supplier_blacklist_status"
    type: "boolean"
    weight: 0.40
  - name: "price_deviation_index"
    type: "number"
    weight: 0.35
  - name: "delivery_sla_compliance"
    type: "number"
    weight: 0.25
thresholds:
  rejection: 0.70
  warning: 0.50
```

---

## 2. Training and Drift Controls

Models are retrained quarterly using historical audit data. Drift in input feature distributions is monitored using daily Kolmogorov-Smirnov statistical tests.
