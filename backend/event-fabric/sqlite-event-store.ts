/**
 * PHASE 02: SQLITE DURABLE EVENT STORE
 * 
 * Persists canonical events into SQLite (event_ledger) for immutable audit,
 * deterministic event replay, and enterprise state tracking.
 */

import { DatabaseCore } from '../database/db-core';
import { CanonicalEvent } from './types';
import { IEventStore, EventQueryParams } from './persistence';

export class SQLiteEventStore implements IEventStore {
  private db: DatabaseCore;

  constructor() {
    this.db = DatabaseCore.getInstance();
  }

  public async store(event: CanonicalEvent): Promise<void> {
    const aggregateType = (event as any).aggregateType || event.category || 'SYSTEM';
    const aggregateId = (event as any).assetId || (event as any).tenderId || (event as any).contractId || (event as any).aggregateId || event.id;
    const tenantId = (event as any).tenantId || 'ketraco';
    const source = (event as any).source || (event as any).sourceId || 'ATLAS_EVENT_FABRIC';
    const actor = (event as any).actor || 'SYSTEM';
    const correlationId = (event as any).correlationId || (event as any).correlation_id || null;
    const causationId = (event as any).causationId || (event as any).causation_id || null;
    const payloadJson = JSON.stringify((event as any).data || event);

    await this.db.run(
      `INSERT INTO event_ledger (
        event_id, event_type, aggregate_type, aggregate_id, tenant_id,
        timestamp, source, actor, correlation_id, causation_id, payload_json, schema_version
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(event_id) DO NOTHING`,
      [
        event.id,
        event.eventType,
        aggregateType,
        aggregateId,
        tenantId,
        event.timestamp || new Date().toISOString(),
        source,
        actor,
        correlationId,
        causationId,
        payloadJson,
        '1.0',
      ]
    );
  }

  public async retrieve(eventId: string): Promise<CanonicalEvent | null> {
    const row = await this.db.get<any>(
      'SELECT * FROM event_ledger WHERE event_id = ?',
      [eventId]
    );

    if (!row) return null;

    const payload = row.payload_json ? JSON.parse(row.payload_json) : {};
    return {
      id: row.event_id,
      eventType: row.event_type,
      category: row.aggregate_type,
      source: row.source,
      timestamp: row.timestamp,
      severity: payload.severity || 'INFO',
      data: payload,
      ...payload,
    };
  }

  public async query(params: EventQueryParams): Promise<CanonicalEvent[]> {
    const conditions: string[] = ['1=1'];
    const sqlParams: any[] = [];

    if (params.categories && params.categories.length > 0) {
      const placeholders = params.categories.map(() => '?').join(',');
      conditions.push(`aggregate_type IN (${placeholders})`);
      sqlParams.push(...params.categories);
    }

    if (params.eventTypes && params.eventTypes.length > 0) {
      const placeholders = params.eventTypes.map(() => '?').join(',');
      conditions.push(`event_type IN (${placeholders})`);
      sqlParams.push(...params.eventTypes);
    }

    if (params.assetIds && params.assetIds.length > 0) {
      const placeholders = params.assetIds.map(() => '?').join(',');
      conditions.push(`aggregate_id IN (${placeholders})`);
      sqlParams.push(...params.assetIds);
    }

    if (params.startTime) {
      conditions.push('timestamp >= ?');
      sqlParams.push(params.startTime);
    }

    if (params.endTime) {
      conditions.push('timestamp <= ?');
      sqlParams.push(params.endTime);
    }

    const limit = params.limit || 100;
    const offset = params.offset || 0;

    const queryStr = `
      SELECT * FROM event_ledger
      WHERE ${conditions.join(' AND ')}
      ORDER BY timestamp DESC
      LIMIT ? OFFSET ?
    `;
    sqlParams.push(limit, offset);

    const rows = await this.db.all<any>(queryStr, sqlParams);

    return rows.map((row) => {
      const payload = row.payload_json ? JSON.parse(row.payload_json) : {};
      return {
        id: row.event_id,
        eventType: row.event_type,
        category: row.aggregate_type,
        source: row.source,
        timestamp: row.timestamp,
        severity: payload.severity || 'INFO',
        data: payload,
        ...payload,
      };
    });
  }

  public async delete(eventId: string): Promise<void> {
    await this.db.run('DELETE FROM event_ledger WHERE event_id = ?', [eventId]);
  }

  public async archive(olderThan: string): Promise<number> {
    const result = await this.db.run('DELETE FROM event_ledger WHERE timestamp < ?', [olderThan]);
    return result.changes || 0;
  }
}
