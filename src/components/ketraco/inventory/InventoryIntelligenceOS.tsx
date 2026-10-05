// SALIENCE ATLAS — INVENTORY INTELLIGENCE OS (Slice 1).
// Real Atlas shell + responsive route + real overview contract.
// Data-driven SVG network (no cartoon imagery). Unwired areas show
// explicit CONTRACT PENDING — never fake controls.

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Boxes, Truck, Warehouse as WarehouseIcon, FolderKanban, ShieldCheck, Search,
  AlertTriangle, CheckCircle2, RefreshCw, ChevronRight, X, WifiOff, Lock,
} from 'lucide-react';
import {
  fetchOverview, fetchPositions,
  formatKes,
  type DataStatus, type HealthBand, type InventoryOverview, type InventoryPosition, type LoadState,
  InventoryApiError,
} from './api';

const NAV = [
  { id: 'overview', label: 'Overview', wired: true },
  { id: 'materials', label: 'Materials & Inventory', wired: true },
  { id: 'pos', label: 'Purchase Orders', wired: false },
  { id: 'suppliers', label: 'Suppliers', wired: false },
  { id: 'warehouses', label: 'Warehouses & Storage', wired: true },
  { id: 'transit', label: 'Transit & Logistics', wired: true },
  { id: 'projects', label: 'Projects & Deployment', wired: false },
  { id: 'assets', label: 'Assets & Substations', wired: false },
  { id: 'forecast', label: 'Forecasting & Demand', wired: false },
  { id: 'analytics', label: 'Analytics & Insights', wired: false },
  { id: 'reports', label: 'Reports & Audit', wired: false },
] as const;

type NavId = (typeof NAV)[number]['id'];

function healthColor(h: HealthBand): string {
  if (h === 'HEALTHY') return '#34d399';
  if (h === 'LOW') return '#fbbf24';
  if (h === 'CRITICAL') return '#fb7185';
  return '#64748b';
}

function StatusDot({ status }: { status: DataStatus }) {
  const color = status === 'LIVE' ? '#34d399' : status === 'PARTIAL' ? '#fbbf24' : '#64748b';
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
        Nodes derive from Atlas persistence (logistics_order / movement / warehouse / stock). Projects &amp; Assets report UNAVAILABLE until the project-supply join contract lands — no fabricated counts.
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

export default function InventoryIntelligenceOS({ onAskCopilot }: { onAskCopilot: (prompt: string) => void }) {
  const [nav, setNav] = useState<NavId>('overview');
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [overviewStatus, setOverviewStatus] = useState<DataStatus>('LIVE');
  const [state, setState] = useState<LoadState>('loading');
  const [error, setError] = useState('');
  const [positions, setPositions] = useState<InventoryPosition[]>([]);
  const [posState, setPosState] = useState<LoadState>('loading');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [facilityFilter, setFacilityFilter] = useState('ALL');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<InventoryPosition | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadOverview = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setState('loading');
    setError('');
    try {
      const res = await fetchOverview(ctrl.signal);
      setOverview(res.data);
      setOverviewStatus(res.dataStatus);
      setState(res.data.kpis.totalPositions === 0 ? 'empty' : 'ready');
    } catch (e) {
      if ((e as Error).name === 'AbortError') return;
      if (e instanceof InventoryApiError) {
        if (e.status === 401) { setState('unauthorized'); setError(e.message); return; }
        if (e.status === 403) { setState('forbidden'); setError(e.message); return; }
      }
      setState('error');
      setError(e instanceof Error ? e.message : 'Failed to load inventory overview.');
    }
  }, []);

  useEffect(() => { void loadOverview(); return () => abortRef.current?.abort(); }, [loadOverview]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (nav !== 'materials' && nav !== 'warehouses') return;
    const ctrl = new AbortController();
    setPosState('loading');
    fetchPositions({ q: debouncedSearch || undefined, facilityId: facilityFilter !== 'ALL' ? facilityFilter : undefined, health: healthFilter !== 'ALL' ? healthFilter : undefined }, ctrl.signal)
      .then((res) => { setPositions(res.data.positions); setPosState(res.data.positions.length ? 'ready' : 'empty'); })
      .catch((e) => {
        if ((e as Error).name === 'AbortError') return;
        if (e instanceof InventoryApiError && e.status === 401) { setPosState('unauthorized'); return; }
        if (e instanceof InventoryApiError && e.status === 403) { setPosState('forbidden'); return; }
        setPosState('error');
      });
    return () => ctrl.abort();
  }, [nav, debouncedSearch, facilityFilter, healthFilter]);

  const facilities = useMemo(
    () => overview?.warehouses || [],
    [overview],
  );

  const filteredByNode = useMemo(() => {
    if (!selectedNode) return positions;
    if (selectedNode === 'warehouses') return positions;
    return positions;
  }, [positions, selectedNode]);

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
            <button key={n.id} onClick={() => setNav(n.id)}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${nav === n.id ? 'bg-cyan-950/40 text-cyan-300' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'}`}>
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
        {/* Hero */}
        <header className="flex flex-wrap items-center gap-3 border-b border-slate-800/70 px-4 py-3 lg:px-6">
          <div className="min-w-0">
            <p className="text-[9px] font-mono uppercase tracking-widest text-cyan-400">Salience Atlas · Ketraco</p>
            <h1 className="truncate text-base font-bold text-white lg:text-lg">INVENTORY INTELLIGENCE OS</h1>
            <p className="text-[11px] text-slate-400">AI-Powered · Real-Time · End-to-End · KETRACO</p>
          </div>
          <div className="relative ml-auto w-full max-w-xs">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory, PO, asset, location…" aria-label="Search inventory"
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500/60 focus:outline-none" />
          </div>
        </header>

        {overviewStatus === 'PARTIAL' && (
          <div className="flex items-center gap-2 border-b border-amber-500/20 bg-amber-500/5 px-4 py-2 text-[11px] text-amber-300 lg:px-6" role="status">
            <AlertTriangle className="h-3.5 w-3.5" /> Partial data — one or more sources degraded. Affected tiles show explicit state.
          </div>
        )}

        {/* KPI strip */}
        <section aria-label="Inventory KPIs" className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-3 lg:px-6 xl:grid-cols-7">
          {[
            { label: 'Total Inventory Value', value: formatKes(k.totalInventoryValueKes), sub: `${k.totalMaterials} SKUs` },
            { label: 'Total Positions', value: String(k.totalPositions), sub: 'stock rows (facility × SKU)' },
            { label: 'On Order (POs)', value: String(k.openPurchaseOrders), sub: 'open purchase / transfer' },
            { label: 'In Transit', value: String(k.inTransitMovements), sub: 'movements IN_TRANSIT' },
            { label: 'Warehouses', value: String(k.warehouses), sub: 'locations' },
            { label: 'Projects', value: k.projectsActive === null ? '—' : String(k.projectsActive), sub: k.projectsActive === null ? 'CONTRACT PENDING' : 'active projects' },
            { label: 'Stock Health', value: k.stockHealthPct === null ? '—' : `${k.stockHealthPct}%`, sub: k.stockHealthPct === null ? 'insufficient evidence' : 'healthy / classified' },
          ].map((t) => (
            <div key={t.label} className="rounded-xl border border-cyan-500/10 bg-[#0a1224]/80 p-3">
              <p className="text-[9px] font-mono uppercase tracking-wider text-slate-400">{t.label}</p>
              <p className="mt-0.5 truncate text-base font-bold text-white">{t.value}</p>
              <p className="truncate text-[10px] text-slate-500">{t.sub}</p>
            </div>
          ))}
        </section>

        {nav === 'overview' && (
          <div className="grid grid-cols-1 gap-3 p-3 lg:px-6 xl:grid-cols-3">
            {/* Network hero */}
            <section className="rounded-2xl border border-cyan-500/10 bg-[#0a1224]/80 p-4 xl:col-span-2" aria-label="Supply chain network">
              <div className="mb-1 flex items-center justify-between">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">Supply Chain Network</h2>
                {selectedNode && (
                  <button onClick={() => setSelectedNode(null)} className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400 hover:text-white">
                    <X className="h-3 w-3" /> CLEAR SELECTION
                  </button>
                )}
              </div>
              <p className="mb-3 text-[11px] text-slate-400">From Suppliers to Assets — End-to-End Visibility</p>
              <SupplyNetworkGraph overview={overview} selected={selectedNode} onSelect={setSelectedNode} />
              {/* Warehouse twin summary (data-driven occupancy) */}
              <div className="mt-4 border-t border-slate-800/70 pt-3">
                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-300">Warehouse Digital Twin — occupancy (live)</h3>
                {facilities.length === 0 ? (
                  <p className="text-[11px] text-slate-500">UNAVAILABLE — no warehouse source returned rows.</p>
                ) : (
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {facilities.slice(0, 4).map((w) => (
                      <li key={w.id}>
                        <button onClick={() => { setSelectedMaterial(null); setNav('warehouses'); setFacilityFilter(w.id); }}
                          className="w-full rounded-lg border border-slate-800 bg-slate-900/40 p-2.5 text-left hover:border-cyan-500/40">
                          <span className="flex items-center justify-between text-[11px] font-bold text-white">
                            <span className="truncate">{w.name}</span>
                            {w.alert && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />}
                          </span>
                          <span className="mt-1 block h-1.5 overflow-hidden rounded bg-slate-800">
                            <span className="block h-full rounded bg-cyan-400" style={{ width: `${Math.min(100, w.stockPercentage ?? 0)}%` }} />
                          </span>
                          <span className="mt-1 block text-[10px] font-mono text-slate-400">
                            {w.stockPercentage === null ? 'occupancy n/a' : `${w.stockPercentage}%`} · {w.itemsCount.toLocaleString()} units · {w.city || '—'}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            {/* Right rail */}
            <div className="space-y-3">
              <section className="rounded-2xl border border-cyan-500/10 bg-[#0a1224]/80 p-4" aria-label="Inventory health">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-white">Inventory Health</h2>
                {k.healthyCount + k.lowCount + k.criticalCount === 0 ? (
                  <p className="text-[11px] text-slate-500">UNVERIFIED — no classified positions. Consumption and lead-time inputs required before forecasting stockout.</p>
                ) : (
                  <Donut healthy={k.healthyCount} low={k.lowCount} critical={k.criticalCount} total={k.healthyCount + k.lowCount + k.criticalCount} />
                )}
                {k.unverifiedCount > 0 && <p className="mt-2 text-[10px] font-mono text-slate-500">{k.unverifiedCount} positions UNVERIFIED (insufficient evidence).</p>}
              </section>

              <section className="rounded-2xl border border-cyan-500/10 bg-[#0a1224]/80 p-4" aria-label="Top materials by value">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-white">Top Materials by Value</h2>
                {overview.topMaterialsByValue.length === 0 ? (
                  <p className="text-[11px] text-slate-500">UNAVAILABLE — no valued positions (unit costs absent).</p>
                ) : (
                  <ol className="space-y-1.5">
                    {overview.topMaterialsByValue.map((m, i) => (
                      <li key={m.sku} className="flex items-center gap-2 text-[11px]">
                        <span className="w-4 shrink-0 font-mono text-slate-500">{i + 1}</span>
                        <span className="min-w-0 flex-1 truncate text-slate-200">{m.description}</span>
                        <span className="shrink-0 font-mono text-slate-400">{formatKes(m.valueKes)}</span>
                        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: healthColor(m.health) }} title={m.health} />
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <section className="rounded-2xl border border-amber-500/20 bg-[#0a1224]/80 p-4" aria-label="AI insights">
                <h2 className="mb-1 text-xs font-bold uppercase tracking-wider text-white">AI Insights</h2>
                <p className="text-[11px] text-slate-400">CONTRACT PENDING — replenishment and vision recommenders land in Slices 8–9. No fabricated confidence is shown.</p>
                <button onClick={() => onAskCopilot('Summarise current inventory exposure from verified Atlas evidence only.')}
                  className="mt-2 w-full rounded-lg border border-cyan-500/40 px-3 py-2 text-[11px] font-mono text-cyan-300 hover:bg-cyan-500/10">
                  ASK ATLAS COPILOT (LIVE GATEWAY)
                </button>
              </section>

              <section className="rounded-2xl border border-cyan-500/10 bg-[#0a1224]/80 p-4" aria-label="Recent activity">
                <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-white">Recent Activity</h2>
                {overview.recentActivity.length === 0 ? (
                  <p className="text-[11px] text-slate-500">UNAVAILABLE — no logistics events for this tenant.</p>
                ) : (
                  <ul className="space-y-2">
                    {overview.recentActivity.slice(0, 5).map((e) => (
                      <li key={e.id} className="flex items-start gap-2 text-[11px]">
                        {e.severity === 'CRITICAL' || e.severity === 'WARNING'
                          ? <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />
                          : <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />}
                        <span className="min-w-0"><span className="block truncate text-slate-200">{e.message}</span>
                          <span className="font-mono text-[10px] text-slate-500">{e.eventType} · {e.createdAt}</span></span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </div>
        )}

        {(nav === 'materials' || nav === 'warehouses' || nav === 'transit') && (
          <section className="p-3 lg:px-6" aria-label="Inventory positions">
            <div className="rounded-2xl border border-cyan-500/10 bg-[#0a1224]/80 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <h2 className="text-xs font-bold uppercase tracking-wider text-white">
                  {nav === 'materials' ? 'Materials & Inventory Positions' : nav === 'warehouses' ? 'Warehouses & Storage' : 'Transit & Logistics'}
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
                      {(selectedNode ? filteredByNode : positions).slice(0, 60).map((p) => (
                        <tr key={`${p.sku}-${p.facilityId}`}
                          onClick={() => setSelectedMaterial(selectedMaterial?.sku === p.sku && selectedMaterial.facilityId === p.facilityId ? null : p)}
                          className={`cursor-pointer border-b border-slate-800/50 hover:bg-cyan-500/5 ${selectedMaterial?.sku === p.sku ? 'bg-cyan-500/5' : ''}`}>
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
              {selectedMaterial && (
                <div className="mt-3 rounded-xl border border-cyan-500/20 bg-slate-900/50 p-3 text-[11px]" role="dialog" aria-label="Material inspector">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-white">{selectedMaterial.description} <span className="font-mono text-slate-400">· {selectedMaterial.sku}</span></p>
                    <button onClick={() => setSelectedMaterial(null)} className="text-slate-400 hover:text-white" aria-label="Close inspector"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[['On hand', selectedMaterial.onHand], ['Reserved', selectedMaterial.reserved], ['Available (ATP base)', selectedMaterial.available], ['In transit', selectedMaterial.inTransit]].map(([l, v]) => (
                      <div key={l as string} className="rounded-lg bg-slate-950/60 p-2">
                        <p className="font-mono text-[9px] uppercase text-slate-500">{l}</p>
                        <p className="font-mono text-sm text-white">{(v as number).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-slate-400">Facility: {selectedMaterial.facilityName} · Bin: {selectedMaterial.binLocation || '—'} · UOM: {selectedMaterial.uom}</p>
                  <p className="mt-1 text-slate-400">Risk: {selectedMaterial.healthReason}</p>
                  <button onClick={() => onAskCopilot(`Explain stock exposure for ${selectedMaterial.sku} at ${selectedMaterial.facilityName} using verified Atlas evidence only.`)}
                    className="mt-2 inline-flex items-center gap-1 rounded-lg border border-cyan-500/40 px-3 py-1.5 font-mono text-[11px] text-cyan-300 hover:bg-cyan-500/10">
                    ASK COPILOT <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {!['overview', 'materials', 'warehouses', 'transit'].includes(nav) && (
          <section className="p-3 lg:px-6" aria-label="Pending contract">
            <div className="rounded-2xl border border-amber-500/20 bg-[#0a1224]/80 p-8 text-center">
              <Boxes className="mx-auto h-8 w-8 text-amber-400" />
              <h2 className="mt-2 text-sm font-bold text-white">{NAV.find((n) => n.id === nav)?.label} — CONTRACT PENDING</h2>
              <p className="mx-auto mt-1 max-w-lg text-[11px] text-slate-400">
                No backend contract exists for this view in Slice 1. It is intentionally unwired rather than
                simulated. Overview, positions, warehouses and transit above are live against Atlas persistence.
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
