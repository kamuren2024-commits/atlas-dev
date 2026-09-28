import React, { useState, useMemo } from 'react';
import EvaluationOSHeader from './EvaluationOSHeader';
import EvaluationLifecyclePanel from './EvaluationLifecyclePanel';
import EvaluationWorkspaceTable from './EvaluationWorkspaceTable';
import LegalProceduralBasisPanel from './LegalProceduralBasisPanel';
import AuditEventStreamPanel from './AuditEventStreamPanel';
import EvidenceLineagePanel from './EvidenceLineagePanel';
import AIGovernancePanel from './AIGovernancePanel';
import UnauthorizedActionModal from './UnauthorizedActionModal';
import GovernmentReadinessModal from './GovernmentReadinessModal';
import { EvaluationTableRow } from './types';
import { useEvaluationData } from './useEvaluationData';

// Sub-components from existing enterprise-evaluation engine preserved for deep inspection
import { EvidenceGraph } from '../enterprise-evaluation/EvidenceGraph';
import { RuleEngineView } from '../enterprise-evaluation/RuleEngineView';
import { AuditLogView } from '../enterprise-evaluation/AuditLogView';
import { X, FileText, Download, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

interface EvaluationOSDashboardProps {
  onSelectContextTab?: (tab: string) => void;
  activeContextTab?: string;
  selectedTender?: any;
  selectedEvaluationId?: string;
  onSelectEvaluationId?: (id: string) => void;
}

export default function EvaluationOSDashboard({
  onSelectContextTab,
  activeContextTab = 'evaluation-os',
  selectedTender,
  selectedEvaluationId = 'EVAL-2026-0873',
  onSelectEvaluationId
}: EvaluationOSDashboardProps) {
  // Real data integration via useEvaluationData hook
  const {
    loading,
    error,
    refresh,
    activeTender,
    rows,
    stages,
    auditEvents,
    agents,
    findings,
    submitScore,
    requestClarification,
    generateReport
  } = useEvaluationData({
    tenderOverride: selectedTender ? {
      id: selectedTender.id,
      refNumber: selectedTender.refNumber || selectedTender.tenderNo || selectedTender.id,
      title: selectedTender.title,
      category: selectedTender.category,
      estimatedValue: selectedTender.budget ? `KES ${(selectedTender.budget / 1_000_000).toFixed(1)}M` : selectedTender.estimatedValue,
      status: selectedTender.status,
      stage: selectedTender.stage || 'Technical Evaluation'
    } : undefined,
    evaluationIdOverride: selectedEvaluationId
  });

  const [currentStageNumber, setCurrentStageNumber] = useState<number>(5);
  const [selectedRowId, setSelectedRowId] = useState<string>('ROW-001');

  // Interactive Inspection Modals
  const [activeSpecializedModal, setActiveSpecializedModal] = useState<
    'graph' | 'ai' | 'audit' | 'report' | null
  >(null);

  // Report Modal Live Data
  const [selectedReportType, setSelectedReportType] = useState<string>('scm08');
  const [reportLoading, setReportLoading] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);

  // Security enforcement state
  const [unauthorizedModal, setUnauthorizedModal] = useState<{
    isOpen: boolean;
    actionName?: string;
    reason?: string;
  }>({ isOpen: false });

  // Government Readiness Hub State
  const [isGovModalOpen, setIsGovModalOpen] = useState(false);

  // In-app Report Export Notification State
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const selectedRow = useMemo(() => {
    return rows.find(r => r.id === selectedRowId) || rows[0];
  }, [rows, selectedRowId]);

  const handleTriggerUnauthorized = (actionName: string, reason: string) => {
    setUnauthorizedModal({
      isOpen: true,
      actionName,
      reason
    });
  };

  const handleExportReport = async () => {
    setActiveSpecializedModal('report');
    setReportLoading(true);
    try {
      const data = await generateReport('scm08');
      setReportData(data);
    } catch (e) {
      console.warn('Report fetch notice:', e);
    } finally {
      setReportLoading(false);
    }
  };

  const handleReportTypeChange = async (type: string) => {
    setSelectedReportType(type);
    setReportLoading(true);
    try {
      const data = await generateReport(type);
      setReportData(data);
    } catch (e) {
      console.warn('Report fetch notice:', e);
    } finally {
      setReportLoading(false);
    }
  };

  const handleExecuteExport = () => {
    if (!reportData) return;
    const blob = new Blob([reportData.markdownText || JSON.stringify(reportData, null, 2)], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTender.refNumber.replace(/[^a-zA-Z0-9]/g, '_')}_${selectedReportType.toUpperCase()}_REPORT.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice(`Report [${reportData.title || selectedReportType.toUpperCase()}] downloaded with SHA-256 digital signature (${reportData.digitalSignature?.slice(0, 24)}...).`);
    setActiveSpecializedModal(null);
    setTimeout(() => {
      setExportNotice(null);
    }, 6000);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#06080f] text-slate-200 p-2 sm:p-4 space-y-5" id="evaluation-os-root">
      {/* Export notification banner */}
      {exportNotice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center justify-between shadow-lg shadow-black/40 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-mono">{exportNotice}</span>
          </div>
          <button
            onClick={() => setExportNotice(null)}
            className="text-emerald-400 hover:text-white cursor-pointer ml-3"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Evaluation OS Header Card + Governance Status Bar */}
      <EvaluationOSHeader
        tenderId={activeTender.refNumber}
        evaluationId={activeTender.evaluationId}
        stageName={activeTender.stage}
        committeeCode={activeTender.committeeCode}
        activeContextTab={activeContextTab}
        onSelectContextTab={(tabId) => {
          if (onSelectContextTab) {
            onSelectContextTab(tabId);
          }
        }}
        onTriggerUnauthorized={handleTriggerUnauthorized}
        onOpenGovernmentReadiness={() => setIsGovModalOpen(true)}
      />

      {/* 2. Three-Panel Primary Grid: normal document flow without clipped content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[580px]">
        {/* Left Panel: Evaluation Lifecycle (3 cols on lg) */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col min-h-[480px]">
          <EvaluationLifecyclePanel
            currentStageNumber={currentStageNumber}
            stages={stages}
            onSelectStage={(num) => setCurrentStageNumber(num)}
          />
        </div>

        {/* Middle Panel: Evaluation Workspace (6 cols on lg) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col min-h-[480px]">
          <EvaluationWorkspaceTable
            rows={rows}
            selectedRowId={selectedRowId}
            loading={loading}
            error={error}
            onRetry={refresh}
            onSelectRow={(id) => setSelectedRowId(id)}
            onExportReport={handleExportReport}
            onViewAIDetails={() => setActiveSpecializedModal('ai')}
            onViewProvenanceGraph={() => setActiveSpecializedModal('graph')}
            onTriggerUnauthorized={handleTriggerUnauthorized}
            onSubmitScore={submitScore}
            onRequestClarification={requestClarification}
          />
        </div>

        {/* Right Panel: Legal & Procedural Basis (3 cols on lg) */}
        <div className="lg:col-span-3 xl:col-span-3 flex flex-col min-h-[480px]">
          <LegalProceduralBasisPanel
            selectedRow={selectedRow}
            onTriggerUnauthorized={handleTriggerUnauthorized}
          />
        </div>
      </div>

      {/* 3. Bottom Row: 3 Specialized Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[260px]">
        {/* Card 1: Audit Event Stream (5 cols) */}
        <div className="lg:col-span-5 flex flex-col min-h-[260px]">
          <AuditEventStreamPanel
            events={auditEvents}
            onViewAll={() => setActiveSpecializedModal('audit')}
          />
        </div>

        {/* Card 2: Evidence Lineage (4 cols) */}
        <div className="lg:col-span-4 flex flex-col min-h-[260px]">
          <EvidenceLineagePanel
            onViewFullGraph={() => setActiveSpecializedModal('graph')}
          />
        </div>

        {/* Card 3: AI Governance (3 cols) */}
        <div className="lg:col-span-3 flex flex-col min-h-[260px]">
          <AIGovernancePanel
            onInspectPolicy={() => setActiveSpecializedModal('ai')}
          />
        </div>
      </div>

      {/* Security Enforcement Modal */}
      <UnauthorizedActionModal
        isOpen={unauthorizedModal.isOpen}
        onClose={() => setUnauthorizedModal({ isOpen: false })}
        actionName={unauthorizedModal.actionName}
        reason={unauthorizedModal.reason}
      />

      {/* Government Procurement Governance & Statutory Audit Hub */}
      <GovernmentReadinessModal
        isOpen={isGovModalOpen}
        onClose={() => setIsGovModalOpen(false)}
        tenderId={activeTender.refNumber}
        evaluationId={activeTender.evaluationId}
        onExportNotice={(msg) => {
          setExportNotice(msg);
          setTimeout(() => setExportNotice(null), 6000);
        }}
      />

      {/* Specialized View Modal Drawers */}
      {activeSpecializedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-5xl max-h-[90vh] bg-[#0c1222] border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#090e1c] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    {activeSpecializedModal === 'graph' && 'Full Provenance & Evidence Graph'}
                    {activeSpecializedModal === 'ai' && 'Agentic AI Reasoning & Confidence Trace'}
                    {activeSpecializedModal === 'audit' && 'Comprehensive Statutory Audit Trail'}
                    {activeSpecializedModal === 'report' && 'Generate Statutory Evaluation Report'}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Tender: {activeTender.refNumber} • Evaluation ID: {activeTender.evaluationId} • Committee: {activeTender.committeeCode}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSpecializedModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#070b16]">
              {activeSpecializedModal === 'graph' && (
                <div className="h-[500px]">
                  <EvidenceGraph docId="DOC-2026-001" />
                </div>
              )}

              {activeSpecializedModal === 'ai' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 text-xs text-slate-300 space-y-2">
                    <h4 className="font-bold text-cyan-300 uppercase font-mono text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Autonomous Technical Evaluation Trace
                    </h4>
                    <p className="leading-relaxed">
                      Agent <strong>PPADA Section 79 Evaluation Agent</strong> extracted 42 requirements from the Tender Document and mapped them against <strong>DOC-2026-001 ({selectedRow.bidderName})</strong>.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Cosine Similarity:</span>
                        <span className="text-cyan-400 font-bold">0.962</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">OCR Character Accuracy:</span>
                        <span className="text-emerald-400 font-bold">99.8%</span>
                      </div>
                      <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400 block">Collusion Risk Score:</span>
                        <span className="text-emerald-400 font-bold">0.02 (Minimal)</span>
                      </div>
                    </div>
                  </div>
                  <RuleEngineView />
                </div>
              )}

              {activeSpecializedModal === 'audit' && (
                <div className="h-[500px] overflow-hidden">
                  <AuditLogView />
                </div>
              )}

              {activeSpecializedModal === 'report' && (
                <div className="space-y-4 text-xs">
                  {/* Report Type Selector Tabs */}
                  <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                    {[
                      { id: 'scm08', label: 'PPRA Form SCM-08' },
                      { id: 'technical', label: 'Technical Evaluation Report' },
                      { id: 'audit-package', label: 'Cryptographic Audit Package' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleReportTypeChange(tab.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          selectedReportType === tab.id
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(0,225,255,0.15)]'
                            : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {reportLoading ? (
                    <div className="p-12 text-center text-slate-400 space-y-2">
                      <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="font-mono text-xs">Generating statutory report & computing cryptographic seals...</p>
                    </div>
                  ) : reportData ? (
                    <div className="space-y-4">
                      {/* Certified Header Banner */}
                      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <h4 className="font-bold text-white text-sm">
                              {reportData.title}
                            </h4>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-1">
                            Ref: {reportData.procurementReference} • Authority: {reportData.procuringEntity}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                            DIGITALLY SEALED
                          </span>
                          <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate max-w-[220px]" title={reportData.digitalSignature}>
                            {reportData.digitalSignature?.slice(0, 28)}...
                          </div>
                        </div>
                      </div>

                      {/* Report Content Preview Box */}
                      <div className="bg-[#050811] border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 max-h-[340px] overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                        {reportData.markdownText}
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                        <span className="text-slate-500 font-mono text-[11px]">
                          Generated: {new Date(reportData.generatedAt).toLocaleString()}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveSpecializedModal(null)}
                            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold cursor-pointer text-xs"
                          >
                            Close
                          </button>
                          <button
                            type="button"
                            onClick={handleExecuteExport}
                            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 cursor-pointer shadow-[0_0_12px_rgba(0,225,255,0.3)] text-xs"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download Certified Document (.md)</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
