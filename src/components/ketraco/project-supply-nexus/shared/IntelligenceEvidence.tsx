import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface IntelligenceEvidenceProps {
  confidence: number;
  evidence: string;
  source?: string;
  className?: string;
}

export const IntelligenceEvidence: React.FC<IntelligenceEvidenceProps> = ({
  confidence,
  evidence,
  source,
  className = ''
}) => {
  return (
    <div className={`p-2 rounded bg-slate-950/60 border border-purple-500/20 text-xs ${className}`}>
      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
        <span className="flex items-center gap-1 text-purple-300 font-semibold">
          <Sparkles className="w-3 h-3 text-purple-400" />
          AI Grounded Evidence
        </span>
        <span className="text-cyan-400 font-bold">{confidence}% Confidence</span>
      </div>
      <p className="text-slate-300 text-[11px] leading-relaxed italic">
        "{evidence}"
      </p>
      {source && (
        <div className="mt-1 text-[9px] font-mono text-slate-500 flex items-center gap-1">
          <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
          <span>Source: {source}</span>
        </div>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Synchronizing Operational Telemetry...' }) => (
  <div className="flex flex-col items-center justify-center p-8 space-y-3 text-slate-400">
    <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-mono">{message}</span>
  </div>
);

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({ message = 'Failed to load telemetry', onRetry }) => (
  <div className="p-4 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
    <span>{message}</span>
    {onRetry && (
      <button onClick={onRetry} className="px-2 py-1 bg-rose-500/20 hover:bg-rose-500/40 rounded text-[11px] font-mono">
        Retry
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center p-8 border border-dashed border-slate-800 rounded-lg text-slate-500">
    <p className="text-xs font-medium text-slate-400">{title}</p>
    {subtitle && <p className="text-[11px] mt-1">{subtitle}</p>}
  </div>
);

export const DegradedState: React.FC<{ warning: string }> = ({ warning }) => (
  <div className="px-3 py-1.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300 text-[11px] font-mono flex items-center gap-2">
    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
    <span>Degraded Telemetry: {warning}</span>
  </div>
);
