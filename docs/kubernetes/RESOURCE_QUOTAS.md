# RESOURCE QUOTAS & LIMIT RANGES

This document specifies the cluster resource allocations, cpu/memory constraints, and storage quotas applied to KETRACO namespaces.

---

## 1. Namespace Quota Enforcements

To prevent a single runaway pod or service from starving other critical SCM systems, we enforce strict `ResourceQuotas` at the namespace level:

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: scm-prod-quota
  namespace: scm-prod
spec:
  hard:
    requests.cpu: "32"
    requests.memory: 128Gi
    limits.cpu: "64"
    limits.memory: 256Gi
    pods: "100"
    services: "20"
```

---

## 2. Default Pod LimitRanges

Every pod scheduled within the production namespace must fall within these boundaries. If a container does not specify limits, the `LimitRange` controller injects default configurations:

| Parameter | Minimum | Default Request | Default Limit | Maximum |
| :--- | :---: | :---: | :---: | :---: |
| **CPU** | `50m` | **`200m`** | **`1000m`** | `4000m` |
| **Memory** | `64Mi` | **`512Mi`** | **`2048Mi`** | `8192Mi` |

These constraints ensure that KETRACO clusters remain highly optimized and prevent resource exhaustion.
