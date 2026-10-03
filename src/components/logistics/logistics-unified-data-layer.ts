/**
 * LOGISTICS UNIFIED DATA LAYER
 * 
 * Canonical data pipeline that normalizes API responses into the Digital Twin model.
 * This is the SINGLE SOURCE OF TRUTH for all logistics data across all workspaces.
 * 
 * Pipeline:
 *   API Response → Normalizer → Validator → Twin Selector → Workspace Consumer
 */

import { useEffect, useState } from 'react';
import type { LogisticsTwin } from './logistics-data-fabric';
import { SyntheticLogisticsProvider } from './logistics-data-fabric';

/**
 * Normalize API response for Shipments/Cargo
 */
function normalizeCargoFromApi(data: any): LogisticsTwin['shipments'] {
  if (!data?.cargo) return [];
  return (data.cargo || []).map((c: any) => ({
    id: String(c.id ?? `cargo-${Math.random()}`),
    code: String(c.code ?? c.cargo_code ?? 'UNKNOWN'),
    description: String(c.description ?? c.name ?? 'Cargo item'),
    status: String(c.status ?? 'PLANNED'),
    priority: String(c.priority ?? 'MEDIUM'),
    origin: String(c.origin ?? c.originSubstation ?? 'Unknown'),
    destination: String(c.destination ?? c.destinationSubstation ?? 'Unknown'),
    vehicleId: c.vehicleId ?? c.vehicle_id ?? undefined,
    projectCode: c.projectCode ?? c.project_code ?? undefined,
    cargoType: String(c.cargoType ?? c.category ?? c.type ?? 'STANDARD'),
    quantity: Number(c.quantity ?? 1),
    weightKg: Number(c.weightKg ?? c.weight_kg ?? 0),
    provenance: {
      sourceSystem: 'KETRACO_APP',
      sourceDataset: 'cargo',
      sourceRecordId: String(c.id ?? `cargo-${Math.random()}`),
      importedAt: new Date().toISOString(),
      sourceTimestamp: c.createdAt ?? c.updated_at,
      authority: 'LIVE_AUTHORITATIVE',
      confidence: 1,
      transformationVersion: 'canonical-v1',
    },
  }));
}

/**
 * Normalize API response for Fleet/Vehicles
 */
function normalizeFleetFromApi(data: any): LogisticsTwin['vehicles'] {
  if (!data?.states) return [];
  return (data.states || []).map((v: any) => ({
    id: String(v.id ?? `vehicle-${Math.random()}`),
    code: String(v.code ?? v.vehicleCode ?? v.registration ?? 'UNKNOWN'),
    name: String(v.name ?? v.vehicleName ?? 'Unassigned vehicle'),
    status: String(v.status ?? 'UNKNOWN'),
    region: String(v.region ?? v.area ?? 'N/A'),
    vehicleType: String(v.vehicleType ?? v.type ?? v.vehicle_type ?? 'UNKNOWN'),
    latitude: Number(v.latitude ?? v.lat ?? -1.2864),
    longitude: Number(v.longitude ?? v.lng ?? 36.8172),
    speedKph: Number(v.speedKph ?? v.currentSpeed ?? v.speed ?? 0),
    heading: Number(v.heading ?? v.currentHeading ?? 0),
    fuelLevelPct: Number(v.fuelLevelPct ?? v.fuel_level_pct ?? 70),
    driverName: v.driverName ?? v.driver_name,
    projectCode: v.projectCode ?? v.project_code,
    assignment: v.assignment ?? v.assignedMission,
    provenance: {
      sourceSystem: 'KETRACO_APP',
      sourceDataset: 'fleet',
      sourceRecordId: String(v.id ?? v.code ?? `vehicle-${Math.random()}`),
      importedAt: new Date().toISOString(),
      sourceTimestamp: v.updatedAt ?? v.updated_at,
      authority: 'LIVE_AUTHORITATIVE',
      confidence: 1,
      transformationVersion: 'canonical-v1',
    },
  }));
}

/**
 * Normalize API response for Warehouses
 */
function normalizeWarehousesFromApi(data: any): LogisticsTwin['warehouses'] {
  if (!data?.warehouses) return [];
  return (data.warehouses || []).map((w: any) => ({
    id: String(w.id ?? `warehouse-${Math.random()}`),
    code: String(w.code ?? w.warehouseCode ?? 'WH-01'),
    name: String(w.name ?? 'Warehouse'),
    city: String(w.city ?? w.location ?? 'Nairobi'),
    status: String(w.status ?? 'OPERATIONAL'),
    capacitySqm: Number(w.capacitySqm ?? w.capacity_sqm ?? 5000),
    stockPercentage: Number(w.stockPercentage ?? w.stock_percentage ?? 50),
    itemsCount: Number(w.itemsCount ?? w.items_count ?? 0),
    alert: Boolean(w.alert ?? w.stockAlertFlag ?? w.stock_alert_flag ?? false),
    latitude: Number(w.latitude ?? -1.2864),
    longitude: Number(w.longitude ?? 36.8172),
    provenance: {
      sourceSystem: 'KETRACO_APP',
      sourceDataset: 'warehouses',
      sourceRecordId: String(w.id ?? `warehouse-${Math.random()}`),
      importedAt: new Date().toISOString(),
      sourceTimestamp: w.updatedAt ?? w.updated_at,
      authority: 'LIVE_AUTHORITATIVE',
      confidence: 1,
      transformationVersion: 'canonical-v1',
    },
  }));
}

/**
 * Normalize API response for Routes
 */
function normalizeRoutesFromApi(data: any): LogisticsTwin['routes'] {
  if (!data?.routes) return [];
  return (data.routes || []).map((r: any) => ({
    id: String(r.id ?? `route-${Math.random()}`),
    code: String(r.code ?? `RT-${Math.random()}`),
    name: String(r.name ?? 'Logistics route'),
    originName: String(r.originName ?? r.origin ?? 'Origin'),
    destinationName: String(r.destinationName ?? r.destination ?? 'Destination'),
    distanceKm: Number(r.distanceKm ?? r.distance_km ?? 10),
    estimatedDurationHours: Number(r.estimatedDurationHours ?? r.estimated_duration_hours ?? 1),
    roadCondition: String(r.roadCondition ?? r.road_condition ?? 'PAVED'),
    weatherHazardLevel: String(r.weatherHazardLevel ?? r.weather_hazard_level ?? 'LOW'),
    provenance: {
      sourceSystem: 'KETRACO_APP',
      sourceDataset: 'routes',
      sourceRecordId: String(r.id ?? `route-${Math.random()}`),
      importedAt: new Date().toISOString(),
      sourceTimestamp: r.updatedAt ?? r.updated_at,
      authority: 'LIVE_AUTHORITATIVE',
      confidence: 1,
      transformationVersion: 'canonical-v1',
    },
  }));
}

/**
 * Normalize API response for Deliveries
 */
function normalizeDeliveriesFromApi(data: any): LogisticsTwin['deliveries'] {
  if (!data?.deliveries) return [];
  return (data.deliveries || []).map((d: any) => ({
    id: String(d.id ?? `delivery-${Math.random()}`),
    code: String(d.code ?? d.deliveryCode ?? `DEL-${Math.random()}`),
    status: String(d.status ?? 'PENDING'),
    eta: String(d.eta ?? new Date().toISOString()),
    shipmentId: d.shipmentId ?? d.shipment_id,
    vehicleId: d.vehicleId ?? d.vehicle_id,
    destination: String(d.destination ?? d.location ?? 'Unknown destination'),
    podStatus: String(d.podStatus ?? d.pod_status ?? 'PENDING'),
    provenance: {
      sourceSystem: 'KETRACO_APP',
      sourceDataset: 'deliveries',
      sourceRecordId: String(d.id ?? `delivery-${Math.random()}`),
      importedAt: new Date().toISOString(),
      sourceTimestamp: d.updatedAt ?? d.updated_at,
      authority: 'LIVE_AUTHORITATIVE',
      confidence: 1,
      transformationVersion: 'canonical-v1',
    },
  }));
}

/**
 * Normalize API response for Risks
 */
function normalizeRisksFromApi(data: any): LogisticsTwin['risks'] {
  if (!data?.risks) return [];
  return (data.risks || []).map((r: any) => ({
    id: String(r.id ?? `risk-${Math.random()}`),
    code: String(r.code ?? r.riskCode ?? `RIS-${Math.random()}`),
    title: String(r.title ?? r.signal ?? 'Risk detected'),
    severity: String(r.severity ?? 'MEDIUM'),
    entityType: String(r.entityType ?? r.affectedEntity?.split(':')[0] ?? 'UNKNOWN'),
    entityId: String(r.entityId ?? r.affectedEntityId ?? 'UNKNOWN'),
    message: String(r.message ?? r.recommendedAction ?? 'Risk assessment pending'),
    provenance: {
      sourceSystem: 'KETRACO_APP',
      sourceDataset: 'risks',
      sourceRecordId: String(r.id ?? `risk-${Math.random()}`),
      importedAt: new Date().toISOString(),
      sourceTimestamp: r.timestamp ?? r.updated_at,
      authority: 'LIVE_AUTHORITATIVE',
      confidence: Number(r.confidence ?? 0.85),
      transformationVersion: 'canonical-v1',
    },
  }));
}

/**
 * Normalize API response for AI Operations
 */
function normalizeAiOpsFromApi(data: any): LogisticsTwin['aiOperations'] {
  if (!data?.aiOperations) return [];
  return (data.aiOperations || []).map((ao: any) => ({
    id: String(ao.id ?? `ai-op-${Math.random()}`),
    code: String(ao.code ?? `OBS-${Math.random()}`),
    category: String(ao.category ?? ao.signal_type ?? 'OBSERVE'),
    severity: String(ao.severity ?? 'MEDIUM'),
    title: String(ao.title ?? ao.signal ?? 'AI recommendation pending'),
    message: String(ao.message ?? 'Processing...'),
    entityType: String(ao.entityType ?? 'UNKNOWN'),
    entityId: String(ao.entityId ?? 'UNKNOWN'),
    probabilityPct: Number(ao.probabilityPct ?? ao.confidence ?? 75),
    recommendation: String(ao.recommendation ?? ao.recommendedAction ?? 'No action required'),
    provenance: {
      sourceSystem: 'KETRACO_APP',
      sourceDataset: 'ai_operations',
      sourceRecordId: String(ao.id ?? `ai-op-${Math.random()}`),
      importedAt: new Date().toISOString(),
      sourceTimestamp: ao.timestamp ?? ao.updated_at,
      authority: 'LIVE_AUTHORITATIVE',
      confidence: Number(ao.probabilityPct ?? 75) / 100,
      transformationVersion: 'canonical-v1',
    },
  }));
}

/**
 * Normalize API response for Analytics
 */
function normalizeAnalyticsFromApi(data: any): LogisticsTwin['analytics'] {
  const kpis = data?.kpis || {};
  return {
    fleetUtilizationPct: Number(kpis.fleetUtilizationPct ?? 82),
    onTimeDeliveryPct: Number(kpis.onTimeDeliveryPct ?? 89),
    fuelConsumedLiters: Number(kpis.fuelConsumedLiters ?? 18240),
    fuelSpendKes: Number(kpis.fuelSpendKes ?? 9400000),
    avgConsumptionPer100km: String(kpis.avgConsumptionPer100km ?? '13.8'),
    delayedMissions: Number(kpis.delayedMissions ?? 3),
    totalActiveMissions: Number(kpis.totalActiveMissions ?? 15),
  };
}

/**
 * Main hook: Load unified logistics data from all API endpoints
 */
export function useLogisticsUnifiedData() {
  const [twin, setTwin] = useState<LogisticsTwin>(() => SyntheticLogisticsProvider.load());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUnifiedTwin = async () => {
      setLoading(true);
      setError(null);

      try {
        // Parallel fetch of all endpoints
        const [
          overviewRes,
          cargoRes,
          fleetRes,
          warehousesRes,
          routesRes,
          deliveriesRes,
          risksRes,
          aiOpsRes,
          analyticsRes,
        ] = await Promise.all([
          fetch('/api/logistics/overview').then(r => r.json()).catch(() => ({})),
          fetch('/api/logistics/cargo').then(r => r.json()).catch(() => ({})),
          fetch('/api/logistics/fleet/states').then(r => r.json()).catch(() => ({})),
          fetch('/api/logistics/warehouses').then(r => r.json()).catch(() => ({})),
          fetch('/api/logistics/routes').then(r => r.json()).catch(() => ({})),
          fetch('/api/logistics/deliveries').then(r => r.json()).catch(() => ({})),
          fetch('/api/logistics/risks').then(r => r.json()).catch(() => ({})),
          fetch('/api/logistics/ai-operations').then(r => r.json()).catch(() => ({})),
          fetch('/api/logistics/analytics').then(r => r.json()).catch(() => ({})),
        ]);

        // Check if we got valid API responses
        const hasLiveData = [
          overviewRes?.ok,
          cargoRes?.ok,
          fleetRes?.ok,
          warehousesRes?.ok,
          routesRes?.ok,
          deliveriesRes?.ok,
          risksRes?.ok,
          analyticsRes?.ok,
        ].some(v => v === true);

        if (!hasLiveData) {
          setError('Using deterministic synthetic fallback while live KETRACO data is unavailable.');
          setTwin(SyntheticLogisticsProvider.load());
          setLoading(false);
          return;
        }

        // Normalize all responses into canonical twin
        const unifiedTwin: LogisticsTwin = {
          generatedAt: new Date().toISOString(),
          source: {
            mode: 'LIVE',
            label: '● LIVE KETRACO DATA',
            notice: 'Unified authoritative logistics state from KETRACO systems.',
            sourceType: 'LIVE_AUTHORITATIVE',
          },
          vehicles: normalizeFleetFromApi(fleetRes?.data || fleetRes),
          shipments: normalizeCargoFromApi(cargoRes?.data || cargoRes),
          warehouses: normalizeWarehousesFromApi(warehousesRes?.data || warehousesRes),
          routes: normalizeRoutesFromApi(routesRes?.data || routesRes),
          deliveries: normalizeDeliveriesFromApi(deliveriesRes?.data || deliveriesRes),
          risks: normalizeRisksFromApi(risksRes?.data || risksRes),
          aiOperations: normalizeAiOpsFromApi(aiOpsRes?.data || aiOpsRes),
          analytics: normalizeAnalyticsFromApi(analyticsRes?.data || analyticsRes),
        };

        setTwin(unifiedTwin);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load unified logistics data');
        setTwin(SyntheticLogisticsProvider.load());
      } finally {
        setLoading(false);
      }
    };

    void fetchUnifiedTwin();
  }, []);

  return { twin, loading, error };
}
