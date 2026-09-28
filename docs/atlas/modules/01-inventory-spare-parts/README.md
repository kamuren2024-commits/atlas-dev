# Module 01 — Inventory & Spare Parts Intelligence

Phase 01 baseline for the existing KETRACO inventory and logistics capability.
This module reuses the logistics database, authorization, audit, event and
graph foundations; it does not create a parallel inventory platform.

## Current truth

The Inventory Hub is a UI surface with local demo state. The logistics API is
the production-connected path for tenant-scoped facilities, products, stock,
shipments and events. `GET /api/logistics/inventory/risk` is deterministic and
returns `UNVERIFIED` when validated demand or criticality factors are absent.

See [01_CURRENT_STATE_AUDIT.md](./01_CURRENT_STATE_AUDIT.md) and
[16_PRODUCTION_READINESS.md](./16_PRODUCTION_READINESS.md).
