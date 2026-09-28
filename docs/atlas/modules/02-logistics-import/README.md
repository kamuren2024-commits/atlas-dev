# Module 02 — Logistics & Import Intelligence

Phase 02 hardens the existing `/api/logistics` and `src/components/logistics`
surfaces. Shipment, inventory, facility, fleet and event data remain
database-backed. Import/customs/port intelligence is explicitly
`UNVERIFIED` until a validated source is persisted.

## Contracts

- `GET /api/logistics/data-quality` reports tenant-scoped source counts and
  freshness.
- Existing shipment, inventory, fleet, warehouse, event and twin routes remain
  backward compatible.
- No ETA, customs, port, carrier or AI prediction is fabricated.
