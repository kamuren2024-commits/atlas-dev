import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, Terminal, Compass, Cpu, Settings, Activity, Send, Sparkles, 
  RefreshCw, CheckCircle, AlertTriangle, Layers, Users, Database, 
  GitCommit, Play, Plus, BookOpen, ShieldCheck, Zap, Sliders, MessageSquare, 
  Code, ArrowRight, ClipboardList, Check, X, Shield, Search, FileText, UploadCloud, 
  MapPin, AlertCircle, TrendingUp, HelpCircle
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { AgentDiagnosticSuite } from '../../core/agents/testing/agent.test';
import { MemoryDiagnosticSuite } from '../../core/memory/testing/memory.test';

interface PlannedTask {
  id: string;
  name: string;
  description: string;
  assignedAgent: string;
  dependsOn?: string[];
  status: 'pending' | 'active' | 'completed' | 'failed';
  output?: string;
}

interface GovernanceItem {
  id: string;
  workflowId?: string;
  stepId?: string;
  actionRequested: string;
  targetAgentId: string;
  confidence: number;
  reason: string;
  riskRating: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'approved' | 'rejected' | 'requested_review';
  requestedAt: string;
}

interface RAGDocument {
  id: string;
  title: string;
  type: string;
  uploadedAt: string;
  size: string;
  tags: string[];
}

interface TwinEntity {
  id: string;
  type: string;
  name: string;
  status: 'optimal' | 'nominal' | 'degraded' | 'critical';
  healthScore: number;
  metrics: Record<string, any>;
}

export default function AgentPlatform() {
  const { currentTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'workspace' | 'rag' | 'twin' | 'workflows' | 'governance' | 'simulation'>('workspace');
  
  // Workspace states
  const [prompt, setPrompt] = useState('Identify shipping delays at Mombasa port and recommend contingency part reserves at Mariakani depot.');
  const [routingResult, setRoutingResult] = useState<any>(null);
  const [plannedTasks, setPlannedTasks] = useState<PlannedTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [orchestrationOutput, setOrchestrationOutput] = useState<string>('');
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  
  // Health & global monitors
  const [fabricHealth, setFabricHealth] = useState<any>(null);
  const [learnings, setLearnings] = useState<string[]>([]);
  const [telemetryLogs, setTelemetryLogs] = useState<any[]>([]);
  
  // RAG Explorer states
  const [ragDocs, setRagDocs] = useState<RAGDocument[]>([]);
  const [ragQuery, setRagQuery] = useState('');
  const [ragResults, setRagResults] = useState<any[]>([]);
  const [ragSearching, setRagSearching] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', type: 'pdf', content: '', tags: '' });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Digital Twin state
  const [twinEntities, setTwinEntities] = useState<TwinEntity[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('project-suswa');
  const [entityScanResults, setEntityScanResults] = useState<any>(null);
  const [entityScanning, setEntityScanning] = useState<'observe' | 'analyze' | 'predict' | 'recommend' | null>(null);

  // Workflow states
  const [workflows, setWorkflows] = useState<any[]>([]);
  
  // HITL Governance state
  const [govItems, setGovItems] = useState<GovernanceItem[]>([]);
  const [submittingGovId, setSubmittingGovId] = useState<string | null>(null);
  const [govFeedback, setGovFeedback] = useState<Record<string, string>>({});

  // Active simulated agent lists
  const agentsList = [
    { id: 'procurement-agent', name: 'SCM Procurement Specialist', domain: 'Procurement & Tenders', capabilities: ['Tender Formulation', 'Bid Eval Score Matrix', 'Public benchmark audit'] },
    { id: 'contract-agent', name: 'SCM Contract Investigator', domain: 'Contracts & Obligations', capabilities: ['Legal Clause OCR Extraction', 'Milestone Delay Predictor'] },
    { id: 'supplier-agent', name: 'SCM Supplier Auditor', domain: 'Suppliers & Relationships', capabilities: ['Vendor Performance Tracker', 'Supplier Risk Analytics'] },
    { id: 'inventory-agent', name: 'SCM Inventory Balance Mind', domain: 'Inventory & Warehousing', capabilities: ['Replenishment Forecast loops', 'Depot stock balance analytics'] },
    { id: 'logistics-agent', name: 'SCM Logistics Dispatcher', domain: 'Logistics & Shipments', capabilities: ['Northern Corridor Custom Clearance prediction', 'Harbor Delay models'] },
    { id: 'project-agent', name: 'SCM Project Delivery Mind', domain: 'Project Readiness & BOMs', capabilities: ['BOM Material Alignment checks', 'Task Dependency analytics'] }
  ];

  // Load all foundational data from REST endpoints
  const fetchFabricData = async () => {
    try {
      const hRes = await fetch('/api/scm/fabric/health');
      if (hRes.ok) {
        const hData = await hRes.json();
        setFabricHealth(hData.health);
        setLearnings(hData.learnings || []);
      }
      
      const wRes = await fetch('/api/scm/fabric/workflows');
      if (wRes.ok) {
        const wData = await wRes.json();
        setWorkflows(wData.workflows || []);
      }

      const gRes = await fetch('/api/scm/fabric/governance');
      if (gRes.ok) {
        const gData = await gRes.json();
        setGovItems(gData.items || []);
      }

      const dRes = await fetch('/api/scm/fabric/digital-twin/entities');
      if (dRes.ok) {
        const dData = await dRes.json();
        setTwinEntities(dData.entities || []);
      }

      const docRes = await fetch('/api/scm/fabric/rag/documents');
      if (docRes.ok) {
        const docData = await docRes.json();
        setRagDocs(docData.documents || []);
      }

      const logRes = await fetch('/api/scm/telemetry');
      if (logRes.ok) {
        const logData = await logRes.json();
        setTelemetryLogs(logData.logs ? logData.logs.slice(0, 10) : []);
      }
    } catch (err) {
      console.error('Core fabric data loading error', err);
    }
  };

  useEffect(() => {
    fetchFabricData();
    // Run the high-fidelity Enterprise Agent Framework (EAF) Diagnostics Suite
    AgentDiagnosticSuite.runAll().catch(err => {
      console.error('Error running EAF diagnostics suite:', err);
    });
    // Run the high-fidelity Enterprise Memory Fabric (EMF) Diagnostics Suite
    MemoryDiagnosticSuite.runAll().catch(err => {
      console.error('Error running EMF diagnostics suite:', err);
    });
    const timer = setInterval(fetchFabricData, 6000);
    return () => clearInterval(timer);
  }, []);

  // Fetch individual digital twin entity scan results
  const fetchEntityInsight = async (entityId: string, actionType: 'observe' | 'analyze' | 'predict' | 'recommend') => {
    setEntityScanning(actionType);
    setEntityScanResults(null);
    try {
      const res = await fetch(`/api/scm/fabric/digital-twin/entities/${entityId}/${actionType}`);
      if (res.ok) {
        const data = await res.json();
        setEntityScanResults(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEntityScanning(null);
    }
  };

  useEffect(() => {
    if (selectedEntityId) {
      fetchEntityInsight(selectedEntityId, 'observe');
    }
  }, [selectedEntityId]);

  // Execute unified fabric multi-agent orchestrate routing
  const handleFabricSubmit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setOrchestrationOutput('');
    setRoutingResult(null);
    setPlannedTasks([]);

    // Step 1: Query Router + Planner endpoints
    try {
      const routeRes = await fetch('/api/scm/fabric/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (routeRes.ok) {
        const routeData = await routeRes.json();
        setRoutingResult(routeData.routingResult);
        setPlannedTasks(routeData.plan || []);
      }

      // Step 2: Trigger Primary Orchestrate Synthesis loop
      const orchRes = await fetch('/api/scm/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      if (orchRes.ok) {
        const orchData = await orchRes.json();
        setOrchestrationOutput(orchData.finalSynthesis);
        
        // Push a simulated timeline event showing completed validation
        setTimelineEvents(prev => [
          {
            time: new Date().toLocaleTimeString(),
            title: 'SALIENCE_FABRIC_DECISION_COMPILED',
            desc: 'Multi-agent consensus completed standard strategic check.',
            type: 'success'
          },
          ...prev
        ]);
      }
      await fetchFabricData();
    } catch (err) {
      console.error('Fabric query orchestration error', err);
    } finally {
      setLoading(false);
    }
  };

  // Resolve HITL Governance approval queue
  const handleResolveGov = async (govId: string, decision: 'approved' | 'rejected' | 'requested_review') => {
    setSubmittingGovId(govId);
    const feedback = govFeedback[govId] || 'Manual operational clearance issued by supervisor audit officer.';
    try {
      const res = await fetch('/api/scm/fabric/governance/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: govId, decision, feedback })
      });
      if (res.ok) {
        setGovFeedback(prev => ({ ...prev, [govId]: '' }));
        // Add a beautiful immediate success notification
        setTimelineEvents(prev => [
          {
            time: new Date().toLocaleTimeString(),
            title: `GOVERNANCE_CUE_${decision.toUpperCase()}`,
            desc: `Item ${govId} committed. System routing optimized status values.`,
            type: decision === 'approved' ? 'success' : 'warning'
          },
          ...prev
        ]);
        await fetchFabricData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingGovId(null);
    }
  };

  // Execute RAG Knowledge Base search
  const handleRAGSearch = async () => {
    if (!ragQuery.trim()) return;
    setRagSearching(true);
    setRagResults([]);
    try {
      const res = await fetch('/api/scm/fabric/rag/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: ragQuery })
      });
      if (res.ok) {
        const data = await res.json();
        setRagResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRagSearching(false);
    }
  };

  // Upload/Ingest local SCM documents into RAG database
  const handleRAGUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoc.title || !newDoc.content) return;
    setUploadingDoc(true);
    setUploadSuccess(false);

    try {
      const res = await fetch('/api/scm/fabric/rag/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newDoc.title,
          type: newDoc.type,
          content: newDoc.content,
          tags: newDoc.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (res.ok) {
        setUploadSuccess(true);
        setNewDoc({ title: '', type: 'pdf', content: '', tags: '' });
        await fetchFabricData();
        setTimeout(() => setUploadSuccess(false), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingDoc(false);
    }
  };

  // Simulate complete Scenario
  const handleTriggerScenarioSim = async (scenario: string) => {
    setLoading(true);
    setActiveTab('workspace');
    let promptText = '';
    if (scenario === 'transformer') {
      promptText = 'CRITICAL ALERT: Mariakani Substation transformer core exceeds 105C with gas leakage. Trigger stress analysis, parts lookup, and contract warranty liabilities.';
    } else if (scenario === 'strike') {
      promptText = 'Mombasa clearance corridors blockaded due to port strike backlog. Extract delays for Shanghai shipment lot and trigger penalty liquid damage claims.';
    } else {
      promptText = 'PPRA Audit Trigger: Siemens bid package pricing deviates by 17% from reference indices. Validate compliance guidelines, fraud scoring, and audit guidelines.';
    }
    setPrompt(promptText);
    setTimeout(() => {
      handleFabricSubmit();
    }, 400);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050811] text-slate-100 overflow-hidden" id="intelligence-fabric-operating-system">
      
      {/* Top Intelligence Ribbon Header */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between border-b border-cyan-550/10 bg-[#090f1d] px-6 py-4.5 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00D9FF]/5 border border-[#00D9FF]/20 rounded-xl relative">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse animate-spin" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-mono tracking-wider text-slate-100 uppercase">SALIENCE_ATLAS // DECENTRALIZED COGNITIVE FABRIC</h2>
              <span className="text-[9px] font-mono font-bold bg-cyan-950/60 text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded uppercase font-black tracking-widest animate-pulse">
                v3.2 ENGINE ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
              AUTONOMOUS INTEGRATED SCM KETRACO MULTI-AGENT STATE MATRIX SYSTEM
            </p>
          </div>
        </div>

        {/* Global Fabric Status Pillars */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="leading-none">
              <span className="text-[8.5px] font-mono text-slate-500 block">ROUTER CONTEXT</span>
              <span className="text-[10px] font-mono font-bold text-slate-300">ACCURACY_CENTRIC</span>
            </div>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900 flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <div className="leading-none">
              <span className="text-[8.5px] font-mono text-slate-500 block">COGNITIVE AGENTS</span>
              <span className="text-[10px] font-mono font-bold text-slate-300">10 ACTIVE REGISTERS</span>
            </div>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <div className="leading-none">
              <span className="text-[8.5px] font-mono text-slate-500 block">GOVERNANCE QUEUE</span>
              <span className="text-[10px] font-mono font-bold text-cyan-400">{govItems.filter(g => g.status === 'pending').length} ACTIONABLE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Rail */}
      <div className="flex bg-[#070b14] border-b border-indigo-500/10 px-6 overflow-x-auto min-h-[44px]">
        {[
          { id: 'workspace', label: 'Command Workspace', icon: Terminal },
          { id: 'twin', label: 'Entity Digital Twin', icon: MapPin },
          { id: 'rag', label: 'Knowledge Base (RAG)', icon: BookOpen },
          { id: 'workflows', label: 'Autonomous Workflows', icon: Layers },
          { id: 'governance', label: 'HITL Governance Board', icon: ShieldCheck },
          { id: 'simulation', label: 'Stress Sandbox', icon: Zap }
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-mono tracking-wide transition-all cursor-pointer whitespace-nowrap ${
                isSelected 
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/10 font-bold' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-950/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
              {tab.label}
              {tab.id === 'governance' && govItems.filter(g => g.status === 'pending').length > 0 && (
                <span className="px-1.5 py-0.2 bg-[#00D9FF] text-slate-950 text-[9px] font-bold rounded-full font-sans ml-1">
                  {govItems.filter(g => g.status === 'pending').length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Workspace viewport */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Side: Active Navigation Details and dynamic modules */}
        <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* TABS 1: COMMAND WORKSPACE */}
            {activeTab === 'workspace' && (
              <motion.div
                key="workspace-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
                id="cmd-workspace-viewport"
              >
                {/* Console prompt bar */}
                <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 bg-[#090f1d]/80 relative overflow-hidden">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono text-slate-500 tracking-widest font-bold">COGNITIVE COMMAND GATEWAY</span>
                    <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      CORES_ALIGNED // INGESTION_BUS_READY
                    </span>
                  </div>

                  <div className="relative">
                    <Terminal className="absolute left-3.5 top-4.5 w-4.5 h-4.5 text-slate-500" />
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Deploy operating instructions or prompt the multi-agent cognitive fabric..."
                      rows={3}
                      className="w-full bg-[#03060c] border border-slate-800/80 rounded-xl py-3.5 pl-11 pr-5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-all font-mono leading-relaxed"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-4 pt-1.5">
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => setPrompt("Check Lot 4 interconnector construction barriers at Suswa substation.")}
                        className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-900 border border-slate-900 text-[9px] font-mono text-slate-400"
                      >
                        Suswa Substation check
                      </button>
                      <button 
                        onClick={() => setPrompt("Verify Shanghai Cable contract liquid damage penalty provisions.")}
                        className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-900 border border-slate-900 text-[9px] font-mono text-slate-400"
                      >
                        Contract Penalty Clause Check
                      </button>
                    </div>

                    <button
                      onClick={handleFabricSubmit}
                      disabled={loading}
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl cursor-pointer disabled:opacity-50 transition-all shadow-lg hover:shadow-cyan-900/20"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          ORCHESTRATING FABRIC CORES...
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          INITIALIZE COGNITIVE SYNTHESIS
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Intelligent Routing Analysis (Requirement 2 & 3) */}
                {(routingResult || plannedTasks.length > 0) && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Intelligent Router Node details (Requirement 2) */}
                    <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-indigo-505/10 pb-2.5">
                        <span className="text-[10px] font-mono font-bold text-indigo-400 flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5" /> INTELLIGENT_AGENT_ROUTER_V3
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 font-bold">MODE: ROUTING_CLASSIFY</span>
                      </div>

                      <div className="space-y-3.5">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 block uppercase">CLASSIFIED INTENT MODEL</span>
                          <span className="text-xs font-bold font-mono text-slate-200 block mt-0.5">{routingResult?.intent || 'SCM Strategic Synthesis'}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-center">
                            <span className="text-[8px] font-mono text-slate-500 block">EXECUTION PATTERN</span>
                            <span className="text-[11px] font-mono font-bold text-[#00D9FF] lowercase mt-0.5">
                              {routingResult?.executionMode === 'multi_agent' ? '● multi-agent loop' : '● single-agent path'}
                            </span>
                          </div>
                          <div className="bg-slate-950 p-2.5 rounded border border-slate-900 text-center">
                            <span className="text-[8px] font-mono text-slate-500 block">CONFIDENCE INTEL</span>
                            <span className="text-[11px] font-mono font-bold text-emerald-400 mt-0.5">{(routingResult?.confidence * 100 || 94).toFixed(1)}%</span>
                          </div>
                        </div>

                        <div>
                          <span className="text-[9px] font-mono text-slate-500 block uppercase mb-1.5">COLLABORATORS CONGESTION INDEX</span>
                          <div className="flex flex-wrap gap-1.5">
                            {routingResult?.selectedAgents?.map((agentName: string) => {
                              return (
                                <span key={agentName} className="px-2 py-0.5 bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 rounded font-mono text-[9px] uppercase font-bold">
                                  {agentName}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Task Planning Engine Decomposition steps (Requirement 3) */}
                    <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
                      <div className="flex items-center justify-between border-b border-indigo-505/10 pb-2.5">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1.5">
                          <ClipboardList className="w-3.5 h-3.5" /> DECOMPOSITION_PLANNING_ENGINE
                        </span>
                        <span className="text-[9px] font-mono text-slate-500 font-bold">STATUS: STREAMING</span>
                      </div>

                      <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                        {plannedTasks.map((task, idx) => (
                          <div key={task.id} className="relative bg-[#050913] p-3 rounded-xl border border-slate-900 text-left">
                            <div className="flex items-start justify-between gap-3 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[10px] text-slate-500 font-black">STEP #{idx + 1}</span>
                                  <span className="font-bold text-slate-200">{task.name}</span>
                                </div>
                                <p className="text-[11px] text-slate-400">{task.description}</p>
                                {task.output && (
                                  <div className="bg-slate-950 p-2 rounded border border-slate-900/60 font-mono text-[9.5px] text-cyan-300 mt-2 leading-relaxed">
                                    <span className="font-bold text-slate-500 uppercase block mb-0.5">Engine Execution Result:</span>
                                    {task.output}
                                  </div>
                                )}
                              </div>
                              <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-555/20 px-1.5 py-0.5 rounded leading-none">
                                COMPLETED
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}

                {/* Final Strategic Synthesis (Requirement 11) */}
                {orchestrationOutput && (
                  <div className="glass-panel p-6 rounded-2xl border border-indigo-500/10 bg-[#090f1d]/50 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <span className="text-xs font-semibold text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                        UNIFIED STRATEGIC SCM FABRIC CONSENSUS
                      </span>
                      <span className="text-[9px] font-mono text-slate-500-bold">GENBINI-3.5-FLASH // VERIFIED</span>
                    </div>

                    <div className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">
                      {orchestrationOutput}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* TAB 2: ENTITY DIGITAL TWIN (Requirement 10) */}
            {activeTab === 'twin' && (
              <motion.div
                key="twin-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Digital Twin Registry Entities selector list */}
                  <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Digital Twin Entity Nodes</h3>
                    
                    <div className="space-y-2.5">
                      {twinEntities.map(entity => {
                        const isSelected = entity.id === selectedEntityId;
                        return (
                          <button
                            key={entity.id}
                            onClick={() => setSelectedEntityId(entity.id)}
                            className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-950/30 border-cyan-500/40 text-cyan-205 shadow-[0_0_15px_rgba(0,217,255,0.04)]'
                                : 'bg-transparent border-slate-900 text-slate-400 hover:text-white hover:bg-slate-900/30'
                            }`}
                          >
                            <div className="space-y-1 truncate max-w-[200px]">
                              <span className="text-xs font-bold block truncate text-slate-200">{entity.name}</span>
                              <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-wider block">{entity.type}</span>
                            </div>

                            <div className="text-right flex flex-col items-end">
                              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${
                                entity.status === 'optimal' || entity.status === 'nominal' ? 'text-emerald-400' :
                                entity.status === 'degraded' ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {entity.status}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 mt-0.5">Health {entity.healthScore}%</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Virtual Entity Terminal & Operations scanner */}
                  <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-5 flex flex-col justify-between">
                    
                    {/* Entity details */}
                    {(() => {
                      const selEntity = twinEntities.find(e => e.id === selectedEntityId);
                      if (!selEntity) return <div className="text-xs text-slate-500 font-mono">Select an entity from registry list.</div>;
                      return (
                        <div className="space-y-5">
                          <div className="flex justify-between items-start border-b border-indigo-505/10 pb-3">
                            <div>
                              <span className="text-[9px] font-mono text-cyan-400 border border-cyan-500/25 px-1.5 py-0.5 rounded leading-none font-bold">
                                TWIN_NODE_STATE
                              </span>
                              <h3 className="text-sm font-bold text-white mt-1">{selEntity.name}</h3>
                              <p className="text-[10.5px] font-mono text-indigo-400">{selEntity.type} Engine Interface</p>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] font-mono text-slate-500 block">HEALTH RATING</span>
                              <span className="text-lg font-mono font-bold text-[#00D9FF]">{selEntity.healthScore}%</span>
                            </div>
                          </div>

                          {/* Dynamic Parameters metrics */}
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(selEntity.metrics).map(([key, val]) => (
                              <div key={key} className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono">
                                <span className="text-[8.5px] text-slate-500 block uppercase">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className="text-xs font-bold text-slate-300 mt-1 block">{String(val)}</span>
                              </div>
                            ))}
                          </div>

                          {/* Trigger Entity standard functions */}
                          <div className="space-y-3 pt-3 border-t border-slate-900">
                            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block font-bold">EXECUTE TWIN OBSERVATION PROTOCOLS</span>
                            
                            <div className="flex flex-wrap gap-2">
                              {[
                                { id: 'observe', label: 'observe()', color: 'bg-emerald-950 text-emerald-350 border-emerald-500/20' },
                                { id: 'analyze', label: 'analyze()', color: 'bg-cyan-950 text-cyan-300 border-cyan-500/20' },
                                { id: 'predict', label: 'predict()', color: 'bg-[#15102a] text-indigo-300 border-indigo-500/20' },
                                { id: 'recommend', label: 'recommend()', color: 'bg-amber-950 text-amber-300 border-amber-500/20' }
                              ].map(act => (
                                <button
                                  key={act.id}
                                  onClick={() => fetchEntityInsight(selEntity.id, act.id as any)}
                                  className={`px-3 py-1.5 rounded font-mono text-xs font-bold border hover:opacity-80 transition-all cursor-pointer ${act.color}`}
                                >
                                  {act.label}
                                </button>
                              ))}
                            </div>

                            {/* Scan Loading Status logs */}
                            <div className="bg-[#03060c] p-4 rounded-xl border border-slate-900 font-mono text-xs min-h-[140px] space-y-2">
                              {entityScanning ? (
                                <div className="flex items-center gap-2 text-slate-500 h-[100px] justify-center">
                                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                                  <span>Simulating physical scan loops... {entityScanning}() active.</span>
                                </div>
                              ) : entityScanResults ? (
                                <div className="space-y-3.5">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 uppercase border-b border-slate-900/60 pb-1.5">
                                    <span>Scan Results Data Block</span>
                                    <span className="text-emerald-400">Successfully Scanned</span>
                                  </div>
                                  <div className="space-y-1.5 leading-relaxed text-slate-300">
                                    {entityScanResults.status && (
                                      <div><span className="text-indigo-400">Node Status:</span> {entityScanResults.status}</div>
                                    )}
                                    {entityScanResults.description && (
                                      <div><span className="text-cyan-400">Observations:</span> {entityScanResults.description}</div>
                                    )}
                                    {entityScanResults.riskRating && (
                                      <div><span className="text-rose-400">Risk Severity:</span> {entityScanResults.riskRating} (p-failure: {entityScanResults.failureProbability * 100}%)</div>
                                    )}
                                    {entityScanResults.recommendation && (
                                      <div><span className="text-amber-400">Cognitive Advice:</span> {entityScanResults.recommendation}</div>
                                    )}
                                    {entityScanResults.insights?.length > 0 && (
                                      <div>
                                        <span className="text-[#00D9FF]">Extracted Insights:</span>
                                        <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-400 text-[11px]">
                                          {entityScanResults.insights.map((ins: string, i: number) => <li key={i}>{ins}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                    {entityScanResults.immediateActions?.length > 0 && (
                                      <div>
                                        <span className="text-[#00D9FF]">Mitigation Pathways:</span>
                                        <ul className="list-disc pl-4 mt-1 space-y-0.5 text-slate-400 text-[11px]">
                                          {entityScanResults.immediateActions.map((act: string, i: number) => <li key={i}>{act}</li>)}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-slate-600 flex items-center justify-center h-[100px] text-center">
                                  Terminal idle. Initiate observation commands observe() or analyze() to retrieve real-time state values.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 3: ENTERPRISE KNOWLEDGE BASE (RAG) (Requirement 9) */}
            {activeTab === 'rag' && (
              <motion.div
                key="rag-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Library of files */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
                      <div className="flex justify-between items-center text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">
                        <span>Ingested SCM Library</span>
                        <span className="text-cyan-400">{ragDocs.length} DOCS</span>
                      </div>

                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {ragDocs.map(doc => (
                          <div key={doc.id} className="p-3 rounded-lg bg-slate-950 border border-slate-900 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 truncate">
                              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                              <div className="truncate">
                                <span className="text-xs font-bold text-slate-300 block truncate">{doc.title}</span>
                                <span className="text-[9.5px] font-mono text-slate-500 uppercase tracking-wider">{doc.type} // {doc.size}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ingestion Console upload simulator */}
                    <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
                      <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Ingest SCM Document</h3>
                      
                      <form onSubmit={handleRAGUpload} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-500 block uppercase">Document Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Lessos_Transformer_Service_Logs.pdf"
                            value={newDoc.title}
                            onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full bg-[#03060c] border border-slate-850 focus:border-cyan-500/25 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-500 block uppercase">Document Type</label>
                            <select
                              value={newDoc.type}
                              onChange={(e) => setNewDoc(prev => ({ ...prev, type: e.target.value }))}
                              className="w-full bg-[#03060c] border border-slate-850 focus:border-cyan-500/25 rounded-lg p-2.5 text-xs font-mono text-cyan-400 focus:outline-none"
                            >
                              <option value="pdf">PDF File</option>
                              <option value="contract">EPC Contract</option>
                              <option value="report">Operational Sheet</option>
                              <option value="manual">Equipment Manual</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-500 block uppercase">Index Tags</label>
                            <input
                              type="text"
                              placeholder="e.g. Lessos, Spares, SLA"
                              value={newDoc.tags}
                              onChange={(e) => setNewDoc(prev => ({ ...prev, tags: e.target.value }))}
                              className="w-full bg-[#03060c] border border-slate-850 focus:border-cyan-500/25 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-500 block uppercase">File Text Contents</label>
                          <textarea
                            required
                            placeholder="Paste text contents for vector chunking..."
                            rows={3}
                            value={newDoc.content}
                            onChange={(e) => setNewDoc(prev => ({ ...prev, content: e.target.value }))}
                            className="w-full bg-[#03060c] border border-slate-850 focus:border-cyan-500/25 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none leading-relaxed"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={uploadingDoc}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#121c2e] border border-cyan-500/20 hover:bg-cyan-950/20 text-cyan-300 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all"
                        >
                          {uploadingDoc ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                          ) : (
                            <UploadCloud className="w-3.5 h-3.5" />
                          )}
                          INGEST & FORMULATE CHUNKS
                        </button>

                        {uploadSuccess && (
                          <div className="p-2 bg-emerald-950/40 border border-emerald-500/20 rounded-lg text-emerald-400 font-mono text-[10px] text-center">
                            Document ingested & indexed successfully inside RAG database.
                          </div>
                        )}
                      </form>
                    </div>
                  </div>

                  {/* RAG query search console */}
                  <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">RAG Semantic Search Panel</h3>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        value={ragQuery}
                        onChange={(e) => setRagQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRAGSearch()}
                        placeholder="Type standard questions (e.g. 'What is the standard EPC liquidated damage penalty?')..."
                        className="w-full bg-[#03060c] border border-slate-800/80 rounded-lg py-2.5 pl-10 pr-4 text-xs font-mono text-slate-250 focus:outline-none focus:border-cyan-500/30"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={handleRAGSearch}
                        disabled={ragSearching}
                        className="px-4 py-2 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/30 text-cyan-300 font-mono text-xs font-bold rounded-lg cursor-pointer transition-all"
                      >
                        {ragSearching ? 'Searching...' : 'Search Vectors'}
                      </button>
                    </div>

                    {/* Results lists */}
                    <div className="space-y-3.5">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">Retrieved Content Chunks</span>
                      
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {ragResults.length > 0 ? (
                          ragResults.map((res, idx) => (
                            <div key={idx} className="bg-[#050811] p-4 rounded-xl border border-slate-905 font-mono text-xs flex gap-3">
                              <div className="bg-cyan-950/40 text-cyan-400 border border-cyan-550/20 rounded-lg p-2.5 h-max text-center shrink-0 min-w-[70px]">
                                <span className="text-[8px] text-slate-500 block">SIMILARITY</span>
                                <span className="font-bold">{(res.similarityScore * 100).toFixed(0)}%</span>
                              </div>

                              <div className="space-y-1.5 leading-relaxed">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                                  <span className="font-bold text-slate-200">{res.docTitle}</span>
                                </div>
                                <p className="text-slate-400">{res.chunkText}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-slate-600 text-center py-10 font-mono">
                            No retrieved vector chunks present. Input queries inside the console to scan the SCM library.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* TAB 4: AUTONOMOUS WORKFLOW LANDSCAPE (Requirement 6) */}
            {activeTab === 'workflows' && (
              <motion.div
                key="workflows-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-5">
                  <div className="flex justify-between items-center border-b border-indigo-505/10 pb-3">
                    <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Active Autonomous SCM Workflows</span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">SCHEDULING: AUTOMATED_TRIGGERS</span>
                  </div>

                  <div className="space-y-6">
                    {workflows.map(wf => (
                      <div key={wf.id} className="bg-[#050913] p-5 rounded-xl border border-slate-900 space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[9px] font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-500/25 px-1.5 py-0.5 rounded uppercase font-bold">
                              WF_ID // {wf.id}
                            </span>
                            <h4 className="text-sm font-bold text-slate-200 mt-1.5">{wf.name}</h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">{wf.description}</p>
                          </div>

                          <div className="text-right">
                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              wf.status === 'completed' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' : 'bg-cyan-950/40 text-cyan-400 border border-cyan-500/20 animate-pulse'
                            }`}>
                              {wf.status}
                            </span>
                          </div>
                        </div>

                        {/* Interactive flow path steps */}
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
                          {wf.steps.map((step: any, sIdx: number) => {
                            const stepActive = step.status === 'active';
                            const stepCompleted = step.status === 'completed';
                            return (
                              <div 
                                key={step.id} 
                                className={`p-3 rounded-lg border font-mono text-[10.5px] relative space-y-1 ${
                                  stepActive ? 'bg-[#0f1d3a]/60 border-[#03ccff]/40 text-cyan-200 shadow-[0_0_12px_rgba(0,217,255,0.04)] animate-pulse' :
                                  stepCompleted ? 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400' :
                                  'bg-transparent border-slate-900 text-slate-600'
                                }`}
                              >
                                <span className="text-[8px] text-slate-500 block uppercase">STAGE {sIdx + 1}</span>
                                <span className="font-bold block tracking-tight leading-tight">{step.name}</span>
                                <span className="text-[8.5px] text-indigo-400 block truncate mt-1">{step.assignedAgentId.replace('-agent', '')}</span>
                                
                                {step.requiresApproval && step.status !== 'completed' && (
                                  <span className="text-[8px] font-bold text-amber-400 bg-amber-950/40 border border-amber-500/20 px-1 py-0.2 rounded mt-1.5 block text-center uppercase">
                                    HITL Approval Gate
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 5: HUMAN-IN-THE-LOOP GOVERNANCE (Requirement 7) */}
            {activeTab === 'governance' && (
              <motion.div
                key="governance-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-5">
                  <div className="flex justify-between items-center border-b border-indigo-505/10 pb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Enterprise Human-In-The-Loop Approval Hub</span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 font-bold">GATE: AUDIT_SUPERVISOR_ROLE</span>
                  </div>

                  <div className="space-y-5">
                    {govItems.length > 0 ? (
                      govItems.map(item => {
                        const isPending = item.status === 'pending';
                        return (
                          <div key={item.id} className="bg-[#050913] p-5 rounded-xl border border-slate-900 flex flex-col md:flex-row gap-5 justify-between">
                            
                            {/* Request particulars */}
                            <div className="flex-1 space-y-3.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/25 px-1.5 py-0.5 rounded leading-none block font-bold">
                                  ID // {item.id}
                                </span>
                                <span className={`text-[9px] font-mono px-2 py-0.5 rounded block uppercase font-bold leading-none ${
                                  item.riskRating === 'Low' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                                  item.riskRating === 'Medium' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' :
                                  'bg-rose-950/40 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {item.riskRating} Risk Obligation
                                </span>
                              </div>

                              <div className="space-y-1 font-mono">
                                <span className="text-[10px] text-slate-500 block">DETERMINED DECISION DIRECTIVE</span>
                                <p className="text-xs font-bold text-slate-200">{item.actionRequested}</p>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono">
                                <div className="bg-[#03060b] p-2.5 rounded border border-slate-900/50">
                                  <span className="text-[8.5px] text-slate-500 block">AI CONFIDENCE LEVEL</span>
                                  <span className="text-xs font-bold text-[#00D9FF] block mt-0.5">{(item.confidence * 100).toFixed(0)}% Confidence Rating</span>
                                </div>
                                <div className="bg-[#03060b] p-2.5 rounded border border-slate-900/50">
                                  <span className="text-[8.5px] text-slate-500 block">TARGET DOMAIN TARGETEE</span>
                                  <span className="text-xs font-bold text-indigo-400 block mt-0.5 uppercase">{item.targetAgentId.replace('-agent', '')}</span>
                                </div>
                              </div>

                              <div className="text-xs text-slate-400 font-mono italic leading-relaxed bg-[#03060b] p-3 rounded-lg border border-slate-900/60">
                                <span className="font-bold text-slate-550 block text-[9.5px] uppercase mb-0.5">Automated Reasoning Motivation:</span>
                                "{item.reason}"
                              </div>
                            </div>

                            {/* Human audit decision controllers */}
                            <div className="w-full md:w-[250px] flex flex-col justify-between items-stretch gap-3 border-t md:border-t-0 md:border-l border-slate-900 pt-4 md:pt-0 md:pl-5 shrink-0">
                              <div className="space-y-1.5 font-mono">
                                <label className="text-[9.5px] text-slate-550 uppercase font-bold block">Operator Decision Feedback</label>
                                <textarea
                                  placeholder="Provide optional audit motivation remarks..."
                                  value={govFeedback[item.id] || ''}
                                  disabled={!isPending || submittingGovId === item.id}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGovFeedback(prev => ({ ...prev, [item.id]: val }));
                                  }}
                                  className="w-full bg-[#03060c] border border-slate-850 focus:border-cyan-500/25 rounded-lg p-2 text-xs font-mono text-slate-350 focus:outline-none placeholder-slate-700 leading-normal"
                                />
                              </div>

                              {isPending ? (
                                <div className="flex flex-col gap-2.5">
                                  <button
                                    onClick={() => handleResolveGov(item.id, 'approved')}
                                    disabled={submittingGovId === item.id}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 font-mono text-[10.5px] font-bold rounded-lg cursor-pointer transition-all"
                                  >
                                    <Check className="w-3.5 h-3.5" /> Approve Action
                                  </button>
                                  <div className="grid grid-cols-2 gap-2">
                                    <button
                                      onClick={() => handleResolveGov(item.id, 'rejected')}
                                      disabled={submittingGovId === item.id}
                                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-400 font-mono text-[9.5px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                    <button
                                      onClick={() => handleResolveGov(item.id, 'requested_review')}
                                      disabled={submittingGovId === item.id}
                                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-500/30 text-amber-400 font-mono text-[9.5px] font-bold rounded-lg cursor-pointer transition-all"
                                    >
                                      <HelpCircle className="w-3.5 h-3.5" /> Review
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="bg-[#03060b] p-3 rounded-lg border border-slate-900 text-center font-mono space-y-1.5">
                                  <span className="text-[8px] text-slate-500 block">COMMIT_DECISION_ARCHIVE</span>
                                  <span className={`text-[11px] font-bold uppercase block ${
                                    item.status === 'approved' ? 'text-emerald-400' : 'text-rose-400'
                                  }`}>
                                    {item.status} BY AUDITOR
                                  </span>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })
                    ) : (
                      <div className="text-slate-600 text-center py-10 font-mono">
                        No governance actions awaiting clearance. Operation loops verified safe.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB 6: STRESS TESTING SANDBOX (Requirement 13) */}
            {activeTab === 'simulation' && (
              <motion.div
                key="simulation-panel"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="glass-panel p-5 rounded-2xl border border-slate-800/40 space-y-4">
                  <div className="border-b border-indigo-505/10 pb-3">
                    <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Multi-Agent SCM Scenario Simulation Sandbox</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-1">
                      Execute testing scenarios onto KETRACO operations networks to stress-test agentic responses, router choices, and workflow configurations.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1">
                    {[
                      {
                        id: 'transformer',
                        title: 'Mariakani Transformer Core Failure Risk',
                        desc: 'Simulates biochemical heat leak of critical substation equipment. Expect Digital Twin simulation, risk alerts, and secondary spares lookup.',
                        agents: ['Digital Twin Simulator', 'Inventory Mind', 'Specialist']
                      },
                      {
                        id: 'strike',
                        title: 'Mombasa Custom Port Strike Blocking',
                        desc: 'Simulates harbor customs corridor backlogs on High Voltage cable logistics. Expect custom delay predictions and legal compliance penal damages extraction.',
                        agents: ['Logistics Dispatcher', 'Supplier Auditor', 'Contract Investigator']
                      },
                      {
                        id: 'regulatory',
                        title: 'PPRA Supplier Pricing Discrepancy',
                        desc: 'Simulates candidate pricing variations exceeding standard regulative limits (17% margin deviation). Expect compliance fraud audits and category consolidations.',
                        agents: ['Compliance Guardian', 'Strategic Sourcing Mind', 'Procurement Specialist']
                      }
                    ].map(sim => (
                      <div key={sim.id} className="bg-[#050913] p-5 rounded-xl border border-slate-900 flex flex-col justify-between space-y-4 relative overflow-hidden">
                        <div className="space-y-2">
                          <span className="text-[8.5px] font-mono text-[#00D9FF] bg-cyan-950/40 border border-cyan-500/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                            SCENARIO_CONFIG
                          </span>
                          <h4 className="text-xs font-bold text-slate-200 mt-2">{sim.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-mono">{sim.desc}</p>
                        </div>

                        <div className="space-y-3 pt-3 border-t border-slate-900/60">
                          <div>
                            <span className="text-[8.5px] font-mono text-slate-500 block uppercase">TRIGGER COGNITIVE AGENTS</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {sim.agents.map(ag => (
                                <span key={ag} className="px-1.5 py-0.5 text-[8.5px] font-mono text-indigo-300 font-bold bg-slate-950 border border-slate-900 rounded">
                                  {ag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <button
                            onClick={() => handleTriggerScenarioSim(sim.id)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-950/30 hover:bg-cyan-950/20 border border-indigo-500/30 hover:border-cyan-500/30 text-indigo-300 hover:text-cyan-400 font-mono text-[10px] font-bold rounded-lg cursor-pointer transition-all"
                          >
                            <Play className="w-3 h-3" /> Execute Scenario Stress
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Right Side: Persistent SCM Fabric Console Panel / Telemetry Streams */}
        <div className="w-[340px] border-l border-indigo-500/10 bg-[#070b14] flex flex-col justify-between shrink-0 hidden xl:flex">
          
          {/* Top Half: Real-time telemetry event bus stream */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 border-b border-indigo-505/10 flex justify-between items-center bg-[#090f1d]/40">
              <span className="text-xs font-bold font-mono tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                FABRIC EVENT BUS STREAM
              </span>
              <span className="text-[8.5px] text-slate-600 font-mono uppercase">REALTIME</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {timelineEvents.map((tEv, idx) => (
                <div key={idx} className="bg-slate-950/40 p-3 rounded-lg border border-slate-900 space-y-1.5 text-left font-mono">
                  <div className="flex justify-between items-center text-[9px] text-[#00D9FF]">
                    <span className="font-bold flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${tEv.type === 'success' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                      {tEv.title}
                    </span>
                    <span className="text-slate-650">[{tEv.time}]</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-normal">{tEv.desc}</p>
                </div>
              ))}

              {/* Ingested telemetry logs */}
              {telemetryLogs.map((log) => (
                <div key={log.id} className="bg-[#050811] p-3 rounded-lg border border-slate-905 space-y-1.5 text-left font-mono">
                  <div className="flex justify-between items-center text-[8.5px] text-indigo-400">
                    <span className="font-bold uppercase truncate max-w-[130px]">{log.agentName}</span>
                    <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-normal truncate">{log.task}</p>
                  <p className="text-[9.5px] text-slate-500 truncate">{String(log.result)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Half: Agent Manager Semantic variable learnings */}
          <div className="h-[220px] border-t border-indigo-500/10 flex flex-col min-h-0 bg-[#04070d]">
            <div className="p-4 border-b border-indigo-505/10 flex justify-between items-center bg-[#090f1d]/20">
              <span className="text-xs font-bold font-mono text-slate-400 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                COGNITIVE LEARNINGS MEMORY
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 min-h-0 leading-normal font-mono text-[10px]">
              {learnings.map((learning, idx) => (
                <div key={idx} className="bg-[#050914] p-2.5 rounded border border-indigo-500/5 text-slate-400 relative">
                  <span className="text-[7.5px] font-black text-cyan-400 uppercase tracking-widest block mb-0.5">Continuous Learning Pattern</span>
                  "{learning}"
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
