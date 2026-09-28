import React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Database, Inbox, FolderOpen, Search, FilterX, Package, BarChart3 } from 'lucide-react';
import AtlasButton from './AtlasButton';

export type AtlasEmptyVariant =
  | 'no-data'
  | 'no-results'
  | 'no-records'
  | 'loading'
  | 'config'
  | 'welcome';

export interface AtlasEmptyStateProps {
  variant?: AtlasEmptyVariant;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  compact?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const variantMap: Record<AtlasEmptyVariant, { Icon: LucideIcon; title: string; description: string }> = {
  'no-data': {
    Icon: Database,
    title: 'No data yet',
    description: 'This intelligence surface has not received any records. Connect a source or ingest data to populate the view.',
  },
  'no-results': {
    Icon: Search,
    title: 'No matching results',
    description: 'No records match the current filters or search. Try broadening your search criteria or clearing filters.',
  },
  'no-records': {
    Icon: Inbox,
    title: 'Nothing in this queue',
    description: 'There are currently no records to display here. When new events arrive, they will appear automatically.',
  },
  loading: {
    Icon: Package,
    title: 'Loading intelligence',
    description: 'Fetching the latest data from source systems. This should complete in a few moments.',
  },
  config: {
    Icon: FolderOpen,
    title: 'Configure this module',
    description: 'This intelligence module requires configuration before it can surface results.',
  },
  welcome: {
    Icon: BarChart3,
    title: 'Welcome to the intelligence workspace',
    description: 'Configure your first data source to begin generating actionable insights and reports.',
  },
};

export function AtlasEmptyState({
  variant = 'no-data',
  icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  compact = false,
  children,
  className = '',
}: AtlasEmptyStateProps) {
  const meta = variantMap[variant];
  const Icon = icon ?? meta.Icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative w-full rounded-xl border border-dashed border-slate-700/60 bg-atlas-bg-sunken/40 ${
        compact ? 'px-5 py-10' : 'px-6 sm:px-10 py-14 sm:py-20'
      } flex flex-col items-center justify-center text-center ${className}`}
    >
      <div className={`relative mb-4 ${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-2xl border border-cyan-500/20 bg-cyan-950/30 flex items-center justify-center text-cyan-400 shadow-[0_0_30px_rgba(0,217,255,0.06)]`}>
        <Icon className={compact ? 'w-6 h-6' : 'w-8 h-8'} strokeWidth={1.5} />
        <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full border-t border-r border-cyan-400/50 pointer-events-none" />
        <span className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-full border-b border-l border-cyan-400/50 pointer-events-none" />
      </div>

      <h3 className={`${compact ? 'text-atlas-h4' : 'text-atlas-h3'} text-slate-200 mb-2`}>
        {title ?? meta.title}
      </h3>
      <p className={`text-atlas-body-sm text-slate-500 max-w-lg mb-5 ${compact ? '' : 'leading-relaxed'}`}>
        {description ?? meta.description}
      </p>

      {children && <div className="mb-5 w-full max-w-md">{children}</div>}

      <div className="flex flex-wrap items-center justify-center gap-2">
        {onAction && actionLabel && (
          <AtlasButton variant="primary" onClick={onAction}>
            {actionLabel}
          </AtlasButton>
        )}
        {onSecondary && secondaryLabel && (
          <AtlasButton variant="ghost" onClick={onSecondary}>
            {secondaryLabel}
          </AtlasButton>
        )}
      </div>
    </motion.div>
  );
}

/* Convenience: No Results with clear filter button */
export function AtlasNoFilterResults({ onClear }: { onClear: () => void }) {
  return (
    <AtlasEmptyState
      variant="no-results"
      icon={FilterX}
      actionLabel="Clear filters"
      onAction={onClear}
    />
  );
}

export default AtlasEmptyState;
