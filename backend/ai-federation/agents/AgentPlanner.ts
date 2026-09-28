// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AGENT PLANNER
// Plans agent execution based on task requirements and available agents
// ============================================================================

import { AgentDefinition } from './AgentRuntime';
import { findAgentsByClass, findAgentsByCapability } from './AgentRegistry';
import { AgentGraph } from './AgentGraph';

export interface PlanningStep {
  order: number;
  agentId: string;
  agentName: string;
  role: string;
  task: string;
  dependencies: string[];
  requiresApproval: boolean;
  estimatedCostUsd: number;
  expectedDurationMs: number;
}

export interface AgentPlan {
  id: string;
  missionId: string;
  task: string;
  steps: PlanningStep[];
  totalEstimatedCostUsd: number;
  totalEstimatedDurationMs: number;
  criticalPath: string[];
}

export class AgentPlanner {
  private static instance: AgentPlanner;
  private graph: AgentGraph;

  private constructor() {
    this.graph = AgentGraph.getInstance();
  }

  public static getInstance(): AgentPlanner {
    if (!AgentPlanner.instance) {
      AgentPlanner.instance = new AgentPlanner();
    }
    return AgentPlanner.instance;
  }

  /**
   * Create an agent execution plan for a task
   */
  async createPlan(
    missionId: string,
    task: string,
    requiredCapabilities: string[],
    missionAgentId?: string
  ): Promise<AgentPlan> {
    const steps: PlanningStep[] = [];
    const missionAgent = missionAgentId
      ? findAgentsByCapability(missionAgentId)[0]
      : undefined;

    // Find agents that can handle the task capabilities
    const capableAgents = this.graph.findAgents(requiredCapabilities);

    let order = 0;

    // Step 1: Mission agent (if specified)
    if (missionAgent) {
      steps.push({
        order: order++,
        agentId: missionAgent.id,
        agentName: missionAgent.name,
        role: 'MISSION_LEAD',
        task: `Oversee ${task}`,
        dependencies: [],
        requiresApproval: missionAgent.autonomyLevel === 'L3_APPROVAL_REQUIRED',
        estimatedCostUsd: 0.01,
        expectedDurationMs: 5000,
      });
    }

    // Step 2: Capable agents for the main task
    for (const capable of capableAgents.slice(0, 5)) {
      steps.push({
        order: order++,
        agentId: capable.agent.id,
        agentName: capable.agent.name,
        role: 'EXECUTOR',
        task: `${task} (capabilities: ${capable.matchedCapabilities.join(', ')})`,
        dependencies: missionAgent ? [missionAgent.id] : [],
        requiresApproval: capable.agent.autonomyLevel === 'L3_APPROVAL_REQUIRED',
        estimatedCostUsd: 0.005,
        expectedDurationMs: 3000,
      });
    }

    // Step 3: Verification agent (utility class)
    const verificationAgents = findAgentsByClass('UTILITY').filter(
      a => a.providedCapabilities.includes('data_validation') ||
           a.providedCapabilities.includes('report_generation')
    );

    if (verificationAgents.length > 0) {
      const verifier = verificationAgents[0];
      steps.push({
        order: order++,
        agentId: verifier.id,
        agentName: verifier.name,
        role: 'VERIFIER',
        task: `Verify results of: ${task}`,
        dependencies: capableAgents.slice(0, 5).map(a => a.agent.id),
        requiresApproval: false,
        estimatedCostUsd: 0.002,
        expectedDurationMs: 2000,
      });
    }

    const totalCost = steps.reduce((sum, s) => sum + s.estimatedCostUsd, 0);
    const totalDuration = steps.reduce((sum, s) => sum + s.expectedDurationMs, 0);
    const criticalPath = steps.filter(s => s.requiresApproval).map(s => s.agentId);

    return {
      id: `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      missionId,
      task,
      steps,
      totalEstimatedCostUsd: totalCost,
      totalEstimatedDurationMs: totalDuration,
      criticalPath,
    };
  }

  /**
   * Estimate human approval requirement
   */
  requiresApproval(plan: AgentPlan): boolean {
    return plan.steps.some(s => s.requiresApproval);
  }
}
