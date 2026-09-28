# KETRACO SCM Data Products Index

This registry defines the core Data Products managed within the KETRACO SCM Data Fabric.

---

## 1. What is a Data Product?

A Data Product is a self-contained, high-quality, discoverable dataset or analytical model owned by a specific business domain. It is verified, secure, and ready for integration.

---

## 2. Active Data Products Directory

### A. SCM Grid Digital Twin Snapshot (`dp_scm_grid_twin`)
* **Domain**: Grid Engineering
* **Owner**: Lead Grid Planner
* **Update Frequency**: Real-time
* **Primary Key Schema**: `node_id` (UUIDv4)
* **API Pattern**: gRPC / REST `/api/twin/nodes`

### B. Bid Compliance Audit ledger (`dp_bid_audits`)
* **Domain**: Procurement Compliance
* **Owner**: Chief Compliance Auditor
* **Update Frequency**: On-demand (triggered by new tenders)
* **Primary Key Schema**: `audit_id` (UUIDv4)
* **API Pattern**: REST `/api/audits/contracts`
