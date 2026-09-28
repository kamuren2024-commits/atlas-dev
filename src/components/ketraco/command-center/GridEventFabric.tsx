import React, { useState } from 'react';
import { 
  Activity, AlertTriangle, ShieldCheck, Zap, Radio, 
  ChevronUp, ChevronDown, Filter, Search, CheckCircle2, Clock, Play
} from 'lucide-react';
import { GridEvent, GridAlarm } from './types';

interface GridEventFabricProps {
  events: GridEvent[];
  alarms: GridAlarm[];
  onSelectAsset?: (assetId: string) => void;
  onAcknowledgeAlarm?: (alarmId: string) => void;
}

export default function GridEventFabric({
  events,
  alarms,
  onSelectAsset,
  onAcknowledgeAlarm
}: GridEventFabricProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEvents = events.filter(evt => {
    if (filterCategory !== 'ALL' && evt.category !== filterCategory) return false;
    if (filterSeverity !== 'ALL' && evt.severity !== filterSeverity) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        evt.title.toLowerCase().includes(q) ||
        evt.description.toLowerCase().includes(q) ||
        (evt.assetName && evt.assetName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className={`bg-[#09111e]/95 border-t border-cyan-500/20 flex flex-col transition-all duration-300 select-none z-20 backdrop-blur-md shrink-0 ${
      isExpanded ? 'h-56' : 'h-10'
    }`}>
      
      {/* Top Banner Control Bar */}
      <div className="px-4 py-1.5 flex items-center justify-between gap-3 text-slate-300 text-xs font-mono border-b border-slate-800/80">
        
        {/* Left Live Stream Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider text-[10px] cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>REAL-TIME GRID EVENT & ALARM FABRIC</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          <span className="px-2 py-0.5 text-[9px] rounded-full bg-slate-900 border border-slate-700 text-slate-400">
            {events.length} Events Logged
          </span>
        </div>

        {/* Middle Quick Filters (Visible when expanded) */}
        {isExpanded && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <div className="flex items-center gap-1 text-[9px]">
              <span className="text-slate-400">CATEGORY:</span>
              {['ALL', 'ALARM', 'TELEMETRY', 'BREAKER', 'DISPATCH', 'PROTECTION'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-1 text-[9px]">
              <span className="text-slate-400">SEVERITY:</span>
              {['ALL', 'HIGH', 'INFO'].map(sev => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                    filterSeverity === sev
                      ? 'bg-indigo-950 border-indigo-500 text-indigo-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right Search Input */}
        {isExpanded && (
          <div className="relative w-44 hidden md:block">
            <input
              type="text"
              placeholder="Search event logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-2.5 py-0.5 text-[9.5px] bg-[#0c1524] border border-slate-700 rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
          </div>
        )}

        {/* Collapsed view summary ticker */}
        {!isExpanded && (
          <div className="flex-1 flex items-center gap-3 overflow-hidden text-[10px] text-slate-400 truncate">
            {events.slice(0, 3).map(evt => (
              <span key={evt.id} className="truncate flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${evt.severity === 'HIGH' ? 'bg-rose-400' : 'bg-cyan-400'}`} />
                <strong className="text-slate-300">{evt.timestamp}:</strong> {evt.title}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Expanded Events List Stream */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs font-mono">
          {filteredEvents.map(evt => {
            const isAlarm = evt.category === 'ALARM';
            return (
              <div
                key={evt.id}
                className={`p-2 rounded-lg border flex items-center justify-between gap-3 text-[10px] transition-colors ${
                  isAlarm 
                    ? 'bg-rose-950/20 border-rose-500/40 text-slate-200 hover:bg-rose-950/30' 
                    : 'bg-[#0e1726]/60 border-slate-800/80 text-slate-300 hover:bg-[#121e32]'
                }`}
              >
                {/* Left Timestamp & Severity Badge */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-slate-400 font-bold">{evt.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase border ${
                    evt.severity === 'HIGH' ? 'bg-rose-950 border-rose-500 text-rose-300' :
                    evt.severity === 'CRITICAL' ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' :
                    'bg-slate-900 border-slate-700 text-cyan-300'
                  }`}>
                    {evt.category}
                  </span>
                </div>

                {/* Center Content & Asset link */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {evt.assetName && (
                      <button
                        onClick={() => evt.assetId && onSelectAsset && onSelectAsset(evt.assetId)}
                        className="text-cyan-400 hover:underline font-bold shrink-0 cursor-pointer"
                      >
                        [{evt.assetName}]
                      </button>
                    )}
                    <strong className="text-slate-200 truncate">{evt.title}</strong>
                  </div>
                  <p className="text-slate-400 text-[9px] truncate mt-0.5">{evt.description}</p>
                </div>

                {/* Right Source & Action */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[8.5px] text-slate-400 font-mono">
                    {evt.source}
                  </span>
                  {isAlarm && evt.correlationId && onAcknowledgeAlarm && (
                    <button
                      onClick={() => onAcknowledgeAlarm(evt.correlationId!)}
                      className="px-2 py-0.5 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 text-amber-300 text-[9px] font-bold transition-all cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
