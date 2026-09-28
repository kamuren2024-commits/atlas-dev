// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — OPERATIONAL MEMORY
// Represents current state of the system
// ============================================================================

export interface OperationalRecord {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: string;
  ttlMs?: number;
  expiresAt?: string;
}

export class OperationalMemory {
  private static instance: OperationalMemory;
  private records: Map<string, OperationalRecord> = new Map();
  private maxRecords = 10000;

  private constructor() {}

  public static getInstance(): OperationalMemory {
    if (!OperationalMemory.instance) {
      OperationalMemory.instance = new OperationalMemory();
    }
    return OperationalMemory.instance;
  }

  /**
   * Record an operational event
   */
  record(entry: Omit<OperationalRecord, 'id' | 'timestamp'>): string {
    const id = `opm_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const record: OperationalRecord = {
      ...entry,
      id,
      timestamp: new Date().toISOString(),
      expiresAt: entry.ttlMs
        ? new Date(Date.now() + entry.ttlMs).toISOString()
        : undefined,
    };

    this.records.set(id, record);
    this.evict();
    return id;
  }

  /**
   * Query operational records
   */
  query(filters: { type?: string; since?: string; limit?: number }): OperationalRecord[] {
    let results = Array.from(this.records.values());

    if (filters.type) {
      results = results.filter(r => r.type === filters.type);
    }
    if (filters.since) {
      const since = new Date(filters.since).getTime();
      results = results.filter(r => new Date(r.timestamp).getTime() >= since);
    }

    // Remove expired records
    const now = Date.now();
    results = results.filter(r => !r.expiresAt || new Date(r.expiresAt).getTime() > now);

    if (filters.limit) {
      results = results.slice(-filters.limit);
    }

    return results;
  }

  /**
   * Get current system state summary
   */
  getStateSummary(): {
    totalRecords: number;
    byType: Record<string, number>;
    oldestRecord?: string;
    newestRecord?: string;
  } {
    const records = Array.from(this.records.values());
    const byType: Record<string, number> = {};

    for (const record of records) {
      byType[record.type] = (byType[record.type] || 0) + 1;
    }

    const timestamps = records.map(r => r.timestamp).sort();

    return {
      totalRecords: records.length,
      byType,
      oldestRecord: timestamps[0],
      newestRecord: timestamps[timestamps.length - 1],
    };
  }

  /**
   * Clear expired records
   */
  cleanup(): number {
    const now = Date.now();
    let removed = 0;

    for (const [id, record] of this.records) {
      if (record.expiresAt && new Date(record.expiresAt).getTime() <= now) {
        this.records.delete(id);
        removed++;
      }
    }

    return removed;
  }

  private evict(): void {
    if (this.records.size > this.maxRecords) {
      const keys = Array.from(this.records.keys());
      const toRemove = keys.slice(0, this.records.size - this.maxRecords);
      for (const key of toRemove) {
        this.records.delete(key);
      }
    }
  }
}
