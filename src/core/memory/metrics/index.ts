/**
 * Enterprise Memory Fabric (EMF) — Metrics Collector
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemoryMetrics, MemoryLifecycleState, MemoryType } from '../types';

export class MemoryMetricsCollector {
  private static instances = new Map<MemoryType, MemoryMetricsCollector>();

  private memoryCount = 0;
  private totalRetrievalLatency = 0;
  private retrievalCount = 0;
  private totalSearchLatency = 0;
  private searchCount = 0;
  private snapshotCount = 0;
  private versionCount = 0;
  private referenceCount = 0;
  private cacheHits = 0;
  private cacheMisses = 0;

  private lifecycleTransitions: Record<MemoryLifecycleState, number> = {
    [MemoryLifecycleState.CREATED]: 0,
    [MemoryLifecycleState.INDEXED]: 0,
    [MemoryLifecycleState.ACTIVE]: 0,
    [MemoryLifecycleState.REFERENCED]: 0,
    [MemoryLifecycleState.ARCHIVED]: 0,
    [MemoryLifecycleState.RESTORED]: 0,
    [MemoryLifecycleState.DELETED]: 0
  };

  public static getInstance(type: MemoryType): MemoryMetricsCollector {
    if (!this.instances.has(type)) {
      this.instances.set(type, new MemoryMetricsCollector());
    }
    return this.instances.get(type)!;
  }

  public static clearAll(): void {
    this.instances.clear();
  }

  public recordCreate(): void {
    this.memoryCount += 1;
    this.lifecycleTransitions[MemoryLifecycleState.CREATED] += 1;
  }

  public recordDelete(): void {
    if (this.memoryCount > 0) {
      this.memoryCount -= 1;
    }
    this.lifecycleTransitions[MemoryLifecycleState.DELETED] += 1;
  }

  public recordTransition(state: MemoryLifecycleState): void {
    this.lifecycleTransitions[state] += 1;
    if (state === MemoryLifecycleState.REFERENCED) {
      this.referenceCount += 1;
    }
  }

  public recordRetrieval(latencyMs: number): void {
    this.totalRetrievalLatency += latencyMs;
    this.retrievalCount += 1;
  }

  public recordSearch(latencyMs: number): void {
    this.totalSearchLatency += latencyMs;
    this.searchCount += 1;
  }

  public recordSnapshot(): void {
    this.snapshotCount += 1;
  }

  public recordVersion(): void {
    this.versionCount += 1;
  }

  public recordCache(hit: boolean): void {
    if (hit) {
      this.cacheHits += 1;
    } else {
      this.cacheMisses += 1;
    }
  }

  public getMetrics(): MemoryMetrics {
    const totalCache = this.cacheHits + this.cacheMisses;
    const cacheRatio = totalCache > 0 ? this.cacheHits / totalCache : 1.0;

    return {
      memoryCount: this.memoryCount,
      retrievalLatencyAverageMs: this.retrievalCount > 0 ? Number((this.totalRetrievalLatency / this.retrievalCount).toFixed(2)) : 0,
      searchLatencyAverageMs: this.searchCount > 0 ? Number((this.totalSearchLatency / this.searchCount).toFixed(2)) : 0,
      snapshotCount: this.snapshotCount,
      versionCount: this.versionCount,
      referenceCount: this.referenceCount,
      cacheHitRatio: Number(cacheRatio.toFixed(2)),
      lifecycleTransitionsCount: { ...this.lifecycleTransitions }
    };
  }
}
