# ENTERPRISE DATA GOVERNANCE MODEL

This document details data classification, access rights, retention timelines, and encryption metrics.

---

## 1. Data Classification Tiers

We enforce strict data isolation rules based on classification levels:
* **Public**: General tender announcements and generic templates. (No encryption required).
* **Restricted**: Supplier financial bid sheets and contract negotiations. (Enforces AES-256 database-level encryption).
* **Confidential**: Personally Identifiable Information (PII) and corporate VAT credentials. (Anonymized at ingestion).

---

## 2. Storage Retention Timelines

* **Transaction Ledgers**: Maintained for a minimum of 7 years in cold archive storage.
* **Temporary Agent Logs**: Permanently purged after 90 days of inactivity.
* **Telemetry Metrics**: Aggregated and retained for 365 days for capacity modeling.
