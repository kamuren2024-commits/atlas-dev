import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, Scale, ShieldCheck, ScrollText, HardDrive, 
  Download, RefreshCw, Eye, AlertTriangle, CheckCircle2, 
  Search, BookOpen, MessageSquare, UserCheck, ShieldAlert, 
  Clock, ChevronRight, Lock, AlertCircle, FileText, Send, 
  Sparkles, Sliders, Info, Check, Trash2, Upload, FileCheck, 
  X, HelpCircle, Save, Plus, ChevronDown, ChevronUp, FileSignature
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Type definitions for the Evaluation OS
interface PipelineStage {
  name: string;
  status: 'Pending' | 'Running' | 'Completed' | 'Failed';
  duration: string;
  confidence: number;
}

interface MetadataField {
  label: string;
  value: string;
  confidence: number;
  key: string;
}

interface RequirementRule {
  id: string;
  requirement: string;
  status: 'PASS' | 'FAIL' | 'PENDING' | 'NOT FOUND';
  evidence: string;
  confidence: number;
  comment: string;
}

interface TimelineEvent {
  time: string;
  stage: string;
  status: string;
  duration: string;
}

interface EvalDocument {
  id: string;
  name: string;
  bidderId: string;
  category: string;
  size: string;
  uploadTime: string;
  progress: number;
  status: 'Completed' | 'Processing' | 'Failed' | 'Queued' | 'Uploaded';
  extractedText: string;
  metadata: MetadataField[];
  requirements: RequirementRule[];
  officerNotes: string;
  versionHistory: string[];
  overridesLog: string[];
  pipelineStages: PipelineStage[];
  recommendation: {
    status: 'Responsive' | 'Non-Responsive' | 'Pending Review';
    confidence: number;
    reasons: string[];
    approvedByOfficer: boolean;
  };
  timelineEvents: TimelineEvent[];
}

interface Bidder {
  id: string;
  name: string;
  overallStatus: 'Approved' | 'Rejected' | 'Pending Review' | 'Processing';
  complianceScore: number;
}

// 8 Stages of the AI Processing Pipeline
const PIPELINE_STAGE_NAMES = [
  'Document detection',
  'OCR',
  'Text cleanup',
  'Document classification',
  'Field extraction',
  'Requirement matching',
  'Compliance validation',
  'Evaluation indexing'
];

export default function TenderEvaluationWorkspace() {
  // Bidders State
  const [bidders, setBidders] = useState<Bidder[]>([]);
  const [selectedBidderId, setSelectedBidderId] = useState<string>('shanghai');

  // Pre-configured default documents database
  const [documents, setDocuments] = useState<EvalDocument[]>([]);

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showAuditPanel, setShowAuditPanel] = useState<boolean>(false);

  // Phase 3 States
  const [showAgentsPanel, setShowAgentsPanel] = useState<boolean>(false);
  const [showBenchmarkPanel, setShowBenchmarkPanel] = useState<boolean>(false);
  const [benchmarkScore, setBenchmarkScore] = useState<number>(97);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<any[]>([]);
  const [crossDocAnalysis, setCrossDocAnalysis] = useState<any>(null);
  const [selectedAgentIndex, setSelectedAgentIndex] = useState<number>(0);

  // Simulation Stream
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);
  const simulationTerminalRef = useRef<HTMLDivElement>(null);

  // Sync state with backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resBidders, resDocs, resAudit] = await Promise.all([
          fetch('/api/evaluation/bidders').then(r => r.json()),
          fetch('/api/evaluation/documents').then(r => r.json()),
          fetch('/api/evaluation/audit').then(r => r.json())
        ]);

        if (resBidders.success) {
          setBidders(resBidders.bidders);
        }
        if (resDocs.success) {
          setDocuments(resDocs.documents);
        }
        if (resAudit.success) {
          setAuditLogs(resAudit.auditLogs);
        }
      } catch (err) {
        console.warn('API sync offline or slow, keeping current UI state.', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Benchmark & Cross-Doc analysis
  useEffect(() => {
    const fetchBenchmarkAndCrossDoc = async () => {
      try {
        const resBench = await fetch('/api/evaluation/benchmark').then(r => r.json());
        if (resBench.success) {
          setBenchmarkScore(resBench.overallScore);
          setBenchmarkMetrics(resBench.metrics);
        }
        
        if (selectedBidderId) {
          const resCross = await fetch(`/api/evaluation/cross-doc/${selectedBidderId}`).then(r => r.json());
          if (resCross.success) {
            setCrossDocAnalysis(resCross.analysis);
          }
        }
      } catch (err) {
        console.error('Error fetching benchmark/cross-doc', err);
      }
    };
    
    fetchBenchmarkAndCrossDoc();
    const interval = setInterval(fetchBenchmarkAndCrossDoc, 3000);
    return () => clearInterval(interval);
  }, [selectedBidderId, documents]);

  const runEndToEndSimulation = async () => {
    setIsSimulating(true);
    setSimulationLogs(['Initializing Sandboxed Simulation Terminal...', 'Booting Agent Task Queue...']);
    setShowBenchmarkPanel(true); // Open the benchmark panel to show scorecard
    
    try {
      const response = await fetch('/api/evaluation/simulate', {
        method: 'POST'
      }).then(r => r.json());
      
      if (response.success) {
        let index = 0;
        const interval = setInterval(() => {
          if (index < response.logs.length) {
            setSimulationLogs(prev => [...prev, response.logs[index]]);
            index++;
            if (simulationTerminalRef.current) {
              simulationTerminalRef.current.scrollTop = simulationTerminalRef.current.scrollHeight;
            }
          } else {
            clearInterval(interval);
            setIsSimulating(false);
            setBidders(response.bidders);
            setDocuments(response.documents);
            setSelectedBidderId('shengli'); // Automatically switch to the simulated flawed bidder!
            setSimulationLogs(prev => [...prev, '🎉 Simulation finished! Auto-routing view to Shengli Power Lines Consortium.']);
          }
        }, 300);
      } else {
        setSimulationLogs(prev => [...prev, `❌ Error: ${response.error || 'Failed to execute simulation'}`]);
        setIsSimulating(false);
      }
    } catch (err: any) {
      setSimulationLogs(prev => [...prev, `❌ Exception: ${err.message || 'Simulate request aborted'}`]);
      setIsSimulating(false);
    }
  };

  // Selected Active Document for viewer state
  const bidderDocs = documents.filter(doc => doc.bidderId === selectedBidderId);
  const [selectedDocId, setSelectedDocId] = useState<string>(bidderDocs[0]?.id || '');
  const selectedDoc = documents.find(doc => doc.id === selectedDocId);

  // Search filter for queue
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dropdown states for category overrides
  const [overrideCategory, setOverrideCategory] = useState<string>('');

  // Collapse sections of Center viewer
  const [collapsedSections, setCollapsedSections] = useState({
    preview: false,
    metadata: false,
    requirements: false,
    notes: false,
    history: false
  });

  // Export overlay state
  const [exportModalContent, setExportModalContent] = useState<{
    format: string;
    show: boolean;
    data: string;
  } | null>(null);

  // Form note addition input
  const [newNoteText, setNewNoteText] = useState<string>('');

  // Knowledge Library Toggle Drawer
  const [libraryOpen, setLibraryOpen] = useState<boolean>(false);
  const [libraryQuery, setLibraryQuery] = useState<string>('Section 80');

  // Derive isProcessingBatch from documents list
  const isProcessingBatch = documents.some(d => d.bidderId === selectedBidderId && d.status === 'Processing');

  // Synchronize first available document of current bidder
  useEffect(() => {
    const currentBidderDocs = documents.filter(d => d.bidderId === selectedBidderId);
    if (currentBidderDocs.length > 0) {
      // Find the first or keep existing if matches selected bidder
      const alreadyMatches = currentBidderDocs.some(d => d.id === selectedDocId);
      if (!alreadyMatches) {
        setSelectedDocId(currentBidderDocs[0].id);
      }
    } else {
      setSelectedDocId('');
    }
  }, [selectedBidderId, documents]);

  // Drag and Drop simulation states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Process selected file via backend API upload
  const ingestFile = async (fileName: string, fileSize: string, customCategory?: string) => {
    try {
      const res = await fetch('/api/evaluation/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: fileName, size: fileSize, bidderId: selectedBidderId, category: customCategory })
      }).then(r => r.json());

      if (res.success) {
        setDocuments(res.documents);
        setBidders(res.bidders);
        setSelectedDocId(res.document.id);
      }
    } catch (err) {
      console.error('Error uploading file', err);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files) as File[];
      filesArray.forEach(f => {
        ingestFile(f.name, `${(f.size / (1024 * 1024)).toFixed(1)} MB`);
      });
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files) as File[];
      filesArray.forEach(f => {
        ingestFile(f.name, `${(f.size / (1024 * 1024)).toFixed(1)} MB`);
      });
    }
  };

  // Handle single action overrides via backend
  const handleClassificationOverride = async (newCat: string) => {
    if (!selectedDoc) return;
    try {
      const res = await fetch('/api/evaluation/override/category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: selectedDoc.id, category: newCat })
      }).then(r => r.json());

      if (res.success) {
        setDocuments(res.documents);
        setBidders(res.bidders);
      }
    } catch (err) {
      console.error('Error overriding classification', err);
    }
    setOverrideCategory('');
  };

  const handleMetadataChange = async (key: string, newValue: string) => {
    if (!selectedDoc) return;
    // Optimistic UI update
    setDocuments(prev => prev.map(doc => {
      if (doc.id === selectedDoc.id) {
        const updatedMetadata = doc.metadata.map(f => f.key === key ? { ...f, value: newValue } : f);
        return { ...doc, metadata: updatedMetadata };
      }
      return doc;
    }));

    try {
      const res = await fetch('/api/evaluation/override/metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: selectedDoc.id, key, value: newValue })
      }).then(r => r.json());
      if (res.success) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error('Error changing metadata', err);
    }
  };

  const handleRequirementStatusChange = async (ruleId: string, newStatus: any) => {
    if (!selectedDoc) return;
    try {
      const res = await fetch('/api/evaluation/override/requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: selectedDoc.id, ruleId, status: newStatus })
      }).then(r => r.json());
      if (res.success) {
        setDocuments(res.documents);
        setBidders(res.bidders);
      }
    } catch (err) {
      console.error('Error changing requirement status', err);
    }
  };

  const handleRequirementCommentChange = async (ruleId: string, newComment: string) => {
    if (!selectedDoc) return;
    // Optimistic UI update
    setDocuments(prev => prev.map(doc => {
      if (doc.id === selectedDoc.id) {
        const updatedReqs = doc.requirements.map(r => r.id === ruleId ? { ...r, comment: newComment } : r);
        return { ...doc, requirements: updatedReqs };
      }
      return doc;
    }));

    try {
      await fetch('/api/evaluation/override/requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: selectedDoc.id, ruleId, status: selectedDoc.requirements.find(r => r.id === ruleId)?.status, comment: newComment })
      });
    } catch (err) {
      console.error('Error changing requirement comment', err);
    }
  };

  // Add Comment note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedDoc) return;

    const note = newNoteText;
    setNewNoteText('');

    try {
      const res = await fetch('/api/evaluation/document/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: selectedDoc.id, note })
      }).then(r => r.json());
      if (res.success) {
        setDocuments(prev => prev.map(d => d.id === selectedDoc.id ? res.document : d));
      }
    } catch (err) {
      console.error('Error adding note', err);
    }
  };

  // Approve recommendation toggle
  const toggleRecommendationApproval = async () => {
    if (!selectedDoc) return;
    const nextApproved = !selectedDoc.recommendation.approvedByOfficer;

    try {
      const res = await fetch('/api/evaluation/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId: selectedDoc.id, approved: nextApproved })
      }).then(r => r.json());
      if (res.success) {
        setDocuments(res.documents);
        setBidders(res.bidders);
      }
    } catch (err) {
      console.error('Error toggling approval', err);
    }
  };

  // Document management actions
  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to permanently delete this document from the Evaluation OS? This will erase all OCR text, metadata, and overrides.')) {
      try {
        const res = await fetch(`/api/evaluation/document/${docId}`, {
          method: 'DELETE'
        }).then(r => r.json());
        if (res.success) {
          setBidders(res.bidders);
          setDocuments(prev => prev.filter(d => d.id !== docId));
          if (selectedDocId === docId) {
            setSelectedDocId('');
          }
        }
      } catch (err) {
        console.error('Error deleting document', err);
      }
    }
  };

  const handleReplaceDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (fileInputRef.current) {
      fileInputRef.current.click();
      try {
        await fetch(`/api/evaluation/document/${docId}`, { method: 'DELETE' });
      } catch (err) {
        console.error('Error replacing document', err);
      }
    }
  };

  const handleRetryPipeline = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/evaluation/reprocess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ docId })
      }).then(r => r.json());
      if (res.success) {
        setDocuments(res.documents);
        setBidders(res.bidders);
      }
    } catch (err) {
      console.error('Error retrying pipeline', err);
    }
  };

  // Ingest sample document package shortcut
  const injectSampleDocuments = () => {
    ingestFile('Technical_Specifications_Conductor_v2.pdf', '4.2 MB', 'Technical Proposal');
    ingestFile('Corporate_Financial_Audit_2025.xlsx', '3.1 MB', 'Financial Proposal');
    ingestFile('Tax_Compliance_2026_KRA.pdf', '1.1 MB', 'Tax Compliance Certificate');
  };

  // Mock Export triggers
  const executeExport = (format: string) => {
    if (!selectedDoc) return;
    const formattedData = JSON.stringify({
      documentId: selectedDoc.id,
      documentName: selectedDoc.name,
      category: selectedDoc.category,
      bidder: selectedDoc.bidderId,
      metadata: selectedDoc.metadata,
      requirementsCompliance: selectedDoc.requirements,
      recommendation: selectedDoc.recommendation,
      officerNotes: selectedDoc.officerNotes,
      verificationTrailHash: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    }, null, 2);

    setExportModalContent({
      format,
      show: true,
      data: formattedData
    });
  };

  const downloadExportPackage = () => {
    if (!exportModalContent) return;
    const blob = new Blob([exportModalContent.data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedDoc?.name || 'eval'}_export_package.${exportModalContent.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setExportModalContent(null);
  };

  // Filter queue by search query
  const filteredDocs = bidderDocs.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" id="workspace-bids-evaluation">
      
      {/* HEADER: Progress overview & Bidder context selector */}
      <div className="bg-[#101626] border border-slate-800/80 p-5 rounded-2xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded-md font-bold uppercase tracking-wider animate-pulse">
              ● Evaluation OS v5.2 Active
            </span>
            <span className="p-1 px-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono rounded-md font-bold uppercase">
              PPADA Sec 80 Standard
            </span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            Analytical Bid Processing Workbench
            <Cpu className="w-4 h-4 text-emerald-400" />
          </h2>
          <p className="text-xs text-white/50">
            Intelligent compliance mapping, OCR metadata parsing, and human-in-the-loop recommendation approval.
          </p>
        </div>

        {/* Active Bidder Selection tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="bg-slate-950 p-1 border border-slate-800 rounded-xl flex gap-1 flex-1 sm:flex-initial">
            {bidders.map((b) => {
              const isSelected = selectedBidderId === b.id;
              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBidderId(b.id)}
                  className={`p-2 px-3.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 shadow-md'
                      : 'text-white/60 hover:text-white/90 hover:bg-white/[0.03]'
                  }`}
                  id={`bidder-tab-${b.id}`}
                >
                  <span>{b.name}</span>
                  <span className={`text-[9px] font-mono px-1 rounded ${
                    isSelected ? 'bg-slate-900/10 text-slate-900' : 'bg-white/10 text-white/40'
                  }`}>
                    {b.complianceScore}%
                  </span>
                </button>
              );
            })}
          </div>

          <button 
            onClick={() => setLibraryOpen(true)}
            className="flex items-center justify-center gap-1.5 p-2 px-3 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 text-white text-xs rounded-xl cursor-pointer transition-all shrink-0"
            id="btn-open-laws-library"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">PPADA Library</span>
          </button>

          <button 
            onClick={() => setShowAuditPanel(prev => !prev)}
            className={`flex items-center justify-center gap-1.5 p-2 px-3 border text-xs rounded-xl cursor-pointer transition-all shrink-0 ${
              showAuditPanel
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 font-semibold'
                : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 text-white'
            }`}
            id="btn-toggle-audit-trail"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Audit Trail</span>
          </button>

          <button 
            onClick={() => {
              setShowAgentsPanel(prev => !prev);
              setShowBenchmarkPanel(false);
            }}
            className={`flex items-center justify-center gap-1.5 p-2 px-3 border text-xs rounded-xl cursor-pointer transition-all shrink-0 ${
              showAgentsPanel
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/40 font-semibold'
                : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 text-white'
            }`}
            id="btn-toggle-agents"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Agent Diagnostics</span>
          </button>

          <button 
            onClick={() => {
              setShowBenchmarkPanel(prev => !prev);
              setShowAgentsPanel(false);
            }}
            className={`flex items-center justify-center gap-1.5 p-2 px-3 border text-xs rounded-xl cursor-pointer transition-all shrink-0 ${
              showBenchmarkPanel
                ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 font-semibold'
                : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/60 text-white'
            }`}
            id="btn-toggle-benchmark"
          >
            <Scale className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Benchmark Suite</span>
          </button>
        </div>
      </div>

      {/* Live Immutable Audit Trail Panel */}
      <AnimatePresence>
        {showAuditPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-950/95 border border-slate-800 p-5 rounded-2xl shadow-2xl space-y-3 overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">Immutable Evaluation Workflow Audit Log</h3>
              </div>
              <span className="text-[10px] font-mono text-white/35">Chained Registry Ledger active</span>
            </div>
            
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 font-mono text-xs">
              {auditLogs.length === 0 ? (
                <p className="text-white/35 italic py-4 text-center">No audit logs recorded yet in this session.</p>
              ) : (
                auditLogs.map((log) => (
                  <div key={log.id} className="p-2.5 bg-[#090d16] border border-slate-900 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-800/60 transition-all">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="p-0.5 px-1.5 bg-slate-900 text-[10px] font-bold rounded text-white/50 border border-slate-800">
                          {log.timestamp}
                        </span>
                        <span className={`p-0.5 px-1.5 text-[9.5px] font-bold rounded ${
                          log.action.includes('Override') || log.action.includes('Change') 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : log.action.includes('Approve') || log.action.includes('Confirm')
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {log.action}
                        </span>
                        {log.documentName && (
                          <span className="text-[10px] text-white/45 font-semibold">
                            ({log.documentName})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-white/70 leading-relaxed">{log.details}</p>
                    </div>
                    
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-500 block">COMMITTEE HASH</span>
                      <span className="text-[10.5px] font-semibold text-emerald-500/80 block select-all" title={log.signature}>
                        {log.signature.substring(0, 16)}...
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agentic Orchestration Dashboard */}
      <AnimatePresence>
        {showAgentsPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0b0f19] border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  Agentic Orchestration & AI Diagnostics Dashboard
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Live performance, calibrated decision confidence, and execution trace of the 12-stage procurement engine.
                </p>
              </div>
              <button 
                onClick={() => setShowAgentsPanel(false)}
                className="text-white/45 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedDoc ? (
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                
                {/* 12 Agents Flow Matrix Grid */}
                <div className="xl:col-span-8 space-y-3">
                  <span className="text-[9.5px] font-mono text-purple-400 uppercase tracking-widest block font-bold">
                    12-Stage Pipeline Diagnostics ({selectedDoc.name})
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedDoc.pipelineStages && selectedDoc.pipelineStages.length > 0 ? (
                      selectedDoc.pipelineStages.map((stage, idx) => {
                        const isSelected = selectedAgentIndex === idx;
                        return (
                          <div 
                            key={idx}
                            onClick={() => setSelectedAgentIndex(idx)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between h-[120px] ${
                              isSelected 
                                ? 'bg-purple-500/10 border-purple-400 shadow-md ring-1 ring-purple-500/30' 
                                : 'bg-slate-950/60 border-slate-850 hover:border-slate-700/80 hover:bg-slate-900/40'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex justify-between items-start">
                                <span className="text-[9px] font-mono text-white/40 font-bold uppercase">AGENT #{idx + 1}</span>
                                <span className={`text-[8.5px] font-mono font-bold p-0.5 px-1.5 rounded-full ${
                                  stage.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                  stage.status === 'Running' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                                  stage.status === 'Failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-white/5 text-white/30'
                                }`}>
                                  {stage.status}
                                </span>
                              </div>
                              <h4 className="text-[11px] font-bold text-white leading-tight">{stage.name}</h4>
                            </div>

                            <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-white/45">
                              <span>Latency: {stage.duration || '0s'}</span>
                              <span className="text-purple-400 font-bold">{stage.confidence || 0}% Conf.</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-white/45 italic col-span-3 py-6 text-center">
                        Execute pipeline or ingest a file to load 12-stage agent telemetry.
                      </p>
                    )}
                  </div>
                </div>

                {/* Selected Agent Debugger Terminal */}
                <div className="xl:col-span-4 bg-slate-950 border border-slate-850 rounded-xl p-4.5 flex flex-col justify-between h-full min-h-[380px] font-mono text-xs shadow-inner">
                  {selectedDoc.pipelineStages && selectedDoc.pipelineStages[selectedAgentIndex] ? (
                    (() => {
                      const agent = selectedDoc.pipelineStages[selectedAgentIndex];
                      return (
                        <div className="flex flex-col h-full justify-between space-y-4">
                          <div className="space-y-3.5">
                            <div className="flex justify-between items-center pb-2.5 border-b border-slate-900">
                              <span className="text-[10px] text-purple-400 font-bold">AGENT DIAGNOSTIC REPORT</span>
                              <span className="text-[9px] text-white/30">REF: S5-AG-{selectedAgentIndex + 1}</span>
                            </div>

                            <div className="space-y-1.5">
                              <span className="text-[9px] text-white/35 block uppercase">Agent Class</span>
                              <span className="text-white font-bold">{agent.name}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-white/[0.01] p-2.5 rounded-lg border border-white/[0.02]">
                              <div>
                                <span className="text-[8.5px] text-white/35 block uppercase">Raw Confidence</span>
                                <span className="text-[11px] text-white font-bold">{agent.rawConfidence || agent.confidence || 95}%</span>
                              </div>
                              <div>
                                <span className="text-[8.5px] text-white/35 block uppercase">Calibrated Score</span>
                                <span className="text-[11px] text-emerald-400 font-bold">{agent.adjustedConfidence || agent.confidence || 95}%</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[8.5px] text-white/35 block uppercase">Executed Input parameters</span>
                              <p className="text-[10.5px] text-white/70 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                                {agent.input || 'No data parameters received.'}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[8.5px] text-white/35 block uppercase">Generated Output & Verdict</span>
                              <p className="text-[10.5px] text-white/80 leading-relaxed bg-[#101626]/40 p-2 rounded-lg border border-slate-850">
                                {agent.output || 'No output compiled.'}
                              </p>
                            </div>

                            <div className="flex gap-4 text-[9px] pt-1">
                              <div>
                                <span className="text-white/30">SUPPORTING CITATIONS:</span>
                                <span className="ml-1 text-emerald-400 font-bold">{agent.supportingEvidenceCount || 0}</span>
                              </div>
                              <div>
                                <span className="text-white/30">MISSING CITATIONS:</span>
                                <span className="ml-1 text-red-400 font-bold">{agent.missingEvidenceCount || 0}</span>
                              </div>
                              <div>
                                <span className="text-white/30">OFFICER REVIEW:</span>
                                <span className={`ml-1 font-bold ${agent.humanReviewRequired ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {agent.humanReviewRequired ? 'REQUIRED' : 'PASSED'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2.5 border-t border-slate-900 text-[9px] text-white/35 flex justify-between items-center">
                            <span>SHIELD STATUS: ACTIVE</span>
                            <span>RETRIES: {agent.retries || 0}</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="h-full flex items-center justify-center text-white/30 text-center">
                      <p>Select an agent card to load diagnostic trace logs.</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl text-white/30">
                <Info className="w-8 h-8 mx-auto stroke-1 mb-2 text-white/20" />
                <p className="text-xs">Select any active document in the workspace queue to view its agent orchestration trace logs.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Benchmark Framework & Scorecard */}
      <AnimatePresence>
        {showBenchmarkPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0b0f19] border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6 overflow-hidden"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  Automated Bid Evaluation Benchmark Suite
                </h3>
                <p className="text-[11px] text-white/50 mt-0.5">
                  Factual accuracy, regulatory alignment, and computational latency scorecard measured across 20 validation parameters.
                </p>
              </div>
              <button 
                onClick={() => setShowBenchmarkPanel(false)}
                className="text-white/45 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              
              {/* Scorecard Radial Gauge */}
              <div className="xl:col-span-3 bg-slate-950/60 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                <span className="text-[9px] font-mono text-white/40 uppercase block tracking-widest font-bold">
                  SALIENCE ACCURACY SCORECARD
                </span>
                
                <div className="relative flex items-center justify-center my-6">
                  {/* Gauge Ring */}
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle 
                      cx="64" cy="64" r="54" 
                      className="stroke-slate-900 fill-none" 
                      strokeWidth="8"
                    />
                    <circle 
                      cx="64" cy="64" r="54" 
                      className="stroke-indigo-500 fill-none transition-all duration-1000" 
                      strokeWidth="8"
                      strokeDasharray={2 * Math.PI * 54}
                      strokeDashoffset={(2 * Math.PI * 54) * (1 - benchmarkScore / 100)}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-black text-white">{benchmarkScore}%</span>
                    <span className="text-[9.5px] font-mono text-emerald-400 font-bold">ACCURACY INDEX</span>
                  </div>
                </div>

                <div className="space-y-1.5 w-full pt-3 border-t border-slate-900">
                  <span className="text-[10px] text-white/60 block font-semibold">20/20 Checks Validated</span>
                  <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden w-full max-w-[160px] mx-auto">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${benchmarkScore}%` }} />
                  </div>
                </div>
              </div>

              {/* 20 Metrics Dashboard list */}
              <div className="xl:col-span-5 bg-slate-950/40 border border-slate-850 rounded-2xl p-4 flex flex-col">
                <span className="text-[9.5px] font-mono text-indigo-400 uppercase tracking-widest block font-bold mb-3">
                  Benchmark Suite Metrics (20 Parameters)
                </span>
                
                <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
                  {benchmarkMetrics.map((metric) => (
                    <div key={metric.id} className="p-2.5 bg-slate-950 border border-slate-850 rounded-xl hover:bg-slate-900/30 transition-all text-xs flex justify-between items-center gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            metric.status === 'PASS' ? 'bg-emerald-500' :
                            metric.status === 'WARNING' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                          }`} />
                          <span className="font-bold text-white">{metric.name}</span>
                        </div>
                        <p className="text-[10.5px] text-white/50 leading-relaxed">{metric.evidence}</p>
                        {metric.recommendedFix !== 'None' && (
                          <p className="text-[10px] text-amber-400 font-mono italic">Fix: {metric.recommendedFix}</p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold text-white block">{metric.score}/100</span>
                        <span className="text-[9px] font-mono text-white/40 block">{metric.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* One-Click Simulator Console */}
              <div className="xl:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-4.5 flex flex-col justify-between h-full min-h-[380px] shadow-inner">
                <div className="space-y-3 w-full">
                  <div className="flex justify-between items-center pb-2.5 border-b border-slate-900">
                    <span className="text-[10px] text-indigo-400 font-bold font-mono uppercase">Simulation Controller</span>
                    <span className="text-[9px] text-white/30 font-mono">SANDBOX ACTIVE</span>
                  </div>

                  <p className="text-xs text-white/60 leading-relaxed">
                    Trigger an end-to-end automated simulation sequence. This compiles a mock bidder consortium with 6 test files containing expired certifications, duplicate CR12 beneficiaries, and low bid bonds to test evaluation accuracy constraints.
                  </p>

                  <button
                    onClick={runEndToEndSimulation}
                    disabled={isSimulating}
                    className="w-full p-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-white/30 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md uppercase tracking-wider"
                  >
                    {isSimulating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Running Simulation Pipeline...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-slate-950" />
                        <span>Run End-to-End Simulation</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-4 flex-1 flex flex-col min-h-[160px] bg-black rounded-lg border border-slate-900 p-3 font-mono text-[10.5px]">
                  <span className="text-white/30 block border-b border-slate-900 pb-1 mb-2">SIMULATION TERMINAL FEEDBACK:</span>
                  <div 
                    ref={simulationTerminalRef}
                    className="flex-1 overflow-y-auto space-y-1.5 text-white/70 max-h-[140px] pr-1 leading-relaxed"
                  >
                    {simulationLogs.length === 0 ? (
                      <p className="text-white/20 italic">Awaiting simulation trigger...</p>
                    ) : (
                      simulationLogs.map((log, index) => (
                        <p key={index} className="whitespace-pre-wrap">{log}</p>
                      ))
                    )}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* THREE-COLUMN WORKSPACE CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[700px] items-stretch">
        
        {/* ================= LEFT COLUMN: UPLOAD QUEUE & FILE CONTROL (3 COLS) ================= */}
        <div className="lg:col-span-3 bg-[#0d1221] border border-slate-800/80 rounded-2xl flex flex-col h-[780px] shadow-lg">
          
          {/* Header & Ingest area */}
          <div className="p-4 border-b border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">Document Ingestion</span>
              <button 
                onClick={injectSampleDocuments}
                className="text-[9.5px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded hover:bg-indigo-500/20 transition-colors cursor-pointer"
                title="Batch upload preset test files instantly"
              >
                + Inject Samples
              </button>
            </div>

            {/* Drag & Drop Zone */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                isDragging 
                  ? 'border-emerald-500 bg-emerald-500/5 animate-pulse' 
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80'
              }`}
              id="drag-drop-ingestion-zone"
            >
              <Upload className="w-6 h-6 text-emerald-400/80" />
              <div>
                <span className="text-[11px] font-semibold text-white/95 block">Drag & drop files or click</span>
                <span className="text-[9px] text-white/40 block">ZIP, PDF, XLSX, CR12, Tax Compliance</span>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileInputChange} 
                multiple 
                className="hidden" 
              />
            </div>

            {/* Search Queue filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-white/30 absolute left-3 top-2.5" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter queue files..."
                className="w-full bg-slate-950/80 border border-slate-800 text-[11px] rounded-lg p-2 pl-8 text-white focus:outline-none focus:border-emerald-500/50"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2.5 text-white/45 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Live Document Queue list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <span className="text-[9.5px] font-mono text-white/45 uppercase tracking-wider block px-1">
              Active Upload Queue ({filteredDocs.length} files)
            </span>

            {filteredDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-white/30 space-y-2">
                <FileText className="w-8 h-8 stroke-1" />
                <p className="text-[10px]">No evaluation documents in queue for this bidder.</p>
              </div>
            ) : (
              filteredDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                const isFailed = doc.status === 'Failed';
                const isProcessing = doc.status === 'Processing';

                return (
                  <div 
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 flex flex-col justify-between ${
                      isSelected 
                        ? 'bg-emerald-500/5 border-emerald-500/40 shadow-sm' 
                        : 'bg-white/[0.01] border-slate-800/60 hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5 max-w-[80%]">
                        <strong className="text-[11.5px] font-semibold text-white/90 truncate block" title={doc.name}>
                          {doc.name}
                        </strong>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9.5px] font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-1 py-0.2 rounded leading-none shrink-0">
                            {doc.category}
                          </span>
                          <span className="text-[9px] font-mono text-white/35">
                            {doc.size}
                          </span>
                        </div>
                      </div>

                      {/* File Action triggers (Replace, Delete, Retry) */}
                      <div className="flex items-center gap-1">
                        {isFailed && (
                          <button 
                            onClick={(e) => handleRetryPipeline(doc.id, e)}
                            className="p-1 hover:bg-amber-500/10 text-amber-400 rounded transition-colors"
                            title="Retry Pipeline"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        )}
                        <button 
                          onClick={(e) => handleReplaceDocument(doc.id, e)}
                          className="p-1 hover:bg-white/5 text-white/45 hover:text-white/85 rounded transition-colors"
                          title="Replace Document"
                        >
                          <Upload className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteDocument(doc.id, e)}
                          className="p-1 hover:bg-red-500/10 text-white/45 hover:text-red-400 rounded transition-colors"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Progress representation or Status banner */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-white/40">Uploaded {doc.uploadTime}</span>
                        <span className={`font-bold ${
                          doc.status === 'Completed' ? 'text-emerald-400' :
                          doc.status === 'Failed' ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {doc.status === 'Processing' ? `AI Ingestion: ${doc.progress}%` : doc.status}
                        </span>
                      </div>
                      
                      {/* Active Progress Bar */}
                      <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            doc.status === 'Completed' ? 'bg-emerald-500' :
                            doc.status === 'Failed' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
                          }`}
                          style={{ width: `${doc.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick status progress telemetry footer */}
          <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 rounded-b-2xl text-[9.5px] font-mono text-white/45 flex items-center justify-between">
            <span>PIPELINE ENGINE: {isProcessingBatch ? 'ACTIVE' : 'IDLE'}</span>
            <span>SHARDS: {documents.length} MOUNTED</span>
          </div>
        </div>

        {/* ================= CENTER COLUMN: COMPREHENSIVE DOCUMENT VIEWER (5 COLS) ================= */}
        <div className="lg:col-span-5 bg-[#090d16] border border-slate-800/80 rounded-2xl flex flex-col h-[780px] shadow-lg overflow-hidden">
          
          {selectedDoc ? (
            <div className="flex flex-col h-full overflow-y-auto divide-y divide-slate-800/60">
              
              {/* Document identity header */}
              <div className="p-4 bg-[#101626]/40 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-white/45 block uppercase">Document View Workspace</span>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {selectedDoc.name}
                    <FileSignature className="w-3.5 h-3.5 text-emerald-400" />
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[9.5px] font-mono text-white/45 block">INGEST STATUS</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{selectedDoc.status}</span>
                </div>
              </div>

              {/* CROSS-DOCUMENT INTEL ALERTS (PHASE 3) */}
              {crossDocAnalysis && !crossDocAnalysis.isConsistent && (
                <div className="p-4 bg-amber-500/5 border-b border-amber-500/20 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-amber-400">Cross-Document Entity Inconsistencies Detected</h4>
                      <p className="text-[10.5px] text-white/50 mt-0.5">
                        Centralized comparison engine flagged entity inconsistencies across statutory attachments.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pl-6">
                    {crossDocAnalysis.discrepancies.map((disc: string, idx: number) => (
                      <div key={idx} className="text-[10.5px] font-mono text-amber-300 flex items-start gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 animate-pulse" />
                        <span>{disc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Checked params list */}
                  <div className="overflow-hidden border border-amber-500/10 rounded-lg bg-slate-950/60 ml-6">
                    <table className="w-full text-left text-[9.5px] font-mono">
                      <thead>
                        <tr className="bg-amber-500/5 border-b border-amber-500/10 text-white/40">
                          <th className="p-1.5 pl-3">PARAMETER CHECKED</th>
                          <th className="p-1.5">EXPECTED VALUE</th>
                          <th className="p-1.5 text-right pr-3">STATUS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-500/5 text-white/60">
                        {crossDocAnalysis.checks.map((chk: any, idx: number) => (
                          <tr key={idx}>
                            <td className="p-1.5 pl-3 font-bold">{chk.parameter}</td>
                            <td className="p-1.5">{chk.expectedValue}</td>
                            <td className="p-1.5 text-right pr-3">
                              <span className={chk.isConsistent ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                                {chk.isConsistent ? 'MATCH' : 'MISMATCH'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 1: Document OCR Canvas & Preview (Collapsible) */}
              <div className="p-4">
                <div 
                  onClick={() => setCollapsedSections(prev => ({ ...prev, preview: !prev.preview }))}
                  className="flex justify-between items-center cursor-pointer text-white/80 hover:text-white"
                >
                  <span className="text-[10.5px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" />
                    OCR Digital Canvas Preview
                  </span>
                  {collapsedSections.preview ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
                </div>

                {!collapsedSections.preview && (
                  <div className="mt-3 bg-slate-950 border border-slate-800 rounded-xl p-4 font-sans text-xs relative overflow-hidden min-h-[160px] flex flex-col justify-between">
                    <div className="absolute right-2 top-2 p-1 bg-white/5 border border-white/10 text-[8px] font-mono text-white/40 rounded">
                      PAGE 1 OF 1 &bull; 300 DPI
                    </div>
                    
                    {/* Simulated visual digital document bounding boxes */}
                    <div className="space-y-3 relative text-white/85 leading-relaxed font-mono select-none">
                      <p className="border-b border-slate-900 pb-2 text-[10px] text-white/30 tracking-widest uppercase">
                        --- SCAN MATRIX COORDINATE OVERLAYS ---
                      </p>
                      
                      {/* Render text with styled matching boxes */}
                      <p className="leading-loose">
                        REPUBLIC OF KENYA - KENYA REVENUE AUTHORITY. 
                        We hereby confirm <span className="bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-1 py-0.5 rounded text-[11px]" title="Bounding Box match: [COMPANY_NAME]">Shanghai Grid Metal Corp</span> PIN: <span className="bg-indigo-500/10 border border-indigo-500/40 text-indigo-400 px-1 py-0.5 rounded text-[11px]" title="Bounding Box match: [PIN]">{selectedDoc.metadata.find(m => m.key === 'pin')?.value || 'P051284920K'}</span> complies with tax parameters under <span className="bg-yellow-500/5 border border-yellow-500/20 text-yellow-500 px-1 py-0.5 rounded text-[11px]">PPADA SECTION 55</span>.
                      </p>

                      <p className="text-white/50 text-[10.5px] italic">
                        &quot;{selectedDoc.extractedText.slice(0, 160)}...&quot;
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-white/35">
                      <span>INTELLIGENT LAYOUT PARSER ACTIVE</span>
                      <span>MD5: 84b2...119c</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: Extracted Metadata Fields (Editable!) (Collapsible) */}
              <div className="p-4">
                <div 
                  onClick={() => setCollapsedSections(prev => ({ ...prev, metadata: !prev.metadata }))}
                  className="flex justify-between items-center cursor-pointer text-white/80 hover:text-white"
                >
                  <span className="text-[10.5px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5" />
                    Parsed Metadata Entities
                  </span>
                  {collapsedSections.metadata ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
                </div>

                {!collapsedSections.metadata && (
                  <div className="mt-3 space-y-3">
                    <div className="overflow-x-auto border border-slate-800/60 rounded-xl bg-slate-950/40">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-950 border-b border-slate-800 font-mono text-[9px] text-white/45">
                            <th className="p-2.5">ENTITY FIELD NAME</th>
                            <th className="p-2.5">EXTRACTED VALUE</th>
                            <th className="p-2.5 text-right">CONFIDENCE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                          {selectedDoc.metadata.map((field) => (
                            <tr key={field.key} className="hover:bg-white/[0.01]">
                              <td className="p-2.5 font-mono text-white/60 text-[10.5px]">{field.label}</td>
                              <td className="p-1.5">
                                <input 
                                  type="text"
                                  value={field.value}
                                  onChange={(e) => handleMetadataChange(field.key, e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800/80 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/40 font-mono"
                                />
                              </td>
                              <td className="p-2.5 text-right font-mono font-bold text-emerald-400 text-[10.5px]">
                                {field.confidence}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <span className="text-[9px] font-mono text-white/35 block leading-tight">
                      * Changing any values updates compliance validation and clears AI uncertainty score in the main log database.
                    </span>
                  </div>
                )}
              </div>

              {/* SECTION 3: Requirements compliance matrix (Collapsible) */}
              <div className="p-4">
                <div 
                  onClick={() => setCollapsedSections(prev => ({ ...prev, requirements: !prev.requirements }))}
                  className="flex justify-between items-center cursor-pointer text-white/80 hover:text-white"
                >
                  <span className="text-[10.5px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Requirements Compliance Checklists
                  </span>
                  {collapsedSections.requirements ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
                </div>

                {!collapsedSections.requirements && (
                  <div className="mt-3 space-y-3">
                    {selectedDoc.requirements.length === 0 ? (
                      <p className="text-xs text-white/40 italic">No rules parsed for this document category yet.</p>
                    ) : (
                      selectedDoc.requirements.map((req) => (
                        <div key={req.id} className="bg-slate-950 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-semibold text-white/95 block">{req.requirement}</span>
                              <span className="text-[9.5px] font-mono text-white/45 block">Evidence: {req.evidence}</span>
                            </div>
                            
                            {/* Interactive Officer Status Overrides */}
                            <select 
                              value={req.status}
                              onChange={(e) => handleRequirementStatusChange(req.id, e.target.value as any)}
                              className={`text-[10px] font-mono font-bold p-1 px-2 rounded focus:outline-none border cursor-pointer ${
                                req.status === 'PASS' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
                                req.status === 'FAIL' ? 'bg-red-500/10 text-red-400 border-red-500/25 animate-pulse' :
                                'bg-amber-500/10 text-amber-400 border-amber-500/25'
                              }`}
                            >
                              <option value="PASS" className="bg-slate-900 text-emerald-400">PASS</option>
                              <option value="FAIL" className="bg-slate-900 text-red-400">FAIL</option>
                              <option value="PENDING" className="bg-slate-900 text-amber-400">PENDING</option>
                              <option value="NOT FOUND" className="bg-slate-900 text-white/40">NOT FOUND</option>
                            </select>
                          </div>

                          {/* Editable notes */}
                          <div className="space-y-1">
                            <label className="text-[9px] font-mono text-white/35">OFFICER ASSESSMENT COMMENT</label>
                            <input 
                              type="text"
                              value={req.comment}
                              onChange={(e) => handleRequirementCommentChange(req.id, e.target.value)}
                              placeholder="Write compliance remarks..."
                              className="w-full bg-slate-900 border border-slate-800 text-[11px] rounded p-1.5 px-2.5 text-white focus:outline-none focus:border-emerald-500/40"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* SECTION 4: Officer Notes / Comment log (Collapsible) */}
              <div className="p-4">
                <div 
                  onClick={() => setCollapsedSections(prev => ({ ...prev, notes: !prev.notes }))}
                  className="flex justify-between items-center cursor-pointer text-white/80 hover:text-white"
                >
                  <span className="text-[10.5px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Officer Evaluation Observations & Notes
                  </span>
                  {collapsedSections.notes ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
                </div>

                {!collapsedSections.notes && (
                  <div className="mt-3 space-y-3">
                    {selectedDoc.officerNotes ? (
                      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono text-[10.5px] text-white/70 whitespace-pre-line leading-relaxed max-h-[150px] overflow-y-auto">
                        {selectedDoc.officerNotes}
                      </div>
                    ) : (
                      <p className="text-xs text-white/30 italic px-1">No notes saved on this document yet.</p>
                    )}

                    <form onSubmit={handleAddNote} className="flex gap-2">
                      <input 
                        type="text"
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        placeholder="Type observation note to append..."
                        className="flex-1 bg-slate-950 border border-slate-800 text-xs rounded-xl p-2.5 text-white focus:outline-none focus:border-emerald-500/50"
                      />
                      <button 
                        type="submit"
                        className="p-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-semibold rounded-xl cursor-pointer transition-all"
                      >
                        Add Note
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* SECTION 5: Version History & Override logs (Collapsible) */}
              <div className="p-4">
                <div 
                  onClick={() => setCollapsedSections(prev => ({ ...prev, history: !prev.history }))}
                  className="flex justify-between items-center cursor-pointer text-white/80 hover:text-white"
                >
                  <span className="text-[10.5px] font-mono text-emerald-400 uppercase tracking-wider block font-semibold flex items-center gap-1.5">
                    <ScrollText className="w-3.5 h-3.5" />
                    Version History & Override Trail
                  </span>
                  {collapsedSections.history ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
                </div>

                {!collapsedSections.history && (
                  <div className="mt-3 space-y-2.5">
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-white/35 block uppercase">Ingestion Versions</span>
                      <div className="space-y-1">
                        {selectedDoc.versionHistory.map((v, i) => (
                          <div key={i} className="text-[10.5px] font-mono text-white/60 flex items-center gap-1.5 bg-slate-950 p-1.5 px-3 rounded-lg border border-slate-900">
                            <Clock className="w-3 h-3 text-emerald-400/80" />
                            <span>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] font-mono text-white/35 block uppercase">Officer Audit Overrides Log</span>
                      {selectedDoc.overridesLog.length === 0 ? (
                        <p className="text-[10px] text-white/30 italic px-1">No human overrides committed on this document.</p>
                      ) : (
                        <div className="space-y-1">
                          {selectedDoc.overridesLog.map((log, i) => (
                            <div key={i} className="text-[10px] font-mono text-amber-400 flex items-start gap-1.5 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                              <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                              <span>{log}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 space-y-4 text-white/25">
              <FileText className="w-16 h-16 stroke-1" />
              <div>
                <h4 className="text-sm font-semibold uppercase tracking-wider text-white/70">No Document Selected</h4>
                <p className="text-xs max-w-xs mt-1">
                  Select any statutory attachment from the active upload queue on the left to verify, edit metadata, or approve recommendations.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* ================= RIGHT COLUMN: AI ANALYSIS & RECOMMENDATIONS (4 COLS) ================= */}
        <div className="lg:col-span-4 bg-[#0d1221] border border-slate-800/80 rounded-2xl flex flex-col h-[780px] shadow-lg overflow-hidden">
          
          <div className="p-4 border-b border-slate-800/80">
            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">AI Analysis Panel</span>
            <p className="text-[10px] text-white/45 mt-0.5">Real-time inference mapped to regulatory guidelines.</p>
          </div>

          {selectedDoc ? (
            <div className="p-4 space-y-5 flex-1 overflow-y-auto">
              
              {/* Document Classification Override Box */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Automatic Document Classification</span>
                
                <div className="flex justify-between items-center bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg">
                  <div>
                    <span className="text-[10px] text-white/35 block">AI PREDICTED TYPE</span>
                    <span className="text-xs font-bold text-white">{selectedDoc.category}</span>
                  </div>
                  <span className="text-[9.5px] font-mono text-emerald-400 bg-emerald-500/15 p-1 px-2 rounded">
                    98% Match
                  </span>
                </div>

                <div className="space-y-1.5 pt-1.5">
                  <label className="text-[9.5px] font-mono text-white/35">OFFICER OVERRIDE CLASSIFICATION</label>
                  <div className="flex gap-2">
                    <select 
                      value={overrideCategory}
                      onChange={(e) => setOverrideCategory(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 text-xs rounded p-1.5 px-2.5 text-white focus:outline-none"
                    >
                      <option value="">-- Choose New Classification --</option>
                      <option value="Technical Proposal">Technical Proposal</option>
                      <option value="Financial Proposal">Financial Proposal</option>
                      <option value="Tax Compliance Certificate">Tax Compliance Certificate</option>
                      <option value="CR12">CR12</option>
                      <option value="Certificate of Incorporation">Certificate of Incorporation</option>
                      <option value="AGPO Certificate">AGPO Certificate</option>
                      <option value="Manufacturer Authorization">Manufacturer Authorization</option>
                      <option value="Bid Security">Bid Security</option>
                      <option value="Company Registration">Company Registration</option>
                    </select>
                    <button
                      onClick={() => handleClassificationOverride(overrideCategory)}
                      disabled={!overrideCategory}
                      className="p-1 px-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-800 disabled:text-white/20 text-slate-950 text-xs font-semibold rounded cursor-pointer transition-all"
                    >
                      Override
                    </button>
                  </div>
                </div>
              </div>

              {/* AI Processing Pipeline Stage progress list */}
              <div className="bg-slate-950/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-mono text-white/40 uppercase block">8-Stage AI Processing Pipeline</span>
                
                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                  {selectedDoc.pipelineStages.map((stage, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-mono text-white/30 w-3">{idx + 1}</span>
                        <span className="text-white/70">{stage.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {stage.status === 'Completed' && <span className="text-[10px] font-mono text-emerald-400 font-bold">COMPLETED ({stage.confidence}%)</span>}
                        {stage.status === 'Running' && <span className="text-[10px] font-mono text-amber-400 font-bold animate-pulse">RUNNING...</span>}
                        {stage.status === 'Pending' && <span className="text-[10px] font-mono text-white/20">PENDING</span>}
                        {stage.status === 'Failed' && <span className="text-[10px] font-mono text-red-400 font-bold">FAILED</span>}
                        <span className="text-[9.5px] font-mono text-white/30">{stage.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Explainability reasons card */}
              <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-xl space-y-3">
                <span className="text-[9px] font-mono text-white/40 uppercase block">Explainable AI Evidence</span>
                
                <div className="space-y-2">
                  <div className="text-xs">
                    <span className="font-semibold text-white/80 block">Decision Vector Reasoning</span>
                    <p className="text-white/50 text-[11px] mt-0.5 leading-relaxed">
                      AI evaluated bidder responsive based on exact statutory PIN lookups and matching SHA-256 digital registry keys.
                    </p>
                  </div>

                  <div className="border-t border-slate-900 pt-2 text-xs">
                    <span className="font-semibold text-white/80 block">Confidence index</span>
                    <span className="text-emerald-400 font-black text-sm">{selectedDoc.recommendation.confidence}% accuracy guarantee</span>
                  </div>
                </div>
              </div>

              {/* AI Evaluation Recommendation with human approval check */}
              <div className={`p-4.5 rounded-xl border space-y-3.5 ${
                selectedDoc.recommendation.status === 'Responsive' 
                  ? 'bg-emerald-500/5 border-emerald-500/20' 
                  : 'bg-red-500/5 border-red-500/20'
              }`}>
                <div>
                  <span className="text-[9px] font-mono text-white/35 block uppercase">Evaluation recommendation</span>
                  <div className="flex justify-between items-center mt-0.5">
                    <span className={`text-base font-bold ${
                      selectedDoc.recommendation.status === 'Responsive' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {selectedDoc.recommendation.status}
                    </span>
                    <span className="text-[10px] font-mono text-white/40">Confidence: {selectedDoc.recommendation.confidence}%</span>
                  </div>
                </div>

                <div className="space-y-1.5 border-t border-slate-800 pt-2.5">
                  <span className="text-[9.5px] font-mono text-white/40 uppercase block">REASONING TRACEABILITY:</span>
                  <ul className="space-y-1 text-xs">
                    {selectedDoc.recommendation.reasons.map((reason, idx) => (
                      <li key={idx} className="flex gap-1.5 items-start text-white/70">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-snug">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Mandated Human Consent confirmation action */}
                <div className="pt-3 border-t border-slate-800/60">
                  <button
                    onClick={toggleRecommendationApproval}
                    className={`w-full p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center justify-center gap-2 ${
                      selectedDoc.recommendation.approvedByOfficer
                        ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                        : 'bg-slate-900 hover:bg-slate-850 text-white border border-slate-800'
                    }`}
                  >
                    {selectedDoc.recommendation.approvedByOfficer ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-slate-950" />
                        <span>Recommendation Confirmed by Officer</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-emerald-400" />
                        <span>Confirm and Approve AI Recommendation</span>
                      </>
                    )}
                  </button>
                  <p className="text-[9px] text-white/30 text-center mt-1.5 italic">
                    Human decision overrides any computed recommendations. Audit trails log consent status.
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 text-center p-8 text-white/20">
              <Sparkles className="w-12 h-12 stroke-1" />
              <p className="text-xs mt-1">Select document to initiate inference analysis.</p>
            </div>
          )}

        </div>

      </div>

      {/* ================= BOTTOM BAR: TIMELINE EVENTS & CONVENIENT EXPORTS ================= */}
      <div className="bg-[#101626] border border-slate-800/80 p-5 rounded-2xl flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-5 shadow-xl">
        
        {/* Processing Event Timeline (collapsible/scrollable list) */}
        <div className="flex-1 space-y-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono text-white/50 uppercase tracking-widest block font-bold">
              Event Processing Timeline {selectedDoc ? `(${selectedDoc.name})` : ''}
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-1 max-w-full">
            {selectedDoc ? (
              selectedDoc.timelineEvents.map((evt, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg p-2 px-3.5 min-w-[200px] shrink-0 text-xs flex justify-between items-start gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[9.5px] font-bold text-white block">{evt.status}</span>
                    <span className="text-[8.5px] text-emerald-400 block font-mono">Stage: {evt.stage}</span>
                  </div>
                  <div className="text-right text-[8.5px] font-mono text-white/35 shrink-0">
                    <span>{evt.time}</span>
                    <span className="block">{evt.duration}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-white/35 italic">No active document processing to log.</p>
            )}
          </div>
        </div>

        {/* Convenient Export triggers */}
        <div className="bg-slate-950 p-3 border border-slate-800 rounded-xl space-y-2 min-w-[280px]">
          <span className="text-[9px] font-mono text-white/40 uppercase block">Export Evaluation Artifacts</span>
          <div className="flex gap-2">
            {[
              { id: 'JSON', format: 'JSON' },
              { id: 'EXCEL', format: 'Excel' },
              { id: 'PDF', format: 'PDF' }
            ].map((ext) => (
              <button
                key={ext.id}
                onClick={() => executeExport(ext.id)}
                disabled={!selectedDoc}
                className="flex-1 flex items-center justify-center gap-1 p-2 bg-slate-900 hover:bg-slate-850 disabled:bg-slate-950 disabled:text-white/10 border border-slate-800 text-white text-[10.5px] font-semibold rounded-lg cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5 text-white/60" />
                <span>{ext.format}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Slide-out PPADA Reference Library Drawer */}
      <AnimatePresence>
        {libraryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setLibraryOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40"
            />
            
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0B121F] border-l border-slate-800/80 shadow-2xl z-50 p-6 flex flex-col justify-between"
              id="laws-retrieval-drawer"
            >
              <div className="space-y-6 overflow-y-auto">
                <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">PPADA Reference Library</h3>
                  </div>
                  <button 
                    onClick={() => setLibraryOpen(false)}
                    className="text-white/45 hover:text-white/90 text-xs p-1 rounded-lg bg-white/5 cursor-pointer"
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-white/30 absolute left-3 top-3" />
                  <input 
                    type="text"
                    value={libraryQuery}
                    onChange={(e) => setLibraryQuery(e.target.value)}
                    placeholder="Search sections (e.g., Section 80)..."
                    className="w-full bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 pl-9 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {/* PPADA guidelines search list */}
                <div className="space-y-4 text-xs">
                  {[
                    { section: 'Section 55', title: 'Eligibility Criteria', text: 'A candidate is eligible to bid for procurement if the candidate has the necessary professional and technical qualifications, has paid taxes, is registered under registry guidelines, and has paid statutory requirements.' },
                    { section: 'Section 61', title: 'Tender Security Requirements', text: 'Tender security shall not exceed two percent of the tender value. The security bond must reside with an approved national bank and maintain active timelines.' },
                    { section: 'Section 80', title: 'Evaluation of Bids', text: 'The evaluation committee shall conduct bid evaluation. The evaluation shall evaluate technical criteria first, followed by financial calculations. Only criteria stated in the tender document can be used.' },
                    { section: 'Section 95', title: 'Collusion Prevention', text: 'If any directors, prices, or documents are duplicated cross-bidder, the system triggers direct forensic fraud investigations.' }
                  ].filter(r => r.section.toLowerCase().includes(libraryQuery.toLowerCase()) || r.title.toLowerCase().includes(libraryQuery.toLowerCase()) || r.text.toLowerCase().includes(libraryQuery.toLowerCase())).map((clause, idx) => (
                    <div key={idx} className="bg-white/[0.01] border border-slate-800/50 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs font-mono text-emerald-400">
                        <strong>{clause.section}</strong>
                        <span className="text-white/30 text-[9px]">PPADA ACT 2015</span>
                      </div>
                      <strong className="text-white block font-semibold text-[11.5px]">{clause.title}</strong>
                      <p className="text-white/60 leading-relaxed text-[11px]">{clause.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/40 text-[9.5px] font-mono text-white/30 text-center uppercase tracking-wider">
                Authorized legal compliance engine
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Export download modal / Overlay */}
      {exportModalContent?.show && (
        <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b121f] border border-slate-800 max-w-xl w-full rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <FileCheck className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Generate {exportModalContent.format} Report Package</h3>
              </div>
              <button 
                onClick={() => setExportModalContent(null)}
                className="text-white/45 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-white/60">
              Evaluation summary metadata compiled successfully. This package contains the parsed OCR parameters, compliance verification checklists, and officer notes.
            </p>

            <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-[250px]">
              <pre>{exportModalContent.data}</pre>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setExportModalContent(null)}
                className="p-2 px-4 bg-slate-900 hover:bg-slate-850 text-white/70 text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={downloadExportPackage}
                className="p-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Report Package</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
