import React, { useState } from 'react';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Filter,
  Search,
  Building,
  User,
  ShieldCheck,
  X
} from 'lucide-react';
import type { CommitmentRecord } from '../../../../backend/domains/meeting-intelligence/types';

interface Props {
  commitments: CommitmentRecord[];
  onCreateCommitment: (commitment: Partial<CommitmentRecord>) => Promise<void>;
}

export const CommitmentsRadarView: React.FC<Props> = ({
  commitments,
  onCreateCommitment
}) => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newParty, setNewParty] = useState('Shanghai Electric');
  const [newOwner, setNewOwner] = useState('Li Wei');
  const [newTargetDate, setNewTargetDate] = useState('2025-09-18');
  const [newEvidence, setNewEvidence] = useState('');

  const filtered = commitments.filter(c =>
    c.commitment_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.party.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await onCreateCommitment({
      commitment_title: newTitle.trim(),
      party: newParty,
      owner: newOwner,
      target_date: newTargetDate,
      evidence_ref: newEvidence,
      status: 'ACTIVE'
    });

    setNewTitle('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-slate-100 tracking-tight">
              Executive & Contractor Commitments Radar
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Formal delivery covenants made during proceedings by EPC contractors, suppliers, and KETRACO directorates.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" /> Log Commitment
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-[#0c1220] border border-slate-800/80 rounded-xl p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search commitments by covenant title, contractor/party, lead..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-none text-xs text-slate-200 placeholder-slate-500 focus:outline-none font-mono"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((com) => (
          <div
            key={com.id}
            className="bg-[#0c1220] border border-slate-800 hover:border-purple-500/40 rounded-xl p-5 shadow-lg transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {com.status}
              </span>
              <span className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Target: {com.target_date}
              </span>
            </div>

            <h3 className="text-sm font-semibold text-slate-100">
              {com.commitment_title}
            </h3>

            {com.evidence_ref && (
              <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2 rounded border border-slate-800">
                "{com.evidence_ref}"
              </p>
            )}

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-slate-500" /> {com.party}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" /> {com.owner}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0f1523] border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 uppercase font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-400" /> Log Formal Commitment
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Commitment Pledge</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deploy 2 micro-piling teams by Friday"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Covenant Party</label>
                  <input
                    type="text"
                    required
                    value={newParty}
                    onChange={(e) => setNewParty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Signatory / Lead</label>
                  <input
                    type="text"
                    required
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Target Delivery Date</label>
                <input
                  type="date"
                  required
                  value={newTargetDate}
                  onChange={(e) => setNewTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200 font-mono"
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
                  className="px-4 py-2 rounded-lg bg-purple-500 text-slate-950 font-bold text-xs hover:bg-purple-400 cursor-pointer"
                >
                  Commit Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
