# NEGOTIATION SIMULATOR

## 1. Introduction
Negotiating contract amendments or handling claims (such as force majeure or price variations due to local material price spikes) is traditionally a slow, friction-filled manual process. The **ACIN Negotiation Simulator** provides a secure, sandboxed environment to model, evaluate, and forecast the impacts of various proposals.

---

## 2. Core Simulation Scenarios

```
┌────────────────────────────────────────────────────────────────────────┐
│                      NEGOTIATION SANDBOX SCENARIOS                     │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ Supplier Price   │ Geotechnical /   │ Timeline Extension│ Force Majeure │
│ Variation (Cu)   │ Foundation Shift │ Requests (Days)  │ Maritime Delay│
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### 2.1 Supplier Material Price Adjustments
*   **Trigger**: Supplier claims a price hike on high-voltage cables due to global copper pricing surges.
*   **Modeling**: The simulator fetches live commodity index data (e.g., London Metal Exchange), estimates the contractor’s material cost margin, and calculates a fair statutory price adjustment threshold.

### 2.2 Geotechnical and Design Redesigns
*   **Trigger**: Soil shifts during active foundation construction at the Suswa switchyard.
*   **Modeling**: Evaluates the cost and schedule differences between alternative piling materials (deep concrete piling vs. steel frame stabilizers), checking if the proposed redesign falls under standard contingency reserves.

### 2.3 Timeline Extension Requests
*   **Trigger**: Contractor requests a 60-day extension due to shipping delays.
*   **Modeling**: Re-runs the global project Gantt chart to check if the delayed path lies on KETRACO's absolute critical grid-stabilization path, quantifying potential energy-rationing revenue losses.

---

## 3. Causal Forecasting and Counterfactual Analysis
Operators can ask **"What-If" (Counterfactual)** questions:
*   *"What if we deny the variation request and retender the conductor cables locally?"*
    *   **Simulator Output**: Direct price drops by 15%, but scheduling delays increase by 90 days. Risk rating climbs from low to critical due to immediate blackout exposure.
*   *"What if we approve a 10% price variation instead of the requested 15%?"*
    *   **Simulator Output**: The contractor accepts, keeping the schedule intact. Cumulative variation stays safely under the 15% board-review threshold.

---

## 4. Automatic Risk Scoring & Governance
Every simulated scenario receives an automated **Risk Score** ($0 - 100$) based on:
1.  **Legal Risk**: Violation of PPADA Sections.
2.  **Financial Risk**: contingency reserve depletion levels.
3.  **Physical Risk**: Immediate electrical grid overload potential.
The simulated scenario with the lowest risk and highest completion probability is recommended to the executive officers.
