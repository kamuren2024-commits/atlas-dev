/**
 * KETRACO TRANSMISSION DIGITAL TWIN - TIME-SERIES, LINEAGE & RESILIENCE ENGINE
 * Phase 14: Operational Data Lineage, Time-Series & Resilience Architecture
 * 
 * Provides:
 * 1. End-to-end data lineage tracing:
 *    ALERT -> RISK -> ANALYSIS -> STATE -> TELEMETRY -> SOURCE SYSTEM -> ORIGINAL EVENT
 * 2. Time-series historical telemetry recording
 * 3. Graceful degradation: Never produces fake "healthy" numbers when upstream
 *    SCADA/EMS streams drop—explicitly reports "SCADA DATA UNAVAILABLE".
 */

import { TelemetryPoint } from './types';

export interface DataLineageTrace {
  alert_id: string;
  risk_id: string;
  analysis_type: string;
  state_snapshot_id: string;
  telemetry_points: Array<{
    asset_id: string;
    metric: string;
    value: number;
    unit: string;
    source: string;
    timestamp: string;
  }>;
  source_system: string;
  original_event_id: string;
  verified_at: string;
}

export class TimeseriesLineageEngine {
  private static telemetryStore: TelemetryPoint[] = [];
  private static lineageTraces: Map<string, DataLineageTrace> = new Map();
  private static scadaConnectionState: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED' | 'NOT_CONNECTED' = 'NOT_CONNECTED';

  public static recordTelemetry(point: TelemetryPoint): void {
    this.telemetryStore.push(point);
    if (this.telemetryStore.length > 5000) {
      this.telemetryStore.shift();
    }
  }

  public static getTelemetryHistory(assetId: string, metric?: string, limit: number = 50): TelemetryPoint[] {
    let filtered = this.telemetryStore.filter(p => p.asset_id === assetId);
    if (metric) {
      filtered = filtered.filter(p => p.metric === metric);
    }
    return filtered.slice(-limit);
  }

  public static registerLineageTrace(trace: DataLineageTrace): void {
    this.lineageTraces.set(trace.alert_id, trace);
  }

  public static getLineageTrace(alertId: string): DataLineageTrace | undefined {
    return this.lineageTraces.get(alertId);
  }

  public static getScadaStatus(): {
    status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED' | 'NOT_CONNECTED';
    last_heartbeat: string | null;
    degraded_reason?: string;
  } {
    return {
      status: this.scadaConnectionState,
      last_heartbeat: null,
      degraded_reason: this.scadaConnectionState === 'NOT_CONNECTED'
        ? 'No SCADA/EMS connector is configured'
        : this.scadaConnectionState !== 'CONNECTED'
          ? 'Upstream SCADA RTU communication is unavailable'
          : undefined
    };
  }

  public static setScadaStatus(status: 'CONNECTED' | 'DEGRADED' | 'DISCONNECTED' | 'NOT_CONNECTED'): void {
    this.scadaConnectionState = status;
  }
}
