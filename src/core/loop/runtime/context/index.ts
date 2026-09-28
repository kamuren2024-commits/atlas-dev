/**
 * Loop Runtime Engine — Execution Context
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export enum RuntimeState {
  CREATED = 'CREATED',
  INITIALIZING = 'INITIALIZING',
  OBSERVING = 'OBSERVING',
  PLANNING = 'PLANNING',
  EXECUTING = 'EXECUTING',
  VALIDATING = 'VALIDATING',
  REFLECTING = 'REFLECTING',
  CHECKPOINT = 'CHECKPOINT',
  COMPLETED = 'COMPLETED',
  RETRY = 'RETRY',
  CANCELLED = 'CANCELLED',
  TIMED_OUT = 'TIMED_OUT',
  FAILED = 'FAILED',
  RECOVERED = 'RECOVERED'
}

export interface ExecutionContextSnapshot {
  timestamp: number;
  state: RuntimeState;
  retryCount: number;
  variables: Record<string, any>;
  workingMemory: string[];
  sharedMemory: Record<string, any>;
  metadata: Record<string, any>;
}

export interface LoopExecutionContext {
  loopId: string;
  executionId: string;
  parentWorkflowId?: string;
  parentAgentId?: string;
  correlationId?: string;
  tenantId: string;
  currentState: RuntimeState;
  retryCount: number;
  timeoutMs: number;
  metadata: Record<string, any>;
  variables: Map<string, any>;
  workingMemory: string[];
  sharedMemory: Record<string, any>;
  executionHistory: Array<ExecutionContextSnapshot>;
}

export class LoopExecutionContextManager {
  public static create(params: {
    loopId: string;
    executionId: string;
    parentWorkflowId?: string;
    parentAgentId?: string;
    correlationId?: string;
    tenantId: string;
    timeoutMs?: number;
    metadata?: Record<string, any>;
  }): LoopExecutionContext {
    return {
      loopId: params.loopId,
      executionId: params.executionId,
      parentWorkflowId: params.parentWorkflowId,
      parentAgentId: params.parentAgentId,
      correlationId: params.correlationId,
      tenantId: params.tenantId,
      currentState: RuntimeState.CREATED,
      retryCount: 0,
      timeoutMs: params.timeoutMs ?? 30000,
      metadata: params.metadata ?? {},
      variables: new Map<string, any>(),
      workingMemory: [],
      sharedMemory: {},
      executionHistory: []
    };
  }

  /**
   * Generates a deep-copied, immutable snapshot of the context.
   */
  public static takeSnapshot(context: LoopExecutionContext): ExecutionContextSnapshot {
    const variablesObj: Record<string, any> = {};
    context.variables.forEach((val, key) => {
      variablesObj[key] = this.deepClone(val);
    });

    return {
      timestamp: Date.now(),
      state: context.currentState,
      retryCount: context.retryCount,
      variables: variablesObj,
      workingMemory: [...context.workingMemory],
      sharedMemory: this.deepClone(context.sharedMemory),
      metadata: this.deepClone(context.metadata)
    };
  }

  /**
   * Safely updates context state and captures history.
   */
  public static transitionTo(context: LoopExecutionContext, newState: RuntimeState): void {
    context.currentState = newState;
    const snapshot = this.takeSnapshot(context);
    context.executionHistory.push(snapshot);
  }

  private static deepClone<T>(obj: T): T {
    if (obj === undefined) return undefined as any;
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch {
      return { ...obj };
    }
  }
}
