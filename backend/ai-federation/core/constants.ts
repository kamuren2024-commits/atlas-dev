// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — CONSTANTS
// Enterprise configuration defaults and constraints
// ============================================================================

/** Default timeouts in milliseconds */
export const TIMEOUT = {
  /** Connection timeout for establishing TCP connection */
  CONNECT_MS: 10_000,
  /** Total inference timeout (prompt to last token) */
  INFERENCE_MS: 60_000,
  /** Streaming timeout (idle chunk timeout) */
  STREAM_IDLE_MS: 30_000,
  /** Health check timeout */
  HEALTH_CHECK_MS: 5_000,
  /** Total request timeout (gateway-level) */
  TOTAL_REQUEST_MS: 120_000,
} as const;

/** Circuit breaker defaults */
export const CIRCUIT_BREAKER = {
  /** Number of consecutive failures before opening circuit */
  FAILURE_THRESHOLD: 3,
  /** Time in ms before transitioning from OPEN to HALF_OPEN */
  RESET_TIMEOUT_MS: 60_000,
  /** Number of successes in HALF_OPEN before closing circuit */
  SUCCESS_THRESHOLD: 2,
  /** Maximum concurrent requests in HALF_OPEN state */
  HALF_OPEN_MAX_CONCURRENT: 1,
} as const;

/** Retry defaults */
export const RETRY = {
  /** Maximum retry attempts for retryable errors */
  MAX_ATTEMPTS: 3,
  /** Base delay in ms for exponential backoff */
  BASE_DELAY_MS: 1_000,
  /** Maximum delay in ms */
  MAX_DELAY_MS: 30_000,
  /** Jitter factor (0-1): random multiplier applied to delay */
  JITTER_FACTOR: 0.3,
  /** HTTP status codes that are retryable */
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504],
} as const;

/** Health monitoring intervals */
export const HEALTH = {
  /** Interval between health checks in ms */
  CHECK_INTERVAL_MS: 30_000,
  /** Number of failures before marking provider as UNHEALTHY */
  UNHEALTHY_THRESHOLD: 3,
  /** Number of successes before recovering from DEGRADED */
  DEGRADED_RECOVERY_THRESHOLD: 2,
  /** Rolling window for availability calculation */
  WINDOW_SIZE: 20,
} as const;

/** Audit logging defaults */
export const AUDIT = {
  /** Maximum in-memory audit records before rotation */
  MAX_RECORDS: 50_000,
  /** Whether to log prompt content (default: metadata only) */
  LOG_PROMPTS: false,
  /** Whether to log response content */
  LOG_RESPONSES: false,
} as const;

/** Cache defaults */
export const CACHE = {
  /** Maximum cache entries */
  MAX_ENTRIES: 10_000,
  /** Default TTL in seconds */
  DEFAULT_TTL_S: 3600,
} as const;

/** Agent depth limit (runaway loop protection) */
export const AGENT_MAX_DEPTH = 20;

/** Provider status lifecycle states */
export const PROVIDER_STATES = [
  'REGISTERED',
  'INITIALIZING',
  'HEALTHY',
  'DEGRADED',
  'UNHEALTHY',
  'DISABLED',
  'CIRCUIT_BROKEN',
] as const;

export type ProviderLifecycleState = (typeof PROVIDER_STATES)[number];

/** Request metadata defaults */
export const REQUEST_DEFAULTS = {
  TENANT: 'ketraco',
  MODULE: 'federation',
  CLASSIFICATION: 'INTERNAL' as const,
  MAX_TOKENS: 4096,
  TEMPERATURE: 0.7,
} as const;
