# PLATFORM SERVICES CATALOG & BACKENDS

This document describes the backing infrastructure systems and shared backend databases managed by the Platform SRE teams.

---

## 1. Managed Databases & Caches

### A. PostgreSQL with PGVector
* **Implementation**: Google Cloud SQL / Europe-West2
* **Storage**: Encrypted SSD pools with synchronous multi-region replication.
* **Usage**: Storing transmission node coordinates, historical supplier risk files, and active session states.

### B. Redis Cache Cluster
* **Implementation**: Managed Memorystore
* **Usage**: Caching identical AI model prompts, spatial route distances, and user permission matrices to minimize system latency and external API costs.

---

## 2. Platform Core Infrastructure

### A. Secret Engine (HashiCorp Vault)
* **Implementation**: Self-hosted cluster with GCP Key Management Service autounseal.
* **Access Control**: Workload Identity binds pods directly to specific Vault policies. Secret rotation occurs automatically every 30 days.

### B. Event Streaming (Kafka / PubSub)
* **Implementation**: Managed Cloud PubSub
* **Usage**: Transmitting logistics events, alerts, and telemetry logs.
