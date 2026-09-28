# TECHNOLOGY MODERNIZATION RADAR

For the full detailed sub-specifications, please see:
* [/docs/modernization/TECHNOLOGY_RADAR.md](/docs/modernization/TECHNOLOGY_RADAR.md)
* [/docs/modernization/MODERNIZATION_ROADMAP.md](/docs/modernization/MODERNIZATION_ROADMAP.md)
* [/docs/modernization/DEPRECATION_POLICY.md](/docs/modernization/DEPRECATION_POLICY.md)
* [/docs/modernization/MIGRATION_GUIDES.md](/docs/modernization/MIGRATION_GUIDES.md)

---

## 1. Technological Life Cycle tracking

We audit dependency versioning and architectural patterns to prevent tech-stack obsolescence:

```
  [ Assess ] ──► [ Trial ] ──► [ Adopt (Active standard) ] ──► [ Deprecate ]
```

---

## 2. Core Stack Classifications

* **Adopt**: React 18, Vite, TypeScript 5.x, Node.js 20, Tailwind CSS, PostgreSQL, Redis.
* **Trial**: Bun runtimes, WebGL-based visualization frameworks, Kafka streams.
* **Deprecate**: Synchronous REST gateways (transitioning to gRPC endpoints), React Class Components.
* **Sunset Policy**: 90-day deprecation notice window with warning headers on legacy APIs.
