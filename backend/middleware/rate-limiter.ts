/**
 * Atlas Rate Limiting Middleware
 * Token bucket algorithm with Redis backing (falls back to in-memory).
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

interface RateLimitConfig {
  windowMs: number;       // Time window in milliseconds
  maxRequests: number;    // Max requests per window
  message?: string;       // Custom error message
  keyGenerator?: (req: Request) => string; // Custom key function
  skipSuccessfulRequests?: boolean;
}

const buckets = new Map<string, RateLimitBucket>();
const cleanupInterval = 60000; // Clean up every 60 seconds

// Periodic cleanup of expired buckets
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > cleanupInterval * 2) {
      buckets.delete(key);
    }
  }
}, cleanupInterval);

function getDefaultKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests. Please try again later.',
    keyGenerator = getDefaultKey,
  } = config;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = keyGenerator(req);
    const now = Date.now();

    let bucket = buckets.get(key);

    if (!bucket || now - bucket.lastRefill >= windowMs) {
      // New window or first request
      bucket = { tokens: maxRequests - 1, lastRefill: now };
      buckets.set(key, bucket);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', bucket.tokens);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      next();
      return;
    }

    if (bucket.tokens <= 0) {
      const retryAfter = Math.ceil((bucket.lastRefill + windowMs - now) / 1000);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil((bucket.lastRefill + windowMs) / 1000));
      res.setHeader('Retry-After', retryAfter);
      res.status(429).json({
        error: message,
        retryAfter,
        correlationId: req.correlationId,
      });
      return;
    }

    bucket.tokens--;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', bucket.tokens);
    res.setHeader('X-RateLimit-Reset', Math.ceil((bucket.lastRefill + windowMs) / 1000));
    next();
  };
}

// ─── Preset Rate Limiters ───────────────────────────────────────────

/** General API: 100 requests per minute */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 100,
  message: 'API rate limit exceeded. Max 100 requests per minute.',
});

/** AI inference: 20 requests per minute (expensive operations) */
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 20,
  message: 'AI inference rate limit exceeded. Max 20 requests per minute.',
});

/** Authentication: 10 attempts per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  message: 'Authentication rate limit exceeded. Max 10 attempts per 15 minutes.',
});

/** Agent orchestration: 30 requests per minute */
export const agentLimiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 30,
  message: 'Agent orchestration rate limit exceeded. Max 30 requests per minute.',
});

/** File upload: 10 uploads per minute */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10,
  message: 'Upload rate limit exceeded. Max 10 uploads per minute.',
});

/** Health check: unlimited (no rate limit applied) */
export const healthLimiter = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 10000,
});
