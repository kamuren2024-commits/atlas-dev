import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AuthorizationService } from '../security/authorization-service';
import {
  DEV_ADMIN_EMAIL,
  DEV_ADMIN_ID,
  DEV_ADMIN_PERMISSIONS,
  DevAdminService
} from '../security/dev-admin';
import { InfrastructurePolicyService } from '../core/config/infrastructure-policy';

test('DEV_ADMIN requires explicit development and receives scoped permissions', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalDemoPassword = process.env.DEMO_DEV_PASSWORD;
  const originalTenant = process.env.DEV_ADMIN_TENANT_ID;

  try {
    process.env.NODE_ENV = 'development';
    process.env.DEMO_DEV_PASSWORD = 'test-only-dev-admin-passphrase';
    process.env.DEV_ADMIN_TENANT_ID = 'dev-sandbox';
    InfrastructurePolicyService.resetPolicyForTesting();

    assert.equal(DevAdminService.isDevAdminEnabled(), true);
    const valid = DevAdminService.validateDevAdminLogin(DEV_ADMIN_EMAIL, 'test-only-dev-admin-passphrase');
    assert.equal(valid.valid, true);
    assert.equal(valid.user?.id, DEV_ADMIN_ID);
    assert.equal(valid.user?.tenantId, 'dev-sandbox');
    assert.deepEqual(valid.user?.permissions, DEV_ADMIN_PERMISSIONS);

    assert.equal(
      AuthorizationService.checkPermission(valid.user!, 'debug', 'development').isAuthorized,
      true
    );
    assert.equal(
      AuthorizationService.checkPermission(valid.user!, 'read', 'project', { tenantId: 'other-tenant' }).isAuthorized,
      false
    );
    assert.equal(
      AuthorizationService.checkPermission(valid.user!, 'approve', 'finance_payment').isAuthorized,
      false
    );
    assert.equal(
      DevAdminService.validateDevAdminLogin(DEV_ADMIN_EMAIL, 'incorrect-passphrase').valid,
      false
    );

    process.env.NODE_ENV = 'production';
    InfrastructurePolicyService.resetPolicyForTesting();
    assert.equal(DevAdminService.isDevAdminEnabled(), false);
    assert.throws(
      () => DevAdminService.validateDevAdminLogin(DEV_ADMIN_EMAIL, 'test-only-dev-admin-passphrase'),
      /strictly unavailable/
    );
    assert.equal(
      AuthorizationService.checkPermission(valid.user!, 'debug', 'development').isAuthorized,
      false
    );

    delete process.env.NODE_ENV;
    InfrastructurePolicyService.resetPolicyForTesting();
    assert.equal(DevAdminService.isDevAdminEnabled(), false);
    assert.throws(
      () => DevAdminService.validateDevAdminLogin(DEV_ADMIN_EMAIL, 'test-only-dev-admin-passphrase'),
      /strictly unavailable/
    );
  } finally {
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalDemoPassword === undefined) delete process.env.DEMO_DEV_PASSWORD;
    else process.env.DEMO_DEV_PASSWORD = originalDemoPassword;
    if (originalTenant === undefined) delete process.env.DEV_ADMIN_TENANT_ID;
    else process.env.DEV_ADMIN_TENANT_ID = originalTenant;
    InfrastructurePolicyService.resetPolicyForTesting();
  }
});