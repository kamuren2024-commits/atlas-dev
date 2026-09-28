/**
 * 01-14 — FINANCE GRAPH SYNCHRONIZATION
 *
 * Synchronizes Finance entities into the existing Atlas Knowledge Graph
 * (backend/evaluation/knowledge-graph.ts) without creating a competing
 * graph implementation.
 *
 * Graph mutations:
 *   - are idempotent (upsert by stable deterministic ID)
 *   - create Nodes: Budget, Commitment, Invoice, Payment, CAPEX, OPEX,
 *                   ProjectFinance, FinancialRisk, FinancialForecast
 *   - create Edges per KETRACO enterprise ontology:
 *       Budget           → ALLOCATED_TO   → Project
 *       Commitment       → RELATES_TO     → Contract
 *       Commitment       → ENCUMBERS      → Budget
 *       Invoice          → RELATES_TO     → Commitment
 *       Payment          → SETTLES        → Invoice
 *       ProjectCost      → BELONGS_TO     → Project
 *       CAPEX            → CAPITALIZES    → Asset
 *       OPEX             → RELATES_TO     → Department / Asset / Project
 *       Finance          → CONNECTED_TO   → Projects/Procurement/Contracts/Suppliers/Assets
 *
 * The graph must answer (§12):
 *   What is this?  Where did it originate?  What does it belong to?
 *   What does it affect?  What affects it?  Who owns it?
 *   Which period applies?  Which project?  Which supplier/contract?  Which source?
 */

import type { KnowledgeGraph } from '../evaluation/knowledge-graph';
import type { EntityResolutionResult, OntologyMapping } from './types';

export interface FinanceGraphSyncRequest {
  idemId: string;
  financeKind: string;
  financeId: string;
  attributes: Record<string, unknown>;
  provenance: {
    sourceSystem?: string;
    sourceRecordId?: string;
    sourceId?: string;
    batchId?: string;
    actorId?: string;
  };
  mappings: OntologyMapping[];
  resolutions: EntityResolutionResult[];
  isFixture: boolean;
  environment: string;
}

export interface FinanceGraphSyncResult {
  ok: boolean;
  nodeCreatedCount: number;
  nodeUpdatedCount: number;
  edgeCreatedCount: number;
  edgeSkippedIdempotentCount: number;
  error?: string;
}

function attrString(a: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(a)) {
    if (v === undefined || v === null) continue;
    if (typeof v === 'object') out[k] = JSON.stringify(v);
    else out[k] = String(v);
  }
  return out;
}

/**
 * Synchronize one Finance entity into the Atlas knowledge graph.
 * Idempotent — running the same sync twice yields the same graph state
 * and reports edges as "skipped (idempotent)" when they exist.
 */
export function syncFinanceEntityToGraph(
  kg: KnowledgeGraph,
  req: FinanceGraphSyncRequest
): FinanceGraphSyncResult {
  let nodeCreated = 0; let nodeUpdated = 0; let edgeCreated = 0; let edgeSkipped = 0;

  try {
    // 1. Upsert the Finance node — use a stable ID to guarantee idempotency
    const nodeId = `finance:${req.financeKind}:${req.financeId}`;
    const existingNode = kg.nodes.find(n => n.id === nodeId);
    const baseAttrs = attrString({
      ...req.attributes,
      source_system: req.provenance.sourceSystem,
      source_record_id: req.provenance.sourceRecordId,
      source_id: req.provenance.sourceId,
      batch_id: req.provenance.batchId,
      actor_id: req.provenance.actorId,
      finance_kind: req.financeKind,
      is_fixture: String(req.isFixture),
      environment: req.environment,
      idempotency_id: req.idemId
    });
    if (!existingNode) {
      kg.nodes.push({
        id: nodeId,
        label: req.financeKind,
        type: req.financeKind,
        category: 'Finance',
        attributes: baseAttrs,
        properties: baseAttrs
      });
      nodeCreated++;
    } else {
      existingNode.attributes = { ...(existingNode.attributes ?? {}), ...baseAttrs };
      existingNode.properties = { ...(existingNode.properties ?? {}), ...baseAttrs };
      if (!existingNode.category || existingNode.category !== 'Finance') existingNode.category = 'Finance';
      nodeUpdated++;
    }

    // 2. Upsert relationships using KETRACO Enterprise Ontology edge vocabulary
    //    (graph-sync writes superset GraphEdge shapes: source/target/type for the
    //    existing consumers plus from/to/relationship for the Finance ontology.)
    const edgeKey = (a: string, b: string, r: string) => `${a}⟨${r}⟩${b}`;
    const existingKeys = new Set(kg.edges.map(e => edgeKey(e.from ?? e.source ?? '', e.to ?? e.target ?? '', e.relationship ?? e.type ?? '')));

    function ensureEdge(from: string, to: string, rel: string, meta?: Record<string, string>) {
      if (!from || !to) return;
      const key = edgeKey(from, to, rel);
      if (existingKeys.has(key)) { edgeSkipped++; return; }
      kg.edges.push({
        id: key,
        from, to, relationship: rel,
        source: from, target: to, type: rel,
        weight: 1.0,
        attributes: meta ?? {},
        properties: meta ?? {}
      });
      edgeCreated++; existingKeys.add(key);
    }

    // Cross-domain edges — for every RESOLVED entity-resolution result,
    // connect Finance node to the enterprise entity.
    for (const r of req.resolutions) {
      if (r.status !== 'RESOLVED' || !r.remoteEntityId) continue;
      const remoteNode = `entity:${r.remoteDomain}:${r.remoteEntityKind}:${r.remoteEntityId}`;
      // Infer relationship
      let rel = 'RELATES_TO';
      if (req.financeKind === 'Budget' && r.remoteDomain === 'projects') rel = 'ALLOCATED_TO';
      else if (req.financeKind === 'Commitment' && r.remoteDomain === 'contracts') rel = 'RELATES_TO';
      else if (req.financeKind === 'Commitment' && r.remoteEntityKind === 'Budget') rel = 'ENCUMBERS';
      else if (req.financeKind === 'Invoice' && r.remoteEntityKind === 'Commitment') rel = 'RELATES_TO';
      else if (req.financeKind === 'Payment' && r.remoteEntityKind === 'Invoice') rel = 'SETTLES';
      else if (req.financeKind === 'ProjectCost' && r.remoteDomain === 'projects') rel = 'BELONGS_TO';
      else if (req.financeKind === 'CAPEX' && r.remoteDomain === 'assets') rel = 'CAPITALIZES';
      else if (req.financeKind === 'OPEX' && (r.remoteEntityKind === 'Department' || r.remoteDomain === 'assets' || r.remoteDomain === 'projects')) rel = 'RELATES_TO';
      ensureEdge(nodeId, remoteNode, rel, {
        finance_kind: req.financeKind,
        mapping_type: r.mappingType,
        confidence: r.confidenceLevel
      });
    }

    // Source provenance edge → source node
    if (req.provenance.sourceId) {
      const srcId = `source:finance:${req.provenance.sourceId}`;
      if (!kg.nodes.find(n => n.id === srcId)) {
        const srcAttrs = { source_id: req.provenance.sourceId, domain: 'Finance' };
        kg.nodes.push({
          id: srcId, label: 'FinanceSource', type: 'FinanceSource',
          category: 'Metadata', attributes: srcAttrs, properties: srcAttrs
        });
        nodeCreated++;
      }
      ensureEdge(nodeId, srcId, 'ORIGINATES_FROM', { batch_id: req.provenance.batchId ?? '' });
    }

    return {
      ok: true,
      nodeCreatedCount: nodeCreated,
      nodeUpdatedCount: nodeUpdated,
      edgeCreatedCount: edgeCreated,
      edgeSkippedIdempotentCount: edgeSkipped
    };
  } catch (e: any) {
    return {
      ok: false,
      nodeCreatedCount: nodeCreated,
      nodeUpdatedCount: nodeUpdated,
      edgeCreatedCount: edgeCreated,
      edgeSkippedIdempotentCount: edgeSkipped,
      error: String(e?.message ?? e)
    };
  }
}

/**
 * Derive a deterministic, stable idempotency ID from (sourceSystem, sourceRecordId, financeKind).
 * Used by syncFinanceEntityToGraph to guarantee idempotent upserts.
 */
export function financeIdemId(sourceSystem: string | undefined, sourceRecordId: string, financeKind: string): string {
  return `idem:${sourceSystem ?? 'none'}:${financeKind}:${sourceRecordId}`;
}
