import React, { useState, useMemo } from 'react';
import { Calendar, AlertTriangle, CheckCircle2, Clock, MapPin } from 'lucide-react';

interface MaintenanceItem {
  id: string;
  assetName: string;
  workType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  risk: number;
  exposure: number;
  conflictStatus: 'NO_CONFLICT' | 'WEATHER' | 'OUTAGE_OVERLAP' | 'CRITICAL_CONFLICT';
  startTime: string;
  endTime: string;
  requiredIsolation: string[];
  approvalStatus: 'PROPOSED' | 'APPROVED' | 'DEFERRED' | 'REJECTED';
}

const sampleMaintenance: MaintenanceItem[] = [
  {
    id: 'MNT-118',
    assetName: 'Suswa 220 kV Transformer',
    workType: 'Routine inspection and windings test',
    priority: 'HIGH',
    risk: 82,
    exposure: 82,
    conflictStatus: 'WEATHER',
    startTime: '2026-09-03T06:00:00',
    endTime: '2026-09-03T14:00:00',
    requiredIsolation: ['Line 21', 'Transformer bay 01'],
    approvalStatus: 'PROPOSED',
  },
  {
    id: 'MNT-221',
    assetName: 'Mombasa Bay 132 kV',
    workType: 'Breaker maintenance',
    priority: 'MEDIUM',
    risk: 64,
    exposure: 64,
    conflictStatus: 'NO_CONFLICT',
    startTime: '2026-09-05T08:00:00',
    endTime: '2026-09-05T16:00:00',
    requiredIsolation: ['Bay 04', 'Line 12'],
    approvalStatus: 'APPROVED',
  },
  {
    id: 'MNT-362',
    assetName: 'Naivasha 220 kV Reactor',
    workType: 'Cooling fan motor replacement',
    priority: 'HIGH',
    risk: 90,
    exposure: 90,
    conflictStatus: 'CRITICAL_CONFLICT',
    startTime: '2026-09-02T10:00:00',
    endTime: '2026-09-02T18:00:00',
    requiredIsolation: ['Reactor bank 01', 'Isolation switch'],
    approvalStatus: 'PROPOSED',
  },
];

export default function GridMaintenanceCalendar() {
  const [selectedMaint, setSelectedMaint] = useState<string | null>(null);

  const byPriority = useMemo(() => {
    const groups: Record<string, MaintenanceItem[]> = {};
    ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach((p) => { groups[p] = []; });
    sampleMaintenance.forEach((m) => { groups[m.priority].push(m); });
    return groups;
  }, []);

  const conflictColor = (conflict: MaintenanceItem['conflictStatus']) => {
    const map: Record<MaintenanceItem['conflictStatus'], { bg: string; text: string }> = {
      NO_CONFLICT: { bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
      WEATHER: { bg: 'bg-amber-500/15', text: 'text-amber-400' },
      OUTAGE_OVERLAP: { bg: 'bg-orange-500/15', text: 'text-orange-400' },
      CRITICAL_CONFLICT: { bg: 'bg-red-500/15', text: 'text-red-400' },
    };
    return map[conflict];
  };

  const approvalBadge = (status: MaintenanceItem['approvalStatus']) => {
    const map: Record<MaintenanceItem['approvalStatus'], { bg: string; text: string; icon: React.ReactNode }> = {
      PROPOSED: { bg: 'bg-slate-600', text: 'text-slate-100', icon: <Clock className="w-3 h-3" /> },
      APPROVED: { bg: 'bg-emerald-600', text: 'text-emerald-100', icon: <CheckCircle2 className="w-3 h-3" /> },
      DEFERRED: { bg: 'bg-blue-600', text: 'text-blue-100', icon: <Calendar className="w-3 h-3" /> },
      REJECTED: { bg: 'bg-red-600', text: 'text-red-100', icon: <AlertTriangle className="w-3 h-3" /> },
    };
    const style = map[status];
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
        {style.icon}
        {status}
      </span>
    );
  };

  return (
    <div className="w-full bg-[#050913] text-slate-100 p-4 font-sans border-b border-slate-800 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400">Phase 09</div>
          <h3 className="text-xl font-bold text-slate-100">GRID MAINTENANCE CALENDAR</h3>
        </div>
      </div>

      {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((priority) => {
        const items = byPriority[priority];
        if (items.length === 0) return null;

        return (
          <div key={priority} className="rounded-xl border border-slate-800 bg-[#0a1222] p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                priority === 'MEDIUM' ? 'bg-amber-500/20 text-amber-400' :
                'bg-emerald-500/20 text-emerald-400'
              }`}>
                {priority} PRIORITY
              </span>
              <span className="text-[11px] text-slate-400">{items.length} items</span>
            </div>

            <div className="space-y-3">
              {items.map((maint) => {
                const conflict = conflictColor(maint.conflictStatus);
                return (
                  <div
                    key={maint.id}
                    onClick={() => setSelectedMaint(selectedMaint === maint.id ? null : maint.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedMaint === maint.id
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : `border-slate-800 ${conflict.bg}`
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <span className="text-sm font-bold text-slate-100">{maint.assetName}</span>
                        <span className="text-[10px] text-slate-400 ml-2">— {maint.workType}</span>
                      </div>
                      {approvalBadge(maint.approvalStatus)}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-2">
                      <span>Risk: <strong className="text-orange-400">{maint.risk}/100</strong></span>
                      <span>Exposure: <strong className="text-amber-400">{maint.exposure}/100</strong></span>
                      <span className={`${conflict.text}`}>{maint.conflictStatus}</span>
                    </div>

                    <div className="text-[10px] text-slate-400">
                      <span>Window: {new Date(maint.startTime).toLocaleString()}</span>
                      <span> → {new Date(maint.endTime).toLocaleTimeString()}</span>
                    </div>

                    {selectedMaint === maint.id && (
                      <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                        <div className="text-[10px]">
                          <span className="text-slate-400">Required Isolation:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {maint.requiredIsolation.map((iso, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 text-[9px]">
                                {iso}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
