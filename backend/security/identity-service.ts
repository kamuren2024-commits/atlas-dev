import { RedisService } from '../database/redis-service';
import { CryptographyService } from './cryptography-service';
import { SecretsManager } from './secrets-manager';
import { InfrastructurePolicyService } from '../core/config/infrastructure-policy';

export interface UserIdentity {
  id: string;
  email?: string;
  name?: string;
  role: string;
  roles?: string[];
  accessLevel: string;
  clearance: string;
  tenantId: string;
  organizationId?: string;
  permissions?: string[];
  authenticated?: boolean;
}

export interface UserSession {
  id: string;
  userId: string;
  tenantId: string;
  device: string;
  ip: string;
  loginTime: number;
  expiresAt: number;
  status: 'ACTIVE' | 'TERMINATED' | 'EXPIRED';
}

export class IdentityService {
  private static JWT_HEADER = { alg: 'HS256', typ: 'JWT' };

  private static base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  private static base64UrlDecode(str: string): string {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString('utf8');
  }

  /**
   * Create a standardized JWT access and refresh token pair
   */
  static async generateTokens(user: UserIdentity): Promise<{ accessToken: string; refreshToken: string; expiresAt: number }> {
    const secret = SecretsManager.getSecret('JWT_SECRET', 'salience-atlas-jwt-secret-secure-random-2026');
    
    // Access Token valid for 15 minutes (900 seconds)
    const accessExpires = Math.floor(Date.now() / 1000) + 900;
    const accessPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      accessLevel: user.accessLevel,
      clearance: user.clearance,
      tenantId: user.tenantId,
      exp: accessExpires,
      type: 'access'
    };

    // Refresh Token valid for 7 days (604800 seconds)
    const refreshExpires = Math.floor(Date.now() / 1000) + 604800;
    const refreshPayload = {
      sub: user.id,
      exp: refreshExpires,
      type: 'refresh',
      jti: CryptographyService.generateRandomToken(16)
    };

    const headerEnc = this.base64UrlEncode(JSON.stringify(this.JWT_HEADER));
    
    // Create Access Token string
    const accessPayloadEnc = this.base64UrlEncode(JSON.stringify(accessPayload));
    const accessSig = CryptographyService.hmacSign(`${headerEnc}.${accessPayloadEnc}`, secret);
    const accessToken = `${headerEnc}.${accessPayloadEnc}.${accessSig}`;

    // Create Refresh Token string
    const refreshPayloadEnc = this.base64UrlEncode(JSON.stringify(refreshPayload));
    const refreshSig = CryptographyService.hmacSign(`${headerEnc}.${refreshPayloadEnc}`, secret);
    const refreshToken = `${headerEnc}.${refreshPayloadEnc}.${refreshSig}`;

    // Persist refresh token metadata to Redis for active rotation and revocation controls
    try {
      const redis = RedisService.getInstance();
      await redis.setCache('refresh_tokens', refreshPayload.jti, {
        userId: user.id,
        expiresAt: refreshExpires,
        revoked: false
      }, 604800);
    } catch (err: any) {
      const policy = InfrastructurePolicyService.getPolicy();
      if (policy.redisBlocksAuthentication) {
        throw err;
      }
      console.warn('[IDENTITY-SERVICE] Redis refresh token persistence degraded:', err.message);
    }

    return {
      accessToken,
      refreshToken,
      expiresAt: accessExpires * 1000
    };
  }

  /**
   * Verify and parse a JWT Access Token
   */
  static async verifyAccessToken(token: string): Promise<UserIdentity | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const [headerEnc, payloadEnc, signature] = parts;
      const secret = SecretsManager.getSecret('JWT_SECRET', 'salience-atlas-jwt-secret-secure-random-2026');

      // 1. Cryptographic Signature Verification
      const isValidSig = CryptographyService.verifyHmacSign(`${headerEnc}.${payloadEnc}`, signature, secret);
      if (!isValidSig) {
        console.warn('[SECURITY] JWT Signature Validation Failed.');
        return null;
      }

      // 2. Token Revocation Check (Redis Blocklist)
      const isRevoked = await this.isTokenRevoked(token);
      if (isRevoked) {
        console.warn('[SECURITY] Token is revoked or blocklisted.');
        return null;
      }

      // 3. Expiration Check
      const payload = JSON.parse(this.base64UrlDecode(payloadEnc));
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        console.warn('[SECURITY] JWT Access Token Expired.');
        return null;
      }

      if (payload.type !== 'access') {
        return null;
      }

      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        accessLevel: payload.accessLevel,
        clearance: payload.clearance,
        tenantId: payload.tenantId
      };
    } catch (err) {
      console.error('[SECURITY] JWT verification error:', err);
      return null;
    }
  }

  /**
   * Refresh token rotation - Generates a brand new pair and invalidates old ones
   */
  static async rotateTokens(refreshToken: string, user: UserIdentity): Promise<{ accessToken: string; refreshToken: string; expiresAt: number } | null> {
    try {
      const parts = refreshToken.split('.');
      if (parts.length !== 3) return null;

      const [headerEnc, payloadEnc, signature] = parts;
      const secret = SecretsManager.getSecret('JWT_SECRET', 'salience-atlas-jwt-secret-secure-random-2026');

      const isValidSig = CryptographyService.verifyHmacSign(`${headerEnc}.${payloadEnc}`, signature, secret);
      if (!isValidSig) return null;

      const payload = JSON.parse(this.base64UrlDecode(payloadEnc));
      if (payload.exp < Math.floor(Date.now() / 1000) || payload.type !== 'refresh') {
        return null;
      }

      const redis = RedisService.getInstance();
      const tokenMeta = await redis.getCache<{ userId: string; revoked: boolean }>('refresh_tokens', payload.jti);
      
      if (!tokenMeta || tokenMeta.revoked) {
        // Reuse detection! If a refresh token is reused, revoke ALL family tokens
        console.error(`[SECURITY ALERT] Refresh token reuse detected for JTI: ${payload.jti}! Revoking sessions...`);
        await redis.deleteCache('refresh_tokens', payload.jti);
        return null;
      }

      // Invalidate the used refresh token immediately (rotation)
      await redis.setCache('refresh_tokens', payload.jti, { ...tokenMeta, revoked: true }, 604800);

      // Issue new token pair
      return this.generateTokens(user);
    } catch (err) {
      console.error('[SECURITY] Token rotation error:', err);
      return null;
    }
  }

  /**
   * Revoke an active access token (blocklist on logout/anomaly)
   */
  static async revokeToken(token: string): Promise<void> {
    const hash = CryptographyService.hashSHA256(token);
    const redis = RedisService.getInstance();
    // Cache revoked hashes for 15 minutes max
    await redis.setCache('revoked_tokens', hash, { revokedAt: Date.now() }, 900);
  }

  /**
   * Checks if an access token signature has been blocklisted
   */
  static async isTokenRevoked(token: string): Promise<boolean> {
    try {
      const hash = CryptographyService.hashSHA256(token);
      const redis = RedisService.getInstance();
      const revoked = await redis.getCache<any>('revoked_tokens', hash);
      return !!revoked;
    } catch (err: any) {
      const policy = InfrastructurePolicyService.getPolicy();
      if (policy.redisBlocksAuthentication) {
        throw err;
      }
      return false;
    }
  }

  /**
   * Create and record a dynamic device session in Redis
   */
  static async createSession(user: UserIdentity, device = 'Generic Browser', ip = '127.0.0.1'): Promise<UserSession> {
    const sessionId = `sess_${CryptographyService.generateRandomToken(12)}`;
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24; // 24 Hours duration
    
    const session: UserSession = {
      id: sessionId,
      userId: user.id,
      tenantId: user.tenantId,
      device,
      ip,
      loginTime: Date.now(),
      expiresAt,
      status: 'ACTIVE'
    };

    try {
      const redis = RedisService.getInstance();
      await redis.setCache(`sessions:${user.tenantId}`, sessionId, session, 86400);
    } catch (err: any) {
      const policy = InfrastructurePolicyService.getPolicy();
      if (policy.redisBlocksAuthentication) {
        throw err;
      }
      console.warn('[IDENTITY-SERVICE] Redis session caching degraded:', err.message);
    }
    return session;
  }

  /**
   * Fetch all active sessions associated with a tenant
   */
  static async getTenantSessions(tenantId: string): Promise<UserSession[]> {
    try {
      const redis = RedisService.getInstance();
      const sessionList = await redis.getCache<UserSession[]>(`sessions_list`, tenantId) || [];
      return sessionList.filter(s => s.expiresAt > Date.now() && s.status === 'ACTIVE');
    } catch (err: any) {
      const policy = InfrastructurePolicyService.getPolicy();
      if (policy.redisBlocksAuthentication) {
        throw err;
      }
      return [];
    }
  }

  /**
   * Register active session to public index
   */
  static async registerActiveSession(session: UserSession): Promise<void> {
    try {
      const redis = RedisService.getInstance();
      const sessionList = await redis.getCache<UserSession[]>(`sessions_list`, session.tenantId) || [];
      sessionList.push(session);
      await redis.setCache(`sessions_list`, session.tenantId, sessionList, 86400);
    } catch (err: any) {
      const policy = InfrastructurePolicyService.getPolicy();
      if (policy.redisBlocksAuthentication) {
        throw err;
      }
    }
  }

  /**
   * Terminate a specific user session cleanly
   */
  static async terminateSession(tenantId: string, sessionId: string): Promise<void> {
    try {
      const redis = RedisService.getInstance();
      const sessionList = await redis.getCache<UserSession[]>(`sessions_list`, tenantId) || [];
      const updated = sessionList.map(s => {
        if (s.id === sessionId) {
          return { ...s, status: 'TERMINATED' as const };
        }
        return s;
      });
      await redis.setCache(`sessions_list`, tenantId, updated, 86400);
      await redis.deleteCache(`sessions:${tenantId}`, sessionId);
    } catch (err: any) {
      const policy = InfrastructurePolicyService.getPolicy();
      if (policy.redisBlocksAuthentication) {
        throw err;
      }
    }
  }
}
