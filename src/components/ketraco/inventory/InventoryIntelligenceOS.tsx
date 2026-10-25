// SALIENCE ATLAS — INVENTORY INTELLIGENCE OS (Slices 1–2).
// Real Atlas shell + responsive route + real overview contract + material intelligence.
// Data-driven SVG network (no cartoon imagery). Unwired areas show
// explicit CONTRACT PENDING — never fake controls.

import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Boxes, Truck, FolderKanban, ShieldCheck, Search,
  AlertTriangle, CheckCircle2, RefreshCw, X, WifiOff, Lock,
} from 'lucide-react';
import {
  fetchMaterialDetail, fetchOverview, fetchPositions, fetchProjects, searchInventory,
  formatKes,
  type DataStatus, type HealthBand, type InventoryOverview, type InventorySearchResult, type LoadState,
  type MaterialDetail,
  InventoryApiError,
} from './api';
import InventoryDigitalTwin3D from './InventoryDigitalTwin3D';
import InventoryOperationsWorkspace, { type InventoryWorkflowTab } from './InventoryOperationsWorkspace';

const NAV = [
  { id: 'overview', label: 'Overview', wired: true },
  { id: 'materials', label: 'Materials & Inventory', wired: true },
  { id: 'operations', label: 'Operations & Counts', wired: true },
  { id: 'pos', label: 'Purchase Orders', wired: false },
  { id: 'suppliers', label: 'Suppliers', wired: false },
  { id: 'warehouses', label: 'Warehouses & Storage', wired: true },
  { id: 'transit', label: 'Transit & Logistics', wired: true },
  { id: 'projects', label: 'Projects & Deployment', wired: true },
  { id: 'assets', label: 'Assets & Substations', wired: false },
  { id: 'forecast', label: 'Forecasting & Demand', wired: false },
  { id: 'analytics', label: 'Analytics & Insights', wired: false },
  { id: 'reports', label: 'Reports & Audit', wired: false },
] as const;

type NavId = (typeof NAV)[number]['id'];

function deriveLoadState(isLoading: boolean, error: unknown, hasData: boolean, isEmpty = false): LoadState {
  if (error instanceof InventoryApiError && error.status === 401) return 'unauthorized';
  if (error instanceof InventoryApiError && error.status === 403) return 'forbidden';
  if (isLoading && !hasData) return 'loading';
  if (error || !hasData) return 'error';
  return isEmpty ? 'empty' : 'ready';
}

function healthColor(h: HealthBand): string {
  if (h === 'HEALTHY') return '#34d399';
  if (h === 'LOW') return '#fbbf24';
  if (h === 'CRITICAL') return '#fb7185';
  return '#64748b';
}

function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('en-KE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function StatusDot({ status }: { status: DataStatus }) {  const color = status === 'LIVE' ? '#34d399' : status === 'PARTIAL' ? '#fbbf24' : '#64748b';
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono" style={{ color }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {status}
    </span>
  );
}

// Data-driven supply-chain network: node positions fixed by kind order,
// counts/labels from the backend contract. Pan via scroll, zoom via buttons.
function SupplyNetworkGraph({ overview, selected, onSelect }: {
  overview: InventoryOverview;
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [zoom, setZoom] = useState(1);
  const nodes = overview.network.nodes;
  const order = ['suppliers', 'pos', 'transit', 'warehouses', 'materials', 'projects', 'assets'];
  const coords: Record<string, { x: number; y: number }> = {
    suppliers: { x: 90, y: 150 }, pos: { x: 250, y: 90 }, transit: { x: 410, y: 150 },
    warehouses: { x: 560, y: 110 }, materials: { x: 700, y: 170 }, projects: { x: 830, y: 100 }, assets: { x: 950, y: 160 },
  };
  const kindColor: Record<string, string> = {
    SUPPLIER: '#38bdf8', PURCHASE_ORDER: '#a78bfa', SHIPMENT: '#fb923c', WAREHOUSE: '#22d3ee',
    MATERIAL: '#34d399', PROJECT: '#fbbf24', ASSET: '#f472b6',
  };
  return (
    <div className="relative">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
          <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-cyan-400" /> Live Material Flow</span>
          <StatusDot status={overview.dataStatus} />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setZoom((z) => Math.max(0.6, +(z - 0.15).toFixed(2)))} className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:border-cyan-500/50" aria-label="Zoom out">−</button>
          <span className="w-10 text-center text-[10px] font-mono text-slate-400">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.15).toFixed(2)))} className="rounded border border-slate-700 px-2 py-0.5 text-xs text-slate-300 hover:border-cyan-500/50" aria-label="Zoom in">+</button>
        </div>
      </div>
      <div className="overflow-auto rounded-xl border border-cyan-500/10 bg-[#040a18]">
        <svg viewBox={`0 0 ${1040 * zoom} ${260 * zoom}`} className="min-h-[240px] w-full" role="img" aria-label="Supply chain network graph">
          <defs>
            <radialGradient id="inv-net-bg" cx="50%" cy="40%" r="80%">
              <stop offset="0%" stopColor="#0e2a4a" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#040a18" stopOpacity="1" />
            </radialGradient>
          </defs>
          <rect x={0} y={0} width={1040 * zoom} height={260 * zoom} fill="url(#inv-net-bg)" />
          {overview.network.edges.map((e) => {
            const a = coords[e.from]; const b = coords[e.to];
            if (!a || !b) return null;
            return (
              <g key={`${e.from}-${e.to}`}>
                <line x1={a.x * zoom} y1={a.y * zoom} x2={b.x * zoom} y2={b.y * zoom}
                  stroke="rgba(34,211,238,0.35)" strokeWidth={1.4} strokeDasharray="5 4" />
                <text x={((a.x + b.x) / 2) * zoom} y={((a.y + b.y) / 2 - 8) * zoom}
                  fill="#67e8f9" fontSize={9 * zoom} fontFamily="monospace" textAnchor="middle">{e.count}</text>
              </g>
            );
          })}
          {order.map((id) => {
            const n = nodes.find((x) => x.id === id);
            if (!n) return null;
            const c = coords[id];
            const color = kindColor[n.kind] || '#94a3b8';
            const isSel = selected === id;
            const unavailable = n.status === 'UNAVAILABLE';
            return (
              <g key={id} onClick={() => onSelect(isSel ? null : id)}
                style={{ cursor: 'pointer', opacity: unavailable ? 0.55 : 1 }}>
                <circle cx={c.x * zoom} cy={c.y * zoom} r={(isSel ? 26 : 20) * zoom}
                  fill={isSel ? 'rgba(34,211,238,0.25)' : 'rgba(8,20,38,0.95)'}
                  stroke={color} strokeWidth={isSel ? 2.5 : 1.5} />
                <circle cx={c.x * zoom} cy={c.y * zoom} r={6 * zoom} fill={color} opacity={0.9} />
                <text x={c.x * zoom} y={(c.y + 38) * zoom} fill="#e2e8f0" fontSize={10 * zoom}
                  fontWeight="bold" textAnchor="middle" fontFamily="monospace">{n.label}</text>
                <text x={c.x * zoom} y={(c.y + 51) * zoom} fill={unavailable ? '#64748b' : '#67e8f9'}
                  fontSize={9 * zoom} textAnchor="middle" fontFamily="monospace">{n.sublabel}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="mt-1.5 text-[10px] font-mono text-slate-500">
        Nodes derive from Atlas persistence (logistics_order / movement / warehouse / stock / project requirements). Assets report UNAVAILABLE until the asset join contract lands — no fabricated counts.
      </p>
    </div>
  );
}

function Donut({ healthy, low, critical, total }: { healthy: number; low: number; critical: number; total: number }) {
  const r = 34; const C = 2 * Math.PI * r;
  const hFrac = total ? healthy / total : 0;
  const lFrac = total ? low / total : 0;
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 96 96" className="h-full w-full -rotate-90">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="#34d399" strokeWidth="10"
            strokeDasharray={`${hFrac * C} ${C}`} strokeLinecap="round" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="#fbbf24" strokeWidth="10"
            strokeDasharray={`${lFrac * C} ${C}`} strokeDashoffset={-hFrac * C} strokeLinecap="round" />
          <circle cx="48" cy="48" r={r} fill="none" stroke="#fb7185" strokeWidth="10"
            strokeDasharray={`${Math.max(0, (1 - hFrac - lFrac)) * C} ${C}`} strokeDashoffset={-(hFrac + lFrac) * C} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
          {total ? `${Math.round(hFrac * 1000) / 10}%` : '—'}
        </div>
      </div>
      <ul className="space-y-1 text-[11px] font-mono">
        <li className="flex justify-between gap-4"><span className="text-emerald-300">● Healthy</span><span className="text-slate-200">{healthy}</span></li>
        <li className="flex justify-between gap-4"><span className="text-amber-300">● Low Stock</span><span className="text-slate-200">{low}</span></li>
        <li className="flex justify-between gap-4"><span className="text-rose-300">● Critical</span><span className="text-slate-200">{critical}</span></li>
      </ul>
    </div>
  );
}

function EvidenceTag({ evidence }: { evidence: 'measured' | 'no-records' | 'not-applicable' }) {
  const style = evidence === 'measured'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : evidence === 'no-records'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : 'border-slate-600/50 bg-slate-800/40 text-slate-400';
  const label = evidence === 'measured' ? 'MEASURED' : evidence === 'no-records' ? 'NO RECORDS' : 'N/A';
  return <span className={`rounded border px-1.5 py-0.5 font-mono text-[9px] ${style}`}>{label}</span>;
}

function AtpWaterfall({ detail }: { detail: MaterialDetail }) {
  const max = Math.max(1, ...detail.atpComponents.filter((c) => c.key !== 'availableToPromise').map((c) => Math.abs(c.value)));
  return (
    <div className="space-y-1.5" aria-label="Available to promise breakdown">
      {detail.atpComponents.map((c) => (
        <div key={c.key} className={`flex items-center gap-2 rounded-lg px-2 py-1.5 ${c.key === 'availableToPromise' ? 'border border-cyan-500/30 bg-cyan-500/5' : 'bg-slate-950/50'}`}>
          <span className="w-32 shrink-0 truncate text-[11px] text-slate-300" title={c.source}>{c.label}</span>
          <span className="h-2 min-w-0 flex-1 overflow-hidden rounded bg-slate-800">
            <span className={`block h-full rounded ${c.key === 'availableToPromise' ? 'bg-cyan-400' : c.value < 0 ? 'bg-rose-400' : 'bg-slate-400'}`}
              style={{ width: `${Math.min(100, (Math.abs(c.value) / max) * 100)}%` }} />
          </span>
          <span className="w-20 shrink-0 text-right font-mono text-[11px] text-white">{c.value.toLocaleString()}</span>
          <EvidenceTag evidence={c.evidence} />
        </div>
      ))}
      {detail.orderLineCoverage === 'ABSENT' && (
        <p className="pt-1 text-[10px] font-mono text-amber-300/90">
          No order-line records on file — in-transit / on-order / allocated read as 0 pending line coverage, not as confirmed zero demand.
        </p>
      )}
    </div>
  );
}

function deliveryColor(status: string): string {
  if (status === 'ON_TRACK') return '#34d399';
  if (status === 'AT_RISK') return '#fbbf24';
  if (status === 'DELAYED') return '#fb7185';
  return '#64748b';
}

export default function InventoryIntelligenceOS() {
  const [nav, setNav] = useState<NavId>('overview');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedSearchResult, setSelectedSearchResult] = useState<InventorySearchResult | null>(null);
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [detailSku, setDetailSku] = useState<string | null>(null);
  const [workflowTab, setWorkflowTab] = useState<InventoryWorkflowTab>('movement');
  const [categoryMetric, setCategoryMetric] = useState<'positions' | 'quantity' | 'valueKes'>('positions');

  const overviewResult = useSWR('inventory-overview', () => fetchOverview(), { revalidateOnFocus: false, shouldRetryOnError: false });
  const overview = overviewResult.data?.data || null;
  const state = deriveLoadState(overviewResult.isLoading, overviewResult.error, Boolean(overview), overview?.kpis.totalPositions === 0);
  const error = overviewResult.error instanceof Error ? overviewResult.error.message : 'Failed to load inventory overview.';
  const overviewStatus: DataStatus = overviewResult.error && overview ? 'STALE' : overviewResult.data?.dataStatus || 'UNAVAILABLE';
  const loadOverview = () => { void overviewResult.mutate(); };

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const positionsEnabled = nav === 'materials' || nav === 'warehouses';
  const positionResult = useSWR(
    positionsEnabled ? ['inventory-positions', debouncedSearch, facilityFilter, healthFilter] as const : null,
    ([, query, facility, health]) => fetchPositions({
      q: query || undefined,
      facilityId: facility !== 'ALL' ? facility : undefined,
      health: health !== 'ALL' ? health : undefined,
    }),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const positions = positionResult.data?.data.positions || [];
  const posState = deriveLoadState(positionResult.isLoading, positionResult.error, Boolean(positionResult.data), positions.length === 0);

  const projectsResult = useSWR(overview ? 'inventory-projects' : null, () => fetchProjects(), { revalidateOnFocus: false, shouldRetryOnError: false });
  const projects = projectsResult.data?.data.projects || [];
  const projectsState = deriveLoadState(projectsResult.isLoading, projectsResult.error, Boolean(projectsResult.data), projects.length === 0);

  const detailResult = useSWR(detailSku ? ['inventory-material', detailSku] as const : null,
    ([, sku]) => fetchMaterialDetail(sku), { revalidateOnFocus: false, shouldRetryOnError: false });
  const detail = detailResult.data?.data || null;
  const detailState = detailSku ? deriveLoadState(detailResult.isLoading, detailResult.error, Boolean(detail), false) : 'empty';

  const globalSearchKey = debouncedSearch.length >= 2 ? ['inventory-global-search', debouncedSearch] as const : null;
  const globalSearchResult = useSWR(globalSearchKey, ([, query]) => searchInventory(query), { revalidateOnFocus: false, shouldRetryOnError: false });
  const globalSearchItems = globalSearchResult.data?.data.items || [];
  const facilities = useMemo(() => overview?.warehouses || [], [overview]);
  const openSearchResult = (result: InventorySearchResult) => {
    setSearchFocused(false);
    setSearch('');
    if (result.kind === 'material') {
      const sku = result.fields.find((field) => field.label === 'SKU')?.value;
      if (sku) {
        setDetailSku(sku);
        setNav('materials');
        setSelectedSearchResult(null);
        return;
      }
    }
    if (result.kind === 'location') {
      setFacilityFilter(result.id);
      setNav('warehouses');
      setSelectedSearchResult(null);
      return;
    }
    if (result.kind === 'movement') {
      setWorkflowTab('audit');
      setNav('operations');
    }
    setSelectedSearchResult(result);
  };

  if (state === 'loading') {
    return (
      <div className="flex flex-1 items-center justify-center bg-[#05070D] text-cyan-300" role="status" aria-live="polite">
        <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-cyan-400/30 border-t-cyan-300" />
        <span className="text-xs font-mono tracking-wider">Loading Inventory Intelligence OS…</span>
      </div>
    );
  }

  if (state === 'unauthorized' || state === 'forbidden') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#05070D] p-8 text-center">
        <Lock className="h-8 w-8 text-amber-400" />
        <h2 className="text-sm font-bold text-white">{state === 'unauthorized' ? 'Session required' : 'Access denied'}</h2>
        <p className="max-w-md text-xs text-slate-400">{error}</p>
        <button onClick={() => void loadOverview()} className="rounded-lg border border-cyan-500/40 px-4 py-2 text-xs font-mono text-cyan-300 hover:bg-cyan-500/10">RETRY</button>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-[#05070D] p-8 text-center">
        <WifiOff className="h-8 w-8 text-rose-400" />
        <h2 className="text-sm font-bold text-white">Inventory overview unavailable</h2>
        <p className="max-w-md text-xs text-slate-400">{error} No cached or fabricated values are shown.</p>
        <button onClick={() => void loadOverview()} className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/40 px-4 py-2 text-xs font-mono text-cyan-300 hover:bg-cyan-500/10">
          <RefreshCw className="h-3.5 w-3.5" /> RETRY
        </button>
      </div>
    );
  }

  if (!overview) return null;
  const k = overview.kpis;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#05070D] text-slate-200 lg:flex-row">
      {/* Module-local command nav */}
      <aside className="shrink-0 border-b border-slate-800/70 bg-[#070c18] lg:w-56 lg:border-b-0 lg:border-r">
        <div className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-visible">
          <p className="hidden px-2 pb-1 pt-2 text-[9px] font-mono uppercase tracking-widest text-slate-500 lg:block">Command Center</p>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => { if (n.id === 'transit') setWorkflowTab('audit'); setNav(n.id); }} disabled={!n.wired} title={!n.wired ? `${n.label} is not connected to a verified workflow in this sprint.` : undefined}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${nav === n.id ? 'bg-cyan-950/40 text-cyan-300' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}`}>
              <span className="truncate">{n.label}</span>
              {!n.wired && <span className="ml-auto hidden rounded border border-amber-500/30 px-1 text-[8px] font-mono text-amber-400 lg:inline">PENDING</span>}
            </button>
          ))}
        </div>
        <div className="hidden border-t border-slate-800/70 p-3 lg:block">
          <StatusDot status={overviewStatus} />
          <p className="mt-1 text-[9px] font-mono text-slate-500">SAP: {overview.sap.state}</p>
          <p className="text-[9px] font-mono text-slate-500">AI: {overview.ai.state}</p>
        </div>
      </aside>

      {/* Main stage */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <header className="relative isolate overflow-visible border-b border-cyan-500/15 bg-[#05070D] px-4 py-5 lg:px-6" style={{ backgroundImage: "linear-gradient(90deg, rgba(4,8,16,.97) 0%, rgba(4,8,16,.84) 46%, rgba(4,8,16,.30) 100%), url('/images/inventory-hero-grid.png')", backgroundPosition: 'center right', backgroundSize: 'cover' }}>
          <div className="relative flex flex-wrap items-end gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-mono uppercase tracking-[0.24em] text-cyan-300">KETRACO · Inventory Management</p>
              <h1 className="mt-1 text-xl font-bold tracking-wide text-white lg:text-2xl">INVENTORY INTELLIGENCE</h1>
              <p className="mt-1 max-w-xl text-[11px] text-slate-300">Stock, material movement, and count controls backed by the tenant ledger.</p>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[9px] font-mono text-slate-400">
                <span>DATA <span className="text-cyan-200">{overviewStatus}</span></span>
                <span>SAP <span className="text-slate-200">{overview.sap.state}</span></span>
                <span>AI <span className="text-slate-200">{overview.ai.state}</span></span>
                <span>UPDATED <span className="text-slate-200">{formatActivityTime(overview.generatedAt)}</span></span>
              </div>
            </div>
            <div className="relative z-10 w-full max-w-md xl:ml-auto">
              <label htmlFor="inventory-global-search" className="mb-1 block text-[9px] font-mono uppercase tracking-wider text-slate-300">Search authorized inventory records</label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 size-3.5 text-slate-500" />
                <input id="inventory-global-search" value={search} onChange={(event) => setSearch(event.target.value)} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 120)}
                  placeholder="Material, PO, supplier, work order, location…" aria-label="Search inventory records" maxLength={100} aria-expanded={searchFocused && debouncedSearch.length >= 2} aria-controls="inventory-search-results" autoComplete="off"
                  className="w-full rounded-lg border border-cyan-500/25 bg-[#07101d]/90 py-2 pl-9 pr-9 text-xs text-white placeholder-slate-500 focus:border-cyan-400/70 focus:outline-none focus:ring-2 focus:ring-cyan-400/10" />
                {search && <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setSearch(''); setSearchFocused(false); }} className="absolute right-2.5 top-2 rounded p-0.5 text-slate-500 hover:text-white" aria-label="Clear inventory search"><X className="size-3.5" /></button>}
              </div>
              {searchFocused && debouncedSearch.length >= 2 && (
                <div id="inventory-search-results" role="listbox" aria-label="Inventory search results" className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-auto rounded-xl border border-cyan-500/20 bg-[#07101d] p-1 shadow-2xl">
                  {globalSearchResult.isLoading && <p className="px-3 py-3 text-[10px] font-mono text-cyan-200">Searching authorized source records…</p>}
                  {globalSearchResult.error && <p className="px-3 py-3 text-[10px] text-rose-200">Search failed. Retry or check your inventory permissions.</p>}
                  {!globalSearchResult.isLoading && !globalSearchResult.error && globalSearchItems.length === 0 && <p className="px-3 py-3 text-[10px] text-slate-400">No matching records found in configured sources.</p>}
                  {globalSearchItems.map((result) => <button key={`${result.kind}-${result.id}`} type="button" role="option" aria-selected={false} onMouseDown={(event) => event.preventDefault()} onClick={() => openSearchResult(result)} className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-cyan-500/10"><span className="mt-1 size-1.5 shrink-0 rounded-full bg-cyan-300" /><span className="min-w-0"><span className="block truncate text-[10px] font-medium text-slate-100">{result.label}</span><span className="block truncate text-[9px] font-mono text-slate-500">{result.kind.replaceAll('-', ' ')} · {result.subLabel}</span></span><span className="ml-auto shrink-0 font-mono text-[8px] text-slate-500">{result.status || 'NO STATUS'}</span></button>)}
                </div>
              )}
            </div>
          </div>
        </header>

        {overviewStatus === 'PARTIAL' && (
          <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[11px] text-amber-300 lg:px-6" role="status">
            <AlertTriangle className="h-3.5 w-3.5" /> Partial data — one or more sources degraded. Affected tiles show explicit state.
          </div>
        )}

        {/* KPI strip */}
        <section aria-label="Inventory KPIs" className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:px-6 xl:grid-cols-5">
          {[
            { label: 'Inventory Value', value: formatKes(k.totalInventoryValueKes), sub: k.totalInventoryValueKes === null ? 'unit cost coverage unavailable' : 'on-hand value from stock ledger' },
            { label: 'Materials', value: String(k.totalMaterials), sub: 'distinct tenant SKUs' },
            { label: 'Stock Positions', value: String(k.totalPositions), sub: 'facility × material rows' },
            { label: 'Open Purchase Orders', value: String(k.openPurchaseOrders), sub: 'configured procurement records' },
            { label: 'In Transit', value: String(k.inTransitMovements), sub: 'movement records in transit' },
          ].map((tile) => (
            <div key={tile.label} className="rounded-xl border border-cyan-500/15 bg-[#091321]/90 p-3 shadow-[0_8px_28px_rgba(0,0,0,0.16)]">
              <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{tile.label}</p>
              <p className="mt-1 truncate text-base font-bold text-white lg:text-lg">{tile.value}</p>
              <p className="truncate text-[9px] text-slate-500">{tile.sub}</p>
            </div>
          ))}
        </section>

        {selectedSearchResult && (
          <section className="mx-3 mt-3 rounded-xl border border-cyan-500/20 bg-[#091321] p-3 lg:mx-6" role="dialog" aria-label="Inventory search record detail">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-[9px] font-mono uppercase tracking-wider text-cyan-300">{selectedSearchResult.kind.replaceAll('-', ' ')} · source record</p><h2 className="mt-1 truncate text-xs font-semibold text-white">{selectedSearchResult.label}</h2><p className="mt-0.5 text-[10px] text-slate-400">{selectedSearchResult.subLabel}</p></div><button type="button" onClick={() => setSelectedSearchResult(null)} className="rounded p-1 text-slate-400 hover:text-white" aria-label="Close search record detail"><X className="size-4" /></button></div>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">{selectedSearchResult.fields.map((field) => <div key={`${field.label}-${field.value}`} className="rounded-lg border border-slate-800 bg-[#07101d] px-2 py-1.5"><dt className="text-[8px] font-mono uppercase text-slate-500">{field.label}</dt><dd className="mt-0.5 break-words text-[10px] text-slate-200">{field.value}</dd></div>)}</dl>
            <p className="mt-2 text-[9px] text-slate-500">Only fields returned by the authorized search source are shown. A richer detail endpoint is not registered for this record type.</p>
          </section>
        )}

        {nav === 'overview' && (
          <div className="grid grid-cols-1 gap-3 p-3 lg:px-6 xl:grid-cols-12">
            <div className="min-w-0 xl:col-span-8 xl:row-span-2"><InventoryDigitalTwin3D /></div>

            <div className="flex min-w-0 flex-col gap-3 xl:col-span-4 xl:row-span-2">
              <section className="rounded-2xl border border-cyan-500/15 bg-[#091321]/90 p-4" aria-label="Inventory health">
                <div className="mb-2 flex items-center justify-between gap-2"><h2 className="text-xs font-bold uppercase tracking-wider text-white">Inventory health</h2><StatusDot status={overviewStatus} /></div>
                {k.healthyCount + k.lowCount + k.criticalCount === 0 ? <p className="text-[10px] leading-relaxed text-slate-500">UNVERIFIED — no classified positions. Consumption and lead-time inputs are required before stockout claims.</p> : <Donut healthy={k.healthyCount} low={k.lowCount} critical={k.criticalCount} total={k.healthyCount + k.lowCount + k.criticalCount} />}
                {k.unverifiedCount > 0 && <p className="mt-2 text-[9px] font-mono text-slate-500">{k.unverifiedCount} positions remain unverified.</p>}
              </section>

              <section className="rounded-2xl border border-cyan-500/15 bg-[#091321]/90 p-4" aria-label="Inventory category distribution">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><div><h2 className="text-xs font-bold uppercase tracking-wider text-white">Category distribution</h2><p className="mt-1 text-[9px] font-mono text-slate-500">From tenant stock positions</p></div><div role="group" aria-label="Category chart metric" className="flex gap-1">{(['positions', 'quantity', 'valueKes'] as const).map((metric) => <button key={metric} type="button" aria-pressed={categoryMetric === metric} onClick={() => setCategoryMetric(metric)} className={`rounded border px-2 py-1 text-[8px] font-mono ${categoryMetric === metric ? 'border-cyan-400/40 bg-cyan-500/10 text-cyan-200' : 'border-slate-700 text-slate-500 hover:text-slate-200'}`}>{metric === 'positions' ? 'ROWS' : metric === 'quantity' ? 'UNITS' : 'VALUE'}</button>)}</div></div>
                {overview.categoryBreakdown.length === 0 ? <p className="py-3 text-[10px] text-slate-500">No category rows are available.</p> : <ul className="flex flex-col gap-2">{overview.categoryBreakdown.slice(0, 6).map((category) => {
                  const value = categoryMetric === 'valueKes' ? category.valueKes : category[categoryMetric];
                  const maxValue = Math.max(1, ...overview.categoryBreakdown.map((item) => categoryMetric === 'valueKes' ? item.valueKes || 0 : item[categoryMetric]));
                  const width = value === null ? 0 : Math.min(100, Math.max(0, (value / maxValue) * 100));
                  return <li key={category.category}><div className="mb-1 flex items-center justify-between gap-2 text-[9px]"><span className="truncate text-slate-300">{category.category}</span><span className="shrink-0 font-mono text-slate-400">{value === null ? 'UNVALUED' : categoryMetric === 'valueKes' ? formatKes(value) : value.toLocaleString()}</span></div><div className="h-1.5 overflow-hidden rounded bg-slate-800"><div className="h-full rounded bg-cyan-400/80 transition-[width]" style={{ width: `${width}%` }} /></div></li>;
                })}</ul>}
              </section>

              <section className="rounded-2xl border border-slate-800 bg-[#091321]/90 p-4" aria-label="Recent inventory activity">
                <div className="mb-2 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wider text-white">Recent activity</h2><button type="button" onClick={() => { setWorkflowTab('audit'); setNav('operations'); }} className="text-[9px] font-mono text-cyan-300 hover:underline">OPEN LEDGER</button></div>
                {overview.recentActivity.length === 0 ? <p className="text-[10px] text-slate-500">No logistics event records are available for this tenant.</p> : <ul className="flex flex-col gap-2">{overview.recentActivity.slice(0, 4).map((event) => <li key={event.id} className="flex items-start gap-2 text-[10px]">{event.severity === 'CRITICAL' || event.severity === 'WARNING' ? <AlertTriangle className="mt-0.5 size-3 shrink-0 text-amber-300" /> : <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-300" />}<span className="min-w-0"><span className="block truncate text-slate-200">{event.message}</span><span className="font-mono text-[9px] text-slate-500">{event.eventType} · {formatActivityTime(event.createdAt)}</span></span></li>)}</ul>}
              </section>
            </div>

            <section className="rounded-2xl border border-amber-500/20 bg-[#091321]/90 p-4 xl:col-span-4" aria-label="AI inventory insights">
              <div className="mb-2 flex items-center justify-between gap-2"><h2 className="text-xs font-bold uppercase tracking-wider text-white">AI recommendations</h2><span className="rounded border border-amber-500/20 px-2 py-1 text-[8px] font-mono text-amber-200">{overview.ai.state}</span></div>
              <p className="text-[10px] leading-relaxed text-slate-400">{overview.ai.note} Recommendations are not generated from missing telemetry or assumed lead times.</p>
              <button type="button" disabled aria-disabled="true" title={overview.ai.note}
                className="mt-3 w-full cursor-not-allowed rounded-lg border border-slate-700 px-3 py-2 text-[10px] font-mono text-slate-500 opacity-70">Inventory AI unavailable — contract pending</button>
            </section>

            <section className="rounded-2xl border border-cyan-500/15 bg-[#091321]/90 p-4 xl:col-span-4" aria-label="Top materials by value">
              <div className="mb-2 flex items-center justify-between gap-2"><h2 className="text-xs font-bold uppercase tracking-wider text-white">Top materials by value</h2><button type="button" onClick={() => setNav('materials')} className="text-[9px] font-mono text-cyan-300 hover:underline">ALL MATERIALS</button></div>
              {overview.topMaterialsByValue.length === 0 ? <p className="py-3 text-[10px] text-slate-500">No valued positions are available; unit-cost coverage is absent.</p> : <ol className="flex flex-col divide-y divide-slate-800/70">{overview.topMaterialsByValue.slice(0, 5).map((material, index) => <li key={material.sku}><button type="button" onClick={() => { setDetailSku(material.sku); setNav('materials'); }} className="flex w-full items-center gap-2 py-2 text-left hover:bg-cyan-500/5"><span className="w-4 shrink-0 font-mono text-[9px] text-slate-500">{index + 1}</span><span className="min-w-0 flex-1"><span className="block truncate text-[10px] text-slate-200">{material.description}</span><span className="font-mono text-[9px] text-slate-500">{material.sku} · {material.health}</span></span><span className="shrink-0 font-mono text-[10px] text-slate-300">{formatKes(material.valueKes)}</span><span className="size-2 shrink-0 rounded-full" style={{ background: healthColor(material.health) }} title={material.health} /></button></li>)}</ol>}
            </section>

            <div className="min-w-0 xl:col-span-4"><InventoryOperationsWorkspace compact activeTab={workflowTab} onTabChange={setWorkflowTab} onNavigate={(tab) => { setWorkflowTab(tab); setNav('operations'); }} onOpenMaterial={(sku) => { setDetailSku(sku); setNav('materials'); }} onRefresh={() => overviewResult.mutate()} /></div>

            {projectsState === 'ready' && projects.length > 0 && <section className="rounded-2xl border border-cyan-500/15 bg-[#091321]/90 p-4 xl:col-span-12" aria-label="Tracked project requirements"><div className="mb-2 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-wider text-white">Projects &amp; deployment requirements</h2><button type="button" onClick={() => setNav('projects')} className="font-mono text-[9px] text-cyan-300 hover:underline">VIEW ALL</button></div><ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">{projects.slice(0, 3).map((project) => <li key={project.id} className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2"><span className="size-2 shrink-0 rounded-full" style={{ background: deliveryColor(project.deliveryStatus) }} title={project.deliveryStatus} /><span className="min-w-0 flex-1 truncate text-[10px] text-slate-200">{project.projectName} <span className="text-slate-500">· {project.description.slice(0, 60)}</span></span><span className="shrink-0 font-mono text-[9px]" style={{ color: deliveryColor(project.deliveryStatus) }}>{project.deliveryStatus}</span></li>)}</ul></section>}
          </div>
        )}

        {(nav === 'materials' || nav === 'warehouses') && (
          <section className="p-3 lg:px-6" aria-label="Inventory positions">
            <div className="rounded-2xl border border-cyan-500/10 bg-[#0a1224]/80 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  {nav === 'materials' ? 'Materials & Inventory Positions' : 'Warehouses & Storage'}
                </h2>
                <span className="text-[10px] font-mono text-slate-500">canonical ledger · Atlas persistence</span>
                <div className="ml-auto flex flex-wrap gap-2">
                  <select value={facilityFilter} onChange={(e) => setFacilityFilter(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-200" aria-label="Filter by facility">
                    <option value="ALL">All facilities</option>
                    {facilities.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                  </select>
                  <select value={healthFilter} onChange={(e) => setHealthFilter(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-[11px] text-slate-200" aria-label="Filter by health">
                    {['ALL', 'HEALTHY', 'LOW', 'CRITICAL', 'UNVERIFIED'].map((h) => <option key={h} value={h}>{h === 'ALL' ? 'All health' : h}</option>)}
                  </select>
                </div>
              </div>
              {posState === 'loading' && <p className="py-8 text-center text-xs font-mono text-cyan-300">Loading positions…</p>}
              {posState === 'empty' && <p className="py-8 text-center text-xs text-slate-400">No positions match. Adjust search or filters — zeroes are never shown for failed loads.</p>}
              {(posState === 'error' || posState === 'unauthorized' || posState === 'forbidden') && (
                <p className="py-8 text-center text-xs text-rose-300">
                  {posState === 'error' ? 'Positions failed to load.' : 'Not permitted to view positions.'}
                </p>
              )}
              {posState === 'ready' && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-[11px]">
                    <thead>
                      <tr className="border-b border-slate-800 font-mono text-[10px] uppercase text-slate-500">
                        <th className="px-2 py-2">SKU</th><th className="px-2 py-2">Description</th>
                        <th className="px-2 py-2">Facility</th><th className="px-2 py-2 text-right">On hand</th>
                        <th className="px-2 py-2 text-right">Reserved</th><th className="px-2 py-2 text-right">Available</th>
                        <th className="px-2 py-2 text-right">Value</th><th className="px-2 py-2">Health</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positions.slice(0, 60).map((p) => (
                        <tr key={`${p.sku}-${p.facilityId}`} tabIndex={0}
                          onClick={() => setDetailSku(p.sku)}
                          onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setDetailSku(p.sku); } }}
                          className={`cursor-pointer border-b border-slate-800/50 hover:bg-cyan-500/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-cyan-400 ${detailSku === p.sku ? 'bg-cyan-500/5' : ''}`}>
                          <td className="px-2 py-2 font-mono text-cyan-300">{p.sku}</td>
                          <td className="max-w-[260px] truncate px-2 py-2 text-slate-200">{p.description}</td>
                          <td className="px-2 py-2 text-slate-400">{p.facilityName}</td>
                          <td className="px-2 py-2 text-right font-mono">{p.onHand.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right font-mono">{p.reserved.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right font-mono text-white">{p.available.toLocaleString()}</td>
                          <td className="px-2 py-2 text-right font-mono text-slate-300">{formatKes(p.positionValueKes)}</td>
                          <td className="px-2 py-2"><span className="inline-flex items-center gap-1 font-mono text-[10px]" style={{ color: healthColor(p.health) }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: healthColor(p.health) }} />{p.health}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {detailSku && (
                <div className="mt-3 rounded-xl border border-cyan-500/20 bg-slate-900/50 p-3 text-[11px]" role="dialog" aria-label="Material intelligence">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">
                      {detail?.material.description || detailSku}
                      <span className="font-mono font-normal text-slate-400"> · {detailSku}{detail ? ` · ${detail.material.materialGroup} · ${detail.material.uom}` : ''}</span>
                    </p>
                    <button onClick={() => setDetailSku(null)} className="text-slate-400 hover:text-white" aria-label="Close material intelligence"><X className="h-4 w-4" /></button>
                  </div>
                  {detailState === 'loading' && <p className="py-4 text-center font-mono text-xs text-cyan-300">Loading canonical material record…</p>}
                  {detailState === 'empty' && <p className="py-4 text-center text-xs text-slate-400">No material with this SKU in the tenant ledger.</p>}
                  {(detailState === 'error' || detailState === 'unauthorized' || detailState === 'forbidden') && (
                    <p className="py-4 text-center text-xs text-rose-300">Material detail failed to load. No cached values shown.</p>
                  )}
                  {detailState === 'ready' && detail && (
                    <div className="mt-2 space-y-3">
                      <div>
                        <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">Available to promise — canonical engine</p>
                        <AtpWaterfall detail={detail} />
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">Positions by facility ({detail.positions.length})</p>
                          <ul className="space-y-1">
                            {detail.positions.map((p) => (
                              <li key={p.facilityId} className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-2 py-1.5">
                                <span className="min-w-0 truncate text-slate-200">{p.facilityName}{p.binLocation ? ` · ${p.binLocation}` : ''}</span>
                                <span className="shrink-0 font-mono text-white">{p.available.toLocaleString()} <span className="text-slate-500">avail</span></span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <div className="rounded-lg bg-slate-950/60 p-2">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Criticality — {detail.criticality.level}</p>
                            <p className="mt-0.5 text-slate-300">
                              {detail.criticality.method === 'insufficient-data'
                                ? 'UNVERIFIED — no validated asset, failure, lead-time or supplier inputs on record.'
                                : `Score ${detail.criticality.score} (${detail.criticality.confidence} confidence).`}
                            </p>
                            {detail.criticality.missingFactors.length > 0 && (
                              <p className="mt-0.5 font-mono text-[10px] text-slate-500">Missing: {detail.criticality.missingFactors.join(', ')}</p>
                            )}
                          </div>
                          <div className="rounded-lg bg-slate-950/60 p-2">
                            <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Supply linkage</p>
                            <p className="mt-0.5 text-slate-300">
                              Order lines: {detail.orderLineCoverage === 'PRESENT' ? 'present' : 'ABSENT — no per-SKU order linkage on record'}.
                              Project linkage: {detail.projectLinkage === 'LINKED' ? 'present' : 'NO EVIDENCE — requirement set carries no product linkage'}.
                            </p>
                          </div>
                          {detail.linkedEvents.length > 0 && (
                            <div className="rounded-lg bg-slate-950/60 p-2">
                              <p className="font-mono text-[10px] uppercase tracking-wider text-slate-400">Linked events ({detail.linkedEvents.length})</p>
                              <ul className="mt-1 space-y-1">
                                {detail.linkedEvents.slice(0, 4).map((e) => (
                                  <li key={e.id} className="truncate text-slate-300">{e.message} <span className="font-mono text-[10px] text-slate-500">· {formatActivityTime(e.createdAt)}</span></li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                      <button type="button" disabled aria-disabled="true" title={overview?.ai.note || 'Inventory AI is not connected.'}
                        className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-700 px-3 py-1.5 font-mono text-[11px] text-slate-500 opacity-70">
                        AI unavailable
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {(nav === 'operations' || nav === 'transit') && (
          <section className="p-3 lg:px-6" aria-label="Inventory operations and audit">
            <InventoryOperationsWorkspace activeTab={workflowTab} onTabChange={setWorkflowTab} onNavigate={(tab) => { setWorkflowTab(tab); setNav('operations'); }} onOpenMaterial={(sku) => { setDetailSku(sku); setNav('materials'); }} onRefresh={() => Promise.all([overviewResult.mutate(), positionResult.mutate()])} />
          </section>
        )}

        {nav === 'projects' && (
          <section className="p-3 lg:px-6" aria-label="Projects and deployment">
            <div className="rounded-2xl border border-cyan-500/10 bg-[#0a1224]/80 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Projects &amp; Deployment</h2>
                <span className="text-[10px] font-mono text-slate-500">logistics_project_requirement · no per-SKU linkage on record</span>
                <div className="ml-auto"><StatusDot status={projectsState === 'ready' ? 'LIVE' : projectsState === 'loading' ? 'LIVE' : 'UNAVAILABLE'} /></div>
              </div>
              {projectsState === 'loading' && <p className="py-8 text-center text-xs font-mono text-cyan-300">Loading project requirements…</p>}
              {projectsState === 'empty' && <p className="py-8 text-center text-xs text-slate-400">No project requirements on record for this tenant.</p>}
              {(projectsState === 'error' || projectsState === 'unauthorized' || projectsState === 'forbidden') && (
                <p className="py-8 text-center text-xs text-rose-300">Project requirements failed to load.</p>
              )}
              {projectsState === 'ready' && (
                <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
                  {projects.map((p) => (
                    <li key={p.id} className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
                      <p className="flex items-center justify-between gap-2 text-[11px] font-bold text-white">
                        <span className="truncate">{p.projectName}</span>
                        <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px]" style={{ color: deliveryColor(p.deliveryStatus) }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: deliveryColor(p.deliveryStatus) }} />{p.deliveryStatus}
                        </span>
                      </p>
                      <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">{p.description}</p>
                      <p className="mt-1 font-mono text-[10px] text-slate-500">
                        {p.requirementCode}{p.substationTarget ? ` · ${p.substationTarget}` : ''}{p.requiredDate ? ` · due ${p.requiredDate}` : ''}
                        {p.progressPct !== null ? ` · ${p.progressPct}%` : ''}
                      </p>
                      {p.verifiedBy && <p className="mt-0.5 font-mono text-[10px] text-slate-500">Verified by {p.verifiedBy}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )}

        {!['overview', 'materials', 'warehouses', 'transit', 'projects', 'operations'].includes(nav) && (
          <section className="p-3 lg:px-6" aria-label="Pending contract">
            <div className="rounded-2xl border border-amber-500/20 bg-[#0a1224]/80 p-8 text-center">
              <Boxes className="mx-auto h-8 w-8 text-amber-400" />
              <h2 className="mt-2 text-sm font-bold text-white">{NAV.find((n) => n.id === nav)?.label} — CONTRACT PENDING</h2>
              <p className="mx-auto mt-1 max-w-lg text-[11px] text-slate-400">
                No backend contract exists for this view yet. It is intentionally unwired rather than
                simulated. Overview, positions, warehouses, transit and projects above are live against Atlas persistence.
              </p>
            </div>
          </section>
        )}

        {/* Footer provenance */}
        <footer className="flex flex-wrap items-center gap-2 border-t border-slate-800/70 px-4 py-2 text-[9px] font-mono text-slate-500 lg:px-6">
          <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" /> Observe → Understand → Predict → Decide → Act → Verify</span>
          <span className="ml-auto inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Evidence</span>
          <span>Model v2.8.1</span>
          <span>Generated {new Date(overview.generatedAt).toLocaleString()}</span>
          <span>SAP {overview.sap.state}</span>
          <span className="hidden items-center gap-1 sm:inline-flex"><FolderKanban className="h-3 w-3" /> {overview.sap.note}</span>
        </footer>
      </div>
    </div>
  );
}
