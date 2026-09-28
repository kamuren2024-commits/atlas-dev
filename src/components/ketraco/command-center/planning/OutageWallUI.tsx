import React, { useMemo, useState } from 'react';
import { AlertTriangle, Clock, Shield, Zap, ArrowRight, ChevronDown, ChevronRight, CheckCircle2, RotateCcw, Pause } from 'lucide-react';
import type { OutageEvent } from '../../../../../backend/planning-engine/types';

interface OutageWallProps {
  outages: OutageEvent[];
  conflicts: Array<{ id: string; firstOutageId: string; secondOutageId: string; risk: number; message: string; }>;
  onSelectAsset: (assetId: string) => void;
}

const WALL_CATEGORIES = ['ACTIVE', 'PLANNED', 'UPCOMING', 'HIGH_RISK', 'RESTORING', 'COMPLETED'] as const;

const CATEGORY_CONFIG: Record<string, { color: string; bg: string; border: string; icon: typeof AlertTriangle }> = {
  ACTIVE: { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', icon: AlertTriangle },
  PLANNED: { color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', icon: Clock },
  UPCOMING: { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', icon: ChevronRight },
  HIGH_RISK: { color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', icon: Shield },
  RESTORING: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', icon: RotateCcw },
  COMPLETED: { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', icon: CheckCircle2 },
};

function categorize(outage: OutageEvent): string {
  if (outage.state === 'RESTORING') return 'RESTORING';
  if (outage.state === 'COMPLETED') return 'COMPLETED';
  if (outage.risk >= 70) return 'HIGH_RISK';
  if (outage.state === 'ACTIVE') return 'ACTIVE';
  if (outage.state === 'PLANNED') return 'PLANNED';
  return 'UPCOMING';
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const hours = Math.round(ms / 3600000);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}

const OutageCard: React.FC<{ outage: OutageEvent; onSelectAsset: (id: string) => void }> = ({ outage, onSelectAsset }) => {
  const [expanded, setExpanded] = useState(false);
  const cat = categorize(outage);
  const config = CATEGORY_CONFIG[cat];
  const Icon = config.icon;
  const residualLoad = Math.max(0, outage.affectedLoadMw - outage.alternativeSupplyMw);

  return (
    <div className={`rounded-lg border ${config.border} ${config.bg} p-3 transition-all hover:border-opacity-60`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${config.color} shrink-0`} />
          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-100">{outage.id}</span>
            <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 bg-slate-800 text-slate-400">{outage.type}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${config.color} ${config.border} border`}>
          RISK {outage.risk}
        </span>
      </div>

      <div className="mt-2 text-[11px] text-slate-300 leading-relaxed">{outage.gridImpact}</div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        <div className="text-slate-400">
          <span className="block text-slate-300 font-bold">{outage.affectedLoadMw} MW</span>
          Affected load
        </div>
        <div className="text-slate-400">
          <span className="block text-slate-300 font-bold">{outage.n1Exposure > 0.5 ? 'HIGH' : outage.n1Exposure > 0.3 ? 'MED' : 'LOW'}</span>
          N-1 exposure {(outage.n1Exposure * 100).toFixed(0)}%
        </div>
        <div className="text-slate-400">
          <span className="block text-slate-300 font-bold">{outage.restorationEstimateMinutes}min</span>
          Restore est.
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-[10px]">
        <span className="text-slate-500">Alt supply: {outage.alternativeSupplyMw} MW</span>
        <span className={residualLoad > 100 ? 'text-rose-400' : 'text-emerald-400'}>
          Residual: {residualLoad} MW
        </span>
        <span className="text-slate-500">{outage.region}</span>
      </div>

      <button onClick={() => setExpanded(!expanded)} className="mt-2 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer">
        <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        {expanded ? 'Less' : 'Details'}
      </button>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-slate-800 space-y-1 text-[10px] text-slate-400">
          <div>Assets: {outage.assetIds && outage.assetIds.length > 0 ? outage.assetIds.map(a => (
            <button key={a} onClick={() => onSelectAsset(a)} className="text-cyan-400 hover:underline cursor-pointer">{a}</button>
          )).reduce((prev, curr) => [prev, ', ', curr] as any) : 'None designated'}</div>
          <div>Window: {new Date(outage.start).toLocaleDateString()} → {new Date(outage.end).toLocaleDateString()} ({formatDuration(outage.start, outage.end)})</div>
          <div>Congestion impact: {((outage.congestionImpact || 0) * 100).toFixed(0)}%</div>
          <div className="text-slate-500">{outage.evidence?.[0]?.source || 'System Dispatch'} | Confidence: {outage.evidence?.[0] ? `${(outage.evidence[0].confidence * 100).toFixed(0)}%` : '90%'}</div>
        </div>
      )}
    </div>
  );
};export default function OutageWallUI({ outages, conflicts, onSelectAsset }: OutageWallProps) {
  const [activeCategory, setActiveCategory] = useState<string>('ACTIVE');

  const categorized = useMemo(() => {
    const map: Record<string, OutageEvent[]> = {};
    WALL_CATEGORIES.forEach(c => { map[c] = []; });
    outages.forEach(o => { map[categorize(o)].push(o); });
    return map;
  }, [outages]);

  const displayOutages = activeCategory === 'ALL' ? outages : categorized[activeCategory] || [];

  return (
    <div className="bg-[#050913] text-slate-100 p-4 font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-red-500/10 border border-red-500/30">
            <Zap className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-red-400">Outage Command</div>
            <h3 className="text-lg font-bold">NATIONAL OUTAGE WALL</h3>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 font-mono">{outages.length} outages tracked</div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {WALL_CATEGORIES.map(cat => {
          const config = CATEGORY_CONFIG[cat];
          const count = categorized[cat]?.length || 0;
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded border text-[10px] font-bold tracking-wider whitespace-nowrap transition cursor-pointer
                ${active ? `${config.bg} ${config.border} ${config.color}` : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'}`}>
              {cat.replace('_', ' ')} ({count})
            </button>
          );
        })}
      </div>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
          <div className="text-[11px] font-bold text-rose-400 mb-2">{conflicts.length} OUTAGE CONFLICT{conflicts.length > 1 ? 'S' : ''} DETECTED</div>
          {conflicts.slice(0, 3).map(c => (
            <div key={c.id} className="text-[10px] text-slate-300 mb-1">
              <span className="text-rose-400">●</span> {c.message} <span className="text-slate-500">(Risk: {c.risk}%)</span>
            </div>
          ))}
        </div>
      )}

      {/* Timeline View */}
      <div className="mb-4 rounded-lg border border-slate-800 bg-[#0a1222] p-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mb-2">Timeline</div>
        <div className="flex gap-0.5 h-8">
          {Array.from({ length: 7 }, (_, dayIdx) => {
            const dayOutages = displayOutages.filter(o => {
              const start = new Date(o.start);
              const end = new Date(o.end);
              const dayStart = new Date();
              dayStart.setDate(dayStart.getDate() + dayIdx);
              dayStart.setHours(0, 0, 0, 0);
              const dayEnd = new Date(dayStart);
              dayEnd.setHours(23, 59, 59, 999);
              return start <= dayEnd && end >= dayStart;
            });
            return (
              <div key={dayIdx} className="flex-1 rounded-sm bg-slate-800/50 relative overflow-hidden" title={`Day +${dayIdx}: ${dayOutages.length} outages`}>
                {dayOutages.map((o, i) => {
                  const cat = categorize(o);
                  const color = cat === 'ACTIVE' ? 'bg-red-500' : cat === 'HIGH_RISK' ? 'bg-rose-400' : cat === 'PLANNED' ? 'bg-cyan-500' : cat === 'RESTORING' ? 'bg-emerald-500' : 'bg-amber-500';
                  return <div key={i} className={`absolute ${color} opacity-60`} style={{ left: `${(i / Math.max(dayOutages.length, 1)) * 100}%`, width: `${100 / Math.max(dayOutages.length, 1)}%`, top: 0, bottom: 0 }} />;
                })}
              </div>
            );
          })}
        </div>
        <div className="flex justify-between text-[8px] text-slate-500 mt-1">
          <span>Today</span><span>+1d</span><span>+2d</span><span>+3d</span><span>+4d</span><span>+5d</span><span>+6d</span>
        </div>
      </div>

      {/* Outage Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {displayOutages.map(outage => (
          <OutageCard key={outage.id} outage={outage} onSelectAsset={onSelectAsset} />
        ))}
      </div>
    </div>
  );
}
