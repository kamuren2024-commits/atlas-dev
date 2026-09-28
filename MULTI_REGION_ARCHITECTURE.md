# MULTI-REGION ARCHITECTURE — KETRACO SCM Intelligence Nexus

This document defines KETRACO's multi-region cloud topology, active-passive disaster recovery configurations, cross-region replication schemes, and DNS routing setups.

---

## 1. Multi-Region Cloud Footprint

To ensure uninterrupted operations and low latency for power transmission hubs across Africa, we deploy our containerized compute workloads in an **Active/Passive Multi-Region Topology**:

```
        [ Global Traffic Manager / Cloud DNS GSLB ]
                            │
               ┌────────────┴────────────┐
               ▼ (Primary 100%)          ▼ (Standby 0%)
        [ Region 1: europe-west2 ]   [ Region 2: europe-west3 ]
        - Active GKE Cluster         - Sterile Standby GKE Cluster
        - Cloud SQL Primary          - Read Replica DB
```

---

## 2. Global Traffic Management (GSLB)

We resolve public domain requests (`nexus.ketraco.co.ke`) using Google Cloud DNS with Geolocation Routing Policies:

* **Health Probes**: Global load balancers probe the `/api/health` endpoint of each regional cluster every **5 seconds**.
* **Failover Conditions**: If the primary region's probe success rate drops below **90%** for 3 consecutive checks, GSLB automatically shifts 100% of traffic to the backup region.
* **DNS TTL**: Set to **30 seconds** to support near-instant failover.

---

## 3. Database & Storage Cross-Region Replication

### Cloud SQL Cross-Region Replication
* **Method**: Asynchronous PostgreSQL streaming replication.
* **Latency Target**: Cross-region replication lag is monitored and kept below **1 second** (p99).
* **Failover Promote SOP**: In a disaster recovery event, the SRE team executes a promote API call, transitioning the standby database in `europe-west3` to primary read-write status.

### GCS Buckets Replication
* **Method**: Multi-region dual-bucket topology between `europe-west2` and `europe-west3` with Object Lifecycle management to replicate historical supplier audits.
