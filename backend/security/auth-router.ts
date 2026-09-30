import { Router } from 'express';
import { IdentityService, UserIdentity } from './identity-service';
import { AuthorizationService } from './authorization-service';
import { ApiGatewayMiddleware } from './api-gateway-middleware';
import { AuditLedger } from '../ai-federation/compliance/audit-ledger';
import { ConfigService } from '../core/config/config-loader';
import { DevAdminService, DEV_ADMIN_EMAIL } from './dev-admin';
import { InfrastructurePolicyService } from '../core/config/infrastructure-policy';

export const authRouter = Router();

// Log dev admin credentials on boot if in development
DevAdminService.logInit();

/**
 * Zero Trust Identity — demo credential management.
 *
 * Demo identities are seeded from the CONFIGURATION PLATFORM (env / secret
 * manager) rather than committed in plain text. Set `DEMO_DEV_PASSWORD` to a
 * strong value in production. When unset, a local-dev fallback is used and a
 * warning is emitted so operators cannot silently ship weak credentials.
 */
const DEMO_DEV_PASSWORD = ConfigService.get('DEMO_DEV_PASSWORD');
const HAS_STATIC_APP_PASSWORD = ConfigService.has('DEMO_DEV_PASSWORD');

if (!HAS_STATIC_APP_PASSWORD) {
  console.warn(
    '[SECURITY] DEMO_DEV_PASSWORD is not configured. Static enterprise logins are disabled until a secure value is supplied in the environment.'
  );
}

// Standard static users database for Zero Trust Identity.
// Fail closed: without an explicit password in the environment, no default password is exposed.
const ENTERPRISE_USERS: Record<string, UserIdentity & { passwordHash: string }> = HAS_STATIC_APP_PASSWORD ? {
  'kamau@ketraco.co.ke': {
    id: 'user_kamau_01',
    email: 'kamau@ketraco.co.ke',
    name: 'John Kamau',
    role: 'SCM Intelligence Officer',
    accessLevel: 'LEVEL 04',
    clearance: 'Enterprise Clear',
    tenantId: 'ketraco',
    passwordHash: DEMO_DEV_PASSWORD
  },
  'ndegwa@kengen.co.ke': {
    id: 'user_ndegwa_02',
    email: 'ndegwa@kengen.co.ke',
    name: 'Dr. Peter Ndegwa',
    role: 'Chief Procurement Officer',
    accessLevel: 'LEVEL 03',
    clearance: 'Generation Command',
    tenantId: 'kengen',
    passwordHash: DEMO_DEV_PASSWORD
  },
  'kariuki@kplc.co.ke': {
    id: 'user_kariuki_03',
    email: 'kariuki@kplc.co.ke',
    name: 'Eng. Alice Kariuki',
    role: 'Director Grid Logistics',
    accessLevel: 'LEVEL 02',
    clearance: 'Distribution Admin',
    tenantId: 'kplc',
    passwordHash: DEMO_DEV_PASSWORD
  },
  'board@ketraco.co.ke': {
    id: 'user_board_04',
    email: 'board@ketraco.co.ke',
    name: 'Hon. Board Director',
    role: 'Board Director',
    accessLevel: 'LEVEL 04',
    clearance: 'Strategic Board Clear',
    tenantId: 'ketraco',
    passwordHash: DEMO_DEV_PASSWORD
  }
} : {};

/**
 * Endpoint: POST /api/auth/login
 * Performs multi-tenant credential matching, generates access/refresh tokens, and records sessions.
 */
authRouter.post('/login', ApiGatewayMiddleware.rateLimit(10, 60), async (req, res) => {
  const { email, password, tenantId } = req.body;

  if (!email || !password || !tenantId) {
    return res.status(400).json({ success: false, error: 'Email, password, and tenantId are required.' });
  }

  let user: UserIdentity | undefined;

  // 1. Check for Development Administrator credentials
  if (DevAdminService.isDevAdminEmail(email)) {
    const policy = InfrastructurePolicyService.getPolicy();
    if (!DevAdminService.isDevAdminEnabled()) {
      console.error(`[SECURITY ALERT] DEV_ADMIN login rejected: Disabled in environment "${policy.environment}"`);
      return res.status(403).json({
        success: false,
        error: 'Access Denied: Development administrator is strictly prohibited in this environment.'
      });
    }

    const validation = DevAdminService.validateDevAdminLogin(email, password);
    if (!validation.valid || !validation.user) {
      console.warn(`[SECURITY VIOLATION] Failed DEV_ADMIN login attempt on tenant "${tenantId}"`);
      return res.status(401).json({
        success: false,
        error: 'Authentication Denied: Invalid development administrator credentials.'
      });
    }

    user = validation.user;
  } else {
    // 2. Standard Enterprise Zero-Trust Credential Check
    const enterpriseUser = ENTERPRISE_USERS[email.toLowerCase()];
    if (!enterpriseUser || enterpriseUser.passwordHash !== password || enterpriseUser.tenantId !== tenantId) {
      console.warn(`[SECURITY VIOLATION] Failed login attempt on tenant "${tenantId}" for email: "${email}"`);
      return res.status(401).json({
        success: false,
        error: 'Authentication Denied: Invalid email, password, or tenant association.'
      });
    }
    user = enterpriseUser;
  }

  try {
    // Generate new JWT Token Set
    const tokens = await IdentityService.generateTokens(user);
    
    // Create and index session in Redis (degraded gracefully to memory if Redis down in dev)
    const session = await IdentityService.createSession(user, req.headers['user-agent'] || 'Generic Browser', req.ip || '127.0.0.1');
    await IdentityService.registerActiveSession(session);

    // Cryptographic log append to AuditLedger
    AuditLedger.append(
      `Identity Verification Success: Access Token and Refresh Token generated for user ${user.email}`,
      `Authorized Session ${session.id} generated with expiration.`,
      'internal_auth',
      'JWT_HS256',
      0,
      12,
      user.email,
      'identity:login',
      ['ZERO_TRUST_PASS', 'MEMBER_LOGIN']
    );

    res.json({
      success: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        accessLevel: user.accessLevel,
        clearance: user.clearance,
        tenantId: user.tenantId
      },
      session: {
        id: session.id,
        device: session.device,
        ip: session.ip,
        loginTime: session.loginTime
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Endpoint: POST /api/auth/refresh
 * Performs Refresh Token Rotation (RTR).
 */
authRouter.post('/refresh', async (req, res) => {
  const { refreshToken, email, tenantId } = req.body;
  if (!refreshToken || !email) {
    return res.status(400).json({ success: false, error: 'refreshToken and email parameters required.' });
  }

  let user: UserIdentity | undefined;

  if (DevAdminService.isDevAdminEmail(email)) {
    if (!DevAdminService.isDevAdminEnabled()) {
      return res.status(403).json({ success: false, error: 'DEV_ADMIN unavailable.' });
    }
    user = DevAdminService.getDevAdminUser(email);
  } else {
    user = ENTERPRISE_USERS[email.toLowerCase()];
  }

  if (!user) {
    return res.status(401).json({ success: false, error: 'User does not exist.' });
  }

  const tokenPair = await IdentityService.rotateTokens(refreshToken, user);
  if (!tokenPair) {
    return res.status(401).json({
      success: false,
      error: 'Token Rotation Expired or Reused: Please sign in again to secure your identity.'
    });
  }

  res.json({
    success: true,
    accessToken: tokenPair.accessToken,
    refreshToken: tokenPair.refreshToken,
    expiresAt: tokenPair.expiresAt
  });
});

/**
 * Endpoint: POST /api/auth/logout
 * Revokes active access token and logs out the user session.
 */
authRouter.post('/logout', ApiGatewayMiddleware.authenticate, async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader!.substring(7);
    const { tenantId, sessionId } = req.body;

    await IdentityService.revokeToken(token);
    
    if (tenantId && sessionId) {
      await IdentityService.terminateSession(tenantId, sessionId);
    }

    res.json({ success: true, message: 'Identity successfully revoked. Session logged out.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Endpoint: GET /api/auth/sessions
 * Returns the list of active device sessions in the current tenant.
 */
authRouter.get('/sessions', ApiGatewayMiddleware.authenticate, async (req, res) => {
  try {
    const tenantId = req.query.tenantId as string || req.user!.tenantId;
    const sessions = await IdentityService.getTenantSessions(tenantId);
    res.json({ success: true, sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Endpoint: POST /api/auth/sessions/terminate
 * Force-terminates a session from another active device.
 */
authRouter.post('/sessions/terminate', ApiGatewayMiddleware.authenticate, async (req, res) => {
  const { sessionId, tenantId } = req.body;
  if (!sessionId || !tenantId) {
    return res.status(400).json({ success: false, error: 'sessionId and tenantId are required.' });
  }

  try {
    await IdentityService.terminateSession(tenantId, sessionId);
    res.json({ success: true, message: `Session ${sessionId} terminated successfully.` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

authRouter.get('/config', (_req, res) => {
  const policy = InfrastructurePolicyService.getPolicy();
  const allowDevAdmin = DevAdminService.isDevAdminEnabled();
  res.json({
    environment: policy.environment,
    allowDevAdmin,
    redisRequired: policy.redisRequired,
    redisBlocksAuthentication: policy.redisBlocksAuthentication,
    devAdminEmail: allowDevAdmin ? DEV_ADMIN_EMAIL : undefined,
    isDev: allowDevAdmin
  });
});

/**
 * Endpoint: GET /api/auth/security-audit
 * Audits the complete cryptographic integrity of the AuditLedger.
 */
authRouter.get('/security-audit', ApiGatewayMiddleware.authenticate, ApiGatewayMiddleware.authorize('compliance', 'view'), async (req, res) => {
  const auditResult = AuditLedger.verifyLedgerIntegrity();
  res.json({
    success: true,
    integrityVerified: auditResult.isValid,
    corruptedIndex: auditResult.corruptedIndex,
    timestamp: new Date().toISOString()
  });
});
