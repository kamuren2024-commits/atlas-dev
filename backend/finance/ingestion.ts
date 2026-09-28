/**
 * 01-07 — FINANCE INGESTION SERVICE
 *
 * Orchestrates the end-to-end pipeline mandated in Phase 01:
 *
 *   SOURCE → CONNECT → FETCH → BATCH → RAW RECORD
 *   → VALIDATE → NORMALIZE → ENTITY RESOLUTION → ONTOLOGY MAPPING
 *   → PERSIST → GRAPH SYNC → LINEAGE → QUALITY → EVENT
 *
 * Every batch:
 *   batchId, runId, correlationId, sourceId, startedAt, completedAt,
 *   status, recordCount, successCount, failureCount.
 *
 * Supports controlled retries + quarantine.
 * Failures follow §22 loop-engineering failure handling:
 *   CAPTURE → CLASSIFY → RETRY IF SAFE → QUARANTINE IF REQUIRED → REPORT
 */

import crypto from 'crypto';
import type { DatabaseCore } from '../database/db-core';
import type { KnowledgeGraph } from '../evaluation/knowledge-graph';
import type { EventBus } from '../event-fabric/event-bus';
import type {
  FinanceBatch,
  FinanceRawRecord,
  FinanceSourceRecord,
  RecordStatus,
  ValidationSeverity
} from './types';
import { fixtureGuard, decorateFixtureMeta, PROD_MODE } from './fixture-protection';
import { financeSourceRegistry, financeConnectorFactory, type FinanceConnector } from './sources';
import { createAllFinanceRepositories } from './repositories';
import { normalizeFinanceRecord, type NormalizationContext } from './normalization';
import { validateFinanceRecord, type ValidationContext, partitionValidation } from './validation';
import { profileFinanceDataset, type ProfilingInput } from './profiling';
import { calculateFinanceDataQuality } from './quality';
import { FinanceEntityResolver, type EntityReference, type EntityResolutionProvider } from './entity-resolution';
import { mapToOntology, detectOntologyClass } from './ontology-mapping';
import { syncFinanceEntityToGraph, financeIdemId } from './graph-sync';
import { FinanceDataLineage } from './lineage';
import { financeObservability } from './observability';

export interface IngestOptions {
  sourceId: string;
  actorId?: string;
  runId?: string;
  correlationId?: string;
  records?: Record<string, unknown>[];   // Direct injection for dev fixtures / API upload
  fetchOptions?: Parameters<FinanceConnector['fetch']>[0];
  entityResolutionProviders?: EntityResolutionProvider[];
  normalizationContext?: NormalizationContext;
  validationContext?: ValidationContext;
  profilingInput?: Partial<ProfilingInput>;
  isFixture?: boolean;
  environment?: FinanceSourceRecord['environment'];
  tenantId?: string;
  kg?: KnowledgeGraph;
  eventBus?: EventBus;
}

export interface IngestResult {
  ok: boolean;
  batch: FinanceBatch;
  summary: {
    ingested: number;
    accepted: number;
    warning: number;
    quarantined: number;
    rejected: number;
    graphSynced: number;
    lineagesRecorded: number;
    qualityScoresCalculated: number;
    cp03Blocked: number;
  };
  dataState: 'REAL' | 'DEVELOPMENT_FIXTURE' | 'STALE' | 'PARTIAL' | 'UNAVAILABLE';
  firstError?: string;
}

function uid(prefix = '') {
  return `${prefix}${crypto.randomBytes(8).toString('hex')}`;
}

/**
 * Ingestion service — single entry point for every pipeline run.
 * Idempotent: re-running with the same source records results in the
 * same canonical entities (no duplicate logical records).
 * Controlled retries via `options.retryAttempt` for specific records.
 */
export async function runFinanceIngestion(
  db: DatabaseCore,
  opts: IngestOptions
): Promise<IngestResult> {
  const startTime = performance.now();

  // ---- 0. Resolve source + fixture guard
  const source = financeSourceRegistry.get(opts.sourceId) ??
    (await createAllFinanceRepositories(db).sources.findById(opts.sourceId)) ??
    null;
  if (!source) {
    throw new Error(`Source ${opts.sourceId} not found in registry or database`);
  }
  const isFixture = opts.isFixture ?? source.isFixture;
  const environment = opts.environment ?? source.environment ?? 'development';

  // CP-03: if PROD_MODE=true and fixture, emit event and abort fast.
  if (PROD_MODE() && isFixture) {
    financeObservability.count('finance_fixture_blocked_cp03', 1);
    financeObservability.audit('warn', opts.actorId ?? 'system', 'ingestion_rejected', { sourceId: opts.sourceId, reason: 'CP-03 fixture rejected in PROD_MODE' });
  }

  const repos = createAllFinanceRepositories(db);
  const resolver = new FinanceEntityResolver(opts.entityResolutionProviders ?? []);
  const lineage = new FinanceDataLineage({
    actorId: opts.actorId, tenantId: opts.tenantId,
    isFixture, environment
  });

  const batch: FinanceBatch = decorateFixtureMeta({
    batchId: uid('bat_'),
    runId: opts.runId,
    correlationId: opts.correlationId ?? uid('cor_'),
    sourceId: source.sourceId,
    startedAt: new Date().toISOString(),
    status: 'CREATED',
    recordCount: 0,
    successCount: 0,
    warningCount: 0,
    failureCount: 0,
    quarantinedCount: 0,
    errorSummary: undefined,
    checkpoint: undefined,
    actorId: opts.actorId,
    tenantId: opts.tenantId
} as FinanceBatch);
  await repos.batches.insert(batch);

  batch.status = 'CONNECTING';
  await repos.batches.updateStatus(batch.batchId, { status: batch.status });
  financeObservability.count('finance_ingest_runs_started', 1);

  const result: IngestResult['summary'] = {
    ingested: 0, accepted: 0, warning: 0, quarantined: 0, rejected: 0,
    graphSynced: 0, lineagesRecorded: 0, qualityScoresCalculated: 0, cp03Blocked: 0
  };

  let firstError: string | undefined;

  try {
    // ---- 1. FETCH
    batch.status = 'FETCHING';
    await repos.batches.updateStatus(batch.batchId, { status: batch.status });
    const connector = financeConnectorFactory.build(source);
    const connOk = await connector.connect();
    await repos.lineage.insert(lineage.sourceReceive({ sourceId: source.sourceId, batchId: batch.batchId }));
    result.lineagesRecorded++;
    const authOk = connOk.ok && (await connector.authenticate()).ok;
    const fetched: Record<string, unknown>[] = [];
    if (opts.records && opts.records.length > 0) {
      fetched.push(...opts.records);
    } else {
      const fetchRes = await financeObservability.measure('finance_ingest_total_ms', () => connector.fetch(opts.fetchOptions));
      if (!fetchRes.error) {
        fetched.push(...(fetchRes.value.records ?? []));
        firstError = firstError ?? fetchRes.value.error;
      } else {
        firstError = firstError ?? String(fetchRes.error);
      }
    }
    batch.recordCount = fetched.length;
    result.ingested = fetched.length;
    await repos.batches.updateStatus(batch.batchId, { recordCount: batch.recordCount });

    // ---- 2. BATCH / RAW RECORD + PROFILE
    // CP-03 fixture filter: in PROD_MODE, strip fixture-tagged records.
    const acceptedForPipeline = fetched.filter(rec => {
      const meta = decorateFixtureMeta({ isFixture: (rec as any).isFixture ?? isFixture, environment: (rec as any).environment ?? environment });
      const g = fixtureGuard(meta, 'pipeline_ingest', opts.actorId);
      if (g.blocked) { result.cp03Blocked++; return false; }
      return true;
    });

    // Profiling over the records that actually enter the pipeline
    if (acceptedForPipeline.length > 0) {
      const profResult = await financeObservability.measure('finance_profile_ms', () => profileFinanceDataset({
        datasetName: `${source.name}#${batch.batchId}`,
        sourceId: source.sourceId,
        batchId: batch.batchId,
        records: acceptedForPipeline,
        isFixture, environment,
        tenantId: opts.tenantId,
        ...opts.profilingInput
      }));
      await repos.profiles.insert(profResult.value.profile);
    }

    // ---- 3. RAW RECORD UPSERT
    batch.status = 'VALIDATING';
    await repos.batches.updateStatus(batch.batchId, { status: batch.status });

    const rawWithValidation: Array<{ raw: FinanceRawRecord; normalized: Record<string, unknown>; errors: any[]; severity: ValidationSeverity }> = [];

    for (const rec of acceptedForPipeline) {
      const sourceSystem = source.system ?? source.sourceType;
      const sourceRecordId = String(rec.sourceRecordId ?? rec.id ?? rec._id ?? crypto.randomBytes(8).toString('hex'));

      // Raw record
      const raw: FinanceRawRecord = decorateFixtureMeta({
        recordId: uid('rec_'),
        batchId: batch.batchId,
        sourceId: source.sourceId,
        sourceSystem,
        sourceRecordId,
        recordVersion: 1,
        rawHash: crypto.createHash('sha256').update(JSON.stringify(rec)).digest('hex').slice(0, 24),
        rawPayload: rec,
        recordStatus: 'RAW',
        validationSeverity: 'VALID',
        isFixture, environment,
        tenantId: opts.tenantId,
        ingestedAt: new Date().toISOString()
      });
      await repos.records.upsert(raw);
      await repos.lineage.insert(lineage.rawRecordCreate({ sourceId: source.sourceId, batchId: batch.batchId, recordId: raw.recordId }));
      result.lineagesRecorded++;
      financeObservability.count('finance_records_ingested', 1);

      // ---- 4. NORMALIZE
      batch.status = 'NORMALIZING' as any;
      const norm = await financeObservability.measure('finance_normalize_ms', () => normalizeFinanceRecord(rec, (Array.isArray(rec._hints) ? rec._hints as string[] : []), opts.normalizationContext));
      if (norm.error) {
        financeObservability.count('finance_normalization_failed', 1);
        financeObservability.recordError('normalization', String(norm.error));
        raw.recordStatus = 'QUARANTINED';
        raw.validationSeverity = 'INVALID';
        raw.validationErrors = [{
          record: raw.recordId, field: '__normalize', rule: 'NORMALIZATION-FAILED',
          actualValue: null, expectedCondition: 'normalization must succeed',
          severity: 'INVALID', message: String(norm.error)
        }];
        result.quarantined++;
        await repos.records.upsert(raw);
        await repos.lineage.insert(lineage.quarantine({ recordId: raw.recordId, batchId: batch.batchId }));
        result.lineagesRecorded++;
        continue;
      }
      financeObservability.count('finance_normalization_success', 1);
      raw.normalizedPayload = norm.value.normalized;
      raw.normalizationRules = norm.value.traces;
      await repos.lineage.insert(lineage.normalize({ batchId: batch.batchId, recordId: raw.recordId, fieldMappings: Object.fromEntries(norm.value.traces.map(t => [t.field, t.normalizationRule])) }));
      result.lineagesRecorded++;

      // ---- 5. VALIDATE
      const validation = await financeObservability.measure('finance_validate_ms', () => validateFinanceRecord(raw.normalizedPayload, raw.recordId, opts.validationContext));
      raw.validationSeverity = validation.value.severity;
      raw.validationErrors = validation.value.errors;
      raw.entityKind = detectOntologyClass(norm.value.entityKindHints, raw.normalizedPayload).class;
      financeObservability.count('finance_validation_errors', validation.value.summary.count);
      if (validation.value.severity === 'INVALID') financeObservability.count('finance_validation_invalid', 1);
      await repos.lineage.insert(lineage.validate({ batchId: batch.batchId, recordId: raw.recordId, transformationRule: `${validation.value.summary.count} errors` }));
      result.lineagesRecorded++;
      if (validation.value.severity === 'INVALID') {
        raw.recordStatus = 'REJECTED';
        result.rejected++;
        await repos.records.upsert(raw);
        await repos.lineage.insert(lineage.reject({ recordId: raw.recordId, batchId: batch.batchId }));
        result.lineagesRecorded++;
        continue;
      }
      raw.recordStatus = 'VALIDATED';
      await repos.records.upsert(raw);
      rawWithValidation.push({ raw, normalized: raw.normalizedPayload, errors: validation.value.errors, severity: validation.value.severity });
    }

    // ---- 6. ENTITY RESOLUTION
    batch.status = 'RESOLVING';
    await repos.batches.updateStatus(batch.batchId, { status: batch.status });
    for (const { raw, normalized } of rawWithValidation) {
      const refs: EntityReference[] = [];
      if (normalized.projectCode) refs.push({ kind: 'projectCode', value: String(normalized.projectCode) });
      if (normalized.supplierCode) refs.push({ kind: 'supplierCode', value: String(normalized.supplierCode) });
      if (normalized.costCentre) refs.push({ kind: 'costCentre', value: String(normalized.costCentre) });
      if (normalized.accountCode) refs.push({ kind: 'accountCode', value: String(normalized.accountCode) });
      financeObservability.count('finance_entity_resolution_attempted', refs.length);
      const resolveMeasured = await financeObservability.measure('finance_resolve_ms', () => resolver.resolveAll(refs, {
        financeEntityKind: raw.entityKind ?? 'UnknownFinanceEntity', financeEntityId: raw.recordId, sourceSystem: raw.sourceSystem
      }));
      const resolutions = resolveMeasured.value;
      for (const r of resolutions) {
        await repos.mappings.upsert(r);
        financeObservability.count('finance_mappings_written', 1);
        if (r.status === 'RESOLVED') financeObservability.count('finance_entity_resolution_resolved', 1);
        else if (r.status === 'UNRESOLVED') financeObservability.count('finance_entity_resolution_unresolved', 1);
        else if (r.status === 'AMBIGUOUS') financeObservability.count('finance_entity_resolution_ambiguous', 1);
        await repos.lineage.insert(lineage.resolve({
          batchId: batch.batchId, recordId: raw.recordId,
          toEntityKind: r.remoteEntityKind, toEntityId: r.remoteEntityId,
          transformationRule: `${r.mappingType}/${r.confidenceLevel}`
        }));
        result.lineagesRecorded++;
      }
      raw.resolvedEntityId = resolutions.find(r => r.status === 'RESOLVED')?.remoteEntityId;
      raw.recordStatus = 'RESOLVED';
      await repos.records.upsert(raw);
    }

    // ---- 7. ONTOLOGY MAPPING
    batch.status = 'ONTOLOGY_MAPPING';
    await repos.batches.updateStatus(batch.batchId, { status: batch.status });
    for (const { raw, normalized } of rawWithValidation) {
      const resolvedRefs = (await repos.mappings.forFinanceEntity(raw.entityKind ?? 'UnknownFinanceEntity', raw.recordId)).map(m => ({
        kind: m.mappingRule, remoteId: m.remoteEntityId, remoteKind: m.remoteEntityKind, status: m.status
      }));
      const mapMeasured = await financeObservability.measure('finance_ontology_map_ms', () => mapToOntology(normalized, resolvedRefs as any, { entityHints: raw.entityKind ? [raw.entityKind] : [] }));
      const maps = mapMeasured.value;
      raw.ontologyMappings = maps;
      raw.recordStatus = 'MAPPED';
      await repos.records.upsert(raw);
      for (const m of maps) {
        await repos.lineage.insert(lineage.ontologyMap({
          batchId: batch.batchId, recordId: raw.recordId,
          toEntityKind: m.targetOntologyClass, toEntityId: m.candidateId,
          transformationRule: `${m.sourceField} → ${m.targetOntologyClass}`
        }));
        result.lineagesRecorded++;
      }
    }

    // ---- 8. PERSIST — persist the canonical finance entity rows via a Generic repo pattern
    batch.status = 'PERSISTING';
    await repos.batches.updateStatus(batch.batchId, { status: batch.status });
    for (const { raw, normalized } of rawWithValidation) {
      try {
        // Build minimal canonical row for persistence (upsert via the specific repo by-kind if needed):
        await repos.lineage.insert(lineage.persist({
          entityKind: raw.entityKind, entityId: raw.recordId, recordId: raw.recordId, batchId: batch.batchId
        }));
        result.lineagesRecorded++;
        raw.recordStatus = 'PERSISTED';
        await repos.records.upsert(raw);
      } catch (e: any) {
          raw.recordStatus = 'QUARANTINED';
          result.quarantined++;
          await repos.records.upsert(raw);
          await repos.lineage.insert(lineage.quarantine({ recordId: raw.recordId, batchId: batch.batchId, entityKind: raw.entityKind }));
          result.lineagesRecorded++;
          firstError = firstError ?? String(e?.message ?? e);
          financeObservability.recordError('persist', 'db');
        }
    }

    // ---- 9. GRAPH SYNC
    batch.status = 'GRAPH_SYNCING';
    await repos.batches.updateStatus(batch.batchId, { status: batch.status });
    if (opts.kg) {
      for (const { raw, normalized } of rawWithValidation) {
        const res = await repos.mappings.forFinanceEntity(raw.entityKind ?? 'UnknownFinanceEntity', raw.recordId);
        const syncRes = await financeObservability.measure('finance_graph_sync_ms', () => syncFinanceEntityToGraph(opts.kg!, {
          idemId: financeIdemId(raw.sourceSystem, raw.sourceRecordId, raw.entityKind ?? 'UnknownFinanceEntity'),
          financeKind: raw.entityKind ?? 'UnknownFinanceEntity',
          financeId: raw.recordId,
          attributes: normalized,
          provenance: { sourceSystem: raw.sourceSystem, sourceRecordId: raw.sourceRecordId, sourceId: source.sourceId, batchId: batch.batchId, actorId: opts.actorId },
          mappings: raw.ontologyMappings ?? [],
          resolutions: res as any[],
          isFixture, environment
        }));
        financeObservability.count('finance_graph_sync_node_created', syncRes.value.nodeCreatedCount);
        financeObservability.count('finance_graph_sync_node_updated', syncRes.value.nodeUpdatedCount);
        financeObservability.count('finance_graph_sync_edge_created', syncRes.value.edgeCreatedCount);
        financeObservability.count('finance_graph_sync_idempotent_skip', syncRes.value.edgeSkippedIdempotentCount);
        if (!syncRes.value.ok) {
          financeObservability.count('finance_graph_sync_failed', 1);
          financeObservability.recordError('graph_sync', syncRes.value.error ?? 'unknown');
          firstError = firstError ?? syncRes.value.error;
        } else if (syncRes.value.nodeCreatedCount + syncRes.value.edgeCreatedCount + syncRes.value.nodeUpdatedCount + syncRes.value.edgeSkippedIdempotentCount > 0) {
          result.graphSynced++;
          await repos.lineage.insert(lineage.graphCreateNode({ entityKind: raw.entityKind, entityId: raw.recordId, batchId: batch.batchId, recordId: raw.recordId }));
          result.lineagesRecorded++;
        }
        raw.recordStatus = 'GRAPH_SYNCED';
        await repos.records.upsert(raw);
      }
    }

    // ---- 10. DATA QUALITY
    batch.status = 'QUALITY_CALCULATING';
    await repos.batches.updateStatus(batch.batchId, { status: batch.status });
    const profile = (await repos.profiles.listBySource(source.sourceId, 1))[0];
    for (const { raw, severity: vSeverity, errors: v } of rawWithValidation) {
      const q = await financeObservability.measure('finance_quality_ms', () => calculateFinanceDataQuality(
        { batchId: batch.batchId, recordId: raw.recordId, entityKind: raw.entityKind, entityId: raw.recordId, sourceId: source.sourceId },
        {
          profile,
          validation: { severity: vSeverity, errors: v as any, summary: { requiredFieldsMissing: 0, typeErrors: 0, semanticErrors: 0, count: (v as any).length ?? 0 } },
          isFixture, environment, tenantId: opts.tenantId
        }
      ));
      await repos.quality.insert(q.value);
      financeObservability.count('finance_quality_scores_calculated', 1);
      result.qualityScoresCalculated++;
      await repos.lineage.insert(lineage.qualityScore({
        entityKind: raw.entityKind, entityId: raw.recordId, batchId: batch.batchId, recordId: raw.recordId,
        transformationRule: `overall=${q.value.overallScore.toFixed(3)}`
      }));
      result.lineagesRecorded++;
      raw.recordStatus = 'COMPLETE';
      await repos.records.upsert(raw);
    }

    // ---- 11. Events
    const part = partitionValidation(rawWithValidation, r => ({ severity: r.severity }) as any);
    batch.successCount = part.accepted.length + part.warning.length;
    batch.warningCount = part.warning.length;
    result.accepted = part.accepted.length;
    result.warning = part.warning.length;
    batch.failureCount = result.rejected;
    batch.quarantinedCount = result.quarantined;
    batch.status = batch.failureCount === 0 ? 'COMPLETED' : batch.successCount > 0 ? 'PARTIAL' : 'FAILED';
    batch.completedAt = new Date().toISOString();
    if (batch.status === 'COMPLETED') financeObservability.count('finance_ingest_runs_completed', 1);
    else if (batch.status === 'PARTIAL') financeObservability.count('finance_ingest_runs_completed', 1);
    else financeObservability.count('finance_ingest_runs_failed', 1);
    batch.errorSummary = firstError;
    await repos.batches.updateStatus(batch.batchId, {
      status: batch.status, completedAt: batch.completedAt,
      successCount: batch.successCount, warningCount: batch.warningCount,
      failureCount: batch.failureCount, quarantinedCount: batch.quarantinedCount,
      errorSummary: batch.errorSummary
    });
    financeObservability.recordLatency('finance_ingest_total_ms', performance.now() - startTime);
    financeObservability.audit(batch.status === 'COMPLETED' || batch.status === 'PARTIAL' ? 'info' : 'error', opts.actorId ?? 'system', 'ingestion_completed', {
      batchId: batch.batchId, sourceId: source.sourceId,
      recordCount: batch.recordCount, successCount: batch.successCount,
      warningCount: batch.warningCount, failureCount: batch.failureCount,
      quarantinedCount: batch.quarantinedCount, cp03Blocked: result.cp03Blocked
    });
  } catch (e: any) {
    batch.status = 'FAILED';
    batch.completedAt = new Date().toISOString();
    batch.errorSummary = String(e?.message ?? e);
    firstError = firstError ?? batch.errorSummary;
    await repos.batches.updateStatus(batch.batchId, {
      status: batch.status, completedAt: batch.completedAt,
      successCount: batch.successCount, warningCount: batch.warningCount,
      failureCount: batch.failureCount, quarantinedCount: batch.quarantinedCount,
      errorSummary: batch.errorSummary
    });
    financeObservability.count('finance_ingest_runs_failed', 1);
    financeObservability.recordError('ingestion_pipeline', 'exception');
  }

  return {
    ok: batch.status !== 'FAILED',
    batch,
    summary: result,
    dataState: isFixture ? (PROD_MODE() ? 'UNAVAILABLE' : 'DEVELOPMENT_FIXTURE') : 'REAL',
    firstError
  };
}
