/**
 * Loop Runtime Engine — Runtime Event Publisher
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { LoopEventSystem, LoopEventName, LoopEvent } from '../../events/event-system';
import { LoopExecutionContext } from '../context';
import { LoopState } from '../../types';

export class RuntimeEventPublisher {
  public static async publish(
    name: LoopEventName,
    context: LoopExecutionContext,
    payload: any = {}
  ): Promise<LoopEvent> {
    const legacyContext: Partial<any> = {
      loopId: context.loopId,
      executionId: context.executionId,
      parentWorkflowId: context.parentWorkflowId,
      tenantId: context.tenantId,
      state: this.mapRuntimeStateToLoopState(context.currentState),
      workingMemory: context.workingMemory,
      sessionMemory: context.sharedMemory,
      metadata: context.metadata
    };

    return LoopEventSystem.publish(name, context.loopId, context.executionId, legacyContext, payload);
  }

  private static mapRuntimeStateToLoopState(state: string): LoopState {
    switch (state) {
      case 'CREATED': return LoopState.CREATED;
      case 'OBSERVING': return LoopState.OBSERVING;
      case 'PLANNING': return LoopState.PLANNING;
      case 'EXECUTING': return LoopState.EXECUTING;
      case 'VALIDATING': return LoopState.VERIFYING;
      case 'REFLECTING': return LoopState.REFLECTING;
      case 'COMPLETED': return LoopState.COMPLETED;
      case 'FAILED': return LoopState.FAILED;
      case 'CANCELLED': return LoopState.CANCELLED;
      case 'TIMED_OUT': return LoopState.TIMED_OUT;
      default: return LoopState.CREATED;
    }
  }
}
