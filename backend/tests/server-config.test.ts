import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveHealthCheckStatus } from '../core/config/health-check';
import { resolveHttpServerConfig } from '../core/config/http-server-config';

test('HTTP server config defaults to the documented local address', () => {
  assert.deepEqual(resolveHttpServerConfig({}), { host: '0.0.0.0', port: 3000 });
});

test('HTTP server config honors platform-provided host and port', () => {
  assert.deepEqual(resolveHttpServerConfig({ HOST: '127.0.0.1', PORT: '8080' }), {
    host: '127.0.0.1',
    port: 8080,
  });
});

test('HTTP server config rejects invalid ports instead of silently using the default', () => {
  for (const PORT of ['0', '-1', '65536', '3000.5', 'invalid']) {
    assert.throws(() => resolveHttpServerConfig({ PORT }), /PORT must be an integer/);
  }
});

test('health checks remain unready until the database and system are healthy', () => {
  assert.deepEqual(resolveHealthCheckStatus('INITIALIZING', 'STARTING'), {
    status: 'starting',
    httpStatus: 503,
  });
  assert.deepEqual(resolveHealthCheckStatus('DEGRADED', 'DEGRADED'), {
    status: 'degraded',
    httpStatus: 503,
  });
  assert.deepEqual(resolveHealthCheckStatus('UP', 'NOMINAL'), {
    status: 'healthy',
    httpStatus: 200,
  });
});

test('a nominal system with an unavailable database is not reported ready', () => {
  assert.deepEqual(resolveHealthCheckStatus('DEGRADED', 'NOMINAL'), {
    status: 'degraded',
    httpStatus: 503,
  });
});
