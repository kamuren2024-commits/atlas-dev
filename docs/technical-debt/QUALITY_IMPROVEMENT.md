# CONTINUOUS QUALITY IMPROVEMENT

This document outlines our long-term quality improvement benchmarks, code complexity limits, and code coverage targets.

---

## 1. Code Quality Metrics

The platform enforces strict code-quality boundaries across all microservices:

* **Unit Test Coverage**: Minimum **85% code coverage** required for core business logic.
* **Code Complexity (Cyclomatic)**: Max cyclomatic complexity of **15** per function block.
* **Maintainability Index**: Maintain a score above **80** (on the standard Visual Studio scale).

---

## 2. Automated Quality Checks

Code quality checks are executed automatically during development and CI/CD pipelines. Pull requests that fail to meet these quality metrics are blocked from merging.
