# SALIENCE ATLAS V2 — SUPPLY CHAIN DIGITAL TWIN ARCHITECTURE
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // REAL-TIME DISTRIBUTED STATES

This document maps the architectural framework of the **SCM Digital Twin Runtime**, which maintains real-time logical models of physical assets, suppliers, logistics networks, and regulatory processes. It ensures complete operational alignment between real-world utility assets and their logical representation in Salience Atlas V2.

---

## 1. DIGITAL TWIN ARCHITECTURE RUNTIME

The Digital Twin Runtime acts as a reactive, high-performance virtualization layer atop the hardened physical and logical SCM networks:

```
    [ REAL-WORLD ENTITIES ] ───── (Sensors / GPS / ERP Logs) ─────┐
                                                                  ▼
                                                      [ EVENT INGESTION LOG ]
                                                                  │
                                                                  ▼
                                                     [ EVENT FABRIC PIPELINES ]
                                                                  │
                              ┌───────────────────────────────────┴───────────────────────────────────┐
                              ▼                                                                       ▼
                   [ STATE ENGINE DRIVERS ]                                               [ ANALYTICS & SIMULATION ]
                    - Dynamic Schema Updates                                               - Monte Carlo Models
                    - Strict Temporal Indexing                                             - Causal Propagation Paths
                    - Linear Dependency Solvers                                            - Impact Predictions
                              │                                                                       │
                              ▼                                                                       ▼
                  [ HIGH-CONFIDENCY GRAPH-TWIN ]  ◄─────────────────────────────────────── [ DUAL-AXIS AUDITING ]
                  (Real-time State Projection Engines)                                     (Regulator Forensics Core)
```

By leveraging the underlying **Event Fabric Engine**, every physical change (e.g., a cargo vessel changing GPS coordinates, a contract milestone delayed by an arbitrator, a transformer temperature exceeding 85°C) is processed, routed, and reflected within its corresponding Digital Twin.

---

## 2. REQUISITE TWIN STRUCTURAL PROFILES

Every operational Digital Twin object inherits a baseline template that guarantees deep trace ability, structural self-awareness, and analytical projection capabilities:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DIGITAL TWIN BASE MODEL                         │
├────────────────────────────────────────────────────────────────────────┤
│  1. IDENTITY: UUID v4 + Global Unique Resource Identifiers (URIs)     │
│  2. STATE: Operational, Financial, Compliance, and Temporal Envelopes  │
│  3. RELATIONSHIPS: Dynamic directed graph edges with metadata and temporal limits│
│  4. HISTORY: Append-only ledger events allowing retrospective reconstruction  │
│  5. EVENTS: Stream subscriptions for both input triggers and emitted updates   │
│  6. RISK PROFILE: Real-time risk probability and impact vectors       │
│  7. APPROVAL LINEAGE: Cryptographically signed governance milestones   │
│  8. AUDIT LINEAGE: Trace hashes linking events to original transaction indexes │
│  9. SIMULATION ENGINE: Sandboxed playground capabilities for stress-testing│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. CORE DIGITAL TWIN SUBCLASS SYSTEMS

1.  **Supplier Twin**: Tracks supplier health indices, operational capacities, regional regulatory compliance registers (KRA tax compliance, PPADA self-declarations), and historical performance scores under local SCM workloads.
2.  **Tender Twin**: Models the active procurement sequence (Expression of Interest $\rightarrow$ Request for Proposals $\rightarrow$ Pre-qualification $\rightarrow$ Technical Evaluation $\rightarrow$ Final Award). Maintains dynamic pricing models, validation structures, and real-time bidder submission tallies.
3.  **Contract Twin**: Mirrors contract lifecycles. Clause parsers evaluate changes dynamically. It calculates active SLA metrics, payment progress milestones, and potential contractual exposure values in real-time.
4.  **Project Twin**: Represents multi-stage critical physical infrastructure programs (substations, towers). Tracks Gantt-chart schedules, work breakdown structures (WBS), materials requirements, and potential scheduling bottlenecks.
5.  **Inventory Twin**: Real-time modeling of materials (overhead cable bundles, step-down switchgears). Tracks current stock balances, minimum threshold targets, and automatic replenishment triggers.
6.  **Warehouse Twin**: Represents physical storage facilities. Tracks storage load capacities, temperature controls for sensitive equipment, transit processing speed indices, and localized material queues.
7.  **Shipment Twin**: Real-time tracking of cargo (container consignments, vessel movements). Consumes continuous IoT coordinate sensors and port authority telemetry to predict Estimated Time of Arrivals (ETAs) and identify geopolitical transit risks.
8.  **Risk Twin**: Models system threats (e.g., supplier bankruptcy, local currency devaluation, custom clearing delays). Maintains propagation paths showing which critical project components are threatened by active risks.
9.  **Approval Twin**: Manages multi-tier approval chains. Tracks signatures, security delegations, compliance verifications, and pipeline delay indicators.

---

## 4. DESIGN INVARIANTS: SYNCHRONIZATION & CONFLICT RECONCILIATION

-   **Event Propagation**: State modifications must be modeled as a sequence of events. State mutations on a Twin must emit a standard event (e.g., `ShipmentETAChanged`) to the overall Event Fabric. Dependent Twins subscribe to these streams and adjust their state values accordingly (e.g., `ProjectTwin` intercepts `ShipmentETAChanged` and updates its dependent `InsulatorInstallation` task schedule).
-   **State Reconciliation (Conflict Resolution)**: When receiving asynchronous status messages from multiple external systems (such as SAP, manual SCM spreadsheets, and automated GPS streams), the coordinate state uses conflict resolution priorities. Real-time GPS signals override manually entered spreadsheets; manual audits signed by critical grid supervisors override automatic API estimates.
-   **Historical Reconstruction (Time Travel)**: Because all state mutations represent played-back events from the immutable Event Store, an operator can initialize cold twin projections at any historical block height. This enables high-fidelity auditing by providing an exact snapshot of how the procurement digital twin looked during historical regulatory challenges.
-   **Cross-Module Visibility**: Every twin operates inside the shared ontology layer. This allows a worker program running in Tender Studio to seamlessly check the real-world manufacturing load on a supplier's factory (from the Supplier Twin) before recommending a high-value contract award, eliminating typical enterprise data silos.
