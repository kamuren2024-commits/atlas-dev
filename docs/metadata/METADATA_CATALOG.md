# METADATA CATALOG ARCHITECTURE

This document establishes the architecture of the KETRACO SCM Metadata Catalog, centralizing technical schemas and tag registries.

---

## 1. Catalog Architecture

The metadata catalog aggregates schema configurations, data asset descriptions, and access policies from across the SCM platform into a single searchable directory:

```
 [ SCM Databases / APIs ] ──► [ Metadata Collector ] ──► [ Unified Metadata Catalog ]
```

---

## 2. Core Capabilities

* **Active Schema Synchronization**: Automatically scans database instances to update table structures.
* **Semantic Tagging**: Attaches regulatory compliance tags (e.g. PPADA-2015, GDPR-SOV) to sensitive table columns.
* **Data Classification**: Classifies columns as Public, Internal, or Restrictive to enforce masking rules.
