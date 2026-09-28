# GLOBAL STATUS SPECIFICATIONS

This document details global platform status alerts, downtime triggers, and incident level mapping rules.

---

## 1. Incident Level Classification

Status boards classify incidents across four levels:

| Severity Level | System Impact | Notification SLA | Response Strategy |
| :--- | :--- | :---: | :--- |
| **SEV 1 (CRITICAL)** | Core GKE API down, database offline | 15 Minutes | Automated failover, paging SREs |
| **SEV 2 (HIGH)** | Grid Telemetry lagging, model scoring down| 1 Hour | Paging on-call engineer |
| **SEV 3 (MEDIUM)** | Minor API endpoint latency | 12 Hours | Logged as ticket in Backstage |
| **SEV 4 (LOW)** | Minor typo or metadata discrepancy | 24 Hours | Handled during next sprint |

---

## 2. Health Heartbeats

Microservices transmit cryptographic heartbeats every 10 seconds. Missing three consecutive heartbeats flags the service as offline.
