# AI OPERATIONS CENTER & TELEMETRY

This document details OpenTelemetry scrapers, Prometheus metrics, and Alertmanager routing for SCM agents.

---

## 1. Telemetry Ingestion Flow

The platform collects real-time operational telemetry from agent containers and API endpoints to log performance:

```
  [ Agent SDK Traces ] ──► [ OpenTelemetry Collector ] ──► [ Prometheus / Grafana ]
```

---

## 2. Core Alert Rules

* **Inference Latency Spike**: Fires if p99 API completion times exceed 850ms over a 5-minute sliding window.
* **Token Budget Warning**: Triggers if daily API cost projection crosses the designated threshold limit.
* **Agent Failure Spike**: Alerts the SRE team if aggregate agent task failure rate rises above `4%`.
