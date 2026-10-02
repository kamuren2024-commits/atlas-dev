import {
  AuthorityBoundary,
  AuthorityClass,
  ConfidenceClassification,
  DataProvenance,
  EngineeringContext,
  EngineeringEvidence,
  EngineeringScenario,
  EngineeringValueState,
  GridState,
  SourceProvenance,
  SourceAvailability,
  TopologySnapshot,
  SimulationRun,
  SimulationResult,
  IntegrityStatus,
  FreshnessClassification,
  GridValueSemanticClass,
} from './engineering-contracts';

export class EngineeringContextError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'EngineeringContextError';
  }
}

export interface EngineeringContextIdentity {
  id: string;
  tenantId: string;
  role?: string;
  isAuthenticated?: boolean;
}

export interface EngineeringContextBuilderInput {
  tenantId: string;
  actor: EngineeringContextIdentity;
  gridState?: GridState;
  topology?: TopologySnapshot;
  scenario?: EngineeringScenario;
  simulation?: SimulationRun | SimulationResult;
  assetId?: string;
  correlationId?: string;
  evidence?: EngineeringEvidence[];
  policy?: Record<string, unknown>;
  createdAt?: string;
}

export class EngineeringContextBuilder {
  static build(input: EngineeringContextBuilderInput): EngineeringContext {
    this.assertIdentity(input.actor, input.tenantId);
    const resolvedTenantId = input.tenantId.trim();

    const evidence = [...(input.evidence ?? [])];
    const gridState = input.gridState ? this.enforceTenant(input.gridState, resolvedTenantId, 'grid state') : undefined;
    const topology = input.topology ? this.enforceTenant(input.topology, resolvedTenantId, 'topology') : undefined;
    const scenario = input.scenario ? this.enforceTenant(input.scenario, resolvedTenantId, 'scenario') : undefined;
    const simulation = input.simulation ? this.enforceSimulationTenant(input.simulation, resolvedTenantId) : undefined;

    const gridResolution = gridState ? this.resolveGridSemanticState(gridState) : undefined;
    const topologyResolution = topology ? this.resolveTopologyState(topology) : undefined;

    const chain = [
      ...(gridState ? [this.createEvidence('GRID_STATE', gridState, 'Grid state snapshot', gridState.stateId)] : []),
      ...(topology ? [this.createEvidence('TOPOLOGY', topology, 'Topology snapshot', topology.topologyVersion)] : []),
      ...(scenario ? [this.createEvidence('SCENARIO', scenario, 'Scenario definition', scenario.scenarioId)] : []),
      ...(simulation ? [this.createEvidence('SIMULATION_RESULT', simulation, 'Simulation result', simulation.simulationRunId ?? simulation.resultId ?? 'simulation')] : []),
    ];

    const mergedEvidence = [...chain, ...evidence];
    const provenance = [
      ...(gridState ? [this.toSourceProvenance(gridState.provenance, 'grid-state', gridState.stateId, resolvedTenantId)] : []),
      ...(topology ? [this.toSourceProvenance(topology.provenance, 'topology', topology.topologyVersion, resolvedTenantId)] : []),
      ...(scenario ? [this.toSourceProvenance(scenario.provenance, 'scenario', scenario.scenarioId, resolvedTenantId)] : []),
      ...(simulation ? [this.toSourceProvenance(simulation.provenance, 'simulation', simulation.simulationRunId ?? simulation.resultId ?? 'simulation', resolvedTenantId)] : []),
    ];

    const authority: AuthorityBoundary = {
      tenantId: resolvedTenantId,
      allowedActions: ['read', 'analyze', 'scenario:view', 'simulation:view'],
      requiredAuthority: [
        'LIVE_AUTHORITATIVE',
        'LIVE_NON_AUTHORITATIVE',
        'SIMULATED',
        'PREDICTED',
        'DERIVED',
      ],
      approvalRequired: false,
      reason: 'Context assembly is limited to authenticated tenant-scoped engineering data.',
    };

    const context: EngineeringContext = {
      tenant: resolvedTenantId,
      actor: input.actor.id,
      gridState,
      topology,
      scenario,
      evidence: mergedEvidence,
      provenance,
      policy: input.policy,
      authority,
    };

    if (gridState && gridResolution && gridResolution.classification === 'SIMULATED' && scenario) {
      context.authority.reason = 'Simulation-scoped scenario context remains isolated from live authoritative telemetry.';
    }

    if (gridState && gridResolution && gridResolution.classification === 'OBSERVED' && gridState.sourceMode === 'LIVE') {
      context.authority.requiredAuthority = ['LIVE_AUTHORITATIVE'];
    }

    return context;
  }

  private static assertIdentity(actor: EngineeringContextIdentity | undefined, tenantId: string): void {
    if (!actor || !actor.id || !actor.tenantId) {
      throw new EngineeringContextError(401, 'UNAUTHENTICATED', 'An authenticated server-side Atlas identity is required.');
    }
    if (actor.isAuthenticated === false) {
      throw new EngineeringContextError(401, 'UNAUTHENTICATED', 'The supplied identity is not authenticated.');
    }
    if (actor.tenantId !== tenantId) {
      throw new EngineeringContextError(403, 'TENANT_MISMATCH', 'The actor tenant does not match the requested engineering tenant.');
    }
  }

  private static enforceTenant<T extends { tenantId: string }>(value: T, tenantId: string, label: string): T {
    if (value.tenantId !== tenantId) {
      throw new EngineeringContextError(403, 'CROSS_TENANT_CONTEXT', `Cross-tenant ${label} access is forbidden.`);
    }
    return value;
  }

  private static enforceSimulationTenant(
    value: SimulationRun | SimulationResult,
    tenantId: string,
  ): SimulationRun | SimulationResult {
    const candidateTenantId = 'tenantId' in value ? value.tenantId : undefined;
    if (candidateTenantId && candidateTenantId !== tenantId) {
      throw new EngineeringContextError(403, 'CROSS_TENANT_CONTEXT', 'Cross-tenant simulation output access is forbidden.');
    }
    return value;
  }

  static resolveGridSemanticState(gridState: GridState): { classification: GridValueSemanticClass; authorityClass: AuthorityClass } {
    const provenance = gridState.provenance;
    const mode = gridState.sourceMode;

    if (mode === 'LIVE') {
      if (provenance.authority === 'AUTHORITATIVE') {
        return { classification: 'OBSERVED', authorityClass: 'LIVE_AUTHORITATIVE' };
      }
      if (provenance.authority === 'NON_AUTHORITATIVE') {
        return { classification: 'OBSERVED', authorityClass: 'LIVE_NON_AUTHORITATIVE' };
      }
      return { classification: 'UNKNOWN', authorityClass: 'UNKNOWN' };
    }

    if (mode === 'SIMULATION' || mode === 'DEMO' || provenance.confidenceState === 'SIMULATED') {
      return { classification: 'SIMULATED', authorityClass: 'SIMULATED' };
    }

    if (provenance.confidenceState === 'PREDICTED' || mode === 'STALE') {
      return { classification: 'PREDICTED', authorityClass: 'PREDICTED' };
    }

    if (provenance.confidenceState === 'DERIVED' || provenance.confidenceState === 'UNAVAILABLE') {
      return { classification: provenance.confidenceState === 'UNAVAILABLE' ? 'UNKNOWN' : 'DERIVED', authorityClass: provenance.confidenceState === 'UNAVAILABLE' ? 'UNKNOWN' : 'DERIVED' };
    }

    return { classification: 'UNKNOWN', authorityClass: 'UNKNOWN' };
  }

  static resolveTopologyState(topology: TopologySnapshot): { classification: GridValueSemanticClass; authorityClass: AuthorityClass } {
    if (topology.source.sourceMode === 'LIVE' && topology.provenance.authority === 'AUTHORITATIVE') {
      return { classification: 'OBSERVED', authorityClass: 'LIVE_AUTHORITATIVE' };
    }
    if (topology.simulationOnly || topology.provenance.confidenceState === 'SIMULATED') {
      return { classification: 'SIMULATED', authorityClass: 'SIMULATED' };
    }
    if (topology.provenance.confidenceState === 'PREDICTED') {
      return { classification: 'PREDICTED', authorityClass: 'PREDICTED' };
    }
    return { classification: 'UNKNOWN', authorityClass: 'UNKNOWN' };
  }

  private static createEvidence(
    kind: 'GRID_STATE' | 'TOPOLOGY' | 'SCENARIO' | 'SIMULATION_RESULT',
    value: GridState | TopologySnapshot | EngineeringScenario | SimulationRun | SimulationResult,
    summary: string,
    reference: string,
  ): EngineeringEvidence {
    const source = this.toSourceProvenance(
      'provenance' in value ? value.provenance : ({
        sourceSystem: 'ATLAS',
        sourceType: 'ATLAS',
        freshness: 'UNKNOWN',
        sourceMode: 'UNAVAILABLE',
        authority: 'UNKNOWN',
        confidenceState: 'UNAVAILABLE',
        sourceState: 'SOURCE_NOT_CONFIGURED',
      } as DataProvenance),
      kind.toLowerCase(),
      reference,
      'tenantId' in value ? value.tenantId : 'unknown-tenant',
    );

    return {
      evidenceId: `${kind.toLowerCase()}-${reference}`,
      tenantId: 'tenantId' in value ? value.tenantId : 'unknown-tenant',
      type: kind,
      source,
      reference,
      summary,
      capturedAt: new Date().toISOString(),
      integrityStatus: source.integrityStatus,
    };
  }

  static toSourceProvenance(
    provenance: DataProvenance | undefined,
    sourceType: string,
    reference: string,
    tenantId: string,
  ): SourceProvenance {
    const authorityClass = this.resolveAuthorityClass(provenance);
    const freshness = provenance?.freshness ?? 'UNKNOWN';
    const confidenceClass = this.toConfidenceClass(provenance?.confidenceState ?? 'UNAVAILABLE');
    const integrityStatus = this.toIntegrityStatus(provenance?.integrityStatus ?? 'UNVERIFIED');
    const availability = this.toAvailability(provenance?.availability ?? 'UNKNOWN');

    return {
      sourceId: provenance?.sourceId ?? `${sourceType}:${reference}`,
      sourceType: (provenance?.sourceType ?? 'ATLAS') as SourceProvenance['sourceType'],
      provider: provenance?.provider ?? provenance?.sourceSystem ?? 'atlas',
      tenantId,
      capturedAt: provenance?.capturedAt ?? provenance?.observedAt ?? new Date().toISOString(),
      effectiveAt: provenance?.effectiveAt ?? provenance?.observedAt ?? provenance?.retrievedAt,
      receivedAt: provenance?.receivedAt ?? provenance?.retrievedAt,
      version: provenance?.version,
      authorityClass,
      freshness,
      integrityStatus,
      availability,
      confidenceClass,
      sourceSystem: provenance?.sourceSystem ?? 'atlas',
      sourceReference: provenance?.sourceReference ?? reference,
      sourceMode: provenance?.sourceMode ?? 'UNAVAILABLE',
    };
  }

  static resolveAuthorityClass(provenance: DataProvenance | undefined): AuthorityClass {
    if (!provenance) return 'UNKNOWN';
    const authority = provenance.authority;
    const mode = provenance.sourceMode;

    if (mode === 'LIVE' && authority === 'AUTHORITATIVE') return 'LIVE_AUTHORITATIVE';
    if (mode === 'LIVE' && authority === 'NON_AUTHORITATIVE') return 'LIVE_NON_AUTHORITATIVE';
    if (provenance.confidenceState === 'SIMULATED' || mode === 'SIMULATION' || mode === 'DEMO') return 'SIMULATED';
    if (provenance.confidenceState === 'PREDICTED') return 'PREDICTED';
    if (provenance.confidenceState === 'DERIVED') return 'DERIVED';
    if (provenance.freshness === 'STALE') return 'HISTORICAL';
    if (provenance.freshness === 'UNKNOWN' || provenance.freshness === 'UNAVAILABLE') return 'UNKNOWN';
    return 'UNKNOWN';
  }

  static toConfidenceClass(state: EngineeringValueState): ConfidenceClassification {
    switch (state) {
      case 'OBSERVED': return 'HIGH';
      case 'DERIVED': return 'MEDIUM';
      case 'SIMULATED': return 'MEDIUM';
      case 'PREDICTED': return 'LOW';
      case 'UNAVAILABLE':
      default: return 'UNKNOWN';
    }
  }

  static toIntegrityStatus(value: IntegrityStatus | undefined): IntegrityStatus {
    return value ?? 'UNVERIFIED';
  }

  static toAvailability(value: SourceAvailability | undefined): SourceAvailability {
    return value ?? 'UNKNOWN';
  }
}
