// ExecutiveIntelligenceView - KETRACO Phase 06 Executive Operational Intelligence & C-Suite Situational Dashboard

import React from 'react';
import { 
  Building2, 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Flame, 
  FileText, 
  Sparkles,
  Zap
} from 'lucide-react';
import { GridStateAssessment, NationalGridHealthScore } from './types';

interface ExecutiveIntelligenceViewProps {
  assessment: GridStateAssessment;
  healthScore: NationalGridHealthScore;
  onOpenDecisionBrief?: (incidentId: string) => void;
  onOpenActionQueue?: () => void;
}

export default function ExecutiveIntelligenceView({
  assessment,
  healthScore,
  onOpenDecisionBrief,
  onOpenActionQueue
}: ExecutiveIntelligenceViewProps) {
  return (
    <div className="w-full bg-[#080e1a] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl font-mono text-xs text-slate-200">
      
      {/* Executive Header */}
      <div className="p-4 bg-[#0a1222] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-sky-950/80 border border-sky-500/40 text-sky-400">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/40">
                C-SUITE EXECUTIVE BRIEFING
              </span>
              <span className="text-[10px] text-slate-400">KETRACO NATIONAL TRANSMISSION GRID</span>
            </div>
            <h1 className="text-base font-bold text-slate-100">National Transmission Operational Status & Executive Intelligence</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenActionQueue}
            className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold transition-colors cursor-pointer"
          >
            OPERATOR QUEUE
          </button>
          <button
            onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
            className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            STRATEGIC BRIEF
          </button>
        </div>
      </div>

      {/* 4 Major High-Level Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-[#070d18] border-b border-slate-800/80">
        
        {/* 1. National Grid State & Health */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">NATIONAL GRID STATE</div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-amber-400">{assessment.state}</span>
            <span className="text-xs text-slate-400">Score {healthScore.overallHealthScore}/100</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Stress Index: <strong className="text-amber-300">{assessment.stressScore}%</strong> • Grade: {healthScore.grade}
          </div>
        </div>

        {/* 2. System Demand & Peak Flow */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">PEAK SYSTEM DEMAND</div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-cyan-300">{assessment.systemDemandMW} MW</span>
            <span className="text-xs text-emerald-400">+1.8% vs YTD</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Reserve Margin: <strong className="text-emerald-400">{assessment.reserveMarginPct}%</strong> ({assessment.spinningReserveMW} MW)
          </div>
        </div>

        {/* 3. Evacuation & Availability */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">TRANSMISSION AVAILABILITY</div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-emerald-400">{assessment.transmissionAvailabilityPct}%</span>
            <span className="text-xs text-slate-400">Target &gt; 98.5%</span>
          </div>
          <div className="text-[10px] text-slate-400">
            Active Bottlenecks: <strong className="text-purple-300">{assessment.congestedCorridorsCount} Corridors</strong>
          </div>
        </div>

        {/* 4. Financial & Reliability Exposure */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[10px] text-slate-400 font-bold uppercase">ENERGY RISK EXPOSURE</div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black text-rose-400">$145k / hr</span>
            <span className="text-xs text-rose-300">520 MW at Risk</span>
          </div>
          <div className="text-[10px] text-slate-400">
            N-1 Vulnerability: <strong className="text-amber-300">{assessment.n1ComplianceStatus}</strong>
          </div>
        </div>

      </div>

      {/* Main Executive Body: Strategic Summary & Critical Decisions */}
      <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column: Strategic Situation Summary (7 cols) */}
        <div className="lg:col-span-7 space-y-3 font-sans text-xs">
          
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2 font-mono">
            <div className="text-[10.5px] font-bold text-cyan-400 uppercase">
              EXECUTIVE SITUATION SUMMARY
            </div>
            <p className="text-slate-200 leading-relaxed text-[11.5px] font-sans">
              The national transmission system is operating in a <strong>WATCH</strong> posture under elevated afternoon thermal loading. Olkaria geothermal generation and Moyale HVDC imports are feeding 1,145 MW into the Suswa EHV hub, which is loading the Suswa–Isinya 400kV corridor to 94% capacity.
            </p>
            <p className="text-slate-300 leading-relaxed text-[11.5px] font-sans">
              Dynamic Line Rating (DLR) models indicate low ambient cross-wind cooling along the Rift Valley corridor. Concurrently, online dissolved gas chromatography (DGA) on Suswa Auto-Transformer T2 shows elevated Ethylene (185 ppm), recommending an immediate 120 MW redispatch shift to Seven Forks Hydro.
            </p>
          </div>

          {/* Regional Energy Evacuation & Balance */}
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2 font-mono">
            <div className="text-[10px] font-bold text-slate-400 uppercase">
              REGIONAL TRANSMISSION DISPATCH MATRIX
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[10.5px]">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400">RIFT VALLEY / OLKARIA</div>
                <div className="font-bold text-emerald-400 text-xs">680 MW Export</div>
                <div className="text-[9px] text-slate-400">100% Geothermal Base</div>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400">NAIROBI METROPOLITAN</div>
                <div className="font-bold text-cyan-300 text-xs">980 MW Demand</div>
                <div className="text-[9px] text-slate-400">Industrial & Commercial Peak</div>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <div className="text-slate-400">COAST / MOMBASA</div>
                <div className="font-bold text-purple-300 text-xs">310 MW Import</div>
                <div className="text-[9px] text-slate-400">Storm Warning Armed</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Key Strategic Action Items (5 cols) */}
        <div className="lg:col-span-5 space-y-3 font-mono">
          
          <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-2.5">
            <div className="text-[10.5px] font-bold text-cyan-400 uppercase">
              KEY STRATEGIC ACTION ITEMS
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/30">
                <div className="text-cyan-300 font-bold">1. Suswa–Isinya Hydro Redispatch</div>
                <div className="text-slate-300 text-[10.5px]">
                  Authorize KenGen generation shift (120 MW) to eliminate thermal overload on national trunk line.
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <div className="text-slate-200 font-bold">2. Suswa T2 Transformer Maintenance</div>
                <div className="text-slate-400 text-[10.5px]">
                  Expedite SAP EAM Work Order #884910 for vacuum oil purification at Naivasha depot.
                </div>
              </div>

              <div className="p-2 rounded bg-slate-950/60 border border-slate-800">
                <div className="text-slate-200 font-bold">3. Coast Weather Special Protection</div>
                <div className="text-slate-400 text-[10.5px]">
                  Arm SPS-COAST interlocks during convective thunderstorm front across Mariakani corridor.
                </div>
              </div>
            </div>

            <button
              onClick={() => onOpenDecisionBrief?.('INC-2026-08-SSW-01')}
              className="w-full py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              REVIEW ACTIVE DECISION BRIEF
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
