import React, { useState } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  FileText, 
  UserCheck, 
  Cpu, 
  Radio, 
  Zap, 
  Check, 
  X,
  Clock
} from 'lucide-react';
import { RemedialActionOption, SimulationPowerFlowResult } from './types';

interface OperatorDecisionPanelProps {
  scenarioTitle?: string;
  options: RemedialActionOption[];
  onAuthorizeAction?: (actionId: string) => void;
  onDismiss?: () => void;
}

export default function OperatorDecisionPanel({
  scenarioTitle = 'Suswa 400/220kV Transformer T1 Overload & Thermal Excursion',
  options,
  onAuthorizeAction,
  onDismiss
}: OperatorDecisionPanelProps) {
  const [selectedOptionId, setSelectedOptionId] = useState<string>(
    options[0]?.id || 'ACTION_OPT_A_REDISPATCH'
  );
  const [authorizedAction, setAuthorizedAction] = useState<string | null>(null);
  const [decisionNotes, setDecisionNotes] = useState<string>('');

  const activeOption = options.find(o => o.id === selectedOptionId) || options[0];

  const handleAuthorize = () => {
    if (!activeOption) return;
    setAuthorizedAction(activeOption.id);
    if (onAuthorizeAction) onAuthorizeAction(activeOption.id);
  };

  return (
    <div className="w-full bg-[#090e1a] border border-cyan-900/60 rounded-lg p-4 font-mono text-slate-100 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-bold text-slate-100 uppercase tracking-wider">
            OPERATOR DECISION SUPPORT PANEL: {scenarioTitle}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          ISO 55000 / KETRACO GRID CODE LEVEL 4 ADVISORY
        </span>
      </div>

      {/* 4-Step Structural Decision Workflow: SITUATION -> IMPACT -> OPTIONS -> RECOMMENDATION */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 text-xs">
        {/* Step 1: Situation */}
        <div className="bg-[#050913] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold border-b border-slate-800/80 pb-1">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">1</span>
            <span>SITUATION</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Suswa Auto-Transformer T1 operating at 88.5% capacity under elevated top-oil temperature (76.5°C). High evening peak demand (+158 MW) approaching.
          </p>
          <div className="text-[10px] text-amber-400 font-semibold">
            Status: Thermal Watch Condition
          </div>
        </div>

        {/* Step 2: Impact */}
        <div className="bg-[#050913] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold border-b border-slate-800/80 pb-1">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">2</span>
            <span>IMPACT (IF UNMITIGATED)</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            N-1 Trip will overload parallel Suswa T2 to 118% (415 MVA), causing Nairobi 220kV bus voltage depression to 0.912 p.u. and transient frequency dip to 49.78 Hz.
          </p>
          <div className="text-[10px] text-red-400 font-semibold">
            Consequence: Severe Corridor Overload
          </div>
        </div>

        {/* Step 3: Candidate Options */}
        <div className="bg-[#050913] border border-slate-800 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold border-b border-slate-800/80 pb-1">
            <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px]">3</span>
            <span>EVALUATED OPTIONS</span>
          </div>
          <div className="space-y-1">
            {options.map(opt => {
              const isSel = opt.id === selectedOptionId;
              return (
                <button
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`w-full text-left p-1.5 rounded text-[11px] font-semibold transition-all flex items-center justify-between ${
                    isSel ? 'bg-cyan-900/40 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <span className="truncate">{opt.title.split(':')[0]}</span>
                  <span className="text-[9px] text-emerald-400">{opt.confidence}%</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Recommendation */}
        <div className="bg-[#050913] border border-cyan-900/60 rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold border-b border-cyan-900/80 pb-1">
            <span className="w-4 h-4 rounded-full bg-cyan-950 text-cyan-300 flex items-center justify-center text-[10px]">4</span>
            <span>TOP RECOMMENDATION</span>
          </div>
          <div className="text-xs font-bold text-slate-100">{activeOption.title}</div>
          <p className="text-slate-300 text-[11px]">{activeOption.expectedBenefit}</p>
          <div className="text-[10px] text-emerald-400 font-bold">
            Recommended by AI Copilot Engine
          </div>
        </div>
      </div>

      {/* Action Execution & Authorization Bar */}
      <div className="bg-[#050913] border border-slate-800 rounded-lg p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="text-slate-200 font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-cyan-400" />
            <span>OPERATOR DISPATCH AUTHORIZATION</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {activeOption.safetyNotice || 'ADVISORY ONLY: Requires manual dispatcher confirmation in accordance with KETRACO Grid Code.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {authorizedAction ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>DISPATCH INSTRUCTION LOGGED & ISSUED</span>
            </div>
          ) : (
            <button
              onClick={handleAuthorize}
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs tracking-wider transition-all flex items-center gap-1.5 shadow-md shadow-cyan-600/30 whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5" />
              Authorize Dispatch Instruction
            </button>
          )}

          {onDismiss && (
            <button
              onClick={onDismiss}
              className="px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs tracking-wider transition-all"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
