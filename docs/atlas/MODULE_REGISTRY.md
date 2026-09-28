# Atlas Module Registry

The executable registry is [`packages/platform/index.ts`](../../packages/platform/index.ts). It describes existing modules without replacing them.

| ID | Existing capability | Status | Main dependencies |
|---|---|---|---|
| `executive-command-center` | Protected Executive Mission Control | existing | Tenant context, event fabric, graph service |
| `procurement-intelligence` | Tender/evaluation/rules/evidence | integrating | Evaluation and audit services |
| `logistics-intelligence` | Logistics UI/API/service | integrating | Event fabric and inventory |
| `inventory-intelligence` | Inventory Hub and inventory capabilities | integrating | Logistics and project supply |
| `enterprise-ai-intelligence` | Ask Atlas, AI runtime/federation, agents | integrating | AI federation, AI runtime, knowledge graph |

The registry will grow through adapters after each module's actual routes, data sources, events, and AI dependencies are validated.
