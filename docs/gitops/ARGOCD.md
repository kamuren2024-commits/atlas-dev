# ARGOCD OPERATIONS & ADMINISTRATION GUIDE

This document details the project definitions, user groups, and security controls enforced inside our ArgoCD control plane.

---

## 1. Project-Based Separation (AppProject)

We isolate different domains and stages inside ArgoCD using `AppProject` definitions:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: scm-project
  namespace: argocd
spec:
  description: "Core SCM project bounds"
  sourceRepos:
  - "https://github.com/ketraco/*"
  destinations:
  - namespace: scm-prod
    server: https://kubernetes.default.svc
  clusterResourceWhitelist:
  - group: '*'
    kind: '*'
```

---

## 2. Sync Windows & Maintenance Blocks

To prevent code rollouts during high-transaction business windows, we define strict **Sync Windows**:

* **Blocked Windows**: Monday to Friday between **08:00 and 17:00 EAT**.
* **Allowed Windows**: Tuesday and Thursday between **22:00 and 02:00 EAT** (Nightly maintenance).
* **Emergency Override**: Requires approval from two SRE Directors to apply dynamic manual overrides.
