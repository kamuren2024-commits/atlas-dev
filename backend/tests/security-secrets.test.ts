import assert from 'node:assert/strict';
import { test } from 'node:test';

import { SecretsManager } from '../security/secrets-manager';
import { decryptValue, encryptValue } from '../../src/core/shared/crypto';

test('missing JWT secret fails closed in production', () => {
  const previousEnv = process.env.NODE_ENV;
  const previousJwtSecret = process.env.JWT_SECRET;

  try {
    delete process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';

    assert.throws(
      () => SecretsManager.getSecret('JWT_SECRET'),
      /Missing required secret JWT_SECRET in production\./,
    );
  } finally {
    if (previousJwtSecret === undefined) {
      delete process.env.JWT_SECRET;
    } else {
      process.env.JWT_SECRET = previousJwtSecret;
    }
    process.env.NODE_ENV = previousEnv ?? 'test';
  }
});

test('development encryption does not silently use a static default secret', () => {
  const previousNodeEnv = process.env.NODE_ENV;
  const previousEncryptionSecret = process.env.ATLAS_ENCRYPTION_SECRET;

  try {
    delete process.env.ATLAS_ENCRYPTION_SECRET;
    process.env.NODE_ENV = 'development';

    const cipher = encryptValue('sensitive value');
    assert.equal(decryptValue(cipher), 'sensitive value');
    assert.doesNotMatch(cipher, /atlas-default-dev-secret-change-in-prod|salience-atlas-v5-enterprise-secret-key-salt|salience-atlas-jwt-secret-secure-random-2026/);
  } finally {
    if (previousEncryptionSecret === undefined) {
      delete process.env.ATLAS_ENCRYPTION_SECRET;
    } else {
      process.env.ATLAS_ENCRYPTION_SECRET = previousEncryptionSecret;
    }
    process.env.NODE_ENV = previousNodeEnv ?? 'test';
  }
});
