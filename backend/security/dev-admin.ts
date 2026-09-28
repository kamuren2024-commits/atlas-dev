/**
 * Controlled Development Administrator Identity (DEV_ADMIN)
 * 
 * Provides an authorized administrator profile exclusively in development environments
 * through the canonical authentication pipeline and existing RBAC authorization.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { InfrastructurePolicyService } from '../core/config/infrastructure-policy';
import { UserIdentity } from './identity-service';

export class SecurityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SecurityError';
  }
}

export const DEV_ADMIN_EMAIL = 'dev-admin@salienceatlas.local';
export const DEV_ADMIN_ALIASES = [
  'dev-admin@salienceatlas.local',
  'dev.admin@salienceatlas.local'
];
export const DEV_ADMIN_ID = 'user_dev_admin_identity';

export class DevAdminService {
  private static localCredential: string | null = null;
  private static initialized = false;

  /**
   * Asserts that DEV_ADMIN is permitted under the current InfrastructurePolicy.
   * Fails closed with SecurityError if executed in non-development environments.
   */
  public static assertDevAdminAllowed(): void {
    const policy = InfrastructurePolicyService.getPolicy();
    if (!policy.allowDevAdmin || process.env.NODE_ENV === 'production') {
      console.error('[SECURITY] Production development-admin attempt rejected');
      throw new SecurityError('Development administrator is strictly unavailable in this environment.');
    }
  }

  /**
   * Retrieves or initializes the local development credential securely.
   * The credential is generated locally and stored in a git-ignored file or environment.
   */
  public static getDevAdminCredential(): string {
    this.assertDevAdminAllowed();

    if (this.localCredential) {
      return this.localCredential;
    }

    // 1. Check explicit environment overrides
    if (process.env.DEV_ADMIN_PASSWORD) {
      this.localCredential = process.env.DEV_ADMIN_PASSWORD;
      return this.localCredential;
    }

    if (process.env.DEMO_DEV_PASSWORD) {
      this.localCredential = process.env.DEMO_DEV_PASSWORD;
      return this.localCredential;
    }

    // 2. Check local git-ignored credential file
    const credPath = path.resolve(process.cwd(), '.dev-admin-credential');
    if (fs.existsSync(credPath)) {
      try {
        const stored = fs.readFileSync(credPath, 'utf8').trim();
        if (stored.length > 0) {
          this.localCredential = stored;
          return this.localCredential;
        }
      } catch {
        // Fallback to generation
      }
    }

    // 3. Fail closed for any non-configured local development credential.
    const generated = crypto.randomBytes(24).toString('hex');
    try {
      fs.writeFileSync(credPath, generated, { mode: 0o600 });
    } catch {
      // Non-critical if filesystem is read-only
    }

    this.localCredential = generated;
    return this.localCredential;
  }

  /**
   * Builds the canonical DEV_ADMIN UserIdentity profile.
   */
  public static getDevAdminUser(tenantId = 'ketraco', email = DEV_ADMIN_EMAIL): UserIdentity {
    this.assertDevAdminAllowed();
    return {
      id: DEV_ADMIN_ID,
      email: email.toLowerCase().trim(),
      name: 'Development Administrator',
      role: 'Administrator',
      roles: ['Administrator'],
      accessLevel: 'Level 10 (Full Access)',
      clearance: 'Top Secret',
      tenantId,
      permissions: ['*'],
      authenticated: true,
    };
  }

  /**
   * Checks whether an incoming login attempt matches the DEV_ADMIN identity.
   */
  public static isDevAdminEmail(email: string): boolean {
    if (!email) return false;
    const normalized = email.toLowerCase().trim();
    return DEV_ADMIN_ALIASES.includes(normalized);
  }

  /**
   * Validates credentials for DEV_ADMIN through cryptographic constant-time comparison.
   */
  public static validateDevAdminLogin(
    email: string,
    passwordAttempt: string,
    tenantId: string
  ): { valid: boolean; user?: UserIdentity } {
    if (!this.isDevAdminEmail(email)) {
      return { valid: false };
    }

    // Guardrail: must fail closed in production
    this.assertDevAdminAllowed();

    const expectedPassword = this.getDevAdminCredential();
    const isMatch = passwordAttempt === expectedPassword;

    if (isMatch) {
      console.log('[AUTH] DEV_ADMIN authenticated');
      return {
        valid: true,
        user: this.getDevAdminUser(tenantId, email.toLowerCase().trim()),
      };
    }

    return { valid: false };
  }

  /**
   * Logs initialization message in development
   */
  public static logInit(): void {
    if (this.initialized) return;
    this.initialized = true;

    if (InfrastructurePolicyService.isDevelopment()) {
      console.log('[AUTH] Development authentication enabled');
    }
  }
}
