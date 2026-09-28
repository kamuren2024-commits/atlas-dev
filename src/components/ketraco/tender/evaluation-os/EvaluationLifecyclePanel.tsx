import React from 'react';
import { CheckCircle2, Circle, Clock, FileText, ChevronRight } from 'lucide-react';
import { LifecycleStageItem } from './types';

interface EvaluationLifecyclePanelProps {
  currentStageNumber: number;
  stages?: LifecycleStageItem[];
  onSelectStage?: (stageNumber: number) => void;
}

export const LIFECYCLE_STAGES: LifecycleStageItem[] = [
  { stageNumber: 1, name: 'Tender Published', role: 'Procurement Officer', dateStr: '12 Apr 2026 08:12', docCount: 12, status: 'COMPLETED' },
  { stageNumber: 2, name: 'Bid Receipt', role: 'Procurement Officer', dateStr: '20 Apr 2026 14:32', docCount: 28, status: 'COMPLETED' },
  { stageNumber: 3, name: 'Bid Opening', role: 'Committee Secretariat', dateStr: '22 Apr 2026 10:15', docCount: 34, status: 'COMPLETED' },
  { stageNumber: 4, name: 'Preliminary Evaluation', role: 'Evaluation Team', dateStr: '25 Apr 2026 16:40', docCount: 48, status: 'COMPLETED' },
  { stageNumber: 5, name: 'Technical Evaluation', role: 'Evaluation Committee', dateStr: '02 May 2026 09:20', docCount: 72, status: 'ACTIVE' },
  { stageNumber: 6, name: 'Financial Evaluation', role: 'Evaluation Committee', dateStr: '09 May 2026 11:05', docCount: 31, status: 'PENDING' },
  { stageNumber: 7, name: 'Clarifications', role: 'Evaluation Committee', dateStr: '12 May 2026 14:22', docCount: 16, status: 'PENDING' },
  { stageNumber: 8, name: 'Consensus', role: 'Committee Chair', dateStr: '15 May 2026 10:30', docCount: 9, status: 'PENDING' },
  { stageNumber: 9, name: 'Committee Review', role: 'Procurement Committee', dateStr: '18 May 2026 13:45', docCount: 5, status: 'PENDING' },
  { stageNumber: 10, name: 'Approval', role: 'Accounting Officer', dateStr: '21 May 2026 09:10', docCount: 3, status: 'PENDING' },
  { stageNumber: 11, name: 'Award Recommendation', role: 'Procurement Director', dateStr: '23 May 2026 15:20', docCount: 2, status: 'PENDING' },
  { stageNumber: 12, name: 'Audit Archive', role: 'Internal Audit', dateStr: '24 May 2026 11:00', docCount: 1, status: 'PENDING' },
];

export default function EvaluationLifecyclePanel({
  currentStageNumber = 5,
  stages = LIFECYCLE_STAGES,
  onSelectStage
}: EvaluationLifecyclePanelProps) {
  const percentComplete = Math.round((currentStageNumber / (stages.length || 12)) * 100);

  return (
    <div className="bg-[#0b1220] border border-slate-800/80 rounded-xl p-4 flex flex-col h-full shadow-lg shadow-black/40">
      {/* Title */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/70 shrink-0">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          Evaluation Lifecycle
        </h2>
        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
          PPADA 12-STAGE
        </span>
      </div>

      {/* 12-Stage Timeline List */}
      <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-2">
        {stages.map((stage) => {
          const isCurrent = stage.stageNumber === currentStageNumber;
          const isPast = stage.stageNumber < currentStageNumber;

          return (
            <button
              key={stage.stageNumber}
              type="button"
              onClick={() => onSelectStage?.(stage.stageNumber)}
              className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-3 cursor-pointer group ${
                isCurrent
                  ? 'bg-cyan-950/40 border-cyan-500/50 shadow-[0_0_15px_rgba(0,225,255,0.12)]'
                  : isPast
                  ? 'bg-slate-900/30 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/60'
                  : 'bg-transparent border-slate-900 text-slate-400 hover:border-slate-800 hover:text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                {/* Number Badge */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 font-mono ${
                    isCurrent
                      ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(0,225,255,0.8)]'
                      : isPast
                      ? 'bg-blue-600/30 border border-blue-500/40 text-blue-300'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-400'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-300" />
                  ) : (
                    stage.stageNumber
                  )}
                </div>

                {/* Stage Info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-semibold truncate ${
                        isCurrent
                          ? 'text-cyan-300 font-bold'
                          : isPast
                          ? 'text-slate-200'
                          : 'text-slate-400'
                      }`}
                    >
                      {stage.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {stage.role}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                    {stage.dateStr}
                  </div>
                </div>
              </div>

              {/* Document Count Badge */}
              <div
                className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                  isCurrent
                    ? 'bg-cyan-900/50 text-cyan-300 border border-cyan-500/30'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                }`}
                title={`${stage.docCount} records/documents indexed`}
              >
                <FileText className="w-2.5 h-2.5" />
                <span>{stage.docCount}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer Progress */}
      <div className="pt-3 border-t border-slate-800/80 shrink-0">
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mb-1.5">
          <span>Stage {currentStageNumber} of 12</span>
          <span className="text-cyan-400 font-bold">{percentComplete}% Complete</span>
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
