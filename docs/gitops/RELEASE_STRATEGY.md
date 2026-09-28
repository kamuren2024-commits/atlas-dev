# PROGRESSIVE DELIVERY & RELEASE STRATEGY

This document specifies our progressive delivery standards, Argo Rollouts, and canary verification stages.

---

## 1. Canary Releases with Argo Rollouts

We replace standard Kubernetes Deployments with **Argo Rollouts** to support advanced, automated canary promotions:

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: scm-digital-twin
  namespace: scm-prod
spec:
  replicas: 5
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: { duration: 1h } # Monitor telemetry
      - setWeight: 50
      - pause: { duration: 30m }
```

---

## 2. Automated Rollback Loops

During the canary window, a Prometheus-backed background monitor evaluates system telemetry:
* **Metrics Tracked**: HTTP 5xx rates, API latencies (p99), and core CPU load profiles.
* **Rollback Trigger**: If the HTTP 5xx error rate exceeds **1%**, the rollout is aborted, and traffic is rolled back to the stable version immediately.
