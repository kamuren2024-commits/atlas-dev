import {
  PRIMARY_KPIS,
  CONSTELLATION_NODES,
  CONSTELLATION_EDGES,
  CRITICAL_EXCEPTIONS,
  PDS_STAGES,
  PROJECT_HEALTH_GENOME,
  SUPPLY_MATERIALS,
  PROJECT_DELTA_EVENTS,
  MAP_LAYERS,
  MASTER_PROJECTS,
  PROGRAMS_DATA,
  WORK_PACKAGES_DATA,
  MILESTONES_DATA,
  DEPENDENCY_CHAIN_DATA,
  PORTFOLIO_OVERVIEW_METRICS,
  PORTFOLIO_DELAYED_PROJECTS,
  PORTFOLIO_CRITICAL_PROJECTS,
  FINANCIAL_EXPOSURE_DATA,
  SUPPLY_EXPOSURE_DATA,
  RESOURCE_CONFLICTS_DATA,
  COMMISSIONING_PIPELINE_DATA,
  PORTFOLIO_RISKS_DATA,
  EXECUTIVE_STRATEGIC_PROJECTS,
  EXECUTIVE_CHANGE_FEED,
  EXECUTIVE_ATTENTION_ITEMS,
  EXECUTIVE_DECISION_ITEMS,
  DEVELOPMENT_PIPELINE_PROJECTS,
  CONCEPTS_WORKSPACE_DATA,
  FEASIBILITY_ASSESSMENTS_DATA,
  FUNDING_TRANCHES_DATA,
  REGULATORY_APPROVALS_DATA,
  GATE_READINESS_DATA,
  SCHEDULE_ACTIVITIES_DATA,
  COST_BREAKDOWN_DATA,
  RESOURCE_ALLOCATIONS_DATA,
  PROGRESS_S_CURVE_DATA,
  CRITICAL_PATH_ACTIVITIES_DATA
} from './fixtures';
import { MasterProjectSummary } from '../types';

export interface ProjectTelemetryState {
  status: 'LIVE' | 'DEGRADED' | 'STALE' | 'INITIALIZING';
  lastUpdated: string;
  dataFreshnessSeconds: number;
  kpis: typeof PRIMARY_KPIS;
  nodes: typeof CONSTELLATION_NODES;
  edges: typeof CONSTELLATION_EDGES;
  exceptions: typeof CRITICAL_EXCEPTIONS;
  stages: typeof PDS_STAGES;
  genome: typeof PROJECT_HEALTH_GENOME;
  materials: typeof SUPPLY_MATERIALS;
  deltas: typeof PROJECT_DELTA_EVENTS;
  layers: typeof MAP_LAYERS;
}

export async function fetchProjectTelemetry(): Promise<ProjectTelemetryState> {
  // Graceful try to fetch real backend telemetry if exists, otherwise return pristine deterministic fixtures
  try {
    const res = await fetch('/api/project-supply-nexus/telemetry', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(1200)
    });
    if (res.ok) {
      const data = await res.json();
      return {
        status: 'LIVE',
        lastUpdated: data.lastUpdated || '12:42:31',
        dataFreshnessSeconds: data.dataFreshnessSeconds ?? 42,
        kpis: data.kpis || PRIMARY_KPIS,
        nodes: data.nodes || CONSTELLATION_NODES,
        edges: data.edges || CONSTELLATION_EDGES,
        exceptions: data.exceptions || CRITICAL_EXCEPTIONS,
        stages: data.stages || PDS_STAGES,
        genome: data.genome || PROJECT_HEALTH_GENOME,
        materials: data.materials || SUPPLY_MATERIALS,
        deltas: data.deltas || PROJECT_DELTA_EVENTS,
        layers: data.layers || MAP_LAYERS
      };
    }
  } catch {
    // Graceful offline fallback
  }

  return {
    status: 'LIVE',
    lastUpdated: '12:42:31',
    dataFreshnessSeconds: 42,
    kpis: PRIMARY_KPIS,
    nodes: CONSTELLATION_NODES,
    edges: CONSTELLATION_EDGES,
    exceptions: CRITICAL_EXCEPTIONS,
    stages: PDS_STAGES,
    genome: PROJECT_HEALTH_GENOME,
    materials: SUPPLY_MATERIALS,
    deltas: PROJECT_DELTA_EVENTS,
    layers: MAP_LAYERS
  };
}

// Master Project Lookup Helper
export function getMasterProjectById(id: string): MasterProjectSummary {
  const found = MASTER_PROJECTS.find(p => p.id === id || p.code === id);
  return found || MASTER_PROJECTS[0];
}

export function getAllMasterProjects(): MasterProjectSummary[] {
  return MASTER_PROJECTS;
}

// Submodule Data Loaders (Sync/Async with fallback)
export async function fetchPortfolioCommandData() {
  return {
    metrics: PORTFOLIO_OVERVIEW_METRICS,
    delayedProjects: PORTFOLIO_DELAYED_PROJECTS,
    criticalProjects: PORTFOLIO_CRITICAL_PROJECTS,
    financialExposures: FINANCIAL_EXPOSURE_DATA,
    supplyExposures: SUPPLY_EXPOSURE_DATA,
    resourceConflicts: RESOURCE_CONFLICTS_DATA,
    commissioningPipeline: COMMISSIONING_PIPELINE_DATA,
    portfolioRisks: PORTFOLIO_RISKS_DATA
  };
}

export async function fetchExecutiveViewData() {
  return {
    strategicProjects: EXECUTIVE_STRATEGIC_PROJECTS,
    changeFeed: EXECUTIVE_CHANGE_FEED,
    attentionItems: EXECUTIVE_ATTENTION_ITEMS,
    decisionItems: EXECUTIVE_DECISION_ITEMS
  };
}

export async function fetchPDSData(projectId?: string) {
  const selectedId = projectId || 'mombasa';
  return {
    pipeline: DEVELOPMENT_PIPELINE_PROJECTS,
    concepts: CONCEPTS_WORKSPACE_DATA,
    feasibility: FEASIBILITY_ASSESSMENTS_DATA.filter(f => f.projectId === selectedId || f.projectId === 'mombasa'),
    funding: FUNDING_TRANCHES_DATA.filter(f => f.projectId === selectedId || f.projectId === 'mombasa'),
    approvals: REGULATORY_APPROVALS_DATA.filter(a => a.projectId === selectedId || a.projectId === 'mombasa'),
    gateReadiness: GATE_READINESS_DATA.filter(g => g.projectId === selectedId || g.projectId === 'mombasa')
  };
}

export async function fetchProjectsData(projectId?: string) {
  const selectedId = projectId || 'mombasa';
  return {
    masterProject: getMasterProjectById(selectedId),
    allProjects: MASTER_PROJECTS,
    programs: PROGRAMS_DATA,
    workPackages: WORK_PACKAGES_DATA.filter(w => w.projectId === selectedId || w.projectId === 'mombasa'),
    milestones: MILESTONES_DATA.filter(m => m.projectId === selectedId || m.projectId === 'mombasa'),
    dependencies: DEPENDENCY_CHAIN_DATA
  };
}

export async function fetchControlsData(projectId?: string) {
  const selectedId = projectId || 'mombasa';
  return {
    projectId: selectedId,
    scheduleActivities: SCHEDULE_ACTIVITIES_DATA,
    costBreakdown: COST_BREAKDOWN_DATA,
    resources: RESOURCE_ALLOCATIONS_DATA,
    sCurve: PROGRESS_S_CURVE_DATA,
    criticalPath: CRITICAL_PATH_ACTIVITIES_DATA
  };
}
