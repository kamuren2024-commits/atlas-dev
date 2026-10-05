// GET /api/inventory/* — read-only Slice 1 contract.
// Reuses Atlas kernel: ApiGatewayMiddleware authN, tenant isolation, AuthorizationService.
// Reads are not audit-written (matches logistics read pattern); writes do not exist yet.

import express, { type Request, type Response } from 'express';
import type { DatabaseCore } from '../../database/db-core';
import { AuthorizationService } from '../../security/authorization-service';
import type { AuditLogger } from '../../observability/audit-logger';
import { ApiGatewayMiddleware } from '../../security/api-gateway-middleware';
import { InventoryService } from './service';

export interface InventoryApiDeps {
  db: DatabaseCore;
  authz: AuthorizationService;
  audit: AuditLogger;
}

export function createInventoryApiRouter(deps: InventoryApiDeps): express.Router {
  const router = express.Router();
  const { db, authz } = deps;
  const service = new InventoryService(db);

  router.use(ApiGatewayMiddleware.correlationId);
  router.use((req, res, next) => { void ApiGatewayMiddleware.authenticate(req, res, next); });
  router.use((req: Request, res: Response, next: express.NextFunction) => {
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({ ok: false, error: { code: 'TENANT_CONTEXT_REQUIRED', message: 'Authenticated tenant context is required.' } });
    }
    (req as any).tenantId = tenantId;
    next();
  });
  router.use((req: Request, res: Response, next: express.NextFunction) => {
    const decision = authz.evaluate(req.user!, 'read', 'inventory', { tenantId: req.user!.tenantId });
    if (!decision.isAuthorized) {
      return res.status(403).json({ ok: false, error: { code: 'INVENTORY_ACCESS_DENIED', message: 'You are not authorized to view Inventory Intelligence.', requestId: (req as any).correlationId } });
    }
    next();
  });

  router.get('/overview', async (req: Request, res: Response) => {
    try {
      const data = await service.getOverview((req as any).tenantId);
      res.status(200).json({ ok: true, data, dataStatus: data.dataStatus });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_OVERVIEW_ERROR', message: 'Failed to load inventory overview.', details: err?.message } });
    }
  });

  router.get('/positions', async (req: Request, res: Response) => {
    try {
      const q = typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';
      const facilityId = typeof req.query.facilityId === 'string' ? req.query.facilityId : '';
      const health = typeof req.query.health === 'string' ? req.query.health : '';
      const all = await service.listPositions((req as any).tenantId);
      const filtered = all.filter((p) => {
        if (facilityId && p.facilityId !== facilityId && p.facilityName !== facilityId) return false;
        if (health && health !== 'ALL' && p.health !== health) return false;
        if (q && !`${p.sku} ${p.description} ${p.materialGroup} ${p.facilityName}`.toLowerCase().includes(q)) return false;
        return true;
      });
      void q;
      res.status(200).json({ ok: true, data: { positions: filtered, total: filtered.length }, dataStatus: filtered.length ? 'LIVE' : 'UNAVAILABLE' });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_POSITIONS_ERROR', message: 'Failed to load inventory positions.', details: err?.message } });
    }
  });

  router.get('/movements', async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 25;
      const data = await service.getMovements((req as any).tenantId, limit);
      res.status(200).json({ ok: true, data, dataStatus: data.dataStatus });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_MOVEMENTS_ERROR', message: 'Failed to load stock movements.', details: err?.message } });
    }
  });

  return router;
}
