import React, { useState } from 'react';
import {
  Bot, Sparkles, Network, Search, ArrowRight, Play, CheckCircle2,
  ShieldCheck, RefreshCw, Cpu, Layers, AlertTriangle
} from 'lucide-react';

interface InvestigationData {
  investigationId: string;
  targetEntityId: string;
  targetEntityType: string;
  summary: string;
  rootCauseAnalysis: {
    primaryCause: string;
    contributingFactors: string[];
    confidence: number;
    evidenceNodes: Array<{ id: string; label: string; type: string }>;
  };
  downstreamImpact: {
    affectedShipments: string[];
    affectedProjects: string[];
    criticalMilestonesDelayed: boolean;
    estimatedCostImpactKes: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    actionType: string;
    impactMitigationPct: number;
    recommendedParameters: Record<string, any>;
    approvalRequired: boolean;
  }>;
  graphTraversalTrail: string[];
  timestamp: string;
}

export default function AiOperationsWorkspaceView() {
  const [targetEntityId, setTargetEntityId] = useState('veh-031');
  const [investigating, setInvestigating] = useState(false);
  const [investigation, setInvestigation] = useState<InvestigationData | null>(null);
  const [applying, setApplying] = useState(false);
  const [appliedAction, setAppliedAction] = useState<string | null>(null);

  const runInvestigation = async () => {
    setInvestigating(true);
    setAppliedAction(null);
    try {
      const res = await fetch('/api/logistics/ai/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: 'VEHICLE',
          entityId: targetEntityId,
        }),
      });
      const json = await res.json();
      if (json.ok && json.data) {
        setInvestigation(json.data);
      }
    } catch (e) {
      console.error('AI Investigation failed:', e);
    } finally {
      setInvestigating(false);
    }
  };

  const handleApplyWorkflow = async (rec: any) => {
    setApplying(true);
    try {
      const workflowId = rec.actionType === 'REASSIGN_VEHICLE'
        ? 'VEHICLE_BREAKDOWN_REASSIGNMENT'
        : 'DELAYED_SHIPMENT_REROUTE';

      const res = await fetch(`/api/logistics/workflows/${workflowId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEntityId: investigation?.targetEntityId || targetEntityId,
          parameters: rec.recommendedParameters,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setAppliedAction(`Workflow ${workflowId} authorized and executed successfully.`);
      }
    } catch (e) {
      console.error('Workflow trigger failed:', e);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Logistics AI Federation & Multi-Agent Investigation Console
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-violet-950/60 border border-violet-500/40 text-violet-300">
                12 Federation Agents Active
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated graph traversal, causal root-cause attribution, project milestone impact estimation, and supervised action dispatch.
            </p>
          </div>
        </div>

        {/* Input Target */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={targetEntityId}
            onChange={e => setTargetEntityId(e.target.value)}
            placeholder="Entity ID (e.g. veh-031)"
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none w-44 font-mono"
          />
          <button
            onClick={runInvestigation}
            disabled={investigating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 text-xs text-white font-semibold shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
          >
            <Sparkles size={14} className={investigating ? 'animate-spin' : ''} />
            <span>{investigating ? 'Investigating...' : 'Run Investigation'}</span>
          </button>
        </div>
      </div>

      {/* Agents Strip */}
      <div className="grid grid-cols-4 gap-4 my-4 flex-shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logistics Orchestrator</span>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">OPERATIONAL (Online)</div>
          </div>
          <Cpu size={18} className="text-emerald-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Route Intelligence Agent</span>
            <div className="text-xs font-semibold text-cyan-400 mt-0.5">ACTIVE CORRIDORS (14)</div>
          </div>
          <Network size={18} className="text-cyan-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Delay Prediction Agent</span>
            <div className="text-xs font-semibold text-amber-400 mt-0.5">FORECASTING (0.94 Conf)</div>
          </div>
          <Bot size={18} className="text-amber-400" />
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Agent</span>
            <div className="text-xs font-semibold text-rose-400 mt-0.5">1 CRITICAL ESCALATION</div>
          </div>
          <AlertTriangle size={18} className="text-rose-400" />
        </div>
      </div>

      {/* Main Investigation Canvas */}
      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left: Root Cause & Graph Trail */}
        <div className="col-span-7 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Network size={14} className="text-violet-400" />
              Causal Graph Traversal Trail
            </span>
            {investigation && (
              <span className="font-mono text-xs text-violet-300">
                Confidence: {Math.round(investigation.rootCauseAnalysis.confidence * 100)}%
              </span>
            )}
          </div>

          {investigation ? (
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Executive Summary</span>
                <p className="text-slate-200 leading-relaxed">{investigation.summary}</p>
              </div>

              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-rose-400">Primary Root Cause</span>
                <p className="font-semibold text-white">{investigation.rootCauseAnalysis.primaryCause}</p>
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Contributing Telemetry Factors:</span>
                  {investigation.rootCauseAnalysis.contributingFactors.map((fac, idx) => (
                    <div key={idx} className="text-[11px] text-slate-300 flex items-center gap-2">
                      <span className="text-rose-400">•</span>
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traversal path */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Knowledge Graph Cross-Domain Chain</span>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {investigation.graphTraversalTrail.map((hop, i) => (
                    <React.Fragment key={i}>
                      <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-mono text-[11px]">
                        {hop}
                      </span>
                      {i < investigation.graphTraversalTrail.length - 1 && (
                        <ArrowRight size={12} className="text-slate-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Downstream Impact */}
              <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-400">Downstream Impact Analysis</span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Affected Project:</span>
                    <div className="font-semibold text-white">Suswa Lot 4 400kV Link</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Financial Exposure:</span>
                    <div className="font-mono font-bold text-amber-300">KES 4.85 Million</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center justify-center h-full">
              <Bot size={36} className="text-slate-600 mb-3" />
              <span>Enter an entity code or click &quot;Run Investigation&quot; to trigger the multi-agent cognitive fabric.</span>
            </div>
          )}
        </div>

        {/* Right: Recommendations & Action Dispatch */}
        <div className="col-span-5 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-violet-400" />
              <h3 className="font-bold text-sm text-white">Supervised Mitigation Actions</h3>
            </div>
            {investigation && (
              <span className="text-xs font-mono text-cyan-300">
                {investigation.recommendations.length} Options
              </span>
            )}
          </div>

          {appliedAction && (
            <div className="m-4 p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{appliedAction}</span>
            </div>
          )}

          {investigation ? (
            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              {investigation.recommendations.map(rec => (
                <div
                  key={rec.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{rec.title}</span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      +{rec.impactMitigationPct}% Recovery
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    Type: {rec.actionType}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleApplyWorkflow(rec)}
                      disabled={applying}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 text-white font-medium text-xs cursor-pointer shadow-md transition-all"
                    >
                      <Play size={12} />
                      <span>{applying ? 'Dispatching...' : 'Authorize & Dispatch'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Recommendations will appear upon completing root cause diagnosis.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
