# SYSTEM LATENCY PROFILES

This document outlines p90, p95, and p99 system latency profiles logged across our microservices.

---

## 1. Latency Profile Distribution

Our OpenTelemetry tracers capture latency percentiles to detect microservice performance outliers:

```
  [ Client Request ] ──► [ p50: 24ms ] ──► [ p90: 68ms ] ──► [ p99: 142ms ]
```

---

## 2. Latency Remediation Playbooks

* **Spike Alerts**: Triggers alert if p99 API completion times exceed 200ms over 5 minutes.
* **Database Indexes**: Restructures indices if SQL query completion drift exceeds 50ms.
* **In-Memory Caching**: Leverages Redis caching namespaces to accelerate heavy, repetitious data pulls.
