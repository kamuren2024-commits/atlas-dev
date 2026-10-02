export type EngineeringSourceMode =
  | 'LIVE'
  | 'SIMULATION'
  | 'SNAPSHOT'
  | 'IMPORTED'
  | 'DEMO'
  | 'UNAVAILABLE'
  | 'STALE';

export type AuthorityClass =
  | 'LIVE_AUTHORITATIVE'
  | 'LIVE_NON_AUTHORITATIVE'
  | 'HISTORICAL'
  | 'SIMULATED'
  | 'PREDICTED'
  | 'DERIVED'
  | 'UNKNOWN';

export type ConfidenceClassification = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type FreshnessClassification = 'FRESH' | 'STALE' | 'UNKNOWN' | 'UNAVAILABLE';
export type IntegrityStatus = 'VERIFIED' | 'UNVERIFIED' | 'FAILED' | 'TAMPERED';
export type SourceAvailability = 'AVAILABLE' | 'DEGRADED' | 'UNAVAILABLE' | 'UNKNOWN';
export type GridValueSemanticClass = 'OBSERVED' | 'DERIVED' | 'SIMULATED' | 'PREDICTED' | 'UNKNOWN';

export type EngineeringValueState = GridValueSemanticClass | 'UNAVAILABLE';

export type EngineeringSourceState =
  | 'SOURCE_CONFIGURED'
  | 'SOURCE_NOT_CONFIGURED'
  | 'SOURCE_UNAVAILABLE'
  | 'SOURCE_STALE'
  | 'SOURCE_ERROR';

export type DataSourceType =
  | 'SCADA_EMS'
  | 'WAMS_PMU'
  | 'GIS_POSTGIS'
  | 'SAP_EAM'
  | 'HISTORIAN'
  | 'WEATHER'
  | 'OUTAGE_MGMT'
  | 'GENERATION'
  | 'MARKET_DISPATCH'
  | 'MANUAL_IMPORT'
  | 'ATLAS';

export interface DataSource {
  sourceId: string;
  sourceSystem: string;
  sourceType: DataSourceType;
  state: EngineeringSourceState;
  sourceMode: EngineeringSourceMode;
  tenantId: string;
  lastObservedAt?: string;
  lastRetrievedAt?: string;
  errorCode?: string;
}

export interface SourceProvenance {
  sourceId: string;
  sourceType: DataSourceType | 'UNKNOWN';
  provider: string;
  tenantId: string;
  capturedAt?: string;
  effectiveAt?: string;
  receivedAt?: string;
  version?: string;
  authorityClass: AuthorityClass;
  freshness: FreshnessClassification;
  integrityStatus: IntegrityStatus;
  availability: SourceAvailability;
  confidenceClass: ConfidenceClassification;
  sourceSystem?: string;
  sourceReference?: string;
  sourceMode?: EngineeringSourceMode;
}

export interface DataProvenance {
  sourceId?: string;
  sourceSystem: string;
  sourceType: DataSourceType;
  provider?: string;
  tenantId?: string;
  sourceReference?: string;
  retrievedAt?: string;
  observedAt?: string;
  capturedAt?: string;
  effectiveAt?: string;
  receivedAt?: string;
  version?: string;
  freshness: FreshnessClassification;
  sourceMode: EngineeringSourceMode;
  transformation?: string[];
  authority: 'AUTHORITATIVE' | 'NON_AUTHORITATIVE' | 'UNKNOWN';
  authorityClass?: AuthorityClass;
  integrityStatus?: IntegrityStatus;
  availability?: SourceAvailability;
  confidenceState: EngineeringValueState;
  confidenceClass?: ConfidenceClassification;
  sourceState: EngineeringSourceState;
}

export interface TopologyVersion {
  topologyVersion: string;
  topologyId?: string;
  tenantId: string;
  createdAt: string;
  source: SourceProvenance;
  authoritative: boolean;
  stale: boolean;
  simulationOnly: boolean;
  scenarioId?: string;
}

export interface EngineeringEvidence {
  evidenceId: string;
  tenantId: string;
  type: 'TOPOLOGY' | 'GRID_STATE' | 'SCENARIO' | 'SIMULATION_RESULT' | 'AUTHORIZATION' | 'HUMAN_APPROVAL';
  source: SourceProvenance;
  reference: string;
  summary: string;
  capturedAt: string;
  integrityStatus?: IntegrityStatus;
}

export interface AuthorityBoundary {
  tenantId: string;
  allowedActions: string[];
  requiredAuthority: AuthorityClass[];
  approvalRequired: boolean;
  reason?: string;
}

export interface EngineeringDecision {
  decisionId: string;
  tenantId: string;
  scenarioId?: string;
  decisionType: 'RECOMMENDATION' | 'ACTION' | 'APPROVAL' | 'REJECTION' | 'DEFER';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  confidence: ConfidenceClassification;
  createdAt: string;
  summary: string;
  basis: string[];
  evidenceIds: string[];
  authority: AuthorityBoundary;
}

export interface OperationalRecommendation {
  recommendationId: string;
  tenantId: string;
  scenarioId?: string;
  title: string;
  summary: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: ConfidenceClassification;
  rationale: string[];
  supports?: string[];
  evidenceIds: string[];
  createdAt: string;
}

export interface ApprovalRequest {
  approvalRequestId: string;
  tenantId: string;
  actorId: string;
  resourceType: 'SCENARIO' | 'SIMULATION_RUN' | 'ACTION' | 'RESTORATION_PLAN';
  resourceId: string;
  requestedAt: string;
  requiredAuthority: AuthorityClass[];
  rationale: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  approvalId?: string;
}

export interface EngineeringAction {
  actionId: string;
  tenantId: string;
  scenarioId?: string;
  type: 'RECONFIGURE' | 'ISOLATE' | 'RESTORE' | 'MONITOR' | 'ESCALATE';
  targetAssetId?: string;
  description: string;
  authority: AuthorityBoundary;
  createdAt: string;
  status: 'PENDING' | 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'REJECTED';
  evidenceIds: string[];
}

export interface RestorationPlan {
  planId: string;
  tenantId: string;
  scenarioId?: string;
  name: string;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'REJECTED';
  objective: string;
  milestones: string[];
  actions: string[];
  createdAt: string;
  approvedAt?: string;
  evidenceIds: string[];
}

export interface EventEnvelope<TPayload = Record<string, unknown>> {
  eventId: string;
  eventType: string;
  tenantId: string;
  occurredAt: string;
  source: string;
  correlationId?: string;
  payload: TPayload;
  provenance: SourceProvenance;
}

export interface ReplayCursor {
  tenantId: string;
  stream: string;
  lastEventId?: string;
  sequenceNumber?: number;
  timestamp?: string;
  position?: string;
}

export interface EngineeringContext {
  tenant: string;
  actor: string;
  gridState?: GridState;
  topology?: TopologySnapshot;
  scenario?: EngineeringScenario;
  evidence: EngineeringEvidence[];
  provenance: SourceProvenance[];
  policy?: Record<string, unknown>;
  authority: AuthorityBoundary;
}

export type Scenario = EngineeringScenario;
export type ScenarioRun = SimulationRun;
export type AnalysisResult = SimulationResult;

export type GridAssetType =
  | 'SUBSTATION'
  | 'BUS'
  | 'TRANSMISSION_LINE'
  | 'TRANSFORMER'
  | 'GENERATOR'
  | 'LOAD'
  | 'BREAKER'
  | 'SWITCH'
  | 'OTHER';

export interface GridAsset {
  assetId: string;
  assetType: GridAssetType;
  name?: string;
  substationId?: string;
  voltageKV?: number;
  ratedCapacity?: number;
  status?: string;
  properties?: Record<string, string | number | boolean | null>;
  provenance: DataProvenance;
}

export interface Substation extends GridAsset {
  assetType: 'SUBSTATION';
}

export interface Bus extends GridAsset {
  assetType: 'BUS';
  substationId?: string;
}

export interface TransmissionLine extends GridAsset {
  assetType: 'TRANSMISSION_LINE';
}

export interface Transformer extends GridAsset {
  assetType: 'TRANSFORMER';
}

export interface Generator extends GridAsset {
  assetType: 'GENERATOR';
}

export interface Load extends GridAsset {
  assetType: 'LOAD';
}

export interface Breaker extends GridAsset {
  assetType: 'BREAKER';
}

export interface Switch extends GridAsset {
  assetType: 'SWITCH';
}

export interface TopologyRelationship {
  relationshipId: string;
  fromAssetId: string;
  toAssetId: string;
  relationshipType: string;
  status?: string;
  provenance: DataProvenance;
}

export interface TopologySnapshot {
  topologyVersion: string;
  tenantId: string;
  observedAt?: string;
  source: DataSource;
  provenance: DataProvenance;
  authoritative: boolean;
  stale: boolean;
  simulationOnly: boolean;
  assets: GridAsset[];
  relationships: TopologyRelationship[];
}

export interface TelemetrySnapshot {
  snapshotId: string;
  timestamp: string;
  source: DataSource;
  provenance: DataProvenance;
  measurements: Array<{
    assetId: string;
    metric: string;
    value?: number;
    unit?: string;
    state: EngineeringValueState;
    observedAt?: string;
    quality?: string;
    provenance: DataProvenance;
  }>;
}

export interface GridState {
  stateId: string;
  version: string;
  timestamp: string;
  source: DataSource;
  sourceMode: EngineeringSourceMode;
  provenance: DataProvenance;
  tenantId: string;
  correlationId: string;
  topologyVersion?: string;
  assets: GridAsset[];
  relationships: TopologyRelationship[];
  telemetry?: TelemetrySnapshot[];
}

export type ScenarioClass =
  | 'BASELINE'
  | 'OUTAGE'
  | 'N_MINUS_1'
  | 'N_MINUS_2'
  | 'GENERATION_LOSS'
  | 'TRANSMISSION_FAILURE'
  | 'SUBSTATION_FAILURE'
  | 'TRANSFORMER_FAILURE'
  | 'WEATHER_EVENT'
  | 'COMMUNICATION_FAILURE'
  | 'CUSTOM';

export type EngineeringAnalysisCapability =
  | 'CONTINGENCY_ANALYSIS'
  | 'POWER_FLOW'
  | 'DYNAMIC_SIMULATION'
  | 'RESTORATION_ANALYSIS'
  | 'CUSTOM_SCENARIO_ANALYSIS';

export type ScenarioExecutionState =
  | 'DRAFT'
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNAVAILABLE'
  | 'INVALID';

export interface ScenarioChange {
  targetAssetId: string;
  changeType: string;
  value?: string | number | boolean | null;
  description?: string;
}

export interface EngineeringScenario {
  scenarioId: string;
  scenarioVersion: number;
  tenantId: string;
  ownerId: string;
  name: string;
  scenarioClass: ScenarioClass;
  baseGridState: Pick<GridState, 'stateId' | 'version' | 'timestamp' | 'sourceMode'>;
  topologyVersion: string;
  changes: ScenarioChange[];
  assumptions: string[];
  requestedAnalysis: EngineeringAnalysisCapability[];
  executionState: ScenarioExecutionState;
  resultIds: string[];
  provenance: DataProvenance;
  correlationId: string;
  createdAt: string;
  updatedAt: string;
}

export type SimulationStatus =
  | 'QUEUED'
  | 'RUNNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNAVAILABLE'
  | 'INVALID';

export interface SimulationRequest {
  scenarioId: string;
  requestedAnalysis: EngineeringAnalysisCapability[];
  correlationId: string;
  idempotencyKey: string;
}

export interface SimulationFinding {
  findingId: string;
  code: string;
  severity: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  assetIds?: string[];
  provenance: DataProvenance;
}

export interface SimulationWarning {
  code: string;
  message: string;
  provenance: DataProvenance;
}

export interface SimulationArtifact {
  artifactId: string;
  mediaType: string;
  reference: string;
  provenance: DataProvenance;
}

export interface SimulationResult {
  resultId: string;
  simulationRunId: string;
  scenarioId: string;
  baseStateId: string;
  baseStateVersion: string;
  topologyVersion: string;
  status: SimulationStatus;
  findings: SimulationFinding[];
  warnings: SimulationWarning[];
  artifacts: SimulationArtifact[];
  provenance: DataProvenance;
}

export interface SimulationRun {
  simulationRunId: string;
  tenantId: string;
  scenarioId: string;
  scenarioVersion: number;
  baseStateId: string;
  baseStateVersion: string;
  topologyVersion: string;
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
  executionStatus: SimulationStatus;
  engine: string;
  engineVersion: string;
  provenance: DataProvenance;
  inputProvenance: DataProvenance;
  assumptions: string[];
  warnings: SimulationWarning[];
  findings: SimulationFinding[];
  artifacts: SimulationArtifact[];
  result?: SimulationResult;
  correlationId: string;
  idempotencyKey: string;
}

export type SimulationEventType =
  | 'RUN_CREATED'
  | 'RUN_QUEUED'
  | 'RUN_STARTED'
  | 'RUN_PROGRESS'
  | 'RUN_WARNING'
  | 'RUN_COMPLETED'
  | 'RUN_FAILED'
  | 'RUN_CANCELLED'
  | 'RUN_UNAVAILABLE';

export interface SimulationLifecycleEvent {
  eventId: string;
  eventType: SimulationEventType;
  timestamp: string;
  correlationId: string;
  scenarioId: string;
  simulationRunId: string;
  version: string;
  warningCode?: string;
}

export interface EngineeringSimulationProvider {
  readonly providerId: string;
  readonly providerVersion: string;
  readonly capabilities: readonly EngineeringAnalysisCapability[];
  run(request: {
    scenario: EngineeringScenario;
    baseState: GridState;
    topology: TopologySnapshot;
    simulationRunId: string;
    requestedAt: string;
  }): Promise<SimulationResult>;
}

export interface GridStateProvider {
  getGridState(tenantId: string, correlationId: string): Promise<GridState>;
  getGridStateVersion(
    tenantId: string,
    stateId: string,
    version: string,
    correlationId: string
  ): Promise<GridState>;
}

export interface TopologyProvider {
  getTopology(tenantId: string, correlationId: string): Promise<TopologySnapshot>;
  getTopologyVersion(
    tenantId: string,
    topologyVersion: string,
    correlationId: string
  ): Promise<TopologySnapshot>;
}

export type EngineeringAuditAction =
  | 'SCENARIO_CREATED'
  | 'SCENARIO_UPDATED'
  | 'SCENARIO_EXECUTION_REQUESTED'
  | 'SIMULATION_STARTED'
  | 'SIMULATION_COMPLETED'
  | 'SIMULATION_FAILED'
  | 'SIMULATION_UNAVAILABLE'
  | 'SIMULATION_CANCELLED'
  | 'RESULT_ACCESSED'
  | 'RESULT_EXPORTED'
  | 'AUTHORIZATION_DENIED';

export interface EngineeringAuditEvent {
  eventId: string;
  actorId: string;
  tenantId: string;
  timestamp: string;
  action: EngineeringAuditAction;
  resourceType: 'SCENARIO' | 'SIMULATION_RUN' | 'SIMULATION_RESULT';
  resourceId: string;
  scenarioId: string;
  correlationId: string;
  resultStatus: SimulationStatus | 'SUCCESS' | 'DENIED';
  baseStateId?: string;
  baseStateVersion?: string;
  topologyVersion?: string;
}

export interface EngineeringToolCapability {
  name:
    | 'get_grid_state'
    | 'get_asset'
    | 'get_topology'
    | 'create_scenario'
    | 'run_simulation'
    | 'get_simulation_result'
    | 'replay_event';
  inputContract: string;
  outputContract: string;
  authorization: string;
  auditRequired: boolean;
  provenanceRequired: boolean;
  safetyConstraints: string[];
}
