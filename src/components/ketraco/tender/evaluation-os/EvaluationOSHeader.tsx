import React from 'react';
import { 
  Shield, Check, Users, ShieldCheck, 
  Layers, ChevronRight, Lock
} from 'lucide-react';

interface EvaluationOSHeaderProps {
  tenderId?: string;
  evaluationId?: string;
  stageName?: string;
  committeeCode?: string;
  activeContextTab: string;
  onSelectContextTab: (tab: string) => void;
  onTriggerUnauthorized?: (actionName: string, reason: string) => void;
  onOpenGovernmentReadiness?: () => void;
}

export default function EvaluationOSHeader({
  tenderId = 'KETRACO/PROC/2026/041',
  evaluationId = 'EVAL-2026-0873',
  stageName = 'Technical Evaluation',
  committeeCode = 'TEC-001',
  activeContextTab,
  onSelectContextTab,
  onTriggerUnauthorized,
  onOpenGovernmentReadiness
}: EvaluationOSHeaderProps) {
  const contextTabs = [
    { id: 'overview', label: 'Tender Overview' },
    { id: 'bids', label: 'Bid Intelligence' },
    { id: 'evaluation-os', label: 'Evaluation OS' },
    { id: 'compliance', label: 'Compliance' },
    { id: 'evidence', label: 'Evidence' },
    { id: 'audit', label: 'Audit' },
  ];

  const governanceStatuses = [
    { label: 'IDENTITY VERIFIED', color: 'emerald', dot: true },
    { label: 'ROLE AUTHORIZED', color: 'emerald', dot: true },
    { label: 'EVALUATION CRITERIA LOCKED', color: 'emerald', dot: true, action: 'Unlock Evaluation Criteria' },
    { label: 'AUDIT LOG ACTIVE', color: 'emerald', dot: true },
    { label: 'EVIDENCE LINKED', color: 'emerald', dot: true },
    { label: 'HUMAN APPROVAL REQUIRED', color: 'amber', dot: true },
    { label: 'LEGAL BASIS AVAILABLE', color: 'emerald', dot: true },
  ];

  return (
    <div className="flex flex-col gap-3 shrink-0" id="evaluation-os-header-root">
      {/* 1. Main Header Card */}
      <div className="bg-[#0b1220] border border-cyan-900/40 rounded-xl p-4 shadow-lg shadow-black/40">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Module Logo + Title + Subtitle */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,225,255,0.15)] shrink-0">
              <Layers className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-tight uppercase">
                  Evaluation OS
                </h1>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-400">
                  v5.2 ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tender Intelligence / Controlled Evaluation Workspace
              </p>
            </div>
          </div>

          {/* Right: Metadata badges */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-mono">
            {/* Tender ID */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 tracking-wider">Tender ID</span>
              <span className="text-slate-200 font-semibold">{tenderId}</span>
            </div>

            <div className="h-7 w-px bg-slate-800 hidden sm:block" />

            {/* Evaluation ID */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 tracking-wider">Evaluation ID</span>
              <span className="text-slate-200 font-semibold">{evaluationId}</span>
            </div>

            <div className="h-7 w-px bg-slate-800 hidden sm:block" />

            {/* Stage */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 tracking-wider">Stage</span>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-[11px] font-semibold flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {stageName}
              </span>
            </div>

            <div className="h-7 w-px bg-slate-800 hidden sm:block" />

            {/* Committee */}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 tracking-wider">Committee</span>
              <span className="text-slate-200 font-semibold flex items-center gap-1.5 mt-0.5">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                {committeeCode}
              </span>
            </div>

            <div className="h-7 w-px bg-slate-800 hidden sm:block" />

            {/* Status Pills */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                ACTIVE
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <Check className="w-3 h-3 text-emerald-400" />
                COMPLIANT
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                FULLY TRACEABLE
              </span>
            </div>
          </div>
        </div>

        {/* 2. Tender Intelligence Context Subnav Bar */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto">
          {contextTabs.map((tab) => {
            const isActive = activeContextTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectContextTab(tab.id)}
                className={`relative px-4 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-cyan-300 font-bold bg-cyan-950/40 border border-cyan-500/40 shadow-[0_0_12px_rgba(0,225,255,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-cyan-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Governance Status Bar */}
      <div className="bg-[#080e1a] border border-slate-800/70 rounded-lg px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 shrink-0">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-slate-200 text-[11px] uppercase tracking-wider">
            Governance Status
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {governanceStatuses.map((item, idx) => {
            const isAmber = item.color === 'amber';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (item.action && onTriggerUnauthorized) {
                    onTriggerUnauthorized(
                      item.action,
                      'Evaluation criteria are locked by Committee Resolution under PPADA 2015 Section 80. Only the Accounting Officer can modify locked criteria.'
                    );
                  }
                }}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border transition-all ${
                  isAmber
                    ? 'bg-amber-950/30 border-amber-500/30 text-amber-300'
                    : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                } ${item.action ? 'hover:border-cyan-400 cursor-pointer' : 'cursor-default'}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isAmber ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                {item.label}
              </button>
            );
          })}

          {onOpenGovernmentReadiness && (
            <button
              type="button"
              onClick={onOpenGovernmentReadiness}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-mono font-bold bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-900/60 hover:text-white transition-all cursor-pointer shadow-[0_0_10px_rgba(0,225,255,0.15)] ml-auto"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>STATUTORY AUDIT & e-GPS HUB</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
