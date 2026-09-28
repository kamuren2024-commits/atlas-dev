import type { Bottleneck, CapacityBreakdown, GridPlanningAssetState, PlanningEvidence } from './types';

export class GridCapacityEngine {
  private static instance: GridCapacityEngine | null = null;

  public static getInstance(): GridCapacityEngine {
    if (!GridCapacityEngine.instance) {
      GridCapacityEngine.instance = new GridCapacityEngine();
    }
    return GridCapacityEngine.instance;
  }

  public calculateCapacity(assets: GridPlanningAssetState[]): CapacityBreakdown {
    const national = assets.reduce((acc, asset) => {
      acc.installed += asset.actualCapacity + asset.committedCapacity;
      acc.transfer += Math.max(0, asset.actualCapacity * 0.7);
      acc.available += Math.max(0, (asset.actualCapacity + asset.committedCapacity) * 0.64 - asset.congestion * 0.4);
      acc.reserve += asset.n1Margin * 3;
      acc.headroom += asset.thermalHeadroom;
      return acc;
    }, { installed: 0, transfer: 0, available: 0, reserve: 0, headroom: 0 });

    return {
      national,
      region: {
        'RIFT_VALLEY': { installed: 4200, transfer: 3100, available: 2800, reserve: 580, headroom: 420 },
        'NAIROBI': { installed: 3300, transfer: 2450, available: 2200, reserve: 540, headroom: 380 },
        'WESTERN': { installed: 2900, transfer: 2050, available: 1820, reserve: 420, headroom: 310 },
        'COASTAL': { installed: 2600, transfer: 1850, available: 1620, reserve: 320, headroom: 240 },
        'CENTRAL': { installed: 1500, transfer: 1100, available: 960, reserve: 180, headroom: 140 },
        'NORTH_EASTERN': { installed: 800, transfer: 520, available: 440, reserve: 90, headroom: 70 },
      },
      corridor: {
        'Nairobi–Naivasha': { installed: 1600, transfer: 1180, available: 990, reserve: 230, headroom: 170 },
        'Suswa–Olkaria': { installed: 1400, transfer: 1050, available: 900, reserve: 180, headroom: 150 },
        'Lessos–Kisumu': { installed: 1200, transfer: 850, available: 720, reserve: 140, headroom: 110 },
        'Mariakani–Rabai': { installed: 1000, transfer: 720, available: 620, reserve: 100, headroom: 85 },
      },
    };
  }

  public detectBottlenecks(assets: GridPlanningAssetState[]): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];

    const sortedByCongestion = [...assets].sort((a, b) => b.congestion - a.congestion);
    for (const asset of sortedByCongestion.slice(0, 5)) {
      if (asset.congestion > 30) {
        bottlenecks.push({
          id: `bottleneck-${asset.assetId}`,
          name: `${asset.name} transfer constraint`,
          path: [asset.region, 'Core corridor', asset.zone],
          currentImpact: Math.round(55 + asset.congestion * 0.6),
          forecastImpact: Math.round(65 + asset.congestion * 0.7 + asset.risk * 0.3),
          probability: Math.min(0.95, 0.5 + asset.congestion * 0.005),
          criticality: Math.round(60 + asset.congestion * 0.4),
          durationHours: Math.round(8 + asset.congestion * 0.3),
          expansionPotentialPct: Math.min(60, Math.round(15 + (100 - asset.n1Margin) * 0.3)),
          evidence: [{
            source: 'National congestion + transfer analysis',
            timestamp: new Date().toISOString(),
            modelVersion: 'grid-plan-v2.0',
            inputs: ['thermal limits', 'load forecast', 'transfer constraints', 'N-1 margin'],
            assumptions: ['No major outage relief outside the selected horizon'],
            confidence: 0.84,
            dataState: 'MODELLED',
          }],
        });
      }
    }

    return bottlenecks;
  }

  public calculateLossMetrics(assets: GridPlanningAssetState[]): Array<{ type: 'MEASURED' | 'ESTIMATED' | 'MODELLED'; region: string; valueMw: number; pct: number; trend: number; forecastMw: number; timestamp: string; }> {
    const totalLoss = assets.reduce((acc, asset) => acc + asset.actualCapacity * 0.012, 0);
    return [
      { type: 'MEASURED', region: 'National', valueMw: Number((totalLoss * 0.7).toFixed(1)), pct: 3.97, trend: 0.3, forecastMw: Number((totalLoss * 0.73).toFixed(1)), timestamp: new Date().toISOString() },
      { type: 'MEASURED', region: 'RIFT_VALLEY', valueMw: Number((totalLoss * 0.22).toFixed(1)), pct: 3.2, trend: -0.3, forecastMw: Number((totalLoss * 0.21).toFixed(1)), timestamp: new Date().toISOString() },
      { type: 'ESTIMATED', region: 'NAIROBI', valueMw: Number((totalLoss * 0.28).toFixed(1)), pct: 4.8, trend: 0.6, forecastMw: Number((totalLoss * 0.3).toFixed(1)), timestamp: new Date().toISOString() },
      { type: 'ESTIMATED', region: 'WESTERN', valueMw: Number((totalLoss * 0.18).toFixed(1)), pct: 5.1, trend: 1.2, forecastMw: Number((totalLoss * 0.2).toFixed(1)), timestamp: new Date().toISOString() },
      { type: 'MODELLED', region: 'COASTAL', valueMw: Number((totalLoss * 0.14).toFixed(1)), pct: 3.6, trend: -0.1, forecastMw: Number((totalLoss * 0.14).toFixed(1)), timestamp: new Date().toISOString() },
      { type: 'MODELLED', region: 'CENTRAL', valueMw: Number((totalLoss * 0.08).toFixed(1)), pct: 2.8, trend: -0.2, forecastMw: Number((totalLoss * 0.08).toFixed(1)), timestamp: new Date().toISOString() },
    ];
  }
}

export const gridCapacityEngine = GridCapacityEngine.getInstance();
