import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AtlasMission, AtlasMissionOrchestrator } from './index';

function missionInput() {
  return {
    tenantId: 'tenant-a',
    principalId: 'principal-a',
    objective: 'Verify a supplied fact',
    constraints: {},
    classification: 'INTERNAL',
    context: {},
    agentRequirements: ['reasoning'],
    skillRequirements: ['evidence-verification'],
    toolRequirements: [],
    policyContext: {},
    approvalRequirements: [],
    evidenceRefs: [],
    evaluationRefs: [],
  };
}

function orchestrator(overrides: Partial<ConstructorParameters<typeof AtlasMissionOrchestrator>[0]> = {}) {
  const agent = { id: 'agent-a', evaluationStatus: 'PASSED', capabilities: ['reasoning'] } as AtlasMission['metadata'] & any;
  const model = { id: 'model-a', evaluationStatus: 'PASSED' } as any;
  const skill = { id: 'evidence-verification', evaluationStatus: 'PASSED' } as any;
  return new AtlasMissionOrchestrator({
    resolveAgent: async () => agent,
    resolveModel: async () => model,
    resolveSkills: async () => [skill],
    resolveTools: async () => [],
    evaluatePolicy: async () => 'ALLOW',
    persist: async () => undefined,
    ...overrides,
  });
}

describe('AtlasMissionOrchestrator', () => {
  it('blocks unverified models before approval or execution', async () => {
    const kernel = orchestrator({
      resolveModel: async () => ({ id: 'model-a', evaluationStatus: 'UNVERIFIED' } as any),
    });
    const mission = await kernel.create(missionInput());
    const result = await kernel.plan(mission);
    assert.equal(result.mission.status, 'BLOCKED');
    assert.ok(result.resolution.reasons.includes('MODEL_UNAVAILABLE_OR_UNVERIFIED'));
  });

  it('rejects invalid terminal-state transitions', async () => {
    const kernel = orchestrator();
    const mission = await kernel.create(missionInput());
    kernel.transition(mission, 'PLANNED');
    assert.throws(() => kernel.transition(mission, 'COMPLETED'), /MISSION_INVALID_TRANSITION/);
  });

  it('requires approval when policy requires it', async () => {
    const kernel = orchestrator({ evaluatePolicy: async () => 'REQUIRE_APPROVAL' });
    const mission = await kernel.create(missionInput());
    const result = await kernel.plan(mission);
    assert.equal(result.mission.status, 'APPROVAL_REQUIRED');
  });

  it('blocks missing required tools before policy evaluation', async () => {
    let evaluated = false;
    const kernel = orchestrator({
      resolveTools: async () => [],
      evaluatePolicy: async () => {
        evaluated = true;
        return 'ALLOW';
      },
    });
    const mission = await kernel.create({ ...missionInput(), toolRequirements: ['write-tool'] });
    const result = await kernel.plan(mission);
    assert.equal(result.mission.status, 'BLOCKED');
    assert.equal(evaluated, false);
    assert.ok(result.resolution.reasons.includes('TOOL_UNAVAILABLE_OR_UNAUTHORIZED'));
  });
});
