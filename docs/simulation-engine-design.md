# SALIENCE ATLAS V2 — STOCHASTIC SIMULATION ENGINE DESIGN
### CLASSIFICATION: STRATEGIC INTEL // SIMULATION ENGINE SPECIFICATION // COGNITIVE LAB

This document lays out the architectural design for the **Stochastic Simulation Engine (SSE)** of Salience Atlas V2. The Simulation Engine allows SCM coordinators and government policymakers to evaluate simulated disruptions, budget changes, and execution adjustments within a risk-free virtualized sandbox before committing actions to the live grid.

---

## 1. SIMULATION RUNTIME ENVIRONMENT

The simulation engine clones a localized, in-memory sub-graph of active Digital Twins. Under simulation mode, all event streams are isolated in a virtual thread workspace, ensuring simulated events (e.g., a shipping container sink event) never propagate to live system databases or active supply-chain operations.

```
       [ ACTIVE ONTOLOGY SYSTEM ] (Production State URNs)
                    │
                    ├── Core Graph Clone
                    ▼
       [ SIMULATION WORKSPACE SANDBOX ] (Isolate memory)
                    │
                    ├── Execute Scenario Variables
                    ▼
       [ CASCADE IMPACT REASONER ]
        - Run Monte Carlo simulations over dependencies
        - Track schedules, costs, and compliance risks
                    │
                    ▼
      [ COMPARATIVE METRIC GENERATOR ] (Postgres Sim Logs)
```

---

## 2. STANDARD SCENARIO SIMULATION TEMPLATES

The engine provides eight (8) standard simulation schemas, built on the ontological relations of Salience Atlas:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      SIMULATED DISRUPTION TEMPLATE                     │
├────────────────────────────────────────────────────────────────────────┤
│  1. SCENARIO INPUTS: Disruption actor, start time, dynamic duration   │
│  2. TARGET ACTOR: Supplier, Tender, Budget, Inventory entity URNs      │
│  3. MONTE CARLO SEEDS: Statistical deviation ranges for lead times     │
│  4. SOLVER ITERATIONS: Default 10,000 runs over dependency trees       │
│  5. CONSTRAINT CHECKS: Legal compliance, budget limit boundary reviews│
└────────────────────────────────────────────────────────────────────────┘
```

1.  **Supplier Failure (Bankruptcy or Force Majeure)**: Simulates the sudden default of a primary supplier, calculating the cost and lead-time required to select alternative certified contractors.
2.  **Tender Cancellation (Regulatory Challenge)**: Simulates a losing vendor filing an appeal with the PPRA, halting the tender-to-award pipeline for up to 90 days.
3.  **Budget Reduction (Fiscal Austerity)**: Simulates a surprise 15% funding cut by the Treasury, prioritizing capital projects or identifying projects for suspension to minimize impact.
4.  **Inventory Shortage (Global Supply Shortfalls)**: Simulates a sudden supply freeze of raw raw components (such as electrical grade copper under international metal market runs).
5.  **Transit Disruption (Geopolitical Marine Delays)**: Simulates shipping lane bypasses around the Cape of Good Hope, calculating scheduling impact on construction milestones.
6.  **Contract Termination (De-scoping)**: Simulated termination of a contractor due to persistent non-performance, modeling the legal, technical, and logistical fallout.
7.  **Project Acceleration (Fast-Tracking)**: Models compressed construction timelines, evaluating resource demands, overtime costs, and quality control risks.
8.  **Emergency Procurement (National Grid Outage)**: Simulates fast-tracking acquisitions during system blackouts, ensuring compliance under Part XII of the PPADA.

---

## 3. MULTI-AXIS IMPACT EVALUATION ENGINE

```
                            ┌────────────────────────┐
                            │ SIMULATION RESULTS LOG │
                            └───────────┬────────────┘
                                        │
           ┌─────────────────────┬──────┴──────────────┬─────────────────────┐
           ▼                     ▼                     ▼                     ▼
    [ COST IMPACT ]      [ SCHEDULE IMPACT ]   [ COMPLIANCE IMPACT ]   [ RISK IMPACT ]
    - Spent Variance     - Critical Path Shift - PPADA Sections Check  - Probability Factor
    - Penalty Exposures  - Labor Dead-time     - Local Preference %    - System Vulnerability
```

We evaluate simulations across four core operational metrics:

### 3.1 Cost Impact Calculations
-   Aggregates immediate material price increases, re-negotiation penalties, and shipping surcharges.
-   Outputs cash-flow curves comparing the baseline, average simulation runs, and worst-case outcomes.

### 3.2 Schedule Impact (Critical Path Validation)
-   Recalculates Gantt scheduling dependencies recursively down the project work packages.
-   Identifies if a delivery delay pushes adjacent construction tasks, shifting the project timeline.

### 3.3 Compliance Impact Analysis
-   Checks if simulating alternative suppliers breaches local preference provisions of the PPADA (e.g., dropping domestic material components below 40%).
-   Flags potential regulatory breaches before supply-chain managers execute sourcing overrides.

### 3.4 Risk Impact Scoring
-   Computes systemic vulnerability scores, pinpointing critical single-points-of-failure (SPOFs) within the supply-chain configuration.
-   Highlights dependencies on a single factory or critical contractor.

---

## 4. EXAMPLE RECOMMENDATION OUTPUT (DEMO WORKSPACE)

```json
{
  "scenarioId": "sim-81fa2c10-e51c-43f6-9f0e-3ccfac8ca3a2",
  "name": "Transformer Supplier Insolvency",
  "disruptionVariables": {
    "targetSupplier": "urn:atlas:supplier:siemens-ea-nairobi",
    "probabilityDistribution": "Beta(α=3.5, β=1.8)",
    "disruptionDuration": "INDETERMINATE"
  },
  "metrics": {
    "marginalCostIncreaseDollars": 340000.00,
    "criticalPathShiftDays": 118,
    "regulatoryBypassOccurred": false,
    "newSPOFsDiscovered": [
      "urn:atlas:asset:substation-transformer-400kv-transformer-housing"
    ]
  },
  "mitigationStrategy": {
    "immediateActions": [
      "Initiate emergency direct-procurement sequence for cold-standby transformers via URN urn:atlas:supplier:abb-kenya",
      "Draft dynamic contract amendment invoking Force Majeure clauses to pause parent contractor commitments without liquidated damage penalties."
    ],
    "expectedRecoveryTimeDays": 42
  }
}
```
