/**
 * DATABASE MIGRATIONS FOR MEETING INTELLIGENCE AI INFRASTRUCTURE
 * - AI Execution Envelopes (traceable AI request/response metadata)
 * - AI Output Proposals (proposed intelligence awaiting human confirmation)
 */

export async function migrateAiExecutionInfrastructure(db: any): Promise<void> {
  const tables = [
    {
      name: 'ai_execution_envelopes',
      sql: `
        CREATE TABLE IF NOT EXISTS ai_execution_envelopes (
          envelope_id TEXT PRIMARY KEY,
          request_id TEXT NOT NULL,
          meeting_id TEXT NOT NULL,
          tenant_id TEXT NOT NULL,
          context_version TEXT,
          task_type TEXT,
          provider_id TEXT,
          model_id TEXT,
          started_at TEXT,
          completed_at TEXT,
          latency_ms INTEGER,
          output_status TEXT,
          validation_status TEXT,
          proposal_count INTEGER,
          authorization_basis TEXT,
          metadata_json TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (meeting_id) REFERENCES meetings(id),
          FOREIGN KEY (tenant_id) REFERENCES tenants(id)
        )
      `,
    },
    {
      name: 'ai_output_proposals',
      sql: `
        CREATE TABLE IF NOT EXISTS ai_output_proposals (
          proposal_id TEXT PRIMARY KEY,
          envelope_id TEXT NOT NULL,
          meeting_id TEXT NOT NULL,
          tenant_id TEXT NOT NULL,
          item_type TEXT,
          title TEXT,
          description TEXT,
          confidence REAL,
          linked_entity TEXT,
          category TEXT,
          model_id TEXT,
          provider_id TEXT,
          status TEXT DEFAULT 'PROPOSED',
          proposed_at TEXT,
          approved_by TEXT,
          approved_at TEXT,
          edited_data TEXT,
          metadata_json TEXT,
          created_at TEXT DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (envelope_id) REFERENCES ai_execution_envelopes(envelope_id),
          FOREIGN KEY (meeting_id) REFERENCES meetings(id),
          FOREIGN KEY (tenant_id) REFERENCES tenants(id)
        )
      `,
    },
  ];

  for (const table of tables) {
    try {
      await db.run(table.sql);
      console.log(`[MIGRATION] Created table: ${table.name}`);
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        console.log(`[MIGRATION] Table ${table.name} already exists, skipping.`);
      } else {
        console.warn(`[MIGRATION] Warning creating ${table.name}:`, err?.message);
      }
    }
  }

  // Add indices
  const indices = [
    { table: 'ai_execution_envelopes', columns: ['tenant_id', 'meeting_id'] },
    { table: 'ai_execution_envelopes', columns: ['created_at'] },
    { table: 'ai_output_proposals', columns: ['meeting_id', 'status'] },
    { table: 'ai_output_proposals', columns: ['tenant_id'] },
  ];

  for (const idx of indices) {
    const indexName = `idx_${idx.table}_${idx.columns.join('_')}`;
    const columnList = idx.columns.join(', ');
    try {
      await db.run(`CREATE INDEX IF NOT EXISTS ${indexName} ON ${idx.table} (${columnList})`);
      console.log(`[MIGRATION] Created index: ${indexName}`);
    } catch (err: any) {
      console.warn(`[MIGRATION] Warning creating index ${indexName}:`, err?.message);
    }
  }
}
