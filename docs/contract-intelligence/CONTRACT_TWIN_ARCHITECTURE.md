# CONTRACT TWIN ARCHITECTURE

## 1. Overview
The **Contract Digital Twin** represents the transformation of a static PDF contract into an active, stateful, and event-sourced digital execution model. Instead of relying on manual periodic reviews, Atlas ACIN maps every clause, line item, and warranty timeline directly to active enterprise data streams.

---

## 2. Core Structure of the Contract Twin
A Contract Twin contains the following active partitions:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CONTRACT TWIN DATA SCHEMAS                      │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ Metadata & ID    │ Supplier Profile │ Milestones (WBS) │ Variations    │
├──────────────────┼──────────────────┼──────────────────┼───────────────┤
│ Financial Matrix │ Insurances & Sec │ Defects Liability│ Dependencies  │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

*   **Identities & Metadata**: Legal contract identifier, signing officers, PPADA compliance classification, and reference hash link to the source document.
*   **Supplier Node**: Connects to the supplier’s registry, tax status (KRA), debarment logs, and financial capability ratings.
*   **Active Deliverables**: Material descriptions, quantities, and strict technical specifications (e.g., *“150kV high-insulation double-armored composite conductor assemblies”*).
*   **Milestones & Work Breakdown Structure (WBS)**: Concrete physical milestones paired with delivery deadlines, payment weights, and target completion dates.
*   **Variation Log & Amendment Records**: Tracked history of price adjustments, scope additions, and execution timeline extensions.
*   **Financials & Escrows**: Original budget, contingency funds, total claims paid, outstanding invoices, and penalties assessed.
*   **Insurances & Securities**: Performance guarantees, retention bonds, and environmental impact indemnity policies, tracked by expiration date.
*   **Defects Liability**: Warranty scopes, post-installation testing schedules, and material defect logging metrics.
*   **Project Dependencies**: Maps physical constraints (e.g., *“Contract A core foundation piling must be finished before Contract B starts transformer installation”*).

---

## 3. Real-Time Synchronization Pipeline
```
[ Field Sensor Telemetry & Depot Deliveries ] ──> [ ACIN Event Bus ] ──> [ State Evaluator ] ──> [ Twin Update ]
```
1.  **Field Ingestion**: Physical materials arrive at the Mariakani Depot. A receipt event is published by the SCM digital twin.
2.  **Event Analysis**: The ACIN Obligation Engine parses the delivery quantity and matches it with the contract line items.
3.  **State Upgrades**: If specifications match perfectly, the twin transitions the specific deliverable state from `PENDING_MANUFACTURE` to `INSPECTED_AND_RECEIVED`.
4.  **Automatic Clearance**: Pre-triggers the corresponding milestone payment approval request for the human-in-the-loop finance officer.
