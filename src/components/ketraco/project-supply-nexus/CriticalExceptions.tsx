import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  FileSpreadsheet,
  HardHat,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  Play,
  RotateCcw,
  X,
  CheckCircle2,
  Cpu,
  Clock,
  ArrowRight
} from 'lucide-react';
import { CriticalException } from './types';
import { StatusBadge } from './shared/StatusBadge';

interface CriticalExceptionsProps {
  exceptions: CriticalException[];
  onInvestigate?: (exception: CriticalException) => void;
  onSimulate?: (exception: CriticalException) => void;
  onRecoveryPlan?: (exception: CriticalException) => void;
}

export const CriticalExceptions: React.FC<CriticalExceptionsProps> = ({
  exceptions = [],
  onInvestigate,
  onSimulate,
  onRecoveryPlan
}) => {
  const [activeModal, setActiveModal] = useState<{
    exception: CriticalException;
    mode: 'investigate' | 'simulate' | 'recovery';
  } | null>(null);

  const [simRunning, setSimRunning] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const getExceptionIcon = (title: string) => {
    if (title.includes('Transformer')) return <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
    if (title.includes('Wayleave')) return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
    if (title.includes('Variation')) return <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />;
    return <HardHat className="w-3.5 h-3.5 text-yellow-400" />;
  };

  const handleOpenModal = (
    exc: CriticalException,
    mode: 'investigate' | 'simulate' | 'recovery'
  ) => {
    setActiveModal({ exception: exc, mode });
    setActionSuccess(null);
    if (mode === 'investigate') onInvestigate?.(exc);
    if (mode === 'simulate') onSimulate?.(exc);
    if (mode === 'recovery') onRecoveryPlan?.(exc);
  };

  const runSimulation = () => {
    setSimRunning(true);
    setTimeout(() => {
      setSimRunning(false);
      setActionSuccess('Monte Carlo 10,000 runs converged: Optimal rerouting reduces critical path variance from +21d to +4d.');
    }, 900);
  };

  const executeAction = (actionTitle: string) => {
    setActionSuccess(`Action initiated: "${actionTitle}". Dispatch order generated with cryptographic audit proof.`);
  };

  return (
    <div className="bg-[#0a0f18]/80 border border-slate-800/80 rounded-lg p-3.5 flex flex-col justify-between h-full relative">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-display font-semibold text-slate-100 tracking-tight">
            Critical Exceptions
          </h3>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold">
            {exceptions.length}
          </span>
        </div>
        <button
          onClick={() => exceptions?.[0] && handleOpenModal(exceptions[0], 'investigate')}
          disabled={!exceptions?.[0]}
          className="p-1 text-slate-500 hover:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
          title="Inspect Top Anomaly"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Exception List */}
      <div className="space-y-2.5 py-2 overflow-y-auto max-h-[300px] custom-scrollbar">
        {exceptions.map(exc => {
          return (
            <div
              key={exc.id}
              className="p-2.5 rounded-md bg-[#080d15] hover:bg-[#0c121e] border border-slate-800/70 hover:border-slate-700 transition-all space-y-1.5"
            >
              {/* Header line */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {getExceptionIcon(exc.title)}
                  <span className="text-xs font-semibold text-slate-200">
                    {exc.title}
                  </span>
                </div>
                <StatusBadge status={exc.severity} size="sm" />
              </div>

              {/* Project ID */}
              <div className="text-[10px] font-mono text-cyan-400">
                {exc.code} • {exc.project}
              </div>

              {/* Detail & Impact */}
              <div className="text-xs text-slate-300 leading-relaxed">
                {exc.detail}
              </div>
              <div className="text-xs text-slate-400 flex flex-wrap items-center justify-between gap-1">
                <span className="text-rose-300/90 font-mono">
                  Impact: {exc.impact}
                </span>
                <span className="text-cyan-400 font-mono font-medium">
                  AI Confidence: {exc.aiConfidence}%
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/50">
                <button
                  onClick={() => handleOpenModal(exc, 'investigate')}
                  className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-[10px] font-mono transition-colors cursor-pointer"
                >
                  Investigate
                </button>
                <button
                  onClick={() => handleOpenModal(exc, 'simulate')}
                  className="px-2 py-0.5 rounded bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-300 text-[10px] font-mono transition-colors cursor-pointer"
                >
                  Simulate
                </button>
                <button
                  onClick={() => handleOpenModal(exc, 'recovery')}
                  className="px-2 py-0.5 rounded bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono transition-colors ml-auto cursor-pointer"
                >
                  Recovery Plan
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Investigation & Simulation Dialog */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0a0f18] border border-cyan-500/50 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-3.5 border-b border-slate-800 bg-[#070b12] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {activeModal.mode === 'investigate' && 'Incident Diagnostic Investigation'}
                  {activeModal.mode === 'simulate' && 'Supply Chain Scenario Simulation'}
                  {activeModal.mode === 'recovery' && 'Autonomous Recovery Protocol'}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-500/40">
                  {activeModal.exception.code}
                </span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-3.5 overflow-y-auto max-h-[70vh] custom-scrollbar text-xs font-sans">
              <div>
                <h4 className="text-sm font-semibold text-white">
                  {activeModal.exception.title}
                </h4>
                <p className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  Project: {activeModal.exception.project}
                </p>
                <p className="text-slate-300 text-xs mt-1.5 leading-relaxed">
                  {activeModal.exception.detail}
                </p>
              </div>

              {/* Anomaly Metrics */}
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Critical Impact</div>
                  <div className="text-rose-400 font-bold mt-0.5">{activeModal.exception.impact}</div>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500">AI Confidence</div>
                  <div className="text-cyan-400 font-bold mt-0.5">{activeModal.exception.aiConfidence}%</div>
                </div>
                <div className="p-2 rounded bg-slate-900/80 border border-slate-800">
                  <div className="text-[10px] text-slate-500">Root Cause Origin</div>
                  <div className="text-amber-400 font-bold mt-0.5">Supply/EPC Tier-2</div>
                </div>
              </div>

              {/* AI Recommended Autonomous Actions */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Prescribed Autonomous Interventions</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-slate-200 font-medium text-xs">
                        Reroute Component Delivery via Port of Mombasa Fast-Track Green Lane
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Avoids 14-day transshipment bottleneck; cost impact +KES 1.8M.
                      </div>
                    </div>
                    <button
                      onClick={() => executeAction('Port of Mombasa Green Lane Reroute')}
                      className="px-2.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      Authorize
                    </button>
                  </div>

                  <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-slate-200 font-medium text-xs">
                        Activate Dual-Shift Tower Erection Contingency
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                        Deploys 2 additional EPC teams to compress remaining civil works by 9 days.
                      </div>
                    </div>
                    <button
                      onClick={() => executeAction('Dual-Shift Contingency')}
                      className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 text-purple-300 font-mono text-[10px] font-bold shrink-0 cursor-pointer"
                    >
                      Authorize
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulation Engine */}
              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">
                    Atlas Probabilistic Engine
                  </span>
                  <button
                    onClick={runSimulation}
                    disabled={simRunning}
                    className="px-3 py-1 rounded bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-mono text-[10px] font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    {simRunning ? 'Simulating 10k Scenarios...' : 'Run Monte Carlo'}
                  </button>
                </div>

                {actionSuccess && (
                  <div className="mt-2.5 p-2 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{actionSuccess}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-2.5 border-t border-slate-800 bg-[#070b12] flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Telemetry Timestamp: Real-time sync</span>
              <button
                onClick={() => setActiveModal(null)}
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
