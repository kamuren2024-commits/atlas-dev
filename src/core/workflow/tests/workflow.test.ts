/**
 * Enterprise Workflow Orchestrator (EWO) — High-Fidelity Diagnostics Suite
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowBuilder } from '../builder';
import { WorkflowRegistry } from '../registry';
import { WorkflowGraphEngine } from '../graph';
import { WorkflowOrchestrator } from '../orchestrator';
import { WorkflowScheduler } from '../scheduler';
import { WorkflowEventPublisher } from '../events';
import { WorkflowHistoryManager } from '../history';
import { WorkflowState, WorkflowExecutionContext } from '../types';
import { TenderIntelligenceAdapter } from '../adapters';

export class WorkflowDiagnosticSuite {
  public static async runAll(): Promise<boolean> {
    console.log('=== [Workflow Orchestrator Diagnostics: Initiating EWO Suite] ===');
    let allPassed = true;

    try {
      await this.testWorkflowRegistration();
      console.log('✔ Test Workflow Registration: PASSED');
    } catch (err) {
      console.error('❌ Test Workflow Registration: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testDependencyResolutionAndDAG();
      console.log('✔ Test Dependency Resolution & DAG: PASSED');
    } catch (err) {
      console.error('❌ Test Dependency Resolution & DAG: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testAdapterBehavior();
      console.log('✔ Test Adapter Behavior: PASSED');
    } catch (err) {
      console.error('❌ Test Adapter Behavior: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testEventPropagation();
      console.log('✔ Test Event Propagation: PASSED');
    } catch (err) {
      console.error('❌ Test Event Propagation: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testPolicyAndOrchestration();
      console.log('✔ Test Policy and Orchestration: PASSED');
    } catch (err) {
      console.error('❌ Test Policy and Orchestration: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testSchedulerBehavior();
      console.log('✔ Test Scheduler Behavior: PASSED');
    } catch (err) {
      console.error('❌ Test Scheduler Behavior: FAILED', err);
      allPassed = false;
    }

    try {
      await this.testRecoveryAndCheckpoints();
      console.log('✔ Test Recovery & Checkpoints: PASSED');
    } catch (err) {
      console.error('❌ Test Recovery & Checkpoints: FAILED', err);
      allPassed = false;
    }

    console.log(`=== [EWO Diagnostics Completed. Global Status: ${allPassed ? 'GREEN/SUCCESS' : 'RED/FAILED'}] ===`);
    return allPassed;
  }

  private static assert(condition: boolean, msg: string) {
    if (!condition) {
      throw new Error(`Assertion failed: ${msg}`);
    }
  }

  private static async testWorkflowRegistration() {
    const registry = WorkflowRegistry.getInstance();
    registry.clear();

    const builder = new WorkflowBuilder()
      .setId('test-wf-1')
      .setName('Test Tender Flow')
      .setDescription('Verify registration flow')
      .setVersion('1.0.0')
      .addNode({
        id: 'node-1',
        name: 'Initiate',
        type: 'STEP',
        dependencies: [],
        action: () => 'ok'
      });

    const definition = builder.register();
    this.assert(definition.id === 'test-wf-1', 'ID mismatch');
    
    const retrieved = registry.get('test-wf-1');
    this.assert(retrieved !== undefined, 'Workflow not registered in Registry');
    this.assert(retrieved?.metadata.name === 'Test Tender Flow', 'Metadata name broke');
  }

  private static async testDependencyResolutionAndDAG() {
    const graphEngine = new WorkflowGraphEngine();

    const definition = new WorkflowBuilder()
      .setId('dag-wf')
      .setName('DAG Test')
      .setVersion('1.0.0')
      .addNode({ id: 'a', name: 'Start', type: 'STEP', dependencies: [], action: () => 'A' })
      .addNode({ id: 'b', name: 'Branch 1', type: 'STEP', dependencies: [{ nodeId: 'a', type: 'SEQUENTIAL' }], action: () => 'B' })
      .addNode({ id: 'c', name: 'Branch 2', type: 'STEP', dependencies: [{ nodeId: 'a', type: 'SEQUENTIAL' }], action: () => 'C' })
      .addNode({ id: 'd', name: 'Join', type: 'STEP', dependencies: [{ nodeId: 'b', type: 'SEQUENTIAL' }, { nodeId: 'c', type: 'SEQUENTIAL' }], action: () => 'D' })
      .build();

    const isValid = graphEngine.validateDAG(definition);
    this.assert(isValid === true, 'DAG reported cyclic when it is valid');

    const tiers = graphEngine.resolveExecutionOrder(definition);
    this.assert(tiers.length === 3, 'Expected 3 execution tiers (a -> [b, c] -> d)');
    this.assert(tiers[0][0] === 'a', 'Tier 0 must be node "a"');
    this.assert(tiers[1].includes('b') && tiers[1].includes('c'), 'Tier 1 must contain "b" and "c"');
    this.assert(tiers[2][0] === 'd', 'Tier 2 must be node "d"');
  }

  private static async testAdapterBehavior() {
    const adapter = new TenderIntelligenceAdapter();
    this.assert(adapter.moduleName === 'Tender Intelligence', 'Module name mismatch');
    this.assert(adapter.supportedActions.includes('evaluateBids'), 'Missing supported actions');

    // Create a dummy execution context
    const context: WorkflowExecutionContext = {
      workflowId: 'wf-1',
      executionId: 'exec-1',
      version: '1.0.0',
      tenantId: 'T01',
      currentState: WorkflowState.STARTED,
      variables: new Map(),
      metadata: {},
      history: [],
      stepExecutions: new Map(),
      loopContexts: new Map()
    };

    const res = await adapter.executeAction('evaluateBids', { bids: ['bid-1', 'bid-2'] }, context);
    this.assert(res.bidsEvaluated === 2, 'Adapter failed parameter translation');
    this.assert(res.highestScoringBidId === 'bid-02', 'Adapter response failed matching expectations');
  }

  private static async testEventPropagation() {
    const context: WorkflowExecutionContext = {
      workflowId: 'event-wf',
      executionId: 'event-exec',
      version: '1.0.0',
      tenantId: 'T01',
      currentState: WorkflowState.STARTED,
      variables: new Map([['k1', 'v1']]),
      metadata: {},
      history: [],
      stepExecutions: new Map(),
      loopContexts: new Map()
    };

    const eventTracker = { eventFired: false, payloadChecked: false };

    const unsubscribe = WorkflowEventPublisher.subscribe('WorkflowStarted', (event) => {
      eventTracker.eventFired = true;
      if (event.contextSnapshot.variables.k1 === 'v1' && event.payload.scope === 'test') {
        eventTracker.payloadChecked = true;
      }
    });

    await WorkflowEventPublisher.publish('WorkflowStarted', context, { scope: 'test' });
    unsubscribe();

    this.assert(eventTracker.eventFired === true, 'Event was not delivered to subscriber');
    this.assert(eventTracker.payloadChecked === true, 'Event snapshot variable or custom payload was lost');
  }

  private static async testPolicyAndOrchestration() {
    const registry = WorkflowRegistry.getInstance();
    const orchestrator = new WorkflowOrchestrator();

    const builder = new WorkflowBuilder()
      .setId('procurement-wf')
      .setName('Compliance Audit')
      .setDescription('Orchestrates full procurement loops')
      .setVersion('1.0.0')
      .addNode({
        id: 'start-node',
        name: 'Check Budget',
        type: 'STEP',
        dependencies: [],
        action: (ctx) => {
          ctx.variables.set('procurementCost', 500000);
          return { budgetOk: true };
        }
      })
      .addNode({
        id: 'compliance-node',
        name: 'PPADA Verification',
        type: 'STEP',
        dependencies: [{ nodeId: 'start-node', type: 'SEQUENTIAL' }],
        action: async (ctx) => {
          const cost = ctx.variables.get('procurementCost');
          const adapter = new TenderIntelligenceAdapter();
          return await adapter.executeAction('checkCompliance', { cost }, ctx);
        }
      });

    registry.register(builder.build());

    const result = await orchestrator.execute('procurement-wf', 'TENANT_01', {});
    this.assert(result.success === true, 'Orchestrated execution failed');
    this.assert(result.outputs['compliance-node'].governingAct === 'Kenya PPADA 2015', 'Orchestration pipeline flow output is incorrect');
    
    // Check history transition logs
    const historyRecord = WorkflowHistoryManager.getInstance().getRecord(result.executionId);
    this.assert(historyRecord !== undefined, 'No execution history record created');
    this.assert(historyRecord?.transitions.some((t) => t.toState === WorkflowState.COMPLETED), 'Completed state transition missing in audit trail');
  }

  private static async testSchedulerBehavior() {
    const scheduler = WorkflowScheduler.getInstance();
    scheduler.clearAll();

    const tracker = { taskFired: false };

    scheduler.schedule({
      id: 'scheduled-task-1',
      workflowId: 'procurement-wf',
      tenantId: 'TENANT_01',
      inputs: {},
      triggerType: 'IMMEDIATE',
      priority: 10
    }, () => {
      tracker.taskFired = true;
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    this.assert(tracker.taskFired === true, 'Scheduler failed to dispatch task');
    scheduler.clearAll();
  }

  private static async testRecoveryAndCheckpoints() {
    const orchestrator = new WorkflowOrchestrator();
    const checkpointEngine = orchestrator.getCheckpointEngine();
    const recoveryEngine = orchestrator.getRecoveryEngine();

    const context: WorkflowExecutionContext = {
      workflowId: 'recovery-wf',
      executionId: 'exec-recovery-1',
      version: '1.0.0',
      tenantId: 'TENANT_01',
      currentState: WorkflowState.STARTED,
      variables: new Map([['amount', 1000]]),
      metadata: {},
      history: [],
      stepExecutions: new Map(),
      loopContexts: new Map()
    };

    // Create a checkpoint
    const chk = checkpointEngine.createCheckpoint(context);
    this.assert(chk !== undefined, 'Failed to create checkpoint snapshot');

    // Mutate state
    context.variables.set('amount', 5000);
    context.currentState = WorkflowState.FAILED;

    // Trigger rollback recovery
    const recoveryOutcome = await recoveryEngine.attemptRecovery(context, 'node-failure', new Error('Fail'), {
      strategyType: 'ROLLBACK_TO_CHECKPOINT',
      checkpointId: chk.id
    });

    this.assert(recoveryOutcome.recovered === true, 'Recovery failed to execute');
    this.assert(context.variables.get('amount') === 1000, 'Rollback failed to restore pre-mutation variable');
    this.assert((context as any).currentState === WorkflowState.STARTED, 'Rollback failed to restore pre-mutation state');
  }
}
