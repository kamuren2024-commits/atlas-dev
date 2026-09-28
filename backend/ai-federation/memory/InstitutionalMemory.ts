// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — INSTITUTIONAL MEMORY
// Accumulated organizational learning — decisions, lessons, patterns
// ============================================================================

import { generateId } from '../../../src/core/shared/crypto';

export interface InstitutionalRecord {
  id: string;
  type: 'DECISION' | 'LESSON' | 'PATTERN' | 'FAILURE' | 'SUCCESS' | 'INTERVENTION';
  domain: string;
  title: string;
  description: string;
  context: Record<string, any>;
  outcome?: string;
  confidence: number;
  timesApplied: number;
  successRate: number;
  tags: string[];
  createdAt: string;
  lastAppliedAt?: string;
}

export class InstitutionalMemory {
  private static instance: InstitutionalMemory;
  private records: Map<string, InstitutionalRecord> = new Map();

  private constructor() {}

  public static getInstance(): InstitutionalMemory {
    if (!InstitutionalMemory.instance) {
      InstitutionalMemory.instance = new InstitutionalMemory();
    }
    return InstitutionalMemory.instance;
  }

  /**
   * Record an institutional learning
   */
  record(learning: Omit<InstitutionalRecord, 'id' | 'createdAt' | 'timesApplied' | 'successRate'>): string {
    const id = generateId('inst');
    const record: InstitutionalRecord = {
      ...learning,
      id,
      timesApplied: 0,
      successRate: 100,
      createdAt: new Date().toISOString(),
    };
    this.records.set(id, record);
    return id;
  }

  /**
   * Apply a learning (increments usage count)
   */
  apply(id: string, success: boolean): void {
    const record = this.records.get(id);
    if (!record) return;

    const totalSuccesses = record.successRate * record.timesApplied / 100;
    const newSuccess = success ? totalSuccesses + 1 : totalSuccesses;
    record.timesApplied++;
    record.successRate = (newSuccess / record.timesApplied) * 100;
    record.lastAppliedAt = new Date().toISOString();
  }

  /**
   * Query institutional records
   */
  query(filters: {
    type?: InstitutionalRecord['type'];
    domain?: string;
    tags?: string[];
    minConfidence?: number;
    minTimesApplied?: number;
    limit?: number;
  }): InstitutionalRecord[] {
    let results = Array.from(this.records.values());

    if (filters.type) {
      results = results.filter(r => r.type === filters.type);
    }
    if (filters.domain) {
      results = results.filter(r => r.domain === filters.domain);
    }
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(r => filters.tags!.some(t => r.tags.includes(t)));
    }
    if (filters.minConfidence !== undefined) {
      results = results.filter(r => r.confidence >= filters.minConfidence!);
    }
    if (filters.minTimesApplied !== undefined) {
      results = results.filter(r => r.timesApplied >= filters.minTimesApplied!);
    }

    results.sort((a, b) => b.confidence * b.successRate - a.confidence * a.successRate);

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Find similar learnings
   */
  findSimilar(domain: string, tags: string[]): InstitutionalRecord[] {
    return Array.from(this.records.values())
      .filter(r => {
        const domainMatch = r.domain === domain;
        const tagOverlap = tags.some(t => r.tags.includes(t));
        return domainMatch && tagOverlap;
      })
      .sort((a, b) => b.successRate - a.successRate);
  }

  /**
   * Get institutional statistics
   */
  getStats(): {
    totalRecords: number;
    byType: Record<string, number>;
    averageSuccessRate: number;
    averageConfidence: number;
    mostApplied: InstitutionalRecord[];
  } {
    const records = Array.from(this.records.values());
    const byType: Record<string, number> = {};

    for (const record of records) {
      byType[record.type] = (byType[record.type] || 0) + 1;
    }

    const avgSuccess = records.length > 0
      ? records.reduce((sum, r) => sum + r.successRate, 0) / records.length
      : 0;
    const avgConfidence = records.length > 0
      ? records.reduce((sum, r) => sum + r.confidence, 0) / records.length
      : 0;

    const mostApplied = records
      .sort((a, b) => b.timesApplied - a.timesApplied)
      .slice(0, 10);

    return {
      totalRecords: records.length,
      byType,
      averageSuccessRate: avgSuccess,
      averageConfidence: avgConfidence,
      mostApplied,
    };
  }
}
