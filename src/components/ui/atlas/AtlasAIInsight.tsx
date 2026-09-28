import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Lightbulb,
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { AtlasButton } from './AtlasButton';
import { AtlasStatusBadge, type AtlasStatus } from './AtlasStatusBadge';

export type AtlasAIInsightKind = 'insight' | 'recommendation' | 'explanation' | 'warning' | 'detection';

export interface AtlasAIEvidenceRef {
  id: string;
  label?: string;
  source?: string;
  href?: string;
}

export interface AtlasAIInsightProps extends React.HTMLAttributes<HTMLDivElement> {
  kind?: AtlasAIInsightKind;
  title?: string;
  headline?: string;
  summary?: string;
  body?: React.ReactNode;
  drivers?: Array<{ label: string; value?: string; severity?: AtlasStatus | 'primary' | 'muted' }>;
  confidence?: number;
  confidenceBand?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNCERTAIN';
  evidenceCount?: number;
  evidence?: AtlasAIEvidenceRef[];
  sourceSystem?: string;
  modelId?: string;
  generatedAt?: string | Date;
  status?: AtlasStatus;
  onInvestigate?: () => void;
  onViewEvidence?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  investigateLabel?: string;
  evidenceLabel?: string;
  compact?: boolean;
  glow?: boolean;
  tone?: 'violet' | 'cyan' | 'success' | 'warning' | 'danger';
  className?: string;
  style?: React.CSSProperties;
}

const KIND_META: Record<AtlasAIInsightKind, { label: string; Icon: LucideIcon; tone: NonNullable<AtlasAIInsightProps['tone']> }> = {
  insight: { label: 'AI INSIGHT', Icon: Sparkles, tone: 'violet' },
  recommendation: { label: 'AI RECOMMENDATION', Icon: Lightbulb, tone: 'cyan' },
  explanation: { label: 'AI EXPLANATION', Icon: BookOpen, tone: 'cyan' },
  warning: { label: 'AI WARNING', Icon: AlertTriangle, tone: 'warning' },
  detection: { label: 'AI DETECTION', Icon: ShieldCheck, tone: 'success' },
};

const TONE_ACCENT: Record<NonNullable<AtlasAIInsightProps['tone']>, { bar: string; ring: string; chipBg: string; chipText: string; chipBorder: string; glow: string }> = {
  violet: {
    bar: 'bg-violet-500',
    ring: 'border-violet-500/30',
    chipBg: 'bg-violet-950/50',
    chipText: 'text-violet-300',
    chipBorder: 'border-violet-500/20',
    glow: 'shadow-[0_0_60px_-20px_rgba(139,92,246,0.55)]',
  },
  cyan: {
    bar: 'bg-cyan-400',
    ring: 'border-cyan-500/30',
    chipBg: 'bg-cyan-950/50',
    chipText: 'text-cyan-300',
    chipBorder: 'border-cyan-500/20',
    glow: 'shadow-[0_0_60px_-20px_rgba(34,211,238,0.55)]',
  },
  success: {
    bar: 'bg-success-500',
    ring: 'border-success-500/30',
    chipBg: 'bg-success-950/40',
    chipText: 'text-success-300',
    chipBorder: 'border-success-500/20',
    glow: 'shadow-[0_0_60px_-20px_rgba(34,197,94,0.45)]',
  },
  warning: {
    bar: 'bg-warning-500',
    ring: 'border-warning-500/30',
    chipBg: 'bg-warning-950/40',
    chipText: 'text-warning-300',
    chipBorder: 'border-warning-500/20',
    glow: 'shadow-[0_0_60px_-20px_rgba(234,179,8,0.45)]',
  },
  danger: {
    bar: 'bg-danger-500',
    ring: 'border-danger-500/30',
    chipBg: 'bg-danger-950/40',
    chipText: 'text-danger-300',
    chipBorder: 'border-danger-500/20',
    glow: 'shadow-[0_0_60px_-20px_rgba(239,68,68,0.5)]',
  },
};

function formatConfidence(val?: number): string | null {
  if (val === undefined || val === null || Number.isNaN(val)) return null;
  const clamped = Math.max(0, Math.min(1, val));
  return `${Math.round(clamped * 100)}%`;
}

function formatTs(ts?: string | Date): string | null {
  if (!ts) return null;
  try {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return null;
  }
}

export function AtlasAIInsight({
  kind = 'insight',
  title,
  headline,
  summary,
  body,
  drivers,
  confidence,
  confidenceBand,
  evidenceCount,
  evidence,
  sourceSystem,
  modelId,
  generatedAt,
  status,
  onInvestigate,
  onViewEvidence,
  onAction,
  actionLabel = 'Take Action',
  investigateLabel = 'Investigate',
  evidenceLabel = 'View Evidence',
  compact = false,
  glow = true,
  tone,
  className = '',
  style,
  ...rest
}: AtlasAIInsightProps) {
  const meta = KIND_META[kind];
  const effectiveTone = tone ?? meta.tone;
  const t = TONE_ACCENT[effectiveTone];
  const { Icon } = meta;
  const hasEvidence = evidenceCount !== undefined || (evidence && evidence.length > 0);
  const hasConfidence = confidence !== undefined || confidenceBand !== undefined;
  const hasProvenance = sourceSystem || modelId || generatedAt;
  const hasDrivers = Array.isArray(drivers) && drivers.length > 0;
  const hasActions = onInvestigate || onViewEvidence || onAction;
  const formattedConf = formatConfidence(confidence);
  const formattedAt = formatTs(generatedAt);
  const pad = compact ? 'p-3.5 sm:p-4' : 'p-5 sm:p-6';

  return (
    <motion.article
      initial={false}
      whileHover={glow ? { y: -1 } : undefined}
      role="article"
      aria-label={`${meta.label}${title ? `: ${title}` : ''}`}
      className={`relative atlas-panel ${pad} ${glow ? t.glow : ''} ${className}`}
      style={style}
      {...(rest as any)}
    >
      {/* Left accent bar (AI identity) */}
      <span
        aria-hidden="true"
        className={`absolute inset-y-0 left-0 w-[3px] ${t.bar} rounded-l-lg`}
        style={{ boxShadow: `0 0 14px -2px currentColor` }}
      />

      {/* Corner hairlines */}
      <span aria-hidden="true" className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-slate-700/40 pointer-events-none" />
      <span aria-hidden="true" className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-slate-700/40 pointer-events-none" />

      {/* Header: kind chip + status */}
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-lg border ${t.chipBorder} ${t.chipBg} flex items-center justify-center shrink-0`}
            aria-hidden="true"
          >
            <Icon className={`w-4.5 h-4.5 ${t.chipText}`} strokeWidth={2} />
          </div>
          <div className="flex flex-col gap-1">
            <span className={`text-atlas-micro-label uppercase tracking-[0.14em] font-semibold ${t.chipText}`}>
              {meta.label}
            </span>
            {title && <h3 className="text-atlas-card-heading text-slate-100 leading-tight">{title}</h3>}
          </div>
        </div>
        {status && (
          <div className="shrink-0">
            <AtlasStatusBadge status={status} size="sm" />
          </div>
        )}
      </header>

      {/* Headline */}
      {headline && (
        <p className="text-atlas-h3 text-slate-100 leading-snug mb-3">{headline}</p>
      )}

      {/* Summary */}
      {summary && (
        <p className="text-atlas-body text-slate-300 leading-relaxed mb-4">{summary}</p>
      )}

      {/* Free-form body */}
      {body && <div className="mb-4">{body}</div>}

      {/* Primary drivers */}
      {hasDrivers && (
        <div className="mb-4 space-y-2">
          <div className="text-atlas-label text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
            Primary Drivers
          </div>
          <ul className="space-y-1.5" role="list">
            {drivers!.map((d, i) => {
              const isStatus = d.severity && d.severity !== 'primary' && d.severity !== 'muted';
              return (
                <li
                  key={i}
                  className="flex items-center justify-between gap-3 pl-3 border-l border-slate-700/60 py-0.5"
                >
                  <span className="text-atlas-body-sm text-slate-200">{d.label}</span>
                  {d.value !== undefined && (
                    isStatus ? (
                      <AtlasStatusBadge status={d.severity as AtlasStatus} label={d.value} size="sm" />
                    ) : (
                      <span
                        className={`text-atlas-body-sm font-medium tabular-nums ${
                          d.severity === 'primary' ? t.chipText : 'text-slate-300'
                        }`}
                      >
                        {d.value}
                      </span>
                    )
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Metadata: confidence + evidence + provenance */}
      {(hasConfidence || hasEvidence || hasProvenance) && (
        <dl
          className={`grid gap-x-5 gap-y-2 mb-4 border-t border-slate-800/40 pt-4 ${
            compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'
          }`}
        >
          {hasConfidence && (
            <div className="min-w-0">
              <dt className="text-atlas-micro-label text-slate-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">
                Confidence
              </dt>
              <dd className="flex items-baseline gap-2 flex-wrap">
                {formattedConf && (
                  <span className={`text-atlas-kpi-sm font-semibold tabular-nums ${t.chipText}`}>
                    {formattedConf}
                  </span>
                )}
                {confidenceBand && (
                  <span className="text-atlas-meta text-slate-300 font-medium">{confidenceBand}</span>
                )}
                {!formattedConf && !confidenceBand && (
                  <span className="text-atlas-meta text-slate-400">—</span>
                )}
              </dd>
            </div>
          )}

          {hasEvidence && (
            <div className="min-w-0">
              <dt className="text-atlas-micro-label text-slate-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">
                Evidence
              </dt>
              <dd className="flex items-baseline gap-2 flex-wrap">
                {evidenceCount !== undefined && (
                  <span className="text-atlas-kpi-sm font-semibold tabular-nums text-slate-100">
                    {evidenceCount}
                  </span>
                )}
                {evidenceCount !== undefined && (
                  <span className="text-atlas-meta text-slate-400">records</span>
                )}
                {evidence && evidence.length > 0 && (
                  <span className="text-atlas-meta text-slate-400">
                    · {evidence.length} cited
                  </span>
                )}
                {evidenceCount === undefined && (!evidence || evidence.length === 0) && (
                  <span className="text-atlas-meta text-slate-400">—</span>
                )}
              </dd>
            </div>
          )}

          {hasProvenance && (
            <div className="min-w-0 sm:col-span-1 col-span-2">
              <dt className="text-atlas-micro-label text-slate-400 uppercase tracking-wider text-[10px] font-semibold mb-0.5">
                Provenance
              </dt>
              <dd className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-atlas-meta text-slate-300">
                {sourceSystem && (
                  <>
                    <span className="shrink-0 text-slate-400">Source:</span>
                    <span className="text-slate-200 font-medium">{sourceSystem}</span>
                  </>
                )}
                {modelId && (
                  <>
                    {sourceSystem && <span className="text-slate-500">·</span>}
                    <span className="font-mono text-[11px] text-slate-300 font-medium">{modelId}</span>
                  </>
                )}
                {formattedAt && (
                  <>
                    {(sourceSystem || modelId) && <span className="text-slate-500">·</span>}
                    <time dateTime={typeof generatedAt === 'string' ? generatedAt : generatedAt?.toISOString()} className="text-slate-300">
                      {formattedAt}
                    </time>
                  </>
                )}
              </dd>
            </div>
          )}
        </dl>
      )}

      {/* Evidence refs */}
      {evidence && evidence.length > 0 && !compact && (
        <div className="mb-4 border-t border-slate-800/40 pt-4">
          <div className="text-atlas-label text-slate-500 uppercase tracking-wider text-[11px] font-semibold mb-2">
            Cited Evidence
          </div>
          <ul className="grid gap-1.5 sm:grid-cols-2" role="list">
            {evidence.map((e) => (
              <li key={e.id}>
                <a
                  href={e.href ?? '#'}
                  onClick={(ev) => {
                    if (!e.href) ev.preventDefault();
                  }}
                  className="group flex items-center gap-2 px-3 py-2 rounded-md border border-slate-800/60 bg-slate-900/30 hover:bg-slate-800/40 hover:border-slate-700/60 transition-colors text-atlas-body-sm"
                  aria-label={`Evidence ${e.id}${e.label ? `: ${e.label}` : ''}`}
                >
                  <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate text-slate-300 group-hover:text-slate-100">
                    {e.label ?? e.id}
                  </span>
                  {e.source && (
                    <span className="ml-auto shrink-0 text-atlas-micro-label text-slate-500 uppercase tracking-wider text-[10px]">
                      {e.source}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      {hasActions && (
        <footer
          className={`flex flex-wrap items-center gap-2 border-t border-slate-800/40 pt-4 ${
            compact ? 'pt-3' : ''
          }`}
        >
          {onAction && (
            <AtlasButton
              variant="primary"
              size={compact ? 'sm' : 'md'}
              onClick={onAction}
              tone={effectiveTone === 'warning' || effectiveTone === 'danger' ? undefined : 'cyan'}
              iconRight={ChevronRight}
            >
              {actionLabel}
            </AtlasButton>
          )}
          {onInvestigate && (
            <AtlasButton
              variant="secondary"
              size={compact ? 'sm' : 'md'}
              onClick={onInvestigate}
              iconRight={ChevronRight}
            >
              {investigateLabel}
            </AtlasButton>
          )}
          {onViewEvidence && hasEvidence && (
            <AtlasButton
              variant="ghost"
              size={compact ? 'sm' : 'md'}
              onClick={onViewEvidence}
            >
              {evidenceLabel}
            </AtlasButton>
          )}
        </footer>
      )}
    </motion.article>
  );
}

export default AtlasAIInsight;
