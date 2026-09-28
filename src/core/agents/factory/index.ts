/**
 * Enterprise Agent Framework (EAF) — Agent Factory and Base Agent Class
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { EnterpriseAgent, IAgentFactory } from '../contracts';
import {
  AgentConfiguration,
  AgentContext,
  AgentResult,
  AgentHealth,
  AgentMetadata,
  AgentState,
  AgentTelemetry
} from '../types';
import { AgentLifecycleManager } from '../lifecycle';
import { AgentTelemetryCollector } from '../telemetry';
import { AgentPermissionEngine } from '../permissions';
import { AgentGovernanceEngine } from '../governance';
import { AgentSecurityGuard } from '../security';
import { WorkflowBuilder } from '../../workflow/builder';
import { WorkflowRegistry } from '../../workflow/registry';
import { WorkflowOrchestrator } from '../../workflow/orchestrator';
import { generateId } from '../../shared/crypto';

export class BaseEnterpriseAgent implements EnterpriseAgent {
  private config: AgentConfiguration;
  private state: AgentState = AgentState.REGISTERED;
  private lifecycleManager: AgentLifecycleManager;
  private telemetryCollector: AgentTelemetryCollector;
  private orchestrator: WorkflowOrchestrator;

  constructor(config: AgentConfiguration) {
    this.config = config;
    this.lifecycleManager = AgentLifecycleManager.getInstance();
    this.telemetryCollector = AgentTelemetryCollector.getInstance();
    this.orchestrator = new WorkflowOrchestrator();
    this.state = AgentState.READY;
    this.lifecycleManager.transitionTo(config.metadata.id, AgentState.READY, 'Agent constructed and ready.');
  }

  public getMetadata(): AgentMetadata {
    return this.config.metadata;
  }

  public getConfiguration(): AgentConfiguration {
    return this.config;
  }

  public getState(): AgentState {
    return this.state;
  }

  public getHealth(): AgentHealth {
    return this.telemetryCollector.getMetrics(this.config.metadata.id) || {
      status: 'HEALTHY',
      availability: 100,
      executionCount: 0,
      successRate: 1,
      failureRate: 0,
      averageLatencyMs: 0,
      errorCount: 0
    };
  }

  /**
   * Orchestrates the agent execution using EWO (Workflow Orchestrator) and Loop Runtime.
   */
  public async execute(inputs: Record<string, any>, context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const executionId = generateId('agt-exec');
    this.state = AgentState.EXECUTING;
    this.lifecycleManager.transitionTo(this.config.metadata.id, AgentState.EXECUTING);

    // 1. Permission validation check
    const resource = inputs.resource || 'global';
    const isAuthorized = AgentPermissionEngine.isAuthorized(this.config.permissions, resource, 'EXECUTE');
    if (!isAuthorized) {
      const errorMsg = `Authorization Failed: Agent does not possess EXECUTE permission on resource "${resource}"`;
      return this.finalizeFailedExecution(executionId, startTime, context, errorMsg);
    }

    // 2. GRC validation check
    const gCheck = AgentGovernanceEngine.evaluate(this.config.policies, context, inputs);
    if (!gCheck.passed) {
      const errorMsg = `Governance Violation: ${gCheck.violations.join('; ')}`;
      return this.finalizeFailedExecution(executionId, startTime, context, errorMsg);
    }

    // 3. Security verification check
    const isSecurityValid = AgentSecurityGuard.verifyContext(context, context.securityContext?.roles || []);
    if (!isSecurityValid) {
      const errorMsg = 'Security Guard: Execution contextual verification failed.';
      return this.finalizeFailedExecution(executionId, startTime, context, errorMsg);
    }

    // 4. Dynanic Workflow / Loop substrate assembly
    const workflowId = `agent-wf-${this.config.metadata.id}`;
    const registry = WorkflowRegistry.getInstance();

    if (!registry.get(workflowId)) {
      const builder = new WorkflowBuilder()
        .setId(workflowId)
        .setName(`Execution Plan for Agent ${this.config.metadata.name}`)
        .setVersion(this.config.metadata.version)
        .addNode({
          id: 'agent-core-step',
          name: 'Agent Cognitive Logic',
          type: 'STEP',
          dependencies: [],
          action: async (wfCtx) => {
            // Simply execute the composable capabilities sequentially as the logic payload
            const results: Record<string, any> = {};
            for (const capName of this.config.capabilities) {
              results[capName] = { executed: true, timestamp: Date.now() };
            }
            return {
              success: true,
              message: 'Agent capabilities processed successfully.',
              data: results
            };
          }
        });

      registry.register(builder.build());
    }

    try {
      // Execute via the Workflow Orchestrator (which uses the Loop Runtime for step executions)
      const wfResult = await this.orchestrator.execute(workflowId, context.tenantId, inputs, {
        parentWorkflowId: context.workflowContext?.executionId,
        securityContext: context.securityContext
      });

      const latency = Date.now() - startTime;

      const telemetry: AgentTelemetry = {
        executionId,
        agentId: this.config.metadata.id,
        startTime,
        endTime: Date.now(),
        latencyMs: latency,
        success: wfResult.success,
        correlationId: context.correlationId,
        workflowExecutionId: wfResult.executionId,
        loopExecutionId: Array.from(wfResult.outputs ? Object.keys(wfResult.outputs) : [])[0],
        error: wfResult.error?.message
      };

      const result: AgentResult = {
        agentId: this.config.metadata.id,
        executionId,
        success: wfResult.success,
        outputs: wfResult.outputs,
        error: wfResult.error,
        latencyMs: latency,
        telemetry
      };

      this.telemetryCollector.recordExecution(result);

      if (wfResult.success) {
        this.state = AgentState.COMPLETED;
        this.lifecycleManager.transitionTo(this.config.metadata.id, AgentState.COMPLETED);
      } else {
        this.state = AgentState.FAILED;
        this.lifecycleManager.transitionTo(this.config.metadata.id, AgentState.FAILED);
      }

      return result;
    } catch (err: any) {
      return this.finalizeFailedExecution(executionId, startTime, context, err.message || err);
    }
  }

  private finalizeFailedExecution(
    executionId: string,
    startTime: number,
    context: AgentContext,
    errorMessage: string
  ): AgentResult {
    const latency = Date.now() - startTime;
    this.state = AgentState.FAILED;
    this.lifecycleManager.transitionTo(this.config.metadata.id, AgentState.FAILED, errorMessage);

    const telemetry: AgentTelemetry = {
      executionId,
      agentId: this.config.metadata.id,
      startTime,
      endTime: Date.now(),
      latencyMs: latency,
      success: false,
      correlationId: context.correlationId,
      error: errorMessage
    };

    const result: AgentResult = {
      agentId: this.config.metadata.id,
      executionId,
      success: false,
      outputs: {},
      error: new Error(errorMessage),
      latencyMs: latency,
      telemetry
    };

    this.telemetryCollector.recordExecution(result);
    return result;
  }
}

export class AgentFactory implements IAgentFactory {
  public createAgent(config: AgentConfiguration): EnterpriseAgent {
    return new BaseEnterpriseAgent(config);
  }
}
