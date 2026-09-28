import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  PieChart, 
  ArrowUpRight, 
  AlertTriangle, 
  ChevronRight, 
  ChevronDown,
  FileSpreadsheet,
  Coins,
  ShieldAlert,
  Info,
  Layers,
  ArrowRight,
  TrendingDown
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { COST_CBS_DATA, MONTHLY_CASHFLOW_DATA } from '../../adapters/fixtures';
import { getMasterProjectById } from '../../adapters/projectApi';
import { ProjectViewMode } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';

interface CostCBSViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

type CostTab = 'CBS_BREAKDOWN' | 'CASHFLOW_TREND' | 'EXCEPTIONS';

export const CostCBSView: React.FC<CostCBSViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const [activeTab, setActiveTab] = useState<CostTab>('CBS_BREAKDOWN');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({ '1': true, '2': true, '3': true });
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenCostItem = (node: any) => {
    const title = node.category || node.name || 'Cost Element';
    const budget = node.budget || node.approvedBudget || 'KES 0M';
    const actual = node.actual || node.actualIncurred || 'KES 0M';
    const committed = node.committed || 'KES 0M';
    const eac = node.eac || 'KES 0M';
    const variance = node.variance || '0M';
    const status = node.status || 'ON_TRACK';

    setSelectedEntity({
      type: 'cost-item',
      id: node.id,
      title: title,
      code: node.code,
      status: status,
      subtitle: `Project: ${currentProject.name} • Approved Budget: ${budget} • EAC: ${eac}`,
      metrics: [
        { label: 'Budget (BAC)', value: budget, color: 'text-white' },
        { label: 'Committed', value: committed, color: 'text-cyan-400' },
        { label: 'Actual Spent (AC)', value: actual, color: 'text-emerald-400' }
      ],
      details: [
        { label: 'Cost Element Code', value: node.code },
        { label: 'CBS Category', value: title },
        { label: 'Forecast at Completion (EAC)', value: eac },
        { label: 'Variance at Completion (VAC)', value: variance },
        { label: 'Current Status', value: status },
        { label: 'ERP Source System', value: 'DEMO FIXTURE (SAP S/4HANA Phase 2 Bridge)' }
      ],
      risks: [
        `Foreign exchange exposure on imported offshore substation components.`,
        `Variation order claims submitted by EPC for unexpected Likoni soil stabilization.`
      ],
      recommendations: [
        'Audit certified IPC-08 against resident engineer physical delivery logs.',
        'Review contingency drawdown balance with finance steering committee.'
      ],
      relatedView: 'cost'
    });
    setDrawerOpen(true);
  };

  return (
    <UIStateContainer moduleName="Cost CBS & Cashflow">
      <div className="space-y-4">
        {/* Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="cost"
          onNavigateView={onNavigateView}
        />

        {/* Notice Banner: Clear distinction of Fixture / Demo Data */}
        <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-amber-300">
            <Info className="w-4 h-4 shrink-0" />
            <span>
              <strong>FIXTURE / DEMO ENVIRONMENT:</strong> Financial commitments and disbursements shown are engineering test fixtures. Direct authoritative general ledger synchronization will activate upon SAP S/4HANA enterprise connector deployment.
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 uppercase px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            SIMULATED CBS
          </span>
        </div>

        {/* Cost Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-3 rounded-lg border border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">PROJECT CONTROLS //</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                COST BREAKDOWN STRUCTURE (CBS)
              </span>
            </div>
            <h1 className="text-base font-semibold text-slate-100 mt-0.5">
              Cost Breakdown Structure (CBS) & S-Curve Cashflow
            </h1>
            <p className="text-xs text-slate-400">
              Contractual commitments, actual certified invoices, EAC forecasts, and variance at completion
            </p>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="px-3 py-1.5 bg-slate-900 rounded border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Current EAC</span>
              <span className="text-amber-400 font-bold">{currentProject.eac}</span>
            </div>
            <div className="px-3 py-1.5 bg-cyan-950/40 rounded border border-cyan-500/30 text-cyan-300">
              Variance: +KES 140M (2.3%)
            </div>
          </div>
        </div>

        {/* 08 — Top Financial Summary Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Approved Budget (BAC)</span>
            <span className="text-white font-bold text-base">{currentProject.budget}</span>
            <span className="text-[10px] text-slate-400 block">Board Approved Baseline</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Total Commitments</span>
            <span className="text-cyan-300 font-bold text-base">KES 5,420,000,000</span>
            <span className="text-[10px] text-cyan-400 block">88.8% Contracted</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Actual Expenditure (AC)</span>
            <span className="text-white font-bold text-base">KES 3,980,000,000</span>
            <span className="text-[10px] text-emerald-400 block">65.2% Disbursed</span>
          </div>

          <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase">Contingency Reserve</span>
            <span className="text-amber-400 font-bold text-base">KES 350,000,000</span>
            <span className="text-[10px] text-amber-300 block">KES 150M Drawdown Balance</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2.5 rounded-lg border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('CBS_BREAKDOWN')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'CBS_BREAKDOWN' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cost Breakdown (CBS Hierarchy)
            </button>
            <button
              onClick={() => setActiveTab('CASHFLOW_TREND')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'CASHFLOW_TREND' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cashflow & S-Curve Trend
            </button>
            <button
              onClick={() => setActiveTab('EXCEPTIONS')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'EXCEPTIONS' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cost Exceptions & Overrun Risks
            </button>
          </div>

          <span className="text-[10px] text-slate-400">
            Cost Model: FIDIC Certified IPC Valuation
          </span>
        </div>

        {/* TAB 1: CBS BREAKDOWN TREE TABLE */}
        {activeTab === 'CBS_BREAKDOWN' && (
          <div className="bg-[#080d17] rounded-lg border border-slate-800 overflow-hidden font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <th className="p-3">CBS Code & Cost Element</th>
                    <th className="p-3">Approved Budget (BAC)</th>
                    <th className="p-3">Commitments</th>
                    <th className="p-3">Actual Incurred (AC)</th>
                    <th className="p-3">Forecast EAC</th>
                    <th className="p-3">Variance at Completion</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {COST_CBS_DATA.map((node: any) => {
                    const hasChildren = node.children && node.children.length > 0;
                    const isExpanded = !!expandedNodes[node.id];
                    const category = node.category || node.name;
                    const budget = node.budget || node.approvedBudget;
                    const committed = node.committed;
                    const actual = node.actual || node.actualIncurred;
                    const status = node.status || 'ON_TRACK';

                    return (
                      <React.Fragment key={node.id}>
                        <tr
                          onClick={() => handleOpenCostItem(node)}
                          className="hover:bg-slate-900/50 cursor-pointer transition-colors bg-slate-950/40"
                        >
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              {hasChildren && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleNode(node.id);
                                  }}
                                  className="text-slate-400 hover:text-white"
                                >
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                              )}
                              <span className="font-bold text-cyan-400">{node.code}</span>
                              <span className="font-semibold text-slate-100">{category}</span>
                            </div>
                          </td>
                          <td className="p-3 text-white font-medium">{budget}</td>
                          <td className="p-3 text-cyan-300">{committed}</td>
                          <td className="p-3 text-slate-300">{actual}</td>
                          <td className="p-3 text-amber-300">{node.eac}</td>
                          <td className="p-3">
                            <span className={(node.variance || '').includes('+') ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                              {node.variance}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                              status === 'UNDER_BUDGET' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                              status === 'ON_TRACK' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                              'text-amber-400 bg-amber-500/10 border-amber-500/30'
                            }`}>
                              {status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCostItem(node);
                              }}
                              className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-[10px] inline-flex items-center gap-1"
                            >
                              <span>Inspect</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>

                        {/* Child Sub-elements if expanded */}
                        {hasChildren && isExpanded && node.children!.map((child: any) => {
                          const childCat = child.category || child.name;
                          const childBud = child.budget || child.approvedBudget;
                          const childAct = child.actual || child.actualIncurred;
                          const childStat = child.status || 'ON_TRACK';

                          return (
                            <tr
                              key={child.id}
                              onClick={() => handleOpenCostItem(child)}
                              className="hover:bg-slate-900/40 cursor-pointer transition-colors bg-[#080d17]"
                            >
                              <td className="p-3 pl-9">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-cyan-400/80 text-[11px]">{child.code}</span>
                                  <span className="text-slate-300 text-[11px]">{childCat}</span>
                                </div>
                              </td>
                              <td className="p-3 text-slate-300 text-[11px]">{childBud}</td>
                              <td className="p-3 text-cyan-300/80 text-[11px]">{child.committed}</td>
                              <td className="p-3 text-slate-400 text-[11px]">{childAct}</td>
                              <td className="p-3 text-amber-300/80 text-[11px]">{child.eac}</td>
                              <td className="p-3 text-[11px]">
                                <span className={(child.variance || '').includes('+') ? 'text-amber-400' : 'text-emerald-400'}>
                                  {child.variance}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className={`px-1.5 py-0.2 rounded text-[8px] uppercase border ${
                                  childStat === 'UNDER_BUDGET' ? 'text-emerald-400 border-emerald-500/30' :
                                  childStat === 'ON_TRACK' ? 'text-cyan-400 border-cyan-500/30' :
                                  'text-amber-400 border-amber-500/30'
                                }`}>
                                  {childStat.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3 text-right">
                                <span className="text-slate-500 text-[10px]">Detail</span>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: CASHFLOW & S-CURVE TREND */}
        {activeTab === 'CASHFLOW_TREND' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Monthly S-Curve Drawdown vs Certified Valuation
              </h3>
              <span className="text-[10px] text-cyan-400">Cumulative KES Millions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
              {MONTHLY_CASHFLOW_DATA.map((flow: any, i) => (
                <div key={i} className="p-3 rounded bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">{flow.month}</span>
                    <span className="text-[10px] text-slate-400">{flow.year || '2026'}</span>
                  </div>
                  <div className="text-[10px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Planned:</span>
                      <span className="text-slate-300">{flow.planned}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Actual:</span>
                      <span className="text-white font-bold">{flow.actual}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Variance:</span>
                      <span className="text-cyan-300">{flow.variance}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: COST EXCEPTIONS REGISTER */}
        {activeTab === 'EXCEPTIONS' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="bg-amber-950/20 p-3.5 rounded-lg border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-amber-300 text-sm">Financial Variance & Commitment Exposure</h4>
                <p className="text-slate-300 text-[11px] mt-0.5">
                  The current Forecast at Completion (EAC) stands at KES 6.24B against an approved budget of KES 6.10B (+KES 140M, 2.3% variance). Contingency reserve absorption remains within the 10% board tolerance threshold.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">CBS-02.1: 400kV Autotransformer T-204</span>
                  <span className="text-amber-400 font-bold">+KES 80,000,000 EAC</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Customs demurrage charges and police escort low-loader road haulage costs incurred due to port berth rescheduling.
                </p>
                <div className="text-[10px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Offset: Absorbable under Lot 1 unallocated contingency provision.
                </div>
              </div>

              <div className="p-3.5 bg-[#080d17] rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-100">CBS-04: Mariakani Land & Wayleave Escrow</span>
                  <span className="text-amber-400 font-bold">+KES 60,000,000 VAC</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  National Land Commission supplemental compensation valuation update for urban-adjacent buffer strip.
                </p>
                <div className="text-[10px] text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800">
                  Status: Formal requisition submitted to National Treasury for exchequer release.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shared Entity Drawer */}
      <NexusEntityDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entity={selectedEntity}
        onNavigateView={onNavigateView}
        onSelectProject={onSelectProject}
      />
    </UIStateContainer>
  );
};
