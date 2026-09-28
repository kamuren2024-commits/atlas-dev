export class ProductionModeError extends Error {
  public readonly code = 'EVALUATION_OS_PRODUCTION_GUARD';

  constructor(message: string) {
    super(message);
    this.name = 'ProductionModeError';
  }
}

export function isEvaluationOsProductionMode(): boolean {
  return process.env.EVALUATION_OS_PRODUCTION_MODE === 'true';
}

export function assertProductionDependency(
  dependency: string,
  configured: boolean,
  remediation: string
): void {
  if (isEvaluationOsProductionMode() && !configured) {
    throw new ProductionModeError(
      `[PRODUCTION GUARD] ${dependency} is required when EVALUATION_OS_PRODUCTION_MODE=true. ${remediation}`
    );
  }
}

export function assertNoSyntheticData(source: string): void {
  if (isEvaluationOsProductionMode() && source.toUpperCase().includes('SYNTHETIC')) {
    throw new ProductionModeError(
      `[PRODUCTION GUARD] Synthetic source "${source}" is prohibited in production mode.`
    );
  }
}

export function validateProductionConfiguration(): void {
  if (!isEvaluationOsProductionMode()) return;
  const required = [
    'DATABASE_URL',
    'OIDC_ISSUER',
    'OIDC_AUDIENCE',
    'OIDC_JWKS_URI',
    'OPA_URL',
    'S3_ENDPOINT',
    'S3_BUCKET',
    'S3_ACCESS_KEY',
    'S3_SECRET_KEY',
    'S3_REGION'
  ];
  const missing = required.filter(name => !process.env[name]);
  if (missing.length > 0) {
    throw new ProductionModeError(
      `[PRODUCTION GUARD] Missing required enterprise configuration: ${missing.join(', ')}`
    );
  }
}
