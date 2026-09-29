import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Truck, Package, AlertTriangle, AlertCircle, Clock, Activity,
  CheckCircle2, ChevronRight, TrendingUp, TrendingDown, RefreshCw,
  Compass, MapPin, Zap, Bot, ShieldAlert, Cpu, Sparkles,
  ArrowRight, ShieldCheck, Play, Layers, ExternalLink, SlidersHorizontal,
  Filter, BarChart3, Database, Search, ArrowUpRight, Gauge,
  CloudSun, Fuel, Calendar, Wrench, FileText, Check, X, Radio
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export interface OverviewData {
  timestamp: string;
  dataAvailable: boolean;
  simulationMode: boolean;
  kpis: {
    fleet: {
      label: string;
      total: number;
      moving: number;
      available: number;
      maintenance: number;
      offline: number;
      availabilityPct: number;
      trend: string;
    };
    missions: {
      label: string;
      total: number;
      critical: number;
      delayed: number;
      atRisk: number;
      trend: string;
    };
    cargo: {
      label: string;
      shipmentsInTransit: number;
      highPriority: number;
      valueKes: string;
    };
    warehouses: {
      label: string;
      total: number;
      operational: number;
      lowStock: number;
    };
    projects: {
      label: string;
      total: number;
      nearMilestone: number;
    };
    weather: {
      location: string;
      tempC: number;
      condition: string;
      wind: string;
      humidity: string;
      visibility: string;
    };
  };
  fleetStatus: {
    total: number;
    moving: number;
    movingPct: number;
    available: number;
    availablePct: number;
    maintenance: number;
    maintenancePct: number;
    offline: number;
    offlinePct: number;
  };
  recentMissions: Array<{
    id: string;
    rawId: string;
    description: string;
    status: string;
    eta: string;
    priority: string;
  }>;
  fuelIntelligence: {
    totalFuelIssuedL?: number;
    totalIssuedL?: number;
    totalIssuedTrend: string;
    actualConsumptionL: number;
    actualConsumptionTrend: string;
    varianceL: number;
    variancePct: number;
    history: Array<{ day: string; expected: number; actual: number }>;
  };
  warehouseOverview: Array<{
    name: string;
    stockPercentage: number;
    itemsCount: number;
    status: string;
    alert: boolean;
  }>;
  projectProgress: Array<{
    name: string;
    progressPct: number;
    status: string;
  }>;
  aiOperationsFeed: Array<{
    id: string;
    code: string;
    category: string;
    severity: string;
    title: string;
    message: string;
    entityType: string;
    entityId: string;
    entityName: string;
    variance: string;
    probabilityPct: number;
    aiRecommendation: string;
    timeAgo: string;
  }>;
  liveEvents: Array<{
    id: string;
    type: string;
    severity: string;
    message: string;
    timestamp: string;
  }>;
  aiAgents: Array<{
    id: string;
    name: string;
    status: string;
  }>;
}

export const CommandCenter: React.FC = () => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [liveClock, setLiveClock] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [selectedException, setSelectedException] = useState<any | null>(null);
  const [harnessRunning, setHarnessRunning] = useState<boolean>(false);
  const [harnessResults, setHarnessResults] = useState<any | null>(null);
  const [simTickRunning, setSimTickRunning] = useState<boolean>(false);

  // Live Clock (EAT)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString('en-GB', { hour12: false }) + ' EAT');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch the current Logistics snapshot.
  const fetchOverview = useCallback(async (isSilent = false) => {
    if (!isSilent) setRefreshing(true);
    try {
      const res = await fetch('/api/logistics/overview');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (!json.ok || !json.data) throw new Error(json.error || 'The Logistics overview returned no data.');
      setData(json.data);
      setFetchError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setFetchError(`Unable to load the Logistics overview: ${message}`);
      console.warn('[CommandCenter] Failed to fetch overview:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview(false);
    // Polling interval every 6 seconds for fresh telematics
    const pollInterval = setInterval(() => {
      fetchOverview(true);
    }, 6000);
    return () => clearInterval(pollInterval);
  }, [fetchOverview]);

  // Execute Simulation Tick
  const handleSimTick = async () => {
    setSimTickRunning(true);
    try {
      const res = await fetch('/api/logistics/simulation/tick', { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        setActionSuccess(`Simulated Telemetry Tick: ${json.data.updatedVehicles} vehicles updated (simulationFlag=true)`);
        await fetchOverview(true);
      }
    } catch {
      setActionSuccess('Simulation tick failed');
    } finally {
      setSimTickRunning(false);
      setTimeout(() => setActionSuccess(null), 3500);
    }
  };

  // Run Test Harness H1-H6
  const handleRunHarness = async () => {
    setHarnessRunning(true);
    try {
      const res = await fetch('/api/logistics/harness/run', { method: 'POST' });
      const json = await res.json();
      if (json.ok) {
        setHarnessResults(json.data);
        setActionSuccess(`Harness Passed: ${json.data.passed}/${json.data.total} Scenarios`);
        await fetchOverview(true);
      }
    } catch {
      setActionSuccess('Test harness execution failed');
    } finally {
      setHarnessRunning(false);
      setTimeout(() => setActionSuccess(null), 4000);
    }
  };

  if (!data) {
    return (
      <main className="logistics-workspace flex min-h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <div role={fetchError ? 'alert' : 'status'} className="max-w-xl rounded-xl border border-slate-700/70 bg-slate-900/70 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white">
            {fetchError ? 'Command Center data unavailable' : 'Loading operational snapshot'}
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            {fetchError || 'Waiting for the Logistics overview service. No sample telemetry is shown.'}
          </p>
          {fetchError && (
            <button
              type="button"
              onClick={() => void fetchOverview(false)}
              className="mt-4 rounded-lg border border-cyan-400/40 bg-cyan-900/30 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-800/40"
            >
              Retry overview
            </button>
          )}
        </div>
      </main>
    );
  }

  const { kpis, fleetStatus, recentMissions, fuelIntelligence, warehouseOverview: warehouses, projectProgress, aiOperationsFeed: exceptions, liveEvents } = data;

  const pieData = [
    { name: 'Moving', value: fleetStatus.moving, color: '#3b82f6' },
    { name: 'Available', value: fleetStatus.available, color: '#10b981' },
    { name: 'Maintenance', value: fleetStatus.maintenance, color: '#f59e0b' },
    { name: 'Offline', value: fleetStatus.offline, color: '#ef4444' },
  ];

  return (
    <div className="logistics-workspace logistics-command-center flex flex-col min-h-screen bg-[#070B14] text-slate-100 font-sans pb-16">
      {/* Toast Notification */}
      <AnimatePresence>
        {actionSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-950/90 border border-emerald-500/40 rounded-xl shadow-2xl backdrop-blur-md text-emerald-300 text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            <span>{actionSuccess}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Header Bar */}
      <header className="border-b border-slate-800/80 bg-[#090E1B]/95 px-6 py-4 backdrop-blur-md sticky top-0 z-30">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Truck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-white">Logistics Command Center</h1>

                {/* Simulation Indicator Directive: Provide visual indicator for simulation mode */}
                {data?.simulationMode ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase bg-amber-500/15 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    SIMULATION FABRIC ACTIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    {data.simulationMode ? 'DEMO SIMULATION' : 'OPERATIONAL DATA'}
                  </span>
                )}

                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-400 border border-slate-700">
                  KETRACO GRID DOMAIN
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Logistics operational overview · Data supplied by the Logistics service
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Clock */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
              <Clock size={13} className="text-cyan-400" />
              <span>{liveClock || '--:--:-- EAT'}</span>
            </div>

            {/* Simulation Controls */}
            <button
              onClick={handleSimTick}
              disabled={simTickRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Simulate a 5-second telematic movement tick (simulationFlag=true)"
            >
              <Activity size={13} className={simTickRunning ? 'animate-spin' : ''} />
              <span>Sim Tick</span>
            </button>

            {/* Test Harness Button */}
            <button
              onClick={handleRunHarness}
              disabled={harnessRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Run Automated Scenarios H1 through H6"
            >
              <Play size={13} className={harnessRunning ? 'animate-pulse' : ''} />
              <span>Run Harness</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchOverview(false)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Refresh Logistics Data"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin text-cyan-400' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Harness Results Drawer */}
      <AnimatePresence>
        {harnessResults && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-[#0D1527] border-b border-indigo-500/30 px-6 py-3 overflow-hidden"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span className="font-bold text-white">Automated Test Harness Execution</span>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-mono text-[10px]">
                  {harnessResults.passed} / {harnessResults.total} PASSED
                </span>
              </div>
              <button
                onClick={() => setHarnessResults(null)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-2">
              {harnessResults.results.map((r: any) => (
                <div key={r.scenarioId} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px]">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-cyan-400">{r.scenarioId}</span>
                    <span className={r.status === 'PASSED' ? 'text-emerald-400' : 'text-red-400'}>{r.status}</span>
                  </div>
                  <div className="text-slate-300 text-[10px] truncate mt-0.5">{r.name}</div>
                  <div className="text-slate-500 text-[9px] mt-0.5">{r.durationMs}ms</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-6 pt-5 space-y-6 max-w-[1780px] mx-auto w-full">
        {/* 2. Top Metric Cards (6 Cards matching blueprint) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* 1: Fleet */}
          <div className="p-3.5 rounded-xl bg-[#0C1322] border border-slate-800 hover:border-cyan-500/30 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Fleet</span>
              <Truck size={15} className="text-cyan-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">{kpis.fleet.total}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {kpis.fleet.moving} moving, {kpis.fleet.available} available
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400">{kpis.fleet.availabilityPct}% operational</span>
              <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                <TrendingUp size={10} /> {kpis.fleet.trend}
              </span>
            </div>
          </div>

          {/* 2: Active Missions */}
          <div className="p-3.5 rounded-xl bg-[#0C1322] border border-slate-800 hover:border-indigo-500/30 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Active Missions</span>
              <Compass size={15} className="text-indigo-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">{kpis.missions.total}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              <span className="text-rose-400 font-semibold">{kpis.missions.critical} critical</span>, <span className="text-amber-400">{kpis.missions.delayed} delayed</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400">{kpis.missions.atRisk} at risk</span>
              <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                <TrendingUp size={10} /> {kpis.missions.trend}
              </span>
            </div>
          </div>

          {/* 3: Cargo in Transit */}
          <div className="p-3.5 rounded-xl bg-[#0C1322] border border-slate-800 hover:border-violet-500/30 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Cargo in Transit</span>
              <Package size={15} className="text-violet-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">{kpis.cargo.shipmentsInTransit}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {kpis.cargo.highPriority} high-priority shipments
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400">KES {kpis.cargo.valueKes}</span>
              <span className="text-emerald-400 font-medium flex items-center gap-0.5">
                <CheckCircle2 size={10} /> In transit
              </span>
            </div>
          </div>

          {/* 4: Warehouses */}
          <div className="p-3.5 rounded-xl bg-[#0C1322] border border-slate-800 hover:border-amber-500/30 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Warehouses</span>
              <MapPin size={15} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">{kpis.warehouses.total}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {kpis.warehouses.operational} operational, <span className="text-amber-400">{kpis.warehouses.lowStock} low stock</span>
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400">Embakasi Hub</span>
              <span className="text-amber-400 font-medium">Stock Alert</span>
            </div>
          </div>

          {/* 5: Projects */}
          <div className="p-3.5 rounded-xl bg-[#0C1322] border border-slate-800 hover:border-emerald-500/30 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Projects</span>
              <Layers size={15} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">{kpis.projects.total}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              Ongoing transmission lines
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400">{kpis.projects.nearMilestone} near milestone</span>
              <span className="text-emerald-400 font-medium">Active</span>
            </div>
          </div>

          {/* 6: Weather */}
          <div className="p-3.5 rounded-xl bg-[#0C1322] border border-slate-800 hover:border-sky-500/30 transition-all group">
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{kpis.weather.location}</span>
              <CloudSun size={15} className="text-sky-400" />
            </div>
            <div className="text-2xl font-bold tracking-tight text-white">{kpis.weather.tempC}°C</div>
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {kpis.weather.condition}
            </div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[10px]">
              <span className="text-slate-400">{kpis.weather.wind}</span>
              <span className="text-sky-400 font-medium">{kpis.weather.humidity}</span>
            </div>
          </div>
        </div>

        {/* 3. Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Center 8 Columns */}
          <div className="lg:col-span-8 space-y-6">
            {/* 3.1 Fleet Status (Donut) & Recent Missions Table */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Fleet Status (Donut) — 5 Cols */}
              <div className="md:col-span-5 p-4 rounded-xl bg-[#0C1322] border border-slate-800 flex flex-col justify-between">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <Truck size={15} className="text-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Fleet Status</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{fleetStatus.total} Units</span>
                </div>

                <div className="h-44 w-full flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '0.5rem',
                          fontSize: '11px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center Metric */}
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-white">{fleetStatus.total}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-800/80 text-[11px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-300">Moving</span>
                    </div>
                    <span className="font-semibold text-white">{fleetStatus.moving} ({fleetStatus.movingPct}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-slate-300">Available</span>
                    </div>
                    <span className="font-semibold text-white">{fleetStatus.available} ({fleetStatus.availablePct}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-slate-300">Maint.</span>
                    </div>
                    <span className="font-semibold text-white">{fleetStatus.maintenance} ({fleetStatus.maintenancePct}%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-slate-300">Offline</span>
                    </div>
                    <span className="font-semibold text-white">{fleetStatus.offline} ({fleetStatus.offlinePct}%)</span>
                  </div>
                </div>
              </div>

              {/* Recent Missions Table — 7 Cols */}
              <div className="md:col-span-7 p-4 rounded-xl bg-[#0C1322] border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Compass size={15} className="text-indigo-400" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Recent Missions</h3>
                    </div>
                    <span className="text-[11px] text-cyan-400 font-medium hover:underline cursor-pointer">
                      View all ({kpis.missions.total}) →
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-500 border-b border-slate-800/60 pb-1">
                          <th className="font-semibold pb-1.5">ID</th>
                          <th className="font-semibold pb-1.5">Description</th>
                          <th className="font-semibold pb-1.5">Status</th>
                          <th className="font-semibold pb-1.5">ETA</th>
                          <th className="font-semibold pb-1.5 text-right">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {recentMissions.map((m) => {
                          const statusBg =
                            m.status === 'En Route'
                              ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                              : m.status === 'On Site'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              : m.status === 'Delayed'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : m.status === 'Loading'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700';

                          const priorityBg =
                            m.priority === 'Critical'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : m.priority === 'High'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700';

                          return (
                            <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-2 font-mono font-bold text-slate-300">{m.id}</td>
                              <td className="py-2 text-slate-200 font-medium truncate max-w-[150px]">{m.description}</td>
                              <td className="py-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${statusBg}`}>
                                  {m.status}
                                </span>
                              </td>
                              <td className="py-2 font-mono text-slate-300">{m.eta}</td>
                              <td className="py-2 text-right">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${priorityBg}`}>
                                  {m.priority}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Source: ATLAS Dispatch Core</span>
                  <span className="text-emerald-400 font-medium">6 active convoys synced</span>
                </div>
              </div>
            </div>

            {/* 3.2 Fuel Intelligence Section */}
            <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                <div className="flex items-center gap-2">
                  <Fuel size={16} className="text-cyan-400" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Fuel Intelligence</h3>
                    <p className="text-[11px] text-slate-400">Consumption analytics & optimization vs planned corridor burn</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-400">Variance: </span>
                    <span className="font-mono font-bold text-emerald-400">{(fuelIntelligence.varianceL ?? 0).toLocaleString()} L ({fuelIntelligence.variancePct ?? 0}%)</span>
                  </div>
                </div>
              </div>

              {/* 3 Stat Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Total Issued</span>
                  <div className="text-lg font-bold text-white mt-0.5">{(fuelIntelligence.totalFuelIssuedL ?? 0).toLocaleString()} L</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">{fuelIntelligence.totalIssuedTrend}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Actual Consumption</span>
                  <div className="text-lg font-bold text-cyan-400 mt-0.5">{(fuelIntelligence.actualConsumptionL ?? 0).toLocaleString()} L</div>
                  <div className="text-[10px] text-cyan-300 mt-0.5 font-medium">{fuelIntelligence.actualConsumptionTrend}</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Variance vs Expected</span>
                  <div className="text-lg font-bold text-emerald-400 mt-0.5">{(fuelIntelligence.varianceL ?? 0).toLocaleString()} L</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 font-medium">Optimal consumption envelope</div>
                </div>
              </div>

              {/* 7-day Bar Chart */}
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fuelIntelligence.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.5rem',
                        fontSize: '11px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="expected" name="Planned / Expected" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="actual" name="Actual Consumption" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3.3 Warehouses Overview (6 cards) */}
            <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <MapPin size={15} className="text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Warehouses</h3>
                </div>
                <span className="text-[11px] text-slate-400">6 Regional Facilities</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {warehouses.map((w) => (
                  <div
                    key={w.name}
                    className={`p-2.5 rounded-lg border transition-all ${
                      w.alert
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-900/80 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-200 truncate">{w.name}</span>
                      {w.alert && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-base font-bold text-white">{w.stockPercentage}%</span>
                      <span className="text-[10px] text-slate-400">{(w.itemsCount ?? 0).toLocaleString()} items</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full ${w.alert ? 'bg-amber-400' : 'bg-emerald-400'}`}
                        style={{ width: `${w.stockPercentage}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-semibold uppercase mt-1 text-slate-400">
                      {w.alert ? 'Stock Alert' : 'Operational'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3.4 Project Progress (6 transmission lines) */}
            <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Layers size={15} className="text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Project Progress</h3>
                </div>
                <span className="text-[11px] text-slate-400">Supply Requirement Fulfillment</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {projectProgress.map((p) => {
                  const statusColor =
                    p.status === 'On track'
                      ? 'text-emerald-400'
                      : p.status === 'At risk'
                      ? 'text-amber-400'
                      : 'text-rose-400';

                  const barColor =
                    p.status === 'On track'
                      ? 'bg-emerald-400'
                      : p.status === 'At risk'
                      ? 'bg-amber-400'
                      : 'bg-rose-400';

                  return (
                    <div key={p.name} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-200">{p.name}</span>
                        <span className={`text-[10px] font-bold ${statusColor}`}>{p.status}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 mt-1">
                        <span>Fulfillment</span>
                        <span className="font-mono font-bold text-white">{p.progressPct}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${p.progressPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: AI Operations Feed & AI Agents (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* AI Operations Feed (7 Active Exceptions) */}
            <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-cyan-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">AI Operations Feed</h3>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {exceptions.length} Active Exceptions
                </span>
              </div>

              {/* Exception Cards list */}
              <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                {exceptions.map((exc) => {
                  const sevBorder =
                    exc.severity === 'CRITICAL'
                      ? 'border-l-4 border-l-rose-500 border-slate-800'
                      : exc.severity === 'HIGH'
                      ? 'border-l-4 border-l-amber-500 border-slate-800'
                      : 'border-l-4 border-l-blue-500 border-slate-800';

                  const sevBadge =
                    exc.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                      : exc.severity === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30';

                  return (
                    <div
                      key={exc.id}
                      onClick={() => setSelectedException(exc)}
                      className={`p-3 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border transition-all cursor-pointer ${sevBorder}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-semibold text-xs text-white leading-snug">
                          {exc.title}
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border flex-shrink-0 ${sevBadge}`}>
                          {exc.severity}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {exc.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/60 text-[10px]">
                        <span className="text-slate-500">{exc.timeAgo}</span>
                        <span className="text-cyan-400 font-mono font-medium">{exc.variance}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 15 AI Agents Status Grid */}
            <div className="p-4 rounded-xl bg-[#0C1322] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Cpu size={15} className="text-indigo-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">AI Agents Status</h3>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">15 / 15 ONLINE</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  'Fleet Intel', 'Dispatch Opt', 'Route Opt',
                  'Cargo & WH', 'Maint Predict', 'Fuel Intel',
                  'Risk & Sec', 'Emerg Resp', 'Contractor',
                  'Compliance', 'Cost Opt', 'Weather/Terrain',
                  'Project Intel', 'Knowledge Graph', 'Orchestration'
                ].map((name) => (
                  <div
                    key={name}
                    className="p-1.5 rounded bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[10px]"
                  >
                    <span className="text-slate-300 truncate max-w-[80px]">{name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Live Events Stream Ticker */}
        <div className="p-3.5 rounded-xl bg-[#090E1B] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-shrink-0">
            <Radio size={14} className="text-cyan-400 animate-pulse" />
            <span className="font-bold uppercase tracking-wider text-slate-300 text-[11px]">Recent Logistics Events:</span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto py-1 text-slate-400 flex-1">
            {liveEvents.slice(0, 4).map((ev) => (
              <div key={ev.id} className="flex items-center gap-1.5 whitespace-nowrap text-[11px] bg-slate-900/80 px-2.5 py-1 rounded border border-slate-800">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                <span className="text-slate-200">{ev.message}</span>
              </div>
            ))}
            {liveEvents.length === 0 && (
              <span className="text-slate-400">No recent events reported.</span>
            )}
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex-shrink-0">
            Snapshot: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Exception Detail Modal */}
      <AnimatePresence>
        {selectedException && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-2xl bg-[#0D1527] border border-slate-700 shadow-2xl text-slate-200 space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                    {selectedException.code} · {selectedException.category}
                  </span>
                  <h3 className="text-base font-bold text-white mt-2">{selectedException.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedException(null)}
                  className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                {selectedException.message}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Entity Reference</span>
                  <div className="font-semibold text-slate-200 mt-0.5">{selectedException.entityName}</div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Variance / Impact</span>
                  <div className="font-semibold text-amber-400 mt-0.5">{selectedException.variance}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <Sparkles size={14} />
                  <span>AI Recommendation Engine</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedException.aiRecommendation}
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setSelectedException(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CommandCenter;
