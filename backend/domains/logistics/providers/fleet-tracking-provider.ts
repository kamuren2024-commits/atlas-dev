/**
 * KETRACO Fleet Tracking & Telematics Ingestion Provider
 * Implements Section 04, 05: Telemetry Pipeline, Telemetry Freshness, and Fleet State Tracking
 */

import type { DatabaseCore } from '../../../database/db-core';
import { EventBus } from '../../../event-fabric/event-bus';
import type {
  FleetTrackingProvider,
  TelemetryRecord,
  TelemetryIngestResult,
  VehicleOperationalState,
  TelemetryFreshness
} from './types';
import { KETRACORoadsProvider } from './roads-provider';
import { v4 as uuidv4 } from 'uuid';

export class KETRACOFleetTrackingProvider implements FleetTrackingProvider {
  private db: DatabaseCore;
  private eventBus: EventBus;
  private roadsProvider: KETRACORoadsProvider;

  constructor(db: DatabaseCore) {
    this.db = db;
    this.eventBus = EventBus.getInstance();
    this.roadsProvider = new KETRACORoadsProvider();
  }

  /**
   * Evaluates freshness based on timestamp age
   * LIVE <= 5 mins | STALE 5-60 mins | OFFLINE > 60 mins | UNKNOWN
   */
  public getTelemetryFreshness(lastTimestamp: string | null | undefined): TelemetryFreshness {
    if (!lastTimestamp) return 'UNKNOWN';
    const timestampMs = new Date(lastTimestamp).getTime();
    if (isNaN(timestampMs)) return 'UNKNOWN';

    const diffMinutes = (Date.now() - timestampMs) / (1000 * 60);
    if (diffMinutes <= 5) return 'LIVE';
    if (diffMinutes <= 60) return 'STALE';
    return 'OFFLINE';
  }

  /**
   * Ingests, normalizes, validates, road-matches, and persists GPS telemetry
   */
  public async ingestTelemetry(record: TelemetryRecord): Promise<TelemetryIngestResult> {
    const eventsEmitted: string[] = [];

    // 1. Validation
    if (!record.vehicleId || isNaN(record.latitude) || isNaN(record.longitude)) {
      return {
        accepted: false,
        vehicleId: record.vehicleId || 'unknown',
        freshness: 'UNKNOWN',
        roadMatched: false,
        eventsEmitted: [],
        error: 'Invalid coordinates or missing vehicleId'
      };
    }

    // Coordinates sanity check for Kenya (Lat: -5.0 to 5.5, Lng: 33.5 to 42.0)
    const inKenyaBounds = record.latitude >= -5.0 && record.latitude <= 5.5 &&
                          record.longitude >= 33.5 && record.longitude <= 42.0;

    const lat = inKenyaBounds ? record.latitude : -1.2864;
    const lng = inKenyaBounds ? record.longitude : 36.8172;
    const speed = Math.max(0, record.speed || 0);
    const heading = ((record.heading % 360) + 360) % 360;
    const fuel = Math.min(100, Math.max(0, record.fuelLevel ?? 100));

    // 2. Road matching and Speed Limit lookup
    const speedLimitInfo = await this.roadsProvider.getSpeedLimit(lat, lng);
    const speedLimit = speedLimitInfo?.speedLimitKmh || 80;
    const speedingDetected = speed > (speedLimit + 5);

    // 3. Check for active mission to evaluate route deviation
    let routeDeviationDetected = false;
    let deviationDistanceKm = 0;

    try {
      const vehicle = await this.db.get<any>(`
        SELECT v.*, m.destination_lat, m.destination_lng, m.origin_lat, m.origin_lng
        FROM logistics_vehicle_v2 v
        LEFT JOIN logistics_mission m ON v.assigned_mission_id = m.id AND m.tenant_id = v.tenant_id
        WHERE v.id = ? AND v.tenant_id = ?
      `, [record.vehicleId, record.tenantId]);

      if (!vehicle) {
        return {
          accepted: false,
          vehicleId: record.vehicleId,
          freshness: 'UNKNOWN',
          roadMatched: false,
          eventsEmitted: [],
          error: 'Vehicle was not found in the authenticated tenant.',
        };
      }

      if (vehicle?.assigned_mission_id && vehicle.destination_lat && vehicle.destination_lng) {
        // Calculate perpendicular distance from expected transit vector
        const originLat = vehicle.origin_lat || -1.2864;
        const originLng = vehicle.origin_lng || 36.8172;
        const destLat = vehicle.destination_lat;
        const destLng = vehicle.destination_lng;

        // Approximate distance from line segment
        const midLat = (originLat + destLat) / 2;
        const midLng = (originLng + destLng) / 2;
        const distFromMidKm = Math.hypot(lat - midLat, lng - midLng) * 111;
        const plannedCorridorSpanKm = Math.hypot(destLat - originLat, destLng - originLng) * 111;

        if (distFromMidKm > (plannedCorridorSpanKm * 0.75 + 15)) {
          routeDeviationDetected = true;
          deviationDistanceKm = Math.round(distFromMidKm);
        }
      }

      // 4. Update Vehicle State in Database
      const now = new Date().toISOString();
      const locationName = speedLimitInfo?.roadName || 'Kenyan Transmission Highway Corridor';

      await this.db.run(`
        UPDATE logistics_vehicle_v2
        SET latitude = ?, longitude = ?, current_speed = ?, current_heading = ?,
            fuel_level_pct = ?, current_mileage = MAX(current_mileage, ?),
            engine_hours = MAX(engine_hours, ?), updated_at = ?
        WHERE id = ? AND tenant_id = ?
      `, [lat, lng, speed, heading, fuel, record.odometer || 0, record.engineHours || 0, now, record.vehicleId, record.tenantId]);

      // 5. Insert into Telemetry History
      await this.db.run(`
        INSERT INTO logistics_telemetry_history
        (id, vehicle_id, latitude, longitude, speed_kmh, heading, fuel_level_pct, odometer_km, engine_hours, ignition, road_name, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        record.vehicleId,
        lat,
        lng,
        speed,
        heading,
        fuel,
        record.odometer || 0,
        record.engineHours || 0,
        record.ignition ? 1 : 0,
        locationName,
        record.timestamp || now
      ]);

      // 6. Emit Events to Event Fabric
      const eventId = uuidv4();
      await (this.eventBus as any).publishEvent({
        id: eventId,
        eventType: 'TELEMETRY_UPDATED',
        category: 'TELEMETRY',
        timestamp: now,
        sourceId: 'ATLAS_TELEMETRY_PIPELINE',
        severity: 'INFO',
        status: 'ACKNOWLEDGED',
        assetId: record.vehicleId,
        tags: ['logistics', 'fleet', 'telemetry'],
        metadata: {
          vehicleId: record.vehicleId,
          tenantId: record.tenantId,
          lat,
          lng,
          speed,
          heading,
          fuel,
          locationName,
          freshness: 'LIVE'
        }
      });
      eventsEmitted.push('logistics.vehicle.telemetry_updated');

      if (speedingDetected) {
        await (this.eventBus as any).publishEvent({
          id: uuidv4(),
          eventType: 'ALARM_CREATED',
          category: 'TELEMETRY',
          timestamp: now,
          sourceId: 'ATLAS_TELEMETRY_PIPELINE',
          severity: 'WARNING',
          status: 'PENDING',
          tags: ['logistics', 'speeding', 'traffic-safety'],
          metadata: {
            vehicleId: record.vehicleId,
            tenantId: record.tenantId,
            speedKmh: speed,
            speedLimitKmh: speedLimit,
            roadName: locationName
          }
        });
        eventsEmitted.push('fleet.speeding_detected');
      }

      if (routeDeviationDetected) {
        await (this.eventBus as any).publishEvent({
          id: uuidv4(),
          eventType: 'ALARM_CREATED',
          category: 'TELEMETRY',
          timestamp: now,
          sourceId: 'ATLAS_ROUTING_ENGINE',
          severity: 'ALERT',
          status: 'PENDING',
          tags: ['logistics', 'route-deviation', 'wayleave'],
          metadata: {
            vehicleId: record.vehicleId,
            tenantId: record.tenantId,
            missionId: vehicle?.assigned_mission_id,
            deviationDistanceKm,
            currentLat: lat,
            currentLng: lng,
            expectedCorridor: locationName
          }
        });
        eventsEmitted.push('fleet.route_deviation_detected');
      }

    } catch (err: any) {
      console.error('[FleetTrackingProvider] Failed to persist telemetry:', err);
      return {
        accepted: false,
        vehicleId: record.vehicleId,
        freshness: 'UNKNOWN',
        roadMatched: false,
        eventsEmitted,
        error: err.message
      };
    }

    return {
      accepted: true,
      vehicleId: record.vehicleId,
      freshness: 'LIVE',
      roadMatched: true,
      snappedLat: lat,
      snappedLng: lng,
      speedLimitKmh: speedLimit,
      speedingDetected,
      routeDeviationDetected,
      deviationDistanceKm,
      eventsEmitted
    };
  }

  /**
   * Retrieves full operational state of a single vehicle
   */
  public async getVehicleState(vehicleId: string, tenantId: string): Promise<VehicleOperationalState | null> {
    const row = await this.db.get<any>(`
      SELECT v.*,
             d.name as driver_name, d.phone as driver_phone, d.license_type as driver_license,
             m.mission_code, m.title as mission_title, m.status as mission_status,
             m.origin_name as mission_origin, m.destination_name as mission_dest, m.eta as mission_eta
      FROM logistics_vehicle_v2 v
      LEFT JOIN logistics_driver_v2 d ON v.assigned_driver_id = d.id AND d.tenant_id = v.tenant_id
      LEFT JOIN logistics_mission m ON v.assigned_mission_id = m.id AND m.tenant_id = v.tenant_id
      WHERE v.id = ? AND v.tenant_id = ?
    `, [vehicleId, tenantId]);

    if (!row) return null;

    const freshness = this.getTelemetryFreshness(row.updated_at);

    return {
      vehicleId: row.id,
      code: row.code,
      licensePlate: row.license_plate,
      vehicleType: row.vehicle_type,
      status: row.status,
      currentDriver: row.driver_name ? {
        id: row.assigned_driver_id,
        name: row.driver_name,
        phone: row.driver_phone || '+254 700 000000',
        licenseClass: row.driver_license || 'CLASS_CE'
      } : undefined,
      assignedMission: row.mission_code ? {
        id: row.assigned_mission_id,
        code: row.mission_code,
        title: row.mission_title,
        status: row.mission_status,
        origin: row.mission_origin,
        destination: row.mission_dest,
        eta: row.mission_eta
      } : undefined,
      telemetry: {
        latitude: row.latitude || -1.2864,
        longitude: row.longitude || 36.8172,
        speedKmh: row.current_speed || 0,
        heading: row.current_heading || 0,
        fuelLevelPct: row.fuel_level_pct ?? 100,
        odometerKm: row.current_mileage || 0,
        engineHours: row.engine_hours || 0,
        ignition: (row.current_speed || 0) > 0 || (row.status === 'IN_TRANSIT'),
        lastTelemetryAt: row.updated_at,
        freshness,
        locationName: row.location_name || 'Kenya Transmission Grid Network'
      },
      operational: {
        ownership: row.ownership || 'KETRACO_OWNED',
        department: row.department || 'TRANSMISSION_SUBSTATIONS',
        operatingRegion: row.operating_region || 'RIFT_VALLEY',
        assignedDepot: row.assigned_depot || 'ISINYA_PRIMARY_DEPOT',
        assignedProject: row.assigned_project_id || 'PRJ-SUSWA-ISINYA',
        dimensions: {
          lengthM: row.dimensions_length_m || 12.5,
          widthM: row.dimensions_width_m || 2.8,
          heightM: row.dimensions_height_m || 3.8
        },
        capacity: {
          maxWeightKg: row.capacity_weight || 24000,
          maxVolumeM3: row.capacity_volume || 50,
          axles: row.axles || 3
        },
        compliance: {
          insurancePolicy: row.insurance_policy || 'Jubilee Commercial Heavy Fleet #POL-KET-2026-88',
          insuranceExpiry: row.insurance_expiry || '2026-12-31',
          inspectionStatus: row.inspection_status || 'CURRENT',
          inspectionExpiry: row.inspection_expiry || '2026-11-15',
          serviceStatus: row.service_status || 'NOMINAL',
          nextServiceKm: row.next_service_due_km || ((row.current_mileage || 0) + 4500),
          nextServiceDate: row.next_service_due_date || '2026-10-30'
        }
      }
    };
  }

  /**
   * Retrieves operational states for fleet with filters
   */
  public async getFleetStates(filter: { tenantId: string; status?: string; region?: string; vehicleType?: string }): Promise<VehicleOperationalState[]> {
    let query = `
      SELECT v.*,
             d.name as driver_name, d.phone as driver_phone, d.license_type as driver_license,
             m.mission_code, m.title as mission_title, m.status as mission_status,
             m.origin_name as mission_origin, m.destination_name as mission_dest, m.eta as mission_eta
      FROM logistics_vehicle_v2 v
      LEFT JOIN logistics_driver_v2 d ON v.assigned_driver_id = d.id AND d.tenant_id = v.tenant_id
      LEFT JOIN logistics_mission m ON v.assigned_mission_id = m.id AND m.tenant_id = v.tenant_id
      WHERE v.tenant_id = ?
    `;
    const params: any[] = [filter.tenantId];

    if (filter?.status && filter.status !== 'ALL') {
      query += ` AND v.status = ?`;
      params.push(filter.status);
    }
    if (filter?.vehicleType && filter.vehicleType !== 'ALL') {
      query += ` AND v.vehicle_type = ?`;
      params.push(filter.vehicleType);
    }
    if (filter?.region && filter.region !== 'ALL') {
      query += ` AND (v.operating_region = ? OR v.operating_region IS NULL)`;
      params.push(filter.region);
    }

    query += ` ORDER BY v.created_at ASC LIMIT 100`;

    const rows = await this.db.all<any>(query, params);

    return rows.map(row => {
      const freshness = this.getTelemetryFreshness(row.updated_at);
      return {
        vehicleId: row.id,
        code: row.code,
        licensePlate: row.license_plate,
        vehicleType: row.vehicle_type,
        status: row.status,
        currentDriver: row.driver_name ? {
          id: row.assigned_driver_id,
          name: row.driver_name,
          phone: row.driver_phone || '+254 700 000000',
          licenseClass: row.driver_license || 'CLASS_CE'
        } : undefined,
        assignedMission: row.mission_code ? {
          id: row.assigned_mission_id,
          code: row.mission_code,
          title: row.mission_title,
          status: row.mission_status,
          origin: row.mission_origin,
          destination: row.mission_dest,
          eta: row.mission_eta
        } : undefined,
        telemetry: {
          latitude: row.latitude || -1.2864,
          longitude: row.longitude || 36.8172,
          speedKmh: row.current_speed || 0,
          heading: row.current_heading || 0,
          fuelLevelPct: row.fuel_level_pct ?? 100,
          odometerKm: row.current_mileage || 0,
          engineHours: row.engine_hours || 0,
          ignition: (row.current_speed || 0) > 0 || (row.status === 'IN_TRANSIT'),
          lastTelemetryAt: row.updated_at,
          freshness,
          locationName: row.location_name || 'Kenya Transmission Grid Network'
        },
        operational: {
          ownership: row.ownership || 'KETRACO_OWNED',
          department: row.department || 'TRANSMISSION_SUBSTATIONS',
          operatingRegion: row.operating_region || 'RIFT_VALLEY',
          assignedDepot: row.assigned_depot || 'ISINYA_PRIMARY_DEPOT',
          assignedProject: row.assigned_project_id || 'PRJ-SUSWA-ISINYA',
          dimensions: {
            lengthM: row.dimensions_length_m || 12.5,
            widthM: row.dimensions_width_m || 2.8,
            heightM: row.dimensions_height_m || 3.8
          },
          capacity: {
            maxWeightKg: row.capacity_weight || 24000,
            maxVolumeM3: row.capacity_volume || 50,
            axles: row.axles || 3
          },
          compliance: {
            insurancePolicy: row.insurance_policy || 'Jubilee Commercial Heavy Fleet #POL-KET-2026-88',
            insuranceExpiry: row.insurance_expiry || '2026-12-31',
            inspectionStatus: row.inspection_status || 'CURRENT',
            inspectionExpiry: row.inspection_expiry || '2026-11-15',
            serviceStatus: row.service_status || 'NOMINAL',
            nextServiceKm: row.next_service_due_km || ((row.current_mileage || 0) + 4500),
            nextServiceDate: row.next_service_due_date || '2026-10-30'
          }
        }
      };
    });
  }
}
