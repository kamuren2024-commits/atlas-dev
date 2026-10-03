import React, { useMemo } from 'react';
import { AlertTriangle, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import type { LogisticsTwin } from '../logistics-data-fabric';

interface AiOperationsWorkspaceViewProps {
  twin?: LogisticsTwin;
}

export default function AiOperationsWorkspaceView({ twin }: AiOperationsWorkspaceViewProps) {
  const aiOperations = useMemo(() => {
    if (!twin?.aiOperations?.length) {
      return [
        {
          id: 'ai-empty',
          code: 'OBS-000',
          title: 'No live AI signals',
          category: 'OBSERVE',
          severity: 'LOW',
          message: 'The twin is not presently reporting actionable autonomous logistics signals.',
          recommendation: 'Await authoritative KETRACO feeds or synthetic fallback data to populate risk recommendations.',
          probabilityPct: 0,
        },
      ];
    }

    return twin.aiOperations;
  }, [twin]);

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Sparkles size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">AI Operations & Autonomous Decision Layer</h1>
            <p className="text-xs text-slate-400 mt-0.5">Cross-domain anomalies, intervention planning, and autonomous recommendations from the shared logistics twin.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6 overflow-y-auto pr-1">
        {aiOperations.map((item) => (
          <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-violet-500/40 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300">
                  {item.category}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{item.code}</span>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.severity === 'HIGH' || item.severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-300 border border-rose-500/40' : item.severity === 'MEDIUM' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40'}`}>
                {item.severity}
              </span>
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-300">{item.message}</p>

            <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-cyan-400" />
                <span>Probability</span>
              </div>
              <span className="font-bold text-cyan-300">{item.probabilityPct}%</span>
            </div>

            <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950/60 p-3">
              <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                <AlertTriangle size={12} className="text-amber-400" />
                Recommendation
              </div>
              <p className="text-sm text-slate-200">{item.recommendation}</p>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
              <span>{item.entityType} • {item.entityId}</span>
              <button className="inline-flex items-center gap-1.5 text-cyan-300 hover:text-white">
                Open action plan <ArrowRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
