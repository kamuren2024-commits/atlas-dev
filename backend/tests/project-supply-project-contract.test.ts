import assert from 'node:assert/strict';
import express from 'express';
import { test } from 'node:test';
import type { AddressInfo } from 'node:net';
import { createProjectSupplyApiRouter } from '../domains/project-supply/api-routes';
import type { DatabaseCore } from '../database/db-core';
import type { KnowledgeGraph } from '../evaluation/knowledge-graph';
import { AuthorizationService } from '../security/authorization-service';
import { IdentityService, type UserIdentity } from '../security/identity-service';

test('Project supply project contract exposes explicit disconnected state instead of silent fixture fallback', { timeout: 30000 }, async t => {
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
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    server.closeAllConnections();
  });

  if (!server.listening) {
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
  }

  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/project-supply`;
  const token = 'project-contract-token';
  tokenUsers.set(token, {
    id: token,
    role: 'SCM Intelligence Officer',
    tenantId: 'ketraco',
    accessLevel: 'LEVEL 04',
    clearance: 'Enterprise Clear',
    authenticated: true,
  });

  const response = await fetch(`${baseUrl}/projects/proj-a`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 200);
  const body = await response.json() as {
    data: {
      projectId: string;
      project: null | { id: string };
      dataStatus: string;
      provenance: { dataSourceState: string };
      snapshot: {
        project: { state: string; data: null };
        health: { overall: string };
        domains: Record<string, { state: string; sourceUpdatedAt: string | null }>;
        freshness: { snapshotGeneratedAt: string; sourceUpdatedAt: string | null };
      };
    };
  };
  assert.equal(body.data.projectId, 'proj-a');
  assert.equal(body.data.project, null);
  assert.equal(body.data.dataStatus, 'NOT_CONNECTED');
  assert.equal(body.data.provenance.dataSourceState, 'NOT_CONNECTED');
  assert.equal(body.data.snapshot.project.state, 'NOT_CONNECTED');
  assert.equal(body.data.snapshot.health.overall, 'UNKNOWN');
  assert.equal(body.data.snapshot.domains.schedule.state, 'NOT_CONNECTED');
  assert.equal(body.data.snapshot.domains.materials.state, 'NOT_CONNECTED');
  assert.equal(body.data.snapshot.domains.dependencies.state, 'NOT_CONNECTED');
  assert.ok(body.data.snapshot.freshness.snapshotGeneratedAt);
  assert.equal(body.data.snapshot.freshness.sourceUpdatedAt, null);
  assert.ok(queries.some(query => query.sql.includes('project_supply_project')));
});

test('Project supply telemetry endpoint is exposed through the canonical API contract', { timeout: 30000 }, async t => {
  const database = {
    get: async () => ({ count: 0 }),
    all: async () => [],
  } as unknown as DatabaseCore;
  const graph = { nodes: [], edges: [] } as unknown as KnowledgeGraph;

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
    await new Promise<void>((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
    server.closeAllConnections();
  });

  if (!server.listening) {
    await new Promise<void>((resolve, reject) => {
      server.once('listening', resolve);
      server.once('error', reject);
    });
  }

  const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/project-supply`;
  const token = 'telemetry-token';
  tokenUsers.set(token, {
    id: token,
    role: 'SCM Intelligence Officer',
    tenantId: 'ketraco',
    accessLevel: 'LEVEL 04',
    clearance: 'Enterprise Clear',
    authenticated: true,
  });

  const response = await fetch(`${baseUrl}/telemetry`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  assert.equal(response.status, 200);
  const body = await response.json() as { data: { status: string; kpis: unknown[]; nodes: unknown[]; edges: unknown[] } };
  assert.equal(body.data.status, 'NOT_CONNECTED');
  assert.ok(Array.isArray(body.data.kpis));
  assert.ok(Array.isArray(body.data.nodes));
  assert.ok(Array.isArray(body.data.edges));
});
