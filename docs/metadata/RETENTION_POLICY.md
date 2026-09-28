# METADATA RETENTION POLICY

This document outlines legal storage timelines, audit-record archival, and automated data purging schedules.

---

## 1. Legal Retention Schedules

SCM metadata and related decision records must be retained in accordance with national legal mandates:

| Class Name | Storage Type | Minimum Retention | Storage Policy |
| :--- | :--- | :--- | :--- |
| **Tender Audit Logs** | Hot DB to Warm File | 7 Years | Encryption-at-rest mandatory |
| **Grid Telemetry Logs**| Aggregated Cold Rollup | 3 Years | Purge raw logs after 60 days |
| **User Activity Logs** | Inactive Warm File | 5 Years | Mask personal identifiers |

---

## 2. Auto-Pruning Routines

Nightly cron jobs execute data archival scripts. Records exceeding retention limits are wiped securely from all disks and backup snapshots.
