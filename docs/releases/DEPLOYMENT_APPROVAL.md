# DEPLOYMENT APPROVAL PROCESS

This document outlines the approval workflows and delegation boundaries for General Availability promotions.

---

## 1. Approval Gateways

Deployments into production clusters require formal, multi-party electronic sign-offs:

```
  [ Release Proposal ] ──► [ SRE Approver ] ──► [ Security Approver ] ──► [ Deploy ]
```

---

## 2. Escalation Boundaries

* **Standard Release**: Requires SRE Team sign-off.
* **Major Schema Update**: Requires Database Steward and SRE Lead sign-off.
* **Emergency Hotfix**: Allows bypass of non-security gates, requiring a post-release retrospective within 24 hours.
