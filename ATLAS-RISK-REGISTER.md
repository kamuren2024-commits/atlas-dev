# SALIENCE ATLAS — RISK REGISTER

> Live risk register, updated during enactment. Priority: P0 = security/runtime/presentation blocker; P1 = core functionality; P2 = major enhancement; P3 = optimization.

## Open risks (unresolved)

| ID | Priority | Risk | Evidence | Impact | Mitigation / Owner | Status |
|----|----------|------|----------|--------|--------------------|--------|
| R-001 | P0 | Hardcoded demo credentials `password123` in auth-router | `backend/security/auth-router.ts` (pre-fix) | Seeded identities trivially compromised; false sense of Zero Trust | Move to `DEMO_DEV_PASSWORD` env + startup warning | ✅ **MITIGATED** |
| R-002 | P0 | 5 route namespaces have NO auth guard | `/api/v3, /api/v4, /api/platform, /api/drone, /api/inventory` | Unauthenticated read/write of procurement/graph/platform data | Apply `authenticate` + per-route RBAC | OPEN |
| R-003 | P0 | Audit logger is an interface stub, no persistence | `backend/observability/audit-logger.ts` (10-line interface) | Security-sensitive actions untraceable | Implement real persistence to SQLite `ai_execution_logs`/`procurement_audit_log` | OPEN |
| R-004 | P1 | Frontend flagship modules are 100% hardcoded | Command Center (`grid-canonical-data.ts` jitter-as-LIVE), Supply Nexus, Supplier, Risk, Executive, Drone, Decision, TenderMockData | Stakeholder sees fabricated data presented as live SCADA/intelligence; violates "no fake production intelligence" | Wire to real backend (SLICE 1 in progress); guard flags | OPEN |
| R-005 | P1 | AI `stream()`/`embed()` silently return fabricated responses | gemini/groq/cerebras/openrouter/ollama adapters | Streaming AI shows canned text; embeddings are fake vectors → corrupts semantic search/graph ranking | Make fallback explicit + guarded; surface "SIMULATED" state | OPEN |
| R-006 | P1 | Event Fabric implemented but not mounted | `backend/event-fabric/` (REST/WS/SSE/store) | No durable cross-engine event stream; observability gaps | Mount router + WS/SSE; connect to LoopEventSystem | OPEN |
| R-007 | P1 | Knowledge Graph + Digital Twin data is in-memory seeded, not persisted | `knowledge-graph.ts`, `DigitalTwinRegistry`, `procurement-engine.ts` | State lost on restart; not queryable/auditable durably | Persist to SQLite (nodes/edges/twins/entities tables) | OPEN |
| R-008 | P1 | No unified DETECTED→…→LEARNED workflow lifecycle | every engine has bespoke states | Cannot trace a full autonomous loop end-to-end | Adopt canonical lifecycle across engines | OPEN |
| R-009 | P1 | 15+ independent in-memory stores, no crash-consistency | agents/event/graph/twin/cache | Enterprise state loss; no recovery | Converge on SQLite + Redis with replay | OPEN |
| R-010 | P2 | Postgres/Prisma declared but no migrations, no runtime wiring | `prisma/schema.prisma` (64 models), no `prisma/migrations/` | Target DB not actually used; SQLite is the runtime source of truth | Generate migrations + migrate; reconcile | OPEN |
| R-011 | P2 | No OpenTelemetry; per-request trace not across full stack | custom correlationId only | Poor end-to-end latency/error attribution | Adopt OTel + trace propagation | OPEN |
| R-012 | P2 | Planning Engine has TS compile errors and is unmounted | `tsc-errors.txt`, `backend/planning-engine/` | Not deployable; dead feature | Fix errors, mount, wire | OPEN |
| R-013 | P3 | WebSocket/SSE realtime not wired | event-fabric WS/SSE handlers dead | No live push to UI | Mount + connect to realtime UI surfaces | OPEN |

## Accepted / documented decisions
- **ADR**: The 72-hour stakeholder demo prioritizes SLICE 1 (Supply Intelligence) as the vertical slice to make end-to-end real, because it reuses the most already-real infrastructure (AutonomousProcurementEngine + KnowledgeGraphService + governance). Remaining flag-heavy modules are scoped for post-demo hardening.
- Demo identities intentionally remain env-configurable with a documented local-dev default (R-001) to keep the demo runnable; production deployments **must** set `DEMO_DEV_PASSWORD` and enable RBAC.
