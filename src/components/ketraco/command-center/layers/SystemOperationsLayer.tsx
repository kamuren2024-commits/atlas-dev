import React from 'react';
import { 
  Zap, 
  Activity, 
  BatteryCharging, 
  Gauge, 
  Sliders, 
  Cpu, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import DataFreshness from '../primitives/DataFreshness';
import ProvenanceTag from '../primitives/ProvenanceTag';
import ConfidenceBadge from '../primitives/ConfidenceBadge';

export default function SystemOperationsLayer() {
  return (
    <div id="level-1-ops" className="w-full bg-[#060a14] border-t border-slate-800/80 p-4 font-sans text-slate-100">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/30 text-xs font-mono font-bold tracking-wider">
            LEVEL 1
          </span>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            National System Operations & Dynamic Stability
          </h2>
          <span className="text-xs text-slate-400 hidden md:inline">
            // Real-Time Inertia, Reserve Adequacy & Frequency Tracing
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceTag source="SCADA_EMS" />
          <ConfidenceBadge status="VERIFIED" score={99.4} />
          <DataFreshness status="LIVE" deltaSec={2} />
        </div>
      </div>

      {/* 6 System Operations Cards Grid (11 to 16) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* KPI 11 — LOAD FACTOR */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              11 · Load Factor
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              OPTIMAL
            </span>
          </div>

          <div className="flex items-center gap-3 my-1">
            {/* Radial SVG Gauge */}
            <div className="relative w-14 h-14 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-sky-400"
                  strokeDasharray="84.2, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-slate-100">84.2%</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Daily Avg:</span> <strong className="text-slate-200 font-mono">78.5%</strong>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Peak Load:</span> <strong className="text-amber-300 font-mono">91.4%</strong>
              </div>
              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Off-Peak:</span> <strong className="text-slate-300 font-mono">62.1%</strong>
              </div>
            </div>
          </div>

          {/* 24h Trend Mini Bar */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>24h Trend:</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +1.8% vs Yesterday
            </span>
          </div>
        </div>

        {/* KPI 12 — RESERVE MARGIN */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              12 · Reserve Margin
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-500/30">
              12.7% N-1
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold font-mono text-cyan-300">380 <span className="text-xs text-slate-400 font-normal">MW</span></span>
              <span className="text-[11px] font-mono text-slate-400">Req: &gt;280 MW</span>
            </div>

            {/* Stacked Reserve Bar */}
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden flex gap-0.5">
              <div className="bg-emerald-400 h-full" style={{ width: '68%' }} title="Spinning Reserve: 260 MW" />
              <div className="bg-sky-400 h-full" style={{ width: '32%' }} title="Non-Spinning: 120 MW" />
            </div>

            <div className="flex justify-between text-[10px] font-mono mt-1.5 text-slate-400">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Spin: 260MW</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400" /> Quick: 120MW</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Adequacy Status:</span>
            <span className="text-emerald-400 font-semibold">Compliant (Grid Code)</span>
          </div>
        </div>

        {/* KPI 13 — VOLTAGE STABILITY */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              13 · Voltage Stability
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              STABLE
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xl font-bold font-mono text-slate-100">±1.4% <span className="text-xs text-slate-400 font-normal">Max Dev</span></span>
              <span className="text-[11px] font-mono text-slate-400">Limit: ±5.0%</span>
            </div>

            {/* Voltage Node Heatmap Indicators */}
            <div className="grid grid-cols-8 gap-1 my-2">
              {Array.from({ length: 24 }).map((_, idx) => {
                let color = 'bg-emerald-500/80';
                if (idx === 14) color = 'bg-amber-400 animate-pulse'; // Nairobi North
                if (idx === 7) color = 'bg-sky-400';
                return (
                  <div 
                    key={idx} 
                    className={`h-2 rounded-sm ${color}`} 
                    title={`Node ${idx + 1}: ${idx === 14 ? 'Warning (Nairobi Ring +2.4%)' : 'Nominal (±1.1%)'}`}
                  />
                );
              })}
            </div>

            <div className="flex justify-between text-[10px] font-mono text-slate-400">
              <span className="text-emerald-400">44 Normal</span>
              <span className="text-amber-400">4 Watch</span>
              <span className="text-slate-400">0 Crit</span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>WAMS PMU Ingest:</span>
            <span className="text-sky-300">50 samples/sec</span>
          </div>
        </div>

        {/* KPI 14 — FREQUENCY STABILITY */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              14 · Frequency Trace
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              50.01 Hz
            </span>
          </div>

          <div className="my-1">
            {/* Animated Frequency Sine Wave Line */}
            <div className="h-10 w-full bg-slate-950/60 rounded border border-slate-800 flex items-center px-1 relative overflow-hidden">
              <svg className="w-full h-8" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M0,15 Q10,5 20,15 T40,15 T60,14 T80,16 T100,15"
                  fill="none"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  className="animate-pulse"
                />
                <line x1="0" y1="15" x2="100" y2="15" stroke="#334155" strokeDasharray="2,2" strokeWidth="1" />
              </svg>
              <div className="absolute right-2 top-1 text-[9px] font-mono text-sky-400">Δf: +0.01Hz</div>
            </div>

            <div className="flex justify-between text-[10px] font-mono mt-1.5 text-slate-400">
              <span>Min: <strong className="text-slate-300">49.88 Hz</strong></span>
              <span>Max: <strong className="text-slate-300">50.12 Hz</strong></span>
              <span>Excursions: <strong className="text-emerald-400">0</strong></span>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>AGC Auto Control:</span>
            <span className="text-emerald-400 font-semibold">Active Ingest</span>
          </div>
        </div>

        {/* KPI 15 — SYSTEM INERTIA */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              15 · System Inertia
            </span>
            <span className="text-[9px] font-mono text-purple-300 bg-purple-950/50 px-1 py-0.5 rounded border border-purple-500/40">
              DERIVED MODEL
            </span>
          </div>

          <div className="my-1">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold font-mono text-purple-300">28.4 <span className="text-xs text-slate-400 font-normal">GW·s</span></span>
              <span className="text-[11px] font-mono text-emerald-400">+1.2%</span>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between">
                <span>Online Sync Gen:</span>
                <strong className="text-slate-200 font-mono">2,450 MW</strong>
              </div>
              <div className="flex justify-between">
                <span>Inverter-Based (IBR):</span>
                <strong className="text-sky-300 font-mono">670 MW (21%)</strong>
              </div>
              <div className="flex justify-between">
                <span>RoCoF Ceiling:</span>
                <strong className="text-slate-300 font-mono">&lt; 0.50 Hz/s</strong>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Inertia Margin:</span>
            <span className="text-emerald-400 font-semibold">Resilient (&gt;24 GW·s)</span>
          </div>
        </div>

        {/* KPI 16 — RESERVE ADEQUACY */}
        <div className="bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
              16 · Reserve Adequacy
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              +214 MW GAP
            </span>
          </div>

          <div className="my-1">
            {/* Bullet Chart for Demand vs Generation vs Forecast */}
            <div className="space-y-1.5 text-[11px]">
              <div>
                <div className="flex justify-between text-slate-400 mb-0.5 text-[10px] font-mono">
                  <span>Current Demand</span>
                  <span className="text-slate-200 font-bold">2,984 MW</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-sky-400 h-full rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5 text-[10px] font-mono">
                  <span>Peak Forecast (T+2h)</span>
                  <span className="text-amber-300 font-bold">3,125 MW</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '86%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-400 mb-0.5 text-[10px] font-mono">
                  <span>Total Available Dispatch</span>
                  <span className="text-emerald-400 font-bold">3,364 MW</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '93%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Forecast Gap (Peak):</span>
            <span className="text-emerald-400 font-bold">+239 MW Safe</span>
          </div>
        </div>

      </div>
    </div>
  );
}
