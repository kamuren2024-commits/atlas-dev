# POD SECURITY STANDARDS (PSS)

This document establishes the security profiles and constraints applied to Kubernetes workloads to prevent node escapes and container-level breaches.

---

## 1. Mandatory Security Policies (Restricted Level)

We enforce the **Restricted** profile from the official Kubernetes Pod Security Standards across all staging and production environments:

* **Privilege Escalation**: `allowPrivilegeEscalation: false` must be specified on all containers.
* **Root Execution Blocked**: Pods must specify `runAsNonRoot: true` and `runAsUser: 10001`.
* **ReadOnly Root Filesystem**: All container root filesystems are configured as `readOnlyRootFilesystem: true`, forcing writes to isolated ephemeral volumes (`emptyDir`).
* **Linux Capabilities**: Drop all standard capabilities; add only required network bindings if needed (`capabilities.drop: ["ALL"]`).

---

## 2. Pod Security Admission Manifest

The cluster enforces restricted policies via namespace labels:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: scm-prod
  labels:
    pod-security.kubernetes.io/enforce: restricted
    pod-security.kubernetes.io/enforce-version: latest
    pod-security.kubernetes.io/warn: restricted
    pod-security.kubernetes.io/warn-version: latest
```
Workloads violating these rules are rejected at deployment time.
