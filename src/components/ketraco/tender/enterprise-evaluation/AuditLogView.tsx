import React from 'react';
import { ShieldCheck, History, User, Lock, Search, Filter, Download } from 'lucide-react';

export function AuditLogView() {
  const logs = [
    { id: 'AUDIT_001', user: 'SCM_OFFICER_1', action: 'APPROVE_FINDING', target: 'DOC-123 (KRA PIN)', reason: 'Visual match confirmed', timestamp: '2026-07-03 10:20:45' },
    { id: 'AUDIT_002', user: 'SYSTEM_AI', action: 'FLAG_RISK', target: 'DOC-456 (CR12)', reason: 'Director mismatch detected', timestamp: '2026-07-03 10:21:12' },
    { id: 'AUDIT_003', user: 'SCM_MANAGER', action: 'OVERRIDE_CLASSIFICATION', target: 'DOC-789', reason: 'Misclassified as Other, is Financials', timestamp: '2026-07-03 10:22:05' },
  ];

  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0d0f1a]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Immutable Audit History</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">Government Governance Ledger</p>
          </div>
        </div>
        <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 rounded-lg hover:text-white transition-all cursor-pointer uppercase tracking-widest flex items-center gap-2">
          <Download className="w-3.5 h-3.5" />
          EXPORT LEDGER
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0d0f1a] z-10 border-b border-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4 font-bold">Timestamp</th>
              <th className="px-6 py-4 font-bold">User</th>
              <th className="px-6 py-4 font-bold">Action</th>
              <th className="px-6 py-4 font-bold">Target</th>
              <th className="px-6 py-4 font-bold">Reason</th>
              <th className="px-6 py-4 font-bold">Signature</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-4 text-[11px] font-mono text-white/40">{log.timestamp}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <User className="w-3 h-3 text-white/40" />
                    </div>
                    <span className="text-[11px] font-bold text-white/70">{log.user}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    log.action.includes('APPROVE') ? 'bg-emerald-500/10 text-emerald-400' :
                    log.action.includes('RISK') ? 'bg-red-500/10 text-red-400' :
                    'bg-amber-500/10 text-amber-400'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-[11px] text-white/60 font-mono">{log.target}</td>
                <td className="px-6 py-4 text-[11px] text-white/40 italic">"{log.reason}"</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                    <Lock className="w-3 h-3 text-indigo-400" />
                    <span className="text-[9px] font-mono text-indigo-400/60 uppercase">SIGNED_v2</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
