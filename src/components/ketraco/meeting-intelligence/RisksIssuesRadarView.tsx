import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldAlert,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  Building
} from 'lucide-react';
import type { RiskItem } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  risks: RiskItem[];
  onCreateRisk: (risk: Partial<RiskItem>) => Promise<void>;
}

export const RisksIssuesRadarView: React.FC<Props> = ({
  risks,
  onCreateRisk
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newSeverity, setNewSeverity] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newLikelihood, setNewLikelihood] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('HIGH');
  const [newMitigation, setNewMitigation] = useState('');
  const [newOwner, setNewOwner] = useState('Eng. Patrick Odhiambo');
  const [newProject, setNewProject] = useState('PRJ-SCM-MOD-2025');

  const filtered = risks.filter(r =>
    r.risk_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.mitigation_plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateRisk({
      risk_title: newTitle.trim(),
      severity: newSeverity,
      likelihood: newLikelihood,
      mitigation_plan: newMitigation,
      owner: newOwner,
      project_id: newProject,
      status: 'OPEN'
    });

    setNewTitle('');
    setNewMitigation('');
    setShowModal(false);
  };

  const getSeverityBadge = (s: string) => {
    switch (s) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'HIGH':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'MEDIUM':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Grid Infrastructure & Statutory Risk Radar
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Real-time vulnerability monitoring across wayleaves, procurement exposure, and grid commissioning dependencies.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Register Risk
        </button>
      </div>

      {/* Search */}
      <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search risks by title, mitigation strategy, lead engineer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
        />
      </div>

      {/* Risk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((risk) => (
          <div
            key={risk.id}
            className="bg-[#0c1220] border border-slate-800 hover:border-rose-500/40 rounded-xl p-5 shadow-lg transition-all space-y-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${getSeverityBadge(risk.severity)}`}>
                  {risk.severity} Severity
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Likelihood: {risk.likelihood}
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {risk.status}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-100">
              {risk.risk_title}
            </h3>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                Mitigation Strategy:
              </span>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-2.5 rounded border border-slate-800">
                {risk.mitigation_plan}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Owner: <strong className="text-slate-200">{risk.owner}</strong></span>
              {risk.project_id && <span>Project: {risk.project_id}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1523] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Log Vulnerability / Risk
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Risk Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geotechnical soil instability at Tower 124"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Severity</label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Likelihood</label>
                  <select
                    value={newLikelihood}
                    onChange={(e) => setNewLikelihood(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Mitigation Action Plan</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Specify immediate remediation and engineering controls..."
                  value={newMitigation}
                  onChange={(e) => setNewMitigation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-500 text-slate-950 font-bold text-xs hover:bg-rose-400 cursor-pointer"
                >
                  Register Risk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
