# GRAFANA CLUSTER INSIGHTS DASHBOARDS

This document specifies the layout designs, visualization panels, and query definitions for our Grafana cluster dashboards.

---

## 1. Primary Kubernetes Dashboard Layout

The primary cluster dashboard provides SRE teams with real-time insights into resource consumption and node health:

```
+-----------------------------------------------------------------+
| [ Cluster CPU Usage ] [ Cluster RAM Usage ] [ Active Pod Count ]|
|  Current: 42% (Max 80%) Current: 58% (Max 90%) Current: 38 Pods |
+-----------------------------------------------------------------+
| [ Node Health Status ]                                          |
| - Node-01 (europe-west2-a): Ready / Healthy                    |
| - Node-02 (europe-west2-b): Ready / Healthy                    |
| - Node-03 (europe-west2-c): Ready / Healthy                    |
+-----------------------------------------------------------------+
```

---

## 2. Mandatory Panel Metrics

* **CPU Core Allocations**: Displays the ratio of requested cores to total available cores in the cluster.
* **Memory Limits Saturation**: Highlights any containers approaching their designated memory limits, helping SREs prevent Out-Of-Memory (OOM) kills.
* **DNS Resolution Latency**: Measures CoreDNS latency to detect potential lookup bottlenecks.
