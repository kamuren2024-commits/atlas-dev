/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Main Coordinator
 * 
 * Orchestrates event bus, normalizer, state store, and delivery
 */

import { Server as HTTPServer } from 'http';
import { GridTelemetry, GridEvent } from '../data-fabric/types';
import { EventBus } from './event-bus';
import { EventNormalizer } from './normalizer';
import { EventStateStore } from './state-store';
import { WebSocketHandler } from './websocket-handler';
import { SSEHandler } from './sse-handler';
import { EventPersistenceManager } from './persistence';
import { SpatialProjectionAdapter } from './projection-adapter';
import { CanonicalEvent, EventFilter } from './types';

/**
 * Event Fabric - Main Coordinator
 */
export class EventFabric {
  private static instance: EventFabric | null = null;
  private eventBus: EventBus;
  private normalizer: EventNormalizer;
  private stateStore: EventStateStore;
  private wsHandler: WebSocketHandler;
  private sseHandler: SSEHandler;
  private persistenceManager: EventPersistenceManager;
  private projectionAdapter: SpatialProjectionAdapter;
  private initialized = false;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.normalizer = EventNormalizer.getInstance();
    this.stateStore = EventStateStore.getInstance();
    this.wsHandler = WebSocketHandler.getInstance();
    this.sseHandler = SSEHandler.getInstance();
    this.persistenceManager = EventPersistenceManager.getInstance();
    this.projectionAdapter = new SpatialProjectionAdapter();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): EventFabric {
    if (!EventFabric.instance) {
      EventFabric.instance = new EventFabric();
    }
    return EventFabric.instance;
  }

  /**
   * Initialize event fabric
   */
  public async initialize(httpServer?: HTTPServer): Promise<void> {
    if (this.initialized) return;

    console.log('[EVENT-FABRIC] Initializing real-time event fabric...');

    await this.eventBus.initialize();
    this.persistenceManager.initialize();

    if (httpServer) {
      this.wsHandler.initialize(httpServer, '/ws/events');
      console.log('[EVENT-FABRIC] WebSocket server initialized');
    }

    this.initialized = true;
    console.log('[EVENT-FABRIC] Event fabric initialized');
  }

  /**
   * Publish telemetry as event
   */
  public async publishTelemetry(
    providerId: string,
    telemetry: GridTelemetry,
    previousTelemetry?: GridTelemetry
  ): Promise<void> {
    try {
      const event = this.normalizer.normalizeTelemetry(
        providerId,
        telemetry,
        previousTelemetry
      );

      await this.publishEvent(event);
    } catch (error) {
      console.error('[EVENT-FABRIC] Telemetry publication error:', error);
    }
  }

  /**
   * Publish grid event
   */
  public async publishGridEvent(providerId: string, gridEvent: GridEvent): Promise<void> {
    try {
      const event = this.normalizer.normalizeGridEvent(providerId, gridEvent);
      await this.publishEvent(event);
    } catch (error) {
      console.error('[EVENT-FABRIC] Grid event publication error:', error);
    }
  }

  /**
   * Publish canonical event
   */
  public async publishEvent(event: CanonicalEvent): Promise<void> {
    try {
      // Validate event
      const validation = this.normalizer.validateEvent(event);
      if (!validation.valid) {
        console.warn('[EVENT-FABRIC] Invalid event:', validation.errors);
        return;
      }

      // Update state
      this.stateStore.updateFromEvent(event);
      this.projectionAdapter.applyEvent(event);

      // Publish via event bus
      await this.eventBus.publishEvent(event);

      // Persist event
      await this.persistenceManager.addEvent(event);

      // Broadcast to connected clients
      this.wsHandler.broadcastEvent(event);
      this.sseHandler.broadcastEvent(event);
    } catch (error) {
      console.error('[EVENT-FABRIC] Event publication error:', error);
    }
  }

  /**
   * Subscribe to events
   */
  public subscribe(
    filter: EventFilter,
    callback: (event: CanonicalEvent) => Promise<void>
  ): string {
    return this.eventBus.subscribe(filter, callback);
  }

  /**
   * Unsubscribe from events
   */
  public unsubscribe(subscriptionId: string): void {
    this.eventBus.unsubscribe(subscriptionId);
  }

  /**
   * Query events
   */
  public queryEvents(filter: EventFilter, limit?: number, offset?: number): CanonicalEvent[] {
    return this.eventBus.queryEvents({
      filter,
      limit,
      offset,
    });
  }

  /**
   * Get state snapshot
   */
  public getState(): {
    global: Record<string, any>;
    assets: any[];
    sources: Record<string, any>;
  } {
    return {
      global: this.stateStore.getGlobalState(),
      assets: this.stateStore.getAllAssetStates(),
      sources: Object.fromEntries(this.stateStore.getAllSourceHealth()),
    };
  }

  /**
   * Get statistics
   */
  public getStatistics(): {
    events: any;
    buffer: any;
    subscribers: number;
    wsClients: number;
    sseClients: number;
  } {
    return {
      events: this.eventBus.getStatistics(),
      buffer: this.persistenceManager.getBufferStats(),
      subscribers: this.eventBus.getSubscriptions().length,
      wsClients: this.wsHandler.getClientCount(),
      sseClients: this.sseHandler.getClientCount(),
    };
  }

  /**
   * Shutdown event fabric
   */
  public async shutdown(): Promise<void> {
    console.log('[EVENT-FABRIC] Shutting down event fabric...');

    this.stateStore.clearState();
    await this.persistenceManager.shutdown();
    await this.wsHandler.shutdown();
    await this.sseHandler.shutdown();
    await this.eventBus.shutdown();

    this.initialized = false;

    console.log('[EVENT-FABRIC] Event fabric shut down');
  }

  /**
   * Get WebSocket handler
   */
  public getWebSocketHandler(): WebSocketHandler {
    return this.wsHandler;
  }

  /**
   * Get SSE handler
   */
  public getSSEHandler(): SSEHandler {
    return this.sseHandler;
  }

  /**
   * Get event bus
   */
  public getEventBus(): EventBus {
    return this.eventBus;
  }

  /**
   * Get state store
   */
  public getStateStore(): EventStateStore {
    return this.stateStore;
  }

  public getProjectionAdapter(): SpatialProjectionAdapter {
    return this.projectionAdapter;
  }
}

export default EventFabric;
