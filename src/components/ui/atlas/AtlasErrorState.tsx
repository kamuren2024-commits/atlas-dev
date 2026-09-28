import React from 'react';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  Bug,
  ArrowRight,
  RotateCcw,
  MessageSquareWarning,
} from 'lucide-react';
import AtlasButton from './AtlasButton';

export type AtlasErrorTone = 'warning' | 'critical' | 'info';

export interface AtlasErrorStateProps {
  tone?: AtlasErrorTone;
  title?: string;
  message?: string;
  error?: unknown;
  operationLabel?: string;
  onRetry?: () => void;
  retryLoading?: boolean;
  onReport?: () => void;
  lastKnownGood?: React.ReactNode;
  details?: string;
  compact?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const toneMeta: Record<AtlasErrorTone, {
  Icon: any;
  iconColor: string;
  ring: string;
  bg: string;
  defaultTitle: string;
  defaultMessage: string;
}> = {
  warning: {
    Icon: AlertTriangle,
    iconColor: 'text-warning-500',
    ring: 'border-warning-500/30',
    bg: 'bg-warning-500/5',
    defaultTitle: 'Warning',
    defaultMessage: 'This operation encountered a problem. Retrying may resolve the issue.',
  },
  critical: {
    Icon: AlertOctagon,
    iconColor: 'text-danger-500',
    ring: 'border-danger-500/30',
    bg: 'bg-danger-500/5',
    defaultTitle: 'Unable to load',
    defaultMessage: 'A critical error prevented this intelligence surface from loading. The underlying service may be unavailable.',
  },
  info: {
    Icon: MessageSquareWarning,
    iconColor: 'text-info-500',
    ring: 'border-info-500/30',
    bg: 'bg-info-500/5',
    defaultTitle: 'Notice',
    defaultMessage: 'This operation could not complete. Review the details below.',
  },
};

export function AtlasErrorState({
  tone = 'critical',
  title,
  message,
  error,
  operationLabel,
  onRetry,
  retryLoading = false,
  onReport,
  lastKnownGood,
  details,
  compact = false,
  children,
  className = '',
}: AtlasErrorStateProps) {
  const meta = toneMeta[tone];
  const resolvedTitle = title ?? (operationLabel ? `Unable to ${operationLabel}` : meta.defaultTitle);

  const sanitizedDetails = details
    ? details
    : error instanceof Error
    ? error.message
    : typeof error === 'string'
    ? error
    : undefined;

  return (
    <div className={className}>
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`relative rounded-xl border ${meta.ring} ${meta.bg} backdrop-blur-sm ${
          compact ? 'px-4 py-4' : 'px-5 sm:px-7 py-6 sm:py-8'
        } overflow-hidden`}
        role="alert"
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div
            className={`w-12 h-12 shrink-0 rounded-xl border ${meta.ring} bg-atlas-bg-panel/60 flex items-center justify-center ${meta.iconColor} shadow-[0_0_24px_rgba(0,0,0,0.2)]`}
            aria-hidden="true"
          >
            <meta.Icon className="w-6 h-6" />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`${compact ? 'text-atlas-h4' : 'text-atlas-h3'} text-slate-100 mb-1.5`}>
              {resolvedTitle}
            </h3>
            <p className="text-atlas-body-sm text-slate-400 mb-4 leading-relaxed">
              {message ?? meta.defaultMessage}
            </p>

            {sanitizedDetails && (
              <details className={`rounded-lg border ${meta.ring} bg-atlas-bg-panel/40 text-left mb-4 atlas-focus`}>
                <summary className="cursor-pointer px-3 py-2 text-[11.5px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 atlas-focus select-none">
                  <span className="inline-flex items-center gap-2">
                    <MessageSquareWarning className="w-3.5 h-3.5" />
                    Technical Details
                  </span>
                </summary>
                <pre className="px-3 pb-3 text-[11px] font-mono text-slate-500 whitespace-pre-wrap break-words max-h-56 overflow-y-auto">
                  {sanitizedDetails}
                </pre>
              </details>
            )}

            {children}

            <div className="flex flex-wrap items-center gap-2 mt-4">
              {onRetry && (
                <AtlasButton
                  variant={tone === 'critical' ? 'outline' : 'secondary'}
                  onClick={onRetry}
                  loading={retryLoading}
                  icon={RefreshCw}
                >
                  Retry
                </AtlasButton>
              )}
              {onReport && (
                <AtlasButton variant="ghost" onClick={onReport} icon={Bug}>
                  Report issue
                </AtlasButton>
              )}
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <span className="absolute top-0 right-0 w-2 h-2 border-t border-r ${meta.ring} opacity-60" aria-hidden="true" />
        <span className="absolute bottom-0 left-0 w-2 h-2 border-b border-l ${meta.ring} opacity-60" aria-hidden="true" />
      </motion.div>

      {lastKnownGood && (
        <div className="mt-4 rounded-xl border border-slate-800/60 bg-atlas-bg-sunken/30 overflow-hidden">
          <div className="px-4 py-2 border-b border-slate-800/50 flex items-center gap-2 text-atlas-meta text-slate-500">
            <RotateCcw className="w-3.5 h-3.5" />
            Last known state — loaded prior to error
          </div>
          <div className="opacity-80">{lastKnownGood}</div>
        </div>
      )}
    </div>
  );
}

export default AtlasErrorState;
