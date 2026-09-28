# Atlas Enterprise Dependency Matrix

| Logistics dependency | Existing contract | Status |
|---|---|---|
| Inventory | `/api/logistics/inventory` and Module 01 risk contract | Partial |
| Procurement/supplier | National Procurement read contract consumes governed supplier/evaluation references | Partial (`ATLAS-NPI-001`) |
| Supplier intelligence | `/api/suppliers` over shared graph and logistics orders | Implemented subset |
| Project Supply Nexus | `/api/project-supply` over project requirements and logistics evidence | Implemented subset; milestones/contracts/site delivery remain partial |
| Projects/assets | No canonical logistics runtime link | Not started |
| Graph/twin | Shared logistics graph/twin foundations | Partial |
| Events/audit | `logistics_event` and audit logger | Partial |
Phase 04 update: `ATLAS-PSN-001`.
