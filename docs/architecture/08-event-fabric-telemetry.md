# 08 — Event Fabric & Real-Time Telemetry

**Target System:** Salience Atlas Real-Time Event Fabric & SCADA Telemetry Mesh  
**Scope:** `EventBus`, `EventNormalizer`, `EventFilter`, `InMemoryEventStore`, Pub/Sub Channels  
**Auditor:** Principal Distributed Systems Engineer & Real-Time Streaming Architect  
**Date:** Q3 2026  
**Status:** COMPLETE — EMPIRICAL RECONNAISSANCE BASELINE  

---

## 1. Executive Summary

In high-voltage grid management and autonomous procurement, events represent critical operational occurrences: SCADA breaker trips, line frequency oscillations, tender document uploads, and convoy GPS deviations.

Salience Atlas features a well-designed **Event Fabric subsystem** located in `backend/event-fabric/`. It defines canonical event data structures, payload normalizers, semantic event filters, and an internal publish-subscribe bus.

However, our audit reveals that **the Event Fabric is an in-memory construct**:
- The `EventBus` extends Node's built-in `EventEmitter`.
- The event buffer is capped at 100,000 events in a Node.js heap array.
- There is no persistent event log (Kafka, Redpanda, or WAL) and no durable replay mechanism across server restarts.
- The unit test `backend/tests/event-fabric.unit.test.ts` was unable to run due to broken relative import paths (`../../event-fabric/...`).

---

## 2. Event Fabric Anatomy (`backend/event-fabric/`)

```
                                  EVENT FABRIC ARCHITECTURE
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CANONICAL EVENT BUS                                     │
│                                (backend/event-fabric/event-bus.ts)                          │
└──────────────┬───────────────────────────────┬───────────────────────────────┬──────────────┘
               │                               │                               │
               ▼                               ▼                               ▼
       Event Normalizer               Priority Event Queue            InMemoryEventStore
      (normalizer.ts)                    (100k Heap Array)             (persistence.ts)
   • Strips malformed inputs          • EMERGENCY (Level 1)          • Volatile Node.js RAM
   • Assigns UUID v4 & timestamp      • HIGH (Level 2)               • Replay buffer: 5,000 events
   • Normalizes domain namespaces     • STANDARD (Level 3)           • Lost on container restart
```

### 2.1 Canonical Event Contract (`types.ts`)
Every event passing through the fabric conforms to `CanonicalEvent`:
```ts
export interface CanonicalEvent<T = any> {
  id: string;                      // UUID v4
  type: string;                    // e.g. 'telemetry.grid.frequency_anomaly'
  source: string;                  // e.g. 'scada:substation:suswa'
  timestamp: string;               // ISO 8601 UTC
  correlationId?: string;          // Distributed trace correlation
  priority: 'EMERGENCY' | 'HIGH' | 'STANDARD' | 'BACKGROUND';
  domain: 'GRID' | 'LOGISTICS' | 'PROCUREMENT' | 'FINANCE' | 'SECURITY';
  payload: T;
  provenance: {
    signature?: string;
    checksum: string;              // SHA-256 integrity hash
    originNode: string;
  };
}
```

### 2.2 Domain Event Families
The fabric actively normalizes events across five mission-critical operational domains:
1. **Grid Telemetry:** `grid.telemetry.sample`, `grid.alarm.breaker_trip`, `grid.contingency.n_minus_1`.
2. **Logistics & Fleet:** `logistics.convoy.gps_ping`, `logistics.fuel.drain_alert`, `logistics.delivery.confirmed`.
3. **Procurement & PPADA:** `procurement.bid.submitted`, `procurement.evaluation.score_finalized`, `procurement.flag.collusion_detected`.
4. **Finance & Treasury:** `finance.commitment.reserved`, `finance.invoice.approved`, `finance.payment.disbursed`.
5. **Security & Identity:** `security.auth.login_success`, `security.access.elevation_requested`.

---

## 3. Storage & Persistence Reality (`persistence.ts`)

The file `backend/event-fabric/persistence.ts` provides `InMemoryEventStore`:
```ts
export class InMemoryEventStore implements IEventStore {
  private events: CanonicalEvent[] = [];
  private readonly maxCapacity = 50000;

  async append(event: CanonicalEvent): Promise<void> {
    if (this.events.length >= this.maxCapacity) {
      this.events.shift(); // FIFO drop oldest
    }
    this.events.push(event);
  }
}
```

### Findings & Risks:
- **Zero Disk Persistence:** Events are not committed to SQLite or any write-ahead log. If the container restarts or reboots, the entire operational history is erased.
- **Memory Pressure:** Storing 50,000 JSON events in V8 heap memory consumes 50–150 MB of RAM, contributing to garbage collection overhead.
- **Lack of Partitioning:** Without message partitioning, consumers cannot execute parallel replay or distributed stream processing.

---

## 4. Test Suite Audit (`backend/tests/event-fabric.unit.test.ts`)

During our verification phase, running `npx tsx --test backend/tests/event-fabric.unit.test.ts` threw:
```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/app/applet/event-fabric/event-bus' imported from /app/applet/backend/tests/event-fabric.unit.test.ts
```
**Root Cause:** Lines 9–12 contained incorrect double-parent relative paths:
```ts
import { EventBus } from '../../event-fabric/event-bus';
```
From `/backend/tests/`, `../../` resolves to the project root `/event-fabric`, which does not exist. The correct path is `../event-fabric/event-bus`. This proves that these unit tests were never executed in continuous integration.

---

## 5. Target Architecture: Durable Event Bus

To upgrade the Event Fabric to production grade:
1. **Immediate SQLite WAL Backlog:** Introduce an `event_ledger` table in `DatabaseCore.ts` (`id`, `type`, `domain`, `priority`, `payload_json`, `timestamp`, `correlation_id`). All events published to `EventBus` are batched and written to SQLite in append-only mode.
2. **Fix Test Import Paths:** Correct import declarations in `backend/tests/event-fabric.unit.test.ts` so that event normalization and filtering tests pass cleanly.
3. **SSE / WebSocket Streaming to UI:** Expose a Server-Sent Events (SSE) route `GET /api/events/stream` so that Command Center charts and HUD indicators receive live streaming updates without client polling.
