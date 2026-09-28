# Event Model

**Change ID:** ATLAS-NPI-EVENT-001

Lifecycle events are tenant-scoped, source-labelled, timestamped, and
idempotent through `(tenant_id, idempotency_key)`. A future event-fabric
adapter must publish lifecycle changes only after authoritative writes.
