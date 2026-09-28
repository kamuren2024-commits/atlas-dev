import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, AlertCircle, Info, ShieldAlert, Sparkles } from 'lucide-react';
import AtlasButton from './AtlasButton';

export type AtlasModalTone = 'default' | 'danger' | 'success' | 'info' | 'ai';

export interface AtlasModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  tone?: AtlasModalTone;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onPrimary?: () => void;
  primaryLabel?: string;
  primaryLoading?: boolean;
  primaryDanger?: boolean;
  onSecondary?: () => void;
  secondaryLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  className?: string;
}

const sizes: Record<NonNullable<AtlasModalProps['size']>, string> = {
  sm: 'max-w-[384px]',
  md: 'max-w-[512px]',
  lg: 'max-w-[640px]',
  xl: 'max-w-[820px]',
};

const toneAccent: Record<AtlasModalTone, { Icon: any; iconColor: string; ring: string; glow: string }> = {
  default: { Icon: Info, iconColor: 'text-slate-400', ring: 'border-cyan-500/20', glow: 'shadow-[0_0_40px_rgba(0,217,255,0.08)]' },
  danger: { Icon: AlertCircle, iconColor: 'text-danger-500', ring: 'border-danger-500/30', glow: 'shadow-[0_0_40px_rgba(239,68,68,0.12)]' },
  success: { Icon: Info, iconColor: 'text-success-500', ring: 'border-success-500/30', glow: 'shadow-[0_0_40px_rgba(16,185,129,0.10)]' },
  info: { Icon: Info, iconColor: 'text-info-500', ring: 'border-info-500/30', glow: 'shadow-[0_0_40px_rgba(59,130,246,0.10)]' },
  ai: { Icon: Sparkles, iconColor: 'text-violet-400', ring: 'border-violet-500/30', glow: 'shadow-[0_0_40px_rgba(139,92,246,0.14)]' },
};

export function AtlasModal({
  open,
  onClose,
  title,
  description,
  icon,
  tone = 'default',
  children,
  footer,
  onPrimary,
  primaryLabel = 'Confirm',
  primaryLoading = false,
  primaryDanger = false,
  onSecondary,
  secondaryLabel = 'Cancel',
  size = 'md',
  closeOnBackdrop = true,
  closeOnEsc = true,
  className = '',
}: AtlasModalProps) {
  const toneMeta = toneAccent[tone];

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="atlas-backdrop"
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={title}
              key="modal"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={`w-full ${sizes[size]} pointer-events-auto atlas-panel ${toneMeta.ring} ${toneMeta.glow} ${className}`}
            >
              {/* Header */}
              <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-800/50">
                {icon !== null && (
                  <div
                    className={`w-10 h-10 shrink-0 rounded-xl border ${toneMeta.ring} bg-${tone === 'ai' ? 'violet' : tone === 'danger' ? 'danger' : tone === 'success' ? 'success' : tone === 'info' ? 'info' : 'cyan'}-500/10 flex items-center justify-center ${toneMeta.iconColor}`}
                  >
                    {icon ?? <toneMeta.Icon className="w-5 h-5" />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="text-atlas-h3 text-slate-100 break-words leading-snug font-semibold">{title}</h3>
                  {description && (
                    <p className="text-atlas-body-sm text-slate-300 mt-1 break-words leading-relaxed">{description}</p>
                  )}
                </div>
                <AtlasButton
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close"
                  icon={X}
                />
              </div>

              {/* Body */}
              {children !== undefined && (
                <div className="px-5 py-5 overflow-y-auto max-h-[65vh]">
                  {children}
                </div>
              )}

              {/* Footer */}
              {(footer !== undefined || onPrimary || onSecondary) && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-2 px-5 py-4 border-t border-slate-800/50 bg-atlas-bg-sunken/40 rounded-b-xl">
                  {footer}
                  {onSecondary && (
                    <AtlasButton variant="ghost" onClick={onSecondary}>
                      {secondaryLabel}
                    </AtlasButton>
                  )}
                  {onPrimary && (
                    <AtlasButton
                      variant={primaryDanger ? 'danger' : 'primary'}
                      onClick={onPrimary}
                      loading={primaryLoading}
                    >
                      {primaryLabel}
                    </AtlasButton>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AtlasModal;
