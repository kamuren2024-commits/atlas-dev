import { PoolClient } from 'pg';

export interface OutboxEvent {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  eventVersion: number;
  payload: unknown;
}

export async function appendOutboxEvent(client: PoolClient, event: OutboxEvent): Promise<void> {
  await client.query(
    `INSERT INTO outbox_events
      (event_id, aggregate_id, aggregate_type, event_type, event_version, payload)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      event.eventId,
      event.aggregateId,
      event.aggregateType,
      event.eventType,
      event.eventVersion,
      JSON.stringify(event.payload)
    ]
  );
}
