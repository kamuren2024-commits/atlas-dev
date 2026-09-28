import React, { useState } from 'react';
import { 
  GitCommit, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  Filter, 
  Search, 
  ChevronRight, 
  ArrowRight,
  Shield,
  Layers,
  FileCheck
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { DEVELOPMENT_PIPELINE_PROJECTS } from '../../adapters/fixtures';
import { PDSLifecycleStage, ProjectViewMode } from '../../types';

interface DevelopmentPipelineViewProps {
  onSelectProject: (projectId: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

const ALL_STAGES: PDSLifecycleStage[] = [
  'Need',
  'Concept',
  'Feasibility',
  'Land/Wayleave',
  'Funding',
  'Approval',
  'Procurement',
  'Design',
  'Construction',
  'Commissioning',
  'Handover'
];

export const DevelopmentPipelineView: React.FC<DevelopmentPipelineViewProps> = ({
  onSelectProject,
  onNavigateView
}) => {
  const [selectedStage, setSelectedStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filteredProjects = DEVELOPMENT_PIPELINE_PROJECTS.filter((proj) => {
    if (selectedStage !== 'ALL' && proj.stage !== selectedStage) return false;
    if (filterSeverity !== 'ALL' && proj.blockerSeverity !== filterSeverity) return false;
    if (searchQuery && !proj.name.toLowerCase().includes(searchQuery.toLowerCase()) && !proj.code.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <UIStateContainer moduleName="PDS Development Pipeline">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PDS LIFECYCLE //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                11 STAGE GATEWAY
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Project Development Services Pipeline & Readiness Gateway
            </h1>
            <p className="text-xs text-slate-400">
              End-to-end grid expansion lifecycle from strategic need identification to commercial grid handover
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateView('pds-concepts')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded text-xs font-mono transition-colors"
            >
              Concepts Workspace
            </button>
            <button
              onClick={() => onNavigateView('pds-gate')}
              className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono transition-colors"
            >
              Gate Readiness Check
            </button>
          </div>
        </div>

        {/* 11-Stage Horizontal Stepper / Funnel Navigator */}
        <div className="bg-[#080d17] p-3 rounded-lg border border-slate-800 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-[960px]">
            <button
              onClick={() => setSelectedStage('ALL')}
              className={`px-2.5 py-1.5 rounded text-xs font-mono transition-all flex-shrink-0 ${
                selectedStage === 'ALL'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All Stages ({DEVELOPMENT_PIPELINE_PROJECTS.length})
            </button>

            {ALL_STAGES.map((stg, idx) => {
              const count = DEVELOPMENT_PIPELINE_PROJECTS.filter((p) => p.stage === stg).length;
              const isSelected = selectedStage === stg;

              return (
                <button
                  key={stg}
                  onClick={() => setSelectedStage(stg)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-mono transition-all flex-shrink-0 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 border border-slate-800/80 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-slate-800 text-[9px] flex items-center justify-center font-bold text-cyan-400">
                    {idx + 1}
                  </span>
                  <span>{stg}</span>
                  <span className="text-[10px] px-1 rounded bg-slate-800 text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Blocker Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'NONE'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2 py-0.5 rounded text-[10px] transition-colors ${
                  filterSeverity === sev ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Search pipeline project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded pl-7 pr-3 py-1 text-xs text-slate-200 placeholder-slate-400 font-mono focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Projects Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800/90 hover:border-cyan-500/40 transition-all text-xs space-y-2.5 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-cyan-400">{proj.code}</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    {proj.voltage}
                  </span>
                </div>

                <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-900 border border-slate-700 text-slate-300">
                  {proj.stage}
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-slate-100 text-sm leading-snug group-hover:text-cyan-200 transition-colors">
                  {proj.name}
                </h3>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Lead: {proj.owner} • Due: {proj.dueDate}
                </div>
              </div>

              {/* Readiness Meter */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400">Stage Readiness</span>
                  <span className="text-white font-bold">{proj.readiness}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      proj.readiness >= 80 ? 'bg-emerald-400' :
                      proj.readiness >= 50 ? 'bg-cyan-400' : 'bg-amber-400'
                    }`}
                    style={{ width: `${proj.readiness}%` }}
                  />
                </div>
              </div>

              {/* Evidence Completeness */}
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-950/60 px-2 py-1.5 rounded border border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1">
                  <FileCheck className="w-3 h-3 text-cyan-400" />
                  Evidence Dossier
                </span>
                <span className="text-slate-200">
                  {proj.evidenceCount} Files ({proj.evidenceCompleteness}%)
                </span>
              </div>

              {/* Blockers */}
              <div className="text-[11px] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-400 uppercase">Active Gate Blockers:</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                    proj.blockerSeverity === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10' :
                    proj.blockerSeverity === 'HIGH' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'
                  }`}>
                    {proj.blockerSeverity}
                  </span>
                </div>

                <div className="bg-slate-950/40 p-1.5 rounded border border-slate-800/60 text-slate-300 text-[11px]">
                  {proj.blockers?.[0] || 'No gate blockers recorded.'}
                </div>
              </div>

              {/* Next Action */}
              <div className="text-[11px] text-cyan-300/90 font-mono bg-cyan-950/20 p-1.5 rounded border border-cyan-500/20">
                <strong className="text-cyan-400">Action:</strong> {proj.nextAction}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] font-mono">
                <button
                  onClick={() => {
                    onSelectProject(proj.id);
                    onNavigateView('pds-feasibility');
                  }}
                  className="text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  8-Pillar Feasibility
                </button>

                <button
                  onClick={() => {
                    onSelectProject(proj.id);
                    onNavigateView('pds-gate');
                  }}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  Gate Check
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </UIStateContainer>
  );
};
