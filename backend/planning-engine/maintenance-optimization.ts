import type { MaintenanceSimulationResult, MaintenanceWindow, PlanningEvidence } from './types';

export class MaintenanceOptimizationEngine {
  private static instance: MaintenanceOptimizationEngine | null = null;

  public static getInstance(): MaintenanceOptimizationEngine {
    if (!MaintenanceOptimizationEngine.instance) {
      MaintenanceOptimizationEngine.instance = new MaintenanceOptimizationEngine();
    }
    return MaintenanceOptimizationEngine.instance;
  }

  public getBaselineMaintenance(): MaintenanceWindow[] {
    const now = new Date();
    const days = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();

    return [
      {
        id: 'MNT-118', assetId: 'suswa_tx_t3', assetName: 'Suswa 220kV Transformer T3',
        workType: 'Oil replacement and bushing inspection', start: days(3), end: days(5),
        requiredIsolation: ['Suswa 220kV Bay 3 isolation', 'Transformer HV/LV disconnection'],
        risk: 78, criticality: 82, demandForecast: 72, generationAvailability: 85,
        weatherExposure: 45, congestion: 68, n1Margin: 42, status: 'PROPOSED',
        evidence: [{ source: 'EAM SAP PM Order WO-2026-4418', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['DGA analysis', 'oil quality report', 'bushing power factor test'], assumptions: ['Standard maintenance procedure, no complications expected'], confidence: 0.88, dataState: 'PLANNED' }],
      },
      {
        id: 'MNT-221', assetId: 'mombasa_bay1', assetName: 'Mombasa Bay 132kV Annual Service',
        workType: 'Annual bay inspection and breaker servicing', start: days(6), end: days(7),
        requiredIsolation: ['Mombasa 132kV Bay 1 isolation', 'Feeder disconnect'],
        risk: 44, criticality: 58, demandForecast: 52, generationAvailability: 90,
        weatherExposure: 22, congestion: 38, n1Margin: 72, status: 'APPROVED',
        evidence: [{ source: 'SAP PM schedule', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['breaker trip count', 'mechanism wear assessment'], assumptions: ['Low weather risk, stable demand'], confidence: 0.92, dataState: 'PLANNED' }],
      },
      {
        id: 'MNT-362', assetId: 'naivasha_reactor', assetName: 'Naivasha 220kV Shunt Reactor',
        workType: 'Reactor core inspection and cooling system service', start: days(1), end: days(3),
        requiredIsolation: ['Naivasha 220kV Reactor bay isolation', 'Reactor ground connection'],
        risk: 85, criticality: 90, demandForecast: 78, generationAvailability: 82,
        weatherExposure: 72, congestion: 74, n1Margin: 38, status: 'PROPOSED',
        evidence: [{ source: 'Maintenance planner + weather advisory', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['reactor temperature trending', 'MET weather advisory'], assumptions: ['Thunderstorm risk in corridor — may need rescheduling'], confidence: 0.78, dataState: 'MODELLED' }],
      },
      {
        id: 'MNT-405', assetId: 'lessos_bay4', assetName: 'Lessos 400kV Bay 4 Breaker Service',
        workType: 'SF6 gas top-up, mechanism service, trip test', start: days(8), end: days(9),
        requiredIsolation: ['Lessos 400kV Bay 4 isolation'],
        risk: 52, criticality: 64, demandForecast: 58, generationAvailability: 88,
        weatherExposure: 30, congestion: 48, n1Margin: 62, status: 'PROPOSED',
        evidence: [{ source: 'SAP PM + SF6 trending', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['SF6 pressure trend', 'breaker operation count'], assumptions: ['Standard breaker service window'], confidence: 0.9, dataState: 'PLANNED' }],
      },
      {
        id: 'MNT-510', assetId: 'olkt1_t2', assetName: 'Olkaria I Transformer T2 DGA',
        workType: 'DGA sampling, thermal imaging, tap changer service', start: days(10), end: days(11),
        requiredIsolation: ['Olkaria I 400kV Transformer T2 partial isolation'],
        risk: 38, criticality: 48, demandForecast: 42, generationAvailability: 92,
        weatherExposure: 18, congestion: 28, n1Margin: 78, status: 'APPROVED',
        evidence: [{ source: 'DGA trending system', timestamp: now.toISOString(), modelVersion: 'grid-plan-v2.0', inputs: ['DGA results', 'oil temperature history'], assumptions: ['Low risk routine DGA service'], confidence: 0.94, dataState: 'ACTUAL' }],
      },
    ];
  }

  public scoreWindow(window: Partial<MaintenanceWindow>): number {
    const risk = window.risk ?? 0;
    const criticality = window.criticality ?? 0;
    const demandForecast = window.demandForecast ?? 0;
    const generationAvailability = window.generationAvailability ?? 0;
    const weatherExposure = window.weatherExposure ?? 0;
    const congestion = window.congestion ?? 0;
    const n1Margin = window.n1Margin ?? 0;

    return (
      risk * 0.25 +
      criticality * 0.2 +
      demandForecast * 0.15 +
      (100 - generationAvailability) * 0.1 +
      weatherExposure * 0.15 +
      congestion * 0.1 +
      (100 - n1Margin) * 0.05
    );
  }

  public rankWindows(windows: MaintenanceWindow[]): MaintenanceWindow[] {
    return [...windows].sort((a, b) => this.scoreWindow(b) - this.scoreWindow(a));
  }

  public generateCandidateWindows(maintenance: Partial<MaintenanceWindow>[]): MaintenanceWindow[] {
    return maintenance.map((item, index) => ({
      id: item.id ?? `maintenance-${index + 1}`,
      assetId: item.assetId ?? `asset-${index + 1}`,
      assetName: item.assetName ?? `Asset ${index + 1}`,
      workType: item.workType ?? 'Routine inspection',
      start: item.start ?? new Date().toISOString(),
      end: item.end ?? new Date(Date.now() + 3600000).toISOString(),
      requiredIsolation: item.requiredIsolation ?? ['Line isolation', 'Transformer bay lockout'],
      risk: item.risk ?? 44,
      criticality: item.criticality ?? 70,
      demandForecast: item.demandForecast ?? 62,
      generationAvailability: item.generationAvailability ?? 82,
      weatherExposure: item.weatherExposure ?? 35,
      congestion: item.congestion ?? 52,
      n1Margin: item.n1Margin ?? 58,
      status: item.status ?? 'PROPOSED',
      evidence: item.evidence ?? [{
        source: 'Maintenance optimization model',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v2.0',
        inputs: ['asset risk profile', 'weather outlook', 'demand forecast'],
        assumptions: ['No emergency forcing of work without operator approval'],
        confidence: 0.8,
        dataState: 'MODELLED',
      }],
    }));
  }

  public simulateMaintenance(
    window: Partial<MaintenanceWindow>,
    affectedLoadMw = 250,
  ): MaintenanceSimulationResult {
    const riskScore = window.risk ?? 48;
    const congestionScore = window.congestion ?? 62;
    const n1Score = window.n1Margin ?? 52;

    const current = {
      risk: Math.round(riskScore * 0.65),
      congestion: Math.round(congestionScore * 0.7),
      reserve: Math.round(18 + n1Score * 0.1),
      n1: Math.round(n1Score),
      affectedLoadMw,
      recoveryHours: 3,
    };

    const maintenance = {
      risk: Math.min(100, Math.round(riskScore + 18)),
      congestion: Math.min(100, Math.round(congestionScore + 14)),
      reserve: Math.max(2, Math.round(18 - n1Score / 12)),
      n1: Math.max(10, Math.round(n1Score - 16)),
      affectedLoadMw: Math.min(1200, Math.round(affectedLoadMw + n1Score * 2.5)),
      recoveryHours: Math.round(6 + riskScore * 0.1),
    };

    const deferred = {
      risk: Math.max(14, Math.round(riskScore - 6)),
      congestion: Math.max(18, Math.round(congestionScore - 8)),
      reserve: Math.min(30, Math.round(18 + 5)),
      n1: Math.min(100, Math.round(n1Score + 8)),
      affectedLoadMw: Math.max(0, Math.round(affectedLoadMw - 120)),
      recoveryHours: 5,
    };

    const scoreMaintenance = maintenance.risk + maintenance.congestion - maintenance.reserve;
    const scoreCurrent = current.risk + current.congestion - current.reserve;
    const recommendation = scoreMaintenance > scoreCurrent + 10 ? 'DEFERRED' : 'MAINTENANCE';

    return { current, maintenance, deferred, recommendation };
  }
}

export const maintenanceOptimizationEngine = MaintenanceOptimizationEngine.getInstance();
