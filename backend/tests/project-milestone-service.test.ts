import assert from 'node:assert/strict';
import express from 'express';
import sqlite3 from 'sqlite3';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import { createProjectSupplyApiRouter } from '../domains/project-supply/api-routes';
import type { DatabaseCore } from '../database/db-core';
import { ProjectScheduleMigration } from '../database/migration-016-project-schedule';
import type { KnowledgeGraph } from '../evaluation/knowledge-graph';
import { EventBus } from '../event-fabric/event-bus';
import {
  ProjectMilestoneCommandError,
  ProjectMilestoneService,
} from '../domains/project-supply/project-milestone-service';
import { AuthorizationService } from '../security/authorization-service';
import { IdentityService, type UserIdentity } from '../security/identity-service';

test('persisted milestone forecast command is tenant-scoped, versioned, idempotent, audited, and atomic', { timeout: 30000 }, async t => {
  const connection = new sqlite3.Database(':memory:');
  let failOutboxInsert = false;
  const run = (sql: string, params: unknown[] = []) => new Promise<{ lastID: number; changes: number }>((resolve, reject) => {
    if (failOutboxInsert && sql.includes('INSERT INTO atlas_outbox_events')) {
      failOutboxInsert = false;
      reject(new Error('forced outbox write failure'));
      return;
    }
    connection.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
  const get = <T>(sql: string, params: unknown[] = []) => new Promise<T | undefined>((resolve, reject) => {
    connection.get(sql, params, (error, row) => error ? reject(error) : resolve(row as T | undefined));
  });
  const all = <T>(sql: string, params: unknown[] = []) => new Promise<T[]>((resolve, reject) => {
    connection.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows as T[]));
  });
  const exec = (sql: string) => new Promise<void>((resolve, reject) => {
    connection.exec(sql, error => error ? reject(error) : resolve());
  });
  let transactionTail = Promise.resolve();
  const database = {
    run,
    get,
    all,
    exec,
    withTransaction: async <T>(work: () => Promise<T>): Promise<T> => {
      const previous = transactionTail;
      let release!: () => void;
      transactionTail = new Promise<void>(resolve => { release = resolve; });
      await previous;
      try {
        await exec('BEGIN IMMEDIATE');
        try {
          const result = await work();
          await exec('COMMIT');
          return result;
        } catch (error) {
          await exec('ROLLBACK');
          throw error;
        }
      } finally {
        release();
      }
    },
  } as unknown as DatabaseCore;

  t.after(async () => {
    await new Promise<void>((resolve, reject) => connection.close(error => error ? reject(error) : resolve()));
  });
  await exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE project_supply_project (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE project_supply_requirement (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      project_id TEXT NOT NULL
    );
  `);
  await ProjectScheduleMigration.apply(database);
  await ProjectScheduleMigration.apply(database);
  await run('INSERT INTO project_supply_project (id, tenant_id) VALUES (?, ?)', ['project-a', 'tenant-a']);
  await run(
    `INSERT INTO schedule_milestones
      (id, tenant_id, project_id, name, status, baseline_date, current_date, forecast_date, actual_date,
       owner_id, version, source, authority, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ['milestone-a', 'tenant-a', 'project-a', 'Energization', 'IN_PROGRESS', '2026-05-01', '2026-05-01',
      '2026-05-01', null, 'manager-a', 1, 'ATLAS_INTERNAL', 'ATLAS_PERSISTED_NOT_VERIFIED',
      '2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
  );

  const service = new ProjectMilestoneService(database);
  const context = {
    actorId: 'manager-a',
    actorRole: 'Project Manager',
    tenantId: 'tenant-a',
    correlationId: 'correlation-a',
  };
  const command = {
    projectId: 'project-a',
    milestoneId: 'milestone-a',
    forecastDate: '2026-06-15',
    reason: 'Updated commissioning forecast',
    expectedVersion: 1,
    idempotencyKey: 'forecast-key-001',
  };

  await t.test('reads are constrained to the authenticated tenant and selected project', async () => {
    assert.equal((await service.list('tenant-a', 'project-a', 20, 0)).length, 1);
    assert.equal((await service.list('tenant-b', 'project-a', 20, 0)).length, 0);
    assert.equal(await service.get('tenant-a', 'other-project', 'milestone-a'), null);
  });

  await t.test('commits milestone, audit, outbox, and idempotency together', async () => {
    const result = await service.updateForecast(command, context);
    assert.equal(result.milestone.version, 2);
    assert.equal(result.milestone.forecastDate, '2026-06-15');
    assert.equal(result.replayed, false);
    assert.equal((await get<{ count: number }>('SELECT COUNT(*) AS count FROM atlas_command_audit'))?.count, 1);
    assert.equal((await get<{ count: number }>('SELECT COUNT(*) AS count FROM atlas_outbox_events'))?.count, 1);
  });

  await t.test('replays an identical idempotent command and rejects key reuse', async () => {
    const replay = await service.updateForecast(command, context);
    assert.equal(replay.replayed, true);
    assert.equal(replay.milestone.version, 2);
    await assert.rejects(
      () => service.updateForecast({ ...command, forecastDate: '2026-07-01' }, context),
      (error: unknown) => error instanceof ProjectMilestoneCommandError && error.code === 'IDEMPOTENCY_KEY_REUSED',
    );
    assert.equal((await get<{ count: number }>('SELECT COUNT(*) AS count FROM atlas_command_audit'))?.count, 1);
  });

  await t.test('rejects malformed dates, stale versions, and cross-tenant writes', async () => {
    await assert.rejects(
      () => service.updateForecast({ ...command, forecastDate: '2026-02-31', idempotencyKey: 'invalid-date-key' }, context),
      (error: unknown) => error instanceof ProjectMilestoneCommandError && error.statusCode === 422,
    );
    await assert.rejects(
      () => service.updateForecast({ ...command, idempotencyKey: 'stale-version-key' }, context),
      (error: unknown) => error instanceof ProjectMilestoneCommandError && error.code === 'VERSION_CONFLICT',
    );
    await assert.rejects(
      () => service.updateForecast(command, { ...context, tenantId: 'tenant-b' }),
      (error: unknown) => error instanceof ProjectMilestoneCommandError && error.code === 'PROJECT_NOT_FOUND',
    );
  });

  await t.test('rolls back schedule state when a durable outbox write fails', async () => {
    failOutboxInsert = true;
    await assert.rejects(
      () => service.updateForecast({
        ...command,
        forecastDate: '2026-07-20',
        expectedVersion: 2,
        idempotencyKey: 'outbox-failure-key',
      }, context),
      /forced outbox write failure/,
    );
    assert.equal((await service.get('tenant-a', 'project-a', 'milestone-a'))?.forecastDate, '2026-06-15');
    assert.equal((await service.get('tenant-a', 'project-a', 'milestone-a'))?.version, 2);
    assert.equal((await get<{ count: number }>('SELECT COUNT(*) AS count FROM atlas_command_audit'))?.count, 1);
    assert.equal((await get<{ count: number }>('SELECT COUNT(*) AS count FROM atlas_outbox_events'))?.count, 1);
  });

  await t.test('serializes competing versioned writes so only one version wins', async () => {
    const competing = await Promise.allSettled([
      service.updateForecast({
        ...command,
        forecastDate: '2026-08-01',
        expectedVersion: 2,
        idempotencyKey: 'concurrent-command-a',
      }, context),
      service.updateForecast({
        ...command,
        forecastDate: '2026-08-02',
        expectedVersion: 2,
        idempotencyKey: 'concurrent-command-b',
      }, context),
    ]);
    assert.equal(competing.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(competing.filter(result => result.status === 'rejected').length, 1);
    assert.equal((await service.get('tenant-a', 'project-a', 'milestone-a'))?.version, 3);
  });

  await t.test('enforces authenticated read and update roles at the API boundary', async contextTest => {
    const eventBus = EventBus.getInstance();
    await eventBus.initialize();
    const receivedEvents: string[] = [];
    const subscription = eventBus.subscribe({
      eventTypes: ['ProjectMilestoneUpdated'],
      customFilter: event => event.eventType === 'ProjectMilestoneUpdated' &&
        event.tenantId === 'tenant-a' && event.projectId === 'project-a',
    }, async event => {
      receivedEvents.push(event.id);
    });
    const originalVerify = IdentityService.verifyAccessToken;
    const originalProductionMode = process.env.EVALUATION_OS_PRODUCTION_MODE;
    process.env.EVALUATION_OS_PRODUCTION_MODE = 'false';
    const users = new Map<string, UserIdentity>([
      ['manager-token', {
        id: 'manager-a',
        role: 'Project Manager',
        tenantId: 'tenant-a',
        accessLevel: 'LEVEL 04',
        clearance: 'Enterprise Clear',
        authenticated: true,
      }],
      ['reader-token', {
        id: 'reader-a',
        role: 'SCM Intelligence Officer',
        tenantId: 'tenant-a',
        accessLevel: 'LEVEL 04',
        clearance: 'Enterprise Clear',
        authenticated: true,
      }],
    ]);
    IdentityService.verifyAccessToken = async token => users.get(token) || null;
    const graph = {
      nodes: [{ id: 'project-a', type: 'PROJECT', properties: { tenantId: 'tenant-a' } }],
      edges: [],
    } as unknown as KnowledgeGraph;
    const app = express();
    app.use(express.json());
    app.use('/api/project-supply', createProjectSupplyApiRouter({
      db: database,
      kg: graph,
      authz: new AuthorizationService(),
      audit: { log: () => undefined },
    }));
    const server = app.listen(0, '127.0.0.1');
    contextTest.after(async () => {
      eventBus.unsubscribe(subscription);
      await eventBus.shutdown();
      IdentityService.verifyAccessToken = originalVerify;
      if (originalProductionMode === undefined) delete process.env.EVALUATION_OS_PRODUCTION_MODE;
      else process.env.EVALUATION_OS_PRODUCTION_MODE = originalProductionMode;
      server.closeAllConnections();
      await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    });
    if (!server.listening) {
      await new Promise<void>((resolve, reject) => {
        server.once('listening', resolve);
        server.once('error', reject);
      });
    }
    const baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api/project-supply/projects/project-a/milestones`;
    const readOnly = await fetch(baseUrl, {
      headers: { Authorization: 'Bearer reader-token' },
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(readOnly.status, 200);
    const deniedWrite = await fetch(`${baseUrl}/milestone-a/forecast`, {
      method: 'PATCH',
      headers: { Authorization: 'Bearer reader-token', 'Content-Type': 'application/json' },
      body: JSON.stringify({ forecastDate: '2026-09-01', reason: 'Change forecast', expectedVersion: 3 }),
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(deniedWrite.status, 403);
    const allowedWrite = await fetch(`${baseUrl}/milestone-a/forecast`, {
      method: 'PATCH',
      headers: {
        Authorization: 'Bearer manager-token',
        'Content-Type': 'application/json',
        'Idempotency-Key': 'api-forecast-key',
      },
      body: JSON.stringify({ forecastDate: '2026-09-01', reason: 'Change forecast', expectedVersion: 3 }),
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(allowedWrite.status, 200);
    const result = await allowedWrite.json() as { data: { milestone: { version: number }; auditId: string; eventId: string; eventStatus: string } };
    assert.equal(result.data.milestone.version, 4);
    assert.ok(result.data.auditId);
    assert.ok(result.data.eventId);
    assert.equal(result.data.eventStatus, 'EVENT_ACCEPTED_BY_IN_PROCESS_BUS');
    assert.deepEqual(receivedEvents, [result.data.eventId]);
  });
});
