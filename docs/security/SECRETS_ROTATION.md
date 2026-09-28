# CRITICAL SECRETS & KEY ROTATION POLICIES

This document defines rotation frequencies, vault storage standards, and log masking rules.

---

## 1. Secrets Classifications & Retention

We categorize secrets based on risk profiles:

| Secret Class | Example | Storage Backend | Rotation Cycle |
| :--- | :--- | :--- | :---: |
| **Class A (Critical)** | Gemini API Keys, DB Passwords | GCM Secret Manager | **Every 30 days** |
| **Class B (High)** | Slack webhook URIs, Kafka keys | HashiCorp Vault | **Every 90 days** |
| **Class C (Medium)** | Redis cache passwords | K8s Secrets | **Every 180 days** |

---

## 2. Automated Secrets Rotation Loop

We use Google Secret Manager's native rotation schedules integrated with Cloud Functions to rotate credentials without downtime:

```
  [ Cloud Scheduler ] ──► [ Secret Rotator Function ] ──► [ Target DB / Service API ]
                                                                   │
                                                                   ▼
                                                       [ Update Secret Version ]
```

* **Log Masking**: Standard logging frameworks use regex filters to automatically sanitize and mask credentials from application logs. This prevents leaks of keys like `AI_KEY` or `PGPASSWORD`.
