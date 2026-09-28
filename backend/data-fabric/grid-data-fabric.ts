/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Grid Data Fabric - Core Implementation
 * 
 * Unified data fabric connecting all grid data providers
 * Provides event-driven architecture with real-time updates
 * and seamless adapter swapping for production connectors
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import {
  IGridDataProvider,
  GridDataFabricOptions,
  DataSourceType,
  GridAsset,
  GridTelemetry,
  GridEvent,
  ProviderHealthStatus,
  ProviderStatus,
  ProviderHealth,
} from './types';

export class GridDataFabric extends EventEmitter {
  private static instance: GridDataFabric | null = null;
  private providers: Map<string, IGridDataProvider> = new Map();
  private assets: Map<string, GridAsset> = new Map();
  private telemetry: Map<string, GridTelemetry[]> = new Map();
  private subscriptions: Map<string, boolean> = new Map();
  private eventQueue: GridEvent[] = [];
  private healthCheckIntervals: Map<string, NodeJS.Timeout> = new Map();
  private options: GridDataFabricOptions;
  private initialized = false;

  private constructor(options: GridDataFabricOptions = {}) {
    super();
    this.options = {
      enablePersistence: true,
      enableEventCaching: true,
      maxCacheSize: 10000,
      ...options,
    };
  }

  /**
   * Singleton pattern for GridDataFabric
   */
  public static getInstance(
    options?: GridDataFabricOptions
  ): GridDataFabric {
    if (!GridDataFabric.instance) {
      GridDataFabric.instance = new GridDataFabric(options);
    }
    return GridDataFabric.instance;
  }

  /**
   * Initialize the fabric
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[GRID-DATA-FABRIC] Initializing production data fabric...');
    this.initialized = true;
  }

  /**
   * Register a data provider (adapter)
   * Providers are composable - can be added/removed at runtime
   */
  public async registerProvider(
    provider: IGridDataProvider
  ): Promise<void> {
    const providerId = provider.getProviderId();
    const providerType = provider.getProviderType();

    console.log(
      `[GRID-DATA-FABRIC] Registering provider: ${providerId} (${providerType})`
    );

    try {
      // Connect to provider
      await provider.connect();

      // Store provider
      this.providers.set(providerId, provider);

      // Load initial snapshot
      await this.syncProviderSnapshot(providerId);

      // Setup health check
      this.setupHealthCheck(providerId);

      // Start subscription
      await this.setupProviderSubscription(providerId);

      // Emit registration event
      this.emit('provider-registered', {
        providerId,
        providerType,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[GRID-DATA-FABRIC] Provider registered successfully: ${providerId}`
      );
    } catch (error) {
      console.error(
        `[GRID-DATA-FABRIC] Failed to register provider ${providerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Unregister a provider
   */
  public async unregisterProvider(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`);
    }

    console.log(`[GRID-DATA-FABRIC] Unregistering provider: ${providerId}`);

    try {
      // Clear health check
      const interval = this.healthCheckIntervals.get(providerId);
      if (interval) {
        clearInterval(interval);
        this.healthCheckIntervals.delete(providerId);
      }

      // Disconnect provider
      await provider.disconnect();

      // Remove from registry
      this.providers.delete(providerId);

      // Emit unregistration event
      this.emit('provider-unregistered', {
        providerId,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[GRID-DATA-FABRIC] Provider unregistered: ${providerId}`
      );
    } catch (error) {
      console.error(
        `[GRID-DATA-FABRIC] Error unregistering provider ${providerId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Get all registered providers
   */
  public getProviders(): IGridDataProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get provider by ID
   */
  public getProvider(providerId: string): IGridDataProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all assets across all providers
   */
  public getAssets(): GridAsset[] {
    return Array.from(this.assets.values());
  }

  /**
   * Get assets by type
   */
  public getAssetsByType(type: string): GridAsset[] {
    return Array.from(this.assets.values()).filter((a) => a.type === type);
  }

  /**
   * Get asset by ID
   */
  public getAsset(assetId: string): GridAsset | undefined {
    return this.assets.get(assetId);
  }

  /**
   * Get latest telemetry for an asset
   */
  public getLatestTelemetry(assetId: string): GridTelemetry | undefined {
    const telemetries = this.telemetry.get(assetId);
    return telemetries ? telemetries[telemetries.length - 1] : undefined;
  }

  /**
   * Get telemetry history for an asset
   */
  public getTelemetryHistory(assetId: string, limit: number = 100): GridTelemetry[] {
    const telemetries = this.telemetry.get(assetId) || [];
    return telemetries.slice(-limit);
  }

  /**
   * Query telemetry across providers
   */
  public async queryTelemetry(params: {
    assetIds: string[];
    startTime: string;
    endTime: string;
    aggregation?: '1m' | '5m' | '15m' | '1h' | '24h';
  }): Promise<GridTelemetry[]> {
    const results: GridTelemetry[] = [];

    for (const provider of this.providers.values()) {
      try {
        const providerResults = await provider.query(params);
        results.push(...providerResults);
      } catch (error) {
        console.warn(
          `[GRID-DATA-FABRIC] Query failed for provider ${provider.getProviderId()}:`,
          error
        );
      }
    }

    return results.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  /**
   * Get health status of all providers
   */
  public async getHealthStatus(): Promise<ProviderHealthStatus[]> {
    const health: ProviderHealthStatus[] = [];

    for (const provider of this.providers.values()) {
      try {
        const status = await provider.health();
        health.push(status);
      } catch (error) {
        health.push({
          provider: provider.getProviderId(),
          status: 'ERROR',
          health: 'UNHEALTHY',
          lastHeartbeat: new Date().toISOString(),
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return health;
  }

  /**
   * Get fabric status summary
   */
  public async getStatus(): Promise<{
    initialized: boolean;
    providers: number;
    assets: number;
    healthySources: number;
    totalTelemetryPoints: number;
    queuedEvents: number;
  }> {
    const health = await this.getHealthStatus();
    const healthySources = health.filter((h) => h.health === 'HEALTHY').length;

    return {
      initialized: this.initialized,
      providers: this.providers.size,
      assets: this.assets.size,
      healthySources,
      totalTelemetryPoints: Array.from(this.telemetry.values()).reduce(
        (sum, arr) => sum + arr.length,
        0
      ),
      queuedEvents: this.eventQueue.length,
    };
  }

  /**
   * Private: Sync provider snapshot into fabric
   */
  private async syncProviderSnapshot(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    try {
      const snapshot = await provider.snapshot();

      // Store assets
      for (const asset of snapshot.assets) {
        this.assets.set(asset.id, asset);
      }

      // Store telemetry
      for (const telemetry of snapshot.telemetry) {
        if (!this.telemetry.has(telemetry.assetId)) {
          this.telemetry.set(telemetry.assetId, []);
        }
        this.telemetry.get(telemetry.assetId)!.push(telemetry);
      }

      // Emit snapshot event
      this.emit('snapshot-synced', {
        providerId,
        assetCount: snapshot.assets.length,
        telemetryCount: snapshot.telemetry.length,
        timestamp: snapshot.timestamp,
      });

      console.log(
        `[GRID-DATA-FABRIC] Synced ${snapshot.assets.length} assets and ${snapshot.telemetry.length} telemetry points from ${providerId}`
      );
    } catch (error) {
      console.error(
        `[GRID-DATA-FABRIC] Failed to sync snapshot from ${providerId}:`,
        error
      );
    }
  }

  /**
   * Private: Setup subscription for provider
   */
  private async setupProviderSubscription(providerId: string): Promise<void> {
    const provider = this.providers.get(providerId);
    if (!provider) return;

    try {
      const subscriptionId = await provider.subscribe(
        async (telemetry) => {
          await this.processTelemetry(providerId, telemetry);
        }
      );

      this.subscriptions.set(subscriptionId, true);

      console.log(
        `[GRID-DATA-FABRIC] Subscription activated for ${providerId} (${subscriptionId})`
      );
    } catch (error) {
      console.warn(
        `[GRID-DATA-FABRIC] Failed to setup subscription for ${providerId}:`,
        error
      );
    }
  }

  /**
   * Private: Process incoming telemetry
   */
  private async processTelemetry(
    providerId: string,
    telemetry: GridTelemetry
  ): Promise<void> {
    // Store telemetry
    if (!this.telemetry.has(telemetry.assetId)) {
      this.telemetry.set(telemetry.assetId, []);
    }

    const history = this.telemetry.get(telemetry.assetId)!;
    history.push(telemetry);

    // Maintain max cache size
    if (history.length > this.options.maxCacheSize!) {
      history.shift();
    }

    // Create and queue event
    const event: GridEvent = {
      id: uuidv4(),
      type: 'TELEMETRY_UPDATED',
      sourceId: providerId,
      timestamp: new Date().toISOString(),
      payload: telemetry,
      severity: 'INFO',
    };

    if (this.options.enableEventCaching) {
      this.eventQueue.push(event);
      if (this.eventQueue.length > this.options.maxCacheSize!) {
        this.eventQueue.shift();
      }
    }

    // Emit event
    this.emit('telemetry-updated', {
      assetId: telemetry.assetId,
      providerId,
      timestamp: telemetry.timestamp,
      measurements: telemetry.measurements,
    });
  }

  /**
   * Private: Setup health check for provider
   */
  private setupHealthCheck(providerId: string): void {
    const interval = setInterval(async () => {
      try {
        const provider = this.providers.get(providerId);
        if (!provider) {
          clearInterval(interval);
          return;
        }

        const health = await provider.health();

        this.emit('provider-health', {
          providerId,
          health: health.health,
          status: health.status,
          latencyMs: health.latencyMs,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.warn(
          `[GRID-DATA-FABRIC] Health check failed for ${providerId}:`,
          error
        );
      }
    }, 30000); // Check every 30 seconds

    this.healthCheckIntervals.set(providerId, interval);
  }

  /**
   * Shutdown fabric
   */
  public async shutdown(): Promise<void> {
    console.log('[GRID-DATA-FABRIC] Shutting down fabric...');

    // Clear all health checks
    for (const interval of this.healthCheckIntervals.values()) {
      clearInterval(interval);
    }
    this.healthCheckIntervals.clear();

    // Disconnect all providers
    const providerIds = Array.from(this.providers.keys());
    for (const providerId of providerIds) {
      await this.unregisterProvider(providerId);
    }

    this.initialized = false;
    console.log('[GRID-DATA-FABRIC] Fabric shut down');
  }
}

export default GridDataFabric;
