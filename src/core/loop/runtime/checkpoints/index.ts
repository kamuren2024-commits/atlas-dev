/**
 * Loop Runtime Engine — Checkpointing and Rollback Engine
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { LoopExecutionContext, LoopExecutionContextManager, ExecutionContextSnapshot } from '../context';
import { generateId } from '../../../shared/crypto';

export interface Checkpoint {
  id: string;
  timestamp: number;
  snapshot: ExecutionContextSnapshot;
  metadata?: Record<string, any>;
}

export class CheckpointEngine {
  private checkpoints = new Map<string, Checkpoint[]>();

  public createCheckpoint(
    executionId: string,
    context: LoopExecutionContext,
    metadata?: Record<string, any>
  ): Checkpoint {
    const snapshot = LoopExecutionContextManager.takeSnapshot(context);
    const checkpoint: Checkpoint = {
      id: generateId('chk'),
      timestamp: Date.now(),
      snapshot,
      metadata
    };

    const currentList = this.checkpoints.get(executionId) || [];
    currentList.push(checkpoint);
    this.checkpoints.set(executionId, currentList);

    return checkpoint;
  }

  public getCheckpoints(executionId: string): Checkpoint[] {
    return this.checkpoints.get(executionId) || [];
  }

  public restoreCheckpoint(
    executionId: string,
    checkpointId: string,
    context: LoopExecutionContext
  ): boolean {
    const list = this.checkpoints.get(executionId) || [];
    const checkpoint = list.find((c) => c.id === checkpointId);
    if (!checkpoint) return false;

    this.rollbackContextToSnapshot(context, checkpoint.snapshot);
    return true;
  }

  public rollbackToLatest(executionId: string, context: LoopExecutionContext): boolean {
    const list = this.checkpoints.get(executionId) || [];
    if (list.length === 0) return false;

    const latest = list[list.length - 1];
    this.rollbackContextToSnapshot(context, latest.snapshot);
    return true;
  }

  public discardCheckpoints(executionId: string): void {
    this.checkpoints.delete(executionId);
  }

  private rollbackContextToSnapshot(context: LoopExecutionContext, snapshot: ExecutionContextSnapshot): void {
    context.currentState = snapshot.state;
    context.retryCount = snapshot.retryCount;
    context.workingMemory = [...snapshot.workingMemory];
    context.sharedMemory = JSON.parse(JSON.stringify(snapshot.sharedMemory));
    context.metadata = JSON.parse(JSON.stringify(snapshot.metadata));

    // Reconstruct variables Map
    context.variables.clear();
    Object.entries(snapshot.variables).forEach(([key, val]) => {
      context.variables.set(key, JSON.parse(JSON.stringify(val)));
    });
  }
}
