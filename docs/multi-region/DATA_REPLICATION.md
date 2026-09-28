# DATA REPLICATION SPECIFICATION

This document outlines our database streaming replication details, object sync schedules, and replication lag metrics.

---

## 1. Database Replication Mechanics

We use PostgreSQL native streaming replication over a secure VPC tunnel:

* **Replication Mode**: Asynchronous.
* **Network Encrpytion**: All data in transit is encrypted using IPSec VPN tunnels between regional VPC subnets.
* **Target Recovery Point**: $\le 15$ minutes of replication lag maximum permissible.

---

## 2. Replication Lag Monitoring

We track the replication lag metric using Prometheus:

* **Metric**: `pg_stat_replication_lag_bytes`
* **Warning Alert Threshold**: Lag exceeds **10 MB** (indicating potential network congestion).
* **Critical Alert Threshold**: Lag exceeds **100 MB** (triggers pager alerts).
