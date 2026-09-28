/**
 * 01-06 — FINANCE REPOSITORY LAYER
 *
 * Thin wrapper on top of the existing DatabaseCore, exposing
 * typed repositories for every finance_* table created in Migration 003.
 *
 * Every insert enforces idempotency via the unique index
 * (source_system, source_record_id) defined in the migration.
 * Duplicate inserts resolve to UPDATE-or-NOOP semantics.
 *
 * All rows carry the CP-03 isFixture + environment flags.
 */

import type { DatabaseCore } from '../database/db-core';
import type {
  FinanceSourceRecord,
  FinanceBatch,
  FinanceRawRecord,
  DataQualityScore,
  FinanceLineageRecord,
  DataProfile,
  EntityResolutionResult
} from './types';
import { decorateFixtureMeta, fixtureGuard } from './fixture-protection';

// ----------------------------------------------------------------------
// SOURCES REPOSITORY
// ----------------------------------------------------------------------
export class FinanceSourcesRepository {
  constructor(private readonly db: DatabaseCore) {}

  async insertOrUpdate(source: FinanceSourceRecord): Promise<FinanceSourceRecord> {
    const meta = decorateFixtureMeta(source);
    const guard = fixtureGuard(meta, 'insertOrUpdate finance_source', source.owner);
    if (guard.blocked) throw new Error(guard.reason ?? 'CP-03 BLOCKED');

    const sql = `
      INSERT INTO finance_sources (
        source_id, name, source_type, system, status, owner,
        connection_status, last_successful_sync, last_attempted_sync,
        schema_version, data_classification, credential_reference,
        configuration_json, is_fixture, environment, tenant_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_id) DO UPDATE SET
        name=excluded.name,
        source_type=excluded.source_type,
        system=excluded.system,
        status=excluded.status,
        owner=excluded.owner,
        connection_status=excluded.connection_status,
        last_successful_sync=excluded.last_successful_sync,
        last_attempted_sync=excluded.last_attempted_sync,
        schema_version=excluded.schema_version,
        data_classification=excluded.data_classification,
        credential_reference=excluded.credential_reference,
        configuration_json=excluded.configuration_json,
        is_fixture=excluded.is_fixture,
        environment=excluded.environment,
        updated_at=CURRENT_TIMESTAMP
    `;
    await this.db.run(sql, [
      source.sourceId, source.name, source.sourceType, source.system ?? null,
      source.status, source.owner ?? null,
      source.connectionStatus,
      source.lastSuccessfulSync ?? null, source.lastAttemptedSync ?? null,
      source.schemaVersion ?? null, source.dataClassification ?? null,
      source.credentialReference ?? null,
      JSON.stringify(source.configuration ?? {}),
      meta.isFixture ? 1 : 0, meta.environment, source.tenantId ?? null,
      source.createdAt, source.updatedAt
    ]);
    return source;
  }

  async findById(sourceId: string): Promise<FinanceSourceRecord | null> {
    const row = await this.db.get(
      `SELECT * FROM finance_sources WHERE source_id = ?`,
      [sourceId]
    );
    return row ? this.hydrate(row) : null;
  }

  async list(opts?: { isFixture?: boolean; status?: string }): Promise<FinanceSourceRecord[]> {
    let sql = `SELECT * FROM finance_sources WHERE 1=1`;
    const params: unknown[] = [];
    if (typeof opts?.isFixture === 'boolean') {
      sql += ` AND is_fixture = ?`;
      params.push(opts.isFixture ? 1 : 0);
    }
    if (opts?.status) {
      sql += ` AND status = ?`;
      params.push(opts.status);
    }
    sql += ` ORDER BY updated_at DESC`;
    const rows = await this.db.all(sql, params) as any[];
    return rows.map(this.hydrate);
  }

  private hydrate(row: any): FinanceSourceRecord {
    return {
      sourceId: row.source_id,
      name: row.name,
      sourceType: row.source_type,
      system: row.system ?? undefined,
      status: row.status,
      owner: row.owner ?? undefined,
      connectionStatus: row.connection_status,
      lastSuccessfulSync: row.last_successful_sync ?? undefined,
      lastAttemptedSync: row.last_attempted_sync ?? undefined,
      schemaVersion: row.schema_version ?? undefined,
      dataClassification: row.data_classification ?? undefined,
      credentialReference: row.credential_reference ?? undefined,
      configuration: row.configuration_json ? JSON.parse(row.configuration_json) : {},
      isFixture: row.is_fixture === 1,
      environment: row.environment ?? 'development',
      tenantId: row.tenant_id ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}

// ----------------------------------------------------------------------
// BATCHES REPOSITORY
// ----------------------------------------------------------------------
export class FinanceBatchesRepository {
  constructor(private readonly db: DatabaseCore) {}

  async insert(batch: FinanceBatch): Promise<FinanceBatch> {
    const meta = decorateFixtureMeta(batch);
    const guard = fixtureGuard(meta, 'insert finance_batch', batch.actorId);
    if (guard.blocked) throw new Error(guard.reason ?? 'CP-03 BLOCKED');

    await this.db.run(`
      INSERT INTO finance_batches (
        batch_id, run_id, correlation_id, source_id, started_at, completed_at, status,
        record_count, success_count, warning_count, failure_count, quarantined_count,
        error_summary, checkpoint_json, is_fixture, environment, tenant_id, actor_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      batch.batchId, batch.runId ?? null, batch.correlationId ?? null,
      batch.sourceId, batch.startedAt, batch.completedAt ?? null, batch.status,
      batch.recordCount, batch.successCount, batch.warningCount,
      batch.failureCount, batch.quarantinedCount, batch.errorSummary ?? null,
      JSON.stringify(batch.checkpoint ?? {}),
      meta.isFixture ? 1 : 0, meta.environment, batch.tenantId ?? null,
      batch.actorId ?? null
    ]);
    return batch;
  }

  async updateStatus(batchId: string, patch: Partial<FinanceBatch>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (patch.status) { fields.push('status = ?'); values.push(patch.status); }
    if (patch.completedAt !== undefined) { fields.push('completed_at = ?'); values.push(patch.completedAt); }
    if (patch.recordCount !== undefined) { fields.push('record_count = ?'); values.push(patch.recordCount); }
    if (patch.successCount !== undefined) { fields.push('success_count = ?'); values.push(patch.successCount); }
    if (patch.warningCount !== undefined) { fields.push('warning_count = ?'); values.push(patch.warningCount); }
    if (patch.failureCount !== undefined) { fields.push('failure_count = ?'); values.push(patch.failureCount); }
    if (patch.quarantinedCount !== undefined) { fields.push('quarantined_count = ?'); values.push(patch.quarantinedCount); }
    if (patch.errorSummary !== undefined) { fields.push('error_summary = ?'); values.push(patch.errorSummary); }
    if (patch.checkpoint !== undefined) { fields.push('checkpoint_json = ?'); values.push(JSON.stringify(patch.checkpoint)); }
    if (!fields.length) return;
    fields.push(`completed_at = COALESCE(?, completed_at)`);
    values.push(patch.completedAt ?? null);
    values.push(batchId);
    await this.db.run(`UPDATE finance_batches SET ${fields.join(', ')} WHERE batch_id = ?`, values);
  }

  async findById(batchId: string): Promise<FinanceBatch | null> {
    const row = await this.db.get(`SELECT * FROM finance_batches WHERE batch_id = ?`, [batchId]);
    return row ? this.hydrate(row) : null;
  }

  async list(opts?: { sourceId?: string; status?: string; limit?: number }): Promise<FinanceBatch[]> {
    let sql = `SELECT * FROM finance_batches WHERE 1=1`;
    const params: unknown[] = [];
    if (opts?.sourceId) { sql += ` AND source_id = ?`; params.push(opts.sourceId); }
    if (opts?.status) { sql += ` AND status = ?`; params.push(opts.status); }
    sql += ` ORDER BY started_at DESC`;
    if (opts?.limit) { sql += ` LIMIT ?`; params.push(opts.limit); }
    const rows = await this.db.all(sql, params) as any[];
    return rows.map(this.hydrate);
  }

  private hydrate(row: any): FinanceBatch {
    return {
      batchId: row.batch_id,
      runId: row.run_id ?? undefined,
      correlationId: row.correlation_id ?? undefined,
      sourceId: row.source_id,
      startedAt: row.started_at,
      completedAt: row.completed_at ?? undefined,
      status: row.status,
      recordCount: row.record_count,
      successCount: row.success_count,
      warningCount: row.warning_count,
      failureCount: row.failure_count,
      quarantinedCount: row.quarantined_count,
      errorSummary: row.error_summary ?? undefined,
      checkpoint: row.checkpoint_json ? JSON.parse(row.checkpoint_json) : undefined,
      isFixture: row.is_fixture === 1,
      environment: row.environment ?? 'development',
      tenantId: row.tenant_id ?? undefined,
      actorId: row.actor_id ?? undefined
    };
  }
}

// ----------------------------------------------------------------------
// RECORDS REPOSITORY
// ----------------------------------------------------------------------
export class FinanceRecordsRepository {
  constructor(private readonly db: DatabaseCore) {}

  /**
   * Idempotent insert-or-update of a raw record.
   * Unique key: (source_system, source_record_id, record_version)
   */
  async upsert(record: FinanceRawRecord): Promise<FinanceRawRecord> {
    const meta = decorateFixtureMeta(record);
    const guard = fixtureGuard(meta, 'upsert finance_record');
    if (guard.blocked) throw new Error(guard.reason ?? 'CP-03 BLOCKED');

    const sql = `
      INSERT INTO finance_records (
        record_id, batch_id, source_id, source_system, source_record_id,
        record_version, raw_hash, raw_payload_json, normalized_payload_json,
        record_status, validation_severity, validation_errors_json,
        normalization_rules_json, entity_kind, resolved_entity_id,
        ontology_mappings_json, ingested_at, effective_date,
        is_fixture, environment, tenant_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source_system, source_record_id, record_version) DO UPDATE SET
        batch_id=excluded.batch_id,
        source_id=excluded.source_id,
        raw_hash=excluded.raw_hash,
        raw_payload_json=excluded.raw_payload_json,
        normalized_payload_json=excluded.normalized_payload_json,
        record_status=excluded.record_status,
        validation_severity=excluded.validation_severity,
        validation_errors_json=excluded.validation_errors_json,
        normalization_rules_json=excluded.normalization_rules_json,
        entity_kind=excluded.entity_kind,
        resolved_entity_id=excluded.resolved_entity_id,
        ontology_mappings_json=excluded.ontology_mappings_json,
        ingested_at=excluded.ingested_at,
        effective_date=excluded.effective_date,
        is_fixture=excluded.is_fixture,
        environment=excluded.environment
    `;
    await this.db.run(sql, [
      record.recordId, record.batchId, record.sourceId, record.sourceSystem ?? null,
      record.sourceRecordId, record.recordVersion, record.rawHash ?? null,
      JSON.stringify(record.rawPayload),
      record.normalizedPayload ? JSON.stringify(record.normalizedPayload) : null,
      record.recordStatus, record.validationSeverity,
      record.validationErrors ? JSON.stringify(record.validationErrors) : null,
      record.normalizationRules ? JSON.stringify(record.normalizationRules) : null,
      record.entityKind ?? null, record.resolvedEntityId ?? null,
      record.ontologyMappings ? JSON.stringify(record.ontologyMappings) : null,
      record.ingestedAt, record.effectiveDate ?? null,
      meta.isFixture ? 1 : 0, meta.environment, record.tenantId ?? null
    ]);
    return record;
  }

  async findBySourceRef(sourceSystem: string, sourceRecordId: string): Promise<FinanceRawRecord | null> {
    const row = await this.db.get(
      `SELECT * FROM finance_records WHERE source_system = ? AND source_record_id = ? ORDER BY record_version DESC LIMIT 1`,
      [sourceSystem, sourceRecordId]
    );
    return row ? this.hydrate(row) : null;
  }

  async listByBatch(batchId: string, opts?: { status?: string; limit?: number }): Promise<FinanceRawRecord[]> {
    let sql = `SELECT * FROM finance_records WHERE batch_id = ?`;
    const params: unknown[] = [batchId];
    if (opts?.status) { sql += ` AND record_status = ?`; params.push(opts.status); }
    sql += ` ORDER BY ingested_at ASC`;
    if (opts?.limit) { sql += ` LIMIT ?`; params.push(opts.limit); }
    const rows = await this.db.all(sql, params) as any[];
    return rows.map(this.hydrate);
  }

  private hydrate(row: any): FinanceRawRecord {
    return {
      recordId: row.record_id,
      batchId: row.batch_id,
      sourceId: row.source_id,
      sourceSystem: row.source_system ?? undefined,
      sourceRecordId: row.source_record_id,
      recordVersion: row.record_version,
      rawHash: row.raw_hash ?? undefined,
      rawPayload: row.raw_payload_json ? JSON.parse(row.raw_payload_json) : {},
      normalizedPayload: row.normalized_payload_json ? JSON.parse(row.normalized_payload_json) : undefined,
      recordStatus: row.record_status,
      validationSeverity: row.validation_severity ?? 'VALID',
      validationErrors: row.validation_errors_json ? JSON.parse(row.validation_errors_json) : undefined,
      normalizationRules: row.normalization_rules_json ? JSON.parse(row.normalization_rules_json) : undefined,
      entityKind: row.entity_kind ?? undefined,
      resolvedEntityId: row.resolved_entity_id ?? undefined,
      ontologyMappings: row.ontology_mappings_json ? JSON.parse(row.ontology_mappings_json) : undefined,
      ingestedAt: row.ingested_at,
      effectiveDate: row.effective_date ?? undefined,
      isFixture: row.is_fixture === 1,
      environment: row.environment ?? 'development',
      tenantId: row.tenant_id ?? undefined
    };
  }
}

// ----------------------------------------------------------------------
// GENERIC REPOSITORIES — thin re-usable upsert helpers for every finance_* table
//   (accounts, cost_centres, budgets, budget_lines, commitments, invoices,
//    payments, journals, projects, costs, forecasts, risks)
// ----------------------------------------------------------------------

export interface GenericFinanceEntity {
  id: string;
  externalId?: string;
  sourceSystem?: string;
  sourceRecordId?: string;
  status?: string;
  isFixture?: boolean;
  environment?: string;
  tenantId?: string;
  version?: number;
  effectiveDate?: string;
  provenanceId?: string;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: unknown;
}

/**
 * Generic repository for any canonical finance entity table.
 * Enforces the (source_system, source_record_id) idempotency constraint
 * defined in Migration 003.
 */
export class GenericFinanceRepository<T extends GenericFinanceEntity> {
  constructor(
    private readonly db: DatabaseCore,
    private readonly table: string,
    private readonly idColumn: string,
    private readonly mapper: {
      toRow: (e: T) => Record<string, unknown>;
      fromRow: (r: Record<string, unknown>) => T;
    }
  ) {}

  async upsert(entity: T): Promise<T> {
    const meta = decorateFixtureMeta(entity);
    const guard = fixtureGuard(meta, `upsert ${this.table}`);
    if (guard.blocked) throw new Error(guard.reason ?? 'CP-03 BLOCKED');

    const row: Record<string, unknown> = {
      ...this.mapper.toRow(entity),
      is_fixture: meta.isFixture ? 1 : 0,
      environment: meta.environment,
      tenant_id: entity.tenantId ?? null
    };

    const columns = Object.keys(row);
    const placeholders = columns.map(() => '?').join(', ');
    const updates = columns
      .filter(c => c !== this.idColumn && c !== 'created_at')
      .map(c => `${c}=excluded.${c}`)
      .join(', ');
    const sql = `
      INSERT INTO ${this.table} (${columns.join(', ')})
      VALUES (${placeholders})
      ON CONFLICT DO UPDATE SET ${updates}
    `;
    await this.db.run(sql, columns.map(c => (row[c] === undefined || row[c] === null) ? null : row[c]));
    return entity;
  }

  async findById(id: string): Promise<T | null> {
    const row = await this.db.get(`SELECT * FROM ${this.table} WHERE ${this.idColumn} = ?`, [id]);
    return row ? this.mapper.fromRow(row as Record<string, unknown>) : null;
  }

  async list(opts?: { isFixture?: boolean; status?: string; limit?: number }): Promise<T[]> {
    let sql = `SELECT * FROM ${this.table} WHERE 1=1`;
    const params: unknown[] = [];
    if (typeof opts?.isFixture === 'boolean') {
      sql += ` AND is_fixture = ?`;
      params.push(opts.isFixture ? 1 : 0);
    }
    if (opts?.status) {
      sql += ` AND status = ?`;
      params.push(opts.status);
    }
    sql += ` ORDER BY created_at DESC`;
    if (opts?.limit) { sql += ` LIMIT ?`; params.push(opts.limit); }
    const rows = await this.db.all(sql, params) as any[];
    return rows.map(r => this.mapper.fromRow(r));
  }

  async findBySourceRef(sourceSystem: string, sourceRecordId: string): Promise<T | null> {
    const row = await this.db.get(
      `SELECT * FROM ${this.table} WHERE source_system = ? AND source_record_id = ? ORDER BY version DESC LIMIT 1`,
      [sourceSystem, sourceRecordId]
    );
    return row ? this.mapper.fromRow(row as Record<string, unknown>) : null;
  }
}

// ----------------------------------------------------------------------
// DATA QUALITY REPOSITORY
// ----------------------------------------------------------------------
export class FinanceDataQualityRepository {
  constructor(private readonly db: DatabaseCore) {}

  async insert(score: DataQualityScore): Promise<DataQualityScore> {
    await this.db.run(`
      INSERT INTO finance_data_quality (
        quality_id, batch_id, record_id, entity_kind, entity_id, source_id,
        completeness_score, validity_score, uniqueness_score, consistency_score,
        timeliness_score, referential_integrity_score, source_reliability_score,
        overall_score, dimensions_json, formula_version, failing_checks_json,
        warnings_json, quality_agent, is_fixture, environment, tenant_id, calculated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      score.qualityId, score.batchId ?? null, score.recordId ?? null,
      score.entityKind ?? null, score.entityId ?? null, score.sourceId ?? null,
      score.completenessScore, score.validityScore, score.uniquenessScore,
      score.consistencyScore, score.timelinessScore,
      score.referentialIntegrityScore, score.sourceReliabilityScore,
      score.overallScore,
      JSON.stringify(score.dimensions), score.formulaVersion,
      JSON.stringify(score.failingChecks), JSON.stringify(score.warnings),
      score.qualityAgent,
      score.isFixture ? 1 : 0, score.environment, score.tenantId ?? null,
      score.calculatedAt
    ]);
    return score;
  }

  async listByBatch(batchId: string): Promise<DataQualityScore[]> {
    const rows = await this.db.all(
      `SELECT * FROM finance_data_quality WHERE batch_id = ? ORDER BY calculated_at DESC`,
      [batchId]
    ) as any[];
    return rows.map(this.hydrate);
  }

  async forEntity(entityKind: string, entityId: string): Promise<DataQualityScore | null> {
    const row = await this.db.get(
      `SELECT * FROM finance_data_quality WHERE entity_kind = ? AND entity_id = ? ORDER BY calculated_at DESC LIMIT 1`,
      [entityKind, entityId]
    );
    return row ? this.hydrate(row) : null;
  }

  private hydrate(row: any): DataQualityScore {
    return {
      qualityId: row.quality_id,
      batchId: row.batch_id ?? undefined,
      recordId: row.record_id ?? undefined,
      entityKind: row.entity_kind ?? undefined,
      entityId: row.entity_id ?? undefined,
      sourceId: row.source_id ?? undefined,
      completenessScore: row.completeness_score,
      validityScore: row.validity_score,
      uniquenessScore: row.uniqueness_score,
      consistencyScore: row.consistency_score,
      timelinessScore: row.timeliness_score,
      referentialIntegrityScore: row.referential_integrity_score,
      sourceReliabilityScore: row.source_reliability_score,
      overallScore: row.overall_score,
      dimensions: row.dimensions_json ? JSON.parse(row.dimensions_json) : [],
      formulaVersion: row.formula_version,
      failingChecks: row.failing_checks_json ? JSON.parse(row.failing_checks_json) : [],
      warnings: row.warnings_json ? JSON.parse(row.warnings_json) : [],
      qualityAgent: row.quality_agent,
      isFixture: row.is_fixture === 1,
      environment: row.environment ?? 'development',
      tenantId: row.tenant_id ?? undefined,
      calculatedAt: row.calculated_at
    };
  }
}

// ----------------------------------------------------------------------
// LINEAGE REPOSITORY
// ----------------------------------------------------------------------
export class FinanceLineageRepository {
  constructor(private readonly db: DatabaseCore) {}

  async insert(l: FinanceLineageRecord): Promise<FinanceLineageRecord> {
    await this.db.run(`
      INSERT INTO finance_lineage (
        lineage_id, entity_kind, entity_id, record_id, batch_id, source_id,
        parent_lineage_id, transformation_type, transformation_rule,
        from_entity_kind, from_entity_id, to_entity_kind, to_entity_id,
        field_mappings_json, formula_used, actor_id, trace_hash,
        is_fixture, environment, tenant_id, occurred_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      l.lineageId, l.entityKind ?? null, l.entityId ?? null, l.recordId ?? null,
      l.batchId ?? null, l.sourceId ?? null, l.parentLineageId ?? null,
      l.transformationType, l.transformationRule ?? null,
      l.fromEntityKind ?? null, l.fromEntityId ?? null,
      l.toEntityKind ?? null, l.toEntityId ?? null,
      l.fieldMappings ? JSON.stringify(l.fieldMappings) : null,
      l.formulaUsed ?? null, l.actorId ?? null, l.traceHash ?? null,
      l.isFixture ? 1 : 0, l.environment, l.tenantId ?? null, l.occurredAt
    ]);
    return l;
  }

  async forEntity(entityKind: string, entityId: string): Promise<FinanceLineageRecord[]> {
    const rows = await this.db.all(
      `SELECT * FROM finance_lineage WHERE entity_kind = ? AND entity_id = ? ORDER BY occurred_at ASC`,
      [entityKind, entityId]
    ) as any[];
    return rows.map(this.hydrate);
  }

  async forBatch(batchId: string): Promise<FinanceLineageRecord[]> {
    const rows = await this.db.all(
      `SELECT * FROM finance_lineage WHERE batch_id = ? ORDER BY occurred_at ASC`,
      [batchId]
    ) as any[];
    return rows.map(this.hydrate);
  }

  private hydrate(row: any): FinanceLineageRecord {
    return {
      lineageId: row.lineage_id,
      entityKind: row.entity_kind ?? undefined,
      entityId: row.entity_id ?? undefined,
      recordId: row.record_id ?? undefined,
      batchId: row.batch_id ?? undefined,
      sourceId: row.source_id ?? undefined,
      parentLineageId: row.parent_lineage_id ?? undefined,
      transformationType: row.transformation_type,
      transformationRule: row.transformation_rule ?? undefined,
      fromEntityKind: row.from_entity_kind ?? undefined,
      fromEntityId: row.from_entity_id ?? undefined,
      toEntityKind: row.to_entity_kind ?? undefined,
      toEntityId: row.to_entity_id ?? undefined,
      fieldMappings: row.field_mappings_json ? JSON.parse(row.field_mappings_json) : undefined,
      formulaUsed: row.formula_used ?? undefined,
      actorId: row.actor_id ?? undefined,
      traceHash: row.trace_hash ?? undefined,
      isFixture: row.is_fixture === 1,
      environment: row.environment ?? 'development',
      tenantId: row.tenant_id ?? undefined,
      occurredAt: row.occurred_at
    };
  }
}

// ----------------------------------------------------------------------
// DATA PROFILE REPOSITORY
// ----------------------------------------------------------------------
export class FinanceProfileRepository {
  constructor(private readonly db: DatabaseCore) {}

  async insert(p: DataProfile): Promise<DataProfile> {
    await this.db.run(`
      INSERT INTO finance_profiles (
        profile_id, source_id, batch_id, dataset_name, row_count, column_count,
        null_rate_json, duplicate_rate, unique_rate_json, type_distribution_json,
        date_range_json, amount_range_json, currency_distribution_json,
        schema_change_signature, inferred_entities_json,
        is_fixture, environment, tenant_id, profiled_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.profileId, p.sourceId, p.batchId, p.datasetName,
      p.rowCount, p.columnCount,
      JSON.stringify(p.nullRates), p.duplicateRate,
      JSON.stringify(p.uniqueRates), JSON.stringify(p.typeDistribution),
      p.dateRange ? JSON.stringify(p.dateRange) : null,
      p.amountRange ? JSON.stringify(p.amountRange) : null,
      JSON.stringify(p.currencyDistribution),
      p.schemaChangeSignature ?? null,
      JSON.stringify(p.inferredEntities),
      p.isFixture ? 1 : 0, p.environment, p.tenantId ?? null, p.profiledAt
    ]);
    return p;
  }

  async listBySource(sourceId: string, limit = 50): Promise<DataProfile[]> {
    const rows = await this.db.all(
      `SELECT * FROM finance_profiles WHERE source_id = ? ORDER BY profiled_at DESC LIMIT ?`,
      [sourceId, limit]
    ) as any[];
    return rows.map(this.hydrate);
  }

  private hydrate(row: any): DataProfile {
    return {
      profileId: row.profile_id,
      sourceId: row.source_id,
      batchId: row.batch_id,
      datasetName: row.dataset_name,
      rowCount: row.row_count,
      columnCount: row.column_count,
      nullRates: row.null_rate_json ? JSON.parse(row.null_rate_json) : {},
      duplicateRate: row.duplicate_rate,
      uniqueRates: row.unique_rate_json ? JSON.parse(row.unique_rate_json) : {},
      typeDistribution: row.type_distribution_json ? JSON.parse(row.type_distribution_json) : {},
      dateRange: row.date_range_json ? JSON.parse(row.date_range_json) : undefined,
      amountRange: row.amount_range_json ? JSON.parse(row.amount_range_json) : undefined,
      currencyDistribution: row.currency_distribution_json ? JSON.parse(row.currency_distribution_json) : {},
      schemaChangeSignature: row.schema_change_signature ?? undefined,
      inferredEntities: row.inferred_entities_json ? JSON.parse(row.inferred_entities_json) : [],
      isFixture: row.is_fixture === 1,
      environment: row.environment ?? 'development',
      profiledAt: row.profiled_at
    };
  }
}

// ----------------------------------------------------------------------
// MAPPINGS REPOSITORY — entity resolution + cross-domain mappings
// ----------------------------------------------------------------------
export class FinanceMappingsRepository {
  constructor(private readonly db: DatabaseCore) {}

  async upsert(m: EntityResolutionResult): Promise<EntityResolutionResult> {
    const now = new Date().toISOString();
    const sql = `
      INSERT INTO finance_mappings (
        mapping_id, finance_entity_kind, finance_entity_id, remote_domain,
        remote_entity_kind, remote_entity_id, mapping_type, confidence_level,
        mapping_rule, resolved_by, resolved_at, source_system, source_record_id,
        version, is_fixture, environment, tenant_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(finance_entity_kind, finance_entity_id, remote_domain, remote_entity_kind, remote_entity_id) DO UPDATE SET
        mapping_type=excluded.mapping_type,
        confidence_level=excluded.confidence_level,
        mapping_rule=excluded.mapping_rule,
        resolved_by=excluded.resolved_by,
        resolved_at=excluded.resolved_at,
        version=finance_mappings.version + 1,
        updated_at=CURRENT_TIMESTAMP
    `;
    await this.db.run(sql, [
      m.mappingId, m.financeEntityKind, m.financeEntityId ?? null, m.remoteDomain,
      m.remoteEntityKind, m.remoteEntityId ?? null, m.mappingType, m.confidenceLevel,
      m.mappingRule ?? null, m.resolvedBy, m.resolvedAt ?? now,
      null, null, 1, 0, 'development', undefined, now, now
    ]);
    return m;
  }

  async forFinanceEntity(financeEntityKind: string, financeEntityId: string): Promise<EntityResolutionResult[]> {
    const rows = await this.db.all(
      `SELECT * FROM finance_mappings WHERE finance_entity_kind = ? AND finance_entity_id = ? ORDER BY updated_at DESC`,
      [financeEntityKind, financeEntityId]
    ) as any[];
    return rows.map(this.hydrate);
  }

  private hydrate(row: any): EntityResolutionResult {
    return {
      mappingId: row.mapping_id,
      financeEntityKind: row.finance_entity_kind,
      financeEntityId: row.finance_entity_id ?? undefined,
      remoteDomain: row.remote_domain,
      remoteEntityKind: row.remote_entity_kind,
      remoteEntityId: row.remote_entity_id ?? undefined,
      mappingType: row.mapping_type as any,
      confidenceLevel: row.confidence_level as any,
      status: 'RESOLVED',
      resolvedBy: row.resolved_by,
      resolvedAt: row.resolved_at,
      mappingRule: row.mapping_rule ?? undefined
    };
  }
}

// ----------------------------------------------------------------------
// BARREL EXPORT — for consumers
// ----------------------------------------------------------------------
export const createAllFinanceRepositories = (db: DatabaseCore) => ({
  sources: new FinanceSourcesRepository(db),
  batches: new FinanceBatchesRepository(db),
  records: new FinanceRecordsRepository(db),
  quality: new FinanceDataQualityRepository(db),
  lineage: new FinanceLineageRepository(db),
  profiles: new FinanceProfileRepository(db),
  mappings: new FinanceMappingsRepository(db)
});
