/**
 * Enterprise Memory Fabric (EMF) — Index Registry
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemoryIndex, MemoryEntry } from '../types';

export class MemoryIndexRegistry {
  private indices = new Map<string, MemoryIndex>();

  public createIndex(entry: MemoryEntry): MemoryIndex {
    const namespaces: string[] = [];
    if (entry.context.metadata?.namespace) {
      namespaces.push(entry.context.metadata.namespace);
    }

    const index: MemoryIndex = {
      id: `idx-${entry.id}`,
      entryId: entry.id,
      key: entry.key,
      type: entry.type,
      tags: entry.context.tags || [],
      namespaces,
      correlationId: entry.context.correlationId,
      workflowExecutionId: entry.context.workflowExecutionId,
      agentId: entry.context.agentId,
      tenantId: entry.context.tenantId,
      createdAt: entry.createdAt
    };

    this.indices.set(entry.id, index);
    return index;
  }

  public get(entryId: string): MemoryIndex | undefined {
    return this.indices.get(entryId);
  }

  public getByEntryId(entryId: string): MemoryIndex | undefined {
    return this.indices.get(entryId);
  }

  public remove(entryId: string): void {
    this.indices.delete(entryId);
  }

  public list(): MemoryIndex[] {
    return Array.from(this.indices.values());
  }

  public clear(tenantId: string): void {
    for (const [id, idx] of Array.from(this.indices.entries())) {
      if (idx.tenantId === tenantId) {
        this.indices.delete(id);
      }
    }
  }
}
