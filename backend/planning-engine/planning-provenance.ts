export type PlanningDataState = 'ACTUAL' | 'FORECAST' | 'PLANNED' | 'MODELLED';

export interface PlanningProvenanceRecord {
  source: string;
  timestamp: string;
  modelVersion: string;
  inputs: string[];
  assumptions: string[];
  confidence: number;
  dataState: PlanningDataState;
  temporalMode: 'LIVE' | 'HISTORICAL' | 'FORECAST' | 'SIMULATION' | 'PLANNED' | 'FUTURE';
}

export class PlanningProvenance {
  private static instance: PlanningProvenance | null = null;

  public static getInstance(): PlanningProvenance {
    if (!PlanningProvenance.instance) {
      PlanningProvenance.instance = new PlanningProvenance();
    }
    return PlanningProvenance.instance;
  }

  public createRecord(overrides: Partial<PlanningProvenanceRecord> = {}): PlanningProvenanceRecord {
    return {
      source: overrides.source ?? 'Canonical grid data fabric',
      timestamp: overrides.timestamp ?? new Date().toISOString(),
      modelVersion: overrides.modelVersion ?? 'grid-plan-v1.0',
      inputs: overrides.inputs ?? ['load forecast', 'asset telemetry', 'network model'],
      assumptions: overrides.assumptions ?? ['No fabricated planning values are introduced'],
      confidence: overrides.confidence ?? 0.8,
      dataState: overrides.dataState ?? 'MODELLED',
      temporalMode: overrides.temporalMode ?? 'FORECAST',
    };
  }

  public attachToResult<T extends Record<string, unknown>>(result: T, record: PlanningProvenanceRecord): T & { provenance: PlanningProvenanceRecord } {
    return { ...result, provenance: record } as T & { provenance: PlanningProvenanceRecord };
  }
}

export const planningProvenance = PlanningProvenance.getInstance();
