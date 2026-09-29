import React, { useState, useEffect } from 'react';
import { 
  Activity, Zap, Radio, ShieldCheck, AlertTriangle, 
  Clock, RefreshCw, Cpu, Wifi, Server, CheckCircle2, ShieldAlert,
  HelpCircle, Sparkles, Sliders, Layers, Search
} from 'lucide-react';
import { DataFreshness, OperationalState } from './types';

interface GridHeaderProps {
  systemLoadMW: number;
  generationMW: number;
  frequencyHz: string | number;
  spinningReserveMW: number;
  transmissionAvailPct: string | number;
  onlineSubstationsCount: string;
  activeOutagesCount: number;
  criticalAlarmsCount: number;
  dataFreshness: DataFreshness;
  onOpenSystemHealth: () => void;
  onOpenResilienceModal: () => void;
  onToggleSimulation: () => void;
  onTriggerCommandPalette: () => void;
}

export default function GridHeader({
  systemLoadMW,
  generationMW,
  frequencyHz,
  spinningReserveMW,
  transmissionAvailPct,
  onlineSubstationsCount,
  activeOutagesCount,
  criticalAlarmsCount,
  dataFreshness,
  onOpenSystemHealth,
  onOpenResilienceModal,
  onToggleSimulation,
  onTriggerCommandPalette
}: GridHeaderProps) {
  const [eatTime, setEatTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format to East Africa Time (UTC+3)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Africa/Nairobi',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setEatTime(new Intl.DateTimeFormat('en-GB', options).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-[#0b121e]/95 backdrop-blur-md border-b border-cyan-500/25 px-4 py-2.5 flex items-center justify-between gap-3 text-slate-200 select-none shrink-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
      
      {/* Brand & Live Stream Indicator */}
      <div className="flex items-center gap-3.5 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Zap className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[11px] font-mono font-black tracking-widest text-cyan-400 uppercase">KETRACO</span>
              <span className="text-[9px] font-mono text-slate-400 font-bold">GRID OS</span>
            </div>
            <span className="text-[9px] font-mono text-slate-400 block mt-0.5 tracking-wider">NATIONAL TRANSMISSION COMMAND</span>
          </div>
        </div>

        {/* Data provenance state */}
        <button 
          onClick={onToggleSimulation}
          title="Operational data provenance state. No live SCADA or KETRACO telemetry feed is connected in this demonstration."
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border transition-all cursor-pointer ${
            dataFreshness === 'OPERATIONAL_SIMULATION' || dataFreshness === 'VERIFIED_PUBLIC' || dataFreshness === 'REFERENCE' || dataFreshness === 'SIMULATION'
              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              : dataFreshness === 'VERIFIED_LIVE'
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : dataFreshness === 'INTEGRATION_PENDING'
                  ? 'bg-sky-950/60 text-sky-300 border-sky-500/40'
                  : 'bg-slate-900 text-slate-300 border-slate-600'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${dataFreshness === 'VERIFIED_LIVE' ? 'bg-emerald-400' : dataFreshness === 'VERIFIED_PUBLIC' || dataFreshness === 'OPERATIONAL_SIMULATION' || dataFreshness === 'REFERENCE' || dataFreshness === 'SIMULATION' ? 'bg-amber-400' : dataFreshness === 'INTEGRATION_PENDING' ? 'bg-sky-400' : 'bg-slate-400'}`} />
          <span>
            {dataFreshness === 'VERIFIED_LIVE'
              ? 'VERIFIED_LIVE'
              : dataFreshness === 'VERIFIED_PUBLIC'
                ? 'VERIFIED_PUBLIC'
                : dataFreshness === 'OPERATIONAL_SIMULATION'
                  ? 'OPERATIONAL_SIMULATION'
                  : dataFreshness === 'INTEGRATION_PENDING'
                    ? 'INTEGRATION_PENDING'
                    : dataFreshness === 'REFERENCE'
                      ? 'VERIFIED_PUBLIC'
                      : dataFreshness === 'SIMULATION'
                        ? 'OPERATIONAL_SIMULATION'
                        : 'DATA SOURCE UNAVAILABLE'}
          </span>
        </button>
      </div>

      {/* Telemetry Strip Values */}
      <div className="flex items-center gap-3 md:gap-5 overflow-x-auto no-scrollbar py-0.5">
        
        {/* Load */}
        <div className="flex flex-col text-left shrink-0">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">SYSTEM LOAD</span>
          <div className="flex items-baseline gap-1 leading-tight">
            <span className="text-sm font-mono font-black text-cyan-300">{Number.isFinite(systemLoadMW) ? systemLoadMW.toLocaleString() : 'UNKNOWN'}</span>
            <span className="text-[9px] font-mono text-slate-400">MW</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 shrink-0 hidden sm:block" />

        {/* Generation */}
        <div className="flex flex-col text-left shrink-0">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">GENERATION</span>
          <div className="flex items-baseline gap-1 leading-tight">
            <span className="text-sm font-mono font-black text-emerald-400">{Number.isFinite(generationMW) ? generationMW.toLocaleString() : 'UNKNOWN'}</span>
            <span className="text-[9px] font-mono text-slate-400">MW</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 shrink-0 hidden sm:block" />

        {/* Frequency */}
        <div className="flex flex-col text-left shrink-0">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">FREQUENCY</span>
          <div className="flex items-baseline gap-1 leading-tight">
            <span className={`text-sm font-mono font-black ${
              Number(frequencyHz) < 49.85 || Number(frequencyHz) > 50.15 ? 'text-amber-400' : 'text-cyan-300'
            }`}>{frequencyHz}</span>
            <span className="text-[9px] font-mono text-slate-400">Hz</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 shrink-0 hidden md:block" />

        {/* Spinning Reserve */}
        <div className="flex flex-col text-left shrink-0 hidden md:flex">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">RESERVE</span>
          <div className="flex items-baseline gap-1 leading-tight">
            <span className="text-sm font-mono font-black text-slate-200">{spinningReserveMW}</span>
            <span className="text-[9px] font-mono text-slate-400">MW</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 shrink-0 hidden lg:block" />

        {/* Transmission Availability */}
        <div className="flex flex-col text-left shrink-0 hidden lg:flex">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">TX AVAILABILITY</span>
          <div className="flex items-baseline gap-1 leading-tight">
            <span className="text-sm font-mono font-black text-emerald-400">{transmissionAvailPct}%</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 shrink-0 hidden lg:block" />

        {/* Substations Status */}
        <div className="flex flex-col text-left shrink-0 hidden lg:flex">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">SUBSTATIONS</span>
          <div className="flex items-baseline gap-1 leading-tight">
            <span className="text-sm font-mono font-black text-slate-200">{onlineSubstationsCount}</span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 shrink-0 hidden xl:block" />

        {/* Active Outages */}
        <div className="flex flex-col text-left shrink-0 hidden xl:flex">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">OUTAGES</span>
          <div className="flex items-baseline gap-1 leading-tight">
            <span className={`text-sm font-mono font-black ${activeOutagesCount > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
              {activeOutagesCount}
            </span>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-800 shrink-0" />

        {/* Critical Alarms */}
        <div className="flex flex-col text-left shrink-0">
          <span className="text-[8.5px] font-mono text-slate-400 font-bold uppercase tracking-wider">CRITICAL ALARMS</span>
          <div className="flex items-baseline gap-1 leading-tight">
            <span className={`text-sm font-mono font-black ${criticalAlarmsCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {criticalAlarmsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Right Action Tools: Command Palette, Health, EAT Clock */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Quick Search / Command Palette shortcut */}
        <button
          onClick={onTriggerCommandPalette}
          className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-900/80 border border-slate-700/60 hover:border-cyan-500/50 text-slate-400 hover:text-cyan-300 transition-all text-xs font-mono cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="text-[10px]">CMD</span>
          <kbd className="px-1.5 py-0.2 text-[9px] bg-slate-800 border border-slate-700 rounded text-slate-400">Ctrl+K</kbd>
        </button>

        {/* Resilience N-1 Modal Trigger */}
        <button
          onClick={onOpenResilienceModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950/40 border border-indigo-500/30 hover:bg-indigo-900/40 text-indigo-300 text-[10px] font-mono font-bold transition-all cursor-pointer"
          title="Open N-1 Contingency & Grid Resilience Suite"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden md:inline">N-1 RESILIENCE</span>
        </button>

        {/* System Health Status */}
        <button
          onClick={onOpenSystemHealth}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/30 border border-emerald-500/30 hover:bg-emerald-900/40 text-emerald-300 text-[10px] font-mono font-bold transition-all cursor-pointer"
          title="Inspect Telemetry Pipeline, SCADA, PostGIS & AI Ingestion Health"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">HEALTH</span>
        </button>

        {/* EAT Clock */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-800 text-slate-300 text-[10.5px] font-mono font-bold shrink-0">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{eatTime || '18:21:04'}</span>
          <span className="text-[8.5px] text-slate-400 font-normal">EAT</span>
        </div>
      </div>
    </header>
  );
}
