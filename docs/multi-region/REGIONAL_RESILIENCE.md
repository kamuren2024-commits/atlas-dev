# REGIONAL RESILIENCY & FAULT TOLERANCE REPORT

This document specifies the resiliency architectures, chaos experiments, and fault limits applied across regions.

---

## 1. High Availability (HA) Cluster Setup

Each GKE cluster is deployed in a **Regional** (multi-zone) configuration:
* **Master Nodes**: Distributed across three distinct availability zones.
* **Worker Pools**: Spread evenly across zones to absorb local zone or datacenter outages with zero downtime.

---

## 2. Chaos Engineering (Region Outage Drills)

We run monthly automated region failover drills during low-traffic windows:
* **Experiment**: Simulate complete network failure in the primary region.
* **Objective**: Confirm that GSLB successfully shifts traffic to the standby cluster and the standby database is promoted within 5 minutes.
* **Status**: **PASS (verified in last drill on 2026-06-20)**.
