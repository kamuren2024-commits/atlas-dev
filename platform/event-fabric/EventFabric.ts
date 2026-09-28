import { ObservabilityEngine } from '../observability/Observability';
import { generateShortId } from '../../src/core/shared/crypto';
import { EventStore } from '../persistence';

export type EnterpriseEventType =
  | 'TenderCreated'
  | 'TenderEvaluated'
  | 'SupplierFlagged'
  | 'ContractAwarded'
  | 'ContractExpired'
  | 'RiskDetected'
  | 'AgentTaskStarted'
  | 'AgentTaskCompleted'
  | 'WorkflowStateChanged';

export interface EnterpriseEvent<T = any> {
  id: string;
  type: EnterpriseEventType;
  version: string;
  source: string;
  tenantId: string;
  traceId: string;
  timestamp: string;
  payload: T;
}

export type EventSubscriber = (event: EnterpriseEvent) => Promise<void>;

export class EventFabricEngine {
  private static instance: EventFabricEngine;
  private subscribers = new Map<EnterpriseEventType, Set<EventSubscriber>>();
  private eventStore: EnterpriseEvent[] = [];
  private deadLetterQueue: Array<{ event: EnterpriseEvent; error: string; timestamp: string }> = [];
  private retryQueue: Array<{ event: EnterpriseEvent; retriesRemaining: number; nextAttemptAt: string }> = [];

  private constructor() {
    this.startRetryMonitor();
  }

  public static getInstance(): EventFabricEngine {
    if (!EventFabricEngine.instance) {
      EventFabricEngine.instance = new EventFabricEngine();
    }
    return EventFabricEngine.instance;
  }

  /**
   * Register a subscriber callback for a specific event channel
   */
  public subscribe(eventType: EnterpriseEventType, subscriber: EventSubscriber): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(subscriber);
  }

  public unsubscribe(eventType: EnterpriseEventType, subscriber: EventSubscriber): void {
    const list = this.subscribers.get(eventType);
    if (list) {
      list.delete(subscriber);
    }
  }

  /**
   * Resilient broadcast of events to active listeners
   */
  public async publish<T>(
    type: EnterpriseEventType,
    source: string,
    tenantId: string,
    payload: T,
    traceId?: string
  ): Promise<string> {
    const correlationId = traceId || ObservabilityEngine.generateCorrelationId();
    const eventId = generateShortId('evt');

    const event: EnterpriseEvent<T> = {
      id: eventId,
      type,
      version: '1.0.0',
      source,
      tenantId,
      traceId: correlationId,
      timestamp: new Date().toISOString(),
      payload
    };

    this.eventStore.push(event);

    // Keep events capped (cap store size at 1000 items)
    if (this.eventStore.length > 1000) {
      this.eventStore.shift();
    }

    // Persist to database (async, non-blocking)
    EventStore.save({
      eventId: event.id,
      eventType: event.type,
      category: 'ENTERPRISE',
      severity: 'INFO',
      status: 'PENDING',
      source: event.source,
      payload: event.payload,
      correlationId: event.traceId,
      tenantId: event.tenantId,
    }).catch(err => console.error('[EventFabric] Failed to persist event:', err.message));

    // Trace dynamic delivery
    await ObservabilityEngine.traceAction(
      `EVENT_PUBLISH_${type.toUpperCase()}`,
      source,
      { eventId, tenantId },
      async () => {
        const listeners = this.subscribers.get(type);
        if (listeners) {
          for (const listener of listeners) {
            setImmediate(async () => {
              try {
                await listener(event);
              } catch (err: any) {
                console.error(`Subscribed listener failed handling event [${type}]:`, err);
                this.handleDeliveryFailure(event, err.message || String(err));
              }
            });
          }
        }
      },
      correlationId
    );

    return eventId;
  }

  /**
   * Replays matching past messages in strict order
   */
  public replayEvents(type: EnterpriseEventType, sinceTimestamp: string): EnterpriseEvent[] {
    const targetTime = new Date(sinceTimestamp).getTime();
    return this.eventStore.filter(evt => evt.type === type && new Date(evt.timestamp).getTime() >= targetTime);
  }

  public getStore() {
    return this.eventStore;
  }

  public getDLQ() {
    return this.deadLetterQueue;
  }

  public getRetryQueue() {
    return this.retryQueue;
  }

  /**
   * Delivery failures are caught, retry is attempted, and finally sent to DLQ
   */
  private handleDeliveryFailure(event: EnterpriseEvent, error: string): void {
    // Retry up to 3 times before pushing to DLQ
    const retriesRemaining = 3;
    const nextAttemptAt = new Date(Date.now() + 5000).toISOString(); // Retry in 5 seconds
    this.retryQueue.push({ event, retriesRemaining, nextAttemptAt });
  }

  private startRetryMonitor(): void {
    setInterval(async () => {
      const now = Date.now();
      const pending = this.retryQueue.filter(r => new Date(r.nextAttemptAt).getTime() <= now);

      for (const item of pending) {
        // Remove from retry queue
        const idx = this.retryQueue.indexOf(item);
        if (idx > -1) this.retryQueue.splice(idx, 1);

        try {
          // Re-attempt delivery
          const listeners = this.subscribers.get(item.event.type);
          if (listeners) {
            for (const listener of listeners) {
              await listener(item.event);
            }
          }
        } catch (err: any) {
          if (item.retriesRemaining > 1) {
            // Re-enque with decremented priority
            this.retryQueue.push({
              event: item.event,
              retriesRemaining: item.retriesRemaining - 1,
              nextAttemptAt: new Date(Date.now() + 10000).toISOString() // Backoff 10s
            });
          } else {
            // Push to DLQ permanently
            this.deadLetterQueue.push({
              event: item.event,
              error: err.message || String(err),
              timestamp: new Date().toISOString()
            });
          }
        }
      }
    }, 3000);
  }
}
