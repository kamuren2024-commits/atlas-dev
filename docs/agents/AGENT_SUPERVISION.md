# AGENT SUPERVISION & BOUNDS

This document details safety envelopes, policy checkers, and supervisor architectures of the Multi-Agent Runtime.

---

## 1. Supervisor Agent Hierarchy

Supervisor agents oversee specialist executors, intercepting raw actions before they reach production clusters:

```
 [ Executor Agent: Command ] ──► [ Supervisor: Policy Audit ] ──► [ GKE Run / Rejection ]
```

---

## 2. Core Policy Envelopes

* **Financial Ceiling**: Restricts executor spending limits; actions over the ceiling trigger manager escalation.
* **Data Access Envelope**: Restricts SQL and file read permissions strictly based on least-privilege profiles.
* **Action Reversibility**: Mandates that destructive commands (e.g. archiving DB records) include a rollback manifest.
