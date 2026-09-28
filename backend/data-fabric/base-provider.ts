/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Base Grid Data Provider
 * 
 * Abstract base class for all data providers
 * Implements common functionality and defines adapter contract
 */

import { v4 as uuidv4 } from 'uuid';
import {
  IGridDataProvider,
  ProviderConfig,
  DataSourceType,
  GridAsset,
  GridTelemetry,
  ProviderHealthStatus,
  ProviderStatus,
  ProviderHealth,
} from './types';

export abstract class BaseGridDataProvider implements IGridDataProvider {
  protected config: ProviderConfig;
  protected connected = false;
  protected connectedSince: string = '';
  protected telemetryReceived = 0;
  protected eventsEmitted = 0;
  protected lastSyncTime: string = '';
  protected subscriptions: Map<string, boolean> = new Map();

  constructor(config: ProviderConfig) {
    this.config = config;
  }

  public getProviderId(): string {
    return this.config.providerId;
  }

  public getProviderType(): DataSourceType {
    return this.config.type;
  }

  public getConfig(): Record<string, any> {
    return {
      ...this.config,
      credentials: this.config.credentials
        ? {
            ...this.config.credentials,
            password: this.config.credentials.password ? '***' : undefined,
            apiKey: this.config.credentials.apiKey ? '***' : undefined,
          }
        : undefined,
    };
  }

  public async getStats(): Promise<{
    connectedSince: string;
    telemetryReceived: number;
    eventsEmitted: number;
    lastSync: string;
  }> {
    return {
      connectedSince: this.connectedSince,
      telemetryReceived: this.telemetryReceived,
      eventsEmitted: this.eventsEmitted,
      lastSync: this.lastSyncTime,
    };
  }

  /**
   * Abstract methods that derived classes must implement
   */
  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract health(): Promise<ProviderHealthStatus>;
  abstract snapshot(): Promise<{
    assets: GridAsset[];
    telemetry: GridTelemetry[];
    timestamp: string;
  }>;
  abstract query(params: {
    assetIds: string[];
    startTime: string;
    endTime: string;
    aggregation?: '1m' | '5m' | '15m' | '1h' | '24h';
  }): Promise<GridTelemetry[]>;

  /**
   * Default subscription implementation
   * Derived classes can override for real-time subscriptions
   */
  public async subscribe(
    callback: (telemetry: GridTelemetry) => Promise<void>,
    filter?: { assetIds?: string[]; measurementTypes?: string[] }
  ): Promise<string> {
    const subscriptionId = uuidv4();
    this.subscriptions.set(subscriptionId, true);

    // Default: polling-based subscription
    if (this.config.polling?.enabled) {
      this.setupPolling(subscriptionId, callback, filter);
    }

    return subscriptionId;
  }

  /**
   * Default unsubscribe implementation
   */
  public async unsubscribe(subscriptionId: string): Promise<void> {
    this.subscriptions.delete(subscriptionId);
  }

  /**
   * Polling implementation for adapters that support it
   */
  protected setupPolling(
    subscriptionId: string,
    callback: (telemetry: GridTelemetry) => Promise<void>,
    filter?: { assetIds?: string[]; measurementTypes?: string[] }
  ): void {
    const interval = setInterval(async () => {
      if (!this.subscriptions.has(subscriptionId)) {
        clearInterval(interval);
        return;
      }

      try {
        const snapshot = await this.snapshot();
        for (const telemetry of snapshot.telemetry) {
          if (
            !filter ||
            ((!filter.assetIds || filter.assetIds.includes(telemetry.assetId)) &&
              (!filter.measurementTypes ||
                filter.measurementTypes.some((m) =>
                  Object.keys(telemetry.measurements).includes(m)
                )))
          ) {
            await callback(telemetry);
          }
        }
      } catch (error) {
        console.warn(
          `[PROVIDER:${this.config.providerId}] Polling error:`,
          error
        );
      }
    }, (this.config.polling?.intervalSeconds || 60) * 1000);
  }

  /**
   * Helper: Record telemetry received
   */
  protected recordTelemetry(count: number = 1): void {
    this.telemetryReceived += count;
  }

  /**
   * Helper: Record event emitted
   */
  protected recordEvent(): void {
    this.eventsEmitted += 1;
  }

  /**
   * Helper: Update last sync time
   */
  protected updateSyncTime(): void {
    this.lastSyncTime = new Date().toISOString();
  }
}

export default BaseGridDataProvider;
