import assert from 'node:assert/strict';
import express from 'express';
import { test } from 'node:test';
import type { AddressInfo } from 'node:net';
import { createProjectSupplyApiRouter } from '../domains/project-supply/api-routes';
import type { DatabaseCore } from '../database/db-core';
import type { KnowledgeGraph } from '../evaluation/knowledge-graph';
import { AuthorizationService } from '../security/authorization-service';
import { IdentityService, type UserIdentity } from '../security/identity-service';

test('Project supply API authenticates requests and isolates project reads by tenant', { timeout: 30000 }, async t => {
  const queries: Array<{ sql: string; params: unknown[] }> = [];
  const database = {
    all: async (sql: string, params: unknown[] = []) => {
      queries.push({ sql, params });
      return [];
    },
    get: async (sql: string, params: unknown[] = []) => {
      queries.push({ sql, params });
      return undefined;
    },
  } as unknown as DatabaseCore;
  const graph = {
    nodes: [{ id: 'proj-a', type: 'PROJECT', properties: { tenantId: 'ketraco' } }],
    edges: [],
  } as unknown as KnowledgeGraph;

  const app = express();
  app.use('/api/project-supply', createProjectSupplyApiRouter({
    db: database,
    kg: graph,
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

  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/project-supply`;
  const tokenFor = (tenantId: string) => {
    const token = `project-test-${tenantId}`;
    tokenUsers.set(token, {
      id: token,
      role: 'SCM Intelligence Officer',
      tenantId,
      accessLevel: 'LEVEL 04',
      clearance: 'Enterprise Clear',
      authenticated: true,
    });
    return token;
  };
  const tenantlessToken = 'project-test-tenantless';
  tokenUsers.set(tenantlessToken, {
    id: tenantlessToken,
    role: 'SCM Intelligence Officer',
    accessLevel: 'LEVEL 04',
    clearance: 'Enterprise Clear',
    authenticated: true,
  });

  const unauthenticated = await fetch(`${baseUrl}/projects/proj-a`);
  assert.equal(unauthenticated.status, 401);
  assert.equal(queries.length, 0, 'unauthenticated requests must not reach persistence');

  const tenantless = await fetch(`${baseUrl}/projects/proj-a`, {
    headers: { Authorization: `Bearer ${tenantlessToken}` },
  });
  assert.equal(tenantless.status, 403);
  assert.equal(queries.length, 0, 'requests without an authenticated tenant must not reach persistence');

  const authorized = await fetch(`${baseUrl}/projects/proj-a`, {
    headers: { Authorization: `Bearer ${tokenFor('ketraco')}` },
  });
  assert.equal(authorized.status, 200);
  const authorizedBody = await authorized.json() as { data: { projectId: string } };
  assert.equal(authorizedBody.data.projectId, 'proj-a');

  const foreignTenant = await fetch(`${baseUrl}/projects/proj-a`, {
    headers: { Authorization: `Bearer ${tokenFor('kengen')}` },
  });
  assert.equal(foreignTenant.status, 404);
  assert.ok(queries.some(query => query.params.includes('kengen')), 'tenant-scoped lookups must use the authenticated tenant');
});
