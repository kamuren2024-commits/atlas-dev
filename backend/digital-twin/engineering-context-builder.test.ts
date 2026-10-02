import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DataSource,
  DataProvenance,
  EngineeringScenario,
  GridState,
  TopologySnapshot,
} from './engineering-contracts';
import { EngineeringContextBuilder, EngineeringContextError } from './engineering-context-builder';

const source: DataSource = {
  sourceId: 'atlas-live-source',
  sourceSystem: 'atlas',
  sourceType: 'ATLAS',
  state: 'SOURCE_CONFIGURED',
  sourceMode: 'LIVE',
  tenantId: 'tenant-a',
};

const liveProvenance: DataProvenance = {
  sourceSystem: 'atlas',
  sourceType: 'ATLAS',
  sourceReference: 'live-grid-state',
  retrievedAt: '2026-01-01T00:00:00.000Z',
  observedAt: '2026-01-01T00:00:00.000Z',
  capturedAt: '2026-01-01T00:00:00.000Z',
  freshness: 'FRESH',
  sourceMode: 'LIVE',
  authority: 'AUTHORITATIVE',
  confidenceState: 'OBSERVED',
  sourceState: 'SOURCE_CONFIGURED',
  integrityStatus: 'VERIFIED',
  availability: 'AVAILABLE',
  authorityClass: 'LIVE_AUTHORITATIVE',
  confidenceClass: 'HIGH',
  sourceId: 'atlas-live-source',
  tenantId: 'tenant-a',
  provider: 'Atlas',
  version: 'v1',
};

function buildGridState(overrides: Partial<GridState> = {}): GridState {
  return {
    stateId: 'state-live-1',
    version: 'v1',
    timestamp: '2026-01-01T00:00:00.000Z',
    source: { ...source, tenantId: 'tenant-a' },
    sourceMode: 'LIVE',
    provenance: { ...liveProvenance },
    tenantId: 'tenant-a',
    correlationId: 'grid-correlation',
    topologyVersion: 'topology-v1',
    assets: [{
      assetId: 'asset-1',
      assetType: 'TRANSMISSION_LINE',
      name: 'fixture line',
      provenance: { ...liveProvenance },
    }],
    relationships: [],
    ...overrides,
  };
}

function buildTopology(overrides: Partial<TopologySnapshot> = {}): TopologySnapshot {
  return {
    topologyVersion: 'topology-v1',
    tenantId: 'tenant-a',
    source: { ...source, tenantId: 'tenant-a' },
    provenance: { ...liveProvenance, sourceReference: 'live-topology' },
    authoritative: true,
    stale: false,
    simulationOnly: false,
    assets: [{
      assetId: 'asset-1',
      assetType: 'TRANSMISSION_LINE',
      name: 'fixture line',
      provenance: { ...liveProvenance },
    }],
    relationships: [],
    ...overrides,
  };
}

function buildScenario(overrides: Partial<EngineeringScenario> = {}): EngineeringScenario {
  return {
    scenarioId: 'scenario-1',
    scenarioVersion: 1,
    tenantId: 'tenant-a',
    ownerId: 'engineer-a',
    name: 'Test scenario',
    scenarioClass: 'OUTAGE',
    baseGridState: { stateId: 'state-live-1', version: 'v1', timestamp: '2026-01-01T00:00:00.000Z', sourceMode: 'LIVE' },
    topologyVersion: 'topology-v1',
    changes: [{ targetAssetId: 'asset-1', changeType: 'OUT_OF_SERVICE' }],
    assumptions: ['test assumption'],
    requestedAnalysis: ['CUSTOM_SCENARIO_ANALYSIS'],
    executionState: 'DRAFT',
    resultIds: [],
    provenance: { ...liveProvenance, sourceReference: 'scenario-input' },
    correlationId: 'scenario-correlation',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('builds a canonical engineering context with authoritative live provenance', () => {
  const context = EngineeringContextBuilder.build({
    tenantId: 'tenant-a',
    actor: { id: 'engineer-a', tenantId: 'tenant-a', role: 'Engineer', isAuthenticated: true },
    gridState: buildGridState(),
    topology: buildTopology(),
    scenario: buildScenario(),
    correlationId: 'context-correlation',
    evidence: [],
  });

  assert.equal(context.tenant, 'tenant-a');
  assert.equal(context.actor, 'engineer-a');
  assert.equal(context.gridState?.sourceMode, 'LIVE');
  assert.equal(context.provenance[0].authorityClass, 'LIVE_AUTHORITATIVE');
  assert.ok(context.evidence.some(item => item.type === 'GRID_STATE'));
  assert.ok(context.evidence.some(item => item.type === 'TOPOLOGY'));
  assert.ok(context.evidence.some(item => item.type === 'SCENARIO'));
});

test('rejects missing and cross-tenant identities before assembling protected context', async () => {
  await assert.rejects(
    () => EngineeringContextBuilder.build({
      tenantId: 'tenant-a',
      actor: { id: 'engineer-a', tenantId: 'tenant-b', isAuthenticated: true },
      gridState: buildGridState(),
    }),
    (error: unknown) => error instanceof EngineeringContextError && error.statusCode === 403
  );

  await assert.rejects(
    () => EngineeringContextBuilder.build({
      tenantId: 'tenant-a',
      actor: { id: 'engineer-a', tenantId: 'tenant-a', isAuthenticated: false },
      gridState: buildGridState(),
    }),
    (error: unknown) => error instanceof EngineeringContextError && error.statusCode === 401
  );
});

test('preserves a strict live/simulation boundary and keeps scenario-derived outputs explicitly simulated', () => {
  const simState = buildGridState({
    stateId: 'state-sim-1',
    sourceMode: 'SIMULATION',
    provenance: { ...liveProvenance, sourceMode: 'SIMULATION', authority: 'UNKNOWN', confidenceState: 'SIMULATED', authorityClass: 'SIMULATED', confidenceClass: 'MEDIUM' },
    source: { ...source, sourceMode: 'SIMULATION', state: 'SOURCE_CONFIGURED' },
  });
  const context = EngineeringContextBuilder.build({
    tenantId: 'tenant-a',
    actor: { id: 'engineer-a', tenantId: 'tenant-a', role: 'Engineer', isAuthenticated: true },
    gridState: simState,
    topology: buildTopology({
      topologyVersion: 'sim-topology-v1',
      authoritative: false,
      simulationOnly: true,
      provenance: { ...liveProvenance, sourceMode: 'SIMULATION', authority: 'UNKNOWN', confidenceState: 'SIMULATED', authorityClass: 'SIMULATED', confidenceClass: 'MEDIUM' },
    }),
    scenario: buildScenario({
      scenarioId: 'scenario-sim',
      provenance: { ...liveProvenance, sourceMode: 'SIMULATION', authority: 'UNKNOWN', confidenceState: 'SIMULATED', authorityClass: 'SIMULATED', confidenceClass: 'MEDIUM' },
    }),
    correlationId: 'sim-context',
  });

  assert.equal(context.gridState?.sourceMode, 'SIMULATION');
  assert.equal(context.provenance.some(item => item.authorityClass === 'SIMULATED'), true);
  assert.equal(context.authority.requiredAuthority.includes('LIVE_AUTHORITATIVE'), true);
  assert.equal(context.authority.reason.includes('Simulation-scoped'), true || context.authority.reason.includes('Context'));
});

test('does not upgrade non-authoritative live data into authoritative state', () => {
  const state = buildGridState({
    sourceMode: 'LIVE',
    provenance: { ...liveProvenance, authority: 'NON_AUTHORITATIVE', authorityClass: 'LIVE_NON_AUTHORITATIVE', confidenceState: 'OBSERVED', confidenceClass: 'HIGH' },
  });

  const context = EngineeringContextBuilder.build({
    tenantId: 'tenant-a',
    actor: { id: 'engineer-a', tenantId: 'tenant-a', role: 'Engineer', isAuthenticated: true },
    gridState: state,
  });

  assert.equal(context.provenance[0].authorityClass, 'LIVE_NON_AUTHORITATIVE');
  assert.equal(context.provenance[0].confidenceClass, 'HIGH');
});
