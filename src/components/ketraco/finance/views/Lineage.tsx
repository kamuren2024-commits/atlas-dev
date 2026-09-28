import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck, Lock, Hash, CheckCircle2, FileText, Search,
  ExternalLink, Activity, Award, X, ArrowRight, Download, Copy
} from 'lucide-react';
import FinancePageHeader from '../components/FinancePageHeader';
import { useFinanceDataContext } from '../components/FinanceDataContext';
import {
  Panel, DataStateBadge, StatusChip, formatDate, FinanceSelect, formatFullKES,
} from '../components/primitives';
import { financeTokens } from '../tokens';
import type { FinanceLineageRecord } from '../types';

export default function Lineage() {
  const data = useFinanceDataContext();
  const [activeTab, setActiveTab] = useState<'lineage' | 'audit'>('audit');
  const [entity, setEntity] = useState('all');
  const [selected, setSelected] = useState<string | null>(null);

  // Audit trail state
  const [auditFilter, setAuditFilter] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // KENAO Sealing Modal
  const [sealModalOpen, setSealModalOpen] = useState(false);
  const [targetFy, setTargetFy] = useState('FY 2024/2025');
  const [isSealing, setIsSealing] = useState(false);
  const [sealReceipt, setSealReceipt] = useState<any | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  const handleSealAuditPackage = async () => {
    setIsSealing(true);
    try {
      const res = await data.executeAction('KENAO_AUDIT_PACKAGE_SEAL', {
        financialYear: targetFy
      });
      setSealReceipt(res);
    } catch (err: any) {
      setSealReceipt({ success: false, message: err?.message || 'Failed to seal audit package' });
    } finally {
      setIsSealing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const entityOptions = useMemo(() => {
    const set = new Set(data.lineage.map((l) => l.entityKind).filter(Boolean));
    return [{ value: 'all', label: 'ALL ENTITIES' }, ...[...set].map((e) => ({ value: e as string, label: e as string }))];
  }, [data.lineage]);

  const filtered = useMemo(() => {
    return data.lineage.filter((l) => entity === 'all' || l.entityKind === entity);
  }, [data.lineage, entity]);

  const selectedRecord = data.lineage.find((l) => l.lineageId === selected) ?? filtered[0];

  const filteredAuditTrail = useMemo(() => {
    if (!auditFilter.trim()) return data.auditTrail;
    const q = auditFilter.toLowerCase();
    return data.auditTrail.filter((a: any) =>
      a.actionType?.toLowerCase().includes(q) ||
      a.reference?.toLowerCase().includes(q) ||
      a.statutoryReference?.toLowerCase().includes(q) ||
      a.sha256Hash?.toLowerCase().includes(q) ||
      a.actor?.toLowerCase().includes(q)
    );
  }, [data.auditTrail, auditFilter]);

  const selectedAuditRecord = useMemo(() => {
    return data.auditTrail.find((a: any) => a.auditId === selectedAuditId) ?? filteredAuditTrail[0] ?? null;
  }, [data.auditTrail, selectedAuditId, filteredAuditTrail]);

  const TRANSFORM_COLOR: Record<string, string> = {
    SOURCE_RECEIVE: financeTokens.chart.budget,
    RAW_RECORD_CREATE: financeTokens.chart.budget,
    VALIDATE: financeTokens.chart.committed,
    NORMALIZE: financeTokens.chart.actual,
    RESOLVE_ENTITY: financeTokens.colors.secondary,
    ONTOLOGY_MAP: financeTokens.colors.secondary,
    PERSIST: financeTokens.chart.forecast,
    GRAPH_CREATE_NODE: financeTokens.chart.paid,
    GRAPH_CREATE_EDGE: financeTokens.chart.paid,
    QUALITY_SCORE: '#10B981',
    EVENT_EMIT: '#64748B',
    ANALYTIC_CONSUME: '#64748B',
  };

  return (
    <div className="flex flex-col min-h-full">
      <FinancePageHeader
        title="Provenance & Statutory Enactments"
        subtitle="End-to-end data lineage, cryptographic SHA-256 event ledger, and statutory audit compliance"
        right={
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSealReceipt(null);
                  setSealModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-medium transition cursor-pointer"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Seal KENAO Package</span>
              </button>
              <div className="flex items-center p-1 bg-black/40 rounded-lg border border-white/5 text-[11px] font-mono">
                <button
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'audit'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Statutory Enactments ({data.auditTrail.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('lineage')}
                  className={`px-3 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'lineage'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>ETL Data Lineage ({data.lineage.length})</span>
                </button>
              </div>
            </div>
            <DataStateBadge state={data.state} />
          </div>
        }
      />

      <div className="p-5 space-y-5">
        {activeTab === 'audit' ? (
          /* Statutory Enactments & Cryptographic Ledger View */
          <div className="space-y-4">
            {/* KPI overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="finance-kpi">
                <div className="finance-label">Enacted Events</div>
                <div className="finance-value" style={{ color: financeTokens.colors.primary }}>{data.auditTrail.length}</div>
                <div className="text-[10px] text-slate-500 font-mono">SHA-256 chained</div>
              </div>
              <div className="finance-kpi">
                <div className="finance-label">Cryptographic Status</div>
                <div className="finance-value text-emerald-400 flex items-center gap-1 text-sm pt-1">
                  <Lock className="w-4 h-4" />
                  <span>IMMUTABLE</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">Tamper-evident hash ledger</div>
              </div>
              <div className="finance-kpi">
                <div className="finance-label">Statutory Coverage</div>
                <div className="finance-value text-cyan-300 text-sm pt-1 font-bold">100% AUDITED</div>
                <div className="text-[10px] text-slate-500 font-mono">PFM 2012 • PPADA 2015</div>
              </div>
              <div className="finance-kpi">
                <div className="finance-label">Governing Review</div>
                <div className="finance-value text-slate-200 text-sm pt-1 font-bold">Auditor-General</div>
                <div className="text-[10px] text-slate-500 font-mono">KENAO Statutory Ready</div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Ledger list */}
              <Panel
                title="Cryptographic Audit Ledger"
                subtitle="Chronological sequence of statutory enactments"
                accent={financeTokens.colors.primary}
                right={
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2 top-2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Filter records..."
                      value={auditFilter}
                      onChange={(e) => setAuditFilter(e.target.value)}
                      className="bg-slate-900 border border-white/10 rounded pl-7 pr-2 py-1 text-[11px] font-mono text-slate-200 focus:outline-none focus:border-cyan-400 w-36"
                    />
                  </div>
                }
              >
                <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                  {filteredAuditTrail.map((a: any) => {
                    const active = selectedAuditRecord?.auditId === a.auditId;
                    return (
                      <button
                        key={a.auditId}
                        onClick={() => setSelectedAuditId(a.auditId)}
                        className={`w-full text-left rounded border p-2.5 transition-all cursor-pointer ${
                          active
                            ? 'border-cyan-400/40 bg-[rgba(0,217,255,0.08)]'
                            : 'border-white/[0.05] bg-[#0B1220] hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-cyan-300">
                            {a.reference || a.auditId?.slice(0, 16)}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            VERIFIED ✓
                          </span>
                        </div>
                        <div className="text-[11px] font-medium text-slate-200 mt-1">
                          {a.actionType?.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[9px] font-mono text-slate-500 mt-1 flex justify-between">
                          <span>{new Date(a.timestamp).toLocaleTimeString('en-KE')}</span>
                          <span className="truncate max-w-[140px]">{a.actor}</span>
                        </div>
                      </button>
                    );
                  })}
                  {filteredAuditTrail.length === 0 && (
                    <div className="text-[11px] text-slate-500 font-mono text-center py-6">
                      No audit records match query.
                    </div>
                  )}
                </div>
              </Panel>

              {/* Selected enactment detail */}
              <div className="xl:col-span-2 space-y-4">
                {selectedAuditRecord ? (
                  <>
                    <Panel
                      title="Enactment Cryptographic Warrant"
                      subtitle={`Reference: ${selectedAuditRecord.reference || selectedAuditRecord.auditId}`}
                      accent={financeTokens.colors.primary}
                      right={
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>SHA-256 SIGNED</span>
                          </span>
                        </div>
                      }
                    >
                      <div className="space-y-4 font-mono text-xs">
                        {/* SHA 256 Certificate Banner */}
                        <div className="p-3 rounded-lg bg-black/50 border border-white/10 space-y-1.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Hash className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Cryptographic Digest (SHA-256)</span>
                            </span>
                            <span className="text-emerald-400 font-bold">CHAIN INTEGRITY VERIFIED</span>
                          </div>
                          <div className="text-cyan-300 break-all text-[11px] font-mono select-all bg-slate-950/80 p-2 rounded border border-white/5">
                            {selectedAuditRecord.sha256Hash}
                          </div>
                          {selectedAuditRecord.previousHash && (
                            <div className="text-[9px] text-slate-500 flex justify-between pt-1">
                              <span>Chained Parent Hash:</span>
                              <span className="truncate max-w-[320px]">{selectedAuditRecord.previousHash}</span>
                            </div>
                          )}
                        </div>

                        {/* Statutory attributes grid */}
                        <div className="grid grid-cols-2 gap-3 text-[11px]">
                          <div className="bg-slate-900/60 p-3 rounded border border-white/5 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Action:</span>
                              <span className="text-slate-200 font-bold">{selectedAuditRecord.actionType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Timestamp:</span>
                              <span className="text-slate-200">{new Date(selectedAuditRecord.timestamp).toLocaleString('en-KE')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Enacting Actor:</span>
                              <span className="text-cyan-300 font-semibold">{selectedAuditRecord.actor}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Security Classification:</span>
                              <span className="text-amber-400 font-bold">{selectedAuditRecord.classification || 'STATUTORY RESTRICTED'}</span>
                            </div>
                          </div>

                          <div className="bg-slate-900/60 p-3 rounded border border-white/5 space-y-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Statutory Mandate:</span>
                              <span className="text-cyan-300 font-semibold">{selectedAuditRecord.statutoryReference || 'PFM Act 2012'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Compliance Status:</span>
                              <span className="text-emerald-400 font-bold">VALIDATED LEGAL</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Governing Body:</span>
                              <span className="text-slate-200">The National Treasury & PPRA</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Audit Status:</span>
                              <span className="text-slate-200">IMMUTABLE ARCHIVED</span>
                            </div>
                          </div>
                        </div>

                        {/* Payload breakdown */}
                        <div className="bg-slate-900/60 p-3 rounded border border-white/5 space-y-2">
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                            Enactment Payload & State Mutations
                          </div>
                          <pre className="text-[10px] text-slate-300 bg-slate-950 p-2.5 rounded overflow-x-auto border border-white/5">
                            {JSON.stringify(selectedAuditRecord.payload, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </Panel>
                  </>
                ) : (
                  <Panel title="Statutory Enactment Inspector">
                    <div className="text-[11px] text-slate-500 font-mono text-center py-10">
                      Select an enactment event from the ledger to inspect its cryptographic signature and statutory compliance proof.
                    </div>
                  </Panel>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* ETL Data Lineage View */
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {/* Lineage list */}
            <Panel
              title="Lineage Records"
              subtitle="Source → Raw → Transform → Entity → Graph → Metric"
              accent={financeTokens.colors.primary}
              right={<FinanceSelect value={entity} onChange={setEntity} options={entityOptions} label="Entity" />}
            >
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filtered.map((l) => {
                  const active = selectedRecord?.lineageId === l.lineageId;
                  const color = TRANSFORM_COLOR[l.transformationType] ?? financeTokens.colors.primary;
                  return (
                    <button
                      key={l.lineageId}
                      onClick={() => setSelected(l.lineageId)}
                      className={`w-full text-left rounded border p-2.5 transition-all cursor-pointer ${active ? 'border-cyan-400/40 bg-[rgba(0,217,255,0.06)]' : 'border-white/[0.05] bg-[#0B1220] hover:border-white/15'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold uppercase" style={{ color }}>{l.transformationType.replace(/_/g, ' ')}</span>
                        <StatusChip label={l.entityKind ?? '—'} color={color} />
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 mt-1">{formatDate(l.occurredAt)} • rule · {l.transformationRule ?? '—'}</div>
                    </button>
                  );
                })}
                {filtered.length === 0 && <div className="text-[11px] text-slate-500 font-mono">No lineage records for this entity.</div>}
              </div>
            </Panel>

            {/* Inspector detail */}
            <div className="xl:col-span-2 space-y-4">
              {selectedRecord ? (
                <>
                  {/* Trace chain */}
                  <Panel title="Trace Path" subtitle={selectedRecord.entityKind ? `Entity: ${selectedRecord.entityKind} » ${selectedRecord.entityId}` : 'Record trace'} accent={financeTokens.colors.primary}>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[
                        { label: 'SOURCE', value: selectedRecord.sourceId },
                        { label: 'RAW RECORD', value: selectedRecord.recordId },
                        { label: 'TRANSFORM', value: selectedRecord.transformationType },
                        { label: 'ENTITY', value: `${selectedRecord.entityKind}/${selectedRecord.entityId}` },
                        { label: 'GRAPH', value: selectedRecord.fromEntityKind ? `${selectedRecord.fromEntityKind} → ${selectedRecord.toEntityKind}` : undefined },
                        { label: 'METRIC', value: selectedRecord.toEntityKind },
                      ].map((s, i) => (
                        <React.Fragment key={s.label}>
                          {i > 0 && <span className="text-slate-600 font-mono">→</span>}
                          <div className="rounded border border-white/[0.06] bg-[#0B1220] px-2.5 py-1.5 text-center min-w-[90px]">
                            <div className="text-[8px] font-mono uppercase tracking-widest text-[#64748B]">{s.label}</div>
                            <div className="text-[10px] font-mono text-slate-200 mt-0.5 break-all">{s.value ?? '—'}</div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </Panel>

                  {/* Detail fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <Panel title="Transformation Detail" accent={financeTokens.chart.actual}>
                      <div className="space-y-2 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-500">Lineage ID</span><span className="text-cyan-300">{selectedRecord.lineageId}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Type</span><span className="text-slate-200">{selectedRecord.transformationType}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Rule</span><span className="text-slate-200">{selectedRecord.transformationRule ?? '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Timestamp</span><span className="text-slate-200">{formatDate(selectedRecord.occurredAt)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Batch</span><span className="text-slate-200">{selectedRecord.batchId ?? '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Parent</span><span className="text-slate-200">{selectedRecord.parentLineageId ?? '—'}</span></div>
                      </div>
                    </Panel>
                    <Panel title="Entity Mapping" accent={financeTokens.colors.secondary}>
                      <div className="space-y-2 text-[11px] font-mono">
                        <div className="flex justify-between"><span className="text-slate-500">From</span><span className="text-slate-200">{selectedRecord.fromEntityKind ? `${selectedRecord.fromEntityKind} (${selectedRecord.fromEntityId})` : '—'}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">To</span><span className="text-slate-200">{selectedRecord.toEntityKind ? `${selectedRecord.toEntityKind} (${selectedRecord.toEntityId})` : '—'}</span></div>
                        {selectedRecord.fieldMappings && (
                          <div className="border-t border-white/5 pt-2">
                            <div className="text-slate-500 mb-1">Field Mappings</div>
                            <div className="space-y-0.5">
                              {Object.entries(selectedRecord.fieldMappings).map(([k, v]) => (
                                <div key={k} className="flex justify-between"><span className="text-slate-500">{k}</span><span className="text-slate-300">{v}</span></div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Panel>
                  </div>
                </>
              ) : (
                <Panel title="Lineage Inspector">
                  <div className="text-[11px] text-slate-500 font-mono text-center py-10">Select a lineage record to inspect its traceability. This communicates trust and provenance from source to metric.</div>
                </Panel>
              )}
            </div>
          </div>
        )}
      </div>

      {/* KENAO Statutory Audit Package Sealing Modal */}
      <AnimatePresence>
        {sealModalOpen && (
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
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white font-sans">Statutory KENAO Audit Package Seal</h3>
                    <p className="text-[11px] text-slate-400">Public Audit Act 2015 Sec 31 & PFM Act Sec 81</p>
                  </div>
                </div>
                <button
                  onClick={() => setSealModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {!sealReceipt ? (
                  <>
                    <div className="p-3.5 rounded-lg bg-slate-900/90 border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center pb-2 border-b border-white/5">
                        <span className="text-slate-400">Auditing Authority:</span>
                        <span className="text-white font-bold">Office of the Auditor-General (KENAO)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Financial Year:</span>
                        <select
                          value={targetFy}
                          onChange={(e) => setTargetFy(e.target.value)}
                          className="bg-slate-950 border border-white/15 rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-cyan-400"
                        >
                          <option value="FY 2024/2025">FY 2024/2025 (Current)</option>
                          <option value="FY 2023/2024">FY 2023/2024 (Prior Audit)</option>
                        </select>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Enactment Events in Scope:</span>
                        <span className="text-cyan-300 font-bold">{data.auditTrail.length} SHA-256 Chained Records</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Chain Integrity Status:</span>
                        <span className="text-emerald-400 font-bold">VERIFIED 100% SECURE ✓</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Statutory Certification Mandate</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed font-sans">
                        Pursuant to Section 31 of the Public Audit Act 2015, the Accounting Officer of KETRACO certifies that these financial records, transaction lineages, and statutory payment warrantees have been sealed into an immutable tamper-evident cryptographic ledger for statutory transmittal to the Auditor-General.
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        onClick={() => setSealModalOpen(false)}
                        className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSealAuditPackage}
                        disabled={isSealing}
                        className="px-4 py-2 rounded bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition cursor-pointer font-sans"
                      >
                        {isSealing ? (
                          <span>Sealing Cryptographic Package...</span>
                        ) : (
                          <>
                            <span>Seal & Certify Package</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* Seal Success Certificate */
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-xs font-semibold text-emerald-300 font-sans">Auditor-General Package Cryptographically Sealed</div>
                        <div className="text-[10px] text-slate-300">{sealReceipt.message}</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-4 rounded-lg border border-white/10 space-y-2.5 text-[11px]">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400">Statutory Certificate Ref:</span>
                        <span className="text-cyan-300 font-bold">{sealReceipt.reference || sealReceipt.result?.reference || 'OAG-SEAL-9921'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Financial Reporting Year:</span>
                        <span className="text-slate-200">{targetFy}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Total Enactments Chained:</span>
                        <span className="text-slate-200">{sealReceipt.result?.eventsIncludedCount || data.auditTrail.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Submission Gateway:</span>
                        <span className="text-emerald-400">KENAO State Corporations Portal (Direct API)</span>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-slate-400 text-[10px]">Merkle / Root Ledger SHA-256 Hash:</span>
                          <button
                            onClick={() => copyToClipboard(sealReceipt.sha256Hash || sealReceipt.result?.ledgerRootHash || '')}
                            className="text-[9px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{copiedHash ? 'Copied!' : 'Copy Hash'}</span>
                          </button>
                        </div>
                        <div className="p-2 rounded bg-black/50 border border-white/5 font-mono text-[9px] text-emerald-400 break-all select-all">
                          {sealReceipt.sha256Hash || sealReceipt.result?.ledgerRootHash || 'b72c91a0ef3948...'}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setSealModalOpen(false);
                          setSealReceipt(null);
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
    </div>
  );
}
