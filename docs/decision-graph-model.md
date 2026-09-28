# SALIENCE ATLAS V2 — DECISION KNOWLEDGE GRAPH MODEL
### CLASSIFICATION: COGNITIVE LEDGER // DECISION LINEAGE // CLASS III INFRASTRUCTURE

This document details the topological structures of the **Decision Knowledge Graph (DKG)** within Salience Atlas V2. It maps how various modules (Tender Studio, Logistics Command, SCM Digital Twin, etc.) organize and display high-impact strategic decisions as structured, traceable paths rather than flat database records.

---

## 1. THE DECISION KNOWLEDGE GRAPH TOPO

Every high-integrity decision is modeled as an interconnected sub-graph where events, constraints, evidence, and approvals are bound to parent choices:

```
[ Active Tender Twin ]
         │
         ├── (Triggers) ──► [ Evaluation Decision URN ]
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
[ Regulatory Edge ]           [ Evidence Node ]            [ Multi-Signature Approval ]
(PPADA Sec 155 Check)        (Supplier Capacity Logs)       (SCM Director Cryptographic Sign)
         │                            │                            │
         ▼                            ▼                            ▼
[ Constraint Node ]           [ Simulation Trace ]         [ Sandbox Isolation Log ]
(Domestic Content > 40%)     (10,000 Monte Carlo Runs)     (WASM execution check)
```

---

## 2. STANDARD MISSION-CRITICAL DECISION SIGNATURES

The platform provides eight (8) standard, high-integrity decision models, ensuring complete trace ability across all critical operations:

### 2.1 Tender Award Decision
-   *Primary Objective*: Award a high-value grid-extension tender in compliance with Kenyan PPADA 2015 frameworks.
-   *Topological Path*: `Tender Twin` $\rightarrow$ `Evaluation Decision` $\rightarrow$ `Underwritten by Evidence` (e.g., bid prices, technician ratios) $\rightarrow$ `Checked by Constraint` (e.g., Local Preference Margin Sec 155) $\rightarrow$ `Committed to Approval Chain`.
-   *Risk Assessment*: Evaluates post-award litigation exposures (bypassed vendor challenges) using historical PPRA appeals datasets.

### 2.2 Supplier Selection Decision
-   *Primary Objective*: Map and pre-qualify strategic equipment suppliers for capital substation programs.
-   *Topological Path*: `Supplier Twin` $\rightarrow$ `Prequalification Decision` $\rightarrow$ `Underwritten by Evidence` (e.g., KRA certifications, factory ISO rating) $\rightarrow$ `Supported by Simulation` (e.g., supply chain delivery times).
-   *Risk Assessment*: Detects systemic exposure: "Does selecting this supplier push their total project volume past corporate capacity limits?"

### 2.3 Inventory Replenishment Decision
-   *Primary Objective*: Automated dispatch of materials (conductors, switchgear components) to prevent stockouts.
-   *Topological Path*: `Inventory Twin` $\rightarrow$ `Replenishment Decision` $\rightarrow$ `Underwritten by Evidence` (e.g., current stock balances < safety levels) $\rightarrow$ `Constrained by Budget` (e.g., active department spend lines).
-   *Risk Assessment*: Models price stability options (fixed price index vs. spot metal market purchasing swings) using global raw material projections.

### 2.4 Emergency Procurement Decision
-   *Primary Objective*: Procure critical replacement components under emergency grid-outage scenarios.
-   *Topological Path*: `Outage Event` $\rightarrow$ `Emergency Sourcing Decision` $\rightarrow$ `Supported by Evidence` (e.g., physical grid sensor failures) $\rightarrow$ `Governed by Special Regulation` (e.g., PPADA Section 103 (2)(b) direct-sourcing allowances).
-   *Risk Assessment*: Highlights compliance risks (over-pricing, single-source dependency audits) and suggests mitigation steps (dual-signature ministerial approval).

### 2.5 Budget Reallocation Decision
-   *Primary Objective*: Reallocate unused budget lines to overexposed substation capital programs.
-   *Topological Path*: `Project Deficit` $\rightarrow$ `Reallocation Decision` $\rightarrow$ `Supported by Evidence` (e.g., budget burn rates) $\rightarrow$ `Approved by Treasury Chain` $\rightarrow$ `Resulted in Project Recovery`.
-   *Risk Assessment*: Quantifies schedule slip risks on projects losing financial funding.

### 2.6 Contract Amendment Decision
-   *Primary Objective*: Formulate contract terms adjustments (escalation targets, scope de-escalation).
-   *Topological Path*: `Contract Twin` $\rightarrow$ `Amendment Decision` $\rightarrow$ `Supported by Evidence` (e.g., force majeure disruptions) $\rightarrow$ `Approved by Legal & SCM Committee`.
-   *Risk Assessment*: Assesses contractor insolvency probabilities using current financial performance datasets.

### 2.7 Project Escalation Decision
-   *Primary Objective*: Force-correct lagging construction schedules through contractor penalties or resource mobilization.
-   *Topological Path*: `Project Milestone Lag` $\rightarrow$ `Escalation Decision` $\rightarrow$ `Underwritten by Evidence` (e.g., Gantt critical path shifts) $\rightarrow$ `Triggers Contract Penalty Clause`.
-   *Risk Assessment*: Predicts contractor walkout or labor litigation risks using structural contract models.

### 2.8 Risk Mitigation Decision
-   *Primary Objective*: Deploy proactive mitigations around identified political, supply-chain, or environmental threat vectors.
-   *Topological Path*: `Risk Twin` $\rightarrow$ `Mitigation Decision` $\rightarrow$ `Simulated by Sandboxed Runs` $\rightarrow$ `Selected Alternative Action` $\rightarrow$ `Assigned Owner Department`.
-   *Risk Assessment*: Calculates return on mitigation investment (ROMI) comparing expected risk costs to active deployment costs.

---

## 3. LEDGER RECORD INTEGRATION (DECISION TRACEABILITY)

To ensure decisions can withstand judicial reviews or legislative audits (including Kenya EACC/PPRA reviews), finalized Decision blocks are hashed and appended as immutable blocks to the core **Event Store**. 

An auditor can query any node (such as a Contract Amendment) and drill down into the exact sequence of historical events (the Decision Lineage) that led to its creation:

```yaml
Audit Trail Header:
  decisionUuid: "dec-901fd56a-df1e-4ade-bc8a-4d7a12fb7692"
  blockHeight: 18451
  timestampUTC: "2026-06-22T13:45:00Z"
  proposerAgentHash: "sha256:71dfbdce3a4e..."
  verifiableLineageHashes:
    - "sha256:b1ad8e11a3c7... (Tender State Genesis)"
    - "sha256:4da1ef2cbce8... (Evaluation Committee Scoring Matrix)"
    - "sha256:de1f90bc134e... (Monte Carlo Simulation Log)"
    - "sha256:ff390bcab1ef... (Procurement Director Cryptographic Sign)"
```
