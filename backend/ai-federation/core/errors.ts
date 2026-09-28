// ============================================================================
// SALIENCE ATLAS AI FEDERATION V2 — STRUCTURED ERROR HIERARCHY
// Enterprise-grade error classification for multi-provider inference
// ============================================================================

/**
 * Base class for all AI Federation errors.
 * Every error carries provider context, request correlation, and retry metadata.
 */
export abstract class AIFederationError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;
  abstract readonly retryable: boolean;

  readonly provider?: string;
  readonly model?: string;
  readonly requestId?: string;
  readonly timestamp: string;
  readonly safeMessage: string;

  constructor(
    message: string,
    options?: {
      provider?: string;
      model?: string;
      requestId?: string;
      cause?: Error;
    }
  ) {
    super(message);
    this.name = this.constructor.name;
    this.provider = options?.provider;
    this.model = options?.model;
    this.requestId = options?.requestId;
    this.timestamp = new Date().toISOString();
    this.safeMessage = this.sanitizeMessage(message);

    if (options?.cause) {
      (this as any).cause = options.cause;
    }

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Ensure no secrets leak through error messages
   */
  private sanitizeMessage(msg: string): string {
    return msg
      .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
      .replace(/api[_-]?key[=:]\s*[^\s,;]+/gi, 'api_key=[REDACTED]')
      .replace(/x-api-key[=:]\s*[^\s,;]+/gi, 'x-api-key=[REDACTED]')
      .replace(/[A-Za-z0-9]{32,}/g, '[REDACTED_TOKEN]');
  }

  toJSON(): Record<string, any> {
    return {
      code: this.code,
      name: this.name,
      message: this.safeMessage,
      safeMessage: this.safeMessage,
      provider: this.provider,
      model: this.model,
      requestId: this.requestId,
      statusCode: this.statusCode,
      retryable: this.retryable,
      timestamp: this.timestamp,
    };
  }
}

// ---------------------------------------------------------------------------
// Provider Unavailable
// ---------------------------------------------------------------------------
export class AIProviderUnavailableError extends AIFederationError {
  readonly code = 'AI_PROVIDER_UNAVAILABLE';
  readonly statusCode = 503;
  readonly retryable = true;

  constructor(provider: string, options?: { requestId?: string; cause?: Error }) {
    super(`Provider "${provider}" is currently unavailable`, {
      provider,
      requestId: options?.requestId,
      cause: options?.cause,
    });
  }
}

// ---------------------------------------------------------------------------
// Provider Authentication
// ---------------------------------------------------------------------------
export class AIProviderAuthenticationError extends AIFederationError {
  readonly code = 'AI_PROVIDER_AUTH_ERROR';
  readonly statusCode = 401;
  readonly retryable = false;

  constructor(provider: string, options?: { requestId?: string; cause?: Error }) {
    super(`Authentication failed for provider "${provider}" — API key missing or invalid`, {
      provider,
      requestId: options?.requestId,
      cause: options?.cause,
    });
  }
}

// ---------------------------------------------------------------------------
// Rate Limit
// ---------------------------------------------------------------------------
export class AIProviderRateLimitError extends AIFederationError {
  readonly code = 'AI_PROVIDER_RATE_LIMITED';
  readonly statusCode = 429;
  readonly retryable = true;
  readonly retryAfterMs?: number;

  constructor(provider: string, retryAfterMs?: number, options?: { requestId?: string }) {
    super(`Rate limit exceeded for provider "${provider}"`, {
      provider,
      requestId: options?.requestId,
    });
    this.retryAfterMs = retryAfterMs;
  }
}

// ---------------------------------------------------------------------------
// Provider Timeout
// ---------------------------------------------------------------------------
export class AIProviderTimeoutError extends AIFederationError {
  readonly code = 'AI_PROVIDER_TIMEOUT';
  readonly statusCode = 504;
  readonly retryable = true;
  readonly timeoutMs: number;

  constructor(provider: string, timeoutMs: number, options?: { requestId?: string }) {
    super(`Provider "${provider}" timed out after ${timeoutMs}ms`, {
      provider,
      requestId: options?.requestId,
    });
    this.timeoutMs = timeoutMs;
  }
}

// ---------------------------------------------------------------------------
// Model Not Found
// ---------------------------------------------------------------------------
export class AIModelNotFoundError extends AIFederationError {
  readonly code = 'AI_MODEL_NOT_FOUND';
  readonly statusCode = 404;
  readonly retryable = false;

  constructor(model: string, provider: string, options?: { requestId?: string }) {
    super(`Model "${model}" not found on provider "${provider}"`, {
      model,
      provider,
      requestId: options?.requestId,
    });
  }
}

// ---------------------------------------------------------------------------
// Inference Error
// ---------------------------------------------------------------------------
export class AIInferenceError extends AIFederationError {
  readonly code = 'AI_INFERENCE_ERROR';
  readonly statusCode = 500;
  readonly retryable = true;

  constructor(
    message: string,
    options?: {
      provider?: string;
      model?: string;
      requestId?: string;
      cause?: Error;
    }
  ) {
    super(message, options);
  }
}

// ---------------------------------------------------------------------------
// Policy Violation
// ---------------------------------------------------------------------------
export class AIPolicyViolationError extends AIFederationError {
  readonly code = 'AI_POLICY_VIOLATION';
  readonly statusCode = 403;
  readonly retryable = false;
  readonly policyId?: string;

  constructor(
    message: string,
    options?: {
      provider?: string;
      requestId?: string;
      policyId?: string;
    }
  ) {
    super(message, options);
    this.policyId = options?.policyId;
  }
}

// ---------------------------------------------------------------------------
// Circuit Breaker Open
// ---------------------------------------------------------------------------
export class AICircuitOpenError extends AIFederationError {
  readonly code = 'AI_CIRCUIT_OPEN';
  readonly statusCode = 503;
  readonly retryable = true;
  readonly resetAtMs: number;

  constructor(provider: string, resetAtMs: number, options?: { requestId?: string }) {
    super(`Circuit breaker is OPEN for provider "${provider}" — retrying after reset`, {
      provider,
      requestId: options?.requestId,
    });
    this.resetAtMs = resetAtMs;
  }
}

// ---------------------------------------------------------------------------
// Request Validation Error
// ---------------------------------------------------------------------------
export class AIRequestValidationError extends AIFederationError {
  readonly code = 'AI_REQUEST_INVALID';
  readonly statusCode = 400;
  readonly retryable = false;

  constructor(message: string, options?: { requestId?: string }) {
    super(message, { requestId: options?.requestId });
  }
}

// ---------------------------------------------------------------------------
// All Providers Exhausted
// ---------------------------------------------------------------------------
export class AIAllProvidersExhaustedError extends AIFederationError {
  readonly code = 'AI_ALL_PROVIDERS_EXHAUSTED';
  readonly statusCode = 503;
  readonly retryable = false;
  readonly attemptCount: number;
  readonly lastError?: string;

  constructor(attemptCount: number, lastError?: string, options?: { requestId?: string }) {
    super(
      `All ${attemptCount} provider attempts exhausted. Last error: ${lastError || 'unknown'}`,
      { requestId: options?.requestId }
    );
    this.attemptCount = attemptCount;
    this.lastError = lastError;
  }
}
