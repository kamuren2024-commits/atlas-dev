import { 
  GridAsset, 
  TransmissionLine, 
  KpiFamily, 
  GridAlarm, 
  GridEvent, 
  AiInvestigationInsight,
  DataSource,
  DataFreshness
} from '../types';

import {
  CANONICAL_SUBSTATIONS,
  CANONICAL_LINES,
  CANONICAL_KPIS,
  CANONICAL_EVENTS,
  CANONICAL_ALARMS,
  CANONICAL_AI_INSIGHTS
} from '../grid-canonical-data';

export interface TelemetrySnapshot {
  systemDemandMW: number;
  generationAvailableMW: number;
  frequencyHz: number;
  spinningReserveMW: number;
  transmissionAvailabilityPct: number;
  onlineSubstationsCount: string;
  activeOutagesCount: number;
  criticalAlarmsCount: number;
  congestionIndexPct: number;
  systemInertiaGWs: number;
  loadFactorPct: number;
  transmissionLossMW: number;
  transmissionLossPct: number;
  freshness: DataFreshness;
  lastUpdated: string;
}

export interface IGridDataProvider {
  getTelemetrySnapshot(): TelemetrySnapshot;
  getSubstations(): Record<string, GridAsset>;
  getTransmissionLines(): Record<string, TransmissionLine>;
  getKpis(): KpiFamily[];
  getAlarms(): GridAlarm[];
  getEvents(): GridEvent[];
  getAiInsights(): Record<string, AiInvestigationInsight>;
  getRegionalHealth(): RegionalGridMetric[];
  getForecastNext6Hours(): HourlyForecast[];
  getGridAnomalies(): GridAnomalyItem[];
}

export interface RegionalGridMetric {
  regionId: string;
  name: string;
  loadMW: number;
  generationMW: number;
  availabilityPct: number;
  riskScore: number;
  criticalAlarmsCount: number;
  activeOutagesCount: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  keyNodes: string[];
}

export interface HourlyForecast {
  hourLabel: string;
  timeEAT: string;
  forecastDemandMW: number;
  lowerConfidenceMW: number;
  upperConfidenceMW: number;
  generationAvailableMW: number;
  reserveMarginMW: number;
  projectedCongestionPct: number;
}

export interface GridAnomalyItem {
  id: string;
  assetId: string;
  assetName: string;
  parameter: string;
  anomalyType: 'HARMONIC_TRANSIENT' | 'THERMAL_GRADIENT' | 'INERTIA_DIP' | 'VOLTAGE_SAG' | 'SF6_MICRO_LEAK';
  classification: 'MEASURED' | 'DERIVED' | 'DETECTED' | 'PREDICTED';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  detectionTime: string;
  currentReading: string;
  expectedBaseline: string;
  variancePct: number;
  confidencePct: number;
  suggestedAction: string;
}

// Concrete Simulation / Scada Adapter Provider
export class SimulationDataProvider implements IGridDataProvider {
  private substations: Record<string, GridAsset> = CANONICAL_SUBSTATIONS;
  private lines: Record<string, TransmissionLine> = CANONICAL_LINES;
  private kpis: KpiFamily[] = CANONICAL_KPIS;
  private alarms: GridAlarm[] = CANONICAL_ALARMS;
  private events: GridEvent[] = CANONICAL_EVENTS;
  private aiInsights: Record<string, AiInvestigationInsight> = CANONICAL_AI_INSIGHTS;

  getTelemetrySnapshot(): TelemetrySnapshot {
    return {
      systemDemandMW: 2984,
      generationAvailableMW: 3120,
      frequencyHz: 50.01,
      spinningReserveMW: 380,
      transmissionAvailabilityPct: 99.4,
      onlineSubstationsCount: '48/49',
      activeOutagesCount: 1,
      criticalAlarmsCount: 3,
      congestionIndexPct: 18.4,
      systemInertiaGWs: 28.4,
      loadFactorPct: 84.2,
      transmissionLossMW: 118.4,
      transmissionLossPct: 3.97,
      freshness: 'SIMULATION',
      lastUpdated: new Date().toLocaleTimeString('en-GB', { hour12: false }) + ' EAT'
    };
  }

  getSubstations(): Record<string, GridAsset> {
    return this.substations;
  }

  getTransmissionLines(): Record<string, TransmissionLine> {
    return this.lines;
  }

  getKpis(): KpiFamily[] {
    return this.kpis;
  }

  getAlarms(): GridAlarm[] {
    return this.alarms;
  }

  getEvents(): GridEvent[] {
    return this.events;
  }

  getAiInsights(): Record<string, AiInvestigationInsight> {
    return this.aiInsights;
  }

  getRegionalHealth(): RegionalGridMetric[] {
    return [
      {
        regionId: 'RIFT_VALLEY',
        name: 'Rift Valley Backbone',
        loadMW: 1145,
        generationMW: 1420,
        availabilityPct: 99.8,
        riskScore: 42,
        criticalAlarmsCount: 1,
        activeOutagesCount: 0,
        status: 'OPTIMAL',
        keyNodes: ['Suswa 500kV', 'Olkaria 400kV', 'Naivasha 132kV']
      },
      {
        regionId: 'NAIROBI_METRO',
        name: 'Nairobi Metropolitan Ring',
        loadMW: 920,
        generationMW: 60,
        availabilityPct: 98.2,
        riskScore: 78,
        criticalAlarmsCount: 2,
        activeOutagesCount: 0,
        status: 'WARNING',
        keyNodes: ['Nairobi North 400kV', 'Embakasi 220kV', 'Dandora 220kV']
      },
      {
        regionId: 'COASTAL',
        name: 'Coastal Transmission Corridor',
        loadMW: 380,
        generationMW: 240,
        availabilityPct: 99.4,
        riskScore: 32,
        criticalAlarmsCount: 0,
        activeOutagesCount: 0,
        status: 'OPTIMAL',
        keyNodes: ['Mariakani 400kV', 'Rabai 220kV', 'Diani 132kV']
      },
      {
        regionId: 'WESTERN',
        name: 'Western Interconnector Hub',
        loadMW: 340,
        generationMW: 180,
        availabilityPct: 99.1,
        riskScore: 48,
        criticalAlarmsCount: 0,
        activeOutagesCount: 0,
        status: 'OPTIMAL',
        keyNodes: ['Lessos 400kV', 'Kisumu 220kV', 'Muhoroni 132kV']
      },
      {
        regionId: 'NORTHERN',
        name: 'Northern HVDC & Wind Corridor',
        loadMW: 40,
        generationMW: 1060,
        availabilityPct: 97.6,
        riskScore: 54,
        criticalAlarmsCount: 0,
        activeOutagesCount: 1,
        status: 'WARNING',
        keyNodes: ['Moyale 500kV HVDC', 'Loiyangalani 400kV', 'Marsabit 132kV']
      },
      {
        regionId: 'CENTRAL',
        name: 'Central Highlands & Mt Kenya',
        loadMW: 159,
        generationMW: 160,
        availabilityPct: 99.6,
        riskScore: 24,
        criticalAlarmsCount: 0,
        activeOutagesCount: 0,
        status: 'OPTIMAL',
        keyNodes: ['Kamburu 220kV', 'Gitaru 220kV', 'Nanyuki 132kV']
      }
    ];
  }

  getForecastNext6Hours(): HourlyForecast[] {
    const baseHour = new Date().getHours();
    return [
      {
        hourLabel: 'T+1 hr',
        timeEAT: `${(baseHour + 1) % 24}:00`,
        forecastDemandMW: 3040,
        lowerConfidenceMW: 2990,
        upperConfidenceMW: 3090,
        generationAvailableMW: 3350,
        reserveMarginMW: 310,
        projectedCongestionPct: 19.2
      },
      {
        hourLabel: 'T+2 hr (Peak)',
        timeEAT: `${(baseHour + 2) % 24}:00`,
        forecastDemandMW: 3125,
        lowerConfidenceMW: 3060,
        upperConfidenceMW: 3190,
        generationAvailableMW: 3380,
        reserveMarginMW: 255,
        projectedCongestionPct: 24.8
      },
      {
        hourLabel: 'T+3 hr',
        timeEAT: `${(baseHour + 3) % 24}:00`,
        forecastDemandMW: 3080,
        lowerConfidenceMW: 3010,
        upperConfidenceMW: 3150,
        generationAvailableMW: 3380,
        reserveMarginMW: 300,
        projectedCongestionPct: 21.0
      },
      {
        hourLabel: 'T+4 hr',
        timeEAT: `${(baseHour + 4) % 24}:00`,
        forecastDemandMW: 2840,
        lowerConfidenceMW: 2770,
        upperConfidenceMW: 2910,
        generationAvailableMW: 3250,
        reserveMarginMW: 410,
        projectedCongestionPct: 15.4
      },
      {
        hourLabel: 'T+5 hr',
        timeEAT: `${(baseHour + 5) % 24}:00`,
        forecastDemandMW: 2450,
        lowerConfidenceMW: 2380,
        upperConfidenceMW: 2520,
        generationAvailableMW: 3050,
        reserveMarginMW: 600,
        projectedCongestionPct: 8.5
      },
      {
        hourLabel: 'T+6 hr',
        timeEAT: `${(baseHour + 6) % 24}:00`,
        forecastDemandMW: 2180,
        lowerConfidenceMW: 2110,
        upperConfidenceMW: 2250,
        generationAvailableMW: 2850,
        reserveMarginMW: 670,
        projectedCongestionPct: 4.2
      }
    ];
  }

  getGridAnomalies(): GridAnomalyItem[] {
    return [
      {
        id: 'ANOM-2026-01',
        assetId: 'suswa',
        assetName: 'Suswa 500kV Hub',
        parameter: 'Phase-B Voltage Harmonic (THD)',
        anomalyType: 'HARMONIC_TRANSIENT',
        classification: 'DETECTED',
        severity: 'MEDIUM',
        detectionTime: '18:02:11 EAT',
        currentReading: '1.28% THD',
        expectedBaseline: '< 0.50% THD',
        variancePct: +156.0,
        confidencePct: 97.8,
        suggestedAction: 'Engage harmonic filter bank HF-2 on 500kV HVDC terminal converter.'
      },
      {
        id: 'ANOM-2026-02',
        assetId: 'nairobi_ring',
        assetName: 'Nairobi 220kV Ring (Embakasi)',
        parameter: 'Transformer T1 Thermal Gradient Rise',
        anomalyType: 'THERMAL_GRADIENT',
        classification: 'MEASURED',
        severity: 'HIGH',
        detectionTime: '18:14:22 EAT',
        currentReading: '72.8°C (dT/dt: +0.4°C/min)',
        expectedBaseline: '< 65.0°C steady',
        variancePct: +18.4,
        confidencePct: 99.2,
        suggestedAction: 'Transfer 45MW metro feeder load onto Isinya 220kV interconnector.'
      },
      {
        id: 'ANOM-2026-03',
        assetId: 'loiyangalani',
        assetName: 'Loiyangalani 400kV Substation',
        parameter: 'Wind Ingest Rotor Angle Differential',
        anomalyType: 'INERTIA_DIP',
        classification: 'DERIVED',
        severity: 'LOW',
        detectionTime: '17:45:00 EAT',
        currentReading: 'Delta 12.4° (PMU)',
        expectedBaseline: '< 10.0°',
        variancePct: +24.0,
        confidencePct: 94.5,
        suggestedAction: 'Coordinate with Lake Turkana Wind Power dispatch for pitch rate damping.'
      }
    ];
  }
}

export const gridDataProvider = new SimulationDataProvider();
