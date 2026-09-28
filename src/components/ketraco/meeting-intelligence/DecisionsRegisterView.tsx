import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Filter,
  Search,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Award,
  Layers
} from 'lucide-react';
import type { DecisionRecord, DecisionStatus } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  decisions: DecisionRecord[];
  onApproveDecision: (id: string, actor: string) => Promise<void>;
  onUpdateStatus: (id: string, status: DecisionStatus, notes?: string) => Promise<void>;
  onCreateDecision: (decision: Partial<DecisionRecord>) => Promise<void>;
}

export const DecisionsRegisterView: React.FC<Props> = ({
  decisions,
  onApproveDecision,
  onUpdateStatus,
  onCreateDecision
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // New Decision Form State
  const [newTitle, setNewTitle] = useState('');
  const [newAuthority, setNewAuthority] = useState('SCM Committee');
  const [newOwner, setNewOwner] = useState('Kamuren Wanjau');
  const [newEvidence, setNewEvidence] = useState('');
  const [newProject, setNewProject] = useState('PRJ-SCM-MOD-2025');

  const filteredDecisions = decisions.filter(d => {
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateDecision({
      title: newTitle.trim(),
      authority: newAuthority,
      owner: newOwner,
      evidence_text: newEvidence,
      project_id: newProject,
      status: 'AWAITING_APPROVAL',
      code: `D-0${Math.floor(250 + Math.random() * 50)}`,
      confidence: 95
    });

    setNewTitle('');
    setNewEvidence('');
    setShowCreateModal(false);
  };

  const getStatusBadge = (status: DecisionStatus) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'IMPLEMENTING':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'IMPLEMENTED':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'REJECTED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'DEFERRED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Metric Bar */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Statutory Decision Register
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Immutable log of resolutions, statutory mandates, and project sign-offs under PPADA & KETRACO governance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Propose Resolution
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1220] border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search decisions by code, resolution title, owner..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded px-2.5 py-1.5 font-mono"
          >
            <option value="ALL">All Statuses ({decisions.length})</option>
            <option value="AWAITING_APPROVAL">Awaiting Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="IMPLEMENTING">Implementing</option>
            <option value="IMPLEMENTED">Implemented</option>
            <option value="DEFERRED">Deferred</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Decisions Feed */}
      <div className="space-y-3">
        {filteredDecisions.map((dec) => (
          <div
            key={dec.id}
            className="bg-[#0c1220] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded border border-cyan-500/30">
                    {dec.code}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getStatusBadge(dec.status)}`}>
                    {dec.status.replace(/_/g, ' ')}
                  </span>
                  {dec.confidence && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {dec.confidence}% AI Grounding
                    </span>
                  )}
                  {dec.project_id && (
                    <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      {dec.project_id}
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-slate-100 pt-1">
                  {dec.title}
                </h3>
              </div>

              {/* Status Action Controls */}
              <div className="flex items-center gap-2 shrink-0">
                {dec.status === 'AWAITING_APPROVAL' && (
                  <button
                    onClick={() => onApproveDecision(dec.id, 'Kamuren Wanjau (Operations Director)')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" /> Sign-off Decision
                  </button>
                )}

                {dec.status === 'APPROVED' && (
                  <button
                    onClick={() => onUpdateStatus(dec.id, 'IMPLEMENTING', 'Initiated deployment')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5" /> Begin Implementation
                  </button>
                )}

                {dec.status === 'IMPLEMENTING' && (
                  <button
                    onClick={() => onUpdateStatus(dec.id, 'IMPLEMENTED', 'Fully verified in field')}
                    className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Complete Execution
                  </button>
                )}

                <button
                  onClick={() => setExpandedId(expandedId === dec.id ? null : dec.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer font-mono"
                >
                  {expandedId === dec.id ? 'Hide' : 'Audit'}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedId === dec.id ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>

            {/* Core Metadata line */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/60 gap-2">
              <div className="flex items-center gap-4">
                <span>Authority: <strong className="text-slate-300">{dec.authority}</strong></span>
                <span>Lead: <strong className="text-slate-300">{dec.owner}</strong></span>
                <span>Meeting: <span className="text-slate-400 font-mono">{dec.meeting_name}</span></span>
              </div>
              {dec.approved_by && (
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Approved by {dec.approved_by}
                </span>
              )}
            </div>

            {/* Expanded Evidence & Audit Trail */}
            {expandedId === dec.id && (
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-3 text-xs bg-slate-950/40 p-4 rounded-lg">
                {dec.evidence_text && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-mono text-cyan-400 font-semibold uppercase">
                      Verbatim Hearing Citation / Evidence:
                    </span>
                    <p className="text-slate-300 italic bg-slate-900/60 p-2 rounded border border-slate-800">
                      "{dec.evidence_text}"
                    </p>
                  </div>
                )}

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
                    Governance Audit Ledger:
                  </span>
                  <div className="space-y-1 font-mono text-[11px]">
                    {dec.audit_trail.map((at, idx) => (
                      <div key={idx} className="flex items-center justify-between text-slate-400 bg-slate-900/30 px-2 py-1 rounded">
                        <span><strong>{at.action}</strong> by {at.user}</span>
                        <span className="text-slate-500">{at.timestamp.split('T')[0]} - {at.note}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Propose Resolution Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1523] border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase font-mono flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" /> Propose Statutory Resolution
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Resolution Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Approve Suswa-Isinya Line EPC Evaluation Report"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Authority Body</label>
                  <select
                    value={newAuthority}
                    onChange={(e) => setNewAuthority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="SCM Committee">SCM Committee</option>
                    <option value="Board of Directors">Board of Directors</option>
                    <option value="Operations Director">Operations Director</option>
                    <option value="Managing Director & CEO">Managing Director & CEO</option>
                    <option value="Tender Evaluation Committee">Tender Evaluation Committee</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Lead Responsible Officer</label>
                  <input
                    type="text"
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Citing Evidence / Basis</label>
                <textarea
                  rows={2}
                  placeholder="Reference transcript, minutes, or technical audit memo..."
                  value={newEvidence}
                  onChange={(e) => setNewEvidence(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 cursor-pointer"
                >
                  Commit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
