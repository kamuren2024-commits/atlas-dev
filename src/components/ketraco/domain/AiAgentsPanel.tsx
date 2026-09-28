import React, { useState } from 'react';
import { Cpu, Users, ShieldAlert, Sparkles, Sliders, RefreshCw, Layers } from 'lucide-react';

interface AiAgentsPanelProps {
  onAskCopilot: (prompt: string) => void;
  setActiveAgent: (agentName: string | null) => void;
}

export default function AiAgentsPanel({
  onAskCopilot,
  setActiveAgent
}: AiAgentsPanelProps) {
  const [activeTabAgent, setActiveTabAgent] = useState<string>('FORECAST_AGENT');

  // Multi-Agent workforce profiles
  const agents = [
    {
      id: 'FORECAST_AGENT',
      name: 'Nodal Forecast Agent',
      icon: Cpu,
      role: 'Continuous shortage prediction and demand planning',
      health: 'Nominal (100%)',
      status: 'MONITORING_REPLENISHMENT',
      tools: ['GetNodalStock()', 'PredictDemandHorizon(90)', 'GetEPOSyncCache()'],
      memory: 'Mombasa laying down copper grounding rod supply lines decreasing rapid consumption rate.'
    },
    {
      id: 'OPTIMIZER_AGENT',
      name: 'Safety Stock Optimizer Agent',
      icon: Sliders,
      role: 'Automatic safety buffer calculations & E.O.Q alignments',
      health: 'Nominal (98%)',
      status: 'RECALCULATING_EOQ',
      tools: ['TweakSafetyLimit()', 'CalcZFactorServiceLevel(95)', 'PushSafetyThresholds()'],
      memory: 'Re-analyzed weather shock patterns. Recommended raising central depot insulators.'
    },
    {
      id: 'ANALYST_AGENT',
      name: 'Federated Analyst Agent',
      icon: Layers,
      role: 'Cross-ERP reconciliation, balance verification, discrepancy matching',
      health: 'Idle (100%)',
      status: 'RECONCILING_SAP_ECC',
      tools: ['FetchSAPEccCache()', 'CompareODataBalances()', 'ProduceDiscrepanciesReport()'],
      memory: 'Matched KES 16.4B available spares against Oracle ledger queues. Synchronized successfully.'
    },
    {
      id: 'COMPLIANCE_AGENT',
      name: 'Procurement Compliance Agent',
      icon: ShieldAlert,
      role: 'PPADA statutory rules alignment, Level 5 approval checks',
      health: 'Nominal (100%)',
      status: 'VALIDATING_DIRECT_AWARDS',
      tools: ['VerifyPpadaSection106()', 'InspectCryptographicPIN()', 'AuditSignatures()'],
      memory: 'Direct Awards under MAT-402830 successfully linked to emergency grid failures.'
    }
  ];

  const currentAgent = agents.find(a => a.id === activeTabAgent) || agents[0];

  return (
    <div className="p-5 space-y-5 flex-1 overflow-y-auto">
      <div>
        <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-405" />
          Autonomous AI SCM Agent Workforce
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Monitor active cognitive SCM agents executing backend, real-time demand modeling and PPADA regulatory checks.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        {/* Left Side: Agent Grid selector index (5 columns) */}
        <div className="xl:col-span-5 bg-slate-950/40 border border-slate-900 rounded-3xl p-4.5 space-y-4">
          <span className="text-[9.5px] font-mono text-slate-500 block uppercase font-bold tracking-widest pl-1">
            ACTIVE COGNITIVE AGENTS LIST
          </span>

          <div className="space-y-3">
            {agents.map(a => {
              const Icon = a.icon;
              const isSelected = activeTabAgent === a.id;
              return (
                <button
                  key={a.id}
                  onClick={() => setActiveTabAgent(a.id)}
                  className={`w-full text-left p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-950/30 to-slate-900 border-cyan-500/35 text-[#00D9FF]'
                      : 'bg-slate-900/15 border-slate-900 hover:border-slate-800 text-slate-350'
                  }`}
                >
                  <div className={`p-2 bg-slate-950 border rounded-xl ${isSelected ? 'border-cyan-500/30' : 'border-slate-800'}`}>
                    <Icon className="w-5 h-5 text-cyan-405" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold truncate block">{a.name}</span>
                    <span className="text-[9.5px] font-mono text-emerald-450 uppercase block tracking-wider mt-0.5">
                      ● Status: {a.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Specific Agent Telemetry Controls and Reasoning Trace (7 columns) */}
        <div className="xl:col-span-7">
          {currentAgent ? (
            <div className="bg-slate-950/45 border border-slate-900 rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-start border-b border-indigo-950/30 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-cyan-405 block uppercase font-bold">
                    SYSTEM INSTANCE WORKFORCE // {currentAgent.id}
                  </span>
                  <h3 className="text-xs text-white mt-1.5 font-extrabold leading-snug">{currentAgent.name}</h3>
                </div>
                <div className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-2xl">
                  <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">HEALTH RATE</span>
                  <span className="font-mono text-emerald-400 font-bold text-xs block mt-0.5">
                    {currentAgent.health}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                Role: <strong>{currentAgent.role}</strong>
              </p>

              {/* Tool registries */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-slate-500 block uppercase font-bold">REGISTERED API TOOL SUITE</span>
                <div className="flex flex-wrap gap-2">
                  {currentAgent.tools.map((t, idx) => (
                    <span key={idx} className="bg-slate-950 text-slate-300 px-2.5 py-1 text-[10px] font-mono border border-slate-900 rounded-lg">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Memory context */}
              <div className="p-4 bg-slate-905 border border-slate-900 rounded-2xl space-y-2 text-xs">
                <span className="text-[9.5px] font-mono text-[#00D9FF] block uppercase font-bold">Active Cognitive Working Context memory</span>
                <p className="text-slate-350 italic font-medium leading-relaxed font-sans pl-1">
                  &ldquo;{currentAgent.memory}&rdquo;
                </p>
              </div>

              {/* Interaction controllers */}
              <div className="pt-2 border-t border-indigo-950/20 flex gap-2">
                <button
                  onClick={() => setActiveAgent(currentAgent.name)}
                  className="flex-1 py-2.5 bg-[#00D9FF] hover:bg-cyan-500 text-black text-xs font-mono font-bold rounded-xl"
                >
                  CONNECT COGNITIVE LOG ENGINE
                </button>
                <button
                  onClick={() => onAskCopilot(`Trigger reasoning trace loop and active performance verification for SCM workforce agent: ${currentAgent.name}`)}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-950 to-indigo-950 hover:bg-slate-900 text-cyan-300 border border-cyan-500/20 rounded-xl text-xs font-mono font-bold"
                >
                  Audit Agent
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">
              Select an autonomous workforce agent code on the left to monitor active reasoning traces.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
