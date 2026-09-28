# KUBERNETES NETWORK ISOLATION POLICIES

This document defines the NetworkPolicies applied inside KETRACO clusters to restrict pod-to-pod communications.

---

## 1. Zero Trust Default Deny

By default, all ingress and egress paths inside the production namespace are blocked. Pods must explicitly authorize connection origins and destinations:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny-all
  namespace: scm-prod
spec:
  podSelector: {} # Selects all pods
  policyTypes:
  - Ingress
  - Egress
```

---

## 2. Microservice Egress / Ingress Allocations

To allow the `salience-atlas-router` to communicate with the `scm-digital-twin` but block all other communication paths, we declare:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-router-to-twin
  namespace: scm-prod
spec:
  podSelector:
    matchLabels:
      app: scm-digital-twin
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: salience-atlas-router
    ports:
    - protocol: TCP
      port: 3000
```
This isolates the digital twin and protects spatial systems from horizontal movement attacks.
