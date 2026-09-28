# Supply Nexus — Enactment Baseline

**Baseline date:** 2026-09-02  
**Repository examined:** `Salience_Atlas` v5.1.0  
**Purpose:** Evidence-based reconstruction of the implementation state. This is an audit record, not a production-readiness claim.

## 1. Executive determination

The repository is a large modular monolith with a React/Vite client and an Express/TypeScript server. It contains substantial domain code, SQLite migrations, a PostgreSQL Prisma design, Redis integration with an in-memory fallback, an AI gateway, agent/workflow/event code, and many UI surfaces. The implementation is **not production-ready**.

The authoritative runtime path is currently Express → `DatabaseCore` → SQLite file (`data/salience_atlas.db`). The Prisma PostgreSQL schemas and migration scripts are present but are not the server's active persistence path. Several advertised intelligence paths explicitly return simulated, hardcoded, or placeholder results. Authentication includes static demo users, a plaintext password comparison, a deterministic fallback JWT secret, development bypass behavior, and a Chrome-extension gateway that accepts missing or fabricated credentials.

## 2. Evidence scope and repository map

Top-level implementation areas observed:

| Area | Observed role | Evidence/status |
|---|---|---|
| `src/` | Primary React SPA, shell, logistics, tender, finance, graph, mission, AI and agent workspaces | **REAL UI; integration mixed** |
| `server.ts` | Single Express entry point, route registration, startup, Vite serving, health endpoints | **REAL; oversized integration hub** |
| `backend/` | Security, database, evaluation, finance, logistics, AI federation/runtime, agents, event fabric, planning and mission engines | **PARTIAL; mixed maturity** |
| `services/` | Ingestion, vision, graph, risk, workflow, operations, verification, learning, executive and strategic services | **PARTIAL; many deterministic/demo services** |
| `platform/` | Agent marketplace/reputation, decision intelligence, governance, graph, memory, policy, simulation, workflow and related platform classes | **PARTIAL/mostly library-level** |
| `packages/` | Domain, contract, graph-schema, security, observability, AI and UI contracts | **REAL contracts; not proof of enactment** |
| `prisma/` | PostgreSQL schemas for core and logistics domains | **DESIGN/PARTIAL; not active runtime path** |
| `data/` | SQLite persistence, including `salience_atlas.db` | **REAL development persistence** |
| `docs/` | Extensive plans, phase summaries and architecture claims | **REFERENCE ONLY; claims require runtime evidence** |
| `apps/` | Additional app/module directories | **DISCONNECTED or separately scaffolded unless imported by active entry point** |

The source inventory contains approximately 188 backend implementation files, 21 platform files, 15 service files and 9 package files, excluding generated dependencies.

## 3. Frontend architecture map

`src/main.tsx` mounts `src/App.tsx`. `App.tsx` composes the shell and imports overview, drone/vision, tender evaluation, digital twin, SCM copilot, decision approval, contract intelligence, logistics, inventory, AI operations, procurement graph/watch, case management, finance, platform workspace, agent platform and AI runtime dashboards.

Observed client API dependencies include:

- `/api/auth/login`, `/api/auth/logout`, `/api/auth/config`
- `/api/health`, `/api/scm/telemetry`
- `/api/logistics/{overview,events,shipments}`
- `/api/evaluation/*`
- `/api/v3/graph/*`, `/api/v3/twin/*`, `/api/v3/collusion/analyze`
- `/api/missions/*`
- `/api/ai`, `/api/ai/runtime/*`
- `/api/scm/*` Chrome/SCM guidance contracts

**Frontend classification:** UI composition is real and broad. Data integration is mixed: logistics routes query SQLite, while several graph, mission, agent and SCM paths are deterministic or simulated. A rendered dashboard is not evidence that its KPI or intelligence is live.

## 4. Backend and API inventory

| Module/submodule | Frontend | Backend/API | DB/infra | AI/agents/workflows/events/graph/RAG | Status | Required enactment |
|---|---|---|---|---|---|---|
| Auth/security | Login/session UI | `/api/auth/*`; gateway auth/RBAC | Redis sessions/token metadata | Audit ledger | **RED** | Replace static users/plaintext passwords and fallback secrets; enforce tenant/resource ownership and production auth |
| Evaluation/procurement | Tender evaluation, rules, cases | `/api/evaluation/*`, `/api/v2/evaluation/*` | SQLite tables and migrations | Rule/evidence/decision services | **AMBER/RED** | Replace rule placeholders and fabricated evidence; prove provenance and test route authorization |
| Finance data fabric | Finance module | `/api/finance/*` | SQLite finance migrations; PostgreSQL design | Lineage/quality services | **AMBER** | Connect authoritative source systems, enforce production fixture guard, validate PostgreSQL deployment |
| Logistics | Logistics command center | `/api/logistics/*` | SQLite `logistics_*` tables | Knowledge graph/twin types | **AMBER** | Complete graph/twin implementation and remove degraded-success ambiguity |
| AI runtime/federation | AI runtime dashboard, chat | `/api/ai`, `/api/ai/runtime/*` | SQLite execution logs; memory runtime | Gemini real path; other providers unimplemented | **AMBER/RED** | Implement/disable advertised providers, provenance, cost/rate controls and failure semantics |
| Agents/procurement | Agent platform, SCM UI | SCM gateway and agent services | In-memory registries plus SQLite/Redis references | RAG/tool/workflow contracts | **RED for operations** | Replace simulated agent invocation and fabricated confidence with real tool execution and audit |
| Event fabric | Limited/indirect UI | event subscriptions/query/state/health routes | Event persistence/state store | Event bus and consumers | **AMBER** | Prove durable delivery, retry/DLQ, consumer registration and integration tests |
| Planning/mission | Mission control | mission/planning routes | Mostly service state | Orchestration, scenarios, approvals | **AMBER/RED** | Connect durable mission state, real workflow execution and approval audit |
| Graph/digital twin | Relationship explorer | `/api/v3/graph/*`, platform graph | No confirmed live graph DB | Graph interfaces and deterministic services | **GREY/AMBER** | Choose and connect authoritative graph store; implement traversal and provenance |
| Document/RAG | Tender/document UI | document and knowledge retrieval routes | SQLite document/evidence tables | Keyword/vector simulations and hardcoded chunks | **RED** | Implement ingestion, extraction, embeddings, retrieval, citations and source lineage |
| Observability | Dashboards/health views | health and telemetry routes | Logs/SQLite/Redis | AI telemetry/audit classes | **AMBER** | Centralize structured telemetry, alerting, retention and sensitive-data redaction |

The Express entry point registers authentication, evaluation, AI, finance, logistics, SCM, platform health, Redis, mission, graph/twin and Vite fallback routes. There are duplicate/legacy route families (`/api/evaluation` and `/api/v2/evaluation`) that require contract ownership and deprecation decisions.

## 5. Database map and persistence reality

1. `backend/database/db-core.ts` opens `data/salience_atlas.db` with `sqlite3` and runs embedded migrations `001_initial_schema`, finance migration `003`, and logistics migration `004`.
2. Embedded SQLite tables include bidders, documents, pipeline stages, procurement rules, audit logs, workflow checkpoints, agent runs, configs, conversations, notifications, AI memory and AI execution logs.
3. `prisma/schema.prisma` declares `provider = "postgresql"` and models core rules, evidence, AI logs, identity, procurement and agents.
4. `prisma/schema-logistics.prisma` declares 14 logistics models (facility, vehicle, product, stock, item, order, movement, route, driver, constraints, events and audit).
5. `backend/database/db-core-prisma.ts` exists but is not the active server dependency observed in `server.ts`.
6. `scripts/migrate_sqlite_to_postgres.js` and `scripts/validate_db01_migration.js` are present, but the validation script fails before execution under the repository's ESM package mode because it uses CommonJS `require`.

**Database status:** **AMBER/RED**. Development persistence is real SQLite; enterprise PostgreSQL is designed but not enacted as the active runtime. Transaction boundaries are exposed by `DatabaseCore`, but cross-service atomicity and migration parity are unproven.

## 6. AI, agents, workflows, events, graph and RAG truthfulness

- `backend/ai-runtime/gateway.ts` has a real Google Gemini call through `@google/genai` when `GEMINI_API_KEY` is configured. Non-Gemini providers throw “integration not yet implemented in Gateway”.
- Provider registry advertises Gemini, Groq, OpenRouter, Cerebras, OpenAI, Anthropic, DeepSeek, Together, Fireworks, HuggingFace and Ollama, but activation is configuration-driven and execution is not uniformly implemented.
- `backend/ai-runtime/memory/memory-runtime.ts` uses simple keyword matching. `platform/memory-fabric/MemoryFabric.ts` explicitly generates mock vectors; `backend/ai-federation/providers/generic.ts` has a stable embedding simulator.
- `backend/chrome-extension-api.ts` explicitly labels its gateway as simulated, accepts absent bearer credentials through a demo fallback, returns fabricated rate-limit/security headers, and returns a hardcoded “direct agent invocation” response with fixed confidence and advice.
- `server.ts` contains `getSimulatedIntelliResponse`, `/api/evaluation/simulate`, and response branches that set `mock: true`.
- `backend/evaluation/rule-compiler.ts` and `rule-executor.ts` contain TODO/placeholder rule logic and “all prerequisites are met” placeholder behavior.
- Graph modules expose interfaces and deterministic services, but no confirmed live Neo4j/graph database connection was found.
- Workflow, mission, simulation, risk, learning, executive and strategic services generate in-process results/IDs and are not evidence of durable external workflow execution.
- `services/vision/index.ts` derives fixed classes/confidence and a fixed bounding box from hints; no computer-vision provider is connected.
- External SCADA/EMS/GIS/WAMS/weather adapters contain mock assets/random telemetry paths. Finance includes a `NullFinanceConnector`, and the frontend AI utility has an offline mock response path.
- Event bus state is in-process memory; WebSocket and persistence modules exist, but distributed durable delivery was not demonstrated.

**AI truth status:** **RED** for operational claims until each output records `SOURCE → RETRIEVAL → MODEL/RULE → DECISION → CONFIDENCE → ACTION → AUDIT`.

## 7. Security findings

| ID | Finding | Severity/status |
|---|---|---|
| SEC-01 | `auth-router.ts` contains four static enterprise users with `password123` and compares plaintext passwords | **CRITICAL / production blocker** |
| SEC-02 | `IdentityService` uses a deterministic fallback JWT secret when `JWT_SECRET` is absent | **CRITICAL / production blocker** |
| SEC-03 | `ApiGatewayMiddleware.authenticate` bypasses authentication whenever `NODE_ENV=development`, regardless of an explicit opt-in | **HIGH / unsafe default** |
| SEC-04 | Chrome extension gateway labels JWT/OAuth verification simulated, accepts missing bearer tokens, treats arbitrary tokens as authorized contexts, and grants `scopes: ['*']` | **CRITICAL / production blocker** |
| SEC-05 | Rate-limit failure calls `next()` (“safe bypass”), converting a control failure into unrestricted access | **HIGH** |
| SEC-06 | Security logs include email, tenant, prompt content and request-derived values; redaction/retention controls are not demonstrated | **MEDIUM/HIGH** |
| SEC-07 | CSP permits `'unsafe-inline'`; no CSRF strategy was evidenced for cookie/session mutation paths | **MEDIUM** |
| SEC-08 | `.env.example` correctly contains empty placeholders, but runtime safety depends on validators and fallback behavior; no deployment secret proof exists | **AMBER** |
| SEC-09 | Several route families are registered without the same authentication chain (including legacy evaluation, runtime/Redis, graph/twin and some v4 surfaces) | **HIGH / route authorization review required** |

Positive controls observed: HMAC JWT signing/verification, token revocation/refresh rotation structures, correlation IDs, security headers, Redis-backed rate limiting when available, authorization service and audit ledger. These controls do not neutralize the blocker paths above.

## 8. Runtime and test verification

Commands attempted:

| Command | Result |
|---|---|
| `npm run lint` | **FAIL** (`tsc --noEmit`, exit 2). Errors include missing `vitest`, Prisma `Decimal`/number mismatches, unresolved logistics imports, duplicate exports, event API/type mismatches, and other cross-module type errors (see command output) |
| `npm run build` | **PASS with warnings**. Vite built the client after ~21 minutes and esbuild produced `dist/server.cjs`; warnings include Node modules externalized for browser compatibility, a 3 MB client chunk, and `import.meta` empty under CommonJS |
| `npx jest --runInBand` | **NOT COMPLETED**; npm attempted to install Jest because it was not available as a declared executable and the process was stopped after prolonged dependency installation |
| `npm run validate:db01` | **FAIL**: `ReferenceError: require is not defined in ES module scope` at `scripts/validate_db01_migration.js:13` |
| Startup/API health | Not certified; startup requires configuration and can enter Redis in-memory fallback. Health route definitions exist (`/api/health`, AI/runtime, platform and Redis health), but no successful live health response was established in this pass |

Tests found include agent registry, Redis, evidence, rule ontology, event fabric unit/integration, finance phase acceptance, mission E2E, and frontend core agent/loop/memory/workflow tests. A test file's existence is not treated as passing coverage.

## 9. Integration gaps and dependency graph

```text
React SPA
  -> Express server.ts
     -> auth/gateway middleware
     -> evaluation/finance/logistics/SCM/mission/event routes
        -> DatabaseCore (SQLite file) [active]
        -> RedisService (Redis or in-memory fallback)
        -> AI runtime -> Gemini only (other providers fail)
        -> agent fabric -> tools/memory/workflow contracts
        -> event fabric -> persistence/state/consumers
        -> graph/twin interfaces -> no confirmed external graph store
        -> documents/evidence -> keyword/mock vector paths
     -> Prisma PostgreSQL schemas and migration scripts [parallel, not active]
```

Orphans/dead or weakly connected surfaces include additional `apps/` applications, platform classes not imported by the active server, Prisma models not used by `DatabaseCore`, the PostgreSQL migration validator, simulated generic embeddings, and frontend route families with no demonstrated matching server implementation.

## 10. Enactment matrix

Legend: **GREEN** complete evidence; **AMBER** partial; **RED** blocker; **BLUE** requires integration; **GREY** not implemented/unknown.

| Capability | Existing | Real | Integrated | Tested | Secure | Production ready | Action |
|---|---:|---:|---:|---:|---:|---:|---|
| SPA shell and module navigation | Yes | Yes | Yes | Partial | Amber | No | GREEN only after route-level data verification |
| SQLite core persistence/migrations | Yes | Yes | Yes | Partial | Amber | No | AMBER; define production database authority |
| PostgreSQL Prisma architecture | Yes | Design | No | No | Unknown | No | BLUE; enact migrations and switch runtime |
| Redis integration | Yes | Conditional | Partial | Partial | Amber | No | AMBER; fail closed for security controls |
| Authentication/RBAC | Yes | Partial | Partial | Partial | **No** | **No** | **RED** |
| Evaluation/rules/evidence | Yes | Partial | Partial | Partial | Amber | No | **RED/AMBER**; remove placeholders/fabrication |
| Gemini AI inference | Yes | Yes when configured | Yes | Partial | Amber | No | AMBER; provenance and operational controls |
| Multi-provider federation | Yes | No for most providers | No | No | Unknown | No | BLUE |
| Agents and autonomous procurement | Yes | Partial/simulated | Partial | Partial | No | No | RED |
| RAG/document retrieval | Yes | No/partial | Partial | Partial | No | No | RED |
| Graph/digital twin | Yes | No confirmed live graph | Partial | Partial | Unknown | No | BLUE/GREY |
| Workflow/mission orchestration | Yes | Partial | Partial | Partial | Amber | No | AMBER/RED |
| Event fabric | Yes | Partial | Partial | Partial | Amber | No | AMBER |
| Observability/audit | Yes | Partial | Partial | Partial | Amber | No | AMBER |
| Production validation pipeline | Yes | No | No | No | No | No | RED |

## 11. Production blockers

1. Plaintext static credentials and deterministic JWT fallback secret.
2. Simulated Chrome extension authentication/authorization and fabricated security headers.
3. In-memory fallbacks for Redis and simulated/mocked RAG embeddings presented through operational surfaces.
4. Hardcoded/demo AI, agent, confidence, citation and procurement advice responses.
5. Active SQLite runtime diverges from PostgreSQL Prisma enterprise design.
6. PostgreSQL migration validation script cannot run under ESM.
7. Rule compiler/executor contains placeholder evaluation logic.
8. No completed lint/build/test/startup/health evidence from the available validation pass.
9. Unproven tenant isolation, CSRF posture, secret rotation enforcement, rate-limit fail-closed behavior and audit completeness.

## 12. What must be preserved

Preserve the existing domain contracts, route response contracts, SQLite migration history, evidence/audit data models, authorization policy intent, AI safety/evaluation layers, event envelope types, Redis namespace/queue abstractions, frontend module composition and the explicit fixture-protection tests. Future work should enact missing infrastructure behind these contracts rather than replace functioning surfaces or infer completeness from UI rendering.

## 13. Recommended Phase 01 order

1. Establish a reproducible validation baseline: fix script/runtime mode, make lint/build/tests/startup/health commands deterministic, and record CI artifacts.
2. Close authentication and authorization blockers: external identity provider or securely managed users, password hashing, mandatory secrets, no implicit bypass, tenant/resource checks, fail-closed rate limiting and extension gateway verification.
3. Decide and enact the authoritative database: PostgreSQL Prisma migrations/schema parity, controlled data migration, transaction strategy and production backups; retain SQLite only as an explicitly scoped development fixture.
4. Remove or isolate simulated operational endpoints; make demo responses impossible in production and label fixtures at every boundary.
5. Enact document ingestion/RAG provenance and real embeddings/retrieval/citations.
6. Enact provider integrations or remove unsupported providers from the runtime catalog; add budget, timeout, retry and audit tests.
7. Enact durable agent/workflow/event execution with real tools, consumers, retries, dead-letter handling and human approval gates.
8. Connect graph/digital-twin storage and verify frontend-to-API contracts end to end.
9. Harden observability, data redaction, CSP/CSRF, retention, disaster recovery and production readiness gates.
