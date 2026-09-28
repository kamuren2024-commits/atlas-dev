import { StandardLoopEngine } from '../engine/loop-engine';
import { LoopContext, LoopState, LoopResult } from '../types';
import { LoopStateMachine } from '../states/state-machine';
import { IObserver, IPlanner, IExecutor, IValidator, IReflectionEngine } from '../contracts';
import { TerminationControls } from '../termination';

// 1. Mock implementations for loop testing
class MockObserver implements IObserver {
  async observe(context: LoopContext): Promise<Partial<LoopContext>> {
    return {
      sessionMemory: { observed: true }
    };
  }
}

class MockPlanner implements IPlanner {
  async plan(context: LoopContext): Promise<{ steps: string[]; estimatedDurationMs: number }> {
    return {
      steps: ['Step 1', 'Step 2'],
      estimatedDurationMs: 100
    };
  }
}

class MockExecutor implements IExecutor {
  async execute(context: LoopContext, plan: { steps: string[] }): Promise<any> {
    return { executed: true, amount: context.metadata.amount || 1000 };
  }
}

class MockValidator implements IValidator {
  async validate(context: LoopContext, executionResult: any): Promise<{ isValid: boolean; violations: string[]; complianceScore: number }> {
    const isValid = executionResult.amount < 5000000;
    return {
      isValid,
      violations: isValid ? [] : ['Limit exceeded'],
      complianceScore: isValid ? 1.0 : 0.2
    };
  }
}

class MockReflection implements IReflectionEngine {
  async reflect(context: LoopContext, result: any, validationResult: any): Promise<{ critique: string; proposedImprovements: string[]; confidenceDelta: number }> {
    return {
      critique: 'Looks good',
      proposedImprovements: [],
      confidenceDelta: 0.05
    };
  }
}

export class LoopFrameworkTestRunner {
  public static async runAllTests(): Promise<{ success: boolean; results: Record<string, string> }> {
    const results: Record<string, string> = {};
    let allPassed = true;

    // Test 1: State transitions
    try {
      LoopStateMachine.validateTransition(LoopState.CREATED, LoopState.OBSERVING);
      try {
        LoopStateMachine.validateTransition(LoopState.CREATED, LoopState.COMPLETED);
        results['State Transition Invalid Case'] = 'FAILED (Allowed invalid transition)';
        allPassed = false;
      } catch {
        results['State Transition Invalid Case'] = 'PASSED';
      }
      results['State Transition Valid Case'] = 'PASSED';
    } catch (err: any) {
      results['State Transition Valid Case'] = `FAILED: ${err.message}`;
      allPassed = false;
    }

    // Test 2: Lifecycle execution success
    try {
      const engine = new StandardLoopEngine(
        new MockObserver(),
        new MockPlanner(),
        new MockExecutor(),
        new MockValidator(),
        new MockReflection()
      );
      const ctx = StandardLoopEngine.createDefaultContext('test-tenant', undefined, { amount: 100000 });
      const res = await engine.run(ctx);
      
      if (res.success && res.finalState === LoopState.COMPLETED) {
        results['Lifecycle Execution Success'] = 'PASSED';
      } else {
        results['Lifecycle Execution Success'] = `FAILED: status=${res.finalState}, success=${res.success}`;
        allPassed = false;
      }
    } catch (err: any) {
      results['Lifecycle Execution Success'] = `FAILED: ${err.message}`;
      allPassed = false;
    }

    // Test 3: Lifecycle validation failure trigger
    try {
      const engine = new StandardLoopEngine(
        new MockObserver(),
        new MockPlanner(),
        new MockExecutor(),
        new MockValidator(),
        new MockReflection()
      );
      const ctx = StandardLoopEngine.createDefaultContext('test-tenant', undefined, { amount: 6000000 });
      const res = await engine.run(ctx);
      
      if (!res.success && res.finalState === LoopState.COMPLETED) {
        results['Lifecycle Compliance Limit Rejection'] = 'PASSED';
      } else {
        results['Lifecycle Compliance Limit Rejection'] = `FAILED: status=${res.finalState}, success=${res.success}`;
        allPassed = false;
      }
    } catch (err: any) {
      results['Lifecycle Compliance Limit Rejection'] = `FAILED: ${err.message}`;
      allPassed = false;
    }

    // Test 4: Cancellation and Kill switch safety bounds
    try {
      TerminationControls.resetKillSwitch();
      const ctx = StandardLoopEngine.createDefaultContext('test-tenant');
      TerminationControls.checkSafety(ctx);
      
      TerminationControls.activateKillSwitch();
      try {
        TerminationControls.checkSafety(ctx);
        results['Kill Switch Safety Guard'] = 'FAILED (Allowed execution)';
        allPassed = false;
      } catch {
        results['Kill Switch Safety Guard'] = 'PASSED';
      }
      TerminationControls.resetKillSwitch();
    } catch (err: any) {
      results['Kill Switch Safety Guard'] = `FAILED: ${err.message}`;
      allPassed = false;
    }

    // Test 5: Timeout handling bounds
    try {
      const ctx = StandardLoopEngine.createDefaultContext('test-tenant', undefined, { timeoutMs: -10 });
      try {
        TerminationControls.checkSafety(ctx);
        results['Timeout Detection Guard'] = 'FAILED (Allowed expired execution)';
        allPassed = false;
      } catch {
        results['Timeout Detection Guard'] = 'PASSED';
      }
    } catch (err: any) {
      results['Timeout Detection Guard'] = `FAILED: ${err.message}`;
      allPassed = false;
    }

    return { success: allPassed, results };
  }
}
export default LoopFrameworkTestRunner;
