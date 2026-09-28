/**
 * Enterprise Workflow Orchestrator (EWO) — Observability Metrics
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export interface WorkflowMetricsSummary {
  workflowId: string;
  executionId: string;
  totalDurationMs: number;
  queueTimeMs: number;
  stepsExecutedCount: number;
  failedStepsCount: number;
  retriesCount: number;
  policyViolationsCount: number;
  throughputPerSecond: number;
  stepDurations: Record<string, number>;
  dependencyWaitTimes: Record<string, number>;
}

export class WorkflowMetricsCollector {
  private static instance: WorkflowMetricsCollector;
  private registry = new Map<string, WorkflowMetricsSummary>(); // executionId -> summary

  private constructor() {}

  public static getInstance(): WorkflowMetricsCollector {
    if (!WorkflowMetricsCollector.instance) {
      WorkflowMetricsCollector.instance = new WorkflowMetricsCollector();
    }
    return WorkflowMetricsCollector.instance;
  }

  public initialize(executionId: string, workflowId: string): void {
    this.registry.set(executionId, {
      workflowId,
      executionId,
      totalDurationMs: 0,
      queueTimeMs: 0,
      stepsExecutedCount: 0,
      failedStepsCount: 0,
      retriesCount: 0,
      policyViolationsCount: 0,
      throughputPerSecond: 0,
      stepDurations: {},
      dependencyWaitTimes: {}
    });
  }

  public recordStepDuration(executionId: string, nodeId: string, durationMs: number): void {
    const summary = this.registry.get(executionId);
    if (summary) {
      summary.stepDurations[nodeId] = durationMs;
      summary.stepsExecutedCount++;
    }
  }

  public recordDependencyWaitTime(executionId: string, nodeId: string, waitTimeMs: number): void {
    const summary = this.registry.get(executionId);
    if (summary) {
      summary.dependencyWaitTimes[nodeId] = waitTimeMs;
    }
  }

  public recordFailure(executionId: string): void {
    const summary = this.registry.get(executionId);
    if (summary) {
      summary.failedStepsCount++;
    }
  }

  public recordRetry(executionId: string): void {
    const summary = this.registry.get(executionId);
    if (summary) {
      summary.retriesCount++;
    }
  }

  public recordPolicyViolation(executionId: string): void {
    const summary = this.registry.get(executionId);
    if (summary) {
      summary.policyViolationsCount++;
    }
  }

  public recordQueueTime(executionId: string, queueTimeMs: number): void {
    const summary = this.registry.get(executionId);
    if (summary) {
      summary.queueTimeMs = queueTimeMs;
    }
  }

  public finalize(executionId: string, totalDurationMs: number): WorkflowMetricsSummary | undefined {
    const summary = this.registry.get(executionId);
    if (summary) {
      summary.totalDurationMs = totalDurationMs;
      summary.throughputPerSecond = summary.stepsExecutedCount > 0 
        ? parseFloat(((summary.stepsExecutedCount / (totalDurationMs / 1000)) || 0).toFixed(2))
        : 0;
    }
    return summary;
  }

  public getSummary(executionId: string): WorkflowMetricsSummary | undefined {
    return this.registry.get(executionId);
  }

  public listSummaries(): WorkflowMetricsSummary[] {
    return Array.from(this.registry.values());
  }

  public clear(): void {
    this.registry.clear();
  }
}
