# SALIENCE ATLAS V2 — DIGITAL TWIN UI STANDARD
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // DESIGN SYSTEM // DIGITAL TWIN CORE

This standard defines the layout, rendering structure, and interactive rules for all **SCM Digital Twins** (Layer 3) within Salience Atlas V2. To maintain a unified interface, every twin—regardless of type—must implement this exact design structure.

---

## 1. STRATEGIC DIGITAL TWIN STAGE LAYOUT

Each digital twin is structured into three clear columns:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│  TWIN HEADER: Entity Logo/ID  |  Health Score Tracker  |  Active Status  |  Owner      │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│                                   │                                                    │
│  TWIN CENTER COLUMN:              │  TWIN RIGHT SIDEBAR PANEL:                         │
│  - Entity Relationships (Graph)   │  - System-Level Risks                              │
│  - History Milestone Timeline     │  - Real-Time AI Recommendations                    │
│  - Operational Activity Log      │  - Active Approval Requests                        │
│  - Immutable State Changes        │  - Simulation Scenarios                            │
│                                   │  - Immutable Auditing Trail Logs                   │
│                                   │                                                    │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 2. STANDARD COLUMNS SPECIFICATIONS

All digital twins are composed of three core layout panels:

### 2.1 Twin Header
-   **Entity Identity**: Unique system identifier (e.g., `urn:atlas:supplier:abb-kenya`). Shows corporate branding and registration metadata.
-   **Health Score**: Real-time performance ranking scaled from `0` to `100`. Features clear color coding: Red (< 60), Amber (60-80), or Green (> 80).
-   **Active Status**: Explicit state labels (Active, Hold, Under Review, Terminated) to communicate operational readiness.
-   **Ownership**: Designated KETRACO division lead responsible for the entity.

### 2.2 Twin Center Column (The Operational Workspace)
-   **Relationships Graph**: Dynamic graph visualizations mapping system associations (e.g., linking a Supplier to their Active Tenders and Contracts).
-   **Timeline & Event Logging**: Complete historical timeline mapping milestone completions and operational state changes.
-   **State Transitions**: Log files listing all changes to the entity's records. Each change is signed by the authorizing administrator.

### 2.3 Twin Right Sidebar Panel (The Decision Engine)
-   **Risks Matrix**: Active threat indicators, showing estimated probability and financial impact.
-   **Recommendations**: Cognitive agent optimization proposals accompanied by supporting evidence and risks.
-   **Approvals**: Pending authorization requests, linked to parent policy guidelines.
-   **Simulation Runways**: Proactive scenario planning tools, showing the impact of changes before they are committed to the ledger.
-   **Audit Trail Log**: Access registry tracking *Who* accessed the record and *Why*, complying with public records laws.

---

## 3. APART OF APPLICABILITY

This unified digital twin structure applies to eight (8) strategic SCM domains:

1.  **Supplier Digital Twin** (e.g., auditing capacity, certifications, past performance, and financials).
2.  **Tender Digital Twin** (e.g., tracking publication dates, bid security, scorecards, and committee decisions).
3.  **Contract Digital Twin** (e.g., monitoring milestone completions, payment schedules, and legal changes).
4.  **Project Digital Twin** (e.g., mapping critical path lines, material needs, and field engineering logs).
5.  **Shipment Digital Twin** (e.g., tracking transit coordinates, port clearances, and cargo temperature/security status).
6.  **Inventory Digital Twin** (e.g., showing stocking levels, storage conditions, and transfer histories).
7.  **Asset Digital Twin** (e.g., monitoring substation equipment, cable networks, and performance baselines).
8.  **Risk Digital Twin** (e.g., modeling weather events, market changes, and supply-chain shocks).

Adhering strictly to this layout standard ensures that operators can move between different supply-chain sectors without needing to learn new screen layouts.
