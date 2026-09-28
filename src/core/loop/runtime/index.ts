/**
 * Loop Runtime Engine — Main Runtime Orchestrator
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { LoopExecutionContext, RuntimeState, LoopExecutionContextManager } from './context';
import { LoopPipeline, PipelineStage } from './pipeline';
import { RuntimeMetricsCollector, RuntimeMetrics } from './metrics';
import { HistoryManager, HistoryRecord } from './history';
import { CheckpointEngine } from './checkpoints';
import { LoopScheduler } from './scheduler';
import { RetryEngine, RetryPolicy } from './retry';
import { TimeoutManager } from './timeouts';
import { CancellationManager } from './cancellation';
import { RuntimeEventPublisher } from './events';
import { CancellationError, TimeoutError, RetryLimitExceeded } from './errors';
import { generateId } from '../../shared/crypto';

export class LoopRuntime {
  private pipeline: LoopPipeline;
  private metricsCollector: RuntimeMetricsCollector;
  private historyManager: HistoryManager;
  private checkpointEngine: CheckpointEngine;
  private timeoutManager: TimeoutManager;
  private cancellationManager: CancellationManager;
  private scheduler: LoopScheduler;

  constructor() {
    this.pipeline = new LoopPipeline();
    this.metricsCollector = new RuntimeMetricsCollector();
    this.historyManager = new HistoryManager();
    this.checkpointEngine = new CheckpointEngine();
    this.timeoutManager = new TimeoutManager();
    this.cancellationManager = new CancellationManager();
    this.scheduler = new LoopScheduler();
  }

  public getPipeline(): LoopPipeline {
    return this.pipeline;
  }

  public getMetricsCollector(): RuntimeMetricsCollector {
    return this.metricsCollector;
  }

  public getHistoryManager(): HistoryManager {
    return this.historyManager;
  }

  public getCheckpointEngine(): CheckpointEngine {
    return this.checkpointEngine;
  }

  public getTimeoutManager(): TimeoutManager {
    return this.timeoutManager;
  }

  public getCancellationManager(): CancellationManager {
    return this.cancellationManager;
  }

  public getScheduler(): LoopScheduler {
    return this.scheduler;
  }

  /**
   * Initializes execution, assigns IDs, registers stages, and starts execution.
   */
  public async execute(
    loopId: string,
    tenantId: string,
    stages: PipelineStage[],
    options?: {
      parentWorkflowId?: string;
      parentAgentId?: string;
      correlationId?: string;
      timeoutMs?: number;
      retryPolicy?: RetryPolicy;
      metadata?: Record<string, any>;
    }
  ): Promise<{
    context: LoopExecutionContext;
    metrics: RuntimeMetrics;
    history: HistoryRecord[];
    success: boolean;
    output?: any;
    error?: any;
  }> {
    const executionId = generateId('exec');
    const context = LoopExecutionContextManager.create({
      loopId,
      executionId,
      parentWorkflowId: options?.parentWorkflowId,
      parentAgentId: options?.parentAgentId,
      correlationId: options?.correlationId,
      tenantId,
      timeoutMs: options?.timeoutMs,
      metadata: options?.metadata
    });

    // Reset pipeline with target execution stages
    this.pipeline = new LoopPipeline();
    stages.forEach((stage) => this.pipeline.registerStage(stage));

    const token = this.cancellationManager.createToken(executionId);
    let finalResult: any = null;
    let success = false;
    let executionError: any = null;

    try {
      LoopExecutionContextManager.transitionTo(context, RuntimeState.INITIALIZING);
      this.historyManager.recordTransition(executionId, RuntimeState.CREATED, RuntimeState.INITIALIZING, {
        retryAttempt: context.retryCount
      });
      await RuntimeEventPublisher.publish('PipelineStarted', context);

      // Composable hooks
      await this.pipeline.runBeforePipeline(context);

      const retryPolicy = options?.retryPolicy ?? {
        strategy: 'FIXED',
        maxAttempts: 1,
        baseDelayMs: 50,
        maxDelayMs: 200
      };

      const executeStages = async () => {
        let attempt = 0;
        let lastError: any = null;

        while (attempt < retryPolicy.maxAttempts) {
          token.throwIfCancelled();

          try {
            if (attempt > 0) {
              context.retryCount = attempt;
              this.metricsCollector.incrementRetry();
              LoopExecutionContextManager.transitionTo(context, RuntimeState.RETRY);
              this.historyManager.recordTransition(executionId, context.currentState, RuntimeState.RETRY, {
                retryAttempt: attempt,
                errorPayload: lastError
              });
              await RuntimeEventPublisher.publish('RetryStarted', context, { attempt });
              await this.pipeline.runOnRetry(context, attempt, lastError);
            }

            let prevStageResult: any = null;
            for (const stage of this.pipeline.getStages()) {
              token.throwIfCancelled();

              const prevState = context.currentState;
              LoopExecutionContextManager.transitionTo(context, stage.state);
              this.historyManager.recordTransition(executionId, prevState, stage.state, {
                retryAttempt: attempt
              });

              await this.pipeline.runBeforeStage(context, stage.state);

              let category: 'planning' | 'validation' | 'reflection' | 'observation' = 'observation';
              if (stage.state === RuntimeState.PLANNING) category = 'planning';
              if (stage.state === RuntimeState.VALIDATING) category = 'validation';
              if (stage.state === RuntimeState.REFLECTING) category = 'reflection';

              this.metricsCollector.startStage(category);

              prevStageResult = await this.timeoutManager.wrapWithTimeout(
                Promise.resolve(stage.execute(context)),
                options?.timeoutMs ?? context.timeoutMs,
                stage.state,
                async () => {
                  await RuntimeEventPublisher.publish('TimeoutTriggered', context, { stage: stage.state });
                }
              );

              this.metricsCollector.endStage(category);
              await this.pipeline.runAfterStage(context, stage.state, prevStageResult);
            }

            finalResult = prevStageResult;
            success = true;

            if (attempt > 0) {
              this.metricsCollector.incrementRecovery();
              await RuntimeEventPublisher.publish('RetryCompleted', context, { success: true });
            }
            break; // Break the retry loop
          } catch (err: any) {
            lastError = err;
            this.metricsCollector.incrementFailure();
            await this.pipeline.runOnError(context, err);

            if (err instanceof CancellationError) {
              throw err;
            }

            const delay = RetryEngine.getDelay(attempt, retryPolicy);
            if (delay < 0) {
              throw new RetryLimitExceeded(`Retry limit of ${retryPolicy.maxAttempts} exceeded.`, err);
            }

            attempt++;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      };

      await executeStages();

      LoopExecutionContextManager.transitionTo(context, RuntimeState.COMPLETED);
      this.historyManager.recordTransition(executionId, context.currentState, RuntimeState.COMPLETED, {
        retryAttempt: context.retryCount
      });
      this.metricsCollector.completeLoop();

      await this.pipeline.runAfterPipeline(context, finalResult);
      await RuntimeEventPublisher.publish('PipelineCompleted', context, { success: true });

    } catch (err: any) {
      executionError = err;
      success = false;

      if (err instanceof CancellationError) {
        LoopExecutionContextManager.transitionTo(context, RuntimeState.CANCELLED);
        this.historyManager.recordTransition(executionId, context.currentState, RuntimeState.CANCELLED, {
          retryAttempt: context.retryCount,
          errorPayload: err
        });
        await this.pipeline.runOnCancellation(context, err.message);
        await RuntimeEventPublisher.publish('LoopCancelled', context, { reason: err.message });
      } else if (err instanceof TimeoutError) {
        LoopExecutionContextManager.transitionTo(context, RuntimeState.TIMED_OUT);
        this.historyManager.recordTransition(executionId, context.currentState, RuntimeState.TIMED_OUT, {
          retryAttempt: context.retryCount,
          errorPayload: err
        });
        await RuntimeEventPublisher.publish('LoopFailed', context, { reason: 'TIMED_OUT' });
      } else {
        LoopExecutionContextManager.transitionTo(context, RuntimeState.FAILED);
        this.historyManager.recordTransition(executionId, context.currentState, RuntimeState.FAILED, {
          retryAttempt: context.retryCount,
          errorPayload: err
        });
        await RuntimeEventPublisher.publish('LoopFailed', context, { error: err.message });
      }
    } finally {
      this.cancellationManager.removeToken(executionId);
      this.timeoutManager.clearAll();
    }

    return {
      context,
      metrics: this.metricsCollector.getMetrics(),
      history: this.historyManager.getHistory(executionId),
      success,
      output: finalResult,
      error: executionError
    };
  }
}
