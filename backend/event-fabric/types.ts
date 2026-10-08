/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Canonical Event Types
 * 
 * Defines all canonical event types for grid operations
 * All events normalized to these types regardless of source
 */

import { GridAsset, GridTelemetry } from '../data-fabric/types';
import type { AtlasEntityRef, AtlasProvenance } from '../../packages/contracts/atlas-fabric';
import type { ProjectMilestoneUpdatedEvent } from '../../packages/contracts/project-schedule';

export type EventSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'ALERT';
export type EventStatus = 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED' | 'ESCALATED';
export type EventCategory = 
  | 'TELEMETRY'
  | 'ASSET_STATE'
  | 'PROTECTION'
  | 'MAINTENANCE'
  | 'MARKET'
  | 'WEATHER'
  | 'OUTAGE'
  | 'FORECAST'
  | 'INCIDENT'
  | 'ALARM'
  | 'PROJECT';

/**
 * Base Event - All events inherit from this
 */
export interface BaseEvent {
  id: string;
  eventType: string;
  category: EventCategory;
  timestamp: string;
  sourceId: string; // Provider ID
  severity: EventSeverity;
  status: EventStatus;
  correlationId?: string; // Link related events
  /** Additive Atlas fabric metadata for progressive cross-module adoption. */
  tenantId?: string;
  projectId?: string;
  payloadVersion?: string;
  entity?: AtlasEntityRef;
  provenance?: AtlasProvenance[];
  tags: string[];
  metadata: Record<string, any>;
}

/**
 * Telemetry Update Event
 */
export interface TelemetryUpdateEvent extends BaseEvent {
  eventType: 'TELEMETRY_UPDATED';
  category: 'TELEMETRY';
  assetId: string;
  telemetry: GridTelemetry;
  deltaFromPrevious?: Record<string, number>;
  thresholdsExceeded?: string[];
}

/**
 * Asset State Changed Event
 */
export interface AssetStateChangedEvent extends BaseEvent {
  eventType: 'ASSET_STATE_CHANGED';
  category: 'ASSET_STATE';
  assetId: string;
  previousState: Record<string, any>;
  newState: Record<string, any>;
  stateChanges: Array<{
    field: string;
    previousValue: any;
    newValue: any;
  }>;
}

/**
 * Breaker Operation Event
 */
export interface BreakerOperationEvent extends BaseEvent {
  eventType: 'BREAKER_OPERATION';
  category: 'PROTECTION';
  breakerId: string;
  operation: 'OPEN' | 'CLOSE' | 'TRIP';
  reason: string;
  automaticTrip?: boolean;
  current?: number;
}

/**
 * Alarm Event
 */
export interface AlarmEvent extends BaseEvent {
  eventType: 'ALARM_CREATED' | 'ALARM_CLEARED' | 'ALARM_ACKNOWLEDGED';
  category: 'ALARM';
  alarmId: string;
  alarmType: string;
  affectedAsset: string;
  description: string;
  threshold?: number;
  currentValue?: number;
  priority: 1 | 2 | 3 | 4 | 5; // 1=highest
}

/**
 * Outage Event
 */
export interface OutageEvent extends BaseEvent {
  eventType: 'OUTAGE_CREATED' | 'OUTAGE_UPDATED' | 'OUTAGE_STARTED' | 'OUTAGE_RESOLVED';
  category: 'OUTAGE';
  outageId: string;
  affectedAssets: string[];
  customersAffected: number;
  estimatedDuration?: number;
  cause?: string;
  startTime: string;
  endTime?: string;
  restorationTime?: string;
}

/**
 * Maintenance Event
 */
export interface MaintenanceEvent extends BaseEvent {
  eventType: 'MAINTENANCE_SCHEDULED' | 'MAINTENANCE_STARTED' | 'MAINTENANCE_COMPLETED';
  category: 'MAINTENANCE';
  workOrderId: string;
  assetId: string;
  maintenanceType: string;
  scheduledTime?: string;
  completedTime?: string;
  duration?: number;
  technician?: string;
}

/**
 * Forecast Event
 */
export interface ForecastEvent extends BaseEvent {
  eventType: 'FORECAST_UPDATED';
  category: 'FORECAST';
  forecastId: string;
  forecastType: string;
  assetId?: string;
  forecastHorizon: string; // e.g., "1h", "24h", "7d"
  predictions: Array<{
    timestamp: string;
    value: number;
    confidence: number;
    lowBound?: number;
    highBound?: number;
  }>;
  modelVersion: string;
}

/**
 * Risk Event
 */
export interface RiskEvent extends BaseEvent {
  eventType: 'RISK_UPDATED' | 'RISK_ESCALATED';
  category: 'INCIDENT';
  riskId: string;
  riskType: string;
  affectedAssets: string[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  mitigationActions: string[];
  estimatedImpact?: string;
}

/**
 * Market Event
 */
export interface MarketEvent extends BaseEvent {
  eventType: 'MARKET_PRICE_UPDATED' | 'MARKET_CONGESTION' | 'DISPATCH_INSTRUCTION';
  category: 'MARKET';
  marketId: string;
  price?: number;
  priceMovement?: number;
  volume?: number;
  congestionLevel?: number;
  dispatchInstruction?: {
    generatorId: string;
    instruction: string;
    startTime: string;
  };
}

/**
 * Weather Event
 */
export interface WeatherEvent extends BaseEvent {
  eventType: 'WEATHER_UPDATED' | 'WEATHER_ALERT';
  category: 'WEATHER';
  locationId: string;
  temperature?: number;
  windSpeed?: number;
  windDirection?: number;
  solarRadiation?: number;
  rainfall?: number;
  alert?: {
    type: string;
    severity: string;
    message: string;
  };
}

/**
 * Incident Event
 */
export interface IncidentEvent extends BaseEvent {
  eventType: 'INCIDENT_CREATED' | 'INCIDENT_UPDATED' | 'INCIDENT_RESOLVED';
  category: 'INCIDENT';
  incidentId: string;
  title: string;
  description: string;
  affectedAssets: string[];
  rootCause?: string;
  resolution?: string;
  assignedTo?: string;
  priority: 1 | 2 | 3 | 4 | 5;
  relatedEvents?: string[];
}

/**
 * Union type of all canonical events
 */
export type CanonicalEvent =
  | TelemetryUpdateEvent
  | AssetStateChangedEvent
  | BreakerOperationEvent
  | AlarmEvent
  | OutageEvent
  | MaintenanceEvent
  | ForecastEvent
  | RiskEvent
  | MarketEvent
  | WeatherEvent
  | IncidentEvent
  | ProjectMilestoneUpdatedEvent;

/**
 * Event Subscription Filter
 */
export interface EventFilter {
  categories?: EventCategory[];
  eventTypes?: string[];
  severities?: EventSeverity[];
  assetIds?: string[];
  sourceIds?: string[];
  statusValues?: EventStatus[];
  timeRange?: {
    startTime: string;
    endTime: string;
  };
  tags?: string[];
  customFilter?: (event: CanonicalEvent) => boolean;
}

/**
 * Event Subscription
 */
export interface EventSubscription {
  id: string;
  filter: EventFilter;
  callback: (event: CanonicalEvent) => Promise<void>;
  active: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

/**
 * Event Statistics
 */
export interface EventStatistics {
  totalEvents: number;
  eventsByCategory: Record<EventCategory, number>;
  eventsBySeverity: Record<EventSeverity, number>;
  eventsByStatus: Record<EventStatus, number>;
  eventsPerSecond: number;
  averageLatency: number;
  uniqueAssets: number;
  uniqueSources: number;
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Event Query Parameters
 */
export interface EventQueryParams {
  filter: EventFilter;
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'severity' | 'category';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Spatial projection version guard for GIS / digital twin consumers.
 * Prevents stale or duplicate updates from overriding current state.
 */
export interface SpatialProjectionVersion {
  assetId: string;
  version: number;
  observedAt: string;
  sourceEventId: string;
}

export interface CanonicalAssetResolution {
  assetId: string;
  canonicalAssetId: string;
  sourceId?: string;
  sourceAssetId?: string;
  gisFeatureId?: string;
  confidence: number;
  matchedBy: string[];
}

export interface SpatialProjectionState {
  assetId: string;
  canonicalAssetId: string;
  sourceEventId?: string;
  version?: number;
  observedAt?: string;
  state: Record<string, any>;
  lastUpdatedAt: string;
  freshness: 'LIVE_AUTHORITATIVE' | 'VERIFIED' | 'STALE' | 'UNAVAILABLE';
  authority: 'AUTHORITATIVE' | 'NON_AUTHORITATIVE' | 'DERIVED' | 'SIMULATED' | 'PREDICTED' | 'UNAVAILABLE';
}

/**
 * Event Topic
 */
export interface EventTopic {
  name: string;
  description: string;
  category: EventCategory;
  eventTypes: string[];
  retention?: string; // e.g., "7d", "30d"
  partitions?: number;
}
