import React from 'react';
import { HealthStatus, SeverityLevel } from '../types';

interface StatusBadgeProps {
  status?: HealthStatus | SeverityLevel | string;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status = 'HEALTHY',
  size = 'md',
  pulse = false
}) => {
  let colorStyles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  let dotColor = 'bg-emerald-400';

  const normalized = status.toUpperCase();

  if (normalized === 'CRITICAL' || normalized === 'HIGH_RISK') {
    colorStyles = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-400';
  } else if (normalized === 'HIGH' || normalized === 'AT_RISK') {
    colorStyles = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (normalized === 'MEDIUM') {
    colorStyles = 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
    dotColor = 'bg-yellow-400';
  } else if (normalized === 'AI_READY' || normalized === 'COGNITIVE') {
    colorStyles = 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    dotColor = 'bg-purple-400';
  } else if (normalized === 'LIVE' || normalized === 'SYSTEM_NOMINAL') {
    colorStyles = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400';
  }

  const padding = size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-bold tracking-wider rounded border ${colorStyles} ${padding}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${pulse ? 'animate-pulse' : ''}`} />
      <span>{status}</span>
    </span>
  );
};
