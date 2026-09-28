import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  CircleDot,
  Circle,
  XCircle,
  HelpCircle,
  MoreHorizontal,
  ShieldCheck,
  ChevronRight,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { AtlasStatusBadge, type AtlasStatus } from './AtlasStatusBadge';

export type AtlasTimelineEventTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'muted'
  | 'processing'
  | 'pending';

export interface AtlasTimelineEvidence {
  id: string;
  label?: string;
  source?: string;
  href?: string;
}

export interface AtlasTimelineEvent {
  id: string;
  tone?: AtlasTimelineEventTone;
  status?: AtlasStatus;
  title: string;
  description?: React.ReactNode;
  timestamp?: string | Date;
  owner?: string;
  ownerRole?: string;
  ownerAvatarInitials?: string;
  duration?: string;
  sla?: string;
  blockers?: string[];
  dependencies?: string[];
  evidence?: AtlasTimelineEvidence[];
  actionLabel?: string;
  onAction?: () => void;
  isLatest?: boolean;
  isPending?: boolean;
  icon?: LucideIcon;
}

export interface AtlasTimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  events: AtlasTimelineEvent[];
  title?: string;
  description?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  alternating?: boolean;
  compact?: boolean;
  density?: 'comfortable' | 'standard' | 'compact';
  showConnectorPulse?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  viewAllLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

const TONE_DOT: Record<AtlasTimelineEventTone, { bg: string; ring: string; Icon: LucideIcon; iconColor: string }> = {
  success:    { bg: 'bg-success-500',   ring: 'ring-success-500/30',   Icon: CheckCircle2, iconColor: 'text-success-400' },
  warning:    { bg: 'bg-warning-500',   ring: 'ring-warning-500/30',   Icon: AlertTriangle, iconColor: 'text-warning-400' },
  danger:     { bg: 'bg-danger-500',    ring: 'ring-danger-500/30',    Icon: XCircle,       iconColor: 'text-danger-400' },
  info:       { bg: 'bg-cyan-400',      ring: 'ring-cyan-500/30',      Icon: ShieldCheck,   iconColor: 'text-cyan-400' },
  muted:      { bg: 'bg-slate-500',     ring: 'ring-slate-500/30',     Icon: Circle,        iconColor: 'text-slate-400' },
  processing: { bg: 'bg-violet-500',    ring: 'ring-violet-500/30',    Icon: CircleDot,     iconColor: 'text-violet-400' },
  pending:    { bg: 'bg-slate-700',     ring: 'ring-slate-700/40',     Icon: Clock,         iconColor: 'text-slate-500' },
};

function formatStamp(ts?: string | Date): { datetime: string | null; label: string | null } {
  if (!ts) return { datetime: null, label: null };
  try {
    const d = typeof ts === 'string' ? new Date(ts) : ts;
    if (Number.isNaN(d.getTime())) return { datetime: null, label: null };
    const iso = d.toISOString();
    const label = d.toLocaleString(undefined, {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    return { datetime: iso, label };
  } catch {
    return { datetime: null, label: null };
  }
}

function inferTone(e: AtlasTimelineEvent): AtlasTimelineEventTone {
  if (e.tone) return e.tone;
  if (e.isPending) return 'pending';
  if (!e.status) return 'muted';
  const s = String(e.status).toUpperCase();
  if (/(COMPLETED|SUCCESS|RESOLVED|APPROVED|CLEARED|HEALTHY|SYNCED|READY)/.test(s)) return 'success';
  if (/(IN_PROGRESS|PROCESSING|RUNNING|REVIEW|INGESTING|VALIDATION|EXECUTING)/.test(s)) return 'processing';
  if (/(PENDING|QUEUED|SCHEDULED|WAITING|INITIATED|DRAFT)/.test(s)) return 'pending';
  if (/(WARN|DEGRADED|SLOW|OVERDUE|AT_RISK|DELAYED|BLOCKED)/.test(s)) return 'warning';
  if (/(FAIL|ERROR|REJECTED|CANCELLED|CRITICAL|UNRESOLVED|STALE)/.test(s)) return 'danger';
  if (/(INFO|DETECTED|OBSERVED|NOTICE)/.test(s)) return 'info';
  return 'muted';
}

export function AtlasTimeline({
  events,
  title,
  description,
  emptyTitle = 'No activity yet',
  emptyDescription = 'Activity, decisions and workflow events will appear here as they occur.',
  alternating = true,
  compact = false,
  density = 'standard',
  showConnectorPulse = true,
  maxItems,
  onViewAll,
  viewAllLabel = 'View all activity',
  className = '',
  style,
  ...rest
}: AtlasTimelineProps) {
  const items = React.useMemo(() => {
    const arr = Array.isArray(events) ? events : [];
    return maxItems !== undefined && arr.length > maxItems ? arr.slice(0, maxItems) : arr;
  }, [events, maxItems]);

  const hasMore = maxItems !== undefined && Array.isArray(events) && events.length > maxItems;
  const isEmpty = items.length === 0;

  const densityGap =
    density === 'compact' ? 'gap-3' : density === 'comfortable' ? 'gap-7' : 'gap-5';
  const densityPad =
    density === 'compact' ? 'pl-9 sm:pl-0' : density === 'comfortable' ? 'pl-11 sm:pl-0' : 'pl-10 sm:pl-0';

  return (
    <section
      aria-label={title ?? 'Activity timeline'}
      className={`atlas-panel p-5 ${className}`}
      style={style}
      {...(rest as any)}
    >
      {(title || description) && (
        <header className="flex items-start justify-between gap-3 mb-5 pb-4 border-b border-slate-800/40">
          <div className="min-w-0">
            {title && (
              <h3 className="text-atlas-card-heading text-slate-100 leading-tight">{title}</h3>
            )}
            {description && (
              <p className="text-atlas-body-sm text-slate-500 mt-1">{description}</p>
            )}
          </div>
          {hasMore && onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-atlas-body-sm text-cyan-300 hover:text-cyan-200 hover:bg-cyan-950/40 border border-cyan-500/20 transition-colors atlas-focus"
            >
              {viewAllLabel}
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </header>
      )}

      {isEmpty ? (
        <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
          <div
            aria-hidden="true"
            className="w-11 h-11 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-center mb-1"
          >
            <MoreHorizontal className="w-5 h-5 text-slate-600" />
          </div>
          <p className="text-atlas-card-heading text-slate-300">{emptyTitle}</p>
          <p className="text-atlas-body-sm text-slate-500 max-w-sm">{emptyDescription}</p>
        </div>
      ) : (
        <ol
          role="list"
          className={`relative ${densityGap} ${
            alternating ? 'sm:[counter-reset:tl]' : ''
          }`}
        >
          {/* Central connector (only on desktop when alternating) */}
          {alternating && (
            <span
              aria-hidden="true"
              className="absolute left-4 sm:left-1/2 top-1 bottom-1 w-px -translate-x-1/2 bg-gradient-to-b from-slate-700/0 via-slate-700/70 to-slate-700/0"
            />
          )}

          {items.map((ev, idx) => {
            const tone = inferTone(ev);
            const dot = TONE_DOT[tone];
            const EventIcon = ev.icon ?? dot.Icon;
            const stamp = formatStamp(ev.timestamp);
            const rightSide = alternating && idx % 2 === 1;
            const isLast = idx === items.length - 1;
            const latestClass = ev.isLatest && showConnectorPulse ? 'atlas-dot-pulse' : '';
            const stack = density === 'compact' ? 'py-0.5' : density === 'comfortable' ? 'py-2' : 'py-1';

            return (
              <motion.li
                key={ev.id}
                initial={false}
                transition={{ type: 'spring', stiffness: 240, damping: 26, mass: 0.6 }}
                className={`relative ${densityPad} ${stack} ${
                  alternating
                    ? 'sm:grid sm:grid-cols-2 sm:gap-10 sm:pl-0 sm:w-full'
                    : ''
                }`}
              >
                {/* Dot */}
                <span
                  aria-hidden="true"
                  className={`absolute top-1.5 left-0 sm:left-1/2 sm:-translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center ring-4 ${dot.ring} bg-slate-950 z-10 ${latestClass}`}
                >
                  <span
                    className={`absolute inset-1 rounded-full ${dot.bg} ${
                      tone === 'processing' ? 'atlas-dot-pulse' : ''
                    }`}
                  />
                  <EventIcon
                    className={`relative w-3.5 h-3.5 ${dot.iconColor}`}
                    strokeWidth={2.5}
                  />
                </span>

                {/* Alternating layout: when rightSide true, left col is spacer */}
                {alternating && rightSide && (
                  <div className="hidden sm:block" aria-hidden="true" />
                )}

                {/* Content card */}
                <div
                  className={`relative rounded-xl border border-slate-800/70 bg-slate-900/30 ${
                    ev.isLatest ? 'ring-1 ring-cyan-500/20' : ''
                  } ${compact ? 'px-3.5 py-3' : 'px-4 py-3.5'} sm:mb-0`}
                >
                  {/* Corner hairlines */}
                  <span aria-hidden="true" className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-slate-700/40 pointer-events-none rounded-tr-xl" />
                  <span aria-hidden="true" className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-slate-700/40 pointer-events-none rounded-bl-xl" />

                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <h4 className="text-atlas-body text-slate-100 font-medium truncate">
                        {ev.title}
                      </h4>
                      {ev.status && (
                        <AtlasStatusBadge status={ev.status} size="xs" />
                      )}
                    </div>
                    {stamp.label && (
                      <time
                        dateTime={stamp.datetime ?? undefined}
                        className="shrink-0 text-atlas-meta text-slate-500 tabular-nums whitespace-nowrap"
                      >
                        {stamp.label}
                      </time>
                    )}
                  </div>

                  {ev.description && (
                    <div className="text-atlas-body-sm text-slate-400 leading-relaxed mb-3">
                      {ev.description}
                    </div>
                  )}

                  {/* Owner + duration/SLA row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-2 text-atlas-meta text-slate-500">
                    {ev.owner && (
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          aria-hidden="true"
                          className={`w-6 h-6 rounded-full border border-slate-700 bg-slate-800/80 flex items-center justify-center text-[10px] font-semibold ${dot.iconColor} shrink-0`}
                        >
                          {ev.ownerAvatarInitials ??
                            ev.owner
                              .split(/\s+/)
                              .map((w) => w[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase() ??
                            '??'}
                        </span>
                        <span className="text-slate-300 truncate">{ev.owner}</span>
                        {ev.ownerRole && (
                          <span className="text-slate-500">· {ev.ownerRole}</span>
                        )}
                      </div>
                    )}
                    {ev.duration && (
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3 h-3" aria-hidden="true" />
                        Duration: <span className="text-slate-300 tabular-nums">{ev.duration}</span>
                      </span>
                    )}
                    {ev.sla && (
                      <span className="inline-flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" aria-hidden="true" />
                        SLA: <span className="text-slate-300 tabular-nums">{ev.sla}</span>
                      </span>
                    )}
                  </div>

                  {/* Blockers + dependencies */}
                  {(ev.blockers && ev.blockers.length > 0) ||
                  (ev.dependencies && ev.dependencies.length > 0) ? (
                    <div className="mb-3 space-y-1.5">
                      {ev.blockers && ev.blockers.length > 0 && (
                        <div className="flex flex-wrap items-start gap-2">
                          <span className="text-atlas-micro-label uppercase tracking-wider text-[10px] font-semibold text-danger-400 shrink-0 pt-0.5">
                            BLOCKERS
                          </span>
                          <ul className="flex flex-wrap gap-1.5" role="list">
                            {ev.blockers.map((b, i) => (
                              <li
                                key={i}
                                className="px-2 py-0.5 rounded-md border border-danger-500/20 bg-danger-950/30 text-atlas-body-sm text-danger-300"
                              >
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {ev.dependencies && ev.dependencies.length > 0 && (
                        <div className="flex flex-wrap items-start gap-2">
                          <span className="text-atlas-micro-label uppercase tracking-wider text-[10px] font-semibold text-slate-500 shrink-0 pt-0.5">
                            DEPENDS
                          </span>
                          <ul className="flex flex-wrap gap-1.5" role="list">
                            {ev.dependencies.map((d, i) => (
                              <li
                                key={i}
                                className="px-2 py-0.5 rounded-md border border-slate-700/60 bg-slate-800/40 text-atlas-body-sm text-slate-300"
                              >
                                {d}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* Evidence */}
                  {ev.evidence && ev.evidence.length > 0 && (
                    <div className="mb-3">
                      <ul className="flex flex-wrap gap-1.5" role="list">
                        {ev.evidence.map((e) => (
                          <li key={e.id}>
                            <a
                              href={e.href ?? '#'}
                              onClick={(ev_) => {
                                if (!e.href) ev_.preventDefault();
                              }}
                              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md border border-slate-700/60 bg-slate-800/30 hover:bg-slate-800/60 hover:border-slate-600/70 transition-colors text-atlas-meta text-slate-300 atlas-focus"
                              aria-label={`Evidence ${e.id}${e.label ? `: ${e.label}` : ''}`}
                            >
                              <FileText className="w-3 h-3 text-slate-500 shrink-0" aria-hidden="true" />
                              <span className="truncate max-w-[160px]">
                                {e.label ?? e.id}
                              </span>
                              {e.source && (
                                <span className="text-atlas-micro-label text-slate-500 uppercase tracking-wider text-[10px]">
                                  · {e.source}
                                </span>
                              )}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action */}
                  {ev.actionLabel && ev.onAction && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={ev.onAction}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-cyan-500/20 bg-cyan-950/30 hover:bg-cyan-950/50 text-cyan-300 hover:text-cyan-200 text-atlas-body-sm transition-colors atlas-focus"
                      >
                        {ev.actionLabel}
                        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Alternating spacer on left-side cards */}
                {alternating && !rightSide && (
                  <div className="hidden sm:block" aria-hidden="true" />
                )}

                {/* Vertical connector within card span */}
                {!isLast && !alternating && (
                  <span
                    aria-hidden="true"
                    className="absolute left-4 top-10 bottom-0 w-px bg-slate-800/70"
                  />
                )}
              </motion.li>
            );
          })}
        </ol>
      )}

      {hasMore && !onViewAll && (
        <div className="mt-5 pt-4 border-t border-slate-800/40 flex items-center justify-between text-atlas-body-sm text-slate-500">
          <span>
            Showing {items.length} of {events.length} events
          </span>
        </div>
      )}
    </section>
  );
}

export default AtlasTimeline;
