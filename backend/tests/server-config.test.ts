import assert from 'node:assert/strict';
import express from 'express';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import { createApiReadinessMiddleware } from '../core/config/api-readiness';
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

test('API routes return retryable unavailability until registration completes', async () => {
  let routesReady = false;
  const app = express();
  app.get('/api/health', (_req, res) => res.status(503).json({ status: 'starting' }));
  app.use('/api', createApiReadinessMiddleware(() => routesReady));
  app.get('/api/auth/config', (_req, res) => res.json({ allowDevAdmin: true }));

  const server = app.listen(0, '127.0.0.1');
  try {
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
    const address = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${address.port}`;
    const healthResponse = await fetch(`${url}/api/health`);
    assert.equal(healthResponse.status, 503);

    const startingResponse = await fetch(`${url}/api/auth/config`);
    assert.equal(startingResponse.status, 503);
    assert.equal(startingResponse.headers.get('retry-after'), '1');
    assert.deepEqual(await startingResponse.json(), {
      status: 'starting',
      error: {
        code: 'API_STARTING',
        message: 'API routes are not ready yet.',
      },
    });

    routesReady = true;
    const readyResponse = await fetch(`${url}/api/auth/config`);
    assert.equal(readyResponse.status, 200);
    assert.deepEqual(await readyResponse.json(), { allowDevAdmin: true });

    const unknownResponse = await fetch(`${url}/api/unknown`);
    assert.equal(unknownResponse.status, 404);
  } finally {
    await new Promise<void>((resolve, reject) => {
      if (!server.listening) {
        resolve();
        return;
      }
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
});
