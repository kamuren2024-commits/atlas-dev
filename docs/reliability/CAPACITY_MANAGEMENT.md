# CAPACITY MANAGEMENT STANDARD

This document details compute, memory, database, and API token quota forecasting rules for KETRACO SCM nodes.

---

## 1. Compute and Storage Thresholds

SRE metrics monitors continuously evaluate infrastructure usage to trigger autoscaling:

```
  [ Resource Usage > 75% ] ──► [ Auto-Scale Compute Pools ] ──► [ Alert SRE ]
```

---

## 2. API Token Quotas

To prevent unexpected budget overruns and protect error margins, we enforce strict daily LLM token limits:
* **Procurement Scribes**: Max 1,000,000 input tokens per day.
* **Audit Agents**: Max 2,500,000 input tokens per day.
* **Interactive Chat**: Implements sliding rate-limit caps per user session.
