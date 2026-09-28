/**
 * Enterprise Agent Framework (EAF) — Context Manager
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { AgentContext, AgentPermission } from '../types';
import { WorkflowExecutionContext } from '../../workflow/types';
import { LoopExecutionContext } from '../../loop/runtime/context';
import { generateCorrelationId } from '../../shared/crypto';

export class AgentContextManager {
  public static createContext(params: {
    agentId: string;
    version: string;
    tenantId: string;
    correlationId?: string;
    workflowContext?: WorkflowExecutionContext;
    loopContext?: LoopExecutionContext;
    permissions?: AgentPermission[];
    securityContext?: { userId?: string; roles?: string[] };
  }): AgentContext {
    return {
      agentId: params.agentId,
      version: params.version,
      tenantId: params.tenantId,
      correlationId: params.correlationId || generateCorrelationId(),
      workflowContext: params.workflowContext,
      loopContext: params.loopContext,
      metadata: {},
      memoryReferences: [],
      knowledgeReferences: [],
      securityContext: params.securityContext,
      permissions: params.permissions || []
    };
  }
}
