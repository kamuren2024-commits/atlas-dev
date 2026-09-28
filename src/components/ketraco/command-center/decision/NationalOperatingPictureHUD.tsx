// NationalOperatingPictureHUD - KETRACO Phase 06 Permanent National Grid Situational Awareness HUD

import React from 'react';
import { 
  Activity, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  Flame, 
  Layers, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  Database,
  Info
} from 'lucide-react';
import { GridStateAssessment } from './types';

interface NationalOperatingPictureHUDProps {
  assessment: GridStateAssessment;
  onOpenStateDrivers?: () => void;
  onOpenStateDriversModal?: () => void;
  onOpenHealthScorecard?: () => void;
  onOpenActionQueue?: () => void;
  onSelectActionQueue?: () => void;
  onSelectExecutiveView?: () => void;
}

export default function NationalOperatingPictureHUD({
  assessment,
  onOpenStateDrivers,
  onOpenStateDriversModal,
  onOpenHealthScorecard,
  onOpenActionQueue,
  onSelectActionQueue,
  onSelectExecutiveView
}: NationalOperatingPictureHUDProps) {
  const openStateDrivers = onOpenStateDrivers ?? onOpenStateDriversModal;
  const openActionQueue = onOpenActionQueue ?? onSelectActionQueue;
  const getStateColor = (state: string) => {
    switch (state) {
      case 'NORMAL': return 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40';
      case 'STABLE': return 'text-sky-400 bg-sky-950/40 border-sky-500/40';
      case 'WATCH': return 'text-amber-400 bg-amber-950/40 border-amber-500/40';
      case 'STRESSED': return 'text-orange-400 bg-orange-950/40 border-orange-500/40 animate-pulse';
      case 'CRITICAL': return 'text-rose-400 bg-rose-950/40 border-rose-500/40 animate-pulse';
      case 'EMERGENCY': return 'text-red-500 bg-red-950/60 border-red-500/70 animate-ping';
      default: return 'text-slate-300 bg-slate-900 border-slate-700';
    }
  };

  const getN1Badge = (n1: string) => {
    switch (n1) {
      case 'COMPLIANT':
        return <span className="text-emerald-400 font-bold">N-1 SECURE</span>;
      case 'VIOLATION_WATCH':
        return <span className="text-amber-400 font-bold">N-1 WATCH</span>;
      case 'CRITICAL_VIOLATION':
        return <span className="text-rose-400 font-bold animate-pulse">N-1 VIOLATION</span>;
      default:
        return <span className="text-slate-400">N-1 COMPLIANT</span>;
    }
  };

  return (
    <div className="w-full bg-[#060b16] border-b border-slate-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 select-none font-mono text-[11px] text-slate-300 shadow-md z-30">
      
      {/* 1. NATIONAL GRID SITUATIONAL BANNER */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">NATIONAL OPERATING PICTURE</span>
        </div>

        {/* Dynamic Grid State */}
        <button
          onClick={openStateDrivers}
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded border font-bold transition-transform hover:scale-105 cursor-pointer ${getStateColor(assessment.state)}`}
          title="Click to view Grid State Driver decomposition"
        >
          <Activity className="w-3.5 h-3.5" />
          <span>GRID STATE: {assessment.state}</span>
          <span className="text-[9px] px-1 py-0.2 bg-black/40 rounded">
            STRESS {assessment.stressScore}%
          </span>
        </button>
      </div>

      {/* 2. CORE SYSTEM VITALS INFOGRAPHIC STRIP */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        
        {/* System Demand */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <span className="text-[9.5px] text-slate-400">DEMAND:</span>
          <span className="font-bold text-cyan-300">{assessment.systemDemandMW}</span>
          <span className="text-[9px] text-slate-400">MW</span>
        </div>

        {/* Generation */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <span className="text-[9.5px] text-slate-400">GEN:</span>
          <span className="font-bold text-emerald-300">{assessment.totalGenerationMW}</span>
          <span className="text-[9px] text-slate-400">MW</span>
        </div>

        {/* Spinning Reserve */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <span className="text-[9.5px] text-slate-400">RESERVE:</span>
          <span className={`font-bold ${assessment.reserveMarginPct < 8 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {assessment.spinningReserveMW} MW ({assessment.reserveMarginPct}%)
          </span>
        </div>

        {/* System Frequency */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <span className="text-[9.5px] text-slate-400">FREQ:</span>
          <span className={`font-bold ${Math.abs(assessment.gridFrequencyHz - 50.0) > 0.08 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {assessment.gridFrequencyHz.toFixed(3)} Hz
          </span>
        </div>

        {/* Transmission Availability */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <span className="text-[9.5px] text-slate-400">AVAIL:</span>
          <span className="font-bold text-slate-200">{assessment.transmissionAvailabilityPct}%</span>
        </div>

        {/* Congestion */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <Flame className="w-3 h-3 text-purple-400" />
          <span className="text-[9.5px] text-slate-400">CONGESTED:</span>
          <span className={`font-bold ${assessment.congestedCorridorsCount > 0 ? 'text-purple-300' : 'text-slate-400'}`}>
            {assessment.congestedCorridorsCount} corridors
          </span>
        </div>

        {/* Active Incidents */}
        <button
          onClick={openActionQueue}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/30 border border-rose-800/40 hover:bg-rose-950/60 text-rose-300 cursor-pointer transition-colors"
          title="Open Operator Action Queue"
        >
          <AlertTriangle className="w-3 h-3 text-rose-400" />
          <span className="text-[9.5px] text-slate-400">INCIDENTS:</span>
          <span className="font-bold text-rose-300">{assessment.activeIncidentsCount} Active</span>
        </button>

        {/* N-1 Status */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <Layers className="w-3 h-3 text-indigo-400" />
          <span className="text-[9.5px] text-slate-400">N-1:</span>
          {getN1Badge(assessment.n1ComplianceStatus)}
        </div>

        {/* Grid Risk */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <span className="text-[9.5px] text-slate-400">RISK:</span>
          <span className={`font-bold ${assessment.overallGridRiskScore > 60 ? 'text-rose-400' : 'text-amber-400'}`}>
            {assessment.overallGridRiskScore}/100
          </span>
        </div>

        {/* Data Confidence */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800">
          <Database className="w-3 h-3 text-emerald-400" />
          <span className="text-[9.5px] text-slate-400">CONFIDENCE:</span>
          <span className="font-bold text-emerald-400">{assessment.dataConfidencePct}%</span>
        </div>
      </div>

      {/* 3. QUICK DRILL-DOWNS */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onOpenHealthScorecard}
          className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-semibold transition-colors cursor-pointer"
        >
          HEALTH SCORE
        </button>
        <button
          onClick={onSelectExecutiveView}
          className="px-2 py-0.5 rounded bg-sky-950/60 hover:bg-sky-900/80 text-sky-200 border border-sky-600/40 text-[10px] font-semibold transition-colors cursor-pointer"
        >
          EXECUTIVE VIEW
        </button>
      </div>
    </div>
  );
}
