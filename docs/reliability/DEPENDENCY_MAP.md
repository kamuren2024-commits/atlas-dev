# SYSTEM DEPENDENCY MAP

This document maps all internal and external software dependencies, libraries, and external platform services.

---

## 1. System Dependency Topology

Our service relies on structured layers to prevent dependency cascading failures:

```
                  [ Express API Gateway ]
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
   [ PostgreSQL ]      [ Redis Cache ]     [ Gemini API ]
```

---

## 2. Dependency Risk Assessment

* **PostgreSQL (Storage)**: Critical dependency. Mitigated via synchronous hot-standby replicas.
* **Redis (Cache & Memory)**: High dependency. Cached operations automatically fallback to PostgreSQL on disconnects.
* **Gemini API (AI Intelligence)**: High dependency. Monitored for rate-limits with fallback provider queues.
