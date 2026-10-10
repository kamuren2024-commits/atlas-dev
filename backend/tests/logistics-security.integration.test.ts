import assert from 'node:assert/strict';
import express from 'express';
import { test } from 'node:test';
import type { AddressInfo } from 'node:net';
import { createLogisticsApiRouter } from '../domains/logistics/api-routes';
import type { DatabaseCore } from '../database/db-core';
import { IdentityService, type UserIdentity } from '../security/identity-service';
import { AuthorizationService } from '../security/authorization-service';

test('Logistics API requires authenticated, authorized, tenant-scoped requests', { timeout: 30000 }, async t => {
  const queries: Array<{ sql: string; params: unknown[] }> = [];
  let writes = 0;
  let workflowMission: Record<string, unknown> | undefined;
  let workflowDelivery: Record<string, unknown> | undefined;
  let workflowCargo: Record<string, unknown> | undefined;
  const database = {
    all: async (sql: string, params: unknown[] = []) => {
      queries.push({ sql, params });
      return [];
    },
    get: async (sql: string, params: unknown[] = []) => {
      queries.push({ sql, params });
      if (sql.includes('FROM logistics_mission WHERE (id = ? OR mission_code = ?)')) {
        return params[2] === 'ketraco' ? workflowMission : undefined;
      }
      if (sql.includes('FROM logistics_delivery') && sql.includes('mission_id = ? AND tenant_id = ?')) {
        return params[1] === 'ketraco' ? workflowDelivery : undefined;
      }
      if (sql.includes('FROM logistics_cargo WHERE (id = ? OR cargo_code = ?)')) {
        return params[2] === 'ketraco' ? workflowCargo : undefined;
      }
      if (sql.includes('SELECT id, status FROM logistics_delivery')) {
        return params[2] === 'ketraco' ? workflowDelivery : undefined;
      }
      return undefined;
    },
    run: async () => {
      writes++;
      return { changes: 0, lastID: 0 };
    },
  } as unknown as DatabaseCore;

  const app = express();
  app.use(express.json());
  app.use('/api/logistics', createLogisticsApiRouter({
    db: database,
    authz: new AuthorizationService(),
    audit: { log: () => undefined },
  }));

  const originalVerifyAccessToken = IdentityService.verifyAccessToken;
  const originalProductionMode = process.env.EVALUATION_OS_PRODUCTION_MODE;
  process.env.EVALUATION_OS_PRODUCTION_MODE = 'false';
  const tokenUsers = new Map<string, UserIdentity>();
  IdentityService.verifyAccessToken = async token => tokenUsers.get(token) || null;

  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    IdentityService.verifyAccessToken = originalVerifyAccessToken;
    if (originalProductionMode === undefined) {
      delete process.env.EVALUATION_OS_PRODUCTION_MODE;
    } else {
      process.env.EVALUATION_OS_PRODUCTION_MODE = originalProductionMode;
    }
    const closed = new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    server.closeAllConnections();
    await closed;
  });
  if (!server.listening) {
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
  }

  const address = server.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${address.port}/api/logistics`;
  const request = (url: string, init?: RequestInit) =>
    fetch(url, { ...init, signal: AbortSignal.timeout(10000) });
  const tokenFor = (tenantId: string, role: string) => {
    const token = `test-token-${tenantId}-${role}`;
    const user: UserIdentity = {
      id: token,
      role,
      tenantId,
      accessLevel: 'LEVEL 04',
      clearance: 'Enterprise Clear',
      authenticated: true,
    };
    tokenUsers.set(token, user);
    return token;
  };

  const unauthenticated = await request(`${baseUrl}/simulation/status`);
  assert.equal(unauthenticated.status, 401);

  const readerToken = tokenFor('ketraco', 'SCM Intelligence Officer');
  const deniedSimulation = await request(`${baseUrl}/simulation/tick`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${readerToken}`, 'Content-Type': 'application/json' },
    body: '{}',
  });
  assert.equal(deniedSimulation.status, 403);
  assert.equal(queries.length, 0, 'unauthorized requests must be rejected before reaching persistence');

  const tenantOverride = await request(`${baseUrl}/simulation/status?tenantId=kengen`, {
    headers: { Authorization: `Bearer ${readerToken}` },
  });
  assert.equal(tenantOverride.status, 403);

  const otherTenantToken = tokenFor('kengen', 'Director Grid Logistics');
  const fleetResponse = await request(`${baseUrl}/fleet/states`, {
    headers: { Authorization: `Bearer ${otherTenantToken}` },
  });
  assert.equal(fleetResponse.status, 200);
  assert.equal(queries.length, 1);
  assert.match(queries[0].sql, /WHERE v\.tenant_id = \?/);
  assert.equal(queries[0].params[0], 'kengen');

  const telemetryResponse = await request(`${baseUrl}/telemetry/ingest`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherTenantToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicleId: 'vehicle-from-another-tenant',
      latitude: -1.2,
      longitude: 36.8,
      speed: 0,
    }),
  });
  assert.equal(telemetryResponse.status, 400);
  assert.match(queries[1].sql, /v\.tenant_id = \?/);
  assert.deepEqual(queries[1].params, ['vehicle-from-another-tenant', 'kengen']);

  const deliveryResponse = await request(`${baseUrl}/deliveries/foreign-delivery`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${otherTenantToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'DELIVERED' }),
  });
  assert.equal(deliveryResponse.status, 404);
  assert.match(queries[2].sql, /tenant_id = \?/);
  assert.deepEqual(queries[2].params, ['foreign-delivery', 'foreign-delivery', 'kengen']);
  assert.equal(writes, 0, 'foreign-tenant requests must not mutate persistence');

  workflowMission = { id: 'mission-1', status: 'IN_TRANSIT' };
  workflowDelivery = { id: 'delivery-1', status: 'IN_TRANSIT' };
  const logisticsDirector = tokenFor('ketraco', 'Director Grid Logistics');

  const unverifiedWorkflow = await request(`${baseUrl}/workflows/DELIVERY_VERIFICATION/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${logisticsDirector}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetEntityId: 'mission-1', parameters: { verified: true, actor: 'forged-user' } }),
  });
  assert.equal(unverifiedWorkflow.status, 503);
  assert.equal((await unverifiedWorkflow.json() as any).error.code, 'DELIVERY_EVIDENCE_NOT_CONFIGURED');
  assert.equal(writes, 0, 'delivery verification must not mutate records without trusted evidence');
  assert.deepEqual(queries.at(-1)?.params, ['mission-1', 'ketraco']);

  const crossTenantVerification = await request(`${baseUrl}/workflows/DELIVERY_VERIFICATION/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${otherTenantToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetEntityId: 'mission-1' }),
  });
  assert.equal(crossTenantVerification.status, 404);
  assert.match(queries.at(-1)?.sql || '', /tenant_id = \?/);
  assert.deepEqual(queries.at(-1)?.params, ['mission-1', 'mission-1', 'kengen']);
  assert.equal(writes, 0, 'cross-tenant verification must not read or mutate another tenant mission');

  const forgedSignature = await request(`${baseUrl}/deliveries/delivery-1`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${logisticsDirector}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      status: 'DELIVERED',
      signoffSignature: 'DIGITAL_SIG_FORGED',
      tenantId: 'ketraco',
    }),
  });
  assert.equal(forgedSignature.status, 400);
  assert.equal((await forgedSignature.json() as any).error.code, 'UNTRUSTED_SIGNOFF_SIGNATURE');
  assert.equal(writes, 0, 'client-supplied signature and status must not establish proof of delivery');

  const forgedDeliveredStatus = await request(`${baseUrl}/deliveries/delivery-1`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${logisticsDirector}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'DELIVERED' }),
  });
  assert.equal(forgedDeliveredStatus.status, 503);
  assert.equal((await forgedDeliveredStatus.json() as any).error.code, 'DELIVERY_EVIDENCE_NOT_CONFIGURED');
  assert.equal(writes, 0, 'delivery state must remain unchanged until trusted e-PoD verification exists');

  workflowCargo = { id: 'cargo-1', weight_kg: 1000 };
  const inferredShortage = await request(`${baseUrl}/workflows/STOCK_SHORTAGE_RECONCILIATION/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${logisticsDirector}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetEntityId: 'cargo-1' }),
  });
  assert.equal(inferredShortage.status, 503);
  assert.equal((await inferredShortage.json() as any).error.code, 'STOCK_SOURCE_NOT_CONFIGURED');
  assert.equal(writes, 0, 'stock workflow must not infer shortage or reserve unverified inventory');

  const invalidShortage = await request(`${baseUrl}/workflows/STOCK_SHORTAGE_RECONCILIATION/execute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${logisticsDirector}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetEntityId: 'cargo-1', parameters: { shortageKg: -5 } }),
  });
  assert.equal(invalidShortage.status, 400);
  assert.equal((await invalidShortage.json() as any).error.code, 'INVALID_SHORTAGE_QUANTITY');
  assert.equal(writes, 0);
});
