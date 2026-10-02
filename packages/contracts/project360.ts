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

export interface ProjectProvenance {
  source: string;
  authority: 'AUTHORITATIVE' | 'NON_AUTHORITATIVE' | 'DERIVED' | 'SIMULATED' | 'PREDICTED' | 'UNAVAILABLE';
  freshness: 'FRESH' | 'STALE' | 'UNKNOWN';
  retrievedAt: string;
  verificationState: 'VERIFIED' | 'NOT_VERIFIED' | 'UNAVAILABLE';
  dataSourceState: ProjectDataSourceState;
}

export interface ProjectRecord {
  id: string;
  tenantId: string;
  projectCode: string | null;
  name: string | null;
  description: string | null;
  projectType: string | null;
  category: string | null;
  lifecycleStage: string | null;
  status: string | null;
  owner: string | null;
  projectManager: string | null;
  location: string | null;
  plannedStart: string | null;
  plannedCompletion: string | null;
  forecastCompletion: string | null;
  actualCompletion: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  version: number | null;
  provenance: ProjectProvenance;
}

export type Project360HealthState =
  | 'HEALTHY'
  | 'WATCH'
  | 'AT_RISK'
  | 'CRITICAL'
  | 'UNKNOWN'
  | 'UNAVAILABLE'
  | 'NOT_CONNECTED'
  | 'NOT_VERIFIED';

export interface Project360Section<T = unknown> {
  state: ProjectDataSourceState;
  source: string;
  authority: ProjectProvenance['authority'];
  sourceUpdatedAt: string | null;
  retrievedAt: string;
  version: number | null;
  data: T | null;
}

export interface Project360Snapshot {
  projectId: string;
  project: Project360Section<ProjectRecord>;
  domains: {
    schedule: Project360Section;
    procurement: Project360Section;
    suppliers: Project360Section;
    contracts: Project360Section;
    materials: Project360Section;
    logistics: Project360Section;
    site: Project360Section;
    risk: Project360Section;
    cost: Project360Section;
    quality: Project360Section;
    approvals: Project360Section;
    evidence: Project360Section;
    exceptions: Project360Section;
    timeline: Project360Section;
    dependencies: Project360Section;
  };
  health: {
    state: Project360HealthState;
    overall: Project360HealthState;
    dimensions: Array<{
      domain: string;
      state: Project360HealthState;
      source: string;
      authority: ProjectProvenance['authority'];
      sourceUpdatedAt: string | null;
      evidenceReferences: string[];
      contributingConditions: string[];
    }>;
  };
  freshness: {
    snapshotGeneratedAt: string;
    sourceUpdatedAt: string | null;
  };
  version: number | null;
}
