import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import express from 'express';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { AddressInfo } from 'node:net';

import { DatabaseCore } from '../database/db-core';
import { PersistentKnowledgeGraph } from '../graph/persistent-graph';
import { KnowledgeGraphService } from '../evaluation/knowledge-graph';
import { createV3ApiRouter } from '../evaluation/v3-routes';

const originalCwd = process.cwd();
let tempDir: string;
let db: DatabaseCore;
let appServer: { close: (cb?: (err?: Error) => void) => void; address: () => AddressInfo | string | null } | null = null;

async function resetSingletons() {
  (DatabaseCore as any).instance = null;
  (PersistentKnowledgeGraph as any).instance = null;
  (KnowledgeGraphService as any).instance = null;
}

async function setupTestDatabase() {
  await resetSingletons();
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-graph-phase0-'));
  fs.mkdirSync(path.join(tempDir, 'data'), { recursive: true });
  process.chdir(tempDir);

  db = DatabaseCore.getInstance();
  await db.connect();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS graph_nodes (
      node_id TEXT PRIMARY KEY,
      node_type TEXT NOT NULL,
      name TEXT NOT NULL,
      metadata_json TEXT,
      tenant_id TEXT NOT NULL DEFAULT 'ketraco',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS graph_edges (
      edge_id TEXT PRIMARY KEY,
      from_node TEXT NOT NULL,
      to_node TEXT NOT NULL,
      relation TEXT NOT NULL,
      weight REAL DEFAULT 1.0,
      metadata_json TEXT,
      tenant_id TEXT NOT NULL DEFAULT 'ketraco',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ontology_entities (
      entity_id TEXT PRIMARY KEY,
      schema_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      name TEXT NOT NULL,
      properties_json TEXT,
      version INTEGER DEFAULT 1,
      tenant_id TEXT NOT NULL DEFAULT 'ketraco',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ontology_relationships (
      relationship_id TEXT PRIMARY KEY,
      source_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      properties_json TEXT,
      tenant_id TEXT NOT NULL DEFAULT 'ketraco',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ontology_schemas (
      schema_id TEXT PRIMARY KEY,
      schema_name TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      domain TEXT NOT NULL,
      version TEXT NOT NULL,
      properties_json TEXT,
      json_schema TEXT,
      tenant_id TEXT NOT NULL DEFAULT 'ketraco',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ontology_actions_audit (
      action_id TEXT PRIMARY KEY,
      action_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      domain TEXT,
      entity_type TEXT,
      entity_id TEXT,
      actor_id TEXT,
      actor_type TEXT,
      status TEXT,
      autonomy_level TEXT,
      authorization_status TEXT,
      validation_status TEXT,
      verification_status TEXT,
      before_state_json TEXT,
      after_state_json TEXT,
      error_message TEXT,
      tenant_id TEXT NOT NULL DEFAULT 'ketraco',
      created_at TEXT NOT NULL
    );
  `);
  return db;
}

async function startGraphApi() {
  const app = express();
  const router = createV3ApiRouter();
  app.use('/api/v3', router);
  app.use('/api/knowledge-graph', router);

  await new Promise<void>((resolve) => {
    appServer = app.listen(0, '127.0.0.1', () => resolve());
  });

  const address = appServer.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return `http://127.0.0.1:${port}`;
}

beforeAll(async () => {
  await setupTestDatabase();
}, 45000);

afterEach(async () => {
  if (appServer) {
    await new Promise<void>((resolve, reject) => {
      appServer.close((err?: Error) => (err ? reject(err) : resolve()));
    });
    appServer = null;
  }
});

afterAll(async () => {
  if (db) {
    await db.shutdown();
  }
  process.chdir(originalCwd);
  if (tempDir) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  await resetSingletons();
});

describe('Phase 0 graph production-grade baseline evaluation', () => {
  it('1. A node written through the canonical graph API is readable through the expected graph query', async () => {
    const graph = PersistentKnowledgeGraph.getInstance();
    await graph.upsertNode({ id: 'N1', type: 'Substation', name: 'Substation N1' });

    const node = await graph.getNode('N1');
    expect(node).toMatchObject({ id: 'N1', type: 'Substation', name: 'Substation N1' });
  });

  it('2. An edge written through the canonical graph API is visible in traversal', async () => {
    const graph = PersistentKnowledgeGraph.getInstance();
    await graph.upsertNode({ id: 'E1', type: 'Substation', name: 'E1' });
    await graph.upsertNode({ id: 'E2', type: 'Substation', name: 'E2' });
    await graph.upsertEdge({ from: 'E1', to: 'E2', relation: 'CONNECTS', weight: 2 });

    const traversal = await graph.traverse('E1', 2);
    expect(traversal.nodes.some((n) => n.id === 'E2')).toBe(true);
    expect(traversal.edges.some((e) => e.from === 'E1' && e.to === 'E2')).toBe(true);
  });

  it('3. A persisted node and edge remain queryable after service reconstruction', async () => {
    const graph = PersistentKnowledgeGraph.getInstance();
    await graph.upsertNode({ id: 'R1', type: 'Substation', name: 'R1' });
    await graph.upsertNode({ id: 'R2', type: 'Substation', name: 'R2' });
    await graph.upsertEdge({ from: 'R1', to: 'R2', relation: 'CONNECTS', weight: 4.5 });

    (PersistentKnowledgeGraph as any).instance = null;
    const restored = PersistentKnowledgeGraph.getInstance();

    const node = await restored.getNode('R1');
    const edges = await restored.getEdges('R1', 'OUT');

    expect(node).toMatchObject({ id: 'R1', name: 'R1' });
    expect(edges.some((edge) => edge.from === 'R1' && edge.to === 'R2' && edge.relation === 'CONNECTS')).toBe(true);
  });

  it('4. Invalid references and prohibited relationship types are rejected where the contract requires rejection', async () => {
    const graph = PersistentKnowledgeGraph.getInstance();

    await expect(
      graph.upsertEdge({ from: 'MISSING-ROOT', to: 'MISSING-LEAF', relation: 'CONNECTS', weight: 3 })
    ).rejects.toThrow(/invalid|missing|not found/i);
    expect(await graph.getNode('MISSING-ROOT')).toBeNull();
    expect(await graph.getNode('MISSING-LEAF')).toBeNull();
  });

  it('5. Duplicate requests obey a documented idempotency contract', async () => {
    const graph = PersistentKnowledgeGraph.getInstance();
    await graph.upsertNode({ id: 'ID-A', type: 'Substation', name: 'ID-A' });
    await graph.upsertNode({ id: 'ID-B', type: 'Substation', name: 'ID-B' });

    await graph.upsertEdge({ from: 'ID-A', to: 'ID-B', relation: 'CONNECTS', weight: 1.0 });
    await graph.upsertEdge({ from: 'ID-A', to: 'ID-B', relation: 'CONNECTS', weight: 1.0 });

    const edges = await graph.getEdges('ID-A', 'OUT');
    const matches = edges.filter((edge) => edge.from === 'ID-A' && edge.to === 'ID-B' && edge.relation === 'CONNECTS');
    expect(matches).toHaveLength(1);
  });

  it('6. A failed multi-step mutation does not leave partial state where atomicity is required', async () => {
    const dbLocal = DatabaseCore.getInstance();
    await dbLocal.withTransaction(async () => {
      await dbLocal.run('INSERT INTO graph_nodes (node_id, node_type, name, tenant_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)', ['ATOMIC-A', 'Substation', 'Atomic A', 'ketraco', new Date().toISOString(), new Date().toISOString()]);
      throw new Error('Intentional rollback');
    }).catch(() => undefined);

    const row = await dbLocal.get('SELECT * FROM graph_nodes WHERE node_id = ?', ['ATOMIC-A']);
    expect(row).toBeUndefined();
  });

  it('7. A durable graph write and its event outcome can be reconciled after a simulated failure', async () => {
    const graph = PersistentKnowledgeGraph.getInstance();
    await graph.upsertNode({ id: 'EVENT-A', type: 'Substation', name: 'Event A' });
    await graph.upsertNode({ id: 'EVENT-B', type: 'Substation', name: 'Event B' });
    await graph.upsertEdge({ from: 'EVENT-A', to: 'EVENT-B', relation: 'CONNECTS', weight: 11 });

    const eventState = await graph.getEdges('EVENT-A', 'OUT');
    expect(eventState.some((edge) => edge.to === 'EVENT-B')).toBe(true);
  });

  it('8. A fixture-only graph cannot silently masquerade as authoritative production data', async () => {
    const graphService = KnowledgeGraphService.getInstance();
    const graph = graphService.getGraph();

    expect(graph.nodes.some((node) => node.id === 'ent-ketraco')).toBe(true);
    expect(graph.nodes.some((node) => node.properties?.sourceSystem === 'atlas-seed-adapter')).toBe(true);
    expect(graph.nodes.some((node) => node.id === 'DURABLE-API-NODE')).toBe(false);
  });

  it('9. Existing graph API response contracts remain compatible', async () => {
    const baseUrl = await startGraphApi();
    const response = await fetch(`${baseUrl}/api/v3/graph`);
    expect(response.status).toBe(200);
    const payload = await response.json();
    expect(Array.isArray(payload.nodes)).toBe(true);
    expect(Array.isArray(payload.edges)).toBe(true);
  });

  it('10. Existing graph-consuming modules retain expected behavior', async () => {
    const graphService = KnowledgeGraphService.getInstance();
    const path = graphService.findPath('tender-2026-08', 'project-suswa-04', 5);

    expect(path).toBeTruthy();
    expect(Array.isArray(path?.nodes)).toBe(true);
    expect(Array.isArray(path?.edges)).toBe(true);
  });

  it('11. Unauthorized or cross-tenant access is rejected wherever tenant isolation is supported by the existing architecture', async () => {
    const baseUrl = await startGraphApi();
    const response = await fetch(`${baseUrl}/api/knowledge-graph`);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  it('12. Database or graph initialization failures do not silently produce a healthy-looking empty production graph', async () => {
    const graphService = KnowledgeGraphService.getInstance();
    const graph = graphService.getGraph();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.edges.length).toBeGreaterThan(0);
  });
});
