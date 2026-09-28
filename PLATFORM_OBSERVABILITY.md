# PLATFORM OBSERVABILITY — KETRACO SCM Intelligence Nexus

This document defines KETRACO's platform observability architecture, unified log formats, performance monitoring thresholds, and cluster capacity metrics.

---

## 1. Unified Observability Stack

We implement a comprehensive monitoring, logging, and tracing stack based on **OpenTelemetry**, **Prometheus**, and **Grafana**:

```
 [ Microservice Envoy Proxy ] ──► [ OpenTelemetry Collector ]
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       ▼                                             ▼
          [ Prometheus Metrics ]                           [ Tempo / Cloud Trace ]
          - Scrapes custom SCM telemetry                  - Distributed traces
```

---

## 2. Core SLI / SLO Metrics Catalog

We measure our service performance against strict Service Level Indicators (SLIs) and Service Level Objectives (SLOs):

| Platform Component | Metric / SLI | SLO Target | Warning Alert | Critical Alert |
| :--- | :--- | :--- | :--- | :--- |
| **Ingress Gateway** | Request latency (p99) | **$\le 15$ ms** | $> 20$ ms (5 min) | $> 50$ ms (2 min) |
| **SCM Twin Simulation** | Calculation time (p95) | **$\le 500$ ms** | $> 800$ ms | $> 2000$ ms |
| **Contract Auditor** | API Error Rate | **$\le 0.1\%$** | $> 0.5\%$ | $> 2.0\%$ |
| **All Clusters** | Pod Availability | **$\ge 99.95\%$** | $< 99.9\%$ | $< 99.0\%$ |

---

## 3. Prometheus / Grafana Capacity Metrics

We track cluster capacity to optimize node pools and prevent scheduling bottlenecks:

* **Node CPU Utilization**: Alerts trigger if total cluster CPU usage exceeds **85%** for 15 consecutive minutes, prompting node-pool scaling.
* **PersistentVolume Space**: Alerts trigger if available space on any PostgreSQL PV drops below **20%**, allowing SREs to resize disks before they fill up.
* **IP Allocation Pools**: Tracks IP availability within the private GKE subnets. Warnings are raised if IP utilization exceeds **90%**.
