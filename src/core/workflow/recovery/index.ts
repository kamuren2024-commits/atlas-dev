/**
 * Enterprise Workflow Orchestrator (EWO) — Failure Recovery Engine
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowExecutionContext, WorkflowStepExecution } from '../types';
import { WorkflowCheckpointEngine } from '../checkpoints';
import { WorkflowEventPublisher } from '../events';

export interface RecoveryStrategy {
  strategyType: 'ROLLBACK_TO_CHECKPOINT' | 'CONTINUE_WITH_DEFAULT_OUTPUT' | 'HALT_AND_ESCAlATE';
  checkpointId?: string;
  defaultOutput?: any;
}

export class WorkflowRecoveryEngine {
  private checkpointEngine: WorkflowCheckpointEngine;

  constructor(checkpointEngine: WorkflowCheckpointEngine) {
    this.checkpointEngine = checkpointEngine;
  }

  public async attemptRecovery(
    context: WorkflowExecutionContext,
    failedNodeId: string,
    error: any,
    strategy: RecoveryStrategy
  ): Promise<{ recovered: boolean; message: string; output?: any }> {
    const stepExec = context.stepExecutions.get(failedNodeId);

    switch (strategy.strategyType) {
      case 'ROLLBACK_TO_CHECKPOINT':
        if (!strategy.checkpointId) {
          return { recovered: false, message: 'Recovery aborted: No checkpoint ID provided for rollback.' };
        }
        const checkpoint = this.checkpointEngine.getCheckpoint(strategy.checkpointId);
        if (!checkpoint) {
          return { recovered: false, message: `Recovery aborted: Checkpoint "${strategy.checkpointId}" not found.` };
        }

        this.checkpointEngine.restoreCheckpoint(checkpoint, context);
        await WorkflowEventPublisher.publish('WorkflowRecovered', context, {
          failedNodeId,
          recoveryType: 'ROLLBACK_TO_CHECKPOINT',
          checkpointId: strategy.checkpointId
        });

        return { recovered: true, message: `Successfully rolled back execution to checkpoint "${strategy.checkpointId}".` };

      case 'CONTINUE_WITH_DEFAULT_OUTPUT':
        if (stepExec) {
          stepExec.state = 'COMPLETED';
          stepExec.output = strategy.defaultOutput || {};
          context.stepExecutions.set(failedNodeId, stepExec);
        } else {
          context.stepExecutions.set(failedNodeId, {
            nodeId: failedNodeId,
            state: 'COMPLETED',
            startTime: Date.now(),
            endTime: Date.now(),
            durationMs: 0,
            output: strategy.defaultOutput || {}
          });
        }

        await WorkflowEventPublisher.publish('WorkflowRecovered', context, {
          failedNodeId,
          recoveryType: 'CONTINUE_WITH_DEFAULT_OUTPUT',
          defaultOutput: strategy.defaultOutput
        });

        return {
          recovered: true,
          message: `Recovered failed node "${failedNodeId}" using fallback default values.`,
          output: strategy.defaultOutput
        };

      case 'HALT_AND_ESCAlATE':
      default:
        await WorkflowEventPublisher.publish('WorkflowFailed', context, {
          failedNodeId,
          reason: 'Halted due to critical unrecoverable failure',
          error: error?.message || error
        });
        return { recovered: false, message: `Workflow halted at node "${failedNodeId}". Failure escalated.` };
    }
  }
}
