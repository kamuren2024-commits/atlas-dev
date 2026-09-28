import type { MaintenanceWindow, OutageEvent, PlanningEvidence } from './types';

export interface ConflictRecord {
  id: string;
  type: 'OUTAGE_OVERLAP' | 'ASSET_SHARED' | 'WEATHER_EXPOSURE' | 'MAINTENANCE_OVERLAP';
  firstItemId: string;
  secondItemId: string;
  firstItemName: string;
  secondItemName: string;
  riskScore: number;
  n1ExposureImpact: number;
  congestionImpact: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  evidence: PlanningEvidence[];
}

export class ConflictDetectionEngine {
  private static instance: ConflictDetectionEngine | null = null;

  public static getInstance(): ConflictDetectionEngine {
    if (!ConflictDetectionEngine.instance) {
      ConflictDetectionEngine.instance = new ConflictDetectionEngine();
    }
    return ConflictDetectionEngine.instance;
  }

  public detectOutageConflicts(outages: OutageEvent[]): ConflictRecord[] {
    const conflicts: ConflictRecord[] = [];

    for (let i = 0; i < outages.length; i += 1) {
      for (let j = i + 1; j < outages.length; j += 1) {
        const outage1 = outages[i];
        const outage2 = outages[j];

        const timeOverlap = this.windowsOverlap(outage1.start, outage1.end, outage2.start, outage2.end);
        const assetShared = outage1.assetIds.some((id) => outage2.assetIds.includes(id));

        if (timeOverlap || assetShared) {
          const combinedN1 = outage1.n1Exposure + outage2.n1Exposure;
          const combinedCongestion = outage1.congestionImpact + outage2.congestionImpact;
          const riskScore = Math.min(100, (combinedN1 + combinedCongestion) / 2);

          let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
          if (riskScore >= 75) severity = 'CRITICAL';
          else if (riskScore >= 60) severity = 'HIGH';
          else if (riskScore >= 40) severity = 'MEDIUM';

          conflicts.push({
            id: `conflict-${outage1.id}-${outage2.id}`,
            type: assetShared ? 'ASSET_SHARED' : 'OUTAGE_OVERLAP',
            firstItemId: outage1.id,
            secondItemId: outage2.id,
            firstItemName: outage1.gridImpact,
            secondItemName: outage2.gridImpact,
            riskScore: Math.round(riskScore),
            n1ExposureImpact: Math.round(combinedN1),
            congestionImpact: Math.round(combinedCongestion),
            severity,
            message: `Outage ${outage1.id} and ${outage2.id} conflict: ${assetShared ? 'shared assets' : 'overlapping windows'} create reduced redundancy (N-1 exposure: ${Math.round(combinedN1)}).`,
            evidence: [{
              source: 'Outage conflict detection engine',
              timestamp: new Date().toISOString(),
              modelVersion: 'grid-plan-v1.0',
              inputs: ['outage schedule', 'affected assets'],
              assumptions: ['Simultaneous contingency analysis assumed'],
              confidence: 0.87,
              dataState: 'PLANNED',
            }],
          });
        }
      }
    }

    return conflicts;
  }

  public detectMaintenanceConflicts(
    maintenance: MaintenanceWindow[],
    outages: OutageEvent[],
  ): ConflictRecord[] {
    const conflicts: ConflictRecord[] = [];

    for (const maint of maintenance) {
      for (const outage of outages) {
        const timeOverlap = this.windowsOverlap(maint.start, maint.end, outage.start, outage.end);

        if (timeOverlap || maint.assetId === outage.assetIds[0]) {
          const riskScore = Math.min(100, maint.risk + (outage.risk * 1.5));

          conflicts.push({
            id: `conflict-maint-${maint.id}-outage-${outage.id}`,
            type: 'MAINTENANCE_OVERLAP',
            firstItemId: maint.id,
            secondItemId: outage.id,
            firstItemName: maint.assetName,
            secondItemName: outage.gridImpact,
            riskScore: Math.round(riskScore),
            n1ExposureImpact: outage.n1Exposure,
            congestionImpact: Math.round(maint.congestion + outage.congestionImpact),
            severity: riskScore > 80 ? 'CRITICAL' : riskScore > 60 ? 'HIGH' : 'MEDIUM',
            message: `Maintenance ${maint.id} overlaps with outage ${outage.id}, compounding operational risk.`,
            evidence: [{
              source: 'Maintenance-outage conflict detection',
              timestamp: new Date().toISOString(),
              modelVersion: 'grid-plan-v1.0',
              inputs: ['maintenance schedule', 'outage timeline'],
              assumptions: ['No emergency deferral of maintenance without explicit approval'],
              confidence: 0.85,
              dataState: 'PLANNED',
            }],
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

export const conflictDetectionEngine = ConflictDetectionEngine.getInstance();
