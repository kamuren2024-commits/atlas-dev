/**
 * KETRACO COMMAND CENTER - PHASE 08
 * Grid Agent Orchestrator
 * 
 * Coordinates multi-agent parallel investigation and consensus
 */

import { Mission, AgentResult, AgentRole, MissionConsensus } from './types';
import {
  GridAgent,
  GridObserver,
  TopologyAgent,
  AssetHealthAgent,
  RiskAgent,
  ForecastAgent,
  ContingencyAgent,
  IncidentAgent,
  WeatherAgent,
  MaintenanceAgent,
  DataQualityAgent,
  SimulationAgent,
  GridCopilot,
} from './agents';

/**
 * Grid Agent Orchestrator
 */
export class GridAgentOrchestrator {
  private static instance: GridAgentOrchestrator | null = null;
  private agents: Map<AgentRole, GridAgent> = new Map();
  private initialized = false;

  private constructor() {
    this.initializeAgents();
  }

  /**
   * Singleton pattern
   */
  public static getInstance(): GridAgentOrchestrator {
    if (!GridAgentOrchestrator.instance) {
      GridAgentOrchestrator.instance = new GridAgentOrchestrator();
    }
    return GridAgentOrchestrator.instance;
  }

  /**
   * Initialize all agents
   */
  private initializeAgents(): void {
    this.agents.set('GridObserver', new GridObserver());
    this.agents.set('TopologyAgent', new TopologyAgent());
    this.agents.set('AssetHealthAgent', new AssetHealthAgent());
    this.agents.set('RiskAgent', new RiskAgent());
    this.agents.set('ForecastAgent', new ForecastAgent());
    this.agents.set('ContingencyAgent', new ContingencyAgent());
    this.agents.set('IncidentAgent', new IncidentAgent());
    this.agents.set('WeatherAgent', new WeatherAgent());
    this.agents.set('MaintenanceAgent', new MaintenanceAgent());
    this.agents.set('DataQualityAgent', new DataQualityAgent());
    this.agents.set('SimulationAgent', new SimulationAgent());
    this.agents.set('GridCopilot', new GridCopilot());
  }

  /**
   * Initialize orchestrator
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('[AGENT-ORCHESTRATOR] Initializing Grid Agent Orchestrator...');

    this.initialized = true;

    console.log('[AGENT-ORCHESTRATOR] Grid Agent Orchestrator initialized with 12 agents');
  }

  /**
   * Orchestrate mission investigation
   *
   * Flow:
   * 1. DECOMPOSE mission into tasks
   * 2. ASSIGN agents based on mission type
   * 3. PARALLEL INVESTIGATION by all agents
   * 4. CORRELATE results
   * 5. RESOLVE conflicts
   * 6. GENERATE consensus
   * 7. PRODUCE brief
   */
  public async orchestrateMission(mission: Mission): Promise<{
    agentResults: AgentResult[];
    consensus: MissionConsensus;
    briefGenerated: boolean;
  }> {
    console.log('[AGENT-ORCHESTRATOR] Orchestrating mission:', mission.id);

    try {
      // Step 1: Decompose mission
      const tasks = this.decomposeMission(mission);
      console.log('[AGENT-ORCHESTRATOR] Decomposed mission into', tasks.length, 'tasks');

      // Step 2: Assign agents
      const assignedAgents = mission.assignedAgents;
      console.log('[AGENT-ORCHESTRATOR] Assigned', assignedAgents.length, 'agents');

      // Step 3: Parallel investigation
      const agentResults = await this.parallelInvestigate(mission, assignedAgents);
      console.log('[AGENT-ORCHESTRATOR] Parallel investigation complete:', agentResults.length, 'results');

      // Step 4: Correlate results
      const correlatedResults = this.correlateResults(agentResults);
      console.log('[AGENT-ORCHESTRATOR] Correlation analysis complete');

      // Step 5: Resolve conflicts
      const resolved = this.resolveConflicts(correlatedResults);
      console.log('[AGENT-ORCHESTRATOR] Conflict resolution complete');

      // Step 6: Generate consensus
      const consensus = this.generateConsensus(resolved);
      console.log('[AGENT-ORCHESTRATOR] Consensus generated');

      // Step 7: Generate brief
      const briefGenerated = await this.generateBrief(mission, consensus);

      // Update mission with results
      mission.agentResults = agentResults;

      return {
        agentResults,
        consensus,
        briefGenerated,
      };
    } catch (error) {
      console.error('[AGENT-ORCHESTRATOR] Orchestration error:', error);

      return {
        agentResults: [],
        consensus: {
          hypothesis: 'Error during orchestration',
          agentAgreement: {} as Record<AgentRole, boolean>,
          evidence: [],
          disagreement: [String(error)],
          missingEvidence: ['Complete agent results'],
          recommendedInvestigation: ['Retry orchestration', 'Manual review'],
        },
        briefGenerated: false,
      };
    }
  }

  /**
   * Decompose mission into tasks
   */
  private decomposeMission(mission: Mission): string[] {
    const tasks = [
      `Observe grid state for ${mission.type}`,
      `Analyze topology impact on ${mission.affectedAssets.length} assets`,
      `Assess asset health and maintenance status`,
      `Evaluate system risk and cascade potential`,
      `Generate grid state forecast`,
      `Analyze contingency scenarios`,
      `Track incident escalation status`,
      `Evaluate weather impact`,
      `Recommend maintenance actions`,
      `Verify data quality and integrity`,
      `Run simulation scenarios`,
      `Generate operator brief`,
    ];

    // Filter based on assigned agents
    return tasks.filter((_, i) => i < mission.assignedAgents.length);
  }

  /**
   * Run parallel investigation by all agents
   */
  private async parallelInvestigate(
    mission: Mission,
    assignedAgents: AgentRole[]
  ): Promise<AgentResult[]> {
    const investigations = assignedAgents
      .map((role) => {
        const agent = this.agents.get(role);
        if (!agent) {
          console.warn('[AGENT-ORCHESTRATOR] Agent not found:', role);
          return null;
        }
        return agent.investigate(mission);
      })
      .filter((p) => p !== null) as Promise<AgentResult>[];

    // Run in parallel
    const results = await Promise.allSettled(investigations);

    // Extract results, handle failures
    return results
      .map((r) => {
        if (r.status === 'fulfilled') return r.value;

        // Create error result
        const failedRole = assignedAgents[results.indexOf(r)];
        return {
          agentRole: failedRole,
          status: 'FAILED' as const,
          evidence: {
            finding: 'Agent execution failed',
            evidence: { error: String(r.reason) },
            source: failedRole,
            timestamp: new Date().toISOString(),
            confidence: 0,
            assumptions: ['System error'],
            recommendedNextStep: 'Retry agent',
          },
          latency: 0,
          timestamp: new Date().toISOString(),
          error: String(r.reason),
        };
      })
      .filter((r) => r !== null) as AgentResult[];
  }

  /**
   * Correlate agent results
   */
  private correlateResults(agentResults: AgentResult[]): Map<string, AgentResult[]> {
    const correlations = new Map<string, AgentResult[]>();

    // Group by evidence topic
    const topics = new Set<string>();

    agentResults.forEach((result) => {
      const topic = this.extractTopic(result.evidence.finding);
      topics.add(topic);
    });

    // Correlate results by topic
    topics.forEach((topic) => {
      const related = agentResults.filter(
        (r) => this.extractTopic(r.evidence.finding) === topic
      );
      correlations.set(topic, related);
    });

    return correlations;
  }

  /**
   * Extract main topic from evidence finding
   */
  private extractTopic(finding: string): string {
    if (finding.includes('Topology')) return 'topology';
    if (finding.includes('Risk')) return 'risk';
    if (finding.includes('Forecast')) return 'forecast';
    if (finding.includes('Simulation')) return 'simulation';
    if (finding.includes('Health')) return 'health';
    if (finding.includes('Incident')) return 'incident';
    return 'general';
  }

  /**
   * Resolve conflicts between agent results
   */
  private resolveConflicts(
    correlations: Map<string, AgentResult[]>
  ): {
    consensus: Map<string, AgentResult>;
    disagreement: string[];
    missing: string[];
  } {
    const consensus = new Map<string, AgentResult>();
    const disagreement: string[] = [];
    const missing: string[] = [];

    correlations.forEach((results, topic) => {
      if (results.length === 0) {
        missing.push(`No evidence for ${topic}`);
        return;
      }

      if (results.length === 1) {
        consensus.set(topic, results[0]);
        return;
      }

      // Multiple results for same topic - check confidence
      const sorted = [...results].sort(
        (a, b) => b.evidence.confidence - a.evidence.confidence
      );

      consensus.set(topic, sorted[0]);

      // Check for significant disagreement
      if (sorted[0].evidence.confidence - sorted[1].evidence.confidence > 20) {
        disagreement.push(
          `${topic}: ${sorted[0].agentRole} vs ${sorted[1].agentRole} (confidence diff: ${(sorted[0].evidence.confidence - sorted[1].evidence.confidence).toFixed(0)}%)`
        );
      }
    });

    return { consensus, disagreement, missing };
  }

  /**
   * Generate mission consensus
   */
  private generateConsensus(resolved: {
    consensus: Map<string, AgentResult>;
    disagreement: string[];
    missing: string[];
  }): MissionConsensus {
    // Primary hypothesis from highest confidence result
    const topResult = Array.from(resolved.consensus.values()).sort(
      (a, b) => b.evidence.confidence - a.evidence.confidence
    )[0];

    const hypothesis = topResult?.evidence.finding || 'Unable to form hypothesis';

    // Collect agent agreement
    const agentAgreement = {} as Record<AgentRole, boolean>;

    resolved.consensus.forEach((result) => {
      agentAgreement[result.agentRole] = result.evidence.confidence > 75;
    });

    return {
      hypothesis,
      agentAgreement,
      evidence: Array.from(resolved.consensus.values()).map((r) => r.evidence.finding),
      disagreement: resolved.disagreement,
      missingEvidence: resolved.missing,
      recommendedInvestigation: this.recommendFurtherInvestigation(resolved.disagreement),
    };
  }

  /**
   * Recommend further investigation for disagreements
   */
  private recommendFurtherInvestigation(disagreements: string[]): string[] {
    if (disagreements.length === 0) {
      return ['Monitor situation for changes', 'Prepare for contingency execution'];
    }

    return [
      'Reconcile conflicting agent assessments',
      'Request additional sensor data',
      'Review assumptions for each agent',
      'Run sensitivity analysis',
    ];
  }

  /**
   * Generate operator brief from consensus
   */
  private async generateBrief(
    mission: Mission,
    consensus: MissionConsensus
  ): Promise<boolean> {
    try {
      // Use GridCopilot to generate natural language brief
      const copilot = this.agents.get('GridCopilot') as GridCopilot;

      if (!copilot) {
        console.warn('[AGENT-ORCHESTRATOR] GridCopilot not available');
        return false;
      }

      const briefResult = await copilot.investigate(mission);

      if (briefResult.status !== 'COMPLETE') {
        console.warn('[AGENT-ORCHESTRATOR] Brief generation failed');
        return false;
      }

      console.log('[AGENT-ORCHESTRATOR] Brief generated successfully');

      return true;
    } catch (error) {
      console.error('[AGENT-ORCHESTRATOR] Error generating brief:', error);
      return false;
    }
  }

  /**
   * Get agent by role
   */
  public getAgent(role: AgentRole): GridAgent | undefined {
    return this.agents.get(role);
  }

  /**
   * Get all agents
   */
  public getAllAgents(): GridAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agent health
   */
  public getAgentHealth(): Record<AgentRole, string> {
    const health: Record<AgentRole, string> = {} as any;

    this.agents.forEach((agent, role) => {
      health[role] = agent.getState();
    });

    return health;
  }

  /**
   * Shutdown orchestrator
   */
  public async shutdown(): Promise<void> {
    console.log('[AGENT-ORCHESTRATOR] Shutting down Grid Agent Orchestrator...');

    this.agents.clear();
    this.initialized = false;

    console.log('[AGENT-ORCHESTRATOR] Grid Agent Orchestrator shut down');
  }
}

export default GridAgentOrchestrator;
