# GLOBAL TRAFFIC ROUTING SPECIFICATION

This document details the geolocation and failover configurations applied on our global DNS load balancers.

---

## 1. Geolocation Routing Policies

For latency optimization, we route traffic based on the client's origin IP address:

* **East Africa Clients**: Routed directly to the closest Europe-west2 low-latency nodes.
* **Global Collaborators**: Routed to nearest available cluster using routing-weight metrics.

---

## 2. Ingress Health Probe Configuration

The GSLB load balancer is configured with standard, high-frequency probes:

```yaml
probe:
  path: "/api/health"
  interval: 5s
  timeout: 2s
  unhealthyThreshold: 3
  healthyThreshold: 1
```
This ensures prompt detection of node or region degradation.
