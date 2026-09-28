# CODE OWNERSHIP MATRIX — KETRACO SCM Intelligence Nexus

This ownership matrix maps all subsystems, modules, and directories to their specific purpose, dedicated technical owners, internal/external dependencies, consuming modules, criticality levels, operational risk indicators, and documentation links.

---

## 1. Directory & Module Ownership Map

| Module / Directory | Module Purpose | Tech Owner | Dependencies | Consumed By | Criticality | Risk Level | Documentation Link |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :--- |
| `/backend/core/config/` | System configuration, bootstrap loader, environment checks, secret scanners, and integrity monitors. | Lead DevSecOps SRE | Node.js File System (`fs`), `crypto`, `path` | `server.ts` | **Critical** | Low | [Config Service](docs/architecture/configuration-service.md) |
| `/backend/ai-federation/` | Provider routing catalog, fallbacks priority list, credential resolution, and key rotation system. | Principal AI Architect | `@google/genai`, `/backend/core/config/` | `server.ts`, API endpoints | **Critical** | Medium | [AI Governance](docs/ai/AI_GOVERNANCE.md) |
| `/src/components/SCMGridTwin.tsx` | Visual representation of KETRACO's transmission substation topology and live logistical delivery assets. | Chief SCM Architect | React 18+, Tailwind CSS | `/src/App.tsx` | High | Medium | [Digital Twin Design](docs/platform/overview.md) |
| `/src/components/ContractAuditor.tsx` | Procurement bid parser and compliance scanning dashboard powered by agentic SCM checks. | Lead AI Engineer | React 18+, Express API proxy | `/src/App.tsx` | High | High | [Agent Framework](docs/platform/overview.md) |
| `/src/components/SupplierScorecard.tsx` | Aggregates and charts historic vendor behavior, delivery rates, quality scores, and delays. | Lead SRE Lead | Recharts, `d3` components | `/src/App.tsx` | Medium | Low | [Analytics Overview](docs/platform/overview.md) |
| `/server.ts` | Standard full-stack production gateway; mounts Vite, routes backend API calls, and hosts governance bootstrappers. | Principal SRE Lead | Express, Vite, `/backend/` | Production Entry | **Critical** | High | [System Design](SYSTEM_DESIGN.md) |
| `/docs/platform-engineering/`| Developer Portal configuration, Golden Path bootstrapping CLI guides, and standard scaffolding libraries. | Lead SRE Lead | `ketraco-cli` SDKs | Developer Workspace | High | Low | [Platform Engineering](PLATFORM_ENGINEERING.md) |
| `/docs/kubernetes/` | Orchestration configurations, Helm charts, stateful sets, HPA resources, and Pod Security Standards (PSS).| Cloud Arch Director | GKE, Docker, Helm | Cluster Infrastructure | **Critical** | Medium | [Kubernetes Specs](KUBERNETES_ARCHITECTURE.md) |
| `/docs/infrastructure/` | Modular Terraform configurations, VPC layouts, subnets, and customer-managed GCS state locking resources. | Lead Cloud SRE | Terraform, GCS, VPC | Cloud Deployments | **Critical** | High | [IaC Specification](INFRASTRUCTURE_AS_CODE.md) |
| `/docs/service-mesh/` | Istio mesh configurations, Envoy sidecar routers, mTLS encryption profiles, and Zero-Trust access gates. | Principal Architect| Istio, Envoy, SPIFFE | Service Mesh | High | Medium | [Service Mesh Spec](SERVICE_MESH.md) |
| `/docs/finops/` | Labeling schemes, billing alert configurations, Redis caches, and provider budget threshold controls. | SRE FinOps Auditor | Redis, Cloud Billing | Cost Accounting | High | Low | [FinOps Charter](FINOPS.md) |
| `/docs/observability/` | OpenTelemetry scrapers, Prometheus metrics collectors, Grafana dashboards, and Alertmanager routers. | Monitoring Lead SRE | Prometheus, Grafana | Platform Telemetry | High | Medium | [Observability Spec](PLATFORM_OBSERVABILITY.md) |
| `/docs/data-fabric/` | Active schema verification models, data products, and interface agreements. | Chief Data Steward | Express API contract checking | Data Products | **Critical** | Low | [Data Fabric Spec](DATA_FABRIC_ARCHITECTURE.md) |
| `/docs/knowledge/` | Graph structures, entity-relationship schemas, and semantic reasoning rules. | Lead SRE Lead | PostgreSQL relationship tables | Knowledge Graph | High | Medium | [Knowledge Graph Spec](KNOWLEDGE_GRAPH.md) |
| `/docs/digital-twin/`| Asset heat models, process twins, and Monte Carlo scenario simulators. | Lead Grid Planner | React Canvas, telemetry loaders | SCM Digital Twin | High | High | [Digital Twin Spec](DIGITAL_TWIN_ARCHITECTURE.md) |
| `/docs/decision-intelligence/`| Composite risk calculations, pricing models, and WORM-ledger audits. | Compliance Director| Rule engines, database stores | Audit Portal | High | Medium | [Decision Engine Spec](DECISION_ENGINE.md) |
| `/docs/ai/` | SHAP feature attributions, prompt registries, and legal PPADA citation checkers. | AI Platform Arch | `@google/genai` RAG engines | Explainable AI | High | High | [Explainable AI Spec](EXPLAINABLE_AI.md) |
| `/docs/metadata/` | Lineage mappings, business glossary definitions, and data stewardship rules. | Stewardship Director| Schema catalog databases | SCM Catalog | High | Low | [Metadata Spec](METADATA_CATALOG.md) |
| `/docs/intelligence/` | Command center screens, global incident mappings, and executive slides. | Director of SRE | WebSocket streams, Mapbox API | Command Room | High | Medium | [Command Center Spec](ENTERPRISE_COMMAND_CENTER.md) |
| `/docs/copilots/`     | Conversational copilots for Procurement, Grid Ops, Compliance, and Executives. | Chief SCM Architect | Azure AD/OAuth, `@google/genai` | Copilot Gateway | High | Medium | [Copilots Spec](ENTERPRISE_COPILOTS.md) |
| `/docs/missions/`     | Autonomous goal tree decomposition, task graph schedulers, and execution DAGs. | SRE Lead Developer | GKE node runners, Postgres | Mission Engine | **Critical** | High | [Mission Spec](MISSION_ENGINE.md) |
| `/docs/agents/`       | Multi-agent container configurations, gVisor sandboxes, and Kafka events. | Cloud Security Officer| Kafka, gVisor container profiles | GKE Node Pool | **Critical** | High | [Runtime Spec](AGENT_RUNTIME.md) |
| `/docs/memory/`       | Tiered memory combining Redis (Working) and Postgres (Episodic) experience logs. | Lead Data Steward | Redis, vector index databases | SCM Memory | High | Low | [Memory Spec](ENTERPRISE_MEMORY.md) |
| `/docs/planning/`     | Tree-of-thought planners, reflection loops, and safety plan sandboxes. | Planning Director | `@google/genai` reasoning models| Planning Engine | High | High | [Planning Spec](PLANNING_ENGINE.md) |
| `/docs/optimization/` | GKE worker HPAs, prompt-template caches, and adaptive model routers. | SRE FinOps Auditor | OpenTelemetry, Prometheus, Redis | Self-Optimization| High | Low | [Optimization Spec](SELF_OPTIMIZATION.md) |
| `/docs/governance/`   | Human-in-the-loop approvals, escalation pathways, and global Emergency Stops. | Compliance Director| Azure AD OAuth, GKE cluster pods | Governance Gate | **Critical** | High | [Governance Spec](AUTONOMY_GOVERNANCE.md) |
| `/docs/operations/`   | Mission control maps, executive boards, and telemetry monitoring streams. | Director of SRE | Grafana, OpenTelemetry scrapers | Operations Room | High | Medium | [Operations Spec](AUTONOMOUS_OPERATIONS.md) |
| `/docs/releases/`     | GA release pipelines, promotion gates, deployment approvals, and versioning. | Release Manager | GitOps controllers, ArgoCD | Release Gate | **Critical** | High | [GA Release Spec](GA_RELEASE.md) |
| `/docs/reliability/`  | Multi-zone topologies, FMEA failure risk maps, and capacity quotas. | SRE Director | Prometheus metrics collectors | SCM Cluster | High | Low | [Reliability Spec](RELIABILITY_ENGINEERING.md) |
| `/docs/security/`     | Zero-Trust network configurations, SBOM scanners, and dynamic penetration. | Chief Security Officer| Istio PeerAuth, CycloneDX scans| SCM Mesh | **Critical** | High | [Security Spec](SECURITY_CERTIFICATION.md) |
| `/docs/recovery/`     | Point-in-time database snapshots, DNS switches, and recovery test runs. | Disaster Recovery Dir| pg_checksums, GSLB DNS config| SCM Recovery | High | Medium | [DR Spec](DISASTER_RECOVERY_CERTIFICATION.md) |
| `/docs/performance/`  | Latency distribution profiles, stress limits, and horizontal autoscaling. | Performance Lead | GKE HPA controllers, Recharts | SCM Scale | High | Low | [Performance Spec](PERFORMANCE_CERTIFICATION.md) |
| `/docs/operations/`   | SRE operations manuals, P1 on-call runbooks, and service catalogues. | SRE Lead | Prometheus, Alertmanager alerts| Operations Hub | High | Medium | [Operations Spec](OPERATIONS_CERTIFICATION.md) |
| `/docs/compliance/`   | Kenyan PPADA statutory mappings and secure data classifications. | Compliance Director| Audit logs, WORM database stores| Compliance Gate | High | High | [Compliance Spec](GA_COMPLIANCE.md) |
| `/docs/architecture/` | Port restrictions, circular dependency audits, and tech debt registers. | Chief Architect | esbuild compilation engines | SCM Core | High | Low | [Architecture Spec](ARCHITECTURE_CERTIFICATION.md) |
| `/docs/extensions/`   | gVisor dynamic plugin isolation models and runtime sandboxes. | Chief Enterprise Architect| gVisor container engines, mTLS | Extension Gate | **Critical** | High | [Extension Spec](PLATFORM_EXTENSION_MODEL.md) |
| `/docs/sdk/`          | Type-safe shared SDK client libraries and event webhooks. | SRE Lead Developer | TypeScript/Python client libraries | SDK Gateway | High | Medium | [SDK Spec](SDK_ARCHITECTURE.md) |
| `/docs/configuration/`| Feature flags, parameter canaries, and multi-tenant isolation. | SRE Lead Developer | Redis caches, Git config registries| Config Hub | High | Low | [Config Spec](CONFIGURATION_PLATFORM.md) |
| `/docs/ai/`           | Model registries, versioned prompt templates, and evaluation tests. | AI Platform Arch | `@google/genai` model endpoints | AI Registry | High | High | [AI Spec](MODEL_LIFECYCLE.md) |
| `/docs/modernization/`| Tech Radar lifecycles and deprecated interface warning headers. | Performance Lead | TS compilations, warning middleware | Tech Radar | Medium | Low | [Modernization Spec](TECHNOLOGY_RADAR.md) |
| `/docs/technical-debt/`| Circular imports prevention, port restraints, and refactoring budgets. | SRE FinOps Auditor | ESLint rules, Composite indexes | Refactor Hub | High | Low | [Tech Debt Spec](TECHNICAL_DEBT.md) |
| `/docs/product/`      | Licensing, Helm charts, and Standard/Enterprise packaging. | Platform Product Mgr | Helm v3, Distroless base images | Product Gate | High | Medium | [Product Spec](PRODUCT_STRATEGY.md) |
| `/docs/governance/`   | ARB council charters, peer reviews, and core separation policies. | Chief Architect | ARB council agendas, checklists | Governance Board| High | High | [ARB Spec](ARCHITECTURE_COUNCIL.md) |
| `/docs/evaluations/`  | AI real-time interactions and frontend performance evaluations. | SRE Platform Lead | Metric logs, WCAG contrast ratios| Evaluation Hub | High | Low | [AI Operational Spec](AI_OPERATIONAL_CERTIFICATION.md) |





---

## 2. Severity Classification Glossary

* **Critical**: Complete outage of this module prevents the server from booting, stops API requests entirely, or exposes sensitive infrastructure parameters.
* **High**: Outage blocks key functional pipelines of the application (e.g. SCM Digital Twin rendering or Contract auditing), preventing normal business usage.
* **Medium**: Module operates as a valuable analytics feature; failure degrades dashboard metrics but does not break the core server or main layout.
* **Low**: Outage has negligible operational impact (e.g. localized log helpers or diagnostic report text dumps).
