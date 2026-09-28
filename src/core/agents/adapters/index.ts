/**
 * Enterprise Agent Framework (EAF) — Module Adapters
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { EnterpriseAgent } from '../contracts';
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

// Import existing adapters to preserve integration continuity
import {
  TenderIntelligenceAdapter,
  TenderIntelligenceAgentAdapter as TenderAssistantAdapter,
  ProcurementIntelligenceAdapter,
  SCMIntelligenceAdapter,
  KnowledgeServicesAdapter,
  DataSciencePlatformAdapter,
  CyberOperationsAdapter,
  AnalyticsAdapter,
  DashboardServicesAdapter
} from '../../workflow/adapters';

export class BaseModuleAgentAdapter implements EnterpriseAgent {
  protected config: AgentConfiguration;
  protected state: AgentState = AgentState.REGISTERED;
  protected lifecycleManager: AgentLifecycleManager;
  protected telemetryCollector: AgentTelemetryCollector;
  protected orchestrator: WorkflowOrchestrator;
  protected underlyingAdapter: any;
  protected defaultAction: string;

  constructor(config: AgentConfiguration, underlyingAdapter: any, defaultAction: string) {
    this.config = config;
    this.underlyingAdapter = underlyingAdapter;
    this.defaultAction = defaultAction;
    this.lifecycleManager = AgentLifecycleManager.getInstance();
    this.telemetryCollector = AgentTelemetryCollector.getInstance();
    this.orchestrator = new WorkflowOrchestrator();
    this.state = AgentState.READY;
    this.lifecycleManager.transitionTo(config.metadata.id, AgentState.READY, 'Adapter ready for routing');
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

  public async execute(inputs: Record<string, any>, context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now();
    const executionId = generateId('agt-adp');
    this.state = AgentState.EXECUTING;
    this.lifecycleManager.transitionTo(this.config.metadata.id, AgentState.EXECUTING);

    // Enforce EAF standard permission check
    const resource = inputs.resource || 'global';
    const isAuthorized = AgentPermissionEngine.isAuthorized(this.config.permissions, resource, 'EXECUTE');
    if (!isAuthorized) {
      const errorMsg = `Authorization Failed: Agent adapter lacks EXECUTE permission on "${resource}"`;
      return this.finalizeFailedExecution(executionId, startTime, context, errorMsg);
    }

    // Enforce EAF standard GRC policy evaluation
    const gCheck = AgentGovernanceEngine.evaluate(this.config.policies, context, inputs);
    if (!gCheck.passed) {
      const errorMsg = `Governance Blocked: ${gCheck.violations.join('; ')}`;
      return this.finalizeFailedExecution(executionId, startTime, context, errorMsg);
    }

    // Security context checks
    const isSecurityValid = AgentSecurityGuard.verifyContext(context, context.securityContext?.roles || []);
    if (!isSecurityValid) {
      const errorMsg = 'Security context validation failed inside adapter container.';
      return this.finalizeFailedExecution(executionId, startTime, context, errorMsg);
    }

    const workflowId = `adp-wf-${this.config.metadata.id}`;
    const registry = WorkflowRegistry.getInstance();

    if (!registry.get(workflowId)) {
      const builder = new WorkflowBuilder()
        .setId(workflowId)
        .setName(`Orchestration Bridge for ${this.config.metadata.name}`)
        .setVersion(this.config.metadata.version)
        .addNode({
          id: 'adapter-delegate-step',
          name: 'Module Adapter Delegation',
          type: 'STEP',
          dependencies: [],
          action: async (wfCtx) => {
            const act = inputs.action || this.defaultAction;
            // Bridge the call cleanly to the underlying business module adapter
            return await this.underlyingAdapter.executeAction(act, inputs.params || {}, wfCtx);
          }
        });

      registry.register(builder.build());
    }

    try {
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

// 1. Tender Intelligence Adapter
export class TenderIntelligenceAgentAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'tender-intelligence-agent',
          name: 'Tender Intelligence Agent',
          description: 'Evaluates procurement bids, conducts PPADA reviews, and drafts tender requirements.',
          version: '1.0.0'
        },
        capabilities: ['ANALYSIS', 'COMPLIANCE', 'VALIDATION'],
        policies: { retryMaxAttempts: 3, timeoutMs: 30000, approvalRequired: false },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new TenderIntelligenceAdapter(),
      'evaluateBids'
    );
  }
}

// 2. Tender Intelligence Assistant Adapter
export class TenderIntelligenceAssistantAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'tender-intelligence-assistant',
          name: 'Tender Intelligence Assistant',
          description: 'Cognitive language refiner and copilot proposal drafter.',
          version: '1.0.0'
        },
        capabilities: ['GENERATION', 'REFLECTION'],
        policies: { retryMaxAttempts: 2, timeoutMs: 15000, approvalRequired: false },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new TenderAssistantAdapter(),
      'triggerCopilotDraft'
    );
  }
}

// 3. Procurement Intelligence Adapter
export class ProcurementIntelligenceAgentAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'procurement-intelligence-agent',
          name: 'Procurement Intelligence Agent',
          description: 'Audits plans, matches active suppliers, and estimates costs.',
          version: '1.0.0'
        },
        capabilities: ['ANALYSIS', 'COMPLIANCE', 'PLANNING'],
        policies: { retryMaxAttempts: 3, timeoutMs: 25000, approvalRequired: true },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new ProcurementIntelligenceAdapter(),
      'matchVendors'
    );
  }
}

// 4. SCM Intelligence Adapter
export class SCMIntelligenceAgentAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'scm-intelligence-agent',
          name: 'SCM Intelligence Agent',
          description: 'Predicts stock outages and evaluates global supplier risk.',
          version: '1.0.0'
        },
        capabilities: ['ANALYSIS', 'MONITORING'],
        policies: { retryMaxAttempts: 3, timeoutMs: 20000, approvalRequired: false },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new SCMIntelligenceAdapter(),
      'predictStockOut'
    );
  }
}

// 5. Knowledge Services Adapter
export class KnowledgeServicesAgentAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'knowledge-services-agent',
          name: 'Knowledge Services Agent',
          description: 'Indexes dynamic regulatory codes and answers semantic questions.',
          version: '1.0.0'
        },
        capabilities: ['RETRIEVAL', 'COMPLIANCE'],
        policies: { retryMaxAttempts: 5, timeoutMs: 40000, approvalRequired: false },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new KnowledgeServicesAdapter(),
      'queryKnowledgeCortex'
    );
  }
}

// 6. Data Science Platform Adapter
export class DataSciencePlatformAgentAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'data-science-platform-agent',
          name: 'Data Science Platform Agent',
          description: 'Trains custom supply-chain forecast models and computes outliers.',
          version: '1.0.0'
        },
        capabilities: ['ANALYSIS', 'REPORTING'],
        policies: { retryMaxAttempts: 1, timeoutMs: 60000, approvalRequired: true },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new DataSciencePlatformAdapter(),
      'trainDemandModel'
    );
  }
}

// 7. Cyber Operations Adapter
export class CyberOperationsAgentAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'cyber-operations-agent',
          name: 'Cyber Operations Agent',
          description: 'Conducts log audits, threat analyses, and verifies boots.',
          version: '1.0.0'
        },
        capabilities: ['MONITORING', 'COMPLIANCE'],
        policies: { retryMaxAttempts: 2, timeoutMs: 10000, approvalRequired: false },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new CyberOperationsAdapter(),
      'detectSecurityAnomaly'
    );
  }
}

// 8. Analytics Adapter
export class AnalyticsAgentAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'analytics-agent',
          name: 'Analytics Agent',
          description: 'Collates execution metrics and computes spend discrepancies.',
          version: '1.0.0'
        },
        capabilities: ['REPORTING', 'ANALYSIS'],
        policies: { retryMaxAttempts: 3, timeoutMs: 30000, approvalRequired: false },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new AnalyticsAdapter(),
      'generateExecutionReport'
    );
  }
}

// 9. Dashboard Services Adapter
export class DashboardServicesAgentAdapter extends BaseModuleAgentAdapter {
  constructor() {
    super(
      {
        metadata: {
          id: 'dashboard-services-agent',
          name: 'Dashboard Services Agent',
          description: 'Updates views and triggers outbound executive push alerts.',
          version: '1.0.0'
        },
        capabilities: ['NOTIFICATION', 'MONITORING'],
        policies: { retryMaxAttempts: 2, timeoutMs: 15000, approvalRequired: false },
        permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
      },
      new DashboardServicesAdapter(),
      'refreshStateViews'
    );
  }
}
