import React, { useState } from 'react';
import { 
  ZapOff, 
  BellRing, 
  Activity, 
  Clock, 
  AlertOctagon, 
  CheckCircle, 
  Filter, 
  Calendar,
  Layers,
  Flame
} from 'lucide-react';
import ProvenanceTag from '../primitives/ProvenanceTag';
import ConfidenceBadge from '../primitives/ConfidenceBadge';
import { GridAlarm, GridEvent } from '../types';

interface OutageAlarmFabricLayerProps {
  alarms: GridAlarm[];
  events: GridEvent[];
  onSelectAsset?: (assetId: string) => void;
  onAcknowledgeAlarm?: (alarmId: string) => void;
}

export default function OutageAlarmFabricLayer({
  alarms,
  events,
  onSelectAsset,
  onAcknowledgeAlarm
}: OutageAlarmFabricLayerProps) {
  const [heatmapMetric, setHeatmapMetric] = useState<'EVENTS' | 'ALARMS' | 'LOADING' | 'OUTAGES'>('EVENTS');

  const regions = ['Rift Valley', 'Nairobi Metro', 'Coastal Trunk', 'Western Hub', 'Northern HVDC', 'Mt Kenya'];
  const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];

  // Alarm Aging Statistics
  const p1Alarms = alarms.filter(a => a.severity === 'P1');
  const p2Alarms = alarms.filter(a => a.severity === 'P2');
  const p3Alarms = alarms.filter(a => a.severity === 'P3');

  return (
    <div id="level-5-outages" className="w-full bg-[#060a14] border-t border-slate-800/80 p-4 font-sans text-slate-100">
      
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-mono font-bold tracking-wider">
            LEVEL 5
          </span>
          <h2 className="text-sm font-semibold tracking-wide uppercase text-slate-100 flex items-center gap-2">
            <ZapOff className="w-4 h-4 text-red-400" />
            Outage Intelligence, Alarm Pressure & Event Velocity
          </h2>
          <span className="text-xs text-slate-400 hidden md:inline">
            // Forced vs Planned Outage Fabric, Priority Escalation & Spatial-Temporal Activity Heatmap
          </span>
        </div>

        <div className="flex items-center gap-2">
          <ProvenanceTag source="SCADA_EMS" />
          <ConfidenceBadge status="VERIFIED" score={99.1} />
        </div>
      </div>

      {/* Grid Layout: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* 1. National Outage Fabric (4 Cols) */}
        <div className="lg:col-span-4 bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <ZapOff className="w-3.5 h-3.5 text-red-400" />
                National Outage Ledger
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/30">
                1 Planned Maintenance
              </span>
            </div>

            {/* Outage Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 my-2 text-center text-xs font-mono">
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Forced Outages</span>
                <span className="text-emerald-400 text-lg font-bold">0</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Planned Outages</span>
                <span className="text-amber-400 text-lg font-bold">1</span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">MW Unserved</span>
                <span className="text-slate-200 text-lg font-bold">0 MW</span>
              </div>
            </div>

            {/* Active Outage Detail Card */}
            <div className="p-2.5 rounded bg-slate-950/60 border border-slate-800 my-2 space-y-1 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-200">Marsabit–Loy 132kV Line</span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded">
                  PLANNED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Tower footing inspection & insulator wash sequence (WO-7712).
              </p>
              <div className="flex justify-between text-[10px] font-mono text-slate-400 pt-1">
                <span>Restoration ETA: <strong className="text-emerald-400">21:30 EAT</strong></span>
                <span>Impact: <strong className="text-slate-300">0 Cust (Looped)</strong></span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Avg Outage Duration: <strong className="text-slate-200">1.8h</strong></span>
            <span>SAIDI Reliability: <strong className="text-emerald-400">99.8%</strong></span>
          </div>
        </div>

        {/* 2. Alarm Pressure & Aging Histogram (4 Cols) */}
        <div className="lg:col-span-4 bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                Alarm Pressure & Aging
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {alarms.length} Registered
              </span>
            </div>

            {/* Severity Breakdown */}
            <div className="grid grid-cols-3 gap-2 my-2 text-center text-xs font-mono">
              <div className="bg-red-950/30 p-2 rounded border border-red-500/40">
                <span className="text-[10px] text-red-400 block font-bold">P1 CRITICAL</span>
                <span className="text-red-300 text-lg font-bold">{p1Alarms.length}</span>
              </div>
              <div className="bg-amber-950/30 p-2 rounded border border-amber-500/40">
                <span className="text-[10px] text-amber-400 block font-bold">P2 WARNING</span>
                <span className="text-amber-300 text-lg font-bold">{p2Alarms.length}</span>
              </div>
              <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">P3 ADVISORY</span>
                <span className="text-slate-200 text-lg font-bold">{p3Alarms.length}</span>
              </div>
            </div>

            {/* Aging Histogram */}
            <div className="space-y-1.5 my-2">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">
                Alarm Aging Spectrum:
              </span>
              <div className="space-y-1 text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-400">0–5 min</span>
                  <div className="flex-1 bg-slate-800 h-2 rounded overflow-hidden">
                    <div className="bg-red-500 h-full" style={{ width: '45%' }} />
                  </div>
                  <span className="w-6 text-right text-slate-300">2</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-400">5–15 min</span>
                  <div className="flex-1 bg-slate-800 h-2 rounded overflow-hidden">
                    <div className="bg-amber-400 h-full" style={{ width: '25%' }} />
                  </div>
                  <span className="w-6 text-right text-slate-300">1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-400">15–60 min</span>
                  <div className="flex-1 bg-slate-800 h-2 rounded overflow-hidden">
                    <div className="bg-sky-400 h-full" style={{ width: '15%' }} />
                  </div>
                  <span className="w-6 text-right text-slate-300">1</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-12 text-slate-400">&gt; 1 hr</span>
                  <div className="flex-1 bg-slate-800 h-2 rounded overflow-hidden">
                    <div className="bg-slate-500 h-full" style={{ width: '0%' }} />
                  </div>
                  <span className="w-6 text-right text-slate-500">0</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Escalation Status:</span>
            <span className="text-emerald-400 font-semibold">Under Control (&lt;15m SLA)</span>
          </div>
        </div>

        {/* 3. Event Velocity & Temporal Grid Heatmap (4 Cols) */}
        <div className="lg:col-span-4 bg-[#090e1a] border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-sky-400" />
                Live Event Velocity
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setHeatmapMetric(m => m === 'EVENTS' ? 'ALARMS' : 'EVENTS')}
                  className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-sky-300"
                >
                  {heatmapMetric}
                </button>
              </div>
            </div>

            {/* Velocity Gauges */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono my-2">
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Telemetry Velocity</span>
                <span className="text-sky-300 text-base font-bold">14.2 <span className="text-[10px] text-slate-400 font-normal">evt/min</span></span>
              </div>
              <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Alarm Velocity</span>
                <span className="text-amber-300 text-base font-bold">0.4 <span className="text-[10px] text-slate-400 font-normal">alm/min</span></span>
              </div>
            </div>

            {/* Time × Region Heatmap Matrix */}
            <div className="my-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                Time × Region Activity Density (12h)
              </span>
              <div className="space-y-1">
                {regions.slice(0, 4).map((region, rIdx) => (
                  <div key={region} className="flex items-center gap-1 text-[9px] font-mono">
                    <span className="w-16 truncate text-slate-400">{region}</span>
                    <div className="flex-1 grid grid-cols-7 gap-1">
                      {hours.map((h, hIdx) => {
                        let intensity = 'bg-slate-800/40';
                        if (rIdx === 1 && hIdx >= 4) intensity = 'bg-red-500/80'; // Nairobi Peak
                        else if (rIdx === 0 && hIdx >= 3) intensity = 'bg-amber-400/80'; // Suswa Peak
                        else if (hIdx >= 2) intensity = 'bg-sky-500/60';
                        return (
                          <div 
                            key={h} 
                            className={`h-2.5 rounded-xs ${intensity}`} 
                            title={`${region} at ${h}: Moderate Activity`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex justify-between">
            <span>Peak Activity Time:</span>
            <span className="text-amber-300 font-semibold">18:00 – 20:00 EAT (Evening Peak)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
