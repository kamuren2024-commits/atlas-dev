import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  PenTool, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { GATE_READINESS_DATA } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';

interface GateReadinessViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

export const GateReadinessView: React.FC<GateReadinessViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [selectedGateNum, setSelectedGateNum] = useState<number>(4);
  const [gateActionFeedback, setGateActionFeedback] = useState<string | null>(null);

  const activeGate = GATE_READINESS_DATA.find((g) => g.gateNumber === selectedGateNum) || GATE_READINESS_DATA[0];

  const handleSimulateSignoff = () => {
    setGateActionFeedback(`Gate ${selectedGateNum} audit dossier certified. PDS Gate Committee notified for formal minute concurrence.`);
    setTimeout(() => setGateActionFeedback(null), 4000);
  };

  return (
    <UIStateContainer moduleName="PDS Gate Readiness">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="pds-gate"
          onNavigateView={onNavigateView}
        />

        {/* Gate Readiness Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">STAGE-GATE CONTROL //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                GOVERNANCE ASSURANCE
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Project Development Services Gate Readiness & Transition Panel
            </h1>
            <p className="text-xs text-slate-400">
              Mandatory statutory compliance criteria, signatory signoff registers and evidence verification audits
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateSignoff}
              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <PenTool className="w-3.5 h-3.5" />
              Sign Off Gate Review Dossier
            </button>
          </div>
        </div>

        {gateActionFeedback && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-500/40 rounded-lg text-xs font-mono text-cyan-300 flex items-center gap-2 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{gateActionFeedback}</span>
          </div>
        )}

        {/* Gate Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {GATE_READINESS_DATA.map((g) => {
            const isSelected = g.gateNumber === selectedGateNum;

            return (
              <button
                key={g.gateNumber}
                onClick={() => setSelectedGateNum(g.gateNumber)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/50 shadow-md'
                    : 'bg-[#080d17] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-cyan-400">GATE {g.gateNumber}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded uppercase border ${
                    g.status === 'READY' ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' :
                    g.status === 'AT_RISK' ? 'text-amber-400 border-amber-500/40 bg-amber-500/10' :
                    'text-rose-400 border-rose-500/40 bg-rose-500/10'
                  }`}>
                    {g.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200 truncate">{g.gateName.split(':')[1] || g.gateName}</div>

                <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Readiness:</span>
                  <span className="text-white font-bold">{g.readinessScore}%</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Gate Dossier Panel */}
        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono text-cyan-400 font-bold block">
                GATE {activeGate.gateNumber} AUDIT DOSSIER
              </span>
              <h2 className="text-base font-semibold text-slate-100">{activeGate.gateName}</h2>
              <span className="text-xs text-slate-400 font-mono">
                Mandated Decision Authority: <strong className="text-slate-200">{activeGate.decisionAuthority}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-xs">
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Gate Readiness</span>
                <span className="text-sm font-bold text-cyan-300">{activeGate.readinessScore}%</span>
              </div>
              <div className="text-right border-l border-slate-800 pl-3">
                <span className="text-[10px] text-slate-400 block uppercase">Evidence Pack</span>
                <span className="text-sm font-bold text-emerald-400">{activeGate.evidenceCompleteness}% Complete</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Mandatory Criteria Checklist */}
            <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Mandatory Stage-Gate Verification Criteria
              </h3>

              <div className="space-y-2">
                {activeGate.mandatoryCriteria.map((crit, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 text-xs flex items-start gap-2.5"
                  >
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 ${
                      crit.met ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}>
                      {crit.met ? '✓' : '✕'}
                    </span>

                    <div className="space-y-1 flex-1">
                      <div className="text-slate-200 leading-snug">{crit.criterion}</div>
                      <div className="text-[10px] font-mono text-slate-400">
                        Evidence Ref: <span className="text-cyan-300">{crit.evidenceRef}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Signatory Blocks & Actions */}
            <div className="space-y-3">
              {/* Formal Signatories */}
              <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
                <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <PenTool className="w-3.5 h-3.5 text-purple-400" />
                  Authorized Governance Signatories
                </h3>

                <div className="space-y-2">
                  {activeGate.approvals.map((sig, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80 text-xs flex items-center justify-between font-mono"
                    >
                      <div>
                        <div className="text-slate-200 font-semibold">{sig.name}</div>
                        <div className="text-[10px] text-slate-400">Signee: {sig.signee}</div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                        sig.signed ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
                      }`}>
                        {sig.signed ? 'SIGNED & SEALED' : 'PENDING SIGNATURE'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Outstanding Actions */}
              <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 space-y-2 text-xs">
                <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Prerequisite Actions Before Gate Passage
                </h3>

                <ul className="space-y-1 text-slate-300">
                  {activeGate.actions.map((act, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
                      <span className="text-cyan-400 font-mono text-[10px]">•</span>
                      <span>{act}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </UIStateContainer>
  );
};
