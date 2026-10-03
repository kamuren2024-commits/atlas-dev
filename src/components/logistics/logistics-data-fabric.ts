import { useEffect, useState } from 'react';

export type LogisticsSourceType = 'PUBLIC_REFERENCE' | 'LIVE_AUTHORITATIVE' | 'SYNTHETIC' | 'UNAVAILABLE';
export type LogisticsMode = 'LIVE' | 'HYBRID' | 'SYNTHETIC' | 'UNAVAILABLE';

export interface LogisticsProvenance {
  sourceSystem: string;
  sourceDataset: string;
  sourceRecordId: string;
  importedAt: string;
  sourceTimestamp?: string;
  authority: LogisticsSourceType;
  confidence: number;
  transformationVersion: string;
}

export interface LogisticsVehicle {
  id: string;
  code: string;
  name: string;
  status: string;
  region: string;
  vehicleType: string;
  latitude: number;
  longitude: number;
  speedKph: number;
  heading: number;
  fuelLevelPct: number;
  driverName?: string;
  projectCode?: string;
  assignment?: string;
  provenance: LogisticsProvenance;
}

export interface LogisticsShipment {
  id: string;
  code: string;
  description: string;
  status: string;
  priority: string;
  origin: string;
  destination: string;
  vehicleId?: string;
  projectCode?: string;
  cargoType: string;
  quantity: number;
  weightKg: number;
  provenance: LogisticsProvenance;
}

export interface LogisticsWarehouse {
  id: string;
  code: string;
  name: string;
  city: string;
  status: string;
  capacitySqm: number;
  stockPercentage: number;
  itemsCount: number;
  alert: boolean;
  latitude: number;
  longitude: number;
  provenance: LogisticsProvenance;
}

export interface LogisticsRoute {
  id: string;
  code: string;
  name: string;
  originName: string;
  destinationName: string;
  distanceKm: number;
  estimatedDurationHours: number;
  roadCondition: string;
  weatherHazardLevel: string;
  provenance: LogisticsProvenance;
}

export interface LogisticsDelivery {
  id: string;
  code: string;
  status: string;
  eta: string;
  shipmentId?: string;
  vehicleId?: string;
  destination: string;
  podStatus: string;
  provenance: LogisticsProvenance;
}

export interface LogisticsRisk {
  id: string;
  code: string;
  title: string;
  severity: string;
  entityType: string;
  entityId: string;
  message: string;
  provenance: LogisticsProvenance;
}

export interface LogisticsAiOperation {
  id: string;
  code: string;
  category: string;
  severity: string;
  title: string;
  message: string;
  entityType: string;
  entityId: string;
  probabilityPct: number;
  recommendation: string;
  provenance: LogisticsProvenance;
}

export interface LogisticsAnalytics {
  fleetUtilizationPct: number;
  onTimeDeliveryPct: number;
  fuelConsumedLiters: number;
  fuelSpendKes: number;
  avgConsumptionPer100km: string;
  delayedMissions: number;
  totalActiveMissions: number;
}

export interface LogisticsTwin {
  generatedAt: string;
  source: {
    mode: LogisticsMode;
    label: string;
    notice: string;
    sourceType: LogisticsSourceType;
  };
  vehicles: LogisticsVehicle[];
  shipments: LogisticsShipment[];
  warehouses: LogisticsWarehouse[];
  routes: LogisticsRoute[];
  deliveries: LogisticsDelivery[];
  risks: LogisticsRisk[];
  aiOperations: LogisticsAiOperation[];
  analytics: LogisticsAnalytics;
}

const syntheticProvenance = (sourceSystem: string, sourceRecordId: string): LogisticsProvenance => ({
  sourceSystem,
  sourceDataset: 'KETRACO_LOGISTICS_SYNTHETIC',
  sourceRecordId,
  importedAt: new Date().toISOString(),
  authority: 'SYNTHETIC',
  confidence: 0.7,
  transformationVersion: 'synthetic-v1',
});

export const syntheticLogisticsTwin: LogisticsTwin = {
  generatedAt: new Date().toISOString(),
  source: {
    mode: 'SYNTHETIC',
    label: '● SIMULATED KETRACO-ALIGNED',
    notice: 'Deterministic synthetic fallback used until authoritative KETRACO data is available.',
    sourceType: 'SYNTHETIC',
  },
  vehicles: [
    { id: 'V-001', code: 'TRK-001', name: 'Heavy Haul 01', status: 'IN_TRANSIT', region: 'Nairobi', vehicleType: 'LOW_LOADER', latitude: -1.2864, longitude: 36.8172, speedKph: 58, heading: 124, fuelLevelPct: 74, driverName: 'J. Mwangangi', projectCode: 'MNR-01', assignment: 'Menengai-Rongai', provenance: syntheticProvenance('SYNTHETIC', 'V-001') },
    { id: 'V-002', code: 'TRK-002', name: 'Spare Carrier 02', status: 'AVAILABLE', region: 'Suswa', vehicleType: 'TRUCK', latitude: -1.0620, longitude: 36.8660, speedKph: 0, heading: 0, fuelLevelPct: 81, driverName: 'A. Wekesa', projectCode: 'LKS-02', assignment: 'Kisumu corridor', provenance: syntheticProvenance('SYNTHETIC', 'V-002') },
    { id: 'V-003', code: 'TRK-003', name: 'Concrete Lift 03', status: 'MAINTENANCE', region: 'Machakos', vehicleType: 'CRANE', latitude: -1.5197, longitude: 37.2571, speedKph: 0, heading: 0, fuelLevelPct: 42, driverName: 'P. Kibet', projectCode: 'MKI-01', assignment: 'Machakos laydown', provenance: syntheticProvenance('SYNTHETIC', 'V-003') },
  ],
  shipments: [
    { id: 'S-001', code: 'SHP-101', description: 'Transformer assembly dispatch', status: 'IN_TRANSIT', priority: 'CRITICAL', origin: 'Nairobi depot', destination: 'Suswa substation', vehicleId: 'V-001', projectCode: 'MNR-01', cargoType: 'TRANSFORMER', quantity: 2, weightKg: 18000, provenance: syntheticProvenance('SYNTHETIC', 'S-001') },
    { id: 'S-002', code: 'SHP-102', description: 'Conductor reel movement', status: 'PLANNED', priority: 'HIGH', origin: 'Mombasa port', destination: 'Kisumu project', vehicleId: 'V-002', projectCode: 'LKS-02', cargoType: 'CONDUCTOR', quantity: 9, weightKg: 21000, provenance: syntheticProvenance('SYNTHETIC', 'S-002') },
  ],
  warehouses: [
    { id: 'W-001', code: 'WH-01', name: 'Nairobi Central Depot', city: 'Nairobi', status: 'OPERATIONAL', capacitySqm: 9800, stockPercentage: 74, itemsCount: 1320, alert: false, latitude: -1.3128, longitude: 36.7780, provenance: syntheticProvenance('SYNTHETIC', 'W-001') },
    { id: 'W-002', code: 'WH-02', name: 'Suswa Staging Yard', city: 'Suswa', status: 'HIGH_ACTIVITY', capacitySqm: 6200, stockPercentage: 88, itemsCount: 980, alert: true, latitude: -1.0381, longitude: 36.8112, provenance: syntheticProvenance('SYNTHETIC', 'W-002') },
  ],
  routes: [
    { id: 'R-001', code: 'RT-101', name: 'Menengai–Rongai Corridor', originName: 'Nairobi Depot', destinationName: 'Suswa Substation', distanceKm: 188, estimatedDurationHours: 6.5, roadCondition: 'PAVED', weatherHazardLevel: 'LOW', provenance: syntheticProvenance('SYNTHETIC', 'R-001') },
    { id: 'R-002', code: 'RT-201', name: 'Loiyangalani–Suswa Feeder', originName: 'Loiyangalani', destinationName: 'Suswa', distanceKm: 428, estimatedDurationHours: 13, roadCondition: 'MIXED', weatherHazardLevel: 'MEDIUM', provenance: syntheticProvenance('SYNTHETIC', 'R-002') },
  ],
  deliveries: [
    { id: 'D-001', code: 'DEL-101', status: 'IN_TRANSIT', eta: '2026-10-03T18:00:00Z', shipmentId: 'S-001', vehicleId: 'V-001', destination: 'Suswa substation', podStatus: 'PENDING', provenance: syntheticProvenance('SYNTHETIC', 'D-001') },
    { id: 'D-002', code: 'DEL-102', status: 'PENDING', eta: '2026-10-04T09:30:00Z', shipmentId: 'S-002', vehicleId: 'V-002', destination: 'Kisumu project', podStatus: 'NOT_STARTED', provenance: syntheticProvenance('SYNTHETIC', 'D-002') },
  ],
  risks: [
    { id: 'X-001', code: 'RIS-101', title: 'Bridge clearance exposure', severity: 'HIGH', entityType: 'ROUTE', entityId: 'R-002', message: 'Heavy load route crosses a narrow corridor with temporary height restrictions.', provenance: syntheticProvenance('SYNTHETIC', 'X-001') },
  ],
  aiOperations: [
    { id: 'AI-001', code: 'OBS-001', category: 'OBSERVE', severity: 'MEDIUM', title: 'Traffic pattern anomaly', message: 'Dispatch pattern deviates from historical corridor baseline by 13%.', entityType: 'ROUTE', entityId: 'R-001', probabilityPct: 81, recommendation: 'Rebalance lane allocation and validate route assumptions.', provenance: syntheticProvenance('SYNTHETIC', 'AI-001') },
  ],
  analytics: {
    fleetUtilizationPct: 82,
    onTimeDeliveryPct: 89,
    fuelConsumedLiters: 18240,
    fuelSpendKes: 9400000,
    avgConsumptionPer100km: '13.8',
    delayedMissions: 3,
    totalActiveMissions: 15,
  },
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error(`Request failed for ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export class KetracoLogisticsDataMapper {
  static asVehicle(raw: Record<string, any>, fallbackId = 'unknown'): LogisticsVehicle {
    const id = String(raw.id ?? raw.code ?? raw.vehicleId ?? fallbackId);
    return {
      id,
      code: String(raw.code ?? raw.vehicleCode ?? raw.registration ?? id),
      name: String(raw.name ?? raw.vehicleName ?? 'Unassigned vehicle'),
      status: String(raw.status ?? 'UNKNOWN'),
      region: String(raw.region ?? raw.area ?? 'N/A'),
      vehicleType: String(raw.vehicleType ?? raw.type ?? raw.vehicle_type ?? 'UNKNOWN'),
      latitude: Number(raw.latitude ?? raw.lat ?? -1.2864),
      longitude: Number(raw.longitude ?? raw.lng ?? 36.8172),
      speedKph: Number(raw.speedKph ?? raw.currentSpeed ?? raw.speed ?? 0),
      heading: Number(raw.heading ?? raw.currentHeading ?? 0),
      fuelLevelPct: Number(raw.fuelLevelPct ?? raw.fuel_level_pct ?? 70),
      driverName: raw.driverName ?? raw.driver_name,
      projectCode: raw.projectCode ?? raw.project_code,
      assignment: raw.assignment ?? raw.assignedMission,
      provenance: {
        sourceSystem: String(raw.sourceSystem ?? 'KETRACO_APP'),
        sourceDataset: String(raw.sourceDataset ?? 'fleet'),
        sourceRecordId: String(raw.sourceRecordId ?? raw.id ?? raw.code ?? fallbackId),
        importedAt: new Date().toISOString(),
        sourceTimestamp: raw.sourceTimestamp ?? raw.updatedAt,
        authority: raw.authority === 'PUBLIC_REFERENCE' ? 'PUBLIC_REFERENCE' : 'LIVE_AUTHORITATIVE',
        confidence: Number(raw.confidence ?? 1),
        transformationVersion: 'canonical-v1',
      },
    };
  }
}

export class KetracoLogisticsDataAdapter {
  static adapt(raw: Partial<LogisticsTwin> | null | undefined): LogisticsTwin {
    const source = raw?.source ?? {
      mode: 'LIVE',
      label: '● LIVE KETRACO DATA',
      notice: 'Live KETRACO logistics state is active.',
      sourceType: 'LIVE_AUTHORITATIVE' as const,
    };

    return {
      generatedAt: raw?.generatedAt ?? new Date().toISOString(),
      source,
      vehicles: raw?.vehicles ?? syntheticLogisticsTwin.vehicles,
      shipments: raw?.shipments ?? syntheticLogisticsTwin.shipments,
      warehouses: raw?.warehouses ?? syntheticLogisticsTwin.warehouses,
      routes: raw?.routes ?? syntheticLogisticsTwin.routes,
      deliveries: raw?.deliveries ?? syntheticLogisticsTwin.deliveries,
      risks: raw?.risks ?? syntheticLogisticsTwin.risks,
      aiOperations: raw?.aiOperations ?? syntheticLogisticsTwin.aiOperations,
      analytics: raw?.analytics ?? syntheticLogisticsTwin.analytics,
    };
  }
}

export class SyntheticLogisticsProvider {
  static load(): LogisticsTwin {
    return KetracoLogisticsDataAdapter.adapt(syntheticLogisticsTwin);
  }
}

export class LogisticsDataProvider {
  static async load(): Promise<{ twin: LogisticsTwin; source: LogisticsSourceType; mode: LogisticsMode }> {
    try {
      const [overview, fleet, cargo, warehouses, routes, deliveries, analytics] = await Promise.allSettled([
        fetchJson<{ ok: boolean; data?: any }>('/api/logistics/overview'),
        fetchJson<{ ok: boolean; data?: any }>('/api/logistics/fleet/states'),
        fetchJson<{ ok: boolean; data?: any }>('/api/logistics/cargo'),
        fetchJson<{ ok: boolean; data?: any }>('/api/logistics/warehouses'),
        fetchJson<{ ok: boolean; data?: any }>('/api/logistics/routes'),
        fetchJson<{ ok: boolean; data?: any }>('/api/logistics/deliveries'),
        fetchJson<{ ok: boolean; data?: any }>('/api/logistics/analytics'),
      ]);

      const hasLiveData = [overview, fleet, cargo, warehouses, routes, deliveries, analytics].every(result => result.status === 'fulfilled' && result.value?.ok !== false);
      if (!hasLiveData) {
        const fallback = SyntheticLogisticsProvider.load();
        return { twin: fallback, source: 'SYNTHETIC', mode: 'SYNTHETIC' };
      }

      const liveTwin: LogisticsTwin = KetracoLogisticsDataAdapter.adapt({
        generatedAt: new Date().toISOString(),
        source: {
          mode: 'LIVE',
          label: '● LIVE KETRACO DATA',
          notice: 'Authoritative logistics telemetry and operations are live.',
          sourceType: 'LIVE_AUTHORITATIVE',
        },
        vehicles: (fleet.status === 'fulfilled' ? (fleet.value?.data?.states ?? []) : []).map((raw: any, index: number) => KetracoLogisticsDataMapper.asVehicle(raw, `vehicle-${index + 1}`)),
        shipments: (cargo.status === 'fulfilled' ? (cargo.value?.data?.cargo ?? []) : []).map((raw: any, index: number) => ({
          id: String(raw.id ?? `shipment-${index + 1}`),
          code: String(raw.code ?? raw.cargoCode ?? `SHP-${index + 1}`),
          description: String(raw.description ?? raw.name ?? 'Cargo movement'),
          status: String(raw.status ?? 'PLANNED'),
          priority: String(raw.priority ?? 'MEDIUM'),
          origin: String(raw.originSubstation ?? raw.origin ?? 'Unknown origin'),
          destination: String(raw.destinationSubstation ?? raw.destination ?? 'Unknown destination'),
          vehicleId: raw.vehicleId ?? raw.assignedVehicleId,
          projectCode: raw.projectCode ?? raw.project_code,
          cargoType: String(raw.cargoType ?? raw.type ?? 'STANDARD'),
          quantity: Number(raw.quantity ?? 1),
          weightKg: Number(raw.weightKg ?? raw.weight_kg ?? 0),
          provenance: {
            sourceSystem: String(raw.sourceSystem ?? 'KETRACO_APP'),
            sourceDataset: 'cargo',
            sourceRecordId: String(raw.sourceRecordId ?? raw.id ?? `shipment-${index + 1}`),
            importedAt: new Date().toISOString(),
            sourceTimestamp: raw.sourceTimestamp ?? raw.updatedAt,
            authority: 'LIVE_AUTHORITATIVE',
            confidence: 1,
            transformationVersion: 'canonical-v1',
          },
        })),
        warehouses: (warehouses.status === 'fulfilled' ? (warehouses.value?.data?.warehouses ?? []) : []).map((raw: any, index: number) => ({
          id: String(raw.id ?? `warehouse-${index + 1}`),
          code: String(raw.code ?? raw.warehouseCode ?? `WH-${index + 1}`),
          name: String(raw.name ?? 'Warehouse'),
          city: String(raw.city ?? 'Nairobi'),
          status: String(raw.status ?? 'OPERATIONAL'),
          capacitySqm: Number(raw.capacitySqm ?? raw.capacity_sqm ?? 5000),
          stockPercentage: Number(raw.stockPercentage ?? raw.stock_percentage ?? 60),
          itemsCount: Number(raw.itemsCount ?? raw.items_count ?? 0),
          alert: Boolean(raw.alert ?? raw.stockAlertFlag ?? false),
          latitude: Number(raw.latitude ?? -1.2864),
          longitude: Number(raw.longitude ?? 36.8172),
          provenance: {
            sourceSystem: String(raw.sourceSystem ?? 'KETRACO_APP'),
            sourceDataset: 'warehouses',
            sourceRecordId: String(raw.sourceRecordId ?? raw.id ?? `warehouse-${index + 1}`),
            importedAt: new Date().toISOString(),
            sourceTimestamp: raw.sourceTimestamp ?? raw.updatedAt,
            authority: 'LIVE_AUTHORITATIVE',
            confidence: 1,
            transformationVersion: 'canonical-v1',
          },
        })),
        routes: (routes.status === 'fulfilled' ? (routes.value?.data?.routes ?? []) : []).map((raw: any, index: number) => ({
          id: String(raw.id ?? `route-${index + 1}`),
          code: String(raw.code ?? `RT-${index + 1}`),
          name: String(raw.name ?? 'Logistics route'),
          originName: String(raw.originName ?? raw.origin ?? 'Origin'),
          destinationName: String(raw.destinationName ?? raw.destination ?? 'Destination'),
          distanceKm: Number(raw.distanceKm ?? raw.distance_km ?? 10),
          estimatedDurationHours: Number(raw.estimatedDurationHours ?? raw.estimated_duration_hours ?? 1),
          roadCondition: String(raw.roadCondition ?? raw.road_condition ?? 'PAVED'),
          weatherHazardLevel: String(raw.weatherHazardLevel ?? raw.weather_hazard_level ?? 'LOW'),
          provenance: {
            sourceSystem: String(raw.sourceSystem ?? 'KETRACO_APP'),
            sourceDataset: 'routes',
            sourceRecordId: String(raw.sourceRecordId ?? raw.id ?? `route-${index + 1}`),
            importedAt: new Date().toISOString(),
            sourceTimestamp: raw.sourceTimestamp ?? raw.updatedAt,
            authority: 'LIVE_AUTHORITATIVE',
            confidence: 1,
            transformationVersion: 'canonical-v1',
          },
        })),
        deliveries: (deliveries.status === 'fulfilled' ? (deliveries.value?.data?.deliveries ?? []) : []).map((raw: any, index: number) => ({
          id: String(raw.id ?? `delivery-${index + 1}`),
          code: String(raw.code ?? `DEL-${index + 1}`),
          status: String(raw.status ?? 'PENDING'),
          eta: String(raw.eta ?? new Date().toISOString()),
          shipmentId: raw.shipmentId ?? raw.shipment_id,
          vehicleId: raw.vehicleId ?? raw.vehicle_id,
          destination: String(raw.destination ?? raw.location ?? 'Unknown destination'),
          podStatus: String(raw.podStatus ?? raw.pod_status ?? 'PENDING'),
          provenance: {
            sourceSystem: String(raw.sourceSystem ?? 'KETRACO_APP'),
            sourceDataset: 'deliveries',
            sourceRecordId: String(raw.sourceRecordId ?? raw.id ?? `delivery-${index + 1}`),
            importedAt: new Date().toISOString(),
            sourceTimestamp: raw.sourceTimestamp ?? raw.updatedAt,
            authority: 'LIVE_AUTHORITATIVE',
            confidence: 1,
            transformationVersion: 'canonical-v1',
          },
        })),
        risks: [],
        aiOperations: [],
        analytics: {
          fleetUtilizationPct: Number(overview.status === 'fulfilled' ? (overview.value?.data?.fleet?.availabilityPct ?? 0) : 0),
          onTimeDeliveryPct: Number(analytics.status === 'fulfilled' ? (analytics.value?.data?.kpis?.onTimeDeliveryPct ?? 89) : 89),
          fuelConsumedLiters: Number(analytics.status === 'fulfilled' ? (analytics.value?.data?.kpis?.fuelConsumedLiters ?? 0) : 0),
          fuelSpendKes: Number(analytics.status === 'fulfilled' ? (analytics.value?.data?.kpis?.fuelSpendKes ?? 0) : 0),
          avgConsumptionPer100km: String(analytics.status === 'fulfilled' ? (analytics.value?.data?.kpis?.avgConsumptionPer100km ?? '13.8') : '13.8'),
          delayedMissions: Number(overview.status === 'fulfilled' ? (overview.value?.data?.kpis?.missions?.delayed ?? 0) : 0),
          totalActiveMissions: Number(overview.status === 'fulfilled' ? (overview.value?.data?.kpis?.missions?.total ?? 0) : 0),
        },
      });

      return { twin: liveTwin, source: 'LIVE_AUTHORITATIVE', mode: 'LIVE' };
    } catch (error) {
      const fallback = SyntheticLogisticsProvider.load();
      return { twin: fallback, source: 'SYNTHETIC', mode: 'SYNTHETIC' };
    }
  }
}

export function useLogisticsTwin() {
  const [twin, setTwin] = useState<LogisticsTwin>(syntheticLogisticsTwin);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await LogisticsDataProvider.load();
      setTwin(result.twin);
      if (result.mode !== 'LIVE') {
        setError('Using deterministic synthetic fallback while authoritative data is unavailable.');
      }
    } catch (caughtError) {
      setTwin(SyntheticLogisticsProvider.load());
      setError(caughtError instanceof Error ? caughtError.message : 'Logistics twin unavailable.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  return { twin, loading, error, refresh };
}
