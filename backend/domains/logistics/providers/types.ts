/**
 * KETRACO Logistics Intelligence - Geospatial, Routing & Fleet Tracking Provider Interfaces
 * Implements Section 04, 05, 06, 07, 08, 10 Provider Abstractions
 */

export type TelemetryFreshness = 'LIVE' | 'STALE' | 'OFFLINE' | 'UNKNOWN';

export interface TelemetryRecord {
  tenantId: string;
  vehicleId: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  speed: number;
  heading: number;
  ignition: boolean;
  odometer: number;
  engineHours: number;
  fuelLevel: number;
  source: string;
  accuracy: number;
  receivedAt: string;
}

export interface TelemetryIngestResult {
  accepted: boolean;
  vehicleId: string;
  freshness: TelemetryFreshness;
  roadMatched: boolean;
  snappedLat?: number;
  snappedLng?: number;
  speedLimitKmh?: number;
  speedingDetected?: boolean;
  routeDeviationDetected?: boolean;
  deviationDistanceKm?: number;
  eventsEmitted: string[];
  error?: string;
}

export interface VehicleOperationalState {
  vehicleId: string;
  code: string;
  licensePlate: string;
  vehicleType: string;
  status: string;
  currentDriver?: {
    id: string;
    name: string;
    phone: string;
    licenseClass: string;
  };
  assignedMission?: {
    id: string;
    code: string;
    title: string;
    status: string;
    origin: string;
    destination: string;
    eta?: string;
  };
  telemetry: {
    latitude: number;
    longitude: number;
    speedKmh: number;
    heading: number;
    fuelLevelPct: number;
    odometerKm: number;
    engineHours: number;
    ignition: boolean;
    lastTelemetryAt: string;
    freshness: TelemetryFreshness;
    locationName: string;
  };
  operational: {
    ownership: string;
    department: string;
    operatingRegion: string;
    assignedDepot: string;
    assignedProject?: string;
    dimensions: {
      lengthM: number;
      widthM: number;
      heightM: number;
    };
    capacity: {
      maxWeightKg: number;
      maxVolumeM3: number;
      axles: number;
    };
    compliance: {
      insurancePolicy: string;
      insuranceExpiry: string;
      inspectionStatus: string;
      inspectionExpiry: string;
      serviceStatus: string;
      nextServiceKm: number;
      nextServiceDate: string;
    };
  };
}

export interface HeavyTransportConstraints {
  maxWeightKg?: number;
  maxHeightM?: number;
  maxWidthM?: number;
  maxLengthM?: number;
  roadClassAllowed?: string[];
  maxBridgeLoadKg?: number;
  requirePoliceEscort?: boolean;
  requireKeNHAEscort?: boolean;
  accessWindow?: {
    startHour: number;
    endHour: number;
  };
}

export interface RouteCalculationRequest {
  origin: { lat: number; lng: number; name?: string };
  destination: { lat: number; lng: number; name?: string };
  waypoints?: Array<{ lat: number; lng: number; name?: string }>;
  vehicleType?: string;
  cargoWeightKg?: number;
  grossWeightKg?: number;
  heightMeters?: number;
  tenantId?: string;
  constraints?: HeavyTransportConstraints;
  corridorType?: string;
  avoidTolls?: boolean;
  trafficAware?: boolean;
}

export interface RouteSegment {
  name: string;
  roadClass: string;
  distanceKm: number;
  durationMinutes: number;
  speedLimitKmh: number;
  terrainType: 'FLAT_HIGHWAY' | 'MOUNTAIN_PASS' | 'ESCARPMENT' | 'UNPAVED_ACCESS_ROAD';
  bridgeRestrictions?: {
    bridgeName: string;
    maxWeightTons: number;
    clearanceHeightM: number;
    status: 'OPEN' | 'WEIGHT_RESTRICTED' | 'POLICE_ESCORT_REQUIRED';
  };
  weatherHazard?: 'NONE' | 'FOG_LOW_VISIBILITY' | 'HEAVY_RAIN_WASHOUT' | 'CROSSWINDS';
}

export interface RouteCalculationResponse {
  routeId: string;
  origin: { lat: number; lng: number; name: string };
  destination: { lat: number; lng: number; name: string };
  distanceKm: number;
  durationMinutes: number;
  polyline: Array<[number, number]>;
  segments: RouteSegment[];
  advisories: string[];
  escortRequired: boolean;
  escortReason?: string;
  bridgeFeasible: boolean;
  maxBridgeLoadCapacityTons: number;
  alternativeRoutesCount: number;
  elevationProfile?: Array<{ km: number; elevationM: number }>;
}

export interface SnappedRoadPoint {
  originalIndex: number;
  latitude: number;
  longitude: number;
  placeId?: string;
  roadName?: string;
  speedLimitKmh?: number;
}

export interface RoadExposureAssessment {
  riskScore: number; // 0 - 100
  corridorGrade: 'SAFE' | 'ELEVATED_RISK' | 'CRITICAL_RISK';
  bottlenecksIdentified: Array<{
    locationName: string;
    lat: number;
    lng: number;
    description: string;
    restrictionType: 'BRIDGE_LIMIT' | 'STEEP_GRADIENT' | 'ACCESS_RESTRICTION' | 'COMMUNITY_WAYLEAVE';
  }>;
  recommendedEscortUnits: number;
}

export interface OptimizationTask {
  shipmentId: string;
  cargoCode: string;
  cargoName: string;
  weightKg: number;
  volumeM3: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  originDepot: string;
  destinationSubstation: string;
  destinationCoordinates: { lat: number; lng: number };
  deadline: string;
  projectName: string;
  specialHandlingRequired?: boolean;
}

export interface OptimizationInput {
  tenantId: string;
  tasks: OptimizationTask[];
  candidateVehicleIds?: string[];
  maxMissions?: number;
  constraints?: HeavyTransportConstraints;
  considerBridgeLimitations?: boolean;
}

export interface OptimizedVehicleAssignment {
  vehicleId: string;
  vehicleCode: string;
  vehicleType: string;
  driverId: string;
  driverName: string;
  assignedShipments: OptimizationTask[];
  totalWeightKg: number;
  totalVolumeM3: number;
  utilizationWeightPct: number;
  routeStops: Array<{
    stopSequence: number;
    locationName: string;
    type: 'PICKUP' | 'DELIVERY';
    estimatedArrival: string;
    estimatedDeparture: string;
    coordinates: { lat: number; lng: number };
  }>;
  estimatedTotalDistanceKm: number;
  estimatedTotalDurationHours: number;
  estimatedFuelLiters: number;
  feasibilityScore: number; // 0 - 100
  notes: string[];
}

export interface OptimizationResult {
  optimizationRunId: string;
  generatedAt: string;
  status: 'RECOMMENDED' | 'FEASIBLE_WITH_EXCEPTIONS' | 'INFEASIBLE';
  assignments: OptimizedVehicleAssignment[];
  unassignedTasks: Array<{
    task: OptimizationTask;
    reason: string;
  }>;
  totalDistanceKm: number;
  totalDurationHours: number;
  totalCargoWeightKg: number;
  fleetEfficiencyGainPct: number;
  humanReviewRequired: boolean;
  approvalStatus: 'PENDING_DISPATCHER_REVIEW' | 'APPROVED' | 'REJECTED';
}

export interface GoogleMapsProvider {
  geocode(address: string): Promise<{ lat: number; lng: number; formattedAddress: string } | null>;
  reverseGeocode(lat: number, lng: number): Promise<{ address: string; placeId?: string } | null>;
  isAvailable(): boolean;
  getProviderMetadata(): { name: string; mode: 'LIVE_GOOGLE_MAPS' | 'KETRACO_GIS_SIMULATION'; apiKeyConfigured: boolean };
}

export interface FleetTrackingProvider {
  ingestTelemetry(record: TelemetryRecord): Promise<TelemetryIngestResult>;
  getVehicleState(vehicleId: string, tenantId: string): Promise<VehicleOperationalState | null>;
  getFleetStates(filter: { tenantId: string; status?: string; region?: string; vehicleType?: string }): Promise<VehicleOperationalState[]>;
  getTelemetryFreshness(lastTimestamp: string | null | undefined): TelemetryFreshness;
}

export interface RoutesProvider {
  calculateRoute(request: RouteCalculationRequest): Promise<RouteCalculationResponse>;
}

export interface RoadsProvider {
  snapToRoads(points: Array<{ lat: number; lng: number }>): Promise<SnappedRoadPoint[]>;
  getSpeedLimit(lat: number, lng: number): Promise<{ speedLimitKmh: number; roadName: string } | null>;
  assessRoadExposure(points: Array<{ lat: number; lng: number }>, constraints: HeavyTransportConstraints): Promise<RoadExposureAssessment>;
}

export interface RouteOptimizationProvider {
  optimizeFleetRoutes(input: OptimizationInput): Promise<OptimizationResult>;
}
