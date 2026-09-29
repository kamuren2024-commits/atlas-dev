import React from 'react';
import { CheckCircle2, FileText } from 'lucide-react';
import { LifecycleStageItem } from './types';

interface EvaluationLifecyclePanelProps {
  currentStageNumber: number;
  stages?: LifecycleStageItem[];
  onSelectStage?: (stageNumber: number) => void;
}

export default function EvaluationLifecyclePanel({
  currentStageNumber,
  stages = [],
  onSelectStage
}: EvaluationLifecyclePanelProps) {
  const completedStages = stages.filter(stage => stage.status === 'COMPLETED').length;
  const percentComplete = stages.length
    ? Math.round((completedStages / stages.length) * 100)
    : 0;

  return (
    <div className="bg-[#0b1220] border border-slate-800/80 rounded-xl p-4 flex flex-col h-full shadow-lg shadow-black/40">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 shrink-0">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Evaluation Lifecycle
        </h2>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
          {stages.length ? `${stages.length} CONFIGURED STAGES` : 'PLAN UNAVAILABLE'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-2">
        {stages.length === 0 && (
          <div className="p-4 text-sm text-slate-400">
            An approved evaluation plan and its configured stages are not available for this tender.
          </div>
        )}
        {stages.map(stage => {
          const isCurrent = stage.stageNumber === currentStageNumber;
          const isPast = stage.status === 'COMPLETED';

          return (
            <button
              key={stage.stageNumber}
              type="button"
              onClick={() => onSelectStage?.(stage.stageNumber)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-3 cursor-pointer ${
                isCurrent
                  ? 'bg-cyan-950/40 border-cyan-500/50'
                  : 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono bg-slate-800/80 border border-slate-700 text-slate-400">
                  {isPast ? <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" /> : stage.stageNumber}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate text-slate-200">{stage.name}</div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{stage.role}</div>
                  {stage.dateStr && <div className="text-[9px] font-mono text-slate-400 mt-0.5">{stage.dateStr}</div>}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 bg-slate-800/60 text-slate-400 border border-slate-700/50">
                <FileText className="w-2.5 h-2.5" />
                <span>{stage.docCount}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-3 border-t border-slate-800/80 shrink-0">
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-1.5">
          <span>{completedStages} of {stages.length} stages complete</span>
          <span className="text-cyan-400 font-bold">{percentComplete}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
}
