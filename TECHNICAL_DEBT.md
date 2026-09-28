# TECHNICAL DEBT REGISTRATION & CONTROL

For the full detailed sub-specifications, please see:
* [/docs/technical-debt/TECHNICAL_DEBT.md](/docs/technical-debt/TECHNICAL_DEBT.md)
* [/docs/technical-debt/ARCHITECTURE_DRIFT.md](/docs/technical-debt/ARCHITECTURE_DRIFT.md)
* [/docs/technical-debt/REFACTORING_PIPELINE.md](/docs/technical-debt/REFACTORING_PIPELINE.md)
* [/docs/technical-debt/QUALITY_IMPROVEMENT.md](/docs/technical-debt/QUALITY_IMPROVEMENT.md)

---

## 1. Automated Quality Bounds

The platform leverages static and dynamic scans to ensure pristine readability and structure:

```
  [ Code Push ] ──► [ Circular Ref Check ] ──► [ Complexity Check ] ──► [ Build ]
```

---

## 2. Core Technical Debt Standards

* **Debt Cataloging**: Identifies, severitizes, and allocates remediations (e.g., migrating sync queries to async queues).
* **Drift Control**: Implements circular dependency trackers and enforces exclusive binds on port `3000`.
* **Refactoring Budget**: Allocates **15% of active compute story cycles** strictly to refactoring tickets.
* **Continuous Quality**: Enforces strict code quality rules, requiring >85% unit test coverage.
