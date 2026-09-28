/**
 * Enterprise Memory Fabric (EMF) — Cache Manager
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemoryEntry, MemoryType } from '../types';
import { MemoryMetricsCollector } from '../metrics';

export class MemoryCache {
  private cache = new Map<string, MemoryEntry>();
  private metricsCollector: MemoryMetricsCollector;

  constructor(type: MemoryType) {
    this.metricsCollector = MemoryMetricsCollector.getInstance(type);
  }

  public get(key: string): MemoryEntry | undefined {
    const entry = this.cache.get(key);
    const hit = !!entry;
    this.metricsCollector.recordCache(hit);
    return entry;
  }

  public set(key: string, entry: MemoryEntry): void {
    this.cache.set(key, entry);
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }

  public clear(): void {
    this.cache.clear();
  }
}
