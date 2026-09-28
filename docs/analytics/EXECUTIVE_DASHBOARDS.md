# EXECUTIVE DASHBOARDS SPECIFICATION

This document outlines the design, metrics, and visualization layers of the KETRACO SCM Executive Dashboard.

---

## 1. Executive Summary Panel

The Executive Dashboard is designed to provide high-level, business-critical insights to decision-makers:

```
  ┌───────────────────────────────────────────────────────────┐
  │                 EXECUTIVE CONTROL PANEL                   │
  ├───────────────┬───────────────────────────┬───────────────┤
  │ SCM Capacity  │  Tender Audit Progress    │ API Cost Var  │
  │    94.2%      │    88 Bids Scanned        │   -28% MoM    │
  └───────────────┴───────────────────────────┴───────────────┘
```

---

## 2. Key Metric Clusters

* **Asset Performance**: Aggregate grid capacity, downtime events, and substation temperatures.
* **Tender Processing SLA**: Tracking avg days from RFP draft to award decision.
* **FinOps Efficiency**: Total cloud spend versus budget caps.
