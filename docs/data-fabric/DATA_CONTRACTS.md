# DATA CONTRACT SPECIFICATION

This specification outlines the data contract framework, schema formats, and SLA thresholds applied across all SCM pipelines.

---

## 1. Contract Structure

Every data contract governs the relationship between a data producer and consumers, enforcing strict rules at runtime:

```yaml
contractId: "con-scm-grid-01"
version: "1.0.0"
dataset: "dp_scm_grid_twin"
owner: "grid-planning-team"
schema:
  type: object
  properties:
    node_id: { type: "string", format: "uuid" }
    substation_name: { type: "string" }
    active_capacity_mw: { type: "number", minimum: 0 }
    last_updated: { type: "string", format: "date-time" }
  required: ["node_id", "substation_name", "active_capacity_mw"]
SLA:
  availability: 99.95%
  p95_latency_ms: 200
```

---

## 2. Enforcement Mechanisms

* **CI/CD Build Check**: Schema modifications trigger automated pipeline checks to ensure no breaking changes are introduced.
* **Gateway Filter**: The API gateway intercepts and rejects incoming event payloads that do not comply with the registered JSON schema.
