export type AgentCapability =
  | 'REASONING'
  | 'PLANNING'
  | 'TOOL_USE'
  | 'HANDOFF'
  | 'DELEGATION'
  | 'MEMORY'
  | 'RETRIEVAL'
  | 'RAG'
  | 'CODE_EXECUTION'
  | 'FILE_OPERATION'
  | 'BROWSER'
  | 'COMPUTER_USE'
  | 'MULTIMODAL'
  | 'DOCUMENT_PROCESSING'
  | 'STRUCTURED_OUTPUT'
  | 'STREAMING'
  | 'BACKGROUND_EXECUTION'
  | 'LONG_RUNNING_EXECUTION'
  | 'HUMAN_APPROVAL'
  | 'WORKFLOW_EXECUTION'
  | 'SELF_EVALUATION'
  | 'SKILL_EXECUTION'
  | 'MCP'
  | 'A2A';

export type AdapterStatus =
  | 'AVAILABLE'
  | 'CONFIGURED'
  | 'HEALTHY'
  | 'UNAVAILABLE'
  | 'UNVERIFIED'
  | 'DISABLED';

export type AgentEvaluationStatus =
  | 'UNEVALUATED'
  | 'EVALUATING'
  | 'PASSED'
  | 'PASSED_WITH_RESTRICTIONS'
  | 'FAILED'
  | 'EXPIRED'
  | 'REVOKED';

export type AgentRunStatus = 'SUCCEEDED' | 'FAILED' | 'BLOCKED';

export interface TenantScope {
  tenantId: string;
  allowedTenantIds?: string[];
}

export interface SkillRef {
  skillId: string;
  version: string;
}

export interface ToolRef {
  toolId: string;
  version?: string;
}

export interface ModelPolicy {
  allowedProviders: string[];
  allowedModels?: string[];
}

export interface ExecutionPolicy {
  autonomous: boolean;
  approvalRequired: boolean;
  maxRuntimeMs?: number;
  maxToolCalls?: number;
  maxTokens?: number;
  maxCostUsd?: number;
}

export interface AtlasAgentDescriptor {
  id: string;
  version: string;
  provider: string;
  model?: string;
  tenantScope: TenantScope;
  capabilities: AgentCapability[];
  skills: SkillRef[];
  tools: ToolRef[];
  modelPolicy: ModelPolicy;
  executionPolicy: ExecutionPolicy;
}

export interface AgentExecutionContext {
  agentId: string;
  task: string;
  missionId: string;
  runId: string;
  tenantId: string;
  actorId: string;
  classification: string;
  requiredCapabilities: AgentCapability[];
  skillIds: string[];
  toolIds: string[];
  data: Record<string, unknown>;
  traceId: string;
}

export interface AgentExecutionResult {
  agentId: string;
  agentVersion: string;
  provider: string;
  model: string;
  missionId: string;
  runId: string;
  status: AgentRunStatus;
  output: unknown;
  toolCalls: Array<{ toolId: string; evidenceRef?: string }>;
  handoffs: Array<{ agentId: string; runId: string }>;
  skillInvocations: string[];
  evidenceRefs: string[];
  usage: { inputTokens?: number; outputTokens?: number; costUsd?: number };
  latencyMs: number;
  errors: string[];
  traceId: string;
}

export interface AtlasAgent {
  descriptor: AtlasAgentDescriptor;
  execute(context: AgentExecutionContext): Promise<AgentExecutionResult>;
}

export interface AtlasAgentRequest {
  agentId: string;
  agentVersion: string;
  execution: AgentExecutionContext;
}

export type AtlasAgentResponse = AgentExecutionResult;

export interface AgentAdapter {
  readonly provider: string;
  readonly status: AdapterStatus;
  readonly supportedCapabilities: AgentCapability[];
  execute(request: AtlasAgentRequest): Promise<AtlasAgentResponse>;
}

export interface AgentEvaluationProfile {
  agentId: string;
  version: string;
  provider: string;
  model: string;
  capabilities: AgentCapability[];
  skillSet: SkillRef[];
  evaluationSuite: string;
  evaluationVersion: string;
  lastEvaluatedAt?: string;
  evaluationStatus: AgentEvaluationStatus;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  knownFailures: string[];
  approvalRequirements: string[];
  expiresAt?: string;
}

export interface EligibilityCheck {
  allowed: boolean;
  reason?: string;
}

export interface AgentGateChecks {
  policy(agent: AtlasAgentDescriptor, context: AgentExecutionContext): Promise<EligibilityCheck>;
  tenant(agent: AtlasAgentDescriptor, context: AgentExecutionContext): Promise<EligibilityCheck>;
  skills(agent: AtlasAgentDescriptor, context: AgentExecutionContext): Promise<EligibilityCheck>;
  tools(agent: AtlasAgentDescriptor, context: AgentExecutionContext): Promise<EligibilityCheck>;
  approval(agent: AtlasAgentDescriptor, context: AgentExecutionContext): Promise<EligibilityCheck>;
}

export interface AgentEligibilityDecision {
  eligible: boolean;
  reason: string;
  checks: string[];
}

export interface AgentRuntimeHealth {
  provider: string;
  sdk: string;
  sdkVersion?: string;
  adapterVersion: string;
  supportedCapabilities: AgentCapability[];
  status: AdapterStatus;
  lastHealthCheck?: string;
  lastEvaluation?: string;
  knownIssues: string[];
}

export type EvalStatus = 'PASSED' | 'FAILED' | 'BLOCKED' | 'ERROR';

export interface EvalAssertion {
  id: string;
  description: string;
  evaluate(observation: EvalObservation): boolean;
}

export interface EvalMetric {
  name: string;
  value: number;
  unit?: string;
}

export interface EvalCase {
  id: string;
  input: unknown;
  assertions: EvalAssertion[];
  expected?: unknown;
}

export interface EvalSuite {
  id: string;
  version: string;
  subjectType: 'MODEL' | 'AGENT' | 'SKILL' | 'TOOL' | 'WORKFLOW' | 'MISSION';
  cases: EvalCase[];
}

export interface EvalObservation {
  output: unknown;
  traceRef?: string;
  evidenceRefs: string[];
  metrics: EvalMetric[];
}

export interface EvalFailure {
  caseId: string;
  assertionId: string;
  message: string;
}

export interface EvalArtifact {
  id: string;
  mediaType: string;
  uri: string;
  sha256: string;
}

export interface EvalDecision {
  eligible: boolean;
  status: AgentEvaluationStatus;
  reasons: string[];
}

export interface EvalRun {
  evaluationId: string;
  subjectId: string;
  subjectVersion: string;
  suiteVersion: string;
  caseId: string;
  timestamp: string;
  environment: string;
  inputHash: string;
  expected?: unknown;
  actual: unknown;
  metrics: EvalMetric[];
  traceRef?: string;
  evidenceRefs: string[];
  status: EvalStatus;
  failures: EvalFailure[];
  artifacts: EvalArtifact[];
  decision?: EvalDecision;
}

export class AgentAdapterRegistry {
  private readonly adapters = new Map<string, AgentAdapter>();

  register(adapter: AgentAdapter): void {
    this.adapters.set(adapter.provider, adapter);
  }

  get(provider: string): AgentAdapter | undefined {
    return this.adapters.get(provider);
  }

  list(): AgentAdapter[] {
    return Array.from(this.adapters.values());
  }

  statuses(): AgentRuntimeHealth[] {
    return this.list().map(adapter => ({
      provider: adapter.provider,
      sdk: adapter.provider === 'atlas' ? 'Atlas AgentRuntime' : 'unconfigured',
      adapterVersion: '1',
      supportedCapabilities: [...adapter.supportedCapabilities],
      status: adapter.status,
      knownIssues: adapter.status === 'UNVERIFIED' ? ['Runtime behavior has not passed adapter evaluation'] : [],
    }));
  }

  static unconfiguredProviders(): AgentRuntimeHealth[] {
    return ['openai', 'anthropic', 'google', 'microsoft', 'ollama'].map(provider => ({
      provider,
      sdk: 'unconfigured',
      adapterVersion: '0',
      supportedCapabilities: [],
      status: 'UNAVAILABLE',
      knownIssues: ['No compatible Agent SDK adapter is configured'],
    }));
  }
}

export class AgentEligibilityGate {
  constructor(private readonly checks: AgentGateChecks) {}

  async evaluate(
    agent: AtlasAgentDescriptor,
    profile: AgentEvaluationProfile | undefined,
    context: AgentExecutionContext
  ): Promise<AgentEligibilityDecision> {
    if (!profile) return this.block('Agent has no evaluation profile');
    if (agent.tenantScope.tenantId !== context.tenantId
      && !agent.tenantScope.allowedTenantIds?.includes(context.tenantId)) {
      return this.block('Agent is outside the requested tenant scope');
    }
    if (profile.agentId !== agent.id || profile.version !== agent.version) {
      return this.block('Evaluation profile does not match the agent version');
    }
    if (profile.provider !== agent.provider || profile.model !== (agent.model || '')) {
      return this.block('Evaluation profile does not match the configured provider and model');
    }
    if (!profile.lastEvaluatedAt || !Number.isFinite(Date.parse(profile.lastEvaluatedAt))) {
      return this.block('Agent evaluation profile has no valid evaluation timestamp');
    }
    if (context.requiredCapabilities.some(capability => !profile.capabilities.includes(capability))) {
      return this.block('Evaluation profile does not cover all required capabilities');
    }
    if (context.skillIds.some(id => !profile.skillSet.some(skill => skill.skillId === id
      && agent.skills.some(declared => declared.skillId === id && declared.version === skill.version)))) {
      return this.block('Evaluation profile does not cover all requested skill versions');
    }
    if (profile.evaluationStatus !== 'PASSED' && profile.evaluationStatus !== 'PASSED_WITH_RESTRICTIONS') {
      return this.block(`Agent evaluation status is ${profile.evaluationStatus}`);
    }
    if (profile.expiresAt) {
      const expiresAt = Date.parse(profile.expiresAt);
      if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
        return this.block('Agent evaluation profile has expired or has an invalid expiry');
      }
    }
    if (agent.executionPolicy.autonomous && profile.evaluationStatus !== 'PASSED') {
      return this.block('Restricted evaluation profiles cannot run autonomously');
    }
    if (context.requiredCapabilities.some(capability => !agent.capabilities.includes(capability))) {
      return this.block('Agent does not declare all required capabilities');
    }
    if (context.skillIds.some(id => !agent.skills.some(skill => skill.skillId === id))) {
      return this.block('Agent does not declare all requested skills');
    }
    if (context.toolIds.some(id => !agent.tools.some(tool => tool.toolId === id))) {
      return this.block('Agent does not declare all requested tools');
    }
    if (!agent.modelPolicy.allowedProviders.includes(agent.provider)
      || (agent.modelPolicy.allowedModels && (!agent.model || !agent.modelPolicy.allowedModels.includes(agent.model)))) {
      return this.block('Configured provider or model violates the agent model policy');
    }

    const orderedChecks: Array<[string, (agent: AtlasAgentDescriptor, context: AgentExecutionContext) => Promise<EligibilityCheck>]> = [
      ['policy', this.checks.policy],
      ['tenant authorization', this.checks.tenant],
      ['skill authorization', this.checks.skills],
      ['tool authorization', this.checks.tools],
      ['approval', this.checks.approval],
    ];
    const passed: string[] = [];
    for (const [name, check] of orderedChecks) {
      const result = await check(agent, context);
      if (!result.allowed) return { eligible: false, reason: result.reason || `${name} denied`, checks: [...passed, `${name}: denied`] };
      passed.push(`${name}: passed`);
    }

    return { eligible: true, reason: 'Evaluation, capability, tenant, policy, skill, tool, and approval gates passed', checks: passed };
  }

  private block(reason: string): AgentEligibilityDecision {
    return { eligible: false, reason, checks: [] };
  }
}

export interface AgentTrace {
  missionId: string;
  traceId: string;
  runId: string;
  agentId: string;
  agentVersion: string;
  provider: string;
  sdk: string;
  model: string;
  skillIds: string[];
  toolIds: string[];
  workflowId?: string;
  policyDecision: string;
  approvalDecision: string;
  events: string[];
  evidenceRefs: string[];
  evaluationRefs: string[];
  latencyMs: number;
  usage: AgentExecutionResult['usage'];
  status: AgentRunStatus;
}

export interface AtlasRuntimeAgentDefinition {
  id: string;
  name: string;
  description: string;
  agentClass: 'MISSION' | 'DOMAIN' | 'UTILITY';
  domain: string;
  requiredCapabilities: string[];
  providedCapabilities: string[];
  autonomyLevel: 'L0_AUTONOMOUS' | 'L1_RECOMMEND' | 'L2_SUPERVISED' | 'L3_APPROVAL_REQUIRED';
  allowedTools: string[];
  memoryAccess: string[];
  systemPrompt: string;
}

export interface AtlasRuntimeBridge {
  executeAgent(
    agent: AtlasRuntimeAgentDefinition,
    task: string,
    missionId: string,
    context: Record<string, unknown>
  ): Promise<{ success: boolean; result: string; costUsd: number; latencyMs: number }>;
}

export class AgentOrchestrator {
  constructor(
    private readonly adapters: AgentAdapterRegistry,
    private readonly gate: AgentEligibilityGate,
    private readonly profiles: Map<string, AgentEvaluationProfile>,
    private readonly agents: Map<string, AtlasAgentDescriptor>,
    private readonly recordTrace: (trace: AgentTrace) => Promise<void>
  ) {}

  async execute(context: AgentExecutionContext): Promise<AgentExecutionResult> {
    const agent = this.agents.get(context.agentId);
    if (!agent) throw new Error(`No agent registered for ${context.agentId}`);

    const adapter = this.adapters.get(agent.provider);
    if (!adapter || !['AVAILABLE', 'CONFIGURED', 'HEALTHY'].includes(adapter.status)) {
      await this.persistTrace(agent, context, agent.provider, 'NOT_EVALUATED', 'NOT_CHECKED', ['adapter_unavailable'], 'BLOCKED');
      throw new Error(`Agent provider ${agent.provider} is unavailable`);
    }
    if (context.requiredCapabilities.some(capability => !adapter.supportedCapabilities.includes(capability))) {
      await this.persistTrace(agent, context, adapter.provider, 'NOT_EVALUATED', 'NOT_CHECKED', ['capability_mismatch'], 'BLOCKED');
      throw new Error(`Agent adapter ${agent.provider} does not support all required capabilities`);
    }

    let decision: AgentEligibilityDecision;
    try {
      decision = await this.gate.evaluate(agent, this.profiles.get(agent.id), context);
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Eligibility checks failed';
      await this.persistTrace(agent, context, adapter.provider, reason, 'NOT_CHECKED', ['eligibility_check_error'], 'BLOCKED');
      throw error;
    }
    if (!decision.eligible) {
      await this.persistTrace(agent, context, adapter.provider, decision.reason, 'DENIED', ['eligibility_blocked'], 'BLOCKED');
      throw new Error(`Agent execution blocked: ${decision.reason}`);
    }

    const startedAt = Date.now();
    let response: AtlasAgentResponse;
    try {
      response = await adapter.execute({
        agentId: agent.id,
        agentVersion: agent.version,
        execution: context,
      });
    } catch (error) {
      await this.persistTrace(agent, context, adapter.provider, decision.reason,
        agent.executionPolicy.approvalRequired ? 'APPROVED' : 'NOT_REQUIRED',
        ['eligibility_passed', 'execution_failed'], 'FAILED', Date.now() - startedAt);
      throw error;
    }
    if (!response || !['SUCCEEDED', 'FAILED', 'BLOCKED'].includes(response.status)) {
      await this.persistTrace(agent, context, adapter.provider, decision.reason,
        agent.executionPolicy.approvalRequired ? 'APPROVED' : 'NOT_REQUIRED',
        ['eligibility_passed', 'invalid_adapter_response'], 'FAILED', Date.now() - startedAt);
      throw new Error(`Agent adapter ${adapter.provider} returned an invalid execution status`);
    }
    const normalized: AgentExecutionResult = {
      ...response,
      agentId: agent.id,
      agentVersion: agent.version,
      provider: agent.provider,
      model: agent.model || response.model || '',
      missionId: context.missionId,
      runId: context.runId,
      traceId: context.traceId,
      latencyMs: response.latencyMs || Date.now() - startedAt,
      toolCalls: response.toolCalls || [],
      handoffs: response.handoffs || [],
      skillInvocations: response.skillInvocations || [],
      evidenceRefs: response.evidenceRefs || [],
      usage: response.usage || {},
      errors: response.errors || [],
    };
    await this.persistTrace(agent, context, adapter.provider, decision.reason,
      agent.executionPolicy.approvalRequired ? 'APPROVED' : 'NOT_REQUIRED',
      ['eligibility_passed', normalized.status === 'SUCCEEDED' ? 'execution_completed' : 'execution_not_succeeded'],
      normalized.status, normalized.latencyMs, normalized);
    return normalized;
  }

  private async persistTrace(
    agent: AtlasAgentDescriptor,
    context: AgentExecutionContext,
    sdk: string,
    policyDecision: string,
    approvalDecision: string,
    events: string[],
    status: AgentRunStatus,
    latencyMs = 0,
    result?: AgentExecutionResult
  ): Promise<void> {
    const profile = this.profiles.get(agent.id);
    await this.recordTrace({
      missionId: context.missionId,
      traceId: context.traceId,
      runId: context.runId,
      agentId: agent.id,
      agentVersion: agent.version,
      provider: agent.provider,
      sdk,
      model: agent.model || result?.model || '',
      skillIds: context.skillIds,
      toolIds: context.toolIds,
      policyDecision,
      approvalDecision,
      events,
      evidenceRefs: result?.evidenceRefs || [],
      evaluationRefs: profile ? [profile.evaluationSuite] : [],
      latencyMs,
      usage: result?.usage || {},
      status,
    });
  }
}

export class AtlasNativeAdapter implements AgentAdapter {
  readonly provider = 'atlas';
  readonly status: AdapterStatus = 'UNVERIFIED';
  readonly supportedCapabilities: AgentCapability[] = ['REASONING', 'PLANNING', 'TOOL_USE', 'MEMORY', 'RETRIEVAL'];

  constructor(
    private readonly definitions: Map<string, AtlasRuntimeAgentDefinition>,
    private readonly runtime: AtlasRuntimeBridge
  ) {}

  async execute(request: AtlasAgentRequest): Promise<AtlasAgentResponse> {
    const definition = this.definitions.get(request.agentId);
    if (!definition) throw new Error(`Atlas AgentRuntime definition not found for ${request.agentId}`);
    const result = await this.runtime.executeAgent(
      definition,
      request.execution.task,
      request.execution.missionId,
      request.execution.data
    );
    return {
      agentId: request.agentId,
      agentVersion: request.agentVersion,
      provider: this.provider,
      model: '',
      missionId: request.execution.missionId,
      runId: request.execution.runId,
      status: result.success ? 'SUCCEEDED' : 'FAILED',
      output: result.result,
      toolCalls: [],
      handoffs: [],
      skillInvocations: [],
      evidenceRefs: [],
      usage: { costUsd: result.costUsd },
      latencyMs: result.latencyMs,
      errors: result.success ? [] : [result.result],
      traceId: request.execution.traceId,
    };
  }
}
