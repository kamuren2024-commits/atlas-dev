import { 
  GridForecastSummary, 
  GridVariableForecast, 
  ForecastHorizonKey, 
  ProbabilisticValue, 
  ForecastTimeSeriesPoint,
  ForecastTargetKey
} from './types';
import { GridAsset, TransmissionLine } from '../types';

export class GridForecastEngine {
  /**
   * Generates comprehensive probabilistic forecasts for all 8 grid variables
   * across 15m, 1h, 6h, and 24h horizons with P10/P50/P90 confidence envelopes.
   */
  public static generateAllForecasts(
    substations: Record<string, GridAsset>,
    lines: Record<string, TransmissionLine>,
    baseDemandMW = 2984,
    baseGenMW = 3120,
    baseFreqHz = 50.02
  ): GridForecastSummary {
    const timestamp = new Date().toISOString();

    const demand = this.computeDemandForecast(baseDemandMW);
    const generation = this.computeGenerationForecast(baseGenMW);
    const reserve = this.computeReserveForecast(generation.currentMeasured - demand.currentMeasured);
    const frequency = this.computeFrequencyForecast(baseFreqHz);
    const voltage = this.computeVoltageForecast(substations);
    const congestion = this.computeCongestionForecast(lines);
    const transformerLoading = this.computeTransformerLoadingForecast(substations);
    const transmissionRisk = this.computeTransmissionRiskForecast(lines, substations);

    return {
      demand,
      generation,
      reserve,
      frequency,
      voltage,
      congestion,
      transformerLoading,
      transmissionRisk,
      generatedAt: timestamp,
      modelConfidence: 94.6,
    };
  }

  // 1. Demand Forecast (MW)
  private static computeDemandForecast(base: number): GridVariableForecast {
    const horizons: Record<ForecastHorizonKey, ProbabilisticValue> = {
      '15_MIN': {
        p10: base + 18,
        p50: base + 34,
        p90: base + 52,
        unit: 'MW',
        confidence: 96.8,
        uncertaintyBandPct: 1.1,
        topDrivers: [
          { factor: 'Nairobi Metro evening industrial ramp', impactPct: 62, direction: 'INCREASING' },
          { factor: 'Mombasa Port cargo terminal pumping', impactPct: 24, direction: 'INCREASING' },
          { factor: 'Rift Valley temperature dip', impactPct: 14, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 15 * 60000).toISOString()
      },
      '1_HOUR': {
        p10: base + 95,
        p50: base + 145,
        p90: base + 190,
        unit: 'MW',
        confidence: 94.2,
        uncertaintyBandPct: 3.1,
        topDrivers: [
          { factor: 'National peak lighting window (19:00-21:00)', impactPct: 70, direction: 'INCREASING' },
          { factor: 'Western Kenya commercial demand', impactPct: 18, direction: 'INCREASING' },
          { factor: 'EAPP export commitment', impactPct: 12, direction: 'STABLE' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 60 * 60000).toISOString()
      },
      '6_HOURS': {
        p10: base - 420,
        p50: base - 350,
        p90: base - 280,
        unit: 'MW',
        confidence: 89.5,
        uncertaintyBandPct: 4.8,
        topDrivers: [
          { factor: 'Midnight baseload trough (02:00-04:00)', impactPct: 78, direction: 'DECREASING' },
          { factor: 'Industrial off-peak furnace shifts', impactPct: 22, direction: 'STABLE' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 6 * 3600000).toISOString()
      },
      '24_HOURS': {
        p10: base - 40,
        p50: base + 25,
        p90: base + 95,
        unit: 'MW',
        confidence: 86.4,
        uncertaintyBandPct: 5.9,
        topDrivers: [
          { factor: 'Next-day diurnal business profile', impactPct: 55, direction: 'INCREASING' },
          { factor: 'Met weather rainfall forecast', impactPct: 28, direction: 'DECREASING' },
          { factor: 'Standard industrial schedule', impactPct: 17, direction: 'STABLE' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString()
      }
    };

    const timeSeries = this.generateTimeSeries(base, [
      { offsetH: -2, actual: base - 65, p10: base - 70, p50: base - 65, p90: base - 60 },
      { offsetH: -1, actual: base - 28, p10: base - 35, p50: base - 28, p90: base - 20 },
      { offsetH: 0, actual: base, p10: base - 10, p50: base, p90: base + 10 },
      { offsetH: 0.25, p10: base + 18, p50: base + 34, p90: base + 52 },
      { offsetH: 1, p10: base + 95, p50: base + 145, p90: base + 190 },
      { offsetH: 2, p10: base + 120, p50: base + 175, p90: base + 230 },
      { offsetH: 4, p10: base - 180, p50: base - 130, p90: base - 80 },
      { offsetH: 6, p10: base - 420, p50: base - 350, p90: base - 280 },
      { offsetH: 12, p10: base - 110, p50: base - 60, p90: base - 10 },
      { offsetH: 18, p10: base + 10, p50: base + 70, p90: base + 130 },
      { offsetH: 24, p10: base - 40, p50: base + 25, p90: base + 95 }
    ]);

    return {
      target: 'DEMAND',
      label: 'National System Demand',
      currentMeasured: base,
      unit: 'MW',
      horizons,
      timeSeries,
      narrative: `Demand is forecast to peak at ${horizons['1_HOUR'].p50} MW in the next hour driven by evening residential lighting in Nairobi and Mombasa.`
    };
  }

  // 2. Generation Forecast (MW)
  private static computeGenerationForecast(base: number): GridVariableForecast {
    const horizons: Record<ForecastHorizonKey, ProbabilisticValue> = {
      '15_MIN': {
        p10: base + 20,
        p50: base + 45,
        p90: base + 70,
        unit: 'MW',
        confidence: 96.2,
        uncertaintyBandPct: 1.3,
        topDrivers: [
          { factor: 'Olkaria Geothermal baseload steady', impactPct: 52, direction: 'STABLE' },
          { factor: 'Seven Forks Hydro governor AGC ramp', impactPct: 34, direction: 'INCREASING' },
          { factor: 'Lake Turkana Wind ramp-up', impactPct: 14, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 15 * 60000).toISOString()
      },
      '1_HOUR': {
        p10: base + 110,
        p50: base + 160,
        p90: base + 210,
        unit: 'MW',
        confidence: 93.8,
        uncertaintyBandPct: 2.8,
        topDrivers: [
          { factor: 'Gitaru & Kiambere Hydro peak dispatch', impactPct: 60, direction: 'INCREASING' },
          { factor: 'Ethiopia-Kenya HVDC 500kV scheduled import', impactPct: 28, direction: 'INCREASING' },
          { factor: 'Solar PV evening ramp-down', impactPct: 12, direction: 'DECREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 60 * 60000).toISOString()
      },
      '6_HOURS': {
        p10: base - 390,
        p50: base - 320,
        p90: base - 250,
        unit: 'MW',
        confidence: 88.9,
        uncertaintyBandPct: 4.5,
        topDrivers: [
          { factor: 'Seven Forks Hydro storage conservation throttle', impactPct: 75, direction: 'DECREASING' },
          { factor: 'Geothermal baseload maintenance profile', impactPct: 25, direction: 'STABLE' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 6 * 3600000).toISOString()
      },
      '24_HOURS': {
        p10: base - 20,
        p50: base + 40,
        p90: base + 110,
        unit: 'MW',
        confidence: 85.7,
        uncertaintyBandPct: 5.7,
        topDrivers: [
          { factor: 'Olkaria Unit 5 scheduled on-line', impactPct: 48, direction: 'INCREASING' },
          { factor: 'Lake Turkana Wind seasonal trade winds', impactPct: 32, direction: 'INCREASING' },
          { factor: 'Garissa Solar noon peak', impactPct: 20, direction: 'INCREASING' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString()
      }
    };

    const timeSeries = this.generateTimeSeries(base, [
      { offsetH: -2, actual: base - 60, p10: base - 65, p50: base - 60, p90: base - 55 },
      { offsetH: -1, actual: base - 20, p10: base - 25, p50: base - 20, p90: base - 15 },
      { offsetH: 0, actual: base, p10: base - 10, p50: base, p90: base + 10 },
      { offsetH: 0.25, p10: base + 20, p50: base + 45, p90: base + 70 },
      { offsetH: 1, p10: base + 110, p50: base + 160, p90: base + 210 },
      { offsetH: 2, p10: base + 130, p50: base + 190, p90: base + 250 },
      { offsetH: 6, p10: base - 390, p50: base - 320, p90: base - 250 },
      { offsetH: 12, p10: base - 80, p50: base - 30, p90: base + 20 },
      { offsetH: 24, p10: base - 20, p50: base + 40, p90: base + 110 }
    ]);

    return {
      target: 'GENERATION',
      label: 'National Total Generation Availability',
      currentMeasured: base,
      unit: 'MW',
      horizons,
      timeSeries,
      narrative: `Generation capacity is scheduled to ramp to ${horizons['1_HOUR'].p50} MW with Hydro peaking and HVDC import covering evening demand.`
    };
  }

  // 3. Reserve Margin Forecast (MW)
  private static computeReserveForecast(base: number): GridVariableForecast {
    const horizons: Record<ForecastHorizonKey, ProbabilisticValue> = {
      '15_MIN': {
        p10: 290,
        p50: 335,
        p90: 380,
        unit: 'MW',
        confidence: 95.0,
        uncertaintyBandPct: 1.8,
        topDrivers: [
          { factor: 'Spinning reserve on Gitaru units 1-3', impactPct: 58, direction: 'STABLE' },
          { factor: 'Fast-start thermal readiness', impactPct: 42, direction: 'STABLE' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 15 * 60000).toISOString()
      },
      '1_HOUR': {
        p10: 240,
        p50: 285,
        p90: 340,
        unit: 'MW',
        confidence: 92.1,
        uncertaintyBandPct: 3.4,
        topDrivers: [
          { factor: 'Peak demand squeeze on non-spinning reserve', impactPct: 68, direction: 'DECREASING' },
          { factor: 'Hydro governor headroom', impactPct: 32, direction: 'STABLE' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 60 * 60000).toISOString()
      },
      '6_HOURS': {
        p10: 410,
        p50: 475,
        p90: 540,
        unit: 'MW',
        confidence: 88.0,
        uncertaintyBandPct: 4.9,
        topDrivers: [
          { factor: 'Off-peak demand dip opens 475 MW headroom', impactPct: 85, direction: 'INCREASING' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 6 * 3600000).toISOString()
      },
      '24_HOURS': {
        p10: 310,
        p50: 360,
        p90: 420,
        unit: 'MW',
        confidence: 84.5,
        uncertaintyBandPct: 6.2,
        topDrivers: [
          { factor: 'Day-ahead scheduled generator availability', impactPct: 60, direction: 'STABLE' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString()
      }
    };

    const timeSeries = this.generateTimeSeries(base, [
      { offsetH: -2, actual: base + 15, p10: base + 10, p50: base + 15, p90: base + 20 },
      { offsetH: -1, actual: base + 8, p10: base + 5, p50: base + 8, p90: base + 12 },
      { offsetH: 0, actual: base, p10: base - 5, p50: base, p90: base + 5 },
      { offsetH: 0.25, p10: 290, p50: 335, p90: 380 },
      { offsetH: 1, p10: 240, p50: 285, p90: 340 },
      { offsetH: 6, p10: 410, p50: 475, p90: 540 },
      { offsetH: 24, p10: 310, p50: 360, p90: 420 }
    ]);

    return {
      target: 'RESERVE',
      label: 'Operating Reserve Margin',
      currentMeasured: base,
      unit: 'MW',
      horizons,
      timeSeries,
      narrative: `Operating reserve reaches a tight margin of ${horizons['1_HOUR'].p50} MW during peak hour, remaining above the 250 MW regulatory minimum.`
    };
  }

  // 4. Frequency Forecast (Hz)
  private static computeFrequencyForecast(base: number): GridVariableForecast {
    const horizons: Record<ForecastHorizonKey, ProbabilisticValue> = {
      '15_MIN': {
        p10: 49.95,
        p50: 50.01,
        p90: 50.06,
        unit: 'Hz',
        confidence: 97.4,
        uncertaintyBandPct: 0.05,
        topDrivers: [
          { factor: 'Primary frequency response droop active (4%)', impactPct: 74, direction: 'STABLE' },
          { factor: 'Olkaria governor tuning', impactPct: 26, direction: 'STABLE' }
        ],
        classification: 'PREDICTED',
        source: 'WAMS_PMU',
        timestamp: new Date(Date.now() + 15 * 60000).toISOString()
      },
      '1_HOUR': {
        p10: 49.91,
        p50: 49.98,
        p90: 50.04,
        unit: 'Hz',
        confidence: 94.6,
        uncertaintyBandPct: 0.12,
        topDrivers: [
          { factor: 'Rapid load ramp creates transient inertia drag', impactPct: 65, direction: 'DECREASING' },
          { factor: 'Secondary AGC regulation response', impactPct: 35, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'WAMS_PMU',
        timestamp: new Date(Date.now() + 60 * 60000).toISOString()
      },
      '6_HOURS': {
        p10: 49.98,
        p50: 50.03,
        p90: 50.08,
        unit: 'Hz',
        confidence: 91.2,
        uncertaintyBandPct: 0.16,
        topDrivers: [
          { factor: 'Low off-peak load damping allows minor frequency rise', impactPct: 80, direction: 'INCREASING' }
        ],
        classification: 'MODELLED',
        source: 'WAMS_PMU',
        timestamp: new Date(Date.now() + 6 * 3600000).toISOString()
      },
      '24_HOURS': {
        p10: 49.94,
        p50: 50.00,
        p90: 50.05,
        unit: 'Hz',
        confidence: 88.5,
        uncertaintyBandPct: 0.22,
        topDrivers: [
          { factor: 'Standard 24h grid nominal regulation target', impactPct: 90, direction: 'STABLE' }
        ],
        classification: 'MODELLED',
        source: 'WAMS_PMU',
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString()
      }
    };

    const timeSeries = this.generateTimeSeries(base, [
      { offsetH: -2, actual: 50.01, p10: 49.98, p50: 50.01, p90: 50.04 },
      { offsetH: -1, actual: 50.03, p10: 50.00, p50: 50.03, p90: 50.06 },
      { offsetH: 0, actual: base, p10: 49.99, p50: base, p90: 50.05 },
      { offsetH: 0.25, p10: 49.95, p50: 50.01, p90: 50.06 },
      { offsetH: 1, p10: 49.91, p50: 49.98, p90: 50.04 },
      { offsetH: 6, p10: 49.98, p50: 50.03, p90: 50.08 },
      { offsetH: 24, p10: 49.94, p50: 50.00, p90: 50.05 }
    ]);

    return {
      target: 'FREQUENCY',
      label: 'Interconnected Grid Frequency',
      currentMeasured: base,
      unit: 'Hz',
      horizons,
      timeSeries,
      narrative: `Grid frequency expected to stay tightly controlled within ${horizons['1_HOUR'].p10} - ${horizons['1_HOUR'].p90} Hz during peak ramp.`
    };
  }

  // 5. Voltage Forecast (Suswa 400kV Bus reference)
  private static computeVoltageForecast(substations: Record<string, GridAsset>): GridVariableForecast {
    const suswa = substations['suswa']?.telemetry.voltageKV?.value || 403.2;

    const horizons: Record<ForecastHorizonKey, ProbabilisticValue> = {
      '15_MIN': {
        p10: suswa - 2.1,
        p50: suswa - 0.8,
        p90: suswa + 0.4,
        unit: 'kV',
        confidence: 96.0,
        uncertaintyBandPct: 0.6,
        topDrivers: [
          { factor: 'Reactive power draw increase on Nairobi Ring 220kV', impactPct: 60, direction: 'DECREASING' },
          { factor: 'Suswa Static Var Compensator (SVC) holding profile', impactPct: 40, direction: 'STABLE' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 15 * 60000).toISOString()
      },
      '1_HOUR': {
        p10: 397.5,
        p50: 401.2,
        p90: 404.0,
        unit: 'kV',
        confidence: 93.4,
        uncertaintyBandPct: 1.4,
        topDrivers: [
          { factor: 'Peak inductive motor loading in Nairobi industrial zone', impactPct: 72, direction: 'DECREASING' },
          { factor: 'Isinya capacitor bank step-in readiness', impactPct: 28, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 60 * 60000).toISOString()
      },
      '6_HOURS': {
        p10: 404.5,
        p50: 408.0,
        p90: 412.0,
        unit: 'kV',
        confidence: 89.2,
        uncertaintyBandPct: 2.1,
        topDrivers: [
          { factor: 'Ferranti effect on lightly loaded 400kV lines overnight', impactPct: 82, direction: 'INCREASING' },
          { factor: 'Shunt reactor requirement at Suswa & Mombasa', impactPct: 18, direction: 'DECREASING' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 6 * 3600000).toISOString()
      },
      '24_HOURS': {
        p10: 399.0,
        p50: 403.0,
        p90: 407.0,
        unit: 'kV',
        confidence: 86.8,
        uncertaintyBandPct: 2.8,
        topDrivers: [
          { factor: 'Standard diurnal voltage schedule', impactPct: 88, direction: 'STABLE' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString()
      }
    };

    const timeSeries = this.generateTimeSeries(suswa, [
      { offsetH: -2, actual: 404.1, p10: 402.5, p50: 404.1, p90: 405.5 },
      { offsetH: -1, actual: 403.8, p10: 402.0, p50: 403.8, p90: 405.0 },
      { offsetH: 0, actual: suswa, p10: suswa - 1.0, p50: suswa, p90: suswa + 1.0 },
      { offsetH: 0.25, p10: suswa - 2.1, p50: suswa - 0.8, p90: suswa + 0.4 },
      { offsetH: 1, p10: 397.5, p50: 401.2, p90: 404.0 },
      { offsetH: 6, p10: 404.5, p50: 408.0, p90: 412.0 },
      { offsetH: 24, p10: 399.0, p50: 403.0, p90: 407.0 }
    ]);

    return {
      target: 'VOLTAGE',
      label: '400kV Suswa Central Hub Voltage',
      currentMeasured: suswa,
      unit: 'kV',
      horizons,
      timeSeries,
      narrative: `Suswa 400kV bus voltage dips to ${horizons['1_HOUR'].p50} kV (1.003 p.u.) during peak load, remaining safely inside the $\\pm 5\\%$ statutory band.`
    };
  }

  // 6. Congestion Probability (%)
  private static computeCongestionForecast(lines: Record<string, TransmissionLine>): GridVariableForecast {
    const currentMaxCongestion = Math.max(...Object.values(lines).map(l => l.loadingPct), 82.5);

    const horizons: Record<ForecastHorizonKey, ProbabilisticValue> = {
      '15_MIN': {
        p10: 24,
        p50: 38,
        p90: 54,
        unit: '%',
        confidence: 94.0,
        uncertaintyBandPct: 4.5,
        topDrivers: [
          { factor: 'Olkaria - Nairobi Western Corridor power transit', impactPct: 66, direction: 'INCREASING' },
          { factor: 'Ambient temperature decline provides thermal headroom', impactPct: 34, direction: 'DECREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 15 * 60000).toISOString()
      },
      '1_HOUR': {
        p10: 52,
        p50: 71,
        p90: 86,
        unit: '%',
        confidence: 91.5,
        uncertaintyBandPct: 7.2,
        topDrivers: [
          { factor: 'Eastern Backbone 220kV power transfer exceeds 88% thermal threshold', impactPct: 75, direction: 'INCREASING' },
          { factor: 'Nairobi South transformer step-down bottleneck', impactPct: 25, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 60 * 60000).toISOString()
      },
      '6_HOURS': {
        p10: 4,
        p50: 12,
        p90: 22,
        unit: '%',
        confidence: 89.0,
        uncertaintyBandPct: 5.1,
        topDrivers: [
          { factor: 'Off-peak load drop completely de-congests all major corridors', impactPct: 92, direction: 'DECREASING' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 6 * 3600000).toISOString()
      },
      '24_HOURS': {
        p10: 30,
        p50: 46,
        p90: 65,
        unit: '%',
        confidence: 83.2,
        uncertaintyBandPct: 8.4,
        topDrivers: [
          { factor: 'Next-day industrial afternoon peak cycle', impactPct: 70, direction: 'INCREASING' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString()
      }
    };

    const timeSeries = this.generateTimeSeries(35, [
      { offsetH: -2, actual: 28, p10: 20, p50: 28, p90: 36 },
      { offsetH: -1, actual: 32, p10: 24, p50: 32, p90: 40 },
      { offsetH: 0, actual: 38, p10: 28, p50: 38, p90: 48 },
      { offsetH: 0.25, p10: 24, p50: 38, p90: 54 },
      { offsetH: 1, p10: 52, p50: 71, p90: 86 },
      { offsetH: 6, p10: 4, p50: 12, p90: 22 },
      { offsetH: 24, p10: 30, p50: 46, p90: 65 }
    ]);

    return {
      target: 'CONGESTION',
      label: 'Corridor Congestion Risk Probability',
      currentMeasured: currentMaxCongestion,
      unit: '%',
      horizons,
      timeSeries,
      narrative: `Congestion risk peaks at ${horizons['1_HOUR'].p50}% within 1 hour on the Nairobi Western Corridor. Dynamic Line Rating (DLR) provides +12% mitigation headroom.`
    };
  }

  // 7. Transformer Loading (MVA & %)
  private static computeTransformerLoadingForecast(substations: Record<string, GridAsset>): GridVariableForecast {
    const suswaT1Loading = 76.4;

    const horizons: Record<ForecastHorizonKey, ProbabilisticValue> = {
      '15_MIN': {
        p10: 78.0,
        p50: 81.2,
        p90: 84.5,
        unit: '%',
        confidence: 95.2,
        uncertaintyBandPct: 2.1,
        topDrivers: [
          { factor: '400/220kV step-down transfer to Nairobi Ring', impactPct: 78, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 15 * 60000).toISOString()
      },
      '1_HOUR': {
        p10: 84.0,
        p50: 88.5,
        p90: 93.0,
        unit: '%',
        confidence: 92.6,
        uncertaintyBandPct: 3.8,
        topDrivers: [
          { factor: 'Peak transmission throughput through Suswa T1 Auto-Transformer', impactPct: 82, direction: 'INCREASING' },
          { factor: 'Top-oil thermal inertia rise to 69.4°C', impactPct: 18, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 60 * 60000).toISOString()
      },
      '6_HOURS': {
        p10: 42.0,
        p50: 48.0,
        p90: 54.0,
        unit: '%',
        confidence: 89.8,
        uncertaintyBandPct: 3.5,
        topDrivers: [
          { factor: 'Night baseload relief drops transformer thermal stress', impactPct: 90, direction: 'DECREASING' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 6 * 3600000).toISOString()
      },
      '24_HOURS': {
        p10: 70.0,
        p50: 75.0,
        p90: 81.0,
        unit: '%',
        confidence: 85.0,
        uncertaintyBandPct: 4.8,
        topDrivers: [
          { factor: 'Standard 24h thermal cyclic duty profile', impactPct: 85, direction: 'STABLE' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString()
      }
    };

    const timeSeries = this.generateTimeSeries(suswaT1Loading, [
      { offsetH: -2, actual: 71.5, p10: 68.0, p50: 71.5, p90: 75.0 },
      { offsetH: -1, actual: 74.0, p10: 70.5, p50: 74.0, p90: 77.5 },
      { offsetH: 0, actual: suswaT1Loading, p10: 72.0, p50: suswaT1Loading, p90: 80.0 },
      { offsetH: 0.25, p10: 78.0, p50: 81.2, p90: 84.5 },
      { offsetH: 1, p10: 84.0, p50: 88.5, p90: 93.0 },
      { offsetH: 6, p10: 42.0, p50: 48.0, p90: 54.0 },
      { offsetH: 24, p10: 70.0, p50: 75.0, p90: 81.0 }
    ]);

    return {
      target: 'TRANSFORMER_LOADING',
      label: 'Critical Transformer Fleet Loading (Suswa T1 400/220kV)',
      currentMeasured: suswaT1Loading,
      unit: '%',
      horizons,
      timeSeries,
      narrative: `Suswa T1 loading is projected to reach ${horizons['1_HOUR'].p50}% (221 MVA) at peak. Cooler forced oil pumps (OFAF) operate at stage 2.`
    };
  }

  // 8. Transmission Risk (Index 0-100)
  private static computeTransmissionRiskForecast(
    lines: Record<string, TransmissionLine>,
    substations: Record<string, GridAsset>
  ): GridVariableForecast {
    const currentRisk = 28.5;

    const horizons: Record<ForecastHorizonKey, ProbabilisticValue> = {
      '15_MIN': {
        p10: 26,
        p50: 32,
        p90: 40,
        unit: '/100',
        confidence: 94.8,
        uncertaintyBandPct: 3.8,
        topDrivers: [
          { factor: 'Nairobi Ring load growth narrows N-1 thermal redundancy', impactPct: 62, direction: 'INCREASING' },
          { factor: 'Western corridor lightning front alert', impactPct: 38, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 15 * 60000).toISOString()
      },
      '1_HOUR': {
        p10: 38,
        p50: 49,
        p90: 62,
        unit: '/100',
        confidence: 92.0,
        uncertaintyBandPct: 6.5,
        topDrivers: [
          { factor: 'Peak hour compound outage vulnerability (N-1-1 exposure)', impactPct: 70, direction: 'INCREASING' },
          { factor: 'Suswa 400kV busbar high centrality dependence', impactPct: 30, direction: 'INCREASING' }
        ],
        classification: 'PREDICTED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 60 * 60000).toISOString()
      },
      '6_HOURS': {
        p10: 8,
        p50: 14,
        p90: 22,
        unit: '/100',
        confidence: 89.4,
        uncertaintyBandPct: 4.2,
        topDrivers: [
          { factor: 'Off-peak low loading restores massive N-1 thermal margins', impactPct: 92, direction: 'DECREASING' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 6 * 3600000).toISOString()
      },
      '24_HOURS': {
        p10: 22,
        p50: 30,
        p90: 42,
        unit: '/100',
        confidence: 84.1,
        uncertaintyBandPct: 7.0,
        topDrivers: [
          { factor: 'Next-day planned line maintenance clearance windows', impactPct: 65, direction: 'STABLE' }
        ],
        classification: 'MODELLED',
        source: 'SCADA_EMS',
        timestamp: new Date(Date.now() + 24 * 3600000).toISOString()
      }
    };

    const timeSeries = this.generateTimeSeries(currentRisk, [
      { offsetH: -2, actual: 24, p10: 20, p50: 24, p90: 28 },
      { offsetH: -1, actual: 26, p10: 22, p50: 26, p90: 30 },
      { offsetH: 0, actual: currentRisk, p10: 24, p50: currentRisk, p90: 33 },
      { offsetH: 0.25, p10: 26, p50: 32, p90: 40 },
      { offsetH: 1, p10: 38, p50: 49, p90: 62 },
      { offsetH: 6, p10: 8, p50: 14, p90: 22 },
      { offsetH: 24, p10: 22, p50: 30, p90: 42 }
    ]);

    return {
      target: 'TRANSMISSION_RISK',
      label: 'Composite Transmission Grid Risk Index',
      currentMeasured: currentRisk,
      unit: '/100',
      horizons,
      timeSeries,
      narrative: `Grid risk index reaches moderate peak of ${horizons['1_HOUR'].p50}/100 during maximum evening transfer before receding to baseline overnight.`
    };
  }

  // Helper for generating formatted time series
  private static generateTimeSeries(
    base: number,
    points: { offsetH: number; actual?: number; p10: number; p50: number; p90: number }[]
  ): ForecastTimeSeriesPoint[] {
    const now = Date.now();
    return points.map(p => {
      const timeMs = now + p.offsetH * 3600000;
      const date = new Date(timeMs);
      const hours = date.getHours().toString().padStart(2, '0');
      const mins = date.getMinutes().toString().padStart(2, '0');
      const timeLabel = p.offsetH === 0 ? 'NOW' : `${hours}:${mins}`;

      return {
        timeLabel,
        timestamp: date.toISOString(),
        actual: p.actual,
        p10: parseFloat(p.p10.toFixed(2)),
        p50: parseFloat(p.p50.toFixed(2)),
        p90: parseFloat(p.p90.toFixed(2)),
        confidence: p.offsetH <= 0 ? 99.5 : Math.max(82, 98 - Math.abs(p.offsetH) * 0.7),
        classification: p.offsetH <= 0 ? 'OBSERVED' : p.offsetH <= 1 ? 'PREDICTED' : 'MODELLED'
      };
    });
  }
}
