/**
 * 01-15 — FINANCE DATA LINEAGE
 *
 * Implements the mandatory SOURCE → RAW → TRANSFORMATION → NORMALIZED →
 * ONTOLOGY ENTITY → GRAPH ENTITY → ANALYTIC CONSUMER lineage chain.
 *
 * Every material transformation is recorded so users can answer:
 *   "Where did this financial number come from?"
 *
 * Lineage records are persisted via FinanceLineageRepository (01-06) and
 * are themselves idempotent via the traceHash.
 */

import crypto from 'crypto';
import type { FinanceLineageRecord, TransformationType } from './types';

export class FinanceDataLineage {
  constructor(
    private readonly opts: {
      actorId?: string;
      tenantId?: string;
      isFixture: boolean;
      environment: string;
    }
  ) {}

  private now(): string {
    return new Date().toISOString();
  }

  /**
   * Produce a deterministic trace hash so the same lineage event twice
   * yields identical lineage rows and can be idempotent.
   */
  private hash(parts: (string | undefined | number)[]): string {
    const s = parts.map(p => p === undefined || p === null ? '∅' : String(p)).join('|');
    return crypto.createHash('sha256').update(s, 'utf8').digest('hex').slice(0, 24);
  }

  record(args: {
    entityKind?: string;
    entityId?: string;
    recordId?: string;
    batchId?: string;
    sourceId?: string;
    parentLineageId?: string;
    transformationType: TransformationType;
    transformationRule?: string;
    fromEntityKind?: string;
    fromEntityId?: string;
    toEntityKind?: string;
    toEntityId?: string;
    fieldMappings?: Record<string, string>;
    formulaUsed?: string;
  }): FinanceLineageRecord {
    const occurredAt = this.now();
    const traceHash = this.hash([
      args.transformationType,
      args.entityKind, args.entityId,
      args.recordId, args.batchId, args.sourceId,
      args.fromEntityKind, args.fromEntityId,
      args.toEntityKind, args.toEntityId,
      args.transformationRule, args.formulaUsed
    ]);
    return {
      lineageId: `lin_${crypto.randomBytes(8).toString('hex')}`,
      entityKind: args.entityKind,
      entityId: args.entityId,
      recordId: args.recordId,
      batchId: args.batchId,
      sourceId: args.sourceId,
      parentLineageId: args.parentLineageId,
      transformationType: args.transformationType,
      transformationRule: args.transformationRule,
      fromEntityKind: args.fromEntityKind,
      fromEntityId: args.fromEntityId,
      toEntityKind: args.toEntityKind,
      toEntityId: args.toEntityId,
      fieldMappings: args.fieldMappings,
      formulaUsed: args.formulaUsed,
      actorId: this.opts.actorId ?? 'system:finance-lineage',
      traceHash,
      isFixture: this.opts.isFixture,
      environment: this.opts.environment,
      tenantId: this.opts.tenantId,
      occurredAt
    };
  }

  // Convenience helpers for each transformation stage.

  sourceReceive(args: { sourceId: string; batchId: string }) {
    return this.record({ transformationType: 'SOURCE_RECEIVE', ...args });
  }
  rawRecordCreate(args: { sourceId: string; batchId: string; recordId: string }) {
    return this.record({ transformationType: 'RAW_RECORD_CREATE', ...args });
  }
  validate(args: { batchId: string; recordId: string; transformationRule?: string }) {
    return this.record({ transformationType: 'VALIDATE', ...args });
  }
  normalize(args: { batchId: string; recordId: string; transformationRule?: string; fieldMappings?: Record<string, string> }) {
    return this.record({ transformationType: 'NORMALIZE', ...args });
  }
  resolve(args: { batchId: string; recordId: string; toEntityKind?: string; toEntityId?: string; transformationRule?: string }) {
    return this.record({ transformationType: 'RESOLVE_ENTITY', ...args });
  }
  ontologyMap(args: { batchId: string; recordId: string; toEntityKind?: string; toEntityId?: string; transformationRule?: string }) {
    return this.record({ transformationType: 'ONTOLOGY_MAP', ...args });
  }
  persist(args: { entityKind: string; entityId: string; recordId?: string; batchId?: string; fromEntityKind?: string; fromEntityId?: string }) {
    return this.record({ transformationType: 'PERSIST', ...args });
  }
  graphCreateNode(args: { entityKind: string; entityId: string; batchId?: string; recordId?: string }) {
    return this.record({
      transformationType: 'GRAPH_CREATE_NODE',
      ...args,
      toEntityKind: args.entityKind,
      toEntityId: args.entityId,
      transformationRule: 'KnowledgeGraph.upsert'
    });
  }
  graphCreateEdge(args: { fromEntityKind?: string; fromEntityId?: string; toEntityKind?: string; toEntityId?: string; batchId?: string; recordId?: string; transformationRule?: string }) {
    return this.record({ transformationType: 'GRAPH_CREATE_EDGE', ...args });
  }
  qualityScore(args: { entityKind?: string; entityId?: string; batchId?: string; recordId?: string; transformationRule?: string }) {
    return this.record({ transformationType: 'QUALITY_SCORE', ...args });
  }
  eventEmit(args: { entityKind?: string; entityId?: string; batchId?: string; recordId?: string; transformationRule?: string }) {
    return this.record({ transformationType: 'EVENT_EMIT', ...args });
  }
  quarantine(args: { recordId: string; batchId: string; entityKind?: string; entityId?: string }) {
    return this.record({ transformationType: 'QUARANTINE', ...args });
  }
  reject(args: { recordId: string; batchId: string }) {
    return this.record({ transformationType: 'REJECT', ...args });
  }
}
