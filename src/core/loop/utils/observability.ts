import { LoopContext, LoopState } from '../types';
import { randomUUID } from 'crypto';

export class LoopTelemetry {
  private static traces: Array<{
    loopId: string;
    executionId: string;
    timestamp: number;
    stateFrom: LoopState;
    stateTo: LoopState;
    duration: number;
    parentWorkflowId?: string;
  }> = [];

  public static generateId(prefix = 'loop'): string {
    return `${prefix}-${randomUUID().replace(/-/g, '').substring(0, 12)}`;
  }

  public static logTransition(context: LoopContext, from: LoopState, to: LoopState): void {
    const now = Date.now();
    const stepDuration = now - context.lastUpdateTime;
    context.state = to;
    context.lastUpdateTime = now;
    context.duration = now - context.startTime;

    this.traces.push({
      loopId: context.loopId,
      executionId: context.executionId,
      timestamp: now,
      stateFrom: from,
      stateTo: to,
      duration: stepDuration,
      parentWorkflowId: context.parentWorkflowId
    });

    console.log(`[LOOP-TELEMETRY] TraceId: ${context.loopId} | ExecId: ${context.executionId} | Transition: [${from}] -> [${to}] | StepTime: ${stepDuration}ms | TotalTime: ${context.duration}ms`);
  }

  public static getTraces() {
    return this.traces;
  }
}
