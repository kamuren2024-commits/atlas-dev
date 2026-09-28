/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Event Bus Core Service
 * 
 * Central event bus for all grid events
 * Implements pub/sub pattern with real-time delivery
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  CanonicalEvent,
  EventSubscription,
  EventFilter,
  EventCategory,
  EventStatus,
  EventStatistics,
  EventQueryParams,
  EventTopic,
} from './types';

export class EventBus extends EventEmitter {
  private static instance: EventBus | null = null;
  private subscriptions: Map<string, EventSubscription> = new Map();
  private eventHistory: CanonicalEvent[] = [];
  private eventTopics: Map<string, EventTopic> = new Map();
  private initialized = false;
  private maxHistorySize = 100000;
  private stats = {
    totalEvents: 0,
    eventsByCategory: {} as Record<EventCategory, number>,
    eventsBySeverity: {} as Record<import('./types').EventSeverity, number>,
    eventsByStatus: {} as Record<EventStatus, number>,
    eventsPerSecond: 0,
    averageLatency: 0,
    lastSecondCount: 0,
    lastSecondTime: Date.now(),
  };

  private monitoringTimer: any = null;

  private constructor() {
    super();
    this.setupDefaultTopics();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Initialize the event bus
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[EVENT-BUS] Initializing real-time event fabric...');

    // Setup performance monitoring
    this.setupPerformanceMonitoring();

    this.initialized = true;
    console.log('[EVENT-BUS] Event bus initialized');
  }

  /**
   * Publish an event to the bus
   */
  public async publishEvent(event: CanonicalEvent): Promise<void> {
    if (!this.initialized) {
      throw new Error('Event bus not initialized');
    }

    const startTime = Date.now();

    try {
      // Update statistics
      this.updateStatistics(event);

      // Store in history
      this.eventHistory.push(event);
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }

      // Find matching subscriptions
      const matchingSubscriptions = Array.from(
        this.subscriptions.values()
      ).filter(
        (sub) =>
          sub.active &&
          this.matchesFilter(event, sub.filter)
      );

      // Deliver to subscribers
      const deliveryPromises = matchingSubscriptions.map((sub) =>
        this.deliverToSubscriber(sub, event)
      );

      await Promise.allSettled(deliveryPromises);

      // Emit bus event
      this.emit('event-published', {
        eventId: event.id,
        eventType: event.eventType,
        category: event.category,
        severity: event.severity,
        subscriberCount: matchingSubscriptions.length,
        latency: Date.now() - startTime,
      });

      console.log(
        `[EVENT-BUS] Published ${event.eventType} from ${event.sourceId} (${matchingSubscriptions.length} subscribers)`
      );
    } catch (error) {
      console.error('[EVENT-BUS] Error publishing event:', error);
      this.emit('event-publish-error', {
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Subscribe to events
   */
  public subscribe(
    filter: EventFilter,
    callback: (event: CanonicalEvent) => Promise<void>,
    metadata?: Record<string, any>
  ): string {
    const subscriptionId = uuidv4();

    const subscription: EventSubscription = {
      id: subscriptionId,
      filter,
      callback,
      active: true,
      createdAt: new Date().toISOString(),
      metadata,
    };

    this.subscriptions.set(subscriptionId, subscription);

    console.log(
      `[EVENT-BUS] Subscription created: ${subscriptionId} (${
        filter.categories?.join(', ') || 'all categories'
      })`
    );

    return subscriptionId;
  }

  /**
   * Unsubscribe from events
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    subscription.active = false;
    this.subscriptions.delete(subscriptionId);

    console.log(`[EVENT-BUS] Subscription removed: ${subscriptionId}`);
  }

  /**
   * Pause a subscription
   */
  public pauseSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    subscription.active = false;
  }

  /**
   * Resume a subscription
   */
  public resumeSubscription(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);

    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    subscription.active = true;
  }

  /**
   * Query historical events
   */
  public queryEvents(params: EventQueryParams): CanonicalEvent[] {
    let results = this.eventHistory.filter((event) =>
      this.matchesFilter(event, params.filter)
    );

    // Sort
    const sortBy = params.sortBy || 'timestamp';
    const sortOrder = params.sortOrder || 'desc';

    results.sort((a, b) => {
      let aVal: any = a[sortBy as keyof CanonicalEvent];
      let bVal: any = b[sortBy as keyof CanonicalEvent];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }

      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    // Paginate
    const offset = params.offset || 0;
    const limit = params.limit || 100;

    return results.slice(offset, offset + limit);
  }

  /**
   * Get event statistics
   */
  public getStatistics(): EventStatistics {
    return {
      totalEvents: this.stats.totalEvents,
      eventsByCategory: { ...this.stats.eventsByCategory },
      eventsBySeverity: { ...this.stats.eventsBySeverity },
      eventsByStatus: { ...this.stats.eventsByStatus },
      eventsPerSecond: this.stats.eventsPerSecond,
      averageLatency: this.stats.averageLatency,
      uniqueAssets: new Set(
        this.eventHistory
          .filter((e) => 'assetId' in e || 'affectedAssets' in e)
          .flatMap((e) => {
            if ('assetId' in e) return [e.assetId];
            if ('affectedAssets' in e) return e.affectedAssets;
            return [];
          })
      ).size,
      uniqueSources: new Set(this.eventHistory.map((e) => e.sourceId)).size,
      timeRange: {
        start: this.eventHistory[0]?.timestamp || new Date().toISOString(),
        end: this.eventHistory[this.eventHistory.length - 1]?.timestamp || new Date().toISOString(),
      },
    };
  }

  /**
   * Get active subscriptions
   */
  public getSubscriptions(): EventSubscription[] {
    return Array.from(this.subscriptions.values()).filter((s) => s.active);
  }

  /**
   * Register event topic
   */
  public registerTopic(topic: EventTopic): void {
    this.eventTopics.set(topic.name, topic);
    console.log(`[EVENT-BUS] Topic registered: ${topic.name}`);
  }

  /**
   * Get all topics
   */
  public getTopics(): EventTopic[] {
    return Array.from(this.eventTopics.values());
  }

  /**
   * Get topic by name
   */
  public getTopic(name: string): EventTopic | undefined {
    return this.eventTopics.get(name);
  }

  /**
   * Clear event history
   */
  public clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Get event history snapshot
   */
  public getEventHistory(): CanonicalEvent[] {
    return [...this.eventHistory];
  }

  /**
   * Shutdown event bus
   */
  public async shutdown(): Promise<void> {
    console.log('[EVENT-BUS] Shutting down event bus...');

    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }

    // Deactivate all subscriptions
    for (const subscription of this.subscriptions.values()) {
      subscription.active = false;
    }

    this.subscriptions.clear();
    this.eventHistory = [];
    this.initialized = false;

    console.log('[EVENT-BUS] Event bus shut down');
  }

  /**
   * Private: Setup default topics
   */
  private setupDefaultTopics(): void {
    const topics: EventTopic[] = [
      {
        name: 'telemetry',
        description: 'Real-time telemetry updates',
        category: 'TELEMETRY',
        eventTypes: ['TELEMETRY_UPDATED'],
        retention: '24h',
        partitions: 10,
      },
      {
        name: 'protection',
        description: 'Protection and breaker operations',
        category: 'PROTECTION',
        eventTypes: ['BREAKER_OPERATION'],
        retention: '30d',
        partitions: 5,
      },
      {
        name: 'alarms',
        description: 'Grid alarms and alerts',
        category: 'ALARM',
        eventTypes: ['ALARM_CREATED', 'ALARM_CLEARED', 'ALARM_ACKNOWLEDGED'],
        retention: '30d',
        partitions: 5,
      },
      {
        name: 'outages',
        description: 'Power outages and disruptions',
        category: 'OUTAGE',
        eventTypes: ['OUTAGE_CREATED', 'OUTAGE_UPDATED', 'OUTAGE_RESOLVED'],
        retention: '90d',
        partitions: 3,
      },
      {
        name: 'forecasts',
        description: 'Load and generation forecasts',
        category: 'FORECAST',
        eventTypes: ['FORECAST_UPDATED'],
        retention: '7d',
        partitions: 5,
      },
      {
        name: 'incidents',
        description: 'Grid incidents and issues',
        category: 'INCIDENT',
        eventTypes: ['INCIDENT_CREATED', 'INCIDENT_UPDATED', 'INCIDENT_RESOLVED'],
        retention: '90d',
        partitions: 3,
      },
    ];

    for (const topic of topics) {
      this.registerTopic(topic);
    }
  }

  /**
   * Check if event matches filter
   */
  public matchesFilter(event: CanonicalEvent, filter: EventFilter): boolean {
    // Category filter
    const categories = filter.categories || (filter as any).category;
    if (categories) {
      const catList = Array.isArray(categories) ? categories : [categories];
      if (!catList.includes(event.category)) return false;
    }

    // Event type filter
    const eventTypes = filter.eventTypes || (filter as any).eventType;
    if (eventTypes) {
      const typeList = Array.isArray(eventTypes) ? eventTypes : [eventTypes];
      if (!typeList.includes(event.eventType)) return false;
    }

    // Severity filter
    const severities = filter.severities || (filter as any).severity;
    if (severities) {
      const sevList = Array.isArray(severities) ? severities : [severities];
      if (!sevList.includes(event.severity)) return false;
    }

    // Status filter
    const statusValues = filter.statusValues || (filter as any).status;
    if (statusValues) {
      const statusList = Array.isArray(statusValues) ? statusValues : [statusValues];
      if (!statusList.includes(event.status)) return false;
    }

    // Asset filter
    const assetIds = filter.assetIds || (filter as any).assetId;
    if (assetIds) {
      const idList = Array.isArray(assetIds) ? assetIds : [assetIds];
      const hasAsset =
        ('assetId' in event && idList.includes((event as any).assetId)) ||
        ('affectedAssets' in event && (event as any).affectedAssets?.some((a: string) => idList.includes(a)));

      if (!hasAsset) return false;
    }

    // Source filter
    const sourceIds = filter.sourceIds || (filter as any).sourceId;
    if (sourceIds) {
      const srcList = Array.isArray(sourceIds) ? sourceIds : [sourceIds];
      const eventSrc = event.sourceId || (event as any).source?.providerId;
      if (!srcList.includes(eventSrc)) return false;
    }

    // Tags filter
    if (filter.tags && !filter.tags.some((tag) => event.tags?.includes(tag))) {
      return false;
    }

    // Time range filter
    if (filter.timeRange) {
      const eventTime = new Date(event.timestamp).getTime();
      const startTime = new Date(filter.timeRange.startTime).getTime();
      const endTime = new Date(filter.timeRange.endTime).getTime();

      if (eventTime < startTime || eventTime > endTime) {
        return false;
      }
    }

    // Custom filter
    if (filter.customFilter && !filter.customFilter(event)) {
      return false;
    }

    return true;
  }

  /**
   * Private: Deliver event to subscriber
   */
  private async deliverToSubscriber(
    subscription: EventSubscription,
    event: CanonicalEvent
  ): Promise<void> {
    try {
      await subscription.callback(event);
    } catch (error) {
      console.warn(
        `[EVENT-BUS] Delivery error for subscription ${subscription.id}:`,
        error
      );

      this.emit('delivery-error', {
        subscriptionId: subscription.id,
        eventId: event.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Private: Update statistics
   */
  private updateStatistics(event: CanonicalEvent): void {
    this.stats.totalEvents += 1;

    // By category
    if (!this.stats.eventsByCategory[event.category]) {
      this.stats.eventsByCategory[event.category] = 0;
    }
    this.stats.eventsByCategory[event.category] += 1;

    // By severity
    if (!this.stats.eventsBySeverity[event.severity]) {
      this.stats.eventsBySeverity[event.severity] = 0;
    }
    this.stats.eventsBySeverity[event.severity] += 1;

    // By status
    if (!this.stats.eventsByStatus[event.status]) {
      this.stats.eventsByStatus[event.status] = 0;
    }
    this.stats.eventsByStatus[event.status] += 1;

    // Events per second
    const now = Date.now();
    if (now - this.stats.lastSecondTime >= 1000) {
      this.stats.eventsPerSecond = this.stats.lastSecondCount;
      this.stats.lastSecondCount = 0;
      this.stats.lastSecondTime = now;
    }
    this.stats.lastSecondCount += 1;
  }

  /**
   * Private: Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }
    this.monitoringTimer = setInterval(() => {
      const stats = this.getStatistics();
      console.log(
        `[EVENT-BUS] Stats: ${stats.totalEvents} total, ` +
        `${stats.eventsPerSecond}/s, ` +
        `${Math.round(stats.averageLatency)}ms latency`
      );
    }, 60000); // Every minute
    if (this.monitoringTimer && typeof this.monitoringTimer.unref === 'function') {
      this.monitoringTimer.unref();
    }
  }
}

export default EventBus;
