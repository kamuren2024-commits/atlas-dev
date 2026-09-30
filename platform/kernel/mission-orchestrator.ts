import { AtlasAgent, AtlasMission, AtlasModel, AtlasSkill, AtlasTool, AtlasWorkflow, MissionStatus, assertMissionTransition } from './contracts';

export interface MissionResolution {
  agent?: AtlasAgent;
  model?: AtlasModel;
  skills: AtlasSkill[];
  tools: AtlasTool[];
  workflow?: AtlasWorkflow;
  policy: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL' | 'REQUIRE_REVIEW';
  reasons: string[];
}

export interface MissionKernelDependencies {
  resolveAgent: (mission: AtlasMission) => Promise<AtlasAgent | undefined>;
  resolveModel: (mission: AtlasMission, agent: AtlasAgent) => Promise<AtlasModel | undefined>;
  resolveSkills: (mission: AtlasMission, agent: AtlasAgent) => Promise<AtlasSkill[]>;
  resolveTools?: (mission: AtlasMission, agent: AtlasAgent) => Promise<AtlasTool[]>;
  resolveWorkflow?: (mission: AtlasMission) => Promise<AtlasWorkflow | undefined>;
  evaluatePolicy: (mission: AtlasMission, resolution: MissionResolution) => Promise<MissionResolution['policy']>;
  persist: (mission: AtlasMission) => Promise<void>;
  emit?: (event: {
    eventType: string;
    tenantId: string;
    missionId: string;
    traceId: string;
    actorId: string;
    payload: Record<string, unknown>;
  }) => Promise<void>;
  audit?: (record: {
    action: string;
    tenantId: string;
    missionId: string;
    traceId: string;
    actorId: string;
    outcome: 'SUCCESS' | 'DENIED' | 'FAILED';
    details: Record<string, unknown>;
  }) => Promise<void>;
}

const DENY_ELIGIBILITY = new Set(['FAILED', 'REVOKED', 'EXPIRED', 'UNVERIFIED']);
const createId = (): string => {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

export class AtlasMissionOrchestrator {
  constructor(private readonly dependencies: MissionKernelDependencies) {}

  async create(input: Omit<AtlasMission, 'id' | 'version' | 'createdAt' | 'updatedAt' | 'status' | 'metadata'>): Promise<AtlasMission> {
    const now = new Date().toISOString();
    const mission: AtlasMission = {
      ...input,
      id: createId(),
      version: '1.0',
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now,
      metadata: { traceId: createId(), classification: input.classification },
    };
    await this.dependencies.persist(mission);
    await this.dependencies.emit?.({
      eventType: 'MISSION_CREATED',
      tenantId: mission.tenantId,
      missionId: mission.id,
      traceId: mission.metadata.traceId as string,
      actorId: mission.principalId,
      payload: { objective: mission.objective },
    });
    return mission;
  }

  async plan(mission: AtlasMission): Promise<{ mission: AtlasMission; resolution: MissionResolution }> {
    this.transition(mission, 'PLANNED');
    const agent = await this.dependencies.resolveAgent(mission);
    if (!agent || DENY_ELIGIBILITY.has(agent.evaluationStatus)) {
      return this.block(mission, 'AGENT_UNAVAILABLE_OR_UNVERIFIED');
    }
    const model = await this.dependencies.resolveModel(mission, agent);
    if (!model || DENY_ELIGIBILITY.has(model.evaluationStatus)) {
      return this.block(mission, 'MODEL_UNAVAILABLE_OR_UNVERIFIED');
    }
    const skills = await this.dependencies.resolveSkills(mission, agent);
    if (skills.length !== mission.skillRequirements.length || skills.some(skill => DENY_ELIGIBILITY.has(skill.evaluationStatus))) {
      return this.block(mission, 'SKILL_UNAVAILABLE_OR_UNVERIFIED');
    }
    const tools = await this.dependencies.resolveTools?.(mission, agent) ?? [];
    if (tools.length !== mission.toolRequirements.length || tools.some(tool => tool.status === 'REVOKED' || tool.status === 'BLOCKED')) {
      return this.block(mission, 'TOOL_UNAVAILABLE_OR_UNAUTHORIZED');
    }
    const workflow = await this.dependencies.resolveWorkflow?.(mission);
    if (mission.workflowId && !workflow) return this.block(mission, 'WORKFLOW_UNAVAILABLE');
    this.transition(mission, 'POLICY_REVIEW');
    const resolution: MissionResolution = { agent, model, skills, tools, workflow, policy: 'DENY', reasons: [] };
    resolution.policy = await this.dependencies.evaluatePolicy(mission, resolution);
    if (resolution.policy === 'DENY' || resolution.policy === 'REQUIRE_REVIEW') return this.block(mission, `POLICY_${resolution.policy}`);
    if (resolution.policy === 'REQUIRE_APPROVAL') this.transition(mission, 'APPROVAL_REQUIRED');
    else this.transition(mission, 'APPROVED');
    await this.dependencies.persist(mission);
    await this.dependencies.emit?.({
      eventType: resolution.policy === 'REQUIRE_APPROVAL' ? 'APPROVAL_REQUESTED' : 'MISSION_APPROVED',
      tenantId: mission.tenantId,
      missionId: mission.id,
      traceId: mission.metadata.traceId as string,
      actorId: mission.principalId,
      payload: { agentId: agent.id, modelId: model.id, skillIds: skills.map(skill => skill.id), toolIds: tools.map(tool => tool.id) },
    });
    return { mission, resolution };
  }

  transition(mission: AtlasMission, target: MissionStatus): void {
    assertMissionTransition(mission.status, target);
    mission.status = target;
    mission.updatedAt = new Date().toISOString();
  }

  private async block(mission: AtlasMission, reason: string): Promise<{ mission: AtlasMission; resolution: MissionResolution }> {
    if (mission.status !== 'BLOCKED') this.transition(mission, 'BLOCKED');
    mission.metadata = { ...mission.metadata, labels: { ...(mission.metadata.labels || {}), blockReason: reason } };
    await this.dependencies.persist(mission);
    await this.dependencies.audit?.({
      action: 'MISSION_BLOCKED',
      tenantId: mission.tenantId,
      missionId: mission.id,
      traceId: mission.metadata.traceId as string,
      actorId: mission.principalId,
      outcome: 'DENIED',
      details: { reason },
    });
    return { mission, resolution: { skills: [], tools: [], policy: 'DENY', reasons: [reason] } };
  }
}
