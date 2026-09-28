import React from 'react';
import { KPIItem } from './types';
import { MetricCard } from './shared/MetricCard';

interface KPICommandStripProps {
  kpis: KPIItem[];
  onSelectKpi?: (kpiId: string) => void;
  activeProjects?: number;
  highRiskCount?: number;
  criticalCount?: number;
  eventsCount?: number;
  decisionsCount?: number;
}

export const KPICommandStrip: React.FC<KPICommandStripProps> = ({
  kpis,
  onSelectKpi,
  activeProjects = 27,
  highRiskCount = 4,
  criticalCount = 2,
  eventsCount = 18,
  decisionsCount = 7
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
      {/* 5 Primary KPI Cards */}
      {kpis.slice(0, 5).map(kpi => (
        <MetricCard
          key={kpi.id}
          item={kpi}
          onClick={() => onSelectKpi?.(kpi.id)}
        />
      ))}

      {/* Far Right Summary Stats Matrix Card */}
      <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-2.5 flex flex-col justify-between text-xs font-mono">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
          Portfolio Velocity
        </div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Projects</span>
            <span className="text-cyan-400 font-bold">{activeProjects}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">High Risk</span>
            <span className="text-amber-400 font-bold">{highRiskCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Critical</span>
            <span className="text-rose-400 font-bold">{criticalCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-[11px]">Events</span>
            <span className="text-slate-200 font-bold">{eventsCount}</span>
          </div>
          <div className="flex items-center justify-between col-span-2 pt-0.5 border-t border-slate-800/60">
            <span className="text-slate-400 text-[10px]">Pending Decisions</span>
            <span className="text-purple-400 font-bold">{decisionsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
