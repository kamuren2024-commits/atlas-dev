import type {
  DataState,
  GridPlanningAssetState,
  LossIntelligenceReport,
  MaintenanceWindow,
  OutageEvent,
  PlanningBrief,
  PlanningDashboardState,
  PlanningEvidence,
  PlanningForecast,
  PlanningHorizon,
  Project,
  TemporalState,
} from './types';

export class GridPlanningEngine {
  private static instance: GridPlanningEngine | null = null;

  public static getInstance(): GridPlanningEngine {
    if (!GridPlanningEngine.instance) {
      GridPlanningEngine.instance = new GridPlanningEngine();
    }
    return GridPlanningEngine.instance;
  }

  public buildForecast(horizon: PlanningHorizon, scenarioName = 'base-case'): PlanningForecast {
    const baseline = {
      NOW: { demand: 8200, generation: 8600, reserve: 1200, peak: 8450, renewable: 32 },
      '24H': { demand: 8350, generation: 8725, reserve: 1325, peak: 8575, renewable: 34 },
      '7D': { demand: 8650, generation: 9060, reserve: 1410, peak: 8900, renewable: 35 },
      '30D': { demand: 8925, generation: 9310, reserve: 1385, peak: 9160, renewable: 37 },
      '1Y': { demand: 9480, generation: 10020, reserve: 1540, peak: 9735, renewable: 40 },
      '5Y': { demand: 11100, generation: 11680, reserve: 1580, peak: 11360, renewable: 46 },
      '10Y': { demand: 12750, generation: 13120, reserve: 1370, peak: 12990, renewable: 54 },
    }[horizon];

    const evidence: PlanningEvidence[] = [{
      source: 'National load & generation model',
      timestamp: new Date().toISOString(),
      modelVersion: 'grid-plan-v2.0',
      inputs: ['load forecast', 'generation plan', 'reserve margin rule'],
      assumptions: ['Demand and renewable penetration follow current trend'],
      confidence: 0.84,
      dataState: 'MODELLED',
    }];

    return {
      horizon,
      demandMw: baseline.demand,
      generationMw: baseline.generation,
      reserveMw: baseline.reserve,
      peakLoadMw: baseline.peak,
      renewableSharePct: baseline.renewable,
      scenarioName,
      confidence: 0.84,
      evidence,
    };
  }

  public createAssetState(asset: Partial<GridPlanningAssetState>): GridPlanningAssetState {
    return {
      assetId: asset.assetId ?? 'unknown',
      name: asset.name ?? 'Unknown asset',
      type: asset.type ?? 'line',
      region: asset.region ?? 'National',
      zone: asset.zone ?? 'Core',
      actualCapacity: asset.actualCapacity ?? 0,
      committedCapacity: asset.committedCapacity ?? 0,
      plannedCapacity: asset.plannedCapacity ?? 0,
      modelledCapacity: asset.modelledCapacity ?? 0,
      n1Margin: asset.n1Margin ?? 0,
      congestion: asset.congestion ?? 0,
      thermalHeadroom: asset.thermalHeadroom ?? 0,
      risk: asset.risk ?? 0,
      evidence: asset.evidence ?? [{
        source: 'Asset registry',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v2.0',
        inputs: ['asset meter data', 'asset register'],
        assumptions: ['No additional outage or maintenance assumed'],
        confidence: 0.8,
        dataState: 'ACTUAL',
      }],
    };
  }

  public getBaselineAssetStates(): GridPlanningAssetState[] {
    return [
      this.createAssetState({ assetId: 'suswa', name: 'Suswa 500kV Hub', type: 'SUBSTATION', region: 'RIFT_VALLEY', zone: 'Backbone', actualCapacity: 3200, committedCapacity: 400, plannedCapacity: 600, n1Margin: 72, congestion: 28, thermalHeadroom: 340, risk: 38 }),
      this.createAssetState({ assetId: 'nairobi_north', name: 'Nairobi North 400kV', type: 'SUBSTATION', region: 'NAIROBI', zone: 'Metro', actualCapacity: 2400, committedCapacity: 300, plannedCapacity: 500, n1Margin: 54, congestion: 62, thermalHeadroom: 180, risk: 68 }),
      this.createAssetState({ assetId: 'olkt', name: 'Olkaria 400kV', type: 'SUBSTATION', region: 'RIFT_VALLEY', zone: 'Generation Hub', actualCapacity: 1860, committedCapacity: 200, plannedCapacity: 350, n1Margin: 68, congestion: 22, thermalHeadroom: 420, risk: 32 }),
      this.createAssetState({ assetId: 'lessos', name: 'Lessos 400kV', type: 'SUBSTATION', region: 'WESTERN', zone: 'Interconnector', actualCapacity: 1600, committedCapacity: 180, plannedCapacity: 280, n1Margin: 60, congestion: 45, thermalHeadroom: 240, risk: 52 }),
      this.createAssetState({ assetId: 'mariakani', name: 'Mariakani 400kV', type: 'SUBSTATION', region: 'COASTAL', zone: 'Gateway', actualCapacity: 1400, committedCapacity: 160, plannedCapacity: 220, n1Margin: 65, congestion: 35, thermalHeadroom: 280, risk: 34 }),
      this.createAssetState({ assetId: 'kamburu', name: 'Kamburu 220kV Hydro', type: 'SUBSTATION', region: 'CENTRAL', zone: 'Generation', actualCapacity: 900, committedCapacity: 100, plannedCapacity: 150, n1Margin: 70, congestion: 18, thermalHeadroom: 360, risk: 28 }),
    ];
  }

  public computeLossIntelligence(assets: GridPlanningAssetState[]): LossIntelligenceReport {
    const totalMeasured = assets.reduce((sum, a) => sum + a.actualCapacity * 0.012, 0);
    const totalEstimated = assets.reduce((sum, a) => sum + a.actualCapacity * 0.008, 0);
    const totalModelled = assets.reduce((sum, a) => sum + a.actualCapacity * 0.015, 0);

    return {
      nationalLossMw: Number((totalMeasured * 0.7 + totalEstimated * 0.2 + totalModelled * 0.1).toFixed(1)),
      nationalLossPct: 3.97,
      regionalLosses: [
        { region: 'RIFT_VALLEY', lossMw: Number((totalMeasured * 0.28).toFixed(1)), lossPct: 3.2, trend: -0.3, abnormalDeviation: false },
        { region: 'NAIROBI', lossMw: Number((totalMeasured * 0.32).toFixed(1)), lossPct: 4.8, trend: 0.6, abnormalDeviation: true },
        { region: 'WESTERN', lossMw: Number((totalMeasured * 0.18).toFixed(1)), lossPct: 5.1, trend: 1.2, abnormalDeviation: true },
        { region: 'COASTAL', lossMw: Number((totalMeasured * 0.14).toFixed(1)), lossPct: 3.6, trend: -0.1, abnormalDeviation: false },
        { region: 'CENTRAL', lossMw: Number((totalMeasured * 0.08).toFixed(1)), lossPct: 2.8, trend: -0.2, abnormalDeviation: false },
      ],
      corridorLosses: [
        { corridor: 'Nairobi–Naivasha', lossMw: Number((totalMeasured * 0.15).toFixed(1)), lossPct: 4.2, trend: 0.4 },
        { corridor: 'Suswa–Olkaria', lossMw: Number((totalMeasured * 0.12).toFixed(1)), lossPct: 2.8, trend: -0.1 },
        { corridor: 'Lessos–Kisumu', lossMw: Number((totalMeasured * 0.1).toFixed(1)), lossPct: 5.6, trend: 0.8 },
      ],
      totalMeasuredLossMw: Number(totalMeasured.toFixed(1)),
      totalEstimatedLossMw: Number(totalEstimated.toFixed(1)),
      totalModelledLossMw: Number(totalModelled.toFixed(1)),
      forecastLossMw: Number((totalMeasured * 1.04).toFixed(1)),
      anomalyCount: 2,
      evidence: [{
        source: 'Loss intelligence engine',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v2.0',
        inputs: ['SCADA measurements', 'power flow model', 'meter calibration data'],
        assumptions: ['Measured losses derived from metered MW at boundaries', 'Estimated losses from I²R model'],
        confidence: 0.88,
        dataState: 'ACTUAL',
      }],
    };
  }

  public createPlanningDashboard(
    horizon: PlanningHorizon,
    temporalMode: TemporalState,
    dataState: DataState,
    outages: OutageEvent[],
    projects: Project[],
    maintenance: MaintenanceWindow[],
    bottlenecks: Array<{ id: string; currentImpact: number; forecastImpact: number; criticality: number; probability: number; path: string[]; }>,
  ): PlanningDashboardState {
    const forecast = this.buildForecast(horizon, 'national-base');

    const planSummary = {
      demandMw: forecast.demandMw,
      generationMw: forecast.generationMw,
      reserveMw: forecast.reserveMw,
      congestion: Math.min(100, Math.round((outages.reduce((sum, outage) => sum + outage.congestionImpact, 0) / Math.max(outages.length, 1)) * 100)),
      reliabilityScore: 100 - Math.min(50, Math.round((outages.reduce((sum, outage) => sum + outage.risk, 0) / Math.max(outages.length, 1)) * 10)),
      n1Exposure: Math.min(100, Math.round((outages.reduce((sum, outage) => sum + outage.n1Exposure, 0) / Math.max(outages.length, 1)) * 100)),
    };

    const capacity = {
      national: { installed: 12500, transfer: 8800, available: 7600, reserve: forecast.reserveMw, headroom: 1320 },
      region: {
        'RIFT_VALLEY': { installed: 4200, transfer: 3100, available: 2800, reserve: 580, headroom: 420 },
        'NAIROBI': { installed: 3300, transfer: 2400, available: 2100, reserve: 450, headroom: 350 },
        'WESTERN': { installed: 2900, transfer: 1900, available: 1700, reserve: 280, headroom: 260 },
        'COASTAL': { installed: 2600, transfer: 1800, available: 1560, reserve: 210, headroom: 180 },
        'CENTRAL': { installed: 1500, transfer: 1100, available: 960, reserve: 180, headroom: 140 },
        'NORTH_EASTERN': { installed: 800, transfer: 500, available: 420, reserve: 80, headroom: 60 },
      },
      corridor: {
        'Nairobi–Naivasha': { installed: 1600, transfer: 1100, available: 920, reserve: 180, headroom: 150 },
        'Suswa–Olkaria': { installed: 1400, transfer: 1050, available: 900, reserve: 150, headroom: 130 },
        'Lessos–Kisumu': { installed: 1200, transfer: 850, available: 720, reserve: 130, headroom: 100 },
        'Mariakani–Rabai': { installed: 1000, transfer: 700, available: 600, reserve: 100, headroom: 80 },
      },
    };

    return {
      horizon,
      temporalMode,
      dataState,
      planSummary,
      outages,
      projects,
      maintenance,
      bottlenecks: bottlenecks.map((item, index) => ({
        id: item.id ?? `bottleneck-${index + 1}`,
        name: `Critical bottleneck ${index + 1}`,
        path: item.path.length ? item.path : ['Nairobi', 'Naivasha', 'Western'],
        currentImpact: item.currentImpact ?? 65,
        forecastImpact: item.forecastImpact ?? 74,
        probability: item.probability ?? 0.7,
        criticality: item.criticality ?? 88,
        durationHours: 18,
        expansionPotentialPct: 24,
        evidence: [{
          source: 'Capacity + network model',
          timestamp: new Date().toISOString(),
          modelVersion: 'grid-plan-v2.0',
          inputs: ['thermal ratings', 'forecast demand', 'transfer limits'],
          assumptions: ['Limited overload relief during peak hours'],
          confidence: 0.82,
          dataState: 'MODELLED',
        }],
      })),
      capacity,
    };
  }

  public generatePlanningBrief(
    horizon: PlanningHorizon,
    outageSummary: string[],
    exposureSummary: string[],
    projectSummary: string[],
    riskSummary: string[],
    investmentSummary: string[],
  ): PlanningBrief {
    return {
      gridOutlook: `Grid outlook for ${horizon} is stable but increasingly constrained by regional transfer limits and weather-sensitive maintenance exposure. System demand trends upward across all horizons, requiring coordinated transmission reinforcement and maintenance scheduling.`,
      capacityPosition: 'National capacity remains adequate in the near term, but corridor headroom narrows materially under the 1Y–5Y demand growth scenario. The Nairobi–Naivasha and Lessos–Kisumu corridors face the most acute transfer constraints.',
      topConstraints: [
        'Nairobi–Naivasha corridor congestion during evening peaks (62% utilization)',
        'Thermal headroom reductions on aging transformer assets at Nairobi North 400kV',
        'Western corridor Lessos–Kisumu congestion with 5.1% regional losses',
        'Northern Loiyangalani 400kV exposure to wind variability and lightning risk',
        'Coastal corridor capacity limits during peak industrial demand periods',
      ],
      majorOutages: outageSummary.length ? outageSummary : ['No critical outage escalations present in the current operating window.'],
      maintenanceExposure: exposureSummary.length ? exposureSummary : ['Weather-driven maintenance exposure elevated in Northern and Rift Valley regions due to thunderstorm activity.'],
      projectPortfolio: projectSummary.length ? projectSummary : [
        'Nairobi Loop Reinforcement on track — 420 MW capacity gain expected',
        'Western Corridor HVDC Support in procurement — 660 MW gain pending',
        'Coastal Grid Expansion planned — 310 MW gain under review',
      ],
      futureRisks: riskSummary.length ? riskSummary : [
        'Demand growth outpacing committed transmission reinforcements by 2028',
        'Renewable intermittency increasing frequency regulation requirements',
        'Aging asset fleet requiring accelerated replacement programme',
        'Climate-driven extreme weather increasing maintenance exposure',
      ],
      priorityInvestments: investmentSummary.length ? investmentSummary : [
        'Reinforce Nairobi–Naivasha corridor with additional 400kV circuit',
        'Accelerate substation expansion at Nairobi North and Lessos',
        'Deploy energy storage for frequency support as renewable share rises',
        'Complete HVDC interconnector upgrade for increased cross-border trade',
        'Implement dynamic line rating across critical transmission corridors',
      ],
      evidence: [{
        source: 'Grid planning engine with demand and outage evidence',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v2.0',
        inputs: ['demand forecast', 'project pipeline', 'outage timeline', 'loss analytics', 'capacity model'],
        assumptions: ['No major external system shock and no uncommitted project acceleration assumed'],
        confidence: 0.87,
        dataState: 'MODELLED',
      }],
    };
  }
}

export const gridPlanningEngine = GridPlanningEngine.getInstance();
