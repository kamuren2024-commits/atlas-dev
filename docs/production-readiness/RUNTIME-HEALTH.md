# Production Readiness: Runtime Health and Diagnostics Specification

## Architecture Overview
The SCM Intelligence Nexus provides a comprehensive health reporting engine that continuously evaluates the state of the centralized Redis runtime platform, active connection pools, queue depths, background worker engines, and lock managers.

```
       [GET /api/redis/health]
                  |
                  v
       +--------------------+
       |   RedisService     |
       +--------------------+
                  |
      +-----------+-----------+
      |                       |
      v                       v
[Query Redis Server]     [Query Local Worker Stats]
      |                       |
      +-----------+-----------+
                  |
                  v
       [Consolidated JSON Report]
```

---

## Design Decisions
1. **Dynamic Degradation Diagnostics**: If the physical Redis instance is disconnected, the health API does not fail. It returns `DEGRADED_FALLBACK` with detailed metrics from the high-speed in-memory emulator, keeping operations centers fully informed.
2. **Real-time Queue Depth Auditing**: Returns current queue and DLQ sizes for all registered buffers, warning administrators if job backlogs accumulate.
3. **Low-Overhead Heartbeats**: Running health checks executes lightweight PING queries on Redis, ensuring zero performance impact on the runtime data plane.

---

## Service Contracts
* **`GET /api/redis/health`**: Returns connection state, client telemetry, lock states, queue sizes, and diagnostic logs.
* **`GET /api/redis/workers`**: Returns processed/failed statistics for all registered workers.

### Sample Health Payload
```json
{
  "success": true,
  "report": {
    "status": "CONNECTED",
    "isFallbackMode": false,
    "queues": {
      "ai_agent": 0,
      "document_ocr": 0
    },
    "dlqs": {
      "ai_agent": 0,
      "document_ocr": 0
    },
    "activeWorkersCount": 4,
    "activeLocksCount": 0
  },
  "timestamp": "2026-07-02T09:00:00.000Z"
}
```

---

## Production Readiness Checklist
- [x] Dynamic health endpoint `/api/redis/health` implemented.
- [x] Background worker stats endpoint `/api/redis/workers` implemented.
- [x] Connection state degradation warnings integrated.
- [x] Heartbeat monitoring verified.
