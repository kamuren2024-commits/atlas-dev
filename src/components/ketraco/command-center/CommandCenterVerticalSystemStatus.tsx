import React from 'react';
import {
  Activity,
  Zap,
  Gauge,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  Flame,
  Cpu
} from 'lucide-react';
import { KpiFamily } from './types';
import { GridStateAssessment } from './decision/types';

interface CommandCenterVerticalSystemStatusProps {
  systemLoadMW: number;
  generationMW: number;
  frequencyHz: string | number;
  spinningReserveMW: number;
  transmissionAvailPct: number;
  gridAssessment?: GridStateAssessment;
  onOpenDecisionBrief?: (incidentId?: string) => void;
  onLaunchScenario?: (scenarioId: string) => void;
}

export const CommandCenterVerticalSystemStatus: React.FC<CommandCenterVerticalSystemStatusProps> = ({
  systemLoadMW,
  generationMW,
  frequencyHz,
  spinningReserveMW,
  transmissionAvailPct,
  gridAssessment,
  onOpenDecisionBrief,
  onLaunchScenario
}) => {
  return (
    <div className="w-full space-y-6">
      
      {/* 1. SYSTEM STATUS SECTION */}
      <section className="bg-[#080e1b] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
              OPERATIONAL BASELINE
            </span>
            <h2 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
              System Status
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Real-time SCADA and PMU synchronous state for the Kenya National Transmission System
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SYNCHRONOUS GRID HEALTHY
            </span>
          </div>
        </div>

        {/* 6 Primary Operational Indicators (Spacious, High-Contrast, Zero Cramping) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 pt-4">
          
          {/* 1. Grid State */}
          <div className="bg-[#050913] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Grid State
            </span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-emerald-400 block tracking-tight">
                Healthy
              </span>
              <span className="text-xs font-mono text-slate-400 block mt-1">
                Security index: 94.2/100
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-500/90 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              N-1 Compliant
            </span>
          </div>

          {/* 2. Frequency */}
          <div className="bg-[#050913] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              System Frequency
            </span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-cyan-300 block tracking-tight">
                {frequencyHz} Hz
              </span>
              <span className="text-xs font-mono text-slate-400 block mt-1">
                Deadband: 49.80 – 50.20 Hz
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5" />
              Target: 50.00 Hz (Nominal)
            </span>
          </div>

          {/* 3. System Demand */}
          <div className="bg-[#050913] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              System Demand
            </span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-white block tracking-tight">
                {systemLoadMW.toLocaleString()} MW
              </span>
              <span className="text-xs font-mono text-slate-400 block mt-1">
                Peak today: 3,042 MW
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Forecast variance: +0.4%
            </span>
          </div>

          {/* 4. Generation Dispatch */}
          <div className="bg-[#050913] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Generation Dispatch
            </span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-white block tracking-tight">
                {generationMW.toLocaleString()} MW
              </span>
              <span className="text-xs font-mono text-slate-400 block mt-1">
                Renewable share: 92.4%
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              Hydro + Geothermal Base
            </span>
          </div>

          {/* 5. Spinning Reserve */}
          <div className="bg-[#050913] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Spinning Reserve
            </span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-emerald-300 block tracking-tight">
                {spinningReserveMW} MW
              </span>
              <span className="text-xs font-mono text-slate-400 block mt-1">
                Statutory minimum: 310 MW
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Headroom: +70 MW surplus
            </span>
          </div>

          {/* 6. Transmission Availability */}
          <div className="bg-[#050913] border border-slate-800 p-4 rounded-xl flex flex-col justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
              Transmission Avail.
            </span>
            <div className="my-2">
              <span className="text-2xl font-mono font-bold text-cyan-300 block tracking-tight">
                {transmissionAvailPct}%
              </span>
              <span className="text-xs font-mono text-slate-400 block mt-1">
                Target: 99.0%
              </span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              48/49 Substations Online
            </span>
          </div>

        </div>
      </section>

      {/* 2. ACTIVE OPERATIONAL CONDITIONS SECTION */}
      <section className="bg-[#080e1b] border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
              ACTIVE SITUATIONAL OBSERVATIONS
            </span>
            <h2 className="text-xl font-display font-bold text-white tracking-tight mt-0.5">
              Active Operational Conditions
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Real-time thermal, stability, and meteorological conditions requiring operator awareness
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40">
            3 Monitored Grid Conditions
          </span>
        </div>

        {/* Vertical Stack of Condition Content Containers (No Cramped Tiles) */}
        <div className="pt-4 space-y-3.5">
          
          {/* Condition 01 */}
          <div className="bg-[#060b16] border border-amber-500/40 rounded-xl p-4.5 transition-colors hover:border-amber-500/60">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500/50">
                    THERMAL HEADROOM ALERT
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Detected 18 min ago • South Rift Region
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-white">
                  Suswa – Isinya 400kV Corridor Operating at 94% Continuous Thermal Capacity
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-4xl">
                  Bulk power transfer from Olkaria geothermal fields is currently elevated due to high industrial demand in Nairobi East and the Coastal corridor. Current ambient air temperature is 32.4°C with low wind cross-cooling (&lt;1.8 m/s), reducing dynamic line ampacity.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onLaunchScenario?.('SCEN_SUSWA_T1_TRIP')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/70 border border-indigo-500/40 text-indigo-300 text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Simulate in Lab</span>
                </button>
                <button
                  onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold transition-all cursor-pointer shadow-md"
                >
                  <span>Review Operator Brief</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">AFFECTED CORRIDOR</span>
                <span className="text-white font-bold">400kV Suswa–Isinya Double Circuit</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">CURRENT LOADING</span>
                <span className="text-amber-300 font-bold">752 MW / 800 MW (94.0%)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">CRITICAL THRESHOLD</span>
                <span className="text-rose-400 font-bold">800 MW (Auto-Trip Setpoint)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">RECOMMENDED ACTION</span>
                <span className="text-cyan-300 font-bold">Redispatch 120 MW to Hydro</span>
              </div>
            </div>
          </div>

          {/* Condition 02 */}
          <div className="bg-[#060b16] border border-slate-800 rounded-xl p-4.5 transition-colors hover:border-slate-700">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                    INTERCONNECTOR STABILITY
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Detected 42 min ago • Western Border
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-white">
                  Lessos 220kV Bus Bar Frequency Modulation & Uganda Tie-Line Swing
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-4xl">
                  Cross-border wheeling exchange on the 220kV Lessos–Tororo link is showing slight ±0.04 Hz inter-area power oscillations during scheduled load shifting in the Eastern Uganda industrial grid. KETRACO power system stabilizers (PSS) at Olkaria II are engaged and damping oscillations.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenDecisionBrief?.()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-medium transition-all cursor-pointer"
                >
                  <span>Inspect Tie-Line Profile</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">INTERCONNECTOR</span>
                <span className="text-white font-bold">Lessos–Tororo 220kV</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">EXPORT POWER</span>
                <span className="text-cyan-300 font-bold">118 MW (Synchronous)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">OSCILLATION DAMPING</span>
                <span className="text-emerald-400 font-bold">0.82 (Well Damped &gt; 0.15)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">ACTION</span>
                <span className="text-slate-300 font-bold">Maintain Olkaria PSS In-Service</span>
              </div>
            </div>
          </div>

          {/* Condition 03 */}
          <div className="bg-[#060b16] border border-slate-800 rounded-xl p-4.5 transition-colors hover:border-slate-700">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    ENVIRONMENTAL TELEMETRY
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    Detected 1h 14m ago • Coastal Belt
                  </span>
                </div>
                <h3 className="text-base font-display font-bold text-white">
                  Coastal Marine Aerosol Salinity Pressure on Rabai 132kV Switchyard
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed max-w-4xl">
                  High onshore wind (14.2 m/s) with relative humidity at 88% is elevating equivalent salt deposit density (ESDD) on porcelain insulators at Rabai substation. Leakage current sensors report 18mA (alert threshold 25mA). RTV silicone-coated bays remain within nominal operating limits.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onOpenDecisionBrief?.()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono font-medium transition-all cursor-pointer"
                >
                  <span>View Insulator Telemetry</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3.5 pt-3 border-t border-slate-800/80 text-xs font-mono">
              <div>
                <span className="text-slate-400 text-[10px] block">LOCATION</span>
                <span className="text-white font-bold">Rabai 132kV Substation</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">LEAKAGE CURRENT</span>
                <span className="text-cyan-300 font-bold">18 mA (Threshold: 25 mA)</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">WEATHER PROFILE</span>
                <span className="text-slate-300 font-bold">88% RH • 14.2 m/s Wind</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">SCHEDULED MAINTENANCE</span>
                <span className="text-slate-300 font-bold">Live-Line Washing (Night Shift)</span>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};
