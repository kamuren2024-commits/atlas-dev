# Atlas Graph Relationships

The Phase 2 demonstration uses actual seeded adapter relationships:

`SUPPLIER -AWARDED-> CONTRACT -DELIVERS_FOR-> PROJECT -DEPENDS_ON-> SHIPMENT -CONTAINS-> INVENTORY_ITEM -STORED_AT-> WAREHOUSE`

The project also `USES` an operational transformer and delayed shipments `HAS_RISK` while the derived risk `IMPACTS` the project. Every demonstration edge includes source, source record, observation timestamp, confidence, and verification state.
