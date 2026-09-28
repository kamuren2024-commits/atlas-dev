import { 
  AssetType, 
  DataSource, 
  OperationalState, 
  SeverityLevel, 
  GridAlarm, 
  GridEvent, 
  GridAsset, 
  TransmissionLine,
  TelemetryPoint
} from '../types';

// ============================================================================
// 1. 90%+ ACCURACY & INTEGRITY TYPES
// ============================================================================

export interface DomainAccuracyScore {
  domain: 'IDENTITY' | 'GIS_SPATIAL' | 'TOPOLOGY' | 'TELEMETRY_ASSOCIATION' | 'ASSET_ATTRIBUTES' | 'STATE_CONSISTENCY';
  score: number; // 0 - 100
  weight: number; // sum to 1.0
  testedCount: number;
  passedCount: number;
  failedCount: number;
  failures: {
    assetId: string;
    assetName: string;
    description: string;
    severity: 'CRITICAL' | 'WARNING' | 'MINOR';
    remedialAction: string;
  }[];
}

export interface GridAccuracyMetrics {
  overallAccuracy: number; // target >= 90%
  overallConfidence: number; // derived mathematically from source confidences
  coveragePct: number;
  unverifiedPct: number;
  isPassingTarget: boolean;
  domainScores: Record<string, DomainAccuracyScore>;
  weakestDomains: {
    domainName: string;
    score: number;
    failedCount: number;
    remedies: string[];
  }[];
  timestamp: string;
  provenance: {
    totalEntitiesEvaluated: number;
    rulesExecuted: number;
    auditDurationMs: number;
  };
}

export interface GridIntegrityReport {
  integrityScore: number;
  duplicates: { id: string; name: string; duplicateKey: string; reason: string }[];
  missingAssets: { expectedId: string; expectedType: string; reason: string }[];
  invalidCoordinates: { id: string; name: string; lat: number; lon: number; error: string }[];
  brokenTopology: { id: string; name: string; error: string; missingNeighborId?: string }[];
  voltageMismatches: { id: string; name: string; details: string; expectedKV: number; measuredKV: number }[];
  scadaGisMismatches: { id: string; name: string; parameter: string; scadaVal: string | number; gisVal: string | number }[];
  scadaEamMismatches: { id: string; name: string; parameter: string; scadaVal: string | number; eamVal: string | number }[];
  staleTelemetry: { id: string; name: string; signal: string; ageSec: number; lastValue: number | string }[];
  conflictingStates: { id: string; name: string; details: string }[];
  totalFailedEntities: number;
  timestamp: string;
}

// ============================================================================
// 2. DYNAMIC BASELINES & REAL-TIME ANOMALIES
// ============================================================================

export type AnomalyCategory = 
  | 'FREQUENCY' 
  | 'VOLTAGE' 
  | 'LOADING' 
  | 'THERMAL' 
  | 'BREAKER' 
  | 'TELEMETRY' 
  | 'ALARM_BURST' 
  | 'BEHAVIOR';

export interface DynamicBaselineProfile {
  signalName: string;
  expectedMean: number;
  stdDev: number;
  minNormal: number;
  maxNormal: number;
  unit: string;
  source: 'HISTORIAN_1YR' | 'PMU_HIGH_RES' | 'SCADA_STATISTICAL' | 'IEEE_STANDARD';
  hourlyExpectedProfile: number[]; // 24-hr baseline points
}

export interface GridAnomaly {
  id: string;
  assetId: string;
  assetName: string;
  signal: string;
  category: AnomalyCategory;
  severity: SeverityLevel;
  currentValue: number | string;
  baselineValue: number | string;
  deviationPct: number;
  durationMin: number;
  confidence: number;
  probableCause: string;
  explanation: string;
  source: DataSource;
  timestamp: string;
}

// ============================================================================
// 3. PREDICTIVE RISK & FORECAST
// ============================================================================

export type ForecastHorizon = 'NEXT_1H' | 'NEXT_6H' | 'NEXT_24H';
export type DataClassification = 'MEASURED' | 'DERIVED' | 'FORECAST' | 'PREDICTED' | 'OBSERVED' | 'CORRELATED' | 'MODELLED' | 'SYNTHETIC';
export type TrendDirection = 'RISING' | 'FALLING' | 'STABLE' | 'VOLATILE' | 'ACCELERATING';

export interface RiskForecast {
  horizon: ForecastHorizon;
  trajectory: TrendDirection;
  riskScore: number; // 0 - 100
  confidenceBand: [number, number]; // [lowerBound, upperBound]
  classification: DataClassification;
  drivers: string[];
  affectedAssets: string[];
  recommendedPreparation: string;
}

export interface GridRiskAssessment {
  overallGridRisk: number;
  assetFailureRisk: { assetId: string; assetName: string; score: number; drivers: string[] }[];
  corridorRisk: { corridorId: string; name: string; score: number; loadingPct: number; risk: number }[];
  congestionRisk: number;
  thermalRisk: number;
  voltageRisk: number;
  frequencyRisk: number;
  outageRisk: number;
  spofRisk: number;
  forecasts: RiskForecast[];
  timestamp: string;
}

// ============================================================================
// 4. GRAPH REASONING & CONTINGENCY
// ============================================================================

export interface TopologyImpactRadius {
  rootAssetId: string;
  rootAssetName: string;
  directNeighbors: string[];
  tier2Neighbors: string[];
  affectedCorridors: string[];
  downstreamLoadMW: number;
  alternativePaths: {
    pathName: string;
    viaSubstations: string[];
    availableMarginMW: number;
    voltageKV: number;
  }[];
  islandRisk: boolean;
  impactRadiusScore: number; // 0-100
}

export interface ContingencySimulationResult {
  assetId: string;
  assetName: string;
  simulatedEvent: 'N_MINUS_1_TRIP' | 'BUS_FAULT' | 'CORRIDOR_OUTAGE';
  affectedTopology: string[];
  impactedCapacityMW: number;
  alternativePathsFound: string[];
  resilienceScore: number;
  consequenceSeverity: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  overloadedLinesPostContingency: {
    lineId: string;
    lineName: string;
    estimatedPostLoadingPct: number;
    thermalExceedanceMW: number;
  }[];
  explanation: string;
}

export interface GraphCentralityMetrics {
  degree: Record<string, number>;
  betweenness: Record<string, number>;
  dependencyCount: Record<string, number>;
  criticalityRank: { assetId: string; assetName: string; rank: number; score: number }[];
}

// ============================================================================
// 5. EARLY WARNING & INCIDENT CORRELATION
// ============================================================================

export interface RootCauseHypothesis {
  hypothesis: string;
  certainty: 'LIKELY' | 'POSSIBLE' | 'UNCONFIRMED';
  supportingEvidence: string[];
  contradictingEvidence: string[];
  confidence: number; // 0-100
  affectedAssets: string[];
}

export interface OperatorAdvisory {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  situation: string;
  evidence: string[];
  impact: string;
  recommendedInvestigation: string[];
  expectedOutcome: string;
  confidence: number;
  sources: DataSource[];
  timestamp: string;
  affectedAssets: string[];
}

export interface GridIncident {
  id: string;
  title: string;
  summary: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'ACTIVE' | 'MITIGATING' | 'RESOLVED';
  confidence: number;
  affectedCorridors: string[];
  affectedAssets: string[];
  correlatedAlarms: GridAlarm[];
  anomalies: GridAnomaly[];
  rootCauseHypotheses: RootCauseHypothesis[];
  advisory: OperatorAdvisory;
  timestamp: string;
}

// ============================================================================
// 6. TIMELINE & COPILOT
// ============================================================================

export type TimeHorizon = 'NOW' | '1H' | '6H' | '24H' | '7D';

export interface IntelligenceTimelineEvent {
  id: string;
  timestamp: string;
  timeHorizon: TimeHorizon;
  category: 'ANOMALY' | 'ALARM' | 'BREAKER' | 'OUTAGE' | 'RISK_CHANGE' | 'FORECAST_SHIFT' | 'AI_ADVISORY';
  severity: SeverityLevel;
  title: string;
  details: string;
  assetId?: string;
  assetName?: string;
  confidence: number;
  classification: DataClassification;
  source: DataSource;
  provenance: string;
}

export interface CopilotQAResult {
  question: string;
  answer: string;
  confidence: number;
  timestamp: string;
  dataSources: DataSource[];
  affectedAssets: { id: string; name: string; state: OperationalState; voltageKV: number }[];
  impactRadiusSummary?: string;
  investigationSteps: string[];
  alternativeActions: string[];
  provenanceAudit: string;
  simulationEvidence?: string;
  assumptions?: string[];
}

// ============================================================================
// 7. PHASE 05 PREDICTIVE OPERATIONS & PROBABILISTIC FORECAST TYPES
// ============================================================================

export type ForecastTargetKey = 
  | 'DEMAND' 
  | 'GENERATION' 
  | 'RESERVE' 
  | 'FREQUENCY' 
  | 'VOLTAGE' 
  | 'CONGESTION' 
  | 'TRANSFORMER_LOADING' 
  | 'TRANSMISSION_RISK';

export type ForecastHorizonKey = '15_MIN' | '1_HOUR' | '6_HOURS' | '24_HOURS';

export interface ForecastDriver {
  factor: string;
  impactPct: number;
  direction: 'INCREASING' | 'DECREASING' | 'STABLE';
}

export interface ProbabilisticValue {
  p10: number; // Low (10th percentile)
  p50: number; // Expected (50th percentile)
  p90: number; // High (90th percentile)
  unit: string;
  confidence: number; // 0 - 100
  uncertaintyBandPct: number;
  topDrivers: ForecastDriver[];
  classification: DataClassification;
  source: DataSource;
  timestamp: string;
}

export interface ForecastTimeSeriesPoint {
  timeLabel: string;
  timestamp: string;
  actual?: number;
  p10: number;
  p50: number;
  p90: number;
  confidence: number;
  classification: DataClassification;
}

export interface GridVariableForecast {
  target: ForecastTargetKey;
  label: string;
  currentMeasured: number;
  unit: string;
  horizons: Record<ForecastHorizonKey, ProbabilisticValue>;
  timeSeries: ForecastTimeSeriesPoint[];
  narrative: string;
}

export interface GridForecastSummary {
  demand: GridVariableForecast;
  generation: GridVariableForecast;
  reserve: GridVariableForecast;
  frequency: GridVariableForecast;
  voltage: GridVariableForecast;
  congestion: GridVariableForecast;
  transformerLoading: GridVariableForecast;
  transmissionRisk: GridVariableForecast;
  generatedAt: string;
  modelConfidence: number;
}

// ============================================================================
// 8. PHASE 05 WHAT-IF SCENARIOS & SIMULATION ENGINE TYPES
// ============================================================================

export type ContingencyScenarioType =
  | 'TRANSFORMER_TRIP'
  | 'LINE_TRIP'
  | 'SUBSTATION_OUTAGE'
  | 'HVDC_LOSS'
  | 'GENERATION_LOSS'
  | 'CORRIDOR_CONGESTION'
  | 'BUSBAR_FAULT'
  | 'N_MINUS_1'
  | 'MULTIPLE_CONTINGENCY';

export type ContingencySeverity = 'CRITICAL' | 'SEVERE' | 'HIGH' | 'MODERATE' | 'LOW';

export interface SimulatedLineFlow {
  lineId: string;
  lineName: string;
  preLoadingPct: number;
  postLoadingPct: number;
  ratingMVA: number;
  preFlowMW: number;
  postFlowMW: number;
  flowDeltaMW: number;
  thermalExceedanceMW: number;
  status: 'SAFE' | 'WATCH' | 'VIOLATION' | 'CRITICAL';
}

export interface SimulatedBusVoltage {
  busId: string;
  busName: string;
  nominalKV: number;
  preKV: number;
  postKV: number;
  postPU: number;
  deltaKV: number;
  status: 'SAFE' | 'WATCH' | 'VIOLATION' | 'CRITICAL';
}

export interface SimulationPowerFlowResult {
  frequencyHz: number;
  freqDeltaHz: number;
  demandServedMW: number;
  unservedEnergyMW: number;
  totalGenerationMW: number;
  spinningReserveMW: number;
  minBusVoltageKV: number;
  minBusVoltagePU: number;
  maxLineLoadingPct: number;
  overloadedLineCount: number;
  isolatedSubstationCount: number;
  riskIndex: number;
  contingencySeverity: ContingencySeverity;
  lineFlows: Record<string, SimulatedLineFlow>;
  busVoltages: Record<string, SimulatedBusVoltage>;
  overloadedLineIds: string[];
  isolatedBusIds: string[];
  affectedSubstations: string[];
  summary: string;
  executionDurationMs: number;
}

export type RemedialActionCategory =
  | 'GENERATION_REDISPATCH'
  | 'LOAD_TRANSFER'
  | 'ALTERNATIVE_TRANSMISSION_PATH'
  | 'REACTIVE_SUPPORT'
  | 'TRANSFORMER_TAP_ADJUSTMENT'
  | 'TOPOLOGY_CHANGE'
  | 'MAINTENANCE_DEFERRAL';

export interface RemedialActionOption {
  id: string;
  title: string;
  category: RemedialActionCategory;
  description: string;
  expectedBenefit: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  affectedAssets: string[];
  prerequisites: string[];
  simulatedOutcome: SimulationPowerFlowResult;
  safetyNotice: string;
}

export interface ScenarioDefinition {
  id: string;
  name: string;
  type: ContingencyScenarioType;
  description: string;
  primaryAssetId: string;
  primaryAssetName: string;
  secondaryAssetId?: string;
  lossMW?: number;
  lossMVAr?: number;
  probability: number;
  defaultSeverity: ContingencySeverity;
}

export interface ScenarioComparisonResult {
  scenario: ScenarioDefinition;
  baseline: SimulationPowerFlowResult;
  contingency: SimulationPowerFlowResult;
  remedialOptions: RemedialActionOption[];
  selectedRemedialOptionId: string | null;
  timestamp: string;
}

// ============================================================================
// 9. PHASE 05 CONTINGENCY RANKING & N-1 INTELLIGENCE
// ============================================================================

export interface ContingencyRankedItem {
  rank: number;
  id: string;
  name: string;
  type: ContingencyScenarioType;
  primaryAssetId: string;
  primaryAssetName: string;
  probability: number; // 0 - 1
  severity: ContingencySeverity;
  mwImpact: number;
  frequencyDipHz: number;
  minVoltagePU: number;
  overloadedCircuitsCount: number;
  affectedSubstations: string[];
  restorationTimeMinutes: number;
  confidence: number;
  topRemediation: string;
  riskScore: number;
}

// ============================================================================
// 10. PHASE 05 CASCADING FAILURE STAGES
// ============================================================================

export interface CascadingStage {
  stageIndex: number;
  timeOffsetSec: number;
  title: string;
  description: string;
  trigger: string;
  affectedAsset: string;
  corridorImpact: string;
  gridImpact: string;
  frequencyHz: number;
  voltagePU: number;
  overloadedLines: string[];
  trippedAssets: string[];
  status: 'INITIATING' | 'PROPAGATING' | 'CRITICAL_CASCADE' | 'ISLANDING_DEFENSE' | 'STABILIZED';
}

export interface CascadingSimulation {
  scenarioId: string;
  title: string;
  rootAsset: string;
  stages: CascadingStage[];
  totalStages: number;
  mitigationAvailable: boolean;
  recommendedInterventionStage: number;
}

// ============================================================================
// 11. PHASE 05 RESILIENCE SCORECARD & RECOVERY INTELLIGENCE
// ============================================================================

export interface ResilienceScorecard {
  overallScore: number; // 0 - 100
  currentScore: number;
  forecast6hScore: number;
  postContingencyScore: number;
  dimensions: {
    reserveAdequacy: number;
    redundancyN1Coverage: number;
    criticalAssetExposure: number;
    recoveryTimeScore: number;
    congestionScore: number;
    topologyRobustness: number;
    voltageStabilityMargin: number;
  };
  keyVulnerabilities: string[];
  recommendations: string[];
  timestamp: string;
}

export interface RestorationStep {
  stepNumber: number;
  timeOffsetMinutes: number;
  title: string;
  action: string;
  responsibleUnit: string;
  preconditions: string[];
  restoredMW: number;
  cumulativeMW: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

export interface GridRecoveryPlan {
  scenarioId: string;
  title: string;
  affectedAssets: string[];
  estimatedTotalRestorationMinutes: number;
  steps: RestorationStep[];
  criticalPreconditions: string[];
  alternativeSupplyPath: string;
  confidence: number;
}

// ============================================================================
// 12. PHASE 05 PREDICTIVE ASSET WATCHLIST & TRANSFORMER HEALTH
// ============================================================================

export interface PredictiveAssetWatchItem {
  id: string;
  name: string;
  type: AssetType;
  voltageKV: number;
  location: string;
  healthIndex: number; // 0 - 100
  degradationTrend: 'ACCELERATING' | 'STEADY' | 'STABLE';
  failureHorizon: string; // e.g., "48 Hours", "14 Days", "60 Days"
  criticality: 'TIER_1_CRITICAL' | 'TIER_2_HIGH' | 'TIER_3_MODERATE';
  thermalExposurePct: number;
  dgaGasPpm: {
    h2: number;
    ch4: number;
    c2h2: number;
    c2h4: number;
    c2h6: number;
    totalCombustibleGas: number;
  };
  topOilTempC: number;
  windingHotSpotC: number;
  confidence: number;
  topDrivers: string[];
  recommendedAction: string;
  riskScore: number;
}

// ============================================================================
// 13. PHASE 05 WEATHER TO GRID IMPACT
// ============================================================================

export interface DynamicLineRating {
  lineId: string;
  lineName: string;
  nominalMVA: number;
  dlrMVA: number;
  deltaPct: number;
  ambientTempC: number;
  windSpeedKmh: number;
  windCoolingBenefitPct: number;
  classification: DataClassification;
}

export interface WeatherGridImpact {
  region: string;
  ambientTempC: number;
  windSpeedKmh: number;
  solarIrradianceWm2: number;
  stormFront: 'NONE' | 'LIGHT' | 'MODERATE' | 'SEVERE';
  lightningStrikeCount: number;
  dlrLineCapacities: DynamicLineRating[];
  windGenOutputMW: number;
  solarGenOutputMW: number;
  lightningTripRiskIndex: number;
  classifications: {
    factor: string;
    classification: DataClassification;
    explanation: string;
  }[];
}

// ============================================================================
// 14. PHASE 05 MODEL PERFORMANCE & DRIFT MONITOR
// ============================================================================

export interface ModelDriftMetrics {
  modelHealth: 'GOOD' | 'WATCH' | 'DEGRADED';
  forecastMape: number; // % (e.g., 1.8%)
  anomalyPrecision: number; // % (e.g., 93.4%)
  anomalyRecall: number; // % (e.g., 91.8%)
  riskPredictionBrierScore: number; // 0 - 1 (e.g., 0.042)
  scenarioValidationPct: number; // % (e.g., 97.9%)
  lastRecalibrationDate: string;
  recalibrationRecommended: boolean;
  driftWarnings: string[];
  totalSamplesEvaluated: number;
}

export type DigitalTwinTemporalMode = 'LIVE' | 'HISTORICAL' | 'SIMULATED' | 'FORECAST';

