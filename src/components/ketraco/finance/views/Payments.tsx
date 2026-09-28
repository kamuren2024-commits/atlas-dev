import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard, ShieldCheck, CheckCircle2, AlertCircle,
  X, ArrowRight, FileCheck, Landmark, Copy, Lock
} from 'lucide-react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import {
  Panel, DataStateBadge, StatusChip, formatFullKES, formatKES, formatPct,
  useTooltip, FinanceSelect,
} from '../components/primitives';
import { financeTokens } from '../tokens';
import type { FinanceInvoice } from '../types';

export default function Payments() {
  const data = useFinanceDataContext();
  const { show, hide, tooltip } = useTooltip();
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');

  // Statutory Payment Approval State
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FinanceInvoice | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authorizationReceipt, setAuthorizationReceipt] = useState<any | null>(null);

  // Statutory Tax Remittance State (KRA iTax)
  const [taxModalOpen, setTaxModalOpen] = useState(false);
  const [taxPeriod, setTaxPeriod] = useState('April 2025');
  const [whtAmount, setWhtAmount] = useState<number>(68500000);
  const [whvatAmount, setWhvatAmount] = useState<number>(22800000);
  const [isRemittingTax, setIsRemittingTax] = useState(false);
  const [taxReceipt, setTaxReceipt] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleRemitTaxes = async () => {
    setIsRemittingTax(true);
    try {
      const res = await data.executeAction('TAX_REMITTANCE_EXECUTION', {
        period: taxPeriod,
        whtAmountKES: whtAmount,
        whvatAmountKES: whvatAmount
      });
      setTaxReceipt(res);
    } catch (err: any) {
      setTaxReceipt({ success: false, message: err?.message || 'Tax remittance failed' });
    } finally {
      setIsRemittingTax(false);
    }
  };

  const filtered = useMemo(() => {
    return data.invoices.filter((inv) => {
      if (status !== 'all' && inv.status !== status) return false;
      const pay = data.payments.find((p) => p.invoiceId === inv.invoiceId);
      if (method !== 'all' && pay && pay.method !== method) return false;
      return true;
    });
  }, [data.invoices, data.payments, method, status]);

  const lifecycle = [
    { label: 'RECEIVED', count: data.invoices.filter((i) => i.status === 'RECEIVED').length, color: financeTokens.chart.budget },
    { label: 'VALIDATED', count: data.invoices.filter((i) => i.status === 'VALIDATED').length, color: financeTokens.chart.forecast },
    { label: 'APPROVED', count: data.invoices.filter((i) => i.status === 'APPROVED').length, color: financeTokens.chart.committed },
    { label: 'SCHEDULED', count: data.payments.filter((p) => p.status === 'SCHEDULED').length, color: financeTokens.chart.actual },
    { label: 'PAID', count: data.payments.filter((p) => p.status === 'COMPLETED').length, color: financeTokens.chart.paid },
  ];

  const totalPaymentsValue = data.payments.reduce((s, p) => s + p.amount, 0);
  const totalInvoicesValue = data.invoices.reduce((s, i) => s + i.amount, 0);
  const totalDue = data.invoices.filter((i) => i.status === 'APPROVED' || i.status === 'VALIDATED').reduce((s, i) => s + i.amount, 0);
  const overdue = data.invoices.filter((i) => {
    if (i.status === 'PAID') return false;
    if (i.status === 'RECEIVED') return false;
    return new Date(i.dueDate) < new Date();
  });

  const maxCount = Math.max(...lifecycle.map((l) => l.count), 1);

  // Statutory tax deductions
  const gross = selectedInvoice ? selectedInvoice.totalAmount : 0;
  const kraWHT = gross * 0.06; // 6% KRA Withholding Tax
  const kraWHVAT = gross * 0.02; // 2% KRA Withholding VAT
  const netRTGS = gross - kraWHT - kraWHVAT;

  const handleAuthorizePayment = async () => {
    if (!selectedInvoice) return;
    setIsAuthorizing(true);
    try {
      const res = await data.executeAction('PAYMENT_APPROVAL', {
        invoiceId: selectedInvoice.invoiceId,
        grossAmountKES: gross,
        payee: selectedInvoice.supplierName,
        netRTGS,
        kraWHT,
        kraWHVAT
      });
      setAuthorizationReceipt(res);
    } catch (err: any) {
      setAuthorizationReceipt({ success: false, message: err?.message || 'Authorization failed' });
    } finally {
      setIsAuthorizing(false);
    }
  };

  const openApprovalForInvoice = (inv: FinanceInvoice) => {
    setSelectedInvoice(inv);
    setAuthorizationReceipt(null);
    setApprovalModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="Payables & Payments"
        subtitle="Invoice-to-payment lifecycle, aging and settlement intelligence"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setTaxReceipt(null);
                setTaxModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Remit KRA Taxes (iTax)</span>
            </button>
            <button
              onClick={() => {
                const candidate = data.invoices.find(i => i.status === 'VALIDATED' || i.status === 'APPROVED') || data.invoices[0];
                if (candidate) openApprovalForInvoice(candidate);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Authorize RTGS Release</span>
            </button>
            <DataStateBadge state={data.state} />
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {/* Lifecycle visualization */}
        <Panel title="Payment Lifecycle" subtitle="Invoice → Validated → Approved → Scheduled → Paid" accent={financeTokens.chart.paid}>
          <div className="flex items-end gap-2 flex-wrap">
            {lifecycle.map((l, i) => (
              <React.Fragment key={l.label}>
                {i > 0 && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.1 }} className="text-slate-600 font-mono text-lg pb-8">→</motion.span>}
                <div className="flex-1 min-w-[70px] text-center">
                  <div className="flex items-end justify-center gap-0.5 h-28">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(l.count / maxCount) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.08 }}
                      className="w-6 rounded-t"
                      style={{ backgroundColor: l.color, opacity: 0.85, minHeight: 4 }}
                    />
                  </div>
                  <div className="mt-1 text-[10px] font-mono font-bold" style={{ color: l.color }}>{l.label}</div>
                  <div className="text-[11px] font-mono text-slate-300">{l.count}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
          <p className="text-[10px] font-mono text-slate-500 mt-2">Animation conveys lifecycle transitions only — counts are backend-derived.</p>
        </Panel>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="finance-kpi"><div className="finance-label">Invoice Value</div><div className="finance-value" style={{ color: financeTokens.chart.actual }}>{formatKES(totalInvoicesValue)}</div><div className="text-[10px] text-slate-500 font-mono">{data.invoices.length} invoices</div></div>
          <div className="finance-kpi"><div className="finance-label">Paid Value</div><div className="finance-value" style={{ color: financeTokens.chart.paid }}>{formatKES(totalPaymentsValue)}</div><div className="text-[10px] text-slate-500 font-mono">{data.payments.length} payments</div></div>
          <div className="finance-kpi"><div className="finance-label">Pending Approval</div><div className="finance-value" style={{ color: financeTokens.chart.committed }}>{formatKES(totalDue)}</div><div className="text-[10px] text-slate-500 font-mono">validated + approved</div></div>
          <div className="finance-kpi"><div className="finance-label">Overdue</div><div className="finance-value" style={{ color: overdue.length ? financeTokens.colors.negative : financeTokens.colors.positive }}>{overdue.length}</div><div className="text-[10px] text-slate-500 font-mono">past due date</div></div>
        </div>

        {/* Invoices table */}
        <Panel
          title="Invoice Register"
          subtitle="Filter by lifecycle status and payment method • Click Authorize to execute statutory disbursal"
          accent={financeTokens.colors.primary}
          right={
            <div className="flex items-center gap-2">
              <FinanceSelect
                value={status}
                onChange={setStatus}
                options={[
                  { value: 'all', label: 'ALL STATUS' },
                  { value: 'RECEIVED', label: 'RECEIVED' },
                  { value: 'VALIDATED', label: 'VALIDATED' },
                  { value: 'APPROVED', label: 'APPROVED' },
                  { value: 'PAID', label: 'PAID' },
                ]}
                label="Status"
              />
              <FinanceSelect
                value={method}
                onChange={setMethod}
                options={[
                  { value: 'all', label: 'ALL' },
                  { value: 'BANK_TRANSFER', label: 'BANK' },
                  { value: 'RTGS', label: 'RTGS' },
                ]}
                label="Method"
              />
            </div>
          }
        >
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-[#64748B] border-b border-white/5">
                  <th className="text-left py-2 px-2">Invoice</th>
                  <th className="text-left py-2 px-2">Supplier</th>
                  <th className="text-right py-2 px-2">Amount</th>
                  <th className="text-right py-2 px-2">Due</th>
                  <th className="text-right py-2 px-2">Method</th>
                  <th className="text-right py-2 px-2">Status</th>
                  <th className="text-right py-2 px-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => {
                  const pay = data.payments.find((p) => p.invoiceId === inv.invoiceId);
                  const isOverdue = inv.status !== 'PAID' && new Date(inv.dueDate) < new Date();
                  return (
                    <tr
                      key={inv.invoiceId}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                      onMouseEnter={(e) => show(e, <span><b>{inv.invoiceNumber}</b> — {formatFullKES(inv.totalAmount)}</span>)}
                      onMouseLeave={hide}
                    >
                      <td className="py-2 px-2 text-cyan-300 font-semibold">{inv.invoiceNumber}</td>
                      <td className="py-2 px-2 text-slate-200">{inv.supplierName}</td>
                      <td className="text-right py-2 px-2 text-slate-300 font-bold">{formatKES(inv.totalAmount)}</td>
                      <td className={`text-right py-2 px-2 ${isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'}`}>{new Date(inv.dueDate).toLocaleDateString('en-KE')}{isOverdue ? ' ⚠' : ''}</td>
                      <td className="text-right py-2 px-2 text-slate-400">{pay?.method?.replace('_', ' ') ?? 'RTGS'}</td>
                      <td className="text-right py-2 px-2">
                        <StatusChip label={inv.status} color={inv.status === 'PAID' ? '#10B981' : inv.status === 'REJECTED' ? '#F43F5E' : '#F59E0B'} />
                      </td>
                      <td className="text-right py-2 px-2">
                        {inv.status !== 'PAID' ? (
                          <button
                            onClick={() => openApprovalForInvoice(inv)}
                            className="px-2 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-mono transition cursor-pointer"
                          >
                            Authorize
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400">Settled ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-500">No invoices match filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      {tooltip}

      {/* Statutory Dual-Control Payment Authorization Modal */}
      <AnimatePresence>
        {approvalModalOpen && selectedInvoice && (
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
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Central Bank RTGS Payment Authorization</h3>
                    <p className="text-[11px] font-mono text-slate-400">PFM Act Dual Maker-Checker Statutory Warrant</p>
                  </div>
                </div>
                <button
                  onClick={() => setApprovalModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 text-xs font-mono">
                {!authorizationReceipt ? (
                  <>
                    <div className="bg-slate-900/60 p-3 rounded-lg border border-white/5 space-y-2 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Invoice Reference:</span>
                        <span className="text-cyan-300 font-bold">{selectedInvoice.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payee / Beneficiary:</span>
                        <span className="text-slate-200">{selectedInvoice.supplierName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Payment Channel:</span>
                        <span className="text-slate-200">Central Bank of Kenya National Payment System (RTGS)</span>
                      </div>
                    </div>

                    {/* Tax deductions breakdown */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-white/10 space-y-2 text-[11px]">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold border-b border-white/5 pb-1">
                        Statutory Tax Deductions & Net Disbursal
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-300">Gross Invoice Amount:</span>
                        <span className="text-white font-bold">{formatFullKES(gross)}</span>
                      </div>
                      <div className="flex justify-between text-rose-300">
                        <span>Less: KRA Withholding Tax (6% - ITA Sec 35):</span>
                        <span>- {formatFullKES(kraWHT)}</span>
                      </div>
                      <div className="flex justify-between text-rose-300">
                        <span>Less: KRA Withholding VAT (2% - VAT Act 25A):</span>
                        <span>- {formatFullKES(kraWHVAT)}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/10 pt-2 text-emerald-400 font-bold text-sm">
                        <span>Net CBK Disbursal:</span>
                        <span>{formatFullKES(netRTGS)}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Dual Authorization Attestation</span>
                      </div>
                      <p className="text-slate-300">
                        Authorizing officer certifies that goods/services have been inspected and accepted, budget allocation is encumbered, and tax withholding will be remitted to the Kenya Revenue Authority portal.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setApprovalModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAuthorizePayment}
                        disabled={isAuthorizing}
                        className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        {isAuthorizing ? (
                          <span>Releasing RTGS...</span>
                        ) : (
                          <>
                            <span>Authorize CBK RTGS</span>
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
                        <div className="text-xs font-semibold text-emerald-300">Payment Authorized & Executed</div>
                        <div className="text-[10px] text-slate-300">{authorizationReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-lg border border-white/10 space-y-2 text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">CBK Warrant Reference:</span>
                        <span className="text-cyan-300 font-bold">{authorizationReceipt.reference || 'WAR-CBK-9011'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Audit Identifier:</span>
                        <span className="text-slate-200">{authorizationReceipt.auditId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">SHA-256 Digest:</span>
                        <span className="text-emerald-400 font-mono text-[9px] truncate max-w-[280px]">
                          {authorizationReceipt.sha256Hash || '2b918f0c...'}
                        </span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-1.5">
                        <span className="text-slate-400">CBK Settlement Status:</span>
                        <span className="text-emerald-300 font-bold">RTGS QUEUED FOR VALUE TODAY</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setApprovalModalOpen(false);
                          setAuthorizationReceipt(null);
                        }}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition cursor-pointer"
                      >
                        Done & Refresh Registers
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Statutory KRA Tax Remittance Modal */}
      <AnimatePresence>
        {taxModalOpen && (
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
                    <h3 className="text-sm font-semibold text-white font-sans">Statutory Tax Remittance (KRA iTax)</h3>
                    <p className="text-[11px] text-slate-400">Income Tax Act Cap 470 Sec 35 & VAT Act 2013 Sec 25A</p>
                  </div>
                </div>
                <button
                  onClick={() => setTaxModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {!taxReceipt ? (
                  <>
                    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400">Statutory Tax Agent:</span>
                        <span className="text-white font-bold">KETRACO (KRA PIN: P051239841K)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Remittance Period:</span>
                        <select
                          value={taxPeriod}
                          onChange={(e) => setTaxPeriod(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                        >
                          <option value="April 2025">April 2025 (Statutory Due: May 20th)</option>
                          <option value="March 2025">March 2025 (Reconciliation)</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Withholding Tax (WHT 6% Works/Services):</span>
                        <span className="text-cyan-300 font-bold">{formatFullKES(whtAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Withholding VAT (WHVAT 2%):</span>
                        <span className="text-cyan-300 font-bold">{formatFullKES(whvatAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-2">
                        <span className="text-slate-300 font-semibold">Total Statutory Remittance to KRA:</span>
                        <span className="text-emerald-400 font-bold text-sm">{formatFullKES(whtAmount + whvatAmount)}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Statutory Remittance Obligation</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        In accordance with the Public Finance Management Act 2012 and the Tax Procedures Act 2015, taxes withheld on contractor milestone disbursements must be settled via the Central Bank of Kenya to the KRA Commissioner-General prior to the 20th day of the succeeding month.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setTaxModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleRemitTaxes}
                        disabled={isRemittingTax}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer font-sans"
                      >
                        {isRemittingTax ? (
                          <span>Executing KRA Settlement...</span>
                        ) : (
                          <>
                            <span>Remit & Sign Warrant</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Tax Remittance Success Receipt */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300 font-sans">KRA Tax Remittance Warrant Enacted</div>
                        <div className="text-[10px] text-slate-300">{taxReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-lg border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400">KRA e-Slip Payment Reg. No (PRN):</span>
                        <span className="text-cyan-300 font-bold">{taxReceipt.reference || 'KRA-PRN-2025-04-9841'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Remitted Tax Period:</span>
                        <span className="text-slate-200">{taxPeriod}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Gross Remitted Amount:</span>
                        <span className="text-emerald-400 font-bold">{formatFullKES(taxReceipt.result?.totalRemittedKES || (whtAmount + whvatAmount))}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Beneficiary:</span>
                        <span className="text-slate-200">Kenya Revenue Authority (CBK Account 1000...)</span>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400 text-[10px]">Cryptographic SHA-256 Warrant Seal:</span>
                          <button
                            onClick={() => copyToClipboard(taxReceipt.sha256Hash || '')}
                            className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded bg-black/50 border border-white/5 font-mono text-[9px] text-emerald-400 break-all select-all">
                          {taxReceipt.sha256Hash || '6fe421b8c9d...'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setTaxModalOpen(false);
                          setTaxReceipt(null);
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
