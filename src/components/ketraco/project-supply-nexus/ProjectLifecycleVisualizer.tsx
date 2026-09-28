import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Building2,
  FileCheck2,
  ArrowDown,
  Calendar,
  User,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';

export type StageState = 'COMPLETED' | 'IN_PROGRESS' | 'BLOCKED' | 'UPCOMING';

export interface LifecycleStage {
  id: string;
  stepNumber: number;
  name: string;
  state: StageState;
  completionPct: number;
  criticalMilestone: string;
  blockingIssue: string | null;
  responsibleDomain: string;
  leadOfficer: string;
  targetDate: string;
  deliverables: { title: string; done: boolean }[];
  cycleDays: number;
  description: string;
}

export const CANONICAL_12_STAGES: LifecycleStage[] = [
  {
    id: 'need',
    stepNumber: 1,
    name: 'Transmission Need & Grid Code Requirement',
    state: 'COMPLETED',
    completionPct: 100,
    criticalMilestone: 'National Grid Least-Cost Expansion Plan (LCEP) 2024–2040 Integration',
    blockingIssue: null,
    responsibleDomain: 'Grid Planning & System Studies',
    leadOfficer: 'Eng. D. Ochieng (Chief Planning Engineer)',
    targetDate: 'Q1 2023',
    cycleDays: 45,
    description: 'Identification of 400kV bulk transmission corridor deficit to evacuate renewable base generation from Coast (Mombasa) to Nairobi metro demand center.',
    deliverables: [
      { title: 'System Load Flow & N-1 Contingency Simulation Report', done: true },
      { title: 'National Least-Cost Power Development Concurrence (EPRA)', done: true },
      { title: 'Board Strategic Project Charter Formal Approval', done: true }
    ]
  },
  {
    id: 'concept',
    stepNumber: 2,
    name: 'Concept Development & Voltage Routing',
    state: 'COMPLETED',
    completionPct: 100,
    criticalMilestone: '400kV Double-Circuit Corridor Alternative Analysis & Line Alignment',
    blockingIssue: null,
    responsibleDomain: 'Transmission Engineering & Design',
    leadOfficer: 'Eng. F. Kimani (Principal Line Design Engineer)',
    targetDate: 'Q2 2023',
    cycleDays: 60,
    description: 'Preliminary engineering study comparing 220kV vs 400kV double-circuit configurations across 482km route, identifying wildlife corridors and terrain crossing points.',
    deliverables: [
      { title: 'Corridor Alignment Options & Satellite Topo Survey', done: true },
      { title: 'Initial Environmental & Social Screening Memo', done: true },
      { title: 'Concept Engineering Memo & Single Line Schematics', done: true }
    ]
  },
  {
    id: 'feasibility',
    stepNumber: 3,
    name: 'Feasibility Study & Geotechnical Investigation',
    state: 'COMPLETED',
    completionPct: 100,
    criticalMilestone: 'Bankable Feasibility Study & Soil Resistivity Analysis Published',
    blockingIssue: null,
    responsibleDomain: 'Project Development & Technical Services',
    leadOfficer: 'Dr. A. Ndwiga (Lead Feasibility Consultant)',
    targetDate: 'Q4 2023',
    cycleDays: 90,
    description: 'Full geotechnical drilling at 1,180 tower locations, soil resistivity logging for earthing design, and economic financial rate of return (EIRR 18.4%) confirmation.',
    deliverables: [
      { title: 'Tower Foundation Geotechnical Soil Borehole Logs', done: true },
      { title: 'Full Economic & Financial Rate of Return (EIRR/FIRR)', done: true },
      { title: 'Grid Integration & Transient Dynamic Stability Study', done: true }
    ]
  },
  {
    id: 'land',
    stepNumber: 4,
    name: 'Land Acquisition & Wayleave Corridors',
    state: 'COMPLETED',
    completionPct: 100,
    criticalMilestone: '482km 60m-Wide Wayleave Corridor Gazettement & NLC Valuation',
    blockingIssue: null,
    responsibleDomain: 'Land, Wayleaves & Valuation Department',
    leadOfficer: 'Mr. J. Mwangi (Chief Land Officer)',
    targetDate: 'Q2 2024',
    cycleDays: 180,
    description: 'Cadastral surveying of 2,410 Project Affected Persons (PAPs), National Land Commission (NLC) gazettement, and statutory compensation disbursement.',
    deliverables: [
      { title: 'National Land Commission Section 107 Acquisition Notice', done: true },
      { title: 'Resettlement Action Plan (RAP) Valuation Ledger Verified', done: true },
      { title: 'Substation Site Title Deeds Registered to KETRACO', done: true }
    ]
  },
  {
    id: 'financing',
    stepNumber: 5,
    name: 'Financing & Sovereign Credit Agreements',
    state: 'COMPLETED',
    completionPct: 100,
    criticalMilestone: 'Sovereign Concessional Loan Agreement Effective & Disbursed (AfDB / JICA)',
    blockingIssue: null,
    responsibleDomain: 'Finance, Treasury & Donor Coordination',
    leadOfficer: 'CPA R. Mutua (Director Finance & Treasury)',
    targetDate: 'Q3 2024',
    cycleDays: 120,
    description: 'Securing USD 380M blended sovereign concession from African Development Bank and JICA with National Treasury guarantee and 1.2% interest margin.',
    deliverables: [
      { title: 'Bilateral Financing Agreement Signed by National Treasury', done: true },
      { title: 'Legal Opinion by Attorney General on Concessional Terms', done: true },
      { title: 'First Advance Special Account Disbursement Milestone Met', done: true }
    ]
  },
  {
    id: 'approvals',
    stepNumber: 6,
    name: 'Statutory Approvals & Environmental Licenses',
    state: 'COMPLETED',
    completionPct: 100,
    criticalMilestone: 'NEMA Environmental & Social Impact Assessment (ESIA) License Issued',
    blockingIssue: null,
    responsibleDomain: 'Health, Safety, Environment & Quality (HSEQ)',
    leadOfficer: 'Ms. C. Barasa (Chief Environmental Officer)',
    targetDate: 'Q4 2024',
    cycleDays: 75,
    description: 'NEMA license issued under EPL/3401 with biodiversity offset covenants for Tsavo East national park corridor crossing, KCAA aviation lighting permits granted.',
    deliverables: [
      { title: 'NEMA License EPL/3401 with EMP Compliance Conditions', done: true },
      { title: 'Kenya Civil Aviation Authority (KCAA) Tower Lighting Permits', done: true },
      { title: 'Kenya Wildlife Service (KWS) Wayleave Concession Protocol', done: true }
    ]
  },
  {
    id: 'procurement',
    stepNumber: 7,
    name: 'International Competitive Procurement (EPC)',
    state: 'COMPLETED',
    completionPct: 100,
    criticalMilestone: 'EPC Contract Award & Notice to Proceed (NTP) to Larsen & Toubro',
    blockingIssue: null,
    responsibleDomain: 'Supply Chain Management & Procurement',
    leadOfficer: 'Eng. P. Njoroge (Chief Procurement Officer)',
    targetDate: 'Q1 2025',
    cycleDays: 150,
    description: 'International competitive bidding under AfDB standard procurement rules. Two packages: Lot 1 Transmission Line (482km) and Lot 2 Substation Bays.',
    deliverables: [
      { title: 'PPRA & AfDB No-Objection to Bid Evaluation Report', done: true },
      { title: 'EPC Turnkey Contract Execution (Larsen & Toubro Ltd)', done: true },
      { title: '10% Performance Security Guarantee & Advance Payment Bond', done: true }
    ]
  },
  {
    id: 'design',
    stepNumber: 8,
    name: 'Detailed Engineering Design & Factory Approvals',
    state: 'COMPLETED',
    completionPct: 100,
    criticalMilestone: 'Substation Single Line Diagram & Tower Type-Test Certified',
    blockingIssue: null,
    responsibleDomain: 'Engineering, Design & Quality Assurance',
    leadOfficer: 'Eng. K. Kiprop (Lead Technical Specialist)',
    targetDate: 'Q3 2025',
    cycleDays: 90,
    description: 'Detailed civil, electrical, protection & automation engineering design approvals. Factory inspection of prototype 400kV guyed-V and self-supporting lattice towers.',
    deliverables: [
      { title: 'Approved-for-Construction (AFC) Engineering Drawing Package', done: true },
      { title: '400kV Tower Mechanical Full-Scale Type Test Certificate', done: true },
      { title: 'Substation Protection, Automation & SCADA Architecture Blueprint', done: true }
    ]
  },
  {
    id: 'construction',
    stepNumber: 9,
    name: 'Construction & Civil / Electrical Erection',
    state: 'IN_PROGRESS',
    completionPct: 72,
    criticalMilestone: 'Foundation Casting 89% (1,050/1,180) • Tower Erection 72% (850/1,180)',
    blockingIssue: 'Transformer T-204 Mumbai Port Dry Dock QC Re-inspection (+14d lag)',
    responsibleDomain: 'Project Implementation & Field Supervision',
    leadOfficer: 'Eng. V. Omondi (Project Resident Engineer)',
    targetDate: '15 Nov 2026',
    cycleDays: 420,
    description: 'Civil tower foundation excavations, rebar cage casting, stub setting, tower superstructure erection, and conductor stringing over 482km double-circuit alignment.',
    deliverables: [
      { title: 'Tower Foundation Concrete Casting & Cube Strength Verification (89%)', done: true },
      { title: 'Tower Steel Lattice Structure Erection & Bolt Torquing (72%)', done: true },
      { title: 'AAAC Conductor & OPGW Fiber Stringing Across Sections (58%)', done: false },
      { title: 'Mariakani 400kV Substation Bay Civil Switchyard Equipment Pads (84%)', done: true }
    ]
  },
  {
    id: 'commissioning',
    stepNumber: 10,
    name: 'Testing, Pre-Commissioning & Line Charging',
    state: 'UPCOMING',
    completionPct: 0,
    criticalMilestone: 'High Voltage Soak Test (400kV 72-Hour Energization Without Load)',
    blockingIssue: null,
    responsibleDomain: 'System Operations & Technical Audit',
    leadOfficer: 'Eng. M. Cherono (Chief Commissioning Engineer)',
    targetDate: 'Q4 2026',
    cycleDays: 45,
    description: 'Secondary injection testing of distance & differential relays, end-to-end fiber optic telemetry checks, breaker trip-timing tests, and 72-hour soak test.',
    deliverables: [
      { title: 'Relay Protection Tripping & Tele-protection Carrier Channel Test', done: false },
      { title: 'Substation SCADA RTU Protocol IEC 60870-5-104 Telemetry Sync', done: false },
      { title: 'Formal Line Charging Sanction by National Control Centre (NCC)', done: false }
    ]
  },
  {
    id: 'handover',
    stepNumber: 11,
    name: 'Operational Handover to National Control Centre (TSO)',
    state: 'UPCOMING',
    completionPct: 0,
    criticalMilestone: 'Commercial Operation Date (COD) & Operational Transfer Certificate',
    blockingIssue: null,
    responsibleDomain: 'System Operations & Transmission Asset Management',
    leadOfficer: 'Eng. S. Kariuki (General Manager Operations)',
    targetDate: 'Q1 2027',
    cycleDays: 30,
    description: 'Formal transfer of asset custody, SCADA controls, maintenance schedules, and spare parts inventory to National Transmission System Operator (TSO).',
    deliverables: [
      { title: 'Joint Asset Verification Protocol & As-Built CAD Drawing Dossier', done: false },
      { title: 'Strategic Spares & Specialized Maintenance Tooling Custody Transfer', done: false },
      { title: 'Provisional Taking-Over Certificate (TOC) Executed by Managing Director', done: false }
    ]
  },
  {
    id: 'benefits',
    stepNumber: 12,
    name: 'Benefits Realization & Grid Loss Verification',
    state: 'UPCOMING',
    completionPct: 0,
    criticalMilestone: '450MW Evacuation Capacity Benchmark & 14.8MW Coastal Loss Reduction',
    blockingIssue: null,
    responsibleDomain: 'Strategy, Risk & Corporate Performance',
    leadOfficer: 'Dr. H. Wekesa (Director Strategy & Planning)',
    targetDate: 'Q3 2027+',
    cycleDays: 365,
    description: 'Post-energization empirical measurement of coastal voltage profiles, transmission loss reduction, wheeling tariff revenue, and regional power stability.',
    deliverables: [
      { title: 'Coastal Grid Voltage Stability Profile & Dynamic Var Benchmark', done: false },
      { title: 'Wheeling Tariff Revenue & Loss Reduction Audit vs Business Case', done: false },
      { title: 'Independent Project Completion Report (PCR) Submission to Financiers', done: false }
    ]
  }
];

interface ProjectLifecycleVisualizerProps {
  selectedStageId?: string;
  onSelectStage?: (stage: LifecycleStage) => void;
  projectCode?: string;
  projectName?: string;
}

export const ProjectLifecycleVisualizer: React.FC<ProjectLifecycleVisualizerProps> = ({
  selectedStageId = 'construction',
  onSelectStage,
  projectCode = 'KET-PDS-0042',
  projectName = 'Mombasa - Nairobi 400kV Interconnector'
}) => {
  const [activeStageId, setActiveStageId] = useState<string>(selectedStageId);
  const [inspectModalOpen, setInspectModalOpen] = useState(false);

  const currentStage = CANONICAL_12_STAGES.find(s => s.id === activeStageId) || CANONICAL_12_STAGES[8];

  const handleStageClick = (stage: LifecycleStage) => {
    setActiveStageId(stage.id);
    onSelectStage?.(stage);
  };

  const getStateBadge = (state: StageState) => {
    switch (state) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            COMPLETED
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
            <Clock className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            IN PROGRESS (ACTIVE)
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.3)]">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            BLOCKED
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-900 text-slate-400 border border-slate-800">
            UPCOMING
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#080d18] border border-slate-800 rounded-xl p-5 shadow-xl select-text relative">
      
      {/* Section Header */}
      <div className="pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold uppercase tracking-wider">
                CANONICAL 12-STAGE LIFECYCLE SEQUENCE
              </span>
            </div>
            <h2 className="text-xl font-display font-bold text-white tracking-tight mt-1.5">
              Project Delivery Lifecycle Architecture
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Sequential gate governance from transmission grid need through construction, commissioning, and benefits realization
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setInspectModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <FileCheck2 className="w-4 h-4 text-cyan-400" />
              <span>Inspect Stage Gate Audit Dossier</span>
            </button>
          </div>
        </div>
      </div>

      {/* Vertical Lifecycle Stack */}
      <div className="pt-5 space-y-4">
        {CANONICAL_12_STAGES.map((stage, idx) => {
          const isActive = stage.id === activeStageId;
          const isCurrentActiveStage = stage.state === 'IN_PROGRESS';

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Card */}
              <div
                onClick={() => handleStageClick(stage)}
                className={`w-full rounded-xl border p-4.5 transition-all cursor-pointer ${
                  isCurrentActiveStage
                    ? 'bg-[#0a1526] border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40'
                    : isActive
                    ? 'bg-[#0a1120] border-slate-700 ring-1 ring-slate-600'
                    : 'bg-[#070c16] border-slate-800/90 hover:border-slate-700/80 hover:bg-[#080e1b]'
                }`}
              >
                {/* Header row: Number, Title, Status Badge, Completion */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 border ${
                      stage.state === 'COMPLETED'
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : stage.state === 'IN_PROGRESS'
                        ? 'bg-cyan-950 text-cyan-300 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800'
                    }`}>
                      {String(stage.stepNumber).padStart(2, '0')}
                    </span>

                    <div>
                      <h3 className="text-base font-display font-bold text-white tracking-tight">
                        {stage.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-sans mt-0.5">
                        {stage.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStateBadge(stage.state)}
                    <span className="text-sm font-mono font-bold text-white px-2.5 py-1 bg-slate-900 border border-slate-800 rounded">
                      {stage.completionPct}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden my-3 border border-slate-900">
                  <div
                    className={`h-full transition-all duration-300 ${
                      stage.state === 'COMPLETED'
                        ? 'bg-emerald-500'
                        : stage.state === 'BLOCKED'
                        ? 'bg-rose-500'
                        : 'bg-cyan-400'
                    }`}
                    style={{ width: `${stage.completionPct}%` }}
                  />
                </div>

                {/* Operational Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-xs font-mono">
                  
                  {/* Critical Milestone */}
                  <div className="bg-[#040811] p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      CRITICAL PATH MILESTONE
                    </span>
                    <span className="text-slate-200 font-sans font-medium mt-1 block">
                      {stage.criticalMilestone}
                    </span>
                  </div>

                  {/* Responsible Domain & Owner */}
                  <div className="bg-[#040811] p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      RESPONSIBLE DOMAIN & OWNER
                    </span>
                    <span className="text-cyan-300 font-medium mt-1 block">
                      {stage.responsibleDomain}
                    </span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      {stage.leadOfficer}
                    </span>
                  </div>

                  {/* Target Date & Cycle */}
                  <div className="bg-[#040811] p-3 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                      SCHEDULE & CYCLE DURATION
                    </span>
                    <span className="text-white font-bold mt-1 block">
                      Target: {stage.targetDate}
                    </span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">
                      Duration: {stage.cycleDays} calendar days
                    </span>
                  </div>

                  {/* Blocker or Readiness Status */}
                  <div className={`p-3 rounded-lg border ${
                    stage.blockingIssue
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                      : stage.state === 'COMPLETED'
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                      : 'bg-[#040811] border-slate-800/80 text-slate-400'
                  }`}>
                    <span className="text-[10px] uppercase tracking-wider block font-bold">
                      {stage.blockingIssue ? 'ACTIVE BLOCKER / RISK' : 'GOVERNANCE STATUS'}
                    </span>
                    <span className="font-sans font-medium mt-1 block">
                      {stage.blockingIssue
                        ? stage.blockingIssue
                        : stage.state === 'COMPLETED'
                        ? 'All statutory gate criteria fully verified'
                        : 'Scheduled for downstream gate audit'}
                    </span>
                  </div>

                </div>

                {/* Gate Deliverables Checklist */}
                <div className="mt-3 pt-3 border-t border-slate-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                      STATUTORY GATE DELIVERABLES ({stage.deliverables.filter(d => d.done).length} / {stage.deliverables.length})
                    </span>
                    <span className="text-[11px] font-mono text-cyan-400 hover:underline cursor-pointer" onClick={(e) => { e.stopPropagation(); setActiveStageId(stage.id); setInspectModalOpen(true); }}>
                      View Complete Audit Pack &rarr;
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {stage.deliverables.map((del, dIdx) => (
                      <div
                        key={dIdx}
                        className={`flex items-start gap-2 p-2 rounded border text-xs font-sans ${
                          del.done
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-100'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                          del.done ? 'text-emerald-400' : 'text-slate-600'
                        }`} />
                        <span className="leading-snug">{del.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Vertical Connector Arrow between stages */}
              {idx < CANONICAL_12_STAGES.length - 1 && (
                <div className="flex items-center justify-center py-1">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs font-mono">
                    <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Next Gate Transition</span>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Inspect Stage Gate Audit Modal */}
      {inspectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#090f1d] border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                  STAGE {currentStage.stepNumber} OF 12 GATE AUDIT DOSSIER
                </span>
                <h3 className="text-xl font-display font-bold text-white mt-1">
                  {currentStage.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm font-sans">
              <div className="bg-[#050914] p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  STAGE DESCRIPTION & SCOPE
                </span>
                <p className="text-slate-200 leading-relaxed">
                  {currentStage.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                <div className="bg-[#050914] p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-bold">GOVERNANCE DOMAIN</span>
                  <span className="text-white text-sm block mt-1">{currentStage.responsibleDomain}</span>
                  <span className="text-cyan-300 block mt-0.5">{currentStage.leadOfficer}</span>
                </div>
                <div className="bg-[#050914] p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block font-bold">TARGET SCHEDULE</span>
                  <span className="text-white text-sm block mt-1">{currentStage.targetDate}</span>
                  <span className="text-slate-400 block mt-0.5">{currentStage.cycleDays} Days Target Cycle</span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block font-bold">
                  VERIFIED STATUTORY DELIVERABLES
                </span>
                <div className="space-y-2">
                  {currentStage.deliverables.map((del, dIdx) => (
                    <div
                      key={dIdx}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        del.done
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 ${del.done ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="font-medium">{del.title}</span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        del.done ? 'bg-emerald-950 text-emerald-300' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {del.done ? 'VERIFIED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {currentStage.blockingIssue && (
                <div className="bg-amber-950/30 border border-amber-500/50 p-4 rounded-xl text-amber-200">
                  <div className="flex items-center gap-2 font-mono font-bold text-xs uppercase tracking-wider mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Active Blocker Intervention Required</span>
                  </div>
                  <p className="text-sm font-sans">{currentStage.blockingIssue}</p>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                Close Audit Dossier
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
