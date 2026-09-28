/**
 * KETRACO COMMAND CENTER - PHASE 07
 * Outage Management System Data Provider Adapter
 * 
 * Integrates with Outage Management Systems
 * Tracks outages, incidents, and service disruptions across the grid
 */

import { v4 as uuidv4 } from 'uuid';
import BaseGridDataProvider from '../base-provider';
import {
  ProviderConfig,
  GridAsset,
  GridTelemetry,
  ProviderHealthStatus,
} from '../types';

export class OutageManagementProvider extends BaseGridDataProvider {
  private mockAssets: GridAsset[] = [];

  constructor(config: ProviderConfig) {
    super(config);
    this.setupMockData();
  }

  public async connect(): Promise<void> {
    console.log(`[OMS:${this.config.providerId}] Connecting to Outage Management System...`);
    this.connected = true;
    this.connectedSince = new Date().toISOString();
  }

  public async disconnect(): Promise<void> {
    console.log(`[OMS:${this.config.providerId}] Disconnecting...`);
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
      latencyMs: Math.random() * 150,
      lastHeartbeat: new Date().toISOString(),
      recordsInQueue: Math.floor(Math.random() * 100),
      metricsProcessed: this.telemetryReceived,
    };
  }

  public async snapshot(): Promise<{
    assets: GridAsset[];
    telemetry: GridTelemetry[];
    timestamp: string;
  }> {
    if (!this.connected) {
      throw new Error('Outage Management provider not connected');
    }

    // Generate outage/incident telemetry
    const telemetry = this.mockAssets.map((asset) => ({
      assetId: asset.id,
      timestamp: new Date().toISOString(),
      measurements: {
        outageStatus: Math.random() > 0.9 ? 'OUTAGE' : 'NORMAL',
        activeOutages: Math.floor(Math.random() * 5),
        plannedMaintenance: Math.floor(Math.random() * 3),
        customersAffected: Math.floor(Math.random() * 10000),
        estimatedRestoration: new Date(Date.now() + Math.random() * 86400000).toISOString(),
      },
      quality: {
        confidence: 95,
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
      throw new Error('Outage Management provider not connected');
    }

    // Historical outage records
    const results: GridTelemetry[] = [];

    for (const assetId of params.assetIds) {
      const asset = this.mockAssets.find((a) => a.id === assetId);
      if (!asset) continue;

      results.push({
        assetId,
        timestamp: new Date(params.startTime).toISOString(),
        measurements: {
          outageId: uuidv4(),
          startTime: params.startTime,
          endTime: params.endTime,
          duration: Math.floor(Math.random() * 1440), // Minutes
          cause: ['EQUIPMENT_FAILURE', 'WEATHER', 'MAINTENANCE', 'UNKNOWN'][Math.floor(Math.random() * 4)],
          affectedCustomers: Math.floor(Math.random() * 5000),
        },
        quality: {
          confidence: 99,
          source: this.config.providerId,
          lastVerified: new Date(params.startTime).toISOString(),
        },
      });
    }

    return results;
  }

  private setupMockData(): void {
    this.mockAssets = [
      {
        id: uuidv4(),
        type: 'FEEDER',
        name: 'OMS - Nairobi Distribution Zone',
        location: {
          latitude: -1.2866,
          longitude: 36.8172,
          zone: 'Central',
          region: 'Nairobi',
        },
        owner: 'KETRACO',
        operatingVoltage: 11,
        ratedCapacity: 50,
        metadata: {
          omsZoneId: 'OMS-NAIROBI',
          customersServed: 150000,
          averageOutageDuration: 45,
        },
        lastUpdated: new Date().toISOString(),
      },
    ];
  }
}

export default OutageManagementProvider;
