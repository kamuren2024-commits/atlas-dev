import React from 'react';
import { Cpu, CheckCircle2, RefreshCw, AlertTriangle, Clock } from 'lucide-react';
import { AgentStatus } from '../../../../types/evaluation';
import { motion } from 'motion/react';

interface AgentStatusPanelProps {
  agents: AgentStatus[];
  docId: string | null;
}

export function AgentStatusPanel({ agents, docId }: AgentStatusPanelProps) {
  const triggerEvaluation = async () => {
    if (!docId) return;
    await fetch('/api/v2/evaluation/evaluate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ docId })
    });
  };

  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl overflow-hidden flex flex-col">
      <div className="p-5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live Agent Intelligence Panel</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">Active Verification Nodes</p>
          </div>
        </div>
        <button 
          onClick={triggerEvaluation}
          disabled={!docId}
          className="px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 rounded-lg hover:bg-indigo-500/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest"
        >
          RE-RUN VALIDATION
        </button>
      </div>

      <div className="flex-1 p-5 overflow-y-auto max-h-[400px] space-y-3">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className={`p-4 rounded-xl border transition-all ${
              agent.status === 'RUNNING' 
                ? 'bg-indigo-500/5 border-indigo-500/20' 
                : 'bg-white/[0.02] border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-mono text-white/30 font-bold uppercase tracking-widest">AGENT::{agent.id.split('-')[0]}</span>
                <h4 className="text-xs font-bold text-white tracking-tight">{agent.name}</h4>
              </div>
              <div className={`flex items-center gap-2 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${
                agent.status === 'RUNNING' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 animate-pulse' :
                agent.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                'bg-white/5 border-white/10 text-white/30'
              }`}>
                {agent.status === 'RUNNING' && <RefreshCw className="w-2.5 h-2.5 animate-spin" />}
                {agent.status === 'COMPLETED' && <CheckCircle2 className="w-2.5 h-2.5" />}
                {agent.status}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[9px] font-mono">
                <span className="text-white/40 uppercase">Task: <span className="text-white/60">{agent.currentTask || 'Waiting for queue...'}</span></span>
                <span className="text-indigo-400 font-bold">{Math.round(agent.progress)}%</span>
              </div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${agent.progress}%` }}
                  className={`h-full transition-all duration-500 ${
                    agent.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-indigo-500'
                  }`}
                />
              </div>
              {agent.confidence !== undefined && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[9px] font-mono text-white/20 uppercase tracking-tighter">AI Confidence Index</span>
                  <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div 
                          key={i} 
                          className={`w-1.5 h-3 rounded-sm ${
                            i <= Math.round(agent.confidence! * 5) ? 'bg-indigo-500' : 'bg-white/5'
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-white/80">{Math.round(agent.confidence! * 100)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
