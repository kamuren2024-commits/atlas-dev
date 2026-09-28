# Atlas Integration Map

## Current integration surfaces

| Integration | Current surface | Phase 0 finding |
|---|---|---|
| Authentication/authorization | `backend/security`, `/api/auth`, gateway middleware | Present; complete route/tenant audit required |
| AI providers | `backend/ai-federation`, `backend/ai-runtime`, `/api/ai` | Present; provider health and offline behavior must be surfaced |
| Evaluation/procurement | `backend/evaluation`, `/api/evaluation`, `/api/v2/evaluation` | Strongest domain contract surface |
| Finance | `backend/finance`, `/api/finance`, finance UI | Present; cross-domain links needed |
| Logistics | `backend/domains/logistics`, `/api/logistics`, logistics UI | Present; source freshness is exposed, import source integration remains needed |
| Supplier intelligence | `backend/domains/supplier`, `/api/suppliers`, shared graph/evaluation | Present as governed read subset; canonical supplier master remains needed |
| Project Supply Nexus | `backend/domains/project-supply`, `/api/project-supply`, project requirement migration | `ATLAS-PSN-001`; partial requirement and logistics evidence path |
| Graph/twin | graph services, graph schema, graph UI, evaluation graph/twin APIs | Present; canonical IDs and evidence needed |
| Agents | backend agent fabric and `src/core/agents` | Two runtime families require an interoperability decision |
| Workflow/loops | backend mission/planning engines and `src/core/loop`/workflow | Present; unify events, approvals, and audit |
| Redis/jobs | `backend/database/redis-service`, server workers | Present; some workers are demonstrative delays |
| Persistence | SQLite evaluation DB, Prisma PostgreSQL schema | Split topology is a P0 |

## Required integration contract

Every cross-module request/event should carry:

`tenantId`, `correlationId`, `actorId`, `source`, `entityId`, `eventId` (for events), `schemaVersion`, `occurredAt`, and provenance.

## Phase 1 sequencing

1. Identity and tenant propagation.
2. Canonical entity adapters.
3. Event envelope and correlation.
4. Graph/twin projection.
5. Evidence and decision provenance.
6. UI truth indicators and cross-module insights.
