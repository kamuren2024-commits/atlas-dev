import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseCore } from '../database/db-core';
import {
  DataProvenance,
  EngineeringAnalysisCapability,
  EngineeringAuditAction,
  EngineeringAuditEvent,
  EngineeringScenario,
  EngineeringSimulationProvider,
  GridState,
  GridStateProvider,
  ScenarioChange,
  ScenarioClass,
  SimulationLifecycleEvent,
  SimulationResult,
  SimulationRun,
  SimulationStatus,
  TopologyProvider,
  TopologySnapshot,
} from './engineering-contracts';
import { EngineeringSourceError } from './engineering-providers';

export class EngineeringServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'EngineeringServiceError';
  }
}

export interface CreateScenarioInput {
  tenantId: string;
  actorId: string;
  actorRole: string;
  name: string;
  scenarioClass: ScenarioClass;
  changes: ScenarioChange[];
  assumptions: string[];
  requestedAnalysis: EngineeringAnalysisCapability[];
  correlationId: string;
}

export interface UpdateScenarioInput {
  tenantId: string;
  actorId: string;
  actorRole: string;
  scenarioId: string;
  name?: string;
  changes?: ScenarioChange[];
  assumptions?: string[];
  requestedAnalysis?: EngineeringAnalysisCapability[];
  correlationId: string;
}

export interface EngineeringScenarioServiceOptions {
  db?: EngineeringScenarioDatabase;
  gridStateProvider: GridStateProvider;
  topologyProvider: TopologyProvider;
  simulationProvider: EngineeringSimulationProvider;
}

export type EngineeringSqlParameter = string | number | null;

export interface EngineeringScenarioDatabase {
  run(sql: string, params?: EngineeringSqlParameter[]): Promise<{ lastID: number; changes: number }>;
  get<T = unknown>(sql: string, params?: EngineeringSqlParameter[]): Promise<T | undefined>;
  all<T = unknown>(sql: string, params?: EngineeringSqlParameter[]): Promise<T[]>;
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

interface AuditRow {
  id: string;
  tenant_id: string;
  actor_id: string;
  actor_role: string;
  action: EngineeringAuditAction;
  resource: string;
  entity_id: string | null;
  outcome: string;
  correlation_id: string | null;
  details_json: string;
  previous_hash: string | null;
  record_hash: string;
  created_at: string;
}

const SCENARIO_CLASSES: readonly ScenarioClass[] = [
  'BASELINE',
  'OUTAGE',
  'N_MINUS_1',
  'N_MINUS_2',
  'GENERATION_LOSS',
  'TRANSMISSION_FAILURE',
  'SUBSTATION_FAILURE',
  'TRANSFORMER_FAILURE',
  'WEATHER_EVENT',
  'COMMUNICATION_FAILURE',
  'CUSTOM',
];

const ANALYSIS_CAPABILITIES: readonly EngineeringAnalysisCapability[] = [
  'CONTINGENCY_ANALYSIS',
  'POWER_FLOW',
  'DYNAMIC_SIMULATION',
  'RESTORATION_ANALYSIS',
  'CUSTOM_SCENARIO_ANALYSIS',
];

function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

function cloneValue<T>(value: T): T {
  return structuredClone(value);
}

function assertNonEmpty(value: string, field: string): void {
  if (!value.trim()) {
    throw new EngineeringServiceError(400, 'INVALID_INPUT', `${field} is required.`);
  }
}

function validateStringList(value: string[], field: string): void {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string' || !item.trim())) {
    throw new EngineeringServiceError(400, 'INVALID_INPUT', `${field} must contain non-empty strings.`);
  }
}

function validateChanges(value: ScenarioChange[]): void {
  if (!Array.isArray(value)) {
    throw new EngineeringServiceError(400, 'INVALID_INPUT', 'changes must be an array.');
  }
  for (const change of value) {
    if (!change || typeof change.targetAssetId !== 'string' || !change.targetAssetId.trim()
      || typeof change.changeType !== 'string' || !change.changeType.trim()) {
      throw new EngineeringServiceError(400, 'INVALID_INPUT', 'Each change requires targetAssetId and changeType.');
    }
  }
}

function validateGridState(state: GridState, tenantId: string): void {
  if (state.tenantId !== tenantId) {
    throw new EngineeringServiceError(403, 'TENANT_MISMATCH', 'Grid-state source returned a different tenant.');
  }
  if (!state.stateId || !state.version || !state.timestamp || !state.correlationId) {
    throw new EngineeringServiceError(502, 'INVALID_GRID_STATE', 'Grid-state source returned incomplete version metadata.');
  }
  if (state.source.tenantId !== tenantId
    || state.source.sourceMode !== state.sourceMode
    || state.provenance.sourceSystem !== state.source.sourceSystem
    || state.provenance.sourceType !== state.source.sourceType
    || state.provenance.sourceMode !== state.sourceMode) {
    throw new EngineeringServiceError(502, 'INVALID_GRID_STATE', 'Grid-state source provenance is inconsistent.');
  }
  if (state.source.state !== 'SOURCE_CONFIGURED' || state.provenance.sourceState !== 'SOURCE_CONFIGURED') {
    const sourceState = state.source.state !== 'SOURCE_CONFIGURED'
      ? state.source.state
      : state.provenance.sourceState;
    // Normalize unconfigured sources to the canonical SOURCE_UNAVAILABLE code for callers
    const code = sourceState === 'SOURCE_NOT_CONFIGURED' ? 'SOURCE_UNAVAILABLE' : sourceState;
    throw new EngineeringServiceError(503, code, `Grid-state source is ${sourceState}.`);
  }
  if (state.sourceMode === 'STALE' || state.provenance.freshness === 'STALE') {
    // Treat stale sources as unavailable to calling workflows
    throw new EngineeringServiceError(503, 'SOURCE_UNAVAILABLE', 'Grid-state source is stale.');
  }
  if (state.sourceMode === 'UNAVAILABLE' || state.provenance.freshness === 'UNAVAILABLE') {
    throw new EngineeringServiceError(503, 'SOURCE_UNAVAILABLE', 'Grid-state source is unavailable.');
  }
  if (state.provenance.freshness !== 'FRESH') {
    throw new EngineeringServiceError(503, 'SOURCE_UNAVAILABLE', 'Grid-state freshness is unknown.');
  }
  if (state.sourceMode === 'LIVE' && state.provenance.authority !== 'AUTHORITATIVE') {
    throw new EngineeringServiceError(503, 'SOURCE_UNAVAILABLE', 'Live grid-state source is not authoritative.');
  }
  if ((state.sourceMode === 'SIMULATION' || state.sourceMode === 'DEMO')
    && state.provenance.confidenceState !== 'SIMULATED') {
    throw new EngineeringServiceError(502, 'INVALID_GRID_STATE', 'Simulation and demo grid states must remain explicitly SIMULATED.');
  }
  if (state.sourceMode === 'LIVE'
    && (state.provenance.confidenceState === 'SIMULATED' || state.provenance.confidenceState === 'PREDICTED')) {
    throw new EngineeringServiceError(502, 'INVALID_GRID_STATE', 'Live grid state cannot be labeled SIMULATED or PREDICTED.');
  }
}

function validateTopology(topology: TopologySnapshot, tenantId: string): void {
  if (topology.tenantId !== tenantId || topology.source.tenantId !== tenantId) {
    throw new EngineeringServiceError(403, 'TENANT_MISMATCH', 'Topology source returned a different tenant.');
  }
  if (!topology.topologyVersion) {
    throw new EngineeringServiceError(503, 'TOPOLOGY_SOURCE_UNAVAILABLE', 'Topology version is unavailable.');
  }
  if (topology.source.state !== 'SOURCE_CONFIGURED' || topology.provenance.sourceState !== 'SOURCE_CONFIGURED') {
    const sourceState = topology.source.state !== 'SOURCE_CONFIGURED'
      ? topology.source.state
      : topology.provenance.sourceState;
    const code = sourceState === 'SOURCE_NOT_CONFIGURED' ? 'TOPOLOGY_SOURCE_UNAVAILABLE' : sourceState;
    throw new EngineeringServiceError(503, code, `Topology source is ${sourceState}.`);
  }
  if (topology.provenance.freshness === 'STALE' || topology.stale) {
    throw new EngineeringServiceError(503, 'SOURCE_STALE', 'Topology source is stale.');
  }
  if (topology.provenance.freshness === 'UNAVAILABLE') {
    throw new EngineeringServiceError(503, 'SOURCE_UNAVAILABLE', 'Topology source is unavailable.');
  }
  if (topology.source.sourceMode !== topology.provenance.sourceMode
    || topology.source.sourceMode !== topology.provenance.sourceMode
    || topology.provenance.sourceSystem !== topology.source.sourceSystem
    || topology.provenance.sourceType !== topology.source.sourceType
    || topology.provenance.freshness !== 'FRESH') {
    throw new EngineeringServiceError(502, 'INVALID_TOPOLOGY', 'Topology source metadata is inconsistent or freshness is unknown.');
  }
  if (topology.simulationOnly && topology.source.sourceMode !== 'SIMULATION') {
    throw new EngineeringServiceError(502, 'INVALID_TOPOLOGY', 'Simulation-only topology must use SIMULATION source mode.');
  }
  if (topology.source.sourceMode === 'SIMULATION'
    && (!topology.simulationOnly || topology.authoritative
      || topology.provenance.authority !== 'NON_AUTHORITATIVE')) {
    throw new EngineeringServiceError(502, 'INVALID_TOPOLOGY', 'Simulation topology cannot be authoritative.');
  }
  if (topology.authoritative !== (topology.provenance.authority === 'AUTHORITATIVE')) {
    throw new EngineeringServiceError(502, 'INVALID_TOPOLOGY', 'Topology authority metadata is inconsistent.');
  }
  if (topology.source.sourceMode === 'LIVE'
    && (!topology.authoritative || topology.provenance.authority !== 'AUTHORITATIVE')) {
    throw new EngineeringServiceError(503, 'TOPOLOGY_SOURCE_UNAVAILABLE', 'Live topology is not marked authoritative.');
  }
}

function sourceModeProvenance(mode: GridState['sourceMode'], freshness: DataProvenance['freshness']): DataProvenance {
  return {
    sourceSystem: 'Atlas',
    sourceType: 'ATLAS',
    freshness,
    sourceMode: mode,
    transformation: ['scenario-snapshot-reference'],
    authority: 'UNKNOWN',
    confidenceState: 'UNAVAILABLE',
    sourceState: 'SOURCE_NOT_CONFIGURED',
  };
}

function parseScenario(json: string): EngineeringScenario {
  return parseJson<EngineeringScenario>(json);
}

export class EngineeringScenarioService {
  private readonly db: EngineeringScenarioDatabase;
  private transactionQueue: Promise<void> = Promise.resolve();

  constructor(private readonly options: EngineeringScenarioServiceOptions) {
    this.db = options.db ?? DatabaseCore.getInstance();
  }

  async createScenario(input: CreateScenarioInput): Promise<EngineeringScenario> {
    assertNonEmpty(input.name, 'name');
    if (!SCENARIO_CLASSES.includes(input.scenarioClass)) {
      throw new EngineeringServiceError(400, 'INVALID_INPUT', 'Unsupported scenario class.');
    }
    validateChanges(input.changes);
    validateStringList(input.assumptions, 'assumptions');
    validateStringList(input.requestedAnalysis, 'requestedAnalysis');
    if (input.requestedAnalysis.some(item => !ANALYSIS_CAPABILITIES.includes(item))) {
      throw new EngineeringServiceError(400, 'INVALID_ANALYSIS', 'requestedAnalysis contains an unsupported capability.');
    }

    const [state, topology] = await Promise.all([
      this.options.gridStateProvider.getGridState(input.tenantId, input.correlationId),
      this.options.topologyProvider.getTopology(input.tenantId, input.correlationId),
    ]);
    validateGridState(state, input.tenantId);
    validateTopology(topology, input.tenantId);
    if (!state.topologyVersion || state.topologyVersion !== topology.topologyVersion) {
      throw new EngineeringServiceError(409, 'TOPOLOGY_VERSION_MISMATCH', 'Grid state and topology versions do not match.');
    }
    const stateAssets = new Set(state.assets.map(asset => asset.assetId));
    const topologyAssets = new Set(topology.assets.map(asset => asset.assetId));
    if (input.changes.some(change => !stateAssets.has(change.targetAssetId)
      || !topologyAssets.has(change.targetAssetId))) {
      throw new EngineeringServiceError(400, 'UNKNOWN_ASSET', 'Scenario changes must target an asset in the pinned base state.');
    }

    const timestamp = new Date().toISOString();
    const scenario: EngineeringScenario = {
      scenarioId: uuidv4(),
      scenarioVersion: 1,
      tenantId: input.tenantId,
      ownerId: input.actorId,
      name: input.name.trim(),
      scenarioClass: input.scenarioClass,
      baseGridState: {
        stateId: state.stateId,
        version: state.version,
        timestamp: state.timestamp,
        sourceMode: state.sourceMode,
      },
      topologyVersion: topology.topologyVersion,
      changes: cloneValue(input.changes),
      assumptions: [...input.assumptions],
      requestedAnalysis: [...input.requestedAnalysis],
      executionState: 'DRAFT',
      resultIds: [],
      provenance: cloneValue(state.provenance),
      correlationId: input.correlationId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.withTransaction(async () => {
      const payload = JSON.stringify(scenario);
      await this.db.run(
        `INSERT INTO engineering_scenarios
          (scenario_id, tenant_id, owner_id, scenario_version, scenario_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [scenario.scenarioId, scenario.tenantId, scenario.ownerId, scenario.scenarioVersion, payload, timestamp, timestamp]
      );
      await this.insertScenarioVersion(scenario, input.actorId, timestamp);
      await this.appendAudit({
        eventId: uuidv4(),
        actorId: input.actorId,
        tenantId: input.tenantId,
        timestamp,
        action: 'SCENARIO_CREATED',
        resourceType: 'SCENARIO',
        resourceId: scenario.scenarioId,
        scenarioId: scenario.scenarioId,
        correlationId: input.correlationId,
        resultStatus: 'SUCCESS',
        baseStateId: state.stateId,
        baseStateVersion: state.version,
        topologyVersion: topology.topologyVersion,
      }, input.actorRole);
    });
    return scenario;
  }

  async getScenario(tenantId: string, actorId: string, scenarioId: string): Promise<EngineeringScenario> {
    const scenario = await this.findScenario(tenantId, scenarioId);
    this.assertOwner(scenario, actorId);
    return scenario;
  }

  async listScenarios(tenantId: string, actorId: string, limit: number, offset: number): Promise<EngineeringScenario[]> {
    const rows = await this.db.all<{ scenario_json: string }>(
      `SELECT scenario_json FROM engineering_scenarios
       WHERE tenant_id = ? AND owner_id = ?
       ORDER BY updated_at DESC, scenario_id ASC
       LIMIT ? OFFSET ?`,
      [tenantId, actorId, limit, offset]
    );
    return rows.map(row => parseScenario(row.scenario_json));
  }

  async updateScenario(input: UpdateScenarioInput): Promise<EngineeringScenario> {
    if (input.name !== undefined) assertNonEmpty(input.name, 'name');
    if (input.changes !== undefined) validateChanges(input.changes);
    if (input.assumptions !== undefined) validateStringList(input.assumptions, 'assumptions');
    if (input.requestedAnalysis !== undefined) validateStringList(input.requestedAnalysis, 'requestedAnalysis');
    if (input.requestedAnalysis?.some(item => !ANALYSIS_CAPABILITIES.includes(item))) {
      throw new EngineeringServiceError(400, 'INVALID_ANALYSIS', 'requestedAnalysis contains an unsupported capability.');
    }

    return this.withTransaction(async () => {
      const scenario = await this.findScenario(input.tenantId, input.scenarioId);
      this.assertOwner(scenario, input.actorId);
      if (scenario.executionState !== 'DRAFT') {
        throw new EngineeringServiceError(409, 'SCENARIO_IMMUTABLE', 'Only draft scenarios can be updated.');
      }
      const updated: EngineeringScenario = {
        ...scenario,
        scenarioVersion: scenario.scenarioVersion + 1,
        name: input.name?.trim() ?? scenario.name,
        changes: input.changes ?? scenario.changes,
        assumptions: input.assumptions ?? scenario.assumptions,
        requestedAnalysis: input.requestedAnalysis ?? scenario.requestedAnalysis,
        correlationId: input.correlationId,
        updatedAt: new Date().toISOString(),
      };
      const payload = JSON.stringify(updated);
      await this.db.run(
        `UPDATE engineering_scenarios
         SET scenario_version = ?, scenario_json = ?, updated_at = ?
         WHERE scenario_id = ? AND tenant_id = ? AND owner_id = ? AND scenario_version = ?`,
        [updated.scenarioVersion, payload, updated.updatedAt, updated.scenarioId, input.tenantId, input.actorId, scenario.scenarioVersion]
      );
      await this.insertScenarioVersion(updated, input.actorId, updated.updatedAt);
      await this.appendAudit({
        eventId: uuidv4(),
        actorId: input.actorId,
        tenantId: input.tenantId,
        timestamp: updated.updatedAt,
        action: 'SCENARIO_UPDATED',
        resourceType: 'SCENARIO',
        resourceId: updated.scenarioId,
        scenarioId: updated.scenarioId,
        correlationId: input.correlationId,
        resultStatus: 'SUCCESS',
        baseStateId: updated.baseGridState.stateId,
        baseStateVersion: updated.baseGridState.version,
        topologyVersion: updated.topologyVersion,
      }, input.actorRole);
      return updated;
    });
  }

  async requestSimulation(input: {
    tenantId: string;
    actorId: string;
    actorRole: string;
    scenarioId: string;
    correlationId: string;
    idempotencyKey: string;
  }): Promise<SimulationRun> {
    assertNonEmpty(input.idempotencyKey, 'Idempotency-Key');
    const scenario = await this.getScenario(input.tenantId, input.actorId, input.scenarioId);

    const existing = await this.findRunByIdempotency(input.tenantId, input.idempotencyKey);
    if (existing) {
      if (existing.scenarioId !== scenario.scenarioId || existing.scenarioVersion !== scenario.scenarioVersion) {
        throw new EngineeringServiceError(409, 'IDEMPOTENCY_KEY_REUSED', 'Idempotency key was already used for a different request.');
      }
      return existing;
    }

    const timestamp = new Date().toISOString();
    const runId = uuidv4();
    const initialRun: SimulationRun = {
      simulationRunId: runId,
      tenantId: input.tenantId,
      scenarioId: scenario.scenarioId,
      scenarioVersion: scenario.scenarioVersion,
      baseStateId: scenario.baseGridState.stateId,
      baseStateVersion: scenario.baseGridState.version,
      topologyVersion: scenario.topologyVersion,
      requestedAt: timestamp,
      executionStatus: 'QUEUED',
      engine: this.options.simulationProvider.providerId,
      engineVersion: this.options.simulationProvider.providerVersion,
      provenance: sourceModeProvenance('UNAVAILABLE', 'UNAVAILABLE'),
      inputProvenance: cloneValue(scenario.provenance),
      assumptions: [...scenario.assumptions],
      warnings: [],
      findings: [],
      artifacts: [],
      correlationId: input.correlationId,
      idempotencyKey: input.idempotencyKey,
    };

    let queued: SimulationRun;
    try {
      queued = await this.withTransaction(async () => {
      const duplicate = await this.findRunByIdempotency(input.tenantId, input.idempotencyKey);
      if (duplicate) {
        if (duplicate.scenarioId !== scenario.scenarioId || duplicate.scenarioVersion !== scenario.scenarioVersion) {
          throw new EngineeringServiceError(409, 'IDEMPOTENCY_KEY_REUSED', 'Idempotency key was already used for a different request.');
        }
        return duplicate;
      }
      const active = await this.db.get<{ simulation_run_id: string }>(
        `SELECT simulation_run_id FROM engineering_simulation_runs
         WHERE tenant_id = ? AND scenario_id = ? AND execution_status IN ('QUEUED', 'RUNNING')
         LIMIT 1`,
        [input.tenantId, scenario.scenarioId]
      );
      if (active) {
        throw new EngineeringServiceError(409, 'SIMULATION_ALREADY_ACTIVE', 'A simulation is already active for this scenario.');
      }

      await this.insertRun(initialRun, input.tenantId);
      await this.persistLifecycleEvent(initialRun, 'RUN_CREATED', timestamp, '1');
      await this.persistLifecycleEvent(initialRun, 'RUN_QUEUED', timestamp, '1');
      await this.appendAudit({
        eventId: uuidv4(),
        actorId: input.actorId,
        tenantId: input.tenantId,
        timestamp,
        action: 'SCENARIO_EXECUTION_REQUESTED',
        resourceType: 'SIMULATION_RUN',
        resourceId: runId,
        scenarioId: scenario.scenarioId,
        correlationId: input.correlationId,
        resultStatus: 'QUEUED',
        baseStateId: initialRun.baseStateId,
        baseStateVersion: initialRun.baseStateVersion,
        topologyVersion: initialRun.topologyVersion,
      }, input.actorRole);
        return initialRun;
      });
    } catch (error) {
      const duplicate = await this.findRunByIdempotency(input.tenantId, input.idempotencyKey);
      if (duplicate) {
        if (duplicate.scenarioId !== scenario.scenarioId || duplicate.scenarioVersion !== scenario.scenarioVersion) {
          throw new EngineeringServiceError(409, 'IDEMPOTENCY_KEY_REUSED', 'Idempotency key was already used for a different request.');
        }
        return duplicate;
      }
      const active = await this.db.get<{ simulation_run_id: string }>(
        `SELECT simulation_run_id FROM engineering_simulation_runs
         WHERE tenant_id = ? AND scenario_id = ? AND execution_status IN ('QUEUED', 'RUNNING')
         LIMIT 1`,
        [input.tenantId, scenario.scenarioId]
      );
      if (active) {
        throw new EngineeringServiceError(409, 'SIMULATION_ALREADY_ACTIVE', 'A simulation is already active for this scenario.');
      }
      throw error;
    }

    if (queued.executionStatus !== 'QUEUED') return queued;
    const startedAt = new Date().toISOString();
    const started = await this.withTransaction(async () => {
      const current = await this.findRun(input.tenantId, runId);
      if (current.executionStatus !== 'QUEUED') return current;
      const next: SimulationRun = { ...current, executionStatus: 'RUNNING', startedAt };
      await this.updateRun(next, input.tenantId);
      await this.persistLifecycleEvent(next, 'RUN_STARTED', startedAt, '2');
      await this.appendAudit({
        eventId: uuidv4(),
        actorId: input.actorId,
        tenantId: input.tenantId,
        timestamp: startedAt,
        action: 'SIMULATION_STARTED',
        resourceType: 'SIMULATION_RUN',
        resourceId: runId,
        scenarioId: scenario.scenarioId,
        correlationId: input.correlationId,
        resultStatus: 'RUNNING',
        baseStateId: next.baseStateId,
        baseStateVersion: next.baseStateVersion,
        topologyVersion: next.topologyVersion,
      }, input.actorRole);
      return next;
    });
    if (started.executionStatus !== 'RUNNING') return started;

    let result: SimulationResult;
    let finalStatus: SimulationStatus;
    try {
      // Fetch and validate the pinned base state and topology first so that version drift
      // is detected even when no solver is configured.
      const state = await this.options.gridStateProvider.getGridStateVersion(
        input.tenantId,
        scenario.baseGridState.stateId,
        scenario.baseGridState.version,
        input.correlationId
      );
      validateGridState(state, input.tenantId);
      if (state.stateId !== scenario.baseGridState.stateId || state.version !== scenario.baseGridState.version
        || state.topologyVersion !== scenario.topologyVersion) {
        throw new EngineeringServiceError(409, 'BASE_STATE_VERSION_MISMATCH', 'Pinned grid-state version is no longer available.');
      }
      const topology = await this.options.topologyProvider.getTopologyVersion(
        input.tenantId,
        scenario.topologyVersion,
        input.correlationId
      );
      validateTopology(topology, input.tenantId);
      if (topology.topologyVersion !== scenario.topologyVersion) {
        throw new EngineeringServiceError(409, 'TOPOLOGY_VERSION_MISMATCH', 'Pinned topology version is no longer available.');
      }

      // Now validate solver availability and supported analyses.
      if (this.options.simulationProvider.capabilities.length === 0) {
        throw new EngineeringServiceError(503, 'SOLVER_UNAVAILABLE', 'No validated engineering simulation provider is configured.');
      }
      const unsupportedAnalysis = scenario.requestedAnalysis.filter(
        analysis => !this.options.simulationProvider.capabilities.includes(analysis)
      );
      if (unsupportedAnalysis.length > 0) {
        throw new EngineeringServiceError(
          503,
          'ANALYSIS_UNSUPPORTED',
          `The configured solver does not support: ${unsupportedAnalysis.join(', ')}.`
        );
      }

      result = await this.options.simulationProvider.run({
        scenario: cloneValue(scenario),
        baseState: cloneValue(state),
        topology: cloneValue(topology),
        simulationRunId: runId,
        requestedAt: startedAt,
      });
      finalStatus = result.status;
      if (result.scenarioId !== scenario.scenarioId
        || result.baseStateId !== scenario.baseGridState.stateId
        || result.baseStateVersion !== scenario.baseGridState.version
        || result.topologyVersion !== scenario.topologyVersion
        || result.simulationRunId !== runId) {
        throw new EngineeringServiceError(502, 'INVALID_SOLVER_RESULT', 'Simulation provider returned mismatched version or identity metadata.');
      }
      if (!['COMPLETED', 'FAILED', 'CANCELLED', 'UNAVAILABLE', 'INVALID'].includes(result.status)) {
        throw new EngineeringServiceError(502, 'INVALID_SOLVER_RESULT', 'Simulation provider returned a non-terminal result status.');
      }
      if (result.status === 'COMPLETED'
        && (result.provenance.sourceMode !== 'SIMULATION'
          || result.provenance.confidenceState !== 'SIMULATED'
          || result.provenance.sourceState !== 'SOURCE_CONFIGURED'
          || result.findings.some(finding => finding.provenance.sourceMode !== 'SIMULATION'
            || finding.provenance.confidenceState !== 'SIMULATED'
            || finding.provenance.sourceState !== 'SOURCE_CONFIGURED')
          || result.warnings.some(warning => warning.provenance.sourceMode !== 'SIMULATION'
            || warning.provenance.confidenceState !== 'SIMULATED'
            || warning.provenance.sourceState !== 'SOURCE_CONFIGURED')
          || result.artifacts.some(artifact => artifact.provenance.sourceMode !== 'SIMULATION'
            || artifact.provenance.confidenceState !== 'SIMULATED'
            || artifact.provenance.sourceState !== 'SOURCE_CONFIGURED'))) {
        throw new EngineeringServiceError(502, 'INVALID_RESULT_PROVENANCE', 'Simulation output must remain explicitly SIMULATED.');
      }
      if (result.status === 'UNAVAILABLE'
        && (result.provenance.sourceMode !== 'UNAVAILABLE'
          || result.provenance.confidenceState !== 'UNAVAILABLE'
          || result.findings.length > 0
          || result.artifacts.length > 0)) {
        throw new EngineeringServiceError(502, 'INVALID_RESULT_PROVENANCE', 'Unavailable simulation output cannot include apparent findings or artifacts.');
      }
    } catch (error) {
      const errorCode = error instanceof EngineeringSourceError
        ? error.code
        : error instanceof EngineeringServiceError
          ? error.code
          : 'SOLVER_EXECUTION_FAILED';
      finalStatus = error instanceof EngineeringSourceError
        ? (error.code === 'SOURCE_STALE' ? 'INVALID' : 'UNAVAILABLE')
        : error instanceof EngineeringServiceError && error.statusCode === 409
          ? 'INVALID'
          : error instanceof EngineeringServiceError && error.statusCode === 503
            ? 'UNAVAILABLE'
            : 'FAILED';
      result = {
        resultId: uuidv4(),
        simulationRunId: runId,
        scenarioId: scenario.scenarioId,
        baseStateId: scenario.baseGridState.stateId,
        baseStateVersion: scenario.baseGridState.version,
        topologyVersion: scenario.topologyVersion,
        status: finalStatus,
        findings: [],
        warnings: [{
          code: errorCode,
          message: error instanceof Error ? error.message : 'Engineering simulation failed.',
          provenance: sourceModeProvenance(
            finalStatus === 'INVALID' ? 'STALE' : 'UNAVAILABLE',
            finalStatus === 'INVALID' ? 'STALE' : 'UNAVAILABLE'
          ),
        }],
        artifacts: [],
        provenance: sourceModeProvenance(
          finalStatus === 'INVALID' ? 'STALE' : 'UNAVAILABLE',
          finalStatus === 'INVALID' ? 'STALE' : 'UNAVAILABLE'
        ),
      };
    }
    const finishedAt = new Date().toISOString();

    const updatedRun: SimulationRun = {
      ...started,
      executionStatus: finalStatus,
      completedAt: finishedAt,
      warnings: result.warnings,
      findings: result.findings,
      artifacts: result.artifacts,
      provenance: result.provenance,
      result,
    };
    await this.withTransaction(async () => {
      const current = await this.findRun(input.tenantId, runId);
      if (current.executionStatus === 'CANCELLED') return;
      await this.updateRun(updatedRun, input.tenantId);
      for (const warning of updatedRun.warnings) {
        await this.persistLifecycleEvent(
          updatedRun,
          'RUN_WARNING',
          finishedAt,
          '3',
          warning.code
        );
      }
      await this.persistLifecycleEvent(
        updatedRun,
        finalStatus === 'COMPLETED' ? 'RUN_COMPLETED'
          : finalStatus === 'FAILED' ? 'RUN_FAILED'
            : finalStatus === 'INVALID' ? 'RUN_FAILED'
            : finalStatus === 'CANCELLED' ? 'RUN_CANCELLED'
              : 'RUN_UNAVAILABLE',
        finishedAt,
        '3'
      );
      const auditAction: EngineeringAuditAction = finalStatus === 'COMPLETED'
        ? 'SIMULATION_COMPLETED'
        : finalStatus === 'CANCELLED'
          ? 'SIMULATION_CANCELLED'
          : finalStatus === 'UNAVAILABLE'
            ? 'SIMULATION_UNAVAILABLE'
            : 'SIMULATION_FAILED';
      await this.appendAudit({
        eventId: uuidv4(),
        actorId: input.actorId,
        tenantId: input.tenantId,
        timestamp: finishedAt,
        action: auditAction,
        resourceType: 'SIMULATION_RUN',
        resourceId: runId,
        scenarioId: scenario.scenarioId,
        correlationId: input.correlationId,
        resultStatus: finalStatus,
        baseStateId: scenario.baseGridState.stateId,
        baseStateVersion: scenario.baseGridState.version,
        topologyVersion: scenario.topologyVersion,
      }, input.actorRole);
      await this.updateScenarioExecutionState(scenario, finalStatus, result.resultId, finishedAt);
    });
    return this.findRun(input.tenantId, runId);
  }

  async getRun(tenantId: string, actorId: string, runId: string): Promise<SimulationRun> {
    const run = await this.findRun(tenantId, runId);
    const scenario = await this.findScenario(tenantId, run.scenarioId);
    this.assertOwner(scenario, actorId);
    return run;
  }

  async getResult(input: {
    tenantId: string;
    actorId: string;
    actorRole: string;
    runId: string;
    correlationId: string;
  }): Promise<SimulationResult> {
    return this.withTransaction(async () => {
      const run = await this.findRun(input.tenantId, input.runId);
      const scenario = await this.findScenario(input.tenantId, run.scenarioId);
      this.assertOwner(scenario, input.actorId);
      if (!run.result) {
        throw new EngineeringServiceError(404, 'RESULT_NOT_FOUND', 'Simulation result is not available.');
      }
      if (run.result.baseStateId !== run.baseStateId || run.result.baseStateVersion !== run.baseStateVersion
        || run.result.topologyVersion !== run.topologyVersion) {
        throw new EngineeringServiceError(500, 'RESULT_VERSION_MISMATCH', 'Persisted result version metadata is inconsistent.');
      }
      await this.appendAudit({
        eventId: uuidv4(),
        actorId: input.actorId,
        tenantId: input.tenantId,
        timestamp: new Date().toISOString(),
        action: 'RESULT_ACCESSED',
        resourceType: 'SIMULATION_RESULT',
        resourceId: run.result.resultId,
        scenarioId: scenario.scenarioId,
        correlationId: input.correlationId,
        resultStatus: run.executionStatus,
        baseStateId: run.baseStateId,
        baseStateVersion: run.baseStateVersion,
        topologyVersion: run.topologyVersion,
      }, input.actorRole);
      return run.result;
    });
  }

  async cancelRun(input: {
    tenantId: string;
    actorId: string;
    actorRole: string;
    runId: string;
    correlationId: string;
  }): Promise<SimulationRun> {
    return this.withTransaction(async () => {
      const run = await this.findRun(input.tenantId, input.runId);
      const scenario = await this.findScenario(input.tenantId, run.scenarioId);
      this.assertOwner(scenario, input.actorId);
      if (run.executionStatus !== 'QUEUED') {
        throw new EngineeringServiceError(409, 'RUN_NOT_CANCELLABLE', 'Only queued simulation runs can be cancelled.');
      }
      const timestamp = new Date().toISOString();
      const cancelled: SimulationRun = { ...run, executionStatus: 'CANCELLED', completedAt: timestamp };
      await this.updateRun(cancelled, input.tenantId);
      await this.persistLifecycleEvent(cancelled, 'RUN_CANCELLED', timestamp, '2');
      await this.appendAudit({
        eventId: uuidv4(),
        actorId: input.actorId,
        tenantId: input.tenantId,
        timestamp,
        action: 'SIMULATION_CANCELLED',
        resourceType: 'SIMULATION_RUN',
        resourceId: run.simulationRunId,
        scenarioId: scenario.scenarioId,
        correlationId: input.correlationId,
        resultStatus: 'CANCELLED',
        baseStateId: run.baseStateId,
        baseStateVersion: run.baseStateVersion,
        topologyVersion: run.topologyVersion,
      }, input.actorRole);
      await this.updateScenarioExecutionState(scenario, 'CANCELLED', undefined, timestamp);
      return cancelled;
    });
  }

  async listScenarioAudit(tenantId: string, actorId: string, scenarioId: string): Promise<EngineeringAuditEvent[]> {
    const scenario = await this.findScenario(tenantId, scenarioId);
    this.assertOwner(scenario, actorId);
    const rows = await this.db.all<AuditRow>(
      `SELECT id, tenant_id, actor_id, actor_role, action, resource, entity_id, outcome,
              correlation_id, details_json, previous_hash, record_hash, created_at
       FROM logistics_governance_audit
       WHERE tenant_id = ? AND entity_id = ? AND resource LIKE 'grid_engineering.%'
       ORDER BY rowid ASC`,
      [tenantId, scenarioId]
    );
    return rows.map(row => parseJson<EngineeringAuditEvent>(row.details_json));
  }

  async recordAuthorizationDenied(input: {
    tenantId: string;
    actorId: string;
    actorRole: string;
    correlationId: string;
    resourceId: string;
    details: string;
  }): Promise<void> {
    await this.withTransaction(async () => {
      await this.appendAudit({
        eventId: uuidv4(),
        actorId: input.actorId,
        tenantId: input.tenantId,
        timestamp: new Date().toISOString(),
        action: 'AUTHORIZATION_DENIED',
        resourceType: 'SCENARIO',
        resourceId: input.resourceId,
        scenarioId: input.resourceId,
        correlationId: input.correlationId,
        resultStatus: 'DENIED',
      }, input.actorRole, input.details);
    });
  }

  private async findScenario(tenantId: string, scenarioId: string): Promise<EngineeringScenario> {
    const row = await this.db.get<{ scenario_json: string }>(
      `SELECT scenario_json FROM engineering_scenarios WHERE scenario_id = ? AND tenant_id = ?`,
      [scenarioId, tenantId]
    );
    if (!row) throw new EngineeringServiceError(404, 'SCENARIO_NOT_FOUND', 'Scenario not found.');
    return parseScenario(row.scenario_json);
  }

  private assertOwner(scenario: EngineeringScenario, actorId: string): void {
    if (scenario.ownerId !== actorId) {
      throw new EngineeringServiceError(404, 'SCENARIO_NOT_FOUND', 'Scenario not found.');
    }
  }

  private async findRun(tenantId: string, runId: string): Promise<SimulationRun> {
    const row = await this.db.get<{
      simulation_run_id: string;
      tenant_id: string;
      scenario_id: string;
      scenario_version: number;
      base_state_id: string;
      base_state_version: string;
      topology_version: string;
      requested_at: string;
      started_at: string | null;
      completed_at: string | null;
      execution_status: SimulationStatus;
      engine: string;
      engine_version: string;
      provenance_json: string;
      input_provenance_json: string;
      assumptions_json: string;
      warnings_json: string;
      findings_json: string;
      artifacts_json: string;
      result_json: string | null;
      correlation_id: string;
      idempotency_key: string;
    }>(
      `SELECT simulation_run_id, tenant_id, scenario_id, scenario_version, base_state_id,
              base_state_version, topology_version, requested_at, started_at, completed_at,
              execution_status, engine, engine_version, provenance_json, input_provenance_json, assumptions_json,
              warnings_json, findings_json, artifacts_json, result_json, correlation_id,
              idempotency_key
       FROM engineering_simulation_runs
       WHERE simulation_run_id = ? AND tenant_id = ?`,
      [runId, tenantId]
    );
    if (!row) throw new EngineeringServiceError(404, 'SIMULATION_RUN_NOT_FOUND', 'Simulation run not found.');
    const run: SimulationRun = {
      simulationRunId: row.simulation_run_id,
      tenantId: row.tenant_id,
      scenarioId: row.scenario_id,
      scenarioVersion: row.scenario_version,
      baseStateId: row.base_state_id,
      baseStateVersion: row.base_state_version,
      topologyVersion: row.topology_version,
      requestedAt: row.requested_at,
      startedAt: row.started_at ?? undefined,
      completedAt: row.completed_at ?? undefined,
      executionStatus: row.execution_status,
      engine: row.engine,
      engineVersion: row.engine_version,
      provenance: parseJson<DataProvenance>(row.provenance_json),
      inputProvenance: parseJson<DataProvenance>(row.input_provenance_json),
      assumptions: parseJson<string[]>(row.assumptions_json),
      warnings: parseJson<SimulationRun['warnings']>(row.warnings_json),
      findings: parseJson<SimulationRun['findings']>(row.findings_json),
      artifacts: parseJson<SimulationRun['artifacts']>(row.artifacts_json),
      result: row.result_json ? parseJson<SimulationResult>(row.result_json) : undefined,
      correlationId: row.correlation_id,
      idempotencyKey: row.idempotency_key,
    };
    return run;
  }

  private async findRunByIdempotency(tenantId: string, idempotencyKey: string): Promise<SimulationRun | undefined> {
    const row = await this.db.get<{ simulation_run_id: string }>(
      `SELECT simulation_run_id FROM engineering_simulation_runs
       WHERE tenant_id = ? AND idempotency_key = ?`,
      [tenantId, idempotencyKey]
    );
    return row ? this.findRun(tenantId, row.simulation_run_id) : undefined;
  }

  private async insertScenarioVersion(scenario: EngineeringScenario, actorId: string, createdAt: string): Promise<void> {
    await this.db.run(
      `INSERT INTO engineering_scenario_versions
        (scenario_id, tenant_id, scenario_version, scenario_json, actor_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [scenario.scenarioId, scenario.tenantId, scenario.scenarioVersion, JSON.stringify(scenario), actorId, createdAt]
    );
  }

  private async insertRun(run: SimulationRun, tenantId: string): Promise<void> {
    await this.db.run(
      `INSERT INTO engineering_simulation_runs (
        simulation_run_id, tenant_id, scenario_id, scenario_version, base_state_id,
        base_state_version, topology_version, requested_at, started_at, completed_at,
        execution_status, engine, engine_version, provenance_json, assumptions_json,
        input_provenance_json, warnings_json, findings_json, artifacts_json, result_json,
        correlation_id, idempotency_key
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        run.simulationRunId, tenantId, run.scenarioId, run.scenarioVersion, run.baseStateId,
        run.baseStateVersion, run.topologyVersion, run.requestedAt, run.startedAt ?? null,
        run.completedAt ?? null, run.executionStatus, run.engine, run.engineVersion,
        JSON.stringify(run.provenance), JSON.stringify(run.assumptions),
        JSON.stringify(run.inputProvenance), JSON.stringify(run.warnings),
        JSON.stringify(run.findings), JSON.stringify(run.artifacts), run.result ? JSON.stringify(run.result) : null,
        run.correlationId, run.idempotencyKey,
      ]
    );
  }

  private async updateRun(run: SimulationRun, tenantId: string): Promise<void> {
    await this.db.run(
      `UPDATE engineering_simulation_runs SET
        started_at = ?, completed_at = ?, execution_status = ?, provenance_json = ?,
        warnings_json = ?, findings_json = ?, artifacts_json = ?, result_json = ?
       WHERE simulation_run_id = ? AND tenant_id = ?`,
      [
        run.startedAt ?? null, run.completedAt ?? null, run.executionStatus,
        JSON.stringify(run.provenance), JSON.stringify(run.warnings), JSON.stringify(run.findings),
        JSON.stringify(run.artifacts), run.result ? JSON.stringify(run.result) : null,
        run.simulationRunId, tenantId,
      ]
    );
  }

  private async updateScenarioExecutionState(
    scenario: EngineeringScenario,
    status: SimulationStatus,
    resultId: string | undefined,
    timestamp: string
  ): Promise<void> {
    const latest = await this.findScenario(scenario.tenantId, scenario.scenarioId);
    const updated: EngineeringScenario = {
      ...latest,
      executionState: status,
      resultIds: resultId ? [...latest.resultIds, resultId] : latest.resultIds,
      updatedAt: timestamp,
    };
    await this.db.run(
      `UPDATE engineering_scenarios
       SET scenario_json = ?, updated_at = ?
       WHERE scenario_id = ? AND tenant_id = ?`,
      [JSON.stringify(updated), timestamp, scenario.scenarioId, scenario.tenantId]
    );
  }

  private async persistLifecycleEvent(
    run: SimulationRun,
    eventType: SimulationLifecycleEvent['eventType'],
    timestamp: string,
    version: string,
    warningCode?: string
  ): Promise<void> {
    const event: SimulationLifecycleEvent = {
      eventId: uuidv4(),
      eventType,
      timestamp,
      correlationId: run.correlationId,
      scenarioId: run.scenarioId,
      simulationRunId: run.simulationRunId,
      version,
      warningCode,
    };
    await this.db.run(
      `INSERT INTO engineering_run_events
        (event_id, tenant_id, scenario_id, simulation_run_id, event_type, timestamp, correlation_id, version, payload_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.eventId, run.tenantId,
        run.scenarioId, run.simulationRunId, event.eventType, event.timestamp,
        event.correlationId, event.version, JSON.stringify(event),
      ]
    );
  }

  private async appendAudit(event: EngineeringAuditEvent, actorRole: string, extraDetails?: string): Promise<void> {
    const id = event.eventId;
    const resource = event.resourceType === 'SCENARIO'
      ? 'grid_engineering.scenario'
      : event.resourceType === 'SIMULATION_RUN'
        ? 'grid_engineering.simulation_run'
        : 'grid_engineering.simulation_result';
    const outcome = event.resultStatus;
    const detailsJson = JSON.stringify(extraDetails ? { ...event, details: extraDetails } : event);
    const createdAt = event.timestamp;
    const previous = await this.db.get<{ record_hash: string }>(
      `SELECT record_hash FROM logistics_governance_audit
       WHERE tenant_id = ? ORDER BY rowid DESC LIMIT 1`,
      [event.tenantId]
    );
    const previousHash = previous?.record_hash ?? null;
    const recordHash = createHash('sha256').update(JSON.stringify({
      id,
      tenantId: event.tenantId,
      actorId: event.actorId,
      action: event.action,
      resource,
      outcome,
      correlationId: event.correlationId,
      detailsJson,
      previousHash,
      createdAt,
    })).digest('hex');
    await this.db.run(
      `INSERT INTO logistics_governance_audit
        (id, tenant_id, actor_id, actor_role, action, resource, entity_id, outcome,
         correlation_id, details_json, previous_hash, record_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, event.tenantId, event.actorId, actorRole, event.action, resource,
        event.scenarioId, outcome, event.correlationId, detailsJson,
        previousHash, recordHash, createdAt,
      ]
    );
  }

  private withTransaction<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.transactionQueue.then(async () => {
      await this.db.beginTransaction();
      try {
        const value = await operation();
        await this.db.commit();
        return value;
      } catch (error) {
        try {
          await this.db.rollback();
        } catch (rollbackError) {
          throw new AggregateError([error, rollbackError], 'Engineering transaction and rollback both failed.');
        }
        throw error;
      }
    });
    this.transactionQueue = result.then(() => undefined, () => undefined);
    return result;
  }
}
