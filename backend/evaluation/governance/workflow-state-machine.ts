/**
 * SALIENCE ATLAS — EVALUATION OS
 * PHASE 3: AUTHORITATIVE PROCUREMENT WORKFLOW STATE MACHINE & CONSENSUS
 * 
 * Directives:
 * - Directive 15: Workflow State Machine (Authoritative procurement lifecycle states)
 * - Directive 14: Consensus Deliberation & Dissent Recording
 */

export type ProcurementWorkflowState = 
  | 'NOT_CONFIGURED'
  | 'DRAFT'
  | 'READY'
  | 'BID_OPENING'
  | 'PRELIMINARY'
  | 'TECHNICAL'
  | 'FINANCIAL'
  | 'CLARIFICATION'
  | 'CONSENSUS'
  | 'COMMITTEE_REVIEW'
  | 'APPROVAL'
  | 'AWARD_RECOMMENDATION'
  | 'ARCHIVED';

export interface WorkflowTransitionRecord {
  transitionId: string;
  tenderId: string;
  fromState: ProcurementWorkflowState;
  toState: ProcurementWorkflowState;
  actorId: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  transitionReason: string;
  prerequisitesMet: string[];
  auditLogId: string;
}

export interface CommitteeDissentRecord {
  dissentId: string;
  tenderId: string;
  memberId: string;
  memberName: string;
  memberRole: string;
  disputedBidderId: string;
  disputedCriterionId: string;
  majorityDecision: string;
  dissentingOpinion: string;
  statutoryGrounds: string; // e.g. PPADA 2015 Section 84(3)
  timestamp: string;
  signatureHash: string;
}

export class ProcurementWorkflowStateMachine {
  private static instance: ProcurementWorkflowStateMachine;
  
  // tenderId -> currentState
  private tenderStates: Map<string, ProcurementWorkflowState> = new Map();
  // tenderId -> transition history
  private transitionHistories: Map<string, WorkflowTransitionRecord[]> = new Map();
  // tenderId -> dissenting opinions
  private dissents: Map<string, CommitteeDissentRecord[]> = new Map();

  // Allowed state transition matrix
  private allowedTransitions: Record<ProcurementWorkflowState, ProcurementWorkflowState[]> = {
    NOT_CONFIGURED: [],
    DRAFT: ['READY'],
    READY: ['BID_OPENING'],
    BID_OPENING: ['PRELIMINARY'],
    PRELIMINARY: ['TECHNICAL', 'CLARIFICATION'],
    TECHNICAL: ['FINANCIAL', 'CLARIFICATION', 'CONSENSUS'],
    CLARIFICATION: ['PRELIMINARY', 'TECHNICAL', 'FINANCIAL'],
    FINANCIAL: ['CONSENSUS', 'CLARIFICATION'],
    CONSENSUS: ['COMMITTEE_REVIEW', 'TECHNICAL'],
    COMMITTEE_REVIEW: ['APPROVAL', 'CONSENSUS'],
    APPROVAL: ['AWARD_RECOMMENDATION', 'COMMITTEE_REVIEW'],
    AWARD_RECOMMENDATION: ['ARCHIVED'],
    ARCHIVED: []
  };

  private constructor() {
    // Intentionally empty: workflow state is carried only by authoritative tender records.
  }

  public static getInstance(): ProcurementWorkflowStateMachine {
    if (!ProcurementWorkflowStateMachine.instance) {
      ProcurementWorkflowStateMachine.instance = new ProcurementWorkflowStateMachine();
    }
    return ProcurementWorkflowStateMachine.instance;
  }

  public getCurrentState(tenderId: string): ProcurementWorkflowState {
    return this.tenderStates.get(tenderId) || 'NOT_CONFIGURED';
  }

  public getTransitionHistory(tenderId: string): WorkflowTransitionRecord[] {
    return this.transitionHistories.get(tenderId) || [];
  }

  public getDissentRecords(tenderId: string): CommitteeDissentRecord[] {
    return this.dissents.get(tenderId) || [];
  }

  public recordDissent(dissent: CommitteeDissentRecord): void {
    const list = this.dissents.get(dissent.tenderId) || [];
    list.push(dissent);
    this.dissents.set(dissent.tenderId, list);
  }

  /**
   * Authoritatively execute a workflow transition with server-side validation
   */
  public executeTransition(
    tenderId: string,
    targetState: ProcurementWorkflowState,
    actor: { id: string; name: string; role: string },
    reason: string,
    prerequisites: string[]
  ): {
    success: boolean;
    previousState: ProcurementWorkflowState;
    currentState: ProcurementWorkflowState;
    error?: string;
  } {
    const currentState = this.getCurrentState(tenderId);
    const validNextStates = this.allowedTransitions[currentState] || [];

    if (!validNextStates.includes(targetState)) {
      return {
        success: false,
        previousState: currentState,
        currentState,
        error: `Illegal workflow state transition: Cannot move from ${currentState} to ${targetState}. Allowed transitions: ${validNextStates.join(', ')}.`
      };
    }

    // Role-based authorization for critical transitions
    if (targetState === 'TECHNICAL' && !['COMMITTEE_CHAIR', 'PROCUREMENT_SECRETARIAT'].includes(actor.role)) {
      return {
        success: false,
        previousState: currentState,
        currentState,
        error: 'Only the Committee Chair or Procurement Secretariat may advance workflow to Technical evaluation.'
      };
    }

    if (targetState === 'APPROVAL' && !['COMMITTEE_CHAIR', 'HEAD_OF_PROCUREMENT'].includes(actor.role)) {
      return {
        success: false,
        previousState: currentState,
        currentState,
        error: 'Only the Committee Chair or Head of Procurement may submit for final statutory approval.'
      };
    }

    if (targetState === 'AWARD_RECOMMENDATION' && actor.role !== 'ACCOUNTING_OFFICER') {
      return {
        success: false,
        previousState: currentState,
        currentState,
        error: 'Contract award approval is reserved strictly to the Accounting Officer under PPADA Section 87.'
      };
    }

    // Apply state change
    this.tenderStates.set(tenderId, targetState);
    const transitionRecord: WorkflowTransitionRecord = {
      transitionId: `TR-${Date.now()}`,
      tenderId,
      fromState: currentState,
      toState: targetState,
      actorId: actor.id,
      actorName: actor.name,
      actorRole: actor.role,
      timestamp: new Date().toISOString(),
      transitionReason: reason,
      prerequisitesMet: prerequisites,
      auditLogId: `AUD-TR-${Date.now()}`
    };

    const history = this.transitionHistories.get(tenderId) || [];
    history.push(transitionRecord);
    this.transitionHistories.set(tenderId, history);

    return {
      success: true,
      previousState: currentState,
      currentState: targetState
    };
  }
}
