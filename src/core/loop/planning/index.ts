import { IPlanner } from '../contracts';
import { LoopContext } from '../types';

export class SequentialPlanner implements IPlanner {
  async plan(context: LoopContext): Promise<{ steps: string[]; estimatedDurationMs: number }> {
    const defaultSteps = [
      'Ingest procurement entity context & history',
      'Verify legal compliance bounds',
      'Analyze pricing & delivery risk profile',
      'Generate explainable recommendations',
      'Audit against PPADA 2015 limits'
    ];
    return {
      steps: defaultSteps,
      estimatedDurationMs: defaultSteps.length * 400
    };
  }
}

export class GoalDecompositionPlanner implements IPlanner {
  async plan(context: LoopContext): Promise<{ steps: string[]; estimatedDurationMs: number }> {
    const goal = context.metadata.goal || 'Evaluate risk in procurement';
    const steps = [
      `Analyze objective: ${goal}`,
      'Retrieve recent audit findings and supply chain constraints',
      'Evaluate supplier track record and premium volatility factors',
      'Draft corrective action and notify decision engine'
    ];
    return {
      steps,
      estimatedDurationMs: steps.length * 500
    };
  }
}
