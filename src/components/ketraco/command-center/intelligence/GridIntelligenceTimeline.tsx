import React, { useState } from 'react';
import { 
  Clock, Activity, AlertTriangle, ShieldCheck, Zap, 
  Calendar, Layers, Sparkles, Filter, ChevronRight, BellRing
} from 'lucide-react';
import { IntelligenceTimelineEvent, TimeHorizon } from './types';

interface GridIntelligenceTimelineProps {
  timeline: IntelligenceTimelineEvent[];
  onSelectAsset?: (assetId: string) => void;
  selectedAssetId?: string | null;
}

export default function GridIntelligenceTimeline({
  timeline,
  onSelectAsset,
  selectedAssetId
}: GridIntelligenceTimelineProps) {
  const [selectedHorizon, setSelectedHorizon] = useState<TimeHorizon | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string | 'ALL'>('ALL');

  const filteredTimeline = timeline.filter(event => {
    if (selectedHorizon !== 'ALL' && event.timeHorizon !== selectedHorizon) return false;
    if (selectedCategory !== 'ALL' && event.category !== selectedCategory) return false;
    return true;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'ANOMALY': return 'text-amber-400 bg-amber-950/60 border-amber-500/40';
      case 'ALARM': return 'text-rose-400 bg-rose-950/60 border-rose-500/40';
      case 'AI_ADVISORY': return 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40';
      case 'FORECAST_SHIFT': return 'text-purple-400 bg-purple-950/60 border-purple-500/40';
      case 'RISK_CHANGE': return 'text-orange-400 bg-orange-950/60 border-orange-500/40';
      case 'OUTAGE': return 'text-blue-400 bg-blue-950/60 border-blue-500/40';
      default: return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const horizons: (TimeHorizon | 'ALL')[] = ['ALL', 'NOW', '1H', '6H', '24H', '7D'];

  return (
    <div className="bg-[#09111e]/95 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono text-xs select-none backdrop-blur-md">
      
      {/* Header & Horizon Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-purple-950/70 border border-purple-500/40 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <span className="font-bold text-white tracking-wider text-[11px] uppercase">
              GRID INTELLIGENCE TIMELINE
            </span>
            <span className="text-[9px] text-slate-400 block">
              Multi-Horizon Telemetry, Anomalies, Forecasts & Advisories
            </span>
          </div>
        </div>

        {/* Time Horizon Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#060c16] p-1 rounded-lg border border-slate-800">
          {horizons.map(h => (
            <button
              key={h}
              onClick={() => setSelectedHorizon(h)}
              className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider transition-all cursor-pointer ${
                selectedHorizon === h
                  ? 'bg-purple-600 text-white shadow-[0_0_8px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {h === 'ALL' ? 'ALL TIME' : h}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {filteredTimeline.length === 0 ? (
          <div className="p-4 text-center text-slate-500 text-[10px]">
            No intelligence events recorded for selected horizon.
          </div>
        ) : (
          filteredTimeline.map(ev => (
            <div
              key={ev.id}
              className={`p-2.5 rounded-lg border transition-all ${
                selectedAssetId && ev.assetId === selectedAssetId
                  ? 'border-cyan-400 bg-cyan-950/30'
                  : 'border-slate-800 bg-[#0c1626]/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold border uppercase ${getCategoryColor(ev.category)}`}>
                    {ev.category.replace(/_/g, ' ')}
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-bold bg-slate-900 text-slate-300 border border-slate-800">
                    {ev.timeHorizon}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {new Date(ev.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                  <span className="text-[8px] text-cyan-400 font-semibold px-1 py-0.2 bg-cyan-950/60 rounded border border-cyan-500/30">
                    {ev.classification} ({ev.confidence}%)
                  </span>
                </div>

                {ev.assetId && (
                  <button
                    onClick={() => onSelectAsset && onSelectAsset(ev.assetId!)}
                    className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Focus {ev.assetName ? ev.assetName.split(' ')[0] : ev.assetId}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="mt-1.5">
                <strong className="text-white text-[11px] block">{ev.title}</strong>
                <p className="text-slate-300 text-[10px] mt-0.5">{ev.details}</p>
                <div className="flex items-center justify-between text-[8.5px] text-slate-400 mt-1 pt-1 border-t border-slate-800/60">
                  <span>Source: {ev.source}</span>
                  <span className="italic">{ev.provenance}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
