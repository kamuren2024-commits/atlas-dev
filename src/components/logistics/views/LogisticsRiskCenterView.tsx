import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, ShieldAlert, Zap, RefreshCw, CheckCircle2,
  TrendingDown, ArrowRight, Sparkles, Filter, Search, Play, FileText
} from 'lucide-react';

interface RiskSignal {
  id: string;
  signal: string;
  category: string;
  severity: string;
  affectedEntity: string;
  affectedEntityId: string;
  evidence: string[];
  confidence: number;
  timestamp: string;
  recommendedAction: string;
  escalationStatus: string;
}

export default function LogisticsRiskCenterView() {
  const [risks, setRisks] = useState<RiskSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<RiskSignal | null>(null);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/logistics/risks');
      const json = await res.json();
      if (json.ok && json.data) {
        setRisks(json.data.risks || []);
        if (json.data.risks?.length > 0 && !selectedRisk) {
          setSelectedRisk(json.data.risks[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load logistics risks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRisks();
  }, []);

  const handleExecuteMitigation = async () => {
    if (!selectedRisk) return;
    setExecuting(true);
    try {
      const res = await fetch('/api/logistics/workflows/VEHICLE_BREAKDOWN_REASSIGNMENT/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetEntityId: selectedRisk.affectedEntityId,
          parameters: { replacementVehicleId: 'veh-018' },
        }),
      });
      const json = await res.json();
      if (json.ok) {
        setExecutionResult(json.data);
        fetchRisks();
      }
    } catch (e) {
      console.error('Workflow execution failed:', e);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020b14] text-slate-100 p-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Logistics Exception & Early-Warning Risk Center
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300">
                Explainable AI Correlation
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-source anomaly correlation: Telemetry excursion, corridor delays, vehicle breakdown predictions, and automated mitigation workflows.
            </p>
          </div>
        </div>

        <button
          onClick={fetchRisks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Signals</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-4 gap-4 my-4 flex-shrink-0">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Risk Signals</span>
          <div className="text-2xl font-bold text-white mt-1">{risks.length}</div>
          <span className="text-[11px] text-slate-400">Continuous telemetry scan</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical Escalations</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {risks.filter(r => r.severity === 'CRITICAL').length}
          </div>
          <span className="text-[11px] text-rose-400/80 font-medium">Action required immediately</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">High Risk Items</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">
            {risks.filter(r => r.severity === 'HIGH').length}
          </div>
          <span className="text-[11px] text-amber-400/80">Under proactive monitoring</span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Confidence Index</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">94.2%</div>
          <span className="text-[11px] text-emerald-400/80">Cross-verified graph nodes</span>
        </div>
      </div>

      {/* Main split */}
      <div className="flex-1 grid grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Left Signals List */}
        <div className="col-span-7 flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-slate-800/80 bg-slate-900/80 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Live Correlated Risk Matrix</span>
            <span className="text-xs text-slate-400 font-mono">{risks.length} Anomalies Logged</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {risks.map(r => {
              const isSelected = selectedRisk?.id === r.id;
              const isCritical = r.severity === 'CRITICAL';
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRisk(r);
                    setExecutionResult(null);
                  }}
                  className={`p-3.5 transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? 'bg-rose-950/30 border-l-4 border-l-rose-500'
                      : 'hover:bg-slate-800/30'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isCritical ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {r.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">{r.category}</span>
                    </div>

                    <div className="font-bold text-xs text-white">{r.signal}</div>
                    <div className="text-[11px] text-slate-400">{r.affectedEntity}</div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                      {Math.round(r.confidence * 100)}% Conf
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail & Mitigation Action */}
        <div className="col-span-5 flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-rose-400" />
              <h3 className="font-bold text-sm text-white">Automated Mitigation & Root Cause</h3>
            </div>
            {selectedRisk && (
              <span className="text-xs font-mono text-rose-300 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
                {selectedRisk.severity}
              </span>
            )}
          </div>

          {selectedRisk ? (
            <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-500">Target Operational Entity</span>
                <div className="font-bold text-white text-sm mt-0.5">{selectedRisk.affectedEntity}</div>
                <div className="font-mono text-[11px] text-cyan-400 mt-1">ID: {selectedRisk.affectedEntityId}</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Observable Telemetry Evidence</span>
                <ul className="space-y-1.5">
                  {selectedRisk.evidence.map((ev, idx) => (
                    <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-2">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{ev}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/40 space-y-2">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                  <Sparkles size={14} />
                  <span>Agent Federation Recommendation</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  {selectedRisk.recommendedAction}
                </p>
              </div>

              {executionResult && (
                <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-[11px]">
                    <CheckCircle2 size={14} />
                    <span>Workflow Successfully Executed</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Execution ID: <span className="font-mono text-emerald-400">{executionResult.workflowExecutionId}</span>
                  </p>
                  <ul className="text-[10px] space-y-1 text-slate-300">
                    {executionResult.actionsTaken?.map((act: any, i: number) => (
                      <li key={i}>✓ {act.result}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={handleExecuteMitigation}
                  disabled={executing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 text-white font-semibold shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
                >
                  <Play size={14} className={executing ? 'animate-spin' : ''} />
                  <span>{executing ? 'Executing Remediation...' : 'Execute Authorized Mitigation Workflow'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500 text-xs">
              Select an operational anomaly to inspect root cause.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
