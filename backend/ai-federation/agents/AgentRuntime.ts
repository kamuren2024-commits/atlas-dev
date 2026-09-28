// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — AGENT RUNTIME
// Enterprise Agent Operating System with cognitive execution loop
// ============================================================================

import { AIOrchestrator } from '../federation/AIOrchestrator';
import { OperationalMemory } from '../memory/OperationalMemory';
import { EpisodicMemory } from '../memory/EpisodicMemory';
import { SemanticMemory } from '../memory/SemanticMemory';
import { InstitutionalMemory } from '../memory/InstitutionalMemory';
import { ToolGateway } from './ToolGateway';
import { generateId } from '../../../src/core/shared/crypto';

// ---------------------------------------------------------------------------
// Agent Types
// ---------------------------------------------------------------------------

export type AgentClass = 'MISSION' | 'DOMAIN' | 'UTILITY';

export type AutonomyLevel = 'L0_AUTONOMOUS' | 'L1_RECOMMEND' | 'L2_SUPERVISED' | 'L3_APPROVAL_REQUIRED';

export interface AgentDefinition {
  id: string;
  name: string;
  description: string;
  agentClass: AgentClass;
  domain: string;
  requiredCapabilities: string[];
  providedCapabilities: string[];
  autonomyLevel: AutonomyLevel;
  allowedTools: string[];
  memoryAccess: string[];
  systemPrompt: string;
}

export interface AgentState {
  agentId: string;
  status: 'IDLE' | 'RUNNING' | 'BLOCKED' | 'FAILED' | 'COMPLETED';
  currentTask?: string;
  currentMissionId?: string;
  missionState?: MissionState;
  startedAt?: string;
  completedAt?: string;
  iterations: number;
  maxIterations: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Cognitive Execution Loop States
// ---------------------------------------------------------------------------

export type CognitiveLoopPhase =
  | 'PERCEIVE'
  | 'UNDERSTAND'
  | 'RETRIEVE'
  | 'REASON'
  | 'PLAN'
  | 'SIMULATE'
  | 'ACT'
  | 'VERIFY'
  | 'LEARN';

export type MissionState =
  | 'CREATED'
  | 'OBSERVING'
  | 'UNDERSTANDING'
  | 'PLANNING'
  | 'POLICY_CHECK'
  | 'WAITING_APPROVAL'
  | 'EXECUTING'
  | 'VERIFYING'
  | 'REFLECTING'
  | 'REPLANNING'
  | 'COMPLETED'
  | 'FAILED'
  | 'ESCALATED'
  | 'CANCELLED'
  | 'TIMED_OUT'
  | 'BUDGET_EXCEEDED';

export interface MissionStateTransition {
  missionId: string;
  agentId: string;
  previousState: MissionState;
  nextState: MissionState;
  reason: string;
  actor: string;
  timestamp: string;
  policyDecision?: string;
  evidenceRefs: string[];
}

export interface CognitiveLoopContext {
  phase: CognitiveLoopPhase;
  agentId: string;
  missionId: string;
  task: string;
  input: Record<string, any>;
  perceptions?: string[];
  understanding?: string;
  retrievedContext?: string[];
  reasoning?: string;
  plan?: string[];
  simulation?: Record<string, any>;
  actions?: string[];
  verification?: { passed: boolean; issues: string[] };
  learnings?: string[];
  iteration: number;
  startTime: number;
}

// ---------------------------------------------------------------------------
// Agent Runtime
// ---------------------------------------------------------------------------

export class AgentRuntime {
  private static instance: AgentRuntime;
  private orchestrator: AIOrchestrator;
  private operationalMemory: OperationalMemory;
  private episodicMemory: EpisodicMemory;
  private semanticMemory: SemanticMemory;
  private institutionalMemory: InstitutionalMemory;
  private toolGateway: ToolGateway;
  private agentStates: Map<string, AgentState> = new Map();
  private transitions: MissionStateTransition[] = [];
  private readonly validTransitions: Record<MissionState, MissionState[]> = {
    CREATED: ['OBSERVING', 'FAILED', 'CANCELLED'],
    OBSERVING: ['UNDERSTANDING', 'FAILED', 'CANCELLED'],
    UNDERSTANDING: ['PLANNING', 'FAILED', 'ESCALATED'],
    PLANNING: ['POLICY_CHECK', 'FAILED', 'ESCALATED'],
    POLICY_CHECK: ['WAITING_APPROVAL', 'EXECUTING', 'FAILED', 'ESCALATED'],
    WAITING_APPROVAL: ['EXECUTING', 'FAILED', 'CANCELLED'],
    EXECUTING: ['VERIFYING', 'FAILED', 'ESCALATED', 'TIMED_OUT', 'BUDGET_EXCEEDED'],
    VERIFYING: ['COMPLETED', 'REPLANNING', 'FAILED', 'ESCALATED'],
    REFLECTING: ['REPLANNING', 'COMPLETED', 'FAILED'],
    REPLANNING: ['POLICY_CHECK', 'FAILED', 'ESCALATED', 'BUDGET_EXCEEDED'],
    COMPLETED: [],
    FAILED: [],
    ESCALATED: ['FAILED', 'CANCELLED'],
    CANCELLED: [],
    TIMED_OUT: ['FAILED', 'ESCALATED'],
    BUDGET_EXCEEDED: ['FAILED', 'ESCALATED'],
  };

  private constructor() {
    this.orchestrator = AIOrchestrator.getInstance();
    this.operationalMemory = OperationalMemory.getInstance();
    this.episodicMemory = EpisodicMemory.getInstance();
    this.semanticMemory = SemanticMemory.getInstance();
    this.institutionalMemory = InstitutionalMemory.getInstance();
    this.toolGateway = ToolGateway.getInstance();
  }

  public static getInstance(): AgentRuntime {
    if (!AgentRuntime.instance) {
      AgentRuntime.instance = new AgentRuntime();
    }
    return AgentRuntime.instance;
  }

  /**
   * Execute an agent task through the full cognitive loop
   */
  async executeAgent(
    agent: AgentDefinition,
    task: string,
    missionId: string,
    context: Record<string, any> = {}
  ): Promise<{
    success: boolean;
    result: string;
    cognitiveTrace: CognitiveLoopContext[];
    costUsd: number;
    latencyMs: number;
  }> {
    const startTime = Date.now();
    const state = this.initState(agent.id, task, missionId);

    console.log(`[AGENT-RUNTIME] Executing agent ${agent.name} for mission ${missionId}`);
    this.recordTransition(missionId, agent.id, 'CREATED', 'OBSERVING', 'mission started', 'system', ['mission_started']);
    state.missionState = 'OBSERVING';

    const cognitiveTrace: CognitiveLoopContext[] = [];
    let loopContext: CognitiveLoopContext = {
      phase: 'PERCEIVE',
      agentId: agent.id,
      missionId,
      task,
      input: context,
      iteration: 0,
      startTime,
    };

    try {
      const phases: CognitiveLoopPhase[] = [
        'PERCEIVE', 'UNDERSTAND', 'RETRIEVE', 'REASON',
        'PLAN', 'SIMULATE', 'ACT', 'VERIFY', 'LEARN',
      ];

      for (const phase of phases) {
        loopContext = { ...loopContext, phase, iteration: loopContext.iteration + 1 };
        console.log(`[COGNITIVE-LOOP] ${agent.name}: Phase ${phase}`);

        loopContext = await this.executePhase(loopContext, agent, context);
        cognitiveTrace.push({ ...loopContext });

        if (phase === 'VERIFY' && loopContext.verification && !loopContext.verification.passed) {
          this.recordTransition(missionId, agent.id, 'VERIFYING', 'FAILED', 'verification failure', 'system', ['verification_failed']);
          state.missionState = 'FAILED';
          state.status = 'FAILED';
          state.error = (loopContext.verification.issues || ['verification failed']).join('; ');
          throw new Error(state.error);
        }
      }

      const resultText = loopContext.actions?.join('\n') || 'Cognitive loop completed';
      const latencyMs = Date.now() - startTime;
      const verificationPassed = loopContext.verification?.passed === true;

      this.episodicMemory.record({
        type: 'AGENT_EXECUTION',
        agentId: agent.id,
        missionId,
        description: `Agent ${agent.name} executed task: ${task}`,
        context: {
          task,
          phases: cognitiveTrace.map(c => c.phase),
          verification: loopContext.verification,
        },
        outcome: resultText,
        importance: 70,
        tags: [agent.domain, missionId],
      });

      this.operationalMemory.record({
        type: 'AGENT_COMPLETED',
        data: { agentId: agent.id, missionId, task, result: resultText.substring(0, 200) },
        ttlMs: 3600000,
      });

      const nextState: MissionState = verificationPassed ? 'COMPLETED' : 'FAILED';
      this.recordTransition(missionId, agent.id, 'VERIFYING', nextState, verificationPassed ? 'mission satisfied verification' : 'verification failed', 'system', ['mission_result']);
      state.missionState = nextState;
      state.status = verificationPassed ? 'COMPLETED' : 'FAILED';
      state.completedAt = new Date().toISOString();

      return {
        success: verificationPassed,
        result: verificationPassed
          ? resultText
          : `Agent execution could not be verified: ${(loopContext.verification?.issues || ['verification did not complete']).join('; ')}`,
        cognitiveTrace,
        costUsd: 0,
        latencyMs,
      };
    } catch (err: any) {
      const msg = err?.message || 'unknown agent failure';
      state.status = 'FAILED';
      state.error = msg;
      if (!state.missionState || state.missionState === 'OBSERVING') {
        state.missionState = 'FAILED';
      }

      this.episodicMemory.record({
        type: 'AGENT_FAILURE',
        agentId: agent.id,
        missionId,
        description: `Agent ${agent.name} failed: ${msg}`,
        context: { task, error: msg },
        importance: 90,
        tags: [agent.domain, 'FAILURE', missionId],
      });

      return {
        success: false,
        result: `Agent execution failed: ${msg}`,
        cognitiveTrace,
        costUsd: 0,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Execute a single cognitive loop phase
   */
  private async executePhase(
    ctx: CognitiveLoopContext,
    agent: AgentDefinition,
    baseContext: Record<string, any>
  ): Promise<CognitiveLoopContext> {
    switch (ctx.phase) {
      case 'PERCEIVE':
        return this.phasePerceive(ctx, agent, baseContext);
      case 'UNDERSTAND':
        return this.phaseUnderstand(ctx, agent);
      case 'RETRIEVE':
        return this.phaseRetrieve(ctx, agent);
      case 'REASON':
        return this.phaseReason(ctx, agent);
      case 'PLAN':
        return this.phasePlan(ctx, agent);
      case 'SIMULATE':
        return this.phaseSimulate(ctx, agent);
      case 'ACT':
        return this.phaseAct(ctx, agent);
      case 'VERIFY':
        return this.phaseVerify(ctx, agent);
      case 'LEARN':
        return this.phaseLearn(ctx, agent);
      default:
        return ctx;
    }
  }

  private async phasePerceive(ctx: CognitiveLoopContext, agent: AgentDefinition, baseContext: Record<string, any>): Promise<CognitiveLoopContext> {
    const perceptions: string[] = [];

    // Gather from operational memory
    const recentOps = this.operationalMemory.query({ type: 'AGENT_COMPLETED', limit: 5 });
    for (const op of recentOps) {
      perceptions.push(`Recent operation: ${JSON.stringify(op.data).substring(0, 200)}`);
    }

    // Gather from episodic memory
    const recentEpisodes = this.episodicMemory.getRecentContext(agent.id, 5);
    for (const ep of recentEpisodes) {
      perceptions.push(`Recent episode: ${ep.description}`);
    }

    // Gather from input context
    for (const [key, value] of Object.entries(baseContext)) {
      perceptions.push(`${key}: ${typeof value === 'string' ? value.substring(0, 200) : JSON.stringify(value).substring(0, 200)}`);
    }

    return { ...ctx, perceptions };
  }

  private async phaseUnderstand(ctx: CognitiveLoopContext, agent: AgentDefinition): Promise<CognitiveLoopContext> {
    const response = await this.orchestrator.executeForMission(
      agent.domain,
      `Understand the following task in context of ${agent.domain}:\n\nTask: ${ctx.task}\n\nPerceptions:\n${(ctx.perceptions || []).join('\n')}\n\nProvide a clear understanding of what needs to be done.`,
      { agentId: agent.id, agentDepth: 0, requiredCapabilities: agent.requiredCapabilities },
      { classification: 'CONFIDENTIAL', requireAudit: false }
    );

    return { ...ctx, understanding: response.text };
  }

  private async phaseRetrieve(ctx: CognitiveLoopContext, agent: AgentDefinition): Promise<CognitiveLoopContext> {
    const retrieved: string[] = [];

    // Search semantic memory for relevant knowledge
    const searchResults = this.semanticMemory.search(ctx.task);
    for (const entity of searchResults.slice(0, 5)) {
      retrieved.push(`Knowledge: ${entity.name} (${entity.type}) - ${JSON.stringify(entity.attributes).substring(0, 200)}`);
    }

    // Search institutional memory for relevant lessons
    const lessons = this.institutionalMemory.findSimilar(agent.domain, agent.requiredCapabilities);
    for (const lesson of lessons.slice(0, 3)) {
      retrieved.push(`Lesson: ${lesson.title} (success rate: ${lesson.successRate}%)`);
    }

    return { ...ctx, retrievedContext: retrieved };
  }

  private async phaseReason(ctx: CognitiveLoopContext, agent: AgentDefinition): Promise<CognitiveLoopContext> {
    const prompt = `You are ${agent.name}, an expert in ${agent.domain}.

Task: ${ctx.task}

Understanding: ${ctx.understanding}

Relevant Context:
${(ctx.retrievedContext || []).join('\n')}

Provide your analysis and reasoning for this task. Consider the evidence, identify key factors, and explain your reasoning step by step.`;

    const response = await this.orchestrator.executeForMission(
      agent.domain,
      prompt,
      { agentId: agent.id, agentDepth: 0, requiredCapabilities: agent.requiredCapabilities },
      { classification: 'CONFIDENTIAL', requireAudit: false }
    );

    return { ...ctx, reasoning: response.text };
  }

  private async phasePlan(ctx: CognitiveLoopContext, agent: AgentDefinition): Promise<CognitiveLoopContext> {
    const prompt = `Based on your analysis, create a concrete action plan:

Analysis: ${ctx.reasoning}

Generate a numbered list of specific actions to take. Each action should be clear, actionable, and directly address the task.`;

    const response = await this.orchestrator.executeForMission(
      agent.domain,
      prompt,
      { agentId: agent.id, agentDepth: 0, requiredCapabilities: agent.requiredCapabilities },
      { classification: 'CONFIDENTIAL', requireAudit: false }
    );

    const plan = response.text.split('\n').filter(line => line.trim().length > 0);
    return { ...ctx, plan };
  }

  private async phaseSimulate(ctx: CognitiveLoopContext, agent: AgentDefinition): Promise<CognitiveLoopContext> {
    const prompt = `Consider the following plan and simulate potential outcomes:

Plan: ${(ctx.plan || []).join('\n')}

For each action, estimate:
1. Expected outcome
2. Potential risks
3. Resource requirements
4. Success probability

Provide a brief simulation summary.`;

    const response = await this.orchestrator.executeForMission(
      agent.domain,
      prompt,
      { agentId: agent.id, agentDepth: 0, requiredCapabilities: agent.requiredCapabilities },
      { classification: 'CONFIDENTIAL', requireAudit: false }
    );

    return { ...ctx, simulation: { summary: response.text } };
  }

  private async phaseAct(ctx: CognitiveLoopContext, agent: AgentDefinition): Promise<CognitiveLoopContext> {
    // Execute actions through tool gateway (with policy enforcement)
    const actions: string[] = [];

    for (const action of (ctx.plan || [])) {
      const toolResult = await this.toolGateway.execute({
        agentId: agent.id,
        agentName: agent.name,
        action: action.substring(0, 100),
        parameters: { task: ctx.task, phase: 'act' },
        allowedTools: agent.allowedTools,
      });

      actions.push(`${action}: ${toolResult.allowed ? 'EXECUTED' : 'BLOCKED - ' + toolResult.reason}`);
    }

    return { ...ctx, actions };
  }

  private async phaseVerify(ctx: CognitiveLoopContext, agent: AgentDefinition): Promise<CognitiveLoopContext> {
    const issues: string[] = [];
    const actions = ctx.actions || [];
    const blockedActions = actions.filter(a => a.includes('BLOCKED'));
    if (blockedActions.length > 0) {
      issues.push(`${blockedActions.length} actions were blocked by policy`);
    }

    if (!ctx.reasoning || ctx.reasoning.length < 50) {
      issues.push('Insufficient reasoning provided');
    }

    if (!ctx.plan || ctx.plan.length === 0) {
      issues.push('No executable plan produced');
    }

    if (!ctx.retrievedContext || ctx.retrievedContext.length === 0) {
      issues.push('No retrieval evidence was consulted');
    }

    const actionCounts = actions.length;
    if (actionCounts === 0) {
      issues.push('No tool or action evidence produced');
    }

    return {
      ...ctx,
      verification: {
        passed: issues.length === 0,
        issues,
      },
    };
  }

  private async phaseLearn(ctx: CognitiveLoopContext, agent: AgentDefinition): Promise<CognitiveLoopContext> {
    const learnings: string[] = [];

    // Record institutional learning
    if (ctx.verification?.passed) {
      this.institutionalMemory.record({
        type: 'SUCCESS',
        domain: agent.domain,
        title: `Successful execution: ${ctx.task.substring(0, 100)}`,
        description: ctx.reasoning || '',
        context: { agentId: agent.id, task: ctx.task },
        outcome: (ctx.actions || []).join('\n'),
        confidence: 80,
        tags: [agent.domain, 'AUTO_LEARNED'],
      });
      learnings.push('Recorded successful execution pattern');
    }

    return { ...ctx, learnings };
  }

  private initState(agentId: string, task: string, missionId: string): AgentState {
    const state: AgentState = {
      agentId,
      status: 'RUNNING',
      currentTask: task,
      currentMissionId: missionId,
      startedAt: new Date().toISOString(),
      iterations: 0,
      maxIterations: 9,
    };
    this.agentStates.set(agentId, state);
    return state;
  }

  /**
   * Get agent state
   */
  getAgentState(agentId: string): AgentState | undefined {
    return this.agentStates.get(agentId);
  }

  /**
   * Get all agent states
   */
  getAllAgentStates(): AgentState[] {
    return Array.from(this.agentStates.values());
  }
}
