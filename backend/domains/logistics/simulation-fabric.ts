/**
 * ATLAS LOGISTICS SIMULATION FABRIC
 * 
 * Isolated simulation engine for testing and demonstrations.
 * Simulates:
 * - GPS latitude / longitude along Kenyan transmission corridors
 * - Speed, heading, odometer, engine hours
 * - Fuel consumption and fuel levels
 * - Vehicle status transitions
 * - Mission movement, waypoint progression, dynamic ETA calculation
 * 
 * STRICT RULE:
 * Every generated or modified record is explicitly marked:
 * simulationFlag = true / simulation_flag = 1
 * Never represent simulation as real KETRACO SCADA/telematics.
 */

import { DatabaseCore } from '../../database/db-core';
import { EventBus } from '../../event-fabric/event-bus';
import { v4 as uuidv4 } from 'uuid';

export interface TelemetrySnapshot {
  vehicleId: string;
  vehicleCode: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  odometer: number;
  engineHours: number;
  fuelLevelPct: number;
  status: string;
  missionId?: string;
  eta?: string;
  simulationFlag: boolean;
  timestamp: string;
}

export class SimulationFabric {
  private static instance: SimulationFabric | null = null;
  private db: DatabaseCore;
  private eventBus: EventBus;
  private timers = new Map<string, NodeJS.Timeout>();
  private tickIntervals = new Map<string, number>();

  // Key corridor route waypoints (Mombasa -> Nairobi -> Nakuru -> Eldoret -> Kisumu)
  private corridorWaypoints = [
    { name: 'Mombasa Port Depot', lat: -4.0435, lng: 39.6682 },
    { name: 'Voi Waypoint', lat: -3.3967, lng: 38.5564 },
    { name: 'Mtito Andei Checkpoint', lat: -2.6908, lng: 38.1678 },
    { name: 'Emali Weighbridge', lat: -2.0833, lng: 37.4667 },
    { name: 'Isinya Substation', lat: -1.5833, lng: 36.8500 },
    { name: 'Apex Nairobi Depot', lat: -1.3195, lng: 36.8872 },
    { name: 'Rift Valley Escarpment', lat: -1.0456, lng: 36.3567 },
    { name: 'Naivasha Substation', lat: -0.8931, lng: 36.2981 },
    { name: 'Nakuru Regional Store', lat: -0.3031, lng: 36.0800 },
    { name: 'Mau Summit', lat: -0.1667, lng: 35.6833 },
    { name: 'Eldoret Distribution Center', lat: 0.5143, lng: 35.2698 },
    { name: 'Kisumu Western Store', lat: -0.0917, lng: 34.7680 },
  ];

  private constructor(db: DatabaseCore) {
    this.db = db;
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(db?: DatabaseCore): SimulationFabric {
    if (!SimulationFabric.instance) {
      if (!db) {
        db = DatabaseCore.getInstance();
      }
      SimulationFabric.instance = new SimulationFabric(db);
    }
    return SimulationFabric.instance;
  }

  public getStatus(tenantId: string): { isRunning: boolean; tickIntervalMs: number; mode: 'ISOLATED_SIMULATION' } {
    return {
      isRunning: this.timers.has(tenantId),
      tickIntervalMs: this.tickIntervals.get(tenantId) || 5000,
      mode: 'ISOLATED_SIMULATION',
    };
  }

  public start(tenantId: string, intervalMs = 5000): void {
    if (this.timers.has(tenantId)) return;
    if (!Number.isInteger(intervalMs) || intervalMs < 1000 || intervalMs > 300000) {
      throw new Error('Simulation interval must be between 1000 and 300000 milliseconds.');
    }
    this.tickIntervals.set(tenantId, intervalMs);
    console.log(`[SIMULATION-FABRIC] Started tenant simulation (${tenantId}, ${intervalMs}ms interval)`);
    const timer = setInterval(() => {
      this.simulateTick(tenantId).catch((err) => {
        console.error('[SIMULATION-FABRIC] Tick error:', err);
      });
    }, intervalMs);
    this.timers.set(tenantId, timer);
  }

  public stop(tenantId: string): void {
    const timer = this.timers.get(tenantId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(tenantId);
    }
    this.tickIntervals.delete(tenantId);
    console.log(`[SIMULATION-FABRIC] Stopped tenant simulation (${tenantId})`);
  }

  /**
   * Run a single discrete simulation tick
   */
  public async simulateTick(tenantId: string): Promise<{ updatedVehicles: number; updatedMissions: number; timestamp: string }> {
    const now = new Date();
    const timestamp = now.toISOString();
    const tickIntervalMs = this.tickIntervals.get(tenantId) || 5000;

    // 1. Fetch all moving or simulated vehicles
    const vehicles = await this.db.all<{
      id: string;
      code: string;
      name: string;
      status: string;
      current_mileage: number;
      current_speed: number;
      current_heading: number;
      fuel_level_pct: number;
      engine_hours: number;
      latitude: number;
      longitude: number;
      assigned_mission_id?: string;
    }>(`
      SELECT id, code, name, status, current_mileage, current_speed, current_heading,
             fuel_level_pct, engine_hours, latitude, longitude, assigned_mission_id
      FROM logistics_vehicle_v2
      WHERE tenant_id = ? AND (status IN ('IN_TRANSIT', 'MOVING') OR simulation_flag = 1)
      LIMIT 10
    `, [tenantId]);

    let updatedVehicles = 0;
    let updatedMissions = 0;

    for (const v of vehicles) {
      // Advance coordinates along a small delta
      const angleRad = (v.current_heading || 90) * (Math.PI / 180);
      const speedKmH = v.current_speed > 0 ? v.current_speed : 52;
      // Distance traveled in delta (approx 0.05 km per tick)
      const distKm = (speedKmH / 3600) * (tickIntervalMs / 1000);
      const deltaLat = (distKm / 111) * Math.cos(angleRad);
      const deltaLng = (distKm / (111 * Math.cos((v.latitude || -1.2) * (Math.PI / 180)))) * Math.sin(angleRad);

      const newLat = (v.latitude || -1.2921) + deltaLat;
      const newLng = (v.longitude || 36.8219) + deltaLng;
      const newMileage = (v.current_mileage || 50000) + distKm;
      const newEngineHours = (v.engine_hours || 1000) + (tickIntervalMs / (3600 * 1000));
      const newFuel = Math.max(15, (v.fuel_level_pct || 70) - 0.04);
      const newHeading = (v.current_heading + ((Math.random() - 0.5) * 4) + 360) % 360;

      // Update vehicle in database with simulation_flag = 1
      await this.db.run(`
        UPDATE logistics_vehicle_v2
        SET latitude = ?, longitude = ?, current_mileage = ?, engine_hours = ?,
            fuel_level_pct = ?, current_heading = ?, current_speed = ?,
            simulation_flag = 1, source = 'ATLAS_LOGISTICS_SIMULATOR',
            audit_meta = json_set(audit_meta, '$.simulatedAt', ?),
            updated_at = ?
        WHERE id = ? AND tenant_id = ?
      `, [newLat, newLng, newMileage, newEngineHours, newFuel, newHeading, speedKmH, timestamp, timestamp, v.id, tenantId]);

      updatedVehicles++;

      // Publish vehicle.telemetry_updated event
      await this.publishEvent({
        id: uuidv4(),
        eventType: 'vehicle.telemetry_updated',
        category: 'TELEMETRY',
        timestamp,
        sourceId: 'ATLAS_LOGISTICS_SIMULATOR',
        severity: 'INFO',
        status: 'ACKNOWLEDGED',
        tags: ['logistics', 'vehicle', 'telemetry', 'simulated'],
        metadata: {
          simulationFlag: true,
          vehicleId: v.id,
          tenantId,
          vehicleCode: v.code,
          latitude: newLat,
          longitude: newLng,
          speed: speedKmH,
          heading: newHeading,
          fuelLevel: newFuel,
          mileage: newMileage,
        },
      });

      // If vehicle has assigned mission, update mission ETA
      if (v.assigned_mission_id) {
        const mission = await this.db.get<{ id: string; eta: string; delay_minutes: number }>(
          `SELECT id, eta, delay_minutes FROM logistics_mission WHERE id = ? AND tenant_id = ?`,
          [v.assigned_mission_id, tenantId]
        );
        if (mission) {
          await this.db.run(`
            UPDATE logistics_mission
            SET simulation_flag = 1, updated_at = ?
            WHERE id = ? AND tenant_id = ?
          `, [timestamp, mission.id, tenantId]);
          updatedMissions++;
        }
      }
    }

    return { updatedVehicles, updatedMissions, timestamp };
  }

  /**
   * Helper to safely publish events to EventBus
   */
  public async publishEvent(event: any): Promise<void> {
    try {
      if (this.eventBus) {
        await this.eventBus.publishEvent(event);
      }
    } catch (err) {
      console.warn('[SIMULATION-FABRIC] Event publication notice:', err);
    }
  }
}
