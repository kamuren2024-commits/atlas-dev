# PROMETHEUS ALERTMANGER ROUTING SCHEMA

This document specifies our Alertmanager alerting rules, severities, and notifications.

---

## 1. Alerting Rules Configurations

We define alerting rules inside Prometheus to detect service failures and high latency:

```yaml
groups:
- name: SCM-Core-Alerts
  rules:
  - alert: HighHttp5xxRate
    expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 1
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: "HTTP 5xx rate is dangerously high"
      description: "More than 1% of incoming requests are failing with 5xx server errors."
```

---

## 2. Notification Routing Matrix

Alerts are categorized and routed based on severity:

* **Warning (Severity: warning)**: Routes to Slack alerts and standard SRE telemetry logs.
* **Critical (Severity: critical)**: Triggers immediate PagerDuty/Opsgenie phone calls and SMS escalations.
