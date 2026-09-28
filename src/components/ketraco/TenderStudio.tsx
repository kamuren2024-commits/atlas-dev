import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, ShieldCheck, Scale, CheckCircle2, AlertTriangle, AlertCircle, 
  Sparkles, ScrollText, Plus, Trash, Eye, Settings, Briefcase, 
  ChevronRight, Play, Pause, RotateCcw, Lock, Unlock, Cpu, Clock, 
  UserCheck, Terminal, Fingerprint, FileSignature, ShieldAlert, BookOpen, Layers,
  Search, RefreshCw, BarChart2, TrendingUp, Users, GitMerge, Send, CheckSquare, Zap,
  Globe, Database, Sliders, Info, HardDrive, DollarSign, Activity, MapPin, Layers3, ArrowUpRight, ChevronDown, X
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { gsap } from 'gsap';

import {
  TenderCriteria, SCMBid, ProcurementPlanItem, SCMTender, SCMSupplier, SCMContract,
  INITIAL_PLAN_ITEMS, INITIAL_TENDERS, INITIAL_SUPPLIERS, INITIAL_CONTRACTS, INITIAL_BIDS, KNOWLEDGE_GRAPH_DATA
} from './tender/TenderMockData';
import { TenderIntelligenceProvider, TenderIntelligenceLayout, TenderCard, TenderAIButton, TenderDialog, TenderTable, TenderBadge } from './tender/TenderAITheme';
import TenderEvaluationWorkspace from './tender/TenderEvaluationWorkspace';
import EnterpriseEvaluationEngine from './tender/enterprise-evaluation/EnterpriseEvaluationEngine';
import { useTenant } from '../../context/TenantContext';
import { processAIRequest } from '../../utils/ai';

// Reusable GSAP Counter for numeric metrics
interface GsapCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function GsapCounter({ value, duration = 1.2, prefix = '', suffix = '', decimals = 0 }: GsapCounterProps) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    if (!elementRef.current) return;
    const obj = { val: prevValueRef.current };
    
    gsap.to(obj, {
      val: value,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        if (elementRef.current) {
          elementRef.current.innerText = prefix + obj.val.toFixed(decimals) + suffix;
        }
      }
    });
    
    prevValueRef.current = value;
  }, [value, duration, prefix, suffix, decimals]);

  return <span ref={elementRef} className="font-mono">{prefix}{value.toFixed(decimals)}{suffix}</span>;
}

const getEndpointDefaultPayload = (endpoint: string): string => {
  switch (endpoint) {
    case '/api/scm/context':
      return JSON.stringify({
        currentStage: 'Planning',
        currentPage: 'eGP Portal - Tender Upload',
        workflowProgress: 35,
        currentActivity: 'Reviewing technical specifications for substation conductors',
        procurementMethod: 'Open International Tender'
      }, null, 2);
    case '/api/scm/knowledge-retrieval':
      return JSON.stringify({
        query: 'Section 102',
        category: 'PPADA'
      }, null, 2);
    case '/api/scm/twin-simulation':
      return JSON.stringify({
        mombasaDelay: 6,
        steelPrice: 1200,
        currencyVolatility: 5
      }, null, 2);
    case '/api/scm/agent-gateway/call':
      return JSON.stringify({
        agentName: 'Compliance Sentinel',
        prompt: 'Check local inventory compliance under Sec 102.'
      }, null, 2);
    case '/api/scm/human-oversight/resolve':
      return JSON.stringify({
        id: 'GOV-8820',
        decision: 'approved',
        feedback: 'Approved by executive override under Section 102.'
      }, null, 2);
    default:
      return '{}';
  }
};

interface TenderStudioProps {
  onAskCopilot?: (prompt: string) => void;
}

export default function TenderStudio({ onAskCopilot }: TenderStudioProps) {
  const { currentTenant } = useTenant();
  const primaryColor = currentTenant.theme.primary;

  // Navigation State (16 tabs for Phase 18 Integration)
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'planning' | 'tenders' | 'authoring' | 'suppliers' | 'bids' | 'contracts' | 'risk' | 'compliance' | 'rules' | 'analytics' | 'graph' | 'agents' | 'twin' | 'egp' | 'integration'
  >(() => {
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('/evaluation') || p.includes('/bids')) return 'bids';
    }
    return 'dashboard';
  });

  // URL synchronization for Tender Intelligence sub-routes (Evaluation OS deep linking)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('/evaluation') || p.includes('/bids')) {
        setActiveTab('bids');
      } else if (p === '/tender' || p === '/tender/') {
        setActiveTab('dashboard');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentPath = window.location.pathname.toLowerCase();
    if (activeTab === 'bids') {
      if (!currentPath.includes('/evaluation')) {
        window.history.pushState({ tab: 'bids' }, '', '/tender/evaluation-os');
      }
    } else {
      if (currentPath.includes('/evaluation')) {
        window.history.pushState({ tab: activeTab }, '', '/tender');
      }
    }
  }, [activeTab]);

  // Collapsible Sidebar State (with localStorage persistence)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('tender_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('tender_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
    } catch (e) {
      console.warn('Failed to save sidebar state to localStorage:', e);
    }
  }, [isSidebarCollapsed]);

  // Core SCM States
  const [planItems, setPlanItems] = useState<ProcurementPlanItem[]>(INITIAL_PLAN_ITEMS);
  const [tenders, setTenders] = useState<SCMTender[]>(INITIAL_TENDERS);
  const [suppliers, setSuppliers] = useState<SCMSupplier[]>(INITIAL_SUPPLIERS);
  const [contracts, setContracts] = useState<SCMContract[]>(INITIAL_CONTRACTS);
  const [bids, setBids] = useState<SCMBid[]>(INITIAL_BIDS);

  const [selectedTenderId, setSelectedTenderId] = useState<string>("TND-2026-001");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>("SPL-003");
  const [selectedContractId, setSelectedContractId] = useState<string>("CTR-2026-809");

  // 15-Stage PPADA Autonomous Core Simulation State
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1000);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeStageId, setActiveStageId] = useState<number>(1);
  const [pinInput, setPinInput] = useState('');
  const [commentInput, setCommentInput] = useState('');
  const [signingError, setSigningError] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  // Floating Agent Panel States
  const [isAgentPanelExpanded, setIsAgentPanelExpanded] = useState(true);
  const [copilotPanelTab, setCopilotPanelTab] = useState<'reasoning' | 'chat'>('chat');
  const [agentReasoningStep, setAgentReasoningStep] = useState<string>("Standby - Awaiting process kickoff");
  const [agentConfidence, setAgentConfidence] = useState<number>(98);
  const [tokensConsumed, setTokensConsumed] = useState<number>(2450);

  // Workflow Stages modeled precisely after PPADA 2015 & PPADR 2020
  const [stages, setStages] = useState([
    { id: 1, name: "Need Identification", section: "Section 44", requiresHITL: false, status: 'LOCKED_AWAITING_HITL', thoughts: "[SCM Planner] Core transmission expansion need identified. Sourcing envelope generated.", confidence: 98, nextAction: "Submit for department plan alignment" },
    { id: 2, name: "ERP Budget Check", section: "Section 45", requiresHITL: false, status: 'PENDING', thoughts: "[SCM Core] Querying financial envelope ledger. Budget allocation matches board plans.", confidence: 99, nextAction: "Initiate category planning check" },
    { id: 3, name: "Planning Alignment", section: "Section 45(2)", requiresHITL: true, hitlRole: "SCM Director", status: 'PENDING', thoughts: "[Planner Agent] Comparing against approved annual procurement plan. Safe from duplicates.", confidence: 95, nextAction: "Verify local market pricing index" },
    { id: 4, name: "Sourcing Method Rec", section: "Section 92", requiresHITL: false, status: 'PENDING', thoughts: "[Compliance Agent] Threshold evaluated. Recommended: Open International competitive tender.", confidence: 92, nextAction: "Generate risk mitigation plan" },
    { id: 5, name: "Risk Assessment", section: "Section 95", requiresHITL: false, status: 'PENDING', thoughts: "[Risk Agent] Price volatility score computed: 28%. Standstill windows marked.", confidence: 94, nextAction: "Enforce preliminary compliance filters" },
    { id: 6, name: "Compliance Check", section: "Section 45/96", requiresHITL: false, status: 'PENDING', thoughts: "[Compliance Agent] Standard regulatory checks passed. Essential document templates loaded.", confidence: 97, nextAction: "Acquire Accounting Officer signature" },
    { id: 7, name: "Human Authorization", section: "Section 45", requiresHITL: true, hitlRole: "Accounting Officer", status: 'PENDING', thoughts: "[Compliance Gate] Mandatory sign-off required before public tender advertisement.", confidence: 96, nextAction: "Publish tender on PPIP gateway" },
    { id: 8, name: "Tender Publication", section: "Section 96", requiresHITL: false, status: 'PENDING', thoughts: "[Scribe Agent] Formulating PPIP payload. Preparing automatic 21-day standstill clock.", confidence: 98, nextAction: "Monitor incoming supplier bids" },
    { id: 9, name: "Supplier Monitoring", section: "Section 70", requiresHITL: false, status: 'PENDING', thoughts: "[Supplier Agent] Fetching registered SCM suppliers. Verifying regulatory credentials.", confidence: 91, nextAction: "Receive secure encrypted submissions" },
    { id: 10, name: "Secure Cryptographic Box", section: "Section 120", requiresHITL: false, status: 'PENDING', thoughts: "[Fraud Agent] Initializing SHA-256 secure hash locking on binary proposal uploads.", confidence: 99, nextAction: "Perform bid intelligence analysis" },
    { id: 11, name: "Bid Intelligence", section: "Section 78/80", requiresHITL: false, status: 'PENDING', thoughts: "[Bid Intel] Evaluating technical, pricing, and collusion factors on 3 submissions.", confidence: 89, nextAction: "Conduct formal committee evaluation" },
    { id: 12, name: "Evaluation Support", section: "Section 80/82", requiresHITL: true, hitlRole: "Evaluation Committee", status: 'PENDING', thoughts: "[Bid Intel] Formulating compliant scorecard rankings based on active weights.", confidence: 93, nextAction: "Draft professional SCM head memo" },
    { id: 13, name: "Award Recommendation", section: "Section 84", requiresHITL: true, hitlRole: "Head of Supply Chain", status: 'PENDING', thoughts: "[Executive Advisor] Consolidated audit trail compiled. Notice of Intent to Award ready.", confidence: 96, nextAction: "Request MD final contract approval" },
    { id: 14, name: "Human Award Approval", section: "Section 86", requiresHITL: true, hitlRole: "Accounting Officer", status: 'PENDING', thoughts: "[Compliance Gate] Reviewing professional opinion. Ready for formal award publication.", confidence: 95, nextAction: "Initiate contract administration stage" },
    { id: 15, name: "Contract Admin", section: "Section 150", requiresHITL: false, status: 'PENDING', thoughts: "[Contract Agent] Binding performance bond covenants. Active project delivery tracking live.", confidence: 94, nextAction: "Complete compliance audit bundle" }
  ]);

  // Executive alerts stream
  const [executiveLogs, setExecutiveLogs] = useState<string[]>([
    "🎯 PPADA RULE COMPLIANT: Active pipeline spend volume stands at $6.35M. Compliance score index: 98.4%.",
    "⚠️ HIGH SUPPLY CHAIN RISK: Shanghai Grid Metal Corp flagged with 78% delivery reliability due to shipping lane delays.",
    "💡 SAVINGS OPPORTUNITY: Open tender sourcing for Nanyuki Substation can compress acquisition cost by 14.5% ($65,250)."
  ]);

  // AI Authoring Workspace States
  const [authoringTitle, setAuthoringTitle] = useState("Suswa Substation Grid-Tie Transformers Replacement");
  const [authoringTemplate, setAuthoringTemplate] = useState("Technical Specifications");
  const [authoringDraft, setAuthoringDraft] = useState("");
  const [isDrafting, setIsDrafting] = useState(false);
  const [costEstimateUSD, setCostEstimateUSD] = useState<number>(3500000);

  // Bid Rubrics Weights
  const [rubrics, setRubrics] = useState<TenderCriteria[]>([
    { id: "1", name: "Financial Benchmark Competitiveness", weight: 40 },
    { id: "2", name: "Technical Grid Engineering Quality", weight: 30 },
    { id: "3", name: "SLA and Historical Reliability Index", weight: 15 },
    { id: "4", name: "In-Country Manufacturing Capacity Ratio", weight: 15 }
  ]);
  const [newCriteriaName, setNewCriteriaName] = useState('');
  const [newCriteriaWeight, setNewCriteriaWeight] = useState(10);
  const [committeeNote, setCommitteeNote] = useState("Scoring verified across 5 panel members. Pricing corrections completed.");

  // Planning Workspace states
  const [newDept, setNewDept] = useState("Operations & Maintenance");
  const [newProjName, setNewProjName] = useState("");
  const [newProjBudget, setNewProjBudget] = useState("");
  const [planningNotification, setPlanningNotification] = useState<string | null>(null);

  // Continuous compliance engine flags
  const [globalComplianceOverride, setGlobalComplianceOverride] = useState(true);
  const [segregationOfDuties, setSegregationOfDuties] = useState(true);
  const [riskHeatmapActive, setRiskHeatmapActive] = useState<string | null>(null);

  // eGP Integration active sync status
  const [egpStatusLog, setEgpStatusLog] = useState<string[]>([
    "System API initialized. Handshake listener bound to port :3000",
    "Ready: PPIP Portal Sync Protocol Adapter v2.1"
  ]);
  const [isSyncingEGP, setIsSyncingEGP] = useState(false);

  // SCM Agent Interactive Console Query & Multi-agent collaboration simulator
  const [agentActivePrompt, setAgentActivePrompt] = useState("");
  const [selectedAgent, setSelectedAgent] = useState("Planner");
  const [agentThoughtsLog, setAgentThoughtsLog] = useState<string[]>([
    "[SCM Planner Agent] Strategic demand calendars loaded. Standing by.",
    "[Tender Author Agent] Standard specs repository prepared for execution."
  ]);
  const [isCollaborating, setIsCollaborating] = useState(false);

  // Persistent AI Memory
  const [aiMemoryLogs, setAiMemoryLogs] = useState([
    { id: "MEM-01", timestamp: "2026-06-28 14:00", description: "Flagged high voltage cable pricing anomaly on TND-2025-098.", category: "Audit Pattern" },
    { id: "MEM-02", timestamp: "2026-06-29 09:12", description: "Identified supplier 'Shanghai Grid' ocean logistics lane blockages.", category: "Risk Mitigation" }
  ]);

  // Enterprise Decision Rules State
  const [rules, setRules] = useState([
    { id: "R-1", trigger: "Supplier Trust Score < 80", action: "Flag High Risk & Escalate", enabled: true },
    { id: "R-2", trigger: "Budget Deviation > 10%", action: "Block Initiation Flow", enabled: true },
    { id: "R-3", trigger: "Variation Value > 25% (Section 139)", action: "Block & Force Re-tender", enabled: true }
  ]);
  const [newRuleTrigger, setNewRuleTrigger] = useState("Supplier Trust Score < 75");
  const [newRuleAction, setNewRuleAction] = useState("Block Tender Publication");

  // Procurement Digital Twin Simulation State
  const [selectedScenario, setSelectedScenario] = useState<'none' | 'freight' | 'currency' | 'emergency'>('none');
  const [isSimulatingTwin, setIsSimulatingTwin] = useState(false);
  const [twinSimulationOutput, setTwinSimulationOutput] = useState<{
    delayWeeks: number;
    costImpactUSD: number;
    riskScore: number;
    governanceCode: string;
    advice: string;
  } | null>(null);

  // Selected knowledge graph node
  const [graphSelectedNode, setGraphSelectedNode] = useState<string | null>("S3");

  // ==========================================
  // REAL-TIME ENTERPRISE AI STATES & ORCHESTRATOR
  // ==========================================
  // --- Phase 17 Autonomous OS States ---
  
  // 1. Enterprise Event Bus
  interface ProcurementEvent {
    id: string;
    type: string;
    title: string;
    timestamp: string;
    source: string;
    status: 'PROCESSED' | 'TRIGGERED' | 'MONITORED' | 'FAILED';
    details: string;
  }
  const [procurementEvents, setProcurementEvents] = useState<ProcurementEvent[]>([
    { id: "EVT-801", type: "Tender Published", title: "Suswa-Olkaria II 132kV Interconnector Cable Kit Published on PPIP Portal", timestamp: "10:15:32 AM", source: "PPIP Gateway", status: "PROCESSED", details: "Handshake verified. 21-day standstill clock initiated." },
    { id: "EVT-802", type: "Budget Updated", title: "Financial Envelope Ledger increased Q3 Capital allocations by 15%", timestamp: "09:42:11 AM", source: "ERP Capex Ledger", status: "PROCESSED", details: "Allocation expanded. Affected plans: Suswa, Marianaki Comp." },
    { id: "EVT-803", type: "Bid Submitted", title: "Secure Proposal Submission received from Siemens Eastern Africa Ltd", timestamp: "08:12:05 AM", source: "Cryptographic Vault", status: "PROCESSED", details: "SHA-256 seal stored. Missing documents: Checked." },
    { id: "EVT-804", type: "Risk Exceeded", title: "Shanghai Grid Metal Corp logistics tracking index dropped below 80%", timestamp: "07:30:15 AM", source: "Logistics Twin", status: "PROCESSED", details: "Shipment vessel delayed in Mombasa port. Standby alerts triggered." },
    { id: "EVT-805", type: "Compliance Alert", title: "Duplicate material requirement check triggered for Marianaki Station", timestamp: "06:12:44 AM", source: "Compliance Sentinel", status: "PROCESSED", details: "Section 54 split procurement check: Safe." },
  ]);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventType, setNewEventType] = useState("Tender Published");

  // 2. Multi-Agent Orchestrator Status
  const [orchestratorStatus, setOrchestratorStatus] = useState<'Idle' | 'Selecting Agents' | 'Parallel Analysis' | 'Resolving Conflicts' | 'Graph Compiled'>('Idle');
  const [orchestratedLogs, setOrchestratedLogs] = useState<string[]>([
    "[Orchestrator] Multi-agent bus standing by for enterprise events.",
    "[Orchestrator] Dynamic agent capability indexing complete."
  ]);

  // 3. Persistent SCM Memory
  interface SCMRecall {
    id: string;
    title: string;
    category: 'Fraud Pattern' | 'Lessons Learned' | 'Cost Trends' | 'Standard Specs';
    year: string;
    resolution: string;
  }
  const [scmMemory, setScmMemory] = useState<SCMRecall[]>([
    { id: "MEM-01", title: "Suswa transformer tender collusion anomaly", category: "Fraud Pattern", year: "2024", resolution: "Tender annulled, 3 international suppliers blacklisted. Standardized anti-collusion rubrics introduced." },
    { id: "MEM-02", title: "Naivasha corridor wind substation delay", category: "Lessons Learned", year: "2025", resolution: "Discovered standard tower steel imports faced +8 weeks ocean delay. Standard specifications now enforce 20% domestic sourcing ratio." },
    { id: "MEM-03", title: "Heavy power line pricing baseline spikes", category: "Cost Trends", year: "2026", resolution: "Commodity index (copper/steel) increased by 18.5%. Set dynamic price variation thresholds inside standard SCM rules." },
    { id: "MEM-04", title: "Substation switchgear technical standard IEC-60826", category: "Standard Specs", year: "2025", resolution: "Approved by National Grid Council. Standardized template for authoring transformer tenders." }
  ]);
  const [memorySearch, setMemorySearch] = useState("");
  // learning loop input states
  const [learnTitle, setLearnTitle] = useState("");
  const [learnCategory, setLearnCategory] = useState<'Fraud Pattern' | 'Lessons Learned' | 'Cost Trends' | 'Standard Specs'>("Lessons Learned");
  const [learnResolution, setLearnResolution] = useState("");
  const [learnNotification, setLearnNotification] = useState<string | null>(null);

  // --- Phase 18 Salience Atlas Copilot Integration Layer States ---
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('/api/scm/context');
  const [endpointPayload, setEndpointPayload] = useState<string>(
    JSON.stringify({
      currentStage: 'Planning',
      currentPage: 'eGP Portal - Tender Upload',
      workflowProgress: 35,
      currentActivity: 'Reviewing technical specifications for substation conductors',
      procurementMethod: 'Open International Tender'
    }, null, 2)
  );
  const [playgroundResponse, setPlaygroundResponse] = useState<any>(null);
  const [isPlaygroundLoading, setIsPlaygroundLoading] = useState<boolean>(false);

  // 4. Interactive Decision Graph Nodes
  interface DecisionGraphNode {
    id: string;
    label: string;
    type: 'Trigger' | 'Agent' | 'Evidence' | 'Risk' | 'Recommendation';
    status: 'OK' | 'WARNING' | 'CRITICAL';
    details: {
      summary: string;
      auditCode: string;
      trustRating: string;
      justification: string;
      nextActions: string[];
    };
    confidence: number;
    relatedRecord?: string;
  }
  const [selectedGraphNode, setSelectedGraphNode] = useState<DecisionGraphNode | null>(null);
  const decisionNodes: DecisionGraphNode[] = [
    {
      id: "TRG-1",
      label: "EVT-804: Logistics Blockage",
      type: "Trigger",
      status: "CRITICAL",
      details: {
        summary: "Logistics tracking data shows Mombasa Port container backlog at peak congestion. Delay projected at +6 weeks.",
        auditCode: "PPADA Sec 150",
        trustRating: "100%",
        justification: "Real-time vessel and berth delay logs imported via API integration.",
        nextActions: ["Trigger alternate routing", "Alert local supply managers"]
      },
      confidence: 100
    },
    {
      id: "AGT-1",
      label: "SCM Risk Agent Analysis",
      type: "Agent",
      status: "WARNING",
      details: {
        summary: "Computed Shanghai Grid Metal Corp trust score decline from 85 to 68. Traced alternate local fabricators.",
        auditCode: "PPADA Sec 157",
        trustRating: "94%",
        justification: "Risk simulation of supplier performance under increased congestion constraints.",
        nextActions: ["Assess local hardware stock", "Draft standby tender specs"]
      },
      confidence: 94
    },
    {
      id: "EVD-1",
      label: "Siemens Nairobi Spares",
      type: "Evidence",
      status: "OK",
      details: {
        summary: "Verified local inventory of standard 132kV interconnector cables has 12 items matching specifications in Naivasha corridor.",
        auditCode: "PPADA Sec 102",
        trustRating: "98%",
        justification: "Direct physical audit confirmation of warehouse inventory logs.",
        nextActions: ["Draft reserve requisition", "Verify price lock status"]
      },
      confidence: 98,
      relatedRecord: "SPL-003"
    },
    {
      id: "RSK-1",
      label: "Contract Penalty Limits",
      type: "Risk",
      status: "WARNING",
      details: {
        summary: "Liquidated damages clause caps delay penalties at 10% under PPADA Section 150. Shanghai Grid contract variation is high-risk.",
        auditCode: "PPADA Sec 150",
        trustRating: "91%",
        justification: "Contract legal clause Ingestion and statutory boundary matching.",
        nextActions: ["Enforce maximum liquidated penalties", "Engage external legal opinion"]
      },
      confidence: 91
    },
    {
      id: "REC-1",
      label: "Activate Standby Local Supply",
      type: "Recommendation",
      status: "OK",
      details: {
        summary: "Formally activate local supply from Siemens Nairobi, reserving foreign orders. Apply Section 150 penalty terms.",
        auditCode: "PPADA Sec 102",
        trustRating: "96%",
        justification: "Consolidated recommendation to avoid transmission standstill on Suswa/Naivasha link.",
        nextActions: ["Submit approval to Human oversight", "Prepare direct award requisition"]
      },
      confidence: 96,
      relatedRecord: "TND-2026-001"
    }
  ];

  // 5. Compliance Sentinel States
  const [enforceStrictPPADA, setEnforceStrictPPADA] = useState(true);
  const [sentinelLogs, setSentinelLogs] = useState<{ id: string; name: string; section: string; status: 'PASS' | 'WARNING' | 'BLOCK'; desc: string }[]>([
    { id: "SEN-01", name: "Split Procurement Filter", section: "Section 54(2)", status: "PASS", desc: "No overlapping grid asset requests detected for Substation category." },
    { id: "SEN-02", name: "Advertisement Time window", section: "Section 96(1)", status: "PASS", desc: "All open international tender wait-times set to standard 28-day response window." },
    { id: "SEN-03", name: "Contract Amendment Ceiling", section: "Section 139", status: "PASS", desc: "Cumulative contract variations are within the statutory 25% boundary of primary values." },
    { id: "SEN-04", name: "Citizen Sourcing Threshold", section: "Section 157", status: "PASS", desc: "Local sourcing quota matches default 20% grid hardware requirement." }
  ]);

  // 6. Executive Digital Briefing Selector
  const [briefingAudience, setBriefingAudience] = useState<'exec' | 'scm' | 'finance' | 'audit' | 'board'>('exec');

  // 7. Human Oversight Decision Manager
  interface RecommendationApproval {
    id: string;
    title: string;
    summary: string;
    evidence: string;
    impact: string;
    confidence: number;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Deferred';
    comments?: string;
  }
  const [pendingApprovals, setPendingApprovals] = useState<RecommendationApproval[]>([
    {
      id: "REC-AP-01",
      title: "Activate Standby Local Cable Stock",
      summary: "Substitute Mombasa-blocked imports with local stock from Siemens Nairobi under PPADA Section 150 standard deviation protocol.",
      evidence: "Physical stock level is 12 items. Direct matching of specifications.",
      impact: "Zero delay penalty, but +4.5% premium pricing absorbed.",
      confidence: 96,
      status: "Pending"
    },
    {
      id: "REC-AP-02",
      title: "Initiate Restricted Tendering for Naivasha fiber link",
      summary: "Shift from open competitive to restricted tender scope to accelerate delivery of crucial fiber optic cable deployment.",
      evidence: "Only 3 pre-registered suppliers satisfy standard high-voltage integration capacity.",
      impact: "Reduces procurement cycle by 14 days.",
      confidence: 92,
      status: "Pending"
    },
    {
      id: "REC-AP-03",
      title: "Impose Shanghai Grid Contract Delay Penalty",
      summary: "Apply standard 0.5% weekly delay penalty cap up to 10% on Suswa-Olkaria II transformer contract.",
      evidence: "Milestone dispatch has exceeded the approved 45-day standstill window.",
      impact: "Recovers $12,000 in liquidated damages.",
      confidence: 95,
      status: "Pending"
    }
  ]);
  const [decisionHistory, setDecisionHistory] = useState<{ id: string; action: 'Approved' | 'Rejected' | 'Deferred'; comments: string; timestamp: string }[]>([]);
  const [approvalComment, setApprovalComment] = useState("");

  // --- Phase 19: Autonomous Procurement Decision Intelligence Engine (APDIE) State ---
  const [autonomousEntities, setAutonomousEntities] = useState<any[]>([]);
  const [approvalGates, setApprovalGates] = useState<any[]>([]);
  const [apdieLogs, setApdieLogs] = useState<any[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string>('ENT-007');
  const [resolveFeedback, setResolveFeedback] = useState<string>('');
  const [resolvingGateId, setResolvingGateId] = useState<string | null>(null);
  const [graphMode, setGraphMode] = useState<'static' | 'dynamic'>('static');
  const [selectedDynamicNodeId, setSelectedDynamicNodeId] = useState<string>('ENT-007');

  // Poll APDIE Real-time Backend
  useEffect(() => {
    const fetchAPDIEData = async () => {
      try {
        const entRes = await fetch('/api/scm/procurement-intelligence/entities');
        const entData = await entRes.json();
        if (entData.success) setAutonomousEntities(entData.entities);

        const gateRes = await fetch('/api/scm/procurement-intelligence/approval-gates');
        const gateData = await gateRes.json();
        if (gateData.success) setApprovalGates(gateData.gates);

        const logRes = await fetch('/api/scm/procurement-intelligence/logs');
        const logData = await logRes.json();
        if (logData.success) setApdieLogs(logData.logs);
      } catch (err) {
        console.error('Error fetching APDIE data:', err);
      }
    };

    fetchAPDIEData();
    const interval = setInterval(fetchAPDIEData, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleResolveGate = async (gateId: string, status: 'APPROVED' | 'REJECTED') => {
    setResolvingGateId(gateId);
    try {
      const res = await fetch(`/api/scm/procurement-intelligence/approval-gates/${gateId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback: resolveFeedback })
      });
      const data = await res.json();
      if (data.success) {
        setResolveFeedback('');
        // Immediately trigger refresh
        const entRes = await fetch('/api/scm/procurement-intelligence/entities');
        const entData = await entRes.json();
        if (entData.success) setAutonomousEntities(entData.entities);

        const gateRes = await fetch('/api/scm/procurement-intelligence/approval-gates');
        const gateData = await gateRes.json();
        if (gateData.success) setApprovalGates(gateData.gates);
      }
    } catch (err) {
      console.error('Error resolving approval gate:', err);
    } finally {
      setResolvingGateId(null);
    }
  };

  // 8. Scenario Sliders for twin simulator
  const [mombasaDelaySlider, setMombasaDelaySlider] = useState<number>(0);
  const [steelPriceSlider, setSteelPriceSlider] = useState<number>(0); // percent deviation
  const [currencyVolatilitySlider, setCurrencyVolatilitySlider] = useState<number>(0); // percent deviation

  // 9. SCM AI Readiness Metrics
  const [aposMetrics, setAposMetrics] = useState({
    acceptanceRate: 94.2,
    avgResponseMs: 120,
    completionRate: 96.5,
    sentinelInterventions: 2.1,
    forecastAccuracy: 91.8,
    riskPredictionAccuracy: 95.4,
    contractDelayAccuracy: 93.6,
    cycleOptimizationWeeks: 4.8
  });

  const triggerCustomEvent = (title: string, type: string) => {
    const eventId = `EVT-${Math.floor(Math.random() * 900) + 100}`;
    const newEvent: ProcurementEvent = {
      id: eventId,
      type,
      title: title || `Simulated ${type} Event`,
      timestamp: new Date().toLocaleTimeString(),
      source: "Enterprise Event Bus",
      status: 'TRIGGERED',
      details: "Spawning multi-agent orchestrator. Initializing parallel compliance & risk audits..."
    };

    setProcurementEvents(prev => [newEvent, ...prev]);
    setOrchestratorStatus('Selecting Agents');
    setOrchestratedLogs(prev => [
      `[${newEvent.timestamp}] 🚀 [EVENT DETECTED]: "${newEvent.title}" (${type})`,
      `[${newEvent.timestamp}] 🧠 [ORCHESTRATOR]: Selecting specialized SCM agent nodes...`,
      ...prev
    ]);

    // Fast-forward orchestrator sequence
    setTimeout(() => {
      setOrchestratorStatus('Parallel Analysis');
      setOrchestratedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] ⚙️ [PARALLEL ANALYSIS]: Dispatching Risk Analyst Agent & Compliance Sentinel...`,
        `[${new Date().toLocaleTimeString()}] 📊 [PLANNER AGENT]: Checking budget envelope alignment for event: "${newEvent.title}"`,
        ...prev
      ]);
    }, 800);

    setTimeout(() => {
      setOrchestratorStatus('Resolving Conflicts');
      
      // Perform automated Compliance Sentinel check for the event type
      let warningDetected = false;
      let checkName = "Dynamic Event Compliance";
      let section = "Section 45";
      let desc = "Safe";
      let status: 'PASS' | 'WARNING' | 'BLOCK' = 'PASS';

      if (type === 'Procurement Plan Amended') {
        checkName = "Procurement Plan Split Check";
        section = "Section 54(2)";
        if (enforceStrictPPADA) {
          status = "WARNING";
          desc = "Potential split procurement detected. Verifying project scope distinctiveness.";
          warningDetected = true;
        }
      } else if (type === 'Tender Published') {
        checkName = "Standstill Period Check";
        section = "Section 96(1)";
        desc = "Standstill period set to standard 28-day public window. Standard passed.";
      }

      if (warningDetected) {
        setSentinelLogs(prev => [
          { id: `SEN-${Date.now().toString().slice(-3)}`, name: checkName, section, status, desc },
          ...prev
        ]);
        setExecutiveLogs(prev => [
          `⚠️ COMPLIANCE SENTINEL DETECTED: Potential issue in event "${title}" under ${section}!`,
          ...prev
        ]);
      }

      setOrchestratedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 🤝 [CONFLICT RESOLUTION]: Merging outputs, resolving rules, and enforcing compliance safeguards...`,
        ...prev
      ]);
    }, 1600);

    setTimeout(() => {
      setOrchestratorStatus('Graph Compiled');
      setProcurementEvents(current => current.map(e => e.id === eventId ? { ...e, status: 'PROCESSED', details: "Agents dispatched, compliance filters verified, and decision graph refreshed." } : e));
      setOrchestratedLogs(prev => [
        `[${new Date().toLocaleTimeString()}] 🛰️ [DECISION GRAPH COMPILED]: Reasoning nodes and evidence fully indexed for audit trail.`,
        ...prev
      ]);
      setExecutiveLogs(prev => [
        `🎯 [AUTONOMOUS EVENT PROCESSED] ${type}: "${title || 'Event'}" successfully mapped.`,
        ...prev
      ]);
    }, 2400);
  };

  const handleCompletedProcurementLearning = (e: React.FormEvent) => {
    e.preventDefault();
    if (!learnTitle || !learnResolution) {
      setLearnNotification("❌ Project Title and Outcomes/Resolution comments are mandatory.");
      return;
    }

    const newMemory: SCMRecall = {
      id: `MEM-${Math.floor(Math.random() * 900) + 100}`,
      title: learnTitle,
      category: learnCategory,
      year: "2026",
      resolution: learnResolution
    };

    setScmMemory(prev => [newMemory, ...prev]);
    setLearnTitle("");
    setLearnResolution("");
    setLearnNotification("✅ Project outcomes, variance audits, and compliance feedback committed to Organizational Memory!");
    
    // Improve metrics
    setAposMetrics(prev => ({
      ...prev,
      acceptanceRate: Math.min(99.5, prev.acceptanceRate + 0.4),
      forecastAccuracy: Math.min(99.5, prev.forecastAccuracy + 0.3),
      cycleOptimizationWeeks: Number((prev.cycleOptimizationWeeks + 0.1).toFixed(2))
    }));

    setTimeout(() => setLearnNotification(null), 5000);
  };

  const handleApprovalDecision = (id: string, action: 'Approved' | 'Rejected' | 'Deferred') => {
    setPendingApprovals(prev => prev.map(rec => rec.id === id ? { ...rec, status: action, comments: approvalComment || 'Decision logged by Human Coordinator.' } : rec));
    
    const newLog = {
      id,
      action,
      comments: approvalComment || 'Decision logged by Human Coordinator.',
      timestamp: new Date().toLocaleTimeString()
    };
    setDecisionHistory(prev => [newLog, ...prev]);
    setApprovalComment("");

    setExecutiveLogs(prev => [
      `👤 [HUMAN DECISION REGISTERED] Recommendation "${id}" was ${action.toUpperCase()}. Audit trail updated.`,
      ...prev
    ]);
  };

  const [activeAIResponse, setActiveAIResponse] = useState<string>('');
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [currentAgentProgress, setCurrentAgentProgress] = useState<string>('');
  const [aiPanelOpen, setAiPanelOpen] = useState<boolean>(false);
  
  // Floating Interactive Copilot Chat State
  const [copilotHistory, setCopilotHistory] = useState<{ sender: 'user' | 'agent'; text: string; timestamp: string }[]>([
    { sender: 'agent', text: "### Tender AI Agent Online\n\nWelcome to your dedicated **Tender Intelligence Copilot**. I have indexed all active capex plans, 3 core vendor bids, legal PPADA compliance constraints, and current contract milestones.\n\nAsk me anything about active tenders, delivery risks, compliance bottlenecks, or generate custom reports.", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [copilotChatInput, setCopilotChatInput] = useState<string>('');
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

  // Simple Markdown to elegant HTML parser
  const formatMarkdown = (text: string): string => {
    if (!text) return '';
    let html = text;
    // Replace headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-xs font-bold text-[var(--primary-brand)] uppercase tracking-wider mt-3 mb-2 flex items-center gap-1.5">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-sm font-bold text-white/95 tracking-wide mt-4 mb-2">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-base font-bold text-white tracking-normal mt-5 mb-3">$1</h1>');
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white/95">$1</strong>');
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em class="italic text-white/70">$1</em>');
    // List items - bullet
    html = html.replace(/^\s*[\-\*]\s+(.*$)/gim, '<li class="list-none flex items-start gap-1.5 ml-1 my-1.5 text-white/70"><span class="text-[var(--primary-brand)] font-bold font-mono">▪</span> <span>$1</span></li>');
    // Ordered list
    html = html.replace(/^\s*(\d+)\.\s+(.*$)/gim, '<li class="list-none flex items-start gap-1.5 ml-1 my-1.5 text-white/70"><span class="text-[var(--primary-brand)] font-mono font-bold">$1.</span> <span>$2</span></li>');
    // Line breaks
    html = html.split('\n').join('<br/>');
    return html;
  };

  const triggerAIAction = async (taskName: string, promptText: string, sysInstruction?: string) => {
    setIsAiProcessing(true);
    setAiPanelOpen(true);
    setActiveAIResponse('');
    
    const stagesList = [
      "Initializing specialized agent coordinator...",
      "Assigning task to Planning, Market & Compliance agents...",
      "Retrieving context records and semantic indices...",
      "Analyzing pricing thresholds, legal PPADA parameters, and past supplier history...",
      "Formulating explainable, risk-scored strategic recommendation..."
    ];
    
    for (let i = 0; i < stagesList.length; i++) {
      setCurrentAgentProgress(stagesList[i]);
      setAgentReasoningStep(stagesList[i]);
      await new Promise(resolve => setTimeout(resolve, 550));
    }
    
    try {
      const response = await processAIRequest({
        module: 'orchestrator',
        prompt: promptText,
        systemInstruction: sysInstruction || `You are the Salience Atlas Tender Intelligence Brain, a professional multi-agent system complying strictly with the Kenya PPADA 2015 act. Answer thoroughly in clean Markdown with citations and clear, evidence-backed options.`
      });
      
      setActiveAIResponse(response.text);
      setAgentConfidence(Math.floor(92 + Math.random() * 8));
      setTokensConsumed(prev => prev + Math.floor(800 + Math.random() * 400));
      setAgentReasoningStep("Task completed successfully. Strategic brief emitted.");
    } catch (err: any) {
      console.error('[AI STREAM ERROR]', err);
      setActiveAIResponse(`### System Offline Fallback\n\nUnable to reach server-side Gemini endpoint. Reason: ${err.message || 'Unknown network error'}`);
      setAgentReasoningStep("Operational bypass triggered.");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const handleCopilotChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotChatInput.trim() || isCopilotLoading) return;

    const userMessageText = copilotChatInput;
    setCopilotHistory(prev => [...prev, { sender: 'user', text: userMessageText, timestamp: new Date().toLocaleTimeString() }]);
    setCopilotChatInput('');
    setIsCopilotLoading(true);

    try {
      const info = getTabAIInfo();
      const richPrompt = `
      [SYSTEM CONTEXT]
      Current User Tab: ${activeTab} (${info.title})
      Selected Tender ID: ${selectedTenderId}
      Selected Supplier ID: ${selectedSupplierId}
      Selected Contract ID: ${selectedContractId}
      
      [USER QUERY]
      ${userMessageText}
      `;

      const response = await processAIRequest({
        module: 'chat',
        prompt: richPrompt,
        systemInstruction: "You are the Salience Atlas Tender Intelligence Copilot. Answer concisely, using beautiful Markdown formatting. Focus strictly on PPADA 2015 and actual SCM data. Be helpful, clear, and highly professional."
      });

      setCopilotHistory(prev => [...prev, { sender: 'agent', text: response.text, timestamp: new Date().toLocaleTimeString() }]);
      setTokensConsumed(prev => prev + Math.floor(600 + Math.random() * 300));
      setAgentReasoningStep("Copilot chat query processed.");
    } catch (err) {
      console.error(err);
      setCopilotHistory(prev => [...prev, { sender: 'agent', text: "Unable to establish communication with Gemini Core. Operating in local safe buffer mode.", timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const getTabAIInfo = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          title: "Executive Strategic Advisory",
          actionLabel: "Synthesize Board-Ready Briefing",
          prompt: "Analyze the current procurement pipeline state, including all capex plan lines, active tenders count, audit security score, and active contracts. Detect anomalies, predict future trends, and recommend board-ready interventions under PPADA 2015.",
          sys: "You are the Executive Advisor Agent. Format as a board briefing with clear KPI movement explanations and emerging risks."
        };
      case 'planning':
        return {
          title: "Capex Demand & Calendar Optimization",
          actionLabel: "Forecast Capex Demand & Calibrate Calendar",
          prompt: `Analyze these capex plan items: ${JSON.stringify(planItems)}. Forecast procurement demand, check for duplicate plans (e.g. split procurement risk Section 54(2)), estimate budget requirements, and suggest a strategic procurement calendar.`,
          sys: "You are the SCM Planning & Market Intelligence Agent. Format with clear duplication checks and calendars."
        };
      case 'authoring':
        return {
          title: "Tender Specification Drafting & Quality Audit",
          actionLabel: "Draft Specification & Quality Audit",
          prompt: `Draft a high-quality tender specification document for "${authoringTitle}" under template type "${authoringTemplate}" with Capex Estimate of $${costEstimateUSD}. Include detailed technical parameters, bills of quantities, sustainability/quality requirements, and penalty clauses complying with Section 70 of PPADA 2015. Include a brief quality/risk audit.`,
          sys: "You are the Scribe & Tender Authoring Agent. Format with formal standard terms and specific IEC guidelines."
        };
      case 'suppliers':
        return {
          title: "Supplier Strategic Value & Reliability Analysis",
          actionLabel: "Analyze Supplier Delivery & Financial Risk",
          prompt: `Analyze current supplier register: ${JSON.stringify(suppliers)}. Specifically evaluate selected supplier id: "${selectedSupplierId}" (${suppliers.find(s => s.id === selectedSupplierId)?.name}). Explain their delivery confidence, trust score, financial risk, and litigation level. Recommend alternative suppliers if needed.`,
          sys: "You are the Supplier Intelligence Agent. Output performance summaries and alternative options."
        };
      case 'bids':
        return {
          title: "Multi-Criteria Bid Intelligence & Scoring Narrative",
          actionLabel: "Run Bid Review & Pricing Anomaly Check",
          prompt: `Review the submitted bids: ${JSON.stringify(bids)}. Compare technical engineering quality vs pricing. Identify potential pricing collusion/anomalies, highlight strengths/weaknesses of each, and output a detailed draft evaluation narrative for committee review based on criteria weights: ${JSON.stringify(rubrics)}.`,
          sys: "You are the Bid Analysis & Fraud Detection Agent. Output structured scoreboards and clarify omissions."
        };
      case 'contracts':
        return {
          title: "Contract Close-out & Milestone Delay Prediction",
          actionLabel: "Predict Milestone Delays & Closures",
          prompt: `Review SCM Contract ledger: ${JSON.stringify(contracts)}. Specifically evaluate selected contract: "${selectedContractId}". Forecast completion, predict potential supply-chain delays, monitor warranty obligations, and recommend contractual close-out interventions.`,
          sys: "You are the Contract Intelligence Agent. Format with a clear delivery timeline risk indicator and payments projection."
        };
      case 'risk':
        return {
          title: "Continuous Compliance & Risk Heatmap Assessment",
          actionLabel: "Generate PPADA Compliance Audit Bundle",
          prompt: `Perform an active PPADA 2015 audit scan. Analyze active tenders, contracts, and supplier lists. Identify risk concentration levels, verify standstill windows, check segregation of duties, and generate compliance summary with a traceable rationale.`,
          sys: "You are the Risk & Compliance Agent. Provide compliance matrices and rule explanations."
        };
      case 'compliance':
        return {
          title: "Statutory Resolution and Policy Audit",
          actionLabel: "Verify Statutory Stages & Resolution Paths",
          prompt: `Examine the current 15 workflow stages of the PPADA 2015 Compliance Sequencer. Highlight key bottlenecks, explain why certain stages require Human-In-The-Loop authorization, and generate resolution paths for the active stages.`,
          sys: "You are the Compliance Gatekeeper Agent. Reference sections of PPADA 2015 and explain HITL controls."
        };
      case 'rules':
        return {
          title: "Organizational Procurement Policy Engine",
          actionLabel: "Verify Procurement Policy Limits",
          prompt: "Verify global compliance parameters (e.g. Segregation of Duties, Standstill Period, Financial Thresholds, Local Content requirements). Explain the legal rationale under PPADA 2015 and provide corrective recommendation checklists.",
          sys: "You are the SCM Regulatory Policy Agent. Format as a strict compliance checklist with traceable legal provisions."
        };
      case 'analytics':
        return {
          title: "Predictive Spend Forecast & Savings Hub",
          actionLabel: "Auto-Generate Spend & Demand Forecast Narrative",
          prompt: "Analyze the total SCM pipeline spend. Perform spend linear-trend extrapolation, forecast demand peaks, detect anomalies, and recommend savings/optimization opportunities (e.g. Nanyuki Substation capex compression).",
          sys: "You are the Spend Analytics Agent. Format as a predictive report with interactive stats tables."
        };
      case 'graph':
        return {
          title: "Semantic Relationship Map & Nexus Audit",
          actionLabel: "Analyze Knowledge Graph Relationships",
          prompt: "Examine relationships between Project nodes, Contract nodes, Supplier nodes, Shipment logs, and Inventory assets. Detect multi-hop supply bottlenecks or concentration alerts.",
          sys: "You are the SCM Graph Network Agent. Format with dependency paths and nexus risk highlights."
        };
      case 'agents':
        return {
          title: "Multi-Agent Collaboration & Bus Status",
          actionLabel: "Orchestrate Multi-Agent Strategic Briefing",
          prompt: "Trigger collaborative briefing. Request Planning, Market, Supplier, Bid, Compliance, and Risk agents to execute together, route messages across the SCM collaboration bus, and merge findings into a unified tactical plan.",
          sys: "You are the Coordinator Agent. Outline the active reasoning chain of each agent and show how conflicts are resolved."
        };
      case 'twin':
        return {
          title: "SCM Simulation & Failure Analysis",
          actionLabel: "Simulate 'What-If' Sea Freight Bottleneck",
          prompt: "Run what-if scenario: Sea freight delays flag ABB Grid Systems/Shanghai Grid with delivery constraints. Predict ripple impacts on Isinya and Suswa projects, and recommend immediate local-sourcing workarounds.",
          sys: "You are the SCM Digital Twin Agent. Forecast impact metrics and recommend concrete redundancy routes."
        };
      case 'egp':
        return {
          title: "Treasury Cryptographic Ledger Sync",
          actionLabel: "Verify Ledger Hash & Treasury Alignment",
          prompt: "Verify the SHA-256 secure hash locking of bid proposals, and simulate direct ledger synchronization with the Treasury e-Government Procurement (eGP) portal. Explain the audit trail and transparency safeguards.",
          sys: "You are the Blockchain Security & eGP Ledger Integration Agent. Confirm cryptographic validity."
        };
      default:
        return {
          title: "Tender AI Strategic Hub",
          actionLabel: "Initialize Intelligence Protocol",
          prompt: "Provide a comprehensive operational analysis of KETRACO SCM.",
          sys: "You are the Tender Studio Brain."
        };
    }
  };

  const renderAIActionHub = () => {
    const info = getTabAIInfo();
    return (
      <div className="tender-glass-panel tender-ai-action-hub p-5 rounded-2xl space-y-4" id="tender-ai-action-hub">
        <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary-brand)] animate-pulse" />
            <h3 className="text-xs font-semibold text-white/95 uppercase tracking-wider font-sans">
              AI Action Hub: {info.title}
            </h3>
          </div>
          <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 font-bold">Governed Autonomy</span>
        </div>

        <p className="text-xs text-white/60 leading-relaxed font-sans">
          Invoke specialized KETRACO AI Agents to analyze this workspace's records, verify PPADA compliance rules, and draft actionable strategic decisions.
        </p>

        {/* Action Button & Asynchronous Progress */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <button
            onClick={() => triggerAIAction(activeTab, info.prompt, info.sys)}
            disabled={isAiProcessing}
            className="px-4 py-2.5 bg-gradient-to-r from-[var(--primary-brand)] to-[var(--primary-brand)]/90 hover:from-[var(--primary-brand)]/90 hover:to-[var(--primary-brand)]/80 text-black text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
          >
            {isAiProcessing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Cpu className="w-3.5 h-3.5" />
            )}
            {info.actionLabel}
          </button>
          
          {isAiProcessing && (
            <div className="flex-1 flex items-center gap-2.5 text-[10.5px] font-mono text-white/45">
              <span className="w-2 h-2 rounded-full bg-[var(--primary-brand)] animate-ping shrink-0"></span>
              <span className="truncate">{currentAgentProgress}</span>
            </div>
          )}
        </div>

        {/* AI Response Display Area with Explainability and Recommendation Details */}
        <AnimatePresence>
          {activeAIResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white/5 border border-slate-800/40 rounded-xl p-4 space-y-4 text-xs mt-3 relative"
            >
              <div className="flex justify-between items-center border-b border-slate-800/40 pb-2">
                <span className="text-[9px] font-mono text-white/45 font-semibold uppercase">EXPLAINABLE AI RECOMMENDATION SUMMARY</span>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">Confidence: {agentConfidence}%</span>
                  <button 
                    onClick={() => setActiveAIResponse('')} 
                    className="text-white/45 hover:text-white/80 font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Displaying beautifully parsed Markdown */}
              <div 
                className="prose prose-invert text-white/75 leading-relaxed space-y-2 select-text font-sans"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(activeAIResponse) }}
              />

              {/* Governance & Recommendation Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-800/40 text-[10px] font-mono">
                <div className="bg-white/5 p-2 rounded-lg border border-slate-800/40">
                  <span className="text-white/45 block text-[8px] uppercase">IMPACT ASSESSMENT</span>
                  <span className="text-[var(--primary-brand)] font-bold mt-0.5 block">HIGH STRATEGIC GAIN</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-slate-800/40">
                  <span className="text-white/45 block text-[8px] uppercase">ESTIMATED EFFORT</span>
                  <span className="text-white/80 font-bold mt-0.5 block">24-48 HOURS</span>
                </div>
                <div className="bg-white/5 p-2 rounded-lg border border-slate-800/40">
                  <span className="text-white/45 block text-[8px] uppercase">REQUIRED APPROVALS</span>
                  <span className="text-[#F59E0B] font-bold mt-0.5 block">ACCOUNTING OFFICER</span>
                </div>
              </div>

              {/* Action buttons on recommendation */}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setCopilotChatInput(`Regarding the recommendation for ${info.title}, can you explain the exact legal risks and alternative solutions?`);
                    setActiveTab('agents');
                    setAiPanelOpen(true);
                  }}
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-slate-800/40 rounded-lg text-[10px] font-medium transition-colors cursor-pointer animate-pulse"
                >
                  Ask for Alternatives
                </button>
                <button
                  onClick={() => {
                    if (activeTab === 'planning') {
                      setPlanningNotification("AI Optimizations fully synchronized with Capex Ledger!");
                    } else if (activeTab === 'authoring') {
                      setAuthoringDraft(activeAIResponse);
                    } else if (activeTab === 'tenders') {
                      setIsSimulating(true);
                    } else if (activeTab === 'egp') {
                      setEgpStatusLog(prev => [`[${new Date().toLocaleTimeString()}] AI COMPLIANCE AUDIT SYNCHRONIZED COMPLETED`, ...prev]);
                    }
                    setActiveAIResponse('');
                  }}
                  className="px-3 py-1.5 bg-[var(--primary-brand)] text-black font-bold rounded-lg text-[10px] hover:opacity-90 transition-colors cursor-pointer"
                >
                  Execute Recommended Action
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Handle Planning Appending with Duplicates check
  const handleCreatePlanItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName.trim() || !newProjBudget) return;

    const isDuplicate = planItems.some(
      item => item.projectName.toLowerCase() === newProjName.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert("🚫 AI Compliance Block: Duplicate procurement program detected! Section 54(2) prohibits duplicate split procurement plans for the same material requirement.");
      return;
    }

    const item: ProcurementPlanItem = {
      id: `PLN-${Date.now().toString().slice(-3)}`,
      department: newDept,
      projectName: newProjName,
      category: "Power Grid Assets",
      budgetUSD: Number(newProjBudget),
      readinessScore: Math.floor(Math.random() * 20) + 75,
      suggestedMethod: "Open International competitive",
      timelineQuarter: "Q4 2026",
      status: "Approved"
    };
    setPlanItems([item, ...planItems]);
    setNewProjName("");
    setNewProjBudget("");
    setPlanningNotification(`Plan item "${item.projectName}" successfully committed. Duplicate verification check passed.`);
    setTimeout(() => setPlanningNotification(null), 4000);
  };

  // Run autonomous 15-stage core simulation logic
  useEffect(() => {
    if (!isSimulating) return;
    const currentStage = stages.find(s => s.id === activeStageId);
    if (!currentStage) {
      setIsSimulating(false);
      return;
    }

    // Synchronize Floating AI Agent reasoning string
    setAgentReasoningStep(`Active Stage ${currentStage.id}: ${currentStage.name} &bull; ${currentStage.section}`);
    setAgentConfidence(currentStage.confidence);
    setTokensConsumed(prev => prev + Math.floor(Math.random() * 45) + 30);

    if (currentStage.status === 'COMPLETED') {
      if (activeStageId < 15) {
        setActiveStageId(activeStageId + 1);
      } else {
        setIsSimulating(false);
      }
      return;
    }

    if (currentStage.status === 'LOCKED_AWAITING_HITL') {
      setIsSimulating(false);
      return;
    }

    if (currentStage.status === 'PENDING') {
      setStages(prev => prev.map(s => s.id === activeStageId ? { ...s, status: 'RUNNING' } : s));
      return;
    }

    if (currentStage.status === 'RUNNING') {
      const timer = setTimeout(() => {
        if (currentStage.requiresHITL) {
          setStages(prev => prev.map(s => s.id === activeStageId ? { ...s, status: 'LOCKED_AWAITING_HITL' } : s));
        } else {
          setStages(prev => prev.map(s => s.id === activeStageId ? { ...s, status: 'COMPLETED' } : s));
          if (activeStageId < 15) {
            setActiveStageId(activeStageId + 1);
          } else {
            setIsSimulating(false);
          }
        }
      }, simulationSpeed);
      return () => clearTimeout(timer);
    }
  }, [isSimulating, activeStageId, stages, simulationSpeed]);

  const handleBypassHITL = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput || !commentInput.trim()) {
      setSigningError("Clearance PIN and justification comments are mandatory.");
      return;
    }
    if (pinInput !== '1234') {
      setSigningError("Incorrect clearance PIN. Use preset '1234' for sandbox.");
      return;
    }

    setSigningError("");
    setIsSigning(true);

    setTimeout(() => {
      setStages(prev => prev.map(s => {
        if (s.id === activeStageId) {
          return {
            ...s,
            status: 'COMPLETED',
            thoughts: `[HITL Signoff] Action authorized by Accounting Officer. Comments archived: "${commentInput}".`
          };
        }
        return s;
      }));

      setAgentThoughtsLog(prev => [
        `[Compliance Agent] Accounting Officer signed off Stage ${activeStageId} under strict audit rules.`,
        ...prev
      ]);

      setPinInput("");
      setCommentInput("");
      setIsSigning(false);

      if (activeStageId < 15) {
        setActiveStageId(activeStageId + 1);
        setIsSimulating(true);
      } else {
        setIsSimulating(false);
      }
    }, 800);
  };

  const handleResetSim = () => {
    setIsSimulating(false);
    setActiveStageId(1);
    setStages(prev => prev.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'LOCKED_AWAITING_HITL' : 'PENDING'
    })));
  };

  // SCM spec generator
  const handleDraftingAction = async (actionType: string) => {
    setIsDrafting(true);
    setAuthoringDraft('');
    try {
      let prompt = '';
      if (actionType === 'generate') {
        prompt = `Draft a comprehensive, professional tender specifications document for "${authoringTitle}" under template type "${authoringTemplate}". Cost Estimate: $${costEstimateUSD} USD. Comply with standard IEC-60826 benchmarks and Section 70 of Kenya PPADA 2015. Include clear Scope of Works, technical parameters, Bills of Quantities (BOQs), and liquidated damages.`;
      } else if (actionType === 'simplify') {
        prompt = `Take the active draft text or title "${authoringTitle}" under template type "${authoringTemplate}" and simplify its legal terms and clauses to be easily readable for human procurement committees while retaining full compliance under PPADA 2015.`;
      } else if (actionType === 'risk') {
        prompt = `Perform a comprehensive quality and risk audit on the proposed tender specs "${authoringTitle}" with cost baseline $${costEstimateUSD} USD. Verify if there are any anti-competitive specifications, check cost baseline alignments, and audit compliance with Kenya PPADA 2015.`;
      }
      
      const response = await processAIRequest({
        module: 'orchestrator',
        prompt,
        systemInstruction: "You are the Scribe & Tender Authoring Agent for KETRACO. Draft beautifully in clear, formal Markdown."
      });
      setAuthoringDraft(response.text);
    } catch (err: any) {
      console.error(err);
      setAuthoringDraft(`### System Offline Fallback\n\nUnable to reach Scribe Agent core. Reason: ${err.message || 'Unknown network error'}\n\n=== DRAFT COMPILATION: ${authoringTitle} ===\nAll equipment must satisfy international ISO 9001 guidelines under PPADA 2015.`);
    } finally {
      setIsDrafting(false);
    }
  };

  const calculateBidFinalScore = (bid: SCMBid) => {
    const minPrice = Math.min(...bids.map(b => b.pricingUSD));
    const priceScore = (minPrice / bid.pricingUSD) * 100;
    
    let totalScore = 0;
    rubrics.forEach(r => {
      if (r.name.toLowerCase().includes('financial') || r.name.toLowerCase().includes('price')) {
        totalScore += (priceScore * r.weight) / 100;
      } else if (r.name.toLowerCase().includes('technical') || r.name.toLowerCase().includes('engineering')) {
        totalScore += (bid.technicalCapabilities * r.weight) / 100;
      } else if (r.name.toLowerCase().includes('past') || r.name.toLowerCase().includes('sla')) {
        totalScore += (bid.pastPerformance * r.weight) / 100;
      } else {
        totalScore += (bid.localCompliance * r.weight) / 100;
      }
    });
    return Math.round(totalScore * 10) / 10;
  };

  const handleAddContractVariation = (ctrId: string, amount: number) => {
    setContracts(prev => prev.map(c => {
      if (c.id === ctrId) {
        const potentialVariations = c.variationsUSD + amount;
        const maximumCap = c.valueUSD * 0.25; // 25% statutory cap
        if (potentialVariations > maximumCap) {
          alert(`🚫 SCM Compliance Block: Variation of $${amount.toLocaleString()} raises cumulative variations to $${potentialVariations.toLocaleString()} (which exceeds the PPADA Section 139 statutory limit of 25.0% of initial contract value: $${maximumCap.toLocaleString()}). Transaction blocked.`);
          return c;
        }
        return {
          ...c,
          variationsUSD: potentialVariations,
          milestones: [
            ...c.milestones,
            { id: `M-VAR-${Date.now()}`, name: "Approved Scope Variation Works", progress: 0, status: "In Progress" }
          ]
        };
      }
      return c;
    }));
  };

  const handleEGPySync = () => {
    setIsSyncingEGP(true);
    setEgpStatusLog(prev => ["Initiating sync across secure public endpoints...", ...prev]);
    setTimeout(() => {
      setIsSyncingEGP(false);
      setEgpStatusLog(prev => [
        `Sync completed at ${new Date().toLocaleTimeString()} - Broadcasted payload: ${tenders.length} Active Tenders, ${contracts.length} SCM Contracts to National PPIP portal.`,
        ...prev
      ]);
    }, 1200);
  };

  const handleQueryAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentActivePrompt.trim()) return;

    const query = agentActivePrompt;
    setAgentActivePrompt("");
    setAgentThoughtsLog(prev => [
      `[USER QUERY] ${query}`,
      `[SCM ${selectedAgent} Agent] Consulting memory logs and PPADA rules...`,
      `[Analysis Output] SCM planning ledger holds ${planItems.length} active programs totaling $${planItems.reduce((acc, c) => acc + c.budgetUSD, 0).toLocaleString()} USD. No splitting violations identified.`,
      ...prev
    ]);
  };

  const triggerCollaborationSequence = () => {
    setIsCollaborating(true);
    setAgentThoughtsLog(prev => [
      "🔄 [SCM Orchestrator] Initiating Multi-Agent SCM Collaboration Sequence...",
      ...prev
    ]);

    const delayStep = (msg: string, nextDelay: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          setAgentThoughtsLog(prev => [msg, ...prev]);
          resolve();
        }, nextDelay);
      });
    };

    delayStep("🤖 1. [Planner Agent] Mapping long-term conductor capex demands against board approvals.", 500)
      .then(() => delayStep("🤖 2. [Supplier Agent] Fetching performance metrics of active manufacturers.", 500))
      .then(() => delayStep("🤖 3. [Market Intel Agent] Checking global LME aluminum prices. Freight volatilities high (+15%).", 500))
      .then(() => delayStep("🤖 4. [Compliance Agent] Verifying Section 45(2) alignment. Sourcing method threshold compliant.", 500))
      .then(() => delayStep("🤖 5. [Risk Agent] Constructing probabilistic contract delays prediction curve.", 500))
      .then(() => delayStep("💡 6. [Executive Advisor] STRATEGIC RECOMENDATION: Bundle Marianaki and Suswa transformer specs to lock down early volume pricing.", 500))
      .then(() => {
        setIsCollaborating(false);
      });
  };

  const runTwinSimulation = () => {
    if (selectedScenario === 'none') {
      setTwinSimulationOutput(null);
      return;
    }
    setIsSimulatingTwin(true);
    setTimeout(() => {
      let output = {
        delayWeeks: 0,
        costImpactUSD: 0,
        riskScore: 0,
        governanceCode: "Section 135 Compliant",
        advice: ""
      };

      if (selectedScenario === 'freight') {
        output = {
          delayWeeks: 6,
          costImpactUSD: 240000,
          riskScore: 78,
          governanceCode: "PPADA Sec. 150 - Delay Penalties Enforceable",
          advice: "Mombasa port container gridlocks will delay dispatch. Suggestion: invoke standby local stock from Siemens Nairobi or enforce 0.5% weekly penalty clause."
        };
      } else if (selectedScenario === 'currency') {
        output = {
          delayWeeks: 1,
          costImpactUSD: 310000,
          riskScore: 54,
          governanceCode: "PPADA Sec. 139 - Under 25% Cap",
          advice: "KES/USD volatility affects foreign metal imports. Cost increase of $310,000 can be absorbed using the 10% contingency budget line."
        };
      } else if (selectedScenario === 'emergency') {
        output = {
          delayWeeks: 0,
          costImpactUSD: 80000,
          riskScore: 92,
          governanceCode: "PPADA Sec. 102 - Direct Sourcing Mandate",
          advice: "Urgent substation transformer replacement. Recommending emergency procurement bypass with immediate Board approval, bypassing standard 21-day public wait."
        };
      }

      setTwinSimulationOutput(output);
      setIsSimulatingTwin(false);
    }, 1000);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule = {
      id: `R-${Date.now().toString().slice(-3)}`,
      trigger: newRuleTrigger,
      action: newRuleAction,
      enabled: true
    };
    setRules([...rules, newRule]);
    alert("✅ Enterprise compliance rule successfully stored. Policy applied immediately to active workflows.");
  };

  // Calculations
  const totalPipelineSpend = planItems.reduce((sum, item) => sum + item.budgetUSD, 0);
  const activeTendersCount = tenders.filter(t => t.status !== 'Draft' && t.status !== 'Completed' && t.status !== 'Cancelled').length;
  const activeContractsCount = contracts.length;
  const rubricSum = rubrics.reduce((acc, r) => acc + r.weight, 0);

  // Rebranded Sidebar Workspace Items
  const sidebarTabs = [
    { id: 'dashboard', label: 'Executive Mission Control', icon: BarChart2, badge: 'Advisor' },
    { id: 'planning', label: 'Procurement Planning', icon: Briefcase },
    { id: 'tenders', label: 'Autonomous Workflow Engine', icon: Cpu, badge: '15 Stages' },
    { id: 'authoring', label: 'AI Tender Authoring', icon: Sparkles },
    { id: 'suppliers', label: 'Supplier Intelligence', icon: Users },
    { id: 'bids', label: 'Evaluation OS', icon: Scale, badge: 'Live' },
    { id: 'contracts', label: 'Contract Intelligence', icon: FileSignature },
    { id: 'risk', label: 'Procurement Risk Intel', icon: ShieldAlert },
    { id: 'compliance', label: 'Continuous Compliance', icon: ShieldCheck },
    { id: 'rules', label: 'Enterprise Rules Engine', icon: Sliders },
    { id: 'analytics', label: 'Predictive BI Analytics', icon: TrendingUp },
    { id: 'graph', label: 'Knowledge Graph Mesh', icon: GitMerge },
    { id: 'agents', label: 'Autonomous Agents Mesh', icon: Cpu },
    { id: 'twin', label: 'Procurement Digital Twin', icon: Activity, badge: 'Simulator' },
    { id: 'egp', label: 'eGP Treasury Sync', icon: Globe },
    { id: 'integration', label: 'Salience Atlas Copilot', icon: Terminal, badge: 'Phase 18' }
  ];

  return (
    <TenderIntelligenceProvider>
      <TenderIntelligenceLayout>
        <div className="tender-intelligence-shell flex-1 flex flex-col text-white/90 select-none" id="tender-intelligence-root">
      
      {/* 1. Rebranded Premium Top Platform Header */}
      <div className="tender-glass-header p-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 z-10">
        <div>
          <div className="flex items-center gap-3">
            <span 
              className="p-2.5 border rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.2)]"
              style={{ backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}30`, color: primaryColor }}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white/90 flex items-center gap-2">
                Tender Intelligence
                <span 
                  className="text-[10px] border px-2 py-0.5 rounded-full font-mono uppercase font-semibold"
                  style={{ backgroundColor: `${primaryColor}10`, borderColor: `${primaryColor}20`, color: primaryColor }}
                >
                  Salience OS
                </span>
              </h1>
              <p className="text-xs text-white/45 mt-0.5 leading-relaxed">
                Autonomous capital procurement system, continuous compliance monitoring, and statutory PPADA 2015 audit trails.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Sidebar Collapse Toggle Button */}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2.5 border border-slate-800/40 rounded-xl hover:bg-white/5 text-white/75 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2"
            title={isSidebarCollapsed ? "Expand Workspace Sidebar" : "Collapse Workspace Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand Workspace Sidebar" : "Collapse Workspace Sidebar"}
            id="tender-sidebar-toggle-btn"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-amber-400 animate-pulse" />
            ) : (
              <Layers className="w-4 h-4 text-white/75" />
            )}
            <span className="hidden sm:inline text-xs font-semibold">
              {isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-slate-800/40 rounded-xl text-[10.5px] font-mono text-white/45">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            <span>AUTONOMOUS ENGINE ACTIVE</span>
          </div>

          <button 
            onClick={() => onAskCopilot?.("Provide a strategic operational briefing on KETRACO's SCM planning, active contract performance, and PPADA compliance audit parameters.")}
            className="px-4 py-2 hover:opacity-90 active:scale-95 text-xs font-semibold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            style={{ backgroundColor: primaryColor, color: '#000000', boxShadow: `0 4px 12px ${primaryColor}25` }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Request AI Copilot Briefing
          </button>
        </div>
      </div>

      {/* Main Container: Responsive Premium Navigation Panel on Left, Workspaces on Right */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
        
        {/* PREMIUM SIDEBAR: Redesigned (minimizable, transition-all duration-300) */}
        <div 
          className={`tender-glass-sidebar p-4 space-y-4 overflow-y-auto transition-all duration-300 ease-in-out shrink-0 flex flex-col justify-between ${
            isSidebarCollapsed 
              ? 'xl:w-20 w-full max-h-[72px] xl:max-h-none' 
              : 'xl:w-80 w-full max-h-[350px] xl:max-h-none'
          }`}
          id="tender-sidebar"
        >
          <div className="space-y-3">
            {!isSidebarCollapsed && (
              <div className="px-2.5 flex items-center justify-between transition-opacity duration-200">
                <span className="text-[10px] font-mono font-bold text-white/45 uppercase tracking-widest">
                  AI WORKSPACES
                </span>
                <span className="text-[9px] font-mono text-white/30">15 SYSTEMS</span>
              </div>
            )}

            <nav className={`transition-all duration-300 ${isSidebarCollapsed ? 'flex flex-row xl:flex-col overflow-x-auto xl:overflow-x-visible gap-2 xl:gap-1' : 'space-y-1'}`}>
              {sidebarTabs.map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    title={isSidebarCollapsed ? tab.label : undefined}
                    aria-label={tab.label}
                    className={`flex items-center rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer group relative shrink-0 ${
                      isSidebarCollapsed 
                        ? 'justify-center xl:w-12 xl:h-12 w-10 h-10 p-1' 
                        : 'w-full justify-between p-3'
                    } ${
                      isActive 
                        ? 'bg-white/5 border border-slate-800/40 font-semibold' 
                        : 'text-white/45 hover:text-white/90 hover:bg-white/5 border border-transparent'
                    }`}
                    style={isActive ? { color: primaryColor } : undefined}
                  >
                    <div className={`flex items-center ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
                      <IconComponent 
                        className="w-4 h-4 transition-transform group-hover:scale-110 shrink-0" 
                        style={{ color: isActive ? primaryColor : 'rgba(255, 255, 255, 0.45)' }}
                      />
                      {!isSidebarCollapsed && <span>{tab.label}</span>}
                    </div>
                    {!isSidebarCollapsed && (
                      tab.badge ? (
                        <span 
                          className="text-[8px] font-mono px-2 py-0.5 rounded-full"
                          style={isActive ? { backgroundColor: `${primaryColor}15`, color: primaryColor } : { backgroundColor: '#151B23', color: 'rgba(255, 255, 255, 0.45)' }}
                        >
                          {tab.badge}
                        </span>
                      ) : (
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                      )
                    )}

                    {/* Animated soft active glow indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-0.5 rounded-full" style={{ backgroundColor: primaryColor }} />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {!isSidebarCollapsed && (
            <div className="tender-glass-mini-panel hidden xl:block p-3.5 rounded-xl space-y-2 text-[11px] leading-relaxed transition-opacity duration-200">
              <div className="flex items-center gap-2 font-semibold" style={{ color: primaryColor }}>
                <ShieldCheck className="w-4 h-4" />
                <span>PPADA Statues Verified</span>
              </div>
              <p className="text-white/45">Compliance thresholds linked directly with eGP treasury protocols.</p>
            </div>
          )}
        </div>

        {/* Dynamic Workspace Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-transparent min-w-0" id="tender-workspace-container">

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
            >
              
              {/* ==========================================
                  1. EXECUTIVE MISSION CONTROL (DASHBOARD)
                  ========================================== */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6" id="workspace-executive-dashboard">
                  
                  {/* Dashboard Hero */}
                  <div className="tender-glass-panel p-6 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-[var(--primary-brand)] uppercase tracking-widest font-semibold block">Mission Dashboard</span>
                      <h2 className="text-2xl font-semibold tracking-tight text-white/90">Procurement Command Engine</h2>
                      <p className="text-xs text-white/45 leading-relaxed">Real-time KPI metrics, active tender portfolios, and statutory compliance safeguards.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/5 px-4 py-2.5 rounded-xl border border-slate-800/40 font-mono text-xs">
                      <div>
                        <span className="text-[9px] text-white/45 block">COMPLIANCE INDEX</span>
                        <strong className="text-[#10B981] text-sm flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> 98.4%
                        </strong>
                      </div>
                      <div className="border-l border-white/10 pl-4">
                        <span className="text-[9px] text-white/45 block">CURRENT CYCLE</span>
                        <strong className="text-white/90 text-sm block mt-0.5">FY 2026/27</strong>
                      </div>
                    </div>
                  </div>

                  {/* KPI Metrics with GSAP Counters */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#101827]/75 hover:bg-white/5 border border-slate-800/40 hover:border-white/10 p-5 rounded-2xl relative transition-all duration-200 hover:-translate-y-1">
                      <span className="text-[10px] text-white/45 font-mono uppercase tracking-wider block">Total Pipeline Spend</span>
                      <span className="text-2xl font-semibold text-white/90 block mt-1.5">
                        $<GsapCounter value={totalPipelineSpend / 1000000} decimals={2} suffix="M" />
                      </span>
                      <span className="text-[10px] text-[#10B981] font-mono block mt-1">Aligned with Annual plan</span>
                    </div>

                    <div className="bg-[#101827]/75 hover:bg-white/5 border border-slate-800/40 hover:border-white/10 p-5 rounded-2xl relative transition-all duration-200 hover:-translate-y-1">
                      <span className="text-[10px] text-white/45 font-mono uppercase tracking-wider block">Active Tenders Running</span>
                      <span className="text-2xl font-semibold text-white/90 block mt-1.5">
                        <GsapCounter value={activeTendersCount} />
                      </span>
                      <span className="text-[10px] text-white/45 font-mono block mt-1">PPADA timescales active</span>
                    </div>

                    <div className="bg-[#101827]/75 hover:bg-white/5 border border-slate-800/40 hover:border-white/10 p-5 rounded-2xl relative transition-all duration-200 hover:-translate-y-1">
                      <span className="text-[10px] text-white/45 font-mono uppercase tracking-wider block">Audit Security Score</span>
                      <span className="text-2xl font-semibold text-white/90 block mt-1.5">
                        <GsapCounter value={98.4} decimals={1} suffix="%" />
                      </span>
                      <span className="text-[10px] text-[#10B981] font-mono block mt-1">Reconciliation: OK</span>
                    </div>

                    <div className="bg-[#101827]/75 hover:bg-white/5 border border-slate-800/40 hover:border-white/10 p-5 rounded-2xl relative transition-all duration-200 hover:-translate-y-1">
                      <span className="text-[10px] text-white/45 font-mono uppercase tracking-wider block">Active SCM Contracts</span>
                      <span className="text-2xl font-semibold text-white/90 block mt-1.5">
                        <GsapCounter value={activeContractsCount} />
                      </span>
                      <span className="text-[10px] text-[#F59E0B] font-mono block mt-1">Milestone gates verified</span>
                    </div>
                  </div>

                  {/* Charts Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-[var(--primary-brand)]" /> Active Capex Allocations by Project
                      </h3>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={planItems.map(item => ({ name: item.projectName.slice(0, 10) + "...", budget: item.budgetUSD }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={8} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} />
                            <Tooltip contentStyle={{ backgroundColor: '#151B23', borderColor: 'rgba(255,255,255,0.06)' }} />
                            <Bar dataKey="budget" fill="var(--primary-brand)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl space-y-4">
                      <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#10B981]" /> SCM Pipeline Budget vs Actual Allocations
                      </h3>
                      <div className="h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { name: 'Plan Init', budget: 1500000, actual: 1500000 },
                            { name: 'Research', budget: 2000000, actual: 1850000 },
                            { name: 'Specs Prep', budget: 3500000, actual: 3400000 },
                            { name: 'Secure Decrypt', budget: 4500000, actual: 4450000 },
                            { name: 'Evaluation', budget: 6000000, actual: 5900000 }
                          ]}>
                            <CartesianGrid stroke="rgba(255,255,255,0.02)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={8} />
                            <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} />
                            <Tooltip contentStyle={{ backgroundColor: '#151B23', borderColor: 'rgba(255,255,255,0.06)' }} />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                            <Line type="monotone" dataKey="budget" stroke="var(--primary-brand)" strokeWidth={2} dot={{ fill: 'var(--primary-brand)' }} />
                            <Line type="monotone" dataKey="actual" stroke="#10B981" strokeWidth={2} dot={{ fill: '#10B981' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* AI Executive Advisory Panel */}
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--primary-brand)] animate-pulse" />
                        <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider">AI Executive Advisor Stream</h3>
                      </div>
                      <span className="text-[10px] font-mono text-[var(--primary-brand)] bg-[var(--primary-brand)]/10 px-2 py-0.5 rounded border border-[var(--primary-brand)]/15">Explainable AI</span>
                    </div>
                    
                    <div className="space-y-3">
                      {executiveLogs.map((log, index) => (
                        <div key={index} className="text-xs bg-white/5 p-4 rounded-xl border border-slate-800/40 hover:border-white/10 transition-all flex items-start gap-3">
                          <Info className="w-4 h-4 text-[var(--primary-brand)] shrink-0 mt-0.5" />
                          <div className="flex-1 space-y-2">
                            <p className="text-white/70 leading-relaxed font-medium">{log}</p>
                            <div>
                              <button 
                                onClick={() => onAskCopilot?.(`Elaborate on SCM executive recommendation: "${log}". Outline governing policy and steps.`)}
                                className="text-[10px] text-[var(--primary-brand)] hover:underline cursor-pointer flex items-center gap-1.5 font-mono"
                              >
                                Explain Governance Rule & Actionable Next Steps →
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Phase 17: Autonomous OS - Executive Digital Briefings */}
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800/40 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider">Executive Digital Briefing Packs</h3>
                      </div>
                      <div className="flex flex-wrap gap-1 bg-white/5 p-1 rounded-lg border border-slate-800/30">
                        {(['exec', 'scm', 'finance', 'audit', 'board'] as const).map(aud => (
                          <button
                            key={aud}
                            onClick={() => setBriefingAudience(aud)}
                            className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${briefingAudience === aud ? 'bg-[var(--primary-brand)] text-white' : 'text-white/60 hover:text-white'}`}
                          >
                            {aud.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-5 bg-white/5 rounded-xl border border-slate-800/40 space-y-4 font-mono text-xs leading-relaxed relative overflow-hidden">
                      {/* Ambient background glow */}
                      <div className="absolute right-0 top-0 w-24 h-24 bg-[var(--primary-brand)]/10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex justify-between items-center text-[10px] border-b border-slate-800/40 pb-2 text-white/40">
                        <span>OVERSIGHT COMMITTEE BRIEF v2.6</span>
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Auto-Generated Live</span>
                      </div>

                      {briefingAudience === 'exec' && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                            <span>👑 EXECUTIVE MANAGEMENT BRIEFING</span>
                          </h4>
                          <p className="text-white/60">Annual capex pipeline spend is **$6.35M**, fully aligned with transmission grid targets. General compliance stands at **98.4%**. Identified **1 logistics bottleneck** at Mombasa Port; local replacement supply recommended to avoid Naivasha line standstill.</p>
                          <div className="grid grid-cols-2 gap-3 text-[10px] bg-black/20 p-3 rounded-lg border border-slate-800/30">
                            <div>• Capital Projects: 4 Active</div>
                            <div>• Overrun Risk: Nominal</div>
                            <div>• Compliance Status: Safe</div>
                            <div>• Active Contracts: 3 Signed</div>
                          </div>
                        </div>
                      )}

                      {briefingAudience === 'scm' && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                            <span>📦 SUPPLY CHAIN MANAGEMENT REPORT</span>
                          </h4>
                          <p className="text-white/60">Supplier trust indexes averaged at **87/100**. Alternate sourcing paths mapped for Shanghai Grid metal parts. Direct procurement authorized for Patented Warehousing under Section 102. Standstill window clock checking: OK.</p>
                          <div className="grid grid-cols-2 gap-3 text-[10px] bg-black/20 p-3 rounded-lg border border-slate-800/30">
                            <div>• Target Sourcing Method: Open Int.</div>
                            <div>• Bid Submissions: 3 Cryptographic</div>
                            <div>• Price Variation Cap: &lt;25%</div>
                            <div>• Average Evaluation Cycle: 14 Days</div>
                          </div>
                        </div>
                      )}

                      {briefingAudience === 'finance' && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                            <span>💵 FINANCE &amp; BUDGET CONTROL BRIEF</span>
                          </h4>
                          <p className="text-white/60">Total allocated budget is **$8,550,000** against **$6,350,000** active pipeline spend. Contingency reserve of 10% ($635,000) intact. Currency exchange fluctuations absorbable under Section 139 contingencies.</p>
                          <div className="grid grid-cols-2 gap-3 text-[10px] bg-black/20 p-3 rounded-lg border border-slate-800/30">
                            <div>• Contingency Intact: 100%</div>
                            <div>• Estimated Savings: $65,250</div>
                            <div>• FX Metal Inflation: Medium</div>
                            <div>• Payments Status: 2 In Process</div>
                          </div>
                        </div>
                      )}

                      {briefingAudience === 'audit' && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                            <span>🔍 INTERNAL AUDIT &amp; COMPLIANCE LOG</span>
                          </h4>
                          <p className="text-white/60">Full digital audit ledger compiled for PPADA compliance. Continuous checks passed: No duplicate split procurement, advertisement timescales strictly above 21-day legal limit. Zero pending regulatory actions.</p>
                          <div className="grid grid-cols-2 gap-3 text-[10px] bg-black/20 p-3 rounded-lg border border-slate-800/30">
                            <div>• Split Procurement: 0 Flags</div>
                            <div>• AD Waiting Limit: Passed</div>
                            <div>• Citizen Sourcing: 20% Met</div>
                            <div>• SHA-256 Bid Verification: OK</div>
                          </div>
                        </div>
                      )}

                      {briefingAudience === 'board' && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-white/90 flex items-center gap-2">
                            <span>🏛️ BOARD COMMITTEES MEMORANDUM</span>
                          </h4>
                          <p className="text-white/60">Recommending board-level award authorization for Naivasha Substation interconnector contract. Active risk parameters show nominal volatility with high local content ratio. Standardized scorecard audit-ready.</p>
                          <div className="grid grid-cols-2 gap-3 text-[10px] bg-black/20 p-3 rounded-lg border border-slate-800/30">
                            <div>• Board Review Required: Yes</div>
                            <div>• SCM Opinion: Strong Approve</div>
                            <div>• Litigation Volatility: None</div>
                            <div>• Performance Bond Bonded: Yes</div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] border-t border-slate-800/40 pt-2 text-white/40">
                        <span>Audit Signature: PPADA-V3</span>
                        <div className="flex gap-2">
                          <button onClick={() => alert("📥 Downloading Presentation Slide Briefing in PPTX format... Completed.")} className="text-[var(--primary-brand)] hover:underline cursor-pointer">Export Slides</button>
                          <span>•</span>
                          <button onClick={() => alert("📥 Exporting formal Executive PDF Document... Generated.")} className="text-[var(--primary-brand)] hover:underline cursor-pointer">Export PDF</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 17: Autonomous OS - Human Oversight & Decisions Dashboard */}
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider">Human Oversight & Decisions</h3>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/15">Awaiting Action</span>
                    </div>

                    <p className="text-xs text-white/45 leading-relaxed">
                      Review autonomous AI workflows, override recommendations, or enforce pre-emptive project mitigations. Approved items update the live memory.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left: Pending recommendations list */}
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {pendingApprovals.map((rec) => (
                          <div key={rec.id} className="p-4 bg-white/5 rounded-xl border border-slate-800/40 hover:border-slate-700/60 transition-all text-xs space-y-2">
                            <div className="flex justify-between items-center border-b border-slate-800/40 pb-1.5">
                              <span className="font-mono text-[var(--primary-brand)] font-bold">{rec.id}</span>
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                                rec.status === 'Pending' ? 'bg-amber-400/10 text-amber-400' :
                                rec.status === 'Approved' ? 'bg-emerald-400/10 text-emerald-400' :
                                rec.status === 'Rejected' ? 'bg-rose-400/10 text-rose-400' : 'bg-slate-400/10 text-slate-400'
                              }`}>{rec.status}</span>
                            </div>
                            <h4 className="font-bold text-white/95">{rec.title}</h4>
                            <p className="text-white/60 text-[11px] leading-normal">{rec.summary}</p>
                            <div className="text-[10px] text-white/45 font-mono space-y-1 bg-black/10 p-2 rounded">
                              <div>• Evidence: {rec.evidence}</div>
                              <div>• Impact: {rec.impact}</div>
                              <div>• Confidence: {rec.confidence}%</div>
                            </div>

                            {rec.status === 'Pending' && (
                              <div className="pt-2 flex items-center gap-1.5 justify-end">
                                <button
                                  onClick={() => handleApprovalDecision(rec.id, 'Approved')}
                                  className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-mono rounded cursor-pointer transition-colors"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleApprovalDecision(rec.id, 'Rejected')}
                                  className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 text-[10px] font-mono rounded cursor-pointer transition-colors"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleApprovalDecision(rec.id, 'Deferred')}
                                  className="px-2.5 py-1 bg-slate-500/10 text-slate-400 border border-slate-500/20 hover:bg-slate-500/20 text-[10px] font-mono rounded cursor-pointer transition-colors"
                                >
                                  Defer
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Right: Decision Audit Log & Global Settings */}
                      <div className="bg-white/5 p-4 rounded-xl border border-slate-800/40 text-xs flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono text-white/45 uppercase block font-semibold border-b border-slate-800/40 pb-1">Human Decision Audit Log</span>
                          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                            {decisionHistory.length === 0 ? (
                              <p className="text-[11px] text-white/30 italic py-4 text-center">No decisions logged this session.</p>
                            ) : (
                              decisionHistory.map((item, index) => (
                                <div key={index} className="p-2 bg-black/20 rounded border border-slate-800/40 font-mono text-[10px] flex items-start gap-1.5 justify-between">
                                  <div>
                                    <strong className="text-white/80">{item.id}</strong> was <span className={item.action === 'Approved' ? 'text-emerald-400' : item.action === 'Rejected' ? 'text-rose-400' : 'text-slate-400'}>{item.action}</span>
                                    <p className="text-white/40 mt-1 text-[9px]">{item.comments}</p>
                                  </div>
                                  <span className="text-white/30 text-[8px]">{item.timestamp}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="border-t border-slate-800/40 pt-3 mt-3 space-y-2">
                          <label className="text-[10px] font-mono text-white/45 uppercase block font-semibold">Optional Sign-off Clearance Justification</label>
                          <input
                            type="text"
                            placeholder="Type human commentary or audit comments here..."
                            value={approvalComment}
                            onChange={(e) => setApprovalComment(e.target.value)}
                            className="w-full bg-black/30 border border-slate-800/60 rounded-lg p-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary-brand)]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase 17: Autonomous OS - SCM AI Operating System Effectiveness Metrics */}
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                      <div className="flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-cyan-400" />
                        <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider">SCM AI Operating System Effectiveness Metrics</h3>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/15">Continuous Tracking</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-3.5 bg-white/5 rounded-xl border border-slate-800/40">
                        <span className="text-[9px] text-white/45 font-mono block uppercase">Acceptance Rate</span>
                        <strong className="text-sm font-semibold text-white block mt-1">{aposMetrics.acceptanceRate}%</strong>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${aposMetrics.acceptanceRate}%` }} />
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/5 rounded-xl border border-slate-800/40">
                        <span className="text-[9px] text-white/45 font-mono block uppercase">Decision Resp Time</span>
                        <strong className="text-sm font-semibold text-white block mt-1">{aposMetrics.avgResponseMs} ms</strong>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full" style={{ width: `45%` }} />
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/5 rounded-xl border border-slate-800/40">
                        <span className="text-[9px] text-white/45 font-mono block uppercase">Risk Forecast Accuracy</span>
                        <strong className="text-sm font-semibold text-white block mt-1">{aposMetrics.riskPredictionAccuracy}%</strong>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${aposMetrics.riskPredictionAccuracy}%` }} />
                        </div>
                      </div>

                      <div className="p-3.5 bg-white/5 rounded-xl border border-slate-800/40">
                        <span className="text-[9px] text-white/45 font-mono block uppercase">Cycle Compression</span>
                        <strong className="text-sm font-semibold text-white block mt-1">-{aposMetrics.cycleOptimizationWeeks} Weeks</strong>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `78%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {renderAIActionHub()}
                </div>
              )}

              {/* ==========================================
                  2. PROCUREMENT PLANNING
                  ========================================== */}
              {activeTab === 'planning' && (
                <div className="space-y-6" id="workspace-procurement-planning">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
                      <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Annual Procurement Planning Workspace</h2>
                      <span className="bg-[var(--primary-brand)]/10 text-[var(--primary-brand)] text-[10px] px-2.5 py-1 rounded-lg border border-[var(--primary-brand)]/20 font-mono">FY 2026 Grid Capex Ledger</span>
                    </div>
                    
                    <p className="text-xs text-white/45 leading-relaxed">
                      Manage strategic capex programs. The AI compliance scanner automatically blocks split procurement plans to comply with Section 54(2) of the PPADA 2015.
                    </p>

                    {planningNotification && (
                      <div className="bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs p-3.5 rounded-xl flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 shrink-0 animate-bounce" />
                        <span>{planningNotification}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreatePlanItem} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5/40 p-5 rounded-xl border border-slate-800/40">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/45 font-mono block">DEPARTMENTAL OFFICE</label>
                        <select 
                          value={newDept}
                          onChange={(e) => setNewDept(e.target.value)}
                          className="w-full bg-white/5 border border-slate-800/40 rounded-xl px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-[var(--primary-brand)] transition-colors"
                        >
                          <option>Substations Engineering</option>
                          <option>Transmission Grid Development</option>
                          <option>Operations & Maintenance</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/45 font-mono block">CAPITAL PROJECT TITLE</label>
                        <input 
                          type="text"
                          placeholder="e.g. Suswa Substation Expansion Phase 2"
                          value={newProjName}
                          onChange={(e) => setNewProjName(e.target.value)}
                          required
                          className="w-full bg-white/5 border border-slate-800/40 rounded-xl px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[var(--primary-brand)] transition-colors"
                        />
                      </div>

                      <div className="space-y-1.5 flex flex-col justify-end">
                        <label className="text-[9px] text-white/45 font-mono block">CAPEX ALLOCATION (USD)</label>
                        <div className="flex gap-2.5">
                          <input 
                            type="number"
                            placeholder="e.g. 2400000"
                            value={newProjBudget}
                            onChange={(e) => setNewProjBudget(e.target.value)}
                            required
                            className="w-full bg-white/5 border border-slate-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--primary-brand)] transition-colors"
                          />
                          <button 
                            type="submit"
                            className="px-4 bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0"
                          >
                            Commit Item
                          </button>
                        </div>
                      </div>
                    </form>

                    <div className="space-y-3">
                      <h3 className="text-[10px] font-semibold text-white/70 font-mono uppercase tracking-wider">Current ERP Strategic Allocation Lines</h3>
                      <div className="divide-y divide-white/5 bg-white/5/30 rounded-xl border border-slate-800/40 overflow-hidden">
                        {planItems.map((item) => (
                          <div key={item.id} className="p-4 flex justify-between items-center text-xs hover:bg-white/5/50 transition-colors">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white/90">{item.projectName}</span>
                                <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-white/45">{item.id}</span>
                              </div>
                              <p className="text-[10px] text-white/45 mt-1">{item.department} &bull; Method: {item.suggestedMethod}</p>
                            </div>
                            <div className="text-right">
                              <span className="font-mono text-white/90 font-semibold block">${item.budgetUSD.toLocaleString()}</span>
                              <span className="text-[9px] text-[#10B981] font-mono block mt-0.5">Readiness Score: {item.readinessScore}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  3. AUTONOMOUS WORKFLOW ENGINE (15 STAGES)
                  ========================================== */}
              {activeTab === 'tenders' && (
                <div className="space-y-6" id="workspace-tenders-lifecycle">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/40">
                      <div>
                        <h2 className="text-sm font-semibold text-white/90 tracking-wider uppercase">Sovereign PPADA 2015 Compliance Sequencer</h2>
                        <p className="text-xs text-white/45 mt-1">15-Stage statutory chain. Transition blocks automatically if prerequisite controls fail.</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={handleResetSim}
                          className="px-3 py-1.5 bg-white/5 border border-slate-800/40 text-white/70 hover:text-white rounded-xl text-[10px] font-mono cursor-pointer transition-colors"
                        >
                          Reset Sim
                        </button>
                        <button 
                          onClick={() => setIsSimulating(!isSimulating)}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-mono font-bold cursor-pointer transition-all ${
                            isSimulating ? 'bg-[#F59E0B] text-white' : 'bg-[#10B981] text-white'
                          }`}
                        >
                          {isSimulating ? 'Pause Agent Stream' : 'Run Agent Stream'}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Selector List */}
                      <div className="lg:col-span-4 bg-transparent/60 border border-slate-800/40 rounded-xl p-2 max-h-[350px] overflow-y-auto space-y-1">
                        {stages.map(s => {
                          const isCurrent = s.id === activeStageId;
                          return (
                            <button
                              key={s.id}
                              onClick={() => {
                                setActiveStageId(s.id);
                                setIsSimulating(false);
                              }}
                              className={`w-full text-left p-2.5 rounded-lg text-[10.5px] font-mono flex items-center justify-between cursor-pointer transition-colors ${
                                isCurrent ? 'bg-white/5 border border-slate-800/40 text-white' : 'text-white/45 hover:text-white/90'
                              }`}
                            >
                              <span className="truncate">{s.id}. {s.name}</span>
                              <span className={`text-[8px] uppercase px-2 py-0.5 rounded font-semibold tracking-wide ${
                                s.status === 'COMPLETED' ? 'bg-[#10B981]/10 text-[#10B981]' : s.status === 'LOCKED_AWAITING_HITL' ? 'bg-[#F59E0B]/10 text-[#F59E0B] animate-pulse' : 'bg-white/5 text-white/30'
                              }`}>{s.status === 'LOCKED_AWAITING_HITL' ? 'HITL' : s.status}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Stage Details Console with Explainable AI Block */}
                      {(() => {
                        const curStage = stages.find(s => s.id === activeStageId) || stages[0];
                        return (
                          <div className="lg:col-span-8 bg-white/5/40 border border-slate-800/40 rounded-xl p-5 space-y-4 flex flex-col justify-between">
                            
                            <div className="space-y-4">
                              <div className="flex justify-between items-start border-b border-slate-800/40 pb-2.5">
                                <div>
                                  <h4 className="text-sm font-semibold text-white/90">{curStage.name}</h4>
                                  <span className="text-[10px] text-[var(--primary-brand)] font-mono block mt-0.5">{curStage.section} Statutory Compliance</span>
                                </div>
                                <span className="text-[9px] font-mono text-white/45 uppercase bg-white/5 border border-slate-800/40 px-2.5 py-0.5 rounded-full">
                                  {curStage.requiresHITL ? 'HITL Required' : 'Automated Gate'}
                                </span>
                              </div>

                              <div className="bg-transparent p-4 rounded-xl font-mono text-[11px] text-white/70 border border-slate-800/40 space-y-1.5 leading-relaxed">
                                <span className="text-[8px] text-[var(--primary-brand)] block uppercase font-bold tracking-wider">Agent Reasoner Output</span>
                                <p>{curStage.thoughts}</p>
                              </div>

                              <div className="grid grid-cols-2 gap-3 font-mono text-[9px] text-white/45">
                                <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                  <span className="text-white/45 block">AI CONFIDENCE INDEX</span>
                                  <strong className="text-white/90 text-sm mt-1 block font-semibold">{curStage.confidence}%</strong>
                                </div>
                                <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                  <span className="text-white/45 block">RECOMMENDED ACTION</span>
                                  <strong className="text-[var(--primary-brand)] text-xs mt-1 block truncate font-semibold">{curStage.nextAction}</strong>
                                </div>
                              </div>
                            </div>

                            {curStage.status === 'LOCKED_AWAITING_HITL' && (
                              <form onSubmit={handleBypassHITL} className="bg-white/5 border border-[#F59E0B]/20 p-4 rounded-xl space-y-3 shadow-lg shadow-[#000]/50">
                                <span className="text-[9px] font-mono text-[#F59E0B] block uppercase font-bold tracking-wider">MANDATORY HITL GATE SIGN-OFF</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                  <input 
                                    type="text"
                                    placeholder="Audit trail justifications..."
                                    value={commentInput}
                                    onChange={(e) => setCommentInput(e.target.value)}
                                    required
                                    className="bg-transparent border border-slate-800/40 focus:border-[var(--primary-brand)] px-3 py-2 rounded-xl text-xs text-white focus:outline-none transition-colors"
                                  />
                                  <input 
                                    type="password"
                                    placeholder="Security PIN (preset: 1234)..."
                                    value={pinInput}
                                    onChange={(e) => setPinInput(e.target.value)}
                                    required
                                    className="bg-transparent border border-slate-800/40 focus:border-[var(--primary-brand)] px-3 py-2 rounded-xl text-xs text-white focus:outline-none transition-colors"
                                  />
                                </div>
                                {signingError && <p className="text-[10px] font-mono text-[#EF4444]">{signingError}</p>}
                                <button 
                                  type="submit"
                                  className="w-full bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/25 py-2 rounded-xl text-[10.5px] font-mono font-bold text-[#F59E0B] cursor-pointer transition-colors"
                                >
                                  {isSigning ? 'TRANSACTION DEPLOYING...' : 'SIGN STATUTORY BYPASS INSTRUMENT'}
                                </button>
                              </form>
                            )}

                          </div>
                        );
                      })()}
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  4. AI TENDER AUTHORING
                  ========================================== */}
              {activeTab === 'authoring' && (
                <div className="space-y-6" id="workspace-ai-authoring">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <h2 className="text-sm font-semibold text-white/90 tracking-wider uppercase flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[var(--primary-brand)] animate-pulse" /> SCM AI Tender Specifications & Drafting Board
                    </h2>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Generate regulatory scopes, specifications, evaluation criteria, SOW, SLA, and BOQs backed by full explainable parameters.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4 bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 text-xs">
                        <div className="space-y-1.5">
                          <label className="text-[9px] text-white/45 font-mono block">DOCUMENT TEMPLATE TYPE</label>
                          <select 
                            value={authoringTemplate}
                            onChange={(e) => setAuthoringTemplate(e.target.value)}
                            className="w-full bg-white/5 border border-slate-800/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary-brand)] transition-colors"
                          >
                            <option>Technical Specifications</option>
                            <option>Scope of Work (SOW)</option>
                            <option>Bills of Quantities (BOQ)</option>
                            <option>SLA Performance Metrics</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] text-white/45 font-mono block">PROJECT TARGET CAPEX ESTIMATE ($)</label>
                          <input 
                            type="number"
                            value={costEstimateUSD}
                            onChange={(e) => setCostEstimateUSD(Number(e.target.value))}
                            className="w-full bg-white/5 border border-slate-800/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary-brand)] transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] text-white/45 font-mono block">TENDER WORKSPACE NAME / DESCRIPTION</label>
                          <textarea 
                            rows={3}
                            value={authoringTitle}
                            onChange={(e) => setAuthoringTitle(e.target.value)}
                            className="w-full bg-white/5 border border-slate-800/40 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary-brand)] transition-colors leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 pt-2">
                          <button onClick={() => handleDraftingAction('generate')} className="p-2.5 bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white text-[10px] font-bold rounded-xl transition-colors cursor-pointer">
                            Compile Draft
                          </button>
                          <button onClick={() => handleDraftingAction('simplify')} className="p-2.5 bg-white/5 hover:bg-white/5/80 text-white/70 text-[10px] font-bold rounded-xl border border-slate-800/40 transition-colors cursor-pointer">
                            Simplify Clauses
                          </button>
                          <button onClick={() => handleDraftingAction('risk')} className="p-2.5 bg-[var(--primary-brand)]/10 hover:bg-[var(--primary-brand)]/20 text-[var(--primary-brand)] text-[10px] font-bold rounded-xl border border-[var(--primary-brand)]/25 transition-colors cursor-pointer">
                            Quality Audit
                          </button>
                        </div>
                      </div>

                      {/* Document preview with AI explainability box */}
                      <div className="bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-slate-800/40 pb-2">
                            <span className="text-[9px] font-mono text-white/45">OUTPUT PREVIEW TERMINAL</span>
                            <span className="text-[8px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded">SHA-256 Verified</span>
                          </div>

                          {isDrafting ? (
                            <div className="py-12 text-center space-y-3">
                              <RefreshCw className="w-6 h-6 text-[var(--primary-brand)] animate-spin mx-auto" />
                              <p className="text-xs text-white/45 font-mono animate-pulse">Drafting SCM specifications based on historical models...</p>
                            </div>
                          ) : authoringDraft ? (
                            <pre className="font-mono text-[10px] text-white/70 leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-56 bg-transparent/60 p-3 rounded-xl border border-slate-800/40">
                              {authoringDraft}
                            </pre>
                          ) : (
                            <div className="py-12 text-center text-white/30 space-y-2">
                              <FileText className="w-8 h-8 mx-auto text-white/10" />
                              <p className="text-xs">No drafted spec found. Modify details on the left and click Compile Draft.</p>
                            </div>
                          )}
                        </div>

                        {authoringDraft && (
                          <div className="border-t border-slate-800/40 pt-3 mt-4 flex justify-between items-center">
                            <span className="text-[9px] font-mono text-[#10B981]">● COMPLIANCE PASS: Section 44 and Section 70 OK</span>
                            <button 
                              onClick={() => {
                                const newTnd: SCMTender = {
                                  id: `TND-2026-${Math.floor(Math.random() * 80) + 100}`,
                                  title: authoringTitle,
                                  scopeOfWork: authoringDraft,
                                  budgetUSD: costEstimateUSD,
                                  procurementMethod: "Open International competitive",
                                  status: "Review",
                                  complianceStatus: "PASS",
                                  riskScore: 12,
                                  timelineWeeks: 12,
                                  bidsReceivedCount: 0,
                                  category: "Power Grid Assets",
                                  department: "Substations Engineering",
                                  officerInCharge: "Accounting Officer",
                                  auditTrail: [{ timestamp: "2026-06-30", action: "Tender Drafted", actor: "AI Author" }]
                                };
                                setTenders([newTnd, ...tenders]);
                                alert(`Tender draft successfully committed to global SCM register with ID: ${newTnd.id}`);
                              }}
                              className="px-3 py-1.5 bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white font-semibold rounded-lg text-[10px] cursor-pointer"
                            >
                              Publish as Active Portfolio
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  5. SUPPLIER INTELLIGENCE
                  ========================================== */}
              {activeTab === 'suppliers' && (
                <div className="space-y-6" id="workspace-supplier-intelligence">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                      <div>
                        <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">SCM Integrated Supplier Register</h2>
                        <p className="text-xs text-white/45 mt-1">Cross-reference vendor litigation risks, delivery indexes, and financial stability models.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-1 bg-transparent/60 border border-slate-800/40 rounded-2xl p-3 max-h-[350px] overflow-y-auto space-y-1.5">
                        <span className="text-[9px] font-mono text-white/45 uppercase px-2 tracking-wider font-semibold">Active Manufacturers</span>
                        {suppliers.map(sup => (
                          <button
                            key={sup.id}
                            onClick={() => setSelectedSupplierId(sup.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedSupplierId === sup.id ? 'bg-white/5 border-slate-800/40 text-white' : 'bg-transparent border-transparent text-white/45 hover:text-white/90'}`}
                          >
                            <span className="text-xs font-semibold block">{sup.name}</span>
                            <span className="text-[9px] font-mono text-white/30 block mt-0.5">{sup.id} &bull; Delivery Index: {sup.deliveryConfidence}%</span>
                          </button>
                        ))}
                      </div>

                      {/* Supplier detailed review panel */}
                      {(() => {
                        const sup = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
                        return (
                          <div className="md:col-span-2 bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 space-y-4">
                            <div className="flex justify-between items-start border-b border-slate-800/40 pb-3">
                              <div>
                                <h3 className="text-sm font-semibold text-white/90">{sup.name}</h3>
                                <p className="text-xs text-white/45 mt-0.5">{sup.overview}</p>
                              </div>
                              <span className="text-[10px] font-mono text-white/45 bg-white/5 border border-slate-800/40 px-2.5 py-1 rounded-full">
                                ID: {sup.id}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
                              <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                <span className="text-[9px] text-white/45 block">DELIVERY INDEX</span>
                                <strong className="text-white/90 text-sm block mt-1">{sup.deliveryConfidence}%</strong>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                <span className="text-[9px] text-white/45 block">TRUST RATIO</span>
                                <strong className="text-white/90 text-sm block mt-1">{sup.trustScore}%</strong>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                <span className="text-[9px] text-white/45 block">FINANCIAL RISK</span>
                                <strong className="text-[#10B981] text-sm block mt-1">{sup.financialRisk}</strong>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                <span className="text-[9px] text-white/45 block">LITIGATION LEVEL</span>
                                <strong className="text-white/90 text-sm block mt-1">{sup.litigationRisk}</strong>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] font-mono text-[var(--primary-brand)] uppercase tracking-wider block font-semibold">Active Certifications (KRA/NEMA/NCA)</span>
                              <div className="flex flex-wrap gap-1.5">
                                {sup.certifications.map((cert, idx) => (
                                  <span key={idx} className="bg-white/5 text-white/70 text-[9px] px-2.5 py-1 rounded-full border border-slate-800/40">
                                    {cert}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-slate-800/40 pt-3 flex justify-between items-center text-xs text-white/45">
                              <span>Dependency Coefficient: {sup.dependencyScore}%</span>
                              <span>Active Engagements: {sup.activeContractsCount} contracts</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  6. EVALUATION OS (TENDER INTELLIGENCE SUB-MODULE)
                  ========================================== */}
              {activeTab === 'bids' && (
                <div className="w-full space-y-4" id="workspace-evaluation-os">
                  {/* Formal Product Hierarchy Breadcrumb Navigation */}
                  <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs">
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <span className="hover:text-white transition-colors">Salience Atlas</span>
                      <span className="text-slate-600">/</span>
                      <button
                        onClick={() => setActiveTab('dashboard')}
                        className="hover:text-cyan-400 transition-colors cursor-pointer"
                      >
                        Tender Intelligence
                      </button>
                      <span className="text-slate-600">/</span>
                      <span className="text-cyan-300 font-bold">Evaluation OS</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono">
                      <span className="text-slate-400">Context:</span>
                      <span className="text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                        ACTIVE SUB-MODULE
                      </span>
                    </div>
                  </div>

                  <EnterpriseEvaluationEngine
                    activeContextTab="evaluation-os"
                    selectedTender={tenders.find(t => t.id === selectedTenderId) || tenders[0]}
                    selectedEvaluationId="EVAL-2026-0873"
                    onSelectContextTab={(tabId) => {
                      if (tabId === 'tender-overview') setActiveTab('dashboard');
                      else if (tabId === 'bid-intelligence') setActiveTab('suppliers');
                      else if (tabId === 'compliance') setActiveTab('compliance');
                      else if (tabId === 'audit') setActiveTab('rules');
                    }}
                  />
                </div>
              )}

              {/* ==========================================
                  7. CONTRACT INTELLIGENCE
                  ========================================== */}
              {activeTab === 'contracts' && (
                <div className="space-y-6" id="workspace-contracts-intelligence">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                      <div>
                        <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Enterprise SCM Contract Administration</h2>
                        <p className="text-xs text-white/45 mt-1">Track physical milestones, variations cap limits (Section 139), and liquidated damages.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-transparent/60 border border-slate-800/40 rounded-2xl p-3 max-h-[350px] overflow-y-auto space-y-1.5">
                        <span className="text-[9px] font-mono text-white/45 uppercase px-2 tracking-wider font-semibold">Active Ledger Lines</span>
                        {contracts.map(ctr => (
                          <button
                            key={ctr.id}
                            onClick={() => setSelectedContractId(ctr.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedContractId === ctr.id ? 'bg-white/5 border-slate-800/40 text-white' : 'bg-transparent border-transparent text-white/45 hover:text-white/90'}`}
                          >
                            <span className="text-xs font-semibold block">{ctr.title}</span>
                            <span className="text-[9px] font-mono text-white/30 block mt-0.5">{ctr.id} &bull; Progress: {ctr.progressPercent}%</span>
                          </button>
                        ))}
                      </div>

                      {/* Contract actions and statistics */}
                      {(() => {
                        const ctr = contracts.find(c => c.id === selectedContractId) || contracts[0];
                        const variationRatio = ((ctr.variationsUSD / ctr.valueUSD) * 100).toFixed(1);
                        return (
                          <div className="lg:col-span-2 bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 space-y-5">
                            <div className="flex justify-between items-start border-b border-slate-800/40 pb-3">
                              <div>
                                <h3 className="text-sm font-semibold text-white/90">{ctr.title}</h3>
                                <p className="text-xs text-white/45 mt-0.5">Supplier Partner: {ctr.supplierName}</p>
                              </div>
                              <span className="text-[10px] font-mono text-white/45 bg-white/5 border border-slate-800/40 px-2.5 py-1 rounded-full">
                                ID: {ctr.id}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-center">
                              <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                <span className="text-[9px] text-white/45 block">INITIAL CONTRACT VALUE</span>
                                <strong className="text-white/90 text-sm block mt-1">${ctr.valueUSD.toLocaleString()}</strong>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                <span className="text-[9px] text-white/45 block">TOTAL VARIATIONS</span>
                                <strong className="text-white/90 text-sm block mt-1">${ctr.variationsUSD.toLocaleString()}</strong>
                              </div>
                              <div className="bg-white/5 p-3 rounded-xl border border-slate-800/40">
                                <span className="text-[9px] text-white/45 block">VARIATION RATIO</span>
                                <strong className={`text-sm block mt-1 ${Number(variationRatio) > 20 ? 'text-[#EF4444]' : 'text-[#10B981]'}`}>{variationRatio}%</strong>
                              </div>
                            </div>

                            {/* Section 139 compliance guard controller */}
                            <div className="bg-white/5/60 border border-slate-800/40 p-4 rounded-xl space-y-3">
                              <span className="text-[9px] font-mono text-[var(--primary-brand)] uppercase tracking-wider block font-semibold">Initiate Scope Variation Works (Statutory Limit check)</span>
                              <div className="grid grid-cols-3 gap-2.5">
                                <button 
                                  onClick={() => handleAddContractVariation(ctr.id, 100000)}
                                  className="p-2 bg-white/5 hover:bg-white/5 border border-slate-800/40 text-white/90 text-[10.5px] rounded-lg cursor-pointer text-center"
                                >
                                  + $100,000 Variation
                                </button>
                                <button 
                                  onClick={() => handleAddContractVariation(ctr.id, 500000)}
                                  className="p-2 bg-white/5 hover:bg-white/5 border border-slate-800/40 text-white/90 text-[10.5px] rounded-lg cursor-pointer text-center"
                                >
                                  + $500,000 Variation
                                </button>
                                <button 
                                  onClick={() => handleAddContractVariation(ctr.id, 1000000)}
                                  className="p-2 bg-white/5 hover:bg-white/5 border border-slate-800/40 text-white/90 text-[10.5px] rounded-lg cursor-pointer text-center"
                                >
                                  + $1,000,000 Variation
                                </button>
                              </div>
                              <p className="text-[9.5px] text-white/45 leading-normal">
                                Section 139 enforces a strict 25.0% cap on cumulative variations relative to initial contract value. Transactions exceeding this threshold are automatically locked down.
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  8. RISK INTELLIGENCE
                  ========================================== */}
              {activeTab === 'risk' && (
                <div className="space-y-6" id="workspace-risk-intelligence">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">SCM AI Fraud and Risk Assessment Center</h2>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Continually map global supply line vulnerabilities. Deep analysis on vendor collusion signals, pricing anomalies, and shipping lane interruptions.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 space-y-4">
                        <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Vessel and Shipping lane stress markers</span>
                        
                        <div className="space-y-3 text-xs leading-relaxed">
                          <div className="p-3.5 bg-transparent/60 border border-slate-800/40 rounded-xl flex justify-between items-center hover:border-white/10 transition-colors">
                            <div>
                              <span className="font-semibold text-white/90 block">Suez Canal / Red Sea Transits</span>
                              <span className="text-[10px] text-white/45 block mt-0.5">Maritime shipping lanes volatility</span>
                            </div>
                            <span className="bg-[#EF4444]/10 text-[#EF4444] text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase">HIGH RISK (88%)</span>
                          </div>

                          <div className="p-3.5 bg-transparent/60 border border-slate-800/40 rounded-xl flex justify-between items-center hover:border-white/10 transition-colors">
                            <div>
                              <span className="font-semibold text-white/90 block">Mombasa Port Custom clearances</span>
                              <span className="text-[10px] text-white/45 block mt-0.5">Average wait duration: 11.2 days</span>
                            </div>
                            <span className="bg-[#F59E0B]/10 text-[#F59E0B] text-[9px] font-mono px-2.5 py-0.5 rounded-full uppercase">MODERATE (45%)</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Active Risk Audits (Section 95)</span>
                          <p className="text-xs text-white/45 leading-relaxed">
                            No collusion triggers flagged across open bids. Global aluminum price fluctuation risk managed via structural contract locking mechanisms.
                          </p>
                        </div>
                        
                        <div className="border-t border-slate-800/40 pt-3 mt-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                          <span className="text-[10px] font-mono text-[#10B981] uppercase font-bold">SHA-256 secure hash audit trails clean</span>
                        </div>
                      </div>
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  9. CONTINUOUS COMPLIANCE
                  ========================================== */}
              {activeTab === 'compliance' && (
                <div className="space-y-6 animate-fadeIn" id="workspace-continuous-compliance">
                  {/* Overview Header */}
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                      <div>
                        <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                          <Scale className="w-4 h-4 text-[var(--primary-brand)]" />
                          Autonomous Procurement Decision Intelligence Engine (APDIE)
                        </h2>
                        <p className="text-xs text-white/45 mt-1">
                          Enterprise-grade continuous decision intelligence evaluating 19 autonomous self-audit structures under PPADA 2015 and PPADR 2020.
                        </p>
                      </div>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-3 py-1 rounded border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                        Continuous Reasoning: Active
                      </span>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-slate-800/40 font-mono text-[10px]">
                      <div className="bg-white/5 p-3 rounded-xl border border-slate-800/30">
                        <span className="text-white/40 block">AUTONOMOUS ENTITIES</span>
                        <strong className="text-white/90 text-sm mt-1 block">19 Living Objects</strong>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-slate-800/30">
                        <span className="text-white/40 block">CRITICAL FLAG INDICATORS</span>
                        <strong className="text-rose-400 text-sm mt-1 block">
                          {autonomousEntities.filter(e => e.status === 'CRITICAL' || e.status === 'ESCALATED').length} Flagged
                        </strong>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-slate-800/30">
                        <span className="text-white/40 block">PENDING HITL APPROVALS</span>
                        <strong className="text-amber-400 text-sm mt-1 block">
                          {approvalGates.filter(g => g.status === 'PENDING').length} Gate Actions
                        </strong>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-slate-800/30">
                        <span className="text-white/40 block">AUDIT TRUST METRIC</span>
                        <strong className="text-[#10B981] text-sm mt-1 block">98.4% Secure</strong>
                      </div>
                    </div>
                  </div>

                  {/* Main Grid: Living Entities & Selected Detail Inspector */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: 19 Living Entities Grid (7 columns) */}
                    <div className="lg:col-span-7 bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                        <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Active Self-Evaluating Living Entities</span>
                        <span className="text-[9px] font-mono text-white/30">Select object to inspect</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-2">
                        {autonomousEntities.map((ent) => {
                          const isSelected = selectedEntityId === ent.id;
                          return (
                            <button
                              key={ent.id}
                              onClick={() => setSelectedEntityId(ent.id)}
                              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between h-[110px] transition-all cursor-pointer relative overflow-hidden ${
                                isSelected
                                  ? 'bg-[var(--primary-brand)]/10 border-[var(--primary-brand)] text-white shadow-lg'
                                  : 'bg-white/5 border-slate-800/40 text-white/70 hover:bg-white/10'
                              }`}
                            >
                              <div className="w-full">
                                <div className="flex justify-between items-start text-[9px] font-mono text-white/45">
                                  <span>{ent.id}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-semibold ${
                                    ent.status === 'OPTIMAL' ? 'bg-emerald-500/10 text-emerald-400' :
                                    ent.status === 'NOMINAL' ? 'bg-cyan-500/10 text-cyan-400' :
                                    ent.status === 'DEGRADED' ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-rose-500/10 text-rose-400'
                                  }`}>{ent.status}</span>
                                </div>
                                <h4 className="font-bold text-[11.5px] text-white/95 mt-1 truncate w-full">{ent.name}</h4>
                                <span className="text-[9px] text-white/40 block mt-0.5">{ent.type}</span>
                              </div>

                              <div className="flex justify-between items-center border-t border-white/5 pt-1.5 mt-1.5 text-[9px] font-mono text-white/45 w-full">
                                <span>Health Index:</span>
                                <span className={ent.healthScore >= 90 ? 'text-emerald-400 font-bold' : ent.healthScore >= 70 ? 'text-cyan-400 font-bold' : 'text-rose-400 font-bold'}>
                                  {ent.healthScore}%
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Decision Inspector (5 columns) */}
                    <div className="lg:col-span-5 bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-5 rounded-2xl space-y-4 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                        <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Cognitive Trace Inspector</span>
                        <span className="text-[9px] font-mono text-emerald-400">Explainable Trace</span>
                      </div>

                      {(() => {
                        const entity = autonomousEntities.find(e => e.id === selectedEntityId);
                        if (!entity) {
                          return (
                            <div className="py-12 text-center text-white/30 italic">
                              Select an autonomous living entity on the left to review its continuous compliance status and compliance evidence traces.
                            </div>
                          );
                        }

                        const exec = entity.lastExecution;
                        return (
                          <div className="space-y-4">
                            <div className="border-b border-white/5 pb-3">
                              <span className="text-[9px] font-mono text-[var(--primary-brand)] block">{entity.type}</span>
                              <h3 className="font-bold text-white text-sm mt-0.5">{entity.name}</h3>
                              <p className="text-[10px] text-white/45 mt-1">Last Evaluated: {new Date(entity.lastEvaluatedAt).toLocaleTimeString()}</p>
                            </div>

                            <div className="space-y-3 leading-relaxed text-white/70">
                              {/* 1. Observation */}
                              <div>
                                <span className="text-[9.5px] font-mono text-cyan-400 block uppercase">1. Observation Block</span>
                                <p className="text-[11px] mt-0.5 text-white/80">{exec?.observedContext || 'Acquiring active market signals...'}</p>
                              </div>

                              {/* 2. Understanding */}
                              <div>
                                <span className="text-[9.5px] font-mono text-indigo-400 block uppercase">2. Understanding (PPADA Reference)</span>
                                <p className="text-[11px] mt-0.5 text-white/80 italic">"{exec?.understanding}"</p>
                              </div>

                              {/* 3. Reasoning Path */}
                              <div>
                                <span className="text-[9.5px] font-mono text-purple-400 block uppercase mb-1">3. Active Reasoning Steps</span>
                                <div className="space-y-1 font-mono text-[9px] text-white/50 bg-black/35 p-2.5 rounded-lg border border-slate-800/50">
                                  {exec?.reasoningPath?.map((step: string, idx: number) => (
                                    <div key={idx} className="flex gap-1.5 items-start">
                                      <span className="text-[var(--primary-brand)]">[{idx+1}]</span>
                                      <span>{step}</span>
                                    </div>
                                  )) || <div>Simulating cognitive path...</div>}
                                </div>
                              </div>

                              {/* 4. Risk & Predictions */}
                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-white/5 p-2.5 rounded-xl border border-slate-800/40">
                                  <span className="text-[8px] font-mono text-white/40 block">PREDICTIVE FAILURE</span>
                                  <span className="text-xs font-mono font-bold mt-1 block text-rose-400">
                                    {((exec?.prediction?.failureProbability ?? 0.1) * 100).toFixed(0)}% Likely
                                  </span>
                                </div>
                                <div className="bg-white/5 p-2.5 rounded-xl border border-slate-800/40">
                                  <span className="text-[8px] font-mono text-white/40 block">OVERALL RISK SCORE</span>
                                  <span className="text-xs font-mono font-bold mt-1 block text-amber-400">
                                    {exec?.riskScore ?? 15} / 100
                                  </span>
                                </div>
                              </div>

                              {/* 5. Recommendations */}
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1">
                                <span className="text-[9.5px] font-mono text-emerald-400 block uppercase font-bold">4. Strategic Recommendation</span>
                                <p className="text-[11px] text-white/95 font-sans leading-relaxed">{exec?.recommendation || 'Continuous tracking.'}</p>
                              </div>

                              {/* 6. Cryptographic Audit trail */}
                              <div className="font-mono text-[8.5px] text-white/30 flex justify-between border-t border-white/5 pt-2">
                                <span>AUDIT HASH:</span>
                                <span className="truncate max-w-[200px]">{exec?.auditTrailHash || 'SHA256_BASELINE_SIGNATURE'}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Human-In-The-Loop Governance Queue Section */}
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-400" />
                        <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider font-sans">Human-In-The-Loop Approval Gates Queue</h3>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/15">
                        Statutory Approval Gates
                      </span>
                    </div>

                    <p className="text-xs text-white/45 leading-relaxed">
                      Escalations triggered automatically when procurement metrics breach statutory thresholds. Standard compliance forbids automated resolution for these actions.
                    </p>

                    <div className="space-y-4">
                      {approvalGates.filter(g => g.status === 'PENDING').length === 0 ? (
                        <div className="py-6 text-center text-emerald-400 font-mono text-xs bg-emerald-950/10 rounded-xl border border-emerald-500/15">
                          ✔ All Human-In-The-Loop compliance gates currently cleared and satisfied.
                        </div>
                      ) : (
                        approvalGates.filter(g => g.status === 'PENDING').map((gate) => (
                          <div key={gate.id} className="p-5 bg-white/5 rounded-2xl border border-slate-800/50 hover:border-slate-700/60 transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2 font-mono text-[9px]">
                                <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">{gate.id}</span>
                                <span className="text-white/40">•</span>
                                <span className="text-white/60">{gate.entityType}</span>
                                <span className="text-white/40">•</span>
                                <span className="text-rose-400 font-bold">Risk: {gate.riskRating}</span>
                              </div>
                              <h4 className="font-bold text-white text-xs">{gate.actionRequested}</h4>
                              <p className="text-[11px] text-white/60 leading-normal"><strong className="text-white/80 font-semibold">Proposed Change:</strong> {gate.proposedChange}</p>
                              <p className="text-[11px] text-white/60 leading-normal"><strong className="text-white/80 font-semibold">Reasoning:</strong> {gate.reason}</p>
                            </div>

                            <div className="w-full md:w-[240px] space-y-3 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-slate-800/60 md:pl-4">
                              <label className="text-[8.5px] font-mono text-white/45 block uppercase">Oversight Feedback Comment</label>
                              <textarea
                                value={resolveFeedback}
                                onChange={(e) => setResolveFeedback(e.target.value)}
                                placeholder="State statutory reason for approval or rejection..."
                                rows={2}
                                className="w-full bg-black/40 border border-slate-800/80 rounded-lg p-2 text-[10px] text-white placeholder-white/20 focus:outline-none"
                              />

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleResolveGate(gate.id, 'APPROVED')}
                                  disabled={resolvingGateId === gate.id}
                                  className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg cursor-pointer transition-colors text-[10px] text-center"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleResolveGate(gate.id, 'REJECTED')}
                                  disabled={resolvingGateId === gate.id}
                                  className="flex-1 py-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg cursor-pointer transition-colors text-[10px] text-center"
                                >
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Real-time background telemetry logs */}
                  <div className="bg-black/40 border border-slate-800/40 p-5 rounded-2xl space-y-3 font-mono text-xs">
                    <div className="flex justify-between items-center border-b border-slate-800/30 pb-2">
                      <span className="text-[9.5px] text-white/45 uppercase tracking-wider block font-semibold">APDIE Daemon Telemetry Stream Logs</span>
                      <span className="text-[8.5px] text-emerald-400">Worker Status: Online</span>
                    </div>

                    <div className="space-y-2 max-h-36 overflow-y-auto pr-2">
                      {apdieLogs.map((log: any, idx: number) => (
                        <div key={idx} className="flex gap-2.5 items-start text-[9.5px] border-b border-slate-800/20 pb-1 leading-relaxed">
                          <span className="text-white/30 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                          <span className={`shrink-0 font-bold ${
                            log.type === 'error' ? 'text-rose-400' : log.type === 'warning' ? 'text-amber-400' : 'text-cyan-400'
                          }`}>[{log.type.toUpperCase()}]</span>
                          <span className="text-white/60">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {renderAIActionHub()}
                </div>
              )}

              {/* ==========================================
                  10. ENTERPRISE RULES ENGINE
                  ========================================== */}
              {activeTab === 'rules' && (
                <div className="space-y-6" id="workspace-rules-engine">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Custom SCM Compliance Rule Planner</h2>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Inject regulatory parameters directly into active workflows. The rule compiler automatically checks logic consistency before committing policies.
                    </p>

                    <form onSubmit={handleAddRule} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5/40 p-5 rounded-xl border border-slate-800/40">
                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/45 font-mono block">TRIGGER CONDITIONAL RULE</label>
                        <input 
                          type="text"
                          value={newRuleTrigger}
                          onChange={(e) => setNewRuleTrigger(e.target.value)}
                          required
                          className="w-full bg-white/5 border border-slate-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--primary-brand)]"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] text-white/45 font-mono block">AUTOMATED ENFORCEMENT ACTION</label>
                        <input 
                          type="text"
                          value={newRuleAction}
                          onChange={(e) => setNewRuleAction(e.target.value)}
                          required
                          className="w-full bg-white/5 border border-slate-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--primary-brand)]"
                        />
                      </div>

                      <div className="space-y-1.5 flex flex-col justify-end">
                        <button type="submit" className="px-4 py-2 bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer">
                          Apply SCM Policy Rule
                        </button>
                      </div>
                    </form>

                    <div className="space-y-3">
                      <span className="text-[10px] font-mono text-white/70 uppercase tracking-wider block font-semibold">Active Enforced Policies</span>
                      <div className="divide-y divide-white/5 bg-white/5/30 rounded-xl border border-slate-800/40 overflow-hidden text-xs">
                        {rules.map(rule => (
                          <div key={rule.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                            <div>
                              <strong className="text-white/90">IF: {rule.trigger}</strong>
                              <p className="text-[10px] text-white/45 mt-1">THEN: {rule.action}</p>
                            </div>
                            <span className="bg-[#10B981]/10 text-[#10B981] text-[8px] font-mono px-2 py-0.5 rounded uppercase font-semibold">Enforced</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* ==========================================
                  11. PREDICTIVE BI ANALYTICS
                  ========================================== */}
              {activeTab === 'analytics' && (
                <div className="space-y-6" id="workspace-predictive-analytics">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider">Predictive BI procurement Analytics</h2>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Track forecasts on market commodity metal pricing indices, delivery timelines, and budget deviation indexes.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 space-y-4">
                        <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">LME Aluminum Price Volatility Index</span>
                        <div className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[
                              { month: 'Jan', price: 2200 },
                              { month: 'Feb', price: 2250 },
                              { month: 'Mar', price: 2400 },
                              { month: 'Apr', price: 2380 },
                              { month: 'May', price: 2600 }
                            ]}>
                              <CartesianGrid stroke="rgba(255,255,255,0.02)" />
                              <XAxis dataKey="month" stroke="rgba(255,255,255,0.3)" fontSize={8} />
                              <YAxis stroke="rgba(255,255,255,0.3)" fontSize={8} />
                              <Tooltip contentStyle={{ backgroundColor: '#151B23', borderColor: 'rgba(255,255,255,0.06)' }} />
                              <Line type="monotone" dataKey="price" stroke="var(--primary-brand)" strokeWidth={2} dot={{ fill: 'var(--primary-brand)' }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      <div className="bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Forecast Summaries</span>
                          <p className="text-xs text-white/45 leading-relaxed">
                            Commodity pricing expected to stabilize by Q4. Ocean shipping delays from Southeast Asia are currently estimated to compress timeline margins by 12%.
                          </p>
                        </div>
                        
                        <div className="border-t border-slate-800/40 pt-3 mt-4 text-[9.5px] font-mono text-[var(--primary-brand)] uppercase font-bold">
                          Model accuracy confidence level: 91%
                        </div>
                      </div>
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  12. KNOWLEDGE GRAPH MESH
                  ========================================== */}
              {activeTab === 'graph' && (
                <div className="space-y-6 animate-fadeIn" id="workspace-knowledge-graph">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/40">
                      <div>
                        <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                          <GitMerge className="w-4 h-4 text-cyan-400" />
                          SCM Interactive Decision Graph Mesh
                        </h2>
                        <p className="text-xs text-white/45 mt-1">
                          Trace multi-agent SCM decisions, statutory dependency pathways, risk scores, and autonomous evidence trails in real-time.
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-xl border border-slate-800/40">
                        <button
                          onClick={() => setGraphMode('static')}
                          className={`px-3 py-1 text-[10px] font-mono rounded-lg transition-colors cursor-pointer ${
                            graphMode === 'static' ? 'bg-[var(--primary-brand)] text-black font-bold' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          SCM CONSTRAINTS
                        </button>
                        <button
                          onClick={() => setGraphMode('dynamic')}
                          className={`px-3 py-1 text-[10px] font-mono rounded-lg transition-colors cursor-pointer ${
                            graphMode === 'dynamic' ? 'bg-[var(--primary-brand)] text-black font-bold' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          LIVE ENTITIES ({autonomousEntities.length})
                        </button>
                      </div>
                    </div>

                    {graphMode === 'static' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Interactive Graph Display (8 columns) */}
                        <div className="lg:col-span-8 bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 space-y-4">
                          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">SCM Decision & Constraint Graph Nodes</span>
                          
                          <div className="p-6 border border-slate-800/40 rounded-2xl bg-black/30 text-center space-y-6 relative overflow-hidden">
                            {/* Visual representations of links/pathways */}
                            <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
                              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <line x1="20%" y1="50%" x2="50%" y2="25%" stroke="#3B82F6" strokeWidth="2" strokeDasharray="5,5" />
                                <line x1="50%" y1="25%" x2="80%" y2="50%" stroke="#10B981" strokeWidth="2" strokeDasharray="5,5" />
                                <line x1="80%" y1="50%" x2="50%" y2="75%" stroke="#F59E0B" strokeWidth="2" />
                                <line x1="50%" y1="75%" x2="20%" y2="50%" stroke="#EF4444" strokeWidth="2" />
                                <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#3B82F6" strokeWidth="1" strokeDasharray="3,3" />
                              </svg>
                            </div>

                            <div className="flex justify-center gap-4 flex-wrap relative z-10">
                              {decisionNodes.map(node => (
                                <button
                                  key={node.id}
                                  onClick={() => setSelectedGraphNode(node)}
                                  className={`px-4 py-3 rounded-2xl border transition-all cursor-pointer font-mono text-[10.5px] flex flex-col items-start gap-1.5 w-[200px] text-left relative overflow-hidden ${
                                    selectedGraphNode?.id === node.id 
                                      ? 'bg-[var(--primary-brand)]/15 border-[var(--primary-brand)] text-white shadow-[0_0_15px_var(--primary-glow)] scale-[1.03]' 
                                      : 'bg-white/5 border-slate-800/40 text-white/70 hover:border-slate-700/60'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 w-full">
                                    <span className={`w-2.5 h-2.5 rounded-full ${
                                      node.status === 'OK' ? 'bg-emerald-400' :
                                      node.status === 'WARNING' ? 'bg-amber-400' : 'bg-rose-400'
                                    } animate-pulse shrink-0`} />
                                    <span className="font-bold text-white/90 truncate">{node.id}</span>
                                  </div>
                                  <span className="text-[10px] text-white/60 truncate w-full">{node.label}</span>
                                  <div className="flex justify-between items-center w-full mt-1.5 border-t border-white/5 pt-1.5 text-[9px] text-white/40">
                                    <span>{node.type}</span>
                                    <span className={node.status === 'OK' ? 'text-emerald-400' : 'text-amber-400'}>{node.status}</span>
                                  </div>
                                </button>
                              ))}
                            </div>

                            <p className="text-[9.5px] text-white/35 font-mono">
                              ▲ Dashed links indicate conditional agent justifications; solid lines indicate validated procurement dependencies.
                            </p>
                          </div>
                        </div>

                        {/* Node Property & Trace Inspector (4 columns) */}
                        <div className="lg:col-span-4 bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 space-y-4 text-xs">
                          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Node properties inspector</span>
                          
                          {selectedGraphNode ? (
                            <div className="space-y-4">
                              <div className="border-b border-slate-800/40 pb-2.5">
                                <div className="flex justify-between items-start">
                                  <span className="font-mono text-[10px] text-white/40">{selectedGraphNode.type}</span>
                                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                                    selectedGraphNode.status === 'OK' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-amber-400/10 text-amber-400'
                                  }`}>{selectedGraphNode.status}</span>
                                </div>
                                <h4 className="font-bold text-white text-sm mt-1">{selectedGraphNode.label}</h4>
                              </div>

                              <div className="space-y-2 text-[11px] leading-relaxed">
                                <div>
                                  <span className="text-white/45 uppercase text-[9px] font-mono block mb-0.5">Summary Outcome</span>
                                  <p className="text-white/80">{selectedGraphNode.details.summary}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 font-mono text-[9.5px] bg-black/20 p-2 rounded border border-slate-800/40">
                                  <div>
                                    <span className="text-white/40 block">AUDIT CODE</span>
                                    <span className="text-white/80">{selectedGraphNode.details.auditCode}</span>
                                  </div>
                                  <div>
                                    <span className="text-white/40 block">TRUST RATING</span>
                                    <span className="text-white/80">{selectedGraphNode.details.trustRating}</span>
                                  </div>
                                </div>

                                <div>
                                  <span className="text-white/45 uppercase text-[9px] font-mono block mb-0.5">Statutory Justification</span>
                                  <p className="text-white/75 italic bg-white/5 p-2 rounded-lg text-[10.5px] border border-slate-800/40">
                                    "{selectedGraphNode.details.justification}"
                                  </p>
                                </div>

                                <div>
                                  <span className="text-white/45 uppercase text-[9px] font-mono block mb-1">Recommended Actions</span>
                                  <div className="space-y-1">
                                    {selectedGraphNode.details.nextActions.map((action, idx) => (
                                      <div key={idx} className="flex items-start gap-1.5 text-[10px] text-emerald-400 font-mono">
                                        <span>✔</span>
                                        <span>{action}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="py-12 text-center space-y-2">
                              <p className="text-white/30 italic">Select a decision node from the graph to inspect agent justifications, evidence trails, and statutory PPADA reference codes.</p>
                              <button
                                onClick={() => setSelectedGraphNode(decisionNodes[0])}
                                className="text-[10px] text-[var(--primary-brand)] hover:underline font-mono"
                              >
                                Inspect Default Node →
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Interactive Graph Display (8 columns) */}
                        <div className="lg:col-span-8 bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 space-y-4">
                          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Living Entity Semantic Dependency Nodes</span>
                          
                          <div className="p-6 border border-slate-800/40 rounded-2xl bg-black/30 text-center space-y-6 relative overflow-hidden">
                            {/* SVG Network Background representing relationships */}
                            <div className="absolute inset-0 pointer-events-none opacity-20">
                              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <line x1="20%" y1="20%" x2="40%" y2="50%" stroke="#06B6D4" strokeWidth="1.5" />
                                <line x1="40%" y1="50%" x2="70%" y2="40%" stroke="#06B6D4" strokeWidth="1.5" />
                                <line x1="70%" y1="40%" x2="80%" y2="80%" stroke="#06B6D4" strokeWidth="1.5" />
                                <line x1="40%" y1="50%" x2="20%" y2="80%" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="4,4" />
                                <line x1="20%" y1="80%" x2="60%" y2="80%" stroke="#06B6D4" strokeWidth="1.5" />
                                <line x1="60%" y1="80%" x2="70%" y2="40%" stroke="#EAB308" strokeWidth="1.5" />
                              </svg>
                            </div>

                            <div className="flex justify-center gap-3.5 flex-wrap relative z-10 max-h-[360px] overflow-y-auto p-2">
                              {autonomousEntities.map(node => (
                                <button
                                  key={node.id}
                                  onClick={() => setSelectedDynamicNodeId(node.id)}
                                  className={`px-3 py-2.5 rounded-xl border transition-all cursor-pointer font-mono text-[10px] flex flex-col items-start gap-1 w-[180px] text-left relative overflow-hidden ${
                                    selectedDynamicNodeId === node.id 
                                      ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] scale-[1.02]' 
                                      : 'bg-white/5 border-slate-800/40 text-white/70 hover:border-slate-700/60'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 w-full">
                                    <span className={`w-2.5 h-2.5 rounded-full ${
                                      node.status === 'OPTIMAL' ? 'bg-emerald-400' :
                                      node.status === 'NOMINAL' ? 'bg-cyan-400' :
                                      node.status === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-400'
                                    } animate-pulse shrink-0`} />
                                    <span className="font-bold text-white/90 truncate">{node.id}</span>
                                  </div>
                                  <span className="text-[9px] text-white/50 truncate w-full">{node.name}</span>
                                  <div className="flex justify-between items-center w-full mt-1 border-t border-white/5 pt-1 text-[8px] text-white/40">
                                    <span>{node.type}</span>
                                    <span className="text-cyan-400">{node.healthScore}% H</span>
                                  </div>
                                </button>
                              ))}
                            </div>

                            <p className="text-[9.5px] text-white/35 font-mono">
                              ▲ Nodes represent live evaluated procurement files. Blue links represent natural timeline transitions; dotted red links indicate challenged or escalated states.
                            </p>
                          </div>
                        </div>

                        {/* Node Property & Trace Inspector (4 columns) */}
                        <div className="lg:col-span-4 bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 space-y-4 text-xs">
                          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Active Entity properties</span>
                          
                          {(() => {
                            const node = autonomousEntities.find(e => e.id === selectedDynamicNodeId);
                            if (!node) {
                              return (
                                <div className="py-12 text-center text-white/30 italic">
                                  Select an autonomous living entity node to inspect its properties.
                                </div>
                              );
                            }

                            const exec = node.lastExecution;
                            return (
                              <div className="space-y-4 leading-relaxed">
                                <div className="border-b border-slate-800/40 pb-2.5">
                                  <div className="flex justify-between items-start">
                                    <span className="font-mono text-[10px] text-cyan-400">{node.type}</span>
                                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded ${
                                      node.status === 'OPTIMAL' ? 'bg-emerald-400/10 text-emerald-400' :
                                      node.status === 'NOMINAL' ? 'bg-cyan-400/10 text-cyan-400' :
                                      node.status === 'DEGRADED' ? 'bg-amber-400/10 text-amber-400' : 'bg-rose-400/10 text-rose-400'
                                    }`}>{node.status}</span>
                                  </div>
                                  <h4 className="font-bold text-white text-sm mt-1">{node.name}</h4>
                                </div>

                                <div className="space-y-3 text-[11px]">
                                  <div>
                                    <span className="text-white/45 uppercase text-[9px] font-mono block mb-0.5">Observation Context</span>
                                    <p className="text-white/80">{exec?.observedContext}</p>
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 font-mono text-[9.5px] bg-black/20 p-2 rounded border border-slate-800/40">
                                    <div>
                                      <span className="text-white/40 block">HEALTH INDEX</span>
                                      <span className="text-emerald-400 font-bold">{node.healthScore}%</span>
                                    </div>
                                    <div>
                                      <span className="text-white/40 block">RISK SCORE</span>
                                      <span className="text-amber-400 font-bold">{exec?.riskScore ?? 0}/100</span>
                                    </div>
                                  </div>

                                  <div>
                                    <span className="text-white/45 uppercase text-[9px] font-mono block mb-0.5">Understanding / PPADA Clause</span>
                                    <p className="text-white/75 italic bg-white/5 p-2 rounded-lg border border-slate-800/40 leading-normal">
                                      "{exec?.understanding}"
                                    </p>
                                  </div>

                                  <div>
                                    <span className="text-white/45 uppercase text-[9px] font-mono block mb-0.5">Autonomous Evaluation Outcome</span>
                                    <p className="text-white/80">{exec?.recommendation}</p>
                                  </div>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  13. AUTONOMOUS AGENTS MESH
                  ========================================== */}
              {activeTab === 'agents' && (
                <div className="space-y-6" id="workspace-agents-mesh">
                  {/* Part 1: Autonomous Situation Room & Enterprise Event Bus */}
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-800/40">
                      <div>
                        <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> SCM Autonomous Situation Room
                        </h2>
                        <p className="text-xs text-white/45 mt-1">
                          Continuously listening to enterprise events, dispatching specialized agents, and running automated compliance checks.
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          EVENT BUS: RUNNING
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Event Emit Trigger Panel (Left) */}
                      <div className="lg:col-span-4 bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 space-y-4 text-xs">
                        <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Simulate Enterprise Activity</span>
                        
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-white/45 font-mono text-[9.5px]">EVENT PROTOCOL TYPE</label>
                            <select
                              value={newEventType}
                              onChange={(e) => setNewEventType(e.target.value)}
                              className="w-full bg-black/40 border border-slate-800/80 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary-brand)]"
                            >
                              <option value="Procurement Request Created">Procurement Request Created</option>
                              <option value="Budget Updated">Budget Updated</option>
                              <option value="Procurement Plan Amended">Procurement Plan Amended</option>
                              <option value="Tender Published">Tender Published</option>
                              <option value="Bid Submitted">Bid Submitted</option>
                              <option value="Contract Delayed">Contract Delayed</option>
                              <option value="Supplier Profile Updated">Supplier Profile Updated</option>
                              <option value="Compliance Issue Detected">Compliance Issue Detected</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-white/45 font-mono text-[9.5px]">EVENT TITLE DESCRIPTION</label>
                            <input
                              type="text"
                              placeholder="e.g. Mombasa Port delay increases metal freight time..."
                              value={newEventTitle}
                              onChange={(e) => setNewEventTitle(e.target.value)}
                              className="w-full bg-black/40 border border-slate-800/80 rounded-xl p-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary-brand)]"
                            />
                          </div>

                          <button
                            onClick={() => {
                              triggerCustomEvent(newEventTitle, newEventType);
                              setNewEventTitle("");
                            }}
                            className="w-full bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white font-bold py-2.5 rounded-xl cursor-pointer transition-colors shadow-lg shadow-[var(--primary-brand)]/10 flex items-center justify-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Emit Event to SCM Bus
                          </button>
                        </div>

                        {/* Continuous Monitoring Checkbox */}
                        <div className="border-t border-slate-800/40 pt-3 mt-3 flex items-center justify-between">
                          <span className="text-white/60">Strict PPADA Sentinel Guards</span>
                          <button
                            onClick={() => {
                              setEnforceStrictPPADA(!enforceStrictPPADA);
                              setExecutiveLogs(prev => [`🛡️ [SENTINEL POLICY MODIFIED] Strict PPADA compliance guards set to ${!enforceStrictPPADA ? 'ACTIVE' : 'INACTIVE'}.`, ...prev]);
                            }}
                            className={`px-2.5 py-1 text-[10px] font-mono rounded cursor-pointer transition-colors ${enforceStrictPPADA ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}
                          >
                            {enforceStrictPPADA ? 'STRICT COMPLIANT' : 'BYPASS ACTIVE'}
                          </button>
                        </div>
                      </div>

                      {/* Event Ticker Feed (Right) */}
                      <div className="lg:col-span-8 bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 space-y-3 flex flex-col justify-between">
                        <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Live Enterprise Event Ticker Feed</span>
                        
                        <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                          {procurementEvents.map((evt) => (
                            <div key={evt.id} className="p-3 bg-black/20 rounded-xl border border-slate-800/40 text-xs flex justify-between items-start gap-3 hover:border-slate-700/60 transition-colors">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-[var(--primary-brand)] font-bold text-[11px]">{evt.id}</span>
                                  <span className="bg-white/5 text-white/70 text-[9px] font-mono px-1.5 py-0.5 rounded font-medium">{evt.type}</span>
                                </div>
                                <h4 className="font-semibold text-white/95">{evt.title}</h4>
                                <p className="text-white/45 text-[10.5px] font-mono">{evt.details}</p>
                              </div>

                              <div className="text-right shrink-0 font-mono text-[10px] space-y-1">
                                <span className="text-white/30 block">{evt.timestamp}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded inline-block uppercase font-bold ${
                                  evt.status === 'PROCESSED' ? 'bg-emerald-400/10 text-emerald-400' :
                                  evt.status === 'TRIGGERED' ? 'bg-amber-400/10 text-amber-400 animate-pulse' : 'bg-rose-400/10 text-rose-400'
                                }`}>{evt.status}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="border-t border-slate-800/40 pt-3 text-[9.5px] font-mono text-white/30 flex justify-between items-center">
                          <span>Event-Driven Bus: Listening on standard Kafka topic: "scm.procurement"</span>
                          <span>Logs: {procurementEvents.length} active</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Part 2: Enterprise Agent Orchestration Console */}
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <div className="flex justify-between items-center pb-3 border-b border-slate-800/40">
                      <div>
                        <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-[var(--primary-brand)]" /> Multi-Agent SCM Collaboration Orchestrator
                        </h3>
                        <p className="text-xs text-white/45 mt-1">Coordination, parallel execution status, conflict resolution, and consolidated reasoning graphs.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                          orchestratorStatus === 'Idle' ? 'bg-white/5 text-white/40' : 'bg-[var(--primary-brand)]/10 text-[var(--primary-brand)] border border-[var(--primary-brand)]/20'
                        }`}>
                          STATUS: {orchestratorStatus}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Active Agent Grid (Left) */}
                      <div className="lg:col-span-4 bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 space-y-4">
                        <span className="text-[10px] font-mono text-white/45 uppercase block font-semibold">Specialized SCM Agent Workforce</span>
                        
                        <div className="space-y-2.5 text-xs">
                          {[
                            { name: 'Planner Agent', desc: 'Analyzes budgets & capex envelopes' },
                            { name: 'Tender Author', desc: 'Compiles technical specs' },
                            { name: 'Compliance Sentinel', desc: 'Enforces PPADA 2015 constraints' },
                            { name: 'Risk Analyst', desc: 'Forecasts delivery bottlenecks' },
                            { name: 'Executive Advisor', desc: 'Resolves SCM conflicts' }
                          ].map(agent => (
                            <div key={agent.name} className="p-3 bg-black/20 border border-slate-800/40 rounded-xl hover:border-slate-700/60 transition-colors">
                              <div className="flex justify-between items-center">
                                <span className="font-semibold text-white/90">{agent.name}</span>
                                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase font-bold ${
                                  orchestratorStatus === 'Idle' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-amber-400/10 text-amber-400 animate-pulse'
                                }`}>
                                  {orchestratorStatus === 'Idle' ? 'Ready' : 'Analyzing'}
                                </span>
                              </div>
                              <p className="text-white/40 text-[10px] mt-1">{agent.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Parallel Execution Logs (Right) */}
                      <div className="lg:col-span-8 bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 flex flex-col justify-between min-h-[300px]">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono text-white/45 uppercase tracking-wider block font-semibold">Orchestration Logs Terminal</span>
                          <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[10.5px] text-emerald-400/90 leading-relaxed bg-black/40 p-4 rounded-xl border border-slate-800/60">
                            {orchestratedLogs.map((log, idx) => (
                              <p key={idx}>{log}</p>
                            ))}
                          </div>
                        </div>

                        <div className="border-t border-slate-800/40 pt-3 mt-4 text-[9.5px] font-mono text-white/45 flex justify-between items-center">
                          <span>Parallel Dispatch Threads: 8 Max</span>
                          <span>Orchestration Score: 98.9% efficient</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Part 3: Persistent Organizational Memory & SCM Learning Loop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* SCM Memory Bank (Left) */}
                    <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4 text-cyan-400" />
                          <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider">SCM Organizational Memory Bank</h3>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded border border-cyan-400/15">Knowledge Base</span>
                      </div>

                      <p className="text-xs text-white/45 leading-relaxed">
                        Query historically committed SCM tenders, collusion cases, logistics delays, and specifications stored securely across multiple fiscal cycles.
                      </p>

                      <div className="relative">
                        <Search className="w-4 h-4 text-white/45 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          placeholder="Search organizational memory by keyword (e.g. Suswa, metal, transformer)..."
                          value={memorySearch}
                          onChange={(e) => setMemorySearch(e.target.value)}
                          className="w-full bg-black/30 border border-slate-800/60 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[var(--primary-brand)] font-mono"
                        />
                      </div>

                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                        {scmMemory
                          .filter(mem => mem.title.toLowerCase().includes(memorySearch.toLowerCase()) || mem.resolution.toLowerCase().includes(memorySearch.toLowerCase()))
                          .map((mem) => (
                            <div key={mem.id} className="p-3.5 bg-white/5 rounded-xl border border-slate-800/40 hover:border-slate-700/60 transition-all text-xs space-y-1.5">
                              <div className="flex justify-between items-center font-mono text-[9px] border-b border-slate-800/40 pb-1 text-white/40">
                                <span>{mem.id} • {mem.category}</span>
                                <span>CY {mem.year}</span>
                              </div>
                              <h4 className="font-bold text-white/90">{mem.title}</h4>
                              <p className="text-white/60 text-[11px] leading-relaxed italic">" {mem.resolution} "</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Learning Loop - SCM Case Feedback (Right) */}
                    <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center border-b border-slate-800/40 pb-3">
                        <div className="flex items-center gap-2">
                          <RotateCcw className="w-4 h-4 text-emerald-400" />
                          <h3 className="text-xs font-semibold text-white/90 uppercase tracking-wider">Enterprise Learning Loop Feed</h3>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/15">Continuous Training</span>
                      </div>

                      <p className="text-xs text-white/45 leading-relaxed">
                        Archive outcomes of completed procurement cycles. Feed actual costs, timeline variations, and supplier observations back into the long-term memory system.
                      </p>

                      <form onSubmit={handleCompletedProcurementLearning} className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-white/45">PROJECT CONTRACT NAME</label>
                            <input
                              type="text"
                              placeholder="e.g. Olkaria Switchyard Expansion Phase"
                              value={learnTitle}
                              onChange={(e) => setLearnTitle(e.target.value)}
                              className="w-full bg-black/30 border border-slate-800/60 rounded-xl p-2.5 text-white placeholder-white/30 focus:outline-none"
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-white/45">KNOWLEDGE CLASSIFICATION</label>
                            <select
                              value={learnCategory}
                              onChange={(e) => setLearnCategory(e.target.value as any)}
                              className="w-full bg-black/30 border border-slate-800/60 rounded-xl p-2.5 text-white focus:outline-none"
                            >
                              <option value="Lessons Learned">Lessons Learned</option>
                              <option value="Fraud Pattern">Fraud Pattern</option>
                              <option value="Cost Trends">Cost Trends</option>
                              <option value="Standard Specs">Standard Specs</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-white/45">VARIANCE ANALYSIS &amp; MEMORY OUTCOME DESCRIPTION</label>
                          <textarea
                            placeholder="Briefly summarize planned vs actual outcomes, budget discrepancies, or supplier reliability observations..."
                            value={learnResolution}
                            onChange={(e) => setLearnResolution(e.target.value)}
                            rows={3}
                            className="w-full bg-black/30 border border-slate-800/60 rounded-xl p-2.5 text-xs text-white placeholder-white/30 focus:outline-none"
                          />
                        </div>

                        {learnNotification && (
                          <div className="p-3 rounded-lg text-[10px] font-mono leading-normal bg-white/5 border border-slate-800/40 text-emerald-400">
                            {learnNotification}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl cursor-pointer transition-colors shadow-md text-xs font-sans"
                        >
                          Commit Case Study to Memory Base
                        </button>
                      </form>
                    </div>
                  </div>

                  {renderAIActionHub()}
                </div>
              )}

              {/* ==========================================
                  14. PROCUREMENT DIGITAL TWIN & SIMULATOR
                  ========================================== */}
              {activeTab === 'twin' && (
                <div className="space-y-6" id="workspace-digital-twin">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <h2 className="text-sm font-semibold text-white/90 tracking-wider uppercase flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-[var(--primary-brand)] animate-pulse" /> KETRACO Procurement Digital Twin Platform
                    </h2>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Construct and simulate complex supply chain variables before deployment. Track ports, vessels, material dispatch lines, and substation assets in real-time.
                    </p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 space-y-4 text-xs">
                        <span className="text-[10px] font-mono text-white/45 uppercase block font-semibold">Select Simulation Scenario</span>
                        
                        <div className="space-y-2">
                          <button 
                            onClick={() => setSelectedScenario('freight')}
                            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedScenario === 'freight' ? 'bg-[var(--primary-brand)]/10 border-[var(--primary-brand)] text-white' : 'bg-transparent/60 border-slate-800/40 text-white/45 hover:text-white/90'}`}
                          >
                            <MapPin className="w-4 h-4 text-rose-400 inline mr-2.5" />
                            Mombasa Port Container Gridlock
                          </button>

                          <button 
                            onClick={() => setSelectedScenario('currency')}
                            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedScenario === 'currency' ? 'bg-[var(--primary-brand)]/10 border-[var(--primary-brand)] text-white' : 'bg-transparent/60 border-slate-800/40 text-white/45 hover:text-white/90'}`}
                          >
                            <DollarSign className="w-4 h-4 text-amber-400 inline mr-2.5" />
                            KES/USD Exchange Rate Metal Inflation
                          </button>

                          <button 
                            onClick={() => setSelectedScenario('emergency')}
                            className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${selectedScenario === 'emergency' ? 'bg-[var(--primary-brand)]/10 border-[var(--primary-brand)] text-white' : 'bg-transparent/60 border-slate-800/40 text-white/45 hover:text-white/90'}`}
                          >
                            <Zap className="w-4 h-4 text-cyan-400 inline mr-2.5" />
                            Urgent Suswa Transformer Replacement
                          </button>
                        </div>

                        {/* Interactive Scenario Parameters Sliders */}
                        <div className="border-t border-slate-800/40 pt-4 mt-2 space-y-4 font-mono text-[10px]">
                          <span className="text-[10px] text-white/45 uppercase block font-semibold">Fine-Tune Twin Variables</span>
                          
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-white/70">
                              <span>Mombasa Delay Gridlock:</span>
                              <span className="text-rose-400 font-bold">{mombasaDelaySlider} Weeks</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="12"
                              step="1"
                              value={mombasaDelaySlider}
                              onChange={(e) => setMombasaDelaySlider(Number(e.target.value))}
                              className="w-full accent-[var(--primary-brand)] cursor-pointer bg-slate-800 h-1 rounded"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-white/70">
                              <span>Global Steel Price index:</span>
                              <span className="text-amber-400 font-bold">${steelPriceSlider}/Ton</span>
                            </div>
                            <input
                              type="range"
                              min="400"
                              max="2000"
                              step="50"
                              value={steelPriceSlider}
                              onChange={(e) => setSteelPriceSlider(Number(e.target.value))}
                              className="w-full accent-[var(--primary-brand)] cursor-pointer bg-slate-800 h-1 rounded"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between text-white/70">
                              <span>Currency Volatility Band:</span>
                              <span className="text-cyan-400 font-bold">{currencyVolatilitySlider}% Fluctuation</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="25"
                              step="1"
                              value={currencyVolatilitySlider}
                              onChange={(e) => setCurrencyVolatilitySlider(Number(e.target.value))}
                              className="w-full accent-[var(--primary-brand)] cursor-pointer bg-slate-800 h-1 rounded"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={runTwinSimulation}
                          className="w-full bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer transition-colors shadow-lg shadow-[var(--primary-brand)]/10"
                        >
                          Run Parameterized SCM Twin Simulation
                        </button>
                      </div>

                      <div className="lg:col-span-2 bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 space-y-4">
                        <span className="text-[10px] font-mono text-white/45 uppercase block font-semibold">Probabilistic Forecasting Outputs</span>

                        {isSimulatingTwin ? (
                          <div className="py-12 text-center space-y-3">
                            <RefreshCw className="w-6 h-6 text-[var(--primary-brand)] animate-spin mx-auto" />
                            <p className="text-xs text-white/45 font-mono animate-pulse">Simulating physical, budget, and compliance impacts across twin nodes...</p>
                          </div>
                        ) : twinSimulationOutput ? (
                          <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-3 gap-4 font-mono text-[10px]">
                              <div className="bg-white/5 p-4 rounded-xl border border-slate-800/40 text-center">
                                <span className="text-white/45 block">ESTIMATED DELAY</span>
                                <strong className="text-rose-400 block text-sm mt-1.5">+{twinSimulationOutput.delayWeeks} WEEKS</strong>
                              </div>
                              <div className="bg-white/5 p-4 rounded-xl border border-slate-800/40 text-center">
                                <span className="text-white/45 block">BUDGET OVERRUN</span>
                                <strong className="text-amber-400 block text-sm mt-1.5">+${twinSimulationOutput.costImpactUSD.toLocaleString()}</strong>
                              </div>
                              <div className="bg-white/5 p-4 rounded-xl border border-slate-800/40 text-center">
                                <span className="text-white/45 block">TWIN RISK PROFILE</span>
                                <strong className="text-rose-400 block text-sm mt-1.5">{twinSimulationOutput.riskScore} / 100</strong>
                              </div>
                            </div>

                            <div className="bg-transparent p-4 rounded-xl font-mono text-[10.5px] text-white/70 border border-slate-800/40 leading-relaxed">
                              <span className="text-[var(--primary-brand)] block font-bold border-b border-slate-800/40 pb-2 uppercase tracking-wider">{twinSimulationOutput.governanceCode}</span>
                              <p className="mt-2">{twinSimulationOutput.advice}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="py-12 text-center text-white/30 space-y-3">
                            <Layers3 className="w-8 h-8 mx-auto text-white/10" />
                            <p className="text-xs leading-relaxed">No active simulation loaded. Select a scenario on the left and trigger simulation.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  15. eGP INTEGRATION LAYER
                  ========================================== */}
              {activeTab === 'egp' && (
                <div className="space-y-6" id="workspace-egp-layer">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <h2 className="text-sm font-semibold text-white/90 tracking-wider uppercase">eGP Treasury Integration Protocol</h2>
                    <p className="text-xs text-white/45 leading-relaxed">
                      Manage secure public handshakes between internal capex plans and the National Public Procurement Information Portal (PPIP).
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white/5/40 p-5 rounded-2xl border border-slate-800/40 space-y-4">
                        <span className="text-[10px] font-mono text-white/45 block font-semibold uppercase">Active National Endpoints</span>
                        
                        <div className="space-y-2.5 text-xs">
                          <div className="p-3.5 bg-transparent/60 border border-slate-800/40 rounded-xl flex justify-between items-center">
                            <span className="font-semibold text-white/90">PPIP Gateway API Endpoint</span>
                            <span className="bg-[#10B981]/10 text-[#10B981] text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold">Connected</span>
                          </div>
                          <div className="p-3.5 bg-transparent/60 border border-slate-800/40 rounded-xl flex justify-between items-center">
                            <span className="font-semibold text-white/90">Treasury IFMIS Ledger Connection</span>
                            <span className="bg-[#10B981]/10 text-[#10B981] text-[9px] font-mono px-2 py-0.5 rounded uppercase font-semibold">Connected</span>
                          </div>
                        </div>

                        <button 
                          onClick={handleEGPySync}
                          disabled={isSyncingEGP}
                          className="w-full bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 shadow-lg shadow-[var(--primary-brand)]/10"
                        >
                          {isSyncingEGP ? 'Syncing...' : 'Sync SCM Ledger to Treasury eGP Now'}
                        </button>
                      </div>

                      <div className="bg-white/5/30 border border-slate-800/40 rounded-2xl p-5 flex flex-col justify-between">
                        <div className="space-y-3">
                          <span className="text-[10px] font-mono text-white/45 block font-semibold uppercase">eGP Sync Logs</span>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {egpStatusLog.map((logLine, idx) => (
                              <p key={idx} className="text-[10px] font-mono text-white/45 leading-relaxed border-b border-slate-800/40 pb-1">
                                {logLine}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

              {/* ==========================================
                  16. SALIENCE ATLAS COPILOT INTEGRATION LAYER
                  ========================================== */}
              {activeTab === 'integration' && (
                <div className="space-y-6 animate-fadeIn" id="workspace-integration-layer">
                  <div className="bg-[#101827]/75 backdrop-blur-md border border-slate-800/40 p-6 rounded-2xl space-y-5">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-slate-800/40 pb-4 gap-4">
                      <div>
                        <h2 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                          <Terminal className="w-4 h-4" style={{ color: primaryColor }} />
                          Salience Atlas Procurement Copilot Integration Layer
                        </h2>
                        <p className="text-xs text-white/45 mt-1">
                          Centralized enterprise intelligence backend powering Chrome extension copilots, mobile clients, and third-party ERP integrations.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-mono px-2.5 py-1 rounded border border-emerald-500/20 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                          API Gateway Live
                        </span>
                        <span className="bg-slate-800 text-white/75 text-[10px] font-mono px-2.5 py-1 rounded border border-slate-700/50">
                          v1.4.2-STABLE
                        </span>
                      </div>
                    </div>

                    {/* Security credentials / client status */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-black/20 p-4 rounded-xl border border-slate-800/20 font-mono text-[10px]">
                      <div>
                        <span className="text-white/40 block">CLIENT IDENTIFIER</span>
                        <span className="text-white/80 font-bold">salience-atlas-chrome-ext-v3</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">AUTHENTICATION</span>
                        <span className="text-cyan-400 font-bold">JWT Bearer & Client Key</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">TRANSPORT SECURITY</span>
                        <span className="text-emerald-400 font-bold">AES_256_GCM (Strict)</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">TENANT ISOLATION</span>
                        <span className="text-amber-400 font-bold">KTR-ISOLATED-HQ-NAIROBI</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left side: Endpoint Tester and Playground (7 cols) */}
                      <div className="lg:col-span-7 bg-white/5 p-5 rounded-2xl border border-slate-800/40 space-y-4 flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-800/40 pb-2">
                          <span className="text-[10px] font-mono text-white/45 block font-semibold uppercase">API Endpoint Playground</span>
                          <span className="text-[9px] font-mono text-white/30">Select endpoint to run live integration calls</span>
                        </div>

                        <div className="space-y-4 flex-1 flex flex-col">
                          {/* Endpoint selector */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] text-white/60 font-mono block">SELECT ENTERPRISE API ENDPOINT</label>
                            <select
                              value={selectedEndpoint}
                              onChange={(e) => {
                                const ep = e.target.value;
                                setSelectedEndpoint(ep);
                                // Set pre-populated JSON payload
                                setEndpointPayload(getEndpointDefaultPayload(ep));
                              }}
                              className="w-full bg-[#0a0f1d] border border-slate-800/80 rounded-xl px-3 py-2 text-xs text-white/90 outline-none focus:border-slate-700/80 transition-colors cursor-pointer text-white"
                            >
                              <option value="/api/scm/context">MODULE 1: Context Detection [/scm/context]</option>
                              <option value="/api/scm/guidance">MODULE 2: Guidance Fetch [/scm/guidance]</option>
                              <option value="/api/scm/recommendations">MODULE 3: Recommendations Engine [/scm/recommendations]</option>
                              <option value="/api/scm/workflow-graph">MODULE 4: Workflow Graph [/scm/workflow-graph]</option>
                              <option value="/api/scm/knowledge-retrieval">MODULE 5: Knowledge Retrieval (RAG) [/scm/knowledge-retrieval]</option>
                              <option value="/api/scm/memory">MODULE 6: Memory Lookup [/scm/memory]</option>
                              <option value="/api/scm/twin-simulation">MODULE 7: Twin Simulation [/scm/twin-simulation]</option>
                              <option value="/api/scm/human-oversight">MODULE 8: Human Oversight [/scm/human-oversight]</option>
                              <option value="/api/scm/agent-gateway">MODULE 9: Agent Gateway Status [/scm/agent-gateway]</option>
                              <option value="/api/scm/agent-gateway/call">MODULE 9: Call Specialized Agent [/scm/agent-gateway/call]</option>
                              <option value="/api/scm/chrome-extension/contract">MODULE 10: Chrome Ext Contract [/scm/chrome-extension/contract]</option>
                              <option value="/api/scm/observability">MODULE 11: Backend Observability [/scm/observability]</option>
                              <option value="/api/scm/security">MODULE 12: Security & RBAC [/scm/security]</option>
                            </select>
                          </div>

                          {/* Request Payload Editor */}
                          <div className="space-y-1.5 flex-1 flex flex-col min-h-[140px]">
                            <div className="flex justify-between items-center text-[10px] font-mono text-white/60">
                              <span>REQUEST BODY PAYLOAD (JSON)</span>
                              <span className="text-[9px] text-white/30">Editable context params</span>
                            </div>
                            <textarea
                              value={endpointPayload}
                              onChange={(e) => setEndpointPayload(e.target.value)}
                              className="w-full flex-1 bg-[#05080f]/90 border border-slate-900 rounded-xl p-3 text-[10.5px] font-mono text-cyan-400 outline-none focus:border-slate-800 transition-colors resize-none min-h-[120px]"
                              placeholder="{}"
                            />
                          </div>

                          <button
                            onClick={async () => {
                              setIsPlaygroundLoading(true);
                              setPlaygroundResponse(null);
                              try {
                                const isPost = ['/api/scm/context', '/api/scm/knowledge-retrieval', '/api/scm/twin-simulation', '/api/scm/agent-gateway/call', '/api/scm/human-oversight/resolve'].includes(selectedEndpoint);
                                const options: RequestInit = {
                                  method: isPost ? 'POST' : 'GET',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': 'Bearer atlas_master_key'
                                  }
                                };
                                if (isPost) {
                                  options.body = endpointPayload;
                                }
                                const res = await fetch(selectedEndpoint, options);
                                const data = await res.json();
                                setPlaygroundResponse(data);
                              } catch (err: any) {
                                setPlaygroundResponse({ error: true, message: err.message || 'Connection failed' });
                              } finally {
                                setIsPlaygroundLoading(false);
                              }
                            }}
                            disabled={isPlaygroundLoading}
                            className="w-full bg-[var(--primary-brand)] hover:bg-[var(--primary-brand)]/90 text-white font-bold text-xs py-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 shadow-lg shadow-[var(--primary-brand)]/10 flex items-center justify-center gap-2"
                            style={{ backgroundColor: primaryColor }}
                          >
                            {isPlaygroundLoading ? (
                              <>
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                Transmitting Payload to SCM Control Plane...
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5 text-black" />
                                <span className="text-black font-bold">Execute Safe Live API Request</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Right side: Live response viewer & observability indicators (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col gap-6">
                        {/* Live response viewer */}
                        <div className="bg-white/5 border border-slate-800/40 rounded-2xl p-5 flex-1 flex flex-col min-h-[220px]">
                          <div className="flex justify-between items-center border-b border-slate-800/40 pb-2 mb-3">
                            <span className="text-[10px] font-mono text-white/45 block font-semibold uppercase">INTELLIGENCE RESPONSE BUFFER</span>
                            <span className="bg-cyan-500/10 text-cyan-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-cyan-500/20">
                              200 OK
                            </span>
                          </div>

                          <div className="flex-1 overflow-y-auto max-h-[260px] bg-black/45 p-3 rounded-xl border border-slate-900 text-[10px] font-mono">
                            {playgroundResponse ? (
                              <pre className="text-emerald-400 whitespace-pre-wrap">{JSON.stringify(playgroundResponse, null, 2)}</pre>
                            ) : isPlaygroundLoading ? (
                              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-white/30 space-y-2">
                                <RefreshCw className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
                                <span className="text-xs">Awaiting signature handshakes...</span>
                              </div>
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center py-12 text-center text-white/30">
                                <Info className="w-6 h-6 text-white/10 mb-1" />
                                <span>No response payload active. Trigger the button on left to fetch live APOS SCM context signals.</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Real-time metrics card */}
                        <div className="bg-white/5 border border-slate-800/40 rounded-2xl p-5 space-y-4">
                          <span className="text-[10px] font-mono text-white/45 block font-semibold uppercase">API METRIC OBSERVABILITY</span>
                          
                          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                            <div className="p-2.5 bg-black/20 border border-slate-800/30 rounded-lg">
                              <span className="text-white/40 block text-[8px] uppercase">RAG PRECISION</span>
                              <span className="text-emerald-400 font-bold text-sm">97.8%</span>
                            </div>
                            <div className="p-2.5 bg-black/20 border border-slate-800/30 rounded-lg">
                              <span className="text-white/40 block text-[8px] uppercase">LATENCY (P95)</span>
                              <span className="text-white/80 font-bold text-sm">38ms</span>
                            </div>
                            <div className="p-2.5 bg-black/20 border border-slate-800/30 rounded-lg">
                              <span className="text-white/40 block text-[8px] uppercase">CACHE HIT RATIO</span>
                              <span className="text-cyan-400 font-bold text-sm">96.2%</span>
                            </div>
                            <div className="p-2.5 bg-black/20 border border-slate-800/30 rounded-lg">
                              <span className="text-white/40 block text-[8px] uppercase">EXTENSION HITS</span>
                              <span className="text-white/80 font-bold text-sm">48,512</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {renderAIActionHub()}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

      </div>

      {/* Floating Collapsible AI Workspace Panel (Requirement 6) */}
      <div className="fixed bottom-6 right-6 z-50">
        <motion.div 
          layout
          className="bg-[#0f172a] border border-slate-800/80 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden w-96 flex flex-col"
          style={{ boxShadow: "0 12px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(59, 130, 246, 0.1)" }}
        >
          <div 
            onClick={() => setIsAgentPanelExpanded(!isAgentPanelExpanded)}
            className="p-4 bg-[#0a0f1d] flex justify-between items-center border-b border-slate-800/50 cursor-pointer hover:bg-slate-900/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary-brand)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--primary-brand)]"></span>
              </span>
              <span className="text-xs font-semibold tracking-wider text-white/90 uppercase font-sans">Autonomous SCM Copilot</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-white/45 transition-transform duration-200 ${isAgentPanelExpanded ? 'rotate-180' : ''}`} />
          </div>

          <AnimatePresence initial={false}>
            {isAgentPanelExpanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex flex-col bg-[#0a0f1d]/95 text-xs"
              >
                {/* Tab Switcher inside Floating Panel */}
                <div className="flex border-b border-slate-800/40 text-[10px] font-mono font-semibold bg-[#070b14]">
                  <button
                    onClick={() => setCopilotPanelTab('chat')}
                    className={`flex-1 py-2 text-center border-r border-slate-800/40 transition-all ${copilotPanelTab === 'chat' ? 'bg-[#0f172a] text-[var(--primary-brand)] font-bold' : 'text-white/45 hover:text-white/80'}`}
                  >
                    Interactive SCM Chat
                  </button>
                  <button
                    onClick={() => setCopilotPanelTab('reasoning')}
                    className={`flex-1 py-2 text-center transition-all ${copilotPanelTab === 'reasoning' ? 'bg-[#0f172a] text-[var(--primary-brand)] font-bold' : 'text-white/45 hover:text-white/80'}`}
                  >
                    System Reasoning Logs
                  </button>
                </div>

                <div className="p-4 space-y-4">
                  {copilotPanelTab === 'reasoning' ? (
                    <div className="space-y-4 font-mono">
                      <div>
                        <span className="text-[9px] text-white/45 block uppercase tracking-wider">Current Reasoning Stage</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Cpu className="w-4 h-4 text-[var(--primary-brand)] animate-pulse shrink-0" />
                          <span className="font-semibold text-white/90 text-[11px] truncate" dangerouslySetInnerHTML={{ __html: agentReasoningStep }}></span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5">
                        <div className="bg-transparent p-2.5 rounded-lg border border-slate-800/40">
                          <span className="text-[8px] text-white/45 block uppercase">CONFIDENCE</span>
                          <strong className="text-[#10B981] text-xs font-semibold block mt-1">{agentConfidence}%</strong>
                        </div>
                        <div className="bg-transparent p-2.5 rounded-lg border border-slate-800/40">
                          <span className="text-[8px] text-white/45 block uppercase">TOKENS USED</span>
                          <strong className="text-white/90 text-xs font-semibold block mt-1">{(tokensConsumed ?? 0).toLocaleString()}</strong>
                        </div>
                      </div>

                      <div className="bg-transparent p-2.5 rounded-lg border border-slate-800/40 space-y-1">
                        <span className="text-[8px] text-white/45 block uppercase">Active Task Status</span>
                        <div className="flex items-center justify-between text-[10px] text-white/70">
                          <span>Compliance validation:</span>
                          <span className="text-[#10B981]">OK</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-white/70">
                          <span>Risk scoring envelope:</span>
                          <span className="text-[var(--primary-brand)]">Traced</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          setCopilotPanelTab('chat');
                          setCopilotChatInput("Explain the active reasoning logs, PPADA safety boundaries, and the decision matrix recommended by Tender Intelligence.");
                        }}
                        className="w-full py-2 bg-[var(--primary-brand)]/10 hover:bg-[var(--primary-brand)]/20 border border-[var(--primary-brand)]/25 text-[var(--primary-brand)] font-bold text-[10px] rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" /> Trace SCM Reasoning Path
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col h-80 justify-between">
                      {/* Chat Messages Log */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[250px] scrollbar-thin select-text font-sans">
                        {copilotHistory.map((msg, index) => (
                          <div 
                            key={index} 
                            className={`p-2.5 rounded-xl text-xs leading-relaxed max-w-[85%] ${msg.sender === 'user' ? 'bg-[#3b82f6]/20 border border-[#3b82f6]/30 ml-auto text-white' : 'bg-white/5 border border-slate-800/40 mr-auto text-white/80'}`}
                          >
                            <div 
                              className="prose prose-invert leading-normal text-[11px] font-sans space-y-1"
                              dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.text) }}
                            />
                            <span className="text-[8px] text-white/30 block mt-1 font-mono text-right">{msg.timestamp}</span>
                          </div>
                        ))}
                        {isCopilotLoading && (
                          <div className="bg-white/5 border border-slate-800/40 mr-auto p-2.5 rounded-xl max-w-[85%] flex items-center gap-2">
                            <span className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-[var(--primary-brand)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                              <span className="w-1.5 h-1.5 bg-[var(--primary-brand)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                              <span className="w-1.5 h-1.5 bg-[var(--primary-brand)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                            </span>
                            <span className="text-[9px] font-mono text-white/45 font-sans">Copilot formulating response...</span>
                          </div>
                        )}
                      </div>

                      {/* Interactive Form Input */}
                      <form onSubmit={handleCopilotChatSubmit} className="mt-3 flex gap-2">
                        <input
                          type="text"
                          value={copilotChatInput}
                          onChange={(e) => setCopilotChatInput(e.target.value)}
                          placeholder="Ask SCM Copilot about bids, risk..."
                          disabled={isCopilotLoading}
                          className="flex-1 bg-white/5 border border-slate-800/40 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[var(--primary-brand)] placeholder-white/20"
                        />
                        <button
                          type="submit"
                          disabled={isCopilotLoading || !copilotChatInput.trim()}
                          className="p-2 bg-[var(--primary-brand)] hover:opacity-90 active:scale-95 disabled:opacity-40 text-black rounded-xl transition-all flex items-center justify-center shrink-0"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

    </div>
      </TenderIntelligenceLayout>
    </TenderIntelligenceProvider>
  );
}
