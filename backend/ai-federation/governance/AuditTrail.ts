// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AUDIT TRAIL
// Immutable, hash-chained audit record for all AI inference
// ============================================================================

import { DataClassification } from '../federation/types';
import { generateId } from '../../../src/core/shared/crypto';
import crypto from 'crypto';

export interface AuditRecord {
  id: string;
  requestId: string;
  traceId: string;
  mission: string;
  task: string;
  classification: DataClassification;
  provider: string;
  model: string;
  costUsd: number;
  latencyMs: number;
  success: boolean;
  agentId?: string;
  userId?: string;
  timestamp: string;
  previousHash: string;
  hash: string;
  integrity: boolean;
}

export class AuditTrail {
  private static instance: AuditTrail;
  private records: AuditRecord[] = [];
  private lastHash: string = 'GENESIS';

  private constructor() {}

  public static getInstance(): AuditTrail {
    if (!AuditTrail.instance) {
      AuditTrail.instance = new AuditTrail();
    }
    return AuditTrail.instance;
  }

  /**
   * Record an AI inference event with hash-chain integrity
   */
  async record(entry: Omit<AuditRecord, 'id' | 'previousHash' | 'hash' | 'integrity'>): Promise<string> {
    const id = generateId('aud');
    const previousHash = this.lastHash;

    const record: AuditRecord = {
      ...entry,
      id,
      previousHash,
      hash: '',
      integrity: false,
    };

    // Compute hash
    record.hash = this.computeHash(record);
    record.integrity = this.verifyIntegrity(record);

    this.lastHash = record.hash;
    this.records.push(record);

    // Cap at 10000 records in memory
    if (this.records.length > 10000) {
      this.records = this.records.slice(-5000);
    }

    console.log(`[AUDIT] Recorded [${id}] mission=${entry.mission} provider=${entry.provider} success=${entry.success}`);

    return id;
  }

  /**
   * Verify the integrity of the entire audit chain
   */
  verifyChain(): { valid: boolean; brokenAt?: string; totalRecords: number } {
    let previousHash = 'GENESIS';

    for (const record of this.records) {
      if (record.previousHash !== previousHash) {
        return {
          valid: false,
          brokenAt: record.id,
          totalRecords: this.records.length,
        };
      }
      if (!this.verifyIntegrity(record)) {
        return {
          valid: false,
          brokenAt: record.id,
          totalRecords: this.records.length,
        };
      }
      previousHash = record.hash;
    }

    return { valid: true, totalRecords: this.records.length };
  }

  /**
   * Query audit records
   */
  query(filters: {
    mission?: string;
    agentId?: string;
    provider?: string;
    success?: boolean;
    since?: string;
    limit?: number;
  }): AuditRecord[] {
    let results = [...this.records];

    if (filters.mission) {
      results = results.filter(r => r.mission.includes(filters.mission!));
    }
    if (filters.agentId) {
      results = results.filter(r => r.agentId === filters.agentId);
    }
    if (filters.provider) {
      results = results.filter(r => r.provider === filters.provider);
    }
    if (filters.success !== undefined) {
      results = results.filter(r => r.success === filters.success);
    }
    if (filters.since) {
      const since = new Date(filters.since).getTime();
      results = results.filter(r => new Date(r.timestamp).getTime() >= since);
    }

    if (filters.limit) {
      results = results.slice(-filters.limit);
    }

    return results;
  }

  /**
   * Get audit statistics
   */
  getStats(): {
    totalRequests: number;
    successRate: number;
    totalCostUsd: number;
    avgLatencyMs: number;
    providerBreakdown: Record<string, { count: number; cost: number; avgLatency: number }>;
  } {
    const total = this.records.length;
    const successCount = this.records.filter(r => r.success).length;
    const totalCost = this.records.reduce((sum, r) => sum + r.costUsd, 0);
    const totalLatency = this.records.reduce((sum, r) => sum + r.latencyMs, 0);

    const providerBreakdown: Record<string, { count: number; cost: number; avgLatency: number }> = {};
    for (const record of this.records) {
      if (!providerBreakdown[record.provider]) {
        providerBreakdown[record.provider] = { count: 0, cost: 0, avgLatency: 0 };
      }
      providerBreakdown[record.provider].count++;
      providerBreakdown[record.provider].cost += record.costUsd;
      providerBreakdown[record.provider].avgLatency += record.latencyMs;
    }

    for (const key of Object.keys(providerBreakdown)) {
      providerBreakdown[key].avgLatency = providerBreakdown[key].avgLatency / providerBreakdown[key].count;
    }

    return {
      totalRequests: total,
      successRate: total > 0 ? (successCount / total) * 100 : 0,
      totalCostUsd: totalCost,
      avgLatencyMs: total > 0 ? totalLatency / total : 0,
      providerBreakdown,
    };
  }

  private computeHash(record: AuditRecord): string {
    const data = `${record.previousHash}|${record.requestId}|${record.mission}|${record.provider}|${record.model}|${record.costUsd}|${record.success}|${record.timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }

  private verifyIntegrity(record: AuditRecord): boolean {
    const expectedHash = this.computeHash({ ...record, hash: '', integrity: false });
    return record.hash === expectedHash;
  }
}
