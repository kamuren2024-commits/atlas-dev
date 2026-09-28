# EXTENSION SECURITY SPECIFICATION

This document details security guardrails, token delegation scopes, and runtime sandboxing rules for platform extensions.

---

## 1. Zero-Trust Principal Token Delegations

Plugins operate under the principle of least privilege. They receive scoped, short-lived JWT tokens on invocation:

* **Procurement Clearances**: Scopes limited to `read:requisition` and `write:tender`.
* **Telemetry Clearances**: Scopes limited to `write:metric`.
* **Zero Admin Permission**: No plugin is permitted administrative write access to database schemas or config clusters.

---

## 2. Runtime Environment Sandboxing

* **gVisor Isolation**: Plugins executing on-cluster are isolated into gVisor sandboxed container pods.
* **Network Policies**: Kubernetes NetworkPolicies block plugins from direct node or database subnet communications. All interactions must go through the core HTTPS Gateway.
