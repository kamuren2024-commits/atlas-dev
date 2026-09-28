# CONTRACT ANALYTICS ENGINE

## 1. Introduction
The **Contract Analytics Engine** powers the visual metrics and decision models displayed on the executive-level dashboard. It aggregates massive amounts of transactional data, compliance checks, and real-time logistics events into six diagnostic indicators.

---

## 2. Dynamic Performance Indicators

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CORE ACIN ANALYTIC INDEXES                      │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│ Contract Health  │ Supplier Perf    │ Variation Exps   │ Payment Risk  │
│ Index (CHI)      │ Index (SPI)      │ Map (VEM)        │ Tracker (PRT) │
├──────────────────┴──────────────────┴──────────────────┴───────────────┤
│ Dispute Forecast Radar (DFR)        │ Portfolio Capital Balance (PCB)  │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Contract Health Index (CHI)
A composite index representing overall risk, calculated using:
$$CHI = 0.4 \times T_{schedule} + 0.3 \times C_{budget} + 0.3 \times S_{compliance}$$
Where:
*   $T_{schedule}$: Delay days compared to milestone deadlines.
*   $C_{budget}$: Variance between actual expenditures and budget caps.
*   $S_{compliance}$: Completion score of required PPADA compliance checks.

### 2.2 Supplier Performance Index (SPI)
Tracks the quality and timing of supplier deliveries:
$$SPI = 0.5 \times D_{on\_time} + 0.3 \times Q_{conformance} + 0.2 \times R_{response}$$
Where:
*   $D_{on\_time}$: Shipping duration against milestone agreements.
*   $Q_{conformance}$: Percentage of materials passing quality inspections.
*   $R_{response}$: Response time to requests and warranty notifications.

### 2.3 Variation Exposure Map (VEM)
A color-coded visual indicator displaying cumulative variation percentages against statutory limits:
*   **Green**: Variation level is $<5\%$.
*   **Amber**: Variation level is $5\% - 15\%$. Requires project director approval.
*   **Red Alert**: Variation level is $>15\%$. Direct board approval required. Cumulative variations approaching the statutory $25\%$ cap will trigger automatic system blocks.

### 2.4 Payment Risk Tracker (PRT)
Identifies cash-flow bottlenecks and payment delays (e.g., invoices pending approval at the accounting office), ensuring compliance with the Prompt Payment Act guidelines.

### 2.5 Dispute Forecast Radar (DFR)
A prediction model analyzing contractor communications, unanswered notifications, soil redesign delays, and payment delays to project the probability of contractor arbitration or litigation.

### 2.6 Portfolio Capital Balance (PCB)
Aggregates total committed capital, contingency allocations, outstanding legal claims, and remaining funds across KETRACO's 5-year transmission grid development portfolio.
