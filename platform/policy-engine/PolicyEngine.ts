import { ObservabilityEngine } from '../observability/Observability';
import { PolicyStore } from '../persistence';

export type PolicyDomain = 'REGULATORY' | 'OPERATIONAL' | 'FINANCIAL' | 'SECURITY' | 'SCM';

export interface ComplexPolicy {
  code: string;
  domain: PolicyDomain;
  title: string;
  description: string;
  rulesEvaluator: (context: Record<string, any>) => {
    isViolated: boolean;
    reason?: string;
    riskFactor: number; // Scale of 0-100 indicating probability of downstream legal/operation failure
  };
}

export class PolicyReasoningEngine {
  private static instance: PolicyReasoningEngine;
  private policies = new Map<string, ComplexPolicy>();

  private constructor() {
    this.bootstrapEnterprisePolicies();
  }

  public static getInstance(): PolicyReasoningEngine {
    if (!PolicyReasoningEngine.instance) {
      PolicyReasoningEngine.instance = new PolicyReasoningEngine();
    }
    return PolicyReasoningEngine.instance;
  }

  public registerPolicy(policy: ComplexPolicy): void {
    this.policies.set(policy.code, policy);
    // Persist policy definition to database
    PolicyStore.save({
      policyId: policy.code,
      code: policy.code,
      name: policy.title,
      description: policy.description,
      rules: [{ domain: policy.domain, evaluatorName: policy.rulesEvaluator.name }],
      active: true,
    }).catch(err => console.error('[PolicyEngine] Failed to persist policy:', err.message));
  }

  /**
   * Advanced programmatic policy reasoning parsing variables across SCM contexts
   */
  public async evaluatePolicy(
    code: string,
    context: Record<string, any>,
    traceId?: string
  ): Promise<{
    passed: boolean;
    violationDetails?: string;
    remediationOption?: string;
    riskScore: number;
  }> {
    const policy = this.policies.get(code);
    if (!policy) {
      throw new Error(`Enterprise Policy with code [${code}] is not registered in reasoning base.`);
    }

    const correlationId = traceId || ObservabilityEngine.generateCorrelationId();

    return await ObservabilityEngine.traceAction(
      `POLICY_REASON_EVAL_${code}`,
      'PolicyReasoningEngine',
      { context },
      async () => {
        const result = policy.rulesEvaluator(context);

        if (result.isViolated) {
          const remediation = this.suggestRemediation(code, context);
          return {
            passed: false,
            violationDetails: result.reason,
            remediationOption: remediation,
            riskScore: result.riskFactor
          };
        }

        return {
          passed: true,
          riskScore: result.riskFactor
        };
      },
      correlationId
    );
  }

  /**
   * Proposes viable strategic recovery patterns for violated policy contexts
   */
  public suggestRemediation(code: string, context: Record<string, any>): string {
    switch (code) {
      case 'REG-SLA-40':
        return 'Immediately adjust SLA late penalty variables inside Draft from 5% to the mandatory KETRACO ceiling of 10%.';
      case 'FIN-CAP-99':
        return `Downsize total award commitment below the $10,000,000 threshold or submit the plan directly to the Executive board for HITL manual approval.`;
      case 'OPS-SRC-02':
        return 'Register backup vendors within compliant geographic regions inside China/Germany, and reroute active logistics lines.';
      default:
        return 'Request system-wide manual operational evaluation and security review.';
    }
  }

  /**
   * Predictive risk evaluation over complex parameters
   */
  public predictRisk(context: Record<string, any>): {
    overallRiskRating: 'None' | 'Minimal' | 'Degraded' | 'Catastrophic';
    score: number;
    warnings: string[];
  } {
    let cumulativeScore = 0;
    const warnings: string[] = [];

    // Check financial overheads
    if (context.awardAmountUsd > 12000000) {
      cumulativeScore += 35;
      warnings.push('Lot award exceeds local standard SCM capital limits (risk of budget overrun).');
    }

    // Check supplier location issues
    if (context.supplierRegion === 'high-risk-embargo') {
      cumulativeScore += 55;
      warnings.push('Supplier is registered inside geopolitical hazard warning zones.');
    }

    // Check redundancy shortages
    if (!context.backupSupplierRegistered) {
      cumulativeScore += 20;
      warnings.push('No warm standby backup supplier declared. High single-point-of-failure risk.');
    }

    let rating: 'None' | 'Minimal' | 'Degraded' | 'Catastrophic' = 'None';
    if (cumulativeScore > 75) rating = 'Catastrophic';
    else if (cumulativeScore > 40) rating = 'Degraded';
    else if (cumulativeScore > 10) rating = 'Minimal';

    return {
      overallRiskRating: rating,
      score: Math.min(100, cumulativeScore),
      warnings
    };
  }

  public getPolicy(code: string): ComplexPolicy | undefined {
    return this.policies.get(code);
  }

  public getAllPolicies(): ComplexPolicy[] {
    return Array.from(this.policies.values());
  }

  private bootstrapEnterprisePolicies(): void {
    // 1. Regulatory Contract Ceiling Rule
    this.registerPolicy({
      code: 'REG-SLA-40',
      domain: 'REGULATORY',
      title: 'Mandatory Government SCM Penalty Ceiling',
      description: 'Contracts must maintain SLA liquid dynamic penalty parameters between 10% and 15%.',
      rulesEvaluator: (ctx) => {
        const penalty = ctx.penaltyPct || 0;
        if (penalty < 10) {
          return {
            isViolated: true,
            reason: `Under compliance constraint: Late penalty % of [${penalty}%] is below the mandatory minimum of 10%.`,
            riskFactor: 75
          };
        }
        return { isViolated: false, riskFactor: 5 };
      }
    });

    // 2. Financial Authority Threshold
    this.registerPolicy({
      code: 'FIN-CAP-99',
      domain: 'FINANCIAL',
      title: 'Discretionary spend limit gatekeepers',
      description: 'Single lot award expenditures exceeding $10,000,000 are restricted unless authorized.',
      rulesEvaluator: (ctx) => {
        const budget = ctx.awardAmountUsd || 0;
        if (budget > 10000000 && !ctx.boardApproved) {
          return {
            isViolated: true,
            reason: `Over expenditure restriction: Budget commitment [${budget} USD] exceeds authorized limit without board approval flag.`,
            riskFactor: 90
          };
        }
        return { isViolated: false, riskFactor: 3 };
      }
    });

    // 3. Operational Diversity standard
    this.registerPolicy({
      code: 'OPS-SRC-02',
      domain: 'OPERATIONAL',
      title: 'Geopolitical SCM Diversity Standard',
      description: 'Operating supply streams should not concentrate over 70% reliance on any single geographical jurisdiction.',
      rulesEvaluator: (ctx) => {
        const concentration = ctx.geographicJurisdictionFocusPercentage || 0;
        if (concentration > 70) {
          return {
            isViolated: true,
            reason: `Operational diversity warning: Concentrate dependency of [${concentration}%] in single zone compromises fallback reliability.`,
            riskFactor: 60
          };
        }
        return { isViolated: false, riskFactor: 12 };
      }
    });
  }
}
