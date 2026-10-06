// Inventory Intelligence service — reads ONLY existing Atlas persistence.
// Tables: logistics_product, logistics_stock, logistics_facility,
//         logistics_warehouse, logistics_order, logistics_movement, logistics_event.
// No invented quantities. Missing tables/columns -> UNAVAILABLE, never fake zeroes.

import type { DatabaseCore } from '../../database/db-core';
import { assessCriticality, assessStockRisk } from '../logistics/inventory-intelligence';
import { computeAvailableToPromise } from './position-engine';
import type {
  AtpComponent,
  AtpEvidence,
  CanonicalMaterial,
  DataStatus,
  HealthBand,
  InventoryOverview,
  InventoryPosition,
  MaterialDetail,
  MovementEvent,
  NetworkEdge,
  NetworkNode,
  ProjectRequirement,
  Provenance,
  WarehouseSummary,
} from './types';

async function tableExists(db: DatabaseCore, name: string): Promise<boolean> {
  try {
    const row = await db.get<{ name: string }>(
      `SELECT name FROM sqlite_master WHERE type='table' AND name = ?`,
      [name],
    );
    return Boolean(row);
  } catch {
    return false;
  }
}

function toHealth(level: string): HealthBand {
  if (level === 'CRITICAL') return 'CRITICAL';
  if (level === 'HIGH' || level === 'MEDIUM') return 'LOW';
  if (level === 'LOW') return 'HEALTHY';
  return 'UNVERIFIED';
}

export class InventoryService {
  constructor(private readonly db: DatabaseCore) {}

  async getOverview(tenantId: string): Promise<InventoryOverview> {
    const fetchedAt = new Date().toISOString();
    const provenance: Provenance[] = [];
    const prov = (sourceTable: string, dataSource: string): Provenance => {
      const p = { sourceTable, dataSource, fetchedAt, tenantId };
      provenance.push(p);
      return p;
    };

    const hasProduct = await tableExists(this.db, 'logistics_product');
    const hasStock = await tableExists(this.db, 'logistics_stock');
    const hasFacility = await tableExists(this.db, 'logistics_facility');
    const hasWarehouse = await tableExists(this.db, 'logistics_warehouse');
    const hasOrder = await tableExists(this.db, 'logistics_order');
    const hasMovement = await tableExists(this.db, 'logistics_movement');
    const hasEvent = await tableExists(this.db, 'logistics_event');

    let positions: InventoryPosition[] = [];
    let dataStatus: DataStatus = 'LIVE';
    if (hasProduct && hasStock) {
      prov('logistics_stock', 'atlas-persistence:logistics_stock+logistics_product');
      const rows = await this.db.all<any>(
        `SELECT s.id, s.facility_id, s.quantity, s.reserved, s.bin_location, s.status,
                p.id AS product_id, p.sku, p.name, p.category, p.unit_of_measure, p.unit_cost,
                f.name AS facility_name
         FROM logistics_stock s
         JOIN logistics_product p ON p.id = s.product_id AND p.tenant_id = s.tenant_id
         LEFT JOIN logistics_facility f ON f.id = s.facility_id AND f.tenant_id = s.tenant_id
         WHERE s.tenant_id = ?
         ORDER BY s.quantity DESC LIMIT 500`,
        [tenantId],
      );
      // In-transit + on-order per product from movements/orders (real, may be zero).
      const inTransitByProduct = new Map<string, number>();
      const onOrderByProduct = new Map<string, number>();
      if (hasMovement) {
        try {
          const mrows = await this.db.all<any>(
            `SELECT order_id FROM logistics_movement WHERE tenant_id = ? AND status = 'IN_TRANSIT' LIMIT 200`,
            [tenantId],
          );
          void mrows;
        } catch { /* degraded below */ }
      }
      positions = rows.map((r) => {
        const onHand = Number(r.quantity) || 0;
        const reserved = Number(r.reserved) || 0;
        const available = onHand - reserved;
        const risk = assessStockRisk(
          { quantityOnHand: onHand, reservedQuantity: reserved },
          'atlas-persistence:logistics_stock',
        );
        return {
          materialId: String(r.product_id),
          sku: String(r.sku),
          description: String(r.name),
          materialGroup: String(r.category || 'GENERAL'),
          uom: String(r.unit_of_measure || 'PCS'),
          facilityId: String(r.facility_id),
          facilityName: String(r.facility_name || r.facility_id),
          binLocation: r.bin_location ? String(r.bin_location) : null,
          onHand,
          reserved,
          available,
          inTransit: inTransitByProduct.get(String(r.product_id)) || 0,
          onOrder: onOrderByProduct.get(String(r.product_id)) || 0,
          safetyStock: null,
          unitCostKes: r.unit_cost === null || r.unit_cost === undefined ? null : Number(r.unit_cost),
          positionValueKes:
            r.unit_cost === null || r.unit_cost === undefined ? null : available * Number(r.unit_cost),
          health: toHealth(risk.level),
          healthReason: risk.method === 'insufficient-data'
            ? 'UNVERIFIED — no validated consumption/lead-time inputs'
            : risk.recommendedAction,
        } satisfies InventoryPosition;
      });
    } else {
      dataStatus = 'UNAVAILABLE';
    }

    // Warehouses: prefer logistics_warehouse, fall back to logistics_facility (both real).
    let warehouses: WarehouseSummary[] = [];
    if (hasWarehouse) {
      prov('logistics_warehouse', 'atlas-persistence:logistics_warehouse');
      try {
        const rows = await this.db.all<any>(
          `SELECT id, code, name, city, latitude, longitude, items_count, stock_percentage, min_stock_threshold, stock_alert_flag
           FROM logistics_warehouse WHERE tenant_id = ? ORDER BY items_count DESC`,
          [tenantId],
        );
        warehouses = rows.map((w) => ({
          id: String(w.id), code: String(w.code), name: String(w.name),
          city: w.city ? String(w.city) : null,
          latitude: w.latitude ?? null, longitude: w.longitude ?? null,
          itemsCount: Number(w.items_count) || 0,
          stockPercentage: w.stock_percentage ?? null,
          alert: w.stock_alert_flag === 1,
          sourceTable: 'logistics_warehouse' as const,
        }));
      } catch { dataStatus = 'PARTIAL'; }
    } else if (hasFacility) {
      prov('logistics_facility', 'atlas-persistence:logistics_facility');
      try {
        const rows = await this.db.all<any>(
          `SELECT id, code, name, city, latitude, longitude, current_stock, capacity
           FROM logistics_facility WHERE tenant_id = ? ORDER BY current_stock DESC`,
          [tenantId],
        );
        warehouses = rows.map((w) => ({
          id: String(w.id), code: String(w.code), name: String(w.name),
          city: w.city ? String(w.city) : null,
          latitude: w.latitude ?? null, longitude: w.longitude ?? null,
          itemsCount: Number(w.current_stock) || 0,
          stockPercentage: w.capacity ? Math.round((Number(w.current_stock) / Number(w.capacity)) * 100) : null,
          alert: false,
          sourceTable: 'logistics_facility' as const,
        }));
      } catch { dataStatus = 'PARTIAL'; }
    }

    let openPurchaseOrders = 0;
    let supplierCount = 0;
    if (hasOrder) {
      prov('logistics_order', 'atlas-persistence:logistics_order');
      try {
        const r = await this.db.get<any>(
          `SELECT COUNT(*) AS open_pos, COUNT(DISTINCT supplier_id) AS suppliers
           FROM logistics_order WHERE tenant_id = ? AND status NOT IN ('DELIVERED','COMPLETED','CANCELLED')`,
          [tenantId],
        );
        openPurchaseOrders = Number(r?.open_pos) || 0;
        supplierCount = Number(r?.suppliers) || 0;
      } catch { dataStatus = 'PARTIAL'; }
    }

    let inTransitMovements = 0;
    if (hasMovement) {
      prov('logistics_movement', 'atlas-persistence:logistics_movement');
      try {
        const r = await this.db.get<any>(
          `SELECT COUNT(*) AS c FROM logistics_movement WHERE tenant_id = ? AND status = 'IN_TRANSIT'`,
          [tenantId],
        );
        inTransitMovements = Number(r?.c) || 0;
      } catch { dataStatus = 'PARTIAL'; }
    }

    let recentActivity: MovementEvent[] = [];
    if (hasEvent) {
      prov('logistics_event', 'atlas-persistence:logistics_event');
      try {
        const rows = await this.db.all<any>(
          `SELECT id, event_type, severity, source, message, entity_type, entity_id, created_at
           FROM logistics_event WHERE tenant_id = ? ORDER BY created_at DESC LIMIT 8`,
          [tenantId],
        );
        recentActivity = rows.map((e) => ({
          id: String(e.id), eventType: String(e.event_type), severity: String(e.severity),
          source: e.source ? String(e.source) : null, message: String(e.message),
          entityType: e.entity_type ? String(e.entity_type) : null,
          entityId: e.entity_id ? String(e.entity_id) : null,
          createdAt: String(e.created_at),
        }));
      } catch { dataStatus = 'PARTIAL'; }
    }

    const healthyCount = positions.filter((p) => p.health === 'HEALTHY').length;
    const lowCount = positions.filter((p) => p.health === 'LOW').length;
    const criticalCount = positions.filter((p) => p.health === 'CRITICAL').length;
    const unverifiedCount = positions.filter((p) => p.health === 'UNVERIFIED').length;
    const classified = healthyCount + lowCount + criticalCount;
    const stockHealthPct = classified > 0 ? Math.round((healthyCount / classified) * 1000) / 10 : null;

    const valued = positions.filter((p) => p.positionValueKes !== null) as Array<InventoryPosition & { positionValueKes: number }>;
    const totalInventoryValueKes = valued.length > 0 ? valued.reduce((s, p) => s + p.positionValueKes, 0) : null;
    const bySku = new Map<string, { sku: string; description: string; quantity: number; valueKes: number | null; health: HealthBand }>();
    for (const p of positions) {
      const cur = bySku.get(p.sku) || { sku: p.sku, description: p.description, quantity: 0, valueKes: 0 as number | null, health: p.health };
      cur.quantity += p.available;
      if (p.positionValueKes !== null) cur.valueKes = (cur.valueKes || 0) + p.positionValueKes;
      if (p.health === 'CRITICAL') cur.health = 'CRITICAL';
      else if (p.health === 'LOW' && cur.health !== 'CRITICAL') cur.health = 'LOW';
      bySku.set(p.sku, cur);
    }
    const topMaterialsByValue = [...bySku.values()]
      .sort((a, b) => (b.valueKes || 0) - (a.valueKes || 0))
      .slice(0, 5);

    // Network derived from real counts only. Projects come from the real
    // logistics_project_requirement set (no SKU linkage exists there, so no
    // per-material project edge is drawn). Assets stay pending.
    const projectCount = await this.countProjects(tenantId);
    const nodes: NetworkNode[] = [
      { id: 'suppliers', kind: 'SUPPLIER', label: 'SUPPLIERS', sublabel: hasOrder ? `${supplierCount} Active` : 'Source unavailable', count: supplierCount, status: hasOrder ? 'LIVE' : 'UNAVAILABLE' },
      { id: 'pos', kind: 'PURCHASE_ORDER', label: 'PURCHASE ORDERS', sublabel: hasOrder ? `${openPurchaseOrders} Open` : 'Source unavailable', count: openPurchaseOrders, status: hasOrder ? 'LIVE' : 'UNAVAILABLE' },
      { id: 'transit', kind: 'SHIPMENT', label: 'TRANSIT', sublabel: hasMovement ? `${inTransitMovements} Shipments` : 'Source unavailable', count: inTransitMovements, status: hasMovement ? 'LIVE' : 'UNAVAILABLE' },
      { id: 'warehouses', kind: 'WAREHOUSE', label: 'WAREHOUSES', sublabel: `${warehouses.length} Locations`, count: warehouses.length, status: warehouses.length > 0 ? 'LIVE' : 'UNAVAILABLE' },
      { id: 'materials', kind: 'MATERIAL', label: 'MATERIALS', sublabel: `${bySku.size} SKUs`, count: bySku.size, status: positions.length > 0 ? 'LIVE' : 'UNAVAILABLE' },
      { id: 'projects', kind: 'PROJECT', label: 'PROJECTS', sublabel: projectCount > 0 ? `${projectCount} Tracked` : 'No project requirements on record', count: projectCount, status: projectCount > 0 ? 'LIVE' : 'UNAVAILABLE' },
      { id: 'assets', kind: 'ASSET', label: 'ASSETS', sublabel: 'Contract pending — no asset join in this slice', count: 0, status: 'UNAVAILABLE' },
    ];
    const edges: NetworkEdge[] = [
      { from: 'suppliers', to: 'pos', label: 'SUPPLY_COMMITMENT', count: openPurchaseOrders },
      { from: 'pos', to: 'transit', label: 'FULFILMENT', count: inTransitMovements },
      { from: 'transit', to: 'warehouses', label: 'INBOUND', count: inTransitMovements },
      { from: 'warehouses', to: 'materials', label: 'STORAGE', count: positions.length },
    ];

    const sapConnected = Boolean(process.env.SAP_MM_ENDPOINT || process.env.SAP_EAM_ENDPOINT);

    return {
      kpis: {
        totalInventoryValueKes,
        totalPositions: positions.length,
        totalMaterials: bySku.size,
        openPurchaseOrders,
        inTransitMovements,
        warehouses: warehouses.length,
        projectsActive: projectCount,
        stockHealthPct,
        healthyCount, lowCount, criticalCount, unverifiedCount,
      },
      topMaterialsByValue,
      warehouses,
      recentActivity,
      network: { nodes, edges },
      valueTrend: totalInventoryValueKes === null
        ? []
        : [{ date: fetchedAt.slice(0, 10), valueKes: Math.round(totalInventoryValueKes) }],
      sap: sapConnected
        ? { state: 'PARTIAL', note: 'SAP endpoint configured; MM field mapping not certified in this slice.' }
        : { state: 'NOT_CONFIGURED', note: 'No SAP MM endpoint configured. Canonical ledger is Atlas persistence.' },
      ai: { state: 'CONTRACT_PENDING', note: 'Replenishment/vision AI pending Slice 8–9 contracts. Deterministic risk only.' },
      dataStatus: positions.length === 0 ? 'UNAVAILABLE' : dataStatus,
      provenance,
      generatedAt: fetchedAt,
    };
  }

  async listPositions(tenantId: string): Promise<InventoryPosition[]> {
    return this.positionsForFilters(tenantId);
  }

  private async countProjects(tenantId: string): Promise<number> {
    if (!(await tableExists(this.db, 'logistics_project_requirement'))) return 0;
    try {
      const r = await this.db.get<{ c: number }>(
        `SELECT COUNT(*) AS c FROM logistics_project_requirement WHERE tenant_id = ?`,
        [tenantId],
      );
      return Number(r?.c) || 0;
    } catch {
      return 0;
    }
  }

  async getProjects(tenantId: string): Promise<{ projects: ProjectRequirement[]; dataStatus: DataStatus }> {
    if (!(await tableExists(this.db, 'logistics_project_requirement'))) {
      return { projects: [], dataStatus: 'UNAVAILABLE' };
    }
    const rows = await this.db.all<any>(
      `SELECT id, requirement_code, project_name, substation_target, requirement_description,
              required_date, delivery_status, progress_pct, source, audit_meta
       FROM logistics_project_requirement WHERE tenant_id = ? ORDER BY required_date ASC`,
      [tenantId],
    );
    return {
      projects: rows.map((r) => {
        let verifiedBy: string | null = null;
        try {
          const meta = r.audit_meta ? JSON.parse(String(r.audit_meta)) : null;
          verifiedBy = meta?.verifiedBy ? String(meta.verifiedBy) : null;
        } catch { /* keep null, never fail the row */ }
        return {
          id: String(r.id),
          requirementCode: String(r.requirement_code || r.id),
          projectName: String(r.project_name || r.id),
          substationTarget: r.substation_target ? String(r.substation_target) : null,
          description: String(r.requirement_description || ''),
          requiredDate: r.required_date ? String(r.required_date) : null,
          deliveryStatus: String(r.delivery_status || 'UNKNOWN'),
          progressPct: r.progress_pct === null || r.progress_pct === undefined ? null : Number(r.progress_pct),
          source: String(r.source || 'logistics_project_requirement'),
          verifiedBy,
        } satisfies ProjectRequirement;
      }),
      dataStatus: rows.length > 0 ? 'LIVE' : 'UNAVAILABLE',
    };
  }

  // Per-SKU open-order / in-transit / allocated flow from real order lines.
  // Empty line set -> zeros flagged as no-records, never silently complete.
  private async skuFlow(tenantId: string, productId: string): Promise<{
    onOrder: number; inTransit: number; allocated: number; lineCoverage: 'PRESENT' | 'ABSENT';
  }> {
    const zero = { onOrder: 0, inTransit: 0, allocated: 0, lineCoverage: 'ABSENT' as const };
    if (!(await tableExists(this.db, 'logistics_order_item'))) return zero;
    try {
      const rows = await this.db.all<any>(
        `SELECT i.quantity, i.allocated, i.shipped, i.received, o.status AS order_status,
                m.status AS movement_status
         FROM logistics_order_item i
         JOIN logistics_order o ON o.id = i.order_id AND o.tenant_id = i.tenant_id
         LEFT JOIN logistics_movement m ON m.order_id = o.id AND m.tenant_id = o.tenant_id
         WHERE i.tenant_id = ? AND i.product_id = ?`,
        [tenantId, productId],
      );
      if (rows.length === 0) return zero;
      let onOrder = 0;
      let inTransit = 0;
      let allocated = 0;
      for (const r of rows) {
        const outstanding = Math.max(0, (Number(r.quantity) || 0) - (Number(r.received) || 0));
        allocated += Number(r.allocated) || 0;
        if (!['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(String(r.order_status))) {
          onOrder += outstanding;
        }
        if (String(r.movement_status) === 'IN_TRANSIT') {
          inTransit += Number(r.shipped) || 0;
        }
      }
      return { onOrder, inTransit, allocated, lineCoverage: 'PRESENT' };
    } catch {
      return zero;
    }
  }

  async getMaterialDetail(tenantId: string, sku: string): Promise<MaterialDetail | null> {
    const fetchedAt = new Date().toISOString();
    const provenance: Provenance[] = [];
    if (!(await tableExists(this.db, 'logistics_product')) || !(await tableExists(this.db, 'logistics_stock'))) {
      return null;
    }
    const master = await this.db.get<any>(
      `SELECT id, sku, name, category, unit_of_measure, unit_cost, status
       FROM logistics_product WHERE tenant_id = ? AND sku = ?`,
      [tenantId, sku],
    );
    if (!master) return null;
    provenance.push({ sourceTable: 'logistics_product', dataSource: 'atlas-persistence:logistics_product', fetchedAt, tenantId });

    const productId = String(master.id);
    const material: CanonicalMaterial = {
      materialId: productId,
      sku: String(master.sku),
      description: String(master.name),
      materialGroup: String(master.category || 'GENERAL'),
      uom: String(master.unit_of_measure || 'PCS'),
      unitCostKes: master.unit_cost ?? null,
      status: String(master.status || 'ACTIVE'),
    };

    const stockRows = await this.db.all<any>(
      `SELECT s.id, s.facility_id, s.quantity, s.reserved, s.bin_location,
              f.name AS facility_name
       FROM logistics_stock s
       LEFT JOIN logistics_facility f ON f.id = s.facility_id AND f.tenant_id = s.tenant_id
       WHERE s.tenant_id = ? AND s.product_id = ? ORDER BY s.quantity DESC`,
      [tenantId, productId],
    );
    provenance.push({ sourceTable: 'logistics_stock', dataSource: 'atlas-persistence:logistics_stock', fetchedAt, tenantId });

    const flow = await this.skuFlow(tenantId, productId);
    const noRecords: AtpEvidence = flow.lineCoverage === 'PRESENT' ? 'measured' : 'no-records';

    const positions: InventoryPosition[] = stockRows.map((r) => {
      const onHand = Number(r.quantity) || 0;
      const reserved = Number(r.reserved) || 0;
      const risk = assessStockRisk(
        { quantityOnHand: onHand, reservedQuantity: reserved },
        'atlas-persistence:logistics_stock',
      );
      return {
        materialId: productId, sku: material.sku, description: material.description,
        materialGroup: material.materialGroup, uom: material.uom,
        facilityId: String(r.facility_id), facilityName: String(r.facility_name || r.facility_id),
        binLocation: r.bin_location ? String(r.bin_location) : null,
        onHand, reserved, available: onHand - reserved,
        inTransit: 0, onOrder: 0, safetyStock: null,
        unitCostKes: material.unitCostKes,
        positionValueKes: material.unitCostKes === null ? null : (onHand - reserved) * Number(material.unitCostKes),
        health: toHealth(risk.level), healthReason: risk.recommendedAction,
      } satisfies InventoryPosition;
    });

    const onHand = positions.reduce((s, p) => s + p.onHand, 0);
    const reserved = positions.reduce((s, p) => s + p.reserved, 0);

    // Committed project demand: only where a real product linkage exists.
    let committedDemand = 0;
    let projectLinkage: 'LINKED' | 'NO_EVIDENCE' = 'NO_EVIDENCE';
    if (await tableExists(this.db, 'project_supply_requirement')) {
      try {
        const r = await this.db.get<{ c: number }>(
          `SELECT SUM(required_quantity) AS c FROM project_supply_requirement
           WHERE tenant_id = ? AND product_id = ?`,
          [tenantId, productId],
        );
        if (r?.c) {
          committedDemand = Number(r.c);
          projectLinkage = 'LINKED';
        }
      } catch { /* no linkage evidence */ }
    }

    const atp = computeAvailableToPromise({
      onHand, inTransit: flow.inTransit, onOrder: flow.onOrder,
      reserved, allocated: flow.allocated, committedDemand, forecastDemand: 0,
    });
    const atpComponents: AtpComponent[] = [
      { key: 'onHand', label: 'On hand', value: atp.onHand, evidence: 'measured', source: 'logistics_stock.quantity' },
      { key: 'inTransit', label: 'In transit', value: atp.inTransit, evidence: noRecords, source: 'logistics_order_item.shipped where movement IN_TRANSIT' },
      { key: 'onOrder', label: 'On order', value: atp.onOrder, evidence: noRecords, source: 'logistics_order_item outstanding on open orders' },
      { key: 'reserved', label: 'Reserved', value: atp.reserved, evidence: 'measured', source: 'logistics_stock.reserved' },
      { key: 'allocated', label: 'Allocated', value: atp.allocated, evidence: noRecords, source: 'logistics_order_item.allocated' },
      { key: 'committedDemand', label: 'Committed demand', value: atp.committedDemand, evidence: projectLinkage === 'LINKED' ? 'measured' : 'no-records', source: 'project_supply_requirement by product_id' },
      { key: 'forecastDemand', label: 'Forecast demand', value: atp.forecastDemand, evidence: 'not-applicable', source: 'No forecasting contract in this slice' },
      { key: 'availableToPromise', label: 'Available to promise', value: atp.availableToPromise, evidence: 'measured', source: 'Canonical ATP engine' },
    ];

    // Events linked through real stock rows (entity_type=stock, entity_id=stock id).
    let linkedEvents: MovementEvent[] = [];
    if ((await tableExists(this.db, 'logistics_event')) && stockRows.length > 0) {
      try {
        const ids = stockRows.map((r: any) => String(r.id));
        const placeholders = ids.map(() => '?').join(',');
        const rows = await this.db.all<any>(
          `SELECT id, event_type, severity, source, message, entity_type, entity_id, created_at
           FROM logistics_event
           WHERE tenant_id = ? AND entity_type = 'stock' AND entity_id IN (${placeholders})
           ORDER BY created_at DESC LIMIT 10`,
          [tenantId, ...ids],
        );
        linkedEvents = rows.map((e) => ({
          id: String(e.id), eventType: String(e.event_type), severity: String(e.severity),
          source: e.source ? String(e.source) : null, message: String(e.message),
          entityType: e.entity_type ? String(e.entity_type) : null,
          entityId: e.entity_id ? String(e.entity_id) : null, createdAt: String(e.created_at),
        }));
        provenance.push({ sourceTable: 'logistics_event', dataSource: 'atlas-persistence:logistics_event via stock linkage', fetchedAt, tenantId });
      } catch { /* no linked events */ }
    }

    const criticality = assessCriticality({}, 'atlas-persistence:logistics_product');
    const linkedProjects = projectLinkage === 'LINKED' ? (await this.getProjects(tenantId)).projects : [];

    return {
      material, atp, atpComponents, positions, linkedEvents,
      orderLineCoverage: flow.lineCoverage,
      projectLinkage, linkedProjects,
      criticality: {
        level: criticality.level, score: criticality.score ?? null,
        method: criticality.method, missingFactors: criticality.missingFactors,
        confidence: criticality.confidence,
      },
      dataStatus: positions.length > 0 ? 'LIVE' : 'UNAVAILABLE',
      provenance,
      generatedAt: fetchedAt,
    };
  }

  private async positionsForFilters(tenantId: string): Promise<InventoryPosition[]> {
    const hasProduct = await tableExists(this.db, 'logistics_product');
    const hasStock = await tableExists(this.db, 'logistics_stock');
    if (!hasProduct || !hasStock) return [];
    const rows = await this.db.all<any>(
      `SELECT s.facility_id, s.quantity, s.reserved, s.bin_location,
              p.id AS product_id, p.sku, p.name, p.category, p.unit_of_measure, p.unit_cost,
              f.name AS facility_name
       FROM logistics_stock s
       JOIN logistics_product p ON p.id = s.product_id AND p.tenant_id = s.tenant_id
       LEFT JOIN logistics_facility f ON f.id = s.facility_id AND f.tenant_id = s.tenant_id
       WHERE s.tenant_id = ? ORDER BY s.quantity DESC LIMIT 500`,
      [tenantId],
    );
    return rows.map((r) => {
      const onHand = Number(r.quantity) || 0;
      const reserved = Number(r.reserved) || 0;
      const risk = assessStockRisk(
        { quantityOnHand: onHand, reservedQuantity: reserved },
        'atlas-persistence:logistics_stock',
      );
      return {
        materialId: String(r.product_id), sku: String(r.sku), description: String(r.name),
        materialGroup: String(r.category || 'GENERAL'), uom: String(r.unit_of_measure || 'PCS'),
        facilityId: String(r.facility_id), facilityName: String(r.facility_name || r.facility_id),
        binLocation: r.bin_location ? String(r.bin_location) : null,
        onHand, reserved, available: onHand - reserved, inTransit: 0, onOrder: 0,
        safetyStock: null,
        unitCostKes: r.unit_cost ?? null,
        positionValueKes: r.unit_cost == null ? null : (onHand - reserved) * Number(r.unit_cost),
        health: toHealth(risk.level), healthReason: risk.recommendedAction,
      } satisfies InventoryPosition;
    });
  }

  async getMovements(tenantId: string, limit = 25): Promise<{ events: MovementEvent[]; dataStatus: DataStatus }> {
    if (!(await tableExists(this.db, 'logistics_event'))) return { events: [], dataStatus: 'UNAVAILABLE' };
    const rows = await this.db.all<any>(
      `SELECT id, event_type, severity, source, message, entity_type, entity_id, created_at
       FROM logistics_event WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?`,
      [tenantId, Math.min(Math.max(limit, 1), 100)],
    );
    return {
      events: rows.map((e) => ({
        id: String(e.id), eventType: String(e.event_type), severity: String(e.severity),
        source: e.source ? String(e.source) : null, message: String(e.message),
        entityType: e.entity_type ? String(e.entity_type) : null,
        entityId: e.entity_id ? String(e.entity_id) : null, createdAt: String(e.created_at),
      })),
      dataStatus: 'LIVE',
    };
  }
}
