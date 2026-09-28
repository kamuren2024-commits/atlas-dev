# MODEL PROVENANCE ARCHITECTURE

This document outlines the versioning, lineage, and compliance audit paths applied to AI and Machine Learning models.

---

## 1. Model Registry and Lifecycle

Every model used in the production SCM platform must register a compliance metadata block in the model registry:

```json
{
  "model_uri": "gcs://ketraco-models/bid_auditor_v2.bin",
  "sha256": "8f3c1b2c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a",
  "training_dataset": "ds_tender_bids_2025_q4",
  "algorithm": "XGBoost",
  "evaluation_metrics": {
    "auc_roc": 0.942,
    "f1_score": 0.895
  }
}
```

---

## 2. Safety Gates

Models showing performance degradation during online evaluation are immediately rotated out in favor of the previous stable release.
