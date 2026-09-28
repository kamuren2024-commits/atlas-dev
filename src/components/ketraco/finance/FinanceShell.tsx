import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BarChart3, PieChart, GitBranch, SplitSquareHorizontal, Link,
  CreditCard, TrendingUp, Network, Database, GitCommit, RefreshCw,
  Wallet, ShieldCheck, Activity,
} from 'lucide-react';
import { financeTokens } from './tokens';
import { useFinanceDataContext } from './components/FinanceDataContext';
import { DataStateBadge } from './components/primitives';
import type { FinanceView } from './types';

import FinancialOverview from './views/FinancialOverview';
import BudgetIntelligence from './views/BudgetIntelligence';
import ProjectFinance from './views/ProjectFinance';
import CapexOpex from './views/CapexOpex';
import Commitments from './views/Commitments';
import Payments from './views/Payments';
import FinancialPerformance from './views/FinancialPerformance';
import FinancialGraph from './views/FinancialGraph';
import DataFabric from './views/DataFabric';
import Lineage from './views/Lineage';

const ICONS: Record<FinanceView, React.ComponentType<{ className?: string; size?: number }>> = {
  overview: BarChart3,
  budgets: PieChart,
  projects: GitBranch,
  'capex-opex': SplitSquareHorizontal,
  commitments: Link,
  payments: CreditCard,
  performance: TrendingUp,
  graph: Network,
  'data-fabric': Database,
  lineage: GitCommit,
};

const NAV: { id: FinanceView; label: string; group: string }[] = [
  { id: 'overview', label: 'Financial Overview', group: 'EXECUTIVE' },
  { id: 'performance', label: 'Financial Performance', group: 'EXECUTIVE' },
  { id: 'budgets', label: 'Budget Intelligence', group: 'PLAN & COMMIT' },
  { id: 'commitments', label: 'Commitment Monitor', group: 'PLAN & COMMIT' },
  { id: 'projects', label: 'Project Finance', group: 'PLAN & COMMIT' },
  { id: 'capex-opex', label: 'CAPEX / OPEX', group: 'SPEND' },
  { id: 'payments', label: 'Payables & Payments', group: 'SPEND' },
  { id: 'graph', label: 'Financial Graph', group: 'INTELLIGENCE' },
  { id: 'data-fabric', label: 'Data Fabric', group: 'PLATFORM' },
  { id: 'lineage', label: 'Lineage Inspector', group: 'PLATFORM' },
];

export default function FinanceShell() {
  const [view, setView] = useState<FinanceView>('overview');
  const data = useFinanceDataContext();

  return (
    <div className="flex h-full w-full overflow-hidden" style={{ backgroundColor: financeTokens.colors.bg.deep }}>
      {/* Finance persistent navigation rail */}
      <aside className="w-[235px] shrink-0 h-full flex flex-col border-r border-white/[0.06] bg-[#080D18]" aria-label="Finance navigation">
        {/* Brand header */}
        <div className="px-4 py-3 border-b border-white/[0.06] space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: financeTokens.colors.primarySoft, color: financeTokens.colors.primary, boxShadow: `0 0 16px ${financeTokens.colors.primaryGlow}` }}>
              <Wallet className="w-4 h-4" />
            </span>
            <div>
              <div className="text-[11px] font-display font-bold tracking-wide text-[#F8FAFC]">FINANCE</div>
              <div className="text-[8px] font-mono text-[#64748B] uppercase tracking-widest">Intelligence System</div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <DataStateBadge state={data.state} />
            <button
              onClick={data.refresh}
              className="p-1 rounded text-slate-500 hover:text-cyan-400 hover:bg-white/5 cursor-pointer"
              aria-label="Refresh finance data"
              title="Refresh finance data"
            >
              <RefreshCw className={`w-3 h-3 ${data.loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation groups */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
          {(['EXECUTIVE', 'PLAN & COMMIT', 'SPEND', 'INTELLIGENCE', 'PLATFORM'] as const).map((group) => {
            const items = NAV.filter((n) => n.group === group);
            if (!items.length) return null;
            return (
              <div key={group}>
                <div className="px-2 pb-1 text-[8px] font-mono text-[#475569] uppercase tracking-widest">{group}</div>
                <div className="space-y-0.5">
                  {items.map((item) => {
                    const Icon = ICONS[item.id];
                    const active = view === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setView(item.id)}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left text-[11.5px] font-medium transition-all cursor-pointer border-l-2 ${
                          active
                            ? 'text-cyan-300 border-cyan-400 bg-[rgba(0,217,255,0.08)]'
                            : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/[0.03]'
                        }`}
                        aria-current={active ? 'page' : undefined}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" size={14} style={active ? { color: financeTokens.colors.primary } : undefined} />
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer status */}
        <div className="px-4 py-3 border-t border-white/[0.06] space-y-1.5">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#64748B]">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Phase 01 Data Fabric
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#64748B]">
            <Activity className="w-3 h-3 text-cyan-400" />
            KETRACO ENTERPRISE
          </div>
        </div>
      </aside>

      {/* Main view */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: 'easeInOut' }}
            className="flex-1 overflow-auto"
          >
            {view === 'overview' && <FinancialOverview onNavigate={setView} />}
            {view === 'budgets' && <BudgetIntelligence />}
            {view === 'projects' && <ProjectFinance />}
            {view === 'capex-opex' && <CapexOpex />}
            {view === 'commitments' && <Commitments />}
            {view === 'payments' && <Payments />}
            {view === 'performance' && <FinancialPerformance />}
            {view === 'graph' && <FinancialGraph />}
            {view === 'data-fabric' && <DataFabric />}
            {view === 'lineage' && <Lineage />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
