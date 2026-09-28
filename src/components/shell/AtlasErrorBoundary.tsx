import React, { Component } from 'react';

interface AtlasErrorBoundaryProps {
  children: React.ReactNode;
}

interface AtlasErrorBoundaryState {
  error: Error | null;
  errorId: string | null;
}

export default class AtlasErrorBoundary extends Component<
  AtlasErrorBoundaryProps,
  AtlasErrorBoundaryState
> {
  declare props: AtlasErrorBoundaryProps;
  declare setState: (state: Partial<AtlasErrorBoundaryState>) => void;
  state: AtlasErrorBoundaryState = { error: null, errorId: null };

  static getDerivedStateFromError(error: Error): AtlasErrorBoundaryState {
    return {
      error,
      errorId: `ATLAS-${Date.now().toString(36).toUpperCase()}`,
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ATLAS] Shell component failed to initialize', { error, info });
  }

  private retry = () => {
    this.setState({ error: null, errorId: null });
  };

  private returnToCommandCenter = () => {
    window.history.pushState({}, '', '/overview');
    this.retry();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const isDevelopment = import.meta.env.DEV;
    return (
      <main className="min-h-screen bg-[#05070D] px-6 py-16 text-slate-100 font-sans">
        <section className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-slate-950/90 p-8 shadow-2xl">
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-cyan-400">Salience Atlas</p>
          <h1 className="mt-4 text-2xl font-semibold">System component failed to initialize.</h1>
          <p className="mt-3 text-sm text-slate-400">
            The Atlas shell is still available. Retry the failed component or return to the Command Center.
          </p>
          <dl className="mt-6 space-y-2 text-xs font-mono text-slate-500">
            <div><dt className="inline">Component: </dt><dd className="inline text-slate-300">Application shell</dd></div>
            <div><dt className="inline">Error identifier: </dt><dd className="inline text-slate-300">{this.state.errorId}</dd></div>
            <div><dt className="inline">Timestamp: </dt><dd className="inline text-slate-300">{new Date().toISOString()}</dd></div>
          </dl>
          {isDevelopment && (
            <pre className="mt-6 max-h-40 overflow-auto rounded-lg bg-black/40 p-3 text-xs text-red-300">
              {this.state.error?.message}
            </pre>
          )}
          <div className="mt-8 flex gap-3">
            <button onClick={this.retry} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950">
              Retry
            </button>
            <button onClick={this.returnToCommandCenter} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200">
              Return to Command Center
            </button>
          </div>
        </section>
      </main>
    );
  }
}
