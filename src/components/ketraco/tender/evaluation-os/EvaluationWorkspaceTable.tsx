import React, { useState, useMemo } from 'react';
import { 
  Search, FileDown, Check, User, FileText, CheckCircle2, 
  ExternalLink, Sparkles, AlertCircle, ArrowUpRight, ChevronRight,
  Shield, Layers, Sliders, Scale, GitBranch, MessageSquare, Clock,
  RefreshCw, FileCheck, ShieldCheck, XCircle, AlertTriangle, X, Send
} from 'lucide-react';
import { EvaluationTableRow } from './types';

interface EvaluationWorkspaceTableProps {
  rows: EvaluationTableRow[];
  selectedRowId: string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectRow: (id: string) => void;
  onExportReport?: () => void;
  onViewAIDetails?: (row: EvaluationTableRow) => void;
  onViewProvenanceGraph?: () => void;
  onTriggerUnauthorized?: (action: string, reason: string) => void;
  onSubmitScore?: (input: {
    bidderId: string;
    criterionCode: string;
    evaluatorId: string;
    evaluatorName: string;
    score: number;
    rationale: string;
    comments?: string;
  }) => Promise<any>;
  onRequestClarification?: (input: {
    bidderId: string;
    criterionCode: string;
    details: string;
  }) => Promise<any>;
}

export default function EvaluationWorkspaceTable({
  rows,
  selectedRowId,
  loading = false,
  error = null,
  onRetry,
  onSelectRow,
  onExportReport,
  onViewAIDetails,
  onViewProvenanceGraph,
  onTriggerUnauthorized,
  onSubmitScore,
  onRequestClarification
}: EvaluationWorkspaceTableProps) {
  const [activeSubtab, setActiveSubtab] = useState<'table' | 'evidence' | 'graph' | 'ai'>('table');
  const [detailSubtab, setDetailSubtab] = useState<
    'evidence' | 'comments' | 'justification' | 'legal' | 'approval' | 'audit'
  >('evidence');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Scoring Modal State
  const [isScoringModalOpen, setIsScoringModalOpen] = useState(false);
  const [scoreFormInput, setScoreFormInput] = useState({
    score: 90,
    rationale: '',
    comments: '',
    evaluatorId: 'E-017',
    evaluatorName: 'Eng. K. Kiprop'
  });
  const [scoreSubmitting, setScoreSubmitting] = useState(false);
  const [scoreSubmitSuccess, setScoreSubmitSuccess] = useState<string | null>(null);
  const [scoreSubmitError, setScoreSubmitError] = useState<string | null>(null);

  // Clarification Modal State
  const [isClarificationModalOpen, setIsClarificationModalOpen] = useState(false);
  const [clarificationDetails, setClarificationDetails] = useState('');
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false);
  const [clarificationSuccess, setClarificationSuccess] = useState<string | null>(null);

  const selectedRow = useMemo(() => {
    return rows.find(r => r.id === selectedRowId) || rows[0];
  }, [rows, selectedRowId]);

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.toLowerCase();
    return rows.filter(
      r =>
        r.bidderId.toLowerCase().includes(q) ||
        r.bidderName.toLowerCase().includes(q) ||
        r.requirement.toLowerCase().includes(q) ||
        r.criterionId.toLowerCase().includes(q) ||
        r.evidenceDocId.toLowerCase().includes(q) ||
        r.evaluatorId.toLowerCase().includes(q) ||
        r.legalBasis.toLowerCase().includes(q)
    );
  }, [rows, searchQuery]);

  return (
    <div className="bg-[#0b1220] border border-slate-800/80 rounded-xl p-4 flex flex-col min-h-[580px] shadow-lg shadow-black/40">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/70 shrink-0">
        {/* Left: Subtabs */}
        <div className="flex items-center gap-1">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider mr-2 hidden md:block">
            Evaluation Workspace
          </h2>
          <div className="flex items-center bg-slate-900/80 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'table', label: 'Evaluation Table' },
              { id: 'evidence', label: 'Evidence & Analysis' },
              { id: 'graph', label: 'Provenance Graph' },
              { id: 'ai', label: 'AI Insights' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveSubtab(tab.id as any);
                  if (tab.id === 'graph') onViewProvenanceGraph?.();
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeSubtab === tab.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Search + Export */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bidders, criteria, evidence..."
              className="bg-slate-900/90 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-48 sm:w-60 font-mono transition-all"
            />
          </div>

          <button
            type="button"
            onClick={onExportReport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 text-xs font-semibold cursor-pointer transition-all shadow-[0_0_10px_rgba(0,225,255,0.1)]"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Error State Banner */}
      {error && (
        <div className="my-2 p-3 rounded-lg bg-rose-950/30 border border-rose-500/40 flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2.5 py-1 rounded bg-rose-900/40 hover:bg-rose-900/70 border border-rose-500/30 text-rose-200 text-xs font-mono flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="my-3 space-y-2 animate-pulse">
          <div className="h-10 bg-slate-900/80 rounded-lg border border-slate-800" />
          <div className="h-14 bg-slate-900/50 rounded-lg border border-slate-800/60" />
          <div className="h-14 bg-slate-900/50 rounded-lg border border-slate-800/60" />
          <div className="h-14 bg-slate-900/50 rounded-lg border border-slate-800/60" />
          <div className="h-32 bg-slate-900/40 rounded-xl border border-slate-800/50 mt-4" />
        </div>
      ) : (
        <>
          {/* Main Table Container */}
          <div className="overflow-x-auto my-3 border border-slate-800/80 rounded-lg bg-[#070d18] max-h-[300px]">
            {filteredRows.length === 0 ? (
              <div className="py-12 px-4 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                <div className="text-sm font-semibold text-slate-200">No evaluation records found</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No bidders or criteria match "{searchQuery}". Clear your search query to view the full dataset.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold cursor-pointer hover:bg-cyan-900/50"
                >
                  Clear Search Filter
                </button>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#0b1426] text-slate-400 font-mono text-[10.5px] uppercase tracking-wider sticky top-0 z-10 border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Bidder</th>
                    <th className="py-2.5 px-3 font-semibold">Requirement</th>
                    <th className="py-2.5 px-3 font-semibold">Evidence</th>
                    <th className="py-2.5 px-3 font-semibold">Criterion</th>
                    <th className="py-2.5 px-3 font-semibold">Weight</th>
                    <th className="py-2.5 px-3 font-semibold">AI Analysis</th>
                    <th className="py-2.5 px-3 font-semibold">Human Score</th>
                    <th className="py-2.5 px-3 font-semibold">Variance</th>
                    <th className="py-2.5 px-3 font-semibold">Evaluator</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Compliance</th>
                    <th className="py-2.5 px-3 font-semibold">Legal Basis</th>
                    <th className="py-2.5 px-3 font-semibold">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredRows.map((row) => {
                    const isSelected = row.id === selectedRow?.id;
                    const isNegativeVariance = row.variancePercent < 0;

                    return (
                      <tr
                        key={row.id}
                        onClick={() => onSelectRow(row.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-cyan-950/40 text-white font-medium border-l-2 border-l-cyan-400'
                            : 'hover:bg-slate-850/50 text-slate-300 hover:text-white'
                        }`}
                      >
                        {/* Bidder */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 font-bold text-cyan-300">
                            <User className="w-3 h-3 text-cyan-400" />
                            <span>{row.bidderId}</span>
                          </div>
                        </td>

                        {/* Requirement */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-sans font-medium text-slate-200">
                          {row.requirement}
                        </td>

                        {/* Evidence */}
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="inline-flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-950/50 px-1.5 py-0.5 rounded border border-cyan-500/20">
                            <FileText className="w-2.5 h-2.5 text-cyan-400" />
                            <span>{row.evidenceDocId}</span>
                          </div>
                        </td>

                        {/* Criterion */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 font-bold">
                          {row.criterionId}
                        </td>

                        {/* Weight */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                          {row.weightPercent}%
                        </td>

                        {/* AI Analysis */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-cyan-300 font-semibold">
                          {row.aiAnalysisPercent}%
                        </td>

                        {/* Human Score */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-200">
                          {row.humanScore}
                        </td>

                        {/* Variance */}
                        <td className="py-2.5 px-3 whitespace-nowrap font-bold">
                          <span className={isNegativeVariance ? 'text-rose-400' : 'text-emerald-400'}>
                            {row.variancePercent > 0 ? `+${row.variancePercent}%` : `${row.variancePercent}%`}
                          </span>
                        </td>

                        {/* Evaluator */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400">
                          {row.evaluatorId}
                        </td>

                        {/* Compliance Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center">
                          {row.isCompliant ? (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-400" title="Compliant">
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-rose-950/70 border border-rose-500/40 text-rose-400" title="Non-Compliant">
                              <XCircle className="w-3 h-3" />
                            </span>
                          )}
                        </td>

                        {/* Legal Basis */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-300 font-sans text-[11px]">
                          {row.legalBasis}
                        </td>

                        {/* Audit ID */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 font-mono text-[10.5px]">
                          {row.auditEventId}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Selected Row Detail / Expansion Card below table */}
          {selectedRow && (
            <div className="border border-slate-800 rounded-xl bg-[#090f1d] p-3.5 shrink-0 space-y-3 shadow-md mt-2">
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-xs">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{selectedRow.bidderId} — {selectedRow.bidderName}</span>
                  </div>
                  <span className="text-xs font-bold text-white">
                    {selectedRow.requirement} ({selectedRow.criterionId})
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Weight: {selectedRow.weightPercent}%
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Compliant
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-slate-300">
                    Human Score: <strong className="text-emerald-400 font-bold">{selectedRow.humanScore}</strong>
                  </span>
                  <span className="text-slate-300">
                    AI Analysis: <strong className="text-cyan-400 font-bold">{selectedRow.aiAnalysisPercent}%</strong>
                  </span>
                  <span className="text-slate-300">
                    Variance: <strong className={selectedRow.variancePercent < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {selectedRow.variancePercent > 0 ? `+${selectedRow.variancePercent}%` : `${selectedRow.variancePercent}%`}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Subtabs for Detail Card */}
              <div className="flex items-center gap-2 overflow-x-auto text-xs pb-1">
                {[
                  { id: 'evidence', label: 'Evidence & Analysis' },
                  { id: 'comments', label: 'Evaluator Comments' },
                  { id: 'justification', label: 'Justification' },
                  { id: 'legal', label: 'Legal / Procedural Basis' },
                  { id: 'approval', label: 'Approval & Quorum' },
                  { id: 'audit', label: 'Audit History' }
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setDetailSubtab(st.id as any)}
                    className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                      detailSubtab === st.id
                        ? 'bg-cyan-950/80 text-cyan-300 font-bold border border-cyan-500/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Dynamic Content based on Detail Subtab */}
              {detailSubtab === 'comments' ? (
                <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white text-xs">Evaluator Official Remarks</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">Recorded: {selectedRow.evaluatorCommentDate}</span>
                  </div>
                  <blockquote className="text-xs text-slate-200 italic bg-slate-900/60 p-3 rounded-lg border-l-2 border-cyan-400 leading-relaxed">
                    "{selectedRow.evaluatorComment}"
                  </blockquote>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono pt-1 text-slate-300">
                    <div>Evaluator: <strong className="text-white">{selectedRow.evaluatorName} ({selectedRow.evaluatorId})</strong></div>
                    <div>Score Assigned: <strong className="text-emerald-400">{selectedRow.humanScore}/100</strong></div>
                    <div>Digital Signature: <strong className="text-cyan-400">Verified RSA-SHA256</strong></div>
                  </div>
                </div>
              ) : detailSubtab === 'justification' ? (
                <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white text-xs">Statutory Justification & Evaluation Rationale</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                      THRESHOLD MET
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/40 p-3 rounded-lg">
                    {selectedRow.justification}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1">
                    <span className="text-slate-400">Minimum Technical Pass Threshold: <strong className="text-white font-mono">75%</strong></span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setScoreFormInput({
                            score: selectedRow.humanScore,
                            rationale: selectedRow.justification || '',
                            comments: selectedRow.evaluatorComment || '',
                            evaluatorId: selectedRow.evaluatorId || 'E-017',
                            evaluatorName: selectedRow.evaluatorName || 'Eng. K. Kiprop'
                          });
                          setScoreSubmitSuccess(null);
                          setScoreSubmitError(null);
                          setIsScoringModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Record / Update Score</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClarificationSuccess(null);
                          setIsClarificationModalOpen(true);
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 font-semibold text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Request Clarification</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : detailSubtab === 'legal' ? (
                <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white text-xs">Statutory & Procedural Governance Framework</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                      {selectedRow.legalBasisStatus}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-300">
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                      <div className="font-bold text-cyan-300 font-mono">{selectedRow.legalBasis}</div>
                      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                        Public Procurement and Asset Disposal Act (PPADA 2015) mandates that all responsive bids must be evaluated against the criteria stated in the tender document without modification or introducing new criteria during evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              ) : detailSubtab === 'approval' ? (
                <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-white text-xs">Committee Quorum & Resolution Status</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                      QUORUM 5/5 VERIFIED
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Tender Evaluation Committee</div>
                      <div className="text-white font-semibold">TEC-001 (Technical Evaluation Sub-Committee)</div>
                      <div className="text-[11px] text-emerald-400 font-mono">Consensus Resolution: RES-2026-TEC-041</div>
                    </div>
                    <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-mono">Accounting Officer Signoff</div>
                      <div className="text-white font-semibold">Awaiting Final Consolidation</div>
                      <div className="text-[11px] text-cyan-400 font-mono">Schedule: Stage 10 (Approval)</div>
                    </div>
                  </div>
                </div>
              ) : detailSubtab === 'audit' ? (
                <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3.5 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan-400" />
                      <span className="font-bold text-white text-xs">Cryptographic Audit Trail</span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
                      {selectedRow.auditEventId}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Record ID:</span>
                      <span>{selectedRow.auditEventId}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Actor Identity:</span>
                      <span>{selectedRow.evaluatorId} ({selectedRow.evaluatorName})</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">SHA-256 Ledger Stamp:</span>
                      <span className="text-cyan-400 truncate max-w-[260px]">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-500">Integrity Verification:</span>
                      <span className="text-emerald-400 font-bold">TAMPER-PROOF VERIFIED</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Default: 4 Cards Grid inside Detail View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Card 1: Document Evidence */}
                  <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded bg-blue-950/60 border border-blue-500/30 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <div>
                          <div className="font-mono font-bold text-cyan-300 text-[11px]">
                            {selectedRow.evidenceDocId}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]" title={selectedRow.evidenceDocName}>
                            {selectedRow.evidenceDocName}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                        Verified
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-400 border-t border-slate-800/60 pt-2 space-y-1">
                      <div className="text-[9px] uppercase font-mono text-slate-400 font-semibold">
                        Extracted Information
                      </div>
                      {selectedRow.extractedInfo.map((info, i) => (
                        <div key={i} className="flex items-center gap-1 text-slate-300 truncate">
                          <span className="text-cyan-400">•</span>
                          <span>{info}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card 2: AI Analysis */}
                  <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        AI Analysis
                      </span>
                      <span className="text-[11px] font-mono font-bold text-cyan-400">
                        Confidence: {selectedRow.aiMetrics.confidence}%
                      </span>
                    </div>

                    <div className="space-y-1 text-[10.5px] text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">• Requirement match:</span>
                        <span className="font-mono text-slate-200">{selectedRow.aiMetrics.requirementMatch}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">• Completeness:</span>
                        <span className="font-mono text-slate-200">{selectedRow.aiMetrics.completeness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">• Risk indicators:</span>
                        <span className="font-mono text-emerald-400 font-bold">{selectedRow.aiMetrics.riskLevel}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onViewAIDetails?.(selectedRow)}
                      className="w-full mt-2 py-1 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 rounded text-[10px] font-bold text-cyan-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      <span>View AI Details</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Card 3: Evaluator Comments */}
                  <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="text-[10px] uppercase font-mono font-bold text-slate-400 mb-1">
                        Evaluator Comments
                      </div>
                      <p className="text-[11px] text-slate-300 italic line-clamp-3 leading-relaxed">
                        "{selectedRow.evaluatorComment}"
                      </p>
                    </div>

                    <div className="border-t border-slate-800/60 pt-1.5 text-[10px] font-mono text-slate-400 flex justify-between">
                      <span>By: {selectedRow.evaluatorId}</span>
                      <span>{selectedRow.evaluatorCommentDate}</span>
                    </div>
                  </div>

                  {/* Card 4: Action Pipeline */}
                  <div className="bg-[#070b14] border border-slate-800 rounded-lg p-3 space-y-2">
                    <div className="text-[9.5px] uppercase font-mono font-bold text-cyan-400 tracking-tight">
                      ACTION → LAW → EVIDENCE → DECISION
                    </div>

                    <div className="space-y-1.5 text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                        <span className="text-slate-400">Action:</span>
                        <span className="truncate">Score Submitted ({selectedRow.evaluatorId})</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                        <span className="text-slate-400">Criterion:</span>
                        <span className="truncate">{selectedRow.criterionId} - {selectedRow.criterionName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        <span className="text-slate-400">Evidence:</span>
                        <span className="truncate">{selectedRow.evidenceDocId}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-300 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        <span className="text-slate-400">Legal Basis:</span>
                        <span className="truncate">{selectedRow.legalBasis}</span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Score: <strong className="text-emerald-400">{selectedRow.humanScore}/100</strong></span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setScoreFormInput({
                              score: selectedRow.humanScore,
                              rationale: selectedRow.justification || '',
                              comments: selectedRow.evaluatorComment || '',
                              evaluatorId: selectedRow.evaluatorId || 'E-017',
                              evaluatorName: selectedRow.evaluatorName || 'Eng. K. Kiprop'
                            });
                            setScoreSubmitSuccess(null);
                            setScoreSubmitError(null);
                            setIsScoringModalOpen(true);
                          }}
                          className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
                        >
                          Record Score
                        </button>
                        <span className="text-slate-600">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            setClarificationSuccess(null);
                            setIsClarificationModalOpen(true);
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          Clarify
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- INTERACTIVE SCORE RECORDING MODAL (PPADA SECTION 80) --- */}
      {isScoringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1222] border border-cyan-500/40 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl shadow-cyan-950/50 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Statutory Score Recording & Justification
                  </h3>
                  <p className="text-[11px] font-mono text-cyan-400">
                    PPADA 2015 Section 80(4) • Criterion: {selectedRow?.criterionId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScoringModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setScoreSubmitting(true);
                setScoreSubmitError(null);
                setScoreSubmitSuccess(null);

                try {
                  if (onSubmitScore) {
                    const result = await onSubmitScore({
                      bidderId: selectedRow.bidderId,
                      criterionCode: selectedRow.criterionId,
                      evaluatorId: scoreFormInput.evaluatorId,
                      evaluatorName: scoreFormInput.evaluatorName,
                      score: Number(scoreFormInput.score),
                      rationale: scoreFormInput.rationale,
                      comments: scoreFormInput.comments
                    });
                    setScoreSubmitSuccess(`Score recorded in Ledger Block #${result.auditBlock?.blockIndex || 'LATEST'}. Hash: ${result.auditBlock?.blockHash?.slice(0, 16) || 'SHA-256 Verified'}...`);
                  } else {
                    setScoreSubmitSuccess('Score updated and validated.');
                  }
                  setTimeout(() => {
                    setIsScoringModalOpen(false);
                  }, 2000);
                } catch (err: any) {
                  setScoreSubmitError(err.message || 'Failed to submit score to database.');
                } finally {
                  setScoreSubmitting(false);
                }
              }}
              className="p-5 overflow-y-auto space-y-4 text-xs"
            >
              {scoreSubmitSuccess && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{scoreSubmitSuccess}</span>
                </div>
              )}

              {scoreSubmitError && (
                <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{scoreSubmitError}</span>
                </div>
              )}

              {/* Bidder & Evaluator Context */}
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block">Bidder:</span>
                  <strong className="text-white">{selectedRow?.bidderName} ({selectedRow?.bidderId})</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Assigned Evaluator:</span>
                  <strong className="text-cyan-300">{scoreFormInput.evaluatorName} ({scoreFormInput.evaluatorId})</strong>
                </div>
              </div>

              {/* Score Input Slider & Number */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-white uppercase tracking-wider text-[11px]">
                    Evaluator Score (0 - 100):
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono text-[11px]">AI Baseline: {selectedRow?.aiAnalysisPercent}%</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold font-mono text-sm">
                      {scoreFormInput.score} / 100
                    </span>
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={scoreFormInput.score}
                  onChange={(e) => setScoreFormInput({ ...scoreFormInput, score: Number(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                {/* Variance Warning if > 10% */}
                {Math.abs(scoreFormInput.score - (selectedRow?.aiAnalysisPercent || 0)) > 10 && (
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Statutory Variance Flag ({Math.abs(scoreFormInput.score - (selectedRow?.aiAnalysisPercent || 0))}%)</span>
                      <span className="text-[10.5px] text-amber-200/90 leading-tight block">
                        Under PPADA Regulation 74(3), score variance exceeding 10% requires exhaustive evidence-linked justification.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Justification Textarea */}
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center justify-between">
                  <span>Statutory Justification & Rationale *</span>
                  <span className="text-slate-400 font-normal font-mono text-[10px]">Required by Law</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={scoreFormInput.rationale}
                  onChange={(e) => setScoreFormInput({ ...scoreFormInput, rationale: e.target.value })}
                  placeholder="State specific technical evidence from document justifying assigned score..."
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
                />
              </div>

              {/* Evaluator Remarks */}
              <div className="space-y-1.5">
                <label className="font-bold text-white uppercase tracking-wider text-[11px]">
                  Official Evaluator Remarks (For Committee Minutes)
                </label>
                <textarea
                  rows={2}
                  value={scoreFormInput.comments}
                  onChange={(e) => setScoreFormInput({ ...scoreFormInput, comments: e.target.value })}
                  placeholder="Observations for the Tender Evaluation Committee report..."
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScoringModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scoreSubmitting}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,225,255,0.3)] disabled:opacity-50 text-xs"
                >
                  {scoreSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>{scoreSubmitting ? 'Signing & Recording...' : 'Submit Official Score'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- INTERACTIVE CLARIFICATION REQUEST MODAL (PPADA SECTION 81) --- */}
      {isClarificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b1222] border border-indigo-500/40 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Statutory Clarification Request
                  </h3>
                  <p className="text-[11px] font-mono text-indigo-400">
                    PPADA 2015 Section 81 • No Material Alterations Permitted
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClarificationModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setClarificationSubmitting(true);
                try {
                  if (onRequestClarification) {
                    await onRequestClarification({
                      bidderId: selectedRow.bidderId,
                      criterionCode: selectedRow.criterionId,
                      details: clarificationDetails
                    });
                    setClarificationSuccess('Clarification request dispatched and recorded in audit ledger.');
                  } else {
                    setClarificationSuccess('Clarification request queued for Committee Chair approval.');
                  }
                  setTimeout(() => {
                    setIsClarificationModalOpen(false);
                    setClarificationDetails('');
                  }, 2000);
                } catch (err: any) {
                  alert(err.message || 'Failed to dispatch clarification request');
                } finally {
                  setClarificationSubmitting(false);
                }
              }}
              className="p-5 space-y-4 text-xs"
            >
              {clarificationSuccess ? (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 font-mono flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{clarificationSuccess}</span>
                </div>
              ) : (
                <>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[11px] space-y-1">
                    <div>Recipient: <strong className="text-white">{selectedRow?.bidderName}</strong></div>
                    <div>Criterion Reference: <strong className="text-cyan-300">{selectedRow?.criterionId} — {selectedRow?.requirement}</strong></div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-[11px] text-indigo-200">
                    <strong>Statutory Warning:</strong> Under Section 81(2), no clarification shall be sought or permitted that changes the substance or price of the bid.
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-white uppercase tracking-wider text-[11px]">
                      Clarification Query Details *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={clarificationDetails}
                      onChange={(e) => setClarificationDetails(e.target.value)}
                      placeholder="Specify the specific ambiguity, omission, or document cross-reference requiring clarification..."
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsClarificationModalOpen(false)}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={clarificationSubmitting}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2 cursor-pointer text-xs disabled:opacity-50"
                    >
                      {clarificationSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>{clarificationSubmitting ? 'Dispatching...' : 'Dispatch Statutory Notice'}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
