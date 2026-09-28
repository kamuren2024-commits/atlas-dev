# COST GOVERNANCE & ALLOCATION PROTOCOL

This document specifies KETRACO's cloud billing structures, cost centers, and auditing rules.

---

## 1. Corporate Cost Center Structure

We map cloud resource identifiers to corporate cost codes:

| Billing Department | Cost Center Code | Primary Resources | Allocation |
| :--- | :--- | :--- | :---: |
| **Grid Engineering** | `KE-9402` | SCM Digital Twin, Suswa node databases | 45% |
| **Procurement Compliance** | `KE-9403` | Contract Auditor Agents, Gemini API calls | 40% |
| **Core SRE Operations** | `KE-9101` | GKE Cluster control planes, Ingresses, logging | 15% |

---

## 2. Dynamic Billing Audits

* **Anomaly Detection Alerts**: Weekly billing audits scan GCP Billing Exports dynamically. Any daily cost spikes exceeding **15%** compared to the historical 14-day rolling average trigger immediate Slack/pager alarms.
* **Monthly Review Process**: The Platform SRE team holds a monthly cost allocation review to identify and prune idle disks, orphaned snapshots, or over-provisioned namespaces.
