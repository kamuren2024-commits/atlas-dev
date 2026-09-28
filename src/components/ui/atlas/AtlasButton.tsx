import React from 'react';
import { motion } from 'motion/react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export type AtlasButtonVariant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'danger'
  | 'success'
  | 'outline'
  | 'status';

export type AtlasButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface AtlasButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  variant?: AtlasButtonVariant;
  size?: AtlasButtonSize;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
  pill?: boolean;
}

const variantClass: Record<AtlasButtonVariant, string> = {
  primary:
    'text-white bg-gradient-to-b from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 border-cyan-400/30 shadow-[0_0_20px_rgba(0,217,255,0.18)] hover:shadow-[0_0_28px_rgba(0,217,255,0.28)]',
  secondary:
    'text-slate-200 hover:text-white bg-atlas-bg-elevated hover:bg-slate-800/70 border border-slate-700/70 hover:border-cyan-500/35',
  ghost:
    'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent',
  danger:
    'text-white bg-gradient-to-b from-danger-500 to-danger-600 hover:from-danger-400 hover:to-danger-500 border-danger-500/30 shadow-[0_0_16px_rgba(239,68,68,0.16)]',
  success:
    'text-white bg-gradient-to-b from-success-500 to-success-600 hover:from-success-400 hover:to-success-500 border-success-500/30 shadow-[0_0_16px_rgba(16,185,129,0.16)]',
  outline:
    'text-cyan-400 hover:text-cyan-300 bg-transparent hover:bg-cyan-500/5 border border-cyan-500/30 hover:border-cyan-400/50',
  status:
    'text-slate-300 bg-atlas-bg-panel border border-slate-700/60 hover:border-cyan-500/30 hover:bg-atlas-bg-elevated',
};

const sizeClass: Record<AtlasButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-6 text-sm gap-2.5 rounded-xl',
  icon: 'h-9 w-9 p-0 gap-0 rounded-lg',
};

export function AtlasButton({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  fullWidth = false,
  children,
  pill = false,
  className = '',
  disabled,
  ...rest
}: AtlasButtonProps) {
  const v = variantClass[variant];
  const s = sizeClass[size];

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={[
        'atlas-btn',
        v,
        s,
        pill ? 'rounded-full' : '',
        fullWidth ? 'w-full' : '',
        loading || disabled ? 'opacity-60' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <Loader2 className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} animate-spin`} />
      ) : Icon ? (
        <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} />
      ) : null}
      {size !== 'icon' && children && <span className="truncate">{children}</span>}
      {size !== 'icon' && !loading && IconRight && (
        <IconRight className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} shrink-0`} />
      )}
    </button>
  );
}

/* ---- Icon Button shortcut ---- */
export function AtlasIconButton(props: Omit<AtlasButtonProps, 'size' | 'children'> & { title?: string }) {
  const { title, ...rest } = props;
  return <AtlasButton {...rest} size="icon" aria-label={title} title={title} />;
}

export default AtlasButton;
