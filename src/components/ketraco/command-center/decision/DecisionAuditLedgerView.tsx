// DecisionAuditLedgerView - KETRACO Phase 06 Auditable Decision Ledger & Closed-Loop Verification

import React, { useState } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  User, 
  Cpu, 
  AlertCircle, 
  ArrowRight, 
  Search, 
  Filter, 
  Layers,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { DecisionLedgerEntry } from './types';

interface DecisionAuditLedgerViewProps {
  entries: DecisionLedgerEntry[];
  onOpenDecisionBrief?: (incidentId: string) => void;
}

export default function DecisionAuditLedgerView({
  entries = [],
  onOpenDecisionBrief
}: DecisionAuditLedgerViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const list = entries || [];
  const [selectedEntryId, setSelectedEntryId] = useState<string>(list[0]?.id || '');

  const filteredEntries = list.filter(e => 
    (e.incidentTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.operatorName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (e.briefId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeEntry = list.find(e => e.id === selectedEntryId) || list[0];

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case 'AUTHORIZED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            AUTHORIZED
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
            REJECTED
          </span>
        );
      case 'MODIFIED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            MODIFIED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
            INVESTIGATING
          </span>
        );
    }
  };

  const getOutcomeBadge = (status: string) => {
    switch (status) {
      case 'VALIDATED_OPTIMAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-600/50 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            VALIDATED OPTIMAL (Error &lt; 1%)
          </span>
        );
      case 'VALIDATED_ACCEPTABLE':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-950/70 text-sky-300 border border-sky-600/50 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-sky-400" />
            VALIDATED ACCEPTABLE
          </span>
        );
      case 'DIVERGENT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950/70 text-rose-300 border border-rose-600/50 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            DIVERGENT (Calibrated)
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            PENDING SCADA VERIFICATION
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#080e1a] border border-slate-800 rounded-lg overflow-hidden flex flex-col shadow-xl">
      
      {/* Header */}
      <div className="p-3 bg-[#0a1222] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded bg-emerald-950/60 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
              OPERATIONAL DECISION LEDGER & AUDIT TRAIL
            </h2>
            <p className="text-[10px] font-mono text-slate-400">
              Immutable Human-in-the-Loop Governance & Closed-Loop Verification
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
          <input
            type="text"
            placeholder="Search ledger entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main Content Grid: Ledger Log (5 cols) + Audit Dossier (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[460px]">
        
        {/* Left Column: Ledger Records List */}
        <div className="lg:col-span-5 border-r border-slate-800/80 p-2 space-y-1.5 max-h-[560px] overflow-y-auto">
          {filteredEntries.map(entry => {
            const isSelected = entry.id === activeEntry?.id;
            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntryId(entry.id)}
                className={`p-2.5 rounded border transition-all cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[#0f1f38] border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'bg-[#0a1220]/70 border-slate-800 hover:bg-[#0c172a]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[10px] font-mono font-bold text-slate-300">{entry.id}</span>
                  {getDecisionBadge(entry.operatorDecision)}
                </div>

                <h4 className="text-xs font-semibold text-slate-100 line-clamp-1 mb-1">
                  {entry.incidentTitle}
                </h4>

                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{entry.operatorName?.split(' ')?.[0] || 'Operator'} {entry.operatorName?.split(' ')?.[1] || ''}</span>
                  <span>{entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Complete Verified Audit Trail */}
        {activeEntry && (
          <div className="lg:col-span-7 p-4 bg-[#09101f] flex flex-col justify-between overflow-y-auto max-h-[560px]">
            <div className="space-y-3 font-mono text-xs">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getDecisionBadge(activeEntry.operatorDecision)}
                    <span className="text-[10px] text-slate-400">{activeEntry.id}</span>
                    <span className="text-[10px] text-slate-400">•</span>
                    <span className="text-[10px] text-slate-400">{activeEntry.briefId}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{activeEntry.incidentTitle}</h3>
                </div>
                <button
                  onClick={() => onOpenDecisionBrief?.(activeEntry.incidentId)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                >
                  <FileText className="w-3 h-3 text-cyan-400" />
                  ORIGINAL BRIEF
                </button>
              </div>

              {/* Alert Summary */}
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  TRIGGERING ALERT SNAPSHOT
                </div>
                <p className="text-slate-200 text-[11.5px] leading-relaxed">
                  {activeEntry.alertSummary}
                </p>
              </div>

              {/* Evidence Snapshot */}
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  EVIDENCE SNAPSHOT AT TIME OF DECISION
                </div>
                <div className="space-y-1 text-[10.5px]">
                  {activeEntry.evidenceSnapshot.map((ev, i) => (
                    <div key={i} className="text-slate-300 flex items-center gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendation & Simulation */}
              <div className="p-2.5 rounded bg-cyan-950/20 border border-cyan-500/30">
                <div className="text-[10px] text-cyan-400 font-bold uppercase mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AI RECOMMENDATION & SIMULATION EVIDENCE
                </div>
                <p className="text-cyan-100 text-[11.5px] mb-1 font-sans">
                  {activeEntry.aiRecommendation}
                </p>
                <div className="text-[10px] text-slate-400 italic">
                  Simulation: {activeEntry.simulationSummary}
                </div>
              </div>

              {/* Operator Authorization Record */}
              <div className="p-2.5 rounded bg-[#070e1c] border border-slate-700 space-y-1.5">
                <div className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                  <User className="w-3 h-3 text-cyan-400" />
                  HUMAN AUTHORIZATION RECORD
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                  <div>
                    <span className="text-slate-400">OPERATOR:</span>{' '}
                    <strong className="text-slate-200">{activeEntry.operatorName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">BADGE ID:</span>{' '}
                    <strong className="text-slate-200">{activeEntry.operatorId}</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded border border-slate-800 italic">
                  "{activeEntry.operatorNotes}"
                </div>
                <div className="text-[9.5px] text-slate-400 text-right">
                  Signed & Timestamped: {new Date(activeEntry.timestamp).toLocaleString()}
                </div>
              </div>

              {/* Closed-Loop Outcome Verification */}
              <div className="p-3 rounded bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    CLOSED-LOOP OUTCOME VERIFICATION (FEEDBACK LOOP)
                  </div>
                  {getOutcomeBadge(activeEntry.verification.outcomeStatus)}
                </div>

                <div className="space-y-1 text-[11px]">
                  <div>
                    <span className="text-slate-400">EXPECTED:</span>{' '}
                    <span className="text-slate-200">{activeEntry.verification.expectedOutcome}</span>
                  </div>
                  {activeEntry.verification.observedOutcome && (
                    <div>
                      <span className="text-slate-400">OBSERVED:</span>{' '}
                      <span className="text-emerald-300 font-bold">{activeEntry.verification.observedOutcome}</span>
                    </div>
                  )}
                  {activeEntry.verification.variancePct !== undefined && (
                    <div className="text-[10px] text-slate-400">
                      Measured Error Variance: <strong className="text-cyan-300">{activeEntry.verification.variancePct}%</strong> (Model Learning Fed Back: Yes)
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
