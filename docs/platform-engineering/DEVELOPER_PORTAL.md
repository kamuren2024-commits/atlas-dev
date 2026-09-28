# KETRACO DEVELOPER PORTAL (BACKSTAGE)

This document details the architecture, design, and user journey of our developer self-service portal, styled as our internal developer hub.

---

## 1. Overview & Architecture

Our internal Developer Portal, based on the **Spotify Backstage** open-source framework, serves as the single pane of glass for all SCM platform operations:

```
  [ Developer Portal UI ]
            │
            ├─► Software Templates Catalog (Scaffold new services in 3 clicks)
            ├─► TechDocs Engine (Continuous Markdown-to-HTML sync)
            └─► API Explorer (Interactive OpenAPI / gRPC Protobuf schemas)
```

---

## 2. Core Portal Modules

### A. Software Templates (Software Creator)
Enables developers to bootstrap fully compliant, sterile services with a simple form wizard. The wizard:
1. Provisions a new repository in our enterprise GitHub Organization.
2. Injects pre-compiled golden-path configurations.
3. Automatically creates CI/CD pipelines and registers the service in ArgoCD.

### B. TechDocs (Docs-as-Code)
TechDocs parses `.md` files residing in `/docs/` of individual microservices directly at build-time, compiling them into a unified, searchable corporate wiki.

### C. Live Environments Viewer
Provides developers with quick access to cluster status, Kubernetes pod counts, memory consumption curves, and active budget utilization counters.
