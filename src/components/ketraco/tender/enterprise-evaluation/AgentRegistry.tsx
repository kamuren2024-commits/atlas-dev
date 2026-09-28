import React from 'react';
import { Cpu, ShieldCheck, Activity, Settings2, History, AlertCircle, CheckCircle2, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react';
import { AgentStatus } from '../../../../types/evaluation';
import { motion } from 'motion/react';

interface AgentRegistryProps {
  agents: AgentStatus[];
}

export function AgentRegistry({ agents }: AgentRegistryProps) {
  return (
    <div className="bg-[#0a0c14] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#0d0f1a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Enterprise Agent Registry</h3>
            <p className="text-[10px] text-white/40 font-mono mt-0.5 uppercase tracking-widest">Autonomous Procurement Ecosystem v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 rounded-lg hover:text-white transition-all uppercase tracking-widest">
            Upgrade Cluster
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#0d0f1a] z-10 border-b border-white/5 text-[10px] font-mono text-white/30 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Agent Name</th>
              <th className="px-6 py-4">Authority</th>
              <th className="px-6 py-4">Version</th>
              <th className="px-6 py-4">Health</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.03]">
            {agents.map((agent) => (
              <tr key={agent.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                      agent.status === 'RUNNING' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-white/5 border-white/10 text-white/20'
                    }`}>
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white tracking-tight">{agent.name}</p>
                      <p className="text-[10px] font-mono text-white/30 uppercase mt-0.5">OWNER: {agent.owner}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className="text-[10px] font-mono text-indigo-400/60 uppercase font-bold">{agent.legalAuthority}</span>
                </td>
                <td className="px-6 py-5 font-mono text-[10px] text-white/40">v{agent.version}</td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden min-w-[60px]">
                      <div 
                        className={`h-full transition-all ${agent.health > 0.9 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        style={{ width: `${agent.health * 100}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-white/60 font-bold">{Math.round(agent.health * 100)}%</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    agent.status === 'RUNNING' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                    agent.status === 'COMPLETED' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                    'bg-white/5 border-white/10 text-white/30'
                  }`}>
                    {agent.status}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 hover:bg-white/10 rounded-md text-white/60 transition-colors">
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded-md text-white/60 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button className="p-1.5 hover:bg-white/10 rounded-md text-white/60 transition-colors">
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
