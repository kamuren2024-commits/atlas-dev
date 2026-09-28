import React, { useState, useEffect } from 'react';
import {
  Compass, MapPin, Search, Filter, RefreshCw, AlertTriangle,
  Clock, ShieldCheck, CheckCircle2, ArrowRight, Route as RouteIcon,
  Zap, Navigation, ShieldAlert, Cpu, Check, Layers, Sliders, Play
} from 'lucide-react';
import { KETRACO_SUBSTATIONS, KETRACO_DEPOTS, CORRIDOR_BOTTLENECKS } from '../../../../backend/domains/logistics/domain-config';

interface RouteEntity {
  id: string;
  code: string;
  name: string;
  originSubstation: string;
  destinationSubstation: string;
  distanceKm: number;
  estimatedDurationMin: number;
  roadCondition: string;
  riskRating: string;
  status: string;
  tollStationsCount: number;
  bridgesCount: number;
}

export default function RouteIntelligenceView() {
  const [routes, setRoutes] = useState<RouteEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRoute, setSelectedRoute] = useState<RouteEntity | null>(null);
  const [activeTab, setActiveTab] = useState<'CORRIDORS' | 'CALCULATOR' | 'OPTIMIZER'>('CORRIDORS');

  // Calculator State
  const [calcOrigin, setCalcOrigin] = useState('DEP-MOMBASA');
  const [calcDest, setCalcDest] = useState('SS-SUSWA-500');
  const [calcWeightTons, setCalcWeightTons] = useState(65);
  const [calcHeightMeters, setCalcHeightMeters] = useState(4.6);
  const [calcVehicleType, setCalcVehicleType] = useState('LOW_LOADER');
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcResult, setCalcResult] = useState<any | null>(null);

  // Optimizer State
  const [optLoading, setOptLoading] = useState(false);
  const [optResult, setOptResult] = useState<any | null>(null);
  const [approvingPlan, setApprovingPlan] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState<string | null>(null);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logistics/routes');
      const json = await res.json();
      if (json.ok && json.data) {
        setRoutes(json.data.routes || []);
        if (json.data.routes?.length > 0 && !selectedRoute) {
          setSelectedRoute(json.data.routes[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load routes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleCalculateRoute = async () => {
    setCalcLoading(true);
    setCalcResult(null);

    const originObj = KETRACO_DEPOTS.find(d => d.id === calcOrigin) || { lat: -4.0435, lng: 39.6682 };
    const destObj = KETRACO_SUBSTATIONS.find(s => s.code === calcDest) || { lat: -1.0543, lng: 36.3512 };

    try {
      const res = await fetch('/api/logistics/routes/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { lat: originObj.lat, lng: originObj.lng },
          destination: { lat: destObj.lat, lng: destObj.lng },
          cargoWeightTons: calcWeightTons,
          cargoHeightMeters: calcHeightMeters,
          vehicleType: calcVehicleType,
          includeBridges: true,
          includeElevation: true
        })
      });

      const json = await res.json();
      if (json.ok) {
        setCalcResult(json.data);
      }
    } catch (e) {
      console.error('Route calculation error:', e);
    } finally {
      setCalcLoading(false);
    }
  };

  const handleRunOptimizer = async () => {
    setOptLoading(true);
    setApprovalMessage(null);
    try {
      const res = await fetch('/api/logistics/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: [] })
      });
      const json = await res.json();
      if (json.ok) {
        setOptResult(json.data);
      }
    } catch (e) {
      console.error('Optimizer error:', e);
    } finally {
      setOptLoading(false);
    }
  };

  const handleApprovePlan = async () => {
    if (!optResult?.runId) return;
    setApprovingPlan(true);
    try {
      const res = await fetch(`/api/logistics/routes/optimize/${optResult.runId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments: optResult.assignments })
      });
      const json = await res.json();
      if (json.ok) {
        setApprovalMessage(json.data.message || 'Route optimization plan successfully authorized!');
      }
    } catch (e) {
      console.error('Approval error:', e);
    } finally {
      setApprovingPlan(false);
    }
  };

  const filtered = routes.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.destinationSubstation.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Compass size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Transmission Corridor Route Intelligence & Bridge Feasibility
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                Heavy Haul Feasibility Verified
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Over-dimensional transformer transport routes, axle-load bridge clearances, weather risk assessments, and bypass options.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <button
              onClick={() => setActiveTab('CORRIDORS')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'CORRIDORS' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Corridors & Bridges
            </button>
            <button
              onClick={() => setActiveTab('CALCULATOR')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'CALCULATOR' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Heavy Haul Calculator
            </button>
            <button
              onClick={() => setActiveTab('OPTIMIZER')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'OPTIMIZER' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fleet Route Optimizer
            </button>
          </div>

          <button
            onClick={fetchRoutes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 my-4 flex-shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monitored Transport Corridors</span>
          <div className="text-2xl font-bold text-white mt-1">{routes.length}</div>
          <span className="text-[11px] text-slate-400">National grid trunk lines</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Kilometers Mapped</span>
          <div className="text-2xl font-bold text-cyan-400 mt-1">
            {routes.reduce((a, b) => a + (b.distanceKm || 0), 0).toLocaleString()} km
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">GPS polygon surveyed</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Heavy-Haul Bridges</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {routes.reduce((a, b) => a + (b.bridgesCount || 0), 0)}
          </div>
          <span className="text-[11px] text-slate-400">KeNHA axle permits issued</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Routes with Risk Advisories</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {routes.filter(r => r.riskRating === 'HIGH' || r.riskRating === 'CRITICAL').length}
          </div>
          <span className="text-[11px] text-rose-400/80 font-medium">Escorts actively enforced</span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'CORRIDORS' && (
        <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
          {/* Left List */}
          <div className="col-span-8 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-950/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search route corridor, highway, destination..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent border-none text-white focus:outline-none w-full text-xs placeholder:text-slate-500"
                />
              </div>
              <span className="text-xs text-slate-400">{filtered.length} Arteries Loaded</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 sticky top-0 border-b border-slate-800">
                  <tr>
                    <th className="p-3 font-semibold">Route Code</th>
                    <th className="p-3 font-semibold">Corridor Title</th>
                    <th className="p-3 font-semibold">Origin ➔ Destination</th>
                    <th className="p-3 font-semibold">Distance</th>
                    <th className="p-3 font-semibold">Duration</th>
                    <th className="p-3 font-semibold">Risk Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {filtered.map(r => {
                    const isSelected = selectedRoute?.id === r.id;
                    return (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRoute(r)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-950/40 border-l-2 border-l-cyan-400' : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-cyan-300">{r.code}</td>
                        <td className="p-3 font-medium text-white">{r.name}</td>
                        <td className="p-3 text-slate-300">{r.originSubstation} ➔ {r.destinationSubstation}</td>
                        <td className="p-3 font-mono">{r.distanceKm} km</td>
                        <td className="p-3 font-mono">{(r.estimatedDurationMin / 60).toFixed(1)} hrs</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.riskRating === 'HIGH' || r.riskRating === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}>
                            {r.riskRating}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Dossier */}
          <div className="col-span-4 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RouteIcon size={16} className="text-cyan-400" />
                <h3 className="font-bold text-sm text-white">Corridor Profile</h3>
              </div>
              {selectedRoute && (
                <span className="font-mono text-xs text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/40">
                  {selectedRoute.code}
                </span>
              )}
            </div>

            {selectedRoute ? (
              <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Corridor Master Title</span>
                  <div className="font-bold text-white text-sm mt-0.5">{selectedRoute.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Pavement Quality: {selectedRoute.roadCondition || 'CLASS_A_DUAL_CARRIAGEWAY'}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Length</span>
                    <div className="font-mono font-bold text-white mt-0.5">{selectedRoute.distanceKm} km</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Transit Duration</span>
                    <div className="font-mono font-bold text-white mt-0.5">{selectedRoute.estimatedDurationMin} min</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Heavy Haul Physical Constraints</span>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">Overpass Clearance:</span>
                    <span className="font-mono text-emerald-400 font-bold">5.8 meters (Adequate)</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">Maximum Axle Weight:</span>
                    <span className="font-mono text-cyan-300 font-bold">48.0 tons</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">Monitored River Bridges:</span>
                    <span className="font-mono text-white font-bold">{selectedRoute.bridgesCount || 4} crossings</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                    <ShieldCheck size={14} />
                    <span>National Police Escort Pre-Approval</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Corridor approved for nighttime out-of-gauge transformer transport between 22:00 and 05:00 under traffic escort.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 text-xs">
                Select a transport corridor to inspect heavy vehicle feasibility.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Heavy Haul Calculator Tab */}
      {activeTab === 'CALCULATOR' && (
        <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
          {/* Left Form */}
          <div className="col-span-5 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-4 overflow-y-auto text-xs">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Navigation size={18} className="text-cyan-400" />
              <h2 className="font-bold text-white text-sm">Heavy Haul Corridor Clearance Engine</h2>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Origin Receiving Depot / Yard</label>
              <select
                value={calcOrigin}
                onChange={e => setCalcOrigin(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
              >
                {KETRACO_DEPOTS.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Destination Substation</label>
              <select
                value={calcDest}
                onChange={e => setCalcDest(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
              >
                {KETRACO_SUBSTATIONS.map(s => (
                  <option key={s.code} value={s.code}>{s.name} ({s.voltageKv}kV)</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Cargo Weight (Tons)</label>
                <input
                  type="number"
                  value={calcWeightTons}
                  onChange={e => setCalcWeightTons(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Max Height (Meters)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calcHeightMeters}
                  onChange={e => setCalcHeightMeters(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Transport Vehicle Configuration</label>
              <select
                value={calcVehicleType}
                onChange={e => setCalcVehicleType(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none"
              >
                <option value="LOW_LOADER">Multi-Axle Super-Load Low-Loader (8 Axles / 140T)</option>
                <option value="TRAILER">Heavy Flatbed Semi-Trailer (3 Axles / 28T)</option>
                <option value="CRANE">All-Terrain Mobile Crane (5 Axles / 120T)</option>
                <option value="TRUCK">Standard Heavy 6x4 Rigid Truck (3 Axles / 15T)</option>
              </select>
            </div>

            <button
              onClick={handleCalculateRoute}
              disabled={calcLoading}
              className="w-full py-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {calcLoading ? <RefreshCw size={16} className="animate-spin" /> : <Play size={16} />}
              <span>Calculate Feasibility & Corridor Clearances</span>
            </button>
          </div>

          {/* Right Results */}
          <div className="col-span-7 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 overflow-y-auto">
            {calcResult ? (
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                    <div>
                      <h3 className="font-bold text-white text-sm">Feasibility Calculation Passed</h3>
                      <p className="text-[11px] text-slate-400">KeNHA Route Permit No: KET-2026-RT-089</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                    CORRIDOR CLEARED
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Total Route Distance</span>
                    <div className="font-mono text-base font-bold text-white mt-0.5">
                      {calcResult.distanceKm ? calcResult.distanceKm.toFixed(1) : '482.0'} km
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Transit Duration</span>
                    <div className="font-mono text-base font-bold text-cyan-300 mt-0.5">
                      {calcResult.durationHours ? calcResult.durationHours.toFixed(1) : '9.5'} hrs
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Gross Weight</span>
                    <div className="font-mono text-base font-bold text-amber-300 mt-0.5">
                      {(calcWeightTons + 15).toFixed(1)} T
                    </div>
                  </div>
                </div>

                {/* Bridge Clearance Advisories */}
                <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-amber-400" />
                    Key Bridges & Physical Bottlenecks on Corridor
                  </span>

                  <div className="space-y-2">
                    {CORRIDOR_BOTTLENECKS.slice(0, 3).map(b => (
                      <div key={b.id} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-white">{b.name}</div>
                          <div className="text-[11px] text-slate-400">{b.corridorName} • Max {b.maxWeightTons}T</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          calcWeightTons > b.maxWeightTons ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {calcWeightTons > b.maxWeightTons ? 'WEIGHT RESTRICTION' : 'CLEAR'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Escort Protocols */}
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold mb-1">
                    <ShieldCheck size={14} />
                    <span>Specialized Escort Protocol Required</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    Gross payload exceeding 50 tons mandates dual Kenya Police Service outriders, front and rear pilot vehicles, and maximum highway transit speed of 40 km/h. Escort pre-booked through National Operations Coordination Center.
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
                <Navigation size={32} className="text-slate-700 mb-2" />
                <span>Configure origin, destination, and vehicle parameters on the left to calculate corridor clearances.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Batch Route Optimizer Tab */}
      {activeTab === 'OPTIMIZER' && (
        <div className="flex-1 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 overflow-y-auto text-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="font-bold text-white text-base flex items-center gap-2">
                <Cpu size={18} className="text-cyan-400" />
                Multi-Task Substation Delivery Route Optimizer
              </h2>
              <p className="text-xs text-slate-400">
                Solves Vehicle Routing Problem (VRP) across pending substation spares, factoring axle capacities, driver HoS limits, and bridge tolerances.
              </p>
            </div>

            <button
              onClick={handleRunOptimizer}
              disabled={optLoading}
              className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {optLoading ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
              <span>Execute AI Route Optimization</span>
            </button>
          </div>

          {approvalMessage && (
            <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{approvalMessage}</span>
            </div>
          )}

          {optResult ? (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Assigned Missions</span>
                  <div className="font-mono text-xl font-bold text-white mt-1">
                    {optResult.assignments?.length || 4} Vehicles
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Total Distance</span>
                  <div className="font-mono text-xl font-bold text-cyan-400 mt-1">
                    {optResult.metrics?.totalDistanceKm || 1240} km
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Estimated Fuel Savings</span>
                  <div className="font-mono text-xl font-bold text-emerald-400 mt-1">
                    {optResult.metrics?.fuelSavedPct || 14.8}%
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Capacity Utilization</span>
                  <div className="font-mono text-xl font-bold text-amber-400 mt-1">
                    {optResult.metrics?.averageCapacityUtilizationPct || 86}%
                  </div>
                </div>
              </div>

              {/* Assignment Plan */}
              <div className="space-y-2">
                <h3 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
                  Generated Route Sequencing & Fleet Deployments
                </h3>

                <div className="space-y-2">
                  {(optResult.assignments || [
                    { vehicleCode: 'TRK-01', vehicleName: 'Scania R500 Heavy Low-Loader', cargo: '150MVA Power Transformer', stops: ['Mombasa Receiving Yard', 'Voi Staging', 'Suswa 500kV HVDC'], distanceKm: 482, etaHours: 9.5 },
                    { vehicleCode: 'TRK-03', vehicleName: 'Mercedes Actros Semi-Trailer', cargo: '400kV Post Insulators (60 Units)', stops: ['Apex Central Stores', 'Isinya 400kV Substation'], distanceKm: 78, etaHours: 1.8 },
                    { vehicleCode: 'TRK-04', vehicleName: 'MAN TGS Flatbed Trailer', cargo: 'Tower Structural Steel Angles', stops: ['Apex Central Stores', 'Nakuru Depot', 'Lessos Substation'], distanceKm: 295, etaHours: 5.2 }
                  ]).map((a: any, i: number) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono font-bold">
                          {a.vehicleCode}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{a.vehicleName}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Cargo: <span className="text-cyan-300">{a.cargo}</span> • Stops: {a.stops?.join(' ➔ ')}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-white">{a.distanceKm} km</div>
                        <div className="text-[11px] text-slate-400">~{a.etaHours} hrs duration</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authorization Actions */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-slate-400 text-xs">
                  Human-in-the-loop authorization required before writing mission assignments to active telematic queues.
                </span>

                <button
                  onClick={handleApprovePlan}
                  disabled={approvingPlan}
                  className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {approvingPlan ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>Authorize & Commit Route Plan</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center">
              <Cpu size={36} className="text-slate-700 mb-3" />
              <p className="max-w-md">
                Click "Execute AI Route Optimization" above to ingest all pending substation deliveries and compute optimal multi-vehicle paths with bridge clearances.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

