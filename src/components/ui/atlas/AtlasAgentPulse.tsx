import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Activity, Cpu, Globe, Search, Shield, Workflow } from 'lucide-react';
import { motionTokens } from '../../../design-system/tokens';

export interface AtlasAgentStatus {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'investigating' | 'processing';
  activity: string;
  detail?: string;
  tone?: 'cyan' | 'violet' | 'success' | 'warning';
}

export interface AtlasAgentPulseProps {
  agents: AtlasAgentStatus[];
  expanded?: boolean;
  onSelectAgent?: (agentId: string) => void;
  onToggle?: () => void;
  className?: string;
}

const STATUS_META: Record<AtlasAgentStatus['status'], { dot: string; text: string; label: string }> = {
  active: { dot: 'bg-emerald-400', text: 'text-emerald-400', label: 'ACTIVE' },
  idle: { dot: 'bg-slate-500', text: 'text-slate-500', label: 'IDLE' },
  investigating: { dot: 'bg-amber-400', text: 'text-amber-400', label: 'INVESTIGATING' },
  processing: { dot: 'bg-violet-400', text: 'text-violet-400', label: 'PROCESSING' },
};

export function AtlasAgentPulse({ agents, expanded = false, onSelectAgent, onToggle, className = '' }: AtlasAgentPulseProps) {
  const activeCount = agents.filter(a => a.status === 'active' || a.status === 'investigating' || a.status === 'processing').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`atlas-panel overflow-hidden ${className}`}
    >
      {/* Pulse header — always visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-slate-800/20 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-40" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-400" />
          </span>
          <div className="leading-tight text-left min-w-0">
            <span className="block text-[11px] font-mono font-bold text-slate-200 tracking-wider">
              ATLAS AGENT PULSE
            </span>
            <span className="block text-[9px] font-mono text-violet-400 font-semibold tracking-wider">
              {activeCount} AGENTS ACTIVE
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[9px] font-mono uppercase tracking-wider ${expanded ? 'text-cyan-400' : 'text-slate-500'}`}>
            {expanded ? 'Network' : 'Pulse'}
          </span>
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={motionTokens.transition.fast}
            className="text-slate-500"
          >
            ▾
          </motion.span>
        </div>
      </button>

      {/* Expanded agent network */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={motionTokens.interaction.panelOpen}
            className="border-t border-slate-800/50"
          >
            <div className="max-h-[320px] overflow-y-auto p-2 space-y-1">
              {agents.map((agent) => {
                const sm = STATUS_META[agent.status];
                return (
                  <button
                    key={agent.id}
                    onClick={() => onSelectAgent?.(agent.id)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                      agent.status === 'investigating'
                        ? 'border-amber-500/25 bg-amber-950/10'
                        : agent.status === 'processing'
                        ? 'border-violet-500/25 bg-violet-950/10'
                        : 'border-slate-800/60 hover:bg-slate-800/30'
                    }`}
                    aria-label={`Agent ${agent.name}: ${sm.label}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md border border-slate-800 bg-[#05070D] flex items-center justify-center shrink-0">
                        <Bot className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11.5px] font-semibold text-slate-200 truncate">{agent.name}</span>
                          <span className={`text-[8.5px] font-mono font-bold tracking-wider shrink-0 ${sm.text}`}>{sm.label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                          <span className="truncate">{agent.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-1.5 pl-9 flex items-center gap-1.5 text-[10.5px] text-slate-300 font-medium">
                      <Activity className="w-3 h-3 text-violet-400 shrink-0" />
                      <span className="truncate">{agent.activity}</span>
                    </div>
                    {agent.detail && agent.status === 'investigating' && (
                      <div className="mt-1 pl-9 text-[10px] font-mono text-amber-300 font-medium">{agent.detail}</div>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ----------------- Default enterprise agent roster ----------------- */

export const DEFAULT_ENTERPRISE_AGENTS: AtlasAgentStatus[] = [
  { id: 'procurement', name: 'Procurement Agent', role: 'Supplier & spend intelligence', status: 'active', activity: 'Monitoring supplier concentration across 42 vendors' },
  { id: 'logistics', name: 'Logistics Agent', role: 'Route & port optimization', status: 'active', activity: 'Optimizing 18 active import routes via Mombasa' },
  { id: 'risk', name: 'Risk Agent', role: 'Exposure & anomaly detection', status: 'investigating', activity: 'Investigating 3 anomalies in supplier exposure', detail: 'Geographic concentration risk in transformer procurement' },
  { id: 'supply', name: 'Supply Chain Agent', role: 'Inventory & BOM readiness', status: 'active', activity: 'Tracking material readiness for Suswa Lot-4' },
  { id: 'knowledge', name: 'Knowledge Agent', role: 'Enterprise graph maintenance', status: 'processing', activity: 'Updating enterprise knowledge graph with 12 new entities' },
  { id: 'twin', name: 'Digital Twin Agent', role: 'Asset degradation monitoring', status: 'idle', activity: 'Monitoring transformer asset health across 8 substations' },
];

export default AtlasAgentPulse;
