import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, WifiOff, Database, CheckCircle2, ShieldAlert } from 'lucide-react';
import { NexusUIState } from '../types';

interface UIStateContainerProps {
  state?: NexusUIState;
  onRetry?: () => void;
  children: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  moduleName?: string;
}

export const UIStateContainer: React.FC<UIStateContainerProps> = ({
  state: initialPropState = 'LIVE',
  onRetry,
  children,
  emptyTitle = 'No Records Configured',
  emptyDescription = 'No project transmission assets match the current filter criteria.',
  moduleName = 'Module'
}) => {
  const [overrideState, setOverrideState] = useState<NexusUIState | null>(null);
  const currentState = overrideState || initialPropState;

  // Evaluation state toggle menu
  const [menuOpen, setMenuOpen] = useState(false);

  if (currentState === 'INITIALIZING') {
    return (
      <div className="w-full min-h-[480px] flex flex-col items-center justify-center p-8 bg-[#05080e] border border-slate-800/80 rounded-lg">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-b-purple-400 animate-spin reverse" />
        </div>
        <div className="font-mono text-sm text-cyan-300 tracking-wider uppercase mb-1">
          Initializing {moduleName} Telemetry
        </div>
        <div className="text-xs text-slate-400 font-mono">
          Hydrating enterprise SCADA vectors & PDS registers...
        </div>
      </div>
    );
  }

  if (currentState === 'OFFLINE') {
    return (
      <div className="w-full min-h-[440px] flex flex-col items-center justify-center p-8 bg-[#070b14] border border-slate-800 rounded-lg text-center">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-4">
          <WifiOff className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-mono text-slate-200 uppercase tracking-wider mb-2">
          Telemetry Service Offline
        </h3>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Remote telemetry node disconnected. System is currently serving cached transmission telemetry from local edge storage.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onRetry || (() => setOverrideState('LIVE'))}
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 rounded text-xs font-mono transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reconnect Gateway
          </button>
          <button
            onClick={() => setOverrideState('LIVE')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-mono transition-all"
          >
            View Cached Snapshot
          </button>
        </div>
      </div>
    );
  }

  if (currentState === 'EMPTY') {
    return (
      <div className="w-full min-h-[400px] flex flex-col items-center justify-center p-8 bg-[#060912] border border-slate-800 rounded-lg text-center">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4">
          <Database className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-mono text-slate-200 uppercase tracking-wider mb-1">
          {emptyTitle}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          {emptyDescription}
        </p>
        <button
          onClick={() => setOverrideState('LIVE')}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded text-xs font-mono transition-all"
        >
          Reset Telemetry Filters
        </button>
      </div>
    );
  }

  if (currentState === 'ERROR') {
    return (
      <div className="w-full min-h-[440px] flex flex-col items-center justify-center p-8 bg-[#0a0709] border border-rose-900/40 rounded-lg text-center">
        <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-mono text-rose-300 uppercase tracking-wider mb-2">
          Telemetry Ingestion Exception
        </h3>
        <p className="text-xs text-slate-400 max-w-md mb-4 font-mono">
          KETRACO SCADA Ingest Gateway returned status 503 (Upstream Gateway Timeout on RTU-Mariakani-400).
        </p>
        <button
          onClick={onRetry || (() => setOverrideState('LIVE'))}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded text-xs font-mono transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Pipeline Handshake
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Degraded / Stale Banner if in those states */}
      {currentState === 'DEGRADED' && (
        <div className="mb-3 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-between text-xs text-amber-300 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>DEGRADED TELEMETRY: Ingestion latency exceeds 800ms. Displaying synthesized fallback telemetry.</span>
          </div>
          <button
            onClick={() => setOverrideState('LIVE')}
            className="text-[10px] underline hover:text-white"
          >
            Clear Override
          </button>
        </div>
      )}

      {currentState === 'STALE' && (
        <div className="mb-3 px-3 py-2 bg-blue-500/10 border border-blue-500/30 rounded flex items-center justify-between text-xs text-blue-300 font-mono">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-blue-400" />
            <span>STALE TELEMETRY: Last transmission heartbeat received 180s ago.</span>
          </div>
          <button
            onClick={() => setOverrideState('LIVE')}
            className="text-[10px] underline hover:text-white"
          >
            Force Sync
          </button>
        </div>
      )}

      {/* State Switcher Badge for Testing / Verification */}
      <div className="absolute top-0 right-0 z-20 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#090e18]/80 hover:bg-[#0f1726] border border-slate-800 text-slate-400 hover:text-slate-300 flex items-center gap-1 transition-all"
            title="Toggle UI State for Quality & Chaos Verification"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${
              currentState === 'LIVE' ? 'bg-emerald-400' :
              currentState === 'DEGRADED' ? 'bg-amber-400' :
              currentState === 'STALE' ? 'bg-blue-400' :
              currentState === 'OFFLINE' ? 'bg-slate-400' : 'bg-rose-400'
            }`} />
            <span>STATE: {currentState}</span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-[#0c121e] border border-slate-700 rounded shadow-xl py-1 z-50 text-[10px] font-mono">
              {(['LIVE', 'INITIALIZING', 'DEGRADED', 'STALE', 'OFFLINE', 'EMPTY', 'ERROR'] as NexusUIState[]).map(
                (s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setOverrideState(s);
                      setMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1 flex items-center justify-between hover:bg-slate-800 ${
                      currentState === s ? 'text-cyan-300 font-bold bg-slate-800/60' : 'text-slate-400'
                    }`}
                  >
                    <span>{s}</span>
                    {currentState === s && <CheckCircle2 className="w-3 h-3 text-cyan-400" />}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
};
