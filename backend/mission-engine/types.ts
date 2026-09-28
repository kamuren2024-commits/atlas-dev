/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Grid Mission Engine - Type Definitions
 * 
 * Mission types, priorities, and evidence contracts
 */

import { CanonicalEvent } from '../event-fabric/types';

/**
 * Mission Types (10)
 */
export type MissionType =
  | 'CRITICAL_OUTAGE'
  | 'N1_VIOLATION'
  | 'CASCADE_RISK'
  | 'TRANSFORMER_RISK'
  | 'CONGESTION'
  | 'VOLTAGE_INSTABILITY'
  | 'FREQUENCY_EVENT'
  | 'ASSET_FAILURE_RISK'
  | 'WEATHER_THREAT'
  | 'DATA_INTEGRITY_INCIDENT';

/**
 * Mission Severity
 */
export type MissionSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Mission Priority (P0-P3)
 */
export type MissionPriority = 'P0' | 'P1' | 'P2' | 'P3';

/**
 * Mission Status
 */
export type MissionStatus =
  | 'CREATED'
  | 'INVESTIGATING'
  | 'WAITING'
  | 'SIMULATING'
  | 'RECOMMENDING'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'CLOSED'
  | 'CANCELLED';

/**
 * Agent State
 */
export type AgentState =
  | 'IDLE'
  | 'INVESTIGATING'
  | 'WAITING'
  | 'SIMULATING'
  | 'RECOMMENDING'
  | 'BLOCKED'
  | 'COMPLETE'
  | 'FAILED';

/**
 * Agent Role
 */
export type AgentRole =
  | 'GridObserver'
  | 'TopologyAgent'
  | 'AssetHealthAgent'
  | 'RiskAgent'
  | 'ForecastAgent'
  | 'ContingencyAgent'
  | 'IncidentAgent'
  | 'WeatherAgent'
  | 'MaintenanceAgent'
  | 'DataQualityAgent'
  | 'SimulationAgent'
  | 'GridCopilot';

/**
 * Evidence Item (Agent Evidence Contract)
 */
export interface Evidence {
  finding: string;
  evidence: any;
  source: string;
  timestamp: string;
  confidence: number; // 0-100
  assumptions: string[];
  recommendedNextStep: string;
}

/**
 * Agent Result (Evidence Contract)
 */
export interface AgentResult {
  agentRole: AgentRole;
  status: AgentState;
  evidence: Evidence;
  latency: number; // ms
  timestamp: string;
  error?: string;
}

/**
 * Priority Score Components
 */
export interface PriorityScore {
  impact: number; // 0-100
  urgency: number; // 0-100
  probability: number; // 0-100
  gridCriticality: number; // 0-100
  customerExposure: number; // 0-100
  confidence: number; // 0-100
  overall: number; // weighted aggregate
  priority: MissionPriority; // P0-P3
}

/**
 * Confidence Aggregation
 */
export interface ConfidenceAggregate {
  topology: number;
  telemetry: number;
  assetIdentity: number;
  forecast: number;
  riskModel: number;
  overall: number;
  weights: Record<string, number>;
}

/**
 * Scenario
 */
export interface Scenario {
  id?: string;
  name: string;
  description: string;
  frequency?: number;
  voltage?: number;
  loading?: number;
  reserve?: number;
  risk?: number;
  affectedAssets?: string[];
  recovery?: string;
  keyMetrics?: any;
  riskLevel?: string;
  timeframe?: string;
  probability?: number;
  gridMetrics?: any;
  benefit?: any;
  cost?: any;
  score?: number;
  [key: string]: any;
}

/**
 * Scenario Comparison
 */
export interface ScenarioComparison {
  current?: Scenario;
  noAction?: Scenario;
  optionA?: Scenario;
  optionB?: Scenario;
  optionC?: Scenario;
  scenarios?: any[];
  [key: string]: any;
}

/**
 * Hypothesis
 */
export interface Hypothesis {
  id: string;
  title: string;
  description: string;
  rank: 'HIGH' | 'MEDIUM' | 'LOW';
  evidenceFor: string[];
  evidenceAgainst: string[];
  confidence: number;
  requiredVerification: string[];
}

/**
 * Root Cause Analysis
 */
export interface RootCauseAnalysis {
  hypotheses: Hypothesis[];
  primaryHypothesis: Hypothesis;
  confidence: number;
  missingEvidence: string[];
  verificationStatus: Record<string, boolean>;
}

/**
 * Recommendation
 */
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  expectedBenefit: number; // 0-100
  risk: number; // 0-100
  reversibility: 'HIGH' | 'MEDIUM' | 'LOW';
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  gridImpact: string;
  confidence: number; // 0-100
  actionItems?: string[];
  estimatedDuration?: number; // minutes
}

/**
 * Recommendation Ranking
 */
export interface RankedRecommendations {
  bestOption: Recommendation;
  alternative?: Recommendation;
  doNothing: Recommendation;
  allRanked: Recommendation[];
}

/**
 * Approval Decision
 */
export type ApprovalDecision = 'APPROVED' | 'REJECTED' | 'REQUEST_MORE_EVIDENCE';

/**
 * Approval Record
 */
export interface Approval {
  id?: string;
  gateId?: string;
  user?: string;
  userId?: string;
  role?: string;
  userRole?: string;
  timestamp: string;
  decision: ApprovalDecision;
  reason: string;
  evidence?: string;
  [key: string]: any;
}

export interface ApprovalGate {
  id: string;
  name?: string;
  missionId?: string;
  requiredRole: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING';
  decision?: ApprovalDecision;
  lastDecision?: any;
  approver?: string;
  timestamp?: string;
  expiresAt?: string;
  reason?: string;
  [key: string]: any;
}

/**
 * Causal Graph Node
 */
export interface CausalNode {
  id: string;
  type: 'CAUSE' | 'EVENT' | 'ASSET' | 'TOPOLOGY' | 'IMPACT' | 'RISK' | 'RECOMMENDATION';
  label: string;
  data: any;
  confidence: number;
}

/**
 * Causal Graph Edge
 */
export interface CausalEdge {
  from: string;
  to: string;
  relationship: string;
  evidence: string;
  confidence: number;
}

/**
 * Causal Graph
 */
export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

/**
 * Operator Brief
 */
export interface OperatorBrief {
  situation: string;
  whatChanged: string;
  whyItMatters: string;
  evidence: string;
  predictedImpact: string;
  options: string[];
  simulatedOutcomes: ScenarioComparison;
  recommendation: Recommendation;
  confidence: number;
  unknowns: string[];
  timestamp: string;
}

/**
 * Mission
 */
export interface Mission {
  id: string;
  title?: string;
  type: MissionType;
  status: MissionStatus;
  severity?: MissionSeverity;
  priority?: MissionPriority;
  objectiveTitle?: string;
  objectiveDescription?: string;
  affectedAssets?: string[];
  evidence: any[];
  currentState?: any;
  predictedState?: any;
  tasks?: string[];
  assignedAgents: AgentRole[];
  agentResults?: AgentResult[];
  confidence?: ConfidenceAggregate;
  rootCause?: RootCauseAnalysis;
  scenarioComparison?: ScenarioComparison;
  recommendations?: RankedRecommendations;
  approvals?: Approval[];
  outcome?: string;
  auditTrail: AuditEntry[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  priorityScore?: PriorityScore;
  operatorBrief?: OperatorBrief;
  [key: string]: any;
}

/**
 * Audit Entry
 */
export interface AuditEntry {
  timestamp: string;
  action: string;
  actor: string;
  details: any;
  evidence?: string;
}

/**
 * Mission Consensus
 */
export interface MissionConsensus {
  hypothesis: string;
  agentAgreement: Record<AgentRole, boolean>;
  evidence: string[];
  disagreement: string[];
  missingEvidence: string[];
  recommendedInvestigation: string[];
}

/**
 * Mission Memory Entry
 */
export interface MissionMemoryEntry {
  missionId: string;
  problem: string;
  evidence: any;
  scenario: Scenario;
  decision: Recommendation;
  outcome: string;
  lessons: string[];
  modelVersion: string;
  accuracy: number; // post-verification
  timestamp: string;
}

/**
 * Grid Playbook
 */
export interface GridPlaybook {
  id: string;
  name: string;
  missionType: MissionType;
  detection: string;
  investigation: string;
  requiredEvidence: string[];
  simulationScenarios: string[];
  decisionGates: string[];
  verification: string[];
}

/**
 * Mission Timeline Event
 */
export interface MissionTimelineEvent {
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  evidence: CanonicalEvent | AgentResult | Approval | any;
}
