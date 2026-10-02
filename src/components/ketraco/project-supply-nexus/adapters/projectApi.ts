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
import { isAtlasDemoModeEnabled } from '../../../../context/TenantContext';

export type ProjectDataSourceState =
  | 'LIVE_AUTHORITATIVE'
  | 'LIVE_NON_AUTHORITATIVE'
  | 'HISTORICAL'
  | 'DERIVED'
  | 'SIMULATED'
  | 'PREDICTED'
  | 'UNAVAILABLE'
  | 'NOT_CONNECTED'
  | 'NOT_VERIFIED';

export interface ProjectTelemetryState {
  status: ProjectDataSourceState | 'LIVE' | 'SIMULATED' | 'DEGRADED' | 'STALE' | 'INITIALIZING';
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

export interface ProjectEnvelope {
  id: string;
  projectCode?: string | null;
  name?: string | null;
  description?: string | null;
  projectType?: string | null;
  category?: string | null;
  lifecycleStage?: string | null;
  status?: string | null;
  owner?: string | null;
  projectManager?: string | null;
  location?: string | null;
  plannedStart?: string | null;
  plannedCompletion?: string | null;
  forecastCompletion?: string | null;
  actualCompletion?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  version?: number | null;
  provenance?: {
    source?: string;
    authority?: string;
    freshness?: string;
    retrievedAt?: string;
    verificationState?: string;
    dataSourceState?: ProjectDataSourceState;
  };
}

export async function fetchProjectTelemetry(): Promise<ProjectTelemetryState> {
  const fallback: ProjectTelemetryState = isAtlasDemoModeEnabled ? {
    status: 'SIMULATED',
    lastUpdated: new Date().toISOString(),
    dataFreshnessSeconds: 0,
    kpis: PRIMARY_KPIS,
    nodes: CONSTELLATION_NODES,
    edges: CONSTELLATION_EDGES,
    exceptions: CRITICAL_EXCEPTIONS,
    stages: PDS_STAGES,
    genome: PROJECT_HEALTH_GENOME,
    materials: SUPPLY_MATERIALS,
    deltas: PROJECT_DELTA_EVENTS,
    layers: MAP_LAYERS
  } : {
    status: 'UNAVAILABLE',
    lastUpdated: '',
    dataFreshnessSeconds: 0,
    kpis: [],
    nodes: [],
    edges: [],
    exceptions: [],
    stages: [],
    genome: [],
    materials: [],
    deltas: [],
    layers: [],
  };

  const candidates = ['/api/project-supply/telemetry', '/api/project-supply-nexus/telemetry'];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(1200)
      });

      if (!res.ok) {
        continue;
      }

      const payload = await res.json();
      const data = payload?.data ?? payload;
      return {
        status: ['UNAVAILABLE', 'NOT_CONNECTED', 'NOT_VERIFIED', 'LIVE_AUTHORITATIVE', 'LIVE_NON_AUTHORITATIVE', 'HISTORICAL', 'DERIVED', 'SIMULATED', 'PREDICTED', 'LIVE', 'DEGRADED', 'STALE', 'INITIALIZING'].includes(data.status)
          ? data.status
          : 'UNAVAILABLE',
        lastUpdated: data.lastUpdated || new Date().toISOString(),
        dataFreshnessSeconds: Number.isFinite(data.dataFreshnessSeconds) ? data.dataFreshnessSeconds : 0,
        kpis: Array.isArray(data.kpis) ? data.kpis : fallback.kpis,
        nodes: Array.isArray(data.nodes) ? data.nodes : fallback.nodes,
        edges: Array.isArray(data.edges) ? data.edges : fallback.edges,
        exceptions: Array.isArray(data.exceptions) ? data.exceptions : fallback.exceptions,
        stages: Array.isArray(data.stages) ? data.stages : fallback.stages,
        genome: Array.isArray(data.genome) ? data.genome : fallback.genome,
        materials: Array.isArray(data.materials) ? data.materials : fallback.materials,
        deltas: Array.isArray(data.deltas) ? data.deltas : fallback.deltas,
        layers: Array.isArray(data.layers) ? data.layers : fallback.layers,
      };
    } catch {
      continue;
    }
  }

  return fallback;
}

export interface ProjectSupplySnapshot {
  projectId: string;
  dataStatus: ProjectDataSourceState | 'LIVE' | 'DEGRADED';
  project?: ProjectEnvelope | null;
  requirements: Array<Record<string, unknown>>;
  supplyPositions: Array<Record<string, unknown>>;
  limitations: string[];
}

export async function fetchProjectSupplySnapshot(projectId: string): Promise<ProjectSupplySnapshot> {
  const selectedProjectId = projectId.trim();
  if (!selectedProjectId) {
    return {
      projectId: '',
      dataStatus: 'UNAVAILABLE',
      project: null,
      requirements: [],
      supplyPositions: [],
      limitations: ['A project ID is required to load project supply evidence.'],
    };
  }

  const fallbackStatus: ProjectDataSourceState = isAtlasDemoModeEnabled ? 'SIMULATED' : 'UNAVAILABLE';
  const fallback: ProjectSupplySnapshot = {
    projectId: selectedProjectId,
    dataStatus: fallbackStatus,
    project: null,
    requirements: [],
    supplyPositions: [],
    limitations: isAtlasDemoModeEnabled
      ? ['Demo mode is active; project-supply data is simulated and non-authoritative.']
      : ['Project supply data is unavailable because the authoritative backend is not connected or verified.'],
  };

  try {
    const res = await fetch(`/api/project-supply/projects/${encodeURIComponent(selectedProjectId)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(1500)
    });
    if (!res.ok) {
      return fallback;
    }

    const payload = await res.json();
    const data = payload?.data ?? payload;
    if (!data || typeof data !== 'object' || data.projectId !== selectedProjectId) {
      return fallback;
    }

    const nextStatus = data.dataStatus && typeof data.dataStatus === 'string'
      ? data.dataStatus
      : fallback.dataStatus;

    return {
      projectId: selectedProjectId,
      dataStatus: ['LIVE_AUTHORITATIVE', 'LIVE_NON_AUTHORITATIVE', 'HISTORICAL', 'DERIVED', 'SIMULATED', 'PREDICTED', 'UNAVAILABLE', 'NOT_CONNECTED', 'NOT_VERIFIED', 'LIVE', 'DEGRADED'].includes(nextStatus)
        ? nextStatus as ProjectSupplySnapshot['dataStatus']
        : fallback.dataStatus,
      project: data.project ?? null,
      requirements: Array.isArray(data.requirements) ? data.requirements : [],
      supplyPositions: Array.isArray(data.supplyPositions) ? data.supplyPositions : [],
      limitations: Array.isArray(data.limitations) ? data.limitations : ['No persisted project requirements are linked to this project.'],
    };
  } catch {
    return fallback;
  }
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
