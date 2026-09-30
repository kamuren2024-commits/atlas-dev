# Platform Contracts

Canonical kernel contracts are defined in
[`platform/kernel/contracts.ts`](../../platform/kernel/contracts.ts). They
provide typed projections for mission, agent, skill, model, tool, evidence,
evaluation, policy, approval, workflow, event, knowledge, memory, digital
twin, simulation, identity, and audit objects. Every projection carries
version, tenant, timestamps, status, and metadata; specialized objects add
only fields relevant to that primitive.

These contracts are intentionally additive. Existing API payloads and mature
domain implementations do not need to change at once. Adapters should project
existing records into the kernel forms while preserving source identifiers,
versions, provenance, and tenant boundaries. The current mapping and migration
risks are recorded in
[`ATLAS-KERNEL-BASELINE.md`](./ATLAS-KERNEL-BASELINE.md).
