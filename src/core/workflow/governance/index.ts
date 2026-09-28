/**
 * Enterprise Workflow Orchestrator (EWO) — Governance, Risk, and Compliance (GRC)
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowExecutionContext } from '../types';
import { generateId } from '../../shared/crypto';

export interface ApprovalRequest {
  id: string;
  executionId: string;
  nodeId: string;
  roleRequired: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: number;
  decidedAt?: number;
  approverId?: string;
  reason?: string;
}

export interface GovernancePolicy {
  id: string;
  name: string;
  evaluate: (context: WorkflowExecutionContext) => Promise<{ passed: boolean; message?: string }>;
}

export class EnterpriseGovernanceEngine {
  private approvals = new Map<string, ApprovalRequest>();
  private policies: GovernancePolicy[] = [];

  public registerPolicy(policy: GovernancePolicy): void {
    this.policies.push(policy);
  }

  public requestApproval(executionId: string, nodeId: string, roleRequired: string): ApprovalRequest {
    const id = generateId('appr');
    const request: ApprovalRequest = {
      id,
      executionId,
      nodeId,
      roleRequired,
      status: 'PENDING',
      requestedAt: Date.now()
    };
    this.approvals.set(id, request);
    return request;
  }

  public decideApproval(id: string, approverId: string, decision: 'APPROVED' | 'REJECTED', reason?: string): boolean {
    const request = this.approvals.get(id);
    if (!request) return false;

    request.status = decision;
    request.approverId = approverId;
    request.decidedAt = Date.now();
    request.reason = reason;
    return true;
  }

  public getApproval(id: string): ApprovalRequest | undefined {
    return this.approvals.get(id);
  }

  public getPendingApprovals(executionId: string): ApprovalRequest[] {
    return Array.from(this.approvals.values()).filter(
      (a) => a.executionId === executionId && a.status === 'PENDING'
    );
  }

  /**
   * Runs compliance and risk assessments against registered policies.
   */
  public async evaluateCompliance(context: WorkflowExecutionContext): Promise<{
    compliant: boolean;
    violations: string[];
  }> {
    const violations: string[] = [];

    // Evaluate in-memory static policies
    for (const policy of this.policies) {
      try {
        const res = await policy.evaluate(context);
        if (!res.passed) {
          violations.push(`${policy.name}: ${res.message || 'Validation failed'}`);
        }
      } catch (err: any) {
        violations.push(`${policy.name} Evaluation Error: ${err.message}`);
      }
    }

    // Default risk evaluation checks
    const spend = context.variables.get('procurementCost') || context.variables.get('spend') || 0;
    if (spend > 1000000) {
      // Automatic high-value risk threshold warning
      const hasDoubleApproval = Array.from(this.approvals.values()).some(
        (a) => a.executionId === context.executionId && a.status === 'APPROVED' && a.roleRequired === 'EXECUTIVE_COMMITTEE'
      );
      if (!hasDoubleApproval) {
        violations.push('Risk Limit Exceeded: Spend over 1M requires EXECUTIVE_COMMITTEE approval.');
      }
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }
}
