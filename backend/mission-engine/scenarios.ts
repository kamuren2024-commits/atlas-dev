/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Scenario Comparison Engine
 * 
 * Generate and compare scenarios: CURRENT vs NO_ACTION vs OPTION_A vs OPTION_B vs OPTION_C
 */

import { Mission, Scenario, ScenarioComparison } from './types';

/**
 * Scenario Comparison Engine
 */
export class ScenarioEngine {
  private static instance: ScenarioEngine | null = null;

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): ScenarioEngine {
    if (!ScenarioEngine.instance) {
      ScenarioEngine.instance = new ScenarioEngine();
    }
    return ScenarioEngine.instance;
  }

  /**
   * Generate scenarios for mission
   */
  public async generateScenarios(mission: Mission): Promise<ScenarioComparison> {
    console.log('[SCENARIO-ENGINE] Generating scenarios for mission:', mission.id);

    try {
      const scenarios: Scenario[] = [];

      // 1. CURRENT scenario (baseline)
      const current = this.generateCurrentScenario(mission);
      scenarios.push(current);

      // 2. NO_ACTION scenario (do nothing, wait)
      const noAction = this.generateNoActionScenario(mission);
      scenarios.push(noAction);

      // 3-5. Action scenarios (recommendations)
      const actionScenarios = this.generateActionScenarios(mission);
      scenarios.push(...actionScenarios);

      // Rank scenarios by expected outcome
      const ranked = this.rankScenarios(scenarios, mission);

      return {
        scenarios: ranked,
        recommended: ranked[0],
        comparison: this.compareScenarios(ranked),
      };
    } catch (error) {
      console.error('[SCENARIO-ENGINE] Error generating scenarios:', error);

      return {
        scenarios: [],
        recommended: undefined,
        comparison: {},
      };
    }
  }

  /**
   * Generate CURRENT scenario (baseline)
   */
  private generateCurrentScenario(mission: Mission): Scenario {
    const isCongestioned = mission.type === 'CONGESTION';
    const isOutage = mission.type === 'CRITICAL_OUTAGE';
    const isCascade = mission.type === 'CASCADE_RISK';

    return {
      id: 'current',
      name: 'Current State',
      description: 'Baseline - continue current operations',
      type: 'BASELINE',
      gridMetrics: {
        frequency: isOutage ? 59.2 : isCascade ? 59.5 : 60.0,
        voltageMin: isCongestioned ? 0.92 : 0.96,
        voltageMax: isCongestioned ? 1.08 : 1.04,
        lineLoadingMax: isCongestioned ? 105 : 75,
        reserveMargin: isCongestioned ? 8 : 25,
        affectedCustomers: isOutage ? 150000 : 0,
      },
      timeframe: 'Now',
      riskLevel: mission.severity,
      keyMetrics: {
        systemStability: isCascade ? 'UNSTABLE' : 'STABLE',
        congestionStatus: isCongestioned ? 'CONGESTED' : 'OK',
        cascadeProbability: isCascade ? '45%' : '2%',
        timeToFailure: isCascade ? '15 minutes' : 'N/A',
      },
      operationalNote: 'Situation is deteriorating. Without intervention, cascade likely.',
    };
  }

  /**
   * Generate NO_ACTION scenario (wait and see)
   */
  private generateNoActionScenario(mission: Mission): Scenario {
    const isCascade = mission.type === 'CASCADE_RISK';

    return {
      id: 'no-action',
      name: 'Do Nothing - Monitor',
      description: 'Continue monitoring without intervention',
      type: 'PASSIVE',
      gridMetrics: {
        frequency: isCascade ? 58.8 : 60.0,
        voltageMin: isCascade ? 0.88 : 0.96,
        voltageMax: isCascade ? 1.10 : 1.04,
        lineLoadingMax: isCascade ? 115 : 85,
        reserveMargin: isCascade ? 2 : 20,
        affectedCustomers: isCascade ? 500000 : 50000,
      },
      timeframe: '30 minutes',
      riskLevel: isCascade ? 'CRITICAL' : 'HIGH',
      keyMetrics: {
        systemStability: isCascade ? 'COLLAPSE_RISK' : 'DEGRADED',
        congestionStatus: 'WORSENING',
        cascadeProbability: isCascade ? '92%' : '35%',
        timeToFailure: isCascade ? '8 minutes' : '25 minutes',
      },
      operationalNote:
        'High risk of cascade failure. System degrades rapidly without action.',
      probability: 0.85,
    };
  }

  /**
   * Generate ACTION scenarios
   */
  private generateActionScenarios(mission: Mission): Scenario[] {
    const scenarios: Scenario[] = [];

    if (mission.type === 'CRITICAL_OUTAGE') {
      scenarios.push(
        {
          id: 'option-a',
          name: 'Quick Isolation',
          description: 'Isolate faulted element to prevent cascade',
          type: 'MITIGATION',
          gridMetrics: {
            frequency: 59.8,
            voltageMin: 0.94,
            voltageMax: 1.06,
            lineLoadingMax: 82,
            reserveMargin: 18,
            affectedCustomers: 50000,
          },
          timeframe: '10 minutes',
          riskLevel: 'HIGH',
          keyMetrics: {
            systemStability: 'STABLE_WITH_REDUCED_CAPACITY',
            cascadeProbability: '8%',
            customerRecoveryTime: '4 hours',
          },
          operationalNote: 'Prevents cascade but leaves customers without service.',
          benefit: 'Avoids total collapse',
          cost: 'Temporary outage for some customers',
          probability: 0.90,
        },
        {
          id: 'option-b',
          name: 'Alternate Path Routing',
          description: 'Route power through backup transmission path',
          type: 'MITIGATION',
          gridMetrics: {
            frequency: 59.95,
            voltageMin: 0.93,
            voltageMax: 1.07,
            lineLoadingMax: 95,
            reserveMargin: 12,
            affectedCustomers: 5000,
          },
          timeframe: '15 minutes',
          riskLevel: 'MEDIUM',
          keyMetrics: {
            systemStability: 'STABLE_WITH_HIGHER_LOADING',
            cascadeProbability: '5%',
            customerRecoveryTime: '30 minutes',
          },
          operationalNote: 'Restores most service, but increases loading on backup path.',
          benefit: 'Minimal customer impact, maintains stability',
          cost: 'Higher stress on alternate equipment',
          probability: 0.75,
        },
        {
          id: 'option-c',
          name: 'Full Equipment Replacement',
          description: 'Deploy spare transformer/breaker for permanent fix',
          type: 'RESTORATION',
          gridMetrics: {
            frequency: 60.0,
            voltageMin: 0.96,
            voltageMax: 1.04,
            lineLoadingMax: 75,
            reserveMargin: 25,
            affectedCustomers: 0,
          },
          timeframe: '240 minutes',
          riskLevel: 'LOW',
          keyMetrics: {
            systemStability: 'FULLY_STABLE',
            cascadeProbability: '1%',
            customerRecoveryTime: 'Complete',
          },
          operationalNote: 'Permanent restoration. Long but most reliable option.',
          benefit: 'Full system restoration',
          cost: 'Long duration, requires equipment availability',
          probability: 0.80,
        }
      );
    } else if (mission.type === 'CONGESTION') {
      scenarios.push(
        {
          id: 'option-a',
          name: 'Generation Redispatch',
          description: 'Shift generation away from congested line',
          type: 'MITIGATION',
          gridMetrics: {
            frequency: 60.0,
            voltageMin: 0.96,
            voltageMax: 1.04,
            lineLoadingMax: 82,
            reserveMargin: 18,
            affectedCustomers: 0,
          },
          timeframe: '5 minutes',
          riskLevel: 'LOW',
          keyMetrics: {
            systemStability: 'STABLE',
            congestionStatus: 'RELIEVED',
            operatingCost: 'Increased by 2%',
          },
          operationalNote: 'Fast, reversible, minimal customer impact.',
          benefit: 'Immediate relief, low risk',
          cost: 'Slightly higher generation cost',
          probability: 0.95,
        },
        {
          id: 'option-b',
          name: 'Demand Response',
          description: 'Request voluntary load reduction',
          type: 'MITIGATION',
          gridMetrics: {
            frequency: 60.0,
            voltageMin: 0.96,
            voltageMax: 1.04,
            lineLoadingMax: 78,
            reserveMargin: 22,
            affectedCustomers: 0,
          },
          timeframe: '10 minutes',
          riskLevel: 'MEDIUM',
          keyMetrics: {
            systemStability: 'STABLE',
            congestionStatus: 'PARTIALLY_RELIEVED',
            customerParticipation: '60%',
          },
          operationalNote: 'Voluntary response, may not achieve full relief.',
          benefit: 'Environmentally friendly',
          cost: 'Uncertain customer participation',
          probability: 0.60,
        }
      );
    } else if (mission.type === 'CASCADE_RISK') {
      scenarios.push(
        {
          id: 'option-a',
          name: 'Emergency Load Shedding',
          description: 'Activate automatic underfrequency load shedding',
          type: 'EMERGENCY',
          gridMetrics: {
            frequency: 59.7,
            voltageMin: 0.95,
            voltageMax: 1.05,
            lineLoadingMax: 60,
            reserveMargin: 30,
            affectedCustomers: 200000,
          },
          timeframe: '1 minute',
          riskLevel: 'MEDIUM',
          keyMetrics: {
            systemStability: 'RESTORED',
            cascadeProbability: '2%',
            loadshedAmount: '15% of total',
          },
          operationalNote: 'Controlled blackout prevents total collapse.',
          benefit: 'Prevents cascading failure',
          cost: 'Significant but temporary outage',
          probability: 0.92,
        }
      );
    }

    return scenarios;
  }

  /**
   * Rank scenarios by expected outcome
   */
  private rankScenarios(scenarios: Scenario[], mission: Mission): Scenario[] {
    const scored = scenarios.map((scenario) => {
      let score = 0;

      // Stability (40%)
      const stabilityMap: Record<string, number> = {
        FULLY_STABLE: 100,
        STABLE: 95,
        STABLE_WITH_REDUCED_CAPACITY: 85,
        STABLE_WITH_HIGHER_LOADING: 75,
        RESTORED: 90,
        DEGRADED: 50,
        COLLAPSE_RISK: 10,
        UNSTABLE: 20,
      };
      const stabilityScore =
        stabilityMap[scenario.keyMetrics.systemStability] || 50;
      score += (stabilityScore / 100) * 40;

      // Risk (30%)
      const riskMap: Record<string, number> = { LOW: 95, MEDIUM: 70, HIGH: 40, CRITICAL: 10 };
      const riskScore = riskMap[scenario.riskLevel] || 50;
      score += (riskScore / 100) * 30;

      // Timeframe speed (20%)
      let timeframeScore = 50;
      if (scenario.timeframe.includes('minute')) {
        const minutes = parseInt(scenario.timeframe);
        timeframeScore = Math.max(20, 100 - minutes * 2);
      }
      score += (timeframeScore / 100) * 20;

      // Probability of success (10%)
      score += (scenario.probability || 0.75) * 10;

      return { scenario, score };
    });

    // Sort by score descending
    return scored
      .sort((a, b) => b.score - a.score)
      .map((s) => ({
        ...s.scenario,
        score: s.score,
      }));
  }

  /**
   * Compare scenarios side-by-side
   */
  private compareScenarios(scenarios: Scenario[]): Record<string, unknown> {
    const comparison: Record<string, unknown> = {};

    scenarios.forEach((scenario) => {
      comparison[scenario.id] = {
        name: scenario.name,
        stability: scenario.keyMetrics.systemStability,
        riskLevel: scenario.riskLevel,
        timeframe: scenario.timeframe,
        customerImpact: scenario.gridMetrics.affectedCustomers,
        benefit: scenario.benefit,
        cost: scenario.cost,
        score: scenario.score,
      };
    });

    return comparison;
  }
}

export default ScenarioEngine;
