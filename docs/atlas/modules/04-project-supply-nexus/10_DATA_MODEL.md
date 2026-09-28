# Data Model

`project_supply_requirement` is the new canonical minimum contract. It has
tenant and project indexes plus a product index for bounded joins. Logistics
stock and order-item aggregation is read-only. Allocated project stock is
currently `0` unless a future allocation table is linked; this limitation is
exposed in the calculation source/formula rather than hidden.

No requirement seed rows were inserted.
