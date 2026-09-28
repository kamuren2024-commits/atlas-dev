# SRE P1 ON-CALL RUNBOOK

This document details the incident mitigation playbooks for P1 (Service Outage) alerts.

---

## 1. P1 Triage Lifecycle

When a P1 incident is triggered, the On-Call Engineer executes the following lifecycle:

```
  [ Alert Triggered ] ──► [ Acknowledge Page (<2m) ] ──► [ Assess Telemetry ]
                                                                 │
                                                         [ Apply Mitigation ]
```

---

## 2. Key Mitigation Playbooks

* **High API Error Rates**: Scale GKE replica pools or rollout hotfix release if drift started post-deploy.
* **Database Deadlocks**: Query pg_stat_activity, isolate locking threads, and apply terminations.
* **LLM Service Outage**: Flip traffic to backup endpoint route to sustain agent flows.
