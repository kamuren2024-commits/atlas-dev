# MISSION PLANNING ARCHITECTURE

This document outlines the cognitive decomposition, constraint resolution, and target planning algorithms of the SCM Mission Engine.

---

## 1. Goal Decomposition

Missions are modeled as hierarchical trees of objectives. A high-level goal (e.g. "Restock Suswa spares") is broken down:

```
            [ Goal: Restock Suswa Spares ]
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
 [ Tasks: Evaluate Bids ]       [ Tasks: Dispatch Logistics ]
```

---

## 2. Planning Constraints

Plans must satisfy strict operational gates:
* **Budget Limits**: Total estimated task costs must sit within approved division caps.
* **Timeline SLA**: Target tasks must complete within SLA hours.
* **Risk Envelope**: Cumulative risk scores must stay below `0.45` without escalation.
