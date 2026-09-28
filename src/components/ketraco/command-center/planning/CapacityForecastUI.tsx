import React, { useMemo, useState } from 'react';
import { Gauge, TrendingUp, TrendingDown, Activity, AlertTriangle } from 'lucide-react';
import type { CapacityBreakdown, Bottleneck } from '../../../../../backend/planning-engine/types';

interface CapacityForecastProps {
  capacity: CapacityBreakdown;
  bottlenecks: Bottleneck[];
}

export default function CapacityForecastUI({ capacity, bottlenecks }: CapacityForecastProps) {
  const [viewLevel, setViewLevel] = useState<'national' | 'regional' | 'corridor'>('national');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const nationalUtilization = Math.round((capacity.national.available / capacity.national.transfer) * 100);

  return (
    <div className="bg-[#050913] text-slate-100 p-4 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30">
            <Gauge className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400">Capacity Intelligence</div>
            <h3 className="text-lg font-bold">CAPACITY FORECAST</h3>
          </div>
        </div>
        <div className="flex gap-1">
          {(['national', 'regional', 'corridor'] as const).map(level => (
            <button key={level} onClick={() => setViewLevel(level)}
              className={`px-3 py-1.5 rounded border text-[10px] font-bold tracking-wider cursor-pointer transition
                ${viewLevel === level ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-400'}`}>
              {level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* National Summary */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {[
          { label: 'Installed', value: `${(capacity.national.installed / 1000).toFixed(1)} GW`, color: 'text-slate-100' },
          { label: 'Transfer Capacity', value: `${(capacity.national.transfer / 1000).toFixed(1)} GW`, color: 'text-cyan-400' },
          { label: 'Available', value: `${(capacity.national.available / 1000).toFixed(1)} GW`, color: 'text-emerald-400' },
          { label: 'Reserve', value: `${(capacity.national.reserve / 1000).toFixed(1)} GW`, color: 'text-amber-400' },
          { label: 'Headroom', value: `${capacity.national.headroom} MW`, color: 'text-violet-400' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
            <div className="text-[9px] uppercase tracking-wider text-slate-400">{s.label}</div>
            <div className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Utilization Bar */}
      <div className="rounded-lg border border-slate-800 bg-[#0a1222] p-3 mb-4">
        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
          <span>National Transfer Utilization</span>
          <span className="font-bold text-slate-200">{nationalUtilization}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{
              width: `${nationalUtilization}%`,
              background: nationalUtilization > 85 ? 'linear-gradient(90deg, #EF4444, #F59E0B)' :
                         nationalUtilization > 65 ? 'linear-gradient(90deg, #F59E0B, #10B981)' :
                         'linear-gradient(90deg, #10B981, #06B6D4)',
            }}
          />
        </div>
      </div>

      {/* Regional / Corridor Breakdown */}
      {viewLevel === 'regional' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {Object.entries(capacity.region).map(([region, data]) => {
            const util = Math.round((data.available / data.transfer) * 100);
            return (
              <div key={region} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
                <div className="text-sm font-bold text-slate-100">{region}</div>
                <div className="mt-2 space-y-1 text-[10px]">
                  <div className="flex justify-between"><span className="text-slate-400">Installed</span><span className="text-slate-200">{data.installed} MW</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Transfer</span><span className="text-slate-200">{data.transfer} MW</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Available</span><span className="text-slate-200">{data.available} MW</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Reserve</span><span className="text-slate-200">{data.reserve} MW</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Headroom</span><span className="text-slate-200">{data.headroom} MW</span></div>
                </div>
                <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500/60 rounded-full" style={{ width: `${util}%` }} />
                </div>
                <div className="text-[9px] text-slate-500 mt-1">Utilization: {util}%</div>
              </div>
            );
          })}
        </div>
      )}

      {viewLevel === 'corridor' && (
        <div className="space-y-2 mb-4">
          {Object.entries(capacity.corridor).map(([corridor, data]) => {
            const util = Math.round((data.available / data.transfer) * 100);
            const stress = util > 85 ? 'CRITICAL' : util > 70 ? 'HIGH' : util > 55 ? 'MEDIUM' : 'LOW';
            return (
              <div key={corridor} className="rounded-lg border border-slate-800 bg-[#0a1222] p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold">{corridor}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${
                    stress === 'CRITICAL' ? 'border-red-500/30 bg-red-500/10 text-red-400' :
                    stress === 'HIGH' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' :
                    stress === 'MEDIUM' ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400' :
                    'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                  }`}>{stress}</span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-3 text-[10px]">
                  <div className="text-slate-400">Transfer <span className="text-slate-200 font-bold">{data.transfer} MW</span></div>
                  <div className="text-slate-400">Available <span className="text-slate-200 font-bold">{data.available} MW</span></div>
                  <div className="text-slate-400">Reserve <span className="text-slate-200 font-bold">{data.reserve} MW</span></div>
                  <div className="text-slate-400">Headroom <span className="text-slate-200 font-bold">{data.headroom} MW</span></div>
                </div>
                <div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${util}%`,
                    background: util > 85 ? '#EF4444' : util > 70 ? '#F59E0B' : '#10B981',
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {viewLevel === 'national' && (
        <div className="rounded-lg border border-slate-800 bg-[#0a1222] p-4 mb-4">
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-3">National Capacity Composition</div>
          <div className="flex h-8 rounded overflow-hidden">
            <div className="bg-emerald-500/60 flex items-center justify-center text-[9px] font-bold"
              style={{ width: `${(capacity.national.available / capacity.national.installed) * 100}%` }}>
              Available
            </div>
            <div className="bg-amber-500/60 flex items-center justify-center text-[9px] font-bold"
              style={{ width: `${((capacity.national.transfer - capacity.national.available) / capacity.national.installed) * 100}%` }}>
              Transfer Limited
            </div>
            <div className="bg-rose-500/40 flex items-center justify-center text-[9px] font-bold"
              style={{ width: `${((capacity.national.installed - capacity.national.transfer) / capacity.national.installed) * 100}%` }}>
              Offline/Maintenance
            </div>
          </div>
        </div>
      )}

      {/* Bottlenecks Quick View */}
      {bottlenecks.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-amber-400 mb-2">
            <AlertTriangle className="w-4 h-4" />
            CRITICAL BOTTLENECKS ({bottlenecks.length})
          </div>
          <div className="space-y-2">
            {bottlenecks.slice(0, 3).map(b => (
              <div key={b.id} className="flex items-center justify-between text-[10px]">
                <div>
                  <span className="text-slate-200 font-bold">{b.name}</span>
                  <span className="ml-2 text-slate-500">→ {b.path.join(' → ')}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400">Impact: {b.currentImpact}</span>
                  <span className="text-rose-400">Forecast: {b.forecastImpact}</span>
                  <span className="text-slate-400">Criticality: {b.criticality}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
