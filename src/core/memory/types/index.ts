/**
 * Enterprise Memory Fabric (EMF) — Domain Types & Schemas
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

export enum MemoryLifecycleState {
  CREATED = 'CREATED',
  INDEXED = 'INDEXED',
  ACTIVE = 'ACTIVE',
  REFERENCED = 'REFERENCED',
  ARCHIVED = 'ARCHIVED',
  RESTORED = 'RESTORED',
  DELETED = 'DELETED'
}

export type MemoryType =
  | 'WORKING'
  | 'SESSION'
  | 'WORKFLOW'
  | 'AGENT'
  | 'SHARED'
  | 'ORGANIZATION'
  | 'LONG_TERM';

export interface MemoryContext {
  tenantId: string;
  workflowId?: string;
  workflowExecutionId?: string;
  agentId?: string;
  loopId?: string;
  correlationId: string;
  securityContext?: {
    userId?: string;
    roles?: string[];
  };
  permissions?: {
    resource: string;
    action: 'READ' | 'WRITE' | 'MANAGE';
    authorized: boolean;
  }[];
  metadata?: Record<string, any>;
  tags?: string[];
  references?: string[];
  snapshotId?: string;
}

export interface MemoryEntry {
  id: string;
  type: MemoryType;
  key: string;
  value: any;
  context: MemoryContext;
  state: MemoryLifecycleState;
  version: number;
  hash: string;
  createdAt: number;
  updatedAt: number;
  expiresAt?: number;
}

export interface MemoryVersion {
  version: number;
  entry: MemoryEntry;
  timestamp: number;
  author?: string;
  details?: string;
}

export interface MemorySnapshot {
  id: string;
  timestamp: number;
  tenantId: string;
  memoryType: MemoryType;
  entries: MemoryEntry[];
  metadata?: Record<string, any>;
}

export interface MemoryIndex {
  id: string;
  entryId: string;
  key: string;
  type: MemoryType;
  tags: string[];
  namespaces: string[];
  correlationId: string;
  workflowExecutionId?: string;
  agentId?: string;
  tenantId: string;
  createdAt: number;
}

export interface MemoryQuery {
  exactKey?: string;
  type?: MemoryType;
  tenantId?: string;
  agentId?: string;
  workflowExecutionId?: string;
  correlationId?: string;
  namespaces?: string[];
  tags?: string[];
  timeRange?: {
    start: number;
    end: number;
  };
  metaFilters?: Record<string, any>;
}

export interface MemorySearchResult {
  entries: MemoryEntry[];
  indices: MemoryIndex[];
  latencyMs: number;
  query: MemoryQuery;
}

export interface MemoryPolicy {
  retentionMs?: number;
  classification: 'PUBLIC' | 'INTERNAL' | 'RESTRICTED' | 'CONFIDENTIAL';
  encryptionRequired?: boolean;
  approvalRequiredForDelete?: boolean;
  approvalRequiredForWrite?: boolean;
  maxMemorySizeCount?: number;
}

export interface MemoryMetrics {
  memoryCount: number;
  retrievalLatencyAverageMs: number;
  searchLatencyAverageMs: number;
  snapshotCount: number;
  versionCount: number;
  referenceCount: number;
  cacheHitRatio: number;
  lifecycleTransitionsCount: Record<MemoryLifecycleState, number>;
}
