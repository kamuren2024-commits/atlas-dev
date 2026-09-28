// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — POLICY ENGINE
// Data classification enforcement and governance rules
// ============================================================================

import { DataClassification } from '../federation/types';

export interface PolicyEvaluationRequest {
  requestId: string;
  mission: string;
  task: string;
  classification: DataClassification;
  requireApproval?: boolean;
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  reason: string;
  requiresApproval: boolean;
  policyIds: string[];
  riskScore: number;
}

interface Policy {
  id: string;
  name: string;
  effect: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
  conditions: {
    classifications?: DataClassification[];
    missions?: string[];
    taskPatterns?: string[];
  };
}

// KETRACO enterprise policies for AI inference
const FEDERATION_POLICIES: Policy[] = [
  {
    id: 'POL-AI-001',
    name: 'Critical Infrastructure Data Protection',
    effect: 'DENY',
    conditions: {
      classifications: ['TOP_SECRET', 'KETRACO_CRITICAL'],
      missions: ['*'],
    },
  },
  {
    id: 'POL-AI-002',
    name: 'Confidential Data Cloud Routing',
    effect: 'REQUIRE_APPROVAL',
    conditions: {
      classifications: ['CONFIDENTIAL', 'RESTRICTED'],
      missions: ['PROCUREMENT_TENDER_EVALUATION', 'CONTRACT_COMPLIANCE_CHECK'],
    },
  },
  {
    id: 'POL-AI-003',
    name: 'Financial Decision Authorization',
    effect: 'REQUIRE_APPROVAL',
    conditions: {
      missions: ['FINANCIAL_DECISION', 'PROCUREMENT_AWARD', 'CONTRACT_MODIFICATION'],
    },
  },
  {
    id: 'POL-AI-004',
    name: 'Grid Safety Critical Actions',
    effect: 'REQUIRE_APPROVAL',
    conditions: {
      missions: ['GRID_CONTROL', 'PROTECTION_RELAY', 'SCADA_COMMAND'],
      taskPatterns: ['control', 'configure', 'modify', 'disconnect', 'energize'],
    },
  },
  {
    id: 'POL-AI-005',
    name: 'Public Data Free Routing',
    effect: 'ALLOW',
    conditions: {
      classifications: ['PUBLIC'],
    },
  },
  {
    id: 'POL-AI-006',
    name: 'Internal Data Standard Routing',
    effect: 'ALLOW',
    conditions: {
      classifications: ['INTERNAL'],
    },
  },
];

export class PolicyEngine {
  private static instance: PolicyEngine;
  private policies: Policy[];

  private constructor() {
    this.policies = [...FEDERATION_POLICIES];
  }

  public static getInstance(): PolicyEngine {
    if (!PolicyEngine.instance) {
      PolicyEngine.instance = new PolicyEngine();
    }
    return PolicyEngine.instance;
  }

  /**
   * Evaluate all applicable policies against a request
   */
  async evaluate(request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult> {
    const applicablePolicies = this.findApplicablePolicies(request);
    const policyIds = applicablePolicies.map(p => p.id);

    // Check for DENY policies first (highest priority)
    const denyPolicy = applicablePolicies.find(p => p.effect === 'DENY');
    if (denyPolicy) {
      return {
        allowed: false,
        reason: `Blocked by policy ${denyPolicy.id}: ${denyPolicy.name}`,
        requiresApproval: false,
        policyIds,
        riskScore: 95,
      };
    }

    // Check for REQUIRE_APPROVAL policies
    const approvalPolicies = applicablePolicies.filter(p => p.effect === 'REQUIRE_APPROVAL');
    if (approvalPolicies.length > 0 || request.requireApproval) {
      return {
        allowed: true,
        reason: `Requires approval per ${approvalPolicies.map(p => p.id).join(', ')}`,
        requiresApproval: true,
        policyIds,
        riskScore: 60,
      };
    }

    // ALLOW
    return {
      allowed: true,
      reason: 'All policies passed',
      requiresApproval: false,
      policyIds,
      riskScore: this.computeRiskScore(request),
    };
  }

  private findApplicablePolicies(request: PolicyEvaluationRequest): Policy[] {
    return this.policies.filter(policy => {
      const { conditions } = policy;

      // Check classification match
      if (conditions.classifications && conditions.classifications.length > 0) {
        if (!conditions.classifications.includes(request.classification)) {
          return false;
        }
      }

      // Check mission match
      if (conditions.missions && conditions.missions.length > 0) {
        const missionMatch = conditions.missions.some(m =>
          m === '*' || request.mission.toUpperCase().includes(m)
        );
        if (!missionMatch) return false;
      }

      // Check task pattern match
      if (conditions.taskPatterns && conditions.taskPatterns.length > 0) {
        const taskLower = request.task.toLowerCase();
        const patternMatch = conditions.taskPatterns.some(p => taskLower.includes(p));
        if (!patternMatch) return false;
      }

      return true;
    });
  }

  private computeRiskScore(request: PolicyEvaluationRequest): number {
    let score = 0;
    const classificationRisk: Record<DataClassification, number> = {
      PUBLIC: 5,
      INTERNAL: 15,
      CONFIDENTIAL: 40,
      RESTRICTED: 65,
      TOP_SECRET: 90,
      KETRACO_CRITICAL: 95,
    };
    score += classificationRisk[request.classification] || 10;

    if (request.requireApproval) score += 20;

    return Math.min(100, score);
  }

  /**
   * Register a custom policy
   */
  registerPolicy(policy: Policy): void {
    this.policies.push(policy);
  }

  getAllPolicies(): Policy[] {
    return [...this.policies];
  }
}
