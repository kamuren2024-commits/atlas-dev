/**
 * Atlas Environment Configuration
 * Centralizes all configuration with defaults and validation.
 * No hardcoded values in application code — all come from here.
 */

export interface AtlasConfig {
  // Server
  port: number;
  host: string;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string;

  // Database
  databaseUrl: string;
  sqlitePath: string;

  // Redis
  redisUrl: string;
  redisPassword: string;

  // AI Providers
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  openrouterApiKey: string;
  groqApiKey: string;

  // Security
  jwtSecret: string;
  encryptionSecret: string;
  devAuthBypass: boolean;

  // Rate Limiting
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  aiRateLimitMaxRequests: number;

  // AI Cost Governance
  monthlyBudgetUsd: number;
  dailyBudgetUsd: number;
  maxTokensPerRequest: number;
  maxAgentDepth: number;

  // Memory
  memoryMaxEntries: number;
  memoryDefaultTtlSeconds: number;

  // Events
  eventStoreMaxSize: number;
  eventRetryMaxAttempts: number;

  // Observability
  enableTelemetry: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

function env(key: string, fallback: string = ''): string {
  return process.env[key] || fallback;
}

function envInt(key: string, fallback: number): number {
  const val = process.env[key];
  return val ? parseInt(val, 10) : fallback;
}

function envFloat(key: string, fallback: number): number {
  const val = process.env[key];
  return val ? parseFloat(val) : fallback;
}

function envBool(key: string, fallback: boolean): boolean {
  const val = process.env[key];
  if (!val) return fallback;
  return val === 'true' || val === '1';
}

export function loadConfig(): AtlasConfig {
  return {
    // Server
    port: envInt('PORT', 3001),
    host: env('HOST', '0.0.0.0'),
    nodeEnv: (env('NODE_ENV', 'development') as AtlasConfig['nodeEnv']),
    corsOrigin: env('CORS_ORIGIN', 'http://localhost:5173'),

    // Database
    databaseUrl: env('DATABASE_URL'),
    sqlitePath: env('SQLITE_PATH', './data/salience_atlas.db'),

    // Redis
    redisUrl: env('REDIS_URL', 'redis://localhost:6379'),
    redisPassword: env('REDIS_PASSWORD', ''),

    // AI Providers
    geminiApiKey: env('GEMINI_API_KEY'),
    openaiApiKey: env('OPENAI_API_KEY'),
    anthropicApiKey: env('ANTHROPIC_API_KEY'),
    openrouterApiKey: env('OPENROUTER_API_KEY'),
    groqApiKey: env('GROQ_API_KEY'),

    // Security
    jwtSecret: env('JWT_SECRET', 'atlas-dev-jwt-secret-change-in-prod'),
    encryptionSecret: env('ATLAS_ENCRYPTION_SECRET', 'atlas-default-dev-secret-change-in-prod'),
    devAuthBypass: envBool('DEV_AUTH_BYPASS', false),

    // Rate Limiting
    rateLimitWindowMs: envInt('RATE_LIMIT_WINDOW_MS', 60000),
    rateLimitMaxRequests: envInt('RATE_LIMIT_MAX_REQUESTS', 100),
    aiRateLimitMaxRequests: envInt('AI_RATE_LIMIT_MAX_REQUESTS', 20),

    // AI Cost Governance
    monthlyBudgetUsd: envFloat('AI_MONTHLY_BUDGET_USD', 1000),
    dailyBudgetUsd: envFloat('AI_DAILY_BUDGET_USD', 100),
    maxTokensPerRequest: envInt('AI_MAX_TOKENS_PER_REQUEST', 8192),
    maxAgentDepth: envInt('AI_MAX_AGENT_DEPTH', 5),

    // Memory
    memoryMaxEntries: envInt('MEMORY_MAX_ENTRIES', 10000),
    memoryDefaultTtlSeconds: envInt('MEMORY_DEFAULT_TTL_SECONDS', 3600),

    // Events
    eventStoreMaxSize: envInt('EVENT_STORE_MAX_SIZE', 10000),
    eventRetryMaxAttempts: envInt('EVENT_RETRY_MAX_ATTEMPTS', 3),

    // Observability
    enableTelemetry: envBool('ENABLE_TELEMETRY', true),
    logLevel: (env('LOG_LEVEL', 'info') as AtlasConfig['logLevel']),
  };
}

let _config: AtlasConfig | null = null;

export function getConfig(): AtlasConfig {
  if (!_config) {
    _config = loadConfig();
  }
  return _config;
}

/**
 * Validate critical configuration on startup
 */
export function validateConfig(config: AtlasConfig): string[] {
  const errors: string[] = [];

  if (config.nodeEnv === 'production') {
    if (!config.databaseUrl) errors.push('DATABASE_URL is required in production');
    if (config.jwtSecret === 'atlas-dev-jwt-secret-change-in-prod') errors.push('JWT_SECRET must be changed in production');
    if (config.encryptionSecret === 'atlas-default-dev-secret-change-in-prod') errors.push('ATLAS_ENCRYPTION_SECRET must be changed in production');
    if (config.devAuthBypass) errors.push('DEV_AUTH_BYPASS must be false in production');
  }

  if (!config.geminiApiKey && !config.openaiApiKey && !config.openrouterApiKey) {
    errors.push('At least one AI provider API key must be configured');
  }

  return errors;
}
