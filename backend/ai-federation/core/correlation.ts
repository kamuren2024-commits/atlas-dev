// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — REQUEST CORRELATION
// Propagates correlation context through API → Service → Agent → Federation → Provider
// ============================================================================

import { randomUUID } from 'crypto';

export interface CorrelationContext {
  requestId: string;
  traceId: string;
  spanId?: string;
  missionId?: string;
  workflowId?: string;
  agentId?: string;
  userId?: string;
  parentId?: string;
  timestamp: string;
}

/**
 * Creates a new correlation context for an AI request.
 * Every request gets a unique requestId and traceId that flow through the entire pipeline.
 */
export function createCorrelationContext(overrides?: Partial<CorrelationContext>): CorrelationContext {
  return {
    requestId: overrides?.requestId || `req-${randomUUID()}`,
    traceId: overrides?.traceId || `trc-${randomUUID()}`,
    spanId: overrides?.spanId || `spn-${randomUUID().replace(/-/g, '').substring(0, 12)}`,
    missionId: overrides?.missionId,
    workflowId: overrides?.workflowId,
    agentId: overrides?.agentId,
    userId: overrides?.userId,
    parentId: overrides?.parentId,
    timestamp: overrides?.timestamp || new Date().toISOString(),
  };
}

/**
 * Child span — creates a child correlation context from a parent.
 */
export function createChildSpan(parent: CorrelationContext, agentId?: string): CorrelationContext {
  return {
    requestId: parent.requestId, // Same request ID
    traceId: parent.traceId,     // Same trace ID
    spanId: `spn-${randomUUID().replace(/-/g, '').substring(0, 12)}`,
    missionId: parent.missionId,
    workflowId: parent.workflowId,
    agentId: agentId || parent.agentId,
    userId: parent.userId,
    parentId: parent.spanId,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Extracts correlation context from Express request headers.
 * Supports both standard and custom header formats.
 */
export function extractCorrelationFromHeaders(headers: Record<string, string | string[] | undefined>): Partial<CorrelationContext> {
  const get = (key: string) => {
    const val = headers[key];
    return typeof val === 'string' ? val : Array.isArray(val) ? val[0] : undefined;
  };

  return {
    requestId: get('x-request-id') || get('x-correlation-id') || undefined,
    traceId: get('x-trace-id') || undefined,
    missionId: get('x-mission-id') || undefined,
    workflowId: get('x-workflow-id') || undefined,
    agentId: get('x-agent-id') || undefined,
    userId: get('x-user-id') || undefined,
  };
}

/**
 * Converts correlation context to Express response headers.
 */
export function correlationToHeaders(ctx: CorrelationContext): Record<string, string> {
  const headers: Record<string, string> = {
    'x-request-id': ctx.requestId,
    'x-trace-id': ctx.traceId,
  };
  if (ctx.spanId) headers['x-span-id'] = ctx.spanId;
  if (ctx.missionId) headers['x-mission-id'] = ctx.missionId;
  if (ctx.workflowId) headers['x-workflow-id'] = ctx.workflowId;
  return headers;
}
