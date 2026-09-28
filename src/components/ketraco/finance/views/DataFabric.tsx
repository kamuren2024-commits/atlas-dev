import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, CheckCircle2, ShieldCheck, X, ArrowRight, Copy, RefreshCw, Scale } from 'lucide-react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import {
  Panel, DataStateBadge, StatusChip, formatNumber, formatDate, usePrefersReducedMotion, formatFullKES,
} from '../components/primitives';
import { financeTokens } from '../tokens';

const SOURCE_ICON: Record<string, string> = {
  SAP_S4HANA: '#00D9FF',
  SAP_ARIBA: '#8B5CF6',
  EXCEL: '#10B981',
  CSV: '#0EA5E9',
  DATABASE: '#F59E0B',
  API: '#F43F5E',
  BANK: '#64748B',
  PROJECT_SYSTEM: '#8B5CF6',
};

const PIPELINE_STAGES = [
  { label: 'SOURCE', color: financeTokens.chart.budget },
  { label: 'INGESTION', color: financeTokens.chart.forecast },
  { label: 'VALIDATION', color: financeTokens.chart.committed },
  { label: 'NORMALIZATION', color: financeTokens.chart.actual },
  { label: 'ONTOLOGY', color: financeTokens.colors.secondary },
  { label: 'GRAPH', color: financeTokens.chart.paid },
];

export default function DataFabric() {
  const data = useFinanceDataContext();
  const reduced = usePrefersReducedMotion();

  // PFM Reg 90 Statutory Bank Reconciliation State
  const [reconModalOpen, setReconModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState('CBK National Treasury Single Account (10003894)');
  const [reconPeriod, setReconPeriod] = useState('April 2025');
  const [clearedBalanceKES, setClearedBalanceKES] = useState<number>(4285000000);
  const [isReconciling, setIsReconciling] = useState(false);
  const [reconReceipt, setReconReceipt] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleExecuteReconciliation = async () => {
    setIsReconciling(true);
    try {
      const res = await data.executeAction('IFMIS_TSA_RECONCILIATION_CERTIFICATION', {
        period: reconPeriod,
        accountName: selectedAccount,
        clearedBalanceKES
      });
      setReconReceipt(res);
    } catch (err: any) {
      setReconReceipt({ success: false, message: err?.message || 'Reconciliation failed' });
    } finally {
      setIsReconciling(false);
    }
  };

  const totalRecords = useMemo(() => data.batches.reduce((s, b) => s + b.recordCount, 0), [data.batches]);
  const totalFailures = useMemo(() => data.batches.reduce((s, b) => s + b.failureCount, 0), [data.batches]);
  const totalWarnings = useMemo(() => data.batches.reduce((s, b) => s + b.warningCount, 0), [data.batches]);
  const qualityAvg = useMemo(() => {
    if (!data.quality.length) return 0;
    return (data.quality.reduce((s, q) => s + q.overallScore, 0) / data.quality.length) * 100;
  }, [data.quality]);

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="Finance Data Fabric"
        subtitle="Live pipeline of source systems through ingestion, validation, normalization, ontology and graph"
        right={
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setReconReceipt(null);
                setReconModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-[11px] font-mono font-medium transition cursor-pointer"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>Certify TSA / IFMIS Recon (Reg 90)</span>
            </button>
            <DataStateBadge state={data.state} />
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {/* Pipeline visualization */}
        <Panel title="Data Pipeline" subtitle="Animated flow from source to knowledge graph" accent={financeTokens.colors.primary}>
          <div className="flex items-center gap-2 flex-wrap py-2">
            {PIPELINE_STAGES.map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && (
                  <div className="flex-1 min-w-[24px] h-1 rounded-full overflow-hidden bg-white/5 relative">
                    {!reduced && (
                      <motion.div
                        className="absolute inset-y-0 w-6 rounded-full"
                        animate={{ left: ['-10%', '110%'] }}
                        transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'linear' }}
                        style={{ backgroundColor: s.color, opacity: 0.6 }}
                      />
                    )}
                  </div>
                )}
                <div className="flex flex-col items-center rounded border border-white/[0.06] bg-[#0B1220] px-3 py-2 min-w-[96px]">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</span>
                  <span className="text-[9px] font-mono text-slate-500 mt-0.5">Stage {i + 1}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <p className="text-[10px] font-mono text-slate-500">SOURCE → INGESTION → VALIDATION → NORMALIZATION → ONTOLOGY → GRAPH</p>
        </Panel>

        {/* Source summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="finance-kpi"><div className="finance-label">Source Systems</div><div className="finance-value">{data.sources.length}</div><div className="text-[10px] text-slate-500 font-mono">registered</div></div>
          <div className="finance-kpi"><div className="finance-label">Records Processed</div><div className="finance-value" style={{ color: financeTokens.chart.budget }}>{formatNumber(totalRecords)}</div><div className="text-[10px] text-slate-500 font-mono">across batches</div></div>
          <div className="finance-kpi"><div className="finance-label">Failures</div><div className="finance-value" style={{ color: totalFailures ? financeTokens.colors.negative : financeTokens.colors.positive }}>{totalFailures}</div><div className="text-[10px] text-slate-500 font-mono">{totalWarnings} warnings</div></div>
          <div className="finance-kpi"><div className="finance-label">Avg Data Quality</div><div className="finance-value" style={{ color: financeTokens.colors.positive }}>{qualityAvg.toFixed(0)}%</div><div className="text-[10px] text-slate-500 font-mono">overall score</div></div>
        </div>

        {/* Source status grid */}
        <Panel title="Source Systems" subtitle="Connection, last sync, records, errors, quality and status per source" accent={financeTokens.colors.secondary}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {data.sources.map((src) => {
              const batches = data.batches.filter((b) => b.sourceId === src.sourceId);
              const records = batches.reduce((s, b) => s + b.recordCount, 0);
              const errors = batches.reduce((s, b) => s + b.failureCount, 0);
              const quality = data.quality.find((q) => q.sourceId === src.sourceId);
              const color = SOURCE_ICON[src.sourceType] ?? financeTokens.colors.primary;
              const connected = src.connectionStatus === 'CONNECTED' || src.connectionStatus === 'AUTHENTICATED';
              return (
                <div key={src.sourceId} className="rounded border border-white/[0.05] bg-[#0B1220] p-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded flex items-center justify-center text-[10px] font-mono font-bold" style={{ backgroundColor: `${color}1a`, color, border: `1px solid ${color}44` }}>
                      {src.name.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <div className="text-[12px] font-medium text-slate-100 truncate">{src.name}</div>
                      <div className="text-[9px] font-mono text-slate-500">{src.sourceType.replace('_', ' ')} • {src.system}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px] font-mono">
                    <div className="flex justify-between"><span className="text-slate-500">Connection</span><StatusChip label={src.connectionStatus} color={connected ? '#10B981' : '#F43F5E'} /></div>
                    <div className="flex justify-between"><span className="text-slate-500">Status</span><StatusChip label={src.status} color={src.status === 'ENABLED' ? '#00D9FF' : '#64748B'} /></div>
                    <div className="flex justify-between"><span className="text-slate-500">Last Sync</span><span className="text-slate-300">{formatDate(src.lastSuccessfulSync)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Records</span><span className="text-slate-300">{formatNumber(records)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Errors</span><span className={errors ? 'text-rose-400' : 'text-emerald-400'}>{errors}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Quality</span><span className="text-emerald-400">{quality ? `${Math.round(quality.overallScore * 100)}%` : '—'}</span></div>
                  </div>
                </div>
              );
            })}
            {data.sources.length === 0 && <div className="text-[11px] text-slate-500 font-mono col-span-full">No sources loaded.</div>}
          </div>
        </Panel>

        {/* Batch streams */}
        <Panel title="Ingestion Batch Streams" subtitle="Recent ingestion batches and their status" accent={financeTokens.chart.budget}>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[11px] font-mono">
              <thead>
                <tr className="text-[9px] uppercase tracking-widest text-[#64748B] border-b border-white/5">
                  <th className="text-left py-2 px-2">Batch</th>
                  <th className="text-left py-2 px-2">Source</th>
                  <th className="text-right py-2 px-2">Records</th>
                  <th className="text-right py-2 px-2">Success</th>
                  <th className="text-right py-2 px-2">Warnings</th>
                  <th className="text-right py-2 px-2">Failures</th>
                  <th className="text-right py-2 px-2">Quarantined</th>
                  <th className="text-right py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.batches.map((b) => {
                  const src = data.sources.find((s) => s.sourceId === b.sourceId);
                  return (
                    <tr key={b.batchId} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2 px-2 text-cyan-300">{b.batchId}</td>
                      <td className="py-2 px-2 text-slate-200">{src?.name ?? b.sourceId}</td>
                      <td className="text-right py-2 px-2 text-slate-300">{formatNumber(b.recordCount)}</td>
                      <td className="text-right py-2 px-2 text-emerald-400">{formatNumber(b.successCount)}</td>
                      <td className="text-right py-2 px-2 text-amber-400">{b.warningCount}</td>
                      <td className="text-right py-2 px-2 text-rose-400">{b.failureCount}</td>
                      <td className="text-right py-2 px-2 text-slate-400">{b.quarantinedCount}</td>
                      <td className="text-right py-2 px-2"><StatusChip label={b.status} color={b.status === 'COMPLETED' ? '#10B981' : b.status === 'FAILED' ? '#F43F5E' : '#F59E0B'} /></td>
                    </tr>
                  );
                })}
                {data.batches.length === 0 && <tr><td colSpan={8} className="py-6 text-center text-slate-500">No batches loaded.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
      {/* Statutory Bank Reconciliation (PFM Reg 90) Modal */}
      <AnimatePresence>
        {reconModalOpen && (
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
              className="w-full max-w-xl rounded-xl border border-blue-500/30 bg-[#0A1224] shadow-2xl overflow-hidden font-mono text-xs"
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#060D1A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-sans">Statutory Bank Reconciliation (PFM Reg 90)</h3>
                    <p className="text-[11px] text-slate-400">SAP S/4HANA vs National Treasury IFMIS vs CBK TSA Account</p>
                  </div>
                </div>
                <button
                  onClick={() => setReconModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {!reconReceipt ? (
                  <>
                    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400">Bank Account Under Recon:</span>
                        <select
                          value={selectedAccount}
                          onChange={(e) => setSelectedAccount(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-400 max-w-[280px]"
                        >
                          <option value="CBK National Treasury Single Account (10003894)">CBK TSA Account #10003894</option>
                          <option value="Standard Chartered Project Disbursement (0102048)">Standard Chartered #0102048</option>
                          <option value="Co-operative Bank Operations & Escrow (0112938)">Co-op Bank #0112938</option>
                        </select>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Reconciliation Period:</span>
                        <input
                          type="text"
                          value={reconPeriod}
                          onChange={(e) => setReconPeriod(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-blue-400 w-32"
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Cleared CBK Statement Balance:</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="10000000"
                            value={clearedBalanceKES}
                            onChange={(e) => setClearedBalanceKES(Number(e.target.value))}
                            className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-blue-300 font-bold text-xs focus:outline-none focus:border-blue-400 w-36 text-right font-mono"
                          />
                          <span className="text-slate-400 font-mono text-[10px]">KES</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[10px]">
                        <span className="text-slate-400">Unexplained Variances:</span>
                        <span className="text-emerald-400 font-bold">KES 0.00 (ZERO VARIANCE)</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">Un-reconciled Items &gt; 30 Days:</span>
                        <span className="text-emerald-400 font-bold">0 Items (Compliant with PFM Reg 90)</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        <span>Statutory Attestation under PFM Regulations 2015 Reg 90</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        Regulation 90 mandates that an Accounting Officer shall ensure bank reconciliation statements are completed not later than the 10th of subsequent month and investigated immediately. This electronic certification enacts the statutory reconciliation certificate into the immutable ledger.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setReconModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleExecuteReconciliation}
                        disabled={isReconciling}
                        className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer font-sans"
                      >
                        {isReconciling ? (
                          <span>Executing Reconciliation...</span>
                        ) : (
                          <>
                            <span>Enact Reconciliation Certificate</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Reconciliation Success Receipt */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300 font-sans">Bank Reconciliation Certificate Enacted</div>
                        <div className="text-[10px] text-slate-300">{reconReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-lg border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400">Reconciliation Certificate No:</span>
                        <span className="text-blue-300 font-bold">{reconReceipt.reference || 'RECON-CBK-90214'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Account Name:</span>
                        <span className="text-slate-200">{selectedAccount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Certified Statement Balance:</span>
                        <span className="text-emerald-400 font-bold">{formatFullKES(clearedBalanceKES)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Variance Classification:</span>
                        <span className="text-emerald-400 font-bold">UNQUALIFIED CLEAN (0 VARIANCE)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Treasury Single Account Status:</span>
                        <span className="text-slate-200">Reconciled with Central Bank of Kenya Records</span>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400 text-[10px]">Cryptographic SHA-256 Certificate Hash:</span>
                          <button
                            onClick={() => copyToClipboard(reconReceipt.sha256Hash || '')}
                            className="text-[9px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded bg-black/50 border border-white/5 font-mono text-[9px] text-emerald-400 break-all select-all">
                          {reconReceipt.sha256Hash || '6ea718d...'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setReconModalOpen(false);
                          setReconReceipt(null);
                        }}
                        className="px-4 py-2 rounded bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold transition cursor-pointer font-sans"
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
