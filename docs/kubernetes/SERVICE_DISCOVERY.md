# SERVICE DISCOVERY & NAMING SPECIFICATION

This document details how service discovery and cluster internal DNS are managed on KETRACO Kubernetes clusters.

---

## 1. CoreDNS Name Resolution

We run high-availability CoreDNS instances integrated with local node caches (`NodeLocal DNSCache`) to minimize lookup latencies:

* **Internal FQDN Format**: `<service-name>.<namespace-name>.svc.cluster.local`
* **Example lookup**: `scm-digital-twin.scm-prod.svc.cluster.local` Resolves to the internal ClusterIP.

---

## 2. Naming Conventions & Headless Services

For stateful clusters like PostgreSQL replicas, we use **Headless Services** to expose individual pod IPs, ensuring write-read segregation:

* **Headless FQDN Format**: `<pod-name>.<service-name>.<namespace-name>.svc.cluster.local`
* **Example lookup**: `pgvector-0.pg-replica-service.scm-prod.svc.cluster.local`

This ensures microservices connect directly to active primary DB nodes without intermediary proxy loops.
