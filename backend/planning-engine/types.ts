export type PlanningHorizon = 'NOW' | '24H' | '7D' | '30D' | '1Y' | '5Y' | '10Y';
export type TemporalState = 'LIVE' | 'HISTORICAL' | 'FORECAST' | 'SIMULATION' | 'PLANNED' | 'FUTURE';
export type DataState = 'ACTUAL' | 'COMMITTED' | 'PLANNED' | 'MODELLED';
export type ProjectStatus =
  | 'PLANNED'
  | 'PROCUREMENT'
  | 'CONSTRUCTION'
  | 'COMMISSIONING'
  | 'OPERATIONAL'
  | 'DELAYED';
export type OutageType = 'FORCED' | 'PLANNED' | 'MAINTENANCE' | 'CONSTRUCTION' | 'PROTECTION';
export type OutageState = 'ACTIVE' | 'PLANNED' | 'UPCOMING' | 'HIGH_RISK' | 'RESTORING' | 'COMPLETED';

export interface PlanningEvidence {
  source: string;
  timestamp: string;
  modelVersion: string;
  inputs: string[];
  assumptions: string[];
  confidence: number;
  dataState: DataState;
}

export interface GridPlanningAssetState {
  assetId: string;
  name: string;
  type: string;
  region: string;
  zone: string;
  actualCapacity: number;
  committedCapacity: number;
  plannedCapacity: number;
  modelledCapacity: number;
  n1Margin: number;
  congestion: number;
  thermalHeadroom: number;
  risk: number;
  evidence: PlanningEvidence[];
}

export interface PlanningForecast {
  horizon: PlanningHorizon;
  demandMw: number;
  generationMw: number;
  reserveMw: number;
  peakLoadMw: number;
  renewableSharePct: number;
  scenarioName: string;
  confidence: number;
  evidence: PlanningEvidence[];
}

export interface Project {
  id: string;
  name: string;
  type: 'SUBSTATION_EXPANSION' | 'TRANSMISSION_LINE' | 'TRANSFORMER' | 'BAY' | 'COMPENSATION' | 'HVDC';
  status: ProjectStatus;
  region: string;
  affectedAssets: string[];
  plannedStart: string;
  plannedEnd: string;
  capacityGainMw: number;
  congestionReductionPct: number;
  reliabilityGainPct: number;
  n1ImprovementPct: number;
  riskReductionPct: number;
  criticality: number;
  evidence: PlanningEvidence[];
}

export interface OutageEvent {
  id: string;
  type: OutageType;
  state: OutageState;
  assetIds: string[];
  region: string;
  start: string;
  end: string;
  affectedLoadMw: number;
  n1Exposure: number;
  congestionImpact: number;
  risk: number;
  restorationEstimateMinutes: number;
  gridImpact: string;
  alternativeSupplyMw: number;
  evidence: PlanningEvidence[];
}

export interface MaintenanceWindow {
  id: string;
  assetId: string;
  assetName: string;
  workType: string;
  start: string;
  end: string;
  requiredIsolation: string[];
  risk: number;
  criticality: number;
  demandForecast: number;
  generationAvailability: number;
  weatherExposure: number;
  congestion: number;
  n1Margin: number;
  status: 'PROPOSED' | 'APPROVED' | 'DEFERRED' | 'REJECTED';
  evidence: PlanningEvidence[];
}

export interface CapacityBreakdown {
  national: { installed: number; transfer: number; available: number; reserve: number; headroom: number; };
  region: Record<string, { installed: number; transfer: number; available: number; reserve: number; headroom: number; }>;
  corridor: Record<string, { installed: number; transfer: number; available: number; reserve: number; headroom: number; }>;
}

export interface Bottleneck {
  id: string;
  name: string;
  path: string[];
  currentImpact: number;
  forecastImpact: number;
  probability: number;
  criticality: number;
  durationHours: number;
  expansionPotentialPct: number;
  evidence: PlanningEvidence[];
}

export interface LossMetric {
  type: 'MEASURED' | 'ESTIMATED' | 'MODELLED';
  region: string;
  valueMw: number;
  pct: number;
  trend: number;
  forecastMw: number;
  timestamp: string;
}

export interface PlanningScenario {
  id: string;
  name: string;
  assumptions: string[];
  demandGrowthPct: number;
  generationGrowthPct: number;
  renewablePenetrationPct: number;
  projectDelay: boolean;
  assetFailureRiskPct: number;
  hvdcExpansion: boolean;
  regionalShiftPct: number;
  results: {
    reserveMargin: number;
    congestion: number;
    n1Margin: number;
    curtailmentRisk: number;
    investmentNeedMw: number;
    riskScore: number;
  };
}

export interface PlanningBrief {
  gridOutlook: string;
  capacityPosition: string;
  topConstraints: string[];
  majorOutages: string[];
  maintenanceExposure: string[];
  projectPortfolio: string[];
  futureRisks: string[];
  priorityInvestments: string[];
  evidence: PlanningEvidence[];
}

export interface PlanningDecisionSupport {
  problem: string;
  baseline: string;
  options: string[];
  simulation: string;
  impact: string;
  risk: string;
  recommendation: string;
  approval: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE';
  evidence: PlanningEvidence[];
}

export interface PlanningDashboardState {
  horizon: PlanningHorizon;
  temporalMode: TemporalState;
  dataState: DataState;
  planSummary: {
    demandMw: number;
    generationMw: number;
    reserveMw: number;
    congestion: number;
    reliabilityScore: number;
    n1Exposure: number;
  };
  outages: OutageEvent[];
  projects: Project[];
  maintenance: MaintenanceWindow[];
  bottlenecks: Bottleneck[];
  capacity: CapacityBreakdown;
}

export interface MaintenanceSimulationResult {
  current: { risk: number; congestion: number; reserve: number; n1: number; affectedLoadMw: number; recoveryHours: number; };
  maintenance: { risk: number; congestion: number; reserve: number; n1: number; affectedLoadMw: number; recoveryHours: number; };
  deferred: { risk: number; congestion: number; reserve: number; n1: number; affectedLoadMw: number; recoveryHours: number; };
  recommendation: 'MAINTENANCE' | 'DEFERRED' | 'CURRENT';
}

// -------------------------------------------------------------
// PHASE 09 — FUTURE GRID DIGITAL TWIN
// -------------------------------------------------------------

export type FutureGridYear = '2026' | '2027' | '2028' | '2029' | '2030' | '2035';

export interface FutureGridState {
  year: FutureGridYear;
  temporalMode: TemporalState;
  demandForecastMw: number;
  generationCapacityMw: number;
  renewableCapacityMw: number;
  renewableSharePct: number;
  reserveMarginPct: number;
  congestionIndexPct: number;
  n1CompliancePct: number;
  transmissionLossPct: number;
  installedSubstations: number;
  newSubstations: number;
  retiredAssets: number;
  hvdcCapacityMw: number;
  inertiaEstimateGws: number;
  curtailmentRiskPct: number;
  capacityMarginPct: number;
  projectsCompleted: number;
  projectsInProgress: number;
  projectsPlanned: number;
  evidence: PlanningEvidence[];
}

export interface FutureGridScenario {
  id: string;
  name: string;
  baseYear: FutureGridYear;
  targetYear: FutureGridYear;
  assumptions: string[];
  states: FutureGridState[];
}

// -------------------------------------------------------------
// PHASE 09 — RENEWABLE INTEGRATION INTELLIGENCE
// -------------------------------------------------------------

export type RenewableSource = 'WIND' | 'SOLAR' | 'GEOTHERMAL' | 'HYDRO' | 'HVDC_IMPORT';

export interface RenewableAsset {
  id: string;
  name: string;
  source: RenewableSource;
  region: string;
  installedCapacityMw: number;
  currentOutputMw: number;
  capacityFactorPct: number;
  forecastOutput24hMw: number[];
  gridConnectionPoint: string;
  voltageKV: number;
  curtailmentRiskPct: number;
  evidence: PlanningEvidence[];
}

export interface RenewableIntegrationAnalysis {
  totalRenewableCapacityMw: number;
  currentRenewableOutputMw: number;
  renewableSharePct: number;
  frequencyImpactHz: number;
  inertiaEstimateGws: number;
  reserveRequirementMw: number;
  congestionRiskPct: number;
  voltageImpactPct: number;
  curtailmentRiskPct: number;
  transmissionCapacityRequiredMw: number;
  assets: RenewableAsset[];
  assumptions: string[];
  evidence: PlanningEvidence[];
}

// -------------------------------------------------------------
// PHASE 09 — GRID INVESTMENT INTELLIGENCE
// -------------------------------------------------------------

export interface GridInvestmentCandidate {
  id: string;
  name: string;
  projectType: Project['type'];
  region: string;
  capacityGainMw: number;
  congestionReductionPct: number;
  reliabilityGainPct: number;
  n1ImprovementPct: number;
  lossReductionPct: number;
  riskReductionPct: number;
  criticality: number;
  priorityScore: number;
  estimatedCostMw: number;
  implementationHorizon: PlanningHorizon;
  evidence: PlanningEvidence[];
}

export interface InvestmentRanking {
  candidates: GridInvestmentCandidate[];
  totalCapacityGainMw: number;
  totalCongestionReductionPct: number;
  totalReliabilityGainPct: number;
  totalN1ImprovementPct: number;
  evidence: PlanningEvidence[];
}

// -------------------------------------------------------------
// PHASE 09 — WEATHER × MAINTENANCE INTELLIGENCE
// -------------------------------------------------------------

export interface WeatherMaintenanceExposure {
  assetId: string;
  assetName: string;
  region: string;
  weatherRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  weatherFactor: string;
  temperatureC: number;
  windSpeedKmh: number;
  rainfallMm: number;
  lightningRisk: number;
  assetExposurePct: number;
  outageRiskPct: number;
  maintenancePriority: number;
  confidence: number;
  source: string;
  timestamp: string;
}

export interface WeatherMaintenanceAnalysis {
  exposures: WeatherMaintenanceExposure[];
  highRiskAssets: number;
  maintenancePriorityQueue: string[];
  overallWeatherRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  forecastHorizon: string;
  evidence: PlanningEvidence[];
}

// -------------------------------------------------------------
// PHASE 09 — LOSS INTELLIGENCE EXTENDED
// -------------------------------------------------------------

export interface LossIntelligenceReport {
  nationalLossMw: number;
  nationalLossPct: number;
  regionalLosses: Array<{
    region: string;
    lossMw: number;
    lossPct: number;
    trend: number;
    abnormalDeviation: boolean;
  }>;
  corridorLosses: Array<{
    corridor: string;
    lossMw: number;
    lossPct: number;
    trend: number;
  }>;
  totalMeasuredLossMw: number;
  totalEstimatedLossMw: number;
  totalModelledLossMw: number;
  forecastLossMw: number;
  anomalyCount: number;
  evidence: PlanningEvidence[];
}

// -------------------------------------------------------------
// PHASE 09 — OUTAGE COMMAND WALL DATA
// -------------------------------------------------------------

export interface OutageCommandEntry {
  id: string;
  outage: OutageEvent;
  wallCategory: OutageState;
  gridImpactScore: number;
  n1ExposurePct: number;
  affectedAssetsCount: number;
  restorationConfidencePct: number;
  timeline: Array<{ time: string; event: string; }>;
  conflicts: string[];
  evidence: PlanningEvidence[];
}

// -------------------------------------------------------------
// PHASE 09 — MAINTENANCE CALENDAR ENTRY
// -------------------------------------------------------------

export interface MaintenanceCalendarEntry {
  id: string;
  maintenance: MaintenanceWindow;
  calendarStart: string;
  calendarEnd: string;
  operationalRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiredIsolation: string[];
  conflicts: string[];
  approvalStatus: MaintenanceWindow['status'];
  simulationResult: MaintenanceSimulationResult | null;
  evidence: PlanningEvidence[];
}

// -------------------------------------------------------------
// PHASE 09 — PROJECT PORTFOLIO MAP ENTRY
// -------------------------------------------------------------

export interface ProjectPortfolioEntry {
  project: Project;
  mapStatus: 'EXISTING' | 'UNDER_CONSTRUCTION' | 'PLANNED' | 'PROPOSED';
  gridImpact: {
    before: { capacity: number; congestion: number; redundancy: number; n1: number; losses: number; resilience: number; risk: number; };
    after: { capacity: number; congestion: number; redundancy: number; n1: number; losses: number; resilience: number; risk: number; };
  };
  evidence: PlanningEvidence[];
}

// -------------------------------------------------------------
// PHASE 09 — PLANNING DECISION SUPPORT (EXTENDED)
// -------------------------------------------------------------

export interface ExtendedPlanningDecisionSupport {
  problem: string;
  problemDescription: string;
  baseline: string;
  baselineMetrics: { risk: number; congestion: number; reserve: number; n1: number; };
  options: Array<{
    id: string;
    label: string;
    description: string;
    simulationResult: MaintenanceSimulationResult;
    impactScore: number;
    riskScore: number;
  }>;
  simulation: string;
  impact: string;
  risk: string;
  recommendation: string;
  approval: 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE';
  evidence: PlanningEvidence[];
  selectedOptionId: string | null;
  approvalTimestamp: string | null;
  approverRole: string | null;
}

// -------------------------------------------------------------
// PHASE 09 — UNIFIED PLANNING DASHBOARD STATE (EXTENDED)
// -------------------------------------------------------------

export interface UnifiedPlanningDashboardState {
  horizon: PlanningHorizon;
  temporalMode: TemporalState;
  dataState: DataState;
  planSummary: {
    demandMw: number;
    generationMw: number;
    reserveMw: number;
    congestion: number;
    reliabilityScore: number;
    n1Exposure: number;
  };
  outages: OutageEvent[];
  outageCommands: OutageCommandEntry[];
  projects: Project[];
  projectPortfolio: ProjectPortfolioEntry[];
  maintenance: MaintenanceWindow[];
  maintenanceCalendar: MaintenanceCalendarEntry[];
  bottlenecks: Bottleneck[];
  capacity: CapacityBreakdown;
  losses: LossIntelligenceReport;
  investment: InvestmentRanking;
  renewableIntegration: RenewableIntegrationAnalysis;
  futureGrid: FutureGridState;
  weatherMaintenance: WeatherMaintenanceAnalysis;
  conflicts: Array<{ id: string; firstOutageId: string; secondOutageId: string; risk: number; message: string; }>;
  planningBrief: PlanningBrief;
  scenarios: PlanningScenario[];
}
