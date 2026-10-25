import { randomUUID } from 'node:crypto';
import type { DatabaseCore } from '../../database/db-core';
import type {
  DataStatus,
  InventoryFacility,
  InventoryOperationRecord,
  InventorySearchResponse,
  InventorySearchResultItem,
  StocktakeDetail,
  StocktakeLine,
  StocktakeSummary,
} from './types';

const MAX_QUANTITY = 1_000_000;
const MAX_REASON_LENGTH = 500;

export class InventoryOperationError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) {
    super(message);
    this.name = 'InventoryOperationError';
  }
}

type MovementInput = {
  type: 'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'TRANSFER' | 'RETURN';
  sku: string;
  quantity: number;
  facilityId: string;
  destinationFacilityId?: string;
  reason: string;
  idempotencyKey: string;
};

function cleanText(value: unknown, max = 160): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function requireReason(value: unknown): string {
  const reason = cleanText(value, MAX_REASON_LENGTH);
  if (reason.length < 4) throw new InventoryOperationError('A reason of at least 4 characters is required.', 400, 'REASON_REQUIRED');
  return reason;
}

function requireIdempotencyKey(value: unknown): string {
  const key = cleanText(value, 128);
  if (!/^[A-Za-z0-9._:-]{8,128}$/.test(key)) {
    throw new InventoryOperationError('A valid Idempotency-Key is required.', 400, 'IDEMPOTENCY_KEY_REQUIRED');
  }
  return key;
}

function requirePositiveQuantity(value: unknown): number {
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    throw new InventoryOperationError(`Quantity must be a whole number between 1 and ${MAX_QUANTITY.toLocaleString()}.`, 400, 'INVALID_QUANTITY');
  }
  return quantity;
}

function requireCount(value: unknown): number {
  const quantity = Number(value);
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
    throw new InventoryOperationError(`Count must be a whole number between 0 and ${MAX_QUANTITY.toLocaleString()}.`, 400, 'INVALID_COUNT');
  }
  return quantity;
}

function makeReference(prefix: string, id: string): string {
  const stamp = new Date().toISOString().replace(/\D/g, '').slice(0, 14);
  return `${prefix}-${stamp}-${id.slice(0, 6).toUpperCase()}`;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

function quoteIdentifier(value: string): string {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new InventoryOperationError('Unsupported data source.', 400, 'INVALID_SOURCE');
  return `"${value}"`;
}

export class InventoryOperationsService {
  constructor(private readonly db: DatabaseCore) {}

  private async tableExists(name: string): Promise<boolean> {
    const row = await this.db.get<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?", [name]);
    return Boolean(row);
  }

  private async tableColumns(name: string): Promise<Set<string>> {
    const rows = await this.db.all<{ name: string }>(`PRAGMA table_info(${quoteIdentifier(name)})`);
    return new Set(rows.map((row) => row.name));
  }

  private async writeEvent(
    tenantId: string,
    eventType: string,
    message: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown>,
    severity = 'INFO',
  ): Promise<void> {
    await this.db.run(
      `INSERT INTO logistics_event (id, tenant_id, event_type, severity, source, message, entity_type, entity_id, metadata_json)
       VALUES (?, ?, ?, ?, 'inventory.operations', ?, ?, ?, ?)`,
      [randomUUID(), tenantId, eventType, severity, message, entityType, entityId, JSON.stringify(metadata)],
    );
  }

  private async findOperationByKey(tenantId: string, idempotencyKey: string): Promise<InventoryOperationRecord | null> {
    const row = await this.db.get<any>(
      `SELECT id FROM inventory_operations WHERE tenant_id = ? AND idempotency_key = ?`,
      [tenantId, idempotencyKey],
    );
    return row ? this.getOperation(tenantId, String(row.id)) : null;
  }

  async getOperation(tenantId: string, id: string): Promise<InventoryOperationRecord | null> {
    const row = await this.db.get<any>(
      `SELECT o.id, o.reference, o.operation_type, o.status, o.sku, o.quantity, o.facility_id,
              o.destination_facility_id, o.created_by, o.approved_by, o.reason, o.created_at, o.updated_at,
              p.name AS description, p.unit_of_measure AS uom,
              f.name AS facility_name, d.name AS destination_facility_name
       FROM inventory_operations o
       LEFT JOIN logistics_product p ON p.id = o.product_id AND p.tenant_id = o.tenant_id
       LEFT JOIN logistics_facility f ON f.id = o.facility_id AND f.tenant_id = o.tenant_id
       LEFT JOIN logistics_facility d ON d.id = o.destination_facility_id AND d.tenant_id = o.tenant_id
       WHERE o.tenant_id = ? AND o.id = ? LIMIT 1`,
      [tenantId, id],
    );
    return row ? this.mapOperation(row) : null;
  }

  private mapOperation(row: any): InventoryOperationRecord {
    return {
      id: String(row.id), reference: String(row.reference), type: String(row.operation_type), status: String(row.status),
      sku: row.sku == null ? null : String(row.sku), description: row.description == null ? null : String(row.description),
      quantity: row.quantity == null ? null : Number(row.quantity), uom: row.uom == null ? null : String(row.uom),
      facilityId: row.facility_id == null ? null : String(row.facility_id),
      facilityName: row.facility_name == null ? null : String(row.facility_name),
      destinationFacilityId: row.destination_facility_id == null ? null : String(row.destination_facility_id),
      destinationFacilityName: row.destination_facility_name == null ? null : String(row.destination_facility_name),
      actorId: String(row.created_by), approverId: row.approved_by == null ? null : String(row.approved_by),
      reason: String(row.reason), createdAt: String(row.created_at), updatedAt: String(row.updated_at),
    };
  }

  private async getProduct(tenantId: string, sku: string): Promise<any | null> {
    return (await this.db.get<any>(
      `SELECT id, sku, name, category, unit_of_measure, unit_cost, status, hazmat
       FROM logistics_product WHERE tenant_id = ? AND UPPER(sku) = UPPER(?) LIMIT 1`,
      [tenantId, sku],
    )) || null;
  }

  private async requireFacility(tenantId: string, facilityId: string): Promise<any> {
    const row = await this.db.get<any>(
      `SELECT id, code, name FROM logistics_facility WHERE tenant_id = ? AND id = ? LIMIT 1`,
      [tenantId, facilityId],
    );
    if (!row) throw new InventoryOperationError('The selected facility is not available in this tenant.', 404, 'FACILITY_NOT_FOUND');
    return row;
  }

  async listFacilities(tenantId: string): Promise<{ facilities: InventoryFacility[]; dataStatus: DataStatus }> {
    if (!(await this.tableExists('logistics_facility'))) return { facilities: [], dataStatus: 'UNAVAILABLE' };
    const columns = await this.tableColumns('logistics_facility');
    if (!columns.has('tenant_id') || !columns.has('id') || !columns.has('name')) return { facilities: [], dataStatus: 'UNAVAILABLE' };
    const select = (name: string, alias = name) => columns.has(name) ? `f.${quoteIdentifier(name)} AS ${quoteIdentifier(alias)}` : `NULL AS ${quoteIdentifier(alias)}`;
    const rows = await this.db.all<any>(
      `SELECT ${select('id')}, ${select('code')}, ${select('name')}, ${select('city')},
              ${select('facility_type', 'facility_type')}, ${select('status', 'operational_status')},
              ${select('latitude')}, ${select('longitude')}, ${select('current_stock')}, ${select('capacity')}
       FROM logistics_facility f WHERE f.tenant_id = ? ORDER BY f.name ASC LIMIT 500`,
      [tenantId],
    );
    return {
      facilities: rows.map((row) => ({
        id: String(row.id), code: String(row.code || row.id), name: String(row.name), city: row.city == null ? null : String(row.city),
        facilityType: row.facility_type == null ? null : String(row.facility_type),
        operationalStatus: row.operational_status == null ? null : String(row.operational_status),
        latitude: row.latitude == null ? null : Number(row.latitude), longitude: row.longitude == null ? null : Number(row.longitude),
        currentStock: row.current_stock == null ? null : Number(row.current_stock), capacity: row.capacity == null ? null : Number(row.capacity),
        sourceTable: 'logistics_facility' as const,
      })),
      dataStatus: rows.length ? 'LIVE' : 'UNAVAILABLE',
    };
  }

  async createMaterial(tenantId: string, actorId: string, input: {
    sku: unknown; name: unknown; category: unknown; uom: unknown; unitCostKes?: unknown; hazmat?: unknown; idempotencyKey: unknown;
  }): Promise<{ operation: InventoryOperationRecord; replayed: boolean }> {
    const sku = cleanText(input.sku, 64).toUpperCase();
    const name = cleanText(input.name, 180);
    const category = cleanText(input.category, 80);
    const uom = cleanText(input.uom, 12).toUpperCase();
    const key = requireIdempotencyKey(input.idempotencyKey);
    const hazmat = input.hazmat === true;
    const unitCost = input.unitCostKes == null || input.unitCostKes === '' ? null : Number(input.unitCostKes);
    if (!/^[A-Z0-9][A-Z0-9._/-]{0,63}$/.test(sku) || !name || !category || !uom) {
      throw new InventoryOperationError('SKU, material name, category, and unit of measure are required.', 400, 'MATERIAL_FIELDS_REQUIRED');
    }
    if (unitCost !== null && (!Number.isFinite(unitCost) || unitCost < 0 || unitCost > 1_000_000_000)) {
      throw new InventoryOperationError('Unit cost must be a valid non-negative KES amount.', 400, 'INVALID_UNIT_COST');
    }

    return this.db.withTransaction(async () => {
      const replay = await this.findOperationByKey(tenantId, key);
      if (replay) return { operation: replay, replayed: true };
      if (await this.getProduct(tenantId, sku)) throw new InventoryOperationError('That SKU already exists in this tenant.', 409, 'SKU_ALREADY_EXISTS');
      const id = randomUUID();
      const operationId = randomUUID();
      const status = hazmat ? 'PENDING_APPROVAL' : 'POSTED';
      const productStatus = hazmat ? 'PENDING_APPROVAL' : 'ACTIVE';
      await this.db.run(
        `INSERT INTO logistics_product (id, tenant_id, name, sku, product_type, category, unit_of_measure, unit_cost, status, hazmat)
         VALUES (?, ?, ?, ?, 'GENERAL', ?, ?, ?, ?, ?)`,
        [id, tenantId, name, sku, category, uom, unitCost, productStatus, hazmat ? 1 : 0],
      );
      await this.insertOperation({
        id: operationId, tenantId, type: 'MATERIAL_CREATED', status, key, actorId,
        productId: id, sku, reason: hazmat ? 'Hazardous material onboarding; approval required.' : 'Material master created.',
        metadata: { category, uom, unitCostKes: unitCost, hazmat },
      });
      await this.writeEvent(tenantId, 'INVENTORY_MATERIAL_CREATED', `Material master ${sku} created.`, 'inventory_operation', operationId,
        { productId: id, sku, hazmat, approvalRequired: hazmat, actorId });
      const operation = await this.getOperation(tenantId, operationId);
      if (!operation) throw new InventoryOperationError('The material record could not be reloaded after creation.', 500, 'MATERIAL_RELOAD_FAILED');
      return { operation, replayed: false };
    });
  }

  async recordMovement(tenantId: string, actorId: string, input: MovementInput): Promise<{ operation: InventoryOperationRecord; replayed: boolean }> {
    const sku = cleanText(input.sku, 64).toUpperCase();
    const quantity = requirePositiveQuantity(input.quantity);
    const reason = requireReason(input.reason);
    const key = requireIdempotencyKey(input.idempotencyKey);
    const facilityId = cleanText(input.facilityId, 128);
    const destinationFacilityId = cleanText(input.destinationFacilityId, 128);
    if (!sku || !facilityId) throw new InventoryOperationError('Material SKU and facility are required.', 400, 'MOVEMENT_FIELDS_REQUIRED');
    if (!['GOODS_RECEIPT', 'GOODS_ISSUE', 'TRANSFER', 'RETURN'].includes(input.type)) {
      throw new InventoryOperationError('Unsupported inventory movement.', 400, 'UNSUPPORTED_MOVEMENT');
    }
    if (input.type === 'TRANSFER' && (!destinationFacilityId || destinationFacilityId === facilityId)) {
      throw new InventoryOperationError('Choose two different facilities for a transfer.', 400, 'TRANSFER_DESTINATION_REQUIRED');
    }

    return this.db.withTransaction(async () => {
      const replay = await this.findOperationByKey(tenantId, key);
      if (replay) return { operation: replay, replayed: true };
      const product = await this.getProduct(tenantId, sku);
      if (!product) throw new InventoryOperationError('Material SKU was not found in this tenant.', 404, 'MATERIAL_NOT_FOUND');
      if (String(product.status).toUpperCase() !== 'ACTIVE') {
        throw new InventoryOperationError('This material is not approved for inventory movement.', 409, 'MATERIAL_NOT_ACTIVE');
      }
      await this.requireFacility(tenantId, facilityId);
      if (input.type === 'TRANSFER') await this.requireFacility(tenantId, destinationFacilityId);

      const stockChanges: Array<{ stockId: string; facilityId: string; before: number; after: number }> = [];
      let originFacilityId: string | null = null;
      let targetFacilityId: string | null = null;
      if (input.type === 'GOODS_RECEIPT' || input.type === 'RETURN') {
        targetFacilityId = facilityId;
        stockChanges.push(...await this.addStock(tenantId, product.id, facilityId, quantity));
      } else {
        originFacilityId = facilityId;
        const consumed = await this.consumeStock(tenantId, product.id, facilityId, quantity);
        stockChanges.push(...consumed);
        if (input.type === 'TRANSFER') {
          targetFacilityId = destinationFacilityId;
          stockChanges.push(...await this.addStock(tenantId, product.id, destinationFacilityId, quantity));
        }
      }

      const operationId = randomUUID();
      const operationFacilityId = originFacilityId || targetFacilityId;
      await this.insertOperation({
        id: operationId, tenantId, type: input.type, status: 'POSTED', key, actorId,
        productId: String(product.id), sku, quantity, facilityId: operationFacilityId,
        destinationFacilityId: input.type === 'TRANSFER' ? destinationFacilityId : null,
        reason, metadata: { stockChanges, originFacilityId, destinationFacilityId: targetFacilityId },
      });
      const movementId = randomUUID();
      const movementType = input.type === 'GOODS_ISSUE' ? 'OUTBOUND' : input.type === 'TRANSFER' ? 'TRANSFER' : 'INBOUND';
      await this.db.run(
        `INSERT INTO logistics_movement (id, tenant_id, movement_number, movement_type, status, origin_facility_id,
          destination_facility_id, item_count, notes)
         VALUES (?, ?, ?, ?, 'COMPLETED', ?, ?, ?, ?)`,
        [movementId, tenantId, makeReference('MOV', operationId), movementType, originFacilityId, targetFacilityId, quantity, reason],
      );
      await this.writeEvent(tenantId, `INVENTORY_${input.type}`, `${input.type.replaceAll('_', ' ')} · ${sku} · ${quantity} ${String(product.unit_of_measure || 'PCS')}.`,
        'inventory_operation', operationId, { sku, productId: product.id, quantity, uom: product.unit_of_measure || 'PCS', facilityId, destinationFacilityId: targetFacilityId, reason, actorId, stockChanges });
      const operation = await this.getOperation(tenantId, operationId);
      if (!operation) throw new InventoryOperationError('The movement could not be reloaded after posting.', 500, 'MOVEMENT_RELOAD_FAILED');
      return { operation, replayed: false };
    });
  }

  private async insertOperation(input: {
    id: string; tenantId: string; type: string; status: string; key: string; actorId: string;
    productId?: string | null; sku?: string | null; quantity?: number | null; facilityId?: string | null;
    destinationFacilityId?: string | null; reason: string; metadata?: Record<string, unknown>;
  }): Promise<void> {
    await this.db.run(
      `INSERT INTO inventory_operations (id, tenant_id, reference, operation_type, status, idempotency_key, created_by,
        facility_id, destination_facility_id, product_id, sku, quantity, reason, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [input.id, input.tenantId, makeReference(input.type === 'PHYSICAL_COUNT' ? 'STK' : 'INV', input.id), input.type,
        input.status, input.key, input.actorId, input.facilityId || null, input.destinationFacilityId || null,
        input.productId || null, input.sku || null, input.quantity ?? null, input.reason,
        JSON.stringify(input.metadata || {})],
    );
  }

  private async stockRows(tenantId: string, productId: string, facilityId: string): Promise<any[]> {
    return this.db.all<any>(
      `SELECT id, quantity, reserved, bin_location FROM logistics_stock
       WHERE tenant_id = ? AND product_id = ? AND facility_id = ? ORDER BY bin_location ASC, id ASC`,
      [tenantId, productId, facilityId],
    );
  }

  private async consumeStock(tenantId: string, productId: string, facilityId: string, quantity: number): Promise<Array<{ stockId: string; facilityId: string; before: number; after: number }>> {
    const rows = await this.stockRows(tenantId, productId, facilityId);
    let remaining = quantity;
    const changes: Array<{ stockId: string; facilityId: string; before: number; after: number }> = [];
    for (const row of rows) {
      const before = Number(row.quantity) || 0;
      const reserved = Number(row.reserved) || 0;
      const take = Math.min(Math.max(0, before - reserved), remaining);
      if (!take) continue;
      const result = await this.db.run(
        `UPDATE logistics_stock SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
         WHERE tenant_id = ? AND id = ? AND quantity - reserved >= ?`,
        [take, tenantId, row.id, take],
      );
      if (result.changes !== 1) throw new InventoryOperationError('Stock changed during this operation; refresh and retry.', 409, 'STOCK_CONFLICT');
      changes.push({ stockId: String(row.id), facilityId, before, after: before - take });
      remaining -= take;
      if (remaining === 0) break;
    }
    if (remaining > 0) throw new InventoryOperationError('Available stock is insufficient for this issue or transfer.', 409, 'INSUFFICIENT_AVAILABLE_STOCK');
    return changes;
  }

  private async addStock(tenantId: string, productId: string, facilityId: string, quantity: number): Promise<Array<{ stockId: string; facilityId: string; before: number; after: number }>> {
    const rows = await this.stockRows(tenantId, productId, facilityId);
    if (rows.length) {
      const row = rows[0];
      const before = Number(row.quantity) || 0;
      const result = await this.db.run(
        `UPDATE logistics_stock SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`,
        [quantity, tenantId, row.id],
      );
      if (result.changes !== 1) throw new InventoryOperationError('Stock changed during this operation; refresh and retry.', 409, 'STOCK_CONFLICT');
      return [{ stockId: String(row.id), facilityId, before, after: before + quantity }];
    }
    const stockId = randomUUID();
    await this.db.run(
      `INSERT INTO logistics_stock (id, tenant_id, facility_id, product_id, quantity, reserved, status)
       VALUES (?, ?, ?, ?, ?, 0, 'AVAILABLE')`,
      [stockId, tenantId, facilityId, productId, quantity],
    );
    return [{ stockId, facilityId, before: 0, after: quantity }];
  }

  async getMovements(tenantId: string, limit = 25): Promise<{ movements: InventoryOperationRecord[]; dataStatus: DataStatus }> {
    if (!(await this.tableExists('inventory_operations'))) return { movements: [], dataStatus: 'UNAVAILABLE' };
    const safeLimit = Math.min(Math.max(Math.trunc(limit) || 25, 1), 100);
    const rows = await this.db.all<any>(
      `SELECT id, reference, operation_type, status, sku, quantity, facility_id, destination_facility_id,
              created_by, approved_by, reason, created_at, updated_at
       FROM inventory_operations WHERE tenant_id = ? AND operation_type <> 'PHYSICAL_COUNT'
       ORDER BY created_at DESC LIMIT ?`,
      [tenantId, safeLimit],
    );
    const movements: InventoryOperationRecord[] = [];
    for (const row of rows) {
      const operation = await this.getOperation(tenantId, String(row.id));
      if (operation) movements.push(operation);
    }
    return { movements, dataStatus: 'LIVE' };
  }

  async startStocktake(tenantId: string, actorId: string, input: { facilityId?: unknown; reason: unknown; idempotencyKey: unknown }): Promise<{ stocktake: StocktakeSummary; replayed: boolean }> {
    const key = requireIdempotencyKey(input.idempotencyKey);
    const reason = requireReason(input.reason);
    const facilityId = cleanText(input.facilityId, 128) || null;
    return this.db.withTransaction(async () => {
      const replay = await this.findOperationByKey(tenantId, key);
      if (replay) {
        const stocktake = await this.getStocktake(tenantId, replay.id);
        if (!stocktake) throw new InventoryOperationError('The existing request is not a stocktake.', 409, 'IDEMPOTENCY_KEY_CONFLICT');
        return { stocktake, replayed: true };
      }
      if (facilityId) await this.requireFacility(tenantId, facilityId);
      const rows = await this.db.all<any>(
        `SELECT s.id AS stock_id, s.product_id, s.facility_id, s.quantity, s.bin_location,
                p.sku, p.name, f.name AS facility_name
         FROM logistics_stock s
         JOIN logistics_product p ON p.id = s.product_id AND p.tenant_id = s.tenant_id
         JOIN logistics_facility f ON f.id = s.facility_id AND f.tenant_id = s.tenant_id
         WHERE s.tenant_id = ? ${facilityId ? 'AND s.facility_id = ?' : ''}
         ORDER BY f.name, p.sku, s.bin_location`,
        facilityId ? [tenantId, facilityId] : [tenantId],
      );
      if (!rows.length) throw new InventoryOperationError('No stock positions are available for a count session.', 409, 'NO_STOCK_POSITIONS');
      const id = randomUUID();
      await this.insertOperation({ id, tenantId, type: 'PHYSICAL_COUNT', status: 'IN_PROGRESS', key, actorId, facilityId, reason,
        metadata: { lineCount: rows.length } });
      for (const row of rows) {
        await this.db.run(
          `INSERT INTO inventory_count_lines (id, tenant_id, operation_id, stock_id, product_id, snapshot_quantity, line_status)
           VALUES (?, ?, ?, ?, ?, ?, 'PENDING')`,
          [randomUUID(), tenantId, id, row.stock_id, row.product_id, Number(row.quantity) || 0],
        );
      }
      await this.writeEvent(tenantId, 'INVENTORY_STOCKTAKE_STARTED', `Stocktake started for ${rows.length} stock positions.`,
        'inventory_operation', id, { facilityId, lineCount: rows.length, actorId, reason });
      const stocktake = await this.getStocktake(tenantId, id);
      if (!stocktake) throw new InventoryOperationError('The stocktake could not be reloaded after creation.', 500, 'STOCKTAKE_RELOAD_FAILED');
      return { stocktake, replayed: false };
    });
  }

  async listStocktakes(tenantId: string, limit = 10): Promise<{ stocktakes: StocktakeSummary[]; dataStatus: DataStatus }> {
    if (!(await this.tableExists('inventory_operations'))) return { stocktakes: [], dataStatus: 'UNAVAILABLE' };
    const safeLimit = Math.min(Math.max(Math.trunc(limit) || 10, 1), 50);
    const rows = await this.db.all<any>(
      `SELECT o.id, o.reference, o.status, o.facility_id, f.name AS facility_name, o.created_by,
              o.created_at, o.updated_at, COUNT(l.id) AS line_count,
              SUM(CASE WHEN l.counted_quantity IS NOT NULL AND l.line_status IN ('COUNTED','RECOUNTED') THEN 1 ELSE 0 END) AS captured_count,
              SUM(CASE WHEN l.counted_quantity IS NOT NULL AND l.counted_quantity <> l.snapshot_quantity THEN 1 ELSE 0 END) AS variance_count
       FROM inventory_operations o
       LEFT JOIN logistics_facility f ON f.id = o.facility_id AND f.tenant_id = o.tenant_id
       LEFT JOIN inventory_count_lines l ON l.operation_id = o.id AND l.tenant_id = o.tenant_id
       WHERE o.tenant_id = ? AND o.operation_type = 'PHYSICAL_COUNT'
       GROUP BY o.id ORDER BY o.created_at DESC LIMIT ?`,
      [tenantId, safeLimit],
    );
    return { stocktakes: rows.map((row) => this.mapStocktake(row)), dataStatus: 'LIVE' };
  }

  async getStocktake(tenantId: string, id: string): Promise<StocktakeDetail | null> {
    const row = await this.db.get<any>(
      `SELECT o.id, o.reference, o.status, o.facility_id, f.name AS facility_name, o.created_by, o.created_at,
              o.updated_at, o.reason, COUNT(l.id) AS line_count,
              SUM(CASE WHEN l.counted_quantity IS NOT NULL AND l.line_status IN ('COUNTED','RECOUNTED') THEN 1 ELSE 0 END) AS captured_count,
              SUM(CASE WHEN l.counted_quantity IS NOT NULL AND l.counted_quantity <> l.snapshot_quantity THEN 1 ELSE 0 END) AS variance_count
       FROM inventory_operations o
       LEFT JOIN logistics_facility f ON f.id = o.facility_id AND f.tenant_id = o.tenant_id
       LEFT JOIN inventory_count_lines l ON l.operation_id = o.id AND l.tenant_id = o.tenant_id
       WHERE o.tenant_id = ? AND o.id = ? AND o.operation_type = 'PHYSICAL_COUNT' GROUP BY o.id LIMIT 1`,
      [tenantId, id],
    );
    if (!row) return null;
    const lines = await this.db.all<any>(
      `SELECT l.id, l.stock_id, l.product_id, l.snapshot_quantity, l.counted_quantity, l.line_status, l.count_round,
              s.facility_id, s.bin_location, p.sku, p.name, f.name AS facility_name
       FROM inventory_count_lines l
       JOIN logistics_stock s ON s.id = l.stock_id AND s.tenant_id = l.tenant_id
       JOIN logistics_product p ON p.id = l.product_id AND p.tenant_id = l.tenant_id
       JOIN logistics_facility f ON f.id = s.facility_id AND f.tenant_id = l.tenant_id
       WHERE l.tenant_id = ? AND l.operation_id = ? ORDER BY p.sku, s.bin_location`,
      [tenantId, id],
    );
    return { ...this.mapStocktake(row), reason: String(row.reason), lines: lines.map((line) => this.mapStocktakeLine(line)) };
  }

  private mapStocktake(row: any): StocktakeSummary {
    return {
      id: String(row.id), reference: String(row.reference), status: String(row.status),
      facilityId: row.facility_id == null ? null : String(row.facility_id),
      facilityName: row.facility_name == null ? null : String(row.facility_name),
      lineCount: Number(row.line_count) || 0, capturedCount: Number(row.captured_count) || 0,
      varianceCount: Number(row.variance_count) || 0, createdBy: String(row.created_by),
      createdAt: String(row.created_at), updatedAt: String(row.updated_at),
    };
  }

  private mapStocktakeLine(row: any): StocktakeLine {
    const snapshotQuantity = Number(row.snapshot_quantity) || 0;
    const countedQuantity = row.counted_quantity == null ? null : Number(row.counted_quantity);
    return {
      id: String(row.id), stockId: String(row.stock_id), sku: String(row.sku), description: String(row.name),
      facilityId: String(row.facility_id), facilityName: String(row.facility_name),
      binLocation: row.bin_location == null ? null : String(row.bin_location), snapshotQuantity, countedQuantity,
      variance: countedQuantity == null ? null : countedQuantity - snapshotQuantity,
      lineStatus: String(row.line_status) as StocktakeLine['lineStatus'], countRound: Number(row.count_round) || 1,
    };
  }

  async captureCount(tenantId: string, actorId: string, operationId: string, input: { lineId: unknown; countedQuantity: unknown; idempotencyKey: unknown }): Promise<StocktakeLine> {
    const lineId = cleanText(input.lineId, 128);
    const quantity = requireCount(input.countedQuantity);
    const key = requireIdempotencyKey(input.idempotencyKey);
    return this.db.withTransaction(async () => {
      const stocktake = await this.getStocktake(tenantId, operationId);
      if (!stocktake) throw new InventoryOperationError('Stocktake was not found.', 404, 'STOCKTAKE_NOT_FOUND');
      if (!['IN_PROGRESS', 'RECOUNT_REQUIRED'].includes(stocktake.status)) throw new InventoryOperationError('This count session is not accepting counts.', 409, 'STOCKTAKE_NOT_COUNTING');
      const row = await this.db.get<any>(
        `SELECT id, stock_id, product_id, snapshot_quantity, counted_quantity, line_status, count_round, last_idempotency_key
         FROM inventory_count_lines WHERE tenant_id = ? AND operation_id = ? AND id = ? LIMIT 1`,
        [tenantId, operationId, lineId],
      );
      if (!row) throw new InventoryOperationError('Count line was not found.', 404, 'COUNT_LINE_NOT_FOUND');
      if (row.last_idempotency_key === key) {
        if (Number(row.counted_quantity) !== quantity) {
          throw new InventoryOperationError('This Idempotency-Key was already used for a different count.', 409, 'IDEMPOTENCY_KEY_CONFLICT');
        }
        const detail = await this.getStocktake(tenantId, operationId);
        const replayedLine = detail?.lines.find((line) => line.id === lineId);
        if (replayedLine) return replayedLine;
      }
      if (stocktake.status === 'RECOUNT_REQUIRED' && row.line_status !== 'RECOUNT_REQUIRED') {
        throw new InventoryOperationError('Only flagged variance lines can be recounted.', 409, 'LINE_NOT_FLAGGED_FOR_RECOUNT');
      }
      const lineStatus = row.line_status === 'RECOUNT_REQUIRED' ? 'RECOUNTED' : 'COUNTED';
      await this.db.run(
        `UPDATE inventory_count_lines SET counted_quantity = ?, line_status = ?, count_round = count_round + ?,
          counted_by = ?, last_idempotency_key = ?, updated_at = CURRENT_TIMESTAMP
         WHERE tenant_id = ? AND operation_id = ? AND id = ?`,
        [quantity, lineStatus, lineStatus === 'RECOUNTED' ? 1 : 0, actorId, key, tenantId, operationId, lineId],
      );
      await this.writeEvent(tenantId, 'INVENTORY_COUNT_CAPTURED', `Count captured for ${row.stock_id}.`, 'inventory_count_line', lineId,
        { operationId, stockId: row.stock_id, snapshotQuantity: Number(row.snapshot_quantity), countedQuantity: quantity, lineStatus, actorId, idempotencyKey: key });
      const detail = await this.getStocktake(tenantId, operationId);
      const line = detail?.lines.find((item) => item.id === lineId);
      if (!line) throw new InventoryOperationError('Count line could not be reloaded.', 500, 'COUNT_LINE_RELOAD_FAILED');
      return line;
    });
  }

  async submitStocktake(tenantId: string, actorId: string, id: string, reasonInput: unknown): Promise<StocktakeSummary> {
    const reason = requireReason(reasonInput);
    return this.db.withTransaction(async () => {
      const detail = await this.getStocktake(tenantId, id);
      if (!detail) throw new InventoryOperationError('Stocktake was not found.', 404, 'STOCKTAKE_NOT_FOUND');
      if (detail.status === 'REVIEW_REQUIRED') return detail;
      if (!['IN_PROGRESS', 'RECOUNT_REQUIRED'].includes(detail.status)) throw new InventoryOperationError('This stocktake cannot be submitted in its current state.', 409, 'INVALID_STOCKTAKE_STATE');
      const incomplete = detail.lines.some((line) => line.countedQuantity === null || line.lineStatus === 'RECOUNT_REQUIRED');
      if (incomplete) throw new InventoryOperationError('Capture every required count before submitting the session.', 409, 'COUNTS_INCOMPLETE');
      await this.db.run(`UPDATE inventory_operations SET status = 'REVIEW_REQUIRED', updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`, [tenantId, id]);
      await this.writeEvent(tenantId, 'INVENTORY_STOCKTAKE_SUBMITTED', `Stocktake ${detail.reference} submitted for variance review.`, 'inventory_operation', id,
        { actorId, reason, varianceCount: detail.varianceCount });
      const updated = await this.getStocktake(tenantId, id);
      if (!updated) throw new InventoryOperationError('Stocktake could not be reloaded after submission.', 500, 'STOCKTAKE_RELOAD_FAILED');
      return updated;
    });
  }

  async requestRecount(tenantId: string, actorId: string, id: string, reasonInput: unknown): Promise<StocktakeSummary> {
    const reason = requireReason(reasonInput);
    return this.db.withTransaction(async () => {
      const detail = await this.getStocktake(tenantId, id);
      if (!detail) throw new InventoryOperationError('Stocktake was not found.', 404, 'STOCKTAKE_NOT_FOUND');
      if (detail.status === 'RECOUNT_REQUIRED') return detail;
      if (detail.status !== 'REVIEW_REQUIRED') throw new InventoryOperationError('Variance review is required before requesting a recount.', 409, 'INVALID_STOCKTAKE_STATE');
      const varianceLines = detail.lines.filter((line) => line.variance !== null && line.variance !== 0);
      if (!varianceLines.length) throw new InventoryOperationError('No variance lines require recount.', 409, 'NO_VARIANCES');
      for (const line of varianceLines) {
        await this.db.run(
          `UPDATE inventory_count_lines SET line_status = 'RECOUNT_REQUIRED', updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND operation_id = ? AND id = ?`,
          [tenantId, id, line.id],
        );
      }
      await this.db.run(`UPDATE inventory_operations SET status = 'RECOUNT_REQUIRED', updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`, [tenantId, id]);
      await this.writeEvent(tenantId, 'INVENTORY_STOCKTAKE_RECOUNT_REQUESTED', `Recount requested for ${varianceLines.length} variance lines.`, 'inventory_operation', id,
        { actorId, reason, varianceLineIds: varianceLines.map((line) => line.id) });
      const updated = await this.getStocktake(tenantId, id);
      if (!updated) throw new InventoryOperationError('Stocktake could not be reloaded after recount request.', 500, 'STOCKTAKE_RELOAD_FAILED');
      return updated;
    });
  }

  async reconcileStocktake(tenantId: string, actorId: string, id: string, reasonInput: unknown): Promise<StocktakeSummary> {
    const reason = requireReason(reasonInput);
    return this.db.withTransaction(async () => {
      const detail = await this.getStocktake(tenantId, id);
      if (!detail) throw new InventoryOperationError('Stocktake was not found.', 404, 'STOCKTAKE_NOT_FOUND');
      if (detail.status === 'RECONCILED') return detail;
      if (detail.status !== 'REVIEW_REQUIRED') throw new InventoryOperationError('Only a submitted count can be reconciled.', 409, 'INVALID_STOCKTAKE_STATE');
      if (detail.createdBy === actorId) throw new InventoryOperationError('A different authorized user must approve this reconciliation.', 403, 'SEGREGATION_OF_DUTIES');
      const changedLines = detail.lines.filter((line) => line.variance !== null && line.variance !== 0);
      for (const line of changedLines) {
        if (line.countedQuantity === null) throw new InventoryOperationError('A counted quantity is missing.', 409, 'COUNTS_INCOMPLETE');
        const current = await this.db.get<any>(`SELECT quantity, reserved FROM logistics_stock WHERE tenant_id = ? AND id = ?`, [tenantId, line.stockId]);
        if (!current) throw new InventoryOperationError('A stock row changed after the count snapshot.', 409, 'STOCK_ROW_CHANGED');
        if (line.countedQuantity < (Number(current.reserved) || 0)) throw new InventoryOperationError(`Count for ${line.sku} is below reserved stock. Resolve reservations before reconciliation.`, 409, 'COUNT_BELOW_RESERVED');
        const update = await this.db.run(
          `UPDATE logistics_stock SET quantity = ?, last_counted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
           WHERE tenant_id = ? AND id = ? AND quantity = ?`,
          [line.countedQuantity, tenantId, line.stockId, line.snapshotQuantity],
        );
        if (update.changes !== 1) throw new InventoryOperationError('Stock changed after the count snapshot; refresh and recount before reconciliation.', 409, 'STOCK_CONFLICT');
        await this.writeEvent(tenantId, 'INVENTORY_RECONCILIATION_LINE_POSTED', `Count variance reconciled for ${line.sku}.`, 'stock', line.stockId,
          { operationId: id, sku: line.sku, before: line.snapshotQuantity, after: line.countedQuantity, variance: line.variance, actorId, reason });
      }
      const reference = detail.reference;
      if (changedLines.length) {
        await this.db.run(
          `INSERT INTO logistics_movement (id, tenant_id, movement_number, movement_type, status, origin_facility_id,
            destination_facility_id, item_count, notes)
           VALUES (?, ?, ?, 'ADJUSTMENT', 'COMPLETED', ?, ?, ?, ?)`,
          [randomUUID(), tenantId, makeReference('REC', id), detail.facilityId, detail.facilityId, changedLines.length, reason],
        );
      }
      await this.db.run(
        `UPDATE inventory_operations SET status = 'RECONCILED', approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`,
        [actorId, tenantId, id],
      );
      await this.writeEvent(tenantId, 'INVENTORY_STOCKTAKE_RECONCILED', `Stocktake ${reference} reconciled with ${changedLines.length} posted variance lines.`,
        'inventory_operation', id, { actorId, reason, changedLineCount: changedLines.length });
      const updated = await this.getStocktake(tenantId, id);
      if (!updated) throw new InventoryOperationError('Stocktake could not be reloaded after reconciliation.', 500, 'STOCKTAKE_RELOAD_FAILED');
      return updated;
    });
  }

  async requestAdjustment(tenantId: string, actorId: string, input: { sku: unknown; facilityId: unknown; targetQuantity: unknown; reason: unknown; idempotencyKey: unknown }): Promise<{ operation: InventoryOperationRecord; replayed: boolean }> {
    const sku = cleanText(input.sku, 64).toUpperCase();
    const facilityId = cleanText(input.facilityId, 128);
    const targetQuantity = requireCount(input.targetQuantity);
    const reason = requireReason(input.reason);
    const key = requireIdempotencyKey(input.idempotencyKey);
    if (!sku || !facilityId) throw new InventoryOperationError('Material SKU and facility are required.', 400, 'ADJUSTMENT_FIELDS_REQUIRED');
    return this.db.withTransaction(async () => {
      const replay = await this.findOperationByKey(tenantId, key);
      if (replay) return { operation: replay, replayed: true };
      const product = await this.getProduct(tenantId, sku);
      if (!product) throw new InventoryOperationError('Material SKU was not found in this tenant.', 404, 'MATERIAL_NOT_FOUND');
      await this.requireFacility(tenantId, facilityId);
      const stock = await this.db.get<any>(
        `SELECT id, quantity, reserved FROM logistics_stock WHERE tenant_id = ? AND product_id = ? AND facility_id = ? ORDER BY quantity DESC LIMIT 1`,
        [tenantId, product.id, facilityId],
      );
      if (!stock) throw new InventoryOperationError('No stock position exists for this material at the selected facility.', 404, 'STOCK_POSITION_NOT_FOUND');
      const currentQuantity = Number(stock.quantity) || 0;
      if (targetQuantity === currentQuantity) throw new InventoryOperationError('The requested quantity matches the current on-hand balance.', 409, 'NO_ADJUSTMENT_REQUIRED');
      if (targetQuantity < (Number(stock.reserved) || 0)) throw new InventoryOperationError('The target quantity cannot be lower than reserved stock.', 409, 'TARGET_BELOW_RESERVED');
      const id = randomUUID();
      await this.insertOperation({ id, tenantId, type: 'ADJUSTMENT_REQUEST', status: 'PENDING_APPROVAL', key, actorId,
        productId: String(product.id), sku, quantity: targetQuantity, facilityId, reason,
        metadata: { stockId: String(stock.id), snapshotQuantity: currentQuantity, targetQuantity } });
      await this.writeEvent(tenantId, 'INVENTORY_ADJUSTMENT_REQUESTED', `Adjustment requested for ${sku}; no balance changed pending approval.`,
        'inventory_operation', id, { actorId, sku, facilityId, currentQuantity, targetQuantity, reason });
      const operation = await this.getOperation(tenantId, id);
      if (!operation) throw new InventoryOperationError('Adjustment request could not be reloaded.', 500, 'ADJUSTMENT_RELOAD_FAILED');
      return { operation, replayed: false };
    });
  }

  async reviewCriticalSpare(tenantId: string, actorId: string, input: { sku: unknown; classification: unknown; rationale: unknown; idempotencyKey: unknown }): Promise<{ operation: InventoryOperationRecord; replayed: boolean }> {
    const sku = cleanText(input.sku, 64).toUpperCase();
    const classification = cleanText(input.classification, 24).toUpperCase();
    const rationale = requireReason(input.rationale);
    const key = requireIdempotencyKey(input.idempotencyKey);
    if (!['CRITICAL', 'STANDARD', 'UNVERIFIED'].includes(classification)) throw new InventoryOperationError('Choose a supported review classification.', 400, 'INVALID_CLASSIFICATION');
    return this.db.withTransaction(async () => {
      const replay = await this.findOperationByKey(tenantId, key);
      if (replay) return { operation: replay, replayed: true };
      const product = await this.getProduct(tenantId, sku);
      if (!product) throw new InventoryOperationError('Material SKU was not found in this tenant.', 404, 'MATERIAL_NOT_FOUND');
      const id = randomUUID();
      await this.insertOperation({ id, tenantId, type: 'CRITICAL_SPARES_REVIEW', status: 'POSTED', key, actorId,
        productId: String(product.id), sku, reason: rationale, metadata: { classification, reviewType: 'HUMAN', evidenceSource: 'Atlas inventory material record' } });
      await this.writeEvent(tenantId, 'INVENTORY_CRITICAL_SPARES_REVIEWED', `Human critical-spares review recorded for ${sku}.`,
        'inventory_operation', id, { actorId, sku, classification, rationale, reviewType: 'HUMAN' });
      const operation = await this.getOperation(tenantId, id);
      if (!operation) throw new InventoryOperationError('Review could not be reloaded.', 500, 'REVIEW_RELOAD_FAILED');
      return { operation, replayed: false };
    });
  }

  async getPendingApprovals(tenantId: string, limit = 20): Promise<InventoryOperationRecord[]> {
    const rows = await this.db.all<any>(
      `SELECT id FROM inventory_operations WHERE tenant_id = ? AND status = 'PENDING_APPROVAL'
       ORDER BY created_at ASC LIMIT ?`,
      [tenantId, Math.min(Math.max(Math.trunc(limit) || 20, 1), 100)],
    );
    const operations: InventoryOperationRecord[] = [];
    for (const row of rows) {
      const operation = await this.getOperation(tenantId, String(row.id));
      if (operation) operations.push(operation);
    }
    return operations;
  }

  async approveOperation(tenantId: string, actorId: string, id: string, reasonInput: unknown): Promise<InventoryOperationRecord> {
    const reason = requireReason(reasonInput);
    return this.db.withTransaction(async () => {
      const operation = await this.getOperation(tenantId, id);
      if (!operation) throw new InventoryOperationError('Approval request was not found.', 404, 'OPERATION_NOT_FOUND');
      if (operation.status === 'APPROVED') return operation;
      if (operation.status !== 'PENDING_APPROVAL') throw new InventoryOperationError('This operation is not awaiting approval.', 409, 'OPERATION_NOT_PENDING');
      if (operation.actorId === actorId) throw new InventoryOperationError('A different authorized user must approve this request.', 403, 'SEGREGATION_OF_DUTIES');
      const raw = await this.db.get<any>(`SELECT operation_type, product_id, metadata_json FROM inventory_operations WHERE tenant_id = ? AND id = ?`, [tenantId, id]);
      let metadata: Record<string, any> = {};
      try { metadata = raw?.metadata_json ? JSON.parse(String(raw.metadata_json)) : {}; } catch { metadata = {}; }
      if (raw.operation_type === 'MATERIAL_CREATED') {
        await this.db.run(`UPDATE logistics_product SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`, [tenantId, raw.product_id]);
      } else if (raw.operation_type === 'ADJUSTMENT_REQUEST') {
        const stock = await this.db.get<any>(`SELECT id, quantity, reserved FROM logistics_stock WHERE tenant_id = ? AND id = ?`, [tenantId, metadata.stockId]);
        if (!stock) throw new InventoryOperationError('The stock position changed or was removed; refresh before approval.', 409, 'STOCK_POSITION_CHANGED');
        const target = Number(metadata.targetQuantity);
        const snapshotQuantity = Number(metadata.snapshotQuantity);
        if (Number(stock.quantity) !== snapshotQuantity) throw new InventoryOperationError('Stock changed after the request; review the current balance before approving.', 409, 'STOCK_POSITION_CHANGED');
        if (!Number.isSafeInteger(target) || target < (Number(stock.reserved) || 0)) throw new InventoryOperationError('The approved quantity is invalid or lower than reserved stock.', 409, 'TARGET_BELOW_RESERVED');
        const update = await this.db.run(`UPDATE logistics_stock SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ? AND quantity = ?`, [target, tenantId, stock.id, snapshotQuantity]);
        if (update.changes !== 1) throw new InventoryOperationError('Stock changed during approval.', 409, 'STOCK_CONFLICT');
        const before = Number(metadata.snapshotQuantity) || 0;
        await this.db.run(
          `INSERT INTO logistics_movement (id, tenant_id, movement_number, movement_type, status, origin_facility_id,
            destination_facility_id, item_count, notes)
           VALUES (?, ?, ?, 'ADJUSTMENT', 'COMPLETED', ?, ?, ?, ?)`,
          [randomUUID(), tenantId, makeReference('ADJ', id), operation.facilityId, operation.facilityId, Math.abs(target - before), reason],
        );
        await this.writeEvent(tenantId, 'INVENTORY_ADJUSTMENT_APPROVED', `Adjustment for ${operation.sku || id} posted.`, 'stock', String(stock.id),
          { operationId: id, actorId, before, after: target, reason });
      } else {
        throw new InventoryOperationError('This operation type has no approval handler.', 409, 'UNSUPPORTED_APPROVAL');
      }
      await this.db.run(
        `UPDATE inventory_operations SET status = 'APPROVED', approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`,
        [actorId, tenantId, id],
      );
      await this.writeEvent(tenantId, 'INVENTORY_OPERATION_APPROVED', `${operation.type} ${operation.reference} approved.`, 'inventory_operation', id,
        { actorId, reason, operationType: operation.type });
      const approved = await this.getOperation(tenantId, id);
      if (!approved) throw new InventoryOperationError('Approved operation could not be reloaded.', 500, 'APPROVAL_RELOAD_FAILED');
      return approved;
    });
  }

  async rejectOperation(tenantId: string, actorId: string, id: string, reasonInput: unknown): Promise<InventoryOperationRecord> {
    const reason = requireReason(reasonInput);
    return this.db.withTransaction(async () => {
      const operation = await this.getOperation(tenantId, id);
      if (!operation) throw new InventoryOperationError('Approval request was not found.', 404, 'OPERATION_NOT_FOUND');
      if (operation.status === 'REJECTED') return operation;
      if (operation.status !== 'PENDING_APPROVAL') throw new InventoryOperationError('This operation is not awaiting approval.', 409, 'OPERATION_NOT_PENDING');
      if (operation.actorId === actorId) throw new InventoryOperationError('A different authorized user must reject this request.', 403, 'SEGREGATION_OF_DUTIES');
      const raw = await this.db.get<any>(`SELECT operation_type, product_id FROM inventory_operations WHERE tenant_id = ? AND id = ?`, [tenantId, id]);
      if (raw.operation_type === 'MATERIAL_CREATED') {
        await this.db.run(`UPDATE logistics_product SET status = 'REJECTED', updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`, [tenantId, raw.product_id]);
      }
      await this.db.run(`UPDATE inventory_operations SET status = 'REJECTED', approved_by = ?, updated_at = CURRENT_TIMESTAMP WHERE tenant_id = ? AND id = ?`, [actorId, tenantId, id]);
      await this.writeEvent(tenantId, 'INVENTORY_OPERATION_REJECTED', `${operation.type} ${operation.reference} rejected.`, 'inventory_operation', id,
        { actorId, reason, operationType: operation.type });
      const rejected = await this.getOperation(tenantId, id);
      if (!rejected) throw new InventoryOperationError('Rejected operation could not be reloaded.', 500, 'REJECTION_RELOAD_FAILED');
      return rejected;
    });
  }

  async getStocktakeLinesForReview(tenantId: string, id: string): Promise<StocktakeDetail | null> {
    return this.getStocktake(tenantId, id);
  }

  async search(tenantId: string, queryInput: unknown): Promise<InventorySearchResponse> {
    const query = cleanText(queryInput, 100);
    if (query.length < 2) throw new InventoryOperationError('Enter at least 2 characters to search.', 400, 'QUERY_TOO_SHORT');
    const like = `%${escapeLike(query)}%`;
    const items: InventorySearchResultItem[] = [];
    const sources: Record<string, DataStatus> = {};

    if (await this.tableExists('logistics_product')) {
      const rows = await this.db.all<any>(
        `SELECT id, sku, name, category, unit_of_measure, status FROM logistics_product
         WHERE tenant_id = ? AND (sku LIKE ? ESCAPE '\\' OR name LIKE ? ESCAPE '\\' OR category LIKE ? ESCAPE '\\')
         ORDER BY name LIMIT 8`, [tenantId, like, like, like],
      );
      for (const row of rows) items.push({ id: String(row.id), kind: 'material', label: String(row.name), subLabel: `${row.sku} · ${row.category || 'Uncategorized'}`,
        status: String(row.status || 'UNKNOWN'), fields: [{ label: 'SKU', value: String(row.sku) }, { label: 'Category', value: String(row.category || 'Not recorded') }, { label: 'UOM', value: String(row.unit_of_measure || 'Not recorded') }] });
      sources.materials = 'LIVE';
    } else sources.materials = 'UNAVAILABLE';

    const facilities = await this.listFacilities(tenantId);
    sources.locations = facilities.dataStatus;
    for (const facility of facilities.facilities.filter((item) => `${item.code} ${item.name} ${item.city || ''} ${item.facilityType || ''}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8)) {
      items.push({ id: facility.id, kind: 'location', label: facility.name, subLabel: `${facility.code} · ${facility.city || 'City not recorded'}`,
        status: facility.operationalStatus, fields: [
          { label: 'Facility type', value: facility.facilityType || 'Not recorded' },
          { label: 'Operational status', value: facility.operationalStatus || 'Not recorded' },
          { label: 'Coordinates', value: facility.latitude == null || facility.longitude == null ? 'Not recorded' : `${facility.latitude}, ${facility.longitude}` },
        ] });
    }

    if (await this.tableExists('logistics_order')) {
      const rows = await this.db.all<any>(
        `SELECT id, order_number, status, supplier_id, destination_facility_id, created_at FROM logistics_order
         WHERE tenant_id = ? AND (order_number LIKE ? ESCAPE '\\' OR status LIKE ? ESCAPE '\\' OR supplier_id LIKE ? ESCAPE '\\')
         ORDER BY created_at DESC LIMIT 8`, [tenantId, like, like, like],
      );
      for (const row of rows) items.push({ id: String(row.id), kind: 'purchase-order', label: String(row.order_number),
        subLabel: `${row.status} · supplier ${row.supplier_id || 'not linked'}`, status: String(row.status), fields: [
          { label: 'Supplier ID', value: String(row.supplier_id || 'Not linked') },
          { label: 'Destination facility ID', value: String(row.destination_facility_id || 'Not recorded') },
          { label: 'Created', value: String(row.created_at || 'Not recorded') },
        ] });
      sources.purchaseOrders = 'LIVE';
    } else sources.purchaseOrders = 'UNAVAILABLE';

    const supplierTables = (await this.db.all<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND name LIKE '%supplier%'")).map((row) => row.name).filter((name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name));
    sources.suppliers = supplierTables.length ? 'LIVE' : 'NOT_CONFIGURED';
    for (const table of supplierTables.slice(0, 3)) {
      const columns = await this.tableColumns(table);
      const nameColumn = ['name', 'supplier_name', 'company_name', 'legal_name'].find((column) => columns.has(column));
      const idColumn = columns.has('id') ? 'id' : null;
      if (!nameColumn || !idColumn || !columns.has('tenant_id')) continue;
      const rows = await this.db.all<any>(
        `SELECT ${quoteIdentifier(idColumn)} AS id, ${quoteIdentifier(nameColumn)} AS label ${columns.has('status') ? `, ${quoteIdentifier('status')} AS status` : ', NULL AS status'}
         FROM ${quoteIdentifier(table)} WHERE ${quoteIdentifier('tenant_id')} = ? AND ${quoteIdentifier(nameColumn)} LIKE ? ESCAPE '\\' LIMIT 8`,
        [tenantId, like],
      );
      for (const row of rows) items.push({ id: String(row.id), kind: 'supplier', label: String(row.label), subLabel: `${table} · ${row.status || 'Status not recorded'}`,
        status: row.status == null ? null : String(row.status), fields: [{ label: 'Source', value: table }, { label: 'Status', value: String(row.status || 'Not recorded') }] });
    }

    const workTables = (await this.db.all<{ name: string }>("SELECT name FROM sqlite_master WHERE type = 'table' AND (name LIKE '%work_order%' OR name LIKE '%workorder%')")).map((row) => row.name).filter((name) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(name));
    sources.workOrders = workTables.length ? 'LIVE' : 'NOT_CONFIGURED';
    for (const table of workTables.slice(0, 3)) {
      const columns = await this.tableColumns(table);
      const searchColumn = ['work_order_number', 'reference', 'title', 'description', 'asset_name'].find((column) => columns.has(column));
      if (!searchColumn || !columns.has('id') || !columns.has('tenant_id')) continue;
      const labelColumn = ['title', 'work_order_number', 'reference', 'description'].find((column) => columns.has(column)) || searchColumn;
      const rows = await this.db.all<any>(
        `SELECT ${quoteIdentifier('id')} AS id, ${quoteIdentifier(labelColumn)} AS label ${columns.has('status') ? `, ${quoteIdentifier('status')} AS status` : ', NULL AS status'}
         FROM ${quoteIdentifier(table)} WHERE ${quoteIdentifier('tenant_id')} = ? AND ${quoteIdentifier(searchColumn)} LIKE ? ESCAPE '\\' LIMIT 8`,
        [tenantId, like],
      );
      for (const row of rows) items.push({ id: String(row.id), kind: 'work-order', label: String(row.label || row.id), subLabel: `${table} · ${row.status || 'Status not recorded'}`,
        status: row.status == null ? null : String(row.status), fields: [{ label: 'Source', value: table }, { label: 'Status', value: String(row.status || 'Not recorded') }] });
    }

    if (await this.tableExists('inventory_operations')) {
      const rows = await this.db.all<any>(
        `SELECT id, reference, operation_type, status, sku, quantity, reason, created_at FROM inventory_operations
         WHERE tenant_id = ? AND (reference LIKE ? ESCAPE '\\' OR sku LIKE ? ESCAPE '\\' OR reason LIKE ? ESCAPE '\\')
         ORDER BY created_at DESC LIMIT 8`, [tenantId, like, like, like],
      );
      for (const row of rows) items.push({ id: String(row.id), kind: 'movement', label: String(row.reference),
        subLabel: `${row.operation_type} · ${row.sku || 'No SKU'} · ${row.status}`, status: String(row.status), fields: [
          { label: 'Type', value: String(row.operation_type) }, { label: 'SKU', value: String(row.sku || 'Not recorded') },
          { label: 'Quantity', value: row.quantity == null ? 'Not recorded' : String(row.quantity) },
          { label: 'Reason', value: String(row.reason) }, { label: 'Created', value: String(row.created_at) },
        ] });
      sources.movements = 'LIVE';
    } else sources.movements = 'UNAVAILABLE';

    return { items: items.slice(0, 40), sources };
  }
}
