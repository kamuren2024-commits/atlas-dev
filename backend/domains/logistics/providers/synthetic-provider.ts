export type LogisticsDataMode = 'SYNTHETIC' | 'REPLAY' | 'LIVE' | 'HYBRID';

export interface LogisticsProviderMetadata {
  mode: LogisticsDataMode;
  providerName: string;
  status: 'SIMULATION_ONLY' | 'REPLAY' | 'LIVE' | 'HYBRID';
  displayLabel: string;
  isConnected: boolean;
  source: 'SYNTHETIC_DEMO_DATA' | 'REPLAY_ARCHIVE' | 'CONNECTED_PROVIDER' | 'HYBRID_DATA';
  syntheticNotice: string;
  description: string;
}

export interface LogisticsScenarioSnapshot {
  mode: LogisticsDataMode;
  provider: LogisticsProviderMetadata;
  generatedAt: string;
  operationalContext: {
    organization: string;
    geography: string;
    operatingModel: string;
    projectPortfolio: number;
    infrastructureFootprint: string;
  };
  fleet: {
    total: number;
    moving: number;
    available: number;
    maintenance: number;
    offline: number;
  };
  missions: {
    total: number;
    critical: number;
    delayed: number;
    atRisk: number;
  };
  warehouses: {
    total: number;
    operational: number;
    lowStock: number;
  };
  projects: {
    total: number;
    nearMilestone: number;
  };
}

export class SyntheticLogisticsProvider {
  public getMode(): LogisticsDataMode {
    return 'SYNTHETIC';
  }

  public getProviderMetadata(): LogisticsProviderMetadata {
    return {
      mode: 'SYNTHETIC',
      providerName: 'SyntheticLogisticsProvider',
      status: 'SIMULATION_ONLY',
      displayLabel: '● SYNTHETIC DEMO',
      isConnected: false,
      source: 'SYNTHETIC_DEMO_DATA',
      syntheticNotice: 'SYNTHETIC DEMONSTRATION DATA ONLY. Not connected to production KETRACO telematics.',
      description: 'Synthetic utility logistics scenario for Kenya transmission operations, including HQ operations, field teams, depots, corridor movements, fuel, maintenance and project logistics.'
    };
  }

  public getScenarioSnapshot(): LogisticsScenarioSnapshot {
    const generatedAt = new Date().toISOString();
    return {
      mode: 'SYNTHETIC',
      provider: this.getProviderMetadata(),
      generatedAt,
      operationalContext: {
        organization: 'KETRACO Kenya Transmission Grid Logistics',
        geography: 'Nairobi · Nakuru · Eldoret · Kisumu · Mombasa corridors',
        operatingModel: 'HQ coordination with regional depots, field maintenance teams, project logistics, and heavy transport operations',
        projectPortfolio: 27,
        infrastructureFootprint: '6,344.5 km transmission lines · 39 substations constructed · 38 completed projects'
      },
      fleet: {
        total: 86,
        moving: 54,
        available: 21,
        maintenance: 7,
        offline: 4
      },
      missions: {
        total: 23,
        critical: 4,
        delayed: 3,
        atRisk: 2
      },
      warehouses: {
        total: 6,
        operational: 4,
        lowStock: 2
      },
      projects: {
        total: 27,
        nearMilestone: 3
      }
    };
  }
}
