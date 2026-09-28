import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  Plus,
  Filter,
  Search,
  Check,
  Send,
  Zap,
  ArrowUpRight,
  ShieldCheck,
  FileCheck,
  ChevronDown,
  X
} from 'lucide-react';
import type { ActionControlItem, ActionStatus } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  actions: ActionControlItem[];
  onCreateAction: (action: Partial<ActionControlItem>) => Promise<void>;
  onUpdateStatus: (id: string, status: ActionStatus) => Promise<void>;
  onEscalate: (id: string, reason: string) => Promise<void>;
  onVerify: (id: string, notes: string) => Promise<void>;
  onExecuteWorkflow: (id: string) => Promise<void>;
}

export const ActionControlQueueView: React.FC<Props> = ({
  actions,
  onCreateAction,
  onUpdateStatus,
  onEscalate,
  onVerify,
  onExecuteWorkflow
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [verifyModalActionId, setVerifyModalActionId] = useState<string | null>(null);
  const [verifyNotes, setVerifyNotes] = useState('');
  const [escalateModalActionId, setEscalateModalActionId] = useState<string | null>(null);
  const [escalateReason, setEscalateReason] = useState('');

  // Create form
  const [newTitle, setNewTitle] = useState('');
  const [newOwner, setNewOwner] = useState('John Kamau');
  const [newDepartment, setNewDepartment] = useState('SCM');
  const [newDueDate, setNewDueDate] = useState('2025-09-15');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');

  const filteredActions = actions.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch =
      a.action_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateAction({
      action_title: newTitle.trim(),
      owner: newOwner,
      department: newDepartment,
      due_date: newDueDate,
      priority: newPriority,
      status: 'ON_TRACK',
      dependencies: []
    });

    setNewTitle('');
    setShowCreateModal(false);
  };

  const handleConfirmVerify = async () => {
    if (!verifyModalActionId) return;
    await onVerify(verifyModalActionId, verifyNotes || 'Formal evidence verified against specification.');
    setVerifyModalActionId(null);
    setVerifyNotes('');
  };

  const handleConfirmEscalate = async () => {
    if (!escalateModalActionId) return;
    await onEscalate(escalateModalActionId, escalateReason || 'Overdue milestone impacting grid synchronization.');
    setEscalateModalActionId(null);
    setEscalateReason('');
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-slate-700/50 text-slate-300 border-slate-600';
    }
  };

  const getStatusBadge = (s: ActionStatus) => {
    switch (s) {
      case 'COMPLETED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'UNDER_VERIFICATION':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'OVERDUE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'AT_RISK':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Action Control & Closed-Loop Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Autonomous tracking from owner assignment to evidence verification, escalations, and Mission Control synchronization.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Assign Action
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0c1220] border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search actions by task title, owner, department..."
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
            <option value="ALL">All Actions ({actions.length})</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="OVERDUE">Overdue / Escalated</option>
            <option value="UNDER_VERIFICATION">Under Verification</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Action Queue List */}
      <div className="space-y-3">
        {filteredActions.map((act) => (
          <div
            key={act.id}
            className="bg-[#0c1220] border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg transition-all space-y-3"
          >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getStatusBadge(act.status)}`}>
                    {act.status.replace(/_/g, ' ')}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getPriorityBadge(act.priority)}`}>
                    {act.priority}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    Dept: {act.department}
                  </span>
                  {act.escalation_level > 0 && (
                    <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/30 flex items-center gap-1">
                      <AlertOctagon className="w-3 h-3" /> Escalated (Level {act.escalation_level})
                    </span>
                  )}
                </div>

                <h3 className="text-sm sm:text-base font-semibold text-slate-100">
                  {act.action_title}
                </h3>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {act.status !== 'COMPLETED' && (
                  <>
                    <button
                      onClick={() => onExecuteWorkflow(act.id)}
                      className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" /> Trigger Workflow
                    </button>

                    {act.status !== 'UNDER_VERIFICATION' && (
                      <button
                        onClick={() => onUpdateStatus(act.id, 'UNDER_VERIFICATION')}
                        className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileCheck className="w-3.5 h-3.5" /> Submit Evidence
                      </button>
                    )}

                    <button
                      onClick={() => setVerifyModalActionId(act.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Verify & Complete
                    </button>

                    <button
                      onClick={() => setEscalateModalActionId(act.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-medium text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Evidence & Dependencies preview */}
            {act.evidence_text && (
              <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-800/80">
                "{act.evidence_text}"
              </p>
            )}

            {/* Bottom Metadata */}
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 gap-2 font-mono">
              <div className="flex items-center gap-4">
                <span>Owner: <strong className="text-slate-200">{act.owner}</strong></span>
                <span>Deadline: <span className="text-cyan-400 font-bold">{act.due_date}</span></span>
                {act.source_meeting_title && (
                  <span className="hidden sm:inline">From: {act.source_meeting_title}</span>
                )}
              </div>

              {act.verified_by && (
                <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified by {act.verified_by}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      {verifyModalActionId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1523] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase font-mono flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verify Action Completion
            </h3>
            <p className="text-xs text-slate-300">
              Confirm that substantive evidence has been inspected and satisfies KETRACO technical/statutory criteria.
            </p>
            <textarea
              rows={3}
              placeholder="Enter verification rationale / report citation..."
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setVerifyModalActionId(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmVerify}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 cursor-pointer"
              >
                Confirm Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Escalation Modal */}
      {escalateModalActionId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1523] border border-rose-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-rose-400 uppercase font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" /> Escalate Action to Executive
            </h3>
            <p className="text-xs text-slate-300">
              This action will be formally flagged as OVERDUE and escalated to the Operations Director & Managing Director.
            </p>
            <textarea
              rows={3}
              placeholder="State reason for statutory escalation..."
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setEscalateModalActionId(null)}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEscalate}
                className="px-3.5 py-1.5 rounded-lg bg-rose-500 text-slate-950 font-bold text-xs hover:bg-rose-400 cursor-pointer"
              >
                Execute Escalation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Action Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1523] border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase font-mono flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Assign Governance Action Control
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
                <label className="text-slate-300 font-medium block mb-1">Action Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Circulate amended tower technical spec to tenderers"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Assignee Lead</label>
                  <input
                    type="text"
                    required
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Department</label>
                  <select
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="SCM">Supply Chain Management</option>
                    <option value="Engineering">Grid Engineering</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal & Regulatory</option>
                    <option value="Operations">Operations & Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Target Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
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
                  Commit Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
