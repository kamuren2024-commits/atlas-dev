import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sliders, ShieldCheck, CheckCircle2, AlertCircle, X, ArrowRight, FileCheck, Copy, Stamp } from 'lucide-react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import {
  Panel, DataStateBadge, FinanceSelect, StatusChip, formatFullKES, formatKES,
  formatPct, useTooltip, UtilizationBar,
} from '../components/primitives';
import { financeTokens } from '../tokens';
import type { FinanceBudget } from '../types';

export default function BudgetIntelligence() {
  const data = useFinanceDataContext();
  const { show, hide, tooltip } = useTooltip();

  const [fy, setFy] = useState('all');
  const [department, setDepartment] = useState('all');
  const [type, setType] = useState('all');

  // Statutory Virement State
  const [virementModalOpen, setVirementModalOpen] = useState(false);
  const [sourceProgram, setSourceProgram] = useState('Admin & Support');
  const [targetProgram, setTargetProgram] = useState('Transmission Projects');
  const [virementAmountKES, setVirementAmountKES] = useState(150000000);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Statutory AIE Warrant Issuance State
  const [aieModalOpen, setAieModalOpen] = useState(false);
  const [aieHolderName, setAieHolderName] = useState('Eng. J. Kiprono (Regional Transmission Manager - Western)');
  const [aieVoteCode, setAieVoteCode] = useState('VOTE-GRID-EXP-2025');
  const [aieAmountKES, setAieAmountKES] = useState<number>(85000000);
  const [aiePurpose, setAiePurpose] = useState('Emergency Conductor Restringing & Substation Switchgear Stabilization');
  const [isExecutingAie, setIsExecutingAie] = useState(false);
  const [aieResult, setAieResult] = useState<any | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExecuteAie = async () => {
    setIsExecutingAie(true);
    try {
      const res = await data.executeAction('AIE_ISSUANCE_ENACTMENT', {
        holderName: aieHolderName,
        voteCode: aieVoteCode,
        amountKES: aieAmountKES,
        purpose: aiePurpose
      });
      setAieResult(res);
    } catch (err: any) {
      setAieResult({ success: false, message: err?.message || 'AIE issuance failed' });
    } finally {
      setIsExecutingAie(false);
    }
  };

  const programs = [
    { name: 'Admin & Support', baseline: 1000000000 },
    { name: 'Operational', baseline: 2500000000 },
    { name: 'System Strengthening', baseline: 4500000000 },
    { name: 'Grid Expansion', baseline: 12000000000 },
    { name: 'Transmission Projects', baseline: 18500000000 },
  ];

  const selectedSourceObj = programs.find(p => p.name === sourceProgram) || programs[0];
  const ceilingKES = selectedSourceObj.baseline * 0.10;
  const isCompliant = virementAmountKES <= ceilingKES;
  const virementPct = ((virementAmountKES / selectedSourceObj.baseline) * 100).toFixed(1);

  const handleExecuteVirement = async () => {
    setIsExecuting(true);
    try {
      const res = await data.executeAction('BUDGET_ADJUSTMENT', {
        sourceProgram,
        targetProgram,
        amountKES: virementAmountKES
      });
      setExecutionResult(res);
    } catch (err: any) {
      setExecutionResult({ success: false, message: err?.message || 'Execution failed' });
    } finally {
      setIsExecuting(false);
    }
  };

  const fyOptions = useMemo(() => {
    const set = new Set(data.budgets.map((b) => b.financialYear));
    return [{ value: 'all', label: 'All Years' }, ...[...set].map((f) => ({ value: f, label: f }))];
  }, [data.budgets]);

  const deptOptions = useMemo(() => {
    const set = new Set(data.budgets.map((b) => b.department).filter(Boolean));
    return [{ value: 'all', label: 'All Depts' }, ...[...set].map((d) => ({ value: d as string, label: d as string }))];
  }, [data.budgets]);

  const filtered = useMemo(() => {
    return data.budgets.filter((b) => {
      if (fy !== 'all' && b.financialYear !== fy) return false;
      if (department !== 'all' && b.department !== department) return false;
      if (type !== 'all' && b.accountType !== type) return false;
      return true;
    });
  }, [data.budgets, fy, department, type]);

  const totals = useMemo(() => {
    const approved = filtered.reduce((s, b) => s + b.approvedAmount, 0);
    const revised = filtered.reduce((s, b) => s + b.revisedAmount, 0);
    const committed = filtered.reduce((s, b) => s + b.committedAmount, 0);
    const actual = filtered.reduce((s, b) => s + b.actualAmount, 0);
    const paid = filtered.reduce((s, b) => s + b.paidAmount, 0);
    const forecast = filtered.reduce((s, b) => s + b.forecastAmount, 0);
    const remaining = filtered.reduce((s, b) => s + b.remainingAmount, 0);
    const variance = filtered.reduce((s, b) => s + b.variance, 0);
    return { approved, revised, committed, actual, paid, forecast, remaining, variance };
  }, [filtered]);

  // Variance diverging bars: negative = under budget (green), positive = over (red)
  const maxAbs = useMemo(() => Math.max(...filtered.map((b) => Math.abs(b.variance)), 1), [filtered]);

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="Budget Intelligence"
        subtitle="Approved, revised, committed, actual and forecast across the budget portfolio"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setExecutionResult(null);
                setVirementModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>PFM Sec 43 Virement</span>
            </button>
            <button
              onClick={() => {
                setAieResult(null);
                setAieModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <Stamp className="w-3.5 h-3.5 text-amber-400" />
              <span>Issue AIE Warrant (Reg 52)</span>
            </button>
            <DataStateBadge state={data.state} />
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {/* Filter bar */}
        <div className="finance-panel p-3 flex flex-wrap items-center gap-3">
          <span className="finance-label">DIMENSIONS</span>
          <FinanceSelect value={fy} onChange={setFy} options={fyOptions} label="Year" />
          <FinanceSelect value={department} onChange={setDepartment} options={deptOptions} label="Dept" />
          <FinanceSelect
            value={type}
            onChange={setType}
            options={[
              { value: 'all', label: 'ALL' },
              { value: 'CAPEX', label: 'CAPEX' },
              { value: 'OPEX', label: 'OPEX' },
            ]}
            label="Class"
          />
          <span className="ml-auto text-[11px] font-mono text-slate-400">
            {filtered.length} budgets
          </span>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
          <div className="finance-kpi"><div className="finance-label">Approved</div><div className="finance-value" style={{ color: financeTokens.chart.budget }}>{formatKES(totals.approved)}</div><div className="text-[10px] text-slate-500 font-mono">{formatFullKES(totals.approved)}</div></div>
          <div className="finance-kpi"><div className="finance-label">Revised</div><div className="finance-value">{formatKES(totals.revised)}</div><div className="text-[10px] text-slate-500 font-mono">{formatFullKES(totals.revised)}</div></div>
          <div className="finance-kpi"><div className="finance-label">Committed</div><div className="finance-value" style={{ color: financeTokens.chart.committed }}>{formatKES(totals.committed)}</div><div className="text-[10px] text-slate-500 font-mono">{(totals.revised ? (totals.committed / totals.revised) * 100 : 0).toFixed(0)}% encumbered</div></div>
          <div className="finance-kpi"><div className="finance-label">Actual</div><div className="finance-value" style={{ color: financeTokens.chart.actual }}>{formatKES(totals.actual)}</div><div className="text-[10px] text-slate-500 font-mono">{(totals.revised ? (totals.actual / totals.revised) * 100 : 0).toFixed(0)}% used</div></div>
          <div className="finance-kpi"><div className="finance-label">Forecast</div><div className="finance-value" style={{ color: financeTokens.chart.forecast }}>{formatKES(totals.forecast)}</div><div className="text-[10px] text-slate-500 font-mono">projection</div></div>
          <div className="finance-kpi"><div className="finance-label">Remaining</div><div className="finance-value" style={{ color: financeTokens.chart.remaining }}>{formatKES(totals.remaining)}</div><div className="text-[10px] text-slate-500 font-mono">uncommitted</div></div>
          <div className="finance-kpi"><div className="finance-label">Variance</div><div className="finance-value" style={{ color: totals.variance >= 0 ? financeTokens.colors.positive : financeTokens.colors.negative }}>{formatFullKES(totals.variance)}</div><div className="text-[10px] text-slate-500 font-mono">over / under</div></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Variance diverging bars */}
          <Panel
            title="Budget Variance (Diverging)"
            subtitle="Left: under budget • Right: over budget"
            className="xl:col-span-2"
            accent={financeTokens.colors.positive}
          >
            <div className="space-y-2">
              <div className="flex justify-between text-[9px] font-mono text-slate-600 uppercase tracking-widest mb-2">
                <span>Under Budget ←</span><span>→ Over Budget</span>
              </div>
              {filtered.map((b) => {
                const isOver = b.variance > 0;
                const width = (Math.abs(b.variance) / maxAbs) * 50;
                const color = b.variance >= 0 ? financeTokens.colors.positive : financeTokens.colors.negative;
                return (
                  <button
                    key={b.budgetId}
                    onMouseEnter={(e) => show(e, <span><b>{b.name}</b> — {b.variance >= 0 ? 'Over' : 'Under'} by {formatFullKES(Math.abs(b.variance))}</span>)}
                    onMouseLeave={hide}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-300 truncate max-w-[55%]">{b.name}</span>
                      <span className={b.variance >= 0 ? 'text-rose-400' : 'text-emerald-400'}>{formatPct(b.variancePct)}</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded mt-1 overflow-hidden flex">
                      <div className="h-full" style={{ width: `${isOver ? 50 - width : 50}%`, backgroundColor: 'transparent' }} />
                      <div className="h-full rounded" style={{ width: `${width}%`, backgroundColor: color }} />
                      <div className="h-full flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }} />
                    </div>
                  </button>
                );
              })}
              {filtered.length === 0 && <div className="text-[11px] text-slate-500 font-mono">No budgets match the current filters.</div>}
            </div>
          </Panel>

          {/* Allocation flow + utilization */}
          <div className="space-y-4">
            <Panel title="Budget Flow" accent={financeTokens.chart.committed}>
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">Revised budget</span><span className="text-slate-200">{formatKES(totals.revised)}</span></div>
                <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">→ Committed</span><span className="text-slate-300">{formatKES(totals.committed)}</span></div>
                <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">→ Invoiced / Actual</span><span className="text-slate-300">{formatKES(totals.actual)}</span></div>
                <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">→ Paid</span><span className="text-emerald-400">{formatKES(totals.paid)}</span></div>
                <div className="border-t border-white/[0.05] my-2" />
                <div className="space-y-2">
                  <UtilizationBar pct={totals.revised ? (totals.committed / totals.revised) * 100 : 0} label="Encumbrance" value={`${(totals.revised ? (totals.committed / totals.revised) * 100 : 0).toFixed(0)}%`} color={financeTokens.chart.committed} />
                  <UtilizationBar pct={totals.revised ? (totals.actual / totals.revised) * 100 : 0} label="Burn rate" value={`${(totals.revised ? (totals.actual / totals.revised) * 100 : 0).toFixed(0)}%`} color={financeTokens.chart.actual} />
                  <UtilizationBar pct={totals.revised ? ((totals.revised - totals.committed) / totals.revised) * 100 : 0} label="Headroom" value={`${(totals.revised ? ((totals.revised - totals.committed) / totals.revised) * 100 : 0).toFixed(0)}%`} color={financeTokens.chart.remaining} />
                </div>
              </div>
            </Panel>
            <Panel title="Status Legend">
              <div className="flex flex-wrap gap-2">
                <StatusChip label="Active" color="#00D9FF" />
                <StatusChip label="Frozen" color="#8B5CF6" />
                <StatusChip label="Closed" color="#64748B" />
                <StatusChip label="Draft" color="#64748B" />
              </div>
            </Panel>
          </div>
        </div>

        {/* Budget table */}
        <Panel title="Budget Register" subtitle="Drill into each budget line" accent={financeTokens.colors.primary}>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-[#64748B] border-b border-white/5">
                  <th className="text-left py-2 px-2">Budget</th>
                  <th className="text-right py-2 px-2">Class</th>
                  <th className="text-right py-2 px-2">Approved</th>
                  <th className="text-right py-2 px-2">Revised</th>
                  <th className="text-right py-2 px-2">Committed</th>
                  <th className="text-right py-2 px-2">Actual</th>
                  <th className="text-right py-2 px-2">Remaining</th>
                  <th className="text-right py-2 px-2">Variance %</th>
                  <th className="text-right py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b) => (
                  <tr key={b.budgetId} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="py-2 px-2">
                      <div className="text-slate-200">{b.name}</div>
                      <div className="text-[9px] text-slate-500">{b.budgetCode} • {b.department}</div>
                    </td>
                    <td className="text-right py-2 px-2"><StatusChip label={b.accountType} color={b.accountType === 'CAPEX' ? financeTokens.chart.capex : financeTokens.chart.opex} /></td>
                    <td className="text-right py-2 px-2 text-slate-400">{formatKES(b.approvedAmount)}</td>
                    <td className="text-right py-2 px-2 text-slate-300">{formatKES(b.revisedAmount)}</td>
                    <td className="text-right py-2 px-2 text-amber-400">{formatKES(b.committedAmount)}</td>
                    <td className="text-right py-2 px-2 text-purple-400">{formatKES(b.actualAmount)}</td>
                    <td className="text-right py-2 px-2 text-slate-400">{formatKES(b.remainingAmount)}</td>
                    <td className={`text-right py-2 px-2 ${b.variance >= 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{formatPct(b.variancePct)}</td>
                    <td className="text-right py-2 px-2"><StatusChip label={b.status} color={b.status === 'ACTIVE' ? '#10B981' : '#64748B'} /></td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="py-6 text-center text-slate-500">No budgets match filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      {tooltip}

      {/* Statutory PFM Act Sec 43 Virement Modal */}
      <AnimatePresence>
        {virementModalOpen && (
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
              className="w-full max-w-xl rounded-xl border border-white/10 bg-[#0B132B] shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#080E21]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Statutory Budget Adjustment (Virement)</h3>
                    <p className="text-[11px] font-mono text-slate-400">PFM Act 2012 Section 43 & Reg 41 Enactment Protocol</p>
                  </div>
                </div>
                <button
                  onClick={() => setVirementModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-xs font-mono">
                {!executionResult ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Source Program</label>
                        <select
                          value={sourceProgram}
                          onChange={(e) => setSourceProgram(e.target.value)}
                          className="w-full rounded bg-slate-900 border border-white/10 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          {programs.map((p) => (
                            <option key={p.name} value={p.name} disabled={p.name === targetProgram}>
                              {p.name} (Base: {formatKES(p.baseline)})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Target Program</label>
                        <select
                          value={targetProgram}
                          onChange={(e) => setTargetProgram(e.target.value)}
                          className="w-full rounded bg-slate-900 border border-white/10 px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-400"
                        >
                          {programs.map((p) => (
                            <option key={p.name} value={p.name} disabled={p.name === sourceProgram}>
                              {p.name} (Base: {formatKES(p.baseline)})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-wider">Virement Amount (KES)</label>
                        <span className="text-cyan-400 font-bold">{formatFullKES(virementAmountKES)}</span>
                      </div>
                      <input
                        type="range"
                        min={10000000}
                        max={selectedSourceObj.baseline * 0.15}
                        step={5000000}
                        value={virementAmountKES}
                        onChange={(e) => setVirementAmountKES(Number(e.target.value))}
                        className="w-full accent-cyan-400 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Min: KES 10M</span>
                        <span>Statutory 10% Ceiling: {formatKES(ceilingKES)}</span>
                      </div>
                    </div>

                    {/* Statutory compliance check callout */}
                    <div className={`p-3 rounded-lg border flex items-start gap-2.5 ${isCompliant ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                      {isCompliant ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />}
                      <div className="space-y-0.5">
                        <div className="font-semibold text-[11px]">
                          {isCompliant ? 'PFM Act Sec 43 Compliance Verified' : 'Statutory Ceiling Exceeded'}
                        </div>
                        <div className="text-[10px] text-slate-300">
                          Transfer amount represents <span className="font-bold">{virementPct}%</span> of source allocation.
                          {isCompliant ? ' Within 10% statutory virement threshold. Does not require supplementary parliamentary appropriation.' : ' Exceeds 10% threshold. Requires parliamentary approval via supplementary budget.'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-3 rounded border border-white/5 space-y-1.5 text-[10px] text-slate-400">
                      <div className="flex justify-between">
                        <span>Source Program Revised:</span>
                        <span className="text-slate-200">{formatFullKES(selectedSourceObj.baseline - virementAmountKES)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target Program Revised:</span>
                        <span className="text-emerald-400">{formatFullKES((programs.find(p => p.name === targetProgram)?.baseline || 0) + virementAmountKES)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1">
                        <span>Execution Ledger:</span>
                        <span className="text-cyan-300">Cryptographically Signed SHA-256</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setVirementModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteVirement}
                        disabled={isExecuting}
                        className={`px-4 py-2 rounded font-medium flex items-center gap-1.5 transition cursor-pointer ${
                          isCompliant
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold'
                            : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                        }`}
                      >
                        {isExecuting ? (
                          <span>Enacting...</span>
                        ) : (
                          <>
                            <span>Enact Virement</span>
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
                        <div className="text-xs font-semibold text-emerald-300">Virement Successfully Enacted</div>
                        <div className="text-[10px] text-slate-300">{executionResult.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-white/10 space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Statutory Reference:</span>
                        <span className="text-cyan-300 font-bold">{executionResult.reference || 'BA-PFM43-7721'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Audit Identifier:</span>
                        <span className="text-slate-200">{executionResult.auditId}</span>
                      </div>
                      <div className="border-t border-white/5 pt-1.5">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400">Cryptographic SHA-256 Digest:</span>
                          <button
                            onClick={() => copyToClipboard(executionResult.sha256Hash || '')}
                            className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                          </button>
                        </div>
                        <div className="p-1.5 rounded bg-black/50 font-mono text-[9px] text-emerald-400 break-all select-all">
                          {executionResult.sha256Hash || 'e89a42f5...'}
                        </div>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5">
                        <span className="text-slate-400">Statutory Governing Body:</span>
                        <span className="text-slate-200">The National Treasury & Economic Planning</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setVirementModalOpen(false);
                          setExecutionResult(null);
                        }}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer"
                      >
                        Done & Refresh Ledgers
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statutory Authority to Incur Expenditure (AIE - PFM Reg 52) Modal */}
      <AnimatePresence>
        {aieModalOpen && (
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
              className="w-full max-w-xl rounded-xl border border-amber-500/30 bg-[#0A1224] shadow-2xl overflow-hidden font-mono text-xs"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#060D1A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Stamp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-sans">Authority to Incur Expenditure (AIE Warrant)</h3>
                    <p className="text-[11px] text-slate-400">PFM Regulations 2015 Reg 52 Spending Delegation</p>
                  </div>
                </div>
                <button
                  onClick={() => setAieModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {!aieResult ? (
                  <>
                    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400">Delegated AIE Holder:</span>
                        <select
                          value={aieHolderName}
                          onChange={(e) => setAieHolderName(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-400 max-w-[280px]"
                        >
                          <option value="Eng. J. Kiprono (Regional Transmission Manager - Western)">Eng. J. Kiprono (Western Region)</option>
                          <option value="Eng. M. Wanjiku (Chief Engineer Substation Operations)">Eng. M. Wanjiku (Substation Ops)</option>
                          <option value="Eng. A. Hassan (Regional Transmission Manager - Coast)">Eng. A. Hassan (Coast Region)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Budget Vote Code:</span>
                        <select
                          value={aieVoteCode}
                          onChange={(e) => setAieVoteCode(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                        >
                          <option value="VOTE-GRID-EXP-2025">VOTE-GRID-EXP-2025 (Grid Expansion)</option>
                          <option value="VOTE-SYS-STRENGTH-2025">VOTE-SYS-STRENGTH-2025 (System Strengthening)</option>
                          <option value="VOTE-OPS-MAINT-2025">VOTE-OPS-MAINT-2025 (Operations & Maint)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Warrant Spending Ceiling:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="5000000"
                            value={aieAmountKES}
                            onChange={(e) => setAieAmountKES(Number(e.target.value))}
                            className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400 w-36 text-right font-mono"
                          />
                          <span className="text-slate-400 font-mono text-[10px]">KES</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1 pt-1 border-t border-white/5">
                        <span className="text-slate-400">Statutory Purpose / Scope:</span>
                        <input
                          type="text"
                          value={aiePurpose}
                          onChange={(e) => setAiePurpose(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                        <span>Public Finance Management Regulations 2015 Reg 52 Attestation</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        Regulation 52 empowers the Accounting Officer to issue Authority to Incur Expenditure warrants authorizing designated sub-officers to commit funds and make payments within the approved budget allocations and strictly in accordance with PPADA 2015 procurement thresholds.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setAieModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteAie}
                        disabled={isExecutingAie}
                        className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer font-sans"
                      >
                        {isExecutingAie ? (
                          <span>Issuing Warrant...</span>
                        ) : (
                          <>
                            <Stamp className="w-3.5 h-3.5" />
                            <span>Enact AIE Spending Warrant</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* AIE Success Receipt */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300 font-sans">AIE Spending Warrant Enacted</div>
                        <div className="text-[10px] text-slate-300">{aieResult.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-lg border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400">AIE Warrant Reference:</span>
                        <span className="text-amber-300 font-bold">{aieResult.reference || 'AIE-WAR-84910'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Authorized AIE Holder:</span>
                        <span className="text-slate-200">{aieHolderName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Authorized Vote Ceiling:</span>
                        <span className="text-emerald-400 font-bold">{formatFullKES(aieAmountKES)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Effective Expiry Date:</span>
                        <span className="text-slate-200">June 30, 2025 (End of FY)</span>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400 text-[10px]">Cryptographic Warrant SHA-256 Seal:</span>
                          <button
                            onClick={() => copyToClipboard(aieResult.sha256Hash || '')}
                            className="text-[9px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded bg-black/50 border border-white/5 font-mono text-[9px] text-emerald-400 break-all select-all">
                          {aieResult.sha256Hash || 'a4e912c...'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setAieModalOpen(false);
                          setAieResult(null);
                        }}
                        className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition cursor-pointer font-sans"
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
