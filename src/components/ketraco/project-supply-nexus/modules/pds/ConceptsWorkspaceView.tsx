import React, { useState } from 'react';
import { 
  Lightbulb, 
  Compass, 
  Layers, 
  DollarSign, 
  Calendar, 
  Zap, 
  MapPin, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { CONCEPTS_WORKSPACE_DATA } from '../../adapters/fixtures';
import { ProjectViewMode } from '../../types';

interface ConceptsWorkspaceViewProps {
  onSelectProject: (projectId: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

export const ConceptsWorkspaceView: React.FC<ConceptsWorkspaceViewProps> = ({
  onSelectProject,
  onNavigateView
}) => {
  const [selectedConceptId, setSelectedConceptId] = useState<string>(CONCEPTS_WORKSPACE_DATA[0].id);
  const concept = CONCEPTS_WORKSPACE_DATA.find((c) => c.id === selectedConceptId) || CONCEPTS_WORKSPACE_DATA[0];

  return (
    <UIStateContainer moduleName="PDS Concepts Workspace">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PDS GATE 1 //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                CONCEPT WORKSPACE
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Transmission Concept Evaluation & Route Alternatives Workspace
            </h1>
            <p className="text-xs text-slate-400">
              Formulate grid transmission demand, corridor alternatives, preliminary capex, and economic justification
            </p>
          </div>

          {/* Concept Switcher */}
          <div className="flex items-center gap-2">
            {CONCEPTS_WORKSPACE_DATA.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedConceptId(c.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
                  c.id === selectedConceptId
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c.code}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Concept Overview Card */}
        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-cyan-400">{concept.code}</span>
                <span className="text-sm font-semibold text-slate-100">{concept.title}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Corridor: <span className="text-slate-200">{concept.route}</span> • {concept.lengthKm} km
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded text-xs font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                {concept.voltage}
              </span>
              <span className="px-2.5 py-1 rounded text-xs font-mono uppercase bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                {concept.status}
              </span>
            </div>
          </div>

          {/* Need & Objective Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                1. Strategic Transmission Need Rationale
              </span>
              <p className="text-slate-300 leading-relaxed">
                {concept.transmissionNeed}
              </p>
            </div>

            <div className="p-3 bg-slate-900/60 rounded border border-slate-800 text-xs space-y-1">
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block">
                2. Project Objectives & National Beneficiaries
              </span>
              <p className="text-slate-300 leading-relaxed">
                {concept.objective}
              </p>
              <div className="text-[11px] text-slate-400 pt-1 font-mono">
                Beneficiaries: <span className="text-slate-200">{concept.beneficiaries}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Transmission Capacity</span>
              <span className="text-white font-bold text-sm">{concept.capacityMw} MW</span>
              <span className="text-[10px] text-cyan-400 block">N-1 Security Level</span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Preliminary Capex</span>
              <span className="text-white font-bold text-sm">{concept.preliminaryCapex}</span>
              <span className="text-[10px] text-slate-400 block">Class 4 Cost Estimate</span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Estimated Schedule</span>
              <span className="text-cyan-300 font-bold text-sm">{concept.preliminarySchedule}</span>
              <span className="text-[10px] text-slate-400 block">Target NTP to COD</span>
            </div>

            <div className="p-2.5 bg-slate-950/60 rounded border border-slate-800/80">
              <span className="text-[10px] text-slate-400 block uppercase">Economic Returns</span>
              <span className="text-emerald-400 font-bold text-sm">{concept.economicEirr}</span>
              <span className="text-[10px] text-slate-400 block">Exceeds 12% Hurdle</span>
            </div>
          </div>

          {/* Substations Encompassed */}
          <div className="p-3 bg-slate-950/40 rounded border border-slate-800 text-xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Associated Substations & Node Terminals:
            </span>
            <div className="flex flex-wrap gap-2">
              {concept.substations.map((sub, i) => (
                <span key={i} className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200 font-mono text-[11px]">
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Alternatives Comparison Matrix */}
        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                Corridor Alternatives Tradeoff Analysis
              </h3>
              <p className="text-[11px] text-slate-400">
                Multi-criteria comparison of candidate transmission corridors evaluated for feasibility
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400">
              Option A Formally Recommended
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {concept.alternatives.map((alt, idx) => (
              <div
                key={alt.id}
                className={`p-3.5 rounded-lg border text-xs space-y-3 ${
                  idx === 0
                    ? 'bg-[#0a1220]/80 border-cyan-500/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-100 text-sm">{alt.name}</span>
                  {idx === 0 && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                      Selected Alignment
                    </span>
                  )}
                </div>

                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {alt.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Corridor Length</span>
                    <span className="text-white font-bold">{alt.lengthKm} km</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase">Estimated Capex</span>
                    <span className="text-cyan-300 font-bold">{alt.capex}</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[9px] text-slate-400 block uppercase">Environmental Impact</span>
                    <span className={`text-[10px] font-bold ${
                      alt.environmentalImpact === 'LOW' ? 'text-emerald-400' :
                      alt.environmentalImpact === 'MODERATE' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {alt.environmentalImpact}
                    </span>
                  </div>
                  <div className="mt-1">
                    <span className="text-[9px] text-slate-400 block uppercase">Wayleave Complexity</span>
                    <span className={`text-[10px] font-bold ${
                      alt.wayleaveComplexity === 'LOW' ? 'text-emerald-400' :
                      alt.wayleaveComplexity === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {alt.wayleaveComplexity}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-300 bg-slate-950/40 p-2 rounded border border-slate-800/60">
                  <strong className="text-cyan-400 block text-[10px] font-mono uppercase mb-0.5">Technical Merit:</strong>
                  {alt.technicalMerit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UIStateContainer>
  );
};
