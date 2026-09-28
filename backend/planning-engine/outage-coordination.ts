import type { OutageEvent, OutageType, OutageState, PlanningEvidence } from './types';

export class GridOutageCoordinationEngine {
  private static instance: GridOutageCoordinationEngine | null = null;

  public static getInstance(): GridOutageCoordinationEngine {
    if (!GridOutageCoordinationEngine.instance) {
      GridOutageCoordinationEngine.instance = new GridOutageCoordinationEngine();
    }
    return GridOutageCoordinationEngine.instance;
  }

  public getBaselineOutages(): OutageEvent[] {
    const now = new Date();
    const hours = (h: number) => new Date(now.getTime() + h * 3600000).toISOString();
    const days = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

    return [
      {
        id: 'OUT-4102', type: 'FORCED', state: 'ACTIVE',
        assetIds: ['nairobi_north', 'tn_nairobi_north_t1'], region: 'NAIROBI',
        start: hours(-6), end: hours(12),
        affectedLoadMw: 480, n1Exposure: 0.64, congestionImpact: 0.72,
        risk: 76, restorationEstimateMinutes: 720,
        gridImpact: 'Nairobi North 220/132 kV transformer T1 forced offline — metro ring supply reduced by 480 MW',
        alternativeSupplyMw: 320,
        evidence: [{ source: 'SCADA alarm + operator log', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['breaker trip record', 'oil temperature alarm'], assumptions: ['Transformer internal fault suspected'], confidence: 0.92, dataState: 'ACTUAL' }],
      },
      {
        id: 'OUT-5181', type: 'PLANNED', state: 'PLANNED',
        assetIds: ['tl_nai_naiv_1', 'bay_naiv_220_1'], region: 'RIFT_VALLEY',
        start: days(2), end: days(4),
        affectedLoadMw: 360, n1Exposure: 0.58, congestionImpact: 0.54,
        risk: 68, restorationEstimateMinutes: 480,
        gridImpact: 'Naivasha 220 kV Circuit 1 scheduled for conductor replacement — single circuit operation on corridor',
        alternativeSupplyMw: 280,
        evidence: [{ source: 'Maintenance request + switching plan', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['planned outage request', 'switching sequence'], assumptions: ['Weather window confirmed'], confidence: 0.88, dataState: 'PLANNED' }],
      },
      {
        id: 'OUT-7601', type: 'MAINTENANCE', state: 'UPCOMING',
        assetIds: ['mariakani_tx_bay2'], region: 'COASTAL',
        start: days(5), end: days(6),
        affectedLoadMw: 320, n1Exposure: 0.52, congestionImpact: 0.42,
        risk: 61, restorationEstimateMinutes: 360,
        gridImpact: 'Mombasa North transformer bay annual maintenance — oil replacement and bushing inspection',
        alternativeSupplyMw: 240,
        evidence: [{ source: 'EAM SAP work order', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['SAP PM order', 'isolation plan'], assumptions: ['Standard maintenance window'], confidence: 0.9, dataState: 'PLANNED' }],
      },
      {
        id: 'OUT-8201', type: 'CONSTRUCTION', state: 'ACTIVE',
        assetIds: ['lessos_expansion_bay'], region: 'WESTERN',
        start: hours(-48), end: days(14),
        affectedLoadMw: 180, n1Exposure: 0.35, congestionImpact: 0.28,
        risk: 42, restorationEstimateMinutes: 1440,
        gridImpact: 'Lessos 400kV substation expansion — new bay construction requiring partial bus isolation',
        alternativeSupplyMw: 160,
        evidence: [{ source: 'Construction progress report', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['site report', 'engineering plan'], assumptions: ['Construction on schedule'], confidence: 0.85, dataState: 'COMMITTED' }],
      },
      {
        id: 'OUT-9001', type: 'PROTECTION', state: 'RESTORING',
        assetIds: ['loiyangalani_400'], region: 'NORTHERN',
        start: hours(-2), end: hours(1),
        affectedLoadMw: 260, n1Exposure: 0.48, congestionImpact: 0.56,
        risk: 58, restorationEstimateMinutes: 60,
        gridImpact: 'Loiyangalani 400kV protection relay operation on Phase-B ground fault — auto-reclose successful, monitoring',
        alternativeSupplyMw: 200,
        evidence: [{ source: 'WAMS PMU + protection log', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['relay event record', 'PMU disturbance capture'], assumptions: ['Transient fault, auto-reclose successful'], confidence: 0.91, dataState: 'ACTUAL' }],
      },
    ];
  }

  public unifyOutages(outages: Partial<OutageEvent>[]): OutageEvent[] {
    return outages.map((outage, index) => ({
      id: outage.id ?? `outage-${index + 1}`,
      type: outage.type ?? 'PLANNED',
      state: outage.state ?? 'PLANNED',
      assetIds: outage.assetIds ?? ['asset-unknown'],
      region: outage.region ?? 'National',
      start: outage.start ?? new Date().toISOString(),
      end: outage.end ?? new Date(Date.now() + 3600000).toISOString(),
      affectedLoadMw: outage.affectedLoadMw ?? 0,
      n1Exposure: outage.n1Exposure ?? 0,
      congestionImpact: outage.congestionImpact ?? 0,
      risk: outage.risk ?? 0,
      restorationEstimateMinutes: outage.restorationEstimateMinutes ?? 120,
      gridImpact: outage.gridImpact ?? 'Regional transfer reduction',
      alternativeSupplyMw: outage.alternativeSupplyMw ?? 0,
      evidence: outage.evidence ?? [{
        source: 'Outage coordination model',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v2.0',
        inputs: ['SCADA status', 'switching plan', 'maintenance request'],
        assumptions: ['Nominal restoration within standard window'],
        confidence: 0.8,
        dataState: 'PLANNED',
      }],
    }));
  }

  public assessOutageImpact(outage: OutageEvent): {
    gridImpact: string;
    affectedAssets: string[];
    affectedLoadMw: number;
    alternativeSupplyMw: number;
    n1Exposure: number;
    congestionImpact: number;
    risk: number;
    restorationEstimateMinutes: number;
    evidence: PlanningEvidence[];
  } {
    const residualLoad = Math.max(0, outage.affectedLoadMw - outage.alternativeSupplyMw);
    const n1Risk = outage.n1Exposure > 0.6 ? 'HIGH' : outage.n1Exposure > 0.4 ? 'MEDIUM' : 'LOW';

    return {
      gridImpact: `${outage.gridImpact}. Residual unmet load: ${residualLoad} MW. N-1 risk: ${n1Risk}.`,
      affectedAssets: outage.assetIds,
      affectedLoadMw: outage.affectedLoadMw,
      alternativeSupplyMw: outage.alternativeSupplyMw,
      n1Exposure: outage.n1Exposure,
      congestionImpact: outage.congestionImpact,
      risk: outage.risk,
      restorationEstimateMinutes: outage.restorationEstimateMinutes,
      evidence: outage.evidence,
    };
  }

  public categorizeByState(outages: OutageEvent[]): Record<OutageState, OutageEvent[]> {
    const result: Record<OutageState, OutageEvent[]> = {
      ACTIVE: [], PLANNED: [], UPCOMING: [], HIGH_RISK: [], RESTORING: [], COMPLETED: [],
    };
    for (const outage of outages) {
      const cat = this.categorizeOutage(outage);
      result[cat].push(outage);
    }
    return result;
  }

  private categorizeOutage(outage: OutageEvent): OutageState {
    if (outage.state === 'RESTORING') return 'RESTORING';
    if (outage.state === 'COMPLETED') return 'COMPLETED';
    if (outage.risk >= 70) return 'HIGH_RISK';
    if (outage.state === 'ACTIVE') return 'ACTIVE';
    if (outage.state === 'PLANNED') return 'PLANNED';
    return 'UPCOMING';
  }

  public detectConflicts(outages: OutageEvent[]): Array<{ id: string; firstOutageId: string; secondOutageId: string; risk: number; message: string; }> {
    const conflicts: Array<{ id: string; firstOutageId: string; secondOutageId: string; risk: number; message: string; }> = [];

    for (let i = 0; i < outages.length; i += 1) {
      for (let j = i + 1; j < outages.length; j += 1) {
        const first = outages[i];
        const second = outages[j];
        const overlap = this.windowsOverlap(first.start, first.end, second.start, second.end);
        const assetOverlap = first.assetIds.some((asset) => second.assetIds.includes(asset));
        const regionMatch = first.region === second.region;
        const combinedN1 = first.n1Exposure + second.n1Exposure;
        const combinedRisk = Math.min(1, combinedN1 / 1.2 + (first.congestionImpact + second.congestionImpact) * 0.3);

        if (overlap && (assetOverlap || (regionMatch && combinedN1 > 0.8))) {
          conflicts.push({
            id: `conflict-${first.id}-${second.id}`,
            firstOutageId: first.id,
            secondOutageId: second.id,
            risk: Number((combinedRisk * 100).toFixed(0)),
            message: assetOverlap
              ? `CRITICAL: ${first.id} and ${second.id} share assets with overlapping windows — N-1 compliance at risk.`
              : `HIGH: ${first.id} and ${second.id} overlap in ${first.region} with combined N-1 exposure ${(combinedN1 * 100).toFixed(0)}%.`,
          });
        } else if (overlap && regionMatch && (combinedN1 > 0.6)) {
          conflicts.push({
            id: `warning-${first.id}-${second.id}`,
            firstOutageId: first.id,
            secondOutageId: second.id,
            risk: Number((combinedRisk * 80).toFixed(0)),
            message: `WARNING: ${first.id} and ${second.id} overlap in ${first.region} — reduced redundancy with combined exposure ${(combinedN1 * 100).toFixed(0)}%.`,
          });
        }
      }
    }

    return conflicts;
  }

  private windowsOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
    const aStart = new Date(startA).getTime();
    const aEnd = new Date(endA).getTime();
    const bStart = new Date(startB).getTime();
    const bEnd = new Date(endB).getTime();
    return aStart <= bEnd && bStart <= aEnd;
  }
}

export const gridOutageCoordinationEngine = GridOutageCoordinationEngine.getInstance();
