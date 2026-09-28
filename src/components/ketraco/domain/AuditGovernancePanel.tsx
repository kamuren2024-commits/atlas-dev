import React, { useState } from 'react';
import { ShieldCheck, CheckCircle, FileText, Lock, Key, AlertTriangle, HelpCircle } from 'lucide-react';

interface Decision {
  id: string;
  title: string;
  category: string;
  materialCode: string;
  quantity: number;
  criticality: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  justification: string;
  riskFactor: string;
  approved: boolean;
  signer?: string;
  date?: string;
}

interface AuditGovernancePanelProps {
  decisions: Decision[];
  setDecisions: React.Dispatch<React.SetStateAction<Decision[]>>;
  selectedDecisionId: string;
  setSelectedDecisionId: (id: string) => void;
  onAskCopilot: (prompt: string) => void;
  onOpenApprovalModal: (decisionId: string) => void;
}

export default function AuditGovernancePanel({
  decisions,
  setDecisions,
  selectedDecisionId,
  setSelectedDecisionId,
  onAskCopilot,
  onOpenApprovalModal
}: AuditGovernancePanelProps) {
  const activeDecision = decisions.find(d => d.id === selectedDecisionId) || decisions[0];

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-cyan-405" />
          SCM Governance & PPADA Audit Trailing
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Strict statutory enforcement of the Public Procurement and Asset Disposal Act (PPADA 2015). Multi-level Level-5 cryptographic signings for high-value grid assets purchase orders.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Side: Decisions needing approval (6 columns) */}
        <div className="xl:col-span-6 bg-slate-950/40 border border-slate-900 rounded-3xl p-5 space-y-4">
          <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold tracking-widest pl-1">
            PENDING PPADA SECTION DECISION BLOCKS
          </span>

          <div className="space-y-3.5 max-h-96 overflow-y-auto scrollbar-thin">
            {decisions.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDecisionId(d.id)}
                className={`w-full text-left p-4 rounded-2xl border flex flex-col gap-2 transition-all ${
                  selectedDecisionId === d.id
                    ? 'bg-gradient-to-r from-indigo-950/30 to-slate-900 border-cyan-500/35 text-[#00D9FF]'
                    : 'bg-slate-900/15 border-slate-900 hover:border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="font-mono text-[10px] font-bold tracking-wider">{d.id}</span>
                  <span className={`text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    d.approved ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-rose-955 text-rose-455 border border-rose-500/20'
                  }`}>
                    {d.approved ? 'AUTHORIZED' : 'PENDING APPROVED'}
                  </span>
                </div>

                <div className="text-xs font-bold font-sans">
                  {d.title}
                </div>

                <div className="text-[10px] font-sans text-slate-400 leading-relaxed truncate block w-full">
                  SKU: {d.materialCode} ({d.quantity} Units requested)
                </div>

                {d.signer && (
                  <div className="text-[9.5px] font-mono text-emerald-450 mt-1 uppercase">
                    🔒 Signer: {d.signer} on {d.date}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Active Decision Grounding detail, Evidence and Signer triggers (6 columns) */}
        <div className="xl:col-span-6">
          {activeDecision ? (
            <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-start border-b border-indigo-950/30 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-405 block uppercase font-bold">
                    EVIDENTIARY AUDIT PROPOSAL BLOCK // {activeDecision.id}
                  </span>
                  <h3 className="text-xs text-white font-extrabold mt-1.5 leading-snug font-sans">
                    {activeDecision.title}
                  </h3>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-900 rounded-2xl block text-center">
                  <span className="text-[9px] font-mono text-slate-400 block font-bold uppercase">SECTION 106</span>
                  <span className="font-mono text-[#00D9FF] font-bold text-xs block mt-0.5">DIRECT AWARD</span>
                </div>
              </div>

              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-[9.5px] font-mono text-slate-500 uppercase font-bold block">PPADA Compliance Justification</span>
                  <p className="text-slate-300 font-sans mt-1">
                    {activeDecision.justification}
                  </p>
                </div>

                <div>
                  <span className="text-[9.5px] font-mono text-rose-500 uppercase font-bold block">Active Risk Factors</span>
                  <p className="text-slate-300 font-sans mt-0.5">
                    {activeDecision.riskFactor}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-900/15 border border-slate-900 rounded-2xl text-[11px] space-y-2 font-mono">
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">STATUTORY AUDIT LEDGER METADATA</span>
                <div className="flex justify-between items-baseline border-b border-indigo-950/20 pb-1.5">
                  <span className="text-slate-400">Prequalified Framework ID</span>
                  <span className="text-white font-bold">FW-GRID-2026-X</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-indigo-950/20 pb-1.5">
                  <span className="text-slate-400">PPADA Statutory Bid Limit</span>
                  <span className="text-emerald-400 font-bold">KES 50,000,000 max</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-slate-400">Authenticity Handshake Hash</span>
                  <span className="text-cyan-400 font-bold">sha256_e028b12...</span>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-950/20">
                {!activeDecision.approved ? (
                  <button
                    onClick={() => onOpenApprovalModal(activeDecision.id)}
                    className="w-full py-3 bg-[#00D9FF] hover:bg-cyan-500 text-black text-xs font-mono font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                  >
                    🔒 INITIATE LEVEL 5 CRYPTOGRAPHIC PIN SIGNATURE
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/25 rounded-2xl flex items-center justify-center gap-2 text-emerald-400 font-mono text-xs uppercase animate-pulse">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                    AUTHORIZED BY {activeDecision.signer}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Select a decision block from the left panel list.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
