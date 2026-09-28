/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Weather Data Provider Adapter
 * 
 * Integrates with weather data providers (OpenWeather, NOAA, etc)
 * Provides weather data affecting grid operations and renewable generation
 */

import { v4 as uuidv4 } from 'uuid';
import BaseGridDataProvider from '../base-provider';
import {
  ProviderConfig,
  GridAsset,
  GridTelemetry,
  ProviderHealthStatus,
} from '../types';

export class WeatherProvider extends BaseGridDataProvider {
  private mockAssets: GridAsset[] = [];

  constructor(config: ProviderConfig) {
    super(config);
    this.setupMockData();
  }

  public async connect(): Promise<void> {
    console.log(`[WEATHER:${this.config.providerId}] Connecting to Weather Service...`);
    this.connected = true;
    this.connectedSince = new Date().toISOString();
  }

  public async disconnect(): Promise<void> {
    console.log(`[WEATHER:${this.config.providerId}] Disconnecting...`);
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
      latencyMs: Math.random() * 100 + 20,
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
      throw new Error('Weather provider not connected');
    }

    // Generate weather data for each location
    const telemetry = this.mockAssets.map((asset) => ({
      assetId: asset.id,
      timestamp: new Date().toISOString(),
      measurements: {
        temperature: 18 + Math.random() * 20, // Celsius
        humidity: 30 + Math.random() * 60, // Percentage
        pressure: 1010 + (Math.random() - 0.5) * 10, // mb
        windSpeed: Math.random() * 20, // m/s
        windDirection: Math.random() * 360, // degrees
        solarRadiation: Math.random() * 1000, // W/m²
        rainfall: Math.random() * 10, // mm
        cloudCover: Math.random() * 100, // Percentage
      },
      quality: {
        confidence: 85,
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
      throw new Error('Weather provider not connected');
    }

    // Historical weather data
    const results: GridTelemetry[] = [];
    const startDate = new Date(params.startTime);
    const endDate = new Date(params.endTime);

    for (const assetId of params.assetIds) {
      const asset = this.mockAssets.find((a) => a.id === assetId);
      if (!asset) continue;

      results.push({
        assetId,
        timestamp: startDate.toISOString(),
        measurements: {
          temperature: 18 + Math.random() * 20,
          humidity: 30 + Math.random() * 60,
          windSpeed: Math.random() * 20,
          solarRadiation: Math.random() * 1000,
        },
        quality: {
          confidence: 90,
          source: this.config.providerId,
          lastVerified: startDate.toISOString(),
        },
      });
    }

    return results;
  }

  private setupMockData(): void {
    this.mockAssets = [
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'Weather Station - Nairobi CBD',
        location: {
          latitude: -1.2867,
          longitude: 36.8187,
          zone: 'Central',
          region: 'Nairobi',
        },
        owner: 'KETRACO',
        operatingVoltage: 0,
        metadata: {
          stationId: 'WS-001',
          provider: 'OpenWeatherMap',
          coverage: 50,
        },
        lastUpdated: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        type: 'SUBSTATION',
        name: 'Weather Station - Olkaria',
        location: {
          latitude: -0.7596,
          longitude: 36.3167,
          zone: 'Western',
          region: 'Rift Valley',
        },
        owner: 'KETRACO',
        operatingVoltage: 0,
        metadata: {
          stationId: 'WS-002',
          provider: 'NOAA',
          coverage: 100,
        },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }
}

export default WeatherProvider;
