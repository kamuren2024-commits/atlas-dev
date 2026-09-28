import React, { useState } from 'react';
import {
  GitPullRequest,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ChevronRight,
  X,
  ShieldAlert,
  CheckCircle2,
  FolderGit2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { PDSStageItem } from './types';

interface PDSControlTowerProps {
  stages: PDSStageItem[];
  avgCycleDays?: number;
  blockedProjects?: number;
  onSelectStage?: (stage: PDSStageItem) => void;
}

export const PDSControlTower: React.FC<PDSControlTowerProps> = ({
  stages,
  avgCycleDays = 68,
  blockedProjects = 3,
  onSelectStage
}) => {
  const [activeStageId, setActiveStageId] = useState<string>('wayleave');
  const [showBottleneckPopup, setShowBottleneckPopup] = useState(true);
  const [inspectingStage, setInspectingStage] = useState<PDSStageItem | null>(null);
  const [dispatchNotice, setDispatchNotice] = useState<string | null>(null);

  const activeStage = stages.find(s => s.id === activeStageId) || stages[4];

  const handleInspect = (stage: PDSStageItem) => {
    setInspectingStage(stage);
    setDispatchNotice(null);
    onSelectStage?.(stage);
  };

  const executeFastTrack = (actionTitle: string) => {
    setDispatchNotice(`Dispatched fast-track protocol: "${actionTitle}". Assigned to KETRACO Taskforce.`);
  };

  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full relative">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800/60">
        <div>
          <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight flex items-center gap-1.5">
            <span>PDS Development Control Tower</span>
          </h3>
          <p className="text-[11px] text-slate-500 font-sans">
            Pipeline, cycle times and bottlenecks
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Avg. cycle time:</span>
            <span className="text-white font-bold">{avgCycleDays} days</span>
            <span className="text-emerald-400 font-medium">▲ +12%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Blocked projects:</span>
            <span className="text-rose-400 font-bold">{blockedProjects}</span>
            <span className="text-emerald-400 font-medium">▼ -40%</span>
          </div>
        </div>
      </div>

      {/* 10 Pipeline Stages Visualizer */}
      <div className="relative py-4">
        <div className="grid grid-cols-5 lg:grid-cols-10 gap-2 items-end">
          {stages.map((stage, idx) => {
            const isSelected = activeStageId === stage.id;
            const isBottleneck = stage.isBottleneck;

            return (
              <div
                key={stage.id}
                onClick={() => {
                  setActiveStageId(stage.id);
                  handleInspect(stage);
                }}
                className="relative group cursor-pointer flex flex-col items-center text-center select-none"
              >
                {/* Count badge */}
                <div
                  className={`text-xs font-mono font-bold mb-1 transition-colors ${
                    isBottleneck
                      ? 'text-amber-400'
                      : isSelected
                      ? 'text-cyan-400'
                      : 'text-slate-300 group-hover:text-white'
                  }`}
                >
                  {stage.count}
                </div>

                {/* Progress bar pillar */}
                <div className="w-full bg-slate-900 h-16 rounded-sm p-0.5 flex flex-col justify-end border border-slate-800/80 group-hover:border-slate-700">
                  <div
                    className={`w-full rounded-sm transition-all ${stage.color} ${
                      isBottleneck ? 'shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse' : ''
                    }`}
                    style={{ height: `${Math.min(stage.count * 5 + 20, 100)}%` }}
                  />
                </div>

                {/* Stage name */}
                <div className="text-[10px] font-medium text-slate-300 mt-1.5 truncate max-w-full">
                  {stage.name}
                </div>

                {/* Cycle days */}
                <div className="text-[9px] font-mono text-slate-500">
                  {stage.cycleDays}d
                </div>

                {/* Bottleneck Tooltip Callout if Land/Wayleave */}
                {isBottleneck && showBottleneckPopup && (
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      handleInspect(stage);
                    }}
                    className="absolute -top-16 left-1/2 -translate-x-1/2 z-20 w-48 bg-amber-950/95 border border-amber-500/50 rounded p-2 text-left shadow-2xl backdrop-blur-md cursor-pointer hover:border-amber-400"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-amber-300">
                      <span>Bottleneck: Land/Wayleave</span>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          setShowBottleneckPopup(false);
                        }}
                        className="text-amber-400/80 hover:text-amber-200 px-1"
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-[9px] text-amber-200/90 font-mono mt-0.5">
                      Driver: RAP approvals
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      Owner: Wayleave Dept.
                    </div>
                    <div className="text-[9px] text-cyan-400 font-mono font-semibold mt-1 flex items-center gap-1">
                      <span>View Details</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Stage Progress Flow Arrow */}
      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono text-slate-500 overflow-x-auto no-scrollbar">
        <span>TRANSMISSION NEED</span>
        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
        <span>PROJECT DEVELOPMENT</span>
        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
        <span>FINANCING / APPROVAL</span>
        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
        <span>PROCUREMENT</span>
        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
        <span>CONSTRUCTION</span>
        <ChevronRight className="w-3 h-3 text-slate-600 shrink-0" />
        <span className="text-cyan-400 shrink-0">COMMISSIONING & HANDOVER</span>
      </div>

      {/* Stage Drill-down Modal */}
      {inspectingStage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0a0f18] border border-cyan-500/50 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-3.5 border-b border-slate-800 bg-[#070b12] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Stage Details: {inspectingStage.name}
                </span>
                {inspectingStage.isBottleneck && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/40 font-bold">
                    BOTTLENECK
                  </span>
                )}
              </div>
              <button
                onClick={() => setInspectingStage(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2 font-mono">
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Active Projects</div>
                  <div className="text-white font-bold text-sm mt-0.5">{inspectingStage.count}</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Avg Dwell Time</div>
                  <div className="text-cyan-400 font-bold text-sm mt-0.5">{inspectingStage.cycleDays} days</div>
                </div>
                <div className="p-2 rounded bg-slate-900 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Responsible Unit</div>
                  <div className="text-purple-400 font-bold text-[11px] mt-0.5">Wayleave & Legal</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Projects Currently in this Gate:
                </div>
                <div className="space-y-1.5">
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Tana River 220kV Grid Reinforcement</div>
                      <div className="text-[10px] font-mono text-cyan-400">KET-PDS-0071 • 45 days in stage</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-500/30">
                      RAP Pending
                    </span>
                  </div>
                  <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-200">Garissa - Isiolo 132kV Interconnector</div>
                      <div className="text-[10px] font-mono text-cyan-400">KET-PDS-0055 • 38 days in stage</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30">
                      On Track
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Acceleration Actions:
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <button
                    onClick={() => executeFastTrack('Dispatch NLC Joint Valuation Board')}
                    className="p-2 rounded bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-left transition-colors cursor-pointer"
                  >
                    <div>1. Dispatch Joint Valuation</div>
                    <div className="text-[9px] text-slate-400 font-normal mt-0.5">Compress land award cycle by 18 days</div>
                  </button>
                  <button
                    onClick={() => executeFastTrack('Escalate Escrow Compensation Release')}
                    className="p-2 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-bold text-left transition-colors cursor-pointer"
                  >
                    <div>2. Escalate Escrow Release</div>
                    <div className="text-[9px] text-slate-400 font-normal mt-0.5">Unblock Section 3 parcel titles</div>
                  </button>
                </div>

                {dispatchNotice && (
                  <div className="p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{dispatchNotice}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-2.5 border-t border-slate-800 bg-[#070b12] flex justify-end">
              <button
                onClick={() => setInspectingStage(null)}
                className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
