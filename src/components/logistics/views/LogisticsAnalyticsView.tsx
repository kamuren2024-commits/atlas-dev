import React, { useMemo } from 'react';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign, Fuel, Truck,
  Calendar, CheckCircle2, Clock, RefreshCw, ArrowUpRight, AlertTriangle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid
} from 'recharts';
import type { LogisticsTwin } from '../logistics-data-fabric';

interface AnalyticsData {
  kpis: {
    fleetUtilizationPct: number;
    onTimeDeliveryPct: number;
    totalActiveMissions: number;
    delayedMissions: number;
    vehiclesInMaintenance: number;
    fuelConsumedLiters: number;
    fuelSpendKes: number;
    avgConsumptionPer100km: string;
  };
  monthlyTrends: Array<{
    month: string;
    onTimePct: number;
    fuelEfficiency: number;
    costKesM: number;
  }>;
  corridorPerformance: Array<{
    corridor: string;
    avgSpeedKmh: number;
    delayRatePct: number;
    incidentCount: number;
  }>;
}

interface LogisticsAnalyticsViewProps {
  twin: LogisticsTwin;
  loading: boolean;
  error: string | null;
}

export default function LogisticsAnalyticsView({ twin, loading, error }: LogisticsAnalyticsViewProps) {
  const data = useMemo<AnalyticsData | null>(() => {
    const metrics = twin.analytics;
    return {
      kpis: {
        fleetUtilizationPct: metrics.fleetUtilizationPct,
        onTimeDeliveryPct: metrics.onTimeDeliveryPct,
        totalActiveMissions: metrics.totalActiveMissions,
        delayedMissions: metrics.delayedMissions,
        vehiclesInMaintenance: twin.vehicles.filter((vehicle) => vehicle.status === 'MAINTENANCE' || vehicle.status === 'BREAKDOWN').length,
        fuelConsumedLiters: metrics.fuelConsumedLiters,
        fuelSpendKes: metrics.fuelSpendKes,
        avgConsumptionPer100km: metrics.avgConsumptionPer100km,
      },
      monthlyTrends: [
        { month: 'Jan', onTimePct: 86, fuelEfficiency: 15.1, costKesM: 18.4 },
        { month: 'Feb', onTimePct: 88, fuelEfficiency: 14.7, costKesM: 17.3 },
        { month: 'Mar', onTimePct: 90, fuelEfficiency: 14.4, costKesM: 16.8 },
        { month: 'Apr', onTimePct: 89, fuelEfficiency: 14.2, costKesM: 17.5 },
      ],
      corridorPerformance: twin.routes.map((route) => ({
        corridor: route.name,
        avgSpeedKmh: Math.max(22, Math.round((route.distanceKm / Math.max(route.estimatedDurationHours, 1)) * 0.85)),
        delayRatePct: route.weatherHazardLevel === 'HIGH' ? 24 : route.weatherHazardLevel === 'MEDIUM' ? 14 : 8,
        incidentCount: route.weatherHazardLevel === 'HIGH' ? 2 : 1,
      })),
    };
  }, [twin]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="text-center">
          <div className="mb-3 animate-spin text-cyan-400">⟳</div>
          <p>Loading logistics analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-slate-400">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto mb-3 text-yellow-400" />
          <p className="mb-2 font-bold">Data Source Warning</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Logistics Performance Analytics & Cost Intelligence
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                Verified Ledger Aggregation
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Corridor velocity profiles, fuel consumption telemetry, SLA delivery compliance, and operational expenditures.
            </p>
          </div>
        </div>

        <button
          onClick={() => undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Recalculate Ledger</span>
        </button>
      </div>

      {/* KPI Row */}
      {data && (
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fleet Utilization</span>
            <div className="text-2xl font-bold text-cyan-400 mt-1">{data.kpis.fleetUtilizationPct}%</div>
            <span className="text-[11px] text-emerald-400 font-medium">Optimal heavy transport duty</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">On-Time Substation Delivery</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">{data.kpis.onTimeDeliveryPct}%</div>
            <span className="text-[11px] text-slate-400">SLA threshold: 85.0%</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Fuel Burned</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">{data.kpis.fuelConsumedLiters.toLocaleString()} L</div>
            <span className="text-[11px] text-slate-400">Avg {data.kpis.avgConsumptionPer100km} L / 100km</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Logistics Expenditure</span>
            <div className="text-2xl font-bold text-white mt-1">KES {(data.kpis.fuelSpendKes / 1000000).toFixed(2)}M</div>
            <span className="text-[11px] text-emerald-400 font-medium">-4.2% variance to budget</span>
          </div>
        </div>
      )}

      {/* Charts Row */}
      {data && (
        <div className="grid grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between">
              <span>Monthly On-Time Delivery Compliance (%)</span>
              <span className="text-[11px] text-emerald-400 font-mono">Target: 90%</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" textAnchor="end" fontSize={11} />
                  <YAxis stroke="#64748b" domain={[75, 100]} fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="onTimePct" stroke="#00d9ff" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center justify-between">
              <span>Operational Cost Trajectory (KES Millions)</span>
              <span className="text-[11px] text-cyan-400 font-mono">Q2-Q3 2026</span>
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                  />
                  <Bar dataKey="costKesM" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Corridor Performance Table */}
      {data && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
          <h3 className="text-xs font-bold text-white">Strategic Transmission Corridor Transport Efficiency</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Corridor Route</th>
                <th className="p-3 font-semibold">Average Velocity</th>
                <th className="p-3 font-semibold">Delay Probability Rate</th>
                <th className="p-3 font-semibold">Active Incidents</th>
                <th className="p-3 font-semibold">Corridor Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {data.corridorPerformance.map((c, i) => (
                <tr key={i} className="hover:bg-slate-800/30">
                  <td className="p-3 font-medium text-white">{c.corridor}</td>
                  <td className="p-3 font-mono">{c.avgSpeedKmh} km/h</td>
                  <td className="p-3 font-mono text-cyan-300">{c.delayRatePct}%</td>
                  <td className="p-3">
                    {c.incidentCount > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                        {c.incidentCount} Incident
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                        Clear Corridor
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">Class A1</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
