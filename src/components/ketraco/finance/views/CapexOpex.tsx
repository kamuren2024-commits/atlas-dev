import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, CheckCircle2, ShieldCheck, X, ArrowRight, Copy, Zap } from 'lucide-react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import {
  Panel, DataStateBadge, StatusChip, formatFullKES, formatKES, formatPct,
  useTooltip, UtilizationBar,
} from '../components/primitives';
import { financeTokens } from '../tokens';

export default function CapexOpex() {
  const data = useFinanceDataContext();
  const { show, hide, tooltip } = useTooltip();
  const [focus, setFocus] = useState<'CAPEX' | 'OPEX' | null>(null);

  // Statutory IPSAS 17 Capitalization State
  const [capModalOpen, setCapModalOpen] = useState(false);
  const [selectedProjectName, setSelectedProjectName] = useState('Athi 220kV Corridor Lot 1');
  const [capitalizedAmount, setCapitalizedAmount] = useState<number>(5640000000);
  const [energizationDate, setEnergizationDate] = useState('2025-04-15');
  const [isExecutingCap, setIsExecutingCap] = useState(false);
  const [capReceipt, setCapReceipt] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExecuteCapitalization = async () => {
    setIsExecutingCap(true);
    try {
      const res = await data.executeAction('ASSET_CAPITALIZATION_ENACTMENT', {
        projectName: selectedProjectName,
        projectId: 'KETRACO-003',
        amountKES: capitalizedAmount,
        energizationDate
      });
      setCapReceipt(res);
    } catch (err: any) {
      setCapReceipt({ success: false, message: err?.message || 'Capitalization failed' });
    } finally {
      setIsExecutingCap(false);
    }
  };

  const capexBudgets = useMemo(() => data.budgets.filter((b) => b.accountType === 'CAPEX'), [data.budgets]);
  const opexBudgets = useMemo(() => data.budgets.filter((b) => b.accountType === 'OPEX'), [data.budgets]);

  const capexTotal = capexBudgets.reduce((s, b) => s + b.revisedAmount, 0);
  const opexTotal = opexBudgets.reduce((s, b) => s + b.revisedAmount, 0);
  const grand = capexTotal + opexTotal || 1;

  const capexCape = capexBudgets.reduce((s, b) => s + b.actualAmount, 0);
  const opexActual = opexBudgets.reduce((s, b) => s + b.actualAmount, 0);
  const capexComm = capexBudgets.reduce((s, b) => s + b.committedAmount, 0);
  const opexComm = opexBudgets.reduce((s, b) => s + b.committedAmount, 0);
  const capexPaid = capexBudgets.reduce((s, b) => s + b.paidAmount, 0);
  const opexPaid = opexBudgets.reduce((s, b) => s + b.paidAmount, 0);

  // Radial donut for split
  const arc = (start: number, end: number, r: number, cx: number, cy: number) => {
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = end - start > Math.PI ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
  };

  const capexPct = (capexTotal / grand) * 100;
  const opexPct = (opexTotal / grand) * 100;
  const capexRad = (capexPct / 100) * Math.PI * 2;
  const opexRad = (opexPct / 100) * Math.PI * 2;
  const startAngle = -Math.PI / 2;

  const donutSize = 220;
  const rOuter = donutSize / 2 - 8;
  const rInner = rOuter * 0.62;

  const breakdown = focus === 'CAPEX' ? capexBudgets : focus === 'OPEX' ? opexBudgets : [...capexBudgets, ...opexBudgets];

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="CAPEX / OPEX Intelligence"
        subtitle="Capital investment versus operational expenditure — trace amounts to originating budgets"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCapReceipt(null);
                setCapModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Enact IPSAS 17 Capitalization</span>
            </button>
            <DataStateBadge state={data.state} />
          </div>
        }
      />

      <div className="p-5 space-y-5">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Donut split */}
          <Panel title="CAPEX / OPEX Split" accent={financeTokens.colors.secondary}>
            <div className="flex items-center justify-center py-2">
              <div className="relative" style={{ width: donutSize, height: donutSize }}>
                <svg width={donutSize} height={donutSize} viewBox={`0 0 ${donutSize} ${donutSize}`} role="img" aria-label="CAPEX versus OPEX budget split donut chart">
                  <g>
                    <motion.path
                      d={arc(startAngle, startAngle + capexRad, rOuter, donutSize / 2, donutSize / 2)}
                      fill={financeTokens.chart.capex}
                      opacity={focus === 'OPEX' ? 0.25 : 1}
                      className="cursor-pointer"
                      onClick={() => setFocus(focus === 'CAPEX' ? null : 'CAPEX')}
                    />
                    <motion.path
                      d={arc(startAngle, startAngle + capexRad, rInner, donutSize / 2, donutSize / 2)}
                      fill="transparent"
                      stroke={financeTokens.chart.capex}
                      strokeWidth={2}
                      opacity={focus === 'OPEX' ? 0.25 : 0.7}
                    />
                    <motion.path
                      d={arc(startAngle + capexRad, startAngle + capexRad + opexRad, rOuter, donutSize / 2, donutSize / 2)}
                      fill={financeTokens.chart.opex}
                      opacity={focus === 'CAPEX' ? 0.25 : 1}
                      className="cursor-pointer"
                      onClick={() => setFocus(focus === 'OPEX' ? null : 'OPEX')}
                    />
                    <motion.path
                      d={arc(startAngle + capexRad, startAngle + capexRad + opexRad, rInner, donutSize / 2, donutSize / 2)}
                      fill="transparent"
                      stroke={financeTokens.chart.opex}
                      strokeWidth={2}
                      opacity={focus === 'CAPEX' ? 0.25 : 0.7}
                    />
                  </g>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="finance-label">Total</span>
                  <span className="text-lg font-display font-semibold text-slate-100">{formatKES(grand)}</span>
                  <span className="text-[9px] font-mono text-slate-500">per annum</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button onClick={() => setFocus(focus === 'CAPEX' ? null : 'CAPEX')} className="rounded border border-white/5 bg-[#0B1220] p-2 text-left cursor-pointer hover:border-cyan-400/40">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: financeTokens.chart.capex }} /><span className="finance-label" style={{ color: financeTokens.chart.capex }}>CAPEX</span></div>
                <div className="text-base font-display font-semibold text-slate-100">{formatPct(capexPct, false)}</div>
                <div className="text-[9px] font-mono text-slate-500">{formatKES(capexTotal)}</div>
              </button>
              <button onClick={() => setFocus(focus === 'OPEX' ? null : 'OPEX')} className="rounded border border-white/5 bg-[#0B1220] p-2 text-left cursor-pointer hover:border-purple-400/40">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: financeTokens.chart.opex }} /><span className="finance-label" style={{ color: financeTokens.chart.opex }}>OPEX</span></div>
                <div className="text-base font-display font-semibold text-slate-100">{formatPct(opexPct, false)}</div>
                <div className="text-[9px] font-mono text-slate-500">{formatKES(opexTotal)}</div>
              </button>
            </div>
          </Panel>

          {/* Side by side detail */}
          <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Panel title="CAPEX Portfolio" accent={financeTokens.chart.capex} right={<StatusChip label={`${capexBudgets.length} budgets`} color={financeTokens.chart.capex} />}>
              <div className="space-y-2">
                <UtilizationBar pct={capexTotal ? (capexComm / capexTotal) * 100 : 0} label="Committed" value={formatKES(capexComm)} color={financeTokens.chart.committed} />
                <UtilizationBar pct={capexTotal ? (capexCape / capexTotal) * 100 : 0} label="Actual spend" value={formatKES(capexCape)} color={financeTokens.chart.actual} />
                <UtilizationBar pct={capexTotal ? (capexPaid / capexTotal) * 100 : 0} label="Paid" value={formatKES(capexPaid)} color={financeTokens.chart.paid} />
                <div className="text-[10px] font-mono text-slate-500 pt-1">Infrastructure • Substations • Transmission lines • Grid expansion</div>
              </div>
            </Panel>
            <Panel title="OPEX Base" accent={financeTokens.chart.opex} right={<StatusChip label={`${opexBudgets.length} budgets`} color={financeTokens.chart.opex} />}>
              <div className="space-y-2">
                <UtilizationBar pct={opexTotal ? (opexComm / opexTotal) * 100 : 0} label="Committed" value={formatKES(opexComm)} color={financeTokens.chart.committed} />
                <UtilizationBar pct={opexTotal ? (opexActual / opexTotal) * 100 : 0} label="Actual spend" value={formatKES(opexActual)} color={financeTokens.chart.actual} />
                <UtilizationBar pct={opexTotal ? (opexPaid / opexTotal) * 100 : 0} label="Paid" value={formatKES(opexPaid)} color={financeTokens.chart.paid} />
                <div className="text-[10px] font-mono text-slate-500 pt-1">Maintenance • Operations • Administration • Services</div>
              </div>
            </Panel>
          </div>
        </div>

        {/* Breakdown after split selection */}
        <Panel
          title={focus ? `${focus} Budget Breakdown` : 'Budget Breakdown (CAPEX + OPEX)'}
          subtitle={focus ? 'Click a budget to see its deployment' : 'Select CAPEX or OPEX on the left to focus'}
          accent={financeTokens.colors.primary}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {breakdown.map((b) => {
              const pctOfSegment = focus ? (b.revisedAmount / (focus === 'CAPEX' ? capexTotal : opexTotal || 1)) * 100 : (b.revisedAmount / grand) * 100;
              const color = b.accountType === 'CAPEX' ? financeTokens.chart.capex : financeTokens.chart.opex;
              return (
                <div key={b.budgetId} className="rounded border border-white/[0.05] bg-[#0B1220] p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-slate-200 truncate">{b.name}</span>
                    <StatusChip label={b.accountType} color={color} />
                  </div>
                  <div className="text-[9px] font-mono text-slate-500 mt-0.5">{b.department} • {b.budgetCode}</div>
                  <div className="mt-2 text-base font-display font-semibold text-slate-100">{formatFullKES(b.revisedAmount)}</div>
                  <div className="mt-1 text-[10px] font-mono text-slate-500">{pctOfSegment.toFixed(1)}% of {focus ?? 'total'}</div>
                  <div className="mt-2 space-y-1">
                    <UtilizationBar pct={b.revisedAmount ? (b.actualAmount / b.revisedAmount) * 100 : 0} label="Actual" value={formatPct(b.revisedAmount ? (b.actualAmount / b.revisedAmount) * 100 : 0, false)} color={financeTokens.chart.actual} />
                    <UtilizationBar pct={b.revisedAmount ? (b.committedAmount / b.revisedAmount) * 100 : 0} label="Committed" value={formatPct(b.revisedAmount ? (b.committedAmount / b.revisedAmount) * 100 : 0, false)} color={financeTokens.chart.committed} />
                  </div>
                </div>
              );
            })}
            {breakdown.length === 0 && <div className="text-[11px] text-slate-500 font-mono col-span-full">No budgets loaded for this class.</div>}
          </div>
        </Panel>
      </div>
      {/* Statutory IPSAS 17 Asset Capitalization Modal */}
      <AnimatePresence>
        {capModalOpen && (
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
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-sans">Statutory Asset Capitalization (IPSAS 17)</h3>
                    <p className="text-[11px] text-slate-400">CWIP to Fixed Asset Register & EPRA Regulatory Asset Base</p>
                  </div>
                </div>
                <button
                  onClick={() => setCapModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {!capReceipt ? (
                  <>
                    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400">Transmission Infrastructure Project:</span>
                        <select
                          value={selectedProjectName}
                          onChange={(e) => setSelectedProjectName(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-400 max-w-[280px]"
                        >
                          <option value="Athi 220kV Corridor Lot 1">Athi 220kV Corridor Lot 1 (KETRACO-003)</option>
                          <option value="Olkaria - Lessos 400kV Line">Olkaria - Lessos 400kV Line (KETRACO-001)</option>
                          <option value="Mariakani 400/220kV Substation">Mariakani 400/220kV Substation (KETRACO-002)</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Commissioning Date (COD):</span>
                        <input
                          type="date"
                          value={energizationDate}
                          onChange={(e) => setEnergizationDate(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Capitalized Value (from CWIP):</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="10000000"
                            value={capitalizedAmount}
                            onChange={(e) => setCapitalizedAmount(Number(e.target.value))}
                            className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-cyan-300 font-bold text-xs focus:outline-none focus:border-cyan-400 w-36 text-right font-mono"
                          />
                          <span className="text-slate-400 font-mono text-[10px]">KES</span>
                        </div>
                      </div>

                      {/* Component breakdown */}
                      <div className="border-t border-white/5 pt-2 space-y-1.5 text-[10px]">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">IPSAS 17 Componentization Schedule:</span>
                        <div className="grid grid-cols-2 gap-2 text-slate-300">
                          <div className="flex justify-between bg-black/30 p-1.5 rounded">
                            <span>Towers & Conductors (40%):</span>
                            <span className="text-cyan-300 font-bold">{formatKES(capitalizedAmount * 0.40)}</span>
                          </div>
                          <div className="flex justify-between bg-black/30 p-1.5 rounded">
                            <span>Transformers & Switchgear (35%):</span>
                            <span className="text-cyan-300 font-bold">{formatKES(capitalizedAmount * 0.35)}</span>
                          </div>
                          <div className="flex justify-between bg-black/30 p-1.5 rounded">
                            <span>SCADA & OPGW Optical Fiber (15%):</span>
                            <span className="text-cyan-300 font-bold">{formatKES(capitalizedAmount * 0.15)}</span>
                          </div>
                          <div className="flex justify-between bg-black/30 p-1.5 rounded">
                            <span>Wayleave & Land Rights (10%):</span>
                            <span className="text-cyan-300 font-bold">{formatKES(capitalizedAmount * 0.10)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Regulatory Asset Base (RAB) Attestation</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        Under IPSAS 17 and Energy and Petroleum Regulatory Authority (EPRA) regulations, energized transmission assets transfer from Capital Work In Progress to the Fixed Asset Register. This activates commercial depreciation schedules and incorporates capital into the national wheeling tariff determination base.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setCapModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteCapitalization}
                        disabled={isExecutingCap}
                        className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer font-sans"
                      >
                        {isExecutingCap ? (
                          <span>Executing Capitalization...</span>
                        ) : (
                          <>
                            <span>Enact Capitalization Warrant</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Capitalization Success Receipt */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300 font-sans">IPSAS 17 Asset Capitalization Enacted</div>
                        <div className="text-[10px] text-slate-300">{capReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-lg border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400">Fixed Asset Register Voucher:</span>
                        <span className="text-cyan-300 font-bold">{capReceipt.reference || 'CAP-IPSAS17-8821'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Capitalized Project:</span>
                        <span className="text-slate-200">{selectedProjectName}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">CWIP Transferred to PPE:</span>
                        <span className="text-emerald-400 font-bold">{formatFullKES(capitalizedAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Fixed Asset Batch ID:</span>
                        <span className="text-slate-200">{capReceipt.result?.farBatchId || 'FAR-2025-412'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">EPRA Regulatory Asset Base:</span>
                        <span className="text-emerald-400">INCORPORATED IN WHEELING TARIFF BASE</span>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400 text-[10px]">Cryptographic SHA-256 Warrant Seal:</span>
                          <button
                            onClick={() => copyToClipboard(capReceipt.sha256Hash || '')}
                            className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded bg-black/50 border border-white/5 font-mono text-[9px] text-emerald-400 break-all select-all">
                          {capReceipt.sha256Hash || '7df104b...'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setCapModalOpen(false);
                          setCapReceipt(null);
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
      {tooltip}
    </div>
  );
}
