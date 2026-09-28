import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, CheckCircle2, RefreshCw, 
  Layers, Database, FileText, Activity, Radio, ArrowUpRight, 
  Search, Filter, Sliders, ExternalLink, HelpCircle
} from 'lucide-react';
import { 
  GridDataQualitySummary, 
  EntityReconciliationReport, 
  SourceConflict,
  GridAsset
} from './types';
import ConfidenceBadge from './primitives/ConfidenceBadge';
import ProvenanceTag from './primitives/ProvenanceTag';

interface GridDataQualityPanelProps {
  summary: GridDataQualitySummary;
  reports: Record<string, EntityReconciliationReport>;
  conflicts: SourceConflict[];
  selectedAssetId: string | null;
  onSelectAsset: (assetId: string) => void;
  onClose?: () => void;
}

export default function GridDataQualityPanel({
  summary,
  reports,
  conflicts,
  selectedAssetId,
  onSelectAsset,
  onClose
}: GridDataQualityPanelProps) {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'RECONCILIATION_LEDGER' | 'SOURCE_CONFLICTS'>('SUMMARY');
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const reportList = Object.values(reports);

  const filteredReports = reportList.filter(rep => {
    const matchesSearch = rep.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          rep.canonicalId.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || rep.reconciliationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#070e1b] overflow-hidden select-none">
      
      {/* Header Bar */}
      <div className="p-3.5 bg-[#0d1728] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-500/40 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-mono font-bold text-white tracking-wider uppercase">
                NATIONAL GRID DATA QUALITY & RECONCILIATION ENGINE
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-black bg-cyan-950 border border-cyan-500/40 text-cyan-300">
                LOD-0 AUTONOMOUS
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Multi-Source Cross-Verification (SCADA/EMS, WAMS PMU, GIS PostGIS, SAP EAM, METEO)
            </span>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('SUMMARY')}
            className={`px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-all ${
              activeTab === 'SUMMARY'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            METRICS SUMMARY
          </button>
          <button
            onClick={() => setActiveTab('RECONCILIATION_LEDGER')}
            className={`px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'RECONCILIATION_LEDGER'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ASSET LEDGER
            <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[9px] text-cyan-300 font-mono">
              {summary.totalAssets}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('SOURCE_CONFLICTS')}
            className={`px-3 py-1 rounded text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
              activeTab === 'SOURCE_CONFLICTS'
                ? 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SOURCE CONFLICTS
            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[9px] text-rose-300 font-mono">
              {conflicts.length}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {activeTab === 'SUMMARY' && (
          <div className="space-y-4">
            
            {/* Top Row High-Level Confidence KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">TOTAL RECONCILED ASSETS</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">{summary.totalAssets}</span>
                  <span className="text-[11px] text-emerald-400 font-bold">100% Covered</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full w-full" />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider block">VERIFIED ASSETS (≥95%)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-emerald-400">{summary.verifiedCount}</span>
                  <span className="text-[11px] text-emerald-400 font-bold">{summary.verifiedPct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${summary.verifiedPct}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
                <span className="text-[10px] text-cyan-300 uppercase tracking-wider block">HIGH CONFIDENCE (85–94%)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-cyan-400">{summary.highConfidenceCount}</span>
                  <span className="text-[11px] text-cyan-400 font-bold">{summary.highConfidencePct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full" style={{ width: `${summary.highConfidencePct}%` }} />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                <span className="text-[10px] text-amber-300 uppercase tracking-wider block">UNDER REVIEW / DISCREPANCY</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-amber-400">{summary.reviewCount}</span>
                  <span className="text-[11px] text-amber-400 font-bold">{summary.reviewPct}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${summary.reviewPct}%` }} />
                </div>
              </div>
            </div>

            {/* Middle Section: Completeness & Association Triad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono">
              <div className="p-4 rounded-xl bg-[#0b1322] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    GIS Geodetic Completeness
                  </span>
                  <span className="text-sm font-bold text-cyan-400">{summary.gisCompletenessPct}%</span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                  Geodetic coordinates mapped to authoritative EPSG:4326 PostGIS substation polygon geometries.
                </p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full" style={{ width: `${summary.gisCompletenessPct}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1322] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    Topology Graph Completeness
                  </span>
                  <span className="text-sm font-bold text-indigo-400">{summary.topologyCompletenessPct}%</span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                  Substations with verified incoming and outgoing circuit connectivity across the 500kV/400kV/220kV grid.
                </p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: `${summary.topologyCompletenessPct}%` }} />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#0b1322] border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-400" />
                    Telemetry Stream Association
                  </span>
                  <span className="text-sm font-bold text-emerald-400">{summary.telemetryAssociationPct}%</span>
                </div>
                <p className="text-[10.5px] text-slate-400 font-sans leading-relaxed">
                  Active association of live SCADA telemetry and WAMS PMU phasors streaming at sub-second refresh rates.
                </p>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full" style={{ width: `${summary.telemetryAssociationPct}%` }} />
                </div>
              </div>
            </div>

            {/* Lower Callout: Provenance Protocol Audit */}
            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="font-bold text-slate-200 block">AUTHORITATIVE PROVENANCE PROTOCOL</span>
                <span className="text-slate-400 text-[10.5px]">
                  All grid entities maintain immutable pointers back to authoritative operational systems.
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <ProvenanceTag source="SCADA_EMS" />
                <ProvenanceTag source="WAMS_PMU" />
                <ProvenanceTag source="GIS_POSTGIS" />
                <ProvenanceTag source="EAM_SAP" />
              </div>
            </div>

          </div>
        )}

        {activeTab === 'RECONCILIATION_LEDGER' && (
          <div className="space-y-3 font-mono">
            {/* Search & Filter Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search asset name, code, or canonical ID..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 pl-8 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                <span className="text-slate-400">Filter Status:</span>
                {['ALL', 'VERIFIED', 'HIGH', 'REVIEW'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2 py-1 rounded border cursor-pointer ${
                      statusFilter === st
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Reconciliation Table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0f192b] text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Canonical ID & Asset</th>
                    <th className="p-3">Source Mappings</th>
                    <th className="p-3">Identity</th>
                    <th className="p-3">Spatial</th>
                    <th className="p-3">Topology</th>
                    <th className="p-3">Overall</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredReports.map((rep) => (
                    <tr 
                      key={rep.canonicalId}
                      className={`hover:bg-cyan-950/20 transition-colors ${
                        selectedAssetId === rep.canonicalId ? 'bg-cyan-950/30' : ''
                      }`}
                    >
                      <td className="p-3">
                        <span className="font-bold text-white block text-xs">{rep.name}</span>
                        <span className="text-[10px] text-slate-400">{rep.canonicalId}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <span className={`px-1 rounded text-[9px] font-bold ${rep.sourceMatchBreakdown.scadaMatched ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-slate-900 text-slate-600'}`}>SCD</span>
                          <span className={`px-1 rounded text-[9px] font-bold ${rep.sourceMatchBreakdown.gisMatched ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/30' : 'bg-slate-900 text-slate-600'}`}>GIS</span>
                          <span className={`px-1 rounded text-[9px] font-bold ${rep.sourceMatchBreakdown.eamMatched ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' : 'bg-slate-900 text-slate-600'}`}>EAM</span>
                          <span className={`px-1 rounded text-[9px] font-bold ${rep.sourceMatchBreakdown.pmuMatched ? 'bg-purple-950 text-purple-300 border border-purple-500/30' : 'bg-slate-900 text-slate-600'}`}>PMU</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 font-bold">{rep.identityConfidence}%</td>
                      <td className="p-3 text-slate-300 font-bold">{rep.spatialConfidence}%</td>
                      <td className="p-3 text-slate-300 font-bold">{rep.topologyConfidence}%</td>
                      <td className="p-3 font-bold text-cyan-400">{rep.overallConfidence}%</td>
                      <td className="p-3">
                        <ConfidenceBadge status={rep.reconciliationStatus} score={rep.overallConfidence} size="sm" />
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onSelectAsset(rep.canonicalId)}
                          className="px-2 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30 text-[10px] cursor-pointer transition-all"
                        >
                          Focus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {activeTab === 'SOURCE_CONFLICTS' && (
          <div className="space-y-3 font-mono">
            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs text-rose-300">
              <strong>Multi-Source Dispute Resolution Engine:</strong> Automatic conflict detection comparing SCADA/EMS real-time state, GIS topology status, and SAP EAM work registers.
            </div>

            <div className="space-y-3">
              {conflicts.map((conf) => (
                <div key={conf.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-white text-xs">{conf.assetName}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300">
                        PARAM: {conf.parameter}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-bold ${
                      conf.resolutionStatus === 'RESOLVED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-950 text-amber-300 border border-amber-500/40 animate-pulse'
                    }`}>
                      {conf.resolutionStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {conf.conflictDescription}
                  </p>

                  {/* Multi-Source Comparison Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {conf.sources.map((s, idx) => (
                      <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-cyan-400 font-bold">{s.source}</span>
                          <span className="text-slate-500 font-mono">Rank #{s.authorityRank}</span>
                        </div>
                        <span className="font-bold text-white block">{s.value}</span>
                        <span className="text-[9.5px] text-slate-500 block">{s.timestamp}</span>
                      </div>
                    ))}
                  </div>

                  {conf.activeResolution && (
                    <div className="p-2.5 rounded bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200">
                      <strong>Resolution Arbitrator:</strong> {conf.activeResolution}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
