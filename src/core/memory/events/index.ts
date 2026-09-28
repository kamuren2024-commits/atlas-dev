/**
 * Enterprise Memory Fabric (EMF) — PubSub Event Router
 * Salience Atlas Autonomous Procurement Operating System (APOS)
 */

import { generateId } from '../../shared/crypto';

export type MemoryEventType =
  | 'MemoryCreated'
  | 'MemoryIndexed'
  | 'MemoryUpdated'
  | 'MemoryReferenced'
  | 'MemoryArchived'
  | 'MemoryDeleted'
  | 'SnapshotCreated'
  | 'SnapshotRestored'
  | 'VersionCreated'
  | 'SearchPerformed';

export interface MemoryEvent {
  id: string;
  type: MemoryEventType;
  timestamp: number;
  payload: Record<string, any>;
}

export type MemoryEventListener = (event: MemoryEvent) => void | Promise<void>;

export class MemoryEventPublisher {
  private static listeners = new Map<MemoryEventType, Set<MemoryEventListener>>();

  public static subscribe(type: MemoryEventType, listener: MemoryEventListener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      const set = this.listeners.get(type);
      if (set) {
        set.delete(listener);
      }
    };
  }

  public static async publish(type: MemoryEventType, payload: Record<string, any>): Promise<void> {
    const event: MemoryEvent = {
      id: generateId('evt-mem'),
      type,
      timestamp: Date.now(),
      payload
    };

    const targetSet = this.listeners.get(type);
    if (targetSet) {
      for (const listener of targetSet) {
        try {
          await listener(event);
        } catch (err) {
          console.error(`Error in Memory Event Listener for "${type}":`, err);
        }
      }
    }
  }

  public static clearAll(): void {
    this.listeners.clear();
  }
}
