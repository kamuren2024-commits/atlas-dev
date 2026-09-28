# HORIZONTAL SCALABILITY REPORT

This document presents GKE horizontal pod autoscaling and database replication scalability benchmarks.

---

## 1. Autoscaling Mechanics

Our GKE clusters scale horizontally using Prometheus custom metrics:

```
  [ CPU Load > 75% ] ──► [ Kubernetes HPA scales Pods ] ──► [ Load Balance Traffic ]
```

---

## 2. Scalability Outcomes

* **Autoscale Latency**: New container pods boot and join active load balances within 18 seconds.
* **Read Replication Scale**: Synchronous replica clusters support up to 10,000 read queries per second.
* **Network Throughput**: Sustained peak bandwidth of 1.2 Gbps with flat response latencies.
