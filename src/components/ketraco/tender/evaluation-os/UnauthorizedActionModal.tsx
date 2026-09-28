import React from 'react';
import { ShieldAlert, X, AlertTriangle, Lock, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UnauthorizedActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionName?: string;
  reason?: string;
  requiredRole?: string;
  auditEventId?: string;
}

export default function UnauthorizedActionModal({
  isOpen,
  onClose,
  actionName = 'Score Override / Criteria Modification',
  reason = 'Section 84 of PPADA 2015 mandates committee consensus and Accounting Officer sign-off before score modifications.',
  requiredRole = 'Evaluation Committee Chair / Accounting Officer',
  auditEventId = 'EVT-RESTRICTED-SEC84'
}: UnauthorizedActionModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-md bg-[#0d1527] border border-rose-500/40 rounded-xl shadow-2xl p-5 space-y-4 text-slate-200"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-500/50 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Action Restricted
                </h3>
                <span className="text-[11px] font-mono text-rose-400 font-semibold">
                  RBAC ACCESS ENFORCEMENT
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/20 text-rose-200 leading-relaxed font-sans">
              You are not authorized to perform this operation: <strong>{actionName}</strong>.
            </div>

            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Required Role:</span>
                <span className="text-amber-300 font-bold">{requiredRole}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Statutory Reason:</span>
                <span className="text-slate-300 max-w-[240px] text-right">{reason}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400">Audit Event:</span>
                <span className="text-cyan-400 font-bold">{auditEventId} (Logged to Audit Trail)</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              Acknowledge & Dismiss
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
