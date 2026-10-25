import React, { useRef, useState } from 'react';
import useSWR from 'swr';
import {
  Activity, ArrowLeftRight, BadgeCheck, ClipboardCheck, ClipboardList, PackagePlus,
  RefreshCw, ShieldCheck, Truck, Wrench,
} from 'lucide-react';
import {
  addMaterial, approveInventoryOperation, captureStocktakeCount, fetchApprovals,
  fetchCapabilities, fetchFacilities, fetchInventoryMovements, fetchStocktake,
  fetchStocktakes, recordInventoryMovement, reconcileStocktake,
  rejectInventoryOperation, requestInventoryAdjustment, requestStocktakeRecount,
  reviewCriticalSpare, startStocktake, submitStocktake, InventoryApiError,
  type InventoryCapabilities, type InventoryFacility, type InventoryOperation,
  type StocktakeDetail,
} from './api';

export type InventoryWorkflowTab = 'activity' | 'movement' | 'stocktake' | 'adjustment' | 'material' | 'critical-spares' | 'approvals' | 'audit';

interface InventoryOperationsWorkspaceProps {
  activeTab: InventoryWorkflowTab;
  onTabChange: (tab: InventoryWorkflowTab) => void;
  onNavigate: (tab: InventoryWorkflowTab) => void;
  onOpenMaterial: (sku: string) => void;
  onRefresh?: () => Promise<unknown> | unknown;
  compact?: boolean;
}

const WORKFLOW_TABS: Array<{ id: InventoryWorkflowTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'movement', label: 'Stock movement', icon: ArrowLeftRight },
  { id: 'stocktake', label: 'Physical count', icon: ClipboardCheck },
  { id: 'adjustment', label: 'Adjustment request', icon: Wrench },
  { id: 'material', label: 'Material master', icon: PackagePlus },
  { id: 'critical-spares', label: 'Critical spares', icon: ShieldCheck },
  { id: 'approvals', label: 'Approvals', icon: BadgeCheck },
  { id: 'audit', label: 'Audit history', icon: Activity },
];

function timestamp(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('en-KE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="flex min-w-0 flex-col gap-1 text-[10px] font-mono text-slate-400"><span>{label}</span>{children}</label>;
}

const controlClass = 'w-full rounded-lg border border-slate-700 bg-[#07101d] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-600 focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/10';
const primaryButtonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-[10px] font-mono font-semibold tracking-wide text-cyan-200 transition hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-40';

export default function InventoryOperationsWorkspace({
  activeTab, onTabChange, onNavigate, onOpenMaterial, onRefresh, compact = false,
}: InventoryOperationsWorkspaceProps) {
  const facilityResult = useSWR('inventory-facilities', () => fetchFacilities(), { revalidateOnFocus: false });
  const capabilityResult = useSWR('inventory-capabilities', () => fetchCapabilities(), { revalidateOnFocus: false });
  const movementResult = useSWR('inventory-movement-feed', () => fetchInventoryMovements(20), { revalidateOnFocus: false });
  const stocktakeResult = useSWR('inventory-stocktake-list', () => fetchStocktakes(10), { revalidateOnFocus: false });
  const capabilities: InventoryCapabilities | undefined = capabilityResult.data?.data;
  const facilities: InventoryFacility[] = facilityResult.data?.data.facilities || [];
  const operations: InventoryOperation[] = movementResult.data?.data.movements || [];
  const events = movementResult.data?.data.events || [];
  const stocktakes = stocktakeResult.data?.data.stocktakes || [];
  const approvalsKey = capabilities?.canApprove ? 'inventory-approval-queue' : null;
  const approvalResult = useSWR(approvalsKey, () => fetchApprovals(), { revalidateOnFocus: false, shouldRetryOnError: false });

  const [selectedStocktakeId, setSelectedStocktakeId] = useState<string | null>(null);
  const detailResult = useSWR(selectedStocktakeId ? ['inventory-stocktake-detail', selectedStocktakeId] : null,
    ([, id]) => fetchStocktake(String(id)), { revalidateOnFocus: false, shouldRetryOnError: false });
  const stocktakeDetail: StocktakeDetail | undefined = detailResult.data?.data.stocktake;

  const [movementType, setMovementType] = useState<'GOODS_RECEIPT' | 'GOODS_ISSUE' | 'TRANSFER' | 'RETURN'>('GOODS_RECEIPT');
  const [movementSku, setMovementSku] = useState('');
  const [movementQuantity, setMovementQuantity] = useState('1');
  const [movementFacility, setMovementFacility] = useState('');
  const [movementDestination, setMovementDestination] = useState('');
  const [movementReason, setMovementReason] = useState('');

  const [stocktakeFacility, setStocktakeFacility] = useState('');
  const [stocktakeReason, setStocktakeReason] = useState('');
  const [countDrafts, setCountDrafts] = useState<Record<string, string>>({});
  const [reviewReason, setReviewReason] = useState('');

  const [adjustmentSku, setAdjustmentSku] = useState('');
  const [adjustmentFacility, setAdjustmentFacility] = useState('');
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const [materialSku, setMaterialSku] = useState('');
  const [materialName, setMaterialName] = useState('');
  const [materialCategory, setMaterialCategory] = useState('');
  const [materialUom, setMaterialUom] = useState('PCS');
  const [materialCost, setMaterialCost] = useState('');
  const [materialHazmat, setMaterialHazmat] = useState(false);

  const [criticalSku, setCriticalSku] = useState('');
  const [criticalClassification, setCriticalClassification] = useState<'CRITICAL' | 'STANDARD' | 'UNVERIFIED'>('UNVERIFIED');
  const [criticalRationale, setCriticalRationale] = useState('');
  const [approvalReason, setApprovalReason] = useState('');

  const [busyAction, setBusyAction] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const requestKeys = useRef(new Map<string, string>());

  const getRequestKey = (scope: string, input: unknown) => {
    const fingerprint = `${scope}:${JSON.stringify(input)}`;
    let key = requestKeys.current.get(fingerprint);
    if (!key) {
      key = crypto.randomUUID();
      requestKeys.current.set(fingerprint, key);
    }
    return { fingerprint, key };
  };

  const refreshWorkspace = async () => {
    await Promise.all([
      movementResult.mutate(), stocktakeResult.mutate(), approvalResult.mutate(),
      detailResult.mutate(), Promise.resolve(onRefresh?.()),
    ]);
  };

  const runWrite = async <T,>(scope: string, fingerprintInput: unknown, write: (key: string) => Promise<{ data: T }>): Promise<T | null> => {
    if (busyAction) return null;
    const { fingerprint, key } = getRequestKey(scope, fingerprintInput);
    setBusyAction(scope);
    setActionError('');
    setActionSuccess('');
    try {
      const result = await write(key);
      requestKeys.current.delete(fingerprint);
      setActionSuccess(`${scope.replaceAll('-', ' ')} saved to the tenant inventory ledger.`);
      await refreshWorkspace();
      return result.data;
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Inventory operation failed. No successful outcome was confirmed.');
      return null;
    } finally {
      setBusyAction('');
    }
  };

  const confirmWrite = (message: string) => typeof window === 'undefined' || window.confirm(message);
  const actionAllowed = (action: 'create' | 'update' | 'approve') => {
    if (!capabilities) return false;
    if (action === 'create') return capabilities.canCreate;
    if (action === 'approve') return capabilities.canApprove;
    return capabilities.canUpdate;
  };

  const submitMovement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = {
      type: movementType, sku: movementSku.trim().toUpperCase(), quantity: Number(movementQuantity),
      facilityId: movementFacility, destinationFacilityId: movementType === 'TRANSFER' ? movementDestination : undefined,
      reason: movementReason.trim(),
    };
    if (!confirmWrite(`Confirm ${movementType.replaceAll('_', ' ').toLowerCase()} for ${input.quantity} ${input.sku}? This will update persisted stock balances.`)) return;
    const result = await runWrite('stock-movement', input, (idempotencyKey) => recordInventoryMovement({ ...input, idempotencyKey }));
    if (result) {
      setMovementReason('');
      setActionSuccess(`Movement ${String((result as { operation?: InventoryOperation }).operation?.reference || '')} posted. The stock ledger was updated.`);
    }
  };

  const startCount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = { facilityId: stocktakeFacility || undefined, reason: stocktakeReason.trim() };
    if (!confirmWrite('Start a physical count session? This snapshots current stock for variance review; it does not change balances.')) return;
    const result = await runWrite('stocktake-session', input, (idempotencyKey) => startStocktake({ ...input, idempotencyKey }));
    const stocktake = (result as { stocktake?: { id: string } } | null)?.stocktake;
    if (stocktake?.id) setSelectedStocktakeId(stocktake.id);
  };

  const captureCount = async (lineId: string, value: string) => {
    const detail = stocktakeDetail;
    if (!detail) return;
    const input = { stocktakeId: detail.id, lineId, countedQuantity: Number(value) };
    const result = await runWrite(`count-${lineId}`, input, (idempotencyKey) => captureStocktakeCount(detail.id, { lineId, countedQuantity: Number(value), idempotencyKey }));
    if (result) setCountDrafts((current) => ({ ...current, [lineId]: '' }));
  };

  const submitCountSession = async () => {
    if (!stocktakeDetail) return;
    const reason = reviewReason.trim();
    if (!confirmWrite(`Submit ${stocktakeDetail.reference} for variance review?`)) return;
    await runWrite('stocktake-submit', { id: stocktakeDetail.id, reason }, (idempotencyKey) => submitStocktake(stocktakeDetail.id, { reason, idempotencyKey }));
  };

  const requestRecount = async () => {
    if (!stocktakeDetail) return;
    const reason = reviewReason.trim();
    if (!confirmWrite(`Request a recount of flagged variance lines for ${stocktakeDetail.reference}?`)) return;
    await runWrite('stocktake-recount', { id: stocktakeDetail.id, reason }, (idempotencyKey) => requestStocktakeRecount(stocktakeDetail.id, { reason, idempotencyKey }));
  };

  const reconcileCount = async () => {
    if (!stocktakeDetail) return;
    const reason = reviewReason.trim();
    if (!confirmWrite(`Reconcile ${stocktakeDetail.varianceCount} variance lines for ${stocktakeDetail.reference}? This posts the approved counted quantities to stock.`)) return;
    await runWrite('stocktake-reconcile', { id: stocktakeDetail.id, reason }, (idempotencyKey) => reconcileStocktake(stocktakeDetail.id, { reason, idempotencyKey }));
  };

  const submitAdjustment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = { sku: adjustmentSku.trim().toUpperCase(), facilityId: adjustmentFacility, targetQuantity: Number(adjustmentQuantity), reason: adjustmentReason.trim() };
    if (!confirmWrite(`Request an on-hand quantity change for ${input.sku}? The balance remains unchanged until a different authorized user approves it.`)) return;
    const result = await runWrite('adjustment-request', input, (idempotencyKey) => requestInventoryAdjustment({ ...input, idempotencyKey }));
    if (result) setAdjustmentReason('');
  };

  const submitMaterial = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = { sku: materialSku.trim().toUpperCase(), name: materialName.trim(), category: materialCategory.trim(), uom: materialUom.trim().toUpperCase(), unitCostKes: materialCost === '' ? null : Number(materialCost), hazmat: materialHazmat };
    if (!confirmWrite(`Create material master ${input.sku}${input.hazmat ? ' as a pending hazardous-material approval' : ''}?`)) return;
    const result = await runWrite('material-create', input, (idempotencyKey) => addMaterial({ ...input, idempotencyKey }));
    if (result) {
      setMaterialSku(''); setMaterialName(''); setMaterialCategory(''); setMaterialCost(''); setMaterialHazmat(false);
    }
  };

  const submitCriticalReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = { sku: criticalSku.trim().toUpperCase(), classification: criticalClassification, rationale: criticalRationale.trim() };
    if (!confirmWrite(`Record a human review of ${input.sku} as ${input.classification}?`)) return;
    const result = await runWrite('critical-spares-review', input, (idempotencyKey) => reviewCriticalSpare({ ...input, idempotencyKey }));
    if (result) setCriticalRationale('');
  };

  const decideApproval = async (operation: InventoryOperation, decision: 'approve' | 'reject') => {
    const reason = approvalReason.trim();
    const message = decision === 'approve'
      ? `Approve ${operation.reference}? Any associated stock change will be posted immediately.`
      : `Reject ${operation.reference}? The pending request will be closed without posting its stock change.`;
    if (!confirmWrite(message)) return;
    await runWrite(`operation-${decision}-${operation.id}`, { id: operation.id, reason }, (idempotencyKey) => decision === 'approve'
      ? approveInventoryOperation(operation.id, { reason, idempotencyKey })
      : rejectInventoryOperation(operation.id, { reason, idempotencyKey }));
  };

  const sourceError = [facilityResult.error, capabilityResult.error, movementResult.error, stocktakeResult.error]
    .find((error) => error instanceof InventoryApiError && (error.status === 401 || error.status === 403));
  const latestStocktake = stocktakes[0];

  if (compact) {
    return (
      <section className="rounded-2xl border border-cyan-500/15 bg-[#091321]/90 p-4" aria-label="Recent inventory operations">
        <div className="mb-3 flex items-center justify-between gap-2">
          <div><h2 className="text-xs font-bold uppercase tracking-wider text-white">Recent movements</h2><p className="mt-1 text-[9px] font-mono text-slate-500">Tenant ledger · verified server results</p></div>
          <button type="button" onClick={() => void movementResult.mutate()} className="rounded-md border border-slate-700 p-1.5 text-slate-400 hover:text-cyan-200" aria-label="Refresh recent inventory movements"><RefreshCw className="size-3" /></button>
        </div>
        {sourceError && <p className="mb-2 text-[10px] text-rose-300">Inventory session or authorization is required.</p>}
        {movementResult.isLoading && <p className="py-4 text-center text-[10px] font-mono text-cyan-200">Loading persisted movement history…</p>}
        {!movementResult.isLoading && !sourceError && operations.length === 0 && <p className="py-4 text-center text-[10px] text-slate-500">No inventory operations are recorded for this tenant.</p>}
        {operations.slice(0, 5).map((operation) => (
          <div key={operation.id} className="flex items-center gap-2 border-t border-slate-800/70 py-2 first:border-t-0">
            <span className="size-1.5 shrink-0 rounded-full bg-cyan-300" />
            <span className="min-w-0 flex-1"><span className="block truncate text-[10px] text-slate-200">{operation.type.replaceAll('_', ' ')} · {operation.sku || operation.reference}</span><span className="font-mono text-[9px] text-slate-500">{operation.reference} · {timestamp(operation.createdAt)}</span></span>
            <span className="shrink-0 rounded border border-slate-700 px-1.5 py-0.5 font-mono text-[8px] text-slate-300">{operation.status}</span>
            {operation.sku && <button type="button" onClick={() => onOpenMaterial(operation.sku!)} className="text-[9px] font-mono text-cyan-300 hover:underline">DETAIL</button>}
          </div>
        ))}
        <div className="mt-3 border-t border-slate-800/80 pt-3">
          <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-[9px] font-bold uppercase tracking-wider text-slate-300">Physical count progress</h3><span className="font-mono text-[8px] text-slate-500">{stocktakeResult.data?.dataStatus || (stocktakeResult.isLoading ? 'LOADING' : 'UNAVAILABLE')}</span></div>
          {stocktakeResult.isLoading && <p className="py-2 text-[9px] text-cyan-200">Loading persisted count sessions…</p>}
          {!stocktakeResult.isLoading && !latestStocktake && <p className="py-2 text-[9px] text-slate-500">No physical count sessions are recorded.</p>}
          {latestStocktake && <button type="button" onClick={() => onNavigate('stocktake')} className="w-full rounded-lg border border-slate-800 bg-[#07101d] p-2 text-left hover:border-cyan-500/30"><span className="flex items-center justify-between gap-2 text-[9px] text-slate-200"><span className="truncate">{latestStocktake.reference} · {latestStocktake.status}</span><span>{latestStocktake.lineCount ? Math.round((latestStocktake.capturedCount / latestStocktake.lineCount) * 100) : 0}%</span></span><span className="mt-1 block h-1.5 overflow-hidden rounded bg-slate-800"><span className="block h-full rounded bg-cyan-400" style={{ width: `${latestStocktake.lineCount ? Math.min(100, (latestStocktake.capturedCount / latestStocktake.lineCount) * 100) : 0}%` }} /></span><span className="mt-1 block font-mono text-[8px] text-slate-500">{latestStocktake.capturedCount}/{latestStocktake.lineCount} lines · {latestStocktake.varianceCount} variance</span></button>}
        </div>
        <div className="mt-3 border-t border-slate-800/80 pt-3">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider text-slate-300">Operational actions</p>
          <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => onNavigate('movement')} className={primaryButtonClass}><ArrowLeftRight className="size-3" /> Log movement</button>
          <button type="button" onClick={() => onNavigate('stocktake')} className={primaryButtonClass}><ClipboardCheck className="size-3" /> Physical count</button>
          <button type="button" onClick={() => onNavigate('adjustment')} className={primaryButtonClass}><Wrench className="size-3" /> Request adjustment</button>
          <button type="button" onClick={() => onNavigate('approvals')} className={primaryButtonClass}><BadgeCheck className="size-3" /> Review queue</button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-cyan-500/15 bg-[#091321]/90" aria-label="Inventory workflow workspace">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/80 p-4">
        <div className="min-w-0"><p className="text-[9px] font-mono uppercase tracking-[0.22em] text-cyan-400">Governed inventory workflows</p><h2 className="text-sm font-semibold text-white">Operations workbench</h2></div>
        <div className="ml-auto flex items-center gap-2">
          {capabilityResult.isLoading && <span className="text-[9px] font-mono text-slate-500">Checking permissions…</span>}
          {capabilities && <span className="rounded-full border border-slate-700 px-2 py-1 text-[9px] font-mono text-slate-400">CREATE {capabilities.canCreate ? 'ON' : 'OFF'} · UPDATE {capabilities.canUpdate ? 'ON' : 'OFF'} · APPROVE {capabilities.canApprove ? 'ON' : 'OFF'}</span>}
          <button type="button" onClick={() => void refreshWorkspace()} className="rounded-md border border-slate-700 p-1.5 text-slate-300 hover:border-cyan-400/50" aria-label="Refresh inventory workspace"><RefreshCw className="size-3.5" /></button>
        </div>
      </div>
      {sourceError && <div className="border-b border-rose-500/20 bg-rose-500/5 px-4 py-2 text-[10px] text-rose-200">Session or permission required. No simulated inventory actions are available.</div>}
      {actionError && <div className="border-b border-rose-500/20 bg-rose-500/5 px-4 py-2 text-[10px] text-rose-200" role="alert">{actionError}</div>}
      {actionSuccess && <div className="border-b border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-[10px] text-emerald-200" role="status">{actionSuccess}</div>}

      <div role="tablist" aria-label="Inventory workflow" className="flex gap-1 overflow-x-auto border-b border-slate-800/80 px-3 py-2">
        {WORKFLOW_TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} type="button" role="tab" aria-selected={activeTab === id} onClick={() => onTabChange(id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-[10px] font-mono transition ${activeTab === id ? 'bg-cyan-500/10 text-cyan-200' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>
            <Icon className="size-3.5" /> {label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'movement' && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.8fr)]">
            <form onSubmit={submitMovement} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Movement type"><select className={controlClass} value={movementType} onChange={(event) => setMovementType(event.target.value as typeof movementType)}><option value="GOODS_RECEIPT">Goods receipt</option><option value="GOODS_ISSUE">Goods issue</option><option value="TRANSFER">Stock transfer</option><option value="RETURN">Material return</option></select></Field>
              <Field label="Material SKU"><input className={controlClass} required maxLength={64} value={movementSku} onChange={(event) => setMovementSku(event.target.value)} placeholder="Enter an existing SKU" /></Field>
              <Field label="Quantity (whole units)"><input className={controlClass} type="number" required min={1} max={1000000} step={1} value={movementQuantity} onChange={(event) => setMovementQuantity(event.target.value)} /></Field>
              <Field label="Origin / destination facility"><select className={controlClass} required value={movementFacility} onChange={(event) => setMovementFacility(event.target.value)}><option value="">Select facility</option>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.code} · {facility.name}</option>)}</select></Field>
              {movementType === 'TRANSFER' && <Field label="Transfer destination"><select className={controlClass} required value={movementDestination} onChange={(event) => setMovementDestination(event.target.value)}><option value="">Select destination</option>{facilities.filter((facility) => facility.id !== movementFacility).map((facility) => <option key={facility.id} value={facility.id}>{facility.code} · {facility.name}</option>)}</select></Field>}
              <div className="sm:col-span-2"><Field label="Business reason"><textarea className={`${controlClass} min-h-20 resize-y`} required minLength={4} maxLength={500} value={movementReason} onChange={(event) => setMovementReason(event.target.value)} placeholder="Record the receiving note, issue reference, transfer reason, or return cause" /></Field></div>
              <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
                <button type="submit" disabled={!actionAllowed('update') || Boolean(busyAction) || !facilities.length} className={primaryButtonClass}>{busyAction === 'stock-movement' ? 'Posting…' : 'POST MOVEMENT'}</button>
                {!actionAllowed('update') && <span className="text-[10px] text-amber-200">Inventory update permission is required.</span>}
              </div>
            </form>
            <div className="rounded-xl border border-slate-800 bg-[#07101d] p-3">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Ledger behavior</h3>
              <ul className="mt-2 flex flex-col gap-2 text-[10px] leading-relaxed text-slate-400">
                <li>Receipts and returns add to the selected SKU and facility.</li>
                <li>Issues and transfers cannot consume reserved stock or exceed available units.</li>
                <li>Transfers update both facility balances in one database transaction.</li>
                <li>Each submission carries an idempotency key and writes an audit event.</li>
              </ul>
              <div className="mt-3 border-t border-slate-800 pt-3 text-[9px] font-mono text-slate-500">Facilities returned: {facilityResult.data?.dataStatus || (facilityResult.isLoading ? 'LOADING' : 'UNAVAILABLE')} · movement feed: {movementResult.data?.dataStatus || (movementResult.isLoading ? 'LOADING' : 'UNAVAILABLE')}</div>
            </div>
          </div>
        )}

        {activeTab === 'stocktake' && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)]">
            <div className="flex flex-col gap-4">
              <form onSubmit={startCount} className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-[#07101d] p-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Start a physical count</h3>
                <Field label="Facility scope"><select className={controlClass} value={stocktakeFacility} onChange={(event) => setStocktakeFacility(event.target.value)}><option value="">All facilities</option>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.code} · {facility.name}</option>)}</select></Field>
                <Field label="Reason / count authorization"><textarea className={`${controlClass} min-h-16 resize-y`} required minLength={4} maxLength={500} value={stocktakeReason} onChange={(event) => setStocktakeReason(event.target.value)} placeholder="Cycle count, annual audit, or approved recount" /></Field>
                <button type="submit" disabled={!actionAllowed('create') || Boolean(busyAction)} className={primaryButtonClass}>{busyAction === 'stocktake-session' ? 'Creating session…' : 'START COUNT SESSION'}</button>
              </form>
              <div className="rounded-xl border border-slate-800 bg-[#07101d] p-3">
                <div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Recent sessions</h3><span className="text-[9px] font-mono text-slate-500">{stocktakeResult.data?.dataStatus || (stocktakeResult.isLoading ? 'LOADING' : 'UNAVAILABLE')}</span></div>
                {stocktakeResult.isLoading && <p className="py-3 text-[10px] text-cyan-200">Loading count sessions…</p>}
                {!stocktakeResult.isLoading && stocktakes.length === 0 && <p className="py-3 text-[10px] text-slate-500">No count sessions are recorded for this tenant.</p>}
                <ul className="flex flex-col divide-y divide-slate-800/80">
                  {stocktakes.map((stocktake) => <li key={stocktake.id}><button type="button" onClick={() => setSelectedStocktakeId(stocktake.id)} aria-pressed={selectedStocktakeId === stocktake.id} className={`flex w-full items-center gap-2 py-2 text-left ${selectedStocktakeId === stocktake.id ? 'text-cyan-200' : 'text-slate-300 hover:text-white'}`}><ClipboardList className="size-3.5 shrink-0" /><span className="min-w-0 flex-1"><span className="block truncate text-[10px]">{stocktake.reference} · {stocktake.facilityName || 'All facilities'}</span><span className="font-mono text-[9px] text-slate-500">{stocktake.capturedCount}/{stocktake.lineCount} counted · {stocktake.varianceCount} variance</span></span><span className="shrink-0 font-mono text-[8px] text-slate-500">{stocktake.status}</span></button></li>)}
                </ul>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#07101d] p-3">
              {!selectedStocktakeId && <p className="py-10 text-center text-[10px] text-slate-500">Select a persisted session to capture counts or submit variances.</p>}
              {selectedStocktakeId && detailResult.isLoading && <p className="py-10 text-center text-[10px] font-mono text-cyan-200">Loading count lines…</p>}
              {selectedStocktakeId && detailResult.error && <p className="py-10 text-center text-[10px] text-rose-300">Count session detail failed to load. Refresh and retry.</p>}
              {stocktakeDetail && (
                <>
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div><h3 className="text-[11px] font-bold text-white">{stocktakeDetail.reference}</h3><p className="mt-1 text-[9px] font-mono text-slate-500">{stocktakeDetail.status} · {stocktakeDetail.capturedCount}/{stocktakeDetail.lineCount} counted · {stocktakeDetail.varianceCount} variances</p></div>
                    <button type="button" onClick={() => void detailResult.mutate()} className="rounded-md border border-slate-700 p-1.5 text-slate-300" aria-label="Refresh selected count session"><RefreshCw className="size-3" /></button>
                  </div>
                  <div className="max-h-64 overflow-auto rounded-lg border border-slate-800">
                    <table className="w-full min-w-[520px] text-left text-[9px]">
                      <thead className="sticky top-0 bg-[#101c2b] text-slate-400"><tr><th className="px-2 py-2">SKU / facility</th><th className="px-2 py-2 text-right">Snapshot</th><th className="px-2 py-2 text-right">Count</th><th className="px-2 py-2">State</th><th className="px-2 py-2"></th></tr></thead>
                      <tbody>{stocktakeDetail.lines.map((line) => <tr key={line.id} className="border-t border-slate-800/70"><td className="max-w-[170px] px-2 py-2"><button type="button" onClick={() => onOpenMaterial(line.sku)} className="block truncate font-mono text-cyan-300 hover:underline">{line.sku}</button><span className="block truncate text-slate-500">{line.facilityName}{line.binLocation ? ` · ${line.binLocation}` : ''}</span></td><td className="px-2 py-2 text-right font-mono text-slate-300">{line.snapshotQuantity.toLocaleString()}</td><td className="px-2 py-2 text-right"><input aria-label={`Count for ${line.sku}`} className="w-20 rounded border border-slate-700 bg-slate-950 px-2 py-1 text-right font-mono text-slate-100" type="number" min={0} max={1000000} step={1} value={countDrafts[line.id] ?? (line.countedQuantity === null ? '' : String(line.countedQuantity))} onChange={(event) => setCountDrafts((current) => ({ ...current, [line.id]: event.target.value }))} disabled={!actionAllowed('update') || !['IN_PROGRESS', 'RECOUNT_REQUIRED'].includes(stocktakeDetail.status)} /></td><td className="px-2 py-2 font-mono text-slate-400">{line.lineStatus}{line.variance !== null && line.variance !== 0 ? ` · Δ ${line.variance > 0 ? '+' : ''}${line.variance}` : ''}</td><td className="px-2 py-2"><button type="button" onClick={() => void captureCount(line.id, countDrafts[line.id] ?? String(line.countedQuantity ?? ''))} disabled={!actionAllowed('update') || busyAction === `count-${line.id}` || countDrafts[line.id] === undefined || countDrafts[line.id] === '' || !['IN_PROGRESS', 'RECOUNT_REQUIRED'].includes(stocktakeDetail.status)} className="rounded border border-cyan-500/30 px-2 py-1 font-mono text-[8px] text-cyan-200 disabled:opacity-40">SAVE</button></td></tr>)}</tbody>
                    </table>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
                    <Field label="Review / reconciliation reason"><input className={controlClass} minLength={4} maxLength={500} value={reviewReason} onChange={(event) => setReviewReason(event.target.value)} placeholder="Required for submit, recount, or reconciliation" /></Field>
                    <div className="flex flex-wrap gap-2">
                      {stocktakeDetail.status === 'IN_PROGRESS' && <button type="button" onClick={() => void submitCountSession()} disabled={!actionAllowed('update') || busyAction === 'stocktake-submit' || reviewReason.trim().length < 4 || stocktakeDetail.capturedCount !== stocktakeDetail.lineCount} className={primaryButtonClass}>SUBMIT</button>}
                      {stocktakeDetail.status === 'REVIEW_REQUIRED' && <><button type="button" onClick={() => void requestRecount()} disabled={!actionAllowed('update') || busyAction === 'stocktake-recount' || !stocktakeDetail.varianceCount || reviewReason.trim().length < 4} className={primaryButtonClass}>REQUEST RECOUNT</button><button type="button" onClick={() => void reconcileCount()} disabled={!actionAllowed('approve') || busyAction === 'stocktake-reconcile' || reviewReason.trim().length < 4} className={primaryButtonClass}>RECONCILE</button></>}
                      {stocktakeDetail.status === 'RECOUNT_REQUIRED' && <button type="button" onClick={() => void submitCountSession()} disabled={!actionAllowed('update') || busyAction === 'stocktake-submit' || reviewReason.trim().length < 4 || stocktakeDetail.lines.some((line) => line.lineStatus === 'RECOUNT_REQUIRED')} className={primaryButtonClass}>RESUBMIT</button>}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'adjustment' && (
          <form onSubmit={submitAdjustment} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-4xl">
            <div className="sm:col-span-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] leading-relaxed text-amber-100">An adjustment request does not alter balances. A different authorized approver must approve it, and the server rechecks the balance before posting.</div>
            <Field label="Material SKU"><input className={controlClass} required maxLength={64} value={adjustmentSku} onChange={(event) => setAdjustmentSku(event.target.value)} placeholder="Existing SKU" /></Field>
            <Field label="Facility"><select className={controlClass} required value={adjustmentFacility} onChange={(event) => setAdjustmentFacility(event.target.value)}><option value="">Select facility</option>{facilities.map((facility) => <option key={facility.id} value={facility.id}>{facility.code} · {facility.name}</option>)}</select></Field>
            <Field label="Requested on-hand units"><input className={controlClass} required type="number" min={0} max={1000000} step={1} value={adjustmentQuantity} onChange={(event) => setAdjustmentQuantity(event.target.value)} /></Field>
            <Field label="Reason"><input className={controlClass} required minLength={4} maxLength={500} value={adjustmentReason} onChange={(event) => setAdjustmentReason(event.target.value)} placeholder="Document the supporting evidence" /></Field>
            <div className="sm:col-span-2"><button type="submit" disabled={!actionAllowed('create') || Boolean(busyAction)} className={primaryButtonClass}>{busyAction === 'adjustment-request' ? 'Submitting…' : 'REQUEST APPROVAL'}</button></div>
          </form>
        )}

        {activeTab === 'material' && (
          <form onSubmit={submitMaterial} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-4xl">
            <Field label="SKU"><input className={controlClass} required maxLength={64} value={materialSku} onChange={(event) => setMaterialSku(event.target.value)} /></Field>
            <Field label="Material name"><input className={controlClass} required maxLength={180} value={materialName} onChange={(event) => setMaterialName(event.target.value)} /></Field>
            <Field label="Category"><input className={controlClass} required maxLength={80} value={materialCategory} onChange={(event) => setMaterialCategory(event.target.value)} /></Field>
            <Field label="Unit of measure"><input className={controlClass} required maxLength={12} value={materialUom} onChange={(event) => setMaterialUom(event.target.value)} /></Field>
            <Field label="Unit cost (KES, optional)"><input className={controlClass} type="number" min={0} max={1000000000} step="0.01" value={materialCost} onChange={(event) => setMaterialCost(event.target.value)} /></Field>
            <label className="flex items-center gap-2 self-end rounded-lg border border-slate-800 bg-[#07101d] px-3 py-2 text-[10px] text-slate-300"><input type="checkbox" checked={materialHazmat} onChange={(event) => setMaterialHazmat(event.target.checked)} /> Hazardous material (requires approval)</label>
            <div className="sm:col-span-2"><button type="submit" disabled={!actionAllowed('create') || Boolean(busyAction)} className={primaryButtonClass}>{busyAction === 'material-create' ? 'Creating…' : 'CREATE MATERIAL MASTER'}</button></div>
          </form>
        )}

        {activeTab === 'critical-spares' && (
          <form onSubmit={submitCriticalReview} className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:max-w-4xl">
            <div className="sm:col-span-2 rounded-xl border border-cyan-500/15 bg-cyan-500/5 p-3 text-[10px] leading-relaxed text-slate-300">This records a human classification and rationale. It does not imply a live equipment risk score or trigger a stock movement.</div>
            <Field label="Material SKU"><input className={controlClass} required maxLength={64} value={criticalSku} onChange={(event) => setCriticalSku(event.target.value)} /></Field>
            <Field label="Review classification"><select className={controlClass} value={criticalClassification} onChange={(event) => setCriticalClassification(event.target.value as typeof criticalClassification)}><option value="CRITICAL">Critical</option><option value="STANDARD">Standard</option><option value="UNVERIFIED">Unverified</option></select></Field>
            <div className="sm:col-span-2"><Field label="Human rationale"><textarea className={`${controlClass} min-h-20 resize-y`} required minLength={4} maxLength={500} value={criticalRationale} onChange={(event) => setCriticalRationale(event.target.value)} placeholder="Reference the approved asset, project, failure, or lead-time evidence" /></Field></div>
            <div className="sm:col-span-2"><button type="submit" disabled={!actionAllowed('update') || Boolean(busyAction)} className={primaryButtonClass}>{busyAction === 'critical-spares-review' ? 'Recording…' : 'RECORD REVIEW'}</button></div>
          </form>
        )}

        {activeTab === 'approvals' && (
          <div className="flex flex-col gap-3">
            {!capabilities?.canApprove && <p className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-[10px] text-amber-100">Approval permissions are not granted for this session. Requests remain pending; no approval actions are available.</p>}
            {capabilities?.canApprove && approvalResult.isLoading && <p className="py-6 text-center text-[10px] font-mono text-cyan-200">Loading approval queue…</p>}
            {capabilities?.canApprove && approvalResult.error && <p className="py-6 text-center text-[10px] text-rose-200">Approval queue unavailable. Retry the inventory session.</p>}
            {capabilities?.canApprove && !approvalResult.isLoading && (approvalResult.data?.data.approvals || []).length === 0 && <p className="py-6 text-center text-[10px] text-slate-500">No approval requests are pending.</p>}
            {(approvalResult.data?.data.approvals || []).map((operation) => (
              <article key={operation.id} className="rounded-xl border border-slate-800 bg-[#07101d] p-3">
                <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="text-[11px] font-semibold text-white">{operation.type.replaceAll('_', ' ')} · {operation.reference}</h3><p className="mt-1 text-[10px] text-slate-400">{operation.sku || 'No SKU'}{operation.quantity !== null ? ` · ${operation.quantity} ${operation.uom || 'units'}` : ''} · {operation.facilityName || 'No facility'}</p><p className="mt-1 text-[9px] text-slate-500">Requested by {operation.actorId} · {timestamp(operation.createdAt)}</p><p className="mt-1 text-[10px] text-slate-300">{operation.reason}</p></div><span className="rounded border border-amber-500/25 px-2 py-1 text-[9px] font-mono text-amber-200">PENDING</span></div>
                <div className="mt-3 flex flex-wrap items-end gap-2"><Field label="Decision rationale"><input className={`${controlClass} min-w-64`} minLength={4} maxLength={500} value={approvalReason} onChange={(event) => setApprovalReason(event.target.value)} placeholder="Required for approval or rejection" /></Field><button type="button" onClick={() => void decideApproval(operation, 'approve')} disabled={!actionAllowed('approve') || busyAction === `operation-approve-${operation.id}` || approvalReason.trim().length < 4} className={primaryButtonClass}>APPROVE</button><button type="button" onClick={() => void decideApproval(operation, 'reject')} disabled={!actionAllowed('approve') || busyAction === `operation-reject-${operation.id}` || approvalReason.trim().length < 4} className="inline-flex items-center justify-center rounded-lg border border-rose-500/30 px-3 py-2 text-[10px] font-mono text-rose-200 hover:bg-rose-500/10 disabled:opacity-40">REJECT</button></div>
              </article>
            ))}
          </div>
        )}

        {(activeTab === 'activity' || activeTab === 'audit') && (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-[#07101d] p-3">
              <div className="mb-2 flex items-center justify-between"><h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Persisted operations</h3><span className="text-[9px] font-mono text-slate-500">{movementResult.data?.dataStatus || (movementResult.isLoading ? 'LOADING' : 'UNAVAILABLE')}</span></div>
              {movementResult.isLoading && <p className="py-4 text-[10px] text-cyan-200">Loading ledger…</p>}
              {!movementResult.isLoading && operations.length === 0 && <p className="py-4 text-[10px] text-slate-500">No inventory operations are recorded for this tenant.</p>}
              <ul className="flex flex-col divide-y divide-slate-800/70">{operations.map((operation) => <li key={operation.id} className="flex items-center gap-2 py-2"><span className="min-w-0 flex-1"><span className="block truncate text-[10px] text-slate-200">{operation.type.replaceAll('_', ' ')} · {operation.sku || operation.reference}</span><span className="block truncate font-mono text-[9px] text-slate-500">{operation.reference} · {timestamp(operation.createdAt)} · {operation.reason}</span></span><span className="shrink-0 font-mono text-[8px] text-slate-400">{operation.status}</span>{operation.sku && <button type="button" onClick={() => onOpenMaterial(operation.sku!)} className="text-[9px] font-mono text-cyan-300 hover:underline">DETAIL</button>}</li>)}</ul>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#07101d] p-3">
              <div className="mb-2 flex items-center justify-between"><h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-200">Audit events</h3><span className="text-[9px] font-mono text-slate-500">Tenant-scoped activity</span></div>
              {events.length === 0 && <p className="py-4 text-[10px] text-slate-500">No logistics events are available for this tenant.</p>}
              <ul className="flex flex-col divide-y divide-slate-800/70">{events.map((event) => <li key={event.id} className="py-2"><p className="text-[10px] text-slate-200">{event.message}</p><p className="mt-1 font-mono text-[9px] text-slate-500">{event.eventType} · {timestamp(event.createdAt)} · {event.source || 'source not recorded'}</p></li>)}</ul>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button type="button" onClick={() => onTabChange('movement')} className={primaryButtonClass}><Truck className="size-3.5" /> New movement</button>
            <button type="button" onClick={() => onTabChange('stocktake')} className={primaryButtonClass}><ClipboardCheck className="size-3.5" /> Start count</button>
            <button type="button" onClick={() => onTabChange('adjustment')} className={primaryButtonClass}><Wrench className="size-3.5" /> Adjustment</button>
            <button type="button" onClick={() => onTabChange('approvals')} className={primaryButtonClass}><BadgeCheck className="size-3.5" /> Approvals</button>
          </div>
        )}
      </div>
    </section>
  );
}
