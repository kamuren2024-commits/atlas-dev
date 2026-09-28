# SALIENCE ATLAS V2 // ARCHITECTURE AUDIT & DOMAIN MIGRATION PLAN
## FROM VISUAL PROTOTYPE TO COGNITIVE INVENTORY INTELLIGENCE FABRIC

This document governs the controlled domain replacement and migration protocol from the prototype SCM inventory system layout to the high-density **Enterprise Inventory Intelligence Fabric**.

---

## 1. COMPREHENSIVE RECONCILIATION SUMMARY (CURRENT vs. TARGET)

| Component Area | Current State (Prototype) | Target State (Enterprise Fabric) |
| :--- | :--- | :--- |
| **Data Architecture** | Decoupled client-side React UI state arrays. | Immutable event-journaled database state structures (`inventory_transactions`). |
| **SKU Management** | Basic text rows without structural specification. | High-fidelity SKU spec sheets, documents, and compliance records. |
| **Warehouse Space** | Static layout labels in list representations. | Multi-tier national-to-bin hierarchies with geospatial coordinates. |
| **Ledger System** | Direct variable adjustments (e.g., `currentQty` mutating). | Strict event sourcing (RECEIPT, ISSUE, TRANSFER, ADJUSTMENT, RETURN). |
| **Material Issuing** | Simulated on-screen allocation increments. | Multi-step request, approval, picking, issue, and writeback cycle. |
| **AI Agents** | Intermittent message dispatchers. | 4 structured core agents (Forecast, Optimization, Analyst, Compliance) with dedicated registries. |
| **ERP Federation** | Visual adapter checklist labels only. | Interactive sync engine with polling, CDC, and conflict-handling logs. |

---

## 2. STRICT DOMAIN DIRECTORY SCHEME

To establish the new bounded domain, the architecture employs the following module layout under `/domains/inventory`:

```
/domains/inventory/
  ├── frontend/       # Inventory Intelligence Center UI screens and dashboards
  ├── backend/        # Express API routers and middleware layers
  ├── services/       # Synchronization, ERP Federation and caching engines
  ├── events/         # Immutable transaction schemas and logging pipelines
  ├── agents/         # Cognitive toolsets and orchestration parameters
  ├── analytics/      # Anomaly indicators, forecasting models, and risk indices
  ├── policies/       # PPADA procurement limits, safety rules, and validation schemas
  └── audit/          # Level-5 signature chains and cryptographic signing ledgers
```

---

## 3. CONTROLLED DOMAIN REPLACEMENT PROTOCOL

To ensure zero operational downtime and preserve critical integrations, the migration follows these architectural principles:

*   **Rule 1: Direct Component Injections:** Mounts the complete state-driven `InventoryHub` directly into the current layout to avoid parallel file conflicts.
*   **Rule 2: Preservation of Shell Contexts:** Retains context from the parent SCM workspace, including standard security checks and tenant-specific operations via `useTenant()`.
*   **Rule 3: Live Verification Runways:** Retains the background simulated event updates, enabling continuous operational monitoring and testing.

---

## 4. INTEGRITY METADATA LOG
*   **Architecture Audit Status:** VERIFIED
*   **Domain Migration Authority:** Principal Enterprise SCM Architect
*   **Release Signature Hash:** `0x7a39e08bf29c193ab21e`
