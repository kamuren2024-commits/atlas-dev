/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Event Persistence
 * 
 * Persists events for audit, replay, and historical analysis
 */

import { v4 as uuidv4 } from 'uuid';
import { CanonicalEvent } from './types';
import { SQLiteEventStore } from './sqlite-event-store';

/**
 * Event Store Interface
 */
export interface IEventStore {
  store(event: CanonicalEvent): Promise<void>;
  retrieve(eventId: string): Promise<CanonicalEvent | null>;
  query(params: EventQueryParams): Promise<CanonicalEvent[]>;
  delete(eventId: string): Promise<void>;
  archive(olderThan: string): Promise<number>;
}

/**
 * Event Query Parameters
 */
export interface EventQueryParams {
  categories?: string[];
  eventTypes?: string[];
  assetIds?: string[];
  startTime?: string;
  endTime?: string;
  limit?: number;
  offset?: number;
}

/**
 * In-Memory Event Store (development/testing)
 */
export class InMemoryEventStore implements IEventStore {
  private events: Map<string, CanonicalEvent> = new Map();
  private index: {
    byCategory: Map<string, string[]>;
    byType: Map<string, string[]>;
    byAsset: Map<string, string[]>;
  } = {
    byCategory: new Map(),
    byType: new Map(),
    byAsset: new Map(),
  };

  public async store(event: CanonicalEvent): Promise<void> {
    this.events.set(event.id, event);

    // Update indices
    this.updateIndex('byCategory', event.category, event.id);
    this.updateIndex('byType', event.eventType, event.id);

    if ('assetId' in event) {
      this.updateIndex('byAsset', event.assetId, event.id);
    } else if ('affectedAssets' in event) {
      for (const assetId of event.affectedAssets) {
        this.updateIndex('byAsset', assetId, event.id);
      }
    }
  }

  public async retrieve(eventId: string): Promise<CanonicalEvent | null> {
    return this.events.get(eventId) || null;
  }

  public async query(params: EventQueryParams): Promise<CanonicalEvent[]> {
    let results = Array.from(this.events.values());

    // Filter by category
    if (params.categories && params.categories.length > 0) {
      results = results.filter((e) => params.categories!.includes(e.category));
    }

    // Filter by event type
    if (params.eventTypes && params.eventTypes.length > 0) {
      results = results.filter((e) => params.eventTypes!.includes(e.eventType));
    }

    // Filter by asset
    if (params.assetIds && params.assetIds.length > 0) {
      results = results.filter((e) => {
        if ('assetId' in e) {
          return params.assetIds!.includes(e.assetId);
        }
        if ('affectedAssets' in e) {
          return e.affectedAssets.some((a) => params.assetIds!.includes(a));
        }
        return false;
      });
    }

    // Filter by time range
    if (params.startTime) {
      const startTime = new Date(params.startTime).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() >= startTime);
    }

    if (params.endTime) {
      const endTime = new Date(params.endTime).getTime();
      results = results.filter((e) => new Date(e.timestamp).getTime() <= endTime);
    }

    // Sort by timestamp descending
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Paginate
    const offset = params.offset || 0;
    const limit = params.limit || 100;

    return results.slice(offset, offset + limit);
  }

  public async delete(eventId: string): Promise<void> {
    const event = this.events.get(eventId);

    if (event) {
      this.events.delete(eventId);

      // Clean up indices
      this.removeFromIndex('byCategory', event.category, eventId);
      this.removeFromIndex('byType', event.eventType, eventId);

      if ('assetId' in event) {
        this.removeFromIndex('byAsset', event.assetId, eventId);
      }
    }
  }

  public async archive(olderThan: string): Promise<number> {
    const cutoffTime = new Date(olderThan).getTime();
    const toDelete: string[] = [];

    for (const [eventId, event] of this.events.entries()) {
      if (new Date(event.timestamp).getTime() < cutoffTime) {
        toDelete.push(eventId);
      }
    }

    for (const eventId of toDelete) {
      await this.delete(eventId);
    }

    return toDelete.length;
  }

  private updateIndex(indexName: keyof typeof this.index, key: string, eventId: string): void {
    const index = this.index[indexName];
    if (!index.has(key)) {
      index.set(key, []);
    }
    const entries = index.get(key)!;
    if (!entries.includes(eventId)) {
      entries.push(eventId);
    }
  }

  private removeFromIndex(indexName: keyof typeof this.index, key: string, eventId: string): void {
    const index = this.index[indexName];
    const entries = index.get(key);
    if (entries) {
      const idx = entries.indexOf(eventId);
      if (idx > -1) {
        entries.splice(idx, 1);
      }
    }
  }

  public getStats(): {
    totalEvents: number;
    eventsByCategory: Record<string, number>;
  } {
    const stats: Record<string, number> = {};

    for (const event of this.events.values()) {
      stats[event.category] = (stats[event.category] || 0) + 1;
    }

    return {
      totalEvents: this.events.size,
      eventsByCategory: stats,
    };
  }
}

/**
 * Event Persistence Manager
 */
export class EventPersistenceManager {
  private static instance: EventPersistenceManager | null = null;
  private store: IEventStore;
  private eventBuffer: CanonicalEvent[] = [];
  private bufferSize = 1000;
  private flushInterval: NodeJS.Timeout | null = null;

  private constructor(store?: IEventStore) {
    this.store = store || new SQLiteEventStore();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(store?: IEventStore): EventPersistenceManager {
    if (!EventPersistenceManager.instance) {
      EventPersistenceManager.instance = new EventPersistenceManager(store);
    }
    return EventPersistenceManager.instance;
  }

  /**
   * Initialize persistence
   */
  public initialize(): void {
    // Flush buffer every 10 seconds
    this.flushInterval = setInterval(() => {
      this.flush();
    }, 10000);

    console.log('[EVENT-PERSISTENCE] Persistence manager initialized');
  }

  /**
   * Add event to buffer (async write)
   */
  public async addEvent(event: CanonicalEvent): Promise<void> {
    this.eventBuffer.push(event);

    // Flush when buffer is full
    if (this.eventBuffer.length >= this.bufferSize) {
      await this.flush();
    }
  }

  /**
   * Flush buffer to store
   */
  public async flush(): Promise<void> {
    if (this.eventBuffer.length === 0) return;

    const events = this.eventBuffer.splice(0, this.bufferSize);

    try {
      for (const event of events) {
        await this.store.store(event);
      }

      console.log(`[EVENT-PERSISTENCE] Flushed ${events.length} events to store`);
    } catch (error) {
      console.error('[EVENT-PERSISTENCE] Flush error:', error);
      // Re-add events to buffer on failure
      this.eventBuffer.unshift(...events);
    }
  }

  /**
   * Query events
   */
  public async queryEvents(params: EventQueryParams): Promise<CanonicalEvent[]> {
    return this.store.query(params);
  }

  /**
   * Get event by ID
   */
  public async getEvent(eventId: string): Promise<CanonicalEvent | null> {
    return this.store.retrieve(eventId);
  }

  /**
   * Archive old events
   */
  public async archiveOldEvents(olderThan: string): Promise<number> {
    return this.store.archive(olderThan);
  }

  /**
   * Get buffer stats
   */
  public getBufferStats(): {
    bufferedEvents: number;
    bufferUtilization: number;
  } {
    return {
      bufferedEvents: this.eventBuffer.length,
      bufferUtilization: (this.eventBuffer.length / this.bufferSize) * 100,
    };
  }

  /**
   * Shutdown persistence
   */
  public async shutdown(): Promise<void> {
    console.log('[EVENT-PERSISTENCE] Shutting down persistence manager...');

    // Flush remaining events
    await this.flush();

    // Clear interval
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }

    console.log('[EVENT-PERSISTENCE] Persistence manager shut down');
  }
}

export default EventPersistenceManager;
