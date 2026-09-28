import React from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import type { MeetingNotification } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: MeetingNotification[];
  onMarkRead: (id: string) => Promise<void>;
  onNavigateToAction?: () => void;
}

export const NotificationsDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onNavigateToAction
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#0d1322] border-l border-slate-800 shadow-2xl flex flex-col justify-between">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono">
              Meeting Telemetry & Escalations
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {notifications.length === 0 ? (
            <p className="text-xs text-slate-500 italic text-center py-8">No active notifications or escalations.</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                  n.severity === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/40'
                    : n.read
                    ? 'bg-slate-900/40 border-slate-800/80 text-slate-400'
                    : 'bg-slate-900/90 border-cyan-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                    n.severity === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {n.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">{n.created_at.split('T')[0]}</span>
                </div>

                <h4 className="font-bold text-slate-100">{n.title}</h4>
                <p className="text-slate-300 leading-relaxed text-[11px]">{n.message}</p>

                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                  {!n.read ? (
                    <button
                      onClick={() => onMarkRead(n.id)}
                      className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer"
                    >
                      Mark as acknowledged
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500">Acknowledged</span>
                  )}

                  {onNavigateToAction && (
                    <button
                      onClick={() => {
                        onNavigateToAction();
                        onClose();
                      }}
                      className="text-[11px] font-mono text-slate-300 hover:text-cyan-400 flex items-center gap-1 cursor-pointer"
                    >
                      View in Queue <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 text-center">
          Closed-loop event fabric synced with Atlas Mission Control
        </div>
      </div>
    </div>
  );
};
