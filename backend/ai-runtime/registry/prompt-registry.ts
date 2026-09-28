import { DatabaseCore } from '../../database/db-core';
import { PromptTemplate } from '../types';

export class PromptRegistry {
  private static db = DatabaseCore.getInstance();

  static async register(prompt: Omit<PromptTemplate, 'id'>): Promise<string> {
    const id = `prompt_${prompt.name}_v${prompt.version}`;
    await this.db.run(
      `INSERT INTO prompt_registry (id, name, version, content, system_instruction, parameters_json, owner, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         content = excluded.content,
         system_instruction = excluded.system_instruction,
         parameters_json = excluded.parameters_json,
         owner = excluded.owner,
         status = excluded.status,
         updated_at = CURRENT_TIMESTAMP`,
      [
        id,
        prompt.name,
        prompt.version,
        prompt.content,
        prompt.systemInstruction || null,
        JSON.stringify(prompt.parameters || {}),
        prompt.owner || 'SYSTEM',
        prompt.status
      ]
    );
    return id;
  }

  static async getPrompt(name: string, version?: number): Promise<PromptTemplate | null> {
    let row;
    if (version) {
      row = await this.db.get(
        'SELECT * FROM prompt_registry WHERE name = ? AND version = ?',
        [name, version]
      );
    } else {
      // Get latest active version
      row = await this.db.get(
        'SELECT * FROM prompt_registry WHERE name = ? AND status = "ACTIVE" ORDER BY version DESC LIMIT 1',
        [name]
      );
    }

    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      version: row.version,
      content: row.content,
      systemInstruction: row.system_instruction,
      parameters: JSON.parse(row.parameters_json),
      owner: row.owner,
      status: row.status as any
    };
  }

  static async listPrompts(): Promise<PromptTemplate[]> {
    const rows = await this.db.all('SELECT * FROM prompt_registry');
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      version: row.version,
      content: row.content,
      systemInstruction: row.system_instruction,
      parameters: JSON.parse(row.parameters_json),
      owner: row.owner,
      status: row.status as any
    }));
  }
}
