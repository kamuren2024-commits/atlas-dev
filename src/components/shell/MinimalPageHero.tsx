import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { motionTokens } from '../../design-system/tokens';

interface HeroContext {
  title: string;
  context: string;
}

// Small contextual configuration layer — derives FROM the active route.
// Modules already render their own internal page titles, so this shell hero
// acts strictly as a thin orientation/context band (does not duplicate titles).
const HERO_CONTEXT: Record<string, HeroContext> = {
  overview: { title: 'Enterprise Operations', context: 'Grid, projects, procurement and risk' },
  tender: { title: 'Tender Intelligence', context: 'Procurement Operations' },
  project: { title: 'Project Supply Nexus', context: 'Material readiness & BOM paths' },
  inventory: { title: 'Inventory Intelligence', context: 'Depot stocks & forecasting' },
  supplier: { title: 'Supplier Network', context: 'Reliability & scoring' },
  logistics: { title: 'Logistics Intelligence', context: 'Operational Logistics' },
  risk: { title: 'Risk & Compliance', context: 'Fraud auditing & conflict triggers' },
  decision: { title: 'Decision & Audit Hub', context: 'PPADA scrutiny & trust ledger' },
  acin: { title: 'Contract Intelligence', context: 'Autonomous obligation twins' },
  'meeting-intelligence': { title: 'Meeting Intelligence', context: 'Conversations, Decisions, Action & Memory' },
  'drone-intelligence': { title: 'Drone Intelligence', context: 'Inspection & asset corridors' },
  'procurement-graph': { title: 'Knowledge Graph', context: 'Relationships & digital twins' },
  intelligence: { title: 'Decision Intelligence', context: 'Predictive command & cases' },
  twin: { title: 'Digital Twin', context: 'Disruption stressors & sandbox' },
  sourcing: { title: 'Strategic Sourcing', context: 'Spend optimization' },
  executive: { title: 'Executive Board', context: 'Board briefings & KPIs' },
  agents: { title: 'Agent Platform', context: 'Agent SDK runtime' },
  'ai-ops': { title: 'AI Operations', context: 'Provider resilience & cost' },
  'ai-runtime': { title: 'AI Runtime', context: 'Enterprise AI governance' },
  admin: { title: 'Administration OS', context: 'RBAC & telemetry' },
  finance: { title: 'Finance Intelligence', context: 'Budget, commitment, payment & CAPEX/OPEX' },
};

interface MinimalPageHeroProps {
  activeModule: string;
}

export default function MinimalPageHero({ activeModule }: MinimalPageHeroProps) {
  const { currentTenant } = useTenant();
  const ctx = HERO_CONTEXT[activeModule] || { title: 'Workspace', context: 'Enterprise context' };

  return (
    <motion.div
      key={activeModule}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={motionTokens.transition.fast}
      className="shrink-0 px-5 md:px-6 pt-3 pb-2 flex items-end justify-between gap-4 border-b border-white/5 bg-[linear-gradient(180deg,rgba(0,217,255,0.035),transparent)]"
      aria-label={`Context: ${ctx.title}`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <span>{currentTenant.name}</span>
          <ChevronRight className="w-3 h-3 text-cyan-500/70" />
          <span className="text-cyan-400/90 font-bold">{ctx.title.toUpperCase()}</span>
        </div>
        <h2 className="text-base md:text-lg font-display font-semibold tracking-tight text-slate-100 mt-0.5">
          {ctx.title}
        </h2>
        <p className="text-[11px] text-slate-500 leading-snug mt-0.5 truncate max-w-md">{ctx.context}</p>
      </div>
      <div className="hidden lg:flex items-center gap-3 text-[9px] font-mono text-slate-500 uppercase tracking-wider shrink-0 pb-0.5">
        <span className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400" /> {currentTenant.name} SANDBOX
        </span>
        <span className="w-px h-3 bg-slate-800" />
        <span>ATLAS OS</span>
      </div>
    </motion.div>
  );
}
