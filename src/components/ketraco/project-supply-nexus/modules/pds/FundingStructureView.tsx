import React, { useState } from 'react';
import { 
  DollarSign, 
  Landmark, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  PieChart, 
  Calendar, 
  FileCheck,
  ShieldAlert
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { FUNDING_TRANCHES_DATA } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';

interface FundingStructureViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

export const FundingStructureView: React.FC<FundingStructureViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [selectedTrancheId, setSelectedTrancheId] = useState<string>(FUNDING_TRANCHES_DATA[0].id);

  const selectedTranche = FUNDING_TRANCHES_DATA.find((t) => t.id === selectedTrancheId) || FUNDING_TRANCHES_DATA[0];

  return (
    <UIStateContainer moduleName="PDS Funding Structure">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="pds-funding"
          onNavigateView={onNavigateView}
        />

        {/* Funding Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PDS GATE 3 //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                FINANCING STRUCTURE & CP TRACKER
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Capital Financing Agreement & Conditions Precedent
            </h1>
            <p className="text-xs text-slate-400">
              Multilateral concessional facilities, counterpart exchequer funding and disbursement schedules
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Total Capex Facility:</span>
            <span className="text-sm font-mono text-cyan-300 font-bold bg-cyan-950/40 px-3 py-1 rounded border border-cyan-500/30">
              KES 6,100,000,000
            </span>
          </div>
        </div>

        {/* Tranche Cards Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {FUNDING_TRANCHES_DATA.map((tranche) => {
            const isSelected = tranche.id === selectedTrancheId;

            return (
              <div
                key={tranche.id}
                onClick={() => setSelectedTrancheId(tranche.id)}
                className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-[#0a1220] border-cyan-500/50 shadow-lg'
                    : 'bg-[#080d17] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                    <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{tranche.fundingSource}</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-900 border border-slate-700 text-slate-400">
                    {tranche.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2 rounded border border-slate-800/60 my-2">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Committed</span>
                    <span className="text-white font-bold">{tranche.committedFunding}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Disbursed</span>
                    <span className="text-emerald-400 font-bold">{tranche.disbursedToDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Financing Gap:</span>
                  <span className={tranche.financingGap === 'KES 0' ? 'text-emerald-400' : 'text-rose-400'}>
                    {tranche.financingGap}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Tranche Deep Dive: Disbursement & Conditions Precedent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Disbursement Schedule */}
          <div className="bg-[#080d17] p-3.5 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              Quarterly Disbursement Tranches ({selectedTranche.fundingSource})
            </h3>

            <div className="space-y-2">
              {selectedTranche.disbursementSchedule.map((dis, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded border border-slate-800/80 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="text-slate-200 font-semibold">{dis.quarter}</span>
                  </div>

                  <span className="text-white font-bold">{dis.amount}</span>

                  <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                    dis.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                    dis.status === 'PENDING_CONDITIONS' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                    'text-slate-400 bg-slate-800/40 border-slate-700'
                  }`}>
                    {dis.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/60 text-[11px] text-slate-300">
              <strong className="text-cyan-400 block text-[10px] font-mono uppercase mb-0.5">Financier Compliance Rules:</strong>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                {selectedTranche.financierRequirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Conditions Precedent (CP) Tracker */}
          <div className="bg-[#080d17] p-3.5 rounded-lg border border-slate-800 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <FileCheck className="w-3.5 h-3.5 text-purple-400" />
              Conditions Precedent (CP) Legal Register
            </h3>

            <div className="space-y-2">
              {selectedTranche.conditionsPrecedent.map((cp, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-slate-900/60 rounded border border-slate-800/80 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-200">{cp.title}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${
                      cp.status === 'SATISFIED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      cp.status === 'IN_PROGRESS' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                      'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    }`}>
                      {cp.status}
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Statutory Compliance Due Date: <span className="text-slate-200">{cp.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-amber-950/20 rounded border border-amber-500/30 text-[11px] text-amber-300">
              <strong className="block text-[10px] font-mono uppercase mb-0.5">Financing Risk Assessment:</strong>
              {selectedTranche.financingRisk}
            </div>
          </div>
        </div>
      </div>
    </UIStateContainer>
  );
};
