import { DatabaseCore } from '../../database/db-core';
import { MemoryEntry } from '../types';
import { generateId } from '../../../src/core/shared/crypto';

export class MemoryRuntime {
  private static db = DatabaseCore.getInstance();

  static async store(tenantId: string, workflowId: string, entry: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<string> {
    const id = generateId('mem');
    await this.db.run(
      `INSERT INTO ai_memory (id, tenant_id, workflow_id, type, content, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        tenantId,
        workflowId,
        entry.type,
        entry.content,
        JSON.stringify(entry.metadata || {})
      ]
    );
    return id;
  }

  static async retrieve(tenantId: string, workflowId: string, query: string, limit = 5): Promise<MemoryEntry[]> {
    // Enterprise-grade simple keyword matching for RAG isolation
    const keywords = query.toLowerCase().split(/\W+/).filter(k => k.length > 3);
    
    let rows;
    if (keywords.length > 0) {
      const clauses = keywords.map(() => 'content LIKE ?').join(' OR ');
      const params = keywords.map(k => `%${k}%`);
      rows = await this.db.all(
        `SELECT * FROM ai_memory 
         WHERE tenant_id = ? AND (workflow_id = ? OR workflow_id = 'global')
         AND (${clauses})
         ORDER BY timestamp DESC LIMIT ?`,
        [tenantId, workflowId, ...params, limit]
      );
    } else {
      rows = await this.db.all(
        `SELECT * FROM ai_memory 
         WHERE tenant_id = ? AND (workflow_id = ? OR workflow_id = 'global')
         ORDER BY timestamp DESC LIMIT ?`,
        [tenantId, workflowId, limit]
      );
    }

    return rows.map(row => ({
      id: row.id,
      type: row.type as any,
      content: row.content,
      metadata: JSON.parse(row.metadata_json),
      timestamp: new Date(row.timestamp).getTime()
    }));
  }

  static async clear(tenantId: string, workflowId?: string): Promise<void> {
    if (workflowId) {
      await this.db.run('DELETE FROM ai_memory WHERE tenant_id = ? AND workflow_id = ?', [tenantId, workflowId]);
    } else {
      await this.db.run('DELETE FROM ai_memory WHERE tenant_id = ?', [tenantId]);
    }
  }
}
