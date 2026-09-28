/**
 * Enterprise Workflow Orchestrator (EWO) — Stable Architecture Contracts
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import {
  WorkflowState,
  WorkflowMetadata,
  WorkflowDependency,
  WorkflowPolicy,
  WorkflowNode,
  WorkflowDefinition,
  WorkflowStepExecution,
  WorkflowExecutionContext,
  WorkflowResult,
  WorkflowCheckpoint,
  WorkflowAdapter
} from '../types';

export interface IWorkflow {
  id: string;
  definition: WorkflowDefinition;
  execute: (tenantId: string, input: Record<string, any>) => Promise<WorkflowResult>;
}

export interface IWorkflowRegistry {
  register(definition: WorkflowDefinition): void;
  get(id: string, version?: string): WorkflowDefinition | undefined;
  list(): WorkflowDefinition[];
  deregister(id: string): boolean;
}

export interface IWorkflowBuilder {
  setId(id: string): this;
  setName(name: string): this;
  setDescription(description: string): this;
  setVersion(version: string): this;
  addNode(node: WorkflowNode): this;
  setGlobalPolicy(policy: WorkflowPolicy): this;
  build(): WorkflowDefinition;
}

export interface IWorkflowOrchestrator {
  execute(
    workflowId: string,
    tenantId: string,
    inputs: Record<string, any>,
    options?: {
      parentWorkflowId?: string;
      parentAgentId?: string;
      securityContext?: { userId?: string; roles?: string[] };
    }
  ): Promise<WorkflowResult>;
}

export interface IWorkflowGraphEngine {
  validateDAG(definition: WorkflowDefinition): boolean;
  resolveExecutionOrder(definition: WorkflowDefinition): string[][];
}

export interface IWorkflowCheckpointEngine {
  createCheckpoint(context: WorkflowExecutionContext): WorkflowCheckpoint;
  restoreCheckpoint(checkpoint: WorkflowCheckpoint, context: WorkflowExecutionContext): void;
}
