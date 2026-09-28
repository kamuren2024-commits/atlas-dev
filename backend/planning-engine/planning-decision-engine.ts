import type { ExtendedPlanningDecisionSupport, MaintenanceWindow, PlanningEvidence } from './types';

export class PlanningDecisionEngine {
  private static instance: PlanningDecisionEngine | null = null;

  public static getInstance(): PlanningDecisionEngine {
    if (!PlanningDecisionEngine.instance) {
      PlanningDecisionEngine.instance = new PlanningDecisionEngine();
    }
    return PlanningDecisionEngine.instance;
  }

  public buildDecisionSupport(maintenance: MaintenanceWindow): ExtendedPlanningDecisionSupport {
    const current = { risk: 33, congestion: 44, reserve: 18, n1: 74, affectedLoadMw: 420, recoveryHours: 6 };
    const perform = {
      risk: Math.min(100, 33 + 18),
      congestion: Math.min(100, 44 + 14),
      reserve: Math.max(0, 18 - 3),
      n1: Math.max(0, 74 - 16),
      affectedLoadMw: 620,
      recoveryHours: 11,
    };
    const defer = {
      risk: Math.max(14, 33 - 6),
      congestion: Math.max(18, 44 - 8),
      reserve: Math.min(30, 18 + 5),
      n1: Math.min(100, 74 + 8),
      affectedLoadMw: 360,
      recoveryHours: 8,
    };

    return {
      problem: `Should maintenance window be approved for ${maintenance.assetName}?`,
      problemDescription: `Asset ${maintenance.assetName} requires ${maintenance.workType}. Decision must balance maintenance need against grid operational constraints.`,
      baseline: `Current state: ${current.risk}/100 risk, ${current.congestion}% congestion, ${current.reserve}% reserve, ${current.n1}/100 N-1 margin.`,
      baselineMetrics: current,
      options: [
        {
          id: 'perform-immediately',
          label: 'Perform Maintenance',
          description: 'Execute the maintenance as scheduled.',
          simulationResult: {
            current,
            maintenance: perform,
            deferred: defer,
            recommendation: 'MAINTENANCE',
          },
          impactScore: Math.abs(perform.risk - current.risk) + Math.abs(perform.congestion - current.congestion),
          riskScore: perform.risk,
        },
        {
          id: 'defer-window',
          label: 'Defer to Next Window',
          description: 'Postpone maintenance to a lower-risk period.',
          simulationResult: {
            current,
            maintenance: perform,
            deferred: defer,
            recommendation: 'DEFERRED',
          },
          impactScore: 0,
          riskScore: defer.risk,
        },
      ],
      simulation: `Maintenance scenario: ${maintenance.workType} on ${maintenance.assetName} from ${maintenance.start} to ${maintenance.end}. Isolation impacts ${maintenance.requiredIsolation.length} primary and secondary devices.`,
      impact: `Risk ${perform.risk > current.risk ? '+' : ''}${perform.risk - current.risk}, Congestion ${perform.congestion > current.congestion ? '+' : ''}${perform.congestion - current.congestion}%, Reserve ${perform.reserve > current.reserve ? '+' : ''}${perform.reserve - current.reserve}%.`,
      risk: `Performing maintenance increases N-1 exposure from ${current.n1} to ${perform.n1}, reducing operational margin by ${current.n1 - perform.n1} points.`,
      recommendation: perform.risk > 75 || perform.n1 < 45 ? 'Recommend deferring to next available window with lower risk profile.' : 'Maintenance window is operationally acceptable with proper isolation protocols.',
      approval: 'REQUEST_MORE_EVIDENCE',
      evidence: [{
        source: 'Planning decision support engine',
        timestamp: new Date().toISOString(),
        modelVersion: 'grid-plan-v1.0',
        inputs: ['maintenance request', 'current grid state', 'load forecast', 'project outages'],
        assumptions: ['No emergency forcing; all scenarios assume proper operator approval'],
        confidence: 0.82,
        dataState: 'MODELLED',
      }],
      selectedOptionId: null,
      approvalTimestamp: null,
      approverRole: null,
    };
  }
}

export const planningDecisionEngine = PlanningDecisionEngine.getInstance();
