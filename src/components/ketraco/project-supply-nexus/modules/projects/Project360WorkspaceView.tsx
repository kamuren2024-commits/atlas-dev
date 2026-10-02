import React, { useEffect, useState } from 'react';
import { 
  Activity, 
  HardHat, 
  Calendar, 
  GitFork, 
  DollarSign, 
  Zap, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight,
  Layers,
  Clock,
  ExternalLink,
  Download,
  MoreVertical,
  Compass,
  FileText,
  Truck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { UIStateContainer } from '../../shared/UIStateContainer';
import { PersistentProjectHeader } from '../../shared/PersistentProjectHeader';
import { 
  MASTER_PROJECTS,
  MASTER_WORK_PACKAGES,
  MASTER_MILESTONES,
  MASTER_DEPENDENCIES,
  PROJECT_HEALTH_GENOME,
  PROJECT_DELTA_EVENTS
} from '../../adapters/fixtures';
import { fetchProjectSupplySnapshot, getMasterProjectById, type Project360Snapshot, type ProjectSupplySnapshot } from '../../adapters/projectApi';
import { ProjectViewMode, HealthStatus } from '../../types';
import { NexusEntityDrawer, EntityDrawerData } from '../../shared/NexusEntityDrawer';
import { isAtlasDemoModeEnabled } from '../../../../../context/TenantContext';

interface Project360WorkspaceViewProps {
  projectId: string;
  onSelectProject: (id: string) => void;
  onNavigateView: (view: ProjectViewMode) => void;
}

type CommandDomain = 'HEALTH' | 'SCHEDULE' | 'SUPPLY' | 'COST' | 'CONTRACT' | 'RISK' | 'SITE';

interface GenomeDimensionItem {
  id: string;
  name: string;
  score?: number;
  status: 'HEALTHY' | 'WATCH' | 'AT_RISK' | 'CRITICAL' | 'UNKNOWN';
  trend: 'improving' | 'stable' | 'deteriorating' | 'unknown';
  driver: string;
  action: string;
}

export const Project360WorkspaceView: React.FC<Project360WorkspaceViewProps> = ({
  projectId,
  onSelectProject,
  onNavigateView
}) => {
  const currentProject = getMasterProjectById(projectId);
  const unavailableEvidence = 'UNAVAILABLE / NOT CONNECTED / NOT VERIFIED';
  const toEvidenceValue = (value: string | null | undefined, fallback = unavailableEvidence) => {
    const normalized = typeof value === 'string' ? value.trim() : '';
    if (!normalized || ['N/A', 'NA', 'UNKNOWN'].includes(normalized.toUpperCase())) {
      return fallback;
    }
    return value as string;
  };
  const lifecycleStageMap: Record<string, number> = {
    Need: 0,
    Concept: 1,
    Feasibility: 2,
    'Land/Wayleave': 3,
    Funding: 4,
    Approval: 5,
    Procurement: 6,
    Design: 7,
    Construction: 8,
    Commissioning: 9,
    Handover: 10,
    Operations: 11,
  };
  const lifecycleStages = [
    'PROJECT INITIATION',
    'PROJECT DEFINITION',
    'ENGINEERING / DESIGN',
    'PLANNING',
    'PROCUREMENT',
    'CONTRACTING',
    'SUPPLIER DELIVERY',
    'MATERIAL READINESS',
    'LOGISTICS',
    'SITE EXECUTION',
    'TESTING / COMMISSIONING',
    'HANDOVER / CLOSEOUT'
  ];
  const activeLifecycleStageIndex = Math.max(0, Math.min(lifecycleStages.length - 1, lifecycleStageMap[currentProject.stage] ?? 8));
  const [supplySnapshot, setSupplySnapshot] = useState<ProjectSupplySnapshot>({
    projectId,
    dataStatus: 'UNAVAILABLE',
    requirements: [],
    supplyPositions: [],
    limitations: ['Project requirement evidence is not persisted for this tenant scope yet.']
  });
  const projectIdentityFields = [
    { label: 'Project ID / Code', value: toEvidenceValue(currentProject.code) },
    { label: 'Project Name', value: toEvidenceValue(currentProject.name) },
    { label: 'Project Type', value: currentProject.voltage ? `Transmission line & substation (${currentProject.voltage})` : unavailableEvidence },
    { label: 'Project Category', value: currentProject.priority ? currentProject.priority.replace(/_/g, ' ') : unavailableEvidence },
    { label: 'Transmission Corridor / Location', value: toEvidenceValue(currentProject.substations, unavailableEvidence) },
    { label: 'Project Owner', value: unavailableEvidence },
    { label: 'Responsible Department / Unit', value: unavailableEvidence },
    { label: 'Project Manager', value: toEvidenceValue(currentProject.pmName, unavailableEvidence) },
    { label: 'Delivery Status', value: toEvidenceValue(currentProject.status, unavailableEvidence) },
    { label: 'Lifecycle Stage', value: toEvidenceValue(currentProject.stage, unavailableEvidence) },
    { label: 'Overall Health', value: toEvidenceValue(currentProject.status, unavailableEvidence) },
    { label: 'Schedule Status', value: currentProject.delayDays > 0 ? `AT RISK (+${currentProject.delayDays}d slip)` : 'ON PLAN' },
    { label: 'Cost Status', value: toEvidenceValue(currentProject.varianceEac, unavailableEvidence) },
    { label: 'Supply Status', value: supplySnapshot.dataStatus === 'LIVE' || supplySnapshot.dataStatus === 'DERIVED' ? supplySnapshot.dataStatus : supplySnapshot.dataStatus === 'DEGRADED' ? 'DEGRADED' : 'NOT CONNECTED' },
    { label: 'Risk Status', value: currentProject.status === 'CRITICAL' ? 'CRITICAL' : currentProject.status === 'AT_RISK' ? 'AT RISK' : 'MONITORED' },
    { label: 'Physical Progress', value: `${currentProject.progress}%` },
    { label: 'Financial Progress', value: `${currentProject.spentBudget} / ${currentProject.approvedBudget}` },
    { label: 'Planned Completion', value: toEvidenceValue(currentProject.baselineCompletion, unavailableEvidence) },
    { label: 'Forecast Completion', value: toEvidenceValue(currentProject.forecastCompletion, unavailableEvidence) },
    { label: 'Critical-Path Indicator', value: currentProject.delayDays > 0 ? `FLOAT EROSION (+${currentProject.delayDays}d)` : 'STABLE / NO ACTIVE CRITICAL PATH THREAT' },
    { label: 'Last Data Refresh', value: supplySnapshot.dataStatus === 'LIVE_AUTHORITATIVE' ? toEvidenceValue(supplySnapshot.project?.updatedAt) : 'SOURCE TIMESTAMP UNAVAILABLE' },
    { label: 'Data Provenance', value: supplySnapshot.dataStatus === 'LIVE' ? 'Authoritative project-supply stream' : 'Project fixture adapter — not authoritative / not connected' }
  ];
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'GENOME' | 'DELTA' | 'PACKAGES' | 'MILESTONES' | 'DEPENDENCIES'>('OVERVIEW');
  const [selectedEntity, setSelectedEntity] = useState<EntityDrawerData | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSupplySnapshot() {
      const snapshot = await fetchProjectSupplySnapshot(projectId);
      if (!cancelled) {
        setSupplySnapshot(snapshot);
      }
    }

    loadSupplySnapshot();
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  // Filter items for current project
  const packages = MASTER_WORK_PACKAGES.filter((wp) => wp.projectId === currentProject.id);
  const milestones = MASTER_MILESTONES.filter((m) => m.projectId === currentProject.id);
  const dependencies = MASTER_DEPENDENCIES.filter((d) => d.projectId === currentProject.id);

  // 10-Dimension Project Health Genome
  const healthGenome: GenomeDimensionItem[] = [
    {
      id: 'schedule',
      name: 'Schedule',
      score: currentProject.delayDays === 0 ? 94 : 78,
      status: currentProject.delayDays === 0 ? 'HEALTHY' : 'AT_RISK',
      trend: currentProject.delayDays === 0 ? 'stable' : 'deteriorating',
      driver: currentProject.delayDays > 0 ? `Critical path float erosion (+${currentProject.delayDays}d variance)` : 'On baseline timeline',
      action: 'Fast-track transformer low-loader road haulage clearance with KeNHA.'
    },
    {
      id: 'supply',
      name: 'Supply',
      score: 72,
      status: 'AT_RISK',
      trend: 'deteriorating',
      driver: '400kV Transformer T-204 shipment ETA slipped by 14 days at Mumbai dry-dock.',
      action: 'Issue supplier cure notice to TBEA Hengyang and arrange priority berth booking at Mombasa Port.'
    },
    {
      id: 'cost',
      name: 'Cost',
      score: 86,
      status: 'WATCH',
      trend: 'stable',
      driver: `EAC variance of ${currentProject.varianceEac} within approved contingency band.`,
      action: 'Reconcile Lot 2 milestone claims with EPC resident engineer.'
    },
    {
      id: 'contract',
      name: 'Contract',
      score: 91,
      status: 'HEALTHY',
      trend: 'stable',
      driver: 'FIDIC Yellow Book obligations current; dispute adjudication board dormant.',
      action: 'Formalize 60-day Letter of Credit extension with Treasury concurrence.'
    },
    {
      id: 'engineering',
      name: 'Engineering',
      score: 95,
      status: 'HEALTHY',
      trend: 'improving',
      driver: 'All 412 tower foundation designs & Likoni deep piling calculations approved.',
      action: 'Finalize SCADA IEC 61850 protocol test schedule with NCC.'
    },
    {
      id: 'wayleave',
      name: 'Wayleave',
      score: 68,
      status: 'CRITICAL',
      trend: 'deteriorating',
      driver: 'NLC gazettement Section 107 escrow pending for Mariakani private parcels.',
      action: 'Deploy joint legal and valuation taskforce to expedite county land registry signoff.'
    },
    {
      id: 'construction',
      name: 'Construction',
      score: 83,
      status: 'WATCH',
      trend: 'stable',
      driver: 'Foundation civils 68.5% completed; tower erection progressing in section 2.',
      action: 'Mobilize second stringing tensioner gang for Mariakani-Mazeras section.'
    },
    {
      id: 'quality',
      name: 'Quality',
      score: 94,
      status: 'HEALTHY',
      trend: 'stable',
      driver: 'Cube test compression results consistently exceeding Class 30/20 specifications.',
      action: 'Maintain continuous QA/QC witness inspection at batching plants.'
    },
    {
      id: 'stakeholder',
      name: 'Stakeholder',
      score: 88,
      status: 'HEALTHY',
      trend: 'stable',
      driver: 'Community liaison committee active; local casual labor quota met at 42%.',
      action: 'Conduct monthly baraza meeting with Kwale and Kilifi county commissioners.'
    },
    {
      id: 'governance',
      name: 'Governance',
      score: 96,
      status: 'HEALTHY',
      trend: 'stable',
      driver: 'PDS Stage Gate 3 statutory approvals locked; donor audit passed clean.',
      action: 'Prepare quarterly progress submission to Energy & Petroleum Regulatory Authority.'
    }
  ];

  // Command Strip Domains configuration
  const supplyStatusText = supplySnapshot.dataStatus === 'LIVE'
    ? 'Connected'
    : supplySnapshot.dataStatus === 'DERIVED'
      ? 'Derived'
      : supplySnapshot.dataStatus === 'DEGRADED'
        ? 'Degraded'
        : 'Not connected';

  const commandStripDomains: {
    domain: CommandDomain;
    label: string;
    statusText: string;
    state: 'CONNECTED' | 'NOT_CONNECTED';
    health: HealthStatus | 'UNKNOWN';
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  }[] = [
    {
      domain: 'HEALTH',
      label: 'HEALTH',
      statusText: `${currentProject.status} (${currentProject.confidence}%)`,
      state: 'CONNECTED',
      health: currentProject.status,
      icon: Activity,
      onClick: () => setActiveTab('GENOME')
    },
    {
      domain: 'SCHEDULE',
      label: 'SCHEDULE',
      statusText: currentProject.delayDays > 0 ? `+${currentProject.delayDays}d Slip` : 'On Plan',
      state: 'CONNECTED',
      health: currentProject.delayDays > 0 ? 'AT_RISK' : 'HEALTHY',
      icon: Clock,
      onClick: () => onNavigateView('schedule')
    },
    {
      domain: 'SUPPLY',
      label: 'SUPPLY',
      statusText: supplyStatusText,
      state: supplySnapshot.dataStatus === 'LIVE' || supplySnapshot.dataStatus === 'DERIVED' ? 'CONNECTED' : 'NOT_CONNECTED',
      health: supplySnapshot.dataStatus === 'LIVE' ? 'HEALTHY' : supplySnapshot.dataStatus === 'DERIVED' ? 'AT_RISK' : 'UNKNOWN',
      icon: Truck,
      onClick: () => {
        setSelectedEntity({
          type: 'project',
          id: currentProject.id,
          title: `${currentProject.name} — Supply Domain`,
          code: 'DOMAIN-SUPPLY',
          status: supplySnapshot.dataStatus === 'LIVE' || supplySnapshot.dataStatus === 'DERIVED' ? 'CONNECTED' : 'NOT_CONNECTED',
          subtitle: 'Supply Chain & Material Telemetry Integration',
          details: [
            { label: 'Integration Status', value: supplyStatusText },
            { label: 'Requirement Evidence', value: `${supplySnapshot.requirements.length} linked requirements` },
            { label: 'Authoritative Stream', value: supplySnapshot.limitations[0] || 'Atlas project-supply router is authoritative for this project.' }
          ],
          risks: supplySnapshot.limitations.length > 0 ? supplySnapshot.limitations : ['Project requirement evidence is not yet available for this project.']
        });
        setDrawerOpen(true);
      }
    },
    {
      domain: 'COST',
      label: 'COST',
      statusText: currentProject.varianceEac,
      state: 'CONNECTED',
      health: currentProject.varianceEac.includes('+') ? 'AT_RISK' : 'HEALTHY',
      icon: DollarSign,
      onClick: () => onNavigateView('cost')
    },
    {
      domain: 'CONTRACT',
      label: 'CONTRACT',
      statusText: 'NOT CONNECTED',
      state: 'NOT_CONNECTED',
      health: 'UNKNOWN',
      icon: FileText,
      onClick: () => {
        setSelectedEntity({
          type: 'project',
          id: currentProject.id,
          title: `${currentProject.name} — Commercial Contract Domain`,
          code: 'DOMAIN-CONTRACT',
          status: 'NOT_CONNECTED',
          subtitle: 'FIDIC Contract & Dispute Adjudication Bridge',
          details: [
            { label: 'Integration Status', value: 'NOT CONNECTED (Part 1B frontend scope)' },
            { label: 'Primary EPC Agreement', value: currentProject.epcContractor },
            { label: 'Contract Model', value: 'FIDIC Plant & Design-Build (Yellow Book)' }
          ]
        });
        setDrawerOpen(true);
      }
    },
    {
      domain: 'RISK',
      label: 'RISK',
      statusText: 'NOT CONNECTED',
      state: 'NOT_CONNECTED',
      health: 'UNKNOWN',
      icon: AlertOctagon,
      onClick: () => {
        setSelectedEntity({
          type: 'project',
          id: currentProject.id,
          title: `${currentProject.name} — Risk Register Domain`,
          code: 'DOMAIN-RISK',
          status: 'NOT_CONNECTED',
          subtitle: 'Enterprise Risk Management (ERM) Sync',
          details: [
            { label: 'Integration Status', value: 'NOT CONNECTED (Part 1B frontend scope)' },
            { label: 'Active Risks In Fixtures', value: '3 Critical / 2 Moderate' }
          ]
        });
        setDrawerOpen(true);
      }
    },
    {
      domain: 'SITE',
      label: 'SITE',
      statusText: 'NOT CONNECTED',
      state: 'NOT_CONNECTED',
      health: 'UNKNOWN',
      icon: HardHat,
      onClick: () => {
        setSelectedEntity({
          type: 'project',
          id: currentProject.id,
          title: `${currentProject.name} — Site Telemetry & GIS`,
          code: 'DOMAIN-SITE',
          status: 'NOT_CONNECTED',
          subtitle: 'Drone photogrammetry and field sensor interties',
          details: [
            { label: 'Integration Status', value: 'NOT CONNECTED (Phase 2 Delivery scope)' },
            { label: 'Corridor Extent', value: `${currentProject.lengthKm} km transmission right-of-way` }
          ]
        });
        setDrawerOpen(true);
      }
    }
  ];

  const handleExport = () => {
    const summary = `KETRACO PROJECT 360 REPORT\n=========================\nProject: ${currentProject.name} (${currentProject.code})\nPhase: ${currentProject.stage}\nDelivery Confidence: ${currentProject.confidence}%\nHealth: ${currentProject.status}\nTarget COD: ${currentProject.forecastCompletion}\nOwner: ${currentProject.pmName}\nLead Engineer: ${currentProject.leadEngineer}\nApproved Budget: ${currentProject.approvedBudget}\nEAC: ${currentProject.eacBudget}\nVariance: ${currentProject.varianceEac}\nGenerated: ${new Date().toISOString()}`;
    const blob = new Blob([summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentProject.code}_Project360_Brief.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Project brief exported successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleOpenEntity = (data: EntityDrawerData) => {
    setSelectedEntity(data);
    setDrawerOpen(true);
  };

  if (!isAtlasDemoModeEnabled) {
    const project = supplySnapshot.project;
    const authoritative = project?.provenance?.authority === 'AUTHORITATIVE' &&
      project.provenance.dataSourceState === 'LIVE_AUTHORITATIVE';
    const unavailable = 'UNAVAILABLE / NOT CONNECTED / NOT VERIFIED';
    const identity = [
      ['Project ID', authoritative ? project?.id : unavailable],
      ['Project Code', authoritative ? project?.projectCode : unavailable],
      ['Project Name', authoritative ? project?.name : unavailable],
      ['Project Type', authoritative ? project?.projectType : unavailable],
      ['Category', authoritative ? project?.category : unavailable],
      ['Status', authoritative ? project?.status : unavailable],
      ['Lifecycle Stage', authoritative ? project?.lifecycleStage : unavailable],
      ['Owner', authoritative ? project?.owner : unavailable],
      ['Project Manager', authoritative ? project?.projectManager : unavailable],
      ['Location / Corridor', authoritative ? project?.location : unavailable],
      ['Planned Start', authoritative ? project?.plannedStart : unavailable],
      ['Planned Completion', authoritative ? project?.plannedCompletion : unavailable],
      ['Forecast Completion', authoritative ? project?.forecastCompletion : unavailable],
      ['Actual Completion', authoritative ? project?.actualCompletion : unavailable],
      ['Version', authoritative ? String(project?.version ?? unavailable) : unavailable],
    ];
    const domainStatuses = Object.entries(supplySnapshot.snapshot?.domains ?? {}) as Array<
      [string, Project360Snapshot['domains'][string]]
    >;
    return (
      <UIStateContainer moduleName="Project 360 Workspace">
        <div className="space-y-4">
          <div className="rounded-lg border border-amber-500/40 bg-amber-950/20 p-4">
            <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-300">
              Project 360 authoritative mode
            </div>
            <p className="mt-2 text-sm text-slate-200">
              Fixture project metrics are disabled outside demo mode. Only project records explicitly verified as LIVE_AUTHORITATIVE are shown as operational truth.
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Project source: {authoritative ? project?.provenance?.source : 'NOT CONNECTED'} · Realtime: NOT CONNECTED
            </p>
          </div>

          <section className="rounded-lg border border-slate-800 bg-[#080d17] p-4">
            <h2 className="text-sm font-bold text-slate-100">Project identity & lifecycle</h2>
            <div className="mt-3 grid grid-cols-1 gap-2.5 md:grid-cols-2 xl:grid-cols-4">
              {identity.map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-800 bg-slate-950/50 p-2.5">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400 font-mono">{label}</div>
                  <div className="mt-1 break-words text-xs font-medium text-slate-200">{value || unavailable}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-slate-400 font-mono">
              Authority: {authoritative ? 'LIVE_AUTHORITATIVE' : 'NOT_CONNECTED'} ·
              Source updated: {project?.updatedAt ?? 'UNAVAILABLE'} ·
              Retrieved: {project?.provenance?.retrievedAt ?? 'UNAVAILABLE'}
            </div>
          </section>

          <section className="rounded-lg border border-slate-800 bg-[#080d17] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-slate-100">Execution domains & health</h2>
              <span className="rounded border border-slate-700 px-2 py-1 text-xs font-mono text-slate-300">
                Overall health: {supplySnapshot.snapshot?.health.overall ?? 'UNKNOWN'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {domainStatuses.length > 0 ? domainStatuses.map(([domain, status]) => (
                <div key={domain} className="rounded border border-slate-800 bg-slate-950/50 p-3">
                  <div className="text-[10px] font-mono uppercase tracking-wide text-slate-400">{domain}</div>
                  <div className="mt-1 text-xs font-bold text-amber-300">{status.state}</div>
                  <div className="mt-1 break-words text-[10px] text-slate-500">Source: {status.source}</div>
                  <div className="text-[10px] text-slate-500">Source updated: {status.sourceUpdatedAt ?? 'UNAVAILABLE'}</div>
                </div>
              )) : (
                <div className="text-xs text-slate-400">Domain snapshot: UNAVAILABLE / NOT CONNECTED / NOT VERIFIED.</div>
              )}
            </div>
            <div className="mt-3 text-xs text-slate-400 font-mono">
              Snapshot generated: {supplySnapshot.snapshot?.freshness.snapshotGeneratedAt ?? 'UNAVAILABLE'} ·
              Health derivation: UNKNOWN — no connected authoritative domain signals.
            </div>
          </section>
        </div>
      </UIStateContainer>
    );
  }

  return (
    <UIStateContainer moduleName="Project 360 Workspace">
      <div className="space-y-4">
        <div className="rounded border border-amber-500/40 bg-amber-950/20 px-3 py-2 text-xs font-mono text-amber-200">
          SIMULATED — Project identity, health metrics, schedule, and domain cards below are demo fixtures, not authoritative KETRACO records.
        </div>
        {/* Persistent Project Header */}
        <PersistentProjectHeader
          currentProject={currentProject}
          onSelectProject={onSelectProject}
          activeView="project-360"
          onNavigateView={onNavigateView}
        />

        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-mono">Project identity & lifecycle position</div>
              <h2 className="text-sm font-bold text-slate-100 mt-1">Project 360 operating identity</h2>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
              <span className="px-2 py-1 rounded border border-cyan-500/40 bg-cyan-500/10 text-cyan-300">Lifecycle stage: {toEvidenceValue(currentProject.stage, unavailableEvidence)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2.5">
            {projectIdentityFields.map((field) => (
              <div key={field.label} className="rounded-lg border border-slate-800 bg-slate-950/50 p-2.5">
                <div className="text-[10px] uppercase tracking-wide text-slate-400 font-mono">{field.label}</div>
                <div className="mt-1 text-xs text-slate-200 font-medium break-words">{field.value}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-slate-400 font-mono">
              <span>Project lifecycle</span>
              <span>Current position: {lifecycleStages[activeLifecycleStageIndex]}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {lifecycleStages.map((stage, index) => (
                <div
                  key={stage}
                  className={`rounded border px-2 py-1.5 text-[9px] font-mono uppercase tracking-wide text-left ${index === activeLifecycleStageIndex
                    ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-200'
                    : index < activeLifecycleStageIndex
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-slate-700 bg-slate-900/70 text-slate-400'}`}
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 02 — Project 360 Primary Transmission Operating Header */}
        <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-bold border border-cyan-500/30">
                  {currentProject.code}
                </span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300">Phase: <strong className="text-white">{currentProject.stage}</strong></span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300">Program: <strong className="text-purple-300">Coast Regional Backbone</strong></span>
                <span className="text-slate-400">|</span>
                <span className="text-slate-300">Voltage: <strong className="text-cyan-300">{currentProject.voltage}</strong></span>
              </div>

              <h1 className="text-xl font-bold text-slate-100 tracking-tight flex items-center gap-2.5">
                <span>{currentProject.name}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-mono border ${
                  currentProject.status === 'HEALTHY' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                  currentProject.status === 'AT_RISK' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                  'text-rose-400 bg-rose-500/10 border-rose-500/30'
                }`}>
                  {currentProject.status}
                </span>
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                <span>Owner: <strong className="text-slate-200">{currentProject.pmName}</strong></span>
                <span>•</span>
                <span>Lead Engineer: <strong className="text-slate-200">{currentProject.leadEngineer}</strong></span>
                <span>•</span>
                <span>EPC: <strong className="text-slate-200">{currentProject.epcContractor}</strong></span>
                <span>•</span>
                <span>Target COD: <strong className="text-cyan-300">{currentProject.baselineCompletion}</strong></span>
                <span>•</span>
                <span>Current Forecast: <strong className={currentProject.delayDays > 0 ? 'text-amber-400' : 'text-emerald-400'}>{currentProject.forecastCompletion}</strong></span>
                <span>•</span>
                <span>Source Timestamp: <strong className="text-amber-300">UNAVAILABLE — DEMO FIXTURE</strong></span>
              </div>
            </div>

            {/* Contextual Action Bar */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <button
                onClick={() => onNavigateView('project-command')}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 flex items-center gap-1.5 transition-colors"
                title="Open Global Command Center"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Command</span>
              </button>

              <button
                onClick={() => onNavigateView('dependencies')}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-purple-300 border border-slate-700 hover:border-purple-500/50 flex items-center gap-1.5 transition-colors"
                title="Open Interactive Dependency Graph"
              >
                <GitFork className="w-3.5 h-3.5 text-purple-400" />
                <span>View Graph</span>
              </button>

              <button
                onClick={() => onNavigateView('schedule')}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-slate-500 flex items-center gap-1.5 transition-colors"
                title="Open Schedule Timeline"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>View Timeline</span>
              </button>

              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-colors"
                title="Export Project 360 Summary Report"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>

              <button
                onClick={() => handleOpenEntity({
                  type: 'project',
                  id: currentProject.id,
                  title: currentProject.name,
                  code: currentProject.code,
                  status: currentProject.status,
                  subtitle: `Corridor ${currentProject.code} • ${currentProject.voltage} • ${currentProject.lengthKm} km`,
                  metrics: [
                    { label: 'Confidence', value: `${currentProject.confidence}%`, color: 'text-cyan-400' },
                    { label: 'Progress', value: `${currentProject.progress}%`, color: 'text-white' },
                    { label: 'Delay', value: `${currentProject.delayDays}d`, color: currentProject.delayDays > 0 ? 'text-amber-400' : 'text-emerald-400' }
                  ],
                  details: [
                    { label: 'Substations', value: currentProject.substations },
                    { label: 'EPC Contractor', value: currentProject.epcContractor },
                    { label: 'Approved Budget', value: currentProject.approvedBudget },
                    { label: 'EAC Forecast', value: currentProject.eacBudget },
                    { label: 'Variance', value: currentProject.varianceEac },
                    { label: 'Target COD', value: currentProject.baselineCompletion },
                    { label: 'Forecast COD', value: currentProject.forecastCompletion }
                  ],
                  risks: [
                    'Transformer T-204 shipment ETA slipped by 14 days at Mumbai dry-dock.',
                    'NLC Section 107 gazettement escrow pending for Mariakani substation buffer parcel.'
                  ],
                  recommendations: [
                    'Accelerate customs bonded clearance at Berth 4 Mombasa Port.',
                    'Deploy second stringing puller-tensioner gang.'
                  ]
                })}
                className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                title="More Project Metadata"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {exportNotice && (
            <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center justify-between">
              <span>{exportNotice}</span>
              <button onClick={() => setExportNotice(null)} className="text-emerald-400 hover:underline">Dismiss</button>
            </div>
          )}

          {/* 02 — Command Strip: HEALTH | SCHEDULE | SUPPLY | COST | CONTRACT | RISK | SITE */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
              Operating Domains & Telemetry Bridges:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 font-mono text-xs">
              {commandStripDomains.map((dom) => {
                const Icon = dom.icon;
                const isConnected = dom.state === 'CONNECTED';

                return (
                  <button
                    key={dom.domain}
                    onClick={dom.onClick}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      isConnected
                        ? 'bg-slate-900/80 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800/80'
                        : 'bg-slate-950/50 border-slate-800/60 opacity-70 hover:opacity-100 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-slate-300 flex items-center gap-1.5">
                        <Icon className={`w-3 h-3 ${isConnected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        {dom.label}
                      </span>
                      <span className={`text-[9px] px-1 rounded uppercase ${
                        dom.health === 'HEALTHY' ? 'text-emerald-400 bg-emerald-500/10' :
                        dom.health === 'AT_RISK' ? 'text-amber-400 bg-amber-500/10' :
                        dom.health === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10' :
                        'text-slate-400 bg-slate-800'
                      }`}>
                        {dom.health}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold truncate text-slate-100">
                      {dom.statusText}
                    </div>

                    <div className="text-[9px] text-slate-400 mt-0.5 flex items-center justify-between">
                      <span>{isConnected ? 'LIVE FEED' : 'NOT CONNECTED'}</span>
                      <ArrowRight className="w-2.5 h-2.5 text-slate-400" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* View Tabs Selector */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#080d17] p-2 rounded-lg border border-slate-800 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'OVERVIEW' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Operational Overview
            </button>
            <button
              onClick={() => setActiveTab('GENOME')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'GENOME' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Health Genome (10 Dimensions)
            </button>
            <button
              onClick={() => setActiveTab('DELTA')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'DELTA' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Project Delta & Confidence
            </button>
            <button
              onClick={() => setActiveTab('PACKAGES')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'PACKAGES' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              WBS Work Packages ({packages.length})
            </button>
            <button
              onClick={() => setActiveTab('MILESTONES')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'MILESTONES' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Contract Milestones ({milestones.length})
            </button>
            <button
              onClick={() => setActiveTab('DEPENDENCIES')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === 'DEPENDENCIES' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dependencies ({dependencies.length})
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span>Confidence Index:</span>
            <span className="text-cyan-300 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
              {currentProject.confidence}% (Probabilistic Delivery)
            </span>
          </div>
        </div>

        {/* TAB 1: OPERATIONAL OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-4">
            {/* Top 4 Operational Status Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Physical Progress</span>
                <span className="text-white font-bold text-lg">{currentProject.progress}%</span>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${currentProject.progress}%` }} />
                </div>
              </div>

              <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Financial Position</span>
                <span className="text-cyan-300 font-bold text-lg">{currentProject.spentBudget}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Of {currentProject.approvedBudget} Approved</span>
              </div>

              <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Commercial COD Forecast</span>
                <span className="text-white font-bold text-lg">{currentProject.forecastCompletion}</span>
                <span className={`text-[10px] block font-bold mt-0.5 ${currentProject.delayDays > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {currentProject.delayDays > 0 ? `+${currentProject.delayDays}d Schedule Variance` : 'On Baseline Target'}
                </span>
              </div>

              <div className="p-3 bg-[#080d17] rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Current Phase Gate</span>
                <span className="text-purple-300 font-bold text-lg">{currentProject.stage}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">PDS Gate 3 Cleared</span>
              </div>
            </div>

            {/* High-density Operational Matrix */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs font-mono">
              {/* Critical Milestones & Delivery Forecast */}
              <div className="bg-[#080d17] p-3.5 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    Critical Milestones & Forecast
                  </h3>
                  <button onClick={() => onNavigateView('milestones')} className="text-[10px] text-cyan-400 hover:underline">
                    View All
                  </button>
                </div>

                <div className="space-y-2">
                  {milestones.slice(0, 4).map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleOpenEntity({
                        type: 'milestone',
                        id: m.id,
                        title: m.name,
                        code: m.code,
                        status: m.status,
                        subtitle: `Owner: ${m.owner} • Baseline: ${m.baseline}`,
                        metrics: [
                          { label: 'Variance', value: `${m.varianceDays}d`, color: m.varianceDays < 0 ? 'text-rose-400' : 'text-emerald-400' },
                          { label: 'Confidence', value: `${m.confidence}%`, color: 'text-cyan-400' },
                          { label: 'Critical', value: m.isCritical ? 'YES' : 'NO', color: m.isCritical ? 'text-rose-400' : 'text-slate-400' }
                        ],
                        details: [
                          { label: 'Planned Date', value: m.planned },
                          { label: 'Forecast Date', value: m.forecast },
                          { label: 'Predecessor', value: m.predecessor },
                          { label: 'Successor', value: m.successor }
                        ],
                        relatedView: 'milestones'
                      })}
                      className="p-2 bg-slate-900/60 rounded border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-200 truncate">{m.name}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                          m.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10' :
                          m.status === 'ON_TRACK' ? 'text-cyan-400 bg-cyan-500/10' :
                          'text-rose-400 bg-rose-500/10'
                        }`}>
                          {m.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
                        <span>Target: {m.forecast}</span>
                        <span className={m.varianceDays < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {m.varianceDays < 0 ? `${m.varianceDays}d` : '0d'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Major Risks & Open Issues */}
              <div className="bg-[#080d17] p-3.5 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    Major Risks & Open Issues
                  </h3>
                  <span className="text-[10px] text-amber-400 font-bold">2 High / 1 Critical</span>
                </div>

                <div className="space-y-2">
                  <div className="p-2 bg-rose-950/20 rounded border border-rose-500/30">
                    <div className="flex items-center justify-between text-rose-300 font-bold text-[11px]">
                      <span>RSK-01: Autotransformer T-204 Shipping Lag</span>
                      <span className="text-[9px] px-1 rounded bg-rose-500/20 text-rose-300">CRITICAL</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1">
                      Factory QC reinspection in Mumbai dry dock slipped low-loader site rigging window by 14 days.
                    </p>
                    <div className="text-[10px] text-cyan-400 mt-1">Mitigation: KeNHA low-loader express escort.</div>
                  </div>

                  <div className="p-2 bg-amber-950/20 rounded border border-amber-500/30">
                    <div className="flex items-center justify-between text-amber-300 font-bold text-[11px]">
                      <span>ISS-04: Mariakani Land Escrow Deposit</span>
                      <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">OPEN</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1">
                      National Land Commission valuation review pending Treasury exchequer disbursement release.
                    </p>
                    <div className="text-[10px] text-cyan-400 mt-1">Owner: Senior Legal Officer (Wayleave).</div>
                  </div>
                </div>
              </div>

              {/* Active Decisions & Recent Events */}
              <div className="bg-[#080d17] p-3.5 rounded-lg border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Active Decisions & Governance
                  </h3>
                  <button onClick={() => setActiveTab('DELTA')} className="text-[10px] text-cyan-400 hover:underline">
                    View Delta
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <div className="flex items-center justify-between text-slate-200 font-semibold text-[11px]">
                      <span>DEC-09: 2nd Conductor Gang Mobilization</span>
                      <span className="text-[9px] px-1 rounded bg-emerald-500/20 text-emerald-400">APPROVED</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Project Steering Committee approved KES 34M resequencing allocation to recover 10 days of tension stringing float.
                    </p>
                  </div>

                  <div className="p-2 bg-slate-900/60 rounded border border-slate-800">
                    <div className="flex items-center justify-between text-slate-200 font-semibold text-[11px]">
                      <span>DEC-11: SCADA Fiber Optic Patching Protocol</span>
                      <span className="text-[9px] px-1 rounded bg-cyan-500/20 text-cyan-400">PENDING BOARD</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Tele-protection protocol intertie with NCC Nairobi scheduled for technical committee signoff on Friday.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Controls Launchpad Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div
                onClick={() => onNavigateView('schedule')}
                className="p-3 bg-[#080d17] hover:bg-slate-900/80 rounded-lg border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all text-xs space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>Schedule Control & Gantt</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Critical path timeline, activity durations, early/late dates, and baseline float analysis.
                </p>
              </div>

              <div
                onClick={() => onNavigateView('cost')}
                className="p-3 bg-[#080d17] hover:bg-slate-900/80 rounded-lg border border-slate-800 hover:border-purple-500/40 cursor-pointer transition-all text-xs space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-300 font-semibold">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                    <span>Cost CBS & Cashflow</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Cost Breakdown Structure, commitments, actual invoices, variances, and S-curve cashflow.
                </p>
              </div>

              <div
                onClick={() => onNavigateView('critical-path')}
                className="p-3 bg-[#080d17] hover:bg-slate-900/80 rounded-lg border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all text-xs space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-300 font-semibold">
                    <Zap className="w-4 h-4 text-rose-400" />
                    <span>Critical Path Command</span>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Zero-float driving path sequence, threat matrix, delay simulation and crash recovery options.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PROJECT HEALTH GENOME (10 Dimensions) */}
        {activeTab === 'GENOME' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  10-Dimensional Project Health Genome
                </h2>
                <p className="text-[11px] text-slate-400">
                  Holistic transmission asset health audit across statutory, engineering, commercial, and field dimensions.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase">Overall Composite Score</span>
                <span className="text-base font-bold text-cyan-400">{currentProject.confidence}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {healthGenome.map((dim) => (
                <div
                  key={dim.id}
                  className="p-3 bg-slate-900/70 rounded-lg border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{dim.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                        dim.status === 'HEALTHY' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                        dim.status === 'WATCH' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                        dim.status === 'AT_RISK' ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                        dim.status === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' :
                        'text-slate-400 bg-slate-800 border-slate-700'
                      }`}>
                        {dim.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 capitalize">Trend: {dim.trend}</span>
                      {dim.score !== undefined && (
                        <span className={`text-sm font-bold ${
                          dim.score >= 85 ? 'text-emerald-400' :
                          dim.score >= 70 ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {dim.score}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-300">
                    <span className="text-slate-400">Primary Driver: </span>
                    {dim.driver}
                  </div>

                  <div className="text-[10px] text-cyan-300 bg-slate-950/60 p-1.5 rounded border border-slate-800/80">
                    <strong className="text-cyan-400">Prescribed Action: </strong>
                    {dim.action}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PROJECT DELTA & WHY CONFIDENCE CHANGED */}
        {activeTab === 'DELTA' && (
          <div className="space-y-4 font-mono text-xs">
            {/* Why did project confidence change? */}
            <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 p-4 rounded-lg border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>Why did project confidence change? (Predictive Operations Explanation)</span>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Project delivery confidence adjusted from <strong className="text-white">88.4%</strong> to <strong className="text-amber-300">81.7% (-6.7%)</strong> following factory reinspection notice on 400kV Transformer T-204 in Mumbai dry-dock, creating a 14-day delay on plinth rigging. Concurrently, Section 107 wayleave escrow disbursement at Mariakani reached critical path threshold. Total project float has been exhausted, converting Conductor Stringing Section 2 and Substation Cold Testing into direct critical path dependencies.
              </p>
              <div className="flex items-center gap-3 text-[11px] text-purple-300 pt-1">
                <span>Confidence Recovery Opportunity: <strong>+5.2%</strong> upon KeNHA heavy haul corridor permit signoff.</span>
              </div>
            </div>

            {/* Delta Chronological Timeline */}
            <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Recent Operational Events & Telemetry Deltas
              </h3>

              <div className="space-y-3 pl-2 border-l border-slate-800">
                {PROJECT_DELTA_EVENTS.map((event) => (
                  <div key={event.id} className="relative pl-4">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-4 ring-[#080d17]" />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200">{event.title}</span>
                      <span className="text-slate-400">{event.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {event.description}
                    </p>
                    {event.badge && (
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] bg-slate-900 border border-slate-800 text-cyan-300 uppercase">
                        {event.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WBS WORK PACKAGES */}
        {activeTab === 'PACKAGES' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                  Work Breakdown Structure (WBS) Packages
                </h3>
                <p className="text-xs text-slate-400">Click any work package to open comprehensive detail drawer.</p>
              </div>
              <button
                onClick={() => onNavigateView('work-packages')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Dedicated WBS Command
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {packages.map((wp) => (
                <div
                  key={wp.id}
                  onClick={() => handleOpenEntity({
                    type: 'work-package',
                    id: wp.id,
                    title: wp.title || wp.name || '',
                    code: wp.code,
                    status: wp.status,
                    subtitle: `Owner: ${wp.owner} • Contractor: ${wp.contractor}`,
                    metrics: [
                      { label: 'Progress', value: `${wp.progress}%`, color: 'text-cyan-400' },
                      { label: 'Cost Budget', value: wp.cost, color: 'text-white' },
                      { label: 'Actual Incurred', value: wp.actualCost, color: 'text-purple-300' }
                    ],
                    details: [
                      { label: 'Scope Description', value: wp.scope },
                      { label: 'Start Date', value: wp.startDate },
                      { label: 'Completion Date', value: wp.endDate },
                      { label: 'Contractor', value: wp.contractor },
                      { label: 'Materials', value: wp.materials.join(', ') }
                    ],
                    risks: wp.risks,
                    dependencies: wp.dependencies,
                    relatedView: 'work-packages'
                  })}
                  className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded border border-slate-800 hover:border-slate-700 cursor-pointer text-xs flex flex-wrap items-center justify-between gap-2 transition-colors font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-cyan-400 font-bold">{wp.code}</span>
                    <span className="font-semibold text-slate-200">{wp.title || wp.name}</span>
                    <span className="text-[10px] text-slate-400">({wp.owner})</span>
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">Progress:</span>
                      <span className="text-white font-bold">{wp.progress}%</span>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                      wp.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      wp.status === 'IN_PROGRESS' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                      'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    }`}>
                      {wp.status.replace('_', ' ')}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: MILESTONES */}
        {activeTab === 'MILESTONES' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                  Key Contractual Milestones
                </h3>
                <p className="text-xs text-slate-400">Click any milestone to open detail drawer.</p>
              </div>
              <button
                onClick={() => onNavigateView('milestones')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Dedicated Milestones Workspace
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  onClick={() => handleOpenEntity({
                    type: 'milestone',
                    id: m.id,
                    title: m.name,
                    code: m.code,
                    status: m.status,
                    subtitle: `Owner: ${m.owner} • Baseline: ${m.baseline}`,
                    metrics: [
                      { label: 'Variance', value: `${m.varianceDays}d`, color: m.varianceDays < 0 ? 'text-rose-400' : 'text-emerald-400' },
                      { label: 'Confidence', value: `${m.confidence}%`, color: 'text-cyan-400' },
                      { label: 'Critical Path', value: m.isCritical ? 'CRITICAL' : 'FLOAT AVAILABLE', color: m.isCritical ? 'text-rose-400' : 'text-slate-400' }
                    ],
                    details: [
                      { label: 'Baseline Date', value: m.baseline },
                      { label: 'Planned Date', value: m.planned },
                      { label: 'Forecast Date', value: m.forecast },
                      { label: 'Predecessor', value: m.predecessor },
                      { label: 'Successor', value: m.successor }
                    ],
                    relatedView: 'milestones'
                  })}
                  className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded border border-slate-800 hover:border-slate-700 cursor-pointer text-xs flex flex-wrap items-center justify-between gap-2 transition-colors font-mono"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{m.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Code: {m.code} • Owner: {m.owner} • Forecast: {m.forecast}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-xs">
                    <span className={m.varianceDays < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                      {m.varianceDays < 0 ? `${m.varianceDays}d Slip` : 'On Plan'}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                      m.status === 'COMPLETED' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
                      m.status === 'ON_TRACK' ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' :
                      'text-rose-400 bg-rose-500/10 border-rose-500/30'
                    }`}>
                      {m.status}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DEPENDENCIES */}
        {activeTab === 'DEPENDENCIES' && (
          <div className="bg-[#080d17] p-4 rounded-lg border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                  Critical Predecessors & Interlocks
                </h3>
                <p className="text-xs text-slate-400">Click any dependency link to view impact chain.</p>
              </div>
              <button
                onClick={() => onNavigateView('dependencies')}
                className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Dedicated Network Graph
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              {dependencies.map((d) => (
                <div
                  key={d.id}
                  onClick={() => handleOpenEntity({
                    type: 'dependency',
                    id: d.id,
                    title: `${d.predecessorName} ➔ ${d.successorName}`,
                    code: `DEP-${d.id}`,
                    status: d.status,
                    subtitle: `Precedence Type: [${d.type}] • Lag: ${d.lagDays} days • Criticality: ${d.criticality}`,
                    details: [
                      { label: 'Predecessor Task', value: d.predecessorName },
                      { label: 'Successor Task', value: d.successorName },
                      { label: 'Relationship Type', value: d.type === 'FS' ? 'Finish-to-Start (FS)' : d.type === 'SS' ? 'Start-to-Start (SS)' : 'Finish-to-Finish (FF)' },
                      { label: 'Lead / Lag Days', value: `${d.lagDays} days` },
                      { label: 'Scope Justification', value: d.description }
                    ],
                    risks: [d.description],
                    relatedView: 'dependencies'
                  })}
                  className="p-3 bg-slate-900/60 hover:bg-slate-800/80 rounded border border-slate-800 hover:border-slate-700 cursor-pointer text-xs flex flex-wrap items-center justify-between gap-2 transition-colors font-mono"
                >
                  <div>
                    <div className="text-slate-200">
                      <strong className="text-cyan-400">{d.predecessorName}</strong>
                      <span className="text-slate-400 mx-2">➔ [{d.type}] ➔</span>
                      <strong className="text-purple-400">{d.successorName}</strong>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{d.description}</div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] uppercase ${
                      d.criticality === 'CRITICAL' ? 'text-rose-400 bg-rose-500/10' : 'text-amber-400 bg-amber-500/10'
                    }`}>
                      {d.criticality}
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[9px] uppercase border ${
                      d.status === 'RESOLVED' ? 'text-emerald-400 border-emerald-500/30' :
                      d.status === 'BLOCKED' ? 'text-rose-400 border-rose-500/30' : 'text-cyan-400 border-cyan-500/30'
                    }`}>
                      {d.status}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shared Entity Drawer */}
      <NexusEntityDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        entity={selectedEntity}
        onNavigateView={onNavigateView}
        onSelectProject={onSelectProject}
      />
    </UIStateContainer>
  );
};
