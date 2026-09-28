# Canonical Entities

The executable entity registry is [`packages/platform/index.ts`](../../packages/platform/index.ts). Initial definitions are descriptive only and do not alter existing database models.

Registered initial entities:

`Supplier`, `Project`, `Contract`, `Tender`, `Asset`, `Shipment`, `InventoryItem`, `Risk`, `Incident`, `Document`, `Location`, `Organization`, and `Person`.

Each entity uses a tenant-scoped canonical ID plus source system, source ID, observation timestamp, version, aliases, and provenance-compatible metadata. Legacy records should be mapped through adapters before graph projection.
