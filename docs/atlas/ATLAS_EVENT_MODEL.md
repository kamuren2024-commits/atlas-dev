# Atlas Event Model

`ATLAS-PSN-EVENT-001`: Project Supply Nexus defines future tenant-aware,
idempotent requirement, gap, shipment, allocation and milestone-risk events.
No synthetic PSN events are published by the current read-only implementation.

`ATLAS-NPI-EVENT-001`: procurement lifecycle evidence is stored with tenant,
source, timestamp, and idempotency-key fields. Publication to the shared event
fabric remains pending authoritative write adapters.
