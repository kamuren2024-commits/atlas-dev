/**
 * Enterprise Workflow Orchestrator (EWO) — Core Orchestrator
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import {
  WorkflowState,
  WorkflowExecutionContext,
  WorkflowResult,
  WorkflowNode,
  WorkflowStepExecution
} from '../types';
import { IWorkflowOrchestrator } from '../contracts';
import { WorkflowRegistry } from '../registry';
import { WorkflowGraphEngine } from '../graph';
import { WorkflowHistoryManager } from '../history';
import { WorkflowMetricsCollector } from '../metrics';
import { WorkflowEventPublisher } from '../events';
import { WorkflowCheckpointEngine } from '../checkpoints';
import { WorkflowRecoveryEngine } from '../recovery';
import { EnterpriseGovernanceEngine } from '../governance';
import { LoopRuntime } from '../../loop/runtime';
import { RuntimeState } from '../../loop/runtime/context';
import { PipelineStage } from '../../loop/runtime/pipeline';
import { generateId } from '../../shared/crypto';

export class WorkflowOrchestrator implements IWorkflowOrchestrator {
  private registry: WorkflowRegistry;
  private graphEngine: WorkflowGraphEngine;
  private historyManager: WorkflowHistoryManager;
  private metricsCollector: WorkflowMetricsCollector;
  private checkpointEngine: WorkflowCheckpointEngine;
  private recoveryEngine: WorkflowRecoveryEngine;
  private governanceEngine: EnterpriseGovernanceEngine;
  private loopRuntime: LoopRuntime;

  constructor() {
    this.registry = WorkflowRegistry.getInstance();
    this.graphEngine = new WorkflowGraphEngine();
    this.historyManager = WorkflowHistoryManager.getInstance();
    this.metricsCollector = WorkflowMetricsCollector.getInstance();
    this.checkpointEngine = new WorkflowCheckpointEngine();
    this.recoveryEngine = new WorkflowRecoveryEngine(this.checkpointEngine);
    this.governanceEngine = new EnterpriseGovernanceEngine();
    this.loopRuntime = new LoopRuntime();
  }

  public getCheckpointEngine(): WorkflowCheckpointEngine {
    return this.checkpointEngine;
  }

  public getRecoveryEngine(): WorkflowRecoveryEngine {
    return this.recoveryEngine;
  }

  public getGovernanceEngine(): EnterpriseGovernanceEngine {
    return this.governanceEngine;
  }

  public async execute(
    workflowId: string,
    tenantId: string,
    inputs: Record<string, any>,
    options?: {
      parentWorkflowId?: string;
      parentAgentId?: string;
      securityContext?: { userId?: string; roles?: string[] };
    }
  ): Promise<WorkflowResult> {
    const startTime = Date.now();
    const executionId = generateId('wf-exec');

    const definition = this.registry.get(workflowId);
    if (!definition) {
      throw new Error(`Workflow with ID "${workflowId}" is not registered.`);
    }

    // Build Execution Context
    const context: WorkflowExecutionContext = {
      workflowId,
      executionId,
      version: definition.metadata.version,
      tenantId,
      parentWorkflowId: options?.parentWorkflowId,
      parentAgentId: options?.parentAgentId,
      currentState: WorkflowState.STARTED,
      variables: new Map<string, any>(Object.entries(inputs)),
      metadata: { ...definition.metadata },
      history: [],
      stepExecutions: new Map<string, WorkflowStepExecution>(),
      loopContexts: new Map(),
      securityContext: options?.securityContext ? {
        userId: options.securityContext.userId,
        roles: options.securityContext.roles,
        authorizedScope: ['global']
      } : undefined
    };

    // Initialize metrics & history
    this.metricsCollector.initialize(executionId, workflowId);
    this.historyManager.createRecord(executionId, workflowId, definition.metadata.version, tenantId);
    
    this.historyManager.recordTransition(executionId, undefined, WorkflowState.STARTED, 'Execution initiated.');
    await WorkflowEventPublisher.publish('WorkflowStarted', context);

    // Resolve topological tiers of the DAG
    let tiers: string[][] = [];
    try {
      tiers = this.graphEngine.resolveExecutionOrder(definition);
    } catch (err: any) {
      context.currentState = WorkflowState.FAILED;
      this.historyManager.recordTransition(executionId, WorkflowState.STARTED, WorkflowState.FAILED, `DAG Resolution Error: ${err.message}`);
      await WorkflowEventPublisher.publish('WorkflowFailed', context, { error: err.message });
      
      const endTime = Date.now();
      const totalDuration = endTime - startTime;
      this.metricsCollector.finalize(executionId, totalDuration);

      return {
        workflowId,
        executionId,
        success: false,
        finalState: WorkflowState.FAILED,
        outputs: {},
        error: err,
        durationMs: totalDuration,
        metrics: {
          totalDurationMs: totalDuration,
          stepsExecutedCount: 0,
          failedStepsCount: 0,
          retriesCount: 0
        }
      };
    }

    let success = true;
    let executionError: any = null;

    // Run tiers sequentially, but run nodes inside each tier in parallel
    for (const tier of tiers) {
      if (context.currentState === WorkflowState.FAILED || context.currentState === WorkflowState.CANCELLED) {
        break;
      }

      // Check governance constraints prior to running the tier
      const compliance = await this.governanceEngine.evaluateCompliance(context);
      if (!compliance.compliant) {
        success = false;
        executionError = new Error(`Governance Compliance Policy Violation: ${compliance.violations.join('; ')}`);
        context.currentState = WorkflowState.FAILED;
        this.historyManager.recordTransition(executionId, WorkflowState.STARTED, WorkflowState.FAILED, executionError.message);
        await WorkflowEventPublisher.publish('WorkflowFailed', context, { error: executionError.message });
        break;
      }

      const nodePromises = tier.map(async (nodeId) => {
        const node = definition.nodes.find((n) => n.id === nodeId)!;

        // Check if the node is runnable based on conditional branches
        const runnable = await this.graphEngine.isNodeRunnable(node, context);
        if (!runnable) {
          context.stepExecutions.set(nodeId, {
            nodeId,
            state: 'SKIPPED',
            startTime: Date.now(),
            endTime: Date.now(),
            durationMs: 0,
            output: null
          });
          this.historyManager.recordStepExecution(executionId, context.stepExecutions.get(nodeId)!);
          return;
        }

        // Initialize step record
        const stepRecord: WorkflowStepExecution = {
          nodeId,
          state: 'RUNNING',
          startTime: Date.now()
        };
        context.stepExecutions.set(nodeId, stepRecord);
        this.historyManager.recordStepExecution(executionId, stepRecord);

        try {
          // Integrate loop runtime execution inside node run
          const stepStage: PipelineStage = {
            state: RuntimeState.EXECUTING,
            execute: async () => {
              return await node.action(context);
            }
          };

          const loopResult = await this.loopRuntime.execute(
            `${workflowId}-${nodeId}`,
            tenantId,
            [stepStage],
            {
              parentWorkflowId: executionId,
              timeoutMs: node.policy?.timeoutMs || definition.globalPolicy?.timeoutMs,
              retryPolicy: node.policy?.retryPolicy || definition.globalPolicy?.retryPolicy
            }
          );

          if (!loopResult.success) {
            throw loopResult.error || new Error(`Loop execution failed for node "${nodeId}"`);
          }

          context.loopContexts.set(nodeId, loopResult.context);
          this.historyManager.linkLoopExecution(executionId, loopResult.context.executionId);

          const duration = Date.now() - stepRecord.startTime!;
          stepRecord.state = 'COMPLETED';
          stepRecord.endTime = Date.now();
          stepRecord.durationMs = duration;
          stepRecord.output = loopResult.output;

          this.metricsCollector.recordStepDuration(executionId, nodeId, duration);
          this.historyManager.recordStepExecution(executionId, stepRecord);
          await WorkflowEventPublisher.publish('DependencyResolved', context, { nodeId, output: loopResult.output });

          // Auto-save checkpoint if requested by policy or node is a checkpoint marker
          if (node.policy?.riskThreshold && node.policy.riskThreshold > 0.7) {
            const chk = this.checkpointEngine.createCheckpoint(context);
            await WorkflowEventPublisher.publish('WorkflowCheckpointCreated', context, { checkpointId: chk.id });
          }

        } catch (err: any) {
          stepRecord.state = 'FAILED';
          stepRecord.endTime = Date.now();
          stepRecord.durationMs = Date.now() - stepRecord.startTime!;
          stepRecord.error = err;

          this.metricsCollector.recordFailure(executionId);
          this.historyManager.recordStepExecution(executionId, stepRecord);

          // Apply recovery rules
          const recoveryPolicy = node.policy?.retryPolicy || definition.globalPolicy?.retryPolicy;
          if (recoveryPolicy) {
            // Log retry
            this.metricsCollector.recordRetry(executionId);
          }

          // Fallback strategy: CONTINUE_WITH_DEFAULT_OUTPUT
          const recoveryOutcome = await this.recoveryEngine.attemptRecovery(
            context,
            nodeId,
            err,
            { strategyType: 'CONTINUE_WITH_DEFAULT_OUTPUT', defaultOutput: { fallbackActive: true } }
          );

          if (recoveryOutcome.recovered) {
            stepRecord.state = 'COMPLETED';
            stepRecord.output = recoveryOutcome.output;
            this.historyManager.recordStepExecution(executionId, stepRecord);
          } else {
            success = false;
            executionError = err;
            context.currentState = WorkflowState.FAILED;
            await WorkflowEventPublisher.publish('WorkflowFailed', context, { nodeId, error: err.message });
          }
        }
      });

      await Promise.all(nodePromises);
    }

    const endTime = Date.now();
    const finalDuration = endTime - startTime;

    const summary = this.metricsCollector.finalize(executionId, finalDuration);
    this.historyManager.completeRecord(executionId);

    if (success && context.currentState !== WorkflowState.FAILED) {
      context.currentState = WorkflowState.COMPLETED;
      this.historyManager.recordTransition(executionId, WorkflowState.STARTED, WorkflowState.COMPLETED, 'Workflow execution completed successfully.');
      await WorkflowEventPublisher.publish('WorkflowCompleted', context);
    } else {
      context.currentState = WorkflowState.FAILED;
      this.historyManager.recordTransition(executionId, WorkflowState.STARTED, WorkflowState.FAILED, `Workflow execution failed: ${executionError?.message}`);
    }

    const outputRecords: Record<string, any> = {};
    context.stepExecutions.forEach((val, key) => {
      if (val.state === 'COMPLETED') {
        outputRecords[key] = val.output;
      }
    });

    return {
      workflowId,
      executionId,
      success: context.currentState === WorkflowState.COMPLETED,
      finalState: context.currentState,
      outputs: outputRecords,
      error: executionError || undefined,
      durationMs: finalDuration,
      metrics: {
        totalDurationMs: finalDuration,
        stepsExecutedCount: summary?.stepsExecutedCount || 0,
        failedStepsCount: summary?.failedStepsCount || 0,
        retriesCount: summary?.retriesCount || 0
      }
    };
  }
}
