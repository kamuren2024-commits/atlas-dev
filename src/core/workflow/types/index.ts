/**
 * Enterprise Workflow Orchestrator (EWO) — Types and Domain Contracts
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { LoopExecutionContext } from '../../loop/runtime/context';

export enum WorkflowState {
  REGISTERED = 'REGISTERED',
  STARTED = 'STARTED',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface WorkflowMetadata {
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
}

export interface WorkflowDependency {
  nodeId: string;
  type: 'SEQUENTIAL' | 'CONDITIONAL' | 'FAIL_FAST';
  condition?: (context: WorkflowExecutionContext) => boolean | Promise<boolean>;
}

export interface WorkflowPolicy {
  retryPolicy?: {
    strategy: 'FIXED' | 'LINEAR' | 'EXPONENTIAL' | 'EXPONENTIAL_JITTER';
    maxAttempts: number;
    baseDelayMs: number;
    maxDelayMs: number;
  };
  timeoutMs?: number;
  approvalRequired?: boolean;
  validationRules?: string[];
  riskThreshold?: number;
}

export interface WorkflowNode {
  id: string;
  name: string;
  type: 'STEP' | 'DECISION' | 'LOOP' | 'ADAPTER';
  dependencies: WorkflowDependency[];
  action: (context: WorkflowExecutionContext) => Promise<any> | any;
  policy?: WorkflowPolicy;
}

export interface WorkflowDefinition {
  id: string;
  metadata: WorkflowMetadata;
  nodes: WorkflowNode[];
  globalPolicy?: WorkflowPolicy;
}

export interface WorkflowStepExecution {
  nodeId: string;
  state: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  startTime?: number;
  endTime?: number;
  durationMs?: number;
  output?: any;
  error?: any;
}

export interface WorkflowExecutionContext {
  workflowId: string;
  executionId: string;
  version: string;
  tenantId: string;
  parentWorkflowId?: string;
  parentAgentId?: string;
  currentState: WorkflowState;
  variables: Map<string, any>;
  metadata: Record<string, any>;
  history: Array<{
    timestamp: number;
    fromState?: WorkflowState;
    toState: WorkflowState;
    details?: string;
  }>;
  stepExecutions: Map<string, WorkflowStepExecution>;
  loopContexts: Map<string, LoopExecutionContext>;
  securityContext?: {
    userId?: string;
    roles?: string[];
    authorizedScope?: string[];
  };
}

export interface WorkflowResult {
  workflowId: string;
  executionId: string;
  success: boolean;
  finalState: WorkflowState;
  outputs: Record<string, any>;
  error?: any;
  durationMs: number;
  metrics: {
    totalDurationMs: number;
    stepsExecutedCount: number;
    failedStepsCount: number;
    retriesCount: number;
  };
}

export interface WorkflowCheckpoint {
  id: string;
  timestamp: number;
  executionId: string;
  currentState: WorkflowState;
  variables: Record<string, any>;
  stepExecutions: Record<string, WorkflowStepExecution>;
}

export interface WorkflowAdapter {
  moduleName: string;
  supportedActions: string[];
  executeAction: (action: string, params: any, context: WorkflowExecutionContext) => Promise<any>;
}
