# SALIENCE ATLAS V2 — WORKSPACE SYSTEM ARCHITECTURE
### CLASSIFICATION: CLASS III CRITICAL INFRASTRUCTURE // WORKSPACE ENGINE // PLATFORM CORE

This document defines the technical and behavioral rules for the **Workspace System** (Layer 2) of Salience Atlas V2. Users interact with the platform through distinct workspaces styled to reflect their operational role and current tasks.

---

## 1. THE SEAMLESS WORKSPACE CONDUIT

Each workspace functions as a self-contained operational context. When a user switches workspaces, the application retains the overall Mission Shell layout, loading only the relevant center list assets, right intelligence panels, and key action lists:

```
                  ┌─────────────────────────────────┐
                  │    MISSION SHELL (LAYER 1)      │
                  │   (Command, Notifications)      │
                  └───────────────┬─────────────────┘
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
  [ Tender Workspace ]   [ Project Workspace ]   [ Executive Workspace ]
  - Evaluators Grids     - Critical Path Maps    - Strategic Briefings
  - Bid Timelines        - Delivery Trackers     - Scenario Simulations
```

---

## 2. STANDARD WORKSPACE DEFINTIONS

The platform defines six core workspaces, each loaded with specialized data matrices and analytics models:

### 2.1 Tender Workspace
-   **Core Interface**: Technical specification forms, evaluator matrices, and live bid tracking boards.
-   **Key Decisions**: Technical evaluation approvals, bid deadlines adjustments, and award recommendation signs.
-   **Cognitive Agent**: `Tender-Advisor-v3` (auditing regulatory compliance).

### 2.2 Supplier Workspace
-   **Core Interface**: Global contractor registries, financial stability metrics, and supplier performance scorecards.
-   **Key Decisions**: Supplier qualification signs, sanction-list audits, and priority routing selections.
-   **Cognitive Agent**: `Vendor-Profiler-v2` (auditing supplier capacity and risk exposures).

### 2.3 Project Workspace
-   **Core Interface**: Regional project maps, material scheduling tables, and transit tracking.
-   **Key Decisions**: Route updates, material dispatch approvals, and delay mitigations.
-   **Cognitive Agent**: `Logistics-Strategist-v4` (tracking delivery critical paths).

### 2.4 Contract Workspace
-   **Core Interface**: Legal contract drafts, performance bond status trackers, and contract variation forms.
-   **Key Decisions**: Variation limit sign-offs, payment release authorizations, and closure signs.
-   **Cognitive Agent**: `Contract-Auditor-v2` (detecting value changes exceeding statutory limits).

### 2.5 Simulation Workspace
-   **Core Interface**: Price change controls, weather impact simulation paths, and material availability projection charts.
-   **Key Decisions**: Proactive inventory restocking buys and alternative resource layouts.
-   **Cognitive Agent**: `Forecaster-Brain-v4` (modeling complex system risks).

### 2.6 Executive Workspace
-   **Core Interface**: Overall system performance trends, strategic executive briefs, and real-time risk alerts.
-   **Key Decisions**: Emergency direct procurement sign-offs and major capital allocations.
-   **Cognitive Agent**: `Orchestrated-Executive-Brain` (coordinating multi-agent operations).

---

## 3. STATE SYNCHRONIZATION & CACHING

Workspaces map their state to the global application layout using unified context hooks. Re-navigation retrieves cached layouts within `< 100ms`, verifying that operator workflows stay fluid and zero telemetry is lost during session transitions.
