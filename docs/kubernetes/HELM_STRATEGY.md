# HELM PACKAGING & DEPLOYMENT STRATEGY

This document outlines the Helm packaging rules, parent-child chart patterns, and registry setups for our SCM application templates.

---

## 1. Unified SCM Umbrella Chart

We structure our microservices using an **Umbrella Chart** pattern, where individual microservices represent sub-charts. This structure ensures atomic releases:

```
  /charts/ketraco-scm/ (Umbrella Chart)
    ├── Chart.yaml (Defines version e.g., 3.1.0)
    ├── values.yaml (Default cluster values)
    ├── charts/ (Sub-charts folder)
    │     ├── salience-atlas-router/
    │     ├── scm-digital-twin/
    │     └── contract-auditor/
    └── templates/ (Shared global resources e.g. secrets, configmaps)
```

---

## 2. Helm Registry & Artifact Storage

* **Registry**: Container Registry (Artifact Registry) running as a secure OCI-compliant Helm registry.
* **Release Flow**:
  1. CI pipeline compiles TS, lints files, and runs security tests.
  2. Package chart: `helm package charts/ketraco-scm`.
  3. Push to OCI registry: `helm push ketraco-scm-3.1.0.tgz oci://europe-west2-docker.pkg.dev/ketraco/helm-charts`.

---

## 3. Dynamic Values Management

We separate static application values from environment-specific configurations:
* **`values.yaml`**: Standard image tags, service ports, metadata annotations.
* **`values-staging.yaml`**: Staging databases connections, 3-node scaling, standard diagnostic logs.
* **`values-production.yaml`**: HA scaling, secure KMS keys references, zero logs of prompts, 10-node minimal bounds.
