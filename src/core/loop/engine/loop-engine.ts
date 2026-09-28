import { ILoop, IObserver, IPlanner, IExecutor, IValidator, IReflectionEngine, IMemoryProvider } from '../contracts';
import { LoopContext, LoopResult, LoopState } from '../types';
import { LoopStateMachine } from '../states/state-machine';
import { LoopEventSystem } from '../events/event-system';
import { LoopTelemetry } from '../utils/observability';
import { TerminationControls } from '../termination';
import { generateHash } from '../../shared/crypto';

export class StandardLoopEngine implements ILoop {
  constructor(
    private observer: IObserver,
    private planner: IPlanner,
    private executor: IExecutor,
    private validator: IValidator,
    private reflectionEngine: IReflectionEngine,
    private memoryProvider?: IMemoryProvider
  ) {}

  public static createDefaultContext(tenantId = 'default-tenant', parentWorkflowId?: string, initialMetadata: Record<string, any> = {}): LoopContext {
    const now = Date.now();
    return {
      loopId: LoopTelemetry.generateId('loop'),
      executionId: LoopTelemetry.generateId('exec'),
      parentWorkflowId,
      tenantId,
      state: LoopState.CREATED,
      startTime: now,
      lastUpdateTime: now,
      duration: 0,
      metadata: initialMetadata,
      workingMemory: [],
      sessionMemory: {},
      errors: [],
      metrics: {}
    };
  }

  public async run(context: LoopContext): Promise<LoopResult> {
    const initialDuration = Date.now() - context.startTime;
    try {
      // 1. Created -> Observe
      LoopStateMachine.validateTransition(context.state, LoopState.OBSERVING);
      LoopTelemetry.logTransition(context, context.state, LoopState.OBSERVING);
      await LoopEventSystem.publish('LoopStarted', context.loopId, context.executionId, context, { startTime: context.startTime });

      TerminationControls.checkSafety(context);
      const observationResult = await this.observer.observe(context);
      Object.assign(context, observationResult);
      await LoopEventSystem.publish('ObservationCompleted', context.loopId, context.executionId, context, { observationResult });

      // 2. Observe -> Plan
      LoopStateMachine.validateTransition(context.state, LoopState.PLANNING);
      LoopTelemetry.logTransition(context, context.state, LoopState.PLANNING);
      TerminationControls.checkSafety(context);
      const planResult = await this.planner.plan(context);
      context.workingMemory.push(...planResult.steps.map(s => `[PLANNED]: ${s}`));
      await LoopEventSystem.publish('PlanGenerated', context.loopId, context.executionId, context, { planResult });

      // 3. Plan -> Execute
      LoopStateMachine.validateTransition(context.state, LoopState.EXECUTING);
      LoopTelemetry.logTransition(context, context.state, LoopState.EXECUTING);
      TerminationControls.checkSafety(context);
      const executionResult = await this.executor.execute(context, planResult);
      await LoopEventSystem.publish('ExecutionCompleted', context.loopId, context.executionId, context, { executionResult });

      // 4. Execute -> Verify
      LoopStateMachine.validateTransition(context.state, LoopState.VERIFYING);
      LoopTelemetry.logTransition(context, context.state, LoopState.VERIFYING);
      TerminationControls.checkSafety(context);
      const validationResult = await this.validator.validate(context, executionResult);
      await LoopEventSystem.publish('ValidationCompleted', context.loopId, context.executionId, context, { validationResult });

      // 5. Verify -> Reflect
      LoopStateMachine.validateTransition(context.state, LoopState.REFLECTING);
      LoopTelemetry.logTransition(context, context.state, LoopState.REFLECTING);
      TerminationControls.checkSafety(context);
      const reflectionResult = await this.reflectionEngine.reflect(context, executionResult, validationResult);
      context.metrics.auditConfidence = (context.metrics.auditConfidence || 0.8) + reflectionResult.confidenceDelta;
      await LoopEventSystem.publish('ReflectionCompleted', context.loopId, context.executionId, context, { reflectionResult });

      // 6. Reflect -> Complete
      LoopStateMachine.validateTransition(context.state, LoopState.COMPLETED);
      LoopTelemetry.logTransition(context, context.state, LoopState.COMPLETED);

      const finalDuration = Date.now() - context.startTime;
      const result: LoopResult = {
        loopId: context.loopId,
        executionId: context.executionId,
        success: validationResult.isValid,
        finalState: LoopState.COMPLETED,
        output: {
          execution: executionResult,
          validation: validationResult,
          reflection: reflectionResult
        },
        duration: finalDuration,
        metrics: context.metrics,
        auditTrailHash: `SHA256_${generateHash('completed-' + Date.now()).substring(0, 16)}_COMPLETED`
      };

      await LoopEventSystem.publish('LoopCompleted', context.loopId, context.executionId, context, result);
      return result;

    } catch (err: any) {
      context.state = LoopState.FAILED;
      context.errors.push({
        timestamp: Date.now(),
        message: err.message || String(err),
        stage: context.state
      });

      const finalDuration = Date.now() - context.startTime;
      const result: LoopResult = {
        loopId: context.loopId,
        executionId: context.executionId,
        success: false,
        finalState: LoopState.FAILED,
        output: { error: err.message || String(err) },
        duration: finalDuration,
        metrics: context.metrics,
        auditTrailHash: `SHA256_${generateHash('failed-' + Date.now()).substring(0, 16)}_FAILED`
      };

      await LoopEventSystem.publish('LoopFailed', context.loopId, context.executionId, context, result);
      return result;
    }
  }
}
