# Production Readiness: Runtime Status and Runbook

## Operational Status
The Salience Atlas Distributed Runtime is currently in **Production-Ready** status.

| Subsystem | Target Port | Fallback Backup | Current Status |
| :--- | :--- | :--- | :--- |
| **Redis Connection Pool** | `6379` | High-Speed InMemory Fallback | **Active / Safe Failover** |
| **Distributed Caches** | N/A | InMemory Regional Maps | **Active** |
| **Priority Queues** | N/A | Priority-Sorted In-Memory Arrays | **Active** |
| **Worker Cluster** | N/A | Local Polling Intervals | **Active** |
| **Lock Manager** | N/A | Expiry-Tracked Tokens Map | **Active** |

---

## Operational Runbook

### 1. Triaging Connection Outages
If you see the warning `REDIS PLATFORM WARNING: Redis server unavailable` during startup:
1. Check if the Redis server container is running: `docker ps | grep redis`.
2. Confirm environment configuration in `.env`:
   * `REDIS_HOST` must point to the correct Redis endpoint.
   * `REDIS_PORT` should match the exposed service port (default: `6379`).
3. Note: The application will automatically run in `DEGRADED_FALLBACK` mode with zero downtime or transaction loss. Once Redis is reachable again, the client pool will heal itself.

### 2. Inspecting and Clearing DLQs
When background jobs fail consistently (e.g. invalid document schemas):
1. Query the health endpoint `GET /api/redis/health` to find which queues have DLQ backlogs.
2. Read failed jobs to identify error causes.
3. Once the underlying issue is fixed, use the enqueue endpoint to re-process:
   ```bash
   curl -X POST http://localhost:3000/api/redis/queue/enqueue \
     -H "Content-Type: application/json" \
     -d '{"queueName": "document_ocr", "payload": {"docId": "doc_102"}}'
   ```

### 3. Toggling Maintenance Mode
To pause job processing for system upgrades, send a request to the maintenance endpoint:
```bash
curl -X POST http://localhost:3000/api/redis/maintenance \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'
```
This halts worker dequeue loops safely without dropping active jobs or disconnects.

---

## Production Readiness Checklist
- [x] Operational runbooks compiled.
- [x] Fallback mode trigger paths validated.
- [x] Administrative maintenance endpoints tested.
