# Atlas Event Catalog

## Contract-only cross-module events

The following names are reserved as shared contracts and are not claimed to be live across all modules:

`inventory.stock_changed`, `inventory.stockout_risk_detected`, `shipment.status_changed`, `shipment.delayed`, `supplier.risk_changed`, `supplier.performance_updated`, `project.health_changed`, `project.risk_detected`, `contract.obligation_due`, `contract.status_changed`, `tender.status_changed`, `procurement.approval_required`, `risk.escalated`, and `workflow.approval_required`.

Existing event systems remain operational. The shared [`AtlasEventEnvelope`](../../packages/contracts/atlas-fabric.ts) provides tenant, source, correlation, version, entity, and provenance fields for progressive adoption.
