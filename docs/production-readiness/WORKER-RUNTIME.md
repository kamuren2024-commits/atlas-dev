# Production Readiness: Worker Runtime Specification

## Architecture Overview
The Background Worker Runtime executes long-running asynchronous workflows entirely separate from the HTTP request-response cycle. This ensures that the Salience Atlas REST API remains highly responsive even under intense processing loads.

```
                    +--------------------+
                    |   Express Server   | (Responsive HTTP Thread)
                    +--------------------+
                              |
                     [Enqueue job to Redis]
                              |
                              v
+----------------------------------------------------------------+
|                   Background Worker Cluster                    | (Decoupled Threads)
+----------------------------------------------------------------+
|  +--------------------+  +--------------------+  +-----------+ |
|  |     ai_agent       |  |    document_ocr    |  |  reports  | |
|  |  (Concurrency: 2)  |  |  (Concurrency: 1)  |  | (Concurr) | |
|  +--------------------+  +--------------------+  +-----------+ |
+----------------------------------------------------------------+
```

---

## Design Decisions
1. **Thread Separation**: Workers poll and ingest jobs asynchronously. Slow, compute-heavy tasks or model calls never block the main Express server event loop.
2. **Strict Concurrency Limits**: Each worker is registered with a concurrency value (e.g. `concurrency: 2` for `ai_agent` and `concurrency: 1` for `document_ocr`). This prevents runaway memory allocation and protects third-party AI provider rate limits.
3. **Execution Locks**: Every job execution is guarded by a dynamic distributed lock `job_process_lock:${queueName}:${job.id}`. This guarantees that even with multiple horizontal instances of the application, exactly one worker node can process a specific job.

---

## Service Contracts
```typescript
class RedisService {
  public registerWorker(
    queueName: string,
    processor: (job: any) => Promise<void>,
    options?: { concurrency?: number; maxRetries?: number }
  ): string;
  public unregisterWorker(workerId: string): void;
  public getWorkerStats(): Record<string, any>;
}
```

---

## Registered Workers Blueprint
The application boots with the following specialized worker engines:
* **`ai_agent`**: Processes complex multi-agent reasoning chains (Concurrency: 2).
* **`document_ocr`**: Ingests incoming tenders and parses contracts (Concurrency: 1).
* **`compliance_audit`**: Validates SCM compliance and regulatory status (Concurrency: 1).
* **`reports`**: Compiles SCM performance briefs and PDF summaries (Concurrency: 1).

---

## Operational Considerations
* **Shut Down Gracefully**: Upon SIGTERM or system exit, the server invokes `shutdown()`, which calls `unregisterWorker()` on all nodes, terminates active poll intervals, and allows active job transactions to finish cleanly before closing connections.

---

## Production Readiness Checklist
- [x] Strict worker concurrency limits enforced.
- [x] Exclusive job processing via distributed locks verified.
- [x] Clean SIGTERM graceful shutdowns implemented.
- [x] Active worker stats and metrics endpoints exposed.
