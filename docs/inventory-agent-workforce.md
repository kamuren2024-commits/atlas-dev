# Salience Atlas V2 - Inventory Agent Workforce Architecture

This document describes the structure and orchestrations of the **Inventory Agent Workforce**, which forms the Agentic Operating System container inside Salience Atlas V2.

## The Cognitive Agent Core

Every sub-agent in our workforce runs on the **Salience Agent OS Framework**, containing:
1.  **Ingress Stream Monitor**: Polls real-time events, ERP alerts, and twin updates.
2.  **Epistemic Engine**: Evaluates state against the KETRACO PPADA policy thresholds.
3.  **Collaborative Message Interface**: Inter-agent messaging via JSON envelope standard.

---

## Workforce Hierarchy & Specialties

### 1. Inventory Commander Agent
*   **Role**: Primary Domain Orchestrator.
*   **Mission**: Coordinates all other specialized sub-agents, structures complex recommendations, and manages state transit into the Human-in-the-Loop Gateway.

### 2. Inventory Forecast Agent
*   **Role**: Demand Forecasting and Trend Analysis.
*   **Mission**: Evaluates historical consumption velocities, monsoon seasonal adjustments, and transmission line project milestones to generate 90-day demand curves.

### 3. Demand Planning Agent
*   **Role**: SCM Balance Alignment.
*   **Mission**: Maps project material requirement timelines from the **Project Supply Nexus** onto current warehouse balances to establish optimal safety stock parameters.

### 4. Inventory Risk Agent
*   **Role**: Threat Detection and Exposure Calculation.
*   **Mission**: Calculates risk weights on buffer deficits, coastal saline corrosion wear on spares, and port clearance delays.

### 5. Warehouse Intelligence Agent
*   **Role**: Physical Space Allocator.
*   **Mission**: Evaluates storage density, volume optimization, temperature constraints for gas-insulated components, and coordinates stock re-allocations.

### 6. Stock Optimization Agent
*   **Role**: Financial Capital Control.
*   **Mission**: Applies economic order quantity (EOQ) algorithms to limit cash tied up in slow-moving auxiliary components while protecting system operations.

### 7. Critical Spare Parts Agent
*   **Role**: High-Voltage Operations Guard.
*   **Mission**: Monitors high-voltage assets like heavy transformers and high-capacity conductors. Triggers immediate escalation alerts if these crucial components fall below 15% safety cushions.

### 8. Reorder Recommendation Agent
*   **Role**: Procurement Initiator.
*   **Mission**: Evaluates available supply vectors, framework contracts, and lead times to draft optimal replenishment quantities when reorder points are breached.

### 9. Procurement Trigger Agent
*   **Role**: Compliance Gatekeeper.
*   **Mission**: Translates drafted reorders into the specific structured PPADA-compliant formats.

### 10. Inventory Compliance Agent
*   **Role**: Statutory Policy Auditor.
*   **Mission**: Audits all projected recommendations against the Public Procurement and Asset Disposal Act (PPADA) 2015 threshold levels.

### 11. ERP Reconciliation Agent
*   **Role**: Authoritative Ledger Synchronizer.
*   **Mission**: Performs continuous dual-entry mapping with SAP S/4HANA to verify stock levels, avoiding state divergence.

### 12. Inventory Simulation Agent
*   **Role**: Stress Tester.
*   **Mission**: Automatically executes stress simulations under scenario injections (e.g., Shanghai port delays, local currency depreciation) to assess vulnerability deltas.

### 13. Inventory Audit Agent
*   **Role**: Historical Lineage Recorder.
*   **Mission**: Signs cryptographic proof records of every event transition on the local ledger for oversight reporting.

### 14. Inventory Decision Agent
*   **Role**: Trade-off Analyst.
*   **Mission**: Compiles evidence, risk assessments, alternatives matrix, and simulation offsets into structured decision nodes.
