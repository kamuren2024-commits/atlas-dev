# SERVICE MESH & ZERO-TRUST MESH — KETRACO SCM Intelligence Nexus

This is the master Service Mesh specification charter for the KETRACO SCM Intelligence Nexus, managing secure inter-service communication and progressive application rollouts.

---

## 🏛️ Subsystem Directory Map

Detailed mesh specifications, PeerAuthentication rules, and zero-trust policies can be accessed in our specialized document directories:

1. **Service Mesh Architecture**: [SERVICE_MESH.md](docs/service-mesh/SERVICE_MESH.md)
2. **Traffic Management & Canary**: [TRAFFIC_MANAGEMENT.md](docs/service-mesh/TRAFFIC_MANAGEMENT.md)
3. **mTLS Encryption Specs**: [MTLS.md](docs/service-mesh/MTLS.md)
4. **Zero-Trust Access Policies**: [ZERO_TRUST.md](docs/service-mesh/ZERO_TRUST.md)
5. **Service Discovery Registry**: [SERVICE_DISCOVERY.md](docs/service-mesh/SERVICE_DISCOVERY.md)

---

## 💡 Mesh-Level Zero Trust Security Summary

We employ **Istio Service Mesh** utilizing Envoy sidecar proxies to enforce cryptographic isolation:

* **Strict mTLS**: All traffic between microservices is encrypted using TLS v1.3 with automated certificate rotation every 12 hours.
* **Workload Identity**: Services are identified securely using SPIFFE IDs bound to local Kubernetes service accounts.
* **Granular Authorization**: Microservices are isolated using explicit `AuthorizationPolicies`. No service can contact another unless an ALLOW rule is explicitly registered.
* **Canary Releases**: Envoy sidecars support fine-grained 90/10 traffic splits and request mirroring to staging replica pools.
