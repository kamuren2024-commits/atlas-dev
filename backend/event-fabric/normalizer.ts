/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Event Normalizer Pipeline
 * 
 * Transforms provider-specific events into canonical format
 */

import { v4 as uuidv4 } from 'uuid';
import {
  CanonicalEvent,
  TelemetryUpdateEvent,
  AssetStateChangedEvent,
  AlarmEvent,
  OutageEvent,
  IncidentEvent,
  EventStatus,
  EventSeverity,
} from './types';
import { GridTelemetry, GridEvent } from '../data-fabric/types';

/**
 * Event Normalizer - Converts any input to canonical events
 */
export class EventNormalizer {
  private static instance: EventNormalizer | null = null;
  private normalizedCount = 0;
  private dropCount = 0;

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): EventNormalizer {
    if (!EventNormalizer.instance) {
      EventNormalizer.instance = new EventNormalizer();
    }
    return EventNormalizer.instance;
  }

  /**
   * Normalize telemetry into event
   */
  public normalizeTelemetry(
    providerId: string,
    telemetry: any,
    previousTelemetry?: any
  ): TelemetryUpdateEvent {
    const event: any = {
      id: telemetry.id || uuidv4(),
      eventType: 'TELEMETRY_UPDATED',
      category: 'TELEMETRY',
      timestamp: telemetry.timestamp || new Date().toISOString(),
      sourceId: providerId,
      source: {
        providerId,
        name: providerId,
      },
      severity: this.calculateTelemetrySeverity(telemetry),
      status: 'PENDING',
      assetId: telemetry.assetId,
      telemetry,
      tags: [providerId, telemetry.assetId].filter(Boolean),
      metadata: {
        quality: telemetry.quality,
        normalized: true,
      },
    };

    // Calculate delta from previous
    if (previousTelemetry && telemetry.measurements && previousTelemetry.measurements) {
      const deltaFromPrevious: Record<string, number> = {};

      for (const [key, value] of Object.entries(telemetry.measurements)) {
        if (typeof value === 'number') {
          const prevValue = previousTelemetry.measurements[key];
          if (typeof prevValue === 'number') {
            deltaFromPrevious[key] = value - prevValue;
          }
        }
      }

      if (Object.keys(deltaFromPrevious).length > 0) {
        event.deltaFromPrevious = deltaFromPrevious;
      }
    }

    this.normalizedCount += 1;
    return event;
  }

  /**
   * Normalize alarm event
   */
  public normalizeAlarm(
    providerId: string,
    alarmType: string,
    affectedAsset: string,
    data: Record<string, any>
  ): AlarmEvent {
    const event: AlarmEvent = {
      id: uuidv4(),
      eventType: 'ALARM_CREATED',
      category: 'ALARM',
      timestamp: new Date().toISOString(),
      sourceId: providerId,
      severity: this.mapSeverity(data.severity || 'WARNING'),
      status: 'PENDING',
      alarmId: data.alarmId || uuidv4(),
      alarmType,
      affectedAsset,
      description: data.description || `Alarm: ${alarmType}`,
      threshold: data.threshold,
      currentValue: data.currentValue,
      priority: data.priority || 3,
      tags: [providerId, alarmType, affectedAsset],
      metadata: {
        rawAlarm: data,
      },
    };

    this.normalizedCount += 1;
    return event;
  }

  /**
   * Normalize outage event
   */
  public normalizeOutage(
    providerId: string,
    outageId: string,
    affectedAssets: string[],
    data: Record<string, any>
  ): OutageEvent {
    const event: OutageEvent = {
      id: uuidv4(),
      eventType: 'OUTAGE_CREATED',
      category: 'OUTAGE',
      timestamp: new Date().toISOString(),
      sourceId: providerId,
      severity: data.customersAffected > 10000 ? 'CRITICAL' : 'WARNING',
      status: 'PENDING',
      outageId,
      affectedAssets,
      customersAffected: data.customersAffected || 0,
      estimatedDuration: data.estimatedDuration,
      cause: data.cause,
      startTime: data.startTime || new Date().toISOString(),
      endTime: data.endTime,
      restorationTime: data.restorationTime,
      tags: [providerId, 'outage', ...affectedAssets],
      metadata: {
        rawOutage: data,
      },
    };

    this.normalizedCount += 1;
    return event;
  }

  /**
   * Normalize incident event
   */
  public normalizeIncident(
    providerId: string,
    incidentId: string,
    title: string,
    affectedAssets: string[],
    data: Record<string, any>
  ): IncidentEvent {
    const event: IncidentEvent = {
      id: uuidv4(),
      eventType: 'INCIDENT_CREATED',
      category: 'INCIDENT',
      timestamp: new Date().toISOString(),
      sourceId: providerId,
      severity: this.mapSeverity(data.severity || 'WARNING'),
      status: 'PENDING',
      incidentId,
      title,
      description: data.description || title,
      affectedAssets,
      rootCause: data.rootCause,
      resolution: data.resolution,
      assignedTo: data.assignedTo,
      priority: data.priority || 3,
      relatedEvents: data.relatedEvents,
      tags: [providerId, 'incident', ...affectedAssets],
      metadata: {
        rawIncident: data,
      },
    };

    this.normalizedCount += 1;
    return event;
  }

  /**
   * Normalize generic grid event
   */
  public normalizeGridEvent(providerId: string, gridEvent: any): CanonicalEvent {
    const type = gridEvent.type || gridEvent.eventType;
    const category = gridEvent.category || (type && type.startsWith('BREAKER') ? 'BREAKER' : 'INCIDENT');
    const assetId = gridEvent.assetId || gridEvent.sourceId;
    const payload = gridEvent.payload || gridEvent;

    let canonicalEvent: CanonicalEvent;

    switch (type) {
      case 'TELEMETRY_UPDATED':
        canonicalEvent = {
          id: gridEvent.id || uuidv4(),
          eventType: 'TELEMETRY_UPDATED',
          category: 'TELEMETRY',
          timestamp: gridEvent.timestamp || new Date().toISOString(),
          sourceId: providerId,
          severity: this.mapSeverity(payload.severity || 'INFO'),
          status: 'PENDING' as EventStatus,
          assetId,
          telemetry: payload as GridTelemetry,
          tags: [providerId, assetId].filter(Boolean),
          metadata: payload,
        } as TelemetryUpdateEvent;
        break;

      case 'ALARM_CREATED':
      case 'ALARM_CLEARED':
        canonicalEvent = {
          id: gridEvent.id || uuidv4(),
          eventType: type as any,
          category: 'ALARM',
          timestamp: gridEvent.timestamp || new Date().toISOString(),
          sourceId: providerId,
          severity: this.mapSeverity(gridEvent.severity || payload.severity),
          status: type === 'ALARM_CLEARED' ? 'RESOLVED' : 'PENDING',
          alarmId: payload.alarmId || uuidv4(),
          alarmType: payload.alarmType || 'UNKNOWN',
          affectedAsset: assetId,
          description: payload.description || 'Alarm event',
          priority: payload.priority || 3,
          tags: [providerId, assetId].filter(Boolean),
          metadata: payload,
        } as AlarmEvent;
        break;

      case 'OUTAGE_CREATED':
      case 'OUTAGE_UPDATED':
        canonicalEvent = {
          id: gridEvent.id || uuidv4(),
          eventType: type as any,
          category: 'OUTAGE',
          timestamp: gridEvent.timestamp || new Date().toISOString(),
          sourceId: providerId,
          severity: 'CRITICAL',
          status: 'PENDING',
          outageId: payload.outageId || uuidv4(),
          affectedAssets: payload.affectedAssets || (assetId ? [assetId] : []),
          customersAffected: payload.customersAffected || 0,
          cause: payload.cause,
          startTime: gridEvent.timestamp || new Date().toISOString(),
          tags: [providerId, assetId].filter(Boolean),
          metadata: payload,
        } as OutageEvent;
        break;

      default:
        // Generic or breaker event
        canonicalEvent = {
          id: gridEvent.id || uuidv4(),
          eventType: type,
          category: category as any,
          timestamp: gridEvent.timestamp || new Date().toISOString(),
          sourceId: providerId,
          severity: this.mapSeverity(gridEvent.severity || payload.severity || 'INFO'),
          status: 'PENDING',
          assetId,
          description: gridEvent.description || payload.description,
          tags: [providerId, assetId].filter(Boolean),
          metadata: payload,
        } as any;
    }

    this.normalizedCount += 1;
    return canonicalEvent;
  }

  /**
   * Validate canonical event
   */
  public validateEvent(event: CanonicalEvent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!event.id) errors.push('Missing event ID');
    if (!event.eventType) errors.push('Missing event type');
    if (!event.category) errors.push('Missing category');
    if (!event.timestamp) errors.push('Missing timestamp');
    const hasSource = !!event.sourceId || !!(event as any).source?.providerId || !!(event as any).source;
    if (!hasSource) errors.push('Missing source ID');
    if (!event.severity) errors.push('Missing severity');
    if (event.status !== undefined && !['PENDING', 'ACKNOWLEDGED', 'RESOLVED', 'ESCALATED'].includes(event.status)) {
      errors.push('Invalid status');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get normalization statistics
   */
  public getStats(): {
    normalizedCount: number;
    droppedCount: number;
  } {
    return {
      normalizedCount: this.normalizedCount,
      droppedCount: this.dropCount,
    };
  }

  /**
   * Private: Calculate telemetry severity
   */
  private calculateTelemetrySeverity(telemetry: any): EventSeverity {
    // If quality is low, increase severity
    if (telemetry?.quality && telemetry.quality.confidence < 50) {
      return 'WARNING';
    }

    // Check for out-of-range values
    const measurements = telemetry?.measurements || telemetry || {};
    const voltage = measurements.voltage || (telemetry?.measurementType === 'voltage' ? telemetry.value : undefined);
    const frequency = measurements.frequency || (telemetry?.measurementType === 'frequency' ? telemetry.value : undefined);

    if (voltage && (voltage < 200 || voltage > 250)) {
      return 'WARNING';
    }

    if (frequency && (frequency < 49.5 || frequency > 50.5)) {
      return 'WARNING';
    }

    return 'INFO';
  }

  /**
   * Private: Map severity values
   */
  private mapSeverity(rawSeverity: string): any {
    if (!rawSeverity) return 'INFO';
    const severity = rawSeverity.toUpperCase();

    if (severity === 'HIGH' || severity.includes('HIGH')) {
      return 'HIGH';
    }

    if (severity.includes('CRITICAL') || severity.includes('SEVERE')) {
      return 'CRITICAL';
    }

    if (severity.includes('ALERT') || severity.includes('EMERGENCY')) {
      return 'ALERT';
    }

    if (severity.includes('WARNING') || severity.includes('WARN')) {
      return 'WARNING';
    }

    return 'INFO';
  }
}

export default EventNormalizer;
