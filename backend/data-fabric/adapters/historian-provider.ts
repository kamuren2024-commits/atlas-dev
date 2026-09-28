/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Historian Data Provider Adapter
 * 
 * Integrates with industrial data historians
 * Provides efficient time-series data storage and retrieval
 */

import { v4 as uuidv4 } from 'uuid';
import BaseGridDataProvider from '../base-provider';
import {
  ProviderConfig,
  GridAsset,
  GridTelemetry,
  ProviderHealthStatus,
} from '../types';

export class HistorianProvider extends BaseGridDataProvider {
  private mockAssets: GridAsset[] = [];

  constructor(config: ProviderConfig) {
    super(config);
    this.setupMockData();
  }

  public async connect(): Promise<void> {
    console.log(`[HISTORIAN:${this.config.providerId}] Connecting to Historian...`);
    this.connected = true;
    this.connectedSince = new Date().toISOString();
  }

  public async disconnect(): Promise<void> {
    console.log(`[HISTORIAN:${this.config.providerId}] Disconnecting...`);
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
      latencyMs: Math.random() * 30,
      lastHeartbeat: new Date().toISOString(),
      recordsInQueue: Math.floor(Math.random() * 500),
      metricsProcessed: this.telemetryReceived,
    };
  }

  public async snapshot(): Promise<{
    assets: GridAsset[];
    telemetry: GridTelemetry[];
    timestamp: string;
  }> {
    if (!this.connected) {
      throw new Error('Historian provider not connected');
    }

    // Historian provides latest recorded values
    const telemetry = this.mockAssets.map((asset) => ({
      assetId: asset.id,
      timestamp: new Date().toISOString(),
      measurements: {
        voltage: 230 + (Math.random() - 0.5) * 10,
        current: 50 + Math.random() * 100,
        activePower: Math.random() * 10000,
        frequency: 50 + (Math.random() - 0.5) * 0.2,
      },
      quality: {
        confidence: 99,
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
      throw new Error('Historian provider not connected');
    }

    // Historian excels at historical queries
    const results: GridTelemetry[] = [];
    const startDate = new Date(params.startTime);
    const endDate = new Date(params.endTime);
    const interval = this.getIntervalMs(params.aggregation || '1h');

    for (const assetId of params.assetIds) {
      const asset = this.mockAssets.find((a) => a.id === assetId);
      if (!asset) continue;

      let currentTime = new Date(startDate);
      while (currentTime <= endDate) {
        results.push({
          assetId,
          timestamp: currentTime.toISOString(),
          measurements: {
            voltage: 230 + (Math.random() - 0.5) * 15,
            current: 50 + Math.random() * 120,
            activePower: Math.random() * 12000,
            frequency: 50 + (Math.random() - 0.5) * 0.5,
          },
          quality: {
            confidence: 98,
            source: this.config.providerId,
            lastVerified: currentTime.toISOString(),
          },
        });
        currentTime = new Date(currentTime.getTime() + interval);
      }
    }

    return results.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }

  private setupMockData(): void {
    this.mockAssets = [
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'Historical Archive - Central Hub',
        location: {
          latitude: -1.2866,
          longitude: 36.8172,
          zone: 'Central',
          region: 'Nairobi',
        },
        owner: 'KETRACO',
        operatingVoltage: 220,
        ratedCapacity: 100,
        metadata: {
          historianId: 'HIS-001',
          dataPoints: 1000000,
          retentionYears: 10,
          compressionRatio: 0.85,
        },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private getIntervalMs(aggregation: string): number {
    const intervals: Record<string, number> = {
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '1h': 3600000,
      '24h': 86400000,
    };
    return intervals[aggregation] || 3600000;
  }
}

export default HistorianProvider;
