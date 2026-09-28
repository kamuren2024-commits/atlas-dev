import React from 'react';
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { KPIItem } from '../types';

interface MetricCardProps {
  item: KPIItem;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ item, onClick }) => {
  const isPositive = item.trendPositive;

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#0a0f18]/80 hover:bg-[#0e1624] border border-slate-800/80 hover:border-cyan-500/40 rounded-lg p-3 transition-all duration-150 cursor-pointer shadow-sm flex flex-col justify-between"
    >
      <div>
        <div className="text-[11px] font-medium text-slate-400 tracking-wide truncate">
          {item.label}
        </div>
        <div className="flex items-baseline justify-between mt-1">
          <span className="text-xl font-display font-bold text-white tracking-tight">
            {item.value}
          </span>
          <span
            className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-medium ${
              isPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3 text-emerald-400" />
            ) : (
              <TrendingDown className="w-3 h-3 text-rose-400" />
            )}
            {item.delta}
          </span>
        </div>
      </div>

      {/* Subtle indicator underline */}
      <div className="w-full bg-slate-800/60 h-0.5 rounded-full mt-2.5 overflow-hidden">
        <div
          className={`h-full ${
            isPositive ? 'bg-cyan-500/70' : 'bg-rose-500/80'
          }`}
          style={{ width: item.value.replace('%', '%') }}
        />
      </div>
    </div>
  );
};
