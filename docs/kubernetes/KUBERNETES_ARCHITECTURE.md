# KUBERNETES ORCHESTRATION ARCHITECTURE

This document outlines the Kubernetes deployment patterns, cluster setups, and auto-scaling rules for the KETRACO SCM platform.

---

## 1. Cluster Topography

We operate a multi-cluster, production-grade Google Kubernetes Engine (GKE) architecture running on stable Autopilot configurations:

```
                  [ Public Ingress Gateway / Cloud Armor ]
                                     │
                        ┌────────────┴────────────┐
                        ▼                         ▼
            [ GKE Node Pool A ]           [ GKE Node Pool B ]
            - suswa-twin pods             - contract-eval pods
            - pgvector statefulset        - fallback routers
```

### Cluster Properties
* **Version**: Kubernetes `v1.28` (Stable GKE channel)
* **Node Types**: Private, shield-configured VM nodes with confidential computing enabled.
* **Network**: VPC-native routing with private nodes (no public IPv4 on worker nodes).

---

## 2. Workload Definitions & Layouts

### A. Deployments (Stateless Runtimes)
All core APIs (e.g., `salience-atlas-router`, `scm-digital-twin`) run as stateless Deployments.
* **Replica Configuration**: Minimum 3 pods spread across multiple availability zones using `podAntiAffinity`.

### B. StatefulSets (Database Runtimes)
PostgreSQL and local caching run as stateful sets.
* **Volume Claims**: Dynamic SSD PersistentVolumeClaims (`volumeClaimTemplates`) with multi-zone replication.

### C. CronJobs (Batch Tasks)
Supplier evaluations and daily compliance re-audits run as CronJobs at midnight UTC.
* **Cleanup Policies**: `.spec.successfulJobsHistoryLimit` is restricted to 3; failed jobs kept to 5 for debugging.

---

## 3. Auto-Scaling & Scheduling Policies

### Horizontal Pod Autoscaler (HPA)
All stateless pods scale based on CPU and custom memory thresholds:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: scm-twin-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: scm-digital-twin
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### PodDisruptionBudgets (PDB)
To prevent operational outages during cluster maintenance, all core deployments enforce a minimum of 66% available pods:
```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: twin-pdb
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: scm-digital-twin
```
