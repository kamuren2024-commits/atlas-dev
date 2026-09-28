import React, { useState, useEffect } from 'react';
import { 
  Scale, ShieldAlert, Sparkles, CheckSquare, Square, CheckCircle, Clock,
  Lock, Key, FileText, Layout, ArrowRight, Table, RefreshCw, Cpu, Activity,
  Database, Brain, Users, Compass, Network, Share2, AlertTriangle, Play,
  HelpCircle, Check, FileCheck, Layers, GitFork, BookOpen, Settings,
  RotateCcw, LineChart, ShieldCheck, ChevronRight
} from 'lucide-react';

export interface DecisionCard {
  id: string;
  title: string;
  category: 'PPADA Statutory' | 'Tender Committee' | 'Contract Variation' | 'Risk Mitigation' | 'Executive Strategic' | 'Emergency Direct';
  recommendation: string;
  confidence: number;
  
  // Phase 22 Managed Decision Object Structure
  context: {
    triggerEvent: string;
    projectNode: string;
    affectedBOM: string;
  };
  evidence: { label: string; urn: string }[];
  risks: { title: string; probability: string; impact: string; mitigation: string }[];
  alternatives: { option: string; cost: string; timeline: string; riskRating: string; description: string }[];
  approvalsRequired: { role: string; signed: boolean; signedBy?: string; timestamp?: string }[];
  simulationImpact: { costDelta: string; scheduleDelta: string };
  observedOutcome: { scheduleRestored: string; actualVariationPremium: string };
  lessonsLearned: { failureIdentified: string; optimizationAction: string };
  auditReference: string;
  trustScore: number;
}

export default function DecisionApprovalCenter({ onAskCopilot }: { onAskCopilot: (prompt: string) => void }) {
  const [activeTab, setActiveTab] = useState<'dao' | 'causal' | 'graphrag' | 'synthesis' | 'governance'>('dao');
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>('dec-1');
  const [auditComment, setAuditComment] = useState('');
  const [signingPassword, setSigningPassword] = useState('');
  const [isSigning, setIsSigning] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Grounded actual decisions mapping to the KETRACO PPADA procurement lifecycle requirements
  const [decisions, setDecisions] = useState<DecisionCard[]>([
    {
      id: 'dec-1',
      title: 'Mombasa Port High-Capacity Cable Urgency Release',
      category: 'Emergency Direct',
      recommendation: 'Authorize emergency direct award to Shanghai Grid Metal Corp for fast-track shipping of double-circuit conductor cable kits. Nairobi Ring backup load margins stand at less than 11% safe capacity.',
      confidence: 94,
      context: {
        triggerEvent: 'Global ocean freight bottleneck & critical copper deficit',
        projectNode: 'Nairobi Ring backup transmission path expansion',
        affectedBOM: 'High-voltage double-circuit conductor cable sets'
      },
      evidence: [
        { label: 'Nairobi Ring Active Telemetry (1120MW load)', urn: 'urn:atlas:telemetry:nairobi-ring:load-spike' },
        { label: 'Mariakani Warehouse Conductor stock (0 meters)', urn: 'urn:atlas:inventory:mariakani:conductors-zero' },
        { label: 'Suswa Lot 4 delay audit trail', urn: 'urn:atlas:project:suswa-lot4:milestone-delay' }
      ],
      risks: [
        { title: 'Contract variation premium', probability: 'High', impact: '+$140k', mitigation: 'Offset with deferred lower-priority grid cabling' },
        { title: 'Regulatory query on direct award justification', probability: 'Medium', impact: 'Moderate audit drag', mitigation: 'Strict invocation of PPADA Section 103 (Emergency conditions)' }
      ],
      alternatives: [
        { option: 'Fast-track Emergency Direct Award (Shanghai)', cost: '$820k', timeline: '4 Days (immediate air)', riskRating: 'Low grid failure risk', description: 'Bypasses standard tendering to avoid a complete Nairobi grid blackout.' },
        { option: 'Restricted Tendering (Local suppliers)', cost: '$680k', timeline: '45 Days', riskRating: 'High grid blackout risk', description: 'Requires standard notice periods, leaving the capital grid highly unstable.' },
        { option: 'Maintain Draft Requisitions (Do nothing)', cost: '$0', timeline: 'Infinite', riskRating: 'Immediate Substation Overload', description: 'Leads to cascade failure at Suswa substation under peak load.' }
      ],
      approvalsRequired: [
        { role: 'Head of Supply Chain Management', signed: true, signedBy: 'H. Wakoli (SCM Head)', timestamp: '2026-06-23 09:14 UTC' },
        { role: 'Accounting Officer (Managing Director)', signed: false },
        { role: 'National Treasury Compliance Board', signed: false }
      ],
      simulationImpact: {
        costDelta: '+$140,000 (air freight premium)',
        scheduleDelta: 'Rescues 14-day grid connection critical path'
      },
      observedOutcome: {
        scheduleRestored: '14 Days fully restored',
        actualVariationPremium: '$140,000 committed'
      },
      lessonsLearned: {
        failureIdentified: 'Central storage should hold safety buffers for high-capacity cables to avoid air-freight reliance',
        optimizationAction: 'Deploy active commodity buffer checks in the annual procurement plan'
      },
      auditReference: 'PPADA 2015 Section 103 (Emergency Procurements)',
      trustScore: 98
    },
    {
      id: 'dec-2',
      title: 'Technical Evaluation: Lot-4 Autotransformer Specs',
      category: 'Tender Committee',
      recommendation: 'Adopt Tender Committee specification review checklist regarding 220kV heavy transformers. Confirm exclusion of sub-grade non-copper winding options due to 20-year substation corrosion baselines.',
      confidence: 88,
      context: {
        triggerEvent: 'Tender bidding specification adjustment for high-salinity coastal areas',
        projectNode: 'Mombasa Port-substation interconnect transformer Lot-4',
        affectedBOM: '220kV High-capacity oil-cooled autotransformer'
      },
      evidence: [
        { label: 'PPADR 2020 Standard Bidding Document Template', urn: 'urn:atlas:policy:ppadr-2020:std-bidding-docs' },
        { label: 'Substation Transformer gas insulation baseline spec', urn: 'urn:atlas:specs:transformer-ehv:gas-ins' }
      ],
      risks: [
        { title: 'Extended tender review timeline', probability: 'Low', impact: '+7 Days', mitigation: 'Automated digital bid screening via compliance agents' },
        { title: 'Supplier price pushback on copper limits', probability: 'Medium', impact: '+$45k', mitigation: 'Enforce standard multi-year grid equipment warranty rules' }
      ],
      alternatives: [
        { option: 'Standard Copper winding specification', cost: '$1.2M', timeline: '14 Weeks delivery', riskRating: 'Very Low Failure Rate', description: 'Ensures standard 25-year lifecycle performance in marine high-salinity zones.' },
        { option: 'Hybrid winding material preset', cost: '$980k', timeline: '12 Weeks', riskRating: 'High Coastal Corrosion Risk', description: 'Lower immediate cost but high risk of chemical insulation breakdown within 6 years.' }
      ],
      approvalsRequired: [
        { role: 'Designated Tender Opening Committee Chair', signed: true, signedBy: 'J. Mwathi (Chair)', timestamp: '2026-06-22 14:32 UTC' },
        { role: 'Head of Supply Chain Management', signed: false }
      ],
      simulationImpact: {
        costDelta: '-$35,000 baseline budget optimization',
        scheduleDelta: '+2 Days tender process window extension'
      },
      observedOutcome: {
        scheduleRestored: 'Neutral (no delay)',
        actualVariationPremium: '$0 (contained)'
      },
      lessonsLearned: {
        failureIdentified: 'Standard specifications lacked geo-spatial environmental tags for coastal infrastructure',
        optimizationAction: 'Inject localized grid specification templates into SBD drafting tool'
      },
      auditReference: 'PPADA 2015 Section 78 (Tender Evaluation Committees)',
      trustScore: 92
    },
    {
      id: 'dec-3',
      title: 'Suswa Lot 4 Contract Price Variation Approval',
      category: 'Contract Variation',
      recommendation: 'Authorize 12.4% price variation for Suswa Substation Switchyard expansion. Variation is caused by soil instability requiring deep anchor piling.',
      confidence: 91,
      context: {
        triggerEvent: 'Silt soil shift during foundation layout drafting',
        projectNode: 'Suswa Substation Hub Switchyard extension',
        affectedBOM: 'Substation structural foundation piling & concrete works'
      },
      evidence: [
        { label: 'Geotechnical Soil Survey Suswa Node 3', urn: 'urn:atlas:geo:suswa-node3:soil-instability' },
        { label: 'PPADA Statutory Variations Limit (Max 25%)', urn: 'urn:atlas:policy:ppada-2015:variation-cap' }
      ],
      risks: [
        { title: 'Exceeding total contingency limit', probability: 'Low', impact: 'None (within 15% budget)', mitigation: 'Draw down from Suswa site contingency allocation reserves' },
        { title: 'Auditor-General query trigger', probability: 'Low', impact: 'Resolved via soil survey evidence', mitigation: 'Pre-compile technical soil survey report inside legal ledger block' }
      ],
      alternatives: [
        { option: 'Approve soil-stabilization Variation', cost: '+$210k', timeline: 'Immediate execution', riskRating: 'Zero structural failure risk', description: 'Permits contractor to instantly pour deep reinforcement anchor piling.' },
        { option: 'Suspend and redesign foundations', cost: '+$45k', timeline: '90 Days delay', riskRating: 'Catastrophic structure risk', description: 'Suspends the contractor, leading to extensive legal demurrage claims.' }
      ],
      approvalsRequired: [
        { role: 'Project Director / Lead Engineer', signed: true, signedBy: 'Eng. K. Njoroge', timestamp: '2026-06-23 06:12 UTC' },
        { role: 'Head of Supply Chain Management', signed: true, signedBy: 'H. Wakoli (SCM Head)', timestamp: '2026-06-23 10:45 UTC' },
        { role: 'Accounting Officer (Managing Director)', signed: false }
      ],
      simulationImpact: {
        costDelta: '+$210,000 (funded from contingency reserve)',
        scheduleDelta: 'Prevents structural foundation collapse setbacks'
      },
      observedOutcome: {
        scheduleRestored: 'Saves 90-day critical path',
        actualVariationPremium: '$210,000 committed'
      },
      lessonsLearned: {
        failureIdentified: 'Pre-bidding soil geotechnical tests were completed using legacy low-resolution maps',
        optimizationAction: 'Integrate active LIDAR soil profiles into the initial tender drafting requirements'
      },
      auditReference: 'PPADA 2015 Section 139 (Amendments and Variations to Contracts)',
      trustScore: 96
    }
  ]);

  const activeDecision = decisions.find(d => d.id === selectedDecisionId) || decisions[0];
  const filteredDecisions = decisions.filter(d => filterCategory === 'ALL' || d.category === filterCategory);

  // Phase 22 States: Causal AI Simulator
  const [selectedDisruptor, setSelectedDisruptor] = useState<string>('supplier-failure');
  const [counterfactualSupp, setCounterfactualSupp] = useState<string>('local');
  const [simulatedCausalMetrics, setSimulatedCausalMetrics] = useState({
    consequence: 'Shanghai Metal Force Majeure on cable kits',
    impactPath: 'Port delay ──> Conductor shortage ──> Nairobi Ring blackout risk',
    rootCause: 'Geopolitical logistics blockages on Chinese transit routes',
    costVariance: '+$140k (Air freight)',
    scheduleRisk: 'Critical path delay of 18 days at Suswa Substation',
    remedyRecommendation: 'Trigger local supplier emergency award (PPADA Sec 103)'
  });

  // Dynamic simulation update for Causal AI
  useEffect(() => {
    switch (selectedDisruptor) {
      case 'supplier-failure':
        setSimulatedCausalMetrics({
          consequence: ' Shanghai Metal Force Majeure on conductor sets',
          impactPath: 'Chinese ports blockage ──> Materials deficit ──> Nairobi Ring blackout risk',
          rootCause: 'Single-source concentration in Asian maritime corridors',
          costVariance: '+$140k (Emergency air freight premium)',
          scheduleRisk: 'Critical path slippage of 18 days at Suswa Lot 4',
          remedyRecommendation: 'Trigger local supplier allocation via direct emergency award (PPADA Section 103)'
        });
        break;
      case 'inventory-shortage':
        setSimulatedCausalMetrics({
          consequence: 'Mariakani depot conductor stock reaches absolute zero',
          impactPath: 'Grid maintenance halt ──> Coastline backup depletion ──> Substation overload',
          rootCause: 'Lack of real-time supply buffer triggers in standard ERP schedules',
          costVariance: '+$85k (Expedited regional procurement)',
          scheduleRisk: 'High probability of localized coastal outages within 9 days',
          remedyRecommendation: 'Instantly execute a restricted framework agreement with pre-qualified East African suppliers'
        });
        break;
      case 'contract-delay':
        setSimulatedCausalMetrics({
          consequence: 'Soil instability delays Suswa substation foundation works',
          impactPath: 'Civil design review ──> Contractor idle time ──> Project delay claims',
          rootCause: 'Low-resolution legacy geotechnical surveys used in the engineering brief',
          costVariance: '+$210k (Geotechnical pile stabilizers)',
          scheduleRisk: 'Saves 90-day critical path delays if variation is authorized immediately',
          remedyRecommendation: 'Authorize 12.4% price variation under PPADA Section 139 with certified LIDAR logs'
        });
        break;
      case 'budget-reduction':
        setSimulatedCausalMetrics({
          consequence: 'National Treasury implements 15% mid-term SCM spending cut',
          impactPath: 'Capital projects deferral ──> Subcontractor layoffs ──> Contractor litigation',
          rootCause: 'Fluctuating macro-fiscal allocations under national infrastructure reviews',
          costVariance: '-$450k (Immediate budget containment)',
          scheduleRisk: 'Indefinite delay on Olkaria and Suswa expansion loops (12+ months)',
          remedyRecommendation: 'Reprioritize inventory from non-critical depots and consolidate material purchases'
        });
        break;
      case 'grid-expansion':
        setSimulatedCausalMetrics({
          consequence: 'Delay in Suswa substation 220kV loop-in line release',
          impactPath: 'Power dispatch bottleneck ──> Heavy industrial rationing ──> Revenue loss',
          rootCause: 'Right-of-Way (RoW) compensation disputes with land trusts',
          costVariance: '+$60k (Dispute resolution framework & fast-track legal bounds)',
          scheduleRisk: 'Bottlenecks 450MW of clean geothermal energy from reaching Nairobi',
          remedyRecommendation: 'Utilize compulsory statutory easement structures under the National Energy Act'
        });
        break;
    }
  }, [selectedDisruptor]);

  // Phase 22 States: Federated GraphRAG & Ingestion Mesh
  const [activeQuery, setActiveQuery] = useState('Find debarred contractors who bid on Mariakani substation conductor tenders');
  const [meshRoutingSteps, setMeshRoutingSteps] = useState<string[]>([]);
  const [runningMeshQuery, setRunningMeshQuery] = useState(false);
  const [queryConfidence, setQueryConfidence] = useState(0);

  const runMeshQuerySimulation = () => {
    setRunningMeshQuery(true);
    setMeshRoutingSteps([]);
    
    const steps = [
      '🔍 Ingesting query: Routing to Enterprise GraphRAG Hub...',
      '📡 Resolving Federated Gateway: Mapping local sub-graphs (Legal Enclave, Mariakani Depot)',
      '🕸️ Multi-Hop Reasoning active: Shanghai Cable ──> Director Records ──> PPRA Debarred Database',
      '🏷️ Cache-Augmented Generation (CAG) check: Scanning cached standard bidding files for regulatory matches',
      '✅ Ontology Engine check: verified semantic relationships, 0 contradictions detected.',
      '📝 Synthesis Complete: Found director match "Wang Lin" associated with debarred shell entity "SinoPower Ltd" (debarred Oct 2025).'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setMeshRoutingSteps(prev => [...prev, step]);
        if (index === steps.length - 1) {
          setRunningMeshQuery(false);
          setQueryConfidence(97.8);
        }
      }, (index + 1) * 800);
    });
  };

  // Phase 22 States: Autonomous Knowledge Synthesis
  const [synthesisType, setSynthesisType] = useState<'policy' | 'supplier' | 'board' | 'briefing'>('board');
  const [synthesizing, setSynthesizing] = useState(false);
  const [synthesisOutput, setSynthesisOutput] = useState('');

  const runKnowledgeSynthesis = () => {
    setSynthesizing(true);
    setSynthesisOutput('');
    setTimeout(() => {
      let doc = '';
      if (synthesisType === 'board') {
        doc = `# KETRACO BOARD PAPER — SCM STRATEGIC ADVISORY\n` +
          `**TO:** KETRACO Board of Directors\n` +
          `**FROM:** Autonomous Procurement Intelligence System (Atlas ACOS)\n` +
          `**DATE:** 2026-06-25 // CONFIDENTIAL // AUDIT_REF: BP-2026-90B\n\n` +
          `## 1. STRATEGIC CONTEXT\n` +
          `This board paper outlines a critical mitigation proposal for the Nairobi Ring electrical grid expansion. Due to extreme maritime supply path bottlenecks at Mombasa, conductor materials stand at critical shortage levels.\n\n` +
          `## 2. STATUTORY JUSTIFICATION & COMPLIANCE STATEMENTS\n` +
          `Under **Section 103 of the Public Procurement and Asset Disposal Act (PPADA 2015)**, KETRACO is authorized to execute direct emergency awards if delay presents immediate risk of grid blackouts. Causal simulations indicate a blackout probability of 84% if zero action is taken within the next 4 days.\n\n` +
          `## 3. FINANICAL IMPACT & PORTFOLIO INTEGRATION\n` +
          `- **Recommended Alternative**: Emergency direct allocation to Shanghai Grid Metal Corp.\n` +
          `- **Total Financial Commitment**: $820,000 (includes an expedited air-freight variation premium of $140,000).\n` +
          `- **Contingency Drawdown**: Funded fully from the Suswa node contingency pool (balance of $1.15M remains intact).\n\n` +
          `## 4. AUDIT & DECISION REPLAY LINEAGE\n` +
          `This document is certified against active knowledge enclaves under SHA-256 hash \`0x9f82d1c...b4\`. All underlying data streams have been verified through Federated GraphRAG.\n\n` +
          `**RECOMMENDATION:** Approve the execution of the direct award to Shanghai Grid Metal Corp to rescue the 14-day critical construction path.`;
      } else if (synthesisType === 'policy') {
        doc = `# PPADA STATUTORY COMPLIANCE ANALYSIS\n` +
          `**SUBJECT:** Price Variations Threshold Verification\n` +
          `**REFERENCE STATUTE:** PPADA 2015 Section 139 & Amendment Act 2022\n\n` +
          `## 1. LEGISLATIVE BOUNDARIES CHECK\n` +
          `- Section 139 restricts any cumulative contract price variations to a maximum limit of **25%** of the original contract sum.\n` +
          `- Any single variation above **15%** requires independent professional geotechnical evaluation and board notification.\n\n` +
          `## 2. EVALUATION OF ACTIVE VARIATION REQUESTS\n` +
          `- **Suswa Lot 4 Foundation Works**: Contractor Shanghai Grid requesting a **12.4%** ($210,000) variation due to soil instability.\n` +
          `- **Atlas Check Result**: COMPLIANT. Cumulative variation level is 12.4%, which is under the 25% statutory ceiling. Soil logs have been verified.\n\n` +
          `## 3. PROGRAMMATIC SAFEGUARDS ENGAGED\n` +
          `Automatic blocking rules are active across the SBD drafting tools. Any bid exceeding commodity indices by >15% is automatically isolated for compliance review.`;
      } else if (synthesisType === 'briefing') {
        doc = `# EXECUTIVE BRIEFING: GLOBAL COPPER DEFICIT IMPACTS\n` +
          `**PREPARED FOR:** Managing Director & Head of Supply Chain\n` +
          `**ACOS AGENTS:** Supplier Intelligence & Risk Analysis Swarms\n\n` +
          `## 1. GEOPOLITICAL LOGISTICS SUMMARY\n` +
          `A systemic copper pricing spike of **22.4%** across international metals markets has triggered contractor variation alerts across three active capital transmission line tenders.\n\n` +
          `## 2. KETRACO INVENTORY IMPACT FORECAST\n` +
          `Mariakani and Mariakani Depot safety stocks will deplete within 24 days. Without strategic inventory buffering, the Olkaria loop-in project path risks a 45-day delay.\n\n` +
          `## 3. CAUSAL RECOURSE ACTIONS\n` +
          `1. Lock in standard prices via restricted framework contracts with certified local distributors.\n` +
          `2. Activate localized steel and copper material hedging parameters in the 90-day procurement plan.`;
      } else {
        doc = `# SUPPLIER INTELLIGENCE DOSSIER\n` +
          `**TARGET ENTITY:** East African Cables Consortium\n` +
          `**REPUTATION SCORE:** 98.2/100 // TRUST LEVEL: EXCELLENT\n\n` +
          `## 1. PERFORMANCE METRICS\n` +
          `- **On-Time Delivery Rate**: 96.8% (average over last 14 dispatches)\n` +
          `- **Quality Assurance Compliance**: 100% (IEC standards certification verified)\n\n` +
          `## 2. REGULATORY & TAX STANDING\n` +
          `- **Kenya Revenue Authority (KRA)**: Tax compliance certificate valid through March 2027.\n` +
          `- **PPRA Debarment Registry**: CLEAR. No active litigation, directorship links, or legal disputes found.\n\n` +
          `## 3. CAPACITY CHECK\n` +
          `Possesses certified local stock of 4,500 meters of high-voltage conductor cabling, capable of fast-track delivery to Suswa within 48 hours.`;
      }
      setSynthesisOutput(doc);
      setSynthesizing(false);
    }, 1800);
  };

  // Phase 22 States: Knowledge Governance
  const [certifiedIndices, setCertifiedIndices] = useState<number>(14);
  const [certifyingIndex, setCertifyingIndex] = useState(false);
  const [policyEnforcement, setPolicyEnforcement] = useState<'strict' | 'moderate'>('strict');
  const [hallucinationFilter, setHallucinationFilter] = useState(true);

  // Toggle approvals
  const handleToggleChecklist = (decisionId: string, roleIndex: number) => {
    setDecisions(prev => prev.map(dec => {
      if (dec.id !== decisionId) return dec;
      const updatedApprovals = [...dec.approvalsRequired];
      const target = updatedApprovals[roleIndex];
      updatedApprovals[roleIndex] = {
        ...target,
        signed: !target.signed,
        signedBy: !target.signed ? 'Authorized Administrator' : undefined,
        timestamp: !target.signed ? new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC' : undefined
      };
      return { ...dec, approvalsRequired: updatedApprovals };
    }));
  };

  const handleApplySignature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditComment.trim() || !signingPassword) return;

    setIsSigning(true);
    setTimeout(() => {
      setDecisions(prev => prev.map(dec => {
        if (dec.id !== activeDecision.id) return dec;
        const updated = [...dec.approvalsRequired];
        const nextUnsigned = updated.findIndex(a => !a.signed);
        if (nextUnsigned !== -1) {
          updated[nextUnsigned] = {
            role: updated[nextUnsigned].role,
            signed: true,
            signedBy: `Operator (Authorized: Level 5)`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
          };
        }
        return { ...dec, approvalsRequired: updated };
      }));

      setIsSigning(false);
      setSigningPassword('');
      setAuditComment('');
      onAskCopilot(`Record immutable regulatory signature with audit explanation: "${auditComment}". Transaction referencing section: ${activeDecision.auditReference}. Decision Object ID: ${activeDecision.id}`);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col font-sans bg-[#0a1120] text-slate-100" id="decision-approval-center">
      {/* Header element */}
      <div className="p-5 bg-slate-950/80 border-b border-slate-900 flex flex-col md:flex-row justify-between md:items-center shrink-0 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-cyan-950/40 border border-cyan-500/20 text-cyan-400 font-mono text-[8.5px] rounded font-extrabold uppercase tracking-widest">
              SALIENCE_GOV_DECISION_FABRIC
            </span>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-[9px] font-mono text-cyan-400 font-bold">SOVEREIGN_COGNITION_ONLINE</span>
            </div>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-cyan-400" />
            Decision Intelligence & Knowledge Fabric Hub
          </h1>
          <p className="text-xs text-slate-400">
            Transforming KETRACO's SCM transactions, events, and legal compliance bounds into structured enterprise reasoning assets.
          </p>
        </div>

        {/* Categories toggler */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Category:</span>
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 focus:border-cyan-500/30 rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-350 focus:outline-none"
          >
            <option value="ALL">ALL REGULATORY CATEGORIES</option>
            <option value="PPADA Statutory">PPADA STATUTORY APPROVALS</option>
            <option value="Tender Committee">TENDER COMMITTEE MARGINS</option>
            <option value="Contract Variation">CONTRACT VARIATION CHECKS</option>
            <option value="Executive Strategic">EXECUTIVE CAPITAL STEERING</option>
            <option value="Emergency Direct">EMERGENCY DIRECT APPROVALS</option>
          </select>
        </div>
      </div>

      {/* PHASE 22 MODULE TAB BAR UNDER HEADER */}
      <div className="bg-slate-950/40 border-b border-slate-900 p-1 px-4 flex gap-2 shrink-0 overflow-x-auto">
        {[
          { id: 'dao', label: 'Managed Decision Fabric', icon: Layers },
          { id: 'causal', label: 'Causal AI Engine', icon: GitFork },
          { id: 'graphrag', label: 'Federated GraphRAG Mesh', icon: Network },
          { id: 'synthesis', label: 'Autonomous Synthesis Studio', icon: Brain },
          { id: 'governance', label: 'Governance & Self-Evolution', icon: ShieldCheck }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-3 text-[10px] font-mono font-bold uppercase tracking-wider border-b-2 cursor-pointer transition-all ${
                activeTab === tab.id 
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/10' 
                  : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {/* TAB 1: MANAGED DECISION FABRIC */}
        {activeTab === 'dao' && (
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* Left Column: Decision Cards list (4 columns) */}
            <div className="lg:col-span-4 border-r border-slate-900/60 p-4.5 space-y-3.5 overflow-y-auto flex flex-col justify-start bg-[#030610]/40">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest block pl-1">
                Active Decision Assets ({filteredDecisions.length})
              </span>
              
              <div className="space-y-3">
                {filteredDecisions.map(dec => {
                  const pendingCount = dec.approvalsRequired.filter(a => !a.signed).length;
                  return (
                    <button
                      key={dec.id}
                      onClick={() => setSelectedDecisionId(dec.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedDecisionId === dec.id
                          ? 'bg-indigo-950/30 border-cyan-500/40 shadow-[0_0_15px_rgba(0,217,255,0.06)]'
                          : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-wider bg-slate-900 px-2 py-0.5 rounded border border-slate-800/80">
                          {dec.category}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1.5 rounded ${
                          pendingCount === 0 ? 'bg-emerald-950/60 text-emerald-400' : 'bg-amber-950/40 text-amber-500'
                        }`}>
                          {pendingCount === 0 ? 'DECISION COMMIT' : `${pendingCount} SIGN REQUIRED`}
                        </span>
                      </div>

                      <h3 className="text-xs font-bold text-slate-100 mt-2.5 truncate">{dec.title}</h3>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{dec.recommendation}</p>

                      <div className="flex justify-between items-center mt-3.5 border-t border-slate-900/60 pt-2 text-[9px] font-mono text-slate-500">
                        <span>Ref: {dec.auditReference.split(' (')[0]}</span>
                        <span className="text-cyan-400">Trust Index: {dec.trustScore}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Detailed Managed Decision Object (8 columns) */}
            <div className="lg:col-span-8 flex flex-col justify-between overflow-y-auto p-6 space-y-5 bg-[#02040b]">
              <div className="space-y-5">
                {/* Identity banner */}
                <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest font-black block">MANAGED DECISION OBJECT (DAO)</span>
                    <h2 className="text-base font-bold text-white tracking-wide">{activeDecision.title}</h2>
                    <span className="text-[9.5px] font-mono text-cyan-400 font-semibold block pt-1">{activeDecision.category} // Authority Path</span>
                  </div>
                  <div className="bg-slate-950 px-3.5 py-1.5 rounded border border-slate-850 text-right">
                    <span className="text-[8px] font-mono text-slate-500 block uppercase font-bold">CONFIDENCE RATING</span>
                    <span className="text-sm font-mono font-bold block text-cyan-400">{activeDecision.confidence}%</span>
                  </div>
                </div>

                {/* Managed Decision Context Ingest block */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Trigger Event</span>
                    <span className="text-[11px] text-slate-200 block mt-1 font-sans">{activeDecision.context.triggerEvent}</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Affected BOM Node</span>
                    <span className="text-[11px] text-[#00D9FF] block mt-1 font-mono">{activeDecision.context.affectedBOM}</span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Project Node</span>
                    <span className="text-[11px] text-slate-200 block mt-1 font-sans">{activeDecision.context.projectNode}</span>
                  </div>
                </div>

                {/* Recommendation block statement */}
                <div className="bg-indigo-950/15 p-4 rounded-xl border border-indigo-500/10 space-y-1.5">
                  <span className="text-[9px] font-mono text-[#c084fc] font-black uppercase tracking-wider block">RECOMMENDED DECISION ACTION</span>
                  <p className="text-xs font-sans text-slate-200 leading-relaxed">
                    {activeDecision.recommendation}
                  </p>
                </div>

                {/* Evidence & Risks Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Evidence Nodes */}
                  <div className="bg-slate-900/25 p-4 rounded-xl border border-slate-900 space-y-3">
                    <span className="text-[9px] font-mono text-[#00D9FF] font-bold uppercase tracking-wider block">
                      Grounded Provenance Evidence (GraphRAG Lineage)
                    </span>
                    <div className="space-y-2">
                      {activeDecision.evidence.map((ev, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 leading-tight">
                          <span className="text-xs text-slate-200 block font-semibold">{ev.label}</span>
                          <button 
                            onClick={() => onAskCopilot(`Trace exact ledger lineage and document chunks for node address: "${ev.urn}"`)}
                            className="text-[9px] font-mono text-cyan-400 hover:text-[#00D9FF] block truncate mt-1 underline"
                          >
                            {ev.urn}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Risks List with Mitigation */}
                  <div className="bg-slate-900/25 p-4 rounded-xl border border-slate-900 space-y-3">
                    <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider block">
                      Identified Risk Mitigation Matrix
                    </span>
                    <div className="space-y-2">
                      {activeDecision.risks.map((risk, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-900 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-slate-200 font-semibold truncate">{risk.title}</span>
                            <span className="text-[9px] font-mono text-red-400 bg-red-950/25 border border-red-900/20 px-1.5 py-0.5 rounded">
                              {risk.impact}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">Mitigation: {risk.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Alternatives comparison with descriptions */}
                <div className="bg-slate-900/25 p-4 rounded-xl border border-slate-900 space-y-3">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                    Evaluated Action Alternatives (Decision Replay Models)
                  </span>
                  <div className="space-y-2.5">
                    {activeDecision.alternatives.map((alt, idx) => (
                      <div key={idx} className="bg-slate-950/70 p-3 rounded-lg border border-slate-900 space-y-1.5 hover:border-slate-800 transition-colors">
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-[#00D9FF]">{alt.option}</span>
                          <div className="flex gap-2 text-[9px] font-mono">
                            <span className="text-slate-400">Cost: {alt.cost}</span>
                            <span>•</span>
                            <span className="text-slate-400">ETA: {alt.timeline}</span>
                            <span>•</span>
                            <span className="text-amber-400">{alt.riskRating}</span>
                          </div>
                        </div>
                        <p className="text-[10.5px] text-slate-400 leading-normal font-sans">{alt.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Self-Reflection & Observed Outcome Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase block">Observed Decisive Outcome</span>
                    <p className="text-xs text-slate-300">
                      <strong>Schedule Restored:</strong> {activeDecision.observedOutcome.scheduleRestored}<br />
                      <strong>Actual Financial Premium:</strong> {activeDecision.observedOutcome.actualVariationPremium}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1.5">
                    <span className="text-[9px] font-mono text-purple-400 font-bold uppercase block">Learned Lessons & Feedback Loops</span>
                    <p className="text-xs text-slate-300">
                      <strong>Failure Identified:</strong> {activeDecision.lessonsLearned.failureIdentified}<br />
                      <strong>Continuous Optimization Task:</strong> {activeDecision.lessonsLearned.optimizationAction}
                    </p>
                  </div>
                </div>

                {/* Required approvals */}
                <div className="bg-slate-900/25 p-4 rounded-xl border border-slate-900 space-y-3">
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-wider block">
                    Required Regulatory Sign-off Checklist (PPADA Statutory)
                  </span>
                  <div className="space-y-2">
                    {activeDecision.approvalsRequired.map((appr, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 border border-slate-900 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleToggleChecklist(activeDecision.id, idx)}
                            className="text-[#00D9FF] hover:text-cyan-300 select-none cursor-pointer"
                          >
                            {appr.signed ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-500 animate-pulse" />}
                          </button>
                          <span className="text-xs text-slate-200 font-semibold">{appr.role}</span>
                        </div>
                        <div className="text-right leading-none text-[10px] font-mono">
                          {appr.signed ? (
                            <>
                              <span className="text-emerald-400 font-bold block">{appr.signedBy}</span>
                              <span className="text-slate-500 block text-[9px] mt-1">{appr.timestamp}</span>
                            </>
                          ) : (
                            <span className="text-amber-500 font-black tracking-wider animate-pulse">PENDING RELEASE</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Decisive Interactive Signing Section */}
              <div className="pt-4 border-t border-slate-900 shrink-0">
                <form onSubmit={handleApplySignature} className="bg-slate-900 p-4 rounded-xl border border-slate-900 space-y-3.5">
                  <span className="text-[10px] font-mono text-[#00E1FF] font-black uppercase block tracking-widest">
                    PPADA 2015 Handshake & Sovereign Signature
                  </span>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Applying your authorized signature records this transaction to KETRACO's permanent ledger, releasing the decision to active execution.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                    <input 
                      type="text" 
                      value={auditComment}
                      onChange={(e) => setAuditComment(e.target.value)}
                      placeholder="Explain direct award justification for public audit..."
                      required
                      className="bg-slate-950 border border-slate-800 focus:border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none font-sans"
                    />
                    <input 
                      type="password" 
                      value={signingPassword}
                      onChange={(e) => setSigningPassword(e.target.value)}
                      placeholder="Enter security clearance code (1234)..."
                      required
                      className="bg-slate-950 border border-slate-800 focus:border-cyan-500/20 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-650 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSigning || !auditComment.trim() || !signingPassword}
                      className="flex-1 py-2.5 bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 hover:from-cyan-900/60 hover:to-indigo-900/60 text-cyan-300 border border-cyan-500/25 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-40"
                    >
                      <Lock className="w-3.5 h-3.5 text-cyan-400" />
                      {isSigning ? 'RECORDING LEDGER BLOCK TRANSACTION...' : 'SIGN & COMMIT ADVISORY TO LEDGER'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onAskCopilot(`Analyze options for decision: "${activeDecision.title}" under PPADA statutes. Detail the exact risks and benefits of Shanghai Conductor air-freight vs restricted local supplier models.`)}
                      className="px-4 py-2 bg-slate-950 border border-slate-800 text-slate-350 hover:text-white rounded-xl text-xs font-mono block cursor-pointer transition-colors"
                    >
                      DRAFT COMPLIANCE ADVISORY
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CAUSAL AI ENGINE */}
        {activeTab === 'causal' && (
          <div className="h-full overflow-y-auto p-6 space-y-6 bg-[#02040b]">
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest font-black block">CAUSAL REASONING LAYER</span>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <GitFork className="w-5 h-5 text-purple-400" /> Dynamic SCM Causal AI Simulator
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 uppercase font-black bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 rounded">
                  ISO 31000 Risk Modeling
                </span>
              </div>

              {/* Ingestion & Selection Control */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block">Inject Active Disruption Parameter</label>
                  <select
                    value={selectedDisruptor}
                    onChange={(e) => setSelectedDisruptor(e.target.value)}
                    className="w-full bg-[#0d1627] border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-purple-500/30"
                  >
                    <option value="supplier-failure">Supplier Failure: Shanghai Conductor force majeure delay</option>
                    <option value="inventory-shortage">Inventory Shortage: Mariakani safety buffers depleted (Stock Zero)</option>
                    <option value="contract-delay">Contract Delay: Suswa Lot 4 geotechnical foundation instability</option>
                    <option value="budget-reduction">Budget Reduction: National Treasury cuts capital funding by 15%</option>
                    <option value="grid-expansion">Grid Expansion Delay: 220kV loop-in line RoW easement dispute</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block">Set Counterfactual Analysis Target</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-lg border border-slate-850">
                    <button
                      onClick={() => setCounterfactualSupp('local')}
                      className={`py-1.5 rounded text-center text-xs font-mono font-bold transition-all ${
                        counterfactualSupp === 'local' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'
                      }`}
                    >
                      Swap Local Suppliers
                    </button>
                    <button
                      onClick={() => setCounterfactualSupp('redesign')}
                      className={`py-1.5 rounded text-center text-xs font-mono font-bold transition-all ${
                        counterfactualSupp === 'redesign' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-500'
                      }`}
                    >
                      Redesign Component Specifications
                    </button>
                  </div>
                </div>
              </div>

              {/* Causal Pathway Diagram */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-black text-slate-400 uppercase block">Cause & Effect Dependency Pathway</span>
                <div className="bg-[#030610] p-5 rounded-xl border border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                  <div className="p-3 bg-red-950/20 border border-red-900/30 text-red-300 rounded-lg text-center w-full sm:w-1/4">
                    <span className="text-[9px] text-slate-500 uppercase block font-black mb-1">Causal Trigger</span>
                    <span className="font-bold">{selectedDisruptor.replace('-', ' ').toUpperCase()}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 shrink-0 hidden sm:block" />
                  <div className="p-3 bg-amber-950/15 border border-amber-950/35 text-amber-200 rounded-lg text-center w-full sm:w-1/3">
                    <span className="text-[9px] text-slate-500 uppercase block font-black mb-1">Immediate Consequence</span>
                    <span>{simulatedCausalMetrics.consequence}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-600 shrink-0 hidden sm:block" />
                  <div className="p-3 bg-indigo-950/20 border border-indigo-900/20 text-indigo-300 rounded-lg text-center w-full sm:w-1/3">
                    <span className="text-[9px] text-slate-500 uppercase block font-black mb-1">Critical Path Impact</span>
                    <span>{simulatedCausalMetrics.scheduleRisk}</span>
                  </div>
                </div>
              </div>

              {/* Detailed Counterfactual & RCA Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Cause and Effect Discovery */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-4">
                  <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wide block border-b border-slate-900 pb-1.5">
                    Root Cause Analysis (RCA) & Dependency Models
                  </span>
                  
                  <div className="space-y-3.5 text-xs">
                    <div>
                      <strong className="text-slate-350 block text-[10px] font-mono uppercase font-black">Identified Root Cause:</strong>
                      <p className="text-slate-300 mt-1 leading-relaxed font-sans">{simulatedCausalMetrics.rootCause}</p>
                    </div>
                    <div>
                      <strong className="text-slate-350 block text-[10px] font-mono uppercase font-black">Downstream Impact Path:</strong>
                      <p className="text-slate-300 mt-1 leading-relaxed font-mono text-[10.5px]">{simulatedCausalMetrics.impactPath}</p>
                    </div>
                    <div>
                      <strong className="text-slate-350 block text-[10px] font-mono uppercase font-black">Forecasted Cost Variance:</strong>
                      <p className="text-slate-300 mt-1 leading-relaxed font-sans font-bold text-[#00D9FF]">{simulatedCausalMetrics.costVariance}</p>
                    </div>
                  </div>
                </div>

                {/* Counterfactual Alternative Simulation */}
                <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-4">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wide block border-b border-slate-900 pb-1.5">
                    Counterfactual Outcome Forecast
                  </span>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <p>
                      <strong>Counterfactual Action:</strong> What if we immediately swapped Shanghai allocations to certified local supplier {counterfactualSupp === 'local' ? '"East African Cables"' : '"sub-component steel redesign specifications"'}?
                    </p>
                    <div className="p-3 bg-[#022c22]/10 border border-emerald-500/10 rounded-lg text-emerald-300">
                      <strong>Simulated Counterfactual Result:</strong> Saves the critical path from slipping. Nairobi Ring blackout risk falls from 84% to under 5%. Total compliance variation cost stands at only 4.5% ($45k) premium, well within statutory caps.
                    </div>
                    <div>
                      <strong className="text-slate-350 block text-[10px] font-mono uppercase font-black">ACOS Recommended Remedy Action:</strong>
                      <p className="text-slate-300 mt-1 font-sans">{simulatedCausalMetrics.remedyRecommendation}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Launch actions */}
              <div className="flex justify-end gap-2 border-t border-slate-900 pt-4">
                <button
                  onClick={() => onAskCopilot(`Simulate a complete causal breakdown and prepare a formal risk mitigation report for: "${selectedDisruptor}" with counterfactual choice "${counterfactualSupp}".`)}
                  className="py-2.5 px-4 bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-500/20 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  COMPILE RISK REPORT
                </button>
                <button
                  onClick={() => {
                    setSelectedDecisionId('dec-1');
                    setActiveTab('dao');
                  }}
                  className="py-2.5 px-4 bg-[#0a152d] border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                >
                  EXPORT TO MANAGED DECISION ASSET
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: FEDERATED GRAPHRAG MESH */}
        {activeTab === 'graphrag' && (
          <div className="h-full overflow-y-auto p-6 space-y-6 bg-[#02040b]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side: Knowledge Source Ingestion & Status (5 columns) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-cyan-400" /> Knowledge Ingestion Fabric
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Active pipelines crawling, indexing, and certifying multi-source enterprise structured and unstructured data.
                  </p>

                  <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                    {[
                      { source: 'ERP SAP S/4HANA', status: 'SYNCHRONIZED', count: '14,280 objects', trust: '99.8%', lineage: 'BOM catalogs, requisitions' },
                      { source: 'SCM & Logistics Logs', status: 'LIVE POLLING', count: '482 routes', trust: '98.5%', lineage: 'Mombasa port bills, customs clearances' },
                      { source: 'Mariakani Depot Inventory', status: 'SYNCHRONIZED', count: '1,240 items', trust: '100%', lineage: 'Raw steel, high-voltage conductor sets' },
                      { source: 'Sovereign Policy Repository', status: 'IMMUTABLE', count: '12 active statutes', trust: '100%', lineage: 'PPADA 2015, PPADR 2020, Treasury Circulars' },
                      { source: 'SCM Digital Twin Simulator', status: 'ACTIVE', count: '12,500 data points', trust: '97.2%', lineage: 'Substation load curves, telemetry metrics' },
                      { source: 'Supplier Intelligence Records', status: 'LIVE POLLING', count: '84 vendor files', trust: '99.1%', lineage: 'KRA Pin tax clearances, PPRA debarments' },
                      { source: 'Contract Variations Ledger', status: 'IMMUTABLE', count: '42 historical blocks', trust: '100%', lineage: 'SHA-256 secure signed variations logs' }
                    ].map((src, i) => (
                      <div key={i} className="p-2.5 bg-slate-950/60 border border-slate-900 rounded-xl hover:border-slate-850 transition-colors space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <strong className="text-slate-200">{src.source}</strong>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                            src.status === 'SYNCHRONIZED' || src.status === 'IMMUTABLE' ? 'bg-emerald-950/60 text-emerald-400' : 'bg-cyan-950/50 text-cyan-400'
                          }`}>
                            {src.status}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">Lineage: {src.lineage}</p>
                        <div className="flex justify-between text-[8px] text-slate-500 font-mono">
                          <span>Indexed: {src.count}</span>
                          <span>Trust Index: {src.trust}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Federated GraphRAG Multi-Hop Query Explorer (7 columns) */}
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl min-h-[460px] flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                      <div className="space-y-1">
                        <span className="text-[8px] font-mono text-cyan-400 uppercase tracking-widest font-black block">FEDERATED GRAPHRAG SOLVER</span>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                          <Network className="w-5 h-5 text-cyan-400 animate-pulse" /> Cross-Domain GraphRAG Hub
                        </h2>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400">Node Count: 48,240</span>
                    </div>

                    <p className="text-xs text-slate-400">
                      Ask complex cross-department questions. Atlas resolves them through federated search, multi-hop reasoning, and semantic inference, yielding fully traceable evidence paths.
                    </p>

                    {/* Query input panel */}
                    <div className="flex gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-900">
                      <input
                        type="text"
                        value={activeQuery}
                        onChange={(e) => setActiveQuery(e.target.value)}
                        placeholder="Enter cross-domain semantic query..."
                        className="flex-1 bg-transparent border-none text-xs text-slate-200 focus:outline-none"
                      />
                      <button
                        onClick={runMeshQuerySimulation}
                        disabled={runningMeshQuery || !activeQuery.trim()}
                        className="py-1.5 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-mono font-black text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                      >
                        {runningMeshQuery ? 'Resolving Mesh...' : 'Solve'}
                      </button>
                    </div>

                    {/* Animated Terminal */}
                    <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs text-slate-300 min-h-[180px] space-y-2.5">
                      <div className="flex justify-between text-[9px] text-slate-600 border-b border-slate-900 pb-1 uppercase tracking-wide">
                        <span>ACOS_RETRIEVAL_MESH_LOG</span>
                        <span>Gateway: Active</span>
                      </div>

                      {meshRoutingSteps.length === 0 && (
                        <div className="flex items-center justify-center py-10 text-slate-500 text-[11px] font-sans">
                          Click "Solve" above to trigger federated multi-hop tracing across local and departmental enclaves.
                        </div>
                      )}

                      <div className="space-y-2">
                        {meshRoutingSteps.map((step, idx) => (
                          <div key={idx} className="text-[10.5px] leading-relaxed">
                            <span className="text-cyan-500 font-bold mr-1.5">&gt;&gt;</span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    {queryConfidence > 0 && (
                      <div className="bg-emerald-950/25 border border-emerald-500/20 p-3.5 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wide">Retrieval Mesh Resolution Summary</span>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">Confidence: {queryConfidence}%</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          <strong>Verified Semantic Reference Chains:</strong> SinoPower Ltd shares an identical tax registration PIN signature code with Shanghai Metal Joint Consortium (audited under PPADA Sec 41 limits). Shanghai Cable director listed as majority shareholder. SinoPower debarred Oct 2025. Shanghai joint bid disqualified due to statutory non-disclosure criteria.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-900 pt-4">
                    <button
                      onClick={() => onAskCopilot(`Explain the full GraphRAG multi-hop retrieval path resolving the query: "${activeQuery}". Detail specific database schemas, debarment logs, and directory structures.`)}
                      className="py-2 px-3.5 bg-[#0a152d] hover:bg-cyan-950/20 text-cyan-400 border border-cyan-500/10 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                    >
                      DRAFT EVIDENCE LOG
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AUTONOMOUS KNOWLEDGE SYNTHESIS STUDIO */}
        {activeTab === 'synthesis' && (
          <div className="h-full overflow-y-auto p-6 space-y-6 bg-[#02040b]">
            <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest font-black block">AUTONOMOUS KNOWLEDGE SYNTHESIS ENGINE</span>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Brain className="w-5 h-5 text-emerald-400 animate-pulse" /> SCM Document Synthesis Studio
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-black bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  ACOS Synthesis Engine
                </span>
              </div>

              {/* Selection controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase">Select Target Synthesis Output</label>
                  <select
                    value={synthesisType}
                    onChange={(e) => setSynthesisType(e.target.value as any)}
                    className="w-full bg-[#0d1627] border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  >
                    <option value="board">KETRACO Board Paper: Suswa Lot 4 Emergency Allocations</option>
                    <option value="policy">Policy Synthesis Brief: PPADA Section 139 Variations Limits</option>
                    <option value="briefing">Executive Briefing: Global copper deficit and shipping risks</option>
                    <option value="supplier">Supplier Dossier: East African Cables performance and registry standing</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={runKnowledgeSynthesis}
                    disabled={synthesizing}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 text-white font-mono font-black text-xs uppercase rounded-lg transition-all shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    {synthesizing ? 'SYNTHESIZING DOCUMENT...' : 'GENERATE SYNTHESIS BRIEF'}
                  </button>
                </div>
              </div>

              {/* Live Output */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Synthesized Output Document</span>
                <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 font-mono text-xs text-slate-300 min-h-[300px] leading-relaxed whitespace-pre-line overflow-y-auto max-h-[480px]">
                  {synthesizing && (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
                      <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                      <span className="text-xs">Accessing federated data enclaves and synthesizing statutory report layout...</span>
                    </div>
                  )}

                  {!synthesizing && !synthesisOutput && (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-2 font-sans">
                      <BookOpen className="w-8 h-8 text-slate-700" />
                      <span>Select a briefing template and click "Generate Synthesis Brief" to formulate structured insights.</span>
                    </div>
                  )}

                  {!synthesizing && synthesisOutput && (
                    <div className="prose prose-invert max-w-none text-slate-350">
                      {synthesisOutput}
                    </div>
                  )}
                </div>
              </div>

              {synthesisOutput && (
                <div className="flex justify-end gap-2 border-t border-slate-900 pt-4">
                  <button
                    onClick={() => {
                      alert('Document certified with SHA-256 hash. Published to Enterprise Policy Memory.');
                    }}
                    className="py-2.5 px-4 bg-emerald-900/30 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    CERTIFY & PUBLISH BRIEF
                  </button>
                  <button
                    onClick={() => {
                      alert('Brief exported to active Decision assets list.');
                    }}
                    className="py-2.5 px-4 bg-[#0a152d] border border-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition-colors"
                  >
                    EXPORT TO DECISION FABRIC
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: GOVERNANCE & SELF-EVOLUTION */}
        {activeTab === 'governance' && (
          <div className="h-full overflow-y-auto p-6 space-y-6 bg-[#02040b]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Knowledge Policies (6 columns) */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" /> Knowledge Governance Controls
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Regulatory policy parameters enforcing statutory compliance, preventing parameter drift, and maintaining human-in-the-loop locks.
                  </p>

                  <div className="space-y-4 pt-2">
                    {/* Policy enforcement tier */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase block">Compliance Enforcement Tier</label>
                        <span className="text-[9px] font-mono text-emerald-400 uppercase font-black">Active</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setPolicyEnforcement('strict')}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            policyEnforcement === 'strict' 
                              ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                              : 'bg-slate-950/40 border-slate-900 text-slate-400'
                          }`}
                        >
                          <span className="text-xs font-bold block">Strict Blocking</span>
                          <span className="text-[8px] text-slate-500 block leading-none mt-0.5">Enforces human locks on any deviations</span>
                        </button>
                        <button
                          onClick={() => setPolicyEnforcement('moderate')}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            policyEnforcement === 'moderate' 
                              ? 'bg-emerald-950/20 border-emerald-500/50 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' 
                              : 'bg-slate-950/40 border-slate-900 text-slate-400'
                          }`}
                        >
                          <span className="text-xs font-bold block">Advisory Flagging</span>
                          <span className="text-[8px] text-slate-500 block leading-none mt-0.5">Flags risks without hard process blocking</span>
                        </button>
                      </div>
                    </div>

                    {/* Hallucination scanners */}
                    <div className="flex items-center justify-between p-3.5 bg-slate-950/50 rounded-xl border border-slate-900">
                      <div className="space-y-0.5">
                        <strong className="text-xs text-slate-200 block">Sovereign Hallucination Scanner</strong>
                        <span className="text-[10px] text-slate-500 block leading-none">Scans all outputs against local vector enclaves before presentation</span>
                      </div>
                      <button
                        onClick={() => setHallucinationFilter(!hallucinationFilter)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${hallucinationFilter ? 'bg-emerald-500' : 'bg-slate-800'}`}
                      >
                        <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${hallucinationFilter ? 'translate-x-5' : ''}`} />
                      </button>
                    </div>

                    {/* Certify docs */}
                    <div className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3">
                      <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Document Certification & Stewardship</span>
                        <span className="text-xs font-mono text-cyan-400 font-bold">{certifiedIndices} Certified</span>
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-normal">
                        Certifying active knowledge templates seals their hash signatures into the SCM audit ledger, preventing adversarial template modifications.
                      </p>
                      <button
                        onClick={() => {
                          setCertifyingIndex(true);
                          setTimeout(() => {
                            setCertifiedIndices(prev => prev + 1);
                            setCertifyingIndex(false);
                          }, 1200);
                        }}
                        disabled={certifyingIndex}
                        className="w-full py-2 bg-[#0d1627] hover:bg-[#12203b] border border-slate-800 text-slate-300 hover:text-white rounded-lg text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {certifyingIndex ? 'HASHING AND INJECTING CODE SIGNATURES...' : 'CERTIFY OUTSTANDING RAG SOURCES'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Self-Evolving Intelligence (6 columns) */}
              <div className="lg:col-span-6 space-y-6">
                <div className="bg-[#0c1322] border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
                  <span className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Self-Evolving Intelligence Loop
                  </span>
                  <p className="text-[11px] text-slate-400">
                    The cognitive supervisor constantly adjusts reasoning parameters based on recorded outcomes, failures, and human decision overrides.
                  </p>

                  {/* Active Loop Metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center font-mono pt-1">
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-900 leading-tight">
                      <span className="text-[8px] text-slate-500 block">SCM LEARNING RATE</span>
                      <span className="text-xs font-bold text-amber-400 block mt-1">98.4%</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-900 leading-tight">
                      <span className="text-[8px] text-slate-500 block">SUCCESS RATIO</span>
                      <span className="text-xs font-bold text-emerald-400 block mt-1">99.2%</span>
                    </div>
                    <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-900 leading-tight">
                      <span className="text-[8px] text-slate-500 block">OVERRIDE WEIGHTS</span>
                      <span className="text-xs font-bold text-purple-400 block mt-1">0.08%</span>
                    </div>
                  </div>

                  {/* Lessons Learned Ledger */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block">Recent Learned Lessons & Adaptation Nodes</span>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {[
                        { title: 'Shanghai Conductors Shipping Variance', lesson: 'Mombasa Port monsoon customs delays are highly predictive (12-day hold average). Safety stock buffer adjusted to +15% at Mariakani Depot.' },
                        { title: 'Suswa Node 3 Civil Foundations Shift', lesson: 'Legacy soil surveys lack vertical compaction detail. Promoted LIDAR parameters into the technical bidding requirements template.' },
                        { title: 'Copper Pricing Commodities Spike', lesson: 'International indices shifted 22.4%. Instantly updated active pricing cap limits across 3 active tenders.' },
                        { title: 'Emergency Air Freight Premium Offset', lesson: 'High variation cost ($140k) was successfully balanced by deferring non-critical regional secondary cabling contracts.' }
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg space-y-1 text-xs">
                          <strong className="text-amber-400 font-bold block">{item.title}</strong>
                          <p className="text-slate-400 leading-relaxed text-[11px]">{item.lesson}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
