# CLUSTER CAPACITY PLANNING DASHBOARDS

This document details our capacity planning, persistent disk tracking, and resource forecasting dashboards.

---

## 1. Capacity Planning Metrics

We track resources long-term to optimize cluster sizes and predict future cloud spend:

```yaml
metrics:
  storage_forecast:
    description: "Calculates the linear disk growth rate over a 30-day rolling window."
    alert_threshold: "Days to full <= 30"
  node_autoscaler_efficiency:
    description: "Measures the time worker VMs remain completely idle before the cluster downscales them."
```

---

## 2. IP Address Utilization Panels

In private GKE environments, IP address depletion is a common failure point. We monitor IP pools closely:
* **Subnet Allocations**: Tracks active IP allocations within GKE pod and service ranges.
* **Alerts**: Warnings are raised if IP utilization exceeds **85%**, prompting network teams to expand subnets before IP exhaustion occurs.
