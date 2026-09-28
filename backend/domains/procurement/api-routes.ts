import express, { type Request, type Response } from 'express';
import type { DatabaseCore } from '../../database/db-core';
import type { KnowledgeGraph } from '../../evaluation/knowledge-graph';
import { AuthorizationService } from '../../security/authorization-service';
import type { AuditLogger } from '../../observability/audit-logger';
import type { UserIdentity } from '../../security/identity-service';
import { calculateCompetitionSignal, calculatePipelineMetrics } from './intelligence';

interface AuthenticatedRequest extends Request {
  userId?: string;
  tenantId?: string;
  user?: UserIdentity;
}

interface ProcurementCaseRow {
  id: string;
  project_id: string | null;
  requirement_id: string | null;
  category: string;
  description: string;
  estimated_value: number | null;
  currency: string | null;
  procurement_method: string | null;
  lifecycle_stage: string;
  tender_id: string | null;
  supplier_id: string | null;
  contract_id: string | null;
  purchase_order_id: string | null;
  source_system: string;
  source_record_id: string | null;
  created_at: string;
  updated_at: string;
}

function fail(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

function toCase(row: ProcurementCaseRow) {
  return {
    id: row.id,
    projectId: row.project_id,
    requirementId: row.requirement_id,
    category: row.category,
    description: row.description,
    estimatedValue: row.estimated_value,
    currency: row.currency,
    procurementMethod: row.procurement_method,
    lifecycleStage: row.lifecycle_stage,
    tenderId: row.tender_id,
    supplierId: row.supplier_id,
    contractId: row.contract_id,
    purchaseOrderId: row.purchase_order_id,
    evidence: {
      sourceSystem: row.source_system,
      sourceRecordId: row.source_record_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
  };
}

export interface ProcurementApiDeps {
  db: DatabaseCore;
  kg: KnowledgeGraph;
  authz: AuthorizationService;
  audit: AuditLogger;
}

export function createProcurementApiRouter(deps: ProcurementApiDeps): express.Router {
  const router = express.Router();

  async function authorize(req: Request, res: Response, resourceId?: string): Promise<string | null> {
    const user = (req as AuthenticatedRequest).user;
    const authReq = req as AuthenticatedRequest;
    const userId = user?.id || authReq.userId;
    const tenantId = user?.tenantId || authReq.tenantId || 'ketraco';
    if (!userId || !(await deps.authz.check(userId, 'procurement', 'read', {
      tenantId,
      resourceId,
      role: user?.role,
      permissions: user?.permissions,
    }))) {
      fail(res, 403, 'UNAUTHORIZED', 'Not authorized to read procurement intelligence');
      return null;
    }
    return tenantId;
  }

  router.get('/summary', async (req, res) => {
    const tenantId = await authorize(req, res);
    if (!tenantId) return;
    const rows = await deps.db.all<{ lifecycle_stage: string; estimated_value: number | null }>(
      `SELECT lifecycle_stage, estimated_value
         FROM procurement_case
        WHERE tenant_id = ?`,
      [tenantId],
    );
    const metrics = calculatePipelineMetrics(
      rows.map(row => row.lifecycle_stage),
      rows.map(row => row.estimated_value),
    );
    const priceCount = await deps.db.get<{ count: number }>(
      'SELECT COUNT(*) as count FROM procurement_price_observation WHERE tenant_id = ?',
      [tenantId],
    );
    deps.audit.log({
      actor: (req as AuthenticatedRequest).user?.id || (req as AuthenticatedRequest).userId || 'system',
      action: 'procurement:summary:get',
      resourceType: 'procurement',
      resourceId: tenantId,
      status: 'completed',
      metadata: { tenantId, caseCount: rows.length },
    });
    return res.json({
      ok: true,
      data: {
        ...metrics,
        priceObservationCount: Number(priceCount?.count || 0),
        marketDataStatus: Number(priceCount?.count || 0) ? 'DERIVED' : 'MARKET_DATA_UNAVAILABLE',
        confidentialBidData: 'NOT_EXPOSED',
        limitations: rows.length ? [] : ['No persisted procurement cases are available'],
      },
    });
  });

  router.get('/cases', async (req, res) => {
    const tenantId = await authorize(req, res);
    if (!tenantId) return;
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 100);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const stage = typeof req.query.stage === 'string' ? req.query.stage : null;
    const rows = await deps.db.all<ProcurementCaseRow>(
      `SELECT id, project_id, requirement_id, category, description, estimated_value,
              currency, procurement_method, lifecycle_stage, tender_id, supplier_id,
              contract_id, purchase_order_id, source_system, source_record_id,
              created_at, updated_at
         FROM procurement_case
        WHERE tenant_id = ? AND (? IS NULL OR lifecycle_stage = ?)
        ORDER BY updated_at DESC
        LIMIT ? OFFSET ?`,
      [tenantId, stage, stage, limit, offset],
    );
    return res.json({
      ok: true,
      data: {
        cases: rows.map(toCase),
        pagination: { limit, offset, returned: rows.length },
        dataStatus: rows.length ? 'FACT' : 'UNAVAILABLE',
        confidentialBidData: 'NOT_EXPOSED',
      },
    });
  });

  router.get('/cases/:caseId', async (req, res) => {
    const tenantId = await authorize(req, res, req.params.caseId);
    if (!tenantId) return;
    const row = await deps.db.get<ProcurementCaseRow>(
      `SELECT id, project_id, requirement_id, category, description, estimated_value,
              currency, procurement_method, lifecycle_stage, tender_id, supplier_id,
              contract_id, purchase_order_id, source_system, source_record_id,
              created_at, updated_at
         FROM procurement_case
        WHERE tenant_id = ? AND id = ?`,
      [tenantId, req.params.caseId],
    );
    if (!row) return fail(res, 404, 'NOT_FOUND', 'Procurement case not found');
    const events = await deps.db.all<{
      event_type: string;
      from_stage: string | null;
      to_stage: string | null;
      occurred_at: string;
      source_system: string;
    }>(
      `SELECT event_type, from_stage, to_stage, occurred_at, source_system
         FROM procurement_case_event
        WHERE tenant_id = ? AND procurement_case_id = ?
        ORDER BY occurred_at ASC`,
      [tenantId, req.params.caseId],
    );
    return res.json({
      ok: true,
      data: {
        procurement: toCase(row),
        lifecycle: events,
        confidentialBidData: 'NOT_EXPOSED',
        dataStatus: 'FACT',
      },
    });
  });

  router.get('/market', async (req, res) => {
    const tenantId = await authorize(req, res);
    if (!tenantId) return;
    const item = typeof req.query.item === 'string' ? req.query.item : null;
    const observations = await deps.db.all<{
      item_description: string;
      specification: string | null;
      quantity: number | null;
      unit: string | null;
      unit_price: number | null;
      currency: string | null;
      observed_at: string;
      source_system: string;
      normalization_notes: string | null;
    }>(
      `SELECT item_description, specification, quantity, unit, unit_price, currency,
              observed_at, source_system, normalization_notes
         FROM procurement_price_observation
        WHERE tenant_id = ? AND (? IS NULL OR item_description = ?)
        ORDER BY observed_at DESC
        LIMIT 100`,
      [tenantId, item, item],
    );
    return res.json({
      ok: true,
      data: {
        observations,
        marketDataStatus: observations.length ? 'FACT' : 'MARKET_DATA_UNAVAILABLE',
        comparisonWarning: 'Prices are not compared across unmatched specifications or currencies.',
      },
    });
  });

  router.get('/graph/:caseId', async (req, res) => {
    const tenantId = await authorize(req, res, req.params.caseId);
    if (!tenantId) return;
    const row = await deps.db.get<ProcurementCaseRow>(
      'SELECT id, project_id, requirement_id, category, description, estimated_value, currency, procurement_method, lifecycle_stage, tender_id, supplier_id, contract_id, purchase_order_id, source_system, source_record_id, created_at, updated_at FROM procurement_case WHERE tenant_id = ? AND id = ?',
      [tenantId, req.params.caseId],
    );
    if (!row) return fail(res, 404, 'NOT_FOUND', 'Procurement case not found');
    const ids = new Set([row.id, row.project_id, row.requirement_id, row.tender_id, row.supplier_id, row.contract_id].filter((id): id is string => Boolean(id)));
    const graph = {
      nodes: deps.kg.nodes.filter(node => ids.has(node.id) && node.properties?.tenantId === tenantId),
      edges: deps.kg.edges.filter(edge => ids.has(edge.source) && ids.has(edge.target)),
    };
    return res.json({
      ok: true,
      data: {
        graph,
        dataStatus: graph.nodes.length || graph.edges.length ? 'FACT' : 'UNAVAILABLE',
        confidentialBidData: 'NOT_EXPOSED',
      },
    });
  });

  return router;
}
