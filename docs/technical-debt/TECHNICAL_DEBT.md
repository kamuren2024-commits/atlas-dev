# TECHNICAL DEBT REGISTRATION & CONTROL

This document details identified technical debt, performance tradeoffs, and remediation plans.

---

## 1. High Priority Technical Debt

| Debt ID | Component | Severity | Description | Remediation Plan |
| :--- | :--- | :---: | :--- | :--- |
| **DEBT-01** | Sourcing Core | Medium | Synchronous database calls block event pipelines | Migrate to asynchronous worker pools |
| **DEBT-02** | Compliance | Low | Duplicate validation regex patterns in inline codes | Centralize validators into utility modules |
| **DEBT-03** | Telemetry Hub | Medium | Missing index on raw operational logs tables | Apply multi-column composite index structures |

---

## 2. Refactoring Cycle Allocations

Our development divisions allocate **15% of active compute story cycles** each iteration specifically to address technical debt logged in this register.
