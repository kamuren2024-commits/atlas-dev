# WORKING MEMORY & SESSION CACHE

This document details short-term working memory, session caching, and Redis database schemas for active SCM agents.

---

## 1. Redis Namespace Architectures

Active agent context and task states are stored in high-performance Redis namespaces to support sub-millisecond retrieval:

```
  [ Active Chat Session ] ──► [ Redis Key: session:usr-01:context ] ──► [ Express Server ]
```

---

## 2. Key Eviction & TTL Policies

* **Session States**: Configured with a sliding TTL of 1 hour to prevent memory bloat.
* **Intermediate Task Results**: Set with a strict TTL of 15 minutes; automatically pruned upon task completion.
* **Warm Cache Prefetches**: Loaded during agent startup cycles to accelerate prompt execution.
