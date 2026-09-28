# AUTOMATED REGIONAL FAILOVER PLAYBOOK

This document outlines the step-by-step procedure for executing a regional failover.

---

## 1. Failover Trigger Conditions

A regional failover is triggered when any of the following conditions are met:
1. **GKE Outage**: The primary Kubernetes cluster becomes completely unresponsive for $\ge 5$ minutes.
2. **Network Isolation**: Complete network partitioning in the primary hosting region.
3. **Database Corruption**: Primary database failure that cannot be restored within 30 minutes.

---

## 2. Failover Execution Workflow

```
 [ Phase 1: Detach Traffic ] ──► [ Phase 2: Promote DB ] ──► [ Phase 3: Update DNS ]
 - Stop primary ingress          - Promote standby SQL      - Shift GSLB weights
```

### Execution Command:
To promote the read replica in the standby region:
```bash
gcloud sql instances promote ketraco-pgvector-standby \
  --project=ketraco-scm-prod \
  --region=europe-west3
```
This detaches the standby instance and configures it for read-write operations.
