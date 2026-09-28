// ============================================================================
// SALIENCE ATLAS AI FEDERATION — LOCAL INFERENCE QUEUE
// Lightweight concurrency limiter + request queue to protect local machine
// resources from OOM/CPU exhaustion when many enterprise requests arrive.
// ============================================================================

export interface QueueStats {
  active: number;
  queued: number;
  maxConcurrent: number;
  queueLimit: number;
  rejected: number;
  completed: number;
  failed: number;
}

export class InferenceQueue {
  private active = 0;
  private queue: Array<{ fn: () => Promise<unknown>; resolve: (v: unknown) => void; reject: (e: unknown) => void }> = [];
  private maxConcurrent: number;
  private queueLimit: number;
  private rejected = 0;
  private completed = 0;
  private failed = 0;

  constructor() {
    this.maxConcurrent = (() => {
      const v = Number(process.env.AI_LOCAL_MAX_CONCURRENT_REQUESTS);
      return Number.isFinite(v) && v > 0 ? v : 2;
    })();
    this.queueLimit = (() => {
      const v = Number(process.env.AI_LOCAL_QUEUE_LIMIT);
      return Number.isFinite(v) && v > 0 ? v : 20;
    })();
  }

  get maxConcurrentRequests(): number {
    return this.maxConcurrent;
  }

  get queueLimitSize(): number {
    return this.queueLimit;
  }

  /**
   * Run a function, gated by the concurrency limit. If the queue is full,
   * the task is rejected immediately (queue overflow protection).
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    if (this.active >= this.maxConcurrent) {
      if (this.queue.length >= this.queueLimit) {
        this.rejected++;
        throw new Error(`Local inference queue is full (limit ${this.queueLimit}). Retry later.`);
      }
      return new Promise<T>((resolve, reject) => {
        this.queue.push({
          fn: fn as () => Promise<unknown>,
          resolve: resolve as (v: unknown) => void,
          reject,
        });
      });
    }

    this.active++;
    try {
      const result = await fn();
      this.completed++;
      return result;
    } catch (err) {
      this.failed++;
      throw err;
    } finally {
      this.active--;
      this.drain();
    }
  }

  /**
   * Get current queue statistics.
   */
  getStats(): QueueStats {
    return {
      active: this.active,
      queued: this.queue.length,
      maxConcurrent: this.maxConcurrent,
      queueLimit: this.queueLimit,
      rejected: this.rejected,
      completed: this.completed,
      failed: this.failed,
    };
  }

  private drain(): void {
    while (this.active < this.maxConcurrent && this.queue.length > 0) {
      const next = this.queue.shift();
      if (!next) break;
      this.active++;
      Promise.resolve()
        .then(() => next.fn())
        .then(
          (v) => {
            this.completed++;
            next.resolve(v);
          },
          (e) => {
            this.failed++;
            next.reject(e);
          }
        )
        .finally(() => {
          this.active--;
          this.drain();
        });
    }
  }
}
