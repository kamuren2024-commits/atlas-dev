# Current State Audit

| Capability | Frontend | Backend | Database | Status |
|---|---|---|---|---|
| Item master | Inventory Hub and ItemMasterPanel | Demo `/api/inventory/items`; logistics product model | `logistics_product` | CONNECTED_PARTIAL |
| Stock position | Inventory Hub demo state | `/api/logistics/inventory` | `logistics_stock` | CONNECTED_PARTIAL |
| Warehouses | Logistics UI | `/api/logistics/warehouses` | `logistics_facility` | PRODUCTION_CONNECTED |
| Movement history | Inventory Hub demo transactions | logistics movement foundations | logistics movement tables | CONNECTED_PARTIAL |
| Stockout risk | UI labels only before Phase 01 | deterministic `/inventory/risk` | current stock only | CONNECTED_PARTIAL |
| AI forecast | UI copy and agent panels | no validated inventory model | none | UI_ONLY |

Runtime verification is required before any capability is called operational.
Known blockers are split persistence strategy, synthetic/demo data boundary,
and incomplete route-wide tenant authorization evidence.
