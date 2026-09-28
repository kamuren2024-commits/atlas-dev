# Current State Audit

| Capability | Evidence | Truth status |
|---|---|---|
| Shipment list/detail | logistics API + Command Center | PRODUCTION_CONNECTED |
| Inventory/warehouse position | logistics API and SQLite migration | PRODUCTION_CONNECTED |
| Fleet/events | logistics API and event table | CONNECTED_PARTIAL |
| Source freshness | new `/data-quality` route and UI indicator | CONNECTED_PARTIAL |
| Import/customs/port milestones | no persisted source found | UNVERIFIED |
| ETA prediction/AI | no dedicated logistics model | NOT_STARTED |

The protected Command Center is preserved. Demo-only surfaces elsewhere in the
repository are not treated as logistics operational truth.
