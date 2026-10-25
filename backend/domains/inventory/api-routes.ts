// Inventory operations extend the existing tenant-scoped Atlas inventory domain.

import express, { type Request, type Response } from 'express';
import type { DatabaseCore } from '../../database/db-core';
import { AuthorizationService } from '../../security/authorization-service';
import type { AuditLogger } from '../../observability/audit-logger';
import { ApiGatewayMiddleware } from '../../security/api-gateway-middleware';
import { InventoryOperationsService, InventoryOperationError } from './operations-service';
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
  const operations = new InventoryOperationsService(db);
  const authorizeAction = (req: Request, res: Response, action: string): boolean => {
    const tenantId = req.user?.tenantId;
    const decision = authz.evaluate(req.user!, action, 'inventory', { tenantId });
    if (!decision.isAuthorized) {
      res.status(403).json({ ok: false, error: { code: 'INVENTORY_ACTION_DENIED', message: `The inventory ${action} permission is required.`, requestId: (req as any).correlationId } });
      return false;
    }
    return true;
  };
  const respondOperationError = (req: Request, res: Response, error: unknown, fallbackMessage: string): void => {
    if (error instanceof InventoryOperationError) {
      res.status(error.status).json({ ok: false, error: { code: error.code, message: error.message, requestId: (req as any).correlationId } });
      return;
    }
    res.status(500).json({ ok: false, error: { code: 'INVENTORY_OPERATION_FAILED', message: fallbackMessage, requestId: (req as any).correlationId } });
  };
  const requestIdempotencyKey = (req: Request): string => {
    const header = req.get('Idempotency-Key')?.trim();
    const body = typeof req.body?.idempotencyKey === 'string' ? req.body.idempotencyKey.trim() : '';
    if (header && body && header !== body) throw new InventoryOperationError('Idempotency-Key header and request body do not match.', 400, 'IDEMPOTENCY_KEY_MISMATCH');
    return header || body;
  };
  const logWrite = (req: Request, action: string, resourceId: string, replayed = false): void => {
    if (replayed) return;
    deps.audit.log({
      actorId: req.user!.id,
      action,
      timestamp: new Date().toISOString(),
      attributes: { tenantId: req.user!.tenantId, role: req.user!.role, resourceId, correlationId: (req as any).correlationId, outcome: 'SUCCESS' },
    });
  };

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
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_OVERVIEW_ERROR', message: 'Failed to load inventory overview.', requestId: (req as any).correlationId } });
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
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_POSITIONS_ERROR', message: 'Failed to load inventory positions.', requestId: (req as any).correlationId } });
    }
  });

  router.get('/movements', async (req: Request, res: Response) => {
    try {
      const limit = Number(req.query.limit) || 25;
      const [movementData, activityData] = await Promise.all([
        operations.getMovements((req as any).tenantId, limit),
        service.getMovements((req as any).tenantId, limit),
      ]);
      res.status(200).json({ ok: true, data: { movements: movementData.movements, events: activityData.events }, dataStatus: movementData.dataStatus });
    } catch {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_MOVEMENTS_ERROR', message: 'Failed to load stock movements.', requestId: (req as any).correlationId } });
    }
  });

  router.get('/projects', async (req: Request, res: Response) => {
    try {
      const data = await service.getProjects((req as any).tenantId);
      res.status(200).json({ ok: true, data, dataStatus: data.dataStatus });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_PROJECTS_ERROR', message: 'Failed to load project requirements.', requestId: (req as any).correlationId } });
    }
  });

  router.get('/materials/:sku', async (req: Request, res: Response) => {
    try {
      const sku = String(req.params.sku || '').toUpperCase();
      if (!sku) {
        res.status(400).json({ ok: false, error: { code: 'SKU_REQUIRED', message: 'A material SKU is required.' } });
        return;
      }
      const data = await service.getMaterialDetail((req as any).tenantId, sku);
      if (!data) {
        res.status(404).json({ ok: false, error: { code: 'MATERIAL_NOT_FOUND', message: `No material with SKU ${sku} in this tenant.` } });
        return;
      }
      res.status(200).json({ ok: true, data, dataStatus: data.dataStatus });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_MATERIAL_ERROR', message: 'Failed to load material detail.', requestId: (req as any).correlationId } });
    }
  });

  router.get('/capabilities', (req: Request, res: Response) => {
    const tenantId = req.user!.tenantId;
    const can = (action: string) => authz.evaluate(req.user!, action, 'inventory', { tenantId }).isAuthorized;
    res.status(200).json({ ok: true, data: { canCreate: can('create'), canUpdate: can('update'), canApprove: can('approve'), canReview: can('update') }, dataStatus: 'LIVE' });
  });

  router.get('/facilities', async (req: Request, res: Response) => {
    try {
      const data = await operations.listFacilities((req as any).tenantId);
      res.status(200).json({ ok: true, data, dataStatus: data.dataStatus });
    } catch {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_FACILITIES_ERROR', message: 'Failed to load inventory facilities.', requestId: (req as any).correlationId } });
    }
  });

  router.get('/search', async (req: Request, res: Response) => {
    try {
      const data = await operations.search((req as any).tenantId, req.query.q);
      res.status(200).json({ ok: true, data, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to search authorized inventory records.');
    }
  });

  router.get('/stocktakes', async (req: Request, res: Response) => {
    try {
      const data = await operations.listStocktakes((req as any).tenantId, Number(req.query.limit) || 10);
      res.status(200).json({ ok: true, data, dataStatus: data.dataStatus });
    } catch {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_STOCKTAKES_ERROR', message: 'Failed to load stocktake sessions.', requestId: (req as any).correlationId } });
    }
  });

  router.get('/stocktakes/:id', async (req: Request, res: Response) => {
    try {
      const data = await operations.getStocktake((req as any).tenantId, String(req.params.id));
      if (!data) {
        res.status(404).json({ ok: false, error: { code: 'STOCKTAKE_NOT_FOUND', message: 'Stocktake session was not found.', requestId: (req as any).correlationId } });
        return;
      }
      res.status(200).json({ ok: true, data: { stocktake: data }, dataStatus: 'LIVE' });
    } catch {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_STOCKTAKE_DETAIL_ERROR', message: 'Failed to load stocktake detail.', requestId: (req as any).correlationId } });
    }
  });

  router.get('/approvals', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'approve')) return;
    try {
      const approvals = await operations.getPendingApprovals((req as any).tenantId);
      res.status(200).json({ ok: true, data: { approvals }, dataStatus: 'LIVE' });
    } catch {
      res.status(500).json({ ok: false, error: { code: 'INVENTORY_APPROVALS_ERROR', message: 'Failed to load approval requests.', requestId: (req as any).correlationId } });
    }
  });

  router.post('/materials', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'create')) return;
    try {
      const result = await operations.createMaterial((req as any).tenantId, req.user!.id, { ...req.body, idempotencyKey: requestIdempotencyKey(req) });
      logWrite(req, 'inventory.material.create', result.operation.id, result.replayed);
      res.status(result.replayed ? 200 : 201).json({ ok: true, data: result, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to create the material record.');
    }
  });

  router.post('/movements', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'update')) return;
    try {
      const result = await operations.recordMovement((req as any).tenantId, req.user!.id, { ...req.body, idempotencyKey: requestIdempotencyKey(req) });
      logWrite(req, 'inventory.movement.create', result.operation.id, result.replayed);
      res.status(result.replayed ? 200 : 201).json({ ok: true, data: result, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to post the inventory movement.');
    }
  });

  router.post('/stocktakes', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'create')) return;
    try {
      const result = await operations.startStocktake((req as any).tenantId, req.user!.id, { ...req.body, idempotencyKey: requestIdempotencyKey(req) });
      logWrite(req, 'inventory.stocktake.create', result.stocktake.id, result.replayed);
      res.status(result.replayed ? 200 : 201).json({ ok: true, data: result, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to start the stocktake.');
    }
  });

  router.post('/stocktakes/:id/counts', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'update')) return;
    try {
      const line = await operations.captureCount((req as any).tenantId, req.user!.id, String(req.params.id), { ...req.body, idempotencyKey: requestIdempotencyKey(req) });
      logWrite(req, 'inventory.stocktake.count', line.id);
      res.status(200).json({ ok: true, data: { line }, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to capture the physical count.');
    }
  });

  router.post('/stocktakes/:id/submit', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'update')) return;
    try {
      const stocktake = await operations.submitStocktake((req as any).tenantId, req.user!.id, String(req.params.id), req.body?.reason);
      logWrite(req, 'inventory.stocktake.submit', stocktake.id);
      res.status(200).json({ ok: true, data: { stocktake }, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to submit the stocktake.');
    }
  });

  router.post('/stocktakes/:id/recount', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'update')) return;
    try {
      const stocktake = await operations.requestRecount((req as any).tenantId, req.user!.id, String(req.params.id), req.body?.reason);
      logWrite(req, 'inventory.stocktake.recount', stocktake.id);
      res.status(200).json({ ok: true, data: { stocktake }, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to request a recount.');
    }
  });

  router.post('/stocktakes/:id/reconcile', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'approve')) return;
    try {
      const stocktake = await operations.reconcileStocktake((req as any).tenantId, req.user!.id, String(req.params.id), req.body?.reason);
      logWrite(req, 'inventory.stocktake.reconcile', stocktake.id);
      res.status(200).json({ ok: true, data: { stocktake }, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to reconcile the stocktake.');
    }
  });

  router.post('/adjustments', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'create')) return;
    try {
      const result = await operations.requestAdjustment((req as any).tenantId, req.user!.id, { ...req.body, idempotencyKey: requestIdempotencyKey(req) });
      logWrite(req, 'inventory.adjustment.request', result.operation.id, result.replayed);
      res.status(result.replayed ? 200 : 201).json({ ok: true, data: result, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to create the adjustment request.');
    }
  });

  router.post('/reviews/critical-spares', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'update')) return;
    try {
      const result = await operations.reviewCriticalSpare((req as any).tenantId, req.user!.id, { ...req.body, idempotencyKey: requestIdempotencyKey(req) });
      logWrite(req, 'inventory.critical-spares.review', result.operation.id, result.replayed);
      res.status(result.replayed ? 200 : 201).json({ ok: true, data: result, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to record the critical-spares review.');
    }
  });

  router.post('/operations/:id/approve', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'approve')) return;
    try {
      const operation = await operations.approveOperation((req as any).tenantId, req.user!.id, String(req.params.id), req.body?.reason);
      logWrite(req, 'inventory.operation.approve', operation.id);
      res.status(200).json({ ok: true, data: { operation }, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to approve the inventory operation.');
    }
  });

  router.post('/operations/:id/reject', async (req: Request, res: Response) => {
    if (!authorizeAction(req, res, 'approve')) return;
    try {
      const operation = await operations.rejectOperation((req as any).tenantId, req.user!.id, String(req.params.id), req.body?.reason);
      logWrite(req, 'inventory.operation.reject', operation.id);
      res.status(200).json({ ok: true, data: { operation }, dataStatus: 'LIVE' });
    } catch (err) {
      respondOperationError(req, res, err, 'Failed to reject the inventory operation.');
    }
  });

  return router;
}
