import type { FutureGridState, FutureGridScenario, FutureGridYear, PlanningEvidence, TemporalState } from './types';

export class FutureGridDigitalTwin {
  private static instance: FutureGridDigitalTwin | null = null;

  public static getInstance(): FutureGridDigitalTwin {
    if (!FutureGridDigitalTwin.instance) {
      FutureGridDigitalTwin.instance = new FutureGridDigitalTwin();
    }
    return FutureGridDigitalTwin.instance;
  }

  public getStateForYear(year: FutureGridYear, scenarioId = 'base-case'): FutureGridState {
    const states = this.getBaseCaseScenario().states;
    const found = states.find(s => s.year === year);
    if (found) return found;
    return this.generateState(year, 'FORECAST');
  }

  public getBaseCaseScenario(): FutureGridScenario {
    return {
      id: 'base-case',
      name: 'Base Case — Current Trajectory',
      baseYear: '2026',
      targetYear: '2035',
      assumptions: [
        'Demand growth at 4.1% CAGR consistent with Kenya Vision 2030',
        'Generation additions per least-cost generation expansion plan',
        'Renewable penetration rising to 54% by 2030 per national targets',
        'All committed transmission projects delivered on schedule',
        'No major force majeure events',
      ],
      states: [
        this.generateState('2026', 'LIVE'),
        this.generateState('2027', 'FORECAST'),
        this.generateState('2028', 'FORECAST'),
        this.generateState('2029', 'FORECAST'),
        this.generateState('2030', 'FORECAST'),
        this.generateState('2035', 'FUTURE'),
      ],
    };
  }

  public getHighGrowthScenario(): FutureGridScenario {
    return {
      id: 'high-growth',
      name: 'High Growth — Accelerated Industrialisation',
      baseYear: '2026',
      targetYear: '2035',
      assumptions: [
        'Demand growth at 7.8% CAGR driven by industrial expansion',
        'Generation additions lag demand by 18-24 months',
        'Renewable share reaches 46% by 2030',
        'Several transmission projects delayed',
        'Increased cross-border power trade',
      ],
      states: [
        this.generateState('2026', 'LIVE', 1.0),
        this.generateState('2027', 'FORECAST', 1.12),
        this.generateState('2028', 'FORECAST', 1.25),
        this.generateState('2029', 'FORECAST', 1.40),
        this.generateState('2030', 'FORECAST', 1.56),
        this.generateState('2035', 'FUTURE', 2.15),
      ],
    };
  }

  public getRenewablesHeavyScenario(): FutureGridScenario {
    return {
      id: 'renewables-heavy',
      name: 'Renewables-Heavy — Green Transition',
      baseYear: '2026',
      targetYear: '2035',
      assumptions: [
        'Aggressive renewable deployment with storage support',
        'Demand growth at 5.9% CAGR',
        'Renewable share reaches 58% by 2030',
        'Full HVDC interconnector capacity utilisation',
        'Weather-driven output volatility compensated by flexible reserves',
      ],
      states: [
        this.generateState('2026', 'LIVE', 1.0),
        this.generateState('2027', 'FORECAST', 1.05),
        this.generateState('2028', 'FORECAST', 1.12),
        this.generateState('2029', 'FORECAST', 1.20),
        this.generateState('2030', 'FORECAST', 1.30),
        this.generateState('2035', 'FUTURE', 1.65),
      ],
    };
  }

  public getAllScenarios(): FutureGridScenario[] {
    return [
      this.getBaseCaseScenario(),
      this.getHighGrowthScenario(),
      this.getRenewablesHeavyScenario(),
    ];
  }

  public compareYearStates(year: FutureGridYear): Array<{ scenarioId: string; scenarioName: string; state: FutureGridState; }> {
    return this.getAllScenarios().map(scenario => ({
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      state: this.getStateForYear(year, scenario.id),
    }));
  }

  private generateState(year: FutureGridYear, temporalMode: TemporalState, scaleFactor = 1.0): FutureGridState {
    const yearNum = parseInt(year);
    const baseYearNum = 2026;
    const yearsFromBase = yearNum - baseYearNum;

    const baseDemand = 8200;
    const baseGeneration = 8600;
    const baseRenewable = 2600;
    const baseReserve = 18;
    const baseCongestion = 41;
    const baseN1 = 62;
    const baseLoss = 3.97;

    const demandGrowth = 1 + (0.041 * yearsFromBase * scaleFactor);
    const generationGrowth = 1 + (0.046 * yearsFromBase * scaleFactor);
    const renewableGrowth = 1 + (0.08 * yearsFromBase);

    const demandForecast = Math.round(baseDemand * demandGrowth);
    const generationCapacity = Math.round(baseGeneration * generationGrowth);
    const renewableCapacity = Math.round(baseRenewable * renewableGrowth);
    const renewablePct = Math.round((renewableCapacity / generationCapacity) * 100);

    const congestion = Math.min(95, Math.round(baseCongestion + yearsFromBase * 6 * scaleFactor));
    const n1 = Math.max(25, Math.round(baseN1 - yearsFromBase * 3.5 * scaleFactor));
    const loss = Math.min(8, Number((baseLoss + yearsFromBase * 0.15 * scaleFactor).toFixed(2)));
    const reserveMargin = Math.max(8, Math.round(baseReserve - yearsFromBase * 1.2 * scaleFactor));

    const evidence: PlanningEvidence[] = [{
      source: `Future grid digital twin — ${year} projection`,
      timestamp: new Date().toISOString(),
      modelVersion: 'future-grid-v1.0',
      inputs: ['demand forecast model', 'generation expansion plan', 'transmission reinforcement plan', 'renewable deployment target'],
      assumptions: [`${year} projection based on ${temporalMode.toLowerCase()} data with ${scaleFactor.toFixed(2)}x scaling`],
      confidence: yearNum <= 2027 ? 0.88 : yearNum <= 2030 ? 0.75 : 0.6,
      dataState: yearNum <= 2026 ? 'ACTUAL' : yearNum <= 2028 ? 'COMMITTED' : 'MODELLED',
    }];

    return {
      year,
      temporalMode,
      demandForecastMw: demandForecast,
      generationCapacityMw: generationCapacity,
      renewableCapacityMw: renewableCapacity,
      renewableSharePct: renewablePct,
      reserveMarginPct: reserveMargin,
      congestionIndexPct: congestion,
      n1CompliancePct: n1,
      transmissionLossPct: loss,
      installedSubstations: 49 + Math.round(yearsFromBase * 2),
      newSubstations: Math.round(yearsFromBase * 2),
      retiredAssets: Math.round(yearsFromBase * 0.5),
      hvdcCapacityMw: 200 + Math.round(yearsFromBase * 100),
      inertiaEstimateGws: Math.max(18, Number((28.4 - yearsFromBase * 0.8 * scaleFactor).toFixed(1))),
      curtailmentRiskPct: Math.min(35, Math.round(8 + yearsFromBase * 3 * scaleFactor)),
      capacityMarginPct: Math.max(5, Math.round(16 - yearsFromBase * 1.5 * scaleFactor)),
      projectsCompleted: Math.round(yearsFromBase * 3),
      projectsInProgress: Math.max(2, 8 - Math.round(yearsFromBase * 0.5)),
      projectsPlanned: Math.max(1, 12 - Math.round(yearsFromBase)),
      evidence,
    };
  }
}

export const futureGridDigitalTwin = FutureGridDigitalTwin.getInstance();
