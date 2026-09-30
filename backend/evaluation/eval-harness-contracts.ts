export const EVALUATION_TARGETS = ['agents', 'gateway', 'ontology', 'tools', 'all'] as const;

export type EvaluationTarget = (typeof EVALUATION_TARGETS)[number];

export interface GatewayModelAvailability {
  provider: string;
  availability: string;
}

export function parseEvaluationTarget(value: string | undefined): EvaluationTarget {
  if (value && (EVALUATION_TARGETS as readonly string[]).includes(value)) {
    return value as EvaluationTarget;
  }

  throw new Error(
    `Invalid or missing evaluation target. Usage: eval-harness <${EVALUATION_TARGETS.join('|')}>`
  );
}

export function hasConfiguredGatewayProvider(
  models: readonly GatewayModelAvailability[],
  env: Pick<NodeJS.ProcessEnv, 'GEMINI_API_KEY'>,
): boolean {
  return Boolean(env.GEMINI_API_KEY?.trim())
    || models.some(model => model.provider === 'ollama' && model.availability === 'ACTIVE');
}
