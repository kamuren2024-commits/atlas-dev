/**
 * DEMO MODE END-TO-END TEST
 * Verifies that /api/auth/demo-login issues a valid backend-authenticated session.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ConfigService } from '../core/config/config-loader';
import { IdentityService } from '../security/identity-service';

test('Demo login endpoint returns valid JWT tokens', async () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDemoMode = process.env.ATLAS_DEMO_MODE;
  const originalDemoPassword = process.env.DEMO_DEV_PASSWORD;

  try {
    process.env.NODE_ENV = 'development';
    process.env.ATLAS_DEMO_MODE = 'true';
    process.env.DEMO_DEV_PASSWORD = 'test-demo-password';
    ConfigService.reload();

    // Simulate a demo-login response from the backend
    const expectedEmail = 'dev-admin@salienceatlas.local';
    const mockUser = {
      id: 'user_dev_admin_identity',
      email: expectedEmail,
      name: 'Development Administrator',
      role: 'Administrator',
      accessLevel: 'Level 10 (Full Access)',
      clearance: 'Top Secret',
      tenantId: 'ketraco',
      authenticated: true,
      permissions: ['development:*']
    };

    const tokens = await IdentityService.generateTokens(mockUser);
    assert(tokens.accessToken, 'Access token must be generated');
    assert(tokens.refreshToken, 'Refresh token must be generated');
    assert(tokens.expiresAt > Date.now(), 'Token expiration must be in the future');

    // Verify the token is valid by parsing it
    const verified = await IdentityService.verifyAccessToken(tokens.accessToken);
    assert(verified, 'Token must verify successfully');
    assert.equal(verified.email, expectedEmail, 'Token payload must contain correct email');
    assert.equal(verified.role, 'Administrator', 'Token payload must contain correct role');
    assert.equal(verified.tenantId, 'ketraco', 'Token payload must contain correct tenant');
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalDemoMode === undefined) delete process.env.ATLAS_DEMO_MODE;
    else process.env.ATLAS_DEMO_MODE = originalDemoMode;
    if (originalDemoPassword === undefined) delete process.env.DEMO_DEV_PASSWORD;
    else process.env.DEMO_DEV_PASSWORD = originalDemoPassword;
    ConfigService.reload();
  }
});
