import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import AtlasButton from './AtlasButton';

export interface AtlasDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: 'narrow' | 'default' | 'wide' | 'wider';
  onPrimary?: () => void;
  primaryLabel?: string;
  primaryLoading?: boolean;
  onSecondary?: () => void;
  secondaryLabel?: string;
  statusBadge?: React.ReactNode;
  className?: string;
  closeOnBackdrop?: boolean;
}

const widths: Record<NonNullable<AtlasDrawerProps['width']>, string> = {
  narrow: 'max-w-[384px]',
  default: 'max-w-[480px]',
  wide: 'max-w-[640px]',
  wider: 'max-w-[768px]',
};

export function AtlasDrawer({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  width = 'default',
  onPrimary,
  primaryLabel = 'Save',
  primaryLoading = false,
  onSecondary,
  secondaryLabel = 'Cancel',
  statusBadge,
  className = '',
  closeOnBackdrop = true,
}: AtlasDrawerProps) {
  const drawerRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusTimer = window.setTimeout(() => drawerRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      returnFocusRef.current?.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="atlas-backdrop"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            ref={drawerRef}
            initial={{ x: '100%', opacity: 0.4 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={`fixed right-0 top-0 h-full z-50 w-full ${widths[width]} ${className}`}
          >
            <div className="h-full flex flex-col bg-atlas-bg-surface border-l border-slate-800/60 shadow-[0_0_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-800/60">
                <div className="flex items-start gap-3 min-w-0">
                  {icon && (
                    <div className="w-10 h-10 rounded-xl border border-cyan-500/25 bg-cyan-950/40 flex items-center justify-center shrink-0 text-cyan-400">
                      {icon}
                    </div>
                  )}
                  <div className="min-w-0 space-y-0.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-atlas-h2 text-slate-100 break-words leading-tight">{title}</h2>
                      {statusBadge}
                    </div>
                    {subtitle && (
                      <p className="text-atlas-body-sm text-slate-300 break-words mt-0.5 leading-relaxed">{subtitle}</p>
                    )}
                  </div>
                </div>
                <AtlasButton
                  variant="ghost"
                  size="icon"
                  aria-label="Close"
                  onClick={onClose}
                  icon={X}
                />
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>

              {/* Footer */}
              {(footer || onPrimary || onSecondary) && (
                <div className="border-t border-slate-800/60 px-5 py-4 flex items-center justify-between gap-3 bg-atlas-bg-sunken/60">
                  <div className="text-atlas-meta text-slate-400 min-w-0 truncate">
                    {typeof footer === 'string' ? footer : null}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {typeof footer !== 'string' && footer}
                    {onSecondary && (
                      <AtlasButton variant="ghost" size="md" onClick={onSecondary}>
                        {secondaryLabel}
                      </AtlasButton>
                    )}
                    {onPrimary && (
                      <AtlasButton
                        variant="primary"
                        size="md"
                        onClick={onPrimary}
                        loading={primaryLoading}
                      >
                        {primaryLabel}
                      </AtlasButton>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export default AtlasDrawer;
