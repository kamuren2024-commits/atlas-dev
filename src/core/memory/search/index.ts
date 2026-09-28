/**
 * Enterprise Memory Fabric (EMF) — Search Engine
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemoryQuery, MemorySearchResult, MemoryEntry } from '../types';
import { MemoryIndexRegistry } from '../index/index';

export class MemorySearchEngine {
  private indexRegistry: MemoryIndexRegistry;

  constructor(registry: MemoryIndexRegistry) {
    this.indexRegistry = registry;
  }

  public query(
    query: MemoryQuery,
    entries: MemoryEntry[]
  ): MemorySearchResult {
    const startTime = Date.now();
    const indices = this.indexRegistry.list();

    const matchedIndices = indices.filter((idx) => {
      // 1. Tenant Filtering
      if (query.tenantId && idx.tenantId !== query.tenantId) {
        return false;
      }

      // 2. Exact Key Filtering
      if (query.exactKey && idx.key !== query.exactKey) {
        return false;
      }

      // 3. Type Filtering
      if (query.type && idx.type !== query.type) {
        return false;
      }

      // 4. Agent Filtering
      if (query.agentId && idx.agentId !== query.agentId) {
        return false;
      }

      // 5. Workflow Execution Filtering
      if (query.workflowExecutionId && idx.workflowExecutionId !== query.workflowExecutionId) {
        return false;
      }

      // 6. Correlation Filtering
      if (query.correlationId && idx.correlationId !== query.correlationId) {
        return false;
      }

      // 7. Namespaces Filtering
      if (query.namespaces && query.namespaces.length > 0) {
        const hasNS = query.namespaces.some((ns) => idx.namespaces.includes(ns));
        if (!hasNS) return false;
      }

      // 8. Tags Filtering
      if (query.tags && query.tags.length > 0) {
        const hasTag = query.tags.some((tag) => idx.tags.includes(tag));
        if (!hasTag) return false;
      }

      // 9. Time Range Filtering
      if (query.timeRange) {
        if (idx.createdAt < query.timeRange.start || idx.createdAt > query.timeRange.end) {
          return false;
        }
      }

      return true;
    });

    // Resolve matching indices back to actual Memory Entries
    const matchedEntryIds = new Set(matchedIndices.map((i) => i.entryId));
    let matchedEntries = entries.filter((e) => matchedEntryIds.has(e.id));

    // 10. Metadata Custom Filters Evaluation (Composite values check)
    if (query.metaFilters && Object.keys(query.metaFilters).length > 0) {
      matchedEntries = matchedEntries.filter((entry) => {
        const entryMeta = entry.context.metadata || {};
        return Object.entries(query.metaFilters!).every(([metaKey, expectedValue]) => {
          return entryMeta[metaKey] === expectedValue;
        });
      });

      // Synchronize back the matched index list
      const finalEntryIds = new Set(matchedEntries.map((e) => e.id));
      const finalIndices = matchedIndices.filter((idx) => finalEntryIds.has(idx.entryId));
      return {
        entries: matchedEntries,
        indices: finalIndices,
        latencyMs: Date.now() - startTime,
        query
      };
    }

    return {
      entries: matchedEntries,
      indices: matchedIndices,
      latencyMs: Date.now() - startTime,
      query
    };
  }
}
