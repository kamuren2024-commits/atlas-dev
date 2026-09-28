# DATA DISCOVERY & METADATA SEARCH ENGINE

This document details our federated data discovery and global metadata indexing architecture.

---

## 1. Unified SCM Search Engine

The platform exposes a centralized metadata index to enable rapid exploration of available SCM datasets:

```
  [ Search Query: "Suswa" ] ──► [ Federated Search Engine ]
                                            │
                       ┌────────────────────┴────────────────────┐
                       ▼                                         ▼
         [ Metadata Catalog ]                          [ Active Data Products ]
         - Found: Suswa twin config                    - Found: Real-time telemetry
```

---

## 2. Search Indexing Protocols

* **Automatic Crawler**: A daily crawler scans active databases, schema registries, and API specs to build a comprehensive search catalog.
* **Elastic / OpenSearch Catalog**: Indexes description tags, schema properties, and ownership annotations to support natural language query search.
