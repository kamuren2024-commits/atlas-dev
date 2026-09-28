# OPERATIONAL EXCELLENCE CERTIFICATION

For the full detailed sub-specifications, please see:
* [/docs/operations/OPERATIONS_CERTIFICATION.md](/docs/operations/OPERATIONS_CERTIFICATION.md)
* [/docs/operations/SRE_GUIDE.md](/docs/operations/SRE_GUIDE.md)
* [/docs/operations/ONCALL_RUNBOOK.md](/docs/operations/ONCALL_RUNBOOK.md)
* [/docs/operations/SERVICE_CATALOG.md](/docs/operations/SERVICE_CATALOG.md)

---

## 1. On-Call and SRE Performance

Our SRE teams operate under strict service level objectives (SLOs) to guarantee high-availability operations:

```
  [ Incident Triggered ] ──► [ MTTA < 2 Minutes ] ──► [ MTTR < 15 Minutes ]
```

---

## 2. SRE Operational Pillars

* **Automated Runbooks**: Playbooks are automated via code to minimize human recovery times.
* **Continuous Monitoring**: Prometheus, OpenTelemetry, and Alertmanager track system telemetry streams.
* **Regular Training**: SRE engineers participate in game-day disaster simulations quarterly.
