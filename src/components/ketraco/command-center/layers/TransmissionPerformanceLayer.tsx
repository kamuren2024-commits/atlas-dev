import React from 'react';
import { 
  Network, 
  Flame, 
  Thermometer, 
  ArrowDownRight, 
  ArrowRight, 
  ShieldAlert, 
  Zap,
  TrendingDown
} from 'lucide-react';
import ProvenanceTag from '../primitives/ProvenanceTag';
import ConfidenceBadge from '../primitives/ConfidenceBadge';
import DataFreshness from '../primitives/DataFreshness';

interface TransmissionPerformanceLayerProps {
  onSelectCorridor?: (corridorName: string) => void;
}

export default function TransmissionPerformanceLayer({
  onSelectCorridor
}: TransmissionPerformanceLayerProps) {
  return (
    <div id="level-2-transmission" className="w-full bg-[#050913] border-t border-slate-800/80 p-4 font-sans text-slate-100">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-bold tracking-wider">
            LEVEL 2
          </span>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            Transmission Grid Performance & Thermal Congestion
          </h2>
          <span className="text-xs text-slate-400 hidden md:inline">
            // Circuit Loading, Bottlenecks, Dynamic Line Ratings & Active Losses
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceTag source="SCADA_EMS" />
          <ConfidenceBadge status="VERIFIED" score={98.8} />
          <DataFreshness status="LIVE" deltaSec={2} />
        </div>
      </div>

      {/* 4 Transmission Performance Cards Grid (17 to 20) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* KPI 17 — LINE UTILIZATION */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              17 · Line Utilization
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
              68 Circuits Active
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold font-mono text-slate-100">58 <span className="text-xs text-slate-400 font-normal">Normal</span></span>
              <span className="text-[11px] font-mono text-amber-400">8 Watch · 2 Critical</span>
            </div>

            {/* Horizontal Distribution Bar */}
            <div className="w-full bg-slate-800 h-3 rounded overflow-hidden flex gap-0.5 my-2">
              <div className="bg-emerald-500 h-full" style={{ width: '85.3%' }} title="Normal (<70%): 58 Lines" />
              <div className="bg-amber-400 h-full" style={{ width: '11.8%' }} title="Warning (70-85%): 8 Lines" />
              <div className="bg-red-500 h-full animate-pulse" style={{ width: '2.9%' }} title="Critical (>85%): 2 Lines" />
            </div>

            <div className="grid grid-cols-3 text-[10px] font-mono text-slate-400 pt-1">
              <span className="text-emerald-400">● 58 &lt;70%</span>
              <span className="text-amber-400">● 8 (70-85%)</span>
              <span className="text-red-400">● 2 (&gt;85%)</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Offline for Maint:</span>
            <span className="text-slate-300 font-semibold">0 Lines</span>
          </div>
        </div>

        {/* KPI 18 — CONGESTION INDEX */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Flame className="w-3 h-3 text-pink-400" />
              18 · Congestion Index
            </span>
            <span className="text-[10px] font-mono text-pink-400 bg-pink-950/40 px-1.5 py-0.5 rounded border border-pink-500/30">
              18.4% NATIONAL
            </span>
          </div>

          <div className="my-1 space-y-1.5">
            <div className="text-[11px] space-y-1">
              <div 
                onClick={() => onSelectCorridor?.('Nairobi Ring 220kV')}
                className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 hover:bg-slate-800/90 cursor-pointer border border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                  <span className="text-slate-200 font-medium">Nairobi Ring 220kV</span>
                </div>
                <div className="text-right">
                  <span className="text-red-400 font-mono font-bold">89.2%</span>
                  <span className="text-[9px] text-slate-400 block">42m Active</span>
                </div>
              </div>

              <div 
                onClick={() => onSelectCorridor?.('Suswa - Nairobi North 400kV')}
                className="flex items-center justify-between p-1.5 rounded bg-slate-900/80 hover:bg-slate-800/90 cursor-pointer border border-slate-800 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span className="text-slate-200 font-medium">Suswa-Nairobi N 400kV</span>
                </div>
                <div className="text-right">
                  <span className="text-amber-400 font-mono font-bold">78.4%</span>
                  <span className="text-[9px] text-slate-400 block">18m Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Remedial Action:</span>
            <span className="text-sky-300">RAS Transfer Ready</span>
          </div>
        </div>

        {/* KPI 19 — THERMAL HEADROOM */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-sky-400" />
              19 · Thermal Headroom
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              34.2% AVG
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold font-mono text-slate-100">+1,420 <span className="text-xs text-slate-400 font-normal">MW Headroom</span></span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Lowest Corridor Headroom:</span>
                <strong className="text-red-400 font-mono">10.8% (Embakasi)</strong>
              </div>
              <div className="flex justify-between">
                <span>Dynamic Line Rating (DLR):</span>
                <strong className="text-emerald-400 font-mono">+8.4% Wind Cooling</strong>
              </div>
              <div className="flex justify-between">
                <span>Conductor Temp Max:</span>
                <strong className="text-slate-200 font-mono">54.2°C / 75.0°C Limit</strong>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>DLR Meteo Link:</span>
            <span className="text-emerald-400 font-semibold">Active Ingest</span>
          </div>
        </div>

        {/* KPI 20 — TRANSMISSION LOSS */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              20 · Transmission Loss
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/50 px-1 py-0.5 rounded border border-emerald-500/40">
              MEASURED
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold font-mono text-slate-100">118.4 <span className="text-xs text-slate-400 font-normal">MW</span></span>
              <span className="text-[12px] font-mono font-bold text-amber-300">3.97%</span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Daily Cumulative Loss:</span>
                <strong className="text-slate-200 font-mono">2,840 MWh</strong>
              </div>
              <div className="flex justify-between">
                <span>Loss vs Benchmark (4.20%):</span>
                <strong className="text-emerald-400 font-mono flex items-center gap-0.5">
                  <TrendingDown className="w-3 h-3" /> -0.23% Efficient
                </strong>
              </div>
              <div className="flex justify-between">
                <span>500kV HVDC Efficiency:</span>
                <strong className="text-cyan-300 font-mono">98.9% High Yield</strong>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Energy Accounting:</span>
            <span className="text-emerald-400 font-semibold">Verified Settlement</span>
          </div>
        </div>

      </div>
    </div>
  );
}
