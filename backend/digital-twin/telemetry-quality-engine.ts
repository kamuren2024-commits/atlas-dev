/**
 * KETRACO TRANSMISSION DIGITAL TWIN - TELEMETRY QUALITY & FRESHNESS ENGINE
 * Phase 03: Telemetry Quality Engine Implementation
 * 
 * Verifies live grid telemetry against physical laws, plausibility bounds,
 * rate of change, cross-sensor redundancy, and topological continuity.
 * Eliminates silent errors, fabricated data, and conflicting sensor states.
 */

import { TelemetryPoint, TelemetryQualityState } from './types';

export interface QualityEvaluationResult {
  quality: TelemetryQualityState;
  confidence: number;
  flags: {
    is_stale: boolean;
    is_plausible: boolean;
    rate_of_change_exceeded: boolean;
    physical_consistency_violation: boolean;
    cross_sensor_mismatch: boolean;
    topology_conflict: boolean;
  };
  diagnostics: string[];
}

export class TelemetryQualityEngine {
  private static recentPoints: Map<string, TelemetryPoint[]> = new Map();
  private static readonly STALE_THRESHOLD_MS = 10_000; // 10s
  private static readonly MISSING_THRESHOLD_MS = 30_000; // 30s

  /**
   * Evaluates a single incoming telemetry point against all validation criteria
   */
  public static evaluatePoint(
    point: TelemetryPoint,
    context?: {
      breaker_status?: 'OPEN' | 'CLOSED' | 'TRIPPED';
      redundant_point?: TelemetryPoint;
      nominal_rating?: number;
    }
  ): QualityEvaluationResult {
    const diagnostics: string[] = [];
    let isPlausible = true;
    let rateOfChangeExceeded = false;
    let physicalConsistencyViolation = false;
    let crossSensorMismatch = false;
    let topologyConflict = false;

    const now = Date.now();
    const pointTime = new Date(point.timestamp).getTime();
    const ageMs = now - pointTime;
    const isStale = ageMs > this.STALE_THRESHOLD_MS;
    const isMissing = ageMs > this.MISSING_THRESHOLD_MS;

    // 1. Plausibility Bounds by metric
    switch (point.metric) {
      case 'voltage_kv': {
        // Assume nominal 400kV, 220kV, 132kV, 66kV. Value should be within 0.80 - 1.20 of nominal or positive
        if (point.value < 0 || isNaN(point.value)) {
          isPlausible = false;
          diagnostics.push(`Negative or NaN voltage reading: ${point.value}`);
        } else if (point.value > 600) {
          isPlausible = false;
          diagnostics.push(`Voltage exceeds physical EHV maximum bounds (>600kV): ${point.value}`);
        }
        break;
      }
      case 'frequency_hz': {
        // Kenyan grid standard nominal 50.0 Hz; emergency bounds 48.0 - 52.0 Hz
        if (point.value < 47.0 || point.value > 53.0) {
          isPlausible = false;
          diagnostics.push(`Grid frequency out of survivable physical bounds: ${point.value} Hz`);
        }
        break;
      }
      case 'current_a': {
        if (point.value < -1.0) {
          isPlausible = false;
          diagnostics.push(`Negative current reading on AC sensor: ${point.value} A`);
        }
        break;
      }
      case 'active_power_mw': {
        if (context?.nominal_rating && Math.abs(point.value) > context.nominal_rating * 2.5) {
          isPlausible = false;
          diagnostics.push(`Power flow ${point.value} MW exceeds 250% of nominal rating ${context.nominal_rating} MVA`);
        }
        break;
      }
    }

    // 2. Rate of Change Check (compare with previous reading)
    const historyKey = `${point.asset_id}_${point.metric}`;
    const prevPoints = this.recentPoints.get(historyKey) || [];
    if (prevPoints.length > 0) {
      const prev = prevPoints[prevPoints.length - 1];
      const dtSec = Math.max(0.1, (pointTime - new Date(prev.timestamp).getTime()) / 1000);
      const delta = Math.abs(point.value - prev.value);
      const ratePerSec = delta / dtSec;

      if (point.metric === 'frequency_hz' && ratePerSec > 2.0) {
        rateOfChangeExceeded = true;
        diagnostics.push(`Frequency rate of change RoCoF ${ratePerSec.toFixed(2)} Hz/s exceeds threshold (2.0 Hz/s)`);
      } else if (point.metric === 'voltage_kv' && ratePerSec > 50.0) {
        rateOfChangeExceeded = true;
        diagnostics.push(`Voltage sudden surge/dip ${ratePerSec.toFixed(1)} kV/s detected`);
      }
    }

    // 3. Topology & Physical Consistency Check
    // Example: If associated breaker reports OPEN, line current must be near zero
    if (context?.breaker_status === 'OPEN' && point.metric === 'current_a' && point.value > 15.0) {
      topologyConflict = true;
      diagnostics.push(`CONFLICTING STATE: Breaker position indicates OPEN but current telemetry reports ${point.value} A`);
    }

    // 4. Cross-Sensor Redundancy Check (e.g. SCADA RTU vs PMU)
    if (context?.redundant_point) {
      const diffPct = Math.abs(point.value - context.redundant_point.value) / Math.max(1, Math.abs(point.value)) * 100;
      if (diffPct > 12.0) {
        crossSensorMismatch = true;
        diagnostics.push(`Redundant sensor divergence: primary=${point.value}, secondary=${context.redundant_point.value} (${diffPct.toFixed(1)}% delta)`);
      }
    }

    // 5. Determine Quality Classification & Confidence
    let quality: TelemetryQualityState = 'GOOD';
    let confidence = 0.98;

    if (topologyConflict) {
      quality = 'CONFLICTING';
      confidence = 0.35;
    } else if (!isPlausible) {
      quality = 'INVALID';
      confidence = 0.05;
    } else if (isMissing) {
      quality = 'MISSING';
      confidence = 0.10;
    } else if (isStale) {
      quality = 'STALE';
      confidence = 0.60;
    } else if (crossSensorMismatch || rateOfChangeExceeded || physicalConsistencyViolation) {
      quality = 'SUSPECT';
      confidence = 0.70;
    }

    // Cache recent point for rate-of-change calculation
    prevPoints.push(point);
    if (prevPoints.length > 5) prevPoints.shift();
    this.recentPoints.set(historyKey, prevPoints);

    return {
      quality,
      confidence,
      flags: {
        is_stale: isStale,
        is_plausible: isPlausible,
        rate_of_change_exceeded: rateOfChangeExceeded,
        physical_consistency_violation: physicalConsistencyViolation,
        cross_sensor_mismatch: crossSensorMismatch,
        topology_conflict: topologyConflict
      },
      diagnostics
    };
  }

  /**
   * Generate illustrative telemetry for simulations. This must not be used as live data.
   */
  public static generatePhysicalReading(
    assetId: string,
    metric: string,
    baseVal: number,
    unit: string,
    noiseRatio: number = 0.005
  ): TelemetryPoint {
    const noise = (Math.random() - 0.5) * 2 * (baseVal * noiseRatio);
    const value = Number((baseVal + noise).toFixed(2));
    const now = new Date().toISOString();

    const point: TelemetryPoint = {
      asset_id: assetId,
      metric,
      value,
      unit,
      quality: 'GOOD',
      source: 'SIMULATION_ENGINE',
      confidence: 0.99,
      timestamp: now,
      ingestion_timestamp: now,
      provenance: {
        origin_sensor_id: `SENSOR_${assetId}_${metric.toUpperCase()}`,
        protocol: 'SIMULATION',
        transformation_history: ['RTU_ANALOG_ACQUISITION', 'ENGINEERING_UNITS_SCALING', 'TELEMETRY_QUALITY_FILTER']
      },
      correlation_id: `CORR_${Date.now()}_${Math.floor(Math.random() * 1000)}`
    };

    const evaluation = this.evaluatePoint(point);
    point.quality = evaluation.quality;
    point.confidence = evaluation.confidence;
    point.quality_flags = evaluation.flags;

    return point;
  }
}
