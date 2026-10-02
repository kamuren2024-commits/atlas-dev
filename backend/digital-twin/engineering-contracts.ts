export type EngineeringSourceMode =
  | 'LIVE'
  | 'SIMULATION'
  | 'SNAPSHOT'
  | 'IMPORTED'
  | 'DEMO'
  | 'UNAVAILABLE'
  | 'STALE';

export type EngineeringValueState =
  | 'OBSERVED'
  | 'DERIVED'
  | 'SIMULATED'
  | 'PREDICTED'
  | 'UNAVAILABLE';

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

export interface DataProvenance {
  sourceSystem: string;
  sourceType: DataSourceType;
  sourceReference?: string;
  retrievedAt?: string;
  observedAt?: string;
  freshness: 'FRESH' | 'STALE' | 'UNKNOWN' | 'UNAVAILABLE';
  sourceMode: EngineeringSourceMode;
  transformation?: string[];
  authority: 'AUTHORITATIVE' | 'NON_AUTHORITATIVE' | 'UNKNOWN';
  confidenceState: EngineeringValueState;
  sourceState: EngineeringSourceState;
}

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
