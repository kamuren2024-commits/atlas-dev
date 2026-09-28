import React from 'react';
import { ShieldAlert, Sparkles, UserCheck, ShieldCheck, Check } from 'lucide-react';

interface AIGovernancePanelProps {
  onInspectPolicy?: () => void;
}

export default function AIGovernancePanel({ onInspectPolicy }: AIGovernancePanelProps) {
  const aiAnalysisCapabilities = [
    'Document extraction',
    'Requirement matching',
    'Evidence identification',
    'Anomaly detection',
    'Compliance checking',
    'Scoring recommendation',
    'Inconsistency detection'
  ];

  const humanDecisions = [
    'Evidence review',
    'Evaluator scoring',
    'Committee moderation',
    'Approval',
    'Recommendation'
  ];

  return (
    <div className="bg-[#0b1220] border border-slate-800/80 rounded-xl p-4 flex flex-col h-full shadow-lg shadow-black/40">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 shrink-0">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            AI Governance
          </h2>
        </div>
        <button
          type="button"
          onClick={onInspectPolicy}
          className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1 font-bold cursor-pointer transition-colors"
          title="Click to inspect autonomous AI trace & policies"
        >
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          POLICY COMPLIANT
        </button>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="flex-1 grid grid-cols-2 gap-3 my-2 overflow-y-auto pr-1">
        {/* Left Column: ATLAS AI ANALYSIS */}
        <div className="bg-[#070d18] border border-cyan-900/40 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-cyan-900/40">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-300">
              Atlas AI Analysis
            </span>
          </div>

          <ul className="space-y-1 text-[10.5px]">
            {aiAnalysisCapabilities.map((item, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-slate-300">
                <span className="text-cyan-400 text-xs">»</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Column: HUMAN EVALUATION DECISION */}
        <div className="bg-[#070d18] border border-purple-900/40 rounded-lg p-2.5 space-y-2">
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-purple-900/40">
            <UserCheck className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300">
              Human Decision
            </span>
          </div>

          <ul className="space-y-1 text-[10.5px]">
            {humanDecisions.map((item, idx) => (
              <li key={idx} className="flex items-center gap-1.5 text-slate-300">
                <span className="text-purple-400 text-xs">»</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Persistent Bottom Banner */}
      <div className="pt-2 border-t border-slate-800/80 shrink-0">
        <div className="px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex items-center justify-center gap-2 text-[11px] font-mono font-bold text-cyan-300 shadow-[0_0_10px_rgba(0,225,255,0.15)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>AI ASSISTS. AUTHORIZED HUMANS DECIDE.</span>
        </div>
      </div>
    </div>
  );
}
