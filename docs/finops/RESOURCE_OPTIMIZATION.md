# RESOURCE OPTIMIZATION & RIGHTSIZING GUIDE

This document details our rightsizing workflows, persistent disk standards, and compute optimization policies.

---

## 1. GKE Compute Container Rightsizing

We use Google Cloud's **Recommender API** to continuously rightsize Kubernetes pods:

* **Vertical Pod Autoscaler (VPA)**: Enabled in `Recommender` mode on stateless apps to suggest optimal CPU and memory limits based on actual execution metrics.
* **Over-provisioning Limits**: Containers must maintain a memory reservation ratio of $\ge 75\%$ during peak hours. Any container running below 30% utilization for 7 consecutive days is automatically flagged for rightsizing.

---

## 2. Storage Optimization Policies

* **Disk Types**: Database primary storage uses high-performance Balanced SSDs (`pd-balanced`); temporary and log processing directories use cheaper standard disks (`pd-standard`).
* **Snapshot Lifecycle**: Persistent volume snapshots are automatically moved to Nearline storage classes after 14 days and permanently deleted after 30 days unless legal retention rules apply.
