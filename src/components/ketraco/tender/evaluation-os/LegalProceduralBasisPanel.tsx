import React, { useState } from 'react';
import { 
  ShieldCheck, Check, Scale, BookOpen, User, 
  FileText, ArrowRight, Shield, AlertCircle, ExternalLink 
} from 'lucide-react';
import { EvaluationTableRow } from './types';

interface LegalProceduralBasisPanelProps {
  selectedRow: EvaluationTableRow;
  onOpenRegulation?: (regulationName: string) => void;
  onTriggerUnauthorized?: (action: string, reason: string) => void;
}

export default function LegalProceduralBasisPanel({
  selectedRow,
  onOpenRegulation,
  onTriggerUnauthorized
}: LegalProceduralBasisPanelProps) {
  const [activeTab, setActiveTab] = useState<'action' | 'procedure' | 'legal' | 'evidence'>('action');

  return (
    <div className="bg-[#0b1220] border border-slate-800/80 rounded-xl p-4 flex flex-col h-full shadow-lg shadow-black/40">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 shrink-0">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Legal & Procedural Basis
          </h2>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          VERIFIED
        </span>
      </div>

      {/* Subtabs */}
      <div className="flex items-center gap-1 my-3 bg-slate-900/80 p-1 rounded-lg border border-slate-800 shrink-0 text-xs">
        {[
          { id: 'action', label: 'Action Basis' },
          { id: 'procedure', label: 'Procedure' },
          { id: 'legal', label: 'Legal Basis' },
          { id: 'evidence', label: 'Evidence' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-1 text-center font-medium rounded-md transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel Body */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs">
        {/* 1. Action Basis Card */}
        <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800/60 pb-1.5 flex justify-between items-center">
            <span>Action Record</span>
            <span className="text-cyan-400 font-mono">{selectedRow.auditEventId}</span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Action:</span>
              <span className="text-white font-semibold">Submit Technical Score</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Actor:</span>
              <span className="text-cyan-300 font-semibold">{selectedRow.evaluatorId} ({selectedRow.evaluatorName})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Role:</span>
              <span className="text-slate-200">Evaluation Committee Member</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Timestamp:</span>
              <span className="text-slate-300">{selectedRow.evaluatorCommentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Tender:</span>
              <span className="text-slate-300">KETRACO/PROC/2026/041</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stage:</span>
              <span className="text-cyan-400 font-semibold">Stage 05 (Technical)</span>
            </div>
          </div>
        </div>

        {/* 2. Procedural Basis Checklist */}
        <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800/60 pb-1.5">
            Procedural Compliance Checklist
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-start gap-2 text-slate-200">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-100">Applicable criterion:</span>{' '}
                <span className="text-slate-400">{selectedRow.criterionId} — {selectedRow.requirement}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-200">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-100">Approved tender document:</span>{' '}
                <span className="text-slate-400">KETRACO Standard Tender Document v2.1</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-200">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-100">Institutional procedure:</span>{' '}
                <span className="text-slate-400">Procurement Procedures Manual (rev 2020)</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-slate-200">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-100">Delegated authority:</span>{' '}
                <span className="text-slate-400">Evaluation Committee Mandate (TEC-001)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Legal Basis Statutory Provisions */}
        <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800/60 pb-1.5 flex justify-between items-center">
            <span>Statutory Provisions</span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              BINDING
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            {/* PPADA 2015 */}
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-cyan-300 font-mono">PPADA 2015 — SEC 79</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">VERIFIED PROVISION</span>
              </div>
              <p className="text-slate-400 text-[10.5px] leading-relaxed">
                Requires responsive tenders to be evaluated strictly against criteria set out in the tender document.
              </p>
            </div>

            {/* PPADR 2020 */}
            <div className="p-2 rounded bg-slate-900/60 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-300 font-mono">PPADR 2020 — REG 74</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">VERIFIED REGULATION</span>
              </div>
              <p className="text-slate-400 text-[10.5px] leading-relaxed">
                Mandates individual evaluator scoring sheets and statutory consensus moderation procedures.
              </p>
            </div>

            {/* Procurement Guidance */}
            <div className="flex items-center justify-between text-slate-300 pt-1">
              <span className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                Public Procurement Manual
              </span>
              <span className="text-[9px] font-mono text-slate-400">Section 4.3</span>
            </div>

            {/* Institutional Policy */}
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-400" />
                KETRACO Integrity Policy
              </span>
              <span className="text-[9px] font-mono text-slate-400">Anti-Collusion</span>
            </div>
          </div>
        </div>

        {/* 4. Evidence Linkage & Integrity */}
        <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800/60 pb-1.5 flex justify-between items-center">
            <span>Evidence Document Integrity</span>
            <span className="text-[9px] font-mono text-cyan-400">SHA-256</span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Doc Ref:</span>
              <span className="text-cyan-300 font-bold">{selectedRow.evidenceDocId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">File:</span>
              <span className="text-slate-200 truncate max-w-[150px]">{selectedRow.evidenceDocName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Version:</span>
              <span className="text-slate-300">v1.2 (Signed & Timestamped)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="text-emerald-400 font-bold">VERIFIED BY RAG OCR</span>
            </div>
          </div>
        </div>

        {/* 5. Human Accountability & Sign-Off */}
        <div className="bg-[#080d19] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="text-[10px] uppercase font-mono font-bold text-slate-400 border-b border-slate-800/60 pb-1.5 flex justify-between items-center">
            <span>Human Accountability Chain</span>
            <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
              <ShieldCheck className="w-2.5 h-2.5" />
              AUTHORIZED
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Decision-Maker:</span>
              <span className="text-slate-100 font-bold">{selectedRow.evaluatorId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Approval Path:</span>
              <span className="text-cyan-300 text-[10px] font-bold">
                E-017 → E-021 → C-001
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Audit Status:</span>
              <span className="text-emerald-400 font-bold">CRYPTOGRAPHICALLY SEALED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
