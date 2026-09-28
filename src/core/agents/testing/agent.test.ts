/**
 * Enterprise Agent Framework (EAF) — Diagnostics & Test Suite
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentFactory } from '../factory';
import { AgentRegistry } from '../registry';
import { AgentDiscoveryService } from '../discovery';
import { AgentContextManager } from '../context';
import { AgentPermissionEngine } from '../permissions';
import { AgentGovernanceEngine } from '../governance';
import { AgentSecurityGuard } from '../security';
import { AgentTelemetryCollector } from '../telemetry';
import { AgentLifecycleManager } from '../lifecycle';
import { AgentState } from '../types';

import {
  TenderIntelligenceAgentAdapter,
  TenderIntelligenceAssistantAdapter,
  ProcurementIntelligenceAgentAdapter,
  SCMIntelligenceAgentAdapter,
  KnowledgeServicesAgentAdapter,
  DataSciencePlatformAgentAdapter,
  CyberOperationsAgentAdapter,
  AnalyticsAgentAdapter,
  DashboardServicesAgentAdapter
} from '../adapters';

export class AgentDiagnosticSuite {
  public static async runAll(): Promise<boolean> {
    console.log('=== [Enterprise Agent Framework (EAF) Diagnostics: Initiating Suite] ===');
    let allPassed = true;

    try {
      await this.testFactoryAndContextCreation();
      console.log('✔ Test Factory & Context Creation: PASSED');
    } catch (err) {
      console.error('❌ Test Factory & Context Creation: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testRegistryAndDiscovery();
      console.log('✔ Test Registry & Discovery: PASSED');
    } catch (err) {
      console.error('❌ Test Registry & Discovery: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testLifecycleTransitions();
      console.log('✔ Test Lifecycle Transitions: PASSED');
    } catch (err) {
      console.error('❌ Test Lifecycle Transitions: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testPermissionValidation();
      console.log('✔ Test Permission Validation: PASSED');
    } catch (err) {
      console.error('❌ Test Permission Validation: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testGovernanceAndSecurity();
      console.log('✔ Test Governance & Security: PASSED');
    } catch (err) {
      console.error('❌ Test Governance & Security: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testTelemetryAndHealthMonitoring();
      console.log('✔ Test Telemetry & Health Monitoring: PASSED');
    } catch (err) {
      console.error('❌ Test Telemetry & Health Monitoring: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testAdaptersAndWorkflowIntegration();
      console.log('✔ Test Adapters & Workflow/Loop Integration: PASSED');
    } catch (err) {
      console.error('❌ Test Adapters & Workflow/Loop Integration: FAILED', err);
      allPassed = false;
    }

    console.log(`=== [EAF Diagnostics Completed. Global Status: ${allPassed ? 'GREEN/SUCCESS' : 'RED/FAILED'}] ===`);
    return allPassed;
  }

  private static assert(condition: boolean, msg: string) {
    if (!condition) {
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  private static async testFactoryAndContextCreation() {
    const factory = new AgentFactory();
    const agent = factory.createAgent({
      metadata: {
        id: 'test-agent-1',
        name: 'Strategic Agent',
        description: 'Handles high-level tasks',
        version: '1.0.0'
      },
      capabilities: ['PLANNING', 'ANALYSIS'],
      policies: { timeoutMs: 5000 },
      permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
    });

    this.assert(agent.getMetadata().id === 'test-agent-1', 'ID mismatch');
    this.assert(agent.getConfiguration().capabilities.includes('PLANNING'), 'Capabilities missing');

    const context = AgentContextManager.createContext({
      agentId: 'test-agent-1',
      version: '1.0.0',
      tenantId: 'TENANT-ALPHA',
      permissions: [{ type: 'EXECUTE', resource: 'core-system', authorized: true }]
    });

    this.assert(context.tenantId === 'TENANT-ALPHA', 'Tenant mismatch');
    this.assert(context.correlationId.startsWith('corr-'), 'Correlation ID not generated');
  }

  private static async testRegistryAndDiscovery() {
    const registry = AgentRegistry.getInstance();
    registry.clear();

    const factory = new AgentFactory();
    const agent = factory.createAgent({
      metadata: {
        id: 'discovery-agent',
        name: 'Discovery Copilot',
        description: 'Handles retrieval and compliance checking',
        version: '1.0.0'
      },
      capabilities: ['RETRIEVAL', 'COMPLIANCE'],
      policies: {},
      permissions: [{ type: 'EXECUTE', resource: '*', authorized: true }]
    });

    registry.register(agent);
    
    const retrieved = registry.get('discovery-agent');
    this.assert(retrieved !== undefined, 'Registry lookup failed');

    const discovery = new AgentDiscoveryService();
    const capable = discovery.findCapableOf('COMPLIANCE');
    this.assert(capable.length > 0, 'Discovery by capability failed');
    this.assert(capable[0].getMetadata().id === 'discovery-agent', 'Wrong agent returned');
  }

  private static async testLifecycleTransitions() {
    const lifecycle = AgentLifecycleManager.getInstance();
    lifecycle.clearAll();

    lifecycle.transitionTo('test-lifecycle-agent', AgentState.INITIALIZING);
    this.assert(lifecycle.getState('test-lifecycle-agent') === AgentState.INITIALIZING, 'Failed to transition to INITIALIZING');

    lifecycle.transitionTo('test-lifecycle-agent', AgentState.READY);
    this.assert(lifecycle.getState('test-lifecycle-agent') === AgentState.READY, 'Failed to transition to READY');
  }

  private static async testPermissionValidation() {
    const permissions = [
      { type: 'EXECUTE' as const, resource: 'tender/*', authorized: true },
      { type: 'READ' as const, resource: 'financials', authorized: false }
    ];

    const allowed = AgentPermissionEngine.isAuthorized(permissions, 'tender/eval', 'EXECUTE');
    this.assert(allowed === true, 'Wildcard match should be allowed');

    const blocked = AgentPermissionEngine.isAuthorized(permissions, 'financials', 'READ');
    this.assert(blocked === false, 'Disabled authorization should be blocked');
  }

  private static async testGovernanceAndSecurity() {
    const policy = { riskThreshold: 0.3, maxExecutionLimit: 5 };
    const context = AgentContextManager.createContext({
      agentId: 'g-agent',
      version: '1.0.0',
      tenantId: 'TENANT-1',
      securityContext: { userId: 'usr-1', roles: ['ADMIN'] }
    });

    const isSecurityOk = AgentSecurityGuard.verifyContext(context, ['ADMIN']);
    this.assert(isSecurityOk === true, 'Security context verification failed');

    const normalSpendReport = AgentGovernanceEngine.evaluate(policy, context, { spend: 10000 });
    this.assert(normalSpendReport.passed === true, 'Normal spend should pass GRC');

    const highSpendReport = AgentGovernanceEngine.evaluate(policy, context, { spend: 900000 });
    this.assert(highSpendReport.passed === false, 'High spend should trigger GRC blocks');
    this.assert(highSpendReport.requiresHumanApproval === true, 'High spend must trigger human review requirement');
  }

  private static async testTelemetryAndHealthMonitoring() {
    const telemetryCollector = AgentTelemetryCollector.getInstance();
    telemetryCollector.clearAll();

    const mockResult = {
      agentId: 'monitor-agent',
      executionId: 'exec-1',
      success: true,
      outputs: { data: 'some-output' },
      latencyMs: 120,
      telemetry: {
        executionId: 'exec-1',
        agentId: 'monitor-agent',
        startTime: Date.now() - 120,
        endTime: Date.now(),
        latencyMs: 120,
        success: true,
        correlationId: 'corr-1'
      }
    };

    telemetryCollector.recordExecution(mockResult);
    const metrics = telemetryCollector.getMetrics('monitor-agent')!;
    
    this.assert(metrics.executionCount === 1, 'Execution count mismatch');
    this.assert(metrics.averageLatencyMs === 120, 'Average latency mismatch');
    this.assert(metrics.status === 'HEALTHY', 'Status mismatch');
  }

  private static async testAdaptersAndWorkflowIntegration() {
    // Instantiate one of the 9 adapters
    const tenderAgent = new TenderIntelligenceAgentAdapter();
    const context = AgentContextManager.createContext({
      agentId: tenderAgent.getMetadata().id,
      version: '1.0.0',
      tenantId: 'T01',
      securityContext: { userId: 'kamuren', roles: ['OPERATIONS'] }
    });

    const res = await tenderAgent.execute(
      {
        action: 'evaluateBids',
        params: { bids: ['bid-1', 'bid-2', 'bid-3'] }
      },
      context
    );

    this.assert(res.success === true, 'Execution of adapter failed');
    this.assert(res.outputs['adapter-delegate-step'] !== undefined, 'Adapter delegation failed to pass payload back');
    this.assert(res.outputs['adapter-delegate-step'].bidsEvaluated === 3, 'Outputs did not preserve business logic');
  }
}
