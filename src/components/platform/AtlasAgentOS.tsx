import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Activity, Cpu, Network, Shield, Workflow, ArrowRight, Zap } from 'lucide-react';
import {
  AtlasAgentPulse,
  DEFAULT_ENTERPRISE_AGENTS,
  type AtlasAgentStatus,
} from '../ui/atlas/AtlasAgentPulse';
import { AtlasMissionBrief } from '../ui/atlas/AtlasMissionBrief';
import { AtlasAIInsight } from '../ui/atlas/AtlasAIInsight';
import { motionTokens } from '../../design-system/tokens';
import { colors } from '../../design-system/tokens';

interface AtlasAgentOSProps {
  onAction?: (agentId: string) => void;
  className?: string;
}

export function AtlasAgentOS({ onAction, className = '' }: AtlasAgentOSProps) {
  const [agents] = useState<AtlasAgentStatus[]>(DEFAULT_ENTERPRISE_AGENTS);
  const [activeAgent, setActiveAgent] = useState<string | null>('risk');
  const [pulseOpen, setPulseOpen] = useState(true);

  const selected = agents.find(a => a.id === activeAgent) || agents[0];

  return (
    <div className={`flex flex-col h-full overflow-hidden ${className}`}>
      <AtlasMissionBrief
        moduleLabel="AI Federation"
        mission="Enterprise intelligence anticipates, investigates and acts autonomously."
        description="A federation of specialist agents operating on a shared cognitive fabric — each monitoring a domain and surfacing actionable intelligence with evidence and provenance."
        metrics={[
          { label: 'Active Agents', value: agents.filter(a => a.status === 'active').length, icon: Bot, tone: 'healthy' },
          { label: 'Investigating', value: agents.filter(a => a.status === 'investigating').length, icon: Zap, tone: 'risk' },
          { label: 'Processing', value: agents.filter(a => a.status === 'processing').length, icon: Cpu, tone: 'ai' },
          { label: 'Events Monitored', value: 128, icon: Activity, tone: 'info' },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-3 p-3 sm:p-4 overflow-hidden min-h-0 flex-1">
        {/* Left: Agent Pulse / registry */}
        <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
          <AtlasAgentPulse agents={agents} expanded={pulseOpen} onToggle={() => setPulseOpen(o => !o)} onSelectAgent={setActiveAgent} />

          {/* Federation architecture visual */}
          <div className="atlas-panel p-4 hidden lg:block">
            <div className="flex items-center gap-2 mb-3">
              <Network className="w-4 h-4 text-cyan-400" />
              <span className="text-[10px] font-mono text-slate-400 font-bold tracking-widest uppercase">Federation Fabric</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Shared Cognitive Memory', sub: 'Enterprise context & memory' },
                { label: 'Workflow Orchestration', sub: 'Multi-agent task planning' },
                { label: 'Governance & Guardrails', sub: 'Risk-aware autonomy' },
                { label: 'Event & Telemetry Fabric', sub: 'Real-time operational signals' },
              ].map((f) => (
                <div key={f.label} className="flex items-start gap-2 px-3 py-2 rounded-lg border border-slate-800/60 bg-[#05070D]/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1 shrink-0" />
                  <div className="leading-tight">
                    <div className="text-[11px] text-slate-200 font-medium">{f.label}</div>
                    <div className="text-[9.5px] text-slate-500">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Selected agent detail with AI insight */}
        <div className="flex flex-col gap-3 min-w-0 overflow-y-auto pr-0.5 scrollbar-hide">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={motionTokens.transition.normal}>
              <div className="atlas-panel p-5 mb-3">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl border border-violet-500/25 bg-violet-950/30 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="text-atlas-h3 text-slate-100">{selected.name}</h3>
                    <p className="text-[11px] text-slate-500">{selected.role}</p>
                  </div>
                  <span className={`ml-auto text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                    selected.status === 'investigating'
                      ? 'border-amber-500/25 text-amber-400 bg-amber-950/20'
                      : selected.status === 'processing'
                      ? 'border-violet-500/25 text-violet-400 bg-violet-950/20'
                      : selected.status === 'active'
                      ? 'border-emerald-500/25 text-emerald-400 bg-emerald-950/20'
                      : 'border-slate-700 text-slate-400'
                  }`}>
                    {selected.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-[13px] text-slate-400 leading-relaxed">{selected.activity}</p>
                {selected.detail && (
                  <p className="mt-2 text-[11px] font-mono text-amber-400/80">{selected.detail}</p>
                )}
              </div>

              {selected.id === 'risk' && (
                <AtlasAIInsight
                  kind="warning"
                  title="Supplier concentration risk identified"
                  headline="Transformer supply is concentrated across a narrow geographic base."
                  summary="3 of 4 critical transformer suppliers depend on a shared logistics corridor, creating correlated disruption exposure."
                  confidence={0.87}
                  confidenceBand="HIGH"
                  evidenceCount={12}
                  drivers={[
                    { label: 'Geographic concentration', value: 'HIGH', severity: 'danger' as any },
                    { label: 'Financial instability signal', value: 'MODERATE', severity: 'warning' as any },
                    { label: 'Delivery performance declining', value: '-12%', severity: 'warning' as any },
                  ]}
                  sourceSystem="Risk Intelligence"
                  modelId="atlas/risk-v3"
                  generatedAt={new Date()}
                  onInvestigate={() => onAction?.('risk')}
                  onAction={() => onAction?.('risk')}
                  actionLabel="Open Investigation"
                />
              )}

              {selected.id === 'procurement' && (
                <AtlasAIInsight
                  kind="insight"
                  title="Procurement intelligence updated"
                  headline="$4.2M supplier exposure under AI surveillance."
                  summary="Procurement agent is monitoring 42 vendor relationships against price, delivery and compliance signals."
                  confidence={0.92}
                  evidenceCount={28}
                  sourceSystem="Procurement Intelligence"
                  modelId="atlas/procure-v2"
                  generatedAt={new Date()}
                  onInvestigate={() => onAction?.('procurement')}
                />
              )}

              {selected.id === 'logistics' && (
                <AtlasAIInsight
                  kind="detection"
                  title="Logistics disruption probability elevated"
                  headline="Delivery disruption probability increased to 72%."
                  summary="Weather and port congestion near Mombasa are raising transit risk for 18 active import routes."
                  confidence={0.78}
                  evidenceCount={9}
                  sourceSystem="Logistics Intelligence"
                  modelId="atlas/logistics-v4"
                  generatedAt={new Date()}
                  onInvestigate={() => onAction?.('logistics')}
                />
              )}

              {selected.id === 'supply' && (
                <AtlasAIInsight
                  kind="recommendation"
                  title="Material readiness tracking"
                  headline="Suswa Lot-4 BOM readiness at 92%."
                  summary="Supply agent confirms material availability and flags 2 line items with potential timeline risk."
                  confidence={0.89}
                  evidenceCount={16}
                  sourceSystem="Supply Chain"
                  modelId="atlas/supply-v1"
                  generatedAt={new Date()}
                  onInvestigate={() => onAction?.('supply')}
                />
              )}
            </motion.div>
          ) : (
            <div className="atlas-panel p-6 text-center text-slate-500 text-sm">Select an agent to view intelligence.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AtlasAgentOS;
