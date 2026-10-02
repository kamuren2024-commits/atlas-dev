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
