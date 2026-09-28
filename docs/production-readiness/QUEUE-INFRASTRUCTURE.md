# Production Readiness: Queue Infrastructure Specification

## Architecture Overview
The SCM Intelligence Nexus uses a robust queue infrastructure powered by **Redis** to execute long-running asynchronous jobs. This decouples user-facing HTTP request handlers from heavyweight operations such as multi-agent SCM orchestrations, document ingestion, OCR scanning, compliance auditing, and executive report generation.

```
+--------------------+
|  HTTP REST Route   |
+--------------------+
          | (Enqueue Job)
          v
+--------------------+
|    Redis Queue     | <--- Priorities: High (10), Mid (5), Low (0)
+--------------------+
          | (Dequeue sorted by Priority)
          v
+--------------------+         (On Fail)          +--------------------+
| Background Worker  | -------------------------> | Dead Letter Queue  |
|   (Concurrency)    |   (Retry with Backoff)     |       (DLQ)        |
+--------------------+                            +--------------------+
```

---

## Design Decisions
1. **Priority Sorting**: Jobs are enqueued with a numeric priority. The fallback and Redis queues dynamically sort outstanding jobs so that critical, user-triggered operations (Priority 10) are processed ahead of standard batch operations (Priority 0).
2. **Dead-Letter Queue (DLQ) Isolation**: To protect system performance, jobs that fail repeatedly (e.g. invalid file schemas or network timeouts) are not left to block the pipeline. After exhausting retries, jobs are marked with their crash reasons and isolated in a separate DLQ for operator inspection.
3. **Resilient Backoffs**: Job retries use exponential backoff, delaying subsequent execution attempts (`Math.pow(2, retries) * 1000` ms) to let transient API outages clear before re-processing.

---

## Service Contracts
```typescript
interface QueueJob {
  id: string;
  payload: any;
  priority: number;
  retries: number;
  maxRetries: number;
  timestamp: number;
  error?: string;
}

class RedisService {
  public enqueueJob(queueName: string, jobPayload: any, priority?: number): Promise<string>;
  public dequeueJob(queueName: string): Promise<QueueJob | null>;
  public getQueueSize(queueName: string): Promise<number>;
  public getDLQSize(queueName: string): Promise<number>;
}
```

---

## Failure Scenarios & Recovery
* **Worker Crash mid-execution**: Workers lock jobs using distributed locks with custom TTLs. If a worker process dies, the lock expires automatically, and another worker node picks up the job, ensuring zero lost tasks.
* **Persistent External Outage**: If third-party AI APIs are unreachable, jobs fail their retries and transition cleanly to the DLQ. Administrators can re-enqueue jobs using the `/api/redis/queue/enqueue` endpoint once services recover.

---

## Production Readiness Checklist
- [x] Numeric priority job scheduling implemented.
- [x] Exponential backoff retry policies verified.
- [x] Crash isolation via Dead Letter Queues (DLQ) validated.
- [x] Automatic job re-enqueue endpoints exposed.
