/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Approval Workflow & Decision Gates
 * 
 * Human-in-the-loop decision workflow with role-based authorization
 */

import { Mission, Approval, ApprovalDecision, ApprovalGate } from './types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Approval Gate Manager
 */
export class ApprovalGateManager {
  private static instance: ApprovalGateManager | null = null;
  private approvals: Map<string, Approval[]> = new Map();
  private gates: Map<string, ApprovalGate> = new Map();

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): ApprovalGateManager {
    if (!ApprovalGateManager.instance) {
      ApprovalGateManager.instance = new ApprovalGateManager();
    }
    return ApprovalGateManager.instance;
  }

  /**
   * Create approval gate for mission
   */
  public createApprovalGate(
    mission: Mission,
    requiredRole: string = 'DISPATCHER'
  ): ApprovalGate {
    console.log('[APPROVAL-GATE] Creating approval gate for mission:', mission.id);

    const gate: ApprovalGate = {
      id: `gate-${mission.id}`,
      missionId: mission.id,
      status: 'PENDING',
      requiredRole,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min timeout
      escalationLevel: this.getEscalationLevel(mission.severity),
    };

    this.gates.set(gate.id, gate);
    return gate;
  }

  /**
   * Submit approval decision
   */
  public async submitDecision(
    gateId: string,
    userId: string,
    userRole: string,
    decision: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE',
    reason: string
  ): Promise<{ success: boolean; message: string; gate?: ApprovalGate }> {
    console.log('[APPROVAL-GATE] Processing decision for gate:', gateId);

    const gate = this.gates.get(gateId);
    if (!gate) {
      return { success: false, message: 'Gate not found' };
    }

    // Check authorization
    if (!this.isAuthorized(userRole, gate.requiredRole)) {
      return {
        success: false,
        message: `User role ${userRole} not authorized for ${gate.requiredRole} gate`,
      };
    }

    // Check expiration
    if (new Date(gate.expiresAt) < new Date()) {
      return { success: false, message: 'Approval gate has expired' };
    }

    // Record approval
    const approval: Approval = {
      id: `approval-${uuidv4().substring(0, 8)}`,
      gateId,
      userId,
      userRole,
      decision,
      reason,
      timestamp: new Date().toISOString(),
    };

    if (!this.approvals.has(gateId)) {
      this.approvals.set(gateId, []);
    }
    this.approvals.get(gateId)!.push(approval);

    // Update gate status
    gate.status = this.determineGateStatus(decision);
    gate.lastDecision = approval;

    console.log('[APPROVAL-GATE] Decision recorded:', decision);

    return {
      success: true,
      message: `Decision recorded: ${decision}`,
      gate,
    };
  }

  /**
   * Get approval decision for mission
   */
  public getDecision(missionId: string): ApprovalDecision | null {
    const gates = Array.from(this.gates.values()).filter(
      (g) => g.missionId === missionId
    );

    if (gates.length === 0) return null;

    const gate = gates[0];
    const approvals = this.approvals.get(gate.id) || [];

    if (approvals.length === 0) return null;

    const approval = approvals[approvals.length - 1]; // Latest

    return approval.decision;
  }

  /**
   * Check if user role is authorized
   */
  private isAuthorized(userRole: string, requiredRole: string): boolean {
    const roleHierarchy: Record<string, number> = {
      CONTROL_CENTER_OPERATOR: 1,
      SYSTEM_OPERATOR: 2,
      DISPATCHER: 3,
      SENIOR_DISPATCHER: 4,
      GRID_MANAGER: 5,
      CHIEF_OPERATOR: 6,
    };

    const userLevel = roleHierarchy[userRole] || 0;
    const requiredLevel = roleHierarchy[requiredRole] || 0;

    return userLevel >= requiredLevel;
  }

  /**
   * Get escalation level based on severity
   */
  private getEscalationLevel(severity: string): string {
    switch (severity) {
      case 'CRITICAL':
        return 'SENIOR_DISPATCHER';
      case 'HIGH':
        return 'DISPATCHER';
      case 'MEDIUM':
        return 'SYSTEM_OPERATOR';
      default:
        return 'CONTROL_CENTER_OPERATOR';
    }
  }

  /**
   * Determine gate status from decision
   */
  private determineGateStatus(decision: string): 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING' {
    switch (decision) {
      case 'APPROVED':
        return 'APPROVED';
      case 'REJECTED':
        return 'REJECTED';
      case 'REQUEST_MORE_EVIDENCE':
        return 'WAITING';
      default:
        return 'PENDING';
    }
  }

  /**
   * Get approval gate
   */
  public getGate(gateId: string): ApprovalGate | null {
    return this.gates.get(gateId) || null;
  }

  /**
   * Get all approvals for gate
   */
  public getApprovals(gateId: string): Approval[] {
    return this.approvals.get(gateId) || [];
  }

  /**
   * Clear gate
   */
  public clearGate(gateId: string): void {
    this.gates.delete(gateId);
    this.approvals.delete(gateId);
  }
}

/**
 * Approval Workflow Coordinator
 */
export class ApprovalWorkflow {
  private static instance: ApprovalWorkflow | null = null;
  private gateManager = ApprovalGateManager.getInstance();
  private workflows: Map<string, ApprovalGate[]> = new Map();

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): ApprovalWorkflow {
    if (!ApprovalWorkflow.instance) {
      ApprovalWorkflow.instance = new ApprovalWorkflow();
    }
    return ApprovalWorkflow.instance;
  }

  /**
   * Start approval workflow for mission
   */
  public async startWorkflow(mission: Mission): Promise<ApprovalGate> {
    console.log('[APPROVAL-WORKFLOW] Starting workflow for mission:', mission.id);

    const gate = this.gateManager.createApprovalGate(mission);

    if (!this.workflows.has(mission.id)) {
      this.workflows.set(mission.id, []);
    }
    this.workflows.get(mission.id)!.push(gate);

    return gate;
  }

  /**
   * Check if mission requires escalation
   */
  public requiresEscalation(mission: Mission): boolean {
    return mission.severity === 'CRITICAL';
  }

  /**
   * Get required approvers for mission
   */
  public getRequiredApprovers(mission: Mission): string[] {
    const approvers: string[] = [];

    if (mission.severity === 'CRITICAL') {
      approvers.push('SENIOR_DISPATCHER');
      approvers.push('GRID_MANAGER');
    } else if (mission.severity === 'HIGH') {
      approvers.push('DISPATCHER');
      approvers.push('SYSTEM_OPERATOR');
    } else {
      approvers.push('SYSTEM_OPERATOR');
    }

    return approvers;
  }

  /**
   * Check if workflow is complete
   */
  public isWorkflowComplete(missionId: string): boolean {
    const gates = this.workflows.get(missionId) || [];

    if (gates.length === 0) return false;

    return gates.every((gate) => gate.status === 'APPROVED' || gate.status === 'REJECTED');
  }

  /**
   * Get workflow status
   */
  public getWorkflowStatus(
    missionId: string
  ): {
    status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'WAITING';
    gates: ApprovalGate[];
  } {
    const gates = this.workflows.get(missionId) || [];

    if (gates.length === 0) {
      return { status: 'PENDING', gates };
    }

    const allApproved = gates.every((g) => g.status === 'APPROVED');
    const anyRejected = gates.some((g) => g.status === 'REJECTED');
    const anyWaiting = gates.some((g) => g.status === 'WAITING');

    let status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'WAITING' =
      'IN_PROGRESS';

    if (allApproved) {
      status = 'APPROVED';
    } else if (anyRejected) {
      status = 'REJECTED';
    } else if (anyWaiting) {
      status = 'WAITING';
    }

    return { status, gates };
  }
}

export default { ApprovalGateManager, ApprovalWorkflow };
