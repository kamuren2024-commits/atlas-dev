/**
 * Loop Runtime Engine — Metrics & Telemetry
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export interface RuntimeMetrics {
  executionTimeMs: number;
  planningTimeMs: number;
  validationTimeMs: number;
  reflectionTimeMs: number;
  observationTimeMs: number;
  retryCount: number;
  failures: number;
  recoveryCount: number;
  completionRate: number;
  averageStageDuration: number;
  loopThroughput: number;
}

export class RuntimeMetricsCollector {
  private startTime: number = Date.now();
  private endTime?: number;
  private planningStart?: number;
  private planningDuration: number = 0;
  private validationStart?: number;
  private validationDuration: number = 0;
  private reflectionStart?: number;
  private reflectionDuration: number = 0;
  private observationStart?: number;
  private observationDuration: number = 0;
  private retryCount: number = 0;
  private failures: number = 0;
  private recoveryCount: number = 0;

  // Track global throughput metrics
  private static totalLoopsExecuted: number = 0;
  private static totalLoopsCompleted: number = 0;
  private static globalStartTime: number = Date.now();

  constructor() {
    RuntimeMetricsCollector.totalLoopsExecuted++;
  }

  public startStage(stage: 'planning' | 'validation' | 'reflection' | 'observation'): void {
    const now = Date.now();
    if (stage === 'planning') this.planningStart = now;
    if (stage === 'validation') this.validationStart = now;
    if (stage === 'reflection') this.reflectionStart = now;
    if (stage === 'observation') this.observationStart = now;
  }

  public endStage(stage: 'planning' | 'validation' | 'reflection' | 'observation'): void {
    const now = Date.now();
    if (stage === 'planning' && this.planningStart) {
      this.planningDuration += (now - this.planningStart);
    }
    if (stage === 'validation' && this.validationStart) {
      this.validationDuration += (now - this.validationStart);
    }
    if (stage === 'reflection' && this.reflectionStart) {
      this.reflectionDuration += (now - this.reflectionStart);
    }
    if (stage === 'observation' && this.observationStart) {
      this.observationDuration += (now - this.observationStart);
    }
  }

  public incrementRetry(): void {
    this.retryCount++;
  }

  public incrementFailure(): void {
    this.failures++;
  }

  public incrementRecovery(): void {
    this.recoveryCount++;
  }

  public completeLoop(): void {
    this.endTime = Date.now();
    RuntimeMetricsCollector.totalLoopsCompleted++;
  }

  public getMetrics(): RuntimeMetrics {
    const end = this.endTime ?? Date.now();
    const execTime = end - this.startTime;

    const stagesCount = 4;
    const totalStageTime = this.planningDuration + this.validationDuration + this.reflectionDuration + this.observationDuration;
    const avgStage = totalStageTime / (stagesCount || 1);

    const completionRate = RuntimeMetricsCollector.totalLoopsExecuted > 0
      ? (RuntimeMetricsCollector.totalLoopsCompleted / RuntimeMetricsCollector.totalLoopsExecuted) * 100
      : 0;

    const durationSeconds = (Date.now() - RuntimeMetricsCollector.globalStartTime) / 1000;
    const throughput = durationSeconds > 0
      ? RuntimeMetricsCollector.totalLoopsExecuted / durationSeconds
      : 0;

    return {
      executionTimeMs: execTime,
      planningTimeMs: this.planningDuration,
      validationTimeMs: this.validationDuration,
      reflectionTimeMs: this.reflectionDuration,
      observationTimeMs: this.observationDuration,
      retryCount: this.retryCount,
      failures: this.failures,
      recoveryCount: this.recoveryCount,
      completionRate,
      averageStageDuration: avgStage,
      loopThroughput: throughput
    };
  }
}
