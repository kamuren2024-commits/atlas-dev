import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Activity,
  Loader2,
  HelpCircle,
  Minus,
  Zap,
  Eye,
  Lock,
  FileCheck,
  ShieldAlert,
  Network,
} from 'lucide-react';

export type AtlasStatus =
  | 'HEALTHY' | 'OK' | 'SUCCESS' | 'PASS' | 'APPROVED' | 'ONLINE' | 'COMPLETED' | 'SYNCED' | 'ACTIVE' | 'LIVE' | 'CONNECTED'
  | 'WARNING' | 'MONITOR' | 'REVIEW' | 'DEGRADED' | 'PENDING' | 'PARTIAL' | 'STALE'
  | 'CRITICAL' | 'FAIL' | 'ERROR' | 'OFFLINE' | 'REJECTED' | 'FAILED' | 'BLOCKED'
  | 'PROCESSING' | 'INGESTING' | 'VALIDATING' | 'LOADING' | 'SYNCING' | 'RUNNING'
  | 'DRAFT' | 'UNKNOWN' | 'UNAVAILABLE' | 'UNRESOLVED'
  | 'CANCELLED' | 'ARCHIVED';

export interface AtlasStatusBadgeProps {
  status: AtlasStatus | string;
  label?: string;
  showDot?: boolean;
  pulse?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  icon?: React.ReactNode;
}

type StatusDef = {
  color: string;
  bg: string;
  border: string;
  dot: string;
  Icon: any;
  displayLabel: string;
  tone: 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'processing';
};

function getStatusDef(status: AtlasStatus | string, label?: string): StatusDef {
  const s = String(status).toUpperCase();

  // SUCCESS / HEALTHY / ONLINE
  if (['HEALTHY', 'OK', 'SUCCESS', 'PASS', 'APPROVED', 'ONLINE', 'COMPLETED', 'SYNCED', 'ACTIVE', 'LIVE', 'CONNECTED'].includes(s)) {
    return {
      color: 'text-success-500',
      bg: 'bg-success-500/10',
      border: 'border-success-500/25',
      dot: 'bg-success-500',
      Icon: CheckCircle2,
      displayLabel: label || (s === 'OK' ? 'OK' : s === 'PASS' ? 'PASS' : s),
      tone: 'success',
    };
  }

  // WARNING / PENDING
  if (['WARNING', 'MONITOR', 'REVIEW', 'DEGRADED', 'PENDING', 'PARTIAL', 'STALE'].includes(s)) {
    return {
      color: 'text-warning-500',
      bg: 'bg-warning-500/10',
      border: 'border-warning-500/25',
      dot: 'bg-warning-500',
      Icon: AlertTriangle,
      displayLabel: label || s,
      tone: 'warning',
    };
  }

  // CRITICAL / FAILED
  if (['CRITICAL', 'FAIL', 'ERROR', 'OFFLINE', 'REJECTED', 'FAILED', 'BLOCKED', 'CANCELLED'].includes(s)) {
    return {
      color: 'text-danger-500',
      bg: 'bg-danger-500/10',
      border: 'border-danger-500/25',
      dot: 'bg-danger-500',
      Icon: AlertOctagon,
      displayLabel: label || s,
      tone: 'danger',
    };
  }

  // PROCESSING / IN FLIGHT
  if (['PROCESSING', 'INGESTING', 'VALIDATING', 'LOADING', 'SYNCING', 'RUNNING'].includes(s)) {
    return {
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/25',
      dot: 'bg-violet-400',
      Icon: Loader2,
      displayLabel: label || s,
      tone: 'processing',
    };
  }

  // ARCHIVED
  if (s === 'ARCHIVED') {
    return {
      color: 'text-slate-500',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/25',
      dot: 'bg-slate-500',
      Icon: Minus,
      displayLabel: label || 'ARCHIVED',
      tone: 'muted',
    };
  }

  // DRAFT
  if (s === 'DRAFT') {
    return {
      color: 'text-slate-400',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/25',
      dot: 'bg-slate-400',
      Icon: Eye,
      displayLabel: label || 'DRAFT',
      tone: 'muted',
    };
  }

  // UNKNOWN / UNAVAILABLE / UNRESOLVED
  if (['UNKNOWN', 'UNAVAILABLE', 'UNRESOLVED'].includes(s)) {
    return {
      color: 'text-slate-500',
      bg: 'bg-slate-500/10',
      border: 'border-slate-500/25',
      dot: 'bg-slate-500',
      Icon: HelpCircle,
      displayLabel: label || s,
      tone: 'muted',
    };
  }

  // FALLBACK — custom status, style as info/cyan
  return {
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/25',
    dot: 'bg-cyan-400',
    Icon: Activity,
    displayLabel: label || String(status),
    tone: 'info',
  };
}

export function AtlasStatusBadge({
  status,
  label,
  showDot = true,
  pulse = false,
  size = 'sm',
  className = '',
  icon,
}: AtlasStatusBadgeProps) {
  const def = getStatusDef(status, label);
  const { Icon } = def;
  const isProcessing = def.tone === 'processing';
  const py = size === 'xs' ? 'py-[1px]' : size === 'sm' ? 'py-0.5' : 'py-1';
  const px = size === 'xs' ? 'px-1.5' : size === 'sm' ? 'px-2' : 'px-2.5';

  const gap = size === 'xs' ? 'gap-1' : 'gap-1.5';
  const dotWrap = size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`inline-flex items-center ${gap} ${px} ${py} rounded-md border ${def.bg} ${def.border} ${def.color} atlas-focus ${className}`}
      role="status"
      aria-label={`Status: ${def.displayLabel}`}
    >
      {showDot && (
        <span
          className={`relative inline-flex items-center justify-center ${dotWrap}`}
          aria-hidden="true"
        >
          <span className={`atlas-dot ${def.dot} ${pulse ? 'atlas-dot-pulse' : ''}`} style={{ color: 'currentColor' }} />
        </span>
      )}
      {icon || (isProcessing && size !== 'xs' && size !== 'sm' ? <Icon className={`w-3 h-3 ${isProcessing ? 'animate-spin' : ''}`} aria-hidden="true" /> : null)}
      <span className={`${size === 'xs' ? 'text-[9.5px]' : size === 'sm' ? 'text-[10.5px]' : 'text-[11.5px]'} font-mono font-bold uppercase tracking-wider leading-none`}>
        {def.displayLabel}
      </span>
    </span>
  );
}

/* ----------------- Quick access convenience badges ----------------- */

export function AtlasHealthBadge({ healthy, label }: { healthy: boolean | null; label?: string }) {
  if (healthy === null || healthy === undefined)
    return <AtlasStatusBadge status="UNKNOWN" label={label} />;
  return (
    <AtlasStatusBadge
      status={healthy ? 'HEALTHY' : 'CRITICAL'}
      pulse={healthy}
      label={label}
    />
  );
}

export default AtlasStatusBadge;
