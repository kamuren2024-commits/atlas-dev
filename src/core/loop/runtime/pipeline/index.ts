/**
 * Loop Runtime Engine — Composable Pipeline and Middleware
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { LoopExecutionContext, RuntimeState } from '../context';

export interface PipelineMiddleware {
  beforePipeline?: (context: LoopExecutionContext) => Promise<void> | void;
  beforeStage?: (context: LoopExecutionContext, stage: RuntimeState) => Promise<void> | void;
  afterStage?: (context: LoopExecutionContext, stage: RuntimeState, stageResult: any) => Promise<void> | void;
  afterPipeline?: (context: LoopExecutionContext, finalResult: any) => Promise<void> | void;
  onError?: (context: LoopExecutionContext, error: any) => Promise<void> | void;
  onRetry?: (context: LoopExecutionContext, attempt: number, error: any) => Promise<void> | void;
  onCancellation?: (context: LoopExecutionContext, reason: string) => Promise<void> | void;
}

export interface PipelineStage {
  state: RuntimeState;
  execute: (context: LoopExecutionContext) => Promise<any> | any;
}

export class LoopPipeline {
  private middlewares: PipelineMiddleware[] = [];
  private stages: PipelineStage[] = [];

  public use(middleware: PipelineMiddleware): this {
    this.middlewares.push(middleware);
    return this;
  }

  public registerStage(stage: PipelineStage): this {
    this.stages.push(stage);
    return this;
  }

  public getStages(): PipelineStage[] {
    return this.stages;
  }

  public async runBeforePipeline(context: LoopExecutionContext): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.beforePipeline) {
        await Promise.resolve(mw.beforePipeline(context));
      }
    }
  }

  public async runBeforeStage(context: LoopExecutionContext, stage: RuntimeState): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.beforeStage) {
        await Promise.resolve(mw.beforeStage(context, stage));
      }
    }
  }

  public async runAfterStage(context: LoopExecutionContext, stage: RuntimeState, result: any): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.afterStage) {
        await Promise.resolve(mw.afterStage(context, stage, result));
      }
    }
  }

  public async runAfterPipeline(context: LoopExecutionContext, finalResult: any): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.afterPipeline) {
        await Promise.resolve(mw.afterPipeline(context, finalResult));
      }
    }
  }

  public async runOnError(context: LoopExecutionContext, error: any): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.onError) {
        await Promise.resolve(mw.onError(context, error));
      }
    }
  }

  public async runOnRetry(context: LoopExecutionContext, attempt: number, error: any): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.onRetry) {
        await Promise.resolve(mw.onRetry(context, attempt, error));
      }
    }
  }

  public async runOnCancellation(context: LoopExecutionContext, reason: string): Promise<void> {
    for (const mw of this.middlewares) {
      if (mw.onCancellation) {
        await Promise.resolve(mw.onCancellation(context, reason));
      }
    }
  }
}
