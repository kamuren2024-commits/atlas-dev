# ZERO TRUST ARCHITECTURE & IDENTITY PLATFORM

This document defines the Zero Trust AuthorizationPolicies that govern service interactions inside the mesh.

---

## 1. Network Boundary Policies

We assume zero implicit trust. Even inside the private cluster VPC, all service-to-service calls must be explicitly authorized using Istio `AuthorizationPolicy` manifests:

```yaml
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: scm-twin-auth
  namespace: scm-prod
spec:
  selector:
    matchLabels:
      app: scm-digital-twin
  action: ALLOW
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/scm-prod/sa/salience-atlas-router-sa"]
    to:
    - operation:
        methods: ["POST"]
        paths: ["/api/simulate"]
```

This manifest guarantees that ONLY the authorized `salience-atlas-router` can make `POST` requests to `/api/simulate`. Any other pod (even from within the same namespace) is blocked with an HTTP 403 Forbidden.

---

## 2. Ingress Access Restrictions

All public-facing routes must authenticate requests using JWT tokens issued by KETRACO's centralized Keycloak cluster.

* **RequestAuthentication**:
```yaml
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: jwt-auth
  namespace: scm-prod
spec:
  jwtRules:
  - issuer: "https://keycloak.ketraco.co.ke/auth/realms/scm"
    jwksUri: "https://keycloak.ketraco.co.ke/auth/realms/scm/protocol/openid-connect/certs"
```
This restricts unauthenticated calls at the gateway layer.
