import React, { Component } from 'react';
import { Activity, AlertTriangle, Cpu, ShieldCheck } from 'lucide-react';

export function EvaluationOSFallbackShell() {
  return (
    <div className="flex min-h-[560px] flex-1 items-center justify-center bg-[#05070D] px-6 py-10 text-slate-100">
      <div className="w-full max-w-3xl rounded-2xl border border-cyan-500/20 bg-[#0b1220]/80 p-8 shadow-[0_0_40px_rgba(6,182,212,0.08)] backdrop-blur-sm">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.22em] text-cyan-400">
          <Activity className="h-3.5 w-3.5" />
          Evaluation OS
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_14px_rgba(34,211,238,0.9)] animate-pulse" />
          <h1 className="text-2xl font-semibold tracking-tight text-white">System initializing...</h1>
        </div>

        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
          The Evaluation OS is running in a fail-closed state. Tender context, evidence provenance, and authority checks are pending before the live workspace can be reattached.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              Status
            </div>
            <div className="mt-3 text-sm font-medium text-cyan-300">Fail-closed</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
              <Cpu className="h-3.5 w-3.5 text-cyan-400" />
              State
            </div>
            <div className="mt-3 text-sm font-medium text-slate-200">System warmup</div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-400">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Data Source
            </div>
            <div className="mt-3 text-sm font-medium text-amber-300">Awaiting authority</div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface EvaluationOSModuleBoundaryProps {
  children: React.ReactNode;
}

interface EvaluationOSModuleBoundaryState {
  hasError: boolean;
}

export default class EvaluationOSModuleBoundary extends Component<
  EvaluationOSModuleBoundaryProps,
  EvaluationOSModuleBoundaryState
> {
  public props: EvaluationOSModuleBoundaryProps;
  state: EvaluationOSModuleBoundaryState = { hasError: false };

  constructor(props: EvaluationOSModuleBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(): EvaluationOSModuleBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[EVALUATION_OS] Module failed to render. Showing fail-closed shell.', {
      error,
      info,
    });
  }

  render() {
    if (this.state.hasError) {
      return <EvaluationOSFallbackShell />;
    }

    return this.props.children;
  }
}
