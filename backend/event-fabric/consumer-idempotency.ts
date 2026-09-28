import { PoolClient } from 'pg';

export async function claimConsumerEvent(
  client: PoolClient,
  consumerGroup: string,
  eventId: string
): Promise<boolean> {
  const result = await client.query(
    `INSERT INTO event_consumer_receipts (consumer_group, event_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [consumerGroup, eventId]
  );
  return result.rowCount === 1;
}
