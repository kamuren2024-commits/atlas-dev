# ACTIVE REFACTORING PIPELINE

This document tracks refactoring schedules, current story ownership, and completion metrics.

---

## 1. Refactoring Progression Flow

Refactoring tasks proceed through a clear lifecycle to ensure code changes don't affect production stability:

```
  [ Triage Debt ] ──► [ Sandbox Test ] ──► [ Canary Release ] ──► [ Complete ]
```

---

## 2. Active Refactoring Backlog

* **SCM-REF-001 (High)**: Convert synchronous database lookup methods in the compliance auditor service to asynchronous streams.
* **SCM-REF-002 (Medium)**: Consolidate duplicate regex input sanitizers into `/src/utils/validators.ts`.
* **SCM-REF-003 (Low)**: Add missing composite indices to the telemetry logging tables.
