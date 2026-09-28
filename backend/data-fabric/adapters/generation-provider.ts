/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Generation Data Provider Adapter
 * 
 * Integrates with power generation facilities
 * Provides real-time and forecasted generation data from thermal, hydro, wind, solar
 */

import { v4 as uuidv4 } from 'uuid';
import BaseGridDataProvider from '../base-provider';
import {
  ProviderConfig,
  GridAsset,
  GridTelemetry,
  ProviderHealthStatus,
} from '../types';

export class GenerationProvider extends BaseGridDataProvider {
  private mockAssets: GridAsset[] = [];

  constructor(config: ProviderConfig) {
    super(config);
    this.setupMockData();
  }

  public async connect(): Promise<void> {
    console.log(`[GENERATION:${this.config.providerId}] Connecting to Generation Systems...`);
    this.connected = true;
    this.connectedSince = new Date().toISOString();
  }

  public async disconnect(): Promise<void> {
    console.log(`[GENERATION:${this.config.providerId}] Disconnecting...`);
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
      latencyMs: Math.random() * 50,
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
      throw new Error('Generation provider not connected');
    }

    // Generate power plant telemetry
    const telemetry = this.mockAssets.map((asset) =>
      this.generatePlantTelemetry(asset)
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
      throw new Error('Generation provider not connected');
    }

    const results: GridTelemetry[] = [];
    const startDate = new Date(params.startTime);
    const endDate = new Date(params.endTime);

    for (const assetId of params.assetIds) {
      const asset = this.mockAssets.find((a) => a.id === assetId);
      if (!asset) continue;

      let currentTime = new Date(startDate);
      while (currentTime <= endDate) {
        results.push(this.generatePlantTelemetry(asset));
        currentTime = new Date(currentTime.getTime() + 3600000);
      }
    }

    return results;
  }

  private setupMockData(): void {
    this.mockAssets = [
      {
        id: uuidv4(),
        type: 'GENERATOR',
        name: 'Olkaria Geothermal Station Unit 1',
        location: {
          latitude: -0.7596,
          longitude: 36.3167,
          zone: 'Western',
          region: 'Rift Valley',
        },
        owner: 'KenGen',
        operatingVoltage: 132,
        ratedCapacity: 250,
        metadata: {
          generatorId: 'GEN-OLK-01',
          type: 'GEOTHERMAL',
          fuelType: 'GEOTHERMAL',
          status: 'OPERATIONAL',
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        type: 'GENERATOR',
        name: 'Kiambere Hydroelectric Station',
        location: {
          latitude: -0.3,
          longitude: 37.5,
          zone: 'Central',
          region: 'Coast',
        },
        owner: 'KenGen',
        operatingVoltage: 132,
        ratedCapacity: 140,
        metadata: {
          generatorId: 'GEN-KIA-01',
          type: 'HYDRO',
          fuelType: 'WATER',
          status: 'OPERATIONAL',
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        type: 'GENERATOR',
        name: 'Solar Farm - Mombasa',
        location: {
          latitude: -4.0435,
          longitude: 39.6682,
          zone: 'Coastal',
          region: 'Coast',
        },
        owner: 'Independent Power Producer',
        operatingVoltage: 66,
        ratedCapacity: 50,
        metadata: {
          generatorId: 'GEN-SOL-01',
          type: 'SOLAR',
          fuelType: 'SOLAR',
          status: 'OPERATIONAL',
        },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }

  private generatePlantTelemetry(asset: GridAsset): GridTelemetry {
    const baseCapacity = asset.ratedCapacity || 100;
    const generationType = asset.metadata?.type || 'THERMAL';

    let generation = baseCapacity * (0.4 + Math.random() * 0.6);
    if (generationType === 'SOLAR') {
      generation = baseCapacity * (0 + Math.random() * 0.8);
    }

    return {
      assetId: asset.id,
      timestamp: new Date().toISOString(),
      measurements: {
        generationMW: generation,
        utilizationPercent: (generation / baseCapacity) * 100,
        fuelConsumption: Math.random() * 100,
        efficiency: 0.75 + Math.random() * 0.2,
        temperature: 35 + Math.random() * 30,
        status: 'OPERATIONAL',
      },
      quality: {
        confidence: 97,
        source: this.config.providerId,
        lastVerified: new Date().toISOString(),
      },
    };
  }
}

export default GenerationProvider;
