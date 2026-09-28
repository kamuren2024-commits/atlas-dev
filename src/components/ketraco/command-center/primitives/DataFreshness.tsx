import React from 'react';
import { RefreshCw, Radio, AlertCircle } from 'lucide-react';
import { DataFreshness as DataFreshnessType } from '../types';

interface DataFreshnessProps {
  status?: DataFreshnessType;
  deltaSec?: number;
  lastUpdated?: string;
  source?: string;
  className?: string;
  showIcon?: boolean;
}

export default function DataFreshness({
  status = 'LIVE',
  deltaSec = 2,
  lastUpdated,
  source = 'SCADA_EMS',
  className = '',
  showIcon = true
}: DataFreshnessProps) {
  const isLive = status === 'LIVE';
  const isSimulated = status === 'SIMULATION';
  const isStale = status === 'STALE' || status === 'DELAYED';

  let colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]';
  let labelText = `LIVE (${deltaSec}s)`;

  if (isSimulated) {
    colorClasses = 'bg-purple-500/10 text-purple-400 border-purple-500/30';
    dotColor = 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]';
    labelText = 'SIMULATION';
  } else if (isStale) {
    colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
    labelText = `STALE (${deltaSec > 60 ? `${Math.floor(deltaSec / 60)}m` : `${deltaSec}s`})`;
  } else if (status === 'OFFLINE') {
    colorClasses = 'bg-red-500/10 text-red-400 border-red-500/30';
    dotColor = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]';
    labelText = 'OFFLINE';
  }

  return (
    <div 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[10px] font-mono tracking-wider font-semibold uppercase select-none transition-colors ${colorClasses} ${className}`}
      title={`Data Source: ${source} | Timestamp: ${lastUpdated || 'Continuous Stream'}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isLive && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotColor}`}></span>
      </span>
      <span>{labelText}</span>
    </div>
  );
}
