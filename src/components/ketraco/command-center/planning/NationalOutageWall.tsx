import React, { useState, useMemo } from 'react';
import { AlertCircle, Clock, MapPin, TrendingUp, Zap } from 'lucide-react';

interface OutageEntry {
  id: string;
  assetName: string;
  type: 'FORCED' | 'PLANNED' | 'MAINTENANCE' | 'CONSTRUCTION' | 'PROTECTION';
  state: 'ACTIVE' | 'PLANNED' | 'UPCOMING' | 'HIGH_RISK' | 'RESTORING' | 'COMPLETED';
  affectedLoadMw: number;
  n1Exposure: number;
  congestionImpact: number;
  riskScore: number;
  startTime: string;
  endTime: string;
  restorationMinutes: number;
}

const sampleOutages: OutageEntry[] = [
  {
    id: 'OUT-4102',
    assetName: 'Nairobi North 220/132 kV',
    type: 'MAINTENANCE',
    state: 'ACTIVE',
    affectedLoadMw: 480,
    n1Exposure: 0.76,
    congestionImpact: 68,
    riskScore: 76,
    startTime: '2026-08-31T10:30:00',
    endTime: '2026-08-31T18:30:00',
    restorationMinutes: 15,
  },
  {
    id: 'OUT-5181',
    assetName: 'Naivasha 220 kV corridor',
    type: 'PLANNED',
    state: 'UPCOMING',
    affectedLoadMw: 360,
    n1Exposure: 0.58,
    congestionImpact: 52,
    riskScore: 68,
    startTime: '2026-09-02T14:00:00',
    endTime: '2026-09-02T22:00:00',
    restorationMinutes: 12,
  },
  {
    id: 'OUT-7601',
    assetName: 'Mombasa North transformer bay',
    type: 'FORCED',
    state: 'RESTORING',
    affectedLoadMw: 320,
    n1Exposure: 0.52,
    congestionImpact: 41,
    riskScore: 61,
    startTime: '2026-08-31T08:15:00',
    endTime: '2026-08-31T14:45:00',
    restorationMinutes: 8,
  },
];

export default function NationalOutageWall() {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const groups: Record<string, OutageEntry[]> = {};
    sampleOutages.forEach((outage) => {
      if (!groups[outage.state]) groups[outage.state] = [];
      groups[outage.state].push(outage);
    });
    return groups;
  }, []);

  const stateBadge = (state: OutageEntry['state']) => {
    const badgeMap: Record<OutageEntry['state'], { bg: string; text: string; icon: React.ReactNode }> = {
      ACTIVE: { bg: 'bg-red-500/20', text: 'text-red-400', icon: <Zap className="w-3 h-3" /> },
      PLANNED: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: <Clock className="w-3 h-3" /> },
      UPCOMING: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: <AlertCircle className="w-3 h-3" /> },
      HIGH_RISK: { bg: 'bg-orange-500/20', text: 'text-orange-400', icon: <TrendingUp className="w-3 h-3" /> },
      RESTORING: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', icon: <Clock className="w-3 h-3" /> },
      COMPLETED: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: <Zap className="w-3 h-3" /> },
    };
    const style = badgeMap[state];
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
        {style.icon}
        {state}
      </span>
    );
  };

  return (
    <div className="w-full bg-[#050913] text-slate-100 p-4 font-sans border-b border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-red-500/10 border border-red-500/30 text-red-300">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-red-400">Phase 09</div>
          <h3 className="text-xl font-bold text-slate-100">NATIONAL OUTAGE COMMAND WALL</h3>
        </div>
      </div>

      {(Object.entries(grouped) as Array<[string, OutageEntry[]]>).map(([state, outages]) => (
        <div key={state} className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-200">{state}</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">{outages.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            {outages.map((outage) => (
              <div key={outage.id} className="rounded-lg border border-slate-800 bg-[#08111d] p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-100">{outage.assetName}</span>
                  {stateBadge(outage.state)}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300">
                    <span>Type: {outage.type}</span>
                    <span className="px-2 py-0.5 rounded border border-slate-700 bg-slate-900 text-slate-300">RISK {outage.riskScore}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                    <div>Load: <strong className="text-cyan-400">{outage.affectedLoadMw} MW</strong></div>
                    <div>N-1: <strong className="text-amber-400">{(outage.n1Exposure * 100).toFixed(0)}%</strong></div>
                    <div>Congestion: <strong className="text-orange-400">{outage.congestionImpact}%</strong></div>
                    <div>Restoration: <strong className="text-emerald-400">{outage.restorationMinutes} min</strong></div>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <div className="text-[10px] text-slate-400">
                      <span>Start: {new Date(outage.startTime).toLocaleTimeString()}</span>
                      <span> → End: {new Date(outage.endTime).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
