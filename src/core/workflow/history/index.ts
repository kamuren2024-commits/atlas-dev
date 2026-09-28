/**
 * Enterprise Workflow Orchestrator (EWO) — History and Audit Manager
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowState, WorkflowStepExecution } from '../types';

export interface WorkflowHistoryRecord {
  executionId: string;
  workflowId: string;
  version: string;
  tenantId: string;
  startTime: number;
  endTime?: number;
  transitions: Array<{
    timestamp: number;
    fromState?: WorkflowState;
    toState: WorkflowState;
    details?: string;
  }>;
  stepExecutions: Record<string, WorkflowStepExecution>;
  loopExecutionReferences: string[]; // Linked Loop Runtime executionIds
  validationOutcomes: Array<{
    timestamp: number;
    rule: string;
    passed: boolean;
    reason?: string;
  }>;
  reflectionSummaries: string[];
}

export class WorkflowHistoryManager {
  private static instance: WorkflowHistoryManager;
  private records = new Map<string, WorkflowHistoryRecord>(); // executionId -> record

  private constructor() {}

  public static getInstance(): WorkflowHistoryManager {
    if (!WorkflowHistoryManager.instance) {
      WorkflowHistoryManager.instance = new WorkflowHistoryManager();
    }
    return WorkflowHistoryManager.instance;
  }

  public createRecord(executionId: string, workflowId: string, version: string, tenantId: string): WorkflowHistoryRecord {
    const record: WorkflowHistoryRecord = {
      executionId,
      workflowId,
      version,
      tenantId,
      startTime: Date.now(),
      transitions: [],
      stepExecutions: {},
      loopExecutionReferences: [],
      validationOutcomes: [],
      reflectionSummaries: []
    };
    this.records.set(executionId, record);
    return record;
  }

  public getRecord(executionId: string): WorkflowHistoryRecord | undefined {
    return this.records.get(executionId);
  }

  public recordTransition(executionId: string, fromState: WorkflowState | undefined, toState: WorkflowState, details?: string): void {
    const record = this.records.get(executionId);
    if (record) {
      record.transitions.push({
        timestamp: Date.now(),
        fromState,
        toState,
        details
      });
    }
  }

  public recordStepExecution(executionId: string, stepExecution: WorkflowStepExecution): void {
    const record = this.records.get(executionId);
    if (record) {
      record.stepExecutions[stepExecution.nodeId] = { ...stepExecution };
    }
  }

  public linkLoopExecution(executionId: string, loopExecutionId: string): void {
    const record = this.records.get(executionId);
    if (record) {
      record.loopExecutionReferences.push(loopExecutionId);
    }
  }

  public recordValidationOutcome(executionId: string, rule: string, passed: boolean, reason?: string): void {
    const record = this.records.get(executionId);
    if (record) {
      record.validationOutcomes.push({
        timestamp: Date.now(),
        rule,
        passed,
        reason
      });
    }
  }

  public addReflectionSummary(executionId: string, summary: string): void {
    const record = this.records.get(executionId);
    if (record) {
      record.reflectionSummaries.push(summary);
    }
  }

  public completeRecord(executionId: string): void {
    const record = this.records.get(executionId);
    if (record) {
      record.endTime = Date.now();
    }
  }

  public listRecords(): WorkflowHistoryRecord[] {
    return Array.from(this.records.values());
  }

  public clear(): void {
    this.records.clear();
  }
}
