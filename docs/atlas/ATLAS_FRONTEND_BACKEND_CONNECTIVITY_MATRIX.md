# Atlas Frontend/Backend Connectivity Matrix

Phase 04 update: `ATLAS-PSN-001`.

| Surface | Backend route | Truth status |
|---|---|---|
| Logistics Command Center | `/api/logistics/overview`, `/shipments`, `/events`, `/data-quality` | Connected subset |
| Shipment detail | `/api/logistics/shipments/:id` | Connected subset |
| Inventory Hub | separate demo `/api/inventory/*` and local state | Partial/demo |
| Import intelligence | none | Unverified |
| Project Supply Nexus | `/api/project-supply/projects/:projectId` | Partial; authenticated fetch with explicit unavailable state |
