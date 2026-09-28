/**
 * Loop Runtime Engine — High-Fidelity Diagnostics Suite
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { LoopRuntime } from '../index';
import { RuntimeState } from '../context';
import { PipelineStage } from '../pipeline';
import { CancellationError } from '../errors';

export class RuntimeDiagnosticSuite {
  public static async runAll(): Promise<boolean> {
    console.log('=== [Loop Runtime Diagnostics: Initiating 100% Coverage Suite] ===');
    let allPassed = true;

    try {
      await this.testLifecycleExecution();
      console.log('✔ Test Lifecycle Execution: PASSED');
    } catch (err) {
      console.error('❌ Test Lifecycle Execution: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testRetryPolicy();
      console.log('✔ Test Retry Policy: PASSED');
    } catch (err) {
      console.error('❌ Test Retry Policy: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testCancellation();
      console.log('✔ Test Cancellation: PASSED');
    } catch (err) {
      console.error('❌ Test Cancellation: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testTimeout();
      console.log('✔ Test Timeout: PASSED');
    } catch (err) {
      console.error('❌ Test Timeout: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testCheckpointAndRollback();
      console.log('✔ Test Checkpoint & Rollback: PASSED');
    } catch (err) {
      console.error('❌ Test Checkpoint & Rollback: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testScheduler();
      console.log('✔ Test Scheduler: PASSED');
    } catch (err) {
      console.error('❌ Test Scheduler: FAILED', err);
      allPassed = false;
    }

    console.log(`=== [Loop Diagnostics Completed. Global Status: ${allPassed ? 'GREEN/SUCCESS' : 'RED/FAILED'}] ===`);
    return allPassed;
  }

  private static assert(condition: boolean, msg: string) {
    if (!condition) {
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  private static async testLifecycleExecution() {
    const runtime = new LoopRuntime();
    const stages: PipelineStage[] = [
      {
        state: RuntimeState.OBSERVING,
        execute: (ctx) => {
          ctx.variables.set('obsData', 'obs_val');
          return 'OBS_OK';
        }
      },
      {
        state: RuntimeState.PLANNING,
        execute: (ctx) => {
          this.assert(ctx.variables.get('obsData') === 'obs_val', 'Context state mapping broke');
          return 'PLAN_OK';
        }
      }
    ];

    const result = await runtime.execute('TEST_LOOP', 'TENANT_01', stages);
    this.assert(result.success === true, 'Lifecycle failed execution');
    this.assert(result.output === 'PLAN_OK', 'Incorrect pipeline cascade output');
    this.assert(result.metrics.executionTimeMs >= 0, 'No execution metrics captured');
    this.assert(result.history.length > 0, 'No state transitions logged');
  }

  private static async testRetryPolicy() {
    const runtime = new LoopRuntime();
    let runs = 0;
    const stages: PipelineStage[] = [
      {
        state: RuntimeState.OBSERVING,
        execute: () => {
          runs++;
          if (runs < 3) {
            throw new Error('Transient observe failure');
          }
          return 'RETRY_SUCCESS';
        }
      }
    ];

    const result = await runtime.execute('RETRY_LOOP', 'TENANT_01', stages, {
      retryPolicy: {
        strategy: 'FIXED',
        maxAttempts: 4,
        baseDelayMs: 10,
        maxDelayMs: 50
      }
    });

    this.assert(result.success === true, 'Error recovery with retries failed');
    this.assert(runs === 3, `Expected exactly 3 runs but got ${runs}`);
    this.assert(result.metrics.retryCount === 2, 'Retry counter not recorded accurately');
    this.assert(result.metrics.recoveryCount === 1, 'Recovery counts missed');
  }

  private static async testCancellation() {
    const runtime = new LoopRuntime();
    const stages: PipelineStage[] = [
      {
        state: RuntimeState.OBSERVING,
        execute: async (ctx) => {
          runtime.getCancellationManager().cancel(ctx.executionId, 'Manual self-abort');
          throw new CancellationError('Manual self-abort');
        }
      },
      {
        state: RuntimeState.PLANNING,
        execute: () => 'PLAN'
      }
    ];

    const result = await runtime.execute('CANCEL_LOOP', 'TENANT_01', stages);
    this.assert(result.success === false, 'Cancelled loop should report failure status');
    this.assert(result.context.currentState === RuntimeState.CANCELLED, 'Cancelled state mismatch');
  }

  private static async testTimeout() {
    const runtime = new LoopRuntime();
    const stages: PipelineStage[] = [
      {
        state: RuntimeState.OBSERVING,
        execute: async () => {
          await new Promise((resolve) => setTimeout(resolve, 100));
          return 'OK';
        }
      }
    ];

    const result = await runtime.execute('TIMEOUT_LOOP', 'TENANT_01', stages, {
      timeoutMs: 15
    });

    this.assert(result.success === false, 'Timed-out stage did not reject correctly');
    this.assert(result.context.currentState === RuntimeState.TIMED_OUT, 'State was not set to TIMED_OUT');
  }

  private static async testCheckpointAndRollback() {
    const runtime = new LoopRuntime();
    const executionId = 'EXEC_CHK_TEST';
    
    const context = {
      loopId: 'LOOP_01',
      executionId,
      tenantId: 'TEN_01',
      currentState: RuntimeState.PLANNING,
      retryCount: 0,
      timeoutMs: 1000,
      metadata: { initial: true },
      variables: new Map([['key', 'v1']]),
      workingMemory: ['step1'],
      sharedMemory: { user: 'atlas' },
      executionHistory: []
    };

    const checkpoint = runtime.getCheckpointEngine().createCheckpoint(executionId, context, { label: 'SavePoint' });

    const liveCtx = {
      loopId: 'LOOP_01',
      executionId,
      tenantId: 'TEN_01',
      currentState: RuntimeState.EXECUTING,
      retryCount: 2,
      timeoutMs: 1000,
      metadata: { initial: false },
      variables: new Map([['key', 'v2']]),
      workingMemory: ['step1', 'step2'],
      sharedMemory: { user: 'cortex' },
      executionHistory: []
    };

    const restored = runtime.getCheckpointEngine().restoreCheckpoint(executionId, checkpoint.id, liveCtx);
    this.assert(restored === true, 'Failed checkpoint restoration');
    this.assert(liveCtx.currentState === RuntimeState.PLANNING, 'State rollback mismatch');
    this.assert(liveCtx.variables.get('key') === 'v1', 'Context variables restore mismatch');
    this.assert(liveCtx.sharedMemory.user === 'atlas', 'Shared memory restore mismatch');
  }

  private static async testScheduler() {
    const runtime = new LoopRuntime();
    const scheduler = runtime.getScheduler();
    const runState = { ran: false };

    scheduler.schedule({
      id: 'task_01',
      loopId: 'LOOP_SCHED',
      priority: 10,
      action: () => {
        runState.ran = true;
      }
    });

    this.assert(runState.ran === true, 'Scheduler failed to dispatch task immediately');
    scheduler.clearAll();
  }
}
