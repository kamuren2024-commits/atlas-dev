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
  categoryBreakdown: Array<{ category: string; positions: number; quantity: number; valueKes: number | null }>;
  warehouses: Array<{ id: string; code: string; name: string; city: string | null; itemsCount: number; stockPercentage: number | null; alert: boolean | null; sourceTable: string }>;
  recentActivity: Array<{ id: string; eventType: string; severity: string; source: string | null; message: string; createdAt: string }>;
  network: {
    nodes: Array<{ id: string; kind: string; label: string; sublabel: string; count: number; status: DataStatus }>;
    edges: Array<{ from: string; to: string; label: string; count: number }>;
  };
  valueTrend: Array<{ date: string; valueKes: number | null }>;
  sap: { state: string; note: string };
  ai: { state: string; note: string };
  dataStatus: DataStatus;
  provenance: Array<{ source: string; table: string; status: DataStatus }>;
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

export interface InventoryFacility {
  id: string; code: string; name: string; city: string | null;
  facilityType: string | null; operationalStatus: string | null;
  latitude: number | null; longitude: number | null;
  currentStock: number | null; capacity: number | null;
}

export interface TwinReferenceAsset {
  asset_id: string;
  asset_type: string;
  name: string;
  substation_id?: string | null;
  voltage_level?: string | null;
  rated_voltage_kv?: number | null;
  region?: string | null;
  operational_status?: string | null;
  source_system?: string | null;
}

export interface TwinReferenceCatalog {
  assets: TwinReferenceAsset[];
  dataProvenance: 'REFERENCE_DATA';
  dataStatus: DataStatus;
}

export type InventoryOperationType = 'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'TRANSFER' | 'RETURN' | 'PHYSICAL_COUNT' | 'ADJUSTMENT_REQUEST' | 'CRITICAL_SPARES_REVIEW' | 'MATERIAL_CREATED';
export type InventoryOperationStatus = 'POSTED' | 'IN_PROGRESS' | 'REVIEW_REQUIRED' | 'RECOUNT_REQUIRED' | 'RECONCILED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface InventoryOperation {
  id: string; reference: string; type: InventoryOperationType | string; status: InventoryOperationStatus | string;
  sku: string | null; description: string | null; quantity: number | null; uom: string | null;
  facilityId: string | null; facilityName: string | null; destinationFacilityId: string | null;
  destinationFacilityName: string | null; actorId: string; approverId: string | null;
  reason: string; createdAt: string; updatedAt: string;
}

export interface StocktakeLine {
  id: string; stockId: string; sku: string; description: string; facilityId: string; facilityName: string;
  binLocation: string | null; snapshotQuantity: number; countedQuantity: number | null; variance: number | null;
  lineStatus: 'PENDING' | 'COUNTED' | 'RECOUNT_REQUIRED' | 'RECOUNTED'; countRound: number;
}

export interface StocktakeSummary {
  id: string; reference: string; status: InventoryOperationStatus | string; facilityId: string | null;
  facilityName: string | null; lineCount: number; capturedCount: number; varianceCount: number;
  createdBy: string; createdAt: string; updatedAt: string;
}

export interface StocktakeDetail extends StocktakeSummary { reason: string; lines: StocktakeLine[]; }
export interface InventoryCapabilities { canCreate: boolean; canUpdate: boolean; canApprove: boolean; canReview: boolean; }
export interface InventorySearchResult {
  id: string; kind: 'material' | 'location' | 'purchase-order' | 'supplier' | 'work-order' | 'movement';
  label: string; subLabel: string; status: string | null; fields: Array<{ label: string; value: string }>;
}
export interface InventorySearchResponse { items: InventorySearchResult[]; sources: Record<string, DataStatus>; }
export interface AddMaterialInput { sku: string; name: string; category: string; uom: string; unitCostKes?: number | null; hazmat?: boolean; idempotencyKey: string; }
export interface RecordMovementInput {
  type: 'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'TRANSFER' | 'RETURN'; sku: string; quantity: number;
  facilityId: string; destinationFacilityId?: string; reason: string; idempotencyKey: string;
}

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

export function fetchOverview(signal?: AbortSignal): Promise<{ data: InventoryOverview; dataStatus: DataStatus }> {
  return fetch('/api/inventory/overview', signal ? { signal } : undefined).then(handle<InventoryOverview>);
}

export interface PositionQuery { q?: string; facilityId?: string; health?: string; }

export function fetchPositions(query: PositionQuery, signal?: AbortSignal): Promise<{ data: { positions: InventoryPosition[]; total: number }; dataStatus: DataStatus }> {
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

export function fetchMaterialDetail(sku: string, signal?: AbortSignal): Promise<{ data: MaterialDetail; dataStatus: DataStatus }> {
  return fetch(`/api/inventory/materials/${encodeURIComponent(sku)}`, { signal }).then((res) => handle<MaterialDetail>(res));
}

export function fetchProjects(signal?: AbortSignal): Promise<{ data: { projects: ProjectRequirement[] }; dataStatus: DataStatus }> {
  return fetch('/api/inventory/projects', signal ? { signal } : undefined).then((res) => handle<{ projects: ProjectRequirement[] }>(res));
}

async function postJson<T>(path: string, input: Record<string, unknown>): Promise<{ data: T; dataStatus: DataStatus }> {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': String(input.idempotencyKey || crypto.randomUUID()),
    },
    body: JSON.stringify(input),
  });
  return handle<T>(response);
}

export function fetchFacilities(signal?: AbortSignal) {
  return fetch('/api/inventory/facilities', signal ? { signal } : undefined)
    .then((res) => handle<{ facilities: InventoryFacility[] }>(res));
}

export async function fetchTwinReferenceCatalog(signal?: AbortSignal): Promise<TwinReferenceCatalog> {
  const response = await fetch('/api/twin/assets', signal ? { signal } : undefined);
  if (!response.ok) throw new InventoryApiError(response.status, 'TWIN_CATALOG_UNAVAILABLE', 'Reference asset catalog is unavailable.');
  const body = await response.json().catch(() => null);
  if (body?.data_provenance !== 'REFERENCE_DATA' || !Array.isArray(body.assets)) {
    throw new InventoryApiError(502, 'TWIN_CATALOG_INVALID', 'Asset catalog did not return a recognized provenance contract.');
  }
  return { assets: body.assets as TwinReferenceAsset[], dataProvenance: 'REFERENCE_DATA', dataStatus: 'PARTIAL' };
}

export function fetchCapabilities(signal?: AbortSignal) {
  return fetch('/api/inventory/capabilities', signal ? { signal } : undefined)
    .then((res) => handle<InventoryCapabilities>(res));
}

export function fetchInventoryMovements(limit = 12, signal?: AbortSignal) {
  const params = new URLSearchParams({ limit: String(limit) });
  return fetch(`/api/inventory/movements?${params}`, signal ? { signal } : undefined)
    .then((res) => handle<{ movements: InventoryOperation[]; events: InventoryOverview['recentActivity'] }>(res));
}

export function fetchApprovals(signal?: AbortSignal) {
  return fetch('/api/inventory/approvals', signal ? { signal } : undefined)
    .then((res) => handle<{ approvals: InventoryOperation[] }>(res));
}

export function fetchStocktakes(limit = 8, signal?: AbortSignal) {
  const params = new URLSearchParams({ limit: String(limit) });
  return fetch(`/api/inventory/stocktakes?${params}`, signal ? { signal } : undefined)
    .then((res) => handle<{ stocktakes: StocktakeSummary[] }>(res));
}

export function fetchStocktake(id: string, signal?: AbortSignal) {
  return fetch(`/api/inventory/stocktakes/${encodeURIComponent(id)}`, signal ? { signal } : undefined)
    .then((res) => handle<{ stocktake: StocktakeDetail }>(res));
}

export function searchInventory(query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ q: query });
  return fetch(`/api/inventory/search?${params}`, signal ? { signal } : undefined)
    .then((res) => handle<InventorySearchResponse>(res));
}

export function addMaterial(input: AddMaterialInput) {
  return postJson<{ operation: InventoryOperation }>(`/api/inventory/materials`, input as unknown as Record<string, unknown>);
}

export function recordInventoryMovement(input: RecordMovementInput) {
  return postJson<{ operation: InventoryOperation; replayed: boolean }>(`/api/inventory/movements`, input as unknown as Record<string, unknown>);
}

export function startStocktake(input: { facilityId?: string; reason: string; idempotencyKey: string }) {
  return postJson<{ stocktake: StocktakeSummary }>(`/api/inventory/stocktakes`, input);
}

export function captureStocktakeCount(id: string, input: { lineId: string; countedQuantity: number; idempotencyKey: string }) {
  return postJson<{ line: StocktakeLine }>(`/api/inventory/stocktakes/${encodeURIComponent(id)}/counts`, input);
}

export function submitStocktake(id: string, input: { reason: string; idempotencyKey: string }) {
  return postJson<{ stocktake: StocktakeSummary }>(`/api/inventory/stocktakes/${encodeURIComponent(id)}/submit`, input);
}

export function requestStocktakeRecount(id: string, input: { reason: string; idempotencyKey: string }) {
  return postJson<{ stocktake: StocktakeSummary }>(`/api/inventory/stocktakes/${encodeURIComponent(id)}/recount`, input);
}

export function reconcileStocktake(id: string, input: { reason: string; idempotencyKey: string }) {
  return postJson<{ stocktake: StocktakeSummary }>(`/api/inventory/stocktakes/${encodeURIComponent(id)}/reconcile`, input);
}

export function requestInventoryAdjustment(input: { sku: string; facilityId: string; targetQuantity: number; reason: string; idempotencyKey: string }) {
  return postJson<{ operation: InventoryOperation }>(`/api/inventory/adjustments`, input);
}

export function reviewCriticalSpare(input: { sku: string; classification: 'CRITICAL' | 'STANDARD' | 'UNVERIFIED'; rationale: string; idempotencyKey: string }) {
  return postJson<{ operation: InventoryOperation }>(`/api/inventory/reviews/critical-spares`, input);
}

export function approveInventoryOperation(id: string, input: { reason: string; idempotencyKey: string }) {
  return postJson<{ operation: InventoryOperation }>(`/api/inventory/operations/${encodeURIComponent(id)}/approve`, input);
}

export function rejectInventoryOperation(id: string, input: { reason: string; idempotencyKey: string }) {
  return postJson<{ operation: InventoryOperation }>(`/api/inventory/operations/${encodeURIComponent(id)}/reject`, input);
}
