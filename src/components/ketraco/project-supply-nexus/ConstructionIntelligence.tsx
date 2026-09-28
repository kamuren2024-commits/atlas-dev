import React from 'react';
import { HardHat, AlertTriangle, TrendingDown } from 'lucide-react';

interface ConstructionIntelligenceProps {
  projectCode?: string;
  physicalProgress?: number;
  variance?: number;
  varianceDelta?: string;
  crewAvailability?: number;
  materialReadiness?: number;
  siteReadiness?: number;
  forecastDelayDays?: number;
}

export const ConstructionIntelligence: React.FC<ConstructionIntelligenceProps> = ({
  projectCode = 'KET-PDS-0042',
  physicalProgress = 63.4,
  variance = -7.2,
  varianceDelta = '▼ -11%',
  crewAvailability = 82,
  materialReadiness = 91,
  siteReadiness = 76,
  forecastDelayDays = 23
}) => {
  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight">
            Construction Intelligence
          </h3>
          <p className="text-[10px] font-mono text-cyan-400">
            {projectCode}
          </p>
        </div>
      </div>

      {/* Progress & Variance */}
      <div className="space-y-2 py-2">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Physical Progress</span>
            <span className="font-mono font-bold text-white">{physicalProgress}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full"
              style={{ width: `${physicalProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-slate-500">Target: 70.6%</span>
            <span className="text-rose-400 font-bold">
              Variance: {variance}% {varianceDelta}
            </span>
          </div>
        </div>

        {/* Mini 3 factors */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-mono">
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800/60 text-center">
            <div className="text-slate-500 text-[9px]">Crew Avail.</div>
            <div className="text-slate-200 font-bold mt-0.5">{crewAvailability}%</div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800/60 text-center">
            <div className="text-slate-500 text-[9px]">Material Read.</div>
            <div className="text-cyan-400 font-bold mt-0.5">{materialReadiness}%</div>
          </div>
          <div className="p-1.5 rounded bg-slate-900/60 border border-slate-800/60 text-center">
            <div className="text-slate-500 text-[9px]">Site Read.</div>
            <div className="text-amber-400 font-bold mt-0.5">{siteReadiness}%</div>
          </div>
        </div>
      </div>

      {/* AI Forecast */}
      <div className="pt-2 border-t border-slate-800/60 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="text-slate-500 uppercase font-bold">AI Forecast</span>
          <span className="text-amber-400 font-bold">Completion: +{forecastDelayDays} days late</span>
        </div>
        <div className="text-[10px] font-sans text-slate-400 space-y-0.5">
          <div>1. Wayleave delivery delay (Section 3)</div>
          <div>2. Civil works tower pad casting productivity</div>
        </div>
      </div>
    </div>
  );
};
