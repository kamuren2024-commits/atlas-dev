import React from 'react';
import { GenomeDimension } from './types';
import { TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';

interface ProjectHealthGenomeProps {
  dimensions: GenomeDimension[];
  projectCode?: string;
  projectName?: string;
  overallDeliveryConfidence?: number;
  deliveryDelta?: string;
}

export const ProjectHealthGenome: React.FC<ProjectHealthGenomeProps> = ({
  dimensions,
  projectCode = 'KET-PDS-0042',
  projectName = 'Mombasa 400kV',
  overallDeliveryConfidence = 81.7,
  deliveryDelta = '▼ -2.4% (7d)'
}) => {
  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight">
            Project Health Genome
          </h3>
          <div className="text-[10px] font-mono text-cyan-400">
            {projectCode} • {projectName}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 py-2">
        {/* 10 Dimensions Table Bars (7 cols) */}
        <div className="md:col-span-7 space-y-1.5 pr-2 overflow-y-auto max-h-[220px] custom-scrollbar">
          <div className="grid grid-cols-12 text-[9px] font-mono text-slate-500 uppercase pb-1 border-b border-slate-800/40">
            <span className="col-span-5">Dimension</span>
            <span className="col-span-4 text-center">Score</span>
            <span className="col-span-3 text-right">Δ 7D</span>
          </div>

          {dimensions.map(dim => {
            const isCritical = dim.score < 70;
            const isAtRisk = dim.score >= 70 && dim.score < 85;
            const barColor = isCritical
              ? 'bg-rose-500'
              : isAtRisk
              ? 'bg-amber-400'
              : 'bg-emerald-400';

            return (
              <div
                key={dim.id}
                className="grid grid-cols-12 items-center text-xs py-0.5"
              >
                {/* Dimension label */}
                <span className="col-span-5 text-slate-300 text-[11px] truncate font-medium">
                  {dim.name}
                </span>

                {/* Bar */}
                <div className="col-span-4 px-1 flex items-center gap-1.5">
                  <div className="flex-1 bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-300 w-6 text-right">
                    {dim.score}%
                  </span>
                </div>

                {/* Delta */}
                <span
                  className={`col-span-3 text-right font-mono text-[10px] ${
                    dim.delta7d < 0
                      ? 'text-rose-400'
                      : dim.delta7d > 0
                      ? 'text-emerald-400'
                      : 'text-slate-500'
                  }`}
                >
                  {dim.delta7d < 0
                    ? `▼ ${dim.delta7d}`
                    : dim.delta7d > 0
                    ? `▲ +${dim.delta7d}`
                    : '0'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right side circular Delivery Confidence gauge (5 cols) */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-2 rounded bg-slate-950/40 border border-slate-800/60 text-center">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">
            Delivery Confidence
          </div>

          {/* SVG Circular Gauge */}
          <div className="relative w-24 h-24 my-1 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400 transition-all duration-500"
                strokeDasharray={`${overallDeliveryConfidence}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-display font-bold text-white leading-none">
                {overallDeliveryConfidence}%
              </span>
              <span className="text-[9px] font-mono text-rose-400 leading-none mt-1">
                {deliveryDelta}
              </span>
            </div>
          </div>

          {/* Primary Deterioration Causes */}
          <div className="w-full text-left pt-1.5 border-t border-slate-800/80">
            <div className="text-[9px] font-mono uppercase text-slate-500 font-bold">
              Primary deterioration
            </div>
            <div className="text-[10px] text-amber-300 font-mono mt-0.5">
              Wayleave → Schedule
            </div>
            <div className="text-[10px] text-rose-400 font-mono">
              + Construction
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
