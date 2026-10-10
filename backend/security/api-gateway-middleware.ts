import { Request, Response, NextFunction } from 'express';
import { IdentityService, UserIdentity } from './identity-service';
import { AuthorizationService } from './authorization-service';
import { RedisService } from '../database/redis-service';
import { CryptographyService } from './cryptography-service';
import { DevAdminService, DEV_ADMIN_ID } from './dev-admin';
import { isEvaluationOsProductionMode } from '../core/config/production-mode';
import { IdentityContext, OidcTokenValidator } from '../identity/oidc';

// Extend Express Request interface to include user and correlationId
declare global {
  namespace Express {
    interface Request {
      user?: UserIdentity;
      correlationId?: string;
    }
  }
}

export class ApiGatewayMiddleware {
  private static oidcValidator: OidcTokenValidator | null = null;

  /**
   * Inject a unique, trace-ready Correlation ID into each request and response
   */
  static correlationId(req: Request, res: Response, next: NextFunction): void {
    const correlationId = req.header('X-Correlation-ID') || `corr_${CryptographyService.generateRandomToken(8)}`;
    req.correlationId = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    next();
  }

  /**
   * Enforce security headers to mitigate typical web application vulnerabilities
   */
  static securityHeaders(req: Request, res: Response, next: NextFunction): void {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.google.com;");
    next();
  }

  /**
   * Zero Trust Request Authenticator
   */
  static async authenticate(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Required: Missing or malformed Bearer token.'
      });
    }

    const token = authHeader.substring(7);
    const user = isEvaluationOsProductionMode()
      ? await this.verifyOidcToken(token)
      : await IdentityService.verifyAccessToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Failure: Invalid, expired, or revoked access token.'
      });
    }

    if (user.id === DEV_ADMIN_ID && !DevAdminService.isDevAdminEnabled()) {
      return res.status(403).json({
        success: false,
        error: 'Development administrator sessions are unavailable in this environment.'
      });
    }

    req.user = user;
    (req as any).userId = user.id;
    next();
  }

  private static async verifyOidcToken(token: string): Promise<UserIdentity | null> {
    if (!this.oidcValidator) {
      this.oidcValidator = new OidcTokenValidator({
        issuer: process.env.OIDC_ISSUER || '',
        audience: process.env.OIDC_AUDIENCE || '',
        jwksUri: process.env.OIDC_JWKS_URI || '',
        clockSkewSeconds: Number(process.env.OIDC_CLOCK_SKEW_SECONDS || 60)
      });
    }
    try {
      const identity: IdentityContext = await this.oidcValidator.validate(token);
      const role = identity.roles[0] || 'READ_ONLY';
      return {
        id: identity.subject,
        role,
        roles: identity.roles,
        accessLevel: 'OIDC',
        clearance: 'OIDC',
        tenantId: identity.tenantId,
        authenticated: true
      };
    } catch (error) {
      console.warn('[SECURITY] OIDC validation failed:', error instanceof Error ? error.message : 'unknown error');
      return null;
    }
  }

  /**
   * Enforces fine-grained permission matching.
   */
  static authorize(resource: string, action: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ success: false, error: 'Unauthorized: User identity unverified.' });
      }

      // Gather attributes dynamically from body or query params to run ABAC checks
      const resourceAttributes = {
        tenantId: req.user.tenantId,
        costUSD: req.body?.costUSD ?? req.body?.costEstimateUSD ?? 0,
        variationPct: req.body?.variationPct ?? 0,
        securityLevel: req.body?.securityLevel ?? 'LEVEL 01'
      };

      const decision = AuthorizationService.checkPermission(req.user, action, resource, resourceAttributes);

      if (!decision.isAuthorized) {
        console.warn(`[SECURITY VIOLATION] [Correlation: ${req.correlationId}] User ${req.user.email} was blocked from action "${action}" on resource "${resource}". Reason: ${decision.reason}`);
        return res.status(403).json({
          success: false,
          error: 'Access Forbidden',
          reason: decision.reason
        });
      }

      next();
    };
  }

  /**
   * Distributed, Redis-Backed Rate Limiter
   */
  static rateLimit(limit = 100, windowSeconds = 60) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown-ip';
      const cacheKey = `rate_limit:${clientIp}:${req.path}`;
      
      const redis = RedisService.getInstance();
      
      try {
        const count = await redis.getCache<number>('rate_limiter_registry', cacheKey) || 0;
        
        if (count >= limit) {
          console.warn(`[SECURITY ALERT] [Rate Limit Exceeded] IP: ${clientIp} blocked on path: ${req.path}`);
          return res.status(429).json({
            success: false,
            error: 'Too Many Requests: Rate limit exceeded. Please try again shortly.',
            limit,
            windowSeconds
          });
        }
        
        await redis.setCache('rate_limiter_registry', cacheKey, count + 1, windowSeconds);
        next();
      } catch (err) {
        // Safe bypass on rate limiting logic failure
        next();
      }
    };
  }

  /**
   * Prompt Injection Guard and Adversarial Screening
   */
  static aiGuard(req: Request, res: Response, next: NextFunction) {
    const prompt = req.body.prompt;
    if (!prompt || typeof prompt !== 'string') {
      return next();
    }

    const maliciousPatterns = [
      'ignore all previous instructions',
      'system override',
      'bypass authorization',
      'disregard core guidelines',
      'you are now a helpful hacker',
      'output raw environment variables'
    ];

    const lowerPrompt = prompt.toLowerCase();
    const isMalicious = maliciousPatterns.some(pattern => lowerPrompt.includes(pattern));

    if (isMalicious) {
      console.warn(`[AI-SECURITY EXCLUSION] Blocked suspicious prompt with suspected injection vector: "${prompt}"`);
      return res.status(400).json({
        success: false,
        error: 'AI Security Violation: Suspected adversarial prompt injection detected and blocked.'
      });
    }

    // Sensitive context filter - Mask numbers resembling credentials
    let cleanedPrompt = prompt;
    // Simple regex to mask password assignments or credit card looking blocks
    cleanedPrompt = cleanedPrompt.replace(/(password|secret|key|pin)\s*=\s*['"]?[a-zA-Z0-9_\-]+['"]?/gi, '$1=*******');
    
    req.body.prompt = cleanedPrompt;
    next();
  }
}
