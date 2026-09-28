# EVENT_BUS — Enterprise SCM Messaging System
## Salience Atlas Autonomous Procurement Operating System (APOS)

This document describes the event-driven architecture, payload contracts, and pub/sub registries of KETRACO's SCM Event Bus.

---

### Core SCM Messaging Architecture

The APOS platform utilizes an event-driven runtime where SCM transactions, risk updates, and regulatory changes emit telemetry events. Active SCM agents and background monitoring systems subscribe to these topics to coordinate actions autonomously.

```
 [Requisition Created] ---> (Emit SCM_REQUISITION_INITIATED) ---> [Subscribers]
                                                                      |
                                           +--------------------------+--------------------------+
                                           |                                                     |
                                           v                                                     v
                                    [Planner Agent]                                     [Compliance Agent]
                              (Verify Budget Conformity)                           (Verify Reg 14 Thresholds)
```

---

### Core Event Topic Directory & Subscriptions

| Event Topic | Payload Parameters | Emitted By | Active Subscribers | Handled Actions |
| :--- | :--- | :--- | :--- | :--- |
| `SCM_REQUISITION_INITIATED` | `requisitionId`, `value`, `budgetCode` | eGP Sync / Client Gateway | Planner Agent, Compliance Agent | Verify budget cap & Reg 14 threshold rules |
| `SCM_TENDER_ADVERTISED` | `tenderId`, `advertDate`, `periodDays` | Tender Author Agent | Compliance Sentinel, Risk Analyst | Track statutory 21-day timeline requirements |
| `SCM_EVALUATION_STARTED` | `tenderId`, `committeeId`, `criteria` | eGP Sync | SCM Audit Engine, Compliance Sentinel | Lock scorecard parameters, check conflicts |
| `SCM_AWARD_RECOMMENDED` | `tenderId`, `bidderId`, `value`, `opinion` | Evaluation Committee | SCM Executive Advisor, SCM Head | Enforce Head of SCM Professional Opinion upload |
| `SCM_CONTRACT_SIGNED` | `contractId`, `value`, `standstillDays` | SCM Contract Investigator | SCM Risk Analyst, SCM Telemetry | Initialize Digital Twin shipment tracker |
| `SCM_RISK_LEVEL_INCREASED` | `riskId`, `category`, `probability` | SCM Risk Analyst | Executive SCM Director, SCM Advisor | Trigger alerts, offer alternative routes |

---

### Bus Status Certification
* **Certified Version:** `v1.4.2-STABLE`
* **Last Verified Date:** `2026-06-30`
* **Event Bus Delivery Rate:** `100% Reliable ( mTLS & AES_256_GCM Line)`
