/**
 * Enterprise Workflow Orchestrator (EWO) — Context Manager
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowExecutionContext, WorkflowState } from '../types';

export class WorkflowContextManager {
  public static create(params: {
    workflowId: string;
    executionId: string;
    version: string;
    tenantId: string;
    parentWorkflowId?: string;
    parentAgentId?: string;
  }): WorkflowExecutionContext {
    return {
      workflowId: params.workflowId,
      executionId: params.executionId,
      version: params.version,
      tenantId: params.tenantId,
      parentWorkflowId: params.parentWorkflowId,
      parentAgentId: params.parentAgentId,
      currentState: WorkflowState.REGISTERED,
      variables: new Map<string, any>(),
      metadata: {},
      history: [
        {
          timestamp: Date.now(),
          toState: WorkflowState.REGISTERED,
          details: 'Context record initialized.'
        }
      ],
      stepExecutions: new Map(),
      loopContexts: new Map()
    };
  }

  public static transitionTo(context: WorkflowExecutionContext, nextState: WorkflowState, details?: string): void {
    const prevState = context.currentState;
    context.currentState = nextState;
    context.history.push({
      timestamp: Date.now(),
      fromState: prevState,
      toState: nextState,
      details
    });
  }
}
