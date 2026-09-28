# SERVICE MESH & ZERO-TRUST NETWORKING ARCHITECTURE

This charter specifies the Service Mesh design, Istio proxy configurations, and traffic control rules for KETRACO SCM services.

---

## 1. Architectural Topology

To provide secure communication, fine-grained traffic routing, and telemetry tracing, we use **Istio Service Mesh** running sidecar proxies:

```
                  [ Ingress Gateway Router ]
                               │
            ┌──────────────────┴──────────────────┐ (mTLS Strict)
            ▼                                     ▼
   [ SCM Digital Twin ] ◄────────────────► [ Contract Auditor ]
   - Envoy sidecar                       - Envoy sidecar
   - mTLS Handshakes                     - mTLS Handshakes
```

---

## 2. mTLS & Cryptographic Identity

All internal communications are protected by **Strict mTLS** utilizing SPIFFE identity standards:
* **SPIFFE ID Format**: `spiffe://cluster.local/ns/<namespace>/sa/<service-account>`
* **Certificate Authority**: Vault CA integrated with Istiod distributes ephemeral TLS certificates to sidecars with 12-hour lifetimes.
* **PeerAuthentication Manifest**:
```yaml
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: default
  namespace: scm-prod
spec:
  mtls:
    mode: STRICT
```

---

## 3. Dynamic Traffic Management & Progressive Delivery

Envoy sidecars enable fine-grained traffic controls without altering application code:

* **Canary Deployments**: Route 90% of requests to production stable and 10% to new candidate builds using Istio `VirtualService`.
* **Traffic Mirroring**: Mirror live production queries to staging testing nodes for performance profiling and validation.
* **Fault Injection**: Inject 1% packet delays or HTTP 503 errors dynamically to verify regional resiliency.
