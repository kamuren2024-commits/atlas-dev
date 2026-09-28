import crypto from 'crypto';

export type EvaluationWorkflowState =
  | 'DRAFT' | 'READY' | 'OPEN' | 'EVALUATING' | 'PENDING_VERIFICATION'
  | 'PENDING_COMMITTEE' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  | 'FINALIZED' | 'REOPENED' | 'CANCELLED';

export interface WorkflowTransition {
  workflowId: string;
  aggregateId: string;
  from: EvaluationWorkflowState;
  to: EvaluationWorkflowState;
  actorId: string;
  policyDecisionId: string;
  reason: string;
  occurredAt: string;
}

export interface DurableWorkflowStore {
  getState(workflowId: string): Promise<EvaluationWorkflowState>;
  appendTransition(transition: WorkflowTransition): Promise<void>;
}

export class EvaluationWorkflowService {
  constructor(private readonly store: DurableWorkflowStore) {}

  public async transition(
    workflowId: string,
    aggregateId: string,
    current: EvaluationWorkflowState,
    target: EvaluationWorkflowState,
    actorId: string,
    policyDecisionId: string,
    reason: string
  ): Promise<WorkflowTransition> {
    if (policyDecisionId.length === 0) throw new Error('WORKFLOW_POLICY_DECISION_REQUIRED');
    if (!this.isAllowed(current, target)) {
      throw new Error(`WORKFLOW_INVALID_TRANSITION:${current}->${target}`);
    }
    if (['APPROVED', 'FINALIZED'].includes(target) && actorId.length === 0) {
      throw new Error('WORKFLOW_HUMAN_ACTOR_REQUIRED');
    }
    const transition: WorkflowTransition = {
      workflowId, aggregateId, from: current, to: target, actorId,
      policyDecisionId, reason, occurredAt: new Date().toISOString()
    };
    await this.store.appendTransition(transition);
    return transition;
  }

  public createWorkflowId(): string {
    return crypto.randomUUID();
  }

  private isAllowed(from: EvaluationWorkflowState, to: EvaluationWorkflowState): boolean {
    const allowed: Record<EvaluationWorkflowState, EvaluationWorkflowState[]> = {
      DRAFT: ['READY', 'CANCELLED'],
      READY: ['OPEN', 'CANCELLED'],
      OPEN: ['EVALUATING', 'CANCELLED'],
      EVALUATING: ['PENDING_VERIFICATION', 'PENDING_COMMITTEE', 'CANCELLED'],
      PENDING_VERIFICATION: ['EVALUATING', 'REJECTED'],
      PENDING_COMMITTEE: ['PENDING_APPROVAL', 'REJECTED'],
      PENDING_APPROVAL: ['APPROVED', 'REJECTED'],
      APPROVED: ['FINALIZED'],
      REJECTED: ['REOPENED', 'CANCELLED'],
      FINALIZED: ['REOPENED'],
      REOPENED: ['EVALUATING', 'CANCELLED'],
      CANCELLED: [],
    };
    return allowed[from].includes(to);
  }
}
