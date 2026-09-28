import React, { useState } from 'react';
import { 
  FileCheck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  Filter, 
  Search, 
  ShieldCheck,
  Building,
  UploadCloud
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { REGULATORY_APPROVALS_DATA } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';

interface ApprovalsManagementViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

export const ApprovalsManagementView: React.FC<ApprovalsManagementViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredApprovals = REGULATORY_APPROVALS_DATA.filter((app) => {
    if (filterStatus !== 'ALL' && app.status !== filterStatus) return false;
    if (searchQuery && !app.approval.toLowerCase().includes(searchQuery.toLowerCase()) && !app.authority.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const approvedCount = REGULATORY_APPROVALS_DATA.filter(a => a.status === 'APPROVED').length;

  return (
    <UIStateContainer moduleName="PDS Statutory Approvals">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="pds-approvals"
          onNavigateView={onNavigateView}
        />

        {/* Approvals Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">STATUTORY REGISTER //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                REGULATORY CLEARANCE TRACKER
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Statutory Licences & Inter-Agency Approvals Management
            </h1>
            <p className="text-xs text-slate-400">
              EPRA technical licences, NEMA environmental clearances, NLC gazettements and infrastructure crossing agreements
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Statutory Compliance</span>
              <span className="text-emerald-400 font-bold">
                {approvedCount} / {REGULATORY_APPROVALS_DATA.length} Licences Active
              </span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Status:</span>
            {['ALL', 'APPROVED', 'UNDER_REVIEW', 'PENDING_SUBMISSION', 'BLOCKED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  filterStatus === st ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search approval licence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded pl-7 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Approvals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredApprovals.map((app) => (
            <div
              key={app.id}
              className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 text-xs space-y-2.5 hover:border-slate-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-cyan-400 font-bold flex items-center gap-1">
                  <Building className="w-3 h-3 text-cyan-400" />
                  {app.authority}
                </span>

                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${
                  app.status === 'APPROVED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                  app.status === 'UNDER_REVIEW' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                  app.status === 'PENDING_SUBMISSION' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                  'text-rose-400 bg-rose-500/10 border-rose-500/30'
                }`}>
                  {app.status.replace('_', ' ')}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-slate-100 text-sm leading-snug">
                  {app.approval}
                </h3>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Internal Lead: {app.owner}
                </div>
              </div>

              <div className="p-2 bg-slate-950/60 rounded border border-slate-800/80 text-[11px] font-mono space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Submission Date:</span>
                  <span className="text-slate-200">{app.submissionDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Statutory Due:</span>
                  <span className="text-slate-200">{app.dueDate}</span>
                </div>
              </div>

              <div className="text-[11px] bg-slate-900/40 p-2 rounded border border-slate-800/60">
                <strong className="text-slate-300 block text-[10px] font-mono uppercase mb-0.5">Evidence Record:</strong>
                <span className="text-cyan-300 font-mono text-[10px] break-all">{app.evidence}</span>
              </div>

              {app.blocker && (
                <div className="text-[11px] bg-amber-950/20 p-2 rounded border border-amber-500/20 text-amber-300">
                  <strong className="block text-[10px] font-mono uppercase mb-0.5">Pending Action:</strong>
                  {app.blocker}
                </div>
              )}

              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                Escalation Pathway: <span className="text-slate-300">{app.escalation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UIStateContainer>
  );
};
