# KUBERNETES ORCHESTRATION — KETRACO SCM Intelligence Nexus

This is the master Kubernetes Orchestration specification charter for KETRACO SCM workloads, managing multi-zone private VM clusters, stateless workloads, and stateful databases.

---

## 🏛️ Subsystem Directory Map

Detailed container orchestration metrics, resource limitations, and ingress policies are located in our specialized document directories:

1. **Kubernetes Topography**: [KUBERNETES_ARCHITECTURE.md](docs/kubernetes/KUBERNETES_ARCHITECTURE.md)
2. **Helm Packaging Strategy**: [HELM_STRATEGY.md](docs/kubernetes/HELM_STRATEGY.md)
3. **Namespace Isolation Policy**: [NAMESPACE_POLICY.md](docs/kubernetes/NAMESPACE_POLICY.md)
4. **Resource Quotas & Limits**: [RESOURCE_QUOTAS.md](docs/kubernetes/RESOURCE_QUOTAS.md)
5. **Ingress & Edge Routing**: [INGRESS_POLICY.md](docs/kubernetes/INGRESS_POLICY.md)
6. **Network Isolation Policies**: [NETWORK_POLICY.md](docs/kubernetes/NETWORK_POLICY.md)
7. **Service Discovery & DNS**: [SERVICE_DISCOVERY.md](docs/kubernetes/SERVICE_DISCOVERY.md)
8. **Pod Security Standards (PSS)**: [POD_SECURITY.md](docs/kubernetes/POD_SECURITY.md)

---

## 💡 Container Orchestration Summary

We operate high-availability GKE Private clusters with redundant multi-zone node pools:

* **Stateless Runtimes**: Deployed using Kubernetes Deployments with minimum 3 pod replicas spread across zones.
* **Stateful Runtimes**: PostgreSQL with PGVector utilizes Kubernetes StatefulSets to manage dynamic SSD persistent volume mappings cleanly.
* **Auto-Scaling (HPA)**: Pods scale dynamically based on real-time CPU and custom memory utilization levels.
* **Admission Control**: Namespaces enforce GKE's **Restricted Pod Security Standard**, blocking containers attempting privilege escalations or root executions.
