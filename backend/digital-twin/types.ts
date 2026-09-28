/**
 * KETRACO TRANSMISSION DIGITAL TWIN - TYPE SYSTEM
 * Master Enterprise Definitions for Grid Operations Intelligence
 */

export type VoltageLevel = '500kV_HVDC' | '400kV' | '220kV' | '132kV' | '66kV';

export type AssetType = 
  | 'SUBSTATION'
  | 'BUS'
  | 'BUSBAR'
  | 'TRANSMISSION_LINE'
  | 'CIRCUIT'
  | 'POWER_TRANSFORMER'
  | 'CIRCUIT_BREAKER'
  | 'ISOLATOR'
  | 'CURRENT_TRANSFORMER'
  | 'VOLTAGE_TRANSFORMER'
  | 'PROTECTION_SYSTEM'
  | 'SHUNT_REACTOR'
  | 'CAPACITOR_BANK'
  | 'AUXILIARY_SYSTEM'
  | 'GENERATION_INTERFACE'
  | 'INTERCONNECTION_POINT'
  | 'CONTROL_CENTER'
  | 'COMMUNICATION_GATEWAY';

export type OperationalStatus = 
  | 'IN_SERVICE' 
  | 'OUT_OF_SERVICE' 
  | 'MAINTENANCE' 
  | 'TRIPPED' 
  | 'DEGRADED' 
  | 'STANDBY';

export type TelemetryQualityState = 
  | 'GOOD' 
  | 'SUSPECT' 
  | 'STALE' 
  | 'MISSING' 
  | 'INVALID' 
  | 'CONFLICTING' 
  | 'ESTIMATED';

export type StateValueTag = 
  | 'MEASURED' 
  | 'ESTIMATED' 
  | 'INFERRED' 
  | 'PREDICTED';

export type NotificationSeverity = 
  | 'INFO' 
  | 'ADVISORY' 
  | 'WARNING' 
  | 'HIGH' 
  | 'CRITICAL' 
  | 'EMERGENCY';

export type NotificationDeliveryState = 
  | 'DELIVERED' 
  | 'READ' 
  | 'ACKNOWLEDGED' 
  | 'ESCALATED' 
  | 'RESOLVED';

export type IncidentStatus = 
  | 'DETECTED' 
  | 'TRIAGED' 
  | 'INVESTIGATING' 
  | 'ACTION_REQUIRED' 
  | 'ACKNOWLEDGED' 
  | 'MITIGATING' 
  | 'MONITORING' 
  | 'RESOLVED' 
  | 'CLOSED';

export type ReconciliationIssueType = 
  | 'ORPHAN_ASSET' 
  | 'DUPLICATE_ASSET' 
  | 'UNKNOWN_ASSET' 
  | 'TOPOLOGY_CONFLICT' 
  | 'MISSING_TELEMETRY' 
  | 'INVALID_MAPPING' 
  | 'STALE_DATA' 
  | 'RATING_CONFLICT' 
  | 'LOCATION_CONFLICT';

/**
 * 1. Canonical Transmission Asset
 */
export interface CanonicalAsset {
  asset_id: string;
  asset_type: AssetType;
  name: string;
  substation_id?: string;
  voltage_level: VoltageLevel;
  rated_capacity_mva?: number;
  rated_current_a?: number;
  rated_voltage_kv: number;
  manufacturer: string;
  model: string;
  serial_number: string;
  commissioning_date: string;
  location: {
    latitude: number;
    longitude: number;
    elevation_m?: number;
    region: 'Nairobi' | 'Rift_Valley' | 'Coast' | 'Western' | 'Mount_Kenya' | 'Northern';
  };
  operational_status: OperationalStatus;
  ownership: string;
  maintenance_state: 'NOMINAL' | 'INSPECTION_OVERDUE' | 'SCHEDULED_MAINTENANCE' | 'IMPAIRED';
  protection_configuration?: {
    primary_protection: string;
    backup_protection: string;
    breaker_failure_enabled: boolean;
  };
  scada_mapping?: {
    rtu_id: string;
    points: Record<string, string>;
  };
  gis_mapping?: {
    feature_id: string;
    layer: string;
  };
  digital_twin_mapping: {
    node_id: string;
    subsystem: string;
  };
  source_system: string;
  last_verified: string;
  confidence: number;
}

/**
 * 2. Transmission Topology Branch
 */
export interface TopologyBranch {
  branch_id: string;
  name: string;
  branch_type: 'LINE' | 'TRANSFORMER' | 'COUPLER';
  from_bus_id: string;
  to_bus_id: string;
  voltage_kv: number;
  length_km?: number;
  resistance_pu: number;
  reactance_pu: number;
  susceptance_pu: number;
  thermal_rating_mva: number;
  emergency_rating_mva: number;
  status: 'CLOSED' | 'OPEN' | 'TRIPPED';
  breaker_from_id?: string;
  breaker_to_id?: string;
  updated_at: string;
}

/**
 * 3. Telemetry Point with Quality Assessment
 */
export interface TelemetryPoint {
  asset_id: string;
  metric: string;
  value: number;
  unit: string;
  quality: TelemetryQualityState;
  quality_flags?: {
    is_stale: boolean;
    is_plausible: boolean;
    rate_of_change_exceeded: boolean;
    physical_consistency_violation: boolean;
    cross_sensor_mismatch: boolean;
    topology_conflict: boolean;
  };
  source: string;
  confidence: number;
  timestamp: string;
  ingestion_timestamp: string;
  provenance: {
    origin_sensor_id: string;
    protocol: 'IEC_60870_5_104' | 'DNP3' | 'IEC_61850' | 'C37_118_PMU' | 'REST' | 'SIMULATION';
    transformation_history: string[];
  };
  correlation_id: string;
}

/**
 * 4. State Estimation & Power Flow Result
 */
export interface StateEstimationBus {
  bus_id: string;
  name: string;
  voltage_kv: number;
  voltage_pu: number;
  voltage_tag: StateValueTag;
  angle_deg: number;
  angle_tag: StateValueTag;
  active_gen_mw: number;
  reactive_gen_mvar: number;
  active_load_mw: number;
  reactive_load_mvar: number;
  voltage_violation: boolean;
}

export interface StateEstimationBranch {
  branch_id: string;
  from_bus_id: string;
  to_bus_id: string;
  from_mw: number;
  from_mvar: number;
  to_mw: number;
  to_mvar: number;
  losses_mw: number;
  loading_pct: number;
  flow_tag: StateValueTag;
  is_overloaded: boolean;
  status: 'CLOSED' | 'OPEN' | 'TRIPPED';
}

export interface NetworkStateSnapshot {
  snapshot_id: string;
  timestamp: string;
  convergence_status: 'CONVERGED' | 'ITERATION_LIMIT' | 'DIVERGED';
  iterations: number;
  total_load_mw: number;
  total_gen_mw: number;
  total_losses_mw: number;
  system_frequency_hz: number;
  observability_pct: number;
  estimation_confidence: number;
  buses: StateEstimationBus[];
  branches: StateEstimationBranch[];
}

/**
 * 5. Contingency Engine
 */
export interface ContingencyViolation {
  element_id: string;
  element_type: 'LINE' | 'TRANSFORMER' | 'BUS';
  violation_type: 'THERMAL_OVERLOAD' | 'LOW_VOLTAGE' | 'HIGH_VOLTAGE' | 'ISLANDING';
  pre_contingency_val: number;
  post_contingency_val: number;
  limit_val: number;
  severity: 'WARNING' | 'CRITICAL';
}

export interface ContingencyResult {
  contingency_id: string;
  name: string;
  contingency_type: 'N-1_LINE' | 'N-1_TRANSFORMER' | 'N-1_GEN' | 'N-1-1';
  trigger_asset_id: string;
  affected_assets: string[];
  pre_contingency_state: {
    loading_pct: number;
    voltage_pu: number;
  };
  post_contingency_state: {
    max_loading_pct: number;
    min_voltage_pu: number;
    islands_formed: number;
  };
  violations: ContingencyViolation[];
  severity: 'NOMINAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number;
  confidence: number;
  recommended_actions: string[];
  required_operator_confirmation: boolean;
  calculated_at: string;
}

/**
 * 6. Grid Risk Model (11 Dimensions)
 */
export interface GridRiskItem {
  risk_id: string;
  risk_type: 
    | 'THERMAL' 
    | 'VOLTAGE' 
    | 'FREQUENCY' 
    | 'TOPOLOGY' 
    | 'PROTECTION' 
    | 'EQUIPMENT_HEALTH' 
    | 'COMMUNICATION' 
    | 'WEATHER_ENVIRONMENTAL' 
    | 'MAINTENANCE_OUTAGE' 
    | 'CASCADING_FAILURE' 
    | 'DATA_QUALITY';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number; // 0 to 100
  why: string;
  what_changed: string;
  affected_assets: string[];
  time_to_impact_minutes: number;
  confidence: number;
  evidence: string[];
  recommended_response: string;
  detected_at: string;
  status: 'ACTIVE' | 'MITIGATING' | 'RESOLVED';
}

export interface CascadingRiskScenario {
  scenario_id: string;
  title: string;
  initiating_hazard: string;
  risk_factors: string[];
  propagation_path: string[];
  time_to_cascade_minutes: number;
  compound_probability: number;
  estimated_loss_mw: number;
  recommended_preventive_action: string;
}

/**
 * 7. Predictive Asset Health & DGA
 */
export interface DgaMetrics {
  hydrogen_h2_ppm: number;
  methane_ch4_ppm: number;
  acetylene_c2h2_ppm: number;
  ethylene_c2h4_ppm: number;
  ethane_c2h6_ppm: number;
  carbon_monoxide_co_ppm: number;
  total_combustible_gas_ppm: number;
  moisture_in_oil_ppm: number;
  breakdown_voltage_kv: number;
  duval_zone: 'PD' | 'T1' | 'T2' | 'T3' | 'D1' | 'D2' | 'NORMAL';
  rogers_ratio_fault: string;
}

export interface PredictiveAssetHealth {
  asset_id: string;
  asset_name: string;
  asset_type: AssetType;
  health_index: number; // 0 to 100 (100 = new, <60 = degraded, <40 = critical)
  failure_probability_30d: number; // 0 to 1
  failure_probability_90d: number;
  time_horizon_days: number;
  confidence: number;
  drivers: string[];
  dga?: DgaMetrics;
  breaker_duty_pct?: number;
  sf6_pressure_bar?: number;
  thermal_hotspot_c?: number;
  recommended_inspection: string;
  recommended_maintenance: string;
  evaluated_at: string;
  model_info: {
    model_name: string;
    version: string;
    is_insufficient_data: boolean;
  };
}

/**
 * 8. Notification & Escalation
 */
export interface GridNotification {
  notification_id: string;
  correlation_id: string;
  asset_id: string;
  severity: NotificationSeverity;
  category: 'TELEMETRY' | 'CONTINGENCY' | 'RISK' | 'PROTECTION' | 'OUTAGE' | 'SYSTEM';
  title: string;
  message: string;
  target_role: string;
  target_jurisdiction: string;
  target_specialist?: string;
  state: NotificationDeliveryState;
  escalation_level: number;
  escalated_to?: string;
  acknowledged_by?: string;
  acknowledged_at?: string;
  created_at: string;
}

/**
 * 9. Operator Advisory (Human-in-the-Loop)
 */
export interface OperatorAdvisory {
  advisory_id: string;
  event_title: string;
  current_state: string;
  trend: string;
  forecast: string;
  cause: string;
  consequence: string;
  recommended_action: string;
  safety_constraints: string[];
  confidence: number;
  evidence: string[];
  status: 'PENDING_OPERATOR_REVIEW' | 'AUTHORIZED' | 'REJECTED' | 'EXECUTED';
  operator_id?: string;
  operator_notes?: string;
  authorized_at?: string;
  created_at: string;
}

/**
 * 10. Incident Lifecycle
 */
export interface GridIncident {
  incident_id: string;
  title: string;
  asset_id: string;
  severity: NotificationSeverity;
  status: IncidentStatus;
  root_cause?: string;
  consequence?: string;
  timeline: Array<{
    timestamp: string;
    state: IncidentStatus;
    note: string;
    actor: string;
  }>;
  assigned_engineer?: string;
  opened_at: string;
  closed_at?: string;
}

/**
 * 11. Digital Twin Trust Score & Accuracy
 */
export interface DigitalTwinTrustScore {
  composite_trust_score: number; // 0 to 100
  evaluated_at: string;
  component_metrics: {
    asset_identity_accuracy_pct: number;
    topology_accuracy_pct: number;
    gis_alignment_pct: number;
    telemetry_mapping_pct: number;
    equipment_metadata_pct: number;
    state_estimation_accuracy_pct: number;
    event_classification_pct: number;
    alert_routing_pct: number;
    prediction_accuracy_pct: number;
  };
  weights: Record<string, number>;
  active_warnings: string[];
}

/**
 * 12. Service Level Objectives (SLOs)
 */
export interface DigitalTwinSloReport {
  timestamp: string;
  telemetry_freshness: {
    current_avg_ms: number;
    slo_target_ms: number;
    compliant: boolean;
  };
  event_processing_latency: {
    p50_ms: number;
    p95_ms: number;
    p99_ms: number;
    slo_target_ms: number;
    compliant: boolean;
  };
  critical_alert_delivery: {
    current_avg_ms: number;
    slo_target_ms: number;
    compliant: boolean;
  };
  state_estimation_cycle: {
    current_cycle_ms: number;
    slo_target_ms: number;
    compliant: boolean;
  };
  operator_acknowledgement: {
    avg_ack_time_s: number;
    unacknowledged_critical_count: number;
    slo_target_s: number;
    compliant: boolean;
  };
}
