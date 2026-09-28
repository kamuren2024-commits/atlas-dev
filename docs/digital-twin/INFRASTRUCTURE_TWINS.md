# INFRASTRUCTURE TWINS & TOPOLOGY MAP

This document details the regional infrastructure twins representing KETRACO substations, fiber lines, and control centers.

---

## 1. Grid Topology Mapping

The system tracks connectivity maps between key grid substations (e.g. Suswa, Isinya, Embakasi) to model power-flow dependencies:

* **Suswa Substation Twin (`ast_twin_suswa`)**: Serves as the central hub node. Models redundant active transmission corridors.
* **Isinya Substation Twin (`ast_twin_isinya`)**: Models heavy regional voltage drops.
* **Embakasi Ring Twin (`ast_twin_embakasi`)**: Models distribution line capacities.

---

## 2. Dependency Resolution

If a substation asset experiences critical failures, the topology twin computes downstream cascading grid impact to redirect supply lines.
