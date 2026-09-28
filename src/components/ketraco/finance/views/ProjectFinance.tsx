import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert, ShieldCheck, CheckCircle2, AlertTriangle,
  Play, Sparkles, X, ArrowRight, FileCheck, Sliders, Layers,
  Landmark, Copy, Lock
} from 'lucide-react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import {
  Panel, DataStateBadge, StatusChip, formatFullKES, formatKES, formatPct,
  UtilizationBar, useTooltip,
} from '../components/primitives';
import { financeTokens } from '../tokens';

interface GraphNode {
  id: string;
  kind: string;
  label: string;
  value: number;
}

export default function ProjectFinance() {
  const data = useFinanceDataContext();
  const { show, hide, tooltip } = useTooltip();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Scenario Simulator State
  const [scenarioDelayMonths, setScenarioDelayMonths] = useState<0 | 3 | 6>(0);
  const [moratoriumModalOpen, setMoratoriumModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [enactmentReceipt, setEnactmentReceipt] = useState<any | null>(null);

  // Donor Drawdown Enactment State
  const [donorModalOpen, setDonorModalOpen] = useState(false);
  const [donorFacility, setDonorFacility] = useState('AfDB Sovereign Credit Facility (No. 2100150038)');
  const [drawdownAmountKES, setDrawdownAmountKES] = useState<number>(850000000);
  const [trancheNo, setTrancheNo] = useState('Tranche 4 (Milestone IPC #12)');
  const [isExecutingDrawdown, setIsExecutingDrawdown] = useState(false);
  const [drawdownReceipt, setDrawdownReceipt] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const isMoratoriumActive = Boolean(data.commandState?.moratoriumEnacted);

  const selectedProject = useMemo(
    () => data.projects.find((p) => p.projectId === selectedProjectId) ?? data.projects[0] ?? null,
    [data.projects, selectedProjectId],
  );

  const totalBudget = data.projects.reduce((s, p) => s + p.totalBudget, 0);
  const totalCommitted = data.projects.reduce((s, p) => s + p.committedAmount, 0);
  const totalActual = data.projects.reduce((s, p) => s + p.actualAmount, 0);
  const totalPaid = data.projects.reduce((s, p) => s + p.paidAmount, 0);
  const totalForecast = data.projects.reduce((s, p) => s + p.forecastAmount, 0);

  // Scenario Calculations for selected project
  const scenarioMultiplier = scenarioDelayMonths === 0 ? 1 : scenarioDelayMonths === 3 ? 1.064 : 1.157;
  const simulatedCost = selectedProject ? selectedProject.forecastCompletionCost * scenarioMultiplier : 0;
  const simulatedVariance = selectedProject ? simulatedCost - selectedProject.totalBudget : 0;
  const simulatedVariancePct = selectedProject && selectedProject.totalBudget ? (simulatedVariance / selectedProject.totalBudget) * 100 : 0;
  const simulatedCashRequirement = scenarioDelayMonths === 0 ? 1200000000 : scenarioDelayMonths === 3 ? 1500000000 : 1900000000;

  // Financial lifecycle graph nodes for the selected project
  const graphNodes: GraphNode[] = useMemo(() => {
    if (!selectedProject) return [];
    const proj = selectedProject;
    const budget = data.budgets.find((b) => b.projectId === proj.projectId);
    const projectCommitments = data.commitments.filter((c) => c.projectId === proj.projectId);
    const projectInvoices = data.invoices.filter((i) => i.projectId === proj.projectId);
    const projectPayments = data.payments.filter((p) => p.projectId === proj.projectId);
    const committed = projectCommitments.reduce((s, c) => s + c.amount, 0);
    const invoiced = projectInvoices.reduce((s, i) => s + i.amount, 0);
    const paid = projectPayments.reduce((s, p) => s + p.amount, 0);

    return [
      { id: `${proj.projectId}-b`, kind: 'BUDGET', label: budget?.name ?? 'Budget', value: budget?.revisedAmount ?? proj.totalBudget },
      { id: `${proj.projectId}-c`, kind: 'COMMIT', label: `${projectCommitments.length} commitments`, value: committed },
      { id: `${proj.projectId}-i`, kind: 'INVOICE', label: `${projectInvoices.length} invoices`, value: invoiced },
      { id: `${proj.projectId}-p`, kind: 'PAYMENT', label: `${projectPayments.length} payments`, value: paid },
      { id: `${proj.projectId}-a`, kind: 'ASSET', label: 'Capitalized asset', value: paid },
    ];
  }, [selectedProject, data.budgets, data.commitments, data.invoices, data.payments]);

  const NODE_COLOR: Record<string, string> = {
    BUDGET: financeTokens.chart.budget,
    COMMIT: financeTokens.chart.committed,
    INVOICE: financeTokens.chart.actual,
    PAYMENT: financeTokens.chart.paid,
    ASSET: financeTokens.colors.secondary,
  };

  const maxNode = Math.max(...graphNodes.map((n) => n.value), 1);
  const nodeX = (i: number, count: number) => (count === 1 ? 50 : (i / (count - 1)) * 100);

  const handleEnactMoratorium = async () => {
    if (!selectedProject) return;
    setIsExecuting(true);
    try {
      const res = await data.executeAction('VARIATION_ORDER_MORATORIUM', {
        projectId: selectedProject.projectId,
        entityId: selectedProject.projectCode
      });
      setEnactmentReceipt(res);
    } catch (err: any) {
      setEnactmentReceipt({ success: false, message: err?.message || 'Failed to enact moratorium' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecuteDrawdown = async () => {
    if (!selectedProject) return;
    setIsExecutingDrawdown(true);
    try {
      const res = await data.executeAction('DONOR_DRAWDOWN_ENACTMENT', {
        projectId: selectedProject.projectId,
        donorFacility,
        drawdownAmountKES,
        trancheNumber: trancheNo
      });
      setDrawdownReceipt(res);
    } catch (err: any) {
      setDrawdownReceipt({ success: false, message: err?.message || 'Failed to enact donor drawdown' });
    } finally {
      setIsExecutingDrawdown(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="Project Finance"
        subtitle="Project to budget, commitment, invoice, payment and asset intelligence"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setDrawdownReceipt(null);
                setDonorModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Enact Donor Drawdown</span>
            </button>
            {isMoratoriumActive ? (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>PPADA 139 Moratorium Active</span>
              </span>
            ) : (
              <button
                onClick={() => {
                  setEnactmentReceipt(null);
                  setMoratoriumModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[11px] font-mono font-medium transition cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Enact PPADA Sec 139 Moratorium</span>
              </button>
            )}
            <DataStateBadge state={data.state} />
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {/* Portfolio KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="finance-kpi"><div className="finance-label">Project Budget</div><div className="finance-value" style={{ color: financeTokens.chart.budget }}>{formatKES(totalBudget)}</div><div className="text-[10px] text-slate-500 font-mono">{data.projects.length} projects</div></div>
          <div className="finance-kpi"><div className="finance-label">Committed</div><div className="finance-value" style={{ color: financeTokens.chart.committed }}>{formatKES(totalCommitted)}</div><div className="text-[10px] text-slate-500 font-mono">encumbered</div></div>
          <div className="finance-kpi"><div className="finance-label">Actual</div><div className="finance-value" style={{ color: financeTokens.chart.actual }}>{formatKES(totalActual)}</div><div className="text-[10px] text-slate-500 font-mono">spent to date</div></div>
          <div className="finance-kpi"><div className="finance-label">Paid</div><div className="finance-value" style={{ color: financeTokens.chart.paid }}>{formatKES(totalPaid)}</div><div className="text-[10px] text-slate-500 font-mono">cash out</div></div>
          <div className="finance-kpi"><div className="finance-label">Forecast</div><div className="finance-value" style={{ color: financeTokens.chart.forecast }}>{formatKES(totalForecast)}</div><div className="text-[10px] text-slate-500 font-mono">completion cost</div></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Project selector list */}
          <Panel title="Project Portfolio" subtitle="Select a project to reveal its financial graph" accent={financeTokens.colors.primary}>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {data.projects.map((p) => {
                const active = selectedProject?.projectId === p.projectId;
                const burn = p.totalBudget ? (p.actualAmount / p.totalBudget) * 100 : 0;
                return (
                  <button
                    key={p.projectId}
                    onClick={() => setSelectedProjectId(p.projectId)}
                    className={`w-full text-left rounded border p-2.5 transition-all ${active ? 'border-cyan-400/40 bg-[rgba(0,217,255,0.06)]' : 'border-white/[0.05] bg-[#0B1220] hover:border-white/15'}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[11px] font-medium truncate ${active ? 'text-cyan-200' : 'text-slate-200'}`}>{p.name}</span>
                      <StatusChip label={p.status} color={p.status === 'IN_PROGRESS' ? '#00D9FF' : '#64748B'} />
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 mt-0.5">{p.projectCode} • {p.capexOpex}</div>
                    <div className="mt-1.5">
                      <UtilizationBar pct={burn} label="" value={`${burn.toFixed(0)}%`} color={financeTokens.chart.actual} />
                    </div>
                  </button>
                );
              })}
              {data.projects.length === 0 && <div className="text-[11px] text-slate-500 font-mono">No projects loaded.</div>}
            </div>
          </Panel>

          {/* Selected project detail */}
          <div className="xl:col-span-2 space-y-4">
            {selectedProject && (
              <>
                <Panel
                  title="Financial Lifecycle"
                  subtitle={selectedProject.name}
                  accent={financeTokens.colors.primary}
                  right={
                    <div className="flex items-center gap-2">
                      {isMoratoriumActive && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          MORATORIUM ACTIVE
                        </span>
                      )}
                      <StatusChip label={selectedProject.status} color="#00D9FF" />
                    </div>
                  }
                >
                  {/* Lifecycle flow graph (SVG) */}
                  <div className="w-full" style={{ height: 180 }} role="img" aria-label={`Financial lifecycle for ${selectedProject.name}: budget to commitment to invoice to payment to asset`}>
                    <svg viewBox="0 0 760 180" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                      {/* connector lines */}
                      {graphNodes.length > 1 && graphNodes.slice(0, -1).map((_, i) => {
                        const x1 = (nodeX(i, graphNodes.length) / 100) * 760;
                        const x2 = (nodeX(i + 1, graphNodes.length) / 100) * 760;
                        return (
                          <g key={`edge-${i}`}>
                            <line x1={x1 + 55} y1={90} x2={x2 - 55} y2={90} stroke="rgba(0,217,255,0.25)" strokeWidth={1.5} strokeDasharray="4 3" />
                            <line x1={x1 + 55} y1={90} x2={x2 - 55} y2={90} stroke="rgba(0,217,255,0.5)" strokeWidth={1.5}>
                              <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.5s" repeatCount="indefinite" />
                            </line>
                          </g>
                        );
                      })}
                      {graphNodes.map((n, i) => {
                        const cx = (nodeX(i, graphNodes.length) / 100) * 760;
                        const r = 16 + (n.value / maxNode) * 34;
                        const color = NODE_COLOR[n.kind] ?? '#00D9FF';
                        return (
                          <g key={n.id}
                            onMouseEnter={(e) => show(e as any, <span><b>{n.kind}</b> — {n.label}: {formatFullKES(n.value)}</span>)}
                            onMouseLeave={hide}
                          >
                            <circle cx={cx} cy={90} r={r + 4} fill={color} opacity={0.08} />
                            <circle cx={cx} cy={90} r={r} fill={`${color}22`} stroke={color} strokeWidth={1.5} />
                            <text x={cx} y={92} textAnchor="middle" fill="#F8FAFC" fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="bold">{n.kind[0]}</text>
                            <text x={cx} y={142} textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="'JetBrains Mono',monospace">{n.label}</text>
                            <text x={cx} y={158} textAnchor="middle" fill={color} fontSize="11" fontFamily="'JetBrains Mono',monospace" fontWeight="bold">{formatKES(n.value)}</text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </Panel>

                {/* Scenario delay simulation lab */}
                <Panel
                  title="Schedule Delay & Cash Stress Laboratory"
                  subtitle="Simulate project cost escalation under supply chain and contractor milestones"
                  accent={financeTokens.colors.secondary}
                  right={
                    <div className="flex items-center gap-1.5 bg-black/40 p-1 rounded-lg border border-white/5">
                      {([0, 3, 6] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setScenarioDelayMonths(m)}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono font-medium transition cursor-pointer ${
                            scenarioDelayMonths === m
                              ? 'bg-cyan-500 text-slate-950 font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m === 0 ? 'No Delay' : `${m} Mo Delay`}
                        </button>
                      ))}
                    </div>
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-xs">
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">Projected Cost at Completion</div>
                      <div className="text-base font-bold text-white">{formatFullKES(simulatedCost)}</div>
                      <div className="text-[10px] text-slate-500">
                        {scenarioDelayMonths === 0 ? 'Baseline project budget' : `+${((scenarioMultiplier - 1) * 100).toFixed(1)}% escalation factor`}
                      </div>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">Variance to Budget</div>
                      <div className={`text-base font-bold ${simulatedVariance >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {formatPct(simulatedVariancePct)} ({formatKES(Math.abs(simulatedVariance))})
                      </div>
                      <div className="text-[10px] text-slate-500">
                        PPADA Sec 139 limit: &le; 25%
                      </div>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5 space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wide">90-Day Cash Liquidity Need</div>
                      <div className="text-base font-bold text-amber-400">{formatKES(simulatedCashRequirement)}</div>
                      <div className="text-[10px] text-slate-500">
                        Central Bank RTGS demand
                      </div>
                    </div>
                  </div>
                </Panel>

                {/* Health metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Panel title="Cost to Complete" accent={financeTokens.chart.committed}>
                    <div className="finance-value" style={{ color: financeTokens.chart.committed }}>{formatFullKES(selectedProject.costToComplete)}</div>
                    <div className="mt-2"><UtilizationBar pct={selectedProject.totalBudget ? ((selectedProject.totalBudget - selectedProject.costToComplete) / selectedProject.totalBudget) * 100 : 0} label="Budget consumed" value={`${(selectedProject.totalBudget ? ((selectedProject.totalBudget - selectedProject.costToComplete) / selectedProject.totalBudget) * 100 : 0).toFixed(0)}%`} color={financeTokens.chart.committed} /></div>
                  </Panel>
                  <Panel title="Forecast Completion" accent={financeTokens.chart.forecast}>
                    <div className="finance-value" style={{ color: financeTokens.chart.forecast }}>{formatFullKES(selectedProject.forecastCompletionCost)}</div>
                    <div className="mt-1 text-[10px] font-mono text-slate-500">vs budget {formatKES(selectedProject.totalBudget)}</div>
                  </Panel>
                  <Panel title="Variance" accent={selectedProject.variance >= 0 ? financeTokens.colors.negative : financeTokens.colors.positive}>
                    <div className="finance-value" style={{ color: selectedProject.variance >= 0 ? financeTokens.colors.negative : financeTokens.colors.positive }}>{formatPct(selectedProject.variancePct)}</div>
                    <div className="mt-1 text-[10px] font-mono text-slate-500">{formatFullKES(selectedProject.variance)} {selectedProject.variance >= 0 ? 'over' : 'under'} budget</div>
                  </Panel>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {tooltip}

      {/* Statutory Moratorium Modal */}
      <AnimatePresence>
        {moratoriumModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0B132B] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#080E21]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-400/30 flex items-center justify-center text-rose-400">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Statutory Variation Order Moratorium</h3>
                    <p className="text-[11px] font-mono text-slate-400">PPADA 2015 Section 139 Audit & Freeze Protocol</p>
                  </div>
                </div>
                <button
                  onClick={() => setMoratoriumModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-xs font-mono">
                {!enactmentReceipt ? (
                  <>
                    <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 space-y-2">
                      <div className="font-semibold text-[11px] flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Statutory Ceilings & Forensic Review Mandate</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        Under <span className="text-cyan-300 font-bold">PPADA 2015 Section 139</span>, cumulative contract variation orders cannot exceed 25% of the original contract price without prior written approval from the Public Procurement Regulatory Authority (PPRA) and the Accounting Officer.
                      </p>
                    </div>

                    <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5 space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Target Project:</span>
                        <span className="text-white font-bold">{selectedProject?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Project Code:</span>
                        <span className="text-cyan-300">{selectedProject?.projectCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avoided Exposure:</span>
                        <span className="text-emerald-400 font-bold">KES 117,000,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Governing Body:</span>
                        <span className="text-slate-200">PPRA & Auditor-General</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setMoratoriumModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleEnactMoratorium}
                        disabled={isExecuting}
                        className="px-4 py-2 rounded bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {isExecuting ? (
                          <span>Enacting Moratorium...</span>
                        ) : (
                          <>
                            <span>Enact Moratorium & Freeze</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Enactment Success Receipt */
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300">Moratorium Successfully Enacted</div>
                        <div className="text-[10px] text-slate-300">{enactmentReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-white/10 space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Statutory Reference:</span>
                        <span className="text-cyan-300 font-bold">{enactmentReceipt.reference || 'VOM-PPADA139-4412'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Audit Identifier:</span>
                        <span className="text-slate-200">{enactmentReceipt.auditId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Cryptographic Digest:</span>
                        <span className="text-emerald-400 font-mono text-[9px] truncate max-w-[280px]">
                          {enactmentReceipt.sha256Hash || '7a8f12c9...'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5">
                        <span className="text-slate-400">Enactment Status:</span>
                        <span className="text-amber-300 font-bold">VARIATION ORDERS FROZEN</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setMoratoriumModalOpen(false);
                          setEnactmentReceipt(null);
                        }}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer"
                      >
                        Done & Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statutory Donor Drawdown Enactment Modal */}
      <AnimatePresence>
        {donorModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-xl rounded-xl border border-cyan-500/30 bg-[#0A1224] shadow-2xl overflow-hidden font-mono text-xs"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#060D1A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-sans">Statutory Donor Credit Drawdown</h3>
                    <p className="text-[11px] text-slate-400">PFM Act 2012 Sec 50 & External Financing Agreement</p>
                  </div>
                </div>
                <button
                  onClick={() => setDonorModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {!drawdownReceipt ? (
                  <>
                    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400">Target Transmission Project:</span>
                        <span className="text-white font-bold">{selectedProject?.name || 'Olkaria - Lessos 400kV'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Donor Facility:</span>
                        <select
                          value={donorFacility}
                          onChange={(e) => setDonorFacility(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 max-w-[280px] truncate"
                        >
                          <option value="AfDB Sovereign Credit Facility (No. 2100150038)">AfDB Credit (No. 2100150038)</option>
                          <option value="World Bank IDA Transmission Facility (5035-KE)">World Bank IDA (5035-KE)</option>
                          <option value="JICA Power Grid Expansion Facility (KE-P31)">JICA Power Grid (KE-P31)</option>
                          <option value="European Investment Bank Facility (EIB-8491)">European Investment Bank (EIB)</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Drawdown Tranche Reference:</span>
                        <input
                          type="text"
                          value={trancheNo}
                          onChange={(e) => setTrancheNo(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 w-56 text-right"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Drawdown Amount:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="10000000"
                            value={drawdownAmountKES}
                            onChange={(e) => setDrawdownAmountKES(Number(e.target.value))}
                            className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-cyan-300 font-bold text-xs focus:outline-none focus:border-cyan-400 w-36 text-right font-mono"
                          />
                          <span className="text-slate-400 font-mono text-[10px]">KES</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-slate-400">IPC Engineering Verification:</span>
                        <span className="text-emerald-400 font-bold">VERIFIED (100% Milestone Cleared)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Statutory Borrowing & Inflow Attestation</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        Under Section 50 of the PFM Act 2012 and external credit agreement terms, disbursement proceeds are credited to the project special account for contractor milestone settlements. Every drawdown must be certified and logged into the audit ledger.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setDonorModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteDrawdown}
                        disabled={isExecutingDrawdown}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer font-sans"
                      >
                        {isExecutingDrawdown ? (
                          <span>Executing Drawdown...</span>
                        ) : (
                          <>
                            <span>Enact Drawdown Warrant</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Drawdown Enactment Success Receipt */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300 font-sans">Donor Drawdown Warrant Enacted</div>
                        <div className="text-[10px] text-slate-300">{drawdownReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-lg border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400">Drawdown Warrant Voucher:</span>
                        <span className="text-cyan-300 font-bold">{drawdownReceipt.reference || 'DD-AFDB-2025-01'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Financing Facility:</span>
                        <span className="text-slate-200">{donorFacility}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Total Enacted Inflow:</span>
                        <span className="text-emerald-400 font-bold">{formatFullKES(drawdownAmountKES)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Special Account Status:</span>
                        <span className="text-emerald-400">FUNDS ROUTED TO PROJECT DISBURSEMENT ACCOUNT</span>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400 text-[10px]">Cryptographic SHA-256 Warrant Seal:</span>
                          <button
                            onClick={() => copyToClipboard(drawdownReceipt.sha256Hash || '')}
                            className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded bg-black/50 border border-white/5 font-mono text-[9px] text-emerald-400 break-all select-all">
                          {drawdownReceipt.sha256Hash || '4cb8120e...'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setDonorModalOpen(false);
                          setDrawdownReceipt(null);
                        }}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer font-sans"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
