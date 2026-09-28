import type { PlanningScenario, PlanningEvidence } from './types';

export class ScenarioPlanningEngine {
  private static instance: ScenarioPlanningEngine | null = null;

  public static getInstance(): ScenarioPlanningEngine {
    if (!ScenarioPlanningEngine.instance) {
      ScenarioPlanningEngine.instance = new ScenarioPlanningEngine();
    }
    return ScenarioPlanningEngine.instance;
  }

  public buildScenarios(): PlanningScenario[] {
    return [
      {
        id: 'base-case',
        name: 'Base case',
        assumptions: ['Demand growth stays near current trend', 'No major project slippage'],
        demandGrowthPct: 4.1,
        generationGrowthPct: 4.6,
        renewablePenetrationPct: 38,
        projectDelay: false,
        assetFailureRiskPct: 2.4,
        hvdcExpansion: false,
        regionalShiftPct: 3,
        results: { reserveMargin: 18, congestion: 44, n1Margin: 62, curtailmentRisk: 12, investmentNeedMw: 620, riskScore: 42 },
      },
      {
        id: 'high-growth',
        name: 'High demand growth',
        assumptions: ['Industrial and urban load growth accelerates', 'Generation additions lag'],
        demandGrowthPct: 7.8,
        generationGrowthPct: 5.2,
        renewablePenetrationPct: 46,
        projectDelay: true,
        assetFailureRiskPct: 4.5,
        hvdcExpansion: true,
        regionalShiftPct: 8,
        results: { reserveMargin: 12, congestion: 68, n1Margin: 48, curtailmentRisk: 27, investmentNeedMw: 920, riskScore: 74 },
      },
      {
        id: 'renewables-heavy',
        name: 'Renewables-heavy',
        assumptions: ['High renewable penetration with storage support', 'Weather-driven output volatility rises'],
        demandGrowthPct: 5.9,
        generationGrowthPct: 8.1,
        renewablePenetrationPct: 58,
        projectDelay: false,
        assetFailureRiskPct: 3.4,
        hvdcExpansion: true,
        regionalShiftPct: 6,
        results: { reserveMargin: 15, congestion: 56, n1Margin: 58, curtailmentRisk: 20, investmentNeedMw: 780, riskScore: 61 },
      },
    ];
  }

  public compareScenarios(scenarios: PlanningScenario[]): Array<{ scenarioId: string; summary: string; riskTrend: number; evidence: PlanningEvidence[]; }> {
    return scenarios.map((scenario) => ({
      scenarioId: scenario.id,
      summary: `${scenario.name} produces ${scenario.results.reserveMargin}% reserve margin, ${scenario.results.congestion}% congestion, and ${scenario.results.curtailmentRisk}% curtailment risk.`,
      riskTrend: scenario.results.riskScore,
      evidence: [{
        source: 'Scenario planning laboratory',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v1.0',
        inputs: ['demand growth', 'generation growth', 'renewable share', 'project delays'],
        assumptions: scenario.assumptions,
        confidence: 0.8,
        dataState: 'MODELLED',
      }],
    }));
  }
}

export const scenarioPlanningEngine = ScenarioPlanningEngine.getInstance();
