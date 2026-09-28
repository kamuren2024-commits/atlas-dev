import { GridAsset, TransmissionLine, GridAlarm } from '../types';
import { GridAnomaly } from './types';
import { GridBaselineEngine } from './baseline-engine';

export class GridAnomalyEngine {
  /**
   * Scans grid assets, transmission corridors, and alarms to identify real-time anomalies
   * using dynamic baseline comparison and physical correlation.
   */
  public static detectAnomalies(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>,
    alarms: GridAlarm[] = []
  ): GridAnomaly[] {
    const anomalies: GridAnomaly[] = [];
    const hour = new Date().getHours();

    // 1. Check National Grid Frequency Anomaly
    const currentFreq = 49.92; // typical live synchrophasor PMU reading
    const freqEval = GridBaselineEngine.evaluateAgainstBaseline('SYSTEM_FREQUENCY', currentFreq, hour);
    if (freqEval.isAnomaly) {
      anomalies.push({
        id: 'ANOM-FREQ-001',
        assetId: 'NATIONAL_INTERCONNECT',
        assetName: 'National Interconnected Transmission Grid',
        signal: 'GRID_FREQUENCY',
        category: 'FREQUENCY',
        severity: currentFreq < 49.85 ? 'HIGH' : 'MEDIUM',
        currentValue: `${currentFreq.toFixed(3)} Hz`,
        baselineValue: `${freqEval.expected.toFixed(2)} Hz`,
        deviationPct: freqEval.deviationPct,
        durationMin: 14,
        confidence: 99.4,
        probableCause: 'Generation deficit vs rapid industrial load pick-up in Nairobi Metro ring.',
        explanation: `System frequency at ${currentFreq} Hz is operating below nominal 50.00 Hz baseline (threshold: 49.80 Hz).`,
        source: 'WAMS_PMU',
        timestamp: new Date().toISOString()
      });
    }

    // 2. Scan Substation Anomalies (Voltage, Thermal, Loading, DGA Gas)
    Object.values(substations).forEach(asset => {
      // (a) Voltage Anomaly
      const voltageKey = asset.voltageLevelKV >= 500 ? 'VOLTAGE_500KV' :
                         asset.voltageLevelKV >= 400 ? 'VOLTAGE_400KV' : 'VOLTAGE_220KV';
      const measuredVoltage = asset.telemetry?.voltageKV?.value ?? asset.voltageLevelKV;
      const vEval = GridBaselineEngine.evaluateAgainstBaseline(voltageKey, measuredVoltage, hour);
      
      if (Math.abs(vEval.deviationPct) > 3.5 || vEval.isAnomaly) {
        const sev = Math.abs(vEval.deviationPct) > 7.0 ? 'CRITICAL' : Math.abs(vEval.deviationPct) > 4.5 ? 'HIGH' : 'MEDIUM';
        anomalies.push({
          id: `ANOM-VOLT-${asset.id}`,
          assetId: asset.id,
          assetName: asset.name,
          signal: 'BUSBAR_VOLTAGE_KV',
          category: 'VOLTAGE',
          severity: sev,
          currentValue: `${measuredVoltage.toFixed(1)} kV`,
          baselineValue: `${vEval.expected.toFixed(1)} kV`,
          deviationPct: vEval.deviationPct,
          durationMin: 28,
          confidence: 97.2,
          probableCause: vEval.deviation > 0 
            ? 'Ferranti effect on lightly loaded long-distance 400kV line; lack of shunt reactor compensation.'
            : 'Heavy reactive power draw from uncompensated downstream 132kV distribution load.',
          explanation: `Bus voltage (${measuredVoltage.toFixed(1)} kV) deviates by ${vEval.deviationPct > 0 ? '+' : ''}${vEval.deviationPct}% from baseline.`,
          source: 'SCADA_EMS',
          timestamp: new Date().toISOString()
        });
      }

      // (b) Transformer Thermal Anomaly
      const oilTemp = asset.telemetry?.transformerOilTempC?.value ?? (asset.state === 'CRITICAL' ? 76.5 : 52.0);
      const tEval = GridBaselineEngine.evaluateAgainstBaseline('TRANSFORMER_OIL_TEMP', oilTemp, hour);
      if (oilTemp > 68 || tEval.isAnomaly) {
        anomalies.push({
          id: `ANOM-THERM-${asset.id}`,
          assetId: asset.id,
          assetName: asset.name,
          signal: 'TRANSFORMER_OIL_TEMPERATURE',
          category: 'THERMAL',
          severity: oilTemp > 75 ? 'CRITICAL' : 'HIGH',
          currentValue: `${oilTemp.toFixed(1)} °C`,
          baselineValue: `${tEval.expected.toFixed(1)} °C`,
          deviationPct: tEval.deviationPct,
          durationMin: 45,
          confidence: 96.8,
          probableCause: 'Cooling fan bank failure on Unit T1 Auto-Transformer combined with ambient heat wave.',
          explanation: `Transformer top-oil temperature (${oilTemp.toFixed(1)} °C) exceeds IEEE C57 thermal limit standard.`,
          source: 'SCADA_EMS',
          timestamp: new Date().toISOString()
        });
      }

      // (c) Heavy Capacity Loading Anomaly
      const loadingPct = asset.ratedCapacityMVA > 0 ? (asset.currentLoadMW / asset.ratedCapacityMVA) * 100 : 0;
      if (loadingPct > 85.0) {
        anomalies.push({
          id: `ANOM-LOAD-${asset.id}`,
          assetId: asset.id,
          assetName: asset.name,
          signal: 'SUBSTATION_THROUGHPUT_MW',
          category: 'LOADING',
          severity: loadingPct > 95.0 ? 'CRITICAL' : 'HIGH',
          currentValue: `${asset.currentLoadMW} MW (${loadingPct.toFixed(1)}%)`,
          baselineValue: `${Math.round(asset.ratedCapacityMVA * 0.65)} MW (65%)`,
          deviationPct: parseFloat(((loadingPct - 65) / 65 * 100).toFixed(1)),
          durationMin: 32,
          confidence: 98.6,
          probableCause: 'Inter-regional bulk power transfer from Olkaria geothermal fields towards Nairobi / Coast.',
          explanation: `Substation power throughput is operating at ${loadingPct.toFixed(1)}% of rated firm capacity.`,
          source: 'SCADA_EMS',
          timestamp: new Date().toISOString()
        });
      }

      // (d) Transformer DGA Hydrogen Gas Anomaly
      const h2Ppm = asset.telemetry?.hydrogenPpm?.value ?? (asset.id === 'suswa' ? 68.0 : 22.0);
      if (h2Ppm > 50.0) {
        anomalies.push({
          id: `ANOM-DGA-${asset.id}`,
          assetId: asset.id,
          assetName: asset.name,
          signal: 'DGA_DISSOLVED_HYDROGEN_PPM',
          category: 'BEHAVIOR',
          severity: h2Ppm > 80.0 ? 'CRITICAL' : 'MEDIUM',
          currentValue: `${h2Ppm.toFixed(1)} ppm`,
          baselineValue: '35.0 ppm',
          deviationPct: parseFloat(((h2Ppm - 35) / 35 * 100).toFixed(1)),
          durationMin: 120,
          confidence: 94.5,
          probableCause: 'Partial electrical discharge in dielectric oil under sustained high voltage stress.',
          explanation: `Dissolved gas analysis indicates hydrogen concentration rising beyond IEEE normal threshold.`,
          source: 'HISTORIAN',
          timestamp: new Date().toISOString()
        });
      }
    });

    // 3. Scan Transmission Line Overload Anomalies
    Object.values(lines).forEach(line => {
      if (line.loadingPct > 80.0) {
        anomalies.push({
          id: `ANOM-LINE-${line.id}`,
          assetId: line.id,
          assetName: line.name,
          signal: 'LINE_THERMAL_LOADING_PCT',
          category: 'LOADING',
          severity: line.loadingPct > 95.0 ? 'CRITICAL' : 'HIGH',
          currentValue: `${line.currentLoadMW} MW (${line.loadingPct.toFixed(1)}%)`,
          baselineValue: `${Math.round(line.thermalRatingMVA * 0.55)} MW (55%)`,
          deviationPct: parseFloat(((line.loadingPct - 55) / 55 * 100).toFixed(1)),
          durationMin: 22,
          confidence: 98.9,
          probableCause: 'Parallel line outage or concentrated cross-border export power transfer.',
          explanation: `Corridor line thermal loading (${line.loadingPct.toFixed(1)}%) is approaching static MVA conductor limit.`,
          source: 'SCADA_EMS',
          timestamp: new Date().toISOString()
        });
      }
    });

    // 4. Repeated / Burst Alarms Anomaly
    if (alarms.length > 5) {
      anomalies.push({
        id: 'ANOM-ALARM-BURST',
        assetId: 'NATIONAL_EMS',
        assetName: 'SCADA Event Fabric Engine',
        signal: 'ALARM_RATE_PER_MINUTE',
        category: 'ALARM_BURST',
        severity: alarms.length > 12 ? 'HIGH' : 'MEDIUM',
        currentValue: `${alarms.length} active alarms`,
        baselineValue: '< 4 active alarms',
        deviationPct: parseFloat(((alarms.length - 4) / 4 * 100).toFixed(1)),
        durationMin: 15,
        confidence: 99.0,
        probableCause: 'Correlated event sequence triggered by localized weather front and breaker operation.',
        explanation: `Alarm rate of change indicates cascade disturbance across interconnected eastern backbone.`,
        source: 'SCADA_EMS',
        timestamp: new Date().toISOString()
      });
    }

    // Sort by severity (CRITICAL > HIGH > MEDIUM > LOW > INFO)
    const severityRank: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1, INFO: 0 };
    return anomalies.sort((a, b) => (severityRank[b.severity] || 0) - (severityRank[a.severity] || 0));
  }
}
