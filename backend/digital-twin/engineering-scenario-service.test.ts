import assert from 'node:assert/strict';
import express from 'express';
import { createServer } from 'node:http';
import { test } from 'node:test';
import Database from 'better-sqlite3';
import { EngineeringKernelMigration } from '../database/migration-015-engineering-kernel';
import { AuthorizationService } from '../security/authorization-service';
import {
  DataProvenance,
  DataSource,
  EngineeringScenario,
  EngineeringSimulationProvider,
  GridState,
  GridStateProvider,
  SimulationResult,
  TopologyProvider,
  TopologySnapshot,
} from './engineering-contracts';
import {
  EngineeringScenarioDatabase,
  EngineeringScenarioService,
  EngineeringSqlParameter,
  EngineeringServiceError,
} from './engineering-scenario-service';
import { createEngineeringApiRouter } from './engineering-api-routes';
import { UnavailableEngineeringSimulationProvider } from './engineering-providers';

class MemoryDatabase implements EngineeringScenarioDatabase {
  private readonly connection = new Database(':memory:');

  constructor() {
    this.connection.pragma('foreign_keys = ON');
  }

  async initialize(): Promise<void> {
    await EngineeringKernelMigration.apply(this);
    await this.exec(`
      CREATE TABLE logistics_governance_audit (
        id TEXT PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_role TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        entity_id TEXT,
        outcome TEXT NOT NULL,
        correlation_id TEXT,
        details_json TEXT NOT NULL,
        previous_hash TEXT,
        record_hash TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL
      );
      CREATE TRIGGER IF NOT EXISTS trg_test_audit_no_update
      BEFORE UPDATE ON logistics_governance_audit BEGIN
        SELECT RAISE(ABORT, 'audit is immutable');
      END;
      CREATE TRIGGER IF NOT EXISTS trg_test_audit_no_delete
      BEFORE DELETE ON logistics_governance_audit BEGIN
        SELECT RAISE(ABORT, 'audit is immutable');
      END;
    `);
  }

  async exec(sql: string): Promise<void> {
    this.connection.exec(sql);
  }

  async run(
    sql: string,
    params: EngineeringSqlParameter[] = []
  ): Promise<{ lastID: number; changes: number }> {
    const result = this.connection.prepare(sql).run(...params);
    return { lastID: Number(result.lastInsertRowid), changes: result.changes };
  }

  async get<T = unknown>(sql: string, params: EngineeringSqlParameter[] = []): Promise<T | undefined> {
    return this.connection.prepare(sql).get(...params) as T | undefined;
  }

  async all<T = unknown>(sql: string, params: EngineeringSqlParameter[] = []): Promise<T[]> {
    return this.connection.prepare(sql).all(...params) as T[];
  }

  async beginTransaction(): Promise<void> {
    this.connection.exec('BEGIN IMMEDIATE');
  }

  async commit(): Promise<void> {
    this.connection.exec('COMMIT');
  }

  async rollback(): Promise<void> {
    this.connection.exec('ROLLBACK');
  }

  close(): void {
    this.connection.close();
  }
}

const sourceMode = 'SIMULATION' as const;
const source: DataSource = {
  sourceId: 'test-source',
  sourceSystem: 'test-fixture',
  sourceType: 'ATLAS',
  state: 'SOURCE_CONFIGURED',
  sourceMode,
  tenantId: 'tenant-a',
};
const provenance: DataProvenance = {
  sourceSystem: source.sourceSystem,
  sourceType: source.sourceType,
  sourceReference: 'fixture-v1',
  retrievedAt: '2026-01-01T00:00:00.000Z',
  observedAt: '2026-01-01T00:00:00.000Z',
  freshness: 'FRESH',
  sourceMode,
  authority: 'NON_AUTHORITATIVE',
  confidenceState: 'SIMULATED',
  sourceState: 'SOURCE_CONFIGURED',
};

function fixtureState(tenantId = 'tenant-a', version = 'state-v1'): GridState {
  return {
    stateId: 'state-1',
    version,
    timestamp: '2026-01-01T00:00:00.000Z',
    source: { ...source, tenantId },
    sourceMode,
    provenance: { ...provenance },
    tenantId,
    correlationId: 'source-correlation',
    topologyVersion: 'topology-v1',
    assets: [{
      assetId: 'asset-1',
      assetType: 'TRANSMISSION_LINE',
      name: 'fixture line',
      provenance: { ...provenance },
    }],
    relationships: [],
  };
}

function fixtureTopology(tenantId = 'tenant-a', version = 'topology-v1'): TopologySnapshot {
  return {
    topologyVersion: version,
    tenantId,
    source: { ...source, tenantId },
    provenance: { ...provenance },
    authoritative: false,
    stale: false,
    simulationOnly: true,
    assets: [{
      assetId: 'asset-1',
      assetType: 'TRANSMISSION_LINE',
      name: 'fixture line',
      provenance: { ...provenance },
    }],
    relationships: [],
  };
}

class FixtureGridStateProvider implements GridStateProvider {
  constructor(public state = fixtureState()) {}

  async getGridState(tenantId: string): Promise<GridState> {
    return { ...this.state, tenantId, source: { ...this.state.source, tenantId } };
  }

  async getGridStateVersion(tenantId: string, stateId: string, version: string): Promise<GridState> {
    return {
      ...this.state,
      stateId,
      version,
      tenantId,
      source: { ...this.state.source, tenantId },
    };
  }
}

class FixtureTopologyProvider implements TopologyProvider {
  constructor(public topology = fixtureTopology()) {}

  async getTopology(tenantId: string): Promise<TopologySnapshot> {
    return { ...this.topology, tenantId, source: { ...this.topology.source, tenantId } };
  }

  async getTopologyVersion(tenantId: string, topologyVersion: string): Promise<TopologySnapshot> {
    return {
      ...this.topology,
      topologyVersion,
      tenantId,
      source: { ...this.topology.source, tenantId },
    };
  }
}

class CompletedSimulationProvider implements EngineeringSimulationProvider {
  readonly providerId = 'fixture-solver';
  readonly providerVersion = 'test-only';
  readonly capabilities = ['CUSTOM_SCENARIO_ANALYSIS'] as const;
  calls = 0;
  beforeRun?: () => Promise<void>;
  mutateInput = false;

  async run(input: {
    scenario: EngineeringScenario;
    baseState: GridState;
    topology: TopologySnapshot;
    simulationRunId: string;
    requestedAt: string;
  }): Promise<SimulationResult> {
    this.calls += 1;
    await this.beforeRun?.();
    if (this.mutateInput) {
      input.baseState.assets.splice(0);
    }
    return {
      resultId: `result-${input.simulationRunId}`,
      simulationRunId: input.simulationRunId,
      scenarioId: input.scenario.scenarioId,
      baseStateId: input.scenario.baseGridState.stateId,
      baseStateVersion: input.scenario.baseGridState.version,
      topologyVersion: input.scenario.topologyVersion,
      status: 'COMPLETED',
      findings: [],
      warnings: [],
      artifacts: [],
      provenance: {
        ...provenance,
        sourceSystem: this.providerId,
        sourceReference: input.requestedAt,
        confidenceState: 'SIMULATED',
        sourceMode: 'SIMULATION',
        sourceState: 'SOURCE_CONFIGURED',
      },
    };
  }
}

async function setup(options: {
  tenantId?: string;
  state?: GridState;
  topology?: TopologySnapshot;
  solver?: EngineeringSimulationProvider;
} = {}) {
  const db = new MemoryDatabase();
  await db.initialize();
  const grid = new FixtureGridStateProvider(options.state ?? fixtureState(options.tenantId));
  const topology = new FixtureTopologyProvider(options.topology ?? fixtureTopology(options.tenantId));
  const service = new EngineeringScenarioService({
    db,
    gridStateProvider: grid,
    topologyProvider: topology,
    simulationProvider: options.solver ?? new UnavailableEngineeringSimulationProvider(),
  });
  return { db, grid, topology, service };
}

async function createScenario(
  service: EngineeringScenarioService,
  tenantId = 'tenant-a',
  actorId = 'engineer-a'
): Promise<EngineeringScenario> {
  return service.createScenario({
    tenantId,
    actorId,
    actorRole: 'Engineer',
    name: 'test scenario',
    scenarioClass: 'OUTAGE',
    changes: [{ targetAssetId: 'asset-1', changeType: 'OUT_OF_SERVICE' }],
    assumptions: ['test fixture only'],
    requestedAnalysis: ['CUSTOM_SCENARIO_ANALYSIS'],
    correlationId: 'request-correlation',
  });
}

test('creates tenant-owned, versioned scenarios and preserves history across service restart', async () => {
  const { db, service } = await setup();
  try {
    const created = await createScenario(service);
    assert.equal(created.scenarioVersion, 1);
    assert.equal(created.baseGridState.sourceMode, 'SIMULATION');
    assert.equal(created.provenance.confidenceState, 'SIMULATED');
    const updated = await service.updateScenario({
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      scenarioId: created.scenarioId,
      name: 'revised scenario',
      correlationId: 'update-correlation',
    });
    assert.equal(updated.scenarioVersion, 2);

    const restartedService = new EngineeringScenarioService({
      db,
      gridStateProvider: new FixtureGridStateProvider(),
      topologyProvider: new FixtureTopologyProvider(),
      simulationProvider: new UnavailableEngineeringSimulationProvider(),
    });
    const persisted = await restartedService.getScenario('tenant-a', 'engineer-a', created.scenarioId);
    assert.equal(persisted.scenarioVersion, 2);
    assert.equal(persisted.name, 'revised scenario');
    const versions = await db.all<{ scenario_version: number }>(
      'SELECT scenario_version FROM engineering_scenario_versions WHERE tenant_id = ? AND scenario_id = ? ORDER BY scenario_version',
      ['tenant-a', created.scenarioId]
    );
    assert.deepEqual(versions.map(version => version.scenario_version), [1, 2]);
    const audit = await restartedService.listScenarioAudit('tenant-a', 'engineer-a', created.scenarioId);
    assert.deepEqual(audit.map(event => event.action), ['SCENARIO_CREATED', 'SCENARIO_UPDATED']);
  } finally {
    db.close();
  }
});

test('fails closed for unavailable, stale, non-authoritative live, and mismatched topology sources', async () => {
  const cases: Array<{ state: GridState; topology: TopologySnapshot; code: string }> = [];
  const unavailable = fixtureState();
  unavailable.source.state = 'SOURCE_NOT_CONFIGURED';
  unavailable.provenance.sourceState = 'SOURCE_NOT_CONFIGURED';
  cases.push({ state: unavailable, topology: fixtureTopology(), code: 'SOURCE_UNAVAILABLE' });

  const stale = fixtureState();
  stale.sourceMode = 'STALE';
  stale.source.sourceMode = 'STALE';
  stale.provenance.sourceMode = 'STALE';
  stale.provenance.freshness = 'STALE';
  cases.push({ state: stale, topology: fixtureTopology(), code: 'SOURCE_UNAVAILABLE' });

  const nonAuthoritativeLive = fixtureState();
  nonAuthoritativeLive.sourceMode = 'LIVE';
  nonAuthoritativeLive.source.sourceMode = 'LIVE';
  nonAuthoritativeLive.provenance.sourceMode = 'LIVE';
  nonAuthoritativeLive.provenance.confidenceState = 'OBSERVED';
  nonAuthoritativeLive.provenance.authority = 'NON_AUTHORITATIVE';
  cases.push({ state: nonAuthoritativeLive, topology: fixtureTopology(), code: 'SOURCE_UNAVAILABLE' });

  cases.push({
    state: fixtureState(),
    topology: fixtureTopology('tenant-a', 'topology-v2'),
    code: 'TOPOLOGY_VERSION_MISMATCH',
  });

  for (const item of cases) {
    const { db, service } = await setup(item);
    try {
      await assert.rejects(
        () => createScenario(service),
        (error: unknown) => error instanceof EngineeringServiceError && error.code === item.code
      );
      const count = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM engineering_scenarios');
      assert.equal(count?.count, 0);
    } finally {
      db.close();
    }
  }
});

test('preserves an explicitly authoritative LIVE source as observed input without claiming a live solver', async () => {
  const liveState = fixtureState();
  liveState.sourceMode = 'LIVE';
  liveState.source.sourceMode = 'LIVE';
  liveState.provenance.sourceMode = 'LIVE';
  liveState.provenance.authority = 'AUTHORITATIVE';
  liveState.provenance.confidenceState = 'OBSERVED';
  const liveTopology = fixtureTopology();
  liveTopology.source.sourceMode = 'LIVE';
  liveTopology.provenance.sourceMode = 'LIVE';
  liveTopology.provenance.authority = 'AUTHORITATIVE';
  liveTopology.authoritative = true;
  liveTopology.simulationOnly = false;
  const { db, service } = await setup({ state: liveState, topology: liveTopology });
  try {
    const scenario = await createScenario(service);
    assert.equal(scenario.baseGridState.sourceMode, 'LIVE');
    assert.equal(scenario.provenance.confidenceState, 'OBSERVED');
    const run = await service.requestSimulation({
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      scenarioId: scenario.scenarioId,
      correlationId: 'live-input-no-solver',
      idempotencyKey: 'live-input-no-solver',
    });
    assert.equal(run.executionStatus, 'UNAVAILABLE');
    assert.equal(run.inputProvenance.sourceMode, 'LIVE');
    assert.equal(run.inputProvenance.confidenceState, 'OBSERVED');
    assert.equal(run.provenance.sourceMode, 'UNAVAILABLE');
    assert.equal(run.result?.findings.length, 0);
  } finally {
    db.close();
  }
});

test('enforces tenant and owner isolation for scenario and result access', async () => {
  const { db, service } = await setup();
  try {
    const scenario = await createScenario(service);
    await assert.rejects(
      () => service.getScenario('tenant-b', 'engineer-a', scenario.scenarioId),
      (error: unknown) => error instanceof EngineeringServiceError && error.statusCode === 404
    );
    await assert.rejects(
      () => service.getScenario('tenant-a', 'engineer-b', scenario.scenarioId),
      (error: unknown) => error instanceof EngineeringServiceError && error.statusCode === 404
    );
    const listed = await service.listScenarios('tenant-b', 'engineer-a', 50, 0);
    assert.deepEqual(listed, []);
    const run = await service.requestSimulation({
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      scenarioId: scenario.scenarioId,
      correlationId: 'tenant-isolation',
      idempotencyKey: 'tenant-isolation-key',
    });
    await assert.rejects(
      () => service.getRun('tenant-b', 'engineer-a', run.simulationRunId),
      (error: unknown) => error instanceof EngineeringServiceError && error.statusCode === 404
    );
    await assert.rejects(
      () => service.getResult({
        tenantId: 'tenant-b',
        actorId: 'engineer-a',
        actorRole: 'Engineer',
        runId: run.simulationRunId,
        correlationId: 'cross-tenant-result',
      }),
      (error: unknown) => error instanceof EngineeringServiceError && error.statusCode === 404
    );
  } finally {
    db.close();
  }
});

test('persists explicit UNAVAILABLE results, provenance, audit, lifecycle events and idempotency', async () => {
  const { db, service } = await setup();
  try {
    const scenario = await createScenario(service);
    const request = {
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      scenarioId: scenario.scenarioId,
      correlationId: 'run-correlation',
      idempotencyKey: 'same-request',
    };
    const first = await service.requestSimulation(request);
    const duplicate = await service.requestSimulation(request);
    assert.equal(first.executionStatus, 'UNAVAILABLE');
    assert.equal(first.simulationRunId, duplicate.simulationRunId);
    assert.equal(first.baseStateId, scenario.baseGridState.stateId);
    assert.equal(first.baseStateVersion, scenario.baseGridState.version);
    assert.equal(first.topologyVersion, scenario.topologyVersion);
    assert.equal(first.result?.status, 'UNAVAILABLE');
    assert.equal(first.result?.findings.length, 0);
    assert.equal(first.result?.artifacts.length, 0);
    assert.equal(first.result?.provenance.sourceMode, 'UNAVAILABLE');
    assert.equal(first.inputProvenance.sourceMode, 'SIMULATION');
    assert.equal(first.correlationId, request.correlationId);
    const persisted = await service.getRun('tenant-a', 'engineer-a', first.simulationRunId);
    assert.equal(persisted.executionStatus, 'UNAVAILABLE');
    const events = await db.all<{ event_type: string; correlation_id: string; version: string }>(
      'SELECT event_type, correlation_id, version FROM engineering_run_events WHERE simulation_run_id = ? ORDER BY rowid',
      [first.simulationRunId]
    );
    assert.deepEqual(events.map(event => event.event_type), [
      'RUN_CREATED',
      'RUN_QUEUED',
      'RUN_STARTED',
      'RUN_WARNING',
      'RUN_UNAVAILABLE',
    ]);
    assert.ok(events.every(event => event.correlation_id === request.correlationId && event.version));
    const audits = await service.listScenarioAudit('tenant-a', 'engineer-a', scenario.scenarioId);
    assert.deepEqual(audits.map(event => event.action), [
      'SCENARIO_CREATED',
      'SCENARIO_EXECUTION_REQUESTED',
      'SIMULATION_STARTED',
      'SIMULATION_UNAVAILABLE',
    ]);
    const hashes = await db.all<{ record_hash: string; previous_hash: string | null }>(
      'SELECT record_hash, previous_hash FROM logistics_governance_audit WHERE tenant_id = ? ORDER BY rowid',
      ['tenant-a']
    );
    assert.ok(hashes.every(row => row.record_hash.length === 64));
    assert.equal(hashes[0].previous_hash, null);
    assert.ok(hashes.slice(1).every((row, index) => row.previous_hash === hashes[index].record_hash));
  } finally {
    db.close();
  }
});

test('persists completed simulation as SIMULATED and does not mutate its source snapshot', async () => {
  const grid = new FixtureGridStateProvider();
  const initial = JSON.stringify(grid.state);
  const solver = new CompletedSimulationProvider();
  solver.mutateInput = true;
  const { db, service } = await setup({ state: grid.state, solver });
  try {
    const scenario = await createScenario(service);
    const run = await service.requestSimulation({
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      scenarioId: scenario.scenarioId,
      correlationId: 'simulated-run',
      idempotencyKey: 'simulated-key',
    });
    assert.equal(run.executionStatus, 'COMPLETED');
    assert.equal(run.result?.provenance.sourceMode, 'SIMULATION');
    assert.equal(run.result?.provenance.confidenceState, 'SIMULATED');
    assert.equal(JSON.stringify(grid.state), initial);
    const result = await service.getResult({
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      runId: run.simulationRunId,
      correlationId: 'result-access',
    });
    assert.equal(result.baseStateVersion, scenario.baseGridState.version);
    const audit = await service.listScenarioAudit('tenant-a', 'engineer-a', scenario.scenarioId);
    assert.ok(audit.some(event => event.action === 'RESULT_ACCESSED'));
  } finally {
    db.close();
  }
});

test('persists provider failures and rejects result version drift', async () => {
  const failingSolver: EngineeringSimulationProvider = {
    providerId: 'failing-solver',
    providerVersion: 'test',
    capabilities: ['CUSTOM_SCENARIO_ANALYSIS'],
    async run(): Promise<SimulationResult> {
      throw new Error('fixture solver failure');
    },
  };
  const { db, service } = await setup({ solver: failingSolver });
  try {
    const scenario = await createScenario(service);
    const failed = await service.requestSimulation({
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      scenarioId: scenario.scenarioId,
      correlationId: 'failure-correlation',
      idempotencyKey: 'failure-key',
    });

    test('rolls back scenario persistence when the durable audit insert fails', async () => {
      const { db, service } = await setup();
      try {
        await db.exec(`
          CREATE TRIGGER fail_engineering_audit
          BEFORE INSERT ON logistics_governance_audit BEGIN
            SELECT RAISE(ABORT, 'test audit failure');
          END;
        `);
        await assert.rejects(() => createScenario(service));
        const scenarios = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM engineering_scenarios');
        const versions = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM engineering_scenario_versions');
        assert.equal(scenarios?.count, 0);
        assert.equal(versions?.count, 0);
      } finally {
        db.close();
      }
    });

    test('records authorization denials durably', async () => {
      const { db, service } = await setup();
      try {
        await service.recordAuthorizationDenied({
          tenantId: 'tenant-a',
          actorId: 'operator-a',
          actorRole: 'Operator',
          correlationId: 'denied-request',
          resourceId: 'collection',
          details: 'Denied create access.',
        });
        const records = await db.all<{ action: string; outcome: string; correlation_id: string }>(
          'SELECT action, outcome, correlation_id FROM logistics_governance_audit WHERE tenant_id = ?',
          ['tenant-a']
        );
        assert.deepEqual(records, [{
          action: 'AUTHORIZATION_DENIED',
          outcome: 'DENIED',
          correlation_id: 'denied-request',
        }]);
      } finally {
        db.close();
      }
    });
    assert.equal(failed.executionStatus, 'FAILED');
    assert.equal(failed.result?.warnings[0]?.code, 'SOLVER_EXECUTION_FAILED');

    const driftGrid = new FixtureGridStateProvider();
    const driftService = new EngineeringScenarioService({
      db,
      gridStateProvider: {
        getGridState: (tenantId, correlationId) => driftGrid.getGridState(tenantId, correlationId),
        getGridStateVersion: async (tenantId, stateId, _version, correlationId) =>
          driftGrid.getGridStateVersion(tenantId, stateId, 'state-v2', correlationId),
      },
      topologyProvider: new FixtureTopologyProvider(),
      simulationProvider: new UnavailableEngineeringSimulationProvider(),
    });
    const driftScenario = await createScenario(driftService);
    const driftRun = await driftService.requestSimulation({
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      scenarioId: driftScenario.scenarioId,
      correlationId: 'drift-correlation',
      idempotencyKey: 'drift-key',
    });
    assert.equal(driftRun.executionStatus, 'INVALID');
    assert.equal(driftRun.baseStateVersion, driftScenario.baseGridState.version);
    assert.equal(driftRun.result?.baseStateVersion, driftScenario.baseGridState.version);
    assert.equal(driftRun.result?.warnings[0]?.code, 'BASE_STATE_VERSION_MISMATCH');
  } finally {
    db.close();
  }
});

test('serializes concurrent runs and prevents multiple active runs per scenario', async () => {
  const solver = new CompletedSimulationProvider();
  let releaseSolver!: () => void;
  solver.beforeRun = () => new Promise<void>(resolve => { releaseSolver = resolve; });
  const { db, service } = await setup({ solver });
  try {
    const scenario = await createScenario(service);
    const first = service.requestSimulation({
      tenantId: 'tenant-a',
      actorId: 'engineer-a',
      actorRole: 'Engineer',
      scenarioId: scenario.scenarioId,
      correlationId: 'concurrent-1',
      idempotencyKey: 'concurrent-key-1',
    });
    while (solver.calls === 0) await new Promise(resolve => setTimeout(resolve, 1));
    await assert.rejects(
      () => service.requestSimulation({
        tenantId: 'tenant-a',
        actorId: 'engineer-a',
        actorRole: 'Engineer',
        scenarioId: scenario.scenarioId,
        correlationId: 'concurrent-2',
        idempotencyKey: 'concurrent-key-2',
      }),
      (error: unknown) => error instanceof EngineeringServiceError && error.code === 'SIMULATION_ALREADY_ACTIVE'
    );
    releaseSolver();
    const run = await first;
    assert.equal(run.executionStatus, 'COMPLETED');
    const count = await db.get<{ count: number }>(
      'SELECT COUNT(*) AS count FROM engineering_simulation_runs WHERE scenario_id = ?',
      [scenario.scenarioId]
    );
    assert.equal(count?.count, 1);
  } finally {
    db.close();
  }
});

test('rejects unauthenticated API requests before accepting caller-supplied tenant identity', async () => {
  const db = new MemoryDatabase();
  await db.initialize();
  const app = express();
  app.use(express.json());
  app.use('/api/twin/engineering', createEngineeringApiRouter({
    db,
    authz: new AuthorizationService(),
    gridStateProvider: new FixtureGridStateProvider(),
    topologyProvider: new FixtureTopologyProvider(),
    simulationProvider: new UnavailableEngineeringSimulationProvider(),
  }));
  const server = createServer(app);
  try {
    await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
    const address = server.address();
    assert.ok(address && typeof address !== 'string');
    const response = await fetch(`http://127.0.0.1:${address.port}/api/twin/engineering/scenarios`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        tenantId: 'tenant-b',
        ownerId: 'administrator',
        role: 'ADMIN',
        name: 'unauthorized',
        scenarioClass: 'BASELINE',
      }),
    });
    assert.equal(response.status, 401);
    const count = await db.get<{ count: number }>('SELECT COUNT(*) AS count FROM engineering_scenarios');
    assert.equal(count?.count, 0);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    db.close();
  }
});
