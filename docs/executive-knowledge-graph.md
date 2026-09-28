# SALIENCE ATLAS V2 — EXECUTIVE KNOWLEDGE GRAPH LAYER
### CLASSIFICATION: STRATEGIC INTEL // INTERACTIVE COGNITIVE REASONING // EXECUTIVE BOARD

This document defines the **Executive Knowledge Graph (EKG)** layer of Salience Atlas V2. The EKG converts low-level transactional telemetry and operational log records into high-level strategic intelligence. It serves as the primary data fabric for leadership dashboards and active decision interfaces, such as the SCM Digital Twin and the Executive War Room.

---

## 1. STRATEGIC INTELLIGENCE INTERFACE DESIGN

The Executive Knowledge Graph translates thousands of operational variables into clear, strategic answers for executive leadership:

```
                            [ ONTOLOGY DATA LAKE ]
                                      │
                                      ▼
                      [ EXECUTIVE GRAPH COMPILE ENGINE ]
                         (Aggregate & Correlate Shards)
                                      │
           ┌──────────────────────────┼──────────────────────────┐
           ▼                          ▼                          ▼
     [ COMPLIANCE ]             [ OPERATIONS ]             [ FINANCIALS ]
     - Audit Tracing            - SCM Bottlenecks          - Budget Drift
     - PPADA Violations         - Shipment Lag             - CLM Contract Gaps
           │                          │                          │
           └──────────────────────────┬──────────────────────────┘
                                      ▼
                     [ EXECUTIVE KNOWLEDGE GRAPH PORTAL ]
                    (Real-time Semantic Graph Visualizers)
```

By presenting data as interconnected graph nodes rather than static spreadsheets or disjointed database rows, directors can instantly trace high-level system indicators (such as project delays) to their root operational causes.

---

## 2. STRUCTURAL EXECUTIVE PATHWAY QUERIES

The EKG exposes six (6) core macro query signatures designed for national critical infrastructure operators:

### 2.1 "Which projects are most at risk?"
-   *Graph Pathway*: `Project` $\leftarrow$ `DEPENDS_ON` $\leftarrow$ `Shipment` $\leftarrow$ `BLOCKS` $\leftarrow$ `Risk`.
-   *Analytical Logic*: Scans construction Gantt schedules, matching current logistics shipments delayed in custom clearance queues to identify critical-path dependencies.
-   *Evidence Chain*: Shows that the *Olkaria Substation upgrade* is delayed by 45 days because insulating pylons are backed up at the port, and the import customs waiver is currently stuck in the Finance Department.

### 2.2 "Which suppliers create the highest risk exposure?"
-   *Graph Pathway*: `Supplier` $\rightarrow$ `SUPPLIES` $\rightarrow$ `Asset` $\rightarrow$ `CONTAINS` $\rightarrow$ `Project` $\rightarrow$ `Budget`.
-   *Analytical Logic*: Aggregates the total financial volume of active projects dependent on materials from a single, high-risk contractor.
-   *Evidence Chain*: Reveals that *Contractor X* has 14 concurrent contracts totaling $42M across 3 critical transmission lines, but was recently flagged for capacity constraints due to a factory fire in Munich.

### 2.3 "Which tenders drive the highest value?"
-   *Graph Pathway*: `Tender` $\rightarrow$ `PROCURES` $\rightarrow$ `Asset` $\rightarrow$ `USES` $\rightarrow$ `Budget` $\rightarrow$ `Procurement Plan`.
-   *Analytical Logic*: Cross-checks bids against annual capital procurement objectives, highlighting procurements that directly secure grid transmission capacity.
-   *Evidence Chain*: Ranks active tenders by their contribution to national power line extensions, prioritizing awards to local enterprises under PPADA Sections 155/157.

### 2.4 "Which inventory shortages threaten delivery?"
-   *Graph Pathway*: `Inventory Item` $\rightarrow$ `CONTAINS` $\rightarrow$ `Warehouse` $\leftarrow$ `DELIVERS` $\leftarrow$ `Shipment` $\rightarrow$ `SUPPORTS` $\rightarrow$ `Project`.
-   *Analytical Logic*: Traces warehouse material stock levels against current construction schedules, raising warnings when stock fall below baseline safety targets.
-   *Evidence Chain*: Triggers alerts when conductor spool stock levels fall below 14% of the volume required for upcoming line-stringing phases.

### 2.5 "What approvals are creating bottlenecks?"
-   *Graph Pathway*: `Approval` $\rightarrow$ `APPROVES` $\rightarrow$ `Tender / Contract` $\leftarrow$ `User` $\leftarrow$ `Department`.
-   *Analytical Logic*: Monitors the time approval requests have spent waiting in active department queues, highlighting processes operating past their SLA targets.
-   *Evidence Chain*: Flags that contract amendments spend an average of 14.5 days waiting in the *Legal Affairs* queue, compared to just 1.2 days in *SCM Engineering*.

### 2.6 "What contracts are likely to require amendment?"
-   *Graph Pathway*: `Contract` $\rightarrow$ `REFERENCES` $\rightarrow$ `ClauseMutationEvent` $\leftarrow$ `Risk` $\leftarrow$ `Shipment`.
-   *Analytical Logic*: Scans transport status logs, material cost trends, and contractor performance ratings to identify contracts at risk of missing project schedule targets.
-   *Evidence Chain*: Signals that a $12M conductor contract is at risk of renegotiation because global copper prices increased by 18%, squeezing the fixed-price margins of the contractor.

---

## 3. EXPLAINABILITY GRAPH (EVIDENCE VERIFICATION)

Every high-level executive answer must link back to a verified, verifiable chain of evidentiary events stored on the state ledger:

```json
{
  "strategicFactId": "ekg-fact-10f8fa3c-d38e-4a6c-9aef-8c9df1fb8b12",
  "question": "Which suppliers create the highest exposure?",
  "topResult": {
    "supplierName": "East African Grid Cable Ltd",
    "exposureValueUSD": 14200000.00,
    "confidenceInterval": 0.98,
    "riskLevel": "HIGH",
    "evidenceChain": {
      "vertexPath": [
        "urn:atlas:supplier:e-a-grid-cable-ltd",
        "urn:atlas:contract:ct-overhead-conductors-2026",
        "urn:atlas:project:kisumu-gantry-substation-phase-3",
        "urn:atlas:budget:bg-national-transmission-grid-fund"
      ],
      "evidentiaryFacts": [
        "Supplier has 4 active contracts for overhead conductors across 2 critical infrastructure projects.",
        "A 400kV line-stringing project is delayed because conductor deliveries are 22 days behind plan.",
        "Supplier raw material import permits have expired, causing a manufacturing backlog in their Mombasa shipyard.",
        "National Transmission Grid Fund budget has committed 34% of its active capital to these affected contracts."
      ]
    }
  }
}
```
