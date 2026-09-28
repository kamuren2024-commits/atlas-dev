/**
 * KETRACO Telemetry Pipeline Abstraction
 * Implements Section 05:
 * GPS_DEVICE -> TELEMETRY_INGESTION -> VALIDATION -> NORMALIZATION -> ROAD_MATCHING -> VEHICLE_STATE -> EVENT_ENGINE -> GRAPH -> UI
 */

import type { DatabaseCore } from '../../database/db-core';
import { EventBus } from '../../event-fabric/event-bus';
import { KnowledgeGraphService } from '../../evaluation/knowledge-graph';
import { KETRACOFleetTrackingProvider } from './providers/fleet-tracking-provider';
import type { TelemetryRecord, TelemetryIngestResult, TelemetryFreshness } from './providers/types';

export class TelemetryPipeline {
  private static instance: TelemetryPipeline | null = null;
  private db: DatabaseCore;
  private eventBus: EventBus;
  private kgService: KnowledgeGraphService;
  private fleetTracking: KETRACOFleetTrackingProvider;

  private constructor(db: DatabaseCore) {
    this.db = db;
    this.eventBus = EventBus.getInstance();
    this.kgService = KnowledgeGraphService.getInstance();
    this.fleetTracking = new KETRACOFleetTrackingProvider(db);
  }

  public static getInstance(db: DatabaseCore): TelemetryPipeline {
    if (!TelemetryPipeline.instance) {
      TelemetryPipeline.instance = new TelemetryPipeline(db);
    }
    return TelemetryPipeline.instance;
  }

  /**
   * Complete pipeline ingestion method
   */
  public async processTelemetry(input: Partial<TelemetryRecord>, tenantId: string): Promise<TelemetryIngestResult> {
    const receivedAt = new Date().toISOString();

    // Step 1: Normalization & Defaults
    const record: TelemetryRecord = {
      tenantId,
      vehicleId: String(input.vehicleId || '').trim(),
      timestamp: input.timestamp || receivedAt,
      latitude: Number(input.latitude ?? -1.2864),
      longitude: Number(input.longitude ?? 36.8172),
      altitude: input.altitude ? Number(input.altitude) : 1680,
      speed: Number(input.speed ?? 0),
      heading: Number(input.heading ?? 0),
      ignition: Boolean(input.ignition ?? ((input.speed ?? 0) > 0)),
      odometer: Number(input.odometer ?? 0),
      engineHours: Number(input.engineHours ?? 0),
      fuelLevel: Number(input.fuelLevel ?? 100),
      source: input.source || 'CALAMP_GPS_GATEWAY',
      accuracy: Number(input.accuracy ?? 3.5),
      receivedAt
    };

    // Step 2 & 3 & 4: Ingestion, Validation, Road Matching, Vehicle State & Event Engine
    const result = await this.fleetTracking.ingestTelemetry(record);

    if (result.accepted) {
      // Step 5: Update Knowledge Graph Node
      try {
        this.kgService.addNode({
          id: record.vehicleId,
          type: 'VEHICLE',
          label: `Vehicle ${record.vehicleId}`,
          properties: {
            speed: record.speed,
            heading: record.heading,
            fuelLevel: record.fuelLevel,
            freshness: result.freshness,
            latitude: result.snappedLat || record.latitude,
            longitude: result.snappedLng || record.longitude,
            lastTelemetryAt: record.timestamp
          },
          provenance: {
            source: 'ATLAS_TELEMETRY_PIPELINE',
            sourceRecordId: record.vehicleId,
            observedAt: receivedAt,
            verificationStatus: 'VERIFIED',
            confidence: 0.99
          }
        } as any);
      } catch (graphErr) {
        console.warn('[TelemetryPipeline] Non-critical error updating graph node:', graphErr);
      }
    }

    return result;
  }

  /**
   * Returns telemetry freshness status for a given vehicle
   */
  public async getVehicleFreshness(vehicleId: string, tenantId: string): Promise<TelemetryFreshness> {
    const row = await this.db.get<any>(`
      SELECT updated_at FROM logistics_vehicle_v2 WHERE id = ? AND tenant_id = ?
    `, [vehicleId, tenantId]);

    return this.fleetTracking.getTelemetryFreshness(row?.updated_at);
  }
}
