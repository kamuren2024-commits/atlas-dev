# PLATFORM ENGINEERING — KETRACO SCM Intelligence Nexus

This is the master Platform Engineering specification charter for the KETRACO SCM Intelligence Nexus, managing developer self-service, golden-path scaffolding templates, and corporate service registries.

---

## 🏛️ Subsystem Directory Map

Detailed platform engineering architectures, checklists, and registries can be accessed in our specialized document directories:

1. **Platform Engineering Charter**: [PLATFORM_ENGINEERING.md](docs/platform-engineering/PLATFORM_ENGINEERING.md)
2. **Platform Standards & Conventions**: [PLATFORM_STANDARDS.md](docs/platform-engineering/PLATFORM_STANDARDS.md)
3. **Component & Microservice Catalog**: [PLATFORM_CATALOG.md](docs/platform-engineering/PLATFORM_CATALOG.md)
4. **Managed Platform Services**: [PLATFORM_SERVICES.md](docs/platform-engineering/PLATFORM_SERVICES.md)
5. **Backstage Developer Portal**: [DEVELOPER_PORTAL.md](docs/platform-engineering/DEVELOPER_PORTAL.md)
6. **Platform Roadmap & Milestones**: [PLATFORM_ROADMAP.md](docs/platform-engineering/PLATFORM_ROADMAP.md)

---

## 💡 Developer Self-Service & Golden Paths

We treat Developer Experience (DevEx) as a core product. To bootstrap a sterile, compliant microservice, developers use the `ketraco-cli` software generator wizard, which automatically:

* Scaffolds an opinionated, pre-configured framework (NodeJS/TypeScript, Python, Go).
* Injects container standards (Distroless base images, non-root user permissions).
* Automatically provisions GitHub Actions CI/CD pipelines.
* Registers the microservice as an active tracking node in our global ArgoCD GitOps cluster.
