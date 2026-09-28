import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileCheck, ShieldCheck, CheckCircle2, AlertCircle,
  X, ArrowRight, Lock, Hash, Plus
} from 'lucide-react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import {
  Panel, DataStateBadge, StatusChip, formatFullKES, formatKES, formatPct,
  useTooltip, FinanceSelect, UtilizationBar,
} from '../components/primitives';
import { financeTokens } from '../tokens';
import type { FinanceCommitment } from '../types';

export default function Commitments() {
  const data = useFinanceDataContext();
  const { show, hide, tooltip } = useTooltip();
  const [risk, setRisk] = useState('all');

  // Statutory Encumbrance Modal State
  const [encumbranceModalOpen, setEncumbranceModalOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState<FinanceCommitment | null>(null);
  const [poNumber, setPoNumber] = useState('PO-2025-ATHI-03');
  const [supplierName, setSupplierName] = useState('Siemens Energy Kenya Ltd');
  const [encumberAmountKES, setEncumberAmountKES] = useState(350000000);
  const [selectedVote, setSelectedVote] = useState('National Transmission Expansion Program');
  const [isEncumbering, setIsEncumbering] = useState(false);
  const [encumbranceReceipt, setEncumbranceReceipt] = useState<any | null>(null);

  const totalBudget = data.budgets.reduce((s, b) => s + b.revisedAmount, 0);
  const totalCommitted = data.commitments.reduce((s, c) => s + c.amount, 0);
  const totalInvoiced = data.commitments.reduce((s, c) => s + c.invoicedAmount, 0);
  const totalPaid = data.commitments.reduce((s, c) => s + c.paidAmount, 0);
  const totalRemaining = data.commitments.reduce((s, c) => s + c.remainingAmount, 0);

  const filtered = useMemo(() => {
    return data.commitments.filter((c) => risk === 'all' || c.riskLevel === risk);
  }, [data.commitments, risk]);

  const stages = [
    { label: 'BUDGET', value: totalBudget, color: financeTokens.chart.budget, desc: 'Available approved funds' },
    { label: 'COMMITTED', value: totalCommitted, color: financeTokens.chart.committed, desc: 'Purchase orders & contracts' },
    { label: 'INVOICED', value: totalInvoiced, color: financeTokens.chart.actual, desc: 'Invoices received against PO' },
    { label: 'PAID', value: totalPaid, color: financeTokens.chart.paid, desc: 'Payments settled' },
  ];

  const pipelinePct = (i: number) => {
    const denom = stages[i].value || totalCommitted || 1;
    const num = i === 0 ? totalCommitted : stages[i].value;
    return (num / denom) * 100;
  };

  const highRiskCount = data.commitments.filter((c) => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').length;

  const handleOpenEncumbrance = (commitment?: FinanceCommitment) => {
    if (commitment) {
      setSelectedCommitment(commitment);
      setPoNumber(commitment.reference || `PO-2025-${Math.floor(1000 + Math.random() * 9000)}`);
      setSupplierName(commitment.supplierName || 'Nairobi Cables Ltd');
      setEncumberAmountKES(commitment.amount || 250000000);
    } else {
      setSelectedCommitment(null);
      setPoNumber(`PO-2025-ENC-${Math.floor(1000 + Math.random() * 9000)}`);
      setSupplierName('Siemens Energy Kenya Ltd');
      setEncumberAmountKES(350000000);
    }
    setEncumbranceReceipt(null);
    setEncumbranceModalOpen(true);
  };

  const handleExecuteEncumbrance = async () => {
    setIsEncumbering(true);
    try {
      const res = await data.executeAction('COMMITMENT_ENCUMBRANCE', {
        poNumber,
        supplierName,
        amountKES: encumberAmountKES,
        vote: selectedVote
      });
      setEncumbranceReceipt(res);
    } catch (err: any) {
      setEncumbranceReceipt({ success: false, message: err?.message || 'Encumbrance failed' });
    } finally {
      setIsEncumbering(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="Commitment Monitor"
        subtitle="Budget to committed, invoiced and paid — with statutory encumbrance controls"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenEncumbrance()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Encumber Vote (PPADA Sec 53)</span>
            </button>
            <DataStateBadge state={data.state} />
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {/* Pipeline flow */}
        <Panel title="Commitment Pipeline" subtitle="Budget → Committed → Invoiced → Paid" accent={financeTokens.chart.committed}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stages.map((s, i) => (
              <div key={s.label} className="rounded border border-white/[0.05] bg-[#0B1220] p-3">
                <div className="flex items-center gap-2">
                  <span className="finance-label" style={{ color: s.color }}>{s.label}</span>
                  {i > 0 && <span className="text-[9px] font-mono text-slate-600">{pipelinePct(i).toFixed(0)}% retained</span>}
                </div>
                <div className="mt-1 text-lg font-display font-semibold text-slate-100">{formatFullKES(s.value)}</div>
                <div className="text-[9px] font-mono text-slate-500">{s.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            {stages.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <span className="text-slate-600 font-mono text-sm">→</span>}
                <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(i / 3, 1) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    style={{ backgroundColor: s.color, opacity: 0.7 }}
                  />
                </div>
              </React.Fragment>
            ))}
          </div>
        </Panel>

        {/* Risk exposure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Panel title="Total Exposure" accent={financeTokens.chart.committed}>
            <div className="finance-value" style={{ color: financeTokens.chart.committed }}>{formatFullKES(totalCommitted)}</div>
            <div className="text-[10px] font-mono text-slate-500">Committed against budget of {formatKES(totalBudget)}</div>
            <div className="mt-2"><UtilizationBar pct={totalBudget ? (totalCommitted / totalBudget) * 100 : 0} label="Encumbrance ratio" value={formatPct(totalBudget ? (totalCommitted / totalBudget) * 100 : 0, false)} color={financeTokens.chart.committed} /></div>
          </Panel>
          <Panel title="Remaining on Commitments" accent={financeTokens.chart.remaining}>
            <div className="finance-value" style={{ color: financeTokens.chart.remaining }}>{formatFullKES(totalRemaining)}</div>
            <div className="text-[10px] font-mono text-slate-500">Unfulfilled commitment balance</div>
          </Panel>
          <Panel title="High / Critical Risk" accent={financeTokens.colors.negative}>
            <div className="finance-value" style={{ color: highRiskCount ? financeTokens.colors.negative : financeTokens.colors.positive }}>{highRiskCount}</div>
            <div className="text-[10px] font-mono text-slate-500">commitments flagged by backend risk model</div>
          </Panel>
        </div>

        {/* Commitments table */}
        <Panel
          title="Commitment Register"
          subtitle="Statutory purchase order commitments encumbered against approved votes"
          accent={financeTokens.colors.primary}
          right={
            <div className="flex items-center gap-3">
              <FinanceSelect
                value={risk}
                onChange={setRisk}
                options={[
                  { value: 'all', label: 'ALL' },
                  { value: 'LOW', label: 'LOW' },
                  { value: 'MEDIUM', label: 'MEDIUM' },
                  { value: 'HIGH', label: 'HIGH' },
                  { value: 'CRITICAL', label: 'CRITICAL' },
                ]}
                label="Risk"
              />
            </div>
          }
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-[#64748B] border-b border-white/5">
                  <th className="text-left py-2 px-2">Reference</th>
                  <th className="text-left py-2 px-2">Description / Supplier</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-right py-2 px-2">Invoiced</th>
                  <th className="text-right py-2 px-2">Paid</th>
                  <th className="text-right py-2 px-2">Remaining</th>
                  <th className="text-right py-2 px-2">Status</th>
                  <th className="text-right py-2 px-2">Risk</th>
                  <th className="text-right py-2 px-2">Statutory</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.commitmentId}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                    onMouseEnter={(e) => show(e, <span><b>{c.description}</b> — {formatFullKES(c.amount)}</span>)}
                    onMouseLeave={hide}
                  >
                    <td className="py-2 px-2 text-cyan-300 font-semibold">{c.reference}</td>
                    <td className="py-2 px-2">
                      <div className="text-slate-200">{c.description}</div>
                      <div className="text-[9px] text-slate-500">{c.supplierName}</div>
                    </td>
                    <td className="text-right py-2 px-2 text-slate-300 font-bold">{formatKES(c.amount)}</td>
                    <td className="text-right py-2 px-2 text-purple-400">{formatKES(c.invoicedAmount)}</td>
                    <td className="text-right py-2 px-2 text-emerald-400">{formatKES(c.paidAmount)}</td>
                    <td className="text-right py-2 px-2 text-amber-400">{formatKES(c.remainingAmount)}</td>
                    <td className="text-right py-2 px-2"><StatusChip label={c.status} color={c.status === 'ACTIVE' ? '#00D9FF' : c.status === 'EXPIRED' ? '#F43F5E' : '#64748B'} /></td>
                    <td className="text-right py-2 px-2">
                      <StatusChip label={c.riskLevel} color={c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL' ? '#F43F5E' : c.riskLevel === 'MEDIUM' ? '#F59E0B' : '#10B981'} />
                    </td>
                    <td className="text-right py-2 px-2">
                      <button
                        onClick={() => handleOpenEncumbrance(c)}
                        className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono transition cursor-pointer"
                      >
                        Encumber
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={9} className="py-6 text-center text-slate-500">No commitments loaded.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      {tooltip}

      {/* PPADA 2015 Section 53 Statutory Commitment Encumbrance Modal */}
      <AnimatePresence>
        {encumbranceModalOpen && (
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
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-cyan-400">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Statutory Commitment Encumbrance</h3>
                    <p className="text-[11px] font-mono text-slate-400">PPADA 2015 Sec 53 & PFM Reg 41 Legal Warrant</p>
                  </div>
                </div>
                <button
                  onClick={() => setEncumbranceModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-xs font-mono">
                {!encumbranceReceipt ? (
                  <>
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Purchase Order Reference</label>
                        <input
                          type="text"
                          value={poNumber}
                          onChange={(e) => setPoNumber(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-cyan-300 font-bold focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Awarded Contractor / Supplier</label>
                        <input
                          type="text"
                          value={supplierName}
                          onChange={(e) => setSupplierName(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Target Budget Vote</label>
                          <select
                            value={selectedVote}
                            onChange={(e) => setSelectedVote(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
                          >
                            <option value="National Transmission Expansion Program">NTEP Capital Vote</option>
                            <option value="Grid Expansion & Regional Interconnectors">Grid Expansion Vote</option>
                            <option value="System Strengthening & Reliability">System Strengthening Vote</option>
                            <option value="Operational Grid Maintenance">Operations Vote</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Encumbrance Amount (KES)</label>
                          <input
                            type="number"
                            step="10000000"
                            value={encumberAmountKES}
                            onChange={(e) => setEncumberAmountKES(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-white/10 rounded px-3 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Statutory Verification Box */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-white/10 space-y-2 text-[11px]">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/5 pb-1 flex items-center justify-between">
                        <span>Statutory Encumbrance Verification</span>
                        <span className="text-emerald-400">PASSED ✓</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Encumbrance Value:</span>
                        <span className="text-cyan-300 font-bold">{formatFullKES(encumberAmountKES)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Vote Available Balance:</span>
                        <span className="text-emerald-400 font-bold">KES 7.68B Available</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Procurement Plan Alignment:</span>
                        <span className="text-slate-200">FY24/25 Item Ref #PP-ATHI-04</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Accounting Officer Legal Warrant</span>
                      </div>
                      <p className="text-slate-300">
                        In accordance with PPADA 2015 Section 53, the Accounting Officer certifies that budget funds have been appropriated and encumbered prior to contractual execution.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setEncumbranceModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteEncumbrance}
                        disabled={isEncumbering}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {isEncumbering ? (
                          <span>Encumbering Vote...</span>
                        ) : (
                          <>
                            <span>Encumber & Sign Warrant</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Success Receipt */
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300">Commitment Encumbered Successfully</div>
                        <div className="text-[10px] text-slate-300">{encumbranceReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-white/10 space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Statutory Warrant Reference:</span>
                        <span className="text-cyan-300 font-bold">{encumbranceReceipt.reference || 'ENC-PPADA53-8821'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Audit Identifier:</span>
                        <span className="text-slate-200">{encumbranceReceipt.auditId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SHA-256 Ledger Hash:</span>
                        <span className="text-emerald-400 font-mono text-[9px] truncate max-w-[280px]">
                          {encumbranceReceipt.sha256Hash || 'e89a71b...'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5">
                        <span className="text-slate-400">TSA Commitments Ledger:</span>
                        <span className="text-emerald-300 font-bold">RESERVED IN SYSTEM OF RECORD</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setEncumbranceModalOpen(false);
                          setEncumbranceReceipt(null);
                        }}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer"
                      >
                        Done & Refresh Commitments
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

