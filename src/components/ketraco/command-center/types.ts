export type OperationalState = 'NORMAL' | 'WARNING' | 'CONGESTED' | 'CRITICAL' | 'OFFLINE' | 'MAINTENANCE' | 'IN_SERVICE' | 'OUT_OF_SERVICE' | 'DEGRADED';
export type AssetType = 
  | 'SUBSTATION' 
  | 'TRANSMISSION_LINE' 
  | 'CIRCUIT'
  | 'TRANSFORMER' 
  | 'CIRCUIT_BREAKER' 
  | 'BAY' 
  | 'BUSBAR' 
  | 'PROTECTION_RELAY' 
  | 'GENERATION' 
  | 'LOAD' 
  | 'CORRIDOR'
  | 'GENERATOR_INTERFACE' 
  | 'HVDC_CONVERTER';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
export type DataSource = 
  | 'SCADA_EMS' 
  | 'GIS_POSTGIS' 
  | 'EAM_SAP' 
  | 'WAMS_PMU' 
  | 'HISTORIAN' 
  | 'WEATHER_MET' 
  | 'SIMULATION_ENGINE'
  | 'MET_WEATHER'
  | 'DGA_ONLINE'
  | 'THERMOGRAPHY'
  | 'PMU_WAMS';

export type DataFreshness = 'LIVE' | 'REFERENCE' | 'SIMULATION' | 'DELAYED' | 'STALE' | 'OFFLINE';

export interface DataProvenance {
  source: string;
  sourceVersion: string;
  sourceRetrievedAt: string;
  sourcePublishedAt: string | null;
  confidence: number;
  verificationStatus: 'VERIFIED' | 'HIGH' | 'REVIEW' | 'LOW' | 'UNVERIFIED' | 'REFERENCE';
}

export interface TelemetryPoint {
  value: number;
  unit: string;
  timestamp: string;
  source: DataSource;
  quality: 'GOOD' | 'QUESTIONABLE' | 'ESTIMATED' | 'BAD';
  freshness: DataFreshness;
  confidence: number;
  provenance?: DataProvenance;
}

export interface TelemetryState {
  activePowerMW?: TelemetryPoint;
  reactivePowerMVAR?: TelemetryPoint;
  voltageKV?: TelemetryPoint;
  frequencyHz?: TelemetryPoint;
  currentAmps?: TelemetryPoint;
  thermalLoadingPct?: TelemetryPoint;
  transformerOilTempC?: TelemetryPoint;
  sf6PressureBar?: TelemetryPoint;
  powerFactor?: TelemetryPoint;
  windingTempC?: TelemetryPoint;
  hydrogenPpm?: TelemetryPoint;
  acetylenePpm?: TelemetryPoint;
  breakerTripCount?: TelemetryPoint;
  contactWearPct?: TelemetryPoint;
  gooseLatencyMs?: TelemetryPoint;
}

// -------------------------------------------------------------
// CANONICAL GRID MODEL ENTITY SCHEMAS (PHASE 03)
// -------------------------------------------------------------

export interface CanonicalSourceIds {
  scadaId?: string;
  gisId?: string;
  eamId?: string;
  pmuId?: string;
  historianId?: string;
  engineeringId?: string;
}

export interface CanonicalLocation {
  latitude: number;
  longitude: number;
  elevationM?: number;
  region?: 'CENTRAL' | 'NAIROBI' | 'RIFT_VALLEY' | 'COAST' | 'WESTERN' | 'NORTH_EASTERN';
  county?: string;
  coordinates?: { x: number; y: number };
}

export interface CanonicalEntityBase {
  canonicalId: string;
  sourceIds: CanonicalSourceIds;
  name: string;
  code: string;
  type: AssetType;
  voltageKV: number;
  location: CanonicalLocation;
  state: OperationalState;
  health: number; // 0-100
  risk: number; // 0-100
  timestamp: string;
  source: DataSource;
  confidence: number; // 0-100
  reconciliationStatus: 'VERIFIED' | 'HIGH' | 'REVIEW' | 'LOW' | 'UNVERIFIED';
}

export interface SubstationEntity extends CanonicalEntityBase {
  type: 'SUBSTATION' | 'GENERATOR_INTERFACE' | 'HVDC_CONVERTER';
  ratedCapacityMVA: number;
  currentLoadMW: number;
  peakLoadMW: number;
  criticalityScore: number;
  nMinusOneRedundant: boolean;
  singlePointOfFailure: boolean;
  telemetry: TelemetryState;
  
  // Equipment child references
  bayIds: string[];
  transformerIds: string[];
  breakerIds: string[];
  busbarIds: string[];
  relayIds: string[];
  generationIds: string[];
  loadIds: string[];
  
  // Topology relationships
  corridorIds: string[];
  connectedLines: string[];
  connectedSubstations: string[];
  upstreamNodes: string[];
  downstreamNodes: string[];
  alternativePaths: string[];
}

export interface TransmissionLineEntity extends CanonicalEntityBase {
  type: 'TRANSMISSION_LINE';
  corridorId: string;
  fromSubstationId: string;
  toSubstationId: string;
  fromBayId?: string;
  toBayId?: string;
  circuitIds: string[];
  lengthKM: number;
  conductorType: string;
  thermalRatingMVA: number;
  dynamicRatingMVA?: number;
  currentLoadMW: number;
  loadingPct: number;
  lossesMW: number;
  pathCoordinates: [number, number][]; // [lon, lat] pairs
  powerFlowDirection: 'FORWARD' | 'REVERSE' | 'ZERO';
  nMinusOneRisk: boolean;
  singlePointOfFailure: boolean;
  activeAlarmsCount: number;
}

export interface CircuitEntity extends CanonicalEntityBase {
  type: 'CIRCUIT';
  lineId: string;
  circuitNumber: number; // e.g. 1 or 2
  conductorType: string;
  ratedAmps: number;
  currentAmps: number;
  impedanceR: number; // p.u. or ohms
  impedanceX: number;
  susceptanceB: number;
}

export interface TransformerEntity extends CanonicalEntityBase {
  type: 'TRANSFORMER';
  substationId: string;
  bayId: string;
  mvaRating: number;
  primaryVoltageKV: number;
  secondaryVoltageKV: number;
  tertiaryVoltageKV?: number;
  coolingType: 'ONAN' | 'ONAF' | 'OFAF' | 'ODAF';
  oilTemperatureC: number;
  windingTemperatureC: number;
  dgaStatus: 'NORMAL' | 'CAUTION' | 'CRITICAL';
  hydrogenPpm: number;
  acetylenePpm: number;
  ethylenePpm: number;
  tapPosition: number;
  loadingPct: number;
  maintenanceDueDays: number;
}

export interface BreakerEntity extends CanonicalEntityBase {
  type: 'CIRCUIT_BREAKER';
  substationId: string;
  bayId: string;
  position: 'CLOSED' | 'OPEN' | 'TRIPPED' | 'DISCONNECTED';
  sf6PressureBar: number;
  contactWearPct: number;
  tripOperationsCount: number;
  ratedCurrentA: number;
  interruptionCapacityKA: number;
  operatingMechanism: 'SPRING' | 'HYDRAULIC' | 'PNEUMATIC';
}

export interface BusEntity extends CanonicalEntityBase {
  type: 'BUSBAR';
  substationId: string;
  busNumber: string;
  arrangement: 'SINGLE_BUS' | 'DOUBLE_BUS_SINGLE_BREAKER' | 'DOUBLE_BUS_DOUBLE_BREAKER' | 'RING_BUS' | 'BREAKER_AND_A_HALF';
  nominalVoltageKV: number;
  measuredVoltageKV: number;
  voltageAngleDeg: number;
  frequencyHz: number;
}

export interface BayEntity extends CanonicalEntityBase {
  type: 'BAY';
  substationId: string;
  bayNumber: string;
  bayRole: 'FEEDER' | 'TRANSFORMER' | 'COUPLER' | 'BUS_SECTION' | 'REACTOR' | 'CAPACITOR';
  breakerId?: string;
  disconnectorIds: string[];
  ctRatio: string;
  vtRatio: string;
}

export interface ProtectionRelayEntity extends CanonicalEntityBase {
  type: 'PROTECTION_RELAY';
  substationId: string;
  bayId: string;
  relayModel: string;
  scheme: 'DISTANCE_21' | 'LINE_DIFF_87L' | 'TRANSFORMER_DIFF_87T' | 'OVERCURRENT_50_51' | 'BREAKER_FAILURE_50BF' | 'SYNCHROCHECK_25';
  redundancyScheme: 'MAIN_1' | 'MAIN_2';
  firmwareVersion: string;
  gooseLatencyMs: number;
  healthState: 'HEALTHY' | 'WARNING' | 'FAULT';
  lastTripTestTimestamp: string;
}

export interface GenerationEntity extends CanonicalEntityBase {
  type: 'GENERATION';
  substationId: string;
  plantName: string;
  fuelType: 'GEOTHERMAL' | 'HYDRO' | 'WIND' | 'SOLAR' | 'THERMAL' | 'IMPORT_HVDC';
  installedCapacityMW: number;
  currentDispatchMW: number;
  spinningReserveMW: number;
  rampRateMWPerMin: number;
  governorStatus: 'ACTIVE' | 'DROOP' | 'ISOCHRONOUS';
}

export interface LoadEntity extends CanonicalEntityBase {
  type: 'LOAD';
  substationId: string;
  loadZoneName: string;
  customerClass: 'INDUSTRIAL' | 'COMMERCIAL' | 'RESIDENTIAL' | 'METROPOLITAN_BULK';
  contractedDemandMW: number;
  currentDemandMW: number;
  powerFactor: number;
  sheddingPriority: 'P1_CRITICAL' | 'P2_ESSENTIAL' | 'P3_INTERRUPTIBLE';
}

export interface CorridorEntity extends CanonicalEntityBase {
  type: 'CORRIDOR';
  corridorCode: string;
  lineIds: string[];
  substationIds: string[];
  totalTransferCapabilityMW: number;
  actualTransferMW: number;
  congestionIndexPct: number;
  dynamicLineRatingGainPct: number;
  terrainType: 'RIFT_VALLEY' | 'SAVANNAH' | 'HIGHLANDS' | 'COASTAL' | 'ARID_NORTH';
}

// -------------------------------------------------------------
// RECONCILIATION & DATA QUALITY STRUCTURES (PHASE 03)
// -------------------------------------------------------------

export interface EntityReconciliationReport {
  canonicalId: string;
  name: string;
  assetType: AssetType;
  reconciliationStatus: 'VERIFIED' | 'HIGH' | 'REVIEW' | 'LOW' | 'UNVERIFIED';
  identityConfidence: number; // 0-100%
  spatialConfidence: number;  // 0-100%
  topologyConfidence: number; // 0-100%
  overallConfidence: number;  // 0-100%
  sourceMatchBreakdown: {
    scadaMatched: boolean;
    gisMatched: boolean;
    eamMatched: boolean;
    pmuMatched: boolean;
    historianMatched: boolean;
  };
  discrepancies: string[];
}

export interface SourceConflict {
  id: string;
  canonicalId: string;
  assetName: string;
  parameter: string;
  sources: {
    source: DataSource;
    value: string | number;
    timestamp: string;
    authorityRank: number; // 1 = highest
  }[];
  conflictDescription: string;
  resolutionStatus: 'RESOLVED' | 'FLAGGED_OPERATOR_REVIEW' | 'AUTOMATED_ARBITRATION';
  activeResolution?: string;
}

export interface GridDataQualitySummary {
  totalAssets: number;
  verifiedCount: number;
  verifiedPct: number;
  highConfidenceCount: number;
  highConfidencePct: number;
  reviewCount: number;
  reviewPct: number;
  unverifiedCount: number;
  unverifiedPct: number;
  gisCompletenessPct: number;
  topologyCompletenessPct: number;
  telemetryAssociationPct: number;
  activeConflictsCount: number;
  overallHealthScore: number;
  lastAuditedTimestamp: string;
}

// -------------------------------------------------------------
// GIS HIERARCHY, 3D TWIN MODES & UI SELECTION (PHASE 03)
// -------------------------------------------------------------

export type GisHierarchyLevel = 'NATIONAL' | 'REGION' | 'CORRIDOR' | 'SUBSTATION' | 'EQUIPMENT';

export type DigitalTwinEquipmentMode = 'NORMAL' | 'THERMAL' | 'ELECTRICAL' | 'RISK' | 'MAINTENANCE';

export interface SelectedEquipmentContext {
  equipmentType: 'TRANSFORMER' | 'BREAKER' | 'BUSBAR' | 'BAY' | 'RELAY' | 'GANTRY' | 'ALL';
  equipmentId?: string;
  equipmentName?: string;
  metrics?: Record<string, string | number>;
}

// Backward Compatibility Aliases & Types
export interface GridAsset {
  id: string;
  name: string;
  code: string;
  type: AssetType;
  voltageLevelKV: number;
  region: 'CENTRAL' | 'NAIROBI' | 'RIFT_VALLEY' | 'COAST' | 'WESTERN' | 'NORTH_EASTERN';
  county: string;
  scadaId?: string;
  gisId?: string;
  eamId?: string;
  engineeringId?: string;
  confidence: number;
  reconciliationStatus: 'VERIFIED' | 'HIGH_CONFIDENCE' | 'REVIEW' | 'LOW' | 'UNVERIFIED' | 'HIGH';
  latitude: number;
  longitude: number;
  elevationM?: number;
  coordinates: { x: number; y: number };
  state: OperationalState;
  telemetry: TelemetryState;
  ratedCapacityMVA: number;
  currentLoadMW: number;
  peakLoadMW: number;
  healthScore: number;
  riskScore: number;
  criticalityScore: number;
  nMinusOneRedundant: boolean;
  connectedLines: string[];
  connectedSubstations: string[];
  downstreamNodes: string[];
  upstreamNodes: string[];
  alternativePaths: string[];
  singlePointOfFailure: boolean;
  transformersCount?: number;
  baysCount?: number;
  breakersCount?: number;
  protectionRelaysCount?: number;
  sources: DataSource[];
  lastUpdated: string;
  maintenanceForecast: string;
  activeProjects: string[];
  activeTenders: string[];
  contractors: string[];
}

export interface TransmissionLine {
  id: string;
  code: string;
  name: string;
  fromSubstationId: string;
  toSubstationId: string;
  voltageKV: number;
  voltageLevelKV?: number;
  lengthKM: number;
  lengthKm?: number;
  status?: OperationalState;
  fromSubstationName?: string;
  toSubstationName?: string;
  conductorType: string;
  thermalRatingMVA: number;
  currentLoadMW: number;
  loadingPct: number;
  state: OperationalState;
  pathCoordinates: [number, number][];
  nMinusOneRisk: boolean;
  activeAlarmsCount: number;
  powerFlowDirection: 'FORWARD' | 'REVERSE' | 'ZERO';
}

export interface GridAlarm {
  id: string;
  assetId: string;
  assetName: string;
  code: string;
  title: string;
  category: 'THERMAL' | 'VOLTAGE' | 'PROTECTION' | 'COMMUNICATION' | 'FREQUENCY' | 'SF6_GAS' | 'PHYSICAL_SECURITY';
  severity: 'P1' | 'P2' | 'P3' | 'CRITICAL' | 'HIGH' | 'WARNING' | 'MEDIUM' | 'LOW' | 'INFO';
  state: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';
  timestamp: string;
  durationMin: number;
  description: string;
  rootCauseAnalysis: string;
  remedialAction: string;
  affectedEquipments: string[];
  source: DataSource;
  acknowledgedBy?: string;
  acknowledged?: boolean;
}

export interface GridEvent {
  id: string;
  timestamp: string;
  category: 'TELEMETRY' | 'ALARM' | 'BREAKER' | 'PROTECTION' | 'DISPATCH' | 'SYSTEM' | 'SECURITY';
  severity: SeverityLevel;
  assetId?: string;
  assetName?: string;
  title: string;
  description: string;
  correlationId?: string;
  source: DataSource;
}

export interface KpiFamily {
  id: string;
  label: string;
  value: string | number;
  unit: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  trendValue: string;
  status: 'OPTIMAL' | 'NORMAL' | 'WARNING' | 'CRITICAL';
  sparkline: number[];
  secondaryMetric: {
    label: string;
    value: string | number;
    unit?: string;
  };
  tertiaryMetric?: {
    label: string;
    value: string | number;
    unit?: string;
  };
  freshnessSec: number;
}

export interface GridResilienceFactor {
  name: string;
  score: number;
  status: 'GOOD' | 'MODERATE' | 'POOR';
  description: string;
}

export interface AiInvestigationInsight {
  assetId: string;
  assetName: string;
  riskScore: number;
  confidenceScore: number;
  timestamp: string;
  summary: string;
  riskDrivers: {
    factor: string;
    impactPct: number;
    currentValue: string;
    severity: SeverityLevel;
  }[];
  mitigations: string[];
  projectedTrajectory: string;
  sourcesGrounded: string[];
}

export type ViewCameraPreset = 'NATIONAL' | 'CENTRAL_RIFT' | 'NAIROBI_METRO' | 'COASTAL_CORRIDOR' | 'WESTERN_INTERCONNECT' | 'NORTHERN_HVDC';
export type MapLayerKey = 
  | 'TRANSMISSION' 
  | 'SUBSTATIONS' 
  | 'LINES' 
  | 'TRANSFORMERS' 
  | 'OUTAGES' 
  | 'ALARMS' 
  | 'RISK' 
  | 'ASSET_HEALTH' 
  | 'PROJECTS' 
  | 'WEATHER' 
  | 'VOLTAGE' 
  | 'CONGESTION'
  | 'SPOF'
  | 'DATA_QUALITY';

export type OperationalViewMode = 'NORMAL' | 'OUTAGE_MODE' | 'CRITICAL_ASSET_MODE' | 'RESILIENCE_MODE' | '3D_TWIN' | 'GRAPH_TOPOLOGY' | 'DATA_QUALITY';

