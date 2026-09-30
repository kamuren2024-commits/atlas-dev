# Mission Fabric

## Implemented boundary

The mission is the bounded unit of enterprise execution. The canonical
contract and transition table are implemented in
[`platform/kernel/contracts.ts`](../../platform/kernel/contracts.ts), and
planning is coordinated by
[`platform/kernel/mission-orchestrator.ts`](../../platform/kernel/mission-orchestrator.ts).
Invalid transitions are rejected, unverified agent/model/skill selections are
blocked, required tools and workflows are resolved before policy evaluation,
and policy decisions can produce an approval-required state.

## Deliberate limits

The kernel is an additive boundary. Persistence, approval resolution, tool
execution, and workflow execution remain injected seams so existing
implementations are not replaced. Callers must provide durable `persist`,
event, and audit adapters in production; the in-memory contract alone is not a
production runtime.

## Status

**PARTIAL** — the state machine and admission gate are implemented and tested,
but existing domain mission engines are not yet migrated to this boundary.
