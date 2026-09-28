import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileText, 
  ShieldCheck, 
  Compass, 
  DollarSign, 
  Leaf, 
  MapPin, 
  Scale, 
  Users, 
  Lock,
  ChevronRight,
  Printer,
  Briefcase
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { FEASIBILITY_ASSESSMENTS_DATA } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { FeasibilityPillar, ProjectViewMode } from '../../types';

interface FeasibilityAssessmentViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

const PILLAR_ICONS: Record<FeasibilityPillar, React.ComponentType<{ className?: string }>> = {
  Technical: Compass,
  Economic: Scale,
  Environmental: Leaf,
  Financial: DollarSign,
  Land: MapPin,
  Regulatory: FileText,
  Social: Users,
  Security: Lock,
  Implementation: Briefcase
};

export const FeasibilityAssessmentView: React.FC<FeasibilityAssessmentViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [selectedPillar, setSelectedPillar] = useState<FeasibilityPillar>('Technical');

  const assessments = FEASIBILITY_ASSESSMENTS_DATA;
  const activeAssessment = assessments.find((a) => a.pillar === selectedPillar) || assessments[0];

  const overallScore = Math.round(assessments.reduce((acc, curr) => acc + curr.score, 0) / assessments.length);

  return (
    <UIStateContainer moduleName="PDS Feasibility">
      <div className="space-y-4">
        {/* Persistent Project Context Bar */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="pds-feasibility"
          onNavigateView={onNavigateView}
        />

        {/* Feasibility Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PDS GATE 2 //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                8-PILLAR FEASIBILITY AUDIT
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Multidisciplinary Feasibility & Readiness Assessment
            </h1>
            <p className="text-xs text-slate-400">
              Technical, environmental, wayleave and statutory readiness for {currentProject.name}
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Composite Score</span>
              <span className={`text-sm font-bold ${overallScore >= 85 ? 'text-emerald-400' : 'text-amber-400'}`}>
                {overallScore}/100
              </span>
            </div>
            <div className="px-3 py-1.5 bg-cyan-950/40 rounded border border-cyan-500/30 text-cyan-300">
              PDS Gate 2 Cleared
            </div>
          </div>
        </div>

        {/* 8-Pillars Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {assessments.map((a) => {
            const Icon = PILLAR_ICONS[a.pillar];
            const isSelected = selectedPillar === a.pillar;

            return (
              <button
                key={a.pillar}
                onClick={() => setSelectedPillar(a.pillar)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 border-cyan-500/50 shadow-md'
                    : 'bg-[#080d17] border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-mono font-bold ${
                    a.score >= 90 ? 'text-emerald-400' :
                    a.score >= 75 ? 'text-cyan-400' : 'text-rose-400'
                  }`}>
                    {a.score}%
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{a.pillar}</div>
                <div className={`text-[9px] font-mono mt-1 uppercase ${
                  a.status === 'SATISFACTORY' ? 'text-emerald-400' :
                  a.status === 'ACTION_REQUIRED' ? 'text-amber-400' : 'text-rose-400'
                }`}>
                  {a.status.replace('_', ' ')}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Pillar Detailed Inspection Panel */}
        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                PILLAR AUDIT
              </span>
              <h2 className="text-sm font-semibold text-slate-100">
                {activeAssessment.pillar} Feasibility Assessment Dossier
              </h2>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-slate-400">Pillar Score:</span>
              <span className="text-cyan-400 font-bold text-sm">{activeAssessment.score}/100</span>
              <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase border ${
                activeAssessment.status === 'SATISFACTORY' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                activeAssessment.status === 'ACTION_REQUIRED' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                'text-rose-400 bg-rose-500/10 border-rose-500/30'
              }`}>
                {activeAssessment.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Evidence Documents */}
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 space-y-2">
              <h4 className="font-mono text-[10px] uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Evidence & Engineering Deliverables
              </h4>
              <ul className="space-y-1.5">
                {activeAssessment.evidence.map((ev, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2 bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
                    <span className="text-emerald-400 font-mono text-[10px] mt-0.5">✓</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Identified Gaps */}
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 space-y-2">
              <h4 className="font-mono text-[10px] uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Identified Gaps & Missing Clearances
              </h4>
              <ul className="space-y-1.5">
                {activeAssessment.gaps.length > 0 ? (
                  activeAssessment.gaps.map((gap, i) => (
                    <li key={i} className="text-slate-300 flex items-start gap-2 bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
                      <span className="text-amber-400 font-mono text-[10px] mt-0.5">!</span>
                      <span>{gap}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-slate-400 italic p-1.5">No critical gaps recorded.</li>
                )}
              </ul>
            </div>

            {/* Assumptions */}
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 space-y-2">
              <h4 className="font-mono text-[10px] uppercase text-cyan-400 tracking-wider flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5" />
                Governing Technical Assumptions
              </h4>
              <ul className="space-y-1.5">
                {activeAssessment.assumptions.map((asmp, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2 bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
                    <span className="text-cyan-400 font-mono text-[10px] mt-0.5">•</span>
                    <span>{asmp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="p-3 bg-slate-900/80 rounded border border-slate-800 space-y-2">
              <h4 className="font-mono text-[10px] uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Domain Risks & Sensitivities
              </h4>
              <ul className="space-y-1.5">
                {activeAssessment.risks.map((r, i) => (
                  <li key={i} className="text-slate-300 flex items-start gap-2 bg-slate-950/40 p-1.5 rounded border border-slate-800/60">
                    <span className="text-rose-400 font-mono text-[10px] mt-0.5">⚠</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="p-3 bg-cyan-950/30 rounded border border-cyan-500/30 text-xs">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
              Chief Engineer Feasibility Recommendation:
            </span>
            <p className="text-cyan-200 font-medium">
              {activeAssessment.recommendation}
            </p>
          </div>
        </div>
      </div>
    </UIStateContainer>
  );
};
