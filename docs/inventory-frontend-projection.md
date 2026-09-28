# Salience Atlas V2 - Inventory Frontend Projection

This document specifies the **UI Projection Architecture** of the Inventory Intelligence Hub, adhering to the high-density space-theme UI standards of the Salience Atlas V2.

## Desktop Spatial Design Layout

Rather than standard CRUD list structures, the Inventory Domain is arranged as a high-density, high-fidelity **Mission Control Interface** consisting of a three-pane responsive layout:

```
+------------------------------------------------------------------------------------------+
| SALIENCE ATLAS V2  [Search...]                      [Mission Control] [Alerts 12] [user] |
+------------------------------------+------------------------------------+----------------+
|  = Navigation =                    | = KPI Metric Cards =               | = AI Rec =     |
|  Inventory Command Center (Active) | [Value KES 24.8B] [Available KES]  | | Reorder Rec|  |
|  Digital Twin Viewer               |                                    | | XLPE Cable |  |
|  Inventory Intelligence            | +--------------------------------+ | | 3000 Meters|  |
|  Risk & Resilience                 | | CENTRAL DIGITAL TWIN GRID MAP  | | |            |  |
|  Simulation Center                 | |                                | | [Approve]    |  |
|  Decision Center                   | | [Central WH]   [Mombasa Depot] | |                |
|  Approvals & Actions               | |               [Project Site B] | | = Risk Card =  |
|  Audit & Compliance                | +--------------------------------+ | | (Donut Chart)| |
|  Agent Workforce                   |                                    | | 342 Risks    |  |
|  ERP Federation                    | = Agent Workforce Status Panel =   | |              |  |
|  Reports & Analytics               | [Commander] [Forecast] [Risk Agent]| = Live Feed =  |
|  Configuration                     |                                    | | (Realtime)   |  |
+------------------------------------+------------------------------------+----------------+
| Nairobi, Kenya  24°C | May 11, 25  | [ Ask Atlas anything about inventory... ]   [Mic/Wave]|
+------------------------------------+------------------------------------+----------------+
```

---

## Interactive Spatial Modules

### 1. KPI Ribbon (Dynamic Telemetry)
*   **Total Inventory Value**: Aggregated currency value of all physical inventory held in depots.
*   **Available Stock / At Risk Stock**: Proportional split showing the health of buffers.
*   **Critical Items / Pending Approvals / Active Agents**: Visual count tags linking directly to active workspaces.

### 2. Centered Interactive Map Canvas
*   Displays an abstract neon-blueprint visual grid of regional warehouses and active project nodes (Central Warehouse, Mombasa Depot, Isinya Transformer Yard, Project Site A & B).
*   Nodes are highlighted by color-coded ring statuses (Optimal: Green, Normal: Blue, High Risk: Yellow, Critical: Red).
*   Clicking a spatial node projectively loads its structural inventory master, capacity variables, and connected active decisions.

### 3. Agent Workforce Panel
*   Shows active holographic agent modules (Commander, Forecast, Risk, Optimization, Compliance, ERP Reconciliation).
*   Users can click "Interact" on any agent card to open a cognitive chat terminal displaying the agent's real-time decisions, reasoning logs, and audit histories.

### 4. Sidebar Dynamic Control Column
*   **Contextual AI Recommendation Panel**: High-contrast highlight card featuring proactive recommendations (e.g., *"XLPE Cable 132kV Reorder Recommendation"*), highlighting current stocks, reorder points, and rationale alongside high-tech wire vector animations.
*   **Active Risk Donut Chart**: Proportional risk tracking divided into severity classes.
*   **Live Event Broadcast**: Live feed of operational ledger telemetry (e.g., goods receipts, risk triggers, approval requests).
