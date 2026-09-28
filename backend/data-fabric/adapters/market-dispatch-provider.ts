/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Market/Dispatch Data Provider Adapter
 * 
 * Integrates with market operations and dispatch systems
 * Provides market prices, dispatch instructions, and operational constraints
 */

import { v4 as uuidv4 } from 'uuid';
import BaseGridDataProvider from '../base-provider';
import {
  ProviderConfig,
  GridAsset,
  GridTelemetry,
  ProviderHealthStatus,
} from '../types';

export class MarketDispatchProvider extends BaseGridDataProvider {
  private mockAssets: GridAsset[] = [];

  constructor(config: ProviderConfig) {
    super(config);
    this.setupMockData();
  }

  public async connect(): Promise<void> {
    console.log(`[MARKET-DISPATCH:${this.config.providerId}] Connecting to Market/Dispatch System...`);
    this.connected = true;
    this.connectedSince = new Date().toISOString();
  }

  public async disconnect(): Promise<void> {
    console.log(`[MARKET-DISPATCH:${this.config.providerId}] Disconnecting...`);
    this.connected = false;
    this.subscriptions.clear();
  }

  public async health(): Promise<ProviderHealthStatus> {
    if (!this.connected) {
      return {
        provider: this.config.providerId,
        status: 'DISCONNECTED',
        health: 'UNHEALTHY',
        lastHeartbeat: new Date().toISOString(),
      };
    }

    return {
      provider: this.config.providerId,
      status: 'CONNECTED',
      health: 'HEALTHY',
      latencyMs: Math.random() * 100 + 10,
      lastHeartbeat: new Date().toISOString(),
      recordsInQueue: Math.floor(Math.random() * 150),
      metricsProcessed: this.telemetryReceived,
    };
  }

  public async snapshot(): Promise<{
    assets: GridAsset[];
    telemetry: GridTelemetry[];
    timestamp: string;
  }> {
    if (!this.connected) {
      throw new Error('Market/Dispatch provider not connected');
    }

    // Generate market and dispatch data
    const telemetry = this.mockAssets.map((asset) => ({
      assetId: asset.id,
      timestamp: new Date().toISOString(),
      measurements: {
        spotPrice: 50 + Math.random() * 100, // KES/MWh
        demandForecast: Math.random() * 2000, // MW
        availableCapacity: Math.random() * 500, // MW
        reserveMargin: 15 + Math.random() * 10, // %
        loadIndex: 75 + Math.random() * 20, // %
        congestionLevel: Math.floor(Math.random() * 5), // 0-4
      },
      quality: {
        confidence: 92,
        source: this.config.providerId,
        lastVerified: new Date().toISOString(),
      },
    }));

    this.recordTelemetry(telemetry.length);
    this.updateSyncTime();

    return {
      assets: this.mockAssets,
      telemetry,
      timestamp: new Date().toISOString(),
    };
  }

  public async query(params: {
    assetIds: string[];
    startTime: string;
    endTime: string;
    aggregation?: '1m' | '5m' | '15m' | '1h' | '24h';
  }): Promise<GridTelemetry[]> {
    if (!this.connected) {
      throw new Error('Market/Dispatch provider not connected');
    }

    // Historical market data
    const results: GridTelemetry[] = [];
    const startDate = new Date(params.startTime);
    const endDate = new Date(params.endTime);

    for (const assetId of params.assetIds) {
      const asset = this.mockAssets.find((a) => a.id === assetId);
      if (!asset) continue;

      let currentTime = new Date(startDate);
      while (currentTime <= endDate) {
        results.push({
          assetId,
          timestamp: currentTime.toISOString(),
          measurements: {
            spotPrice: 50 + Math.random() * 100,
            demandForecast: Math.random() * 2000,
            availableCapacity: Math.random() * 500,
            reserveMargin: 15 + Math.random() * 10,
          },
          quality: {
            confidence: 95,
            source: this.config.providerId,
            lastVerified: currentTime.toISOString(),
          },
        });
        currentTime = new Date(currentTime.getTime() + 3600000);
      }
    }

    return results;
  }

  private setupMockData(): void {
    this.mockAssets = [
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'Market Operations Center',
        location: {
          latitude: -1.2866,
          longitude: 36.8172,
          zone: 'Central',
          region: 'Nairobi',
        },
        owner: 'KETRACO',
        operatingVoltage: 0,
        metadata: {
          marketId: 'KPLC-MARKET',
          operatorId: 'KETRACO',
          settlementPeriod: '30m',
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'Dispatch Control Center',
        location: {
          latitude: -1.2866,
          longitude: 36.8172,
          zone: 'Central',
          region: 'Nairobi',
        },
        owner: 'KETRACO',
        operatingVoltage: 0,
        metadata: {
          dispatchCenterId: 'DCC-001',
          operatorId: 'KETRACO',
          responseTime: '5m',
        },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }
}

export default MarketDispatchProvider;
