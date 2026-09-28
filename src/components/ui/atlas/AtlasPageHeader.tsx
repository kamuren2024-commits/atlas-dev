import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Home, RefreshCw, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AtlasStatusBadge from './AtlasStatusBadge';
import AtlasButton from './AtlasButton';
import type { AtlasStatus } from './AtlasStatusBadge';

export interface AtlasBreadcrumbItem {
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
}

export interface AtlasPageHeaderProps {
  breadcrumb?: AtlasBreadcrumbItem[];
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: LucideIcon | React.ReactNode;
  status?: AtlasStatus | string;
  statusLabel?: string;
  statusPulse?: boolean;
  lastUpdated?: string;
  period?: string;
  primaryAction?: {
    label: string;
    onClick?: () => void;
    icon?: LucideIcon;
    loading?: boolean;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  };
  secondaryActions?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  showBreadcrumb?: boolean;
}

export function AtlasPageHeader({
  breadcrumb,
  eyebrow,
  title,
  description,
  icon,
  status,
  statusLabel,
  statusPulse,
  lastUpdated,
  period,
  primaryAction,
  secondaryActions,
  actions,
  children,
  className = '',
  showBreadcrumb = true,
}: AtlasPageHeaderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative border-b border-slate-800/50 px-5 sm:px-7 py-5 sm:py-6 bg-gradient-to-b from-atlas-bg-panel/80 to-atlas-bg-deep/30 ${className}`}
    >
      {/* Breadcrumb */}
      {showBreadcrumb && (
        <nav aria-label="Breadcrumb" className="mb-3">
          <ol className="flex items-center flex-wrap gap-1.5 text-[11px] font-mono text-slate-400">
            {(breadcrumb || [
              { label: 'ATLAS', icon: Home },
            ]).map((item, i, arr) => (
              <li key={i} className="flex items-center gap-1.5">
                {item.icon && <item.icon className="w-3 h-3 text-slate-500" />}
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    className="text-slate-400 hover:text-cyan-400 atlas-focus rounded px-1 -mx-1 tracking-wider uppercase font-bold cursor-pointer transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <span
                    className={`tracking-wider uppercase font-bold ${
                      i === arr.length - 1 ? 'text-cyan-400' : 'text-slate-400'
                    }`}
                  >
                    {item.label}
                  </span>
                )}
                {i < arr.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4 xl:gap-6">
        <div className="flex items-start gap-4 min-w-0 flex-1">
          {icon && (
            <div className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border border-cyan-500/25 bg-gradient-to-br from-cyan-950/60 to-atlas-bg-panel flex items-center justify-center text-cyan-400 shadow-[0_0_24px_rgba(0,217,255,0.08)]">
              {typeof icon === 'function'
                ? React.createElement(icon as any, { className: 'w-6 h-6 sm:w-7 sm:h-7' })
                : icon}
            </div>
          )}

          <div className="min-w-0 flex-1 space-y-2">
            {eyebrow && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-atlas-label text-cyan-400 tracking-widest">
                  {eyebrow}
                </span>
                {status && (
                  <AtlasStatusBadge
                    status={status as any}
                    label={statusLabel}
                    pulse={statusPulse}
                  />
                )}
              </div>
            )}
            <h1 className="text-atlas-display-sm sm:text-atlas-h1 text-slate-100 break-words leading-tight">
              {title}
            </h1>
            {description && (
              <p className="text-atlas-body-sm sm:text-atlas-body text-slate-400 max-w-3xl leading-relaxed">
                {description}
              </p>
            )}
            {(lastUpdated || period) && (
              <div className="flex items-center gap-4 flex-wrap pt-1 text-[11px] font-mono text-slate-400">
                {period && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    REPORTING PERIOD · <span className="text-slate-200 font-medium">{period}</span>
                  </span>
                )}
                {lastUpdated && (
                  <span className="inline-flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    LAST UPDATED · <span className="text-slate-200 font-medium">{lastUpdated}</span>
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-start xl:justify-end gap-2 shrink-0">
          {secondaryActions}
          {primaryAction && (
            <AtlasButton
              variant={primaryAction.variant ?? 'primary'}
              size="lg"
              onClick={primaryAction.onClick}
              loading={primaryAction.loading}
              icon={primaryAction.icon}
            >
              {primaryAction.label}
            </AtlasButton>
          )}
          {actions}
        </div>
      </div>

      {children && <div className="mt-4">{children}</div>}
    </motion.section>
  );
}

export default AtlasPageHeader;
