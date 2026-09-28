# PLATFORM MIGRATION HANDBOOKS

This document details migration steps, tool configurations, and checklists for upgrading legacy integrations.

---

## 1. Upgrading from v1 to v2 REST APIs

* **Scope**: Re-aligning endpoint structures to comply with versioned `/api/v1/*` specifications.
* **Payload Transitions**:
  - Legacy: `requisition_id` (snake case)
  - V2: `requisitionId` (camel case)
* **API Sandbox Verification**: Verify that the integration runs cleanly in the port `3001` emulator.

---

## 2. Dynamic Refactoring Tools

We offer automated refactoring scripts (`npm run migrate:v2`) to convert JSON payload files and configuration files to v2 standard formats automatically.
