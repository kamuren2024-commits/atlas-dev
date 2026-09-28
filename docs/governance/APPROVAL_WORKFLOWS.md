# HUMAN APPROVAL WORKFLOWS

This document details approval states, user verification, and visual dialog gates of the SCM Autonomy Governance framework.

---

## 1. Approval Gate States

Proposed tasks requiring human clearance sit in a pending state until certified by authorized operators:

```
  [ Task: PENDING ] ──► [ User Review Dashboard ] ──► [ Approved ] ──► [ Task: ACTIVE ]
```

---

## 2. User Verification Rules

* **Two-Factor Approval**: High-value transactions require a primary verification signature and mobile token.
* **Role-Based Clearances**: Approver identities are validated against Azure AD / Google Workspace groups prior to execution.
* **Auditable Log Stamp**: Every approval event records the user, exact timestamp, IP address, and approved task parameters.
