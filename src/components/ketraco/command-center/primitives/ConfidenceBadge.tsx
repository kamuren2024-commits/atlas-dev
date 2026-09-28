import React from 'react';
import { CheckCircle2, ShieldCheck, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

export type ConfidenceTier = 'VERIFIED' | 'HIGH' | 'HIGH_CONFIDENCE' | 'REVIEW' | 'LOW' | 'UNVERIFIED';

interface ConfidenceBadgeProps {
  status: ConfidenceTier;
  score?: number;
  showScore?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export default function ConfidenceBadge({
  status,
  score,
  showScore = true,
  className = '',
  size = 'md'
}: ConfidenceBadgeProps) {
  let label = 'VERIFIED';
  let badgeColor = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40';
  let icon = <CheckCircle2 className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'} />;

  switch (status) {
    case 'VERIFIED':
      label = 'VERIFIED';
      badgeColor = 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.15)]';
      icon = <ShieldCheck className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3 text-emerald-400'} />;
      break;
    case 'HIGH':
    case 'HIGH_CONFIDENCE':
      label = 'HIGH';
      badgeColor = 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.15)]';
      icon = <CheckCircle2 className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3 text-cyan-400'} />;
      break;
    case 'REVIEW':
      label = 'REVIEW';
      badgeColor = 'bg-amber-950/60 text-amber-300 border-amber-500/40';
      icon = <AlertTriangle className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3 text-amber-400'} />;
      break;
    case 'LOW':
      label = 'LOW';
      badgeColor = 'bg-red-950/60 text-red-300 border-red-500/40';
      icon = <AlertCircle className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3 text-red-400'} />;
      break;
    case 'UNVERIFIED':
    default:
      label = 'UNVERIFIED';
      badgeColor = 'bg-slate-900/60 text-slate-400 border-slate-700/40';
      icon = <HelpCircle className={size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3 text-slate-400'} />;
      break;
  }

  const padding = size === 'sm' ? 'px-1.5 py-0.2 text-[9px]' : 'px-2 py-0.5 text-[10px]';

  return (
    <div className={`inline-flex items-center gap-1 font-mono font-semibold rounded border uppercase tracking-wider select-none ${badgeColor} ${padding} ${className}`}>
      {icon}
      <span>{label}</span>
      {showScore && typeof score === 'number' && (
        <span className="opacity-75 font-normal pl-0.5">({score.toFixed(1)}%)</span>
      )}
    </div>
  );
}
