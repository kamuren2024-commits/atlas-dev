import { ObservabilityEngine } from '../observability/Observability';
import { generateShortId } from '../../src/core/shared/crypto';

export interface AuditLogEntry {
  id: string;
  who: string;
  role: string;
  action: string;
  what: string;
  why: string;
  result: 'allowed' | 'denied' | 'error';
  timestamp: string;
  traceId: string;
}

export interface GovernancePolicy {
  id: string;
  ruleName: string;
  effect: 'allow' | 'deny';
  subjectRole?: string;
  resourceType: string;
  action: string;
  attributeCheck?: (subject: Record<string, any>, resource: Record<string, any>) => boolean;
}

export class GovernanceEngine {
  private static instance: GovernanceEngine;
  private policies: GovernancePolicy[] = [];
  private auditLogs: AuditLogEntry[] = [];
  private pendingApprovals: Array<{
    id: string;
    workflowId?: string;
    stepId?: string;
    actionRequested: string;
    targetAgentId: string;
    confidence: number;
    reason: string;
    riskRating: 'Low' | 'Medium' | 'High';
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
    resolvedAt?: string;
    operatorsVerdict?: string;
  }> = [];

  private constructor() {
    this.seedDefaultPolicies();
    this.seedDefaultApprovalQueue();
  }

  public static getInstance(): GovernanceEngine {
    if (!GovernanceEngine.instance) {
      GovernanceEngine.instance = new GovernanceEngine();
    }
    return GovernanceEngine.instance;
  }

  /**
   * Evaluates RBAC + ABAC gates before execution of critical tasks
   */
  public evaluateAccess(
    subject: { id: string; role: 'SuperOperator' | 'SCMPlanner' | 'Guest' | string; attributes: Record<string, any> },
    resource: { type: string; attributes: Record<string, any> },
    action: string,
    why: string,
    traceId?: string
  ): boolean {
    const correlationId = traceId || ObservabilityEngine.generateCorrelationId();
    const entryId = generateShortId('aud');

    let allowed = false;

    // Evaluate standard policies
    for (const policy of this.policies) {
      if (policy.action === action && policy.resourceType === resource.type) {
        // RBAC Check
        if (policy.subjectRole && policy.subjectRole !== subject.role) {
          continue;
        }

        // ABAC Attributes check
        if (policy.attributeCheck && !policy.attributeCheck(subject, resource)) {
          continue;
        }

        if (policy.effect === 'allow') {
          allowed = true;
        } else if (policy.effect === 'deny') {
          allowed = false;
          break; // Hard block on deny
        }
      }
    }

    // Capture standard audit trace (immutable memory representation)
    const logEntry: AuditLogEntry = {
      id: entryId,
      who: subject.id,
      role: subject.role,
      action,
      what: resource.type,
      why,
      result: allowed ? 'allowed' : 'denied',
      timestamp: new Date().toISOString(),
      traceId: correlationId
    };

    this.auditLogs.push(logEntry);

    // Roll historical audit logs
    if (this.auditLogs.length > 1000) {
      this.auditLogs.shift();
    }

    return allowed;
  }

  /**
   * Manual Human Approval Gate Enqueue
   */
  public requestManualClearance(
    actionRequested: string,
    targetAgentId: string,
    confidence: number,
    reason: string,
    riskRating: 'Low' | 'Medium' | 'High',
    workflowId?: string,
    stepId?: string
  ): string {
    const reqId = generateShortId('gov');
    this.pendingApprovals.push({
      id: reqId,
      workflowId,
      stepId,
      actionRequested,
      targetAgentId,
      confidence,
      reason,
      riskRating,
      status: 'pending',
      requestedAt: new Date().toISOString()
    });
    return reqId;
  }

  public resolveManualRequest(id: string, decision: 'approved' | 'rejected', operatorsVerdict: string): boolean {
    const item = this.pendingApprovals.find(i => i.id === id);
    if (!item) return false;

    item.status = decision;
    item.resolvedAt = new Date().toISOString();
    item.operatorsVerdict = operatorsVerdict;
    return true;
  }

  public getPendingQueue() {
    return this.pendingApprovals;
  }

  public getAuditHistory() {
    return this.auditLogs;
  }

  private seedDefaultPolicies(): void {
    // 1. SuperOperators can execute anything
    this.policies.push({
      id: 'pol-1',
      ruleName: 'SuperOperator Complete Access',
      effect: 'allow',
      subjectRole: 'SuperOperator',
      resourceType: 'any',
      action: 'any'
    });

    // 2. SCMPlanners can read supplier and risk datasets
    this.policies.push({
      id: 'pol-2',
      ruleName: 'Planner SCM Assessment Clearance',
      effect: 'allow',
      subjectRole: 'SCMPlanner',
      resourceType: 'SupplierRisk',
      action: 'read'
    });

    // 3. ABAC Policy: SCMPlanners can only edit contract documents if they own the regional attribute
    this.policies.push({
      id: 'pol-3',
      ruleName: 'Planner regional contract isolation',
      effect: 'allow',
      subjectRole: 'SCMPlanner',
      resourceType: 'Contract',
      action: 'write',
      attributeCheck: (subj, res) => {
        return subj.attributes.region === res.attributes.region;
      }
    });
  }

  private seedDefaultApprovalQueue(): void {
    this.pendingApprovals.push({
      id: 'gov-mariakani-spares',
      workflowId: 'wfl-strike-remediation',
      stepId: 'step-assign-spares',
      actionRequested: 'COMMIT_OUTAGE_SPARE_DISPATCH',
      targetAgentId: 'SCM Inventory Balance Mind',
      confidence: 0.94,
      reason: 'SCM Inventory Balance Mind identified heavy 132kV auxiliary spares ready inside Mariakani. Verification of manual transport logistics clearance required.',
      riskRating: 'Medium',
      status: 'pending',
      requestedAt: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
    });

    this.pendingApprovals.push({
      id: 'gov-shanghai-penalty',
      workflowId: 'wfl-mombasa-contingency',
      stepId: 'step-penalty-deduction',
      actionRequested: 'DISBURSE_LIQUIDATED_DAMAGES_CLAIM',
      targetAgentId: 'SCM Contract Investigator',
      confidence: 0.97,
      reason: 'Shanghai Cable Corp shipments exceed Force Majeure SLA thresholds. Requesting immediate draft signoff of $14,500 penalty.',
      riskRating: 'High',
      status: 'pending',
      requestedAt: new Date(Date.now() - 1800000).toISOString() // 30 mins ago
    });
  }
}
