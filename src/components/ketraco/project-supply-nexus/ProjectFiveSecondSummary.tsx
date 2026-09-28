import React from 'react';
import {
  Activity,
  Calendar,
  DollarSign,
  AlertTriangle,
  UserCheck,
  Zap,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ChevronDown,
  Clock
} from 'lucide-react';
import { ConstellationNode } from './types';

interface ProjectFiveSecondSummaryProps {
  selectedNode: ConstellationNode;
  allNodes: ConstellationNode[];
  onSelectProject: (node: ConstellationNode) => void;
  onAskCopilot?: (prompt: string) => void;
}

export const ProjectFiveSecondSummary: React.FC<ProjectFiveSecondSummaryProps> = ({
  selectedNode,
  allNodes,
  onSelectProject,
  onAskCopilot
}) => {
  return (
    <div className="w-full bg-[#08101e] border border-slate-800 rounded-xl p-3.5 shadow-lg select-none">
      
      {/* Top Strip: Project Switcher & Instant Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Zap className="w-4.5 h-4.5 text-cyan-400" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/30">
                5-SECOND EXECUTIVE OVERVIEW
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {selectedNode.voltage} Transmission Interconnector
              </span>
            </div>

            <div className="relative mt-1">
              <select
                value={selectedNode.id}
                onChange={(e) => {
                  const node = allNodes.find(n => n.id === e.target.value);
                  if (node) onSelectProject(node);
                }}
                className="text-base font-display font-bold text-white bg-slate-900/90 border border-slate-700/80 rounded-lg px-2.5 py-1 pr-8 appearance-none cursor-pointer focus:outline-none focus:border-cyan-500 hover:border-slate-600 transition-colors"
              >
                {allNodes.map((n) => (
                  <option key={n.id} value={n.id} className="bg-slate-900 text-white font-sans">
                    {n.name} ({n.voltage}) — Stage: {n.stage} ({n.progress}%)
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAskCopilot?.(`Generate comprehensive executive brief for project ${selectedNode.name}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 text-xs font-mono font-semibold transition-all cursor-pointer shadow-[0_0_10px_rgba(139,92,246,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Executive Brief</span>
          </button>
        </div>
      </div>

      {/* 6 Essential 5-Second Questions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 pt-3">
        
        {/* 1. Identity & Lifecycle */}
        <div className="bg-[#0b1322] border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>WHERE IN LIFECYCLE?</span>
            <span className="text-cyan-400 font-bold">{selectedNode.progress}%</span>
          </div>
          <div>
            <span className="text-sm font-mono font-bold text-white block">
              {selectedNode.stage}
            </span>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">
              Stage 9 of 12 • Construction
            </span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-cyan-400 h-full transition-all"
              style={{ width: `${selectedNode.progress}%` }}
            />
          </div>
        </div>

        {/* 2. Schedule */}
        <div className="bg-[#0b1322] border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>IS IT ON SCHEDULE?</span>
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-mono font-bold text-amber-300 block">
              14 Days Lag
            </span>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">
              Target: 15 Nov 2026 (SPI: 0.92)
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 block">
            Baseline: 01 Nov 2026
          </span>
        </div>

        {/* 3. Budget */}
        <div className="bg-[#0b1322] border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>IS IT WITHIN BUDGET?</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-mono font-bold text-white block">
              KES 48.2B Approved
            </span>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">
              Spent: KES 34.6B (71.8%)
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-400 block">
            CPI: 1.04 • EAC Variance +2.1%
          </span>
        </div>

        {/* 4. Active Blocker */}
        <div className="bg-[#0b1322] border border-amber-500/30 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-amber-300 text-xs font-mono font-bold">
            <span>WHAT IS BLOCKING IT?</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <span className="text-sm font-mono font-bold text-amber-200 block leading-snug">
              Transformer T-204 Port Dry Dock QC
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 block">
            QC reinspection in Mumbai dry dock
          </span>
        </div>

        {/* 5. Responsible Domain */}
        <div className="bg-[#0b1322] border border-slate-800/80 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>WHO IS RESPONSIBLE?</span>
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div>
            <span className="text-sm font-mono font-bold text-white block">
              Supply Chain & Logistics
            </span>
            <span className="text-xs font-mono text-slate-400 block mt-0.5">
              Lead: Eng. P. Njoroge (SCM)
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400 block">
            EPC: Larsen & Toubro Turnkey
          </span>
        </div>

        {/* 6. Required Intervention */}
        <div className="bg-[#12182b] border border-cyan-500/40 rounded-lg p-3 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-cyan-300 text-xs font-mono font-bold">
            <span>WHAT INTERVENTION?</span>
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div>
            <span className="text-sm font-mono font-bold text-cyan-100 block leading-snug">
              Re-sequence civil pad casting
            </span>
          </div>
          <span className="text-xs font-mono text-cyan-400 block">
            Fast-track auxiliary relay panels
          </span>
        </div>

      </div>
    </div>
  );
};
