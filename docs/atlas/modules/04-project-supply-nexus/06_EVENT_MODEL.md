# Event Model

The shared Event Fabric is available, but Phase 04 does not publish synthetic
requirement or risk events from a read-only endpoint. Future events include
`ProjectRequirementCreated`, `SupplyGapDetected`, `ShipmentLinked`,
`InventoryShortageDetected` and `MilestoneSupplyRiskChanged`; they require
idempotency keys, tenant context, correlation IDs and persisted source records.

Status: NOT_STARTED for PSN-specific event production.
