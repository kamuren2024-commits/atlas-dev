# GITOPS WORKFLOW & CONTINUOUS DELIVERY PROTOCOLS

This document specifies the GitOps processes, ArgoCD configurations, and automated release policies applied to KETRACO clusters.

---

## 1. Principles of GitOps Delivery

We define the desired state of all environments in declarative Git repositories. Any drift between the cluster's physical state and the Git source of truth is automatically resolved:

```
  [ Git Repository ] ◄── (Git commit triggers change)
          │
          ▼
   [ ArgoCD Sync ] ◄── (Autodetect drift)
          │
          ▼
 [ Kubernetes Cluster ] (Updates resources dynamically)
```

### Environment Repositories
* **`ketraco-scm-app`**: Holds stateless application logic, source code, and tests.
* **`ketraco-scm-infra`**: Holds Helm charts, Kubernetes YAML manifests, and network policies.

---

## 2. ArgoCD Application Topology

All services are managed under an ArgoCD **App-of-Apps** pattern. The master Application resources track the folder containing sub-service declarations:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: scm-master-application
  namespace: argocd
spec:
  project: default
  source:
    repoURL: 'https://github.com/ketraco/scm-infra.git'
    targetRevision: HEAD
    path: apps/prod/
  destination:
    server: 'https://kubernetes.default.svc'
    namespace: scm-prod
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

---

## 3. Automated Drift Remediation

* **Pruning**: ArgoCD deletes any physical resources in the cluster that are not defined in the tracking Git repository (`prune: true`).
* **Self-Healing**: If a user attempts to manually modify a deployment parameter using `kubectl edit`, ArgoCD immediately overrides the change and restores the Git-defined state (`selfHeal: true`).
