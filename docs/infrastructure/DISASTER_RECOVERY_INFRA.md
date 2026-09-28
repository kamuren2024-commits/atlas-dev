# INFRASTRUCTURE DISASTER RECOVERY SPECIFICATION

This document outlines the infrastructure reconstruction steps, recovery points, and active-passive synchronization.

---

## 1. Multi-Region Replication Strategy

To ensure high availability in the event of a catastrophic region outage, we maintain automated, sterile replica templates of our baseline infrastructure:

* **Warm-Standby Cluster**: The primary GKE cluster in `europe-west2` is replicated as a sterile standby in `europe-west3`.
* **Terraform Portability**: Modules are parameterized with the `${var.region}` variable, allowing immediate reconstruction in any backup region via:
```bash
terraform apply -var="region=europe-west3" -auto-approve
```

---

## 2. Recovery Objective Auditing

| Recovery Metric | Infrastructure Strategy | SLO Threshold | Tested Result |
| :--- | :--- | :--- | :---: |
| **RTO (Duration)**| Terraform automated deployments + ArgoCD syncs. | **$\le 4$ hours** | **1.2 hours** |
| **RPO (Data Age)** | Synchronous Cloud SQL database backups. | **$\le 1$ hour** | **15 minutes** |

This guarantees that KETRACO can recover from a full cloud zone failure with minimal data loss.
