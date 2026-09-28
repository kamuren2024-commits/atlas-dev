import { LoopContext, LoopResult, LoopState } from '../types';

export interface ILoop {
  run(context: LoopContext): Promise<LoopResult>;
}

export interface IObserver {
  observe(context: LoopContext): Promise<Partial<LoopContext>>;
}

export interface IPlanner {
  plan(context: LoopContext): Promise<{ steps: string[]; estimatedDurationMs: number }>;
}

export interface IExecutor {
  execute(context: LoopContext, plan: { steps: string[] }): Promise<any>;
}

export interface IValidator {
  validate(context: LoopContext, executionResult: any): Promise<{ isValid: boolean; violations: string[]; complianceScore: number }>;
}

export interface IReflectionEngine {
  reflect(context: LoopContext, result: any, validationResult: any): Promise<{ critique: string; proposedImprovements: string[]; confidenceDelta: number }>;
}

export interface IMemoryProvider {
  recall(context: LoopContext, query: string): Promise<string[]>;
  persist(context: LoopContext, content: string): Promise<void>;
}
