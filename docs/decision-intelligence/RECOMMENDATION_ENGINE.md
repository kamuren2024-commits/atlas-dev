# SCM RECOMMENDATION ENGINE SPECIFICATION

This document outlines the recommendations pipelines for sourcing raw materials and re-ordering grid spares.

---

## 1. Recommendation Generation Flow

The engine continuously monitors inventory levels across KETRACO depots to trigger auto-replenishment recommendation items:

```
  [ Depot Stock Drops ] ──► [ Sourcing Engine ] ──► [ Rank Sourcing Recommendations ]
                                                        - Rank 1: Supplier A (94% Match)
                                                        - Rank 2: Supplier B (88% Match)
```

---

## 2. Ranking Algorithm Parameters

Recommendations are weighted across three primary vectors:
* **Cost Factor (35%)**: Total procurement bid value.
* **Lead Time Factor (40%)**: Historic supply-chain delivery timeliness.
* **Risk/Reliability Index (25%)**: Cumulative supplier rating history.
