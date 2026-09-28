// OperatorDecisionBriefModal - KETRACO Phase 06 9-Part Structured Operator Decision Brief & Human-in-the-Loop Authorization

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  Send, 
  ChevronRight, 
  Lock, 
  Activity, 
  Flame, 
  Zap, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import { OperatorDecisionBrief, OperatorDecisionAction } from './types';

interface OperatorDecisionBriefModalProps {
  brief: OperatorDecisionBrief;
  isOpen: boolean;
  onClose: () => void;
  onAuthorize?: (action: OperatorDecisionAction, notes: string, optionId?: string) => void;
  onAuthorizeAction?: (action: OperatorDecisionAction, notes: string, optionId?: string) => void;
  onOpenSimulationInLab?: (scenarioId?: string) => void;
  onOpenAsset360?: (assetId: string) => void;
  onOpenCorridor360?: (corridorId: string) => void;
}

export default function OperatorDecisionBriefModal({
  brief,
  isOpen,
  onClose,
  onAuthorize,
  onAuthorizeAction,
  onOpenSimulationInLab,
  onOpenAsset360,
  onOpenCorridor360
}: OperatorDecisionBriefModalProps) {
  const authorizer = onAuthorize ?? onAuthorizeAction ?? (() => undefined);
  const [selectedOptionId, setSelectedOptionId] = useState<string>(brief?.options?.[0]?.id || 'OPT-1');
  const [operatorNotes, setOperatorNotes] = useState<string>('Reviewed SCADA flow and WAMS phase angle. Confirmed Seven Forks spinning reserve is adequate.');
  const [operatorId, setOperatorId] = useState<string>('OP-NCC-8841');
  const [operatorName, setOperatorName] = useState<string>('Eng. David Kiprono (Lead Grid Controller)');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedAction, setSubmittedAction] = useState<string | null>(null);

  if (!isOpen || !brief) return null;

  const handleAction = (action: OperatorDecisionAction) => {
    setIsSubmitting(true);
    setTimeout(() => {
      authorizer(action, operatorNotes, selectedOptionId);
      setSubmittedAction(action);
      setIsSubmitting(false);
      setTimeout(() => {
        onClose();
      }, 1200);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#080f1d] border border-slate-700 rounded-xl flex flex-col shadow-2xl overflow-hidden font-sans text-slate-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-[#0b162a] border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  {brief.priority} DECISION BRIEF
                </span>
                <span className="text-xs font-mono text-slate-400">REF: {brief.incidentCode}</span>
              </div>
              <h2 className="text-sm font-bold text-slate-100">{brief.incidentTitle}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right font-mono text-[10px] hidden sm:block">
              <div className="text-emerald-400 font-bold">{brief.confidence}% CONFIDENCE</div>
              <div className="text-slate-400">AUTHENTICATED BRIEF</div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body: 9 Structured Sections */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-xs">
          
          {/* 1. WHAT HAPPENED */}
          <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              1. WHAT HAPPENED
            </div>
            <p className="text-slate-200 leading-relaxed font-mono text-[11.5px]">
              {brief.whatHappened}
            </p>
          </div>

          {/* 2. WHY IT MATTERS */}
          <div className="p-3.5 rounded bg-amber-950/20 border border-amber-500/30">
            <div className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              2. WHY IT MATTERS (OPERATIONAL SEVERITY)
            </div>
            <p className="text-amber-100/90 leading-relaxed text-[11.5px]">
              {brief.whyItMatters}
            </p>
          </div>

          {/* 3. WHAT IS AFFECTED */}
          <div className="p-3.5 rounded bg-slate-900/80 border border-slate-800">
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
              3. WHAT IS AFFECTED
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">SUBSTATIONS</div>
                <div className="font-bold text-slate-200 text-xs">{brief.whatIsAffected.substations.length} Hubs</div>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">CORRIDORS</div>
                <div className="font-bold text-slate-200 text-xs">{brief.whatIsAffected.lines.length} Circuits</div>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">GENERATION AT RISK</div>
                <div className="font-bold text-amber-400 text-xs">{brief.whatIsAffected.generationMWAtRisk} MW</div>
              </div>
              <div className="p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="text-slate-400 text-[10px]">LOAD AT RISK</div>
                <div className="font-bold text-rose-400 text-xs">{brief.whatIsAffected.loadDemandMWAtRisk} MW</div>
              </div>
            </div>
          </div>

          {/* 4. WHAT IS LIKELY NEXT */}
          <div className="p-3.5 rounded bg-rose-950/20 border border-rose-500/30">
            <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                4. WHAT IS LIKELY NEXT (PROBABILISTIC HORIZON)
              </span>
              <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-rose-900/60 text-rose-200">
                Cascade Risk: {brief.whatIsLikelyNext.cascadeRiskPct}%
              </span>
            </div>
            <p className="text-rose-100/90 leading-relaxed text-[11.5px]">
              <strong>Timeline (T + {brief.whatIsLikelyNext.timelineMin} min):</strong> {brief.whatIsLikelyNext.consequence}
            </p>
          </div>

          {/* 5. OPTIONS & 6. SIMULATED OUTCOMES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
              <span>5. OPERATIONAL OPTIONS & 6. SIMULATED OUTCOMES</span>
              <button
                onClick={() => onOpenSimulationInLab?.('SCEN_SUSWA_T1_TRIP')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 normal-case font-semibold"
              >
                <Cpu className="w-3 h-3" />
                Simulate in Scenario Lab
              </button>
            </div>

            <div className="space-y-2">
              {brief.options.map((opt, i) => {
                const sim = brief.simulatedOutcomes.find(s => s.optionId === opt.id);
                const isSelected = selectedOptionId === opt.id;
                return (
                  <div
                    key={opt.id}
                    onClick={() => setSelectedOptionId(opt.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0e223d] border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-900/60 border-slate-800 hover:bg-slate-900/90'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="option"
                          checked={isSelected}
                          onChange={() => setSelectedOptionId(opt.id)}
                          className="text-cyan-500 focus:ring-0"
                        />
                        <h4 className="text-xs font-bold text-slate-100">{opt.title}</h4>
                      </div>
                      <span className={`text-[9.5px] font-mono px-1.5 py-0.5 rounded ${
                        opt.riskLevel === 'LOW' ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-800' :
                        opt.riskLevel === 'MEDIUM' ? 'bg-amber-950/50 text-amber-300 border border-amber-800' :
                        'bg-rose-950/50 text-rose-300 border border-rose-800'
                      }`}>
                        Risk: {opt.riskLevel}
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-300 mb-2 leading-relaxed">
                      {opt.description}
                    </p>

                    <div className="text-[10.5px] text-slate-400 font-mono italic mb-2">
                      Tradeoffs: {opt.tradeoffs}
                    </div>

                    {/* Simulation Result Pill */}
                    {sim && (
                      <div className="grid grid-cols-4 gap-1 p-1.5 rounded bg-slate-950/80 border border-slate-800/80 text-center font-mono text-[9px]">
                        <div>
                          <span className="text-slate-400">POST-FLOW:</span>{' '}
                          <strong className={sim.maxLineLoadingPct > 90 ? 'text-rose-400' : 'text-emerald-400'}>
                            {sim.maxLineLoadingPct}%
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400">FREQ DELTA:</span>{' '}
                          <strong className="text-cyan-300">+{sim.frequencyDeltaHz} Hz</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">VOLT MARGIN:</span>{' '}
                          <strong className="text-emerald-300">{sim.voltageStabilityMarginPct}%</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">UNSERVED:</span>{' '}
                          <strong className={sim.unservedEnergyMWh > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                            {sim.unservedEnergyMWh} MWh
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7. RECOMMENDED ACTION */}
          <div className="p-3.5 rounded bg-cyan-950/30 border border-cyan-500/40">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
              7. RECOMMENDED ACTION & INVESTIGATION
            </div>
            <p className="text-cyan-100 font-medium text-[12px] mb-1 leading-relaxed">
              {brief.recommendedIntervention}
            </p>
            <p className="text-slate-300 text-[11px] font-mono">
              Investigation: {brief.recommendedInvestigation}
            </p>
          </div>

          {/* 8. CONFIDENCE & 9. EVIDENCE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* 8. Confidence Breakdown */}
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-1.5 flex items-center justify-between">
                <span>8. CONFIDENCE EXPLANATION</span>
                <span className="text-emerald-400">{brief.confidence}%</span>
              </div>
              <p className="text-[11px] text-slate-300 mb-2 leading-relaxed">
                {brief.confidenceExplanation}
              </p>
              <div className="space-y-1 font-mono text-[10px]">
                {brief.confidenceFactors.map((cf, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-400">
                    <span>{cf.factor}</span>
                    <span className="text-slate-200 font-bold">{cf.score}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. Evidence Citations */}
            <div className="p-3 rounded bg-slate-900/80 border border-slate-800">
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase mb-1.5">
                9. EVIDENCE CITATIONS
              </div>
              <div className="space-y-1.5 font-mono text-[10.5px]">
                {brief.evidenceCitations.map((ev, i) => (
                  <div key={i} className="p-1.5 rounded bg-slate-950/70 border border-slate-800/80">
                    <div className="flex items-center justify-between text-[9px] text-cyan-400 font-bold">
                      <span>{ev.source}</span>
                      <span className="text-slate-400">{ev.metric}</span>
                    </div>
                    <div className="text-slate-200 font-bold">{ev.value}</div>
                    <div className="text-[9px] text-slate-400 truncate">{ev.relevance}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Operator Sign-off Input Area */}
          <div className="p-3.5 rounded bg-[#070e1c] border border-cyan-500/30 space-y-2.5">
            <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              HUMAN-IN-THE-LOOP AUTHORIZATION BOUNDARY
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">AUTHORIZING OPERATOR</label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => setOperatorName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">OPERATOR BADGE / ID</label>
                <input
                  type="text"
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-400 text-[10px] font-mono block mb-1">
                OPERATIONAL DISPATCH LOG & NOTES
              </label>
              <textarea
                value={operatorNotes}
                onChange={(e) => setOperatorNotes(e.target.value)}
                rows={2}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Footer: Human Decision Controls */}
        <div className="p-4 bg-[#0a1324] border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAction('HOLD_FOR_INVESTIGATION')}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer"
            >
              Hold for Investigation
            </button>
            <button
              onClick={() => handleAction('REJECTED')}
              disabled={isSubmitting}
              className="px-3 py-1.5 rounded bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800 font-mono text-xs transition-colors cursor-pointer"
            >
              Reject Action
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-transparent hover:bg-slate-800 text-slate-400 font-mono text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={() => handleAction('AUTHORIZED')}
              disabled={isSubmitting}
              className="px-5 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'AUTHORIZING & LOGGING...' : 'AUTHORIZE DISPATCH INTERVENTION'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
