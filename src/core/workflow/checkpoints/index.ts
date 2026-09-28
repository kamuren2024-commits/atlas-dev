/**
 * Enterprise Workflow Orchestrator (EWO) — Checkpoint and Rollback Engine
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowExecutionContext, WorkflowCheckpoint } from '../types';
import { IWorkflowCheckpointEngine } from '../contracts';
import { generateId } from '../../shared/crypto';

/**
 * WorkflowCheckpointEngine handles persistence and restoration of workflow states.
 * It is designed to be environment-aware, using a real SQLite backend on the server
 * and a lightweight in-memory fallback in the browser to prevent crashes related
 * to Node.js native modules.
 */
export class WorkflowCheckpointEngine implements IWorkflowCheckpointEngine {
  private checkpoints = new Map<string, WorkflowCheckpoint>();
  private repo: any = null;
  private isServer = typeof process !== 'undefined' && process.versions && process.versions.node;

  constructor() {
    this.initializeRepo().catch(err => {
      console.error('[WORKFLOW-DB] Error initializing checkpoint repository:', err);
    });
  }

  private async initializeRepo() {
    if (this.isServer) {
      try {
        // Dynamic import to prevent Vite from bundling Node-only modules in the browser
        const { WorkflowRepository } = await import('../../../../backend/database/repositories');
        this.repo = new WorkflowRepository();
        await this.loadCheckpoints();
      } catch (err) {
        console.warn('[WORKFLOW-DB] Server detected but failed to load WorkflowRepository. Falling back to in-memory.', err);
      }
    } else {
      console.log('[WORKFLOW-DB] Browser environment detected. Using in-memory checkpoint engine.');
    }
  }

  private async loadCheckpoints() {
    if (!this.repo) return;
    try {
      const all = await this.repo.getAllCheckpoints();
      for (const chk of all) {
        this.checkpoints.set(chk.id, chk as any);
      }
      console.log(`[WORKFLOW-DB] Loaded ${all.length} persistent checkpoints from SQLite.`);
    } catch (err) {
      console.error('[WORKFLOW-DB] Failed to load checkpoints:', err);
    }
  }

  public createCheckpoint(context: WorkflowExecutionContext): WorkflowCheckpoint {
    const variablesRecord: Record<string, any> = {};
    context.variables.forEach((val, key) => {
      variablesRecord[key] = JSON.parse(JSON.stringify(val)); // deep-clone variables
    });

    const stepExecutionsRecord: Record<string, any> = {};
    context.stepExecutions.forEach((val, key) => {
      stepExecutionsRecord[key] = { ...val };
    });

    const checkpoint: WorkflowCheckpoint = {
      id: generateId('chk'),
      timestamp: Date.now(),
      executionId: context.executionId,
      currentState: context.currentState,
      variables: variablesRecord,
      stepExecutions: stepExecutionsRecord
    };

    this.checkpoints.set(checkpoint.id, checkpoint);

    // Persist to database in background if on server
    if (this.repo) {
      this.repo.saveCheckpoint(checkpoint).catch((err: any) => {
        console.error('[WORKFLOW-DB] Failed to save checkpoint to SQLite:', err);
      });
    }

    return checkpoint;
  }

  public restoreCheckpoint(checkpoint: WorkflowCheckpoint, context: WorkflowExecutionContext): void {
    if (checkpoint.executionId !== context.executionId) {
      throw new Error(`Checkpoint mismatch: checkpoint is for execution "${checkpoint.executionId}" but context is for execution "${context.executionId}"`);
    }

    context.currentState = checkpoint.currentState;

    // Restore variables
    context.variables.clear();
    Object.entries(checkpoint.variables).forEach(([key, val]) => {
      context.variables.set(key, JSON.parse(JSON.stringify(val)));
    });

    // Restore step execution statuses
    context.stepExecutions.clear();
    Object.entries(checkpoint.stepExecutions).forEach(([key, val]) => {
      context.stepExecutions.set(key, { ...val });
    });

    context.history.push({
      timestamp: Date.now(),
      toState: checkpoint.currentState,
      details: `Rolled back to checkpoint ${checkpoint.id}`
    });
  }

  public getCheckpoint(id: string): WorkflowCheckpoint | undefined {
    return this.checkpoints.get(id);
  }

  public async clear(): Promise<void> {
    this.checkpoints.clear();
    if (this.repo) {
      try {
        await this.repo.clearCheckpoints();
      } catch (err) {
        console.error('[WORKFLOW-DB] Failed to clear checkpoints in SQLite:', err);
      }
    }
  }
}
