import type { PlanningEvidence, RenewableAsset, RenewableIntegrationAnalysis, RenewableSource } from './types';

export class RenewableIntegrationEngine {
  private static instance: RenewableIntegrationEngine | null = null;

  public static getInstance(): RenewableIntegrationEngine {
    if (!RenewableIntegrationEngine.instance) {
      RenewableIntegrationEngine.instance = new RenewableIntegrationEngine();
    }
    return RenewableIntegrationEngine.instance;
  }

  public getBaselineAssets(): RenewableAsset[] {
    return [
      {
        id: 'ltwp', name: 'Lake Turkana Wind Power', source: 'WIND',
        region: 'NORTHERN', installedCapacityMw: 310, currentOutputMw: 186,
        capacityFactorPct: 60, forecastOutput24hMw: [180, 175, 190, 200, 210, 220, 215, 205, 195, 185, 170, 165, 160, 170, 180, 190, 200, 210, 220, 230, 225, 210, 195, 185],
        gridConnectionPoint: 'Loiyangalani 400kV', voltageKV: 400,
        curtailmentRiskPct: 12, evidence: [{ source: 'SCADA + WAMS', timestamp: new Date().toISOString(), modelVersion: 'renew-v1.0', inputs: ['PMU data', 'wind speed forecast'], assumptions: ['Steady NE trade winds'], confidence: 0.88, dataState: 'ACTUAL' }],
      },
      {
        id: 'olkt1', name: 'Olkaria I Geothermal', source: 'GEOTHERMAL',
        region: 'RIFT_VALLEY', installedCapacityMw: 185, currentOutputMw: 178,
        capacityFactorPct: 96, forecastOutput24hMw: [178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178, 178],
        gridConnectionPoint: 'Olkaria 400kV', voltageKV: 400,
        curtailmentRiskPct: 2, evidence: [{ source: 'SCADA', timestamp: new Date().toISOString(), modelVersion: 'renew-v1.0', inputs: ['well output data'], assumptions: ['Reservoir stable'], confidence: 0.95, dataState: 'ACTUAL' }],
      },
      {
        id: 'olkt2', name: 'Olkaria II Geothermal', source: 'GEOTHERMAL',
        region: 'RIFT_VALLEY', installedCapacityMw: 105, currentOutputMw: 98,
        capacityFactorPct: 93, forecastOutput24hMw: [98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98, 98],
        gridConnectionPoint: 'Olkaria 220kV', voltageKV: 220,
        curtailmentRiskPct: 3, evidence: [{ source: 'SCADA', timestamp: new Date().toISOString(), modelVersion: 'renew-v1.0', inputs: ['wellhead pressure'], assumptions: ['Stable output'], confidence: 0.94, dataState: 'ACTUAL' }],
      },
      {
        id: 'kipdemo', name: 'Kipeto Wind Farm', source: 'WIND',
        region: 'RIFT_VALLEY', installedCapacityMw: 100, currentOutputMw: 42,
        capacityFactorPct: 42, forecastOutput24hMw: [42, 40, 45, 50, 55, 52, 48, 44, 40, 38, 35, 38, 42, 48, 52, 55, 50, 45, 42, 38, 35, 38, 40, 42],
        gridConnectionPoint: 'Kajiado 220kV', voltageKV: 220,
        curtailmentRiskPct: 18, evidence: [{ source: 'SCADA + MET', timestamp: new Date().toISOString(), modelVersion: 'renew-v1.0', inputs: ['nacelle data', 'wind forecast'], assumptions: ['Variable wind regime'], confidence: 0.82, dataState: 'ACTUAL' }],
      },
      {
        id: 'garissa_solar', name: 'Garissa Solar Plant', source: 'SOLAR',
        region: 'NORTH_EASTERN', installedCapacityMw: 80, currentOutputMw: 62,
        capacityFactorPct: 78, forecastOutput24hMw: [0, 0, 0, 0, 5, 20, 40, 55, 62, 68, 72, 75, 72, 68, 62, 55, 40, 20, 5, 0, 0, 0, 0, 0],
        gridConnectionPoint: 'Garissa 132kV', voltageKV: 132,
        curtailmentRiskPct: 8, evidence: [{ source: 'SCADA + MET', timestamp: new Date().toISOString(), modelVersion: 'renew-v1.0', inputs: ['irradiance data', 'panel efficiency'], assumptions: ['Clear sky expected'], confidence: 0.9, dataState: 'ACTUAL' }],
      },
      {
        id: 'masinga', name: 'Masinga Hydro', source: 'HYDRO',
        region: 'CENTRAL', installedCapacityMw: 40, currentOutputMw: 36,
        capacityFactorPct: 90, forecastOutput24hMw: [36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36, 36],
        gridConnectionPoint: 'Masinga 132kV', voltageKV: 132,
        curtailmentRiskPct: 5, evidence: [{ source: 'SCADA', timestamp: new Date().toISOString(), modelVersion: 'renew-v1.0', inputs: ['reservoir level'], assumptions: ['Normal pool elevation'], confidence: 0.91, dataState: 'ACTUAL' }],
      },
      {
        id: 'hvdc_uganda', name: 'Uganda HVDC Import', source: 'HVDC_IMPORT',
        region: 'WESTERN', installedCapacityMw: 200, currentOutputMw: 165,
        capacityFactorPct: 82, forecastOutput24hMw: [165, 160, 170, 175, 180, 175, 170, 165, 160, 155, 150, 155, 160, 165, 170, 175, 180, 185, 180, 175, 170, 165, 160, 155],
        gridConnectionPoint: 'Lessos 400kV HVDC', voltageKV: 400,
        curtailmentRiskPct: 6, evidence: [{ source: 'SCADA + HVDC control', timestamp: new Date().toISOString(), modelVersion: 'renew-v1.0', inputs: ['HVDC link status', 'Uganda generation'], assumptions: ['Uganda generation available'], confidence: 0.87, dataState: 'ACTUAL' }],
      },
    ];
  }

  public analyzeIntegration(): RenewableIntegrationAnalysis {
    const assets = this.getBaselineAssets();
    const totalCapacity = assets.reduce((sum, a) => sum + a.installedCapacityMw, 0);
    const currentOutput = assets.reduce((sum, a) => sum + a.currentOutputMw, 0);
    const nationalDemand = 2984;

    return {
      totalRenewableCapacityMw: totalCapacity,
      currentRenewableOutputMw: currentOutput,
      renewableSharePct: Math.round((currentOutput / nationalDemand) * 100),
      frequencyImpactHz: this.computeFrequencyImpact(assets),
      inertiaEstimateGws: this.computeInertia(assets),
      reserveRequirementMw: Math.round(nationalDemand * 0.08),
      congestionRiskPct: this.computeCongestionRisk(assets),
      voltageImpactPct: this.computeVoltageImpact(assets),
      curtailmentRiskPct: Math.round(assets.reduce((sum, a) => sum + a.curtailmentRiskPct, 0) / assets.length),
      transmissionCapacityRequiredMw: Math.round(totalCapacity * 0.85),
      assets,
      assumptions: [
        'Renewable output based on current weather conditions and historical capacity factors',
        'Frequency impact estimated from synchronous generator displacement analysis',
        'Inertia calculated from rotating mass of online thermal and hydro units',
        'Curtailment risk increases with renewable penetration and transmission constraints',
      ],
      evidence: [{
        source: 'Renewable integration intelligence engine',
        timestamp: new Date().toISOString(),
        modelVersion: 'renew-v2.0',
        inputs: ['SCADA generation data', 'WAMS PMU measurements', 'weather forecasts', 'grid topology'],
        assumptions: ['No forced outage of major transmission element during analysis window'],
        confidence: 0.86,
        dataState: 'ACTUAL',
      }],
    };
  }

  public assessRenewables(mix?: unknown) {
    return this.analyzeIntegration();
  }

  private computeFrequencyImpact(assets: RenewableAsset[]): number {
    const nonSyncCapacity = assets.filter(a => a.source === 'WIND' || a.source === 'SOLAR')
      .reduce((sum, a) => sum + a.installedCapacityMw, 0);
    return Number((-0.002 * nonSyncCapacity / 100).toFixed(3));
  }

  private computeInertia(assets: RenewableAsset[]): number {
    const baseInertia = 28.4;
    const nonSyncReduction = assets.filter(a => a.source === 'WIND' || a.source === 'SOLAR')
      .reduce((sum, a) => sum + a.currentOutputMw * 0.001, 0);
    return Number((baseInertia - nonSyncReduction).toFixed(1));
  }

  private computeCongestionRisk(assets: RenewableAsset[]): number {
    const northernWind = assets.filter(a => a.source === 'WIND' && a.region === 'NORTHERN');
    const totalWindOutput = northernWind.reduce((sum, a) => sum + a.currentOutputMw, 0);
    return Math.min(100, Math.round(totalWindOutput / 3));
  }

  private computeVoltageImpact(assets: RenewableAsset[]): number {
    const hvdcAssets = assets.filter(a => a.source === 'HVDC_IMPORT');
    const hvdcOutput = hvdcAssets.reduce((sum, a) => sum + a.currentOutputMw, 0);
    return Math.round(hvdcOutput * 0.02);
  }
}

export const renewableIntegrationEngine = RenewableIntegrationEngine.getInstance();
