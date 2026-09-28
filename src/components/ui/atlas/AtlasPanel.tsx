import React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';

export interface AtlasPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowOnHover?: boolean;
  accentSide?: 'left' | 'right' | 'top' | 'none';
  accentColor?: 'cyan' | 'violet' | 'success' | 'warning' | 'danger';
  selected?: boolean;
  padded?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const sideAccentClass: Record<NonNullable<AtlasPanelProps['accentSide']>, string> = {
  left: 'before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:rounded-tl-lg before:rounded-bl-lg',
  right: 'after:absolute after:inset-y-0 after:right-0 after:w-[2px] after:rounded-tr-lg after:rounded-br-lg',
  top: 'before:absolute before:inset-x-0 before:top-0 before:h-[2px] before:rounded-tl-lg before:rounded-tr-lg',
  none: '',
};

const accentBgColor: Record<NonNullable<AtlasPanelProps['accentColor']>, string> = {
  cyan: 'bg-cyan-400',
  violet: 'bg-violet-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
};

export function AtlasPanel({
  children,
  glowOnHover = true,
  accentSide = 'none',
  accentColor = 'cyan',
  selected = false,
  padded = true,
  header,
  footer,
  icon: Icon,
  title,
  description,
  actions,
  className = '',
  style,
  ...rest
}: AtlasPanelProps) {
  const sideClass = sideAccentClass[accentSide];
  const colorClass = accentSide !== 'none' ? accentBgColor[accentColor] : '';

  return (
    <motion.div
      initial={false}
      whileHover={glowOnHover ? { y: -1 } : undefined}
      className={`atlas-panel atlas-glass atlas-glass--data atlas-glass--normal ${selected ? 'atlas-panel-selected' : ''} ${padded ? 'p-5' : ''} ${
        glowOnHover ? 'hover:-translate-y-[1px]' : ''
      } ${className}`}
      style={style}
      {...(rest as any)}
    >
      {/* Side accent bar */}
      {accentSide !== 'none' && (
        <span
          className={`${sideClass} ${colorClass}`}
          style={
            accentSide === 'left' || accentSide === 'right'
              ? { [accentSide === 'left' ? 'boxShadow' : 'boxShadow']: 'none' } as any
              : undefined
          }
        />
      )}

      {/* Corner hairlines */}
      <span className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-500/20 pointer-events-none" />
      <span className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-500/20 pointer-events-none" />

      {/* Structured header (if used) */}
      {(title || header || actions) && (
        <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-800/40">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <div className="w-9 h-9 rounded-lg border border-cyan-500/20 bg-cyan-950/40 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-cyan-400" />
              </div>
            )}
            <div className="min-w-0 space-y-0.5">
              {title && <h3 className="text-atlas-h3 text-slate-100 leading-snug break-words font-semibold">{title}</h3>}
              {description && <p className="text-atlas-body-sm text-slate-300 break-words leading-relaxed">{description}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
          {header}
        </div>
      )}

      {/* Body */}
      <div className="relative">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-slate-800/40 flex items-center justify-between text-atlas-meta text-slate-400">
          {footer}
        </div>
      )}
    </motion.div>
  );
}

export default AtlasPanel;
