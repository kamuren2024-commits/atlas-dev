# Salience Atlas V2 - Inventory Governance & PPADA Controls

This document details the **Public Procurement and Asset Disposal Act (PPADA) 2015 statutory audit constraints** enforced by the Atlas Governance Fabric.

## The Principal Rule: No Autonomous Procurement

To enforce regulatory compliance within KETRACO, the Salience Atlas SCM system operates on a **Human-in-the-Loop** model.

*   No software agent, system automation, or robot is authorized to directly commit financial capital, issue Purchase Orders, or sign supplier contracts.
*   All agentic forecasts, reorders, and stock transfers exist exclusively as **Proposed Draft Decisions** requiring human validation, statutory checks, and dual cryptographic approvals.

---

## Statutory Review Checklist

Every proposed replenishment or stock movement undergoes automated vetting by the **Inventory Compliance Agent** matching direct provisions of the PPADA 2015:

### 1. Procurement Method Vetting (Section 92-104)
*   **Direct Sourcing Limits**: Evaluates if emergency awards exceed maximum monetary thresholds (e.g., direct emergency awards must prove grid blackout threat matching Section 103).
*   **Restricted Tendering**: Confirms that selected vendor lists contain at least the statutory minimum of 5 prequalified partners.

### 2. Price Variation Caps (Section 139)
*   Ensures that contract variation requests do not exceed the statutory cap of **25%** of the original contract base value.
*   Checks if prior variations have already exhausted the legal headroom limit on the specified lot.

### 3. Allocation and Transfer Transparency (Section 162)
*   Verifies that any stock reallocation between storage centers corresponds to active work-order reservations.
*   Maintains an immutable cryptographic tracking record to prevent unrecorded material transfers.

---

## Human Approval Gateways

Draft decisions are routed to structured workspaces based on value thresholds:

```
Proposed Action 
      │
      ▼
[Compliance Agent Check] ===> (If Failed: Block and Alert)
      │ (If Passed)
      ▼
   [Value Threshold Test]
      ├── KES < 500k  ===> Depot Manager sign-off
      ├── KES < 10M   ===> Head of SCM Authorization
      └── KES > 10M   ===> Accounting Officer / Board Seal
```
*   **Cryptographic Vault Signing**: Requires authorized users to sign approvals with level-specific security credentials, registering an audited transaction on the Salience Trust Ledger.
*   **Explanation Mandate**: Every manual approval or rejection requires a mandatory audit statement explaining the business justification (e.g., *"Insulator stock depleted, grid failure risk in Isinya"*).
