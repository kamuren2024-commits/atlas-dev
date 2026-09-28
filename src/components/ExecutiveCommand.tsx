import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, Landmark, Activity, Heart, ArrowUpRight, 
  HelpCircle, CheckCircle2, AlertTriangle, RefreshCw, Sparkles
} from 'lucide-react';

interface ThreatVector {
  module: string;
  riskScore: number;
  threatLevel: 'low' | 'moderate' | 'critical';
  mitigated: boolean;
}

export default function ExecutiveCommand() {
  const [threats, setThreats] = useState<ThreatVector[]>([
    { module: "Unrestricted OAuth Token Ingress", riskScore: 82, threatLevel: "critical", mitigated: false },
    { module: "Unused Active Coding Agent frames", riskScore: 44, threatLevel: "moderate", mitigated: true },
    { module: "Unencrypted PDF file chunk embedding scan", riskScore: 18, threatLevel: "low", mitigated: true }
  ]);

  const [execStatus, setExecStatus] = useState<'nominal' | 'degraded'>('nominal');

  const handleMitigateThreat = (moduleName: string) => {
    setThreats(prev => prev.map(t => t.module === moduleName ? { ...t, mitigated: true } : t));
  };

  return (
    <div className="h-full flex flex-col gap-6" id="executive-command-module">
      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Risk Compliance Level", value: "94.2%", desc: "Target rate exceeding 90% benchmark", color: "text-emerald-400" },
          { title: "Allocated Workspace Load", value: "48.2%", desc: "18 Active VM nodes mapped normal", color: "text-cyan-400" },
          { title: "Compute Token Threshold", value: "112,042", desc: "API usage under predicted daily budget", color: "text-indigo-400" },
          { title: "Security Matrix Synced", value: "Nominal", desc: "Global shields active", color: "text-purple-400" }
        ].map((kpi, idx) => (
          <div key={idx} className="glass-panel p-5 rounded-2xl space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">{kpi.title}</span>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-display font-bold leading-none ${kpi.color}`}>{kpi.value}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-500 hover:text-white" />
            </div>
            <p className="text-[11px] font-sans text-slate-400 leading-relaxed">{kpi.desc}</p>
          </div>
        ))}
      </div>

      {/* Main Panel Content split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Threat vectors grid list */}
        <div className="glass-panel p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-indigo-500/10 pb-3">
            <h3 className="text-sm font-display font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-pink-400" /> Executive Security Threat Registry
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">TELEMETRY_REAL_TIME</span>
          </div>

          <div className="space-y-3">
            {threats.map((threat, idx) => (
              <div 
                key={idx} 
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  threat.mitigated 
                    ? 'bg-slate-950/25 border-slate-900/60 opacity-60' 
                    : threat.threatLevel === 'critical' ? 'bg-pink-950/20 border-pink-500/20' : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="space-y-1.5 pr-3 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-display font-medium text-white truncate block">{threat.module}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      threat.threatLevel === 'critical' ? 'bg-pink-950 text-pink-400 border-pink-500/20' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}>
                      {threat.threatLevel.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-500">
                    DIAGNOSTIC CRITERIA SCORE: <strong className="text-slate-300">{threat.riskScore}/100</strong>
                  </p>
                </div>

                <div className="shrink-0">
                  {threat.mitigated ? (
                    <span className="text-[10px] font-mono text-emerald-400 uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mitigated
                    </span>
                  ) : (
                    <button
                      onClick={() => handleMitigateThreat(threat.module)}
                      className="p-1 px-2 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white font-mono uppercase rounded transition-colors"
                    >
                      Remediate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Corporate Advisory board details */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-display font-semibold text-white tracking-wide border-b border-indigo-500/10 pb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" /> Corporate Strategy Advisor
            </h3>

            <div className="space-y-3">
              {[
                { title: "Model Cost Consolidation", text: "Decommission all inactive 'Review Agent' frameworks in Agent Studio to save daily Google API Token weights." },
                { title: "Continuous Database Schema Audit", text: "Re-anchor visual connectors in Workflow Designer to establish immediate alert checks on database token expirations." },
                { title: "Quantum Multi-Plan Convergence", text: "Commit historical chat outputs into the long-term semantic clusters of the Knowledge Cortex to avoid memory context decay." }
              ].map((rec, i) => (
                <div key={i} className="bg-slate-950/80 p-3 rounded-lg border border-slate-900 text-xs text-slate-300 space-y-1">
                  <span className="font-display font-medium text-white block">{rec.title}</span>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">{rec.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors uppercase pt-4 flex items-center gap-2 pointer-events-none mt-4 border-t border-slate-900">
            <Activity className="w-3.5 h-3.5 text-indigo-400" /> Operational Status: NOMINAL // ALL PRIMARY SYSTEMS FUNCTIONING NORMAL
          </div>
        </div>
      </div>
    </div>
  );
}
