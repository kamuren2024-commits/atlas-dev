// GridStateEngine - KETRACO Phase 06 National Grid State Calculation Engine

import { GridAsset, TransmissionLine, GridAlarm, GridEvent } from '../types';
import { GridOverallState, GridStateAssessment, StateDriver } from './types';

export class GridStateEngine {
  public static evaluateState(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>,
    alarms: GridAlarm[],
    events: GridEvent[] = []
  ): GridStateAssessment {
    return this.evaluateGridState(substations, lines, alarms, events);
  }

  public static computeHealthScore(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>,
    alarms: GridAlarm[]
  ): { overallHealthScore: number; grade: string; dimensions: { name: string; score: number; weight: number }[] } {
    const assessment = this.evaluateGridState(substations, lines, alarms, []);
    const overallHealthScore = Math.max(0, Math.min(100, 100 - assessment.stressScore * 0.65));

    return {
      overallHealthScore: Math.round(overallHealthScore),
      grade: overallHealthScore >= 85 ? 'EXCELLENT' : overallHealthScore >= 70 ? 'GOOD' : overallHealthScore >= 55 ? 'ADEQUATE' : 'CRITICAL',
      dimensions: [
        { name: 'Operational Stability', score: Math.max(0, 100 - assessment.stressScore), weight: 18 },
        { name: 'Asset Health', score: 78, weight: 14 },
        { name: 'Transmission Capacity', score: 100 - assessment.congestedCorridorsCount * 10, weight: 16 },
        { name: 'Reserve Adequacy', score: 100 - Math.max(0, 20 - assessment.reserveMarginPct), weight: 12 },
        { name: 'N-1 Redundancy', score: 100 - Math.min(50, assessment.congestedCorridorsCount * 12), weight: 10 },
        { name: 'Risk Exposure', score: 100 - assessment.overallGridRiskScore, weight: 14 },
        { name: 'Outage Penalty', score: 90, weight: 8 },
        { name: 'Data Quality', score: assessment.dataConfidencePct, weight: 8 }
      ]
    };
  }

  /**
   * Computes the complete National Grid State, Stress Score, Stability Index, and Top 5 Drivers
   */
  public static evaluateGridState(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>,
    alarms: GridAlarm[],
    events: GridEvent[]
  ): GridStateAssessment {
    const subList = Object.values(substations);
    const lineList = Object.values(lines);

    // 1. Grid Frequency
    const suswa = substations['suswa'];
    const frequencyHz = suswa?.telemetry.frequencyHz?.value || 50.02;
    const freqDelta = Math.abs(frequencyHz - 50.0);
    const freqStress = Math.min(100, (freqDelta / 0.5) * 100);

    // 2. Bus Voltages (PU evaluation)
    let maxVoltageDeviationPU = 0;
    let voltageViolationsCount = 0;
    subList.forEach(sub => {
      const nominal = sub.voltageLevelKV || 220;
      const measured = sub.telemetry.voltageKV?.value || nominal;
      const pu = measured / nominal;
      const dev = Math.abs(pu - 1.0);
      if (dev > maxVoltageDeviationPU) maxVoltageDeviationPU = dev;
      if (pu < 0.95 || pu > 1.05) voltageViolationsCount++;
    });
    const voltageStress = Math.min(100, (maxVoltageDeviationPU / 0.1) * 100);

    // 3. Transmission Loading & Congestion
    let totalLineLoading = 0;
    let maxLineLoading = 0;
    let congestedLinesCount = 0;
    lineList.forEach(l => {
      totalLineLoading += l.loadingPct;
      if (l.loadingPct > maxLineLoading) maxLineLoading = l.loadingPct;
      if (l.loadingPct >= 80) congestedLinesCount++;
    });
    const avgLineLoading = lineList.length > 0 ? totalLineLoading / lineList.length : 60;
    const loadingStress = Math.min(100, Math.max(0, (maxLineLoading - 60) * 2.5));

    // 4. Generation, Demand & Spinning Reserve
    const totalGenerationMW = 2345;
    const systemDemandMW = 2178;
    const spinningReserveMW = totalGenerationMW - systemDemandMW;
    const reserveMarginPct = (spinningReserveMW / systemDemandMW) * 100;
    const reserveStress = reserveMarginPct < 5 ? 100 : reserveMarginPct < 8 ? 70 : reserveMarginPct < 12 ? 30 : 5;

    // 5. Active Outages & Critical Alarms
    const criticalAlarmsCount = alarms.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length;
    const warningAlarmsCount = alarms.filter(a => a.severity === 'WARNING').length;
    const alarmStress = Math.min(100, criticalAlarmsCount * 25 + warningAlarmsCount * 5);

    // 6. Asset Health Degradation
    const criticalAssetsAtRisk = subList.filter(s => s.healthScore < 80 || s.riskScore > 65);
    const assetHealthStress = Math.min(100, (criticalAssetsAtRisk.length / Math.max(1, subList.length)) * 180);

    // 7. Transmission Availability
    const inServiceLines = lineList.filter(l => l.status === 'IN_SERVICE').length;
    const transmissionAvailabilityPct = Number(((inServiceLines / Math.max(1, lineList.length)) * 100).toFixed(1));
    const availabilityStress = transmissionAvailabilityPct < 90 ? 80 : transmissionAvailabilityPct < 95 ? 40 : 5;

    // 8. N-1 Compliance
    const n1Violations = lineList.filter(l => l.loadingPct > 85).length;
    const n1ComplianceStatus: 'COMPLIANT' | 'VIOLATION_WATCH' | 'CRITICAL_VIOLATION' = 
      n1Violations > 1 ? 'CRITICAL_VIOLATION' : n1Violations === 1 ? 'VIOLATION_WATCH' : 'COMPLIANT';
    const n1Stress = n1ComplianceStatus === 'CRITICAL_VIOLATION' ? 85 : n1ComplianceStatus === 'VIOLATION_WATCH' ? 45 : 0;

    // Calculate Composite Stress Score (0 - 100)
    const compositeStressScore = Math.round(
      freqStress * 0.20 +
      voltageStress * 0.15 +
      loadingStress * 0.18 +
      reserveStress * 0.15 +
      n1Stress * 0.12 +
      alarmStress * 0.10 +
      assetHealthStress * 0.05 +
      availabilityStress * 0.05
    );

    // Derive Overall Grid State
    let state: GridOverallState = 'NORMAL';
    if (compositeStressScore >= 85 || frequencyHz < 49.6 || frequencyHz > 50.4) {
      state = 'EMERGENCY';
    } else if (compositeStressScore >= 68 || n1ComplianceStatus === 'CRITICAL_VIOLATION') {
      state = 'CRITICAL';
    } else if (compositeStressScore >= 48 || congestedLinesCount >= 2) {
      state = 'STRESSED';
    } else if (compositeStressScore >= 30 || criticalAlarmsCount > 0) {
      state = 'WATCH';
    } else if (compositeStressScore >= 15) {
      state = 'STABLE';
    } else {
      state = 'NORMAL';
    }

    const stabilityIndex = Math.max(0, 100 - compositeStressScore);

    // Build Detailed State Drivers
    const drivers: StateDriver[] = [
      {
        id: 'drv_corridor_loading',
        category: 'LOADING',
        metric: 'Max Line Loading (Suswa-Isinya 400kV)',
        currentValue: `${maxLineLoading.toFixed(1)}%`,
        nominalValue: '< 70.0%',
        unit: '%',
        severity: maxLineLoading > 85 ? 'CRITICAL' : maxLineLoading > 75 ? 'HIGH' : 'NORMAL',
        contributionPct: 28,
        description: 'Heavy thermal transfer across Rift Valley - Nairobi interconnector corridor',
        source: 'SCADA_EMS',
        driver: 'Suswa–Isinya corridor loading',
        severityScore: Math.max(0, Math.min(100, Math.round(maxLineLoading * 1.2))),
        explanation: 'Load on the Suswa–Isinya corridor is pushing close to thermal limit and reducing contingency headroom.',
        recommendedMitigation: 'Redispatch generation and evaluate thermal relief actions on the primary corridor.'
      },
      {
        id: 'drv_frequency',
        category: 'FREQUENCY',
        metric: 'Grid System Frequency',
        currentValue: `${frequencyHz.toFixed(3)}`,
        nominalValue: '50.000',
        unit: 'Hz',
        severity: freqDelta > 0.15 ? 'CRITICAL' : freqDelta > 0.05 ? 'WATCH' : 'NORMAL',
        contributionPct: 22,
        description: 'Frequency within operational statutory limits (49.85 - 50.15 Hz)',
        source: 'WAMS_PMU',
        driver: 'System frequency deviation',
        severityScore: Math.max(0, Math.min(100, Math.round((freqDelta / 0.5) * 100))),
        explanation: 'Frequency deviation indicates a mismatch between system generation and dispatch response.',
        recommendedMitigation: 'Validate governor response and adjust dispatch to restore frequency support.'
      },
      {
        id: 'drv_reserve_margin',
        category: 'RESERVE',
        metric: 'Spinning Reserve Margin',
        currentValue: `${reserveMarginPct.toFixed(1)}% (${spinningReserveMW} MW)`,
        nominalValue: '> 10.0%',
        unit: '%',
        severity: reserveMarginPct < 8 ? 'HIGH' : reserveMarginPct < 10 ? 'WATCH' : 'NORMAL',
        contributionPct: 18,
        description: 'Secondary governor reserve headroom available from Olkaria & Seven Forks Hydro',
        source: 'SCADA_EMS',
        driver: 'Spinning reserve adequacy',
        severityScore: Math.max(0, Math.min(100, Math.round((10 - reserveMarginPct) * 12))),
        explanation: 'Reserve margin is thin and may not cover sudden loss of the most critical export corridor.',
        recommendedMitigation: 'Commit fast-ramping hydro reserve and confirm spinning reserve dispatch before further stress.'
      },
      {
        id: 'drv_voltage_pu',
        category: 'VOLTAGE',
        metric: 'Suswa 400kV Bus Voltage',
        currentValue: `${(suswa?.telemetry.voltageKV?.value || 403.2).toFixed(1)} kV (1.008 pu)`,
        nominalValue: '400.0 kV (1.00 pu)',
        unit: 'kV',
        severity: maxVoltageDeviationPU > 0.06 ? 'HIGH' : 'NORMAL',
        contributionPct: 14,
        description: 'Stable reactive power compensation from Olkaria STATCOM and Suswa reactors',
        source: 'WAMS_PMU',
        driver: 'Voltage stability margin',
        severityScore: Math.max(0, Math.min(100, Math.round(maxVoltageDeviationPU * 1000))),
        explanation: 'Voltage deviation remains manageable but reduces headroom under stressed corridor loading.',
        recommendedMitigation: 'Tighten reactive setpoints and review STATCOM/ reactor support for the corridor.'
      },
      {
        id: 'drv_asset_degradation',
        category: 'ASSET_HEALTH',
        metric: 'Suswa T2 Transformer DGA Alert',
        currentValue: 'Health: 68/100',
        nominalValue: '> 85/100',
        unit: 'index',
        severity: 'HIGH',
        contributionPct: 18,
        description: 'Elevated ethylene/acetylene gas ratio indicates localized thermal hotspot',
        source: 'DGA_ONLINE',
        driver: 'Transformer T2 health degradation',
        severityScore: 72,
        explanation: 'DGA indicators and loading stress suggest a deteriorating transformer condition that could escalate under further demand.',
        recommendedMitigation: 'Reduce loading on T2, perform targeted diagnostics, and plan corrective maintenance.'
      }
    ];

    // Sort drivers by contribution
    drivers.sort((a, b) => b.contributionPct - a.contributionPct);

    return {
      state,
      stressScore: compositeStressScore,
      stabilityIndex,
      voltageStabilityIndex: Math.max(0, Math.min(100, 100 - Math.round(maxVoltageDeviationPU * 1000))),
      topDrivers: drivers,
      primaryStressRegion: 'Rift Valley / Nairobi Metropolitan Export Corridor',
      recommendedFocus: state === 'EMERGENCY' || state === 'CRITICAL'
        ? 'Execute immediate generation redispatch at Olkaria and arm Nairobi North SPS intertripping'
        : state === 'STRESSED'
        ? 'Monitor Suswa 400kV corridor thermal headroom and review Seven Forks hydro fast reserve'
        : 'Maintain standard economic dispatch and monitor weather cell progression along Coast corridor',
      calculatedAt: new Date().toISOString(),
      systemDemandMW,
      totalGenerationMW,
      spinningReserveMW,
      reserveMarginPct: Number(reserveMarginPct.toFixed(1)),
      gridFrequencyHz: frequencyHz,
      transmissionAvailabilityPct,
      congestedCorridorsCount: congestedLinesCount,
      activeIncidentsCount: events.filter(e => e.severity === 'CRITICAL' || e.severity === 'HIGH').length || 2,
      criticalAssetsAtRiskCount: criticalAssetsAtRisk.length,
      n1ComplianceStatus,
      overallGridRiskScore: Math.round(compositeStressScore * 0.9 + 15),
      dataConfidencePct: 96.8
    };
  }
}
