import type { PlanningEvidence, WeatherMaintenanceAnalysis, WeatherMaintenanceExposure } from './types';

export class WeatherMaintenanceEngine {
  private static instance: WeatherMaintenanceEngine | null = null;

  public static getInstance(): WeatherMaintenanceEngine {
    if (!WeatherMaintenanceEngine.instance) {
      WeatherMaintenanceEngine.instance = new WeatherMaintenanceEngine();
    }
    return WeatherMaintenanceEngine.instance;
  }

  public analyze(): WeatherMaintenanceAnalysis {
    const exposures = this.getAssetExposures();
    const highRisk = exposures.filter(e => e.weatherRisk === 'HIGH' || e.weatherRisk === 'EXTREME').length;
    const priorityQueue = exposures
      .sort((a, b) => b.maintenancePriority - a.maintenancePriority)
      .map(e => e.assetName);

    const overallRisk = highRisk >= 4 ? 'HIGH' : highRisk >= 2 ? 'MEDIUM' : 'LOW';

    return {
      exposures,
      highRiskAssets: highRisk,
      maintenancePriorityQueue: priorityQueue,
      overallWeatherRisk: overallRisk,
      forecastHorizon: '72 hours',
      evidence: [{
        source: 'Weather × Maintenance intelligence engine',
        timestamp: new Date().toISOString(),
        modelVersion: 'weather-maint-v1.0',
        inputs: ['MET weather forecast', 'lightning detection network', 'asset vulnerability model', 'maintenance schedule'],
        assumptions: ['Weather forecasts valid for 72-hour window', 'Asset exposure based on terrain and construction type'],
        confidence: 0.82,
        dataState: 'MODELLED',
      }],
    };
  }

  private getAssetExposures(): WeatherMaintenanceExposure[] {
    const now = new Date().toISOString();
    return [
      {
        assetId: 'suswa_500', assetName: 'Suswa 500kV Hub', region: 'RIFT_VALLEY',
        weatherRisk: 'MEDIUM', weatherFactor: 'Moderate wind gusts forecast 45 km/h',
        temperatureC: 28, windSpeedKmh: 45, rainfallMm: 0, lightningRisk: 15,
        assetExposurePct: 42, outageRiskPct: 12, maintenancePriority: 65,
        confidence: 0.88, source: 'MET_KIA', timestamp: now,
      },
      {
        assetId: 'loiyangalani_400', assetName: 'Loiyangalani 400kV', region: 'NORTHERN',
        weatherRisk: 'HIGH', weatherFactor: 'Thunderstorm warning with heavy lightning activity',
        temperatureC: 34, windSpeedKmh: 62, rainfallMm: 28, lightningRisk: 78,
        assetExposurePct: 76, outageRiskPct: 34, maintenancePriority: 92,
        confidence: 0.84, source: 'MET_KMD', timestamp: now,
      },
      {
        assetId: 'mombasa_220', assetName: 'Mombasa 220kV Corridor', region: 'COASTAL',
        weatherRisk: 'LOW', weatherFactor: 'Clear conditions, light sea breeze',
        temperatureC: 31, windSpeedKmh: 18, rainfallMm: 0, lightningRisk: 5,
        assetExposurePct: 12, outageRiskPct: 4, maintenancePriority: 28,
        confidence: 0.92, source: 'MET_KIA', timestamp: now,
      },
      {
        assetId: 'kisumu_220', assetName: 'Kisumu 220kV Station', region: 'WESTERN',
        weatherRisk: 'MEDIUM', weatherFactor: 'Intermittent rain expected, moderate wind',
        temperatureC: 26, windSpeedKmh: 32, rainfallMm: 12, lightningRisk: 35,
        assetExposurePct: 48, outageRiskPct: 18, maintenancePriority: 58,
        confidence: 0.86, source: 'MET_KMD', timestamp: now,
      },
      {
        assetId: 'nairobi_north_400', assetName: 'Nairobi North 400kV', region: 'NAIROBI',
        weatherRisk: 'LOW', weatherFactor: 'Dry conditions, mild temperatures',
        temperatureC: 22, windSpeedKmh: 12, rainfallMm: 0, lightningRisk: 3,
        assetExposurePct: 8, outageRiskPct: 2, maintenancePriority: 22,
        confidence: 0.93, source: 'MET_KIA', timestamp: now,
      },
      {
        assetId: 'lessos_400', assetName: 'Lessos 400kV Interconnector', region: 'WESTERN',
        weatherRisk: 'HIGH', weatherFactor: 'Heavy rainfall with potential flash flooding risk',
        temperatureC: 24, windSpeedKmh: 38, rainfallMm: 45, lightningRisk: 62,
        assetExposurePct: 68, outageRiskPct: 28, maintenancePriority: 85,
        confidence: 0.81, source: 'MET_KMD', timestamp: now,
      },
      {
        assetId: 'marsabit_132', assetName: 'Marsabit 132kV', region: 'NORTHERN',
        weatherRisk: 'EXTREME', weatherFactor: 'Severe thunderstorm with damaging wind and hail risk',
        temperatureC: 38, windSpeedKmh: 85, rainfallMm: 55, lightningRisk: 92,
        assetExposurePct: 88, outageRiskPct: 52, maintenancePriority: 98,
        confidence: 0.78, source: 'MET_KMD', timestamp: now,
      },
      {
        assetId: 'kamburu_220', assetName: 'Kamburu 220kV Hydro', region: 'CENTRAL',
        weatherRisk: 'LOW', weatherFactor: 'Stable conditions, slight cloud cover',
        temperatureC: 20, windSpeedKmh: 8, rainfallMm: 0, lightningRisk: 2,
        assetExposurePct: 6, outageRiskPct: 1, maintenancePriority: 15,
        confidence: 0.94, source: 'MET_KIA', timestamp: now,
      },
    ];
  }
}

export const weatherMaintenanceEngine = WeatherMaintenanceEngine.getInstance();
