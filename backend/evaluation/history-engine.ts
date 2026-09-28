import { ProcurementHistory } from '../../src/types/evaluation';
import { v4 as uuidv4 } from 'uuid';

export class ProcurementHistoryEngine {
  private static instance: ProcurementHistoryEngine;
  private history: Map<string, ProcurementHistory[]> = new Map();

  private constructor() {}

  public static getInstance(): ProcurementHistoryEngine {
    if (!ProcurementHistoryEngine.instance) {
      ProcurementHistoryEngine.instance = new ProcurementHistoryEngine();
    }
    return ProcurementHistoryEngine.instance;
  }

  public recordChange(entityId: string, changes: any, officer: string) {
    const versions = this.history.get(entityId) || [];
    const newVersion: ProcurementHistory = {
      id: uuidv4(),
      entityId,
      version: versions.length + 1,
      timestamp: new Date().toISOString(),
      changes,
      officerSignature: officer
    };
    versions.push(newVersion);
    this.history.set(entityId, versions);
    return newVersion;
  }

  public getHistory(entityId: string): ProcurementHistory[] {
    return this.history.get(entityId) || [];
  }

  public getSnapshot(entityId: string, version: number): ProcurementHistory | null {
    const versions = this.history.get(entityId);
    if (!versions) return null;
    return versions.find(v => v.version === version) || null;
  }

  public compareVersions(entityId: string, v1: number, v2: number) {
    const snap1 = this.getSnapshot(entityId, v1);
    const snap2 = this.getSnapshot(entityId, v2);
    if (!snap1 || !snap2) return null;
    
    return {
      entityId,
      v1: snap1.version,
      v2: snap2.version,
      changes: this.diff(snap1.changes, snap2.changes)
    };
  }

  private diff(obj1: any, obj2: any) {
    // Simple diff implementation
    const changes: any = {};
    for (const key in obj2) {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        changes[key] = { from: obj1[key], to: obj2[key] };
      }
    }
    return changes;
  }
}
