/**
 * Enterprise Agent Framework (EAF) — Governance, Risk, and Compliance (GRC)
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentPolicy, AgentContext } from '../types';

export interface AgentGovernanceReport {
  passed: boolean;
  riskScore: number;
  violations: string[];
  requiresHumanApproval: boolean;
}

export class AgentGovernanceEngine {
  private static activeApprovals = new Set<string>();

  /**
   * Evaluates the risk and compliance profile of a proposed agent invocation.
   */
  public static evaluate(
    policy: AgentPolicy,
    context: AgentContext,
    inputs: Record<string, any>
  ): AgentGovernanceReport {
    const violations: string[] = [];
    let riskScore = policy.riskThreshold || 0.1;
    let requiresHumanApproval = policy.approvalRequired || false;

    // Check custom spend policy risk triggers
    const spendAmount = inputs.procurementCost || inputs.spend || inputs.cost || 0;
    if (spendAmount > 500000) {
      riskScore = Math.max(riskScore, 0.85);
      requiresHumanApproval = true;
      violations.push('Spend exceeds standard threshold ($500k), triggering mandatory GRC review.');
    }

    // Limit checks
    if (policy.maxExecutionLimit && policy.maxExecutionLimit > 0) {
      const activeExecutions = inputs.activeExecutionsCount || 0;
      if (activeExecutions >= policy.maxExecutionLimit) {
        violations.push(`Governance Limit Exceeded: Concurrent active count ${activeExecutions} reaches max limit ${policy.maxExecutionLimit}.`);
      }
    }

    // Security check against required roles
    if (requiresHumanApproval && !this.hasApproval(context.correlationId)) {
      violations.push('Human-In-The-Loop: Execution is pending supervisory approval.');
    }

    return {
      passed: violations.length === 0 || !requiresHumanApproval || this.hasApproval(context.correlationId),
      riskScore,
      violations,
      requiresHumanApproval: requiresHumanApproval && !this.hasApproval(context.correlationId)
    };
  }

  public static grantApproval(correlationId: string): void {
    this.activeApprovals.add(correlationId);
  }

  public static hasApproval(correlationId: string): boolean {
    return this.activeApprovals.has(correlationId);
  }

  public static clearApprovals(): void {
    this.activeApprovals.clear();
  }
}
