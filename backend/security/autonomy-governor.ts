/**
 * PHASE 02: AUTONOMY GOVERNOR & ZERO-TRUST POLICY ENGINE
 * 
 * Enforces Zero-Trust identity separation:
 * USER, AGENT, SERVICE, TOOL
 * 
 * Enforces Autonomy Levels:
 * L0: Information Only (read-only queries)
 * L1: Recommendation (read + generate suggestions)
 * L2: Preparation (prepare draft orders, plans, proposals)
 * L3: Human Approval Required (must have human signature for execution)
 * L4: Guarded Autonomy (automated execution within strictly bounded limits)
 * L5: Full Autonomy (unrestricted automated execution for low-risk operations)
 */

export type PrincipalType = 'USER' | 'AGENT' | 'SERVICE' | 'TOOL';
export type AutonomyLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface PrincipalIdentity {
  id: string;
  type: PrincipalType;
  roles: string[];
  tenantId: string;
}

export interface GovernancePolicyCheck {
  principal: PrincipalIdentity;
  targetDomain: string;
  action: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  currentAutonomyLevel: AutonomyLevel;
}

export interface GovernanceDecision {
  allowed: boolean;
  requiredAutonomyLevel: AutonomyLevel;
  humanApprovalRequired: boolean;
  reason: string;
  policyId: string;
}

export class AutonomyGovernor {
  private static instance: AutonomyGovernor | null = null;

  public static getInstance(): AutonomyGovernor {
    if (!AutonomyGovernor.instance) {
      AutonomyGovernor.instance = new AutonomyGovernor();
    }
    return AutonomyGovernor.instance;
  }

  /**
   * Evaluate whether an action is permitted under zero-trust governance
   */
  public evaluate(check: GovernancePolicyCheck): GovernanceDecision {
    // 1. High/Critical Risk domain actions (e.g. PPADA tender awards, breaker trips, payments)
    if (check.riskLevel === 'CRITICAL') {
      const allowed = check.currentAutonomyLevel >= 3 && check.principal.roles.includes('ADMIN');
      return {
        allowed,
        requiredAutonomyLevel: 3,
        humanApprovalRequired: true,
        reason: 'CRITICAL operations require Autonomy Level >= 3 and dual human approval authorization.',
        policyId: 'POL-CRIT-DUAL-APPROVAL',
      };
    }

    if (check.riskLevel === 'HIGH') {
      const allowed = check.currentAutonomyLevel >= 3;
      return {
        allowed,
        requiredAutonomyLevel: 3,
        humanApprovalRequired: true,
        reason: 'HIGH risk operation requires human-in-the-loop authorization (Level >= 3).',
        policyId: 'POL-HIGH-HUMAN-GATE',
      };
    }

    if (check.riskLevel === 'MEDIUM') {
      const allowed = check.currentAutonomyLevel >= 2;
      return {
        allowed,
        requiredAutonomyLevel: 2,
        humanApprovalRequired: false,
        reason: 'MEDIUM risk permitted under Level >= 2 preparation/guarded envelope.',
        policyId: 'POL-MED-GUARDED',
      };
    }

    // LOW risk (read-only, telemetric inspection, graph traversal)
    return {
      allowed: true,
      requiredAutonomyLevel: 0,
      humanApprovalRequired: false,
      reason: 'Standard telemetric inquiry permitted.',
      policyId: 'POL-LOW-PERMISSIVE',
    };
  }

  /**
   * Sanitizes input prompts to defend against prompt injections
   */
  public sanitizePrompt(prompt: string): { cleanPrompt: string; flagRaised: boolean; reason?: string } {
    const maliciousPatterns = [
      /ignore\s+all\s+previous\s+instructions/i,
      /system\s+prompt\s+override/i,
      /you\s+are\s+now\s+in\s+developer\s+mode/i,
      /jailbreak/i,
      /exfiltrate\s+credentials/i,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(prompt)) {
        return {
          cleanPrompt: '[PROMPT BLOCKED BY AUTONOMY GOVERNOR: INJECTION ATTEMPT DETECTED]',
          flagRaised: true,
          reason: `Detected adversarial pattern: ${pattern.source}`,
        };
      }
    }

    return {
      cleanPrompt: prompt,
      flagRaised: false,
    };
  }
}
