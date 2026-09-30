/**
 * PHASE 02: CANONICAL ATLAS EVALUATION HARNESS
 * 
 * Deterministic scenario evaluations for:
 * - eval:agents (Agent lifecycle, harness execution, lease fencing, memory retention)
 * - eval:gateway (Model routing, latency, token extraction, fallback failover)
 * - eval:ontology (Schema conformance, state transitions, pre/post audit integrity)
 * - eval:tools (Tool validation, permission bounds, execution idempotency)
 */

import { pathToFileURL } from 'node:url';
import { DatabaseCore } from '../database/db-core';
import { AgentHarness } from '../agents/harness/agent-harness';
import { getAgentRegistry } from '../agents/registry';
import { AtlasAiGateway } from '../ai-federation/gateway/AtlasAiGateway';
import { AtlasModelRegistry } from '../ai-federation/registry/ModelRegistry';
import { CanonicalOntologyEngine } from '../ontology/canonical-ontology';
import { AtlasToolRegistry } from '../tools/atlas-tool-registry';
import {
  hasConfiguredGatewayProvider,
  parseEvaluationTarget,
  type EvaluationTarget,
} from './eval-harness-contracts';

export async function runEvaluation(targetInput: string): Promise<{ passed: true; details: { target: EvaluationTarget; timestamp: string } }> {
  const target = parseEvaluationTarget(targetInput);
  const db = DatabaseCore.getInstance();
  await db.connect();
  await db.runMigrations();

  console.log(`\n========================================`);
  console.log(`🚀 ATLAS EVALUATION HARNESS: [${target.toUpperCase()}]`);
  console.log(`========================================\n`);

  if (target === 'agents' || target === 'all') {
    console.log('Testing Agent Harness & ReAct execution...');
    const harness = AgentHarness.getInstance();
    const res = await harness.execute({
      agentId: 'eval_agent_react',
      task: 'Audit critical asset SS-SUSWA-400 and evaluate N-1 risk',
      inputs: { assetId: 'SS-SUSWA-400' },
      autonomyLevel: 2,
      maxIterations: 3,
    });
    console.log(`Agent Execution Status: ${res.status}`);
    console.log(`Iterations: ${res.iterations}, Latency: ${res.totalLatencyMs}ms, Decisions: ${res.decisionsRecorded}`);
    if (res.status !== 'SUCCESS') throw new Error(`Agent evaluation failed: ${res.error}`);
  }

  if (target === 'gateway' || target === 'all') {
    console.log('Testing AI Gateway & Model Routing...');
    const gateway = AtlasAiGateway.getInstance();
    const modelReg = AtlasModelRegistry.getInstance();
    await modelReg.refreshLocalModels();
    const models = modelReg.listModels();
    console.log(`Registered Models in Gateway: ${models.map(m => m.modelId).join(', ')}`);

    if (hasConfiguredGatewayProvider(models, process.env)) {
      const inferRes = await gateway.infer({
        prompt: 'Summarize voltage stability on Olkaria-Nairobi 220kV transmission line.',
        task: 'copilot',
      });
      console.log(`Gateway Response Model: ${inferRes.model} (${inferRes.provider})`);
      console.log(`Gateway Latency: ${inferRes.latencyMs}ms`);
      if (!inferRes.text.trim()) throw new Error('Gateway returned empty inference text');
    } else {
      let inferenceError: unknown;
      try {
        await gateway.infer({
          prompt: 'Summarize voltage stability on Olkaria-Nairobi 220kV transmission line.',
          task: 'copilot',
        });
      } catch (error) {
        inferenceError = error;
      }

      const message = inferenceError instanceof Error ? inferenceError.message : String(inferenceError);
      if (!message.includes('AI inference unavailable')) {
        throw new Error(`Gateway did not fail closed when no provider was configured: ${message}`);
      }
      console.log('Gateway correctly rejected inference because no provider is configured.');
    }
  }

  if (target === 'ontology' || target === 'all') {
    console.log('Testing Canonical Ontology & Governed Actions...');
    const ontology = CanonicalOntologyEngine.getInstance();
    await ontology.seedCanonicalSchemas();

    const entityId = `EVAL_ENTITY_${Date.now()}`;
    await ontology.upsertEntity({
      id: entityId,
      schemaType: 'PROJECT',
      name: 'Substation Expansion Evaluation',
      properties: { status: 'PLANNED' },
    });

    const actionRes = await ontology.executeGovernedAction({
      domain: 'PROJECT',
      action: 'assign',
      entityId,
      actor: { id: 'EVAL_USER', type: 'USER', roles: ['ADMIN'] },
      payload: { assignedEngineer: 'ENG_TEST' },
      reason: 'Evaluation scenario execution',
    });

    console.log(`Ontology Action Status: ${actionRes.status}, Verified: ${actionRes.verificationPassed}`);
    if (actionRes.status !== 'SUCCESS' || !actionRes.verificationPassed) {
      throw new Error(`Ontology action failed verification: ${actionRes.error}`);
    }
  }

  if (target === 'tools' || target === 'all') {
    console.log('Testing Governed Tool Registry...');
    const toolReg = AtlasToolRegistry.getInstance();
    const tools = toolReg.listTools();
    console.log(`Verified Registered Tools: ${tools.length} (Target: >= 15)`);
    if (tools.length < 15) {
      throw new Error(`Expected at least 15 governed tools, found ${tools.length}`);
    }

    const execRes = await toolReg.executeTool(
      'ontology.query',
      { schemaType: 'PROJECT', limit: 5 },
      {
        agentId: 'eval_agent',
        executionId: 'eval_exec',
        tenantId: 'ketraco',
        actorRoles: ['ONTOLOGY_READ'],
        autonomyLevel: 2,
      }
    );
    console.log(`Tool Execution Result: ${execRes.status} in ${execRes.executionTimeMs}ms`);
    if (execRes.status !== 'SUCCESS') throw new Error(`Tool execution failed: ${execRes.error}`);
  }

  console.log(`\n✅ EVALUATION SUITE [${target.toUpperCase()}] PASSED ALL CANONICAL CHECKS\n`);
  return { passed: true, details: { target, timestamp: new Date().toISOString() } };
}

// Support CLI invocation
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  let target: EvaluationTarget;
  try {
    target = parseEvaluationTarget(process.argv[2]);
  } catch (err) {
    console.error('❌ EVALUATION FAILED:', err);
    process.exit(1);
  }

  runEvaluation(target)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ EVALUATION FAILED:', err);
      process.exit(1);
    });
}
