import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Layers, 
  Clock, 
  Wrench, 
  AlertCircle, 
  CheckCircle2, 
  Activity,
  Check
} from 'lucide-react';
import ProvenanceTag from '../primitives/ProvenanceTag';
import ConfidenceBadge from '../primitives/ConfidenceBadge';
import DataFreshness from '../primitives/DataFreshness';

export default function AssetIntelligenceLayer() {
  return (
    <div id="level-3-assets" className="w-full bg-[#060a14] border-t border-slate-800/80 p-4 font-sans text-slate-100">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold tracking-wider">
            LEVEL 3
          </span>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Substation Equipment & Fleet Health Intelligence
          </h2>
          <span className="text-xs text-slate-400 hidden md:inline">
            // Auto-Transformers, SF6 Circuit Breakers, Protection Relays & Lifecycle Exposure
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceTag source="EAM_SAP" />
          <ConfidenceBadge status="VERIFIED" score={97.6} />
          <DataFreshness status="LIVE" deltaSec={5} />
        </div>
      </div>

      {/* 5 Asset Intelligence Cards Grid (21 to 25) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        
        {/* KPI 21 — TRANSFORMER HEALTH */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              21 · Auto-Transformers
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              84 Fleet
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold font-mono text-emerald-300">72 <span className="text-xs text-slate-400 font-normal">Healthy</span></span>
              <span className="text-[11px] font-mono text-amber-400">9 Watch · 1 Crit</span>
            </div>

            {/* Health Distribution Segment */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-0.5 my-2">
              <div className="bg-emerald-500 h-full" style={{ width: '85.7%' }} title="Healthy: 72" />
              <div className="bg-amber-400 h-full" style={{ width: '10.7%' }} title="Watch: 9" />
              <div className="bg-orange-500 h-full" style={{ width: '2.4%' }} title="Degraded: 2" />
              <div className="bg-red-500 h-full animate-pulse" style={{ width: '1.2%' }} title="Critical: 1 (Nairobi T1)" />
            </div>

            <div className="text-[11px] space-y-1 text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>DGA Gas Anomaly:</span>
                <strong className="text-amber-300 font-mono">1 Unit (Suswa T2)</strong>
              </div>
              <div className="flex justify-between">
                <span>Avg Fleet Temp:</span>
                <strong className="text-slate-200 font-mono">56.4°C (Safe)</strong>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Critical Unit:</span>
            <span className="text-red-400 font-semibold">Embakasi T1 (72.8°C)</span>
          </div>
        </div>

        {/* KPI 22 — BREAKER HEALTH */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              22 · SF6 Breakers
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
              248 Units
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold font-mono text-cyan-300">232 <span className="text-xs text-slate-400 font-normal">Normal</span></span>
              <span className="text-[11px] font-mono text-amber-400">11 Suspect · 1 Risk</span>
            </div>

            {/* Distribution */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-0.5 my-2">
              <div className="bg-cyan-500 h-full" style={{ width: '93.5%' }} title="Normal: 232" />
              <div className="bg-amber-400 h-full" style={{ width: '4.4%' }} title="Suspect: 11" />
              <div className="bg-purple-500 h-full" style={{ width: '1.6%' }} title="Maintenance: 4" />
              <div className="bg-red-500 h-full animate-pulse" style={{ width: '0.5%' }} title="Risk: 1" />
            </div>

            <div className="text-[11px] space-y-1 text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>SF6 Gas Density:</span>
                <strong className="text-emerald-400 font-mono">6.4 bar Avg</strong>
              </div>
              <div className="flex justify-between">
                <span>Micro-Leaks Monitored:</span>
                <strong className="text-amber-300 font-mono">2 Bays (Isinya/Embakasi)</strong>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Operability Rating:</span>
            <span className="text-emerald-400 font-semibold">99.2% Trip Ready</span>
          </div>
        </div>

        {/* KPI 23 — PROTECTION SYSTEM STATUS */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              23 · Protection Relays
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              412 Relays
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold font-mono text-emerald-300">402 <span className="text-xs text-slate-400 font-normal">Healthy</span></span>
              <span className="text-[11px] font-mono text-amber-400">8 Warn · 0 Trip</span>
            </div>

            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-0.5 my-2">
              <div className="bg-emerald-500 h-full" style={{ width: '97.5%' }} title="Healthy: 402" />
              <div className="bg-amber-400 h-full" style={{ width: '1.9%' }} title="Warning: 8" />
              <div className="bg-sky-400 h-full" style={{ width: '0.6%' }} title="Comm Issues: 2" />
            </div>

            <div className="text-[11px] space-y-1 text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>Optical Diff Channel:</span>
                <strong className="text-emerald-400 font-mono">100% Redundant</strong>
              </div>
              <div className="flex justify-between">
                <span>IEC 61850 GOOSE:</span>
                <strong className="text-cyan-300 font-mono">&lt; 2ms Latency</strong>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Primary/Backup:</span>
            <span className="text-emerald-400 font-semibold">100% Dual Relayed</span>
          </div>
        </div>

        {/* KPI 24 — ASSET AGE PROFILE */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              24 · Asset Age Profile
            </span>
            <span className="text-[10px] font-mono text-purple-400 bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/30">
              Modern Fleet
            </span>
          </div>

          <div className="my-1 space-y-1.5 text-[11px]">
            <div>
              <div className="flex justify-between text-slate-400 text-[10px] font-mono mb-0.5">
                <span>0–10 Years (Modern 400/500kV)</span>
                <span className="text-emerald-300 font-bold">48%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: '48%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] font-mono mb-0.5">
                <span>10–20 Years (220kV Backbone)</span>
                <span className="text-sky-300 font-bold">32%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-sky-400 h-full" style={{ width: '32%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-slate-400 text-[10px] font-mono mb-0.5">
                <span>20–30 Years / 30+ Years (Legacy 132kV)</span>
                <span className="text-amber-300 font-bold">20%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-amber-400 h-full" style={{ width: '20%' }} />
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Modernization Plan:</span>
            <span className="text-sky-300">Phase 4 Active</span>
          </div>
        </div>

        {/* KPI 25 — MAINTENANCE EXPOSURE */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              25 · Maintenance Exposure
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              93 Work Orders
            </span>
          </div>

          <div className="my-1">
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Completed</span>
                <span className="text-emerald-400 text-lg font-bold">64</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Scheduled</span>
                <span className="text-sky-400 text-lg font-bold">19</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Due Soon</span>
                <span className="text-amber-400 text-lg font-bold">8</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Overdue</span>
                <span className="text-red-400 text-lg font-bold">2</span>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>SLA Adherence:</span>
            <span className="text-emerald-400 font-semibold">97.8% On-Time</span>
          </div>
        </div>

      </div>
    </div>
  );
}
