import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import sqlite3 from 'sqlite3';
import type { DatabaseCore } from '../database/db-core';
import { InventoryOperationsMigration } from '../database/migration-017-inventory-operations';
import { LogisticsDomainMigration } from '../database/migration-004-logistics-domain';
import { createInventoryApiRouter } from '../domains/inventory/api-routes';
import { InventoryOperationError, InventoryOperationsService } from '../domains/inventory/operations-service';
import { AuthorizationService } from '../security/authorization-service';
import { IdentityService, type UserIdentity } from '../security/identity-service';

class InMemorySqliteDatabase {
  private readonly connection = new sqlite3.Database(':memory:');

  run(sql: string, params: unknown[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      this.connection.run(sql, params, function (error) {
        if (error) reject(error);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  get<T = unknown>(sql: string, params: unknown[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.connection.get(sql, params, (error, row) => error ? reject(error) : resolve(row as T | undefined));
    });
  }

  all<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.connection.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows as T[]));
    });
  }

  exec(sql: string): Promise<void> {
    return new Promise((resolve, reject) => this.connection.exec(sql, (error) => error ? reject(error) : resolve()));
  }

  async withTransaction<T>(work: () => Promise<T>): Promise<T> {
    await this.exec('BEGIN IMMEDIATE');
    try {
      const result = await work();
      await this.exec('COMMIT');
      return result;
    } catch (error) {
      await this.exec('ROLLBACK');
      throw error;
    }
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => this.connection.close((error) => error ? reject(error) : resolve()));
  }
}

test('inventory movements, stocktakes, approvals, tenant scoping, and audit events persist atomically', async () => {
  const database = new InMemorySqliteDatabase();
  const db = database as unknown as DatabaseCore;
  try {
    await db.exec('PRAGMA foreign_keys = ON');
    await LogisticsDomainMigration.apply(db);
    await InventoryOperationsMigration.apply(db);
    const service = new InventoryOperationsService(db);
    const tenantId = 'ketraco';
    const operatorId = 'inventory-operator-1';
    const reviewerId = 'inventory-reviewer-2';
    const sku = 'TEST-INV-2026-001';

    const created = await service.createMaterial(tenantId, operatorId, {
      sku, name: 'Integration Test Conductor', category: 'Conductor', uom: 'M', unitCostKes: 2500, hazmat: false,
      idempotencyKey: 'material-create-test-001',
    });
    assert.equal(created.operation.status, 'POSTED');
    assert.equal(created.replayed, false);
    const createReplay = await service.createMaterial(tenantId, operatorId, {
      sku, name: 'Integration Test Conductor', category: 'Conductor', uom: 'M', unitCostKes: 2500, hazmat: false,
      idempotencyKey: 'material-create-test-001',
    });
    assert.equal(createReplay.replayed, true);
    assert.equal(createReplay.operation.id, created.operation.id);

    const receipt = await service.recordMovement(tenantId, operatorId, {
      type: 'GOODS_RECEIPT', sku, quantity: 10, facilityId: 'fac-001', reason: 'Verified inbound delivery receipt',
      idempotencyKey: 'movement-receipt-test-001',
    });
    assert.equal(receipt.operation.status, 'POSTED');
    const receiptReplay = await service.recordMovement(tenantId, operatorId, {
      type: 'GOODS_RECEIPT', sku, quantity: 10, facilityId: 'fac-001', reason: 'Verified inbound delivery receipt',
      idempotencyKey: 'movement-receipt-test-001',
    });
    assert.equal(receiptReplay.replayed, true);

    const issue = await service.recordMovement(tenantId, operatorId, {
      type: 'GOODS_ISSUE', sku, quantity: 3, facilityId: 'fac-001', reason: 'Approved field issue reference',
      idempotencyKey: 'movement-issue-test-001',
    });
    assert.equal(issue.operation.type, 'GOODS_ISSUE');

    const transfer = await service.recordMovement(tenantId, operatorId, {
      type: 'TRANSFER', sku, quantity: 2, facilityId: 'fac-001', destinationFacilityId: 'fac-002',
      reason: 'Approved depot balancing request', idempotencyKey: 'movement-transfer-test-001',
    });
    assert.equal(transfer.operation.destinationFacilityId, 'fac-002');

    const product = await db.get<{ id: string }>(`SELECT id FROM logistics_product WHERE tenant_id = ? AND sku = ?`, [tenantId, sku]);
    assert.ok(product);
    const originBalance = await db.get<{ quantity: number }>(
      `SELECT quantity FROM logistics_stock WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`,
      [tenantId, product.id, 'fac-001'],
    );
    const destinationBalance = await db.get<{ quantity: number }>(
      `SELECT quantity FROM logistics_stock WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`,
      [tenantId, product.id, 'fac-002'],
    );
    assert.equal(originBalance?.quantity, 5);
    assert.equal(destinationBalance?.quantity, 2);

    await assert.rejects(
      service.recordMovement(tenantId, operatorId, {
        type: 'GOODS_ISSUE', sku, quantity: 99, facilityId: 'fac-001', reason: 'Must not overdraw available inventory',
        idempotencyKey: 'movement-overdraw-test-001',
      }),
      (error: unknown) => error instanceof InventoryOperationError && error.code === 'INSUFFICIENT_AVAILABLE_STOCK',
    );
    const afterRejectedIssue = await db.get<{ quantity: number }>(
      `SELECT quantity FROM logistics_stock WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`,
      [tenantId, product.id, 'fac-001'],
    );
    assert.equal(afterRejectedIssue?.quantity, 5);

    const started = await service.startStocktake(tenantId, operatorId, {
      facilityId: 'fac-001', reason: 'Cycle count for integration verification', idempotencyKey: 'stocktake-start-test-001',
    });
    assert.equal(started.stocktake.status, 'IN_PROGRESS');
    let detail = await service.getStocktake(tenantId, started.stocktake.id);
    assert.ok(detail);
    const testLine = detail.lines.find((line) => line.sku === sku && line.facilityId === 'fac-001');
    assert.ok(testLine);

    const testLineIndex = detail.lines.findIndex((line) => line.id === testLine.id);
    const testCount = Math.max(0, testLine.snapshotQuantity - 1);
    const testCountKey = `count-line-test-${String(testLineIndex).padStart(4, '0')}`;
    for (const [index, line] of detail.lines.entries()) {
      const count = line.id === testLine.id ? testCount : line.snapshotQuantity;
      await service.captureCount(tenantId, operatorId, detail.id, {
        lineId: line.id, countedQuantity: count, idempotencyKey: `count-line-test-${String(index).padStart(4, '0')}`,
      });
    }
    const replayedCount = await service.captureCount(tenantId, operatorId, detail.id, {
      lineId: testLine.id, countedQuantity: testCount, idempotencyKey: testCountKey,
    });
    assert.equal(replayedCount.countedQuantity, testCount);
    await assert.rejects(
      service.captureCount(tenantId, operatorId, detail.id, { lineId: testLine.id, countedQuantity: testCount + 1, idempotencyKey: testCountKey }),
      (error: unknown) => error instanceof InventoryOperationError && error.code === 'IDEMPOTENCY_KEY_CONFLICT',
    );
    detail = await service.getStocktake(tenantId, started.stocktake.id);
    assert.ok(detail);
    assert.equal(detail.capturedCount, detail.lineCount);
    assert.equal(detail.varianceCount, 1);

    const submitted = await service.submitStocktake(tenantId, operatorId, detail.id, 'Count lines verified by integration test');
    assert.equal(submitted.status, 'REVIEW_REQUIRED');
    await assert.rejects(
      service.reconcileStocktake(tenantId, operatorId, detail.id, 'Attempted self-approval'),
      (error: unknown) => error instanceof InventoryOperationError && error.code === 'SEGREGATION_OF_DUTIES',
    );
    await db.run(`UPDATE logistics_stock SET quantity = 6 WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`, [tenantId, product.id, 'fac-001']);
    await assert.rejects(
      service.reconcileStocktake(tenantId, reviewerId, detail.id, 'Reject stale count snapshot'),
      (error: unknown) => error instanceof InventoryOperationError && error.code === 'STOCK_CONFLICT',
    );
    const concurrentBalance = await db.get<{ quantity: number }>(`SELECT quantity FROM logistics_stock WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`, [tenantId, product.id, 'fac-001']);
    assert.equal(concurrentBalance?.quantity, 6);
    await db.run(`UPDATE logistics_stock SET quantity = 5 WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`, [tenantId, product.id, 'fac-001']);
    const reconciled = await service.reconcileStocktake(tenantId, reviewerId, detail.id, 'Independent variance reconciliation');
    assert.equal(reconciled.status, 'RECONCILED');
    const reconciledBalance = await db.get<{ quantity: number }>(
      `SELECT quantity FROM logistics_stock WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`,
      [tenantId, product.id, 'fac-001'],
    );
    assert.equal(reconciledBalance?.quantity, 4);
    await db.run(
      `INSERT INTO logistics_stock (id, tenant_id, facility_id, product_id, quantity, reserved, bin_location) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['stock-multi-bin-test', tenantId, 'fac-001', product.id, 1, 0, 'BIN-SECOND'],
    );
    await assert.rejects(
      service.requestAdjustment(tenantId, operatorId, {
        sku, facilityId: 'fac-001', targetQuantity: 8, reason: 'Ambiguous multi-bin positions must fail closed',
        idempotencyKey: 'adjustment-multi-bin-test-001',
      }),
      (error: unknown) => error instanceof InventoryOperationError && error.code === 'MULTIPLE_STOCK_POSITIONS',
    );
    await db.run(`DELETE FROM logistics_stock WHERE id = ?`, ['stock-multi-bin-test']);

    const adjustment = await service.requestAdjustment(tenantId, operatorId, {
      sku, facilityId: 'fac-001', targetQuantity: 8, reason: 'Approved record correction evidence',
      idempotencyKey: 'adjustment-request-test-001',
    });
    assert.equal(adjustment.operation.status, 'PENDING_APPROVAL');
    const pendingBalance = await db.get<{ quantity: number }>(
      `SELECT quantity FROM logistics_stock WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`,
      [tenantId, product.id, 'fac-001'],
    );
    assert.equal(pendingBalance?.quantity, 4);
    await assert.rejects(
      service.approveOperation(tenantId, operatorId, adjustment.operation.id, 'Attempted self-approval'),
      (error: unknown) => error instanceof InventoryOperationError && error.code === 'SEGREGATION_OF_DUTIES',
    );
    await db.run(`UPDATE logistics_stock SET quantity = 5 WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`, [tenantId, product.id, 'fac-001']);
    await assert.rejects(
      service.approveOperation(tenantId, reviewerId, adjustment.operation.id, 'Reject stale adjustment snapshot'),
      (error: unknown) => error instanceof InventoryOperationError && error.code === 'STOCK_POSITION_CHANGED',
    );
    await db.run(`UPDATE logistics_stock SET quantity = 4 WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`, [tenantId, product.id, 'fac-001']);
    const approved = await service.approveOperation(tenantId, reviewerId, adjustment.operation.id, 'Independent adjustment approval');
    assert.equal(approved.status, 'APPROVED');
    const approvedBalance = await db.get<{ quantity: number }>(
      `SELECT quantity FROM logistics_stock WHERE tenant_id = ? AND product_id = ? AND facility_id = ?`,
      [tenantId, product.id, 'fac-001'],
    );
    assert.equal(approvedBalance?.quantity, 8);

    const review = await service.reviewCriticalSpare(tenantId, operatorId, {
      sku, classification: 'CRITICAL', rationale: 'Criticality supported by an approved project record',
      idempotencyKey: 'critical-review-test-001',
    });
    assert.equal(review.operation.type, 'CRITICAL_SPARES_REVIEW');
    const search = await service.search(tenantId, sku);
    assert.ok(search.items.some((item) => item.kind === 'material' && item.subLabel.includes(sku)));
    assert.equal((await service.getMovements('another-tenant')).movements.length, 0);
    assert.equal(await service.getStocktake('another-tenant', detail.id), null);

    const movementCount = await db.get<{ count: number }>(
      `SELECT COUNT(*) AS count FROM logistics_movement WHERE tenant_id = ?`, [tenantId],
    );
    const eventCount = await db.get<{ count: number }>(
      `SELECT COUNT(*) AS count FROM logistics_event WHERE tenant_id = ? AND source = 'inventory.operations'`, [tenantId],
    );
    assert.ok((movementCount?.count || 0) >= 4);
    assert.ok((eventCount?.count || 0) >= 8);
  } finally {
    await database.close();
  }
});

test('inventory API enforces authentication, role scope, tenant isolation, and idempotency', { timeout: 30000 }, async (t) => {
  const database = new InMemorySqliteDatabase();
  const db = database as unknown as DatabaseCore;
  await db.exec('PRAGMA foreign_keys = ON');
  await LogisticsDomainMigration.apply(db);
  await InventoryOperationsMigration.apply(db);

  let writeCount = 0;
  const originalRun = database.run.bind(database);
  database.run = async (sql, params = []) => {
    if (/^\\s*(INSERT|UPDATE|DELETE|REPLACE)/i.test(sql)) writeCount += 1;
    return originalRun(sql, params);
  };

  const auditEvents: string[] = [];
  const app = express();
  app.use(express.json());
  app.use('/api/inventory', createInventoryApiRouter({
    db,
    authz: new AuthorizationService(),
    audit: { log: (event: any) => { auditEvents.push(String(event.action)); } },
  }));

  const originalVerifyAccessToken = IdentityService.verifyAccessToken;
  const originalProductionMode = process.env.EVALUATION_OS_PRODUCTION_MODE;
  process.env.EVALUATION_OS_PRODUCTION_MODE = 'false';
  const tokenUsers = new Map<string, UserIdentity>();
  IdentityService.verifyAccessToken = async (token) => tokenUsers.get(token) || null;

  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    IdentityService.verifyAccessToken = originalVerifyAccessToken;
    if (originalProductionMode === undefined) delete process.env.EVALUATION_OS_PRODUCTION_MODE;
    else process.env.EVALUATION_OS_PRODUCTION_MODE = originalProductionMode;
    server.closeAllConnections();
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await database.close();
  });
  if (!server.listening) {
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
  }

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}/api/inventory`;
  const request = (path: string, init?: RequestInit) => fetch(`${baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(10000) });
  const tokenFor = (tenantId: string, role: string) => {
    const token = `inventory-api-${tenantId}-${role}`;
    tokenUsers.set(token, {
      id: token,
      role,
      tenantId,
      accessLevel: 'LEVEL 04',
      clearance: 'Enterprise Clear',
      authenticated: true,
    });
    return token;
  };
  const headersFor = (token: string) => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

  const unauthenticated = await request('/overview');
  assert.equal(unauthenticated.status, 401);
  assert.equal(writeCount, 0);

  const auditorToken = tokenFor('ketraco', 'Auditor');
  const auditorOverview = await request('/overview', { headers: headersFor(auditorToken) });
  assert.equal(auditorOverview.status, 200);
  const auditorCapabilities = await request('/capabilities', { headers: headersFor(auditorToken) });
  const auditorCapabilityData = await auditorCapabilities.json() as any;
  assert.equal(auditorCapabilityData.data.canCreate, false);
  assert.equal(auditorCapabilityData.data.canUpdate, false);
  assert.equal(auditorCapabilityData.data.canApprove, false);

  const deniedWrite = await request('/materials', {
    method: 'POST',
    headers: headersFor(auditorToken),
    body: JSON.stringify({ sku: 'API-INV-DENIED', name: 'Denied test material', category: 'Conductor', uom: 'M', idempotencyKey: 'api-auditor-denied-001' }),
  });
  assert.equal(deniedWrite.status, 403);
  assert.equal((await deniedWrite.json() as any).error.code, 'INVENTORY_ACTION_DENIED');
  assert.equal(writeCount, 0, 'read-only users must be rejected before persistence');

  const operatorToken = tokenFor('ketraco', 'LOGISTICS_OPERATOR');
  const materialSku = `API-INV-${Date.now()}`;
  const materialPayload = {
    sku: materialSku,
    name: 'Inventory API integration conductor',
    category: 'Conductor',
    uom: 'M',
    unitCostKes: 2500,
    hazmat: false,
    idempotencyKey: 'api-material-write-test-001',
  };
  const materialResponse = await request('/materials', {
    method: 'POST', headers: headersFor(operatorToken), body: JSON.stringify(materialPayload),
  });
  assert.equal(materialResponse.status, 201);
  const materialResult = await materialResponse.json() as any;
  assert.equal(materialResult.data.operation.status, 'POSTED');

  const materialReplay = await request('/materials', {
    method: 'POST', headers: headersFor(operatorToken), body: JSON.stringify(materialPayload),
  });
  assert.equal(materialReplay.status, 200);
  const replayResult = await materialReplay.json() as any;
  assert.equal(replayResult.data.replayed, true);
  assert.equal(replayResult.data.operation.id, materialResult.data.operation.id);

  const movementPayload = {
    type: 'GOODS_RECEIPT', sku: materialSku, quantity: 4, facilityId: 'fac-001',
    reason: 'Verified inbound docket for inventory API integration test',
    idempotencyKey: 'api-movement-write-test-001',
  };
  const movementResponse = await request('/movements', {
    method: 'POST', headers: headersFor(operatorToken), body: JSON.stringify(movementPayload),
  });
  assert.equal(movementResponse.status, 201);
  const movementResult = await movementResponse.json() as any;
  assert.equal(movementResult.data.operation.status, 'POSTED');
  const movementReplay = await request('/movements', {
    method: 'POST', headers: headersFor(operatorToken), body: JSON.stringify(movementPayload),
  });
  assert.equal(movementReplay.status, 200);
  assert.equal((await movementReplay.json() as any).data.replayed, true);
  assert.equal(auditEvents.filter((action) => action === 'inventory.material.create').length, 1);
  assert.equal(auditEvents.filter((action) => action === 'inventory.movement.create').length, 1);

  const foreignTenantToken = tokenFor('other-tenant', 'LOGISTICS_OPERATOR');
  const foreignPositions = await request(`/positions?q=${encodeURIComponent(materialSku)}`, { headers: headersFor(foreignTenantToken) });
  assert.equal(foreignPositions.status, 200);
  const foreignData = await foreignPositions.json() as any;
  assert.equal(foreignData.data.total, 0);
});
