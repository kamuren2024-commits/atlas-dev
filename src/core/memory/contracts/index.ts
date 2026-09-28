/**
 * Enterprise Memory Fabric (EMF) — Main Architectural Interfaces
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import {
  MemoryEntry,
  MemoryContext,
  MemoryType,
  MemoryQuery,
  MemorySearchResult,
  MemoryVersion,
  MemorySnapshot,
  MemoryPolicy,
  MemoryMetrics,
  MemoryLifecycleState
} from '../types';

export interface IMemoryProvider {
  getType(): MemoryType;
  get(key: string, context: MemoryContext): Promise<MemoryEntry | undefined>;
  set(key: string, value: any, context: MemoryContext): Promise<MemoryEntry>;
  delete(key: string, context: MemoryContext): Promise<boolean>;
  search(query: MemoryQuery, context: MemoryContext): Promise<MemorySearchResult>;
  getHistory(key: string, context: MemoryContext): Promise<MemoryVersion[]>;
  rollback(key: string, version: number, context: MemoryContext): Promise<MemoryEntry>;
  getEntries(tenantId: string): Promise<MemoryEntry[]>;
  clear(tenantId: string): Promise<void>;
}

export interface IMemoryLifecycle {
  transitionTo(entryId: string, nextState: MemoryLifecycleState, reason?: string): void;
  getState(entryId: string): MemoryLifecycleState | undefined;
}

export interface IMemoryGovernance {
  evaluateRetention(entry: MemoryEntry, policy: MemoryPolicy): boolean;
  verifyAccessControl(context: MemoryContext, policy: MemoryPolicy): boolean;
  applyComplianceTags(entry: MemoryEntry): Record<string, any>;
}

export interface IMemoryRuntime {
  registerProvider(provider: IMemoryProvider): void;
  getProvider(type: MemoryType): IMemoryProvider | undefined;
  
  get(type: MemoryType, key: string, context: MemoryContext): Promise<MemoryEntry | undefined>;
  set(type: MemoryType, key: string, value: any, context: MemoryContext): Promise<MemoryEntry>;
  delete(type: MemoryType, key: string, context: MemoryContext): Promise<boolean>;
  search(type: MemoryType, query: MemoryQuery, context: MemoryContext): Promise<MemorySearchResult>;
  
  captureSnapshot(type: MemoryType, tenantId: string, metadata?: Record<string, any>): Promise<MemorySnapshot>;
  restoreSnapshot(snapshot: MemorySnapshot, context: MemoryContext): Promise<boolean>;
  
  getHistory(type: MemoryType, key: string, context: MemoryContext): Promise<MemoryVersion[]>;
  rollback(type: MemoryType, key: string, version: number, context: MemoryContext): Promise<MemoryEntry>;
  
  getMetrics(type: MemoryType): MemoryMetrics;
}
