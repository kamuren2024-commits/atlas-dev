/**
 * KETRACO COMMAND CENTER - PHASE 07
 * WAMS/PMU Data Provider Adapter
 * 
 * Integrates with Wide Area Monitoring Systems and Phasor Measurement Units
 * Provides high-resolution, synchronized phasor data across the transmission network
 */

import { v4 as uuidv4 } from 'uuid';
import BaseGridDataProvider from '../base-provider';
import {
  ProviderConfig,
  GridAsset,
  GridTelemetry,
  ProviderHealthStatus,
} from '../types';

export class WamsPmuProvider extends BaseGridDataProvider {
  private mockAssets: GridAsset[] = [];

  constructor(config: ProviderConfig) {
    super(config);
    this.setupMockData();
  }

  public async connect(): Promise<void> {
    console.log(`[WAMS-PMU:${this.config.providerId}] Connecting to WAMS/PMU...`);
    this.connected = true;
    this.connectedSince = new Date().toISOString();
  }

  public async disconnect(): Promise<void> {
    console.log(`[WAMS-PMU:${this.config.providerId}] Disconnecting...`);
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

    const latency = Math.random() * 50 + 5;
    return {
      provider: this.config.providerId,
      status: 'CONNECTED',
      health: latency < 50 ? 'HEALTHY' : 'DEGRADED',
      latencyMs: Math.round(latency),
      lastHeartbeat: new Date().toISOString(),
      recordsInQueue: Math.floor(Math.random() * 200),
      metricsProcessed: this.telemetryReceived,
    };
  }

  public async snapshot(): Promise<{
    assets: GridAsset[];
    telemetry: GridTelemetry[];
    timestamp: string;
  }> {
    if (!this.connected) {
      throw new Error('WAMS/PMU provider not connected');
    }

    const telemetry = this.mockAssets.map((asset) =>
      this.generatePhasorTelemetry(asset)
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
      throw new Error('WAMS/PMU provider not connected');
    }

    const results: GridTelemetry[] = [];
    const startDate = new Date(params.startTime);
    const endDate = new Date(params.endTime);

    for (const assetId of params.assetIds) {
      const asset = this.mockAssets.find((a) => a.id === assetId);
      if (!asset) continue;

      let currentTime = new Date(startDate);
      while (currentTime <= endDate) {
        results.push(this.generatePhasorTelemetry(asset));
        currentTime = new Date(currentTime.getTime() + 60000);
      }
    }

    return results;
  }

  private setupMockData(): void {
    this.mockAssets = [
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'PMU - Olkaria Generation Station',
        location: {
          latitude: -0.7596,
          longitude: 36.3167,
          zone: 'Western',
          region: 'Rift Valley',
        },
        owner: 'KETRACO',
        operatingVoltage: 400,
        ratedCapacity: 200,
        metadata: { pmuId: 'PMU001', vendorId: 'SEL' },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'PMU - Kiambere Hydro Station',
        location: {
          latitude: -0.3,
          longitude: 37.5,
          zone: 'Central',
          region: 'Coast',
        },
        owner: 'KETRACO',
        operatingVoltage: 400,
        ratedCapacity: 250,
        metadata: { pmuId: 'PMU002', vendorId: 'SEL' },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private generatePhasorTelemetry(asset: GridAsset): GridTelemetry {
    const magnitude = 230 + (Math.random() - 0.5) * 20;
    const angle = Math.random() * 360;

    return {
      assetId: asset.id,
      timestamp: new Date().toISOString(),
      measurements: {
        voltageMagnitude: magnitude,
        voltageAngle: angle,
        currentMagnitude: 50 + Math.random() * 150,
        currentAngle: angle + 30,
        frequency: 50 + (Math.random() - 0.5) * 0.5,
        rateOfChangeOfFrequency: (Math.random() - 0.5) * 0.1,
      },
      quality: {
        confidence: 99,
        source: this.config.providerId,
        lastVerified: new Date().toISOString(),
      },
    };
  }
}

export default WamsPmuProvider;
