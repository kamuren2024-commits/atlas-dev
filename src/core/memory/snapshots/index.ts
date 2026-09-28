/**
 * Enterprise Memory Fabric (EMF) — Snapshot Manager
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { MemorySnapshot, MemoryEntry, MemoryType } from '../types';
import { deepClone, generateUUID } from '../utils';

export class MemorySnapshotManager {
  private snapshots = new Map<string, MemorySnapshot>();

  public capture(type: MemoryType, tenantId: string, entries: MemoryEntry[], metadata?: Record<string, any>): MemorySnapshot {
    const snapshot: MemorySnapshot = {
      id: `snap-${generateUUID()}`,
      timestamp: Date.now(),
      tenantId,
      memoryType: type,
      entries: deepClone(entries),
      metadata: metadata || {}
    };

    this.snapshots.set(snapshot.id, snapshot);
    return snapshot;
  }

  public get(snapshotId: string): MemorySnapshot | undefined {
    return this.snapshots.get(snapshotId);
  }

  public restore(snapshotId: string): MemoryEntry[] {
    const snap = this.snapshots.get(snapshotId);
    if (!snap) {
      throw new Error(`Restoration Failed: Snapshot with id "${snapshotId}" is not cataloged.`);
    }
    return deepClone(snap.entries);
  }

  public merge(targetSnapshotId: string, sourceSnapshotId: string): MemorySnapshot {
    const target = this.snapshots.get(targetSnapshotId);
    const source = this.snapshots.get(sourceSnapshotId);

    if (!target || !source) {
      throw new Error('Merge Failed: One or both snapshots do not exist.');
    }

    if (target.tenantId !== source.tenantId || target.memoryType !== source.memoryType) {
      throw new Error('Merge Failed: Tenant ID or Memory Type mismatch.');
    }

    const mergedEntriesMap = new Map<string, MemoryEntry>();
    target.entries.forEach((e) => mergedEntriesMap.set(e.key, e));
    source.entries.forEach((e) => {
      const existing = mergedEntriesMap.get(e.key);
      if (!existing || e.version >= existing.version) {
        mergedEntriesMap.set(e.key, e);
      }
    });

    const mergedSnapshot: MemorySnapshot = {
      id: `snap-merge-${generateUUID()}`,
      timestamp: Date.now(),
      tenantId: target.tenantId,
      memoryType: target.memoryType,
      entries: Array.from(mergedEntriesMap.values()),
      metadata: {
        mergedFrom: [targetSnapshotId, sourceSnapshotId],
        reason: 'Delta merge orchestration'
      }
    };

    this.snapshots.set(mergedSnapshot.id, mergedSnapshot);
    return mergedSnapshot;
  }

  public delete(snapshotId: string): boolean {
    return this.snapshots.delete(snapshotId);
  }

  public clear(): void {
    this.snapshots.clear();
  }
}
