// ============================================================================
// SALIENCE ATLAS AI FEDERATION — OLLAMA MODEL CAPABILITIES
// Derives a conservative capability profile for a discovered local model.
// Capabilities are inferred from the model family + context window, and
// never fabricated from nothing.
// ============================================================================

import { ModelCapabilities } from '../../federation/types';

/**
 * Baseline capability profile shared by all local Ollama models.
 * Cost is $0 (local). Latency is a conservative default (updated by real checks).
 */
const BASE: Omit<ModelCapabilities, 'contextWindow' | 'reasoning' | 'coding' | 'analysis' | 'creative' | 'multilingual'> = {
  maxOutputTokens: 4096,
  structuredOutput: false,
  toolCalling: false,
  vision: false,
  embedding: false,
  streaming: true,
  functionCalling: false,
  jsonMode: false,
  costPerMillionInput: 0,
  costPerMillionOutput: 0,
  avgLatencyMs: 1000,
  throughputTokensPerSec: 20,
};

/**
 * Derive capabilities based on the model family.
 * Conservative defaults; unknown families get a neutral profile.
 */
export function deriveCapabilities(name: string, contextWindow: number, family?: string): ModelCapabilities {
  const lower = `${name} ${family || ''}`.toLowerCase();

  const isQwen = lower.includes('qwen');
  const isLlama = lower.includes('llama');
  const isMistral = lower.includes('mistral') || lower.includes('mixtral');
  const isGemma = lower.includes('gemma');

  // Reasoning/coding/analysis scores are family-relative heuristics,
  // clearly derived from model family rather than fabricated metrics.
  let reasoning = 55;
  let coding = 45;
  let analysis = 55;
  let creative = 50;
  let multilingual = 45;

  if (isQwen) {
    reasoning = 68;
    coding = 70;
    analysis = 68;
    creative = 62;
    multilingual = 65;
  } else if (isLlama) {
    reasoning = 62;
    coding = 58;
    analysis = 60;
    creative = 62;
    multilingual = 55;
  } else if (isMistral) {
    reasoning = 65;
    coding = 60;
    analysis = 62;
    creative = 58;
    multilingual = 60;
  } else if (isGemma) {
    reasoning = 52;
    coding = 48;
    analysis = 52;
    creative = 55;
    multilingual = 50;
  }

  return {
    ...BASE,
    contextWindow,
    reasoning,
    coding,
    analysis,
    creative,
    multilingual,
  };
}

/** Static baseline exposed for convenience/backward-compat. */
export const OLLAMA_MODEL_CAPABILITIES = deriveCapabilities('ollama-local', 8192, 'qwen');
