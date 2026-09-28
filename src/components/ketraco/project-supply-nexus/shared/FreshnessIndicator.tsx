import React from 'react';
import { Clock } from 'lucide-react';

interface FreshnessIndicatorProps {
  lastUpdated?: string;
  isLive?: boolean;
  freshnessSeconds?: number;
}

export const FreshnessIndicator: React.FC<FreshnessIndicatorProps> = ({
  lastUpdated = '12:42:31',
  isLive = true,
  freshnessSeconds = 42
}) => {
  return (
    <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
      <div className="flex items-center gap-1.5">
        <Clock className="w-3 h-3 text-slate-500" />
        <span>Last updated {lastUpdated}</span>
      </div>
      {isLive && (
        <span className="flex items-center gap-1 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </span>
      )}
    </div>
  );
};
