# SERVICE MESH DISCOVERY & REGISTRY

This document details service discovery and service registry mechanics within the Istio Service Mesh.

---

## 1. Pilot Service Registry

Istiod (Pilot) translates standard Kubernetes Services into Envoy-compatible service definitions, distributing endpoints dynamically to the active sidecars:

```
  [ Kubernetes API ] ──► [ Istiod (Pilot) ] ──► [ Envoy Proxy Sidecar ]
```

---

## 2. Dynamic Endpoints & Sidecar Routing

Envoy proxies cache endpoints locally to bypass Kubernetes service-proxy routing, lowering network hop overheads and reducing latencies:

* **DNS Resolution**: Handled locally by Envoy. Under standard mesh setups, sidecars hijack outbound requests on port 53 and resolve them inside the local proxy, avoiding external DNS lookups.
* **Load Balancing Algorithms**: By default, sidecars route requests using **Weighted Round Robin** or **Least Connections**, depending on the `DestinationRule` configuration.
