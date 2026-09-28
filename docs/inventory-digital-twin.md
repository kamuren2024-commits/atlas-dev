# Salience Atlas V2 - Inventory Digital Twin Core

This document details the **Inventory Digital Twin Core**, explaining the spatial, historical, and projectable standard of physical materials across the KETRACO grid network.

## Twin Architectural Principles

Rather than presenting tabular databases, Salience Atlas V2 maps inventory as a **living electronic representation** (a Digital Twin) reflecting physical realities in high-voltage substations, yards, and warehouses.

```
+-----------------------------------------------------------+
|                  SALIENCE DIGITAL TWIN                    |
|                                                           |
|    [Past State]      <---> [Present State] <---> [Future] |
|    (ERP Receipts)          (Live Sensors)       (Forecasts)
|                                                           |
|       +--------+             +--------+             +---+ |
|       | Supply | <---------> | Demand | <---------> | S | |
|       | Nodes  |             | Nodes  |             | i | |
|       +--------+             +--------+             | m | |
+-----------------------------------------------------+---+--+
```

## The State Dimension Triad

Every Inventory Digital Twin exposes three distinct temporal dimensions:

### 1. Current State (Present)
*   **Data Feeds**: Telemetry signals from warehouse RFID scanners, conveyor weight scales, substation gas meters, and active ERP material ledgers.
*   **Real-time Metrics**: Active utilization levels, bin allocation codes, relative humidity, physical quantity checks, and current reservation bounds.

### 2. Historical State (Past)
*   **Data Feeds**: Historical Goods Receipts, Goods Issues, Stock transfer records, and transaction logs.
*   **SLA Analytics**: Historical average supplier lead times, delivery variance rates, and previous physical auditing deviations.

### 3. Future Projection (Model Simulation)
*   **Data Feeds**: Consumption velocities calculated by the Forecast Agent, planned construction milestones fetched from the Project Supply Nexus, and pending framework replenishment schedules.
*   **Threshold Alerts**: Prediction curves indicating the exact dates stock buffers are set to breach minimum parameters under current run-rates.

---

## Spatial Infrastructure Map Layers

The Twin maps physical storage structures across KETRACO's transmission footprint:

1.  **Central Warehouse (Nairobi Node)**: Main heavy equipment harbor housing 220kV transformers, insulators, and main line conductor drums (Capacity: 15,000 m²).
2.  **HV Cable Depot (Mombasa Hub)**: Saline-controlled buffer specialized for marine transmission lines, high-tension lines, and coastal line replacements.
3.  **Transformer Yard (Isinya Node)**: Deep electrical transformer charging bays, heavy switchgear, and auxiliary power distribution reactors.
4.  **Project Site A & B**: Staging areas at the active construction sites (e.g., Suswa Lot 4) monitoring on-site dispatch, local stock depletion, and staging inventory delays.
