// Types for KETRACO Phase 06 Operational Decision Intelligence & National Grid Situational Awareness

import { DataSource, DataFreshness } from '../types';

// ============================================================================
// 1. NATIONAL GRID SITUATIONAL AWARENESS & STATE ENGINE
// ============================================================================

export type GridOverallState = 'NORMAL' | 'STABLE' | 'WATCH' | 'STRESSED' | 'CRITICAL' | 'EMERGENCY';

export interface StateDriver {
  id: string;
  category: 'FREQUENCY' | 'VOLTAGE' | 'RESERVE' | 'LOADING' | 'OUTAGES' | 'CONGESTION' | 'RISK' | 'N1_CONTINGENCY' | 'ALARMS' | 'ASSET_HEALTH';
  metric: string;
  currentValue: string | number;
  nominalValue: string | number;
  unit: string;
  severity: 'NORMAL' | 'WATCH' | 'HIGH' | 'CRITICAL';
  contributionPct: number; // e.g. 35% of stress score
  description: string;
  source: DataSource;
  driver?: string;
  severityScore?: number;
  explanation?: string;
  recommendedMitigation?: string;
}

export interface GridStateAssessment {
  state: GridOverallState;
  stressScore: number; // 0 (Ideal) - 100 (Emergency)
  stabilityIndex: number; // 0 - 100
  voltageStabilityIndex?: number;
  topDrivers: StateDriver[];
  primaryStressRegion: string;
  recommendedFocus: string;
  calculatedAt: string;
  systemDemandMW: number;
  totalGenerationMW: number;
  spinningReserveMW: number;
  reserveMarginPct: number;
  gridFrequencyHz: number;
  transmissionAvailabilityPct: number;
  congestedCorridorsCount: number;
  activeIncidentsCount: number;
  criticalAssetsAtRiskCount: number;
  n1ComplianceStatus: 'COMPLIANT' | 'VIOLATION_WATCH' | 'CRITICAL_VIOLATION';
  overallGridRiskScore: number; // 0 - 100
  dataConfidencePct: number;
}

// ============================================================================
// 2. PRIORITY ENGINE & OPERATOR ACTION QUEUE
// ============================================================================

export type PriorityLevel = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export type PriorityCategory = 
  | 'INCIDENT' 
  | 'ALARM' 
  | 'ASSET' 
  | 'CORRIDOR' 
  | 'CONTINGENCY' 
  | 'MAINTENANCE' 
  | 'RISK' 
  | 'FORECAST' 
  | 'DATA_QUALITY';

export interface PriorityScoreBreakdown {
  impact: number;      // 0 - 100
  urgency: number;     // 0 - 100
  probability: number; // 0 - 100
  criticality: number; // 0 - 100
  confidence: number;  // 0 - 100
  compositeScore: number; // 0 - 100 weighted
}

export interface PriorityItem {
  id: string;
  code: string;
  title: string;
  category: PriorityCategory;
  priority: PriorityLevel;
  scores: PriorityScoreBreakdown;
  deduplicationKey?: string;
  groupedEventCount?: number;
  affectedAssetIds: string[];
  affectedAssetNames: string[];
  affectedCorridorIds?: string[];
  rootCauseHypothesis: string;
  recommendedInvestigation: string;
  recommendedAction: string;
  evidenceSummary: string[];
  dataSources: DataSource[];
  status: 'OPEN' | 'INVESTIGATING' | 'ACTION_PENDING' | 'RESOLVED';
  timeDetected: string;
  assignedOperator?: string;
  scenarioSimulationId?: string;
}

// ============================================================================
// 3. INCIDENT COMMAND & LIFECYCLE
// ============================================================================

export type IncidentLifecycleStage = 
  | 'DETECTED' 
  | 'CORRELATED' 
  | 'INVESTIGATING' 
  | 'MITIGATION' 
  | 'RECOVERY' 
  | 'RESOLVED';

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  stage: IncidentLifecycleStage;
  title: string;
  description: string;
  actor: string; // 'AI_DETECTION_ENGINE' | 'SCADA_TELEMETRY' | 'OPERATOR_NCC'
  source: DataSource;
  dataDelta?: string;
}

export interface GridIncident {
  id: string;
  code: string;
  title: string;
  priority: PriorityLevel;
  status: IncidentLifecycleStage;
  trigger: string;
  timeDetected: string;
  lastUpdated: string;
  affectedAssets: string[];
  affectedCorridors: string[];
  rootCause: string;
  impactAssessment: {
    mwAtRisk: number;
    customersAffectedEst: number;
    voltageStabilityLossPct: number;
    thermalExceedancePct: number;
    economicLossEstUSDPerHr: number;
  };
  riskScore: number;
  predictions: {
    nextLikelyEvent: string;
    timeToCascadeMin: number;
    severityEscalationProbPct: number;
  };
  scenarios: {
    id: string;
    name: string;
    description: string;
    projectedOutcome: string;
    stabilityImpactMW: number;
  }[];
  recommendations: {
    id: string;
    action: string;
    impact: string;
    risk: 'LOW' | 'MEDIUM' | 'HIGH';
    dispatchChangeMW?: number;
    switchingOperations?: string[];
    confidence: number;
  }[];
  evidence: {
    id: string;
    type: 'TELEMETRY' | 'ALARM_SEQUENCE' | 'PMU_WAVEFORM' | 'WEATHER_CELL' | 'EAM_LOG';
    description: string;
    metric: string;
    value: string;
    source: DataSource;
    confidence: number;
  }[];
  owner?: string;
  resolution?: {
    resolvedAt?: string;
    rootCauseConfirmed?: string;
    actionsTaken?: string[];
    postIncidentNotes?: string;
  };
  auditId?: string;
}

// ============================================================================
// 4. EVENT CAUSALITY GRAPH
// ============================================================================

export type EventGraphNodeType = 
  | 'EVENT' 
  | 'ASSET' 
  | 'CORRIDOR' 
  | 'DEPENDENCY' 
  | 'IMPACT' 
  | 'RISK' 
  | 'RECOMMENDATION';

export interface EventCausalityNode {
  id: string;
  type: EventGraphNodeType;
  label: string;
  subtitle: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INFO';
  value?: string;
  confidence?: number;
  source?: DataSource;
  details?: Record<string, any>;
  x?: number;
  y?: number;
}

export interface EventCausalityEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  relation: 'TRIGGERS' | 'LOCATED_AT' | 'CONNECTS_TO' | 'DEPENDS_ON' | 'CAUSES_IMPACT' | 'ESCALATES_RISK' | 'MITIGATED_BY';
  confidence: number;
  strength: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface EventCausalityGraphData {
  nodes: EventCausalityNode[];
  edges: EventCausalityEdge[];
  incidentId: string;
  rootNodeId: string;
}

export type EventGraphNode = EventCausalityNode;
export type EventGraphEdge = EventCausalityEdge;

// ============================================================================
// 5. CROSS-DOMAIN CORRELATION
// ============================================================================

export type CorrelationStatus = 'CORRELATED' | 'MODELLED' | 'CONFIRMED' | 'UNCONFIRMED';

export interface CrossDomainCorrelation {
  id: string;
  title: string;
  category: 'THERMAL_WEATHER' | 'VOLTAGE_FREQUENCY' | 'EQUIPMENT_DGA_LOAD' | 'CONGESTION_DISPATCH' | 'PROTECTION_MISMATCH';
  status: CorrelationStatus;
  confidence: number;
  riskScore: number;
  primaryAssetId: string;
  primaryAssetName: string;
  corridorId?: string;
  sources: DataSource[];
  formula: string; // e.g. "Ambient 34°C + 82% Line Loading + 1.2 m/s Wind + 6h Peak Demand"
  evidencePoints: {
    domain: string;
    metric: string;
    measuredValue: string;
    significance: string;
    source: DataSource;
  }[];
  operationalImpact: string;
  recommendedMitigation: string;
  detectedAt: string;
}

// ============================================================================
// 6. ASSET 360 PROFILE
// ============================================================================

export interface Asset360Profile {
  identity: {
    id: string;
    name: string;
    code: string;
    type: string;
    voltageLevelKV: number;
    region: string;
    county: string;
    commissionDate: string;
    manufacturer: string;
    model: string;
    criticalityTier: 'CRITICAL_SPOF' | 'HIGH_HUB' | 'STANDARD_SUB' | 'FEEDER';
  };
  location: {
    latitude: number;
    longitude: number;
    elevationM: number;
    terrainType: string;
    nearestTown: string;
    accessRoadCondition: string;
  };
  telemetry: {
    activePowerMW: number;
    reactivePowerMVAR: number;
    voltageKV: number;
    frequencyHz: number;
    thermalLoadingPct: number;
    oilTempC?: number;
    windingTempC?: number;
    sf6PressureBar?: number;
    powerFactor: number;
    dataFreshness: DataFreshness;
    lastTelemetrySec: number;
  };
  health: {
    overallHealthIndex: number; // 0 - 100
    dgaIndex?: number;
    breakwearPct?: number;
    insulationResistanceMOhm?: number;
    degradationRatePerYear: number;
    expectedRULMonths: number;
  };
  risk: {
    failureRiskScore: number; // 0 - 100
    impactScore: number;
    n1Exposure: boolean;
    contingencySeverityIndex: number;
    primaryThreat: string;
  };
  maintenance: {
    sapWorkOrderNumber: string;
    lastServiceDate: string;
    nextScheduledServiceDate: string;
    daysOverdue: number;
    serviceStatus: 'CURRENT' | 'DUE_SOON' | 'OVERDUE' | 'CRITICAL_OVERDUE';
    openFaultNotificationsCount: number;
    meanTimeBetweenFailuresHrs: number;
  };
  alarms: {
    id: string;
    code: string;
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }[];
  topology: {
    connectedLines: string[];
    connectedSubstations: string[];
    upstreamSources: string[];
    downstreamSinks: string[];
    alternativePaths: string[];
  };
  history: {
    tripsLast12Months: number;
    unplannedOutageHoursLastYear: number;
    peakHistoricalLoadMW: number;
    lastTripReason: string;
  };
  forecast: {
    projectedLoading6hPct: number;
    projectedTemp6hC: number;
    failureRiskHorizon14Days: number;
  };
  contingencies: {
    scenario: string;
    voltageDropKV: number;
    lineLoadingRedistributionPct: number;
    cascadeRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  }[];
  model3D: {
    has3DTwin: boolean;
    switchyardType: 'AIS' | 'GIS' | 'HYBRID';
    bays: number;
    transformers: number;
  };
  provenance: {
    scadaId: string;
    gisId: string;
    eamId: string;
    pmuId?: string;
    dataReconciliationConfidence: number;
  };
}

// ============================================================================
// 7. CORRIDOR 360 PROFILE
// ============================================================================

export interface Corridor360Profile {
  id: string;
  name: string;
  voltageLevelKV: number;
  fromSubstationId: string;
  fromSubstationName: string;
  toSubstationId: string;
  toSubstationName: string;
  lengthKm: number;
  conductorType: string;
  currentFlowMW: number;
  nominalRatingMVA: number;
  dynamicLineRatingMVA: number;
  thermalHeadroomMW: number;
  thermalHeadroomPct: number;
  loadingPct: number;
  congestionStatus: 'NORMAL' | 'MONITOR' | 'CONGESTED' | 'CRITICAL_OVERLOAD';
  weather: {
    ambientTempC: number;
    windSpeedMS: number;
    windAngleDeg: number;
    solarRadiationWM2: number;
    lightningStrikesNearby24h: number;
    dlrGainMW: number;
  };
  outages: {
    circuit1Status: 'IN_SERVICE' | 'OUTAGE_PLANNED' | 'FORCED_TRIP';
    circuit2Status?: 'IN_SERVICE' | 'OUTAGE_PLANNED' | 'FORCED_TRIP';
  };
  dependencies: {
    evacuatesGenerationMW: number;
    suppliesDemandHubs: string[];
    criticalDownstreamCustomers: string;
  };
  nMinusOneStatus: {
    trippingSurvivesN1: boolean;
    contingencyOverloadCorridor: string;
    postTripLoadingPct: number;
  };
  risk: {
    bushfireRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    vegetationEncroachmentRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    insulatorContaminationRisk: 'LOW' | 'MEDIUM' | 'HIGH';
    overallCorridorRiskScore: number;
  };
  forecast: {
    peakFlowPredictedNext6hMW: number;
    peakLoadingPredictedPct: number;
    congestionRiskProbabilityPct: number;
  };
  alternativePaths: {
    pathName: string;
    availableCapacityMW: number;
    transferImpedancePU: number;
  }[];
}

// ============================================================================
// 8. MAINTENANCE x OPERATIONS RISK FUSION
// ============================================================================

export interface MaintenanceRiskFusionItem {
  assetId: string;
  assetName: string;
  assetType: string;
  voltageKV: number;
  substationRegion: string;
  criticalityScore: number; // 1 - 10
  operationalExposure: number; // 0 - 100 (based on live loading, N-1 criticality)
  failureProbabilityPct: number; // 0 - 100 (DGA, health score, MTBF)
  daysOverdue: number;
  eamWorkOrder: string;
  maintenanceUrgency: 'IMMEDIATE' | 'HIGH' | 'PLANNED' | 'ROUTINE';
  gridImpactIfFailed: string;
  combinedPriorityScore: number; // 0 - 100
  recommendedAction: string;
}

// ============================================================================
// 9. OPERATOR DECISION BRIEF (9-Part Structured Brief)
// ============================================================================

export interface OperatorDecisionBrief {
  id: string;
  incidentId: string;
  incidentCode: string;
  incidentTitle: string;
  priority: PriorityLevel;
  generatedAt: string;
  confidence: number;
  author: 'AI_COMMAND_INTELLIGENCE';
  // 1. What Happened
  whatHappened: string;
  // 2. Why It Matters
  whyItMatters: string;
  // 3. What Is Affected
  whatIsAffected: {
    substations: string[];
    lines: string[];
    generationMWAtRisk: number;
    loadDemandMWAtRisk: number;
  };
  // 4. What Is Likely Next
  whatIsLikelyNext: {
    timelineMin: number;
    consequence: string;
    cascadeRiskPct: number;
  };
  // 5. Options
  options: {
    id: string;
    title: string;
    description: string;
    tradeoffs: string;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    requiresAuthorization: boolean;
  }[];
  // 6. Simulated Outcomes
  simulatedOutcomes: {
    optionId: string;
    frequencyDeltaHz: number;
    maxLineLoadingPct: number;
    voltageStabilityMarginPct: number;
    unservedEnergyMWh: number;
  }[];
  // 7. Recommended Investigation / Action
  recommendedInvestigation: string;
  recommendedIntervention: string;
  // 8. Confidence
  confidenceExplanation: string;
  confidenceFactors: { factor: string; score: number }[];
  // 9. Evidence
  evidenceCitations: {
    source: DataSource;
    metric: string;
    value: string;
    timestamp: string;
    relevance: string;
  }[];
}

// ============================================================================
// 10. DECISION AUDIT LEDGER & HUMAN-IN-THE-LOOP RECORD
// ============================================================================

export type OperatorDecisionAction = 
  | 'AUTHORIZED' 
  | 'REJECTED' 
  | 'MODIFIED' 
  | 'HOLD_FOR_INVESTIGATION';

export interface DecisionLedgerEntry {
  id: string;
  briefId: string;
  incidentId: string;
  incidentTitle: string;
  priority: PriorityLevel;
  alertSummary: string;
  evidenceSnapshot: string[];
  aiRecommendation: string;
  simulationSummary: string;
  operatorId: string;
  operatorName: string;
  operatorDecision: OperatorDecisionAction;
  operatorNotes: string;
  timestamp: string;
  executionStatus: 'PENDING_DISPATCH' | 'EXECUTED_AUTOMATIC' | 'MANUAL_DISPATCHED' | 'ABORTED';
  verification: {
    verifiedAt?: string;
    expectedOutcome: string;
    observedOutcome?: string;
    outcomeStatus: 'PENDING' | 'VALIDATED_OPTIMAL' | 'VALIDATED_ACCEPTABLE' | 'DIVERGENT';
    variancePct?: number;
    learningFeedbackLogged: boolean;
  };
}

// ============================================================================
// 11. INTELLIGENCE LEARNING LOOP
// ============================================================================

export interface LearningRecord {
  id: string;
  modelType: 'DEMAND_FORECAST' | 'THERMAL_CONGESTION' | 'VOLTAGE_STABILITY' | 'ASSET_FAILURE_RISK' | 'CONTINGENCY_SIM';
  modelVersion: string;
  timestamp: string;
  prediction: {
    target: string;
    predictedValue: number;
    predictedHorizon: string;
    confidence: number;
  };
  actual: {
    observedValue: number;
    observedAt: string;
  };
  error: {
    absoluteError: number;
    percentageError: number;
    withinTolerance: boolean;
  };
  driftStatus: 'STABLE' | 'MINOR_DRIFT' | 'SIGNIFICANT_DRIFT';
  calibrationAdjustmentApplied: string;
}

// ============================================================================
// 12. NATIONAL GRID HEALTH SCORE & EXECUTIVE BRIEFING
// ============================================================================

export interface NationalGridHealthScore {
  overallHealthScore: number;
  grade: string;
  dimensions: {
    name: string;
    score: number;
    weight: number;
  }[];
}

export interface GridHealthBreakdown {
  compositeScore: number; // 0 - 100
  grade: 'EXCELLENT' | 'GOOD' | 'ADEQUATE' | 'DEGRADED' | 'CRITICAL';
  components: {
    operationalStability: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
    assetHealth: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
    transmissionCapacity: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
    reserveAdequacy: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
    redundancyN1: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
    overallRisk: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
    outagePenalty: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
    dataQuality: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
    forecastStability: { score: number; weight: number; status: 'GOOD' | 'WATCH' | 'CRITICAL' };
  };
}

export interface ExecutiveIntelligenceBriefing {
  gridHealth: GridHealthBreakdown;
  currentRiskScore: number;
  top5Threats: { id: string; title: string; risk: number; horizon: string; primaryAsset: string }[];
  top5CriticalAssets: { id: string; name: string; health: number; risk: number; role: string }[];
  topCongestedCorridors: { id: string; name: string; loadingPct: number; thermalHeadroomMW: number }[];
  outagePosition: { forcedOutagesCount: number; plannedOutagesCount: number; capacityOfflineMW: number };
  reservePosition: { spinningReserveMW: number; reserveMarginPct: number; requirementMet: boolean };
  next6hRiskSummary: string;
  n1Position: { totalMonitoredCorridors: number; n1CompliantCorridors: number; violationsCount: number };
  dataTrustSummary: { overallAccuracyPct: number; telemetryFreshnessPct: number; modelDriftStatus: string };
}
