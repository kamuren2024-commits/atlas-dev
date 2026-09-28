# TECHNICAL DEBT REGISTER

This document catalogs identified technical debt, performance compromises, and remediation plans.

---

## 1. High Priority Technical Debt

| Debt ID | Description | Severity | Impact | Remediation Plan |
| :--- | :--- | :---: | :--- | :--- |
| **DEBT-01**| Sync database queries on main thread | Medium | Increases latency outliers | Migrating to async background workers |
| **DEBT-02**| Inline regex input sanitization codes | Low | Increases code complexity | Standardize under centralized validator utils |
| **DEBT-03**| Inefficient database index on logs table| Medium | Slows down historical searches | Apply multi-column composite indices |

---

## 2. Refactoring Allocation

Our engineering division allocates **15% of compute story cycles** each iteration specifically to address items logged in this debt registry.
