import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  AgentAdapterRegistry,
  AgentCapability,
  AgentEligibilityGate,
  AgentEvaluationProfile,
  AtlasAgentDescriptor,
  AgentExecutionContext,
} from '../ai-federation/agents/AgentControlPlane';
import { SkillRegistry } from '../ai-federation/skills/SkillRegistry';

const allowAllChecks = {
  policy: async () => ({ allowed: true }),
  tenant: async () => ({ allowed: true }),
  skills: async () => ({ allowed: true }),
  tools: async () => ({ allowed: true }),
  approval: async () => ({ allowed: true }),
};

async function run(): Promise<void> {
  const gate = new AgentEligibilityGate(allowAllChecks);
  const agent: AtlasAgentDescriptor = {
    id: 'control-agent',
    version: '1.0.0',
    provider: 'atlas',
    model: 'local-model',
    tenantScope: { tenantId: 'tenant-a' },
    capabilities: ['REASONING', 'TOOL_USE'],
    skills: [{ skillId: 'document-analysis', version: '1.0.0' }],
    tools: [{ toolId: 'documents.read' }],
    modelPolicy: { allowedProviders: ['atlas'], allowedModels: ['local-model'] },
    executionPolicy: { autonomous: true, approvalRequired: false },
  };
  const context: AgentExecutionContext = {
    agentId: agent.id,
    task: 'Analyze the supplied document',
    missionId: 'mission-1',
    runId: 'run-1',
    tenantId: 'tenant-a',
    actorId: 'actor-1',
    classification: 'INTERNAL',
    requiredCapabilities: ['REASONING'],
    skillIds: ['document-analysis'],
    toolIds: ['documents.read'],
    data: {},
    traceId: 'trace-1',
  };
  const passingProfile: AgentEvaluationProfile = {
    agentId: agent.id,
    version: agent.version,
    provider: agent.provider,
    model: agent.model!,
    capabilities: ['REASONING', 'TOOL_USE'],
    skillSet: agent.skills,
    evaluationSuite: 'agent-smoke',
    evaluationVersion: '1',
    lastEvaluatedAt: new Date().toISOString(),
    evaluationStatus: 'PASSED',
    riskLevel: 'LOW',
    knownFailures: [],
    approvalRequirements: [],
  };

  assert.equal((await gate.evaluate(agent, undefined, context)).eligible, false, 'unevaluated agents must be blocked');
  assert.equal((await gate.evaluate(agent, { ...passingProfile, evaluationStatus: 'FAILED' }, context)).eligible, false);
  assert.equal((await gate.evaluate(agent, passingProfile, { ...context, tenantId: 'tenant-b' })).eligible, false);
  assert.equal((await gate.evaluate(agent, passingProfile, {
    ...context,
    requiredCapabilities: ['VISION' as AgentCapability],
  })).eligible, false);
  assert.equal((await gate.evaluate(agent, passingProfile, context)).eligible, true);

  const adapterRegistry = new AgentAdapterRegistry();
  const providerStates = adapterRegistry.statuses().concat(AgentAdapterRegistry.unconfiguredProviders());
  assert.deepEqual(providerStates.filter(item => item.provider !== 'atlas').map(item => item.status),
    ['UNAVAILABLE', 'UNAVAILABLE', 'UNAVAILABLE', 'UNAVAILABLE', 'UNAVAILABLE']);

  const root = await mkdtemp(join(tmpdir(), 'atlas-skills-'));
  try {
    const skillDirectory = join(root, 'document-analysis');
    await mkdir(skillDirectory);
    await mkdir(join(skillDirectory, 'references'));
    await writeFile(join(skillDirectory, 'SKILL.md'), [
      '---',
      'name: document-analysis',
      'description: Extract claims and evidence from provided documents',
      'version: 1.0.0',
      'requiresCapabilities: [DOCUMENT_PROCESSING]',
      '---',
      '',
      '1. Use authorized Atlas document retrieval tools only.',
      '2. Record page or section references for each material claim.',
      '3. Separate observed evidence from inference and mark missing sources.',
    ].join('\n'));
    await writeFile(join(skillDirectory, 'references', 'review-guide.md'), 'Record source location and observed text.');

    const registry = new SkillRegistry(root);
    const discovered = await registry.discover();
    assert.equal(discovered.length, 1);
    assert.equal(discovered[0].status, 'DISCOVERED');
    assert.throws(() => registry.activate('document-analysis'), /requires passing/);
    registry.validate('document-analysis');
    registry.recordEvaluation({
      skillId: 'document-analysis',
      version: '1.0.0',
      contentHash: discovered[0].sha256,
      testSuite: 'skill-smoke',
      functionalStatus: 'PASS',
      securityStatus: 'FAIL',
      compatibility: [],
      knownFailures: ['Security evaluation failed'],
    });
    assert.throws(() => registry.activate('document-analysis'), /requires passing/);
    registry.validate('document-analysis');
    registry.recordEvaluation({
      skillId: 'document-analysis',
      version: '1.0.0',
      contentHash: discovered[0].sha256,
      testSuite: 'skill-smoke',
      functionalStatus: 'PASS',
      securityStatus: 'PASS',
      compatibility: [],
      knownFailures: [],
    });
    registry.activate('document-analysis');
    const authorizer = async (_skill: unknown, tenantId: string) => tenantId === 'tenant-a';
    const loaded = await registry.load('document-analysis', 'tenant-a', authorizer, ['DOCUMENT_PROCESSING']);
    assert.match(loaded.instructions, /authorized Atlas document retrieval tools only/);
    await assert.rejects(
      registry.load('document-analysis', 'tenant-a', authorizer),
      /capability requirements/,
    );
    assert.equal(
      (await registry.load('document-analysis', 'tenant-a', authorizer, ['DOCUMENT_PROCESSING'])).metadata.name,
      'document-analysis',
    );
    await assert.rejects(
      registry.load('document-analysis', 'tenant-b', authorizer, ['DOCUMENT_PROCESSING']),
      /not authorized/,
    );
    await assert.rejects(
      registry.loadResource('document-analysis', '..\\outside.txt', 'tenant-a', authorizer),
      /cannot traverse/,
    );
    assert.equal(await registry.loadResource('document-analysis', 'references/review-guide.md', 'tenant-a', authorizer),
      'Record source location and observed text.');

    await writeFile(join(skillDirectory, 'SKILL.md'), '---\nname: document-analysis\ndescription: Changed after evaluation\n---\nChanged');
    await assert.rejects(
      registry.load('document-analysis', 'tenant-a', authorizer, ['DOCUMENT_PROCESSING']),
      /changed after validation/,
    );
    assert.equal(registry.get('document-analysis')?.status, 'RESTRICTED');
    const changed = await registry.discover();
    assert.equal(changed[0].status, 'DISCOVERED');
    registry.validate('document-analysis');
    await assert.rejects(
      Promise.resolve().then(() => registry.recordEvaluation({
        skillId: 'document-analysis',
        version: '1.0.0',
        contentHash: discovered[0].sha256,
        testSuite: 'skill-smoke',
        functionalStatus: 'PASS',
        securityStatus: 'PASS',
        compatibility: [],
        knownFailures: [],
      })),
      /content hash does not match/,
    );
    registry.revoke('document-analysis');
    assert.equal(registry.get('document-analysis')?.status, 'REVOKED');
  } finally {
    await rm(root, { recursive: true, force: true });
  }

  console.log('Agent control-plane contract and skill registry tests passed');
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
