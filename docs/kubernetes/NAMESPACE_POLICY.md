# KUBERNETES NAMESPACE ISOLATION POLICY

This document defines how the KETRACO SCM platform segments resources into logical namespaces to guarantee administrative, security, and networking isolation.

---

## 1. Directory of Namespaces

We enforce a strict naming standard matching `<domain>-<environment>` formats:

| Namespace Name | Purpose / Workloads | Security Level |
| :--- | :--- | :---: |
| **`scm-system`** | Shared ingress controllers, DNS managers, secrets engines. | Critical |
| **`scm-dev`** | Developer scratch workloads, local mock-ups, sandbox containers. | Sandbox |
| **`scm-staging`** | Full-scale integration replica, staging databases. | High |
| **`scm-prod`** | Production SCM Intelligence workloads. | Critical |

---

## 2. Namespace Boundary Constraints

* **Cross-Namespace Calls**: Disallowed by default. Pods in `scm-prod` cannot reach services in `scm-dev` or `scm-staging`.
* **Resource Inheritance**: Namespaces inherit default resource limits and pod security definitions automatically upon provisioning.
* **Deletion Protection**: Production namespaces (`scm-prod`, `scm-system`) have finalizers active to prevent accidental catastrophic namespace deletion via CLI.
