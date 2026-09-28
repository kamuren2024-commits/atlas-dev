/**
 * Enterprise Memory Fabric (EMF) — Versioning Engine
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemoryEntry, MemoryVersion } from '../types';
import { deepClone } from '../utils';

export class MemoryVersioningManager {
  private historyMap = new Map<string, MemoryVersion[]>();

  public recordVersion(entry: MemoryEntry, author?: string, details?: string): void {
    const key = `${entry.context.tenantId}::${entry.key}`;
    if (!this.historyMap.has(key)) {
      this.historyMap.set(key, []);
    }

    const versions = this.historyMap.get(key)!;
    const nextVer: MemoryVersion = {
      version: entry.version,
      entry: deepClone(entry),
      timestamp: Date.now(),
      author: author || entry.context.securityContext?.userId,
      details: details || `Revision update to version ${entry.version}`
    };

    versions.push(nextVer);
  }

  public getHistory(tenantId: string, keyName: string): MemoryVersion[] {
    const lookupKey = `${tenantId}::${keyName}`;
    return this.historyMap.get(lookupKey) || [];
  }

  public rollback(tenantId: string, keyName: string, targetVersionNumber: number): MemoryEntry {
    const lookupKey = `${tenantId}::${keyName}`;
    const history = this.historyMap.get(lookupKey);
    if (!history || history.length === 0) {
      throw new Error(`Rollback Failed: No history index found for "${keyName}"`);
    }

    const matchedVersion = history.find((h) => h.version === targetVersionNumber);
    if (!matchedVersion) {
      throw new Error(`Rollback Failed: Version number ${targetVersionNumber} was not found in audit chain`);
    }

    const rollbackedEntry = deepClone(matchedVersion.entry);
    
    // Bump version count upon restoration write
    rollbackedEntry.version += 1;
    rollbackedEntry.updatedAt = Date.now();
    
    return rollbackedEntry;
  }

  public compareVersions(v1: MemoryVersion, v2: MemoryVersion): Record<string, any> {
    return {
      v1Number: v1.version,
      v2Number: v2.version,
      hasValueChanged: JSON.stringify(v1.entry.value) !== JSON.stringify(v2.entry.value),
      v1Timestamp: v1.timestamp,
      v2Timestamp: v2.timestamp,
      timeDifferenceMs: Math.abs(v2.timestamp - v1.timestamp)
    };
  }

  public clear(tenantId: string): void {
    for (const key of Array.from(this.historyMap.keys())) {
      if (key.startsWith(`${tenantId}::`)) {
        this.historyMap.delete(key);
      }
    }
  }
}
