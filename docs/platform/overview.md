# Platform Overview — KETRACO SCM Intelligence Nexus

The **KETRACO SCM Intelligence Nexus** platform serves as the master operating system for KETRACO SCM operations. This document outlines the physical and logical layers of the platform.

---

## 1. Physical Layer & Infrastructure

The application runs in a containerized environment on Google Cloud Run:
* **Edge Routing**: All incoming HTTPS traffic is routed through Nginx reverse proxies.
* **Server Runtime**: Express.js server runs on Node.js.
* **Database**: Managed Cloud SQL (PostgreSQL) with PGVector.
* **Secret Storage**: Integrated with Google Cloud Secret Manager.

---

## 2. Platform Core Capabilities

### SCM Digital Twin & Logistics Simulator
Renders KETRACO substations, warehouses, and transport lanes across Kenya. Allows real-time Monte Carlo simulations of road risks, weather patterns, and supplier delivery delays.

### Bid Analysis & Contract Auditor
Ingests and parses procurement bid submissions, cross-referencing text structures against regulatory checklists to audit compliance and calculate risk ratings.

### Supplier Scorecards
Calculates multi-dimensional performance scores dynamically based on quality, reliability, logistics delay history, and ESG guidelines.
