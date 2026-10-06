// Typed frontend client for the Slice 1 inventory contract.
// Cancellable, tenant-aware (server derives tenant from JWT), no fake fallbacks.

export type DataStatus = 'LIVE' | 'PARTIAL' | 'STALE' | 'UNAVAILABLE' | 'NOT_CONFIGURED';
export type HealthBand = 'HEALTHY' | 'LOW' | 'CRITICAL' | 'UNVERIFIED';

export interface OverviewKpis {
  totalInventoryValueKes: number | null;
  totalPositions: number;
  totalMaterials: number;
  openPurchaseOrders: number;
  inTransitMovements: number;
  warehouses: number;
  projectsActive: number | null;
  stockHealthPct: number | null;
  healthyCount: number; lowCount: number; criticalCount: number; unverifiedCount: number;
}

export interface InventoryOverview {
  kpis: OverviewKpis;
  topMaterialsByValue: Array<{ sku: string; description: string; quantity: number; valueKes: number | null; health: HealthBand }>;
  warehouses: Array<{ id: string; code: string; name: string; city: string | null; itemsCount: number; stockPercentage: number | null; alert: boolean; sourceTable: string }>;
  recentActivity: Array<{ id: string; eventType: string; severity: string; source: string | null; message: string; createdAt: string }>;
  network: {
    nodes: Array<{ id: string; kind: string; label: string; sublabel: string; count: number; status: DataStatus }>;
    edges: Array<{ from: string; to: string; label: string; count: number }>;
  };
  valueTrend: Array<{ date: string; valueKes: number | null }>;
  sap: { state: string; note: string };
  ai: { state: string; note: string };
  dataStatus: DataStatus;
  generatedAt: string;
}

export interface InventoryPosition {
  materialId: string; sku: string; description: string; materialGroup: string; uom: string;
  facilityId: string; facilityName: string; binLocation: string | null;
  onHand: number; reserved: number; available: number; inTransit: number; onOrder: number;
  safetyStock: number | null; unitCostKes: number | null; positionValueKes: number | null;
  health: HealthBand; healthReason: string;
}

export interface AtpComponent {
  key: string; label: string; value: number;
  evidence: 'measured' | 'no-records' | 'not-applicable'; source: string;
}

export interface MaterialDetail {
  material: { materialId: string; sku: string; description: string; materialGroup: string; uom: string; unitCostKes: number | null; status: string };
  atp: { onHand: number; inTransit: number; onOrder: number; reserved: number; allocated: number; committedDemand: number; forecastDemand: number; availableToPromise: number };
  atpComponents: AtpComponent[];
  positions: InventoryPosition[];
  linkedEvents: Array<{ id: string; eventType: string; severity: string; source: string | null; message: string; createdAt: string }>;
  orderLineCoverage: 'PRESENT' | 'ABSENT';
  projectLinkage: 'LINKED' | 'NO_EVIDENCE';
  criticality: { level: string; score: number | null; method: string; missingFactors: string[]; confidence: string };
  dataStatus: DataStatus;
  generatedAt: string;
}

export interface ProjectRequirement {
  id: string; requirementCode: string; projectName: string; substationTarget: string | null;
  description: string; requiredDate: string | null; deliveryStatus: string;
  progressPct: number | null; source: string; verifiedBy: string | null;
}

export type LoadState = 'loading' | 'ready' | 'empty' | 'error' | 'unauthorized' | 'forbidden';

export class InventoryApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function handle<T>(res: Response): Promise<{ data: T; dataStatus: DataStatus }> {
  if (res.status === 401) throw new InventoryApiError(401, 'UNAUTHORIZED', 'Session expired. Sign in again.');
  if (res.status === 403) throw new InventoryApiError(403, 'FORBIDDEN', 'Not authorized for Inventory Intelligence.');
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok) {
    throw new InventoryApiError(res.status, body?.error?.code || 'REQUEST_FAILED', body?.error?.message || `Request failed (${res.status}).`);
  }
  return { data: body.data as T, dataStatus: (body.dataStatus as DataStatus) || 'LIVE' };
}

export function fetchOverview(signal: AbortSignal): Promise<{ data: InventoryOverview; dataStatus: DataStatus }> {
  return fetch('/api/inventory/overview', { signal }).then(handle<InventoryOverview>);
}

export interface PositionQuery { q?: string; facilityId?: string; health?: string; }

export function fetchPositions(query: PositionQuery, signal: AbortSignal): Promise<{ data: { positions: InventoryPosition[]; total: number }; dataStatus: DataStatus }> {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.facilityId) params.set('facilityId', query.facilityId);
  if (query.health) params.set('health', query.health);
  const qs = params.toString();
  return fetch(`/api/inventory/positions${qs ? `?${qs}` : ''}`, { signal }).then((res) => handle<{ positions: InventoryPosition[]; total: number }>(res));
}

export function formatKes(v: number | null): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  if (Math.abs(v) >= 1_000_000_000) return `KES ${(v / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(v) >= 1_000_000) return `KES ${(v / 1_000_000).toFixed(1)}M`;
  return `KES ${Math.round(v).toLocaleString('en-KE')}`;
}

export function fetchMaterialDetail(sku: string, signal: AbortSignal): Promise<{ data: MaterialDetail; dataStatus: DataStatus }> {
  return fetch(`/api/inventory/materials/${encodeURIComponent(sku)}`, { signal }).then((res) => handle<MaterialDetail>(res));
}

export function fetchProjects(signal: AbortSignal): Promise<{ data: { projects: ProjectRequirement[] }; dataStatus: DataStatus }> {
  return fetch('/api/inventory/projects', { signal }).then((res) => handle<{ projects: ProjectRequirement[] }>(res));
}
