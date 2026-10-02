import {
  DataProvenance,
  EngineeringAnalysisCapability,
  EngineeringSimulationProvider,
  GridState,
  GridStateProvider,
  SimulationResult,
  TopologyProvider,
  TopologySnapshot,
} from './engineering-contracts';

export class EngineeringSourceError extends Error {
  constructor(
    public readonly code:
      | 'SOURCE_NOT_CONFIGURED'
      | 'SOURCE_UNAVAILABLE'
      | 'SOURCE_STALE'
      | 'SOURCE_ERROR'
      | 'TOPOLOGY_SOURCE_UNAVAILABLE',
    message: string
  ) {
    super(message);
    this.name = 'EngineeringSourceError';
  }
}

function unavailableProvenance(): DataProvenance {
  return {
    sourceSystem: 'Atlas',
    sourceType: 'ATLAS',
    freshness: 'UNAVAILABLE',
    sourceMode: 'UNAVAILABLE',
    authority: 'UNKNOWN',
    confidenceState: 'UNAVAILABLE',
    sourceState: 'SOURCE_NOT_CONFIGURED',
  };
}

export class UnavailableGridStateProvider implements GridStateProvider {
  async getGridState(_tenantId: string, _correlationId: string): Promise<GridState> {
    throw new EngineeringSourceError(
      'SOURCE_NOT_CONFIGURED',
      'No authoritative grid-state source is configured.'
    );
  }

  async getGridStateVersion(
    _tenantId: string,
    _stateId: string,
    _version: string,
    _correlationId: string
  ): Promise<GridState> {
    throw new EngineeringSourceError(
      'SOURCE_NOT_CONFIGURED',
      'No versioned grid-state source is configured.'
    );
  }
}

export class UnavailableTopologyProvider implements TopologyProvider {
  async getTopology(_tenantId: string, _correlationId: string): Promise<TopologySnapshot> {
    throw new EngineeringSourceError(
      'TOPOLOGY_SOURCE_UNAVAILABLE',
      'TOPOLOGY_SOURCE_UNAVAILABLE'
    );
  }

  async getTopologyVersion(
    _tenantId: string,
    _topologyVersion: string,
    _correlationId: string
  ): Promise<TopologySnapshot> {
    throw new EngineeringSourceError(
      'TOPOLOGY_SOURCE_UNAVAILABLE',
      'TOPOLOGY_SOURCE_UNAVAILABLE'
    );
  }
}

export class UnavailableEngineeringSimulationProvider implements EngineeringSimulationProvider {
  readonly providerId = 'unavailable';
  readonly providerVersion = '1';
  readonly capabilities: readonly EngineeringAnalysisCapability[] = [];

  async run(request: {
    scenario: { scenarioId: string };
    baseState: GridState;
    topology: TopologySnapshot;
    simulationRunId: string;
    requestedAt: string;
  }): Promise<SimulationResult> {
    return {
      resultId: `unavailable:${request.simulationRunId}`,
      simulationRunId: request.simulationRunId,
      scenarioId: request.scenario.scenarioId,
      baseStateId: request.baseState.stateId,
      baseStateVersion: request.baseState.version,
      topologyVersion: request.topology.topologyVersion,
      status: 'UNAVAILABLE',
      findings: [],
      warnings: [{
        code: 'SOLVER_UNAVAILABLE',
        message: 'No validated engineering simulation provider is configured.',
        provenance: unavailableProvenance(),
      }],
      artifacts: [],
      provenance: {
        ...unavailableProvenance(),
        retrievedAt: request.requestedAt,
        sourceReference: this.providerId,
      },
    };
  }
}
