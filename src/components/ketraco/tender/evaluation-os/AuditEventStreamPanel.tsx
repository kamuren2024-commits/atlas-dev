import React, { useState } from 'react';
import { Shield, Clock, Check, ExternalLink, Activity, Filter } from 'lucide-react';
import { EvaluationAuditEvent } from './types';

interface AuditEventStreamPanelProps {
  events?: EvaluationAuditEvent[];
  onViewAll?: () => void;
}

const DEFAULT_AUDIT_EVENTS: EvaluationAuditEvent[] = [
  {
    id: 'EVT-00842',
    time: '10:42:18',
    actor: 'E-017',
    action: 'Submitted Technical Score',
    bidder: 'B-001',
    evidence: 'DOC-00471',
    criterion: 'T3',
    legalBasis: 'PPADA/PPADR verified',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00841',
    time: '10:39:02',
    actor: 'AI System',
    action: 'Analysis Completed',
    bidder: 'B-001',
    evidence: 'DOC-00471',
    criterion: 'T3',
    legalBasis: 'PPADA Section 79',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00840',
    time: '10:31:44',
    actor: 'E-004',
    action: 'Opened Bid Document',
    bidder: 'B-003',
    evidence: 'DOC-00495',
    criterion: 'F2',
    legalBasis: 'PPADR 2020 Reg 74',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00839',
    time: '10:28:17',
    actor: 'E-021',
    action: 'Modified Score',
    bidder: 'B-002',
    evidence: 'DOC-00483',
    criterion: 'F2',
    legalBasis: 'PPADA 2015 Sec 84',
    status: 'COMPLIANT'
  },
  {
    id: 'EVT-00838',
    time: '10:24:11',
    actor: 'System',
    action: 'State Transition',
    bidder: 'EVAL-0873',
    evidence: 'STAGE-05',
    criterion: 'N/A',
    legalBasis: 'Procedure Manual',
    status: 'COMPLIANT'
  }
];

export default function AuditEventStreamPanel({
  events = DEFAULT_AUDIT_EVENTS,
  onViewAll
}: AuditEventStreamPanelProps) {
  const [filterQuery, setFilterQuery] = useState('');

  const displayEvents = events.filter(e => 
    !filterQuery || 
    e.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.actor.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
    e.bidder.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="bg-[#0b1220] border border-slate-800/80 rounded-xl p-4 flex flex-col h-full shadow-lg shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Audit Event Stream
          </h2>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </span>
        </div>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Events Table */}
      <div className="flex-1 overflow-auto my-2 border border-slate-800/80 rounded-lg bg-[#070d18]">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead className="bg-[#0b1426] text-slate-400 text-[10px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
            <tr>
              <th className="py-2 px-2.5 font-semibold">Event ID</th>
              <th className="py-2 px-2.5 font-semibold">Time</th>
              <th className="py-2 px-2.5 font-semibold">Actor</th>
              <th className="py-2 px-2.5 font-semibold">Action</th>
              <th className="py-2 px-2.5 font-semibold">Bidder</th>
              <th className="py-2 px-2.5 font-semibold">Evidence</th>
              <th className="py-2 px-2.5 font-semibold">Criterion</th>
              <th className="py-2 px-2.5 font-semibold">Legal Basis</th>
              <th className="py-2 px-2.5 font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-[11px]">
            {displayEvents.map((evt) => (
              <tr key={evt.id} className="hover:bg-slate-850/40 text-slate-300">
                <td className="py-2 px-2.5 whitespace-nowrap text-cyan-400 font-bold">
                  {evt.id}
                </td>
                <td className="py-2 px-2.5 whitespace-nowrap text-slate-400 text-[10.5px]">
                  {evt.time}
                </td>
                <td className="py-2 px-2.5 whitespace-nowrap font-semibold text-slate-200">
                  {evt.actor}
                </td>
                <td className="py-2 px-2.5 whitespace-nowrap font-sans text-slate-200">
                  {evt.action}
                </td>
                <td className="py-2 px-2.5 whitespace-nowrap text-slate-300">
                  {evt.bidder}
                </td>
                <td className="py-2 px-2.5 whitespace-nowrap text-cyan-400">
                  {evt.evidence}
                </td>
                <td className="py-2 px-2.5 whitespace-nowrap font-bold text-slate-300">
                  {evt.criterion}
                </td>
                <td className="py-2 px-2.5 whitespace-nowrap text-slate-400 text-[10px]">
                  {evt.legalBasis}
                </td>
                <td className="py-2 px-2.5 whitespace-nowrap text-center">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                    <Check className="w-2.5 h-2.5 text-emerald-400 stroke-[3]" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Audit Signature */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
        <span>PPADA Audit Seal: SHA-256 / Continuous Ingestion</span>
        <span className="text-emerald-400 font-bold">100% Traceable</span>
      </div>
    </div>
  );
}
