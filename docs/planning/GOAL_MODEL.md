# GOAL MODEL SPECIFICATIONS

This document details hierarchical goal representations, state definitions, and decomposition rules of the Planning Engine.

---

## 1. Goal Modeling Tree

Goals are specified declaratively as trees of logical clauses that must evaluate to TRUE:

```
                [ Goal: Substation Spare Restocked ]
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
 [ Sub-Goal: Bid Awarded ]              [ Sub-Goal: Delivery Completed ]
```

---

## 2. Target State Parameters

* **Objective ID**: Uniquely indexes goals (e.g. `g-substation-suswa-transformer`).
* **Required States**: Conditions that must be met (e.g. `state.bid_audit_status == "CERTIFIED"`).
* **Failure Boundaries**: Conditions triggering plan aborts (e.g. `state.market_price_deviation > 0.35`).
* **Criticality Index**: Relative priority weighting used by the scheduler to allocate compute pools.
