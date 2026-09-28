export const HEALTH_STATES = ['HEALTHY', 'DEGRADED', 'PARTIAL', 'FAILED', 'UNKNOWN'] as const;
export type HealthState = (typeof HEALTH_STATES)[number];

export interface ObservabilityMetric {
  name: string;
  value: number;
  unit: string;
  state: HealthState;
}

export interface ObservabilitySnapshot {
  platform: string;
  status: HealthState;
  metrics: ObservabilityMetric[];
  generatedAt: string;
}

export const PHASE0_OBSERVABILITY_TARGETS = {
  ingestionLatencyMs: 3000,
  processingLatencyMs: 8000,
  graphQueryLatencyMs: 250,
  workflowLatencyMs: 900,
  alertLatencyMs: 800,
  uploadThroughputMbPerMin: 180
} as const;
