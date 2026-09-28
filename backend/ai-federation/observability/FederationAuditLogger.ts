// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AUDIT LOGGER
// Metadata-only audit trail for all AI inference (no secrets, no raw prompts)
// ============================================================================

import { AUDIT } from '../core/constants';
import { DataClassification } from '../federation/types';
import crypto from 'crypto';

export interface AuditEntry {
  id: string;
  requestId: string;
  traceId: string;
  timestamp: string;
  provider: string;
  model: string;
  classification: DataClassification;
  latencyMs: number;
  status: 'SUCCESS' | 'FAILED' | 'POLICY_DENIED' | 'TIMEOUT' | 'RATE_LIMITED';
  promptTokens?: number;
  completionTokens?: number;
  costUsd?: number;
  agentId?: string;
  userId?: string;
  missionId?: string;
  workflowId?: string;
  /** Only stored if LOG_PROMPTS is enabled */
  promptHash?: string;
  errorCategory?: string;
  previousHash: string;
  hash: string;
}

/**
 * Enterprise audit logger for AI federation.
 * Default mode: metadata-only (no prompt content stored).
 * Hash-chained for tamper evidence.
 */
export class FederationAuditLogger {
  private static instance: FederationAuditLogger;
  private entries: AuditEntry[] = [];
  private lastHash = 'GENESIS';
  private logPrompts: boolean;
  private logResponses: boolean;

  private constructor() {
    this.logPrompts = AUDIT.LOG_PROMPTS;
    this.logResponses = AUDIT.LOG_RESPONSES;
  }

  static getInstance(): FederationAuditLogger {
    if (!FederationAuditLogger.instance) {
      FederationAuditLogger.instance = new FederationAuditLogger();
    }
    return FederationAuditLogger.instance;
  }

  /**
   * Record an audit entry.
   */
  record(entry: {
    requestId: string;
    traceId: string;
    provider: string;
    model: string;
    classification: DataClassification;
    latencyMs: number;
    status: AuditEntry['status'];
    promptTokens?: number;
    completionTokens?: number;
    costUsd?: number;
    agentId?: string;
    userId?: string;
    missionId?: string;
    workflowId?: string;
    promptContent?: string;
    errorCategory?: string;
  }): AuditEntry {
    const id = `aud-${crypto.randomUUID()}`;
    const timestamp = new Date().toISOString();

    const auditEntry: AuditEntry = {
      id,
      requestId: entry.requestId,
      traceId: entry.traceId,
      timestamp,
      provider: entry.provider,
      model: entry.model,
      classification: entry.classification,
      latencyMs: entry.latencyMs,
      status: entry.status,
      promptTokens: entry.promptTokens,
      completionTokens: entry.completionTokens,
      costUsd: entry.costUsd,
      agentId: entry.agentId,
      userId: entry.userId,
      missionId: entry.missionId,
      workflowId: entry.workflowId,
      promptHash: this.logPrompts && entry.promptContent
        ? crypto.createHash('sha256').update(entry.promptContent).digest('hex').substring(0, 16)
        : undefined,
      errorCategory: entry.errorCategory,
      previousHash: this.lastHash,
      hash: '',
    };

    auditEntry.hash = this.computeHash(auditEntry);
    this.lastHash = auditEntry.hash;
    this.entries.push(auditEntry);

    // Rotate if too many entries
    if (this.entries.length > AUDIT.MAX_RECORDS) {
      this.entries = this.entries.slice(-Math.floor(AUDIT.MAX_RECORDS / 2));
    }

    return auditEntry;
  }

  /**
   * Query audit entries.
   */
  query(filters: {
    provider?: string;
    status?: AuditEntry['status'];
    classification?: DataClassification;
    since?: string;
    limit?: number;
  }): AuditEntry[] {
    let results = [...this.entries];

    if (filters.provider) results = results.filter(e => e.provider === filters.provider);
    if (filters.status) results = results.filter(e => e.status === filters.status);
    if (filters.classification) results = results.filter(e => e.classification === filters.classification);
    if (filters.since) {
      const since = new Date(filters.since).getTime();
      results = results.filter(e => new Date(e.timestamp).getTime() >= since);
    }
    if (filters.limit) results = results.slice(-filters.limit);

    return results;
  }

  /**
   * Get aggregate statistics.
   */
  getStats(): {
    totalEntries: number;
    successRate: number;
    totalCostUsd: number;
    avgLatencyMs: number;
    providerBreakdown: Record<string, { count: number; cost: number }>;
  } {
    const total = this.entries.length;
    const successCount = this.entries.filter(e => e.status === 'SUCCESS').length;
    const totalCost = this.entries.reduce((sum, e) => sum + (e.costUsd || 0), 0);
    const totalLatency = this.entries.reduce((sum, e) => sum + e.latencyMs, 0);

    const providerBreakdown: Record<string, { count: number; cost: number }> = {};
    for (const entry of this.entries) {
      if (!providerBreakdown[entry.provider]) {
        providerBreakdown[entry.provider] = { count: 0, cost: 0 };
      }
      providerBreakdown[entry.provider].count++;
      providerBreakdown[entry.provider].cost += entry.costUsd || 0;
    }

    return {
      totalEntries: total,
      successRate: total > 0 ? (successCount / total) * 100 : 0,
      totalCostUsd: totalCost,
      avgLatencyMs: total > 0 ? totalLatency / total : 0,
      providerBreakdown,
    };
  }

  /**
   * Verify audit chain integrity.
   */
  verifyChain(): { valid: boolean; brokenAt?: string; totalEntries: number } {
    let previousHash = 'GENESIS';

    for (const entry of this.entries) {
      if (entry.previousHash !== previousHash) {
        return { valid: false, brokenAt: entry.id, totalEntries: this.entries.length };
      }
      previousHash = entry.hash;
    }

    return { valid: true, totalEntries: this.entries.length };
  }

  private computeHash(entry: Omit<AuditEntry, 'hash'>): string {
    const data = `${entry.previousHash}|${entry.requestId}|${entry.provider}|${entry.model}|${entry.status}|${entry.latencyMs}|${entry.costUsd || 0}|${entry.timestamp}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }
}
