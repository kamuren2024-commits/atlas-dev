/**
 * Enterprise Memory Fabric (EMF) — Memory Runtime Orchestrator
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { IMemoryRuntime, IMemoryProvider } from '../contracts';
import {
  MemoryEntry,
  MemoryContext,
  MemoryType,
  MemoryQuery,
  MemorySearchResult,
  MemorySnapshot,
  MemoryVersion,
  MemoryMetrics,
  MemoryLifecycleState
} from '../types';
import { MemorySnapshotManager } from '../snapshots';
import { MemoryMetricsCollector } from '../metrics';
import { MemoryEventPublisher } from '../events';

import { WorkingMemoryProvider } from '../working';
import { SessionMemoryProvider } from '../session';
import { WorkflowMemoryProvider } from '../workflow';
import { AgentMemoryProvider } from '../agent';
import { SharedMemoryProvider } from '../shared';
import { OrganizationMemoryProvider, LongTermMemoryProvider } from '../organization';

export class MemoryRuntime implements IMemoryRuntime {
  private static instance: MemoryRuntime;
  private providers = new Map<MemoryType, IMemoryProvider>();
  private snapshotManager = new MemorySnapshotManager();
  private states = new Map<string, MemoryLifecycleState>();

  private constructor() {
    // Autoload standard providers to ensure robust infrastructure out-of-the-box
    this.registerProvider(new WorkingMemoryProvider());
    this.registerProvider(new SessionMemoryProvider());
    this.registerProvider(new WorkflowMemoryProvider());
    this.registerProvider(new AgentMemoryProvider());
    this.registerProvider(new SharedMemoryProvider());
    this.registerProvider(new OrganizationMemoryProvider());
    this.registerProvider(new LongTermMemoryProvider());
  }

  public static getInstance(): MemoryRuntime {
    if (!MemoryRuntime.instance) {
      MemoryRuntime.instance = new MemoryRuntime();
    }
    return MemoryRuntime.instance;
  }

  public registerProvider(provider: IMemoryProvider): void {
    this.providers.set(provider.getType(), provider);
  }

  public getProvider(type: MemoryType): IMemoryProvider | undefined {
    return this.providers.get(type);
  }

  public async get(type: MemoryType, key: string, context: MemoryContext): Promise<MemoryEntry | undefined> {
    const provider = this.getProviderOrThrow(type);
    const entry = await provider.get(key, context);
    if (entry) {
      this.states.set(entry.id, entry.state);
    }
    return entry;
  }

  public async set(type: MemoryType, key: string, value: any, context: MemoryContext): Promise<MemoryEntry> {
    const provider = this.getProviderOrThrow(type);
    const entry = await provider.set(key, value, context);
    this.states.set(entry.id, entry.state);
    return entry;
  }

  public async delete(type: MemoryType, key: string, context: MemoryContext): Promise<boolean> {
    const provider = this.getProviderOrThrow(type);
    const success = await provider.delete(key, context);
    return success;
  }

  public async search(type: MemoryType, query: MemoryQuery, context: MemoryContext): Promise<MemorySearchResult> {
    const provider = this.getProviderOrThrow(type);
    return await provider.search(query, context);
  }

  public async captureSnapshot(type: MemoryType, tenantId: string, metadata?: Record<string, any>): Promise<MemorySnapshot> {
    const provider = this.getProviderOrThrow(type);
    const entries = await provider.getEntries(tenantId);
    
    const snapshot = this.snapshotManager.capture(type, tenantId, entries, metadata);
    MemoryMetricsCollector.getInstance(type).recordSnapshot();
    
    await MemoryEventPublisher.publish('SnapshotCreated', { snapshotId: snapshot.id, tenantId, memoryType: type });
    return snapshot;
  }

  public async restoreSnapshot(snapshot: MemorySnapshot, context: MemoryContext): Promise<boolean> {
    const provider = this.getProviderOrThrow(snapshot.memoryType);
    
    // Clear current tenant entries
    await provider.clear(context.tenantId);
    
    // Write back entries from snapshot
    const entries = this.snapshotManager.restore(snapshot.id);
    for (const entry of entries) {
      await provider.set(entry.key, entry.value, {
        ...context,
        tags: entry.context.tags,
        metadata: entry.context.metadata
      });
    }

    await MemoryEventPublisher.publish('SnapshotRestored', { snapshotId: snapshot.id, tenantId: context.tenantId });
    return true;
  }

  public async getHistory(type: MemoryType, key: string, context: MemoryContext): Promise<MemoryVersion[]> {
    const provider = this.getProviderOrThrow(type);
    return await provider.getHistory(key, context);
  }

  public async rollback(type: MemoryType, key: string, version: number, context: MemoryContext): Promise<MemoryEntry> {
    const provider = this.getProviderOrThrow(type);
    const entry = await provider.rollback(key, version, context);
    this.states.set(entry.id, entry.state);
    return entry;
  }

  public getMetrics(type: MemoryType): MemoryMetrics {
    return MemoryMetricsCollector.getInstance(type).getMetrics();
  }

  public transitionTo(entryId: string, nextState: MemoryLifecycleState, reason?: string): void {
    this.states.set(entryId, nextState);
    // Find matching provider and adjust metrics accordingly
    for (const provider of Array.from(this.providers.values())) {
      MemoryMetricsCollector.getInstance(provider.getType()).recordTransition(nextState);
    }
  }

  public getState(entryId: string): MemoryLifecycleState | undefined {
    return this.states.get(entryId);
  }

  public clearAll(tenantId: string): void {
    for (const provider of Array.from(this.providers.values())) {
      provider.clear(tenantId).catch(console.error);
    }
    this.snapshotManager.clear();
    this.states.clear();
  }

  private getProviderOrThrow(type: MemoryType): IMemoryProvider {
    const provider = this.getProvider(type);
    if (!provider) {
      throw new Error(`Execution Failed: No registered Memory Provider found for type "${type}".`);
    }
    return provider;
  }
}
