/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Unit Tests
 * 
 * Tests for event types, normalization, filtering
 */

import { describe, it, expect, beforeEach } from './test-helper';
import { EventBus } from '../event-fabric/event-bus';
import { EventNormalizer } from '../event-fabric/normalizer';
import { EventStateStore } from '../event-fabric/state-store';
import { EventPersistenceManager } from '../event-fabric/persistence';
import { CanonicalEvent, EventFilter } from '../event-fabric/types';

describe('Event Fabric - Unit Tests', () => {
  let eventBus: EventBus;
  let normalizer: EventNormalizer;
  let stateStore: EventStateStore;

  beforeEach(async () => {
    // Reset singletons for each test
    eventBus = EventBus.getInstance();
    await eventBus.initialize();
    normalizer = EventNormalizer.getInstance();
    stateStore = EventStateStore.getInstance();
    stateStore.clearState();
  });

  // ==================== EVENT NORMALIZATION ====================

  describe('EventNormalizer', () => {
    it('should normalize telemetry data correctly', () => {
      const telemetry = {
        id: 'telemetry-123',
        assetId: 'substation-01',
        measurementType: 'voltage',
        value: 415.2,
        unit: 'kV',
        timestamp: new Date().toISOString(),
      };

      const normalized = normalizer.normalizeTelemetry('SCADA', telemetry);

      expect(normalized).toBeDefined();
      expect(normalized.category).toBe('TELEMETRY');
      expect(normalized.eventType).toBe('TELEMETRY_UPDATED');
      expect(normalized.assetId).toBe('substation-01');
      expect(normalized.source.providerId).toBe('SCADA');
    });

    it('should generate ID for missing telemetry', () => {
      const telemetry = {
        assetId: 'substation-01',
        measurementType: 'current',
        value: 250.5,
        unit: 'A',
        timestamp: new Date().toISOString(),
      };

      const normalized = normalizer.normalizeTelemetry('SCADA', telemetry);

      expect(normalized.id).toBeDefined();
      expect(normalized.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('should normalize grid events correctly', () => {
      const gridEvent = {
        id: 'event-456',
        assetId: 'breaker-01',
        eventType: 'BREAKER_TRIP',
        severity: 'HIGH',
        timestamp: new Date().toISOString(),
        description: 'Breaker tripped due to overcurrent',
      };

      const normalized = normalizer.normalizeGridEvent('SCADA', gridEvent);

      expect(normalized).toBeDefined();
      expect(normalized.category).toBe('BREAKER');
      expect(normalized.eventType).toBe('BREAKER_TRIP');
      expect(normalized.severity).toBe('HIGH');
    });

    it('should preserve canonical asset identity on normalized events', () => {
      const normalized = normalizer.normalizeGridEvent('SCADA', {
        id: 'event-canon',
        eventType: 'TELEMETRY_UPDATED',
        category: 'TELEMETRY',
        sourceAssetId: 'rtu-42',
        canonicalAssetId: 'substation-01',
        timestamp: new Date().toISOString(),
        severity: 'INFO',
      });

      expect(normalized.canonicalAssetId).toBe('substation-01');
      expect(normalized.assetId).toBe('substation-01');
      expect(normalized.sourceAssetId).toBe('rtu-42');
    });

    it('should not fabricate an asset id from the provider when the canonical id is missing', () => {
      const normalized = normalizer.normalizeGridEvent('SCADA', {
        id: 'event-no-asset',
        eventType: 'BREAKER_TRIP',
        timestamp: new Date().toISOString(),
        severity: 'HIGH',
        description: 'Breaker tripped',
      });

      expect(normalized.assetId).toBeUndefined();
      expect(normalized.tags).toContain('SCADA');
    });

    it('should detach the persistence flush timer so it does not keep the process alive', () => {
      const originalSetInterval = global.setInterval;
      let unrefCalled = false;

      try {
        (global as any).setInterval = (() => {
          return {
            unref: () => {
              unrefCalled = true;
            },
          } as any;
        }) as typeof setInterval;

        const persistence = EventPersistenceManager.getInstance();
        persistence.initialize();

        expect(unrefCalled).toBe(true);
        persistence.shutdown();
      } finally {
        (global as any).setInterval = originalSetInterval;
      }
    });

    it('should validate correct event', () => {
      const event: CanonicalEvent = {
        id: 'event-789',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: {
          providerId: 'SCADA',
          name: 'Test Provider',
        },
        assetId: 'asset-123',
      };

      const validation = normalizer.validateEvent(event);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reject event with missing required fields', () => {
      const event: any = {
        id: 'event-789',
        // missing timestamp
        category: 'TELEMETRY',
        severity: 'INFO',
        source: {
          providerId: 'SCADA',
        },
      };

      const validation = normalizer.validateEvent(event);

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  // ==================== EVENT BUS ====================

  describe('EventBus', () => {
    it('should publish event successfully', async () => {
      const event: CanonicalEvent = {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      await eventBus.publishEvent(event);

      const history = eventBus.getEventHistory();
      expect(history).toContainEqual(event);
    });

    it('should subscribe to events with filter', async () => {
      const events: CanonicalEvent[] = [];

      const subscriptionId = eventBus.subscribe(
        { category: 'TELEMETRY' },
        async (event) => {
          events.push(event);
        }
      );

      expect(subscriptionId).toBeDefined();

      const event: CanonicalEvent = {
        id: 'event-002',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      await eventBus.publishEvent(event);

      // Give async callback time to execute
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(events).toContainEqual(event);
    });

    it('should filter events by severity', async () => {
      const events: CanonicalEvent[] = [];

      const subscriptionId = eventBus.subscribe(
        { severity: ['HIGH', 'CRITICAL'] },
        async (event) => {
          events.push(event);
        }
      );

      // Publish low severity event
      const lowEvent: CanonicalEvent = {
        id: 'event-low',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
      };

      await eventBus.publishEvent(lowEvent);

      // Publish high severity event
      const highEvent: CanonicalEvent = {
        id: 'event-high',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      await eventBus.publishEvent(highEvent);

      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(events).toEqual([highEvent]);
      expect(events).not.toContainEqual(lowEvent);
    });

    it('should unsubscribe from events', () => {
      const subscriptionId = eventBus.subscribe(
        { category: 'TELEMETRY' },
        async () => {}
      );

      eventBus.unsubscribe(subscriptionId);

      const subs = eventBus.getSubscriptions();
      expect(subs.find((s) => s.id === subscriptionId)).toBeUndefined();
    });
  });

  // ==================== EVENT STATE STORE ====================

  describe('EventStateStore', () => {
    it('should update state from telemetry event', () => {
      const event: CanonicalEvent = {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'substation-01',
        data: {
          voltage: 415.2,
          unit: 'kV',
        },
      };

      stateStore.updateFromEvent(event);

      const state = stateStore.getAssetState('substation-01');

      expect(state).toBeDefined();
      expect(state?.lastTelemetry).toEqual(event);
    });

    it('should track alarm events', () => {
      const event: CanonicalEvent = {
        id: 'event-002',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'breaker-01',
      };

      stateStore.updateFromEvent(event);

      const state = stateStore.getAssetState('breaker-01');

      expect(state).toBeDefined();
      expect(state?.lastAlarm).toEqual(event);
    });

    it('should update state from canonical asset ids without inventing a source asset', () => {
      const event: CanonicalEvent = {
        id: 'event-canonical-asset',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        canonicalAssetId: 'substation-01',
        sourceAssetId: 'rtu-42',
        version: 2,
        telemetry: { measurements: { voltage: 220 } },
      } as any;

      stateStore.updateFromEvent(event);

      expect(stateStore.getAssetState('substation-01')).toBeDefined();
      expect(stateStore.getAssetState('SCADA')).toBeUndefined();
    });

    it('should allow a checked event to be accepted once and then rejected as duplicate', () => {
      const event: CanonicalEvent = {
        id: 'event-dupe-check',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-dupe-check',
        version: 1,
        telemetry: { measurements: { voltage: 220 } },
      } as any;

      expect(stateStore.evaluateSpatialProjectionVersion(event)).toBe('accepted');
      stateStore.updateFromEvent(event);

      expect(stateStore.getAssetState('asset-dupe-check')).toBeDefined();
      expect(stateStore.evaluateSpatialProjectionVersion(event)).toBe('ignored_duplicate');
    });

    it('should accept versionless events that share the same timestamp on one asset', () => {
      const firstEvent: CanonicalEvent = {
        id: 'event-same-time-1',
        timestamp: '2024-01-01T00:00:00.000Z',
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-same-time',
        data: { voltage: 220 },
      } as any;

      const secondEvent: CanonicalEvent = {
        id: 'event-same-time-2',
        timestamp: '2024-01-01T00:00:00.000Z',
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-same-time',
      } as any;

      stateStore.updateFromEvent(firstEvent);
      expect(stateStore.evaluateSpatialProjectionVersion(secondEvent)).toBe('accepted');

      stateStore.updateFromEvent(secondEvent);
      expect(stateStore.getAssetState('asset-same-time')?.lastAlarm).toEqual(secondEvent);
      expect(stateStore.getAssetState('asset-same-time')?.lastEvent).toEqual(secondEvent);
    });

    it('should maintain global state', () => {
      const event1: CanonicalEvent = {
        id: 'event-101',
        timestamp: new Date().toISOString(),
        category: 'OUTAGE',
        eventType: 'OUTAGE_STARTED',
        severity: 'CRITICAL',
        source: { providerId: 'SCADA', name: 'Test' },
        affectedAssets: ['asset-1', 'asset-2'],
      };

      const event2: CanonicalEvent = {
        id: 'event-102',
        timestamp: new Date().toISOString(),
        category: 'INCIDENT',
        eventType: 'INCIDENT_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
      };

      stateStore.updateFromEvent(event1);
      stateStore.updateFromEvent(event2);

      const global = stateStore.getGlobalState();

      expect(global.activeOutages).toBeGreaterThanOrEqual(1);
      expect(global.activeIncidents).toBeGreaterThanOrEqual(1);
    });
  });

  // ==================== EVENT FILTERING ====================

  describe('Event Filtering', () => {
    it('should match event by category', () => {
      const filter: EventFilter = {
        category: ['TELEMETRY'],
      };

      const event: CanonicalEvent = {
        id: 'event-001',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
      };

      const matches = eventBus.matchesFilter(event, filter);

      expect(matches).toBe(true);
    });

    it('should filter events with multiple criteria', () => {
      const filter: EventFilter = {
        category: ['ALARM', 'OUTAGE'],
        severity: ['HIGH', 'CRITICAL'],
        assetId: ['asset-001'],
      };

      const matchingEvent: CanonicalEvent = {
        id: 'event-match',
        timestamp: new Date().toISOString(),
        category: 'ALARM',
        eventType: 'ALARM_CREATED',
        severity: 'HIGH',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      const nonMatchingEvent: CanonicalEvent = {
        id: 'event-nomatch',
        timestamp: new Date().toISOString(),
        category: 'TELEMETRY',
        eventType: 'TELEMETRY_UPDATED',
        severity: 'INFO',
        source: { providerId: 'SCADA', name: 'Test' },
        assetId: 'asset-001',
      };

      expect(eventBus.matchesFilter(matchingEvent, filter)).toBe(true);
      expect(eventBus.matchesFilter(nonMatchingEvent, filter)).toBe(false);
    });
  });
});
