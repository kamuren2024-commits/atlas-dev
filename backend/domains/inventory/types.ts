// Salience Atlas — Inventory Intelligence OS canonical contracts.
// Consumer of the Atlas unified kernel. No local kernel substitutes.
// All quantities are in the material's canonical UOM. Money in KES minor honesty:
// values are derived from logistics_product.unit_cost * stock quantities.

export type DataStatus =
  | 'LIVE'
  | 'PARTIAL'
  | 'STALE'
  | 'UNAVAILABLE'
  | 'NOT_CONFIGURED';

export type SapIntegrationState =
  | 'CONNECTED'
  | 'PARTIAL'
  | 'DEGRADED'
  | 'UNAVAILABLE'
  | 'STALE'
  | 'NOT_CONFIGURED';

export type HealthBand = 'HEALTHY' | 'LOW' | 'CRITICAL' | 'UNVERIFIED';

export interface Provenance {
  sourceTable: string;
  dataSource: string;
  fetchedAt: string;
  tenantId: string;
}

export interface CanonicalMaterial {
  materialId: string;
  sku: string;
  description: string;
  materialGroup: string;
  uom: string;
  unitCostKes: number | null;
  status: string;
}

export interface InventoryPosition {
  materialId: string;
  sku: string;
  description: string;
  materialGroup: string;
  uom: string;
  facilityId: string;
  facilityName: string;
  binLocation: string | null;
  onHand: number;
  reserved: number;
  available: number;
  inTransit: number;
  onOrder: number;
  safetyStock: number | null;
  unitCostKes: number | null;
  positionValueKes: number | null;
  health: HealthBand;
  healthReason: string;
}

export interface AtpBreakdown {
  onHand: number;
  inTransit: number;
  onOrder: number;
  reserved: number;
  allocated: number;
  committedDemand: number;
  forecastDemand: number;
  availableToPromise: number;
}

export interface WarehouseSummary {
  id: string;
  code: string;
  name: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  itemsCount: number;
  stockPercentage: number | null;
  alert: boolean;
  sourceTable: 'logistics_warehouse' | 'logistics_facility';
}

export interface MovementEvent {
  id: string;
  eventType: string;
  severity: string;
  source: string | null;
  message: string;
  entityType: string | null;
  entityId: string | null;
  createdAt: string;
}

export interface NetworkNode {
  id: string;
  kind: 'SUPPLIER' | 'PURCHASE_ORDER' | 'SHIPMENT' | 'WAREHOUSE' | 'MATERIAL' | 'PROJECT' | 'ASSET';
  label: string;
  sublabel: string;
  count: number;
  status: DataStatus;
}

export interface NetworkEdge {
  from: string;
  to: string;
  label: string;
  count: number;
}

export interface OverviewKpis {
  totalInventoryValueKes: number | null;
  totalPositions: number;
  totalMaterials: number;
  openPurchaseOrders: number;
  inTransitMovements: number;
  warehouses: number;
  projectsActive: number | null;
  stockHealthPct: number | null;
  healthyCount: number;
  lowCount: number;
  criticalCount: number;
  unverifiedCount: number;
}

export interface InventoryOverview {
  kpis: OverviewKpis;
  topMaterialsByValue: Array<{
    sku: string;
    description: string;
    quantity: number;
    valueKes: number | null;
    health: HealthBand;
  }>;
  warehouses: WarehouseSummary[];
  recentActivity: MovementEvent[];
  network: { nodes: NetworkNode[]; edges: NetworkEdge[] };
  valueTrend: Array<{ date: string; valueKes: number | null }>;
  sap: { state: SapIntegrationState; note: string };
  ai: { state: 'CONTRACT_PENDING'; note: string };
  dataStatus: DataStatus;
  provenance: Provenance[];
  generatedAt: string;
}
