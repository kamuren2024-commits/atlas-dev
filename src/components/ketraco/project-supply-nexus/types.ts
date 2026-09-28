export type HealthStatus = 'HEALTHY' | 'AT_RISK' | 'CRITICAL';
export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface KPIItem {
  id: string;
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'neutral';
  status: HealthStatus;
  trendPositive: boolean;
  freshness: string;
  contributingFactors: string[];
}

export interface ConstellationNode {
  id: string;
  name: string;
  voltage: string;
  status: HealthStatus;
  x: number; // percentage coordinate 0-100
  y: number; // percentage coordinate 0-100
  delta?: string;
  confidence: number;
  progress: number;
  stage: string;
  activeRiskCount: number;
}

export interface ConstellationEdge {
  id: string;
  from: string;
  to: string;
  type: 'dependency' | 'strategic';
  label?: string;
}

export interface CriticalException {
  id: string;
  code: string;
  project: string;
  title: string;
  severity: SeverityLevel;
  detail: string;
  impact: string;
  aiConfidence: number;
  cause: string;
  timestamp: string;
  recommendedAction: string;
}

export interface PDSStageItem {
  id: string;
  sequence: number;
  name: string;
  count: number;
  cycleDays: number;
  color: string;
  isBottleneck?: boolean;
  bottleneckInfo?: {
    driver: string;
    owner: string;
    action: string;
  };
}

export interface GenomeDimension {
  id: string;
  name: string;
  score: number;
  delta7d: number;
  status: HealthStatus;
  driver?: string;
}

export interface SupplyReadinessItem {
  id: string;
  material: string;
  required: string;
  available: string;
  eta: string;
  risk: HealthStatus;
}

export interface ProjectDeltaEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  badge?: string;
  badgeColor?: 'blue' | 'purple' | 'amber' | 'emerald' | 'cyan';
  category: 'supply' | 'construction' | 'commercial' | 'document' | 'ai' | 'wayleave';
}

export interface MapLayerOption {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
}

// UI State lifecycle contract
export type NexusUIState = 'LIVE' | 'INITIALIZING' | 'DEGRADED' | 'STALE' | 'OFFLINE' | 'EMPTY' | 'ERROR';

// Persistent Master Project Definition
export interface MasterProjectSummary {
  id: string;
  code: string;
  name: string;
  voltage: string;
  status: HealthStatus;
  stage: string;
  progress: number;
  confidence: number;
  lengthKm: number;
  substations: string;
  epcContractor: string;
  approvedBudget: string;
  spentBudget: string;
  eacBudget: string;
  varianceEac: string;
  forecastCompletion: string;
  baselineCompletion: string;
  delayDays: number;
  pmName: string;
  leadEngineer: string;
  programId?: string;
  priority: 'STRATEGIC' | 'NATIONAL_CRITICAL' | 'REGIONAL' | 'STANDARD';
  budget?: string;
  eac?: string;
}

// ==========================================
// MODULE GROUP 1 — COMMAND
// ==========================================
export interface PortfolioDelayedProject {
  id: string;
  name: string;
  code: string;
  phase: string;
  delayDays: number;
  criticalMilestone: string;
  impactScore: 'HIGH' | 'CRITICAL' | 'MODERATE';
  driver: string;
  mitigation: string;
  health: HealthStatus;
}

export interface PortfolioCriticalProject {
  id: string;
  name: string;
  code: string;
  voltage: string;
  capex: string;
  progress: number;
  confidence: number;
  health: HealthStatus;
  daysToCommissioning: number;
  targetDate: string;
  topRisk: string;
}

export interface FinancialExposureItem {
  id: string;
  project: string;
  category: 'CLAIMS' | 'FOREX' | 'VARIATION' | 'LIQUIDATED_DAMAGES';
  exposureAmount: string;
  status: 'PENDING_AUDIT' | 'DISPUTED' | 'PROVISIONED';
  riskScore: number;
  mitigationAction: string;
}

export interface SupplyExposureItem {
  id: string;
  item: string;
  project: string;
  supplier: string;
  delayWeeks: number;
  criticality: 'CRITICAL' | 'HIGH';
  contingencyAvailable: boolean;
  status: string;
}

export interface ResourceConflictItem {
  id: string;
  resourceName: string;
  role: string;
  competingProjects: string[];
  allocationPercent: number;
  impactDate: string;
  recommendedResolution: string;
}

export interface CommissioningPipelineItem {
  id: string;
  project: string;
  targetQuarter: string;
  targetDate: string;
  confidence: number;
  criticalPrerequisite: string;
  status: 'ON_TRACK' | 'AT_RISK' | 'CRITICAL';
}

export interface PortfolioRiskItem {
  id: string;
  title: string;
  category: 'WAYLEAVE' | 'SUPPLY' | 'CONTRACT' | 'SECURITY' | 'FINANCE';
  affectedProjectsCount: number;
  exposure: string;
  severity: SeverityLevel;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// Executive View Types
export interface ExecutiveStrategicProject {
  id: string;
  code: string;
  name: string;
  voltage: string;
  strategicObjective: string;
  deliveryProbability: number;
  capitalBudget: string;
  capitalCommitted: string;
  status: HealthStatus;
  headlineIssue: string;
  actionRequired: string;
}

export interface ExecutiveChangeFeedItem {
  id: string;
  timestamp: string;
  headline: string;
  project: string;
  type: 'REGULATORY' | 'SUPPLY' | 'COMMERCIAL' | 'PROGRESS';
  impactLevel: 'HIGH' | 'CRITICAL' | 'NOTABLE';
  summary: string;
}

export interface ExecutiveAttentionItem {
  id: string;
  project: string;
  area: string;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MONITOR';
  description: string;
  financialImpact: string;
  timelineImpact: string;
  escalatedBy: string;
}

export interface ExecutiveDecisionItem {
  id: string;
  decisionId: string;
  title: string;
  project: string;
  authority: string;
  deadline: string;
  financialImplication: string;
  summary: string;
  options: {
    label: string;
    impact: string;
    actionKey: string;
  }[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

// ==========================================
// MODULE GROUP 2 — PDS (PROJECT DEVELOPMENT SERVICES)
// ==========================================
export type PDSLifecycleStage =
  | 'Need'
  | 'Concept'
  | 'Feasibility'
  | 'Land/Wayleave'
  | 'Funding'
  | 'Approval'
  | 'Procurement'
  | 'Design'
  | 'Construction'
  | 'Commissioning'
  | 'Handover'
  | 'Operations';

export interface DevelopmentPipelineProject {
  id: string;
  code: string;
  name: string;
  voltage: string;
  stage: PDSLifecycleStage;
  readiness: number;
  blockers: string[];
  blockerSeverity: 'HIGH' | 'CRITICAL' | 'NONE';
  owner: string;
  dueDate: string;
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  evidenceCompleteness: number;
  evidenceCount: number;
  nextAction: string;
}

export interface ConceptItem {
  id: string;
  code: string;
  title: string;
  transmissionNeed: string;
  objective: string;
  voltage: string;
  route: string;
  lengthKm: number;
  substations: string[];
  capacityMw: number;
  beneficiaries: string;
  reliabilityRationale: string;
  preliminaryCapex: string;
  preliminarySchedule: string;
  economicEirr: string;
  status: 'DRAFT' | 'BOARD_REVIEW' | 'APPROVED' | 'ARCHIVED';
  alternatives: {
    id: string;
    name: string;
    description: string;
    capex: string;
    lengthKm: number;
    environmentalImpact: 'LOW' | 'MODERATE' | 'HIGH';
    wayleaveComplexity: 'LOW' | 'MEDIUM' | 'HIGH';
    technicalMerit: string;
  }[];
}

export type FeasibilityPillar =
  | 'Technical'
  | 'Economic'
  | 'Environmental'
  | 'Financial'
  | 'Land'
  | 'Regulatory'
  | 'Social'
  | 'Security'
  | 'Implementation';

export interface FeasibilityAssessmentItem {
  id: string;
  projectId: string;
  pillar: FeasibilityPillar;
  score: number;
  status: 'SATISFACTORY' | 'ACTION_REQUIRED' | 'CRITICAL_GAP';
  evidence: string[];
  gaps: string[];
  assumptions: string[];
  risks: string[];
  recommendation: string;
}

export interface FundingTrancheItem {
  id: string;
  projectId: string;
  fundingSource: string;
  type: 'CONCESSIONAL_LOAN' | 'GRANT' | 'COMMERCIAL_EXPORT_CREDIT' | 'GOK_EXCHEQUER';
  committedFunding: string;
  fundingRequest: string;
  disbursedToDate: string;
  financingGap: string;
  disbursementSchedule: {
    quarter: string;
    amount: string;
    status: 'COMPLETED' | 'PENDING_CONDITIONS' | 'PROJECTED';
  }[];
  conditionsPrecedent: {
    title: string;
    status: 'SATISFIED' | 'IN_PROGRESS' | 'OUTSTANDING';
    dueDate: string;
  }[];
  financierRequirements: string[];
  financingRisk: string;
}

export interface RegulatoryApprovalItem {
  id: string;
  projectId: string;
  approval: string;
  authority: string;
  owner: string;
  submissionDate: string;
  evidence: string;
  status: 'APPROVED' | 'UNDER_REVIEW' | 'PENDING_SUBMISSION' | 'BLOCKED';
  dueDate: string;
  blocker: string | null;
  escalation: string;
}

export type GateStatus = 'READY' | 'AT_RISK' | 'BLOCKED' | 'NOT_READY';

export interface GateReadinessItem {
  id: string;
  projectId: string;
  gateNumber: number;
  gateName: string;
  readinessScore: number;
  status: GateStatus;
  mandatoryCriteria: {
    criterion: string;
    met: boolean;
    evidenceRef: string;
  }[];
  evidenceCompleteness: number;
  outstandingRisks: string[];
  approvals: {
    name: string;
    signed: boolean;
    signee: string;
  }[];
  actions: string[];
  decisionAuthority: string;
}

// ==========================================
// MODULE GROUP 3 — PROJECTS
// ==========================================
export interface ProgramItem {
  id: string;
  code: string;
  name: string;
  description: string;
  projectsCount: number;
  childProjects: string[];
  totalBudget: string;
  totalEac: string;
  combinedProgress: number;
  health: HealthStatus;
  sharedResources: string[];
  sharedSuppliers: string[];
  sharedContractors: string[];
  programRisksCount: number;
  benefits: string[];
  status?: HealthStatus;
  progress?: number;
  programManager?: string;
  consolidatedRiskExposure?: string;
}

export interface WorkPackageItem {
  id: string;
  projectId: string;
  code: string;
  title: string;
  scope: string;
  owner: string;
  startDate: string;
  endDate: string;
  progress: number;
  materials: string[];
  contractor: string;
  dependencies: string[];
  cost: string;
  actualCost: string;
  risks: string[];
  evidenceDocs: string[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  name?: string;
  plannedCost?: string;
  spi?: number;
  cpi?: number;
  criticalPath?: boolean;
  isCritical?: boolean;
}

export interface MilestoneItem {
  id: string;
  projectId: string;
  code: string;
  name: string;
  baseline: string;
  planned: string;
  forecast: string;
  actual?: string;
  varianceDays: number;
  predecessor: string;
  successor: string;
  owner: string;
  confidence: number;
  isCritical: boolean;
  status: 'COMPLETED' | 'ON_TRACK' | 'DELAYED' | 'UPCOMING';
  baselineDate?: string;
  forecastDate?: string;
  deliverables?: string;
}

export type DependencyTier =
  | 'Project'
  | 'Milestone'
  | 'Material'
  | 'Supplier'
  | 'Contract'
  | 'Shipment'
  | 'Installation'
  | 'Commissioning';

export interface DependencyChainNode {
  id: string;
  tier: DependencyTier;
  label: string;
  code: string;
  status: HealthStatus;
  varianceDays: number;
  blockers: string[];
  downstreamImpacts: string[];
  owner: string;
}

// ==========================================
// MODULE GROUP 4 — CONTROLS
// ==========================================
export interface ScheduleActivity {
  id: string;
  wbsCode: string;
  name: string;
  durationDays: number;
  baselineStart: string;
  baselineEnd: string;
  actualStart?: string;
  actualEnd?: string;
  forecastEnd: string;
  progress: number;
  floatDays: number;
  isCritical: boolean;
  dependencies: string[];
  milestoneRef?: string;
  owner: string;
}

export interface CostBreakdownItem {
  id: string;
  wbsCode: string;
  category: string;
  approvedBudget: number;
  baseline: number;
  commitments: number;
  actuals: number;
  forecast: number;
  etc: number;
  eac: number;
  variance: number;
  contingency: number;
  exposure: number;
}

export interface ResourceEntity {
  id: string;
  name: string;
  type: 'ENGINEER' | 'PM' | 'CONTRACTOR' | 'CONSULTANT' | 'EQUIPMENT';
  role: string;
  assignedProjects: string[];
  utilizationPercent: number;
  allocationHours: number;
  availability: 'AVAILABLE' | 'CONSTRAINED' | 'OVERALLOCATED';
  conflicts: string[];
  demandTrend: 'HIGH' | 'STABLE' | 'PEAK';
}

export interface ProgressSPoint {
  period: string;
  plannedValue: number;
  earnedValue: number;
  actualCost: number;
  forecastValue: number;
}

export interface CriticalPathItem {
  id: string;
  wbsCode: string;
  activityName: string;
  earlyStart: string;
  earlyFinish: string;
  lateStart: string;
  lateFinish: string;
  totalFloat: number;
  freeFloat: number;
  threatenedMilestones: string[];
  commissioningImpactDays: number;
  recoveryOpportunities: {
    strategy: string;
    costDelta: string;
    daysRecovered: number;
    risk: string;
  }[];
}

export type ProjectViewMode = 
  | 'project-360'
  | 'work-packages'
  | 'milestones'
  | 'dependencies'
  | 'schedule'
  | 'cost'
  | 'resources'
  | 'progress'
  | 'critical-path'
  | 'pipeline'
  | 'feasibility'
  | 'funding'
  | 'gate-readiness'
  | 'programs';
