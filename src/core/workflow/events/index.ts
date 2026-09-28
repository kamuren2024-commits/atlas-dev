/**
 * Enterprise Workflow Orchestrator (EWO) — Events and Event Publisher
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowState, WorkflowExecutionContext } from '../types';
import { generateId } from '../../shared/crypto';

export type WorkflowEventName =
  | 'WorkflowRegistered'
  | 'WorkflowStarted'
  | 'WorkflowPaused'
  | 'WorkflowResumed'
  | 'WorkflowCompleted'
  | 'WorkflowFailed'
  | 'WorkflowCancelled'
  | 'DependencyResolved'
  | 'PolicyEvaluated'
  | 'WorkflowCheckpointCreated'
  | 'WorkflowRecovered';

export interface WorkflowEvent {
  id: string;
  name: WorkflowEventName;
  workflowId: string;
  executionId: string;
  timestamp: number;
  contextSnapshot: {
    workflowId: string;
    executionId: string;
    version: string;
    tenantId: string;
    currentState: WorkflowState;
    variables: Record<string, any>;
    metadata: Record<string, any>;
  };
  payload: any;
}

export type WorkflowEventListener = (event: WorkflowEvent) => void | Promise<void>;

export class WorkflowEventPublisher {
  private static listeners = new Map<string, Set<WorkflowEventListener>>();

  public static subscribe(name: WorkflowEventName, listener: WorkflowEventListener): () => void {
    if (!this.listeners.has(name)) {
      this.listeners.set(name, new Set<WorkflowEventListener>());
    }
    this.listeners.get(name)!.add(listener);

    return () => {
      const set = this.listeners.get(name);
      if (set) {
        set.delete(listener);
      }
    };
  }

  public static async publish(
    name: WorkflowEventName,
    context: WorkflowExecutionContext,
    payload: any = {}
  ): Promise<WorkflowEvent> {
    const variablesRecord: Record<string, any> = {};
    context.variables.forEach((val, key) => {
      variablesRecord[key] = val;
    });

    const event: WorkflowEvent = {
      id: generateId('evt'),
      name,
      workflowId: context.workflowId,
      executionId: context.executionId,
      timestamp: Date.now(),
      contextSnapshot: {
        workflowId: context.workflowId,
        executionId: context.executionId,
        version: context.version,
        tenantId: context.tenantId,
        currentState: context.currentState,
        variables: variablesRecord,
        metadata: { ...context.metadata }
      },
      payload
    };

    const set = this.listeners.get(name);
    if (set) {
      for (const listener of set) {
        try {
          await Promise.resolve(listener(event));
        } catch (err) {
          console.error(`Error in event listener for "${name}":`, err);
        }
      }
    }

    return event;
  }

  public static clearListeners(): void {
    this.listeners.clear();
  }
}
