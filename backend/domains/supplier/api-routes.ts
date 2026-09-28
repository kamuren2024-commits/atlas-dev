import express, { type Request, type Response } from 'express';
import type { DatabaseCore } from '../../database/db-core';
import type { KnowledgeGraph } from '../../evaluation/knowledge-graph';
import { AuthorizationService } from '../../security/authorization-service';
import type { AuditLogger } from '../../observability/audit-logger';
import { calculateSupplierPerformance } from './intelligence';

export interface SupplierApiDeps {
  db: DatabaseCore;
  kg: KnowledgeGraph;
  authz: AuthorizationService;
  audit: AuditLogger;
}

function fail(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ ok: false, error: { code, message } });
}

function ok(res: Response, data: unknown) {
  return res.status(200).json({ ok: true, data });
}

export function createSupplierApiRouter(deps: SupplierApiDeps): express.Router {
  const router = express.Router();

  router.get('/', async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId || 'ketraco';
    if (!(await deps.authz.check((req as any).userId, 'supplier', 'read', { tenantId }))) {
      return fail(res, 403, 'UNAUTHORIZED', 'Not authorized to read suppliers');
    }
    const suppliers = deps.kg.nodes
      .filter(node => node.type === 'SUPPLIER' && node.properties?.tenantId === tenantId)
      .map(node => ({ id: node.id, name: node.label, properties: node.properties }));
    deps.audit.log({
      actor: (req as any).userId || 'system',
      action: 'supplier:list:get',
      resourceType: 'supplier',
      resourceId: tenantId,
      status: 'completed',
      metadata: { count: suppliers.length },
    });
    return ok(res, { suppliers, source: 'knowledge-graph', dataStatus: suppliers.length ? 'FACT' : 'UNAVAILABLE' });
  });

  router.get('/:supplierId/intelligence', async (req: Request, res: Response) => {
    const tenantId = (req as any).tenantId || 'ketraco';
    const supplierId = req.params.supplierId;
    if (!(await deps.authz.check((req as any).userId, 'supplier', 'read', { tenantId, resourceId: supplierId }))) {
      return fail(res, 403, 'UNAUTHORIZED', 'Not authorized to read supplier intelligence');
    }

    const supplier = deps.kg.nodes.find(node =>
      node.id === supplierId && node.type === 'SUPPLIER' && node.properties?.tenantId === tenantId,
    );
    if (!supplier) return fail(res, 404, 'NOT_FOUND', 'Supplier not found');

    const orderStats = await deps.db.get<{ total: number; delivered: number; delayed: number }>(
      `SELECT COUNT(*) as total,
              SUM(CASE WHEN status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered,
              SUM(CASE WHEN status = 'IN_TRANSIT' AND estimated_arrival < datetime('now') THEN 1 ELSE 0 END) as delayed
         FROM logistics_order
        WHERE tenant_id = ? AND supplier_id = ?`,
      [tenantId, supplierId],
    );
    const relationships = deps.kg.edges.filter(edge => edge.source === supplierId || edge.target === supplierId);
    const performance = calculateSupplierPerformance({
      totalOrders: Number(orderStats?.total || 0),
      deliveredOrders: Number(orderStats?.delivered || 0),
      delayedOrders: Number(orderStats?.delayed || 0),
    });
    const response = {
      supplier: { id: supplier.id, name: supplier.label, properties: supplier.properties },
      relationships,
      performance,
      evidence: {
        status: 'FACT',
        sources: ['knowledge-graph', 'logistics_order'],
        generatedAt: new Date().toISOString(),
      },
      actions: {
        automated: false,
        note: 'Awards, suspension, disqualification, payment and contractual actions require human approval.',
      },
    };
    deps.audit.log({
      actor: (req as any).userId || 'system',
      action: 'supplier:intelligence:get',
      resourceType: 'supplier',
      resourceId: supplierId,
      status: 'completed',
      metadata: { tenantId, performanceStatus: performance.status },
    });
    return ok(res, response);
  });

  return router;
}

export * from './intelligence';
