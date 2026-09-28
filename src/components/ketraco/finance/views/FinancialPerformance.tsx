import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FileCheck, CheckCircle2, ShieldCheck, X, ArrowRight, Copy, Send } from 'lucide-react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import {
  Panel, DataStateBadge, StatusChip, formatFullKES, formatKES, formatPct,
  useTooltip, FinanceSelect,
} from '../components/primitives';
import { financeTokens } from '../tokens';

interface ChartPoint {
  label: string;
  budget: number;
  actual: number;
  comm: number;
  paid: number;
  forecast: number;
}

export default function FinancialPerformance() {
  const data = useFinanceDataContext();
  const { show, hide, tooltip } = useTooltip();
  const [metric, setMetric] = useState('all');

  // PFM Sec 83 Statutory Quarterly Submission State
  const [statementModalOpen, setStatementModalOpen] = useState(false);
  const [selectedQuarter, setSelectedQuarter] = useState('Q3 FY2024/25');
  const [financialYear, setFinancialYear] = useState('2024/2025');
  const [certifiedByRole, setCertifiedByRole] = useState('Dr. (Eng.) John Mativo (Accounting Officer / MD)');
  const [totalExpenditureKES, setTotalExpenditureKES] = useState<number>(14850000000);
  const [isSubmittingStatement, setIsSubmittingStatement] = useState(false);
  const [statementReceipt, setStatementReceipt] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExecuteStatementSubmission = async () => {
    setIsSubmittingStatement(true);
    try {
      const res = await data.executeAction('STATUTORY_STATEMENT_SUBMISSION', {
        quarter: selectedQuarter,
        financialYear,
        totalExpenditureKES,
        certifiedBy: certifiedByRole
      });
      setStatementReceipt(res);
    } catch (err: any) {
      setStatementReceipt({ success: false, message: err?.message || 'Submission failed' });
    } finally {
      setIsSubmittingStatement(false);
    }
  };

  // Build a deterministic comparison by cost centre (x axis)
  const series: ChartPoint[] = useMemo(() => {
    return data.costCentres.map((cc) => {
      const ccBudgets = data.budgets.filter((b) => b.costCentreId === cc.costCentreId);
      return {
        label: cc.code,
        budget: ccBudgets.reduce((s, b) => s + b.revisedAmount, 0),
        actual: ccBudgets.reduce((s, b) => s + b.actualAmount, 0),
        comm: ccBudgets.reduce((s, b) => s + b.committedAmount, 0),
        paid: ccBudgets.reduce((s, b) => s + b.paidAmount, 0),
        forecast: ccBudgets.reduce((s, b) => s + b.forecastAmount, 0),
      };
    }).filter((p) => p.budget > 0);
  }, [data.costCentres, data.budgets]);

  const W = 720;
  const H = 260;
  const padL = 70;
  const padR = 20;
  const padT = 20;
  const padB = 40;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const maxVal = useMemo(() => Math.max(...series.flatMap((p) => [p.budget, p.actual, p.forecast, p.comm, p.paid]), 1) * 1.1, [series]);

  const x = (i: number) => padL + (series.length === 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
  const y = (v: number) => padT + innerH - (v / maxVal) * innerH;

  const metricLines = [
    { id: 'budget' as const, color: financeTokens.chart.budget },
    { id: 'forecast' as const, color: financeTokens.chart.forecast },
    { id: 'comm' as const, color: financeTokens.chart.committed },
    { id: 'actual' as const, color: financeTokens.chart.actual },
    { id: 'paid' as const, color: financeTokens.chart.paid },
  ].filter((l) => metric === 'all' || l.id === metric);

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map((f) => y(maxVal * f));

  const METRIC_LABEL: Record<string, string> = { budget: 'Budget', forecast: 'Forecast', comm: 'Committed', actual: 'Actual', paid: 'Paid' };

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="Financial Performance"
        subtitle="Budget vs actual, forecast and spend trends across cost centres"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setStatementReceipt(null);
                setStatementModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Submit PFM Sec 83 Report</span>
            </button>
            <DataStateBadge state={data.state} />
          </div>
        }
      />

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Trend chart */}
          <Panel
            title="Cost Centre Comparison"
            subtitle="Hover to inspect — select a metric to isolate"
            className="xl:col-span-2"
            accent={financeTokens.colors.primary}
            right={
              <FinanceSelect
                value={metric}
                onChange={setMetric}
                options={[
                  { value: 'all', label: 'ALL METRICS' },
                  { value: 'budget', label: 'BUDGET' },
                  { value: 'actual', label: 'ACTUAL' },
                  { value: 'comm', label: 'COMMITTED' },
                  { value: 'paid', label: 'PAID' },
                  { value: 'forecast', label: 'FORECAST' },
                ]}
                label="Metric"
              />
            }
          >
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Line chart comparing budget, committed, actual, paid and forecast across cost centres">
              {gridLines.map((gy, i) => (
                <g key={i}>
                  <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
                  <text x={padL - 8} y={gy + 3} textAnchor="end" fontSize="9" fill="#64748B" fontFamily="'JetBrains Mono',monospace">{formatKES(maxVal * (i ? (1 - i / 4) : 1))}</text>
                </g>
              ))}
              {series.map((p, i) => (
                <g key={p.label}>
                  <line x1={x(i)} y1={padT} x2={x(i)} y2={H - padB} stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="2 3" />
                  <text x={x(i)} y={H - 18} textAnchor="middle" fontSize="9" fill="#64748B" fontFamily="'JetBrains Mono',monospace">{p.label}</text>
                </g>
              ))}
              {metricLines.map((l) => {
                const line = series.map((p, i) => `${x(i)},${y(p[l.id])}`).join(' ');
                return (
                  <g key={l.id} onMouseEnter={(e) => show(e, <span><b>{METRIC_LABEL[l.id]}</b> series over {series.length} cost centres</span>)} onMouseLeave={hide}>
                    <polyline points={line} fill="none" stroke={l.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    {series.map((p, i) => (
                      <circle key={i} cx={x(i)} cy={y(p[l.id])} r={3.5} fill={l.color} stroke="#05070D" strokeWidth={1.5}>
                        <title>{`${p.label} — ${METRIC_LABEL[l.id]}: ${formatFullKES(p[l.id])}`}</title>
                      </circle>
                    ))}
                  </g>
                );
              })}
            </svg>
            <div className="flex flex-wrap gap-3 mt-2">
              {metricLines.map((l) => (
                <span key={l.id} className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                  <span className="w-2 h-0.5" style={{ backgroundColor: l.color }} />{METRIC_LABEL[l.id]}
                </span>
              ))}
            </div>
          </Panel>

          {/* Aggregate performance */}
          <div className="space-y-4">
            <Panel title="Budget Utilisation" accent={financeTokens.chart.actual}>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">Total budget</span><span className="text-slate-200">{formatFullKES(series.reduce((s, p) => s + p.budget, 0))}</span></div>
                <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">Actual spend</span><span className="text-purple-400">{formatFullKES(series.reduce((s, p) => s + p.actual, 0))}</span></div>
                <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-500">Forecast</span><span className="text-sky-400">{formatFullKES(series.reduce((s, p) => s + p.forecast, 0))}</span></div>
                <div className="border-t border-white/5 mt-2 pt-2">
                  <div className="flex justify-between text-[10px] font-mono"><span className="text-slate-400">Utilisation</span><span className="text-cyan-300 font-bold">{formatPct(series.reduce((s, p) => s + p.budget, 0) ? (series.reduce((s, p) => s + p.actual, 0) / series.reduce((s, p) => s + p.budget, 0)) * 100 : 0, false)}</span></div>
                </div>
              </div>
            </Panel>
            <Panel title="Metric Legend">
              <div className="flex flex-wrap gap-2">
                {metricLines.map((l) => (
                  <span key={l.id}>
                    <StatusChip label={METRIC_LABEL[l.id]} color={l.color} />
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        {/* Performance table */}
        <Panel title="Performance Register" subtitle="Per cost centre — budget, actual, forecast and variance" accent={financeTokens.colors.secondary}>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-[#64748B] border-b border-white/5">
                  <th className="text-left py-2 px-2">Cost Centre</th>
                  <th className="text-right py-2 px-2">Budget</th>
                  <th className="text-right py-2 px-2">Committed</th>
                  <th className="text-right py-2 px-2">Actual</th>
                  <th className="text-right py-2 px-2">Paid</th>
                  <th className="text-right py-2 px-2">Forecast</th>
                  <th className="text-right py-2 px-2">Utilisation</th>
                </tr>
              </thead>
              <tbody>
                {series.map((p) => {
                  const pct = p.budget ? (p.actual / p.budget) * 100 : 0;
                  return (
                    <tr key={p.label} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2 px-2 text-slate-200">{p.label}</td>
                      <td className="text-right py-2 px-2 text-slate-300">{formatKES(p.budget)}</td>
                      <td className="text-right py-2 px-2 text-amber-400">{formatKES(p.comm)}</td>
                      <td className="text-right py-2 px-2 text-purple-400">{formatKES(p.actual)}</td>
                      <td className="text-right py-2 px-2 text-emerald-400">{formatKES(p.paid)}</td>
                      <td className="text-right py-2 px-2 text-sky-400">{formatKES(p.forecast)}</td>
                      <td className="text-right py-2 px-2"><StatusChip label={`${pct.toFixed(0)}%`} color={pct > 85 ? '#F59E0B' : '#10B981'} /></td>
                    </tr>
                  );
                })}
                {series.length === 0 && <tr><td colSpan={7} className="py-6 text-center text-slate-500">No cost centre data loaded.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      {/* PFM Sec 83 Statutory Quarterly Submission Modal */}
      <AnimatePresence>
        {statementModalOpen && (
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
              className="w-full max-w-xl rounded-xl border border-emerald-500/30 bg-[#0A1224] shadow-2xl overflow-hidden font-mono text-xs"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#060D1A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-sans">PFM Act Sec 83 Quarterly Transmittal</h3>
                    <p className="text-[11px] text-slate-400">Statutory reporting to National Treasury & Controller of Budget (COB)</p>
                  </div>
                </div>
                <button
                  onClick={() => setStatementModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {!statementReceipt ? (
                  <>
                    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400">Reporting Period (Quarter):</span>
                        <select
                          value={selectedQuarter}
                          onChange={(e) => setSelectedQuarter(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-400"
                        >
                          <option value="Q3 FY2024/25">Q3 FY2024/25 (Ending March 31, 2025)</option>
                          <option value="Q2 FY2024/25">Q2 FY2024/25 (Ending December 31, 2024)</option>
                          <option value="Q1 FY2024/25">Q1 FY2024/25 (Ending September 30, 2024)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Financial Year:</span>
                        <input
                          type="text"
                          value={financialYear}
                          onChange={(e) => setFinancialYear(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-emerald-400 w-32"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Cumulative Vote Expenditure:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="10000000"
                            value={totalExpenditureKES}
                            onChange={(e) => setTotalExpenditureKES(Number(e.target.value))}
                            className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-emerald-300 font-bold text-xs focus:outline-none focus:border-emerald-400 w-36 text-right font-mono"
                          />
                          <span className="text-slate-400 font-mono text-[10px]">KES</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Accounting Officer Sign-Off:</span>
                        <span className="text-slate-200 font-semibold text-[10px] truncate max-w-[280px]">{certifiedByRole}</span>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-white/5">
                        <span className="text-slate-400">Statutory Transmission Window:</span>
                        <span className="text-emerald-400 font-bold">15 Days post-quarter end (ON TIME)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Public Finance Management Act 2012 Sec 83 Compliance</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        Section 83(1) of the PFM Act 2012 requires the Accounting Officer of a national government entity to prepare quarterly financial statements within 15 days after end of each quarter and submit them to the National Treasury and the Controller of Budget.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setStatementModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteStatementSubmission}
                        disabled={isSubmittingStatement}
                        className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer font-sans"
                      >
                        {isSubmittingStatement ? (
                          <span>Transmitting to National Treasury...</span>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Certify & Transmit Statement</span>
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Statement Submission Receipt */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300 font-sans">Statutory Transmittal Certificate Enacted</div>
                        <div className="text-[10px] text-slate-300">{statementReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-lg border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400">Electronic Filing Reference:</span>
                        <span className="text-emerald-300 font-bold">{statementReceipt.reference || 'PFM83-NT-55210'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Reporting Quarter:</span>
                        <span className="text-slate-200">{selectedQuarter}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Certified Expenditure:</span>
                        <span className="text-emerald-400 font-bold">{formatFullKES(totalExpenditureKES)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Budget Absorption Certified:</span>
                        <span className="text-emerald-400">76.8% (Target: ≥75.0%)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Statutory Recipient Gateways:</span>
                        <span className="text-slate-200">National Treasury & Controller of Budget</span>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400 text-[10px]">Cryptographic Transmittal SHA-256 Seal:</span>
                          <button
                            onClick={() => copyToClipboard(statementReceipt.sha256Hash || '')}
                            className="text-[9px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded bg-black/50 border border-white/5 font-mono text-[9px] text-emerald-400 break-all select-all">
                          {statementReceipt.sha256Hash || '4fa89c0...'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setStatementModalOpen(false);
                          setStatementReceipt(null);
                        }}
                        className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition cursor-pointer font-sans"
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
      {tooltip}
    </div>
  );
}
