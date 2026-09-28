/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Production Data Fabric Types
 * 
 * Defines unified interfaces for all grid data providers and adapters
 * ensuring production connectors are replaceable without modifying
 * Command Center components.
 */

export type DataSourceType =
  | 'SCADA_EMS'
  | 'WAMS_PMU'
  | 'GIS_POSTGIS'
  | 'SAP_EAM'
  | 'HISTORIAN'
  | 'WEATHER'
  | 'OUTAGE_MGMT'
  | 'GENERATION'
  | 'MARKET_DISPATCH';

export type ProviderHealth = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';
export type ProviderStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
export type SubscriptionMode = 'REAL_TIME' | 'BATCH' | 'POLLING';

/**
 * Canonical Grid Asset - unified representation of any grid entity
 */
export interface GridAsset {
  id: string;
  type: 'SUBSTATION' | 'FEEDER' | 'TRANSFORMER' | 'BREAKER' | 'GENERATOR' | 'LOAD' | 'CAPACITOR' | 'REACTOR';
  name: string;
  location: {
    latitude: number;
    longitude: number;
    zone?: string;
    region?: string;
  };
  owner: string;
  operatingVoltage: number;
  ratedCapacity?: number;
  metadata: Record<string, any>;
  lastUpdated: string;
}

/**
 * Canonical Grid Telemetry - unified measurement from any source
 */
export interface GridTelemetry {
  assetId: string;
  timestamp: string;
  measurements: {
    voltage?: number;
    current?: number;
    activePower?: number;
    reactivePower?: number;
    powerFactor?: number;
    frequency?: number;
    temperature?: number;
    status?: string;
    [key: string]: any;
  };
  quality: {
    confidence: number; // 0-100
    source: string;
    lastVerified: string;
  };
  raw?: Record<string, any>; // Original format from provider
}

/**
 * Event representing state change in the grid
 */
export interface GridEvent {
  id: string;
  type: 'TELEMETRY_UPDATED' | 'ASSET_STATE_CHANGED' | 'BREAKER_CHANGED' | 'ALARM_CREATED' | 'ALARM_CLEARED' | 'OUTAGE_CREATED' | 'OUTAGE_UPDATED' | 'FORECAST_UPDATED' | 'RISK_UPDATED' | 'INCIDENT_CREATED' | 'INCIDENT_RESOLVED';
  sourceId: string;
  timestamp: string;
  payload: Record<string, any>;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

/**
 * Provider Health Status
 */
export interface ProviderHealthStatus {
  provider: string;
  status: ProviderStatus;
  health: ProviderHealth;
  latencyMs?: number;
  lastHeartbeat: string;
  errorMessage?: string;
  recordsInQueue?: number;
  metricsProcessed?: number;
}

/**
 * Base interface for all grid data providers
 * All production adapters must implement this interface
 */
export interface IGridDataProvider {
  /**
   * Unique identifier for this provider instance
   */
  getProviderId(): string;

  /**
   * Provider type (SCADA_EMS, WAMS_PMU, etc)
   */
  getProviderType(): DataSourceType;

  /**
   * Establish connection to data source
   * May be async for remote systems
   */
  connect(): Promise<void>;

  /**
   * Check provider health and connectivity
   */
  health(): Promise<ProviderHealthStatus>;

  /**
   * Subscribe to real-time data streams
   * Callback invoked when data arrives
   */
  subscribe(
    callback: (telemetry: GridTelemetry) => Promise<void>,
    filter?: { assetIds?: string[]; measurementTypes?: string[] }
  ): Promise<string>; // Returns subscription ID

  /**
   * Unsubscribe from data stream
   */
  unsubscribe(subscriptionId: string): Promise<void>;

  /**
   * Get current snapshot of all assets and telemetry
   */
  snapshot(): Promise<{
    assets: GridAsset[];
    telemetry: GridTelemetry[];
    timestamp: string;
  }>;

  /**
   * Query historical data
   */
  query(params: {
    assetIds: string[];
    startTime: string;
    endTime: string;
    aggregation?: '1m' | '5m' | '15m' | '1h' | '24h';
  }): Promise<GridTelemetry[]>;

  /**
   * Disconnect from data source
   */
  disconnect(): Promise<void>;

  /**
   * Get configuration
   */
  getConfig(): Record<string, any>;

  /**
   * Get statistics
   */
  getStats(): Promise<{
    connectedSince: string;
    telemetryReceived: number;
    eventsEmitted: number;
    lastSync: string;
  }>;
}

/**
 * Provider configuration template
 */
export interface ProviderConfig {
  providerId: string;
  type: DataSourceType;
  enabled: boolean;
  credentials?: {
    username?: string;
    password?: string;
    apiKey?: string;
    certificate?: string;
    endpoint?: string;
    [key: string]: any;
  };
  polling?: {
    enabled: boolean;
    intervalSeconds?: number;
  };
  subscriptionMode: SubscriptionMode;
  retryPolicy?: {
    maxRetries: number;
    backoffMs: number;
  };
  metadata?: Record<string, any>;
}

/**
 * Grid Data Fabric Options
 */
export interface GridDataFabricOptions {
  eventBusUrl?: string;
  cacheRedisUrl?: string;
  persistenceDbPath?: string;
  enablePersistence?: boolean;
  enableEventCaching?: boolean;
  maxCacheSize?: number;
}
