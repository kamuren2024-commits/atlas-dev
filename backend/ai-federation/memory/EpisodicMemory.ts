// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — EPISODIC MEMORY
// Records what happened — events, interactions, decisions
// ============================================================================

import { generateId } from '../../../src/core/shared/crypto';

export interface EpisodicEvent {
  id: string;
  type: string;
  agentId?: string;
  missionId?: string;
  description: string;
  context: Record<string, any>;
  outcome?: string;
  timestamp: string;
  importance: number; // 0-100
  tags: string[];
}

export class EpisodicMemory {
  private static instance: EpisodicMemory;
  private events: EpisodicEvent[] = [];
  private maxEvents = 5000;

  private constructor() {}

  public static getInstance(): EpisodicMemory {
    if (!EpisodicMemory.instance) {
      EpisodicMemory.instance = new EpisodicMemory();
    }
    return EpisodicMemory.instance;
  }

  /**
   * Record an episodic event
   */
  record(event: Omit<EpisodicEvent, 'id' | 'timestamp'>): string {
    const id = generateId('epi');
    const fullEvent: EpisodicEvent = {
      ...event,
      id,
      timestamp: new Date().toISOString(),
    };

    this.events.push(fullEvent);
    this.evict();
    return id;
  }

  /**
   * Query events by various filters
   */
  query(filters: {
    type?: string;
    agentId?: string;
    missionId?: string;
    since?: string;
    tags?: string[];
    minImportance?: number;
    limit?: number;
  }): EpisodicEvent[] {
    let results = [...this.events];

    if (filters.type) {
      results = results.filter(e => e.type === filters.type);
    }
    if (filters.agentId) {
      results = results.filter(e => e.agentId === filters.agentId);
    }
    if (filters.missionId) {
      results = results.filter(e => e.missionId === filters.missionId);
    }
    if (filters.since) {
      const since = new Date(filters.since).getTime();
      results = results.filter(e => new Date(e.timestamp).getTime() >= since);
    }
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(e => filters.tags!.some(t => e.tags.includes(t)));
    }
    if (filters.minImportance !== undefined) {
      results = results.filter(e => e.importance >= filters.minImportance!);
    }

    // Sort by timestamp descending (most recent first)
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filters.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  /**
   * Get recent events for context
   */
  getRecentContext(agentId: string, limit: number = 10): EpisodicEvent[] {
    return this.query({ agentId, limit });
  }

  /**
   * Get events by importance
   */
  getImportantEvents(minImportance: number = 80): EpisodicEvent[] {
    return this.events
      .filter(e => e.importance >= minImportance)
      .sort((a, b) => b.importance - a.importance);
  }

  private evict(): void {
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
}
