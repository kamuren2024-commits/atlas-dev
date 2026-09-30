import { mkdir, writeFile } from 'node:fs/promises';
import { OllamaClient } from '../backend/ai-federation/providers/ollama/OllamaClient';
import { OllamaModelDiscovery } from '../backend/ai-federation/providers/ollama/OllamaModelDiscovery';
import { OllamaRuntimeEvaluator } from '../backend/ai-federation/providers/ollama/OllamaRuntimeEvaluator';
import { AtlasModelRegistry } from '../backend/ai-federation/registry/ModelRegistry';

const outputDirectory = 'docs/tevv';
const client = new OllamaClient();
const discovery = new OllamaModelDiscovery(client);
const registry = AtlasModelRegistry.getInstance();

const startedAt = new Date().toISOString();
const discoveryStarted = Date.now();
let evaluationFailed = false;
let models;
try {
  models = await discovery.discover();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  const failure = {
    provider: 'ollama',
    evaluatedAt: new Date().toISOString(),
    durationMs: Date.now() - discoveryStarted,
    timeoutMs: client.timeoutMs,
    status: 'UNVERIFIED',
    discovery: { status: 'FAIL', errorClass: 'CONNECTIVITY_FAILURE', errorMessage: message },
    models: [],
  };
  await mkdir(outputDirectory, { recursive: true });
  const empty = JSON.stringify({ provider: 'ollama', evaluatedAt: failure.evaluatedAt, status: 'UNVERIFIED', models: [], reason: message }, null, 2);
  await Promise.all([
    writeFile(`${outputDirectory}/ollama-runtime-results.json`, JSON.stringify(failure, null, 2)),
    writeFile(`${outputDirectory}/ollama-capability-results.json`, empty),
    writeFile(`${outputDirectory}/ollama-agent-results.json`, empty),
    writeFile(`${outputDirectory}/ollama-eligibility-results.json`, empty),
  ]);
  evaluationFailed = true;
  console.error(`[ollama-eval] ${message}`);
} finally {
  if (!models) {
    // The failure artifact above is the truthful result; do not synthesize model results.
  } else {
    const evaluator = new OllamaRuntimeEvaluator(client);
    const evaluations = [];
    for (const model of models) {
      const tag = await client.getModel(model.name);
      if (!tag) continue;
      const evaluation = await evaluator.evaluateModel(tag);
      evaluations.push(evaluation);
      registry.applyOllamaEvaluation(evaluation);
    }
    const runtime = {
      provider: 'ollama',
      evaluationVersion: '1.0',
      startedAt,
      evaluatedAt: new Date().toISOString(),
      discoveredModels: models.map(model => model.name),
      status: evaluations.every(evaluation => evaluation.status === 'PASSED' || evaluation.status === 'PASSED_WITH_RESTRICTIONS')
        ? 'PASS' : evaluations.length === 0 ? 'UNVERIFIED' : 'FAIL',
      models: evaluations,
    };
    const capabilities = Object.fromEntries(evaluations.map(evaluation => [evaluation.model, evaluation.capabilities]));
    const eligibility = Object.fromEntries(evaluations.map(evaluation => [evaluation.model, {
      status: evaluation.status,
      requiredForAutonomousProduction: ['TEXT_GENERATION', 'STREAMING', 'STRUCTURED_OUTPUT'],
      evidenceRefs: evaluation.traceRefs,
    }]));
    await mkdir(outputDirectory, { recursive: true });
    await Promise.all([
      writeFile(`${outputDirectory}/ollama-runtime-results.json`, JSON.stringify(runtime, null, 2)),
      writeFile(`${outputDirectory}/ollama-capability-results.json`, JSON.stringify({ provider: 'ollama', evaluatedAt: runtime.evaluatedAt, models: capabilities }, null, 2)),
      writeFile(`${outputDirectory}/ollama-agent-results.json`, JSON.stringify({ provider: 'ollama', evaluatedAt: runtime.evaluatedAt, status: 'UNVERIFIED', reason: 'AgentRuntime integration requires a passed direct runtime evaluation', models: evaluations.map(evaluation => evaluation.model) }, null, 2)),
      writeFile(`${outputDirectory}/ollama-eligibility-results.json`, JSON.stringify({ provider: 'ollama', evaluatedAt: runtime.evaluatedAt, models: eligibility }, null, 2)),
    ]);
  }
}

if (evaluationFailed) process.exitCode = 1;
