import React from 'react';
import { 
  TrendingUp, TrendingDown, Minus, Zap, Activity, AlertTriangle, 
  ShieldCheck, ArrowUpRight, ArrowDownRight, Layers, HelpCircle
} from 'lucide-react';
import { KpiFamily } from './types';

interface GridKpiStripProps {
  kpis: KpiFamily[];
  selectedKpiId?: string;
  onSelectKpi?: (kpiId: string) => void;
}

export default function GridKpiStrip({ kpis, selectedKpiId, onSelectKpi }: GridKpiStripProps) {
  // Helper to render mini SVG sparkline
  const renderSparkline = (data: number[], status: string) => {
    if (!data || data.length === 0) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min === 0 ? 1 : max - min;
    const width = 64;
    const height = 18;
    
    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');

    const strokeColor = 
      status === 'CRITICAL' ? '#f43f5e' :
      status === 'WARNING' ? '#f59e0b' :
      status === 'OPTIMAL' ? '#10b981' : '#06b6d4';

    return (
      <svg width={width} height={height} className="overflow-visible shrink-0">
        <polyline
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        {/* Sparkline head dot */}
        {data.length > 0 && (
          <circle
            cx={width}
            cy={height - ((data[data.length - 1] - min) / range) * (height - 4) - 2}
            r="2"
            fill={strokeColor}
          />
        )}
      </svg>
    );
  };

  return (
    <div className="bg-[#0e1626]/90 border-b border-slate-800/80 px-3 py-2 flex items-center gap-2.5 overflow-x-auto no-scrollbar select-none shrink-0 z-20">
      {kpis.map(kpi => {
        const isSelected = selectedKpiId === kpi.id;
        return (
          <div
            key={kpi.id}
            onClick={() => onSelectKpi && onSelectKpi(kpi.id)}
            className={`flex flex-col justify-between p-2 rounded-lg border transition-all min-w-[175px] shrink-0 cursor-pointer ${
              isSelected 
                ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                : 'bg-[#111c2e]/60 border-slate-800/70 hover:border-slate-700 hover:bg-[#132035]'
            }`}
          >
            {/* Top Label & Trend */}
            <div className="flex items-start justify-between gap-1 mb-1 min-w-0">
              <span className="text-[9.5px] font-mono font-bold text-slate-300 tracking-wider leading-tight break-words min-w-0 flex-1">
                {kpi.label}
              </span>
              <div className="flex items-center gap-0.5 text-[9px] font-mono shrink-0">
                {kpi.trend === 'UP' && <ArrowUpRight className="w-3 h-3 text-cyan-400" />}
                {kpi.trend === 'DOWN' && <ArrowDownRight className="w-3 h-3 text-emerald-400" />}
                {kpi.trend === 'STABLE' && <Minus className="w-3 h-3 text-slate-400" />}
                <span className={kpi.status === 'WARNING' ? 'text-amber-400 font-bold' : kpi.status === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                  {kpi.trendValue}
                </span>
              </div>
            </div>

            {/* Middle Main Value & Sparkline */}
            <div className="flex items-baseline justify-between gap-2 my-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-mono font-black text-white tracking-tight">
                  {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                </span>
                {kpi.unit && (
                  <span className="text-[9.5px] font-mono text-cyan-400/90 font-bold">
                    {kpi.unit}
                  </span>
                )}
              </div>
              <div>{renderSparkline(kpi.sparkline, kpi.status)}</div>
            </div>

            {/* Bottom Secondary Telemetry Metrics */}
            <div className="flex items-center justify-between text-[8.5px] font-mono text-slate-400 pt-1 border-t border-slate-800/50 mt-1">
              <span className="truncate">
                {kpi.secondaryMetric.label}: <strong className="text-slate-300">{kpi.secondaryMetric.value} {kpi.secondaryMetric.unit || ''}</strong>
              </span>
              {kpi.tertiaryMetric && (
                <span className="truncate text-slate-400">
                  {kpi.tertiaryMetric.label}: <strong className="text-slate-300">{kpi.tertiaryMetric.value} {kpi.tertiaryMetric.unit || ''}</strong>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
