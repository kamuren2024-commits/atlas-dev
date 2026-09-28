# TRAFFIC MANAGEMENT & CANARY ROUTING SPECIFICATION

This document outlines the routing rules, weight limits, and retry thresholds enforced inside the KETRACO service mesh.

---

## 1. Canary Routing via VirtualService

We deploy new features gradually. The following Istio manifest demonstrates our 90/10 canary split for the `scm-digital-twin` service:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: twin-router
  namespace: scm-prod
spec:
  hosts:
  - scm-digital-twin
  http:
  - route:
    - destination:
        host: scm-digital-twin
        subset: v3-stable
      weight: 90
    - destination:
        host: scm-digital-twin
        subset: v3-canary
      weight: 10
```

---

## 2. Resiliency: Retries & Circuit Breakers

To protect downstream services from cascading outages, Envoy sidecars enforce circuit-breaker limits:

```yaml
apiVersion: networking.istio.io/v1alpha3
kind: DestinationRule
metadata:
  name: twin-circuit-breaker
spec:
  host: scm-digital-twin
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 10
        maxRequestsPerConnection: 10
    outlierDetection:
      consecutive5xxErrors: 3
      interval: 10s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
```
This circuit breaker decouples degraded nodes instantly.
