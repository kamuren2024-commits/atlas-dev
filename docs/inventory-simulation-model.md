# Salience Atlas V2 - Inventory Simulation Model

This document specifies the technical architecture of the **Inventory Simulation Engine** inside Salience Atlas V2, outlining how real-world shocks are injected to test the resilience of KETRACO's SCM footprint.

## Purpose of Simulative Forecasting

Traditional static reporting fails to capture the dynamic dependencies of grid operations. The Simulation Engine allows SCM commanders to inject synthetic shocks and evaluate operational state deltas.

---

## Active Simulation Scenarios

### 1. Supplier Failure
*   **Trigger Injection**: Instigates full cargo failure or sudden supplier insolvency.
*   **Simulated Shocks**: Immediate 100% lead time delay on open Purchase Orders.
*   **System Impact Delta**: Instantly highlights projects in the *Project Supply Nexus* that face critical path delays due to inventory exhaustion of assigned items.

### 2. Inventory Shortage
*   **Trigger Injection**: Manual stock count adjustment down or scrap writes.
*   **Simulated Shocks**: Drop in buffers below the safety threshold.
*   **System Impact Delta**: Calculates time-to-depletion based on current consumption velocity.

### 3. Project Acceleration
*   **Trigger Injection**: Accelerates construction timeline (e.g., pulling a substation connection target forward by 30 days).
*   **Simulated Shocks**: Spikes the material consumption rate.
*   **System Impact Delta**: Maps against warehouse availability, showing the exact date stockout occurs.

### 4. Demand Spike
*   **Trigger Injection**: Grid-scale weather forecasts predicting severe monsoon overcurrent exposure.
*   **Simulated Shocks**: Predicts a +24% increase in earthing kits and insulator kit replacement requests.
*   **System Impact Delta**: Reallocates buffer distribution targets across regional depots in anticipation of local demands.

---

## Output Metrics & Mathematical Projections

```
[Simulation Input Run]  ===>  [Stress Engine Models]  ===>  [State Delta Outputs]
                                                             - Financial Delta ($)
                                                             - Schedule Delay (Days)
                                                             - Grid Criticality Index
                                                             - Sourcing Alt Strategy
```

### 1. Financial Impact Delta
Tracks additional costs triggered by the scenario, such as:
*   Air-shipping premium charges (+$140k).
*   Supplier substitution cost increases.
*   Contract penalties due to construction delays.

### 2. Schedule Impact Delta
Calculates delays on the project critical path (e.g., *"Suswa Lot 4 delayed by 18 days"*).

### 3. Risk Impact Delta
Escalates the item's Risk Priority Number (RPN) based on grid criticality.

### 4. Direct Actionable Mitigations
Recommends emergency rebalancing routes (e.g., stock transfer of 10 insulative clamps from Mariakani to Mombasa depot within 48 hours).
