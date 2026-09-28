import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';

export type AtlasKPIStatus =
  | 'HEALTHY'
  | 'WARNING'
  | 'CRITICAL'
  | 'ACTIVE'
  | 'PROCESSING'
  | 'UNKNOWN';

export interface AtlasKPIProps {
  label: string;
  value: string | number;
  unit?: string;
  prefix?: string;
  trendValue?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  trendPositiveIsGood?: boolean;
  status?: AtlasKPIStatus;
  period?: string;
  lastUpdated?: string;
  source?: string;
  sparkline?: number[];
  onClick?: () => void;
  icon?: React.ReactNode;
  compact?: boolean;
}

const statusMeta: Record<AtlasKPIStatus, { icon: any; color: string; bg: string; border: string; text: string }> = {
  HEALTHY: {
    icon: CheckCircle2,
    color: 'text-success-500',
    bg: 'bg-success-500/10',
    border: 'border-success-500/20',
    text: 'HEALTHY',
  },
  WARNING: {
    icon: AlertTriangle,
    color: 'text-warning-500',
    bg: 'bg-warning-500/10',
    border: 'border-warning-500/20',
    text: 'WARNING',
  },
  CRITICAL: {
    icon: AlertOctagon,
    color: 'text-danger-500',
    bg: 'bg-danger-500/10',
    border: 'border-danger-500/20',
    text: 'CRITICAL',
  },
  ACTIVE: {
    icon: Activity,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-500/20',
    text: 'ACTIVE',
  },
  PROCESSING: {
    icon: Loader2,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'PROCESSING',
  },
  UNKNOWN: {
    icon: HelpCircle,
    color: 'text-slate-500',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20',
    text: 'UNKNOWN',
  },
};

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const points = data.map((v, i) => ({ i, v }));
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const normalized = points.map(p => ({ i: p.i, v: ((p.v - min) / range) * 100 }));

  return (
    <div className="atlas-sparkline -mx-1 -my-1">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={normalized} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <Tooltip
            cursor={{ stroke: 'rgba(0,217,255,0.2)', strokeWidth: 1 }}
            contentStyle={{
              background: 'rgba(8,11,20,0.95)',
              border: '1px solid rgba(0,217,255,0.25)',
              borderRadius: 8,
              fontSize: 11,
              color: '#B5C6E0',
              padding: '4px 8px',
            }}
            labelFormatter={() => ''}
            formatter={(v: any) => [Number(v).toFixed(1), '']}
          />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.75}
            dot={false}
            activeDot={{ r: 3, stroke: color, fill: '#070B16' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AtlasKPI({
  label,
  value,
  unit,
  prefix,
  trendValue,
  trendDirection = 'neutral',
  trendPositiveIsGood = true,
  status,
  period,
  lastUpdated,
  source,
  sparkline,
  onClick,
  icon,
  compact = false,
}: AtlasKPIProps) {
  const TrendIcon = trendDirection === 'up' ? TrendingUp : trendDirection === 'down' ? TrendingDown : Minus;
  const actualTrendGood = trendPositiveIsGood ? trendDirection === 'up' : trendDirection === 'down';
  const trendColor =
    trendDirection === 'neutral'
      ? 'text-slate-500'
      : actualTrendGood
      ? 'text-success-500'
      : 'text-danger-500';

  const statusMetaValue = status ? statusMeta[status] : undefined;
  const sparklineColor = status
    ? status === 'HEALTHY' || status === 'ACTIVE'
      ? '#00D9FF'
      : status === 'WARNING'
      ? '#F59E0B'
      : status === 'CRITICAL'
      ? '#EF4444'
      : status === 'PROCESSING'
      ? '#8B5CF6'
      : '#687CA3'
    : '#00D9FF';

  const Wrapper = onClick ? (motion.button as any) : (motion.div as any);

  return (
    <Wrapper
      onClick={onClick}
      whileHover={onClick ? { y: -1 } : undefined}
      className={`atlas-panel w-full text-left relative ${
        compact ? 'p-4' : 'p-5'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-500/20 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-500/20 pointer-events-none" />

      <div className="flex flex-col gap-${compact ? 2.5 : 3} h-full" style={{ gap: compact ? 10 : 12 }}>
        {/* Row 1: label + status */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <span className="text-atlas-label text-slate-400 tracking-widest leading-snug break-words min-w-0 flex-1">
            {icon ? <span className="mr-1.5 align-middle inline-block">{icon}</span> : null}
            {label}
          </span>
          {statusMetaValue && (
            <span
              className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full border ${statusMetaValue.bg} ${statusMetaValue.border} ${statusMetaValue.color}`}
              title={status}
            >
              <statusMetaValue.icon className={`w-3 h-3 ${status === 'PROCESSING' ? 'animate-spin' : ''}`} />
              <span className="text-[10px] font-mono font-bold tracking-wider">{statusMetaValue.text}</span>
            </span>
          )}
        </div>

        {/* Row 2: Value */}
        <div className="flex items-baseline gap-1.5 min-h-[36px]">
          {prefix && <span className="text-atlas-meta text-slate-400 font-medium">{prefix}</span>}
          <span className="tabular-nums font-display text-slate-100 tracking-tight leading-none" style={{ fontSize: compact ? 26 : 30, fontWeight: 500 }}>
            {value}
          </span>
          {unit && <span className="text-atlas-label text-cyan-400 font-semibold">{unit}</span>}
        </div>

        {/* Row 3: Trend */}
        {trendValue && (
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span className="text-[11.5px] font-mono font-semibold">{trendValue}</span>
            {period && <span className="text-[10.5px] font-mono text-slate-400 ml-1">vs {period}</span>}
          </div>
        )}

        {/* Row 4: Sparkline */}
        {sparkline && sparkline.length > 2 && <Sparkline data={sparkline} color={sparklineColor} />}

        {/* Row 5: Provenance meta */}
        {(lastUpdated || source) && (
          <div className="flex items-center justify-between pt-1.5 mt-auto border-t border-slate-800/30 text-[10px] font-mono text-slate-400">
            {source && <span title={`Source: ${source}`} className="truncate max-w-[60%] text-slate-400 font-medium">src · {source}</span>}
            {lastUpdated && <span title={`Updated: ${lastUpdated}`} className="text-slate-400">{lastUpdated}</span>}
          </div>
        )}
      </div>
    </Wrapper>
  );
}

export default AtlasKPI;
