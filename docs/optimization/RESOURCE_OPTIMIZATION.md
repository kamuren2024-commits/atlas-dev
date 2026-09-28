# RESOURCE & CONTAINER OPTIMIZATION

This document outlines the Kubernetes worker scaling, CPU/RAM profiles, and storage optimization of the KETRACO Agent Runtime.

---

## 1. Kubernetes Autoscaling Policies

GKE agent node pools dynamically adjust density to match queue load on Kafka event-bus topics:

```
  [ High Event-Bus Queue Size ] ──► [ Horizontal Pod Autoscaler ] ──► [ Spin Up Worker Pods ]
```

---

## 2. Pod Profiling Rules

* **CPU Limits**: Set at a conservative max of `1.5` cores per agent container to prevent CPU starvation.
* **Memory Limits**: Configured at `2.0` GB per container with automated recycle triggers upon breach.
* **Local Caches**: Utilizes GKE node local SSD storage pools to speed up temporary agent scratchpad operations.
