/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Mission Engine - Main Export & Initialization
 * 
 * Complete mission orchestration system
 */

// Core Engine
export { GridMissionEngine } from './mission-engine';

// Agent System
export { GridAgent } from './agents';
export { GridAgentOrchestrator } from './orchestrator';

// Analysis Engines
export { RootCauseEngine, RecommendationEngine } from './analysis-engines';

// Causal Graph
export { CausalGraphEngine } from './causal-graph';

// Scenario Analysis
export { ScenarioEngine } from './scenarios';

// Approval Workflow
export { ApprovalGateManager, ApprovalWorkflow } from './approvals';

// Mission Memory
export { MissionMemory } from './mission-memory';

// Grid Playbooks
export { GridPlaybooksLibrary } from './playbooks';

// Types
export type {
  Mission,
  MissionType,
  AgentRole,
  Evidence,
  AgentResult,
  MissionConsensus,
  RootCauseAnalysis,
  Hypothesis,
  Recommendation,
  RankedRecommendations,
  CausalGraph,
  CausalNode,
  CausalEdge,
  Scenario,
  ScenarioComparison,
  Approval,
  ApprovalGate,
  ApprovalDecision,
} from './types';

/**
 * Mission Orchestration System - Initialize all components
 */
export class MissionOrchestrationSystem {
  private static instance: MissionOrchestrationSystem | null = null;

  private missionEngine: any;
  private agentOrchestrator: any;
  private rootCauseEngine: any;
  private recommendationEngine: any;
  private causalGraphEngine: any;
  private scenarioEngine: any;
  private approvalWorkflow: any;
  private missionMemory: any;
  private playbooksLibrary: any;

  private constructor() {
    this.initializeComponents();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): MissionOrchestrationSystem {
    if (!MissionOrchestrationSystem.instance) {
      MissionOrchestrationSystem.instance = new MissionOrchestrationSystem();
    }
    return MissionOrchestrationSystem.instance;
  }

  /**
   * Initialize all components
   */
  private initializeComponents(): void {
    console.log('[MISSION-ORCHESTRATION-SYSTEM] Initializing components...');

    const { GridMissionEngine } = require('./mission-engine');
    const { GridAgentOrchestrator } = require('./orchestrator');
    const { RootCauseEngine, RecommendationEngine } = require('./analysis-engines');
    const { CausalGraphEngine } = require('./causal-graph');
    const { ScenarioEngine } = require('./scenarios');
    const { ApprovalWorkflow } = require('./approvals');
    const { default: MissionMemory } = require('./mission-memory');
    const { default: GridPlaybooksLibrary } = require('./playbooks');

    this.missionEngine = GridMissionEngine.getInstance();
    this.agentOrchestrator = GridAgentOrchestrator.getInstance();
    this.rootCauseEngine = RootCauseEngine.getInstance();
    this.recommendationEngine = RecommendationEngine.getInstance();
    this.causalGraphEngine = CausalGraphEngine.getInstance();
    this.scenarioEngine = ScenarioEngine.getInstance();
    this.approvalWorkflow = ApprovalWorkflow.getInstance();
    this.missionMemory = MissionMemory.getInstance();
    this.playbooksLibrary = GridPlaybooksLibrary.getInstance();

    console.log('[MISSION-ORCHESTRATION-SYSTEM] Initialization complete');
  }

  /**
   * Execute complete mission workflow
   * EVENT → MISSION → ORCHESTRATION → ANALYSIS → SCENARIOS → APPROVAL → MEMORY
   */
  public async executeMissionWorkflow(event: any): Promise<any> {
    console.log('[MISSION-ORCHESTRATION-SYSTEM] Executing mission workflow');

    try {
      // 1. Create mission from event
      const mission = this.missionEngine.createMissionFromEvent(event);
      console.log('✓ Mission created:', mission.id);

      // 2. Orchestrate multi-agent investigation
      const consensus = await this.agentOrchestrator.orchestrateMission(mission);
      console.log('✓ Agent investigation complete');

      // 3. Analyze root cause
      const rootCause = await this.rootCauseEngine.analyze(mission);
      console.log('✓ Root cause analysis:', rootCause.primaryHypothesis.title);

      // 4. Generate recommendations
      const recommendations = await this.recommendationEngine.generateRecommendations(mission);
      console.log('✓ Recommendations generated');

      // 5. Build causal graph
      const graph = this.causalGraphEngine.buildGraph(
        mission,
        rootCause,
        recommendations.bestOption
      );
      console.log('✓ Causal graph built');

      // 6. Generate scenarios
      const scenarios = await this.scenarioEngine.generateScenarios(mission);
      console.log('✓ Scenarios generated');

      // 7. Start approval workflow
      const approvalGate = await this.approvalWorkflow.startWorkflow(mission);
      console.log('✓ Approval workflow started');

      // 8. Recommend playbook
      const playbook = this.playbooksLibrary.recommendPlaybook(mission.type);
      console.log('✓ Playbook recommended:', playbook?.name || 'None');

      return {
        mission,
        consensus,
        rootCause,
        recommendations,
        graph,
        scenarios,
        approvalGate,
        playbook,
        executedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('[MISSION-ORCHESTRATION-SYSTEM] Workflow error:', error);
      throw error;
    }
  }

  /**
   * Get engine reference
   */
  public getMissionEngine() {
    return this.missionEngine;
  }

  public getAgentOrchestrator() {
    return this.agentOrchestrator;
  }

  public getRootCauseEngine() {
    return this.rootCauseEngine;
  }

  public getRecommendationEngine() {
    return this.recommendationEngine;
  }

  public getCausalGraphEngine() {
    return this.causalGraphEngine;
  }

  public getScenarioEngine() {
    return this.scenarioEngine;
  }

  public getApprovalWorkflow() {
    return this.approvalWorkflow;
  }

  public getMissionMemory() {
    return this.missionMemory;
  }

  public getPlaybooksLibrary() {
    return this.playbooksLibrary;
  }
}

export { MissionOrchestrationSystem };
export default MissionOrchestrationSystem;
