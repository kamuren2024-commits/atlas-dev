/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Integration Tests
 * 
 * Tests for event bus, normalization, state store, and real-time delivery
 */

import { describe, it, expect, beforeEach, afterEach } from './test-helper';
import { EventFabric } from '../event-fabric/event-fabric';
import { EventBus } from '../event-fabric/event-bus';
import { EventNormalizer } from '../event-fabric/normalizer';
import { EventStateStore } from '../event-fabric/state-store';
import { InMemoryEventStore } from '../event-fabric/persistence';
import { CanonicalEvent } from '../event-fabric/types';

describe('Event Fabric - Integration Tests', () => {
  let eventFabric: EventFabric;
  let eventBus: EventBus;
  let normalizer: EventNormalizer;
  let stateStore: EventStateStore;

  beforeEach(async () => {
    eventFabric = EventFabric.getInstance();
    eventBus = EventBus.getInstance();
    normalizer = EventNormalizer.getInstance();
    stateStore = EventStateStore.getInstance();

    // Initialize without HTTP server
    await eventFabric.initialize();
  });

  afterEach(async () => {
    await eventFabric.shutdown();
  });

  // ==================== DATA FLOW ====================

  describe('Event Publishing Flow', () => {
    it('should publish telemetry and update state', async () => {
      const telemetry = {
        id: 'telemetry-001',
        assetId: 'substation-01',
        measurementType: 'voltage',
        value: 415.2,
        unit: 'kV',
        timestamp: new Date().toISOString(),
      };

      await eventFabric.publishTelemetry('SCADA', telemetry);

      // Check state was updated
      const state = stateStore.getAssetState('substation-01');
      expect(state).toBeDefined();
      expect(state?.lastTelemetry).toBeDefined();
    });

    it('should publish grid event and update state', async () => {
      const gridEvent = {
        id: 'event-001',
        assetId: 'breaker-01',
        eventType: 'BREAKER_TRIP',
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
      };

      await eventFabric.publishGridEvent('SCADA', gridEvent);

      const state = stateStore.getAssetState('breaker-01');
      expect(state).toBeDefined();
    });

    it('should maintain event history', async () => {
      const event1: CanonicalEvent = {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      const event2: CanonicalEvent = {
        id: 'event-002',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CLEARED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      await eventFabric.publishEvent(event1);
      await eventFabric.publishEvent(event2);

      const history = eventBus.getEventHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ==================== SUBSCRIPTION & FILTERING ====================

  describe('Subscription & Filtering', () => {
    it('should deliver events to matching subscribers', async () => {
      const receivedEvents: CanonicalEvent[] = [];

      const subscriptionId = eventFabric.subscribe(
        { category: 'ALARM' },
        async (event) => {
          receivedEvents.push(event);
        }
      );

      const event: CanonicalEvent = {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      await eventFabric.publishEvent(event);

      // Wait for async delivery
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(receivedEvents).toContainEqual(event);

      eventFabric.unsubscribe(subscriptionId);
    });

    it('should filter by severity', async () => {
      const receivedEvents: CanonicalEvent[] = [];

      const subscriptionId = eventFabric.subscribe(
        { severity: ['CRITICAL'] },
        async (event) => {
          receivedEvents.push(event);
        }
      );

      const lowEvent: CanonicalEvent = {
        id: 'event-low',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
      };

      const criticalEvent: CanonicalEvent = {
        id: 'event-critical',
        timestamp: new Date().toISOString(),
        category: 'OUTAGE',
        eventType: 'OUTAGE_STARTED',
        severity: 'CRITICAL',
        source: { providerId: 'SCADA', name: 'Test' },
        affectedAssets: ['asset-1'],
      };

      await eventFabric.publishEvent(lowEvent);
      await eventFabric.publishEvent(criticalEvent);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(receivedEvents).toContainEqual(criticalEvent);
      expect(receivedEvents).not.toContainEqual(lowEvent);

      eventFabric.unsubscribe(subscriptionId);
    });

    it('should query events with complex filter', () => {
      const event1: CanonicalEvent = {
        id: 'event-1',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      const event2: CanonicalEvent = {
        id: 'event-2',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      const event3: CanonicalEvent = {
        id: 'event-3',
        timestamp: new Date().toISOString(),
        category: 'OUTAGE',
        eventType: 'OUTAGE_STARTED',
        severity: 'CRITICAL',
        source: { providerId: 'SCADA', name: 'Test' },
        affectedAssets: ['asset-002'],
      };

      eventBus.publishEvent(event1);
      eventBus.publishEvent(event2);
      eventBus.publishEvent(event3);

      // Query for high-severity alarms on asset-001
      const results = eventFabric.queryEvents({
        category: ['ALARM'],
        severity: ['HIGH', 'CRITICAL'],
        assetId: ['asset-001'],
      });

      expect(results).toContainEqual(event1);
      expect(results).not.toContainEqual(event2);
      expect(results).not.toContainEqual(event3);
    });
  });

  // ==================== STATE MANAGEMENT ====================

  describe('State Management', () => {
    it('should aggregate state from multiple events', async () => {
      const telemetryEvent: CanonicalEvent = {
        id: 'event-1',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
        data: { voltage: 415.2 },
      };

      const alarmEvent: CanonicalEvent = {
        id: 'event-2',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      await eventFabric.publishEvent(telemetryEvent);
      await eventFabric.publishEvent(alarmEvent);

      const state = stateStore.getAssetState('asset-001');

      expect(state?.lastTelemetry).toEqual(telemetryEvent);
      expect(state?.lastAlarm).toEqual(alarmEvent);
      expect(state?.lastAlarmTime).toBeDefined();
    });

    it('should track outages globally', async () => {
      const outageEvent: CanonicalEvent = {
        id: 'event-outage',
        timestamp: new Date().toISOString(),
        category: 'OUTAGE',
        eventType: 'OUTAGE_STARTED',
        severity: 'CRITICAL',
        source: { providerId: 'SCADA', name: 'Test' },
        affectedAssets: ['asset-1', 'asset-2', 'asset-3'],
      };

      await eventFabric.publishEvent(outageEvent);

      const globalState = stateStore.getGlobalState();

      expect(globalState.activeOutages).toBeGreaterThanOrEqual(1);
      expect(globalState.totalAffectedAssets).toBeGreaterThanOrEqual(3);
    });

    it('should provide snapshot of current state', async () => {
      const event: CanonicalEvent = {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      await eventFabric.publishEvent(event);

      const snapshot = eventFabric.getState();

      expect(snapshot).toBeDefined();
      expect(snapshot.global).toBeDefined();
      expect(snapshot.assets).toBeDefined();
      expect(snapshot.sources).toBeDefined();
    });
  });

  // ==================== PERSISTENCE ====================

  describe('Event Persistence', () => {
    it('should buffer events for persistence', async () => {
      const event: CanonicalEvent = {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      await eventFabric.publishEvent(event);

      // Check buffer stats
      const stats = eventFabric.getStatistics();
      expect(stats.buffer).toBeDefined();
    });
  });

  // ==================== ERROR HANDLING ====================

  describe('Error Handling', () => {
    it('should handle invalid events gracefully', async () => {
      const invalidEvent: any = {
        id: 'event-001',
        // missing required fields
        category: 'TELEMETRY',
      };

      // Should not throw
      await eventFabric.publishEvent(invalidEvent);

      // Invalid event should not appear in history
      const history = eventBus.getEventHistory();
      expect(history.find((e) => e.id === 'event-001')).toBeUndefined();
    });

    it('should handle subscriber errors', async () => {
      let callCount = 0;

      const subscriptionId = eventFabric.subscribe(
        { category: 'ALARM' },
        async (event) => {
          callCount++;
          throw new Error('Subscriber error');
        }
      );

      const event: CanonicalEvent = {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      // Should not throw even if subscriber throws
      await eventFabric.publishEvent(event);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(callCount).toBe(1);

      eventFabric.unsubscribe(subscriptionId);
    });
  });

  // ==================== STATISTICS ====================

  describe('Statistics', () => {
    it('should track event statistics', async () => {
      const event1: CanonicalEvent = {
        id: 'event-1',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
      };

      const event2: CanonicalEvent = {
        id: 'event-2',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
      };

      await eventFabric.publishEvent(event1);
      await eventFabric.publishEvent(event2);

      const stats = eventFabric.getStatistics();

      expect(stats.events.totalEvents).toBeGreaterThanOrEqual(2);
      expect(stats.events.eventsByCategory).toBeDefined();
    });
  });
});
