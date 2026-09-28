/**
 * KETRACO COMMAND CENTER - PHASE 07
 * SCADA/EMS Data Provider Adapter
 * 
 * Integrates with SCADA systems and Energy Management Systems
 * Provides real-time telemetry from substations and distribution networks
 */

import { v4 as uuidv4 } from 'uuid';
import BaseGridDataProvider from '../base-provider';
import {
  ProviderConfig,
  GridAsset,
  GridTelemetry,
  ProviderHealthStatus,
} from '../types';

export class ScadaEmsProvider extends BaseGridDataProvider {
  private mockAssets: GridAsset[] = [];
  private healthStatus: ProviderHealthStatus = {
    provider: this.config.providerId,
    status: 'DISCONNECTED',
    health: 'UNKNOWN',
    lastHeartbeat: new Date().toISOString(),
  };

  constructor(config: ProviderConfig) {
    super(config);
    this.setupMockData();
  }

  public async connect(): Promise<void> {
    console.log(
      `[SCADA-EMS:${this.config.providerId}] Connecting to SCADA/EMS...`
    );

    if (this.config.credentials?.endpoint) {
      console.log(`[SCADA-EMS:${this.config.providerId}] Endpoint: ${this.config.credentials.endpoint}`);
    }

    this.connected = true;
    this.connectedSince = new Date().toISOString();
    this.healthStatus.status = 'CONNECTED';
    this.healthStatus.health = 'HEALTHY';
    this.healthStatus.lastHeartbeat = new Date().toISOString();
  }

  public async disconnect(): Promise<void> {
    console.log(`[SCADA-EMS:${this.config.providerId}] Disconnecting...`);
    this.connected = false;
    this.subscriptions.clear();
    this.healthStatus.status = 'DISCONNECTED';
    this.healthStatus.health = 'UNKNOWN';
  }

  public async health(): Promise<ProviderHealthStatus> {
    if (!this.connected) {
      return {
        ...this.healthStatus,
        status: 'DISCONNECTED',
        health: 'UNHEALTHY',
      };
    }

    const latency = Math.random() * 100 + 10;
    return {
      provider: this.config.providerId,
      status: 'CONNECTED',
      health: latency < 100 ? 'HEALTHY' : 'DEGRADED',
      latencyMs: Math.round(latency),
      lastHeartbeat: new Date().toISOString(),
      recordsInQueue: Math.floor(Math.random() * 50),
      metricsProcessed: this.telemetryReceived,
    };
  }

  public async snapshot(): Promise<{
    assets: GridAsset[];
    telemetry: GridTelemetry[];
    timestamp: string;
  }> {
    if (!this.connected) {
      throw new Error('SCADA/EMS provider not connected');
    }

    // Generate mock telemetry for each asset
    const telemetry = this.mockAssets.map((asset) =>
      this.generateTelemetry(asset)
    );

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
      throw new Error('SCADA/EMS provider not connected');
    }

    // Return mock historical data
    const results: GridTelemetry[] = [];
    const startDate = new Date(params.startTime);
    const endDate = new Date(params.endTime);
    const interval = this.getIntervalMs(params.aggregation || '15m');

    for (const assetId of params.assetIds) {
      const asset = this.mockAssets.find((a) => a.id === assetId);
      if (!asset) continue;

      let currentTime = new Date(startDate);
      while (currentTime <= endDate) {
        results.push({
          assetId,
          timestamp: currentTime.toISOString(),
          measurements: {
            voltage: 230 + (Math.random() - 0.5) * 10,
            current: 50 + Math.random() * 100,
            activePower: 5000 + Math.random() * 2000,
            frequency: 50 + (Math.random() - 0.5) * 0.2,
          },
          quality: {
            confidence: 95,
            source: this.config.providerId,
            lastVerified: currentTime.toISOString(),
          },
        });
        currentTime = new Date(currentTime.getTime() + interval);
      }
    }

    return results;
  }

  private setupMockData(): void {
    // Create mock substations
    this.mockAssets = [
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'Downtown Substation 01',
        location: {
          latitude: -1.2866,
          longitude: 36.8172,
          zone: 'Central',
          region: 'Nairobi',
        },
        owner: 'KETRACO',
        operatingVoltage: 220,
        ratedCapacity: 100,
        metadata: { code: 'DS01' },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'West Ring Substation 02',
        location: {
          latitude: -1.3034,
          longitude: 36.7651,
          zone: 'West',
          region: 'Nairobi',
        },
        owner: 'KETRACO',
        operatingVoltage: 220,
        ratedCapacity: 80,
        metadata: { code: 'WRS02' },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'East Ring Substation 03',
        location: {
          latitude: -1.3148,
          longitude: 36.8941,
          zone: 'East',
          region: 'Nairobi',
        },
        owner: 'KETRACO',
        operatingVoltage: 220,
        ratedCapacity: 90,
        metadata: { code: 'ERS03' },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private generateTelemetry(asset: GridAsset): GridTelemetry {
    return {
      assetId: asset.id,
      timestamp: new Date().toISOString(),
      measurements: {
        voltage: asset.operatingVoltage + (Math.random() - 0.5) * 5,
        current: 50 + Math.random() * 100,
        activePower: (asset.ratedCapacity || 100) * (0.5 + Math.random() * 0.5),
        reactivePower: (asset.ratedCapacity || 100) * (0.2 + Math.random() * 0.3),
        powerFactor: 0.92 + Math.random() * 0.06,
        frequency: 50 + (Math.random() - 0.5) * 0.3,
        temperature: 35 + Math.random() * 15,
        status: Math.random() > 0.95 ? 'ALARM' : 'NORMAL',
      },
      quality: {
        confidence: 98,
        source: this.config.providerId,
        lastVerified: new Date().toISOString(),
      },
    };
  }

  private getIntervalMs(aggregation: string): number {
    const intervals: Record<string, number> = {
      '1m': 60000,
      '5m': 300000,
      '15m': 900000,
      '1h': 3600000,
      '24h': 86400000,
    };
    return intervals[aggregation] || 900000;
  }
}

export default ScadaEmsProvider;
