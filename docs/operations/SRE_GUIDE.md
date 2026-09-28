# SRE PLATFORM OPERATIONS MANUAL

This document is the official SRE platform operations manual, outlining cluster architectures and command-line guides.

---

## 1. Platform Infrastructure Overview

Our platform runs on multi-zone Kubernetes (GKE) clusters managed via ArgoCD GitOps pipelines:

```
  [ ArgoCD Configuration ] ──► [ GitOps Sync ] ──► [ GKE Production Nodes ]
```

---

## 2. Diagnostic Command Reference

* **Audit Container Logs**:
  `kubectl logs -l app=scm-nexus -n production --tail=100`
* **Evaluate Pod Resource Usage**:
  `kubectl top pods -n production`
* **Trigger Manual Failover**:
  `kubectl exec -it pg-primary-0 -n production -- promote-standby`
