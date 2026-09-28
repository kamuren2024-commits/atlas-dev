/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Real-Time Event Fabric - Event State Store
 * 
 * Maintains current grid state derived from event stream
 * Provides fast state lookup without querying history
 */

import { CanonicalEvent, EventStatus } from './types';

/**
 * Asset State
 */
export interface AssetState {
  assetId: string;
  lastEvent: CanonicalEvent;
  lastTelemetry?: Record<string, any>;
  lastAlarm?: CanonicalEvent;
  lastAlarmTime?: string;
  lastOutage?: CanonicalEvent;
  lastIncident?: CanonicalEvent;
  state: Record<string, any>;
  updatedAt: string;
  eventCount: number;
}

/**
 * Event State Store
 */
export class EventStateStore {
  private static instance: EventStateStore | null = null;
  private assetStates: Map<string, AssetState> = new Map();
  private sourceHealthStatus: Map<string, { healthy: boolean; lastHeartbeat: string }> = new Map();
  private globalState: {
    totalAssets: number;
    activeOutages: number;
    activeAlarms: number;
    activeIncidents: number;
    totalAffectedAssets: number;
    lastUpdate: string;
  } = {
    totalAssets: 0,
    activeOutages: 0,
    activeAlarms: 0,
    activeIncidents: 0,
    totalAffectedAssets: 0,
    lastUpdate: new Date().toISOString(),
  };

  private constructor() {}

  /**
   * Singleton pattern
   */
  public static getInstance(): EventStateStore {
    if (!EventStateStore.instance) {
      EventStateStore.instance = new EventStateStore();
    }
    return EventStateStore.instance;
  }

  /**
   * Update state from event
   */
  public updateFromEvent(event: CanonicalEvent): void {
    // Get or create asset state
    let assetId: string | undefined;

    if ('assetId' in event) {
      assetId = event.assetId;
    } else if ('affectedAssets' in event) {
      // Handle multiple assets
      for (const aid of event.affectedAssets) {
        this.updateAssetState(aid, event);
      }
    }

    if (assetId) {
      this.updateAssetState(assetId, event);
    }

    // Update source health
    const sourceId = event.sourceId || (event as any).source?.providerId || 'UNKNOWN';
    this.updateSourceHealth(sourceId);

    // Update global state based on event type
    this.updateGlobalState(event);
  }

  /**
   * Get asset state
   */
  public getAssetState(assetId: string): AssetState | undefined {
    return this.assetStates.get(assetId);
  }

  /**
   * Get all asset states
   */
  public getAllAssetStates(): AssetState[] {
    return Array.from(this.assetStates.values());
  }

  /**
   * Get global state
   */
  public getGlobalState(): typeof EventStateStore.prototype.globalState {
    return {
      ...this.globalState,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Get source health
   */
  public getSourceHealth(sourceId: string): { healthy: boolean; lastHeartbeat: string } | undefined {
    return this.sourceHealthStatus.get(sourceId);
  }

  /**
   * Get all source health
   */
  public getAllSourceHealth(): Map<string, { healthy: boolean; lastHeartbeat: string }> {
    return new Map(this.sourceHealthStatus);
  }

  /**
   * Clear state
   */
  public clearState(): void {
    this.assetStates.clear();
    this.sourceHealthStatus.clear();
    this.globalState = {
      totalAssets: 0,
      activeOutages: 0,
      activeAlarms: 0,
      activeIncidents: 0,
      totalAffectedAssets: 0,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Get state summary
   */
  public getStateSummary(): {
    assets: number;
    outages: number;
    alarms: number;
    incidents: number;
    healthySources: number;
    unhealthySources: number;
  } {
    let healthySources = 0;
    let unhealthySources = 0;

    for (const health of this.sourceHealthStatus.values()) {
      if (health.healthy) {
        healthySources += 1;
      } else {
        unhealthySources += 1;
      }
    }

    return {
      assets: this.assetStates.size,
      outages: this.globalState.activeOutages,
      alarms: this.globalState.activeAlarms,
      incidents: this.globalState.activeIncidents,
      healthySources,
      unhealthySources,
    };
  }

  /**
   * Private: Update asset state
   */
  private updateAssetState(assetId: string, event: CanonicalEvent): void {
    let state = this.assetStates.get(assetId);

    if (!state) {
      state = {
        assetId,
        lastEvent: event,
        state: {},
        updatedAt: event.timestamp,
        eventCount: 0,
      };
      this.assetStates.set(assetId, state);
      this.globalState.totalAssets += 1;
    }

    state.lastEvent = event;
    state.eventCount += 1;
    state.updatedAt = event.timestamp;

    // Update specific event types
    if (event.eventType === 'TELEMETRY_UPDATED') {
      if ('telemetry' in event && (event as any).telemetry?.measurements) {
        state.lastTelemetry = (event as any).telemetry.measurements;
        state.state = {
          ...state.state,
          ...(event as any).telemetry.measurements,
        };
      } else if ('data' in event) {
        state.lastTelemetry = event;
        state.state = {
          ...state.state,
          ...(event as any).data,
        };
      } else if ('telemetry' in event) {
        state.lastTelemetry = (event as any).telemetry;
        state.state = {
          ...state.state,
          ...((event as any).telemetry?.measurements || (event as any).telemetry),
        };
      }
    }

    if (event.eventType.includes('ALARM')) {
      state.lastAlarm = event;
      state.lastAlarmTime = event.timestamp;
    }

    if (event.eventType.includes('OUTAGE')) {
      state.lastOutage = event;
    }

    if (event.eventType.includes('INCIDENT')) {
      state.lastIncident = event;
    }
  }

  /**
   * Private: Update source health
   */
  private updateSourceHealth(sourceId: string): void {
    const health = this.sourceHealthStatus.get(sourceId) || {
      healthy: true,
      lastHeartbeat: new Date().toISOString(),
    };

    health.lastHeartbeat = new Date().toISOString();
    health.healthy = true;

    this.sourceHealthStatus.set(sourceId, health);
  }

  /**
   * Private: Update global state
   */
  private updateGlobalState(event: CanonicalEvent): void {
    this.globalState.lastUpdate = event.timestamp;

    if (event.category === 'OUTAGE') {
      if (event.eventType === 'OUTAGE_CREATED' || event.eventType === 'OUTAGE_UPDATED' || event.eventType === 'OUTAGE_STARTED') {
        if (event.status !== 'RESOLVED') {
          this.globalState.activeOutages += 1;
          const affected = (event as any).affectedAssets?.length || 0;
          this.globalState.totalAffectedAssets = (this.globalState.totalAffectedAssets || 0) + affected;
        }
      } else if (event.eventType === 'OUTAGE_RESOLVED') {
        this.globalState.activeOutages = Math.max(0, this.globalState.activeOutages - 1);
      }
    }

    if (event.category === 'ALARM') {
      if (event.eventType === 'ALARM_CREATED') {
        this.globalState.activeAlarms += 1;
      } else if (event.eventType === 'ALARM_CLEARED') {
        this.globalState.activeAlarms = Math.max(0, this.globalState.activeAlarms - 1);
      }
    }

    if (event.category === 'INCIDENT') {
      if (event.eventType === 'INCIDENT_CREATED') {
        this.globalState.activeIncidents += 1;
      } else if (event.eventType === 'INCIDENT_RESOLVED') {
        this.globalState.activeIncidents = Math.max(0, this.globalState.activeIncidents - 1);
      }
    }
  }
}

export default EventStateStore;
