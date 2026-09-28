/**
 * Loop Runtime Engine — Immutable Execution History
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { RuntimeState } from '../context';

export interface HistoryRecord {
  timestamp: number;
  fromState?: RuntimeState;
  toState: RuntimeState;
  eventTriggered?: string;
  durationMs: number;
  retryAttempt: number;
  validationResult?: any;
  reflectionSummary?: string;
  errorPayload?: any;
}

export class HistoryManager {
  private records = new Map<string, HistoryRecord[]>();
  private stateTimestamps = new Map<string, number>();

  public recordTransition(
    executionId: string,
    fromState: RuntimeState | undefined,
    toState: RuntimeState,
    params: {
      eventTriggered?: string;
      retryAttempt: number;
      validationResult?: any;
      reflectionSummary?: string;
      errorPayload?: any;
    }
  ): void {
    const now = Date.now();
    const lastTimestamp = this.stateTimestamps.get(executionId) || now;
    const durationMs = now - lastTimestamp;
    this.stateTimestamps.set(executionId, now);

    const record: HistoryRecord = {
      timestamp: now,
      fromState,
      toState,
      eventTriggered: params.eventTriggered,
      durationMs,
      retryAttempt: params.retryAttempt,
      validationResult: params.validationResult,
      reflectionSummary: params.reflectionSummary,
      errorPayload: params.errorPayload ? this.safeSerialize(params.errorPayload) : undefined
    };

    const currentHistory = this.records.get(executionId) || [];
    currentHistory.push(record);
    this.records.set(executionId, currentHistory);
  }

  public getHistory(executionId: string): HistoryRecord[] {
    return this.records.get(executionId) || [];
  }

  public clearHistory(executionId: string): void {
    this.records.delete(executionId);
    this.stateTimestamps.delete(executionId);
  }

  private safeSerialize(val: any): any {
    try {
      if (val instanceof Error) {
        return { message: val.message, name: val.name, stack: val.stack };
      }
      return JSON.parse(JSON.stringify(val));
    } catch {
      return { message: String(val) };
    }
  }
}
