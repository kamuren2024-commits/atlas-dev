import assert from 'node:assert/strict';
import sqlite3 from 'sqlite3';
import { test } from 'node:test';
import { DatabaseAuditLogger } from '../observability/database-audit-logger';

async function run(connection: sqlite3.Database, sql: string, params: unknown[] = []) {
  return new Promise<{ lastID: number; changes: number }>((resolve, reject) => {
    connection.run(sql, params, function (error) {
      if (error) {
        reject(error);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function get<T>(connection: sqlite3.Database, sql: string, params: unknown[] = []) {
  return new Promise<T | undefined>((resolve, reject) => {
    connection.get(sql, params, (error, row) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(row as T | undefined);
    });
  });
}

test('database audit logger persists canonical audit entries', async () => {
  const connection = new sqlite3.Database(':memory:');
  await run(connection, `
    CREATE TABLE audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      action TEXT NOT NULL,
      document_id TEXT,
      document_name TEXT,
      details TEXT,
      category TEXT,
      signature TEXT,
      updated_at TEXT NOT NULL
    );
  `);
  await run(connection, `
    CREATE TABLE atlas_command_audit (
      audit_id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      action TEXT NOT NULL,
      previous_state_json TEXT NOT NULL,
      resulting_state_json TEXT NOT NULL,
      reason TEXT NOT NULL,
      authorization_context_json TEXT NOT NULL,
      correlation_id TEXT NOT NULL,
      command_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      source TEXT NOT NULL
    );
  `);

  const logger = DatabaseAuditLogger.create({
    run: async (sql: string, params: unknown[] = []) => run(connection, sql, params),
  } as any);

  logger.log({
    actorId: 'user-42',
    action: 'project-supply:nexus:get',
    tenantId: 'tenant-a',
    projectId: 'project-a',
    resourceType: 'project',
    resourceId: 'project-a',
    metadata: { source: 'project-360' },
    correlationId: 'corr-42',
    source: 'atlas.audit-logger',
  });

  await new Promise(resolve => setTimeout(resolve, 25));

  const auditCount = await get<{ count: number }>(connection, 'SELECT COUNT(*) AS count FROM audit_logs');
  const projectAuditCount = await get<{ count: number }>(connection, 'SELECT COUNT(*) AS count FROM atlas_command_audit');

  assert.equal(auditCount?.count, 1);
  assert.equal(projectAuditCount?.count, 1);

  const record = await get<{ user: string; action: string }>(connection, 'SELECT user, action FROM audit_logs LIMIT 1');
  assert.equal(record?.user, 'user-42');
  assert.equal(record?.action, 'project-supply:nexus:get');

  const projectAudit = await get<{ tenant_id: string; project_id: string; action: string }>(
    connection,
    'SELECT tenant_id, project_id, action FROM atlas_command_audit LIMIT 1',
  );
  assert.equal(projectAudit?.tenant_id, 'tenant-a');
  assert.equal(projectAudit?.project_id, 'project-a');
  assert.equal(projectAudit?.action, 'project-supply:nexus:get');

  await new Promise<void>((resolve, reject) => {
    connection.close((error) => (error ? reject(error) : resolve()));
  });
});
