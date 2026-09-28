# OBLIGATION TRACKING ENGINE

## 1. Introduction
The **Obligation Engine** is the active checking module of the Atlas ACIN. It translates contract legal clauses (traditionally expressed in legal narrative) into strict boolean conditions, timers, and threshold alerts. It continuously monitors both the supplier’s and KETRACO's obligations to prevent default.

---

## 2. Monitored Parameters

| Obligation Type | Parameter Checked | Active Trigger |
| :--- | :--- | :--- |
| **Supplier Performance Guarantee** | Performance Security Bond validity. | Warning alert 30 days before expiration. |
| **Employer Site Access** | Delivery of substation physical easement rights. | Notification if Right-of-Way (RoW) is blocked. |
| **Inspection & Testing** | Material conformity check (IEC Standards). | Automated blocking if quality drops below threshold. |
| **Warranty & Defects Liability** | 12-month post-installation defect tracking. | Retains 10% retention buffer until certification. |
| **Liquidated Damages ($LD$)** | Milestone completion deadlines. | Daily penalty accumulation formula: $LD = \text{Value} \times 0.1\% \text{ per day delayed}$. |
| **Insurance Policies** | Third-party public liability & contractor equipment. | Suspension warnings if insurance lapses. |

---

## 3. Automated Breach and Failure Detection
The engine evaluates live SCM feeds against contract parameters to identify compliance failures:

### 3.1 Approaching Deadlines
If a milestone target date is within **14 days** and physical construction at the site stands at `<70%` completion (derived from the Digital Twin), the engine fires a high-probability delay alert.

### 3.2 Compliance Failures
If a supplier's tax compliance status (KRA) becomes invalid or their debarment state changes in the PPRA database, the contract twin transitions into a `COMPLIANCE_HOLD` state, blocking any active payout releases.

### 3.3 Contract Breaches
If a contractor's delay exceeds **45 days** on a critical-path milestone, the engine drafts an official statutory "Default Notice" under PPADA guidelines, ready for human legal review.

---

## 4. Event-Sourced Audit Logs
Every state change is recorded on an event-sourced ledger:
*   `invoice_submitted` (Timestamp: T1, Payload: $InvoiceDetails)
*   `inspection_passed` (Timestamp: T2, Auditor: J. Mwathi)
*   `payment_approved` (Timestamp: T3, LedgerRef: Tx-40892)
This guarantees high-resolution, unalterable historical analysis and audit reconstruction.
