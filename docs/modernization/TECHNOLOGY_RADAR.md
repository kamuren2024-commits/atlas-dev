# TECHNOLOGY MODERNIZATION RADAR

This document presents the Technology Radar, cataloging adopted, assessed, and deprecated software frameworks across the KETRACO ecosystem.

---

## 1. Technological Lifecycles

To prevent technical debt from accumulating, we audit framework footprints and lifecycle states:

```
  [ Assess ] ──► [ Trial ] ──► [ Adopt (Active standard) ] ──► [ Deprecate ]
```

---

## 2. Core Framework Status

* **Adopt**: React 18, Vite, TypeScript 5.x, Node.js 20, Tailwind CSS, PostgreSQL, Redis.
* **Trial**: Bun, WebGL-based charting libraries, Kafka event orchestration.
* **Deprecate**: Rest APIs (moving toward GraphQL/gRPC for internal microservices), older React Class Components.
