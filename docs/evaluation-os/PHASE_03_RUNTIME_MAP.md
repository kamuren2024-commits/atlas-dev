# Phase 03 Runtime Map

Status: `PARTIALLY_IMPLEMENTED`

| Surface | Current runtime | Phase 03 status |
|---|---|---|
| Domain events | `backend/event-fabric/event-bus.ts` and `EventFabric` | Existing in-process bus with SQLite persistence; new governed envelope/schema contracts added |
| Durable event store | `SQLiteEventStore` | Development/test only; PostgreSQL outbox remains the consistency boundary |
| Redis | `RedisService` | Cache, sessions, rate limiting, and ephemeral coordination; not authoritative event storage |
| SSE/WebSocket | `sse-handler.ts`, `websocket-handler.ts` | Realtime delivery surfaces; not durable event authority |
| Workflow | `ProcurementWorkflowStateMachine` | In-memory state and history; new durable workflow contract added, Temporal not connected |
| MCP/tool runtime | `ToolRuntime`, `AtlasToolRegistry` | Existing generic tool runtime; new MCP security gateway contract added |
| Government connectors | Typed PPRA/E-GPS/KETRACO contracts | Contract-only/non-fabricating providers; no authorized live endpoint exercised |
| Outbox | PostgreSQL `outbox_events` foundation | Publisher/Redpanda adapter not connected |

The authoritative Phase 03 boundary is:

`PostgreSQL transaction -> outbox -> Kafka-compatible publisher -> validated consumer`

The existing SQLite event/workflow path remains development/test compatibility and
must not be presented as production durable event or workflow infrastructure.
