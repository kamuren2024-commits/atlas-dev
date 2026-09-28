/**
 * Enterprise Agent Framework (EAF) — Types and Domain Models
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { WorkflowExecutionContext } from '../../workflow/types';
import { LoopExecutionContext } from '../../loop/runtime/context';

export enum AgentState {
  REGISTERED = 'REGISTERED',
  INITIALIZING = 'INITIALIZING',
  READY = 'READY',
  EXECUTING = 'EXECUTING',
  PAUSED = 'PAUSED',
  WAITING = 'WAITING',
  COMPLETED = 'COMPLETED',
  STOPPED = 'STOPPED',
  RETRY = 'RETRY',
  FAILED = 'FAILED',
  DISABLED = 'DISABLED',
  RECOVERED = 'RECOVERED'
}

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author?: string;
  tags?: string[];
}

export type AgentCapabilityType =
  | 'PLANNING'
  | 'ANALYSIS'
  | 'RETRIEVAL'
  | 'VALIDATION'
  | 'GENERATION'
  | 'REFLECTION'
  | 'MONITORING'
  | 'NOTIFICATION'
  | 'COMPLIANCE'
  | 'REPORTING';

export interface AgentCapability {
  type: AgentCapabilityType;
  name: string;
  description: string;
  execute: (input: any, context: any) => Promise<any> | any;
}

export interface AgentPolicy {
  retryMaxAttempts?: number;
  timeoutMs?: number;
  approvalRequired?: boolean;
  maxExecutionLimit?: number;
  riskThreshold?: number;
}

export type AgentPermissionType =
  | 'READ'
  | 'WRITE'
  | 'EXECUTE'
  | 'DISCOVER'
  | 'DELEGATE'
  | 'OBSERVE'
  | 'MANAGE';

export interface AgentPermission {
  type: AgentPermissionType;
  resource: string;
  authorized: boolean;
}

export interface AgentConfiguration {
  metadata: AgentMetadata;
  capabilities: AgentCapabilityType[];
  policies: AgentPolicy;
  permissions: AgentPermission[];
  customSettings?: Record<string, any>;
}

export interface AgentHealth {
  status: 'HEALTHY' | 'UNHEALTHY' | 'DEGRADED';
  availability: number; // Percentage: 0 - 100
  executionCount: number;
  successRate: number; // 0 - 1
  failureRate: number; // 0 - 1
  averageLatencyMs: number;
  memoryUsageBytes?: number;
  lastExecutionTime?: number;
  errorCount: number;
}

export interface AgentTelemetry {
  executionId: string;
  agentId: string;
  startTime: number;
  endTime?: number;
  latencyMs?: number;
  success: boolean;
  correlationId: string;
  workflowExecutionId?: string;
  loopExecutionId?: string;
  error?: string;
}

export interface AgentContext {
  agentId: string;
  version: string;
  tenantId: string;
  workflowContext?: WorkflowExecutionContext;
  loopContext?: LoopExecutionContext;
  metadata: Record<string, any>;
  correlationId: string;
  memoryReferences: string[];
  knowledgeReferences: string[];
  securityContext?: {
    userId?: string;
    roles?: string[];
  };
  permissions: AgentPermission[];
}

export interface AgentResult {
  agentId: string;
  executionId: string;
  success: boolean;
  outputs: Record<string, any>;
  error?: any;
  latencyMs: number;
  telemetry: AgentTelemetry;
}
