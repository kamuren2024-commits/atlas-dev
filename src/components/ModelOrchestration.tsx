import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitPullRequest, Zap, ShieldCheck, DollarSign, Activity, Sparkles 
} from 'lucide-react';

interface ModelProvider {
  name: string;
  type: string;
  latency: number;
  cost: number;
  reliability: number;
  active: boolean;
}

export default function ModelOrchestration() {
  const [priorityMode, setPriorityMode] = useState<'latency' | 'cost' | 'balanced'>('balanced');
  const [models, setModels] = useState<ModelProvider[]>([
    { name: "Gemini 3.5 Flash", type: "Google GenAI Core", latency: 120, cost: 12, reliability: 99.8, active: true },
    { name: "Gemini 3.1 Pro Preview", type: "Google Core Deep", latency: 280, cost: 74, reliability: 99.2, active: true },
    { name: "Cortex Local Weights L9", type: "Local CPU/GPU", latency: 45, cost: 0, reliability: 91.4, active: false }
  ]);

  const toggleModelActive = (modelName: string) => {
    setModels(prev => prev.map(m => m.name === modelName ? { ...m, active: !m.active } : m));
  };

  return (
    <div className="h-full flex flex-col gap-6" id="model-orchestration-module">
      {/* Priority Selectors */}
      <div className="glass-panel p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-cyan-400 rounded-lg">
            <GitPullRequest className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-white">Advanced Cognitive Router</h3>
            <p className="text-[11px] text-slate-400">Establish cost/performance routing mappings and weights fallback pools</p>
          </div>
        </div>

        {/* Priorities buttons list */}
        <div className="flex gap-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-900 font-mono text-xs">
          {['latency', 'cost', 'balanced'].map((mode: any) => (
            <button
              key={mode}
              onClick={() => setPriorityMode(mode)}
              className={`px-3 py-1.5 rounded-lg uppercase font-semibold transition-all ${
                priorityMode === mode ? 'bg-indigo-650/45 text-cyan-200 border border-indigo-500/25' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Grid comparing list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Model cards registry list */}
        <div className="lg:col-span-2 space-y-4 max-h-[500px] overflow-y-auto">
          {models.map((m, idx) => {
            const isRouterTarget = (priorityMode === 'latency' && m.latency < 130) ||
                                  (priorityMode === 'cost' && m.cost < 20) ||
                                  (priorityMode === 'balanced');
            return (
              <div 
                key={idx}
                className={`p-5 rounded-2xl border transition-all ${
                  m.active 
                    ? isRouterTarget ? 'bg-indigo-950/40 border-indigo-500/35' : 'bg-slate-900/60 border-slate-800'
                    : 'bg-slate-950/20 border-slate-900/50 opacity-40'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-display font-semibold text-white">{m.name}</h4>
                      <span className="text-[9px] font-mono bg-slate-950 text-indigo-400 border border-slate-850 px-2 py-0.5 rounded">
                        {m.type}
                      </span>
                    </div>
                    {m.active && isRouterTarget && (
                      <span className="text-[9px] font-mono text-cyan-400 tracking-wider flex items-center gap-0.5 animate-pulse">
                        <Sparkles className="w-2.5 h-2.5" /> SELECTED_ROUTE_PATH
                      </span>
                    )}
                  </div>

                  {/* Active Toggle Switch button */}
                  <button
                    onClick={() => toggleModelActive(m.name)}
                    className={`p-1 px-3 text-[10px] font-mono uppercase font-semibold rounded ${
                      m.active ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-500/25' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {m.active ? 'Active' : 'Standby'}
                  </button>
                </div>

                {/* Meter comparisons */}
                <div className="grid grid-cols-3 gap-4 font-mono text-xs pt-2 border-t border-slate-900/40">
                  <div className="space-y-1 text-slate-400">
                    <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-cyan-400" /> Latency
                    </span>
                    <p className="text-white font-semibold">{m.latency}ms</p>
                  </div>

                  <div className="space-y-1 text-slate-400">
                    <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-400" /> Cost Index
                    </span>
                    <p className="text-white font-semibold">{m.cost === 0 ? '0.0 (Local)' : `$0.00${m.cost}`}</p>
                  </div>

                  <div className="space-y-1 text-slate-400">
                    <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-indigo-400" /> Reliability
                    </span>
                    <p className="text-white font-semibold">{m.reliability}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Intelligent Dynamic fallback settings */}
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-display font-semibold text-white tracking-wide border-b border-indigo-500/10 pb-3">
              Route Failover Settings
            </h3>

            <div className="space-y-3 font-sans">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Default Primary Core:</span>
                <span className="font-mono text-[11px] text-cyan-400">GEMINI_MAPPED</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Secondary Failover:</span>
                <span className="font-mono text-[11px] text-indigo-400">CORTEX_LOCAL_L9</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-300">Max Latency Timeout:</span>
                <span className="font-mono text-[11px] text-white">400ms</span>
              </div>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-900 rounded-xl space-y-2 text-xs text-slate-300">
              <p className="font-semibold text-white">Orchestrator Protocol: active</p>
              <p className="text-[11px] leading-relaxed text-slate-400">If primary remote cloud paths exceed the 400ms constraint, model weights redirect immediately onto localized offline networks to avoid workspace freezes.</p>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-500 uppercase flex items-center gap-1.5 pt-4 border-t border-slate-950 mt-4 h-6">
            <Activity className="w-3.5 h-3.5 text-cyan-400" /> API PROXIED SECURELY // COGNITIVE LABS
          </div>
        </div>
      </div>
    </div>
  );
}
