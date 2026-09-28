# DATA LIFECYCLE & RETENTION POLICY

This document defines the lifecycle phases, migration paths, and permanent purging schedules for SCM data products.

---

## 1. Data Lifecycle Stages

We segment SCM data into four logical phases:

| Stage | Duration | Storage Class | Access Speed |
| :--- | :--- | :--- | :---: |
| **Active** | 0 to 90 Days | High-performance SSD DB | Real-time ($\le 5$ ms) |
| **Warm** | 91 to 365 Days | Balanced SSD Storage | p95 $\le 200$ ms |
| **Cold** | 1 to 7 Years | Nearline Storage Bucket | Minutes |
| **Archive** | $> 7$ Years | Coldline Glacier Storage | Hours |

---

## 2. Retention Policy Rules

* **Tender & Bid Data**: Under PPADA rules, contract audits must be retained for a minimum of **7 years** in warm/cold storage before deletion is authorized.
* **Grid Telemetry**: High-frequency telemetry log records are pruned and aggregated into hourly rollups after 30 days to optimize storage costs.
