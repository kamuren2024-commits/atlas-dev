/**
 * Enterprise Workflow Orchestrator (EWO) — Execution Module
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowOrchestrator } from '../orchestrator';
import { WorkflowResult } from '../types';

export class WorkflowExecutionEngine {
  private orchestrator: WorkflowOrchestrator;

  constructor() {
    this.orchestrator = new WorkflowOrchestrator();
  }

  public async runWorkflow(
    workflowId: string,
    tenantId: string,
    inputs: Record<string, any>
  ): Promise<WorkflowResult> {
    return this.orchestrator.execute(workflowId, tenantId, inputs);
  }
}
