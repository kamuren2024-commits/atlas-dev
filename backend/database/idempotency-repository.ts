import { PoolClient } from 'pg';

export interface IdempotencyRecord {
  tenantId: string;
  operation: string;
  key: string;
  requestHash: string;
  actorId: string;
  resultReference?: string;
  expiresAt: Date;
}

export async function claimIdempotencyKey(
  client: PoolClient,
  record: IdempotencyRecord
): Promise<'CLAIMED' | 'REPLAY' | 'CONFLICT'> {
  const existing = await client.query<{ request_hash: string; result_reference: string | null }>(
    `SELECT request_hash, result_reference
       FROM idempotency_records
      WHERE tenant_id = $1 AND operation = $2 AND idempotency_key = $3
        AND expires_at > NOW()
      FOR UPDATE`,
    [record.tenantId, record.operation, record.key]
  );
  if (existing.rows.length > 0) {
    return existing.rows[0].request_hash === record.requestHash ? 'REPLAY' : 'CONFLICT';
  }
  await client.query(
    `INSERT INTO idempotency_records
      (tenant_id, operation, idempotency_key, request_hash, actor_id, expires_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [record.tenantId, record.operation, record.key, record.requestHash, record.actorId, record.expiresAt]
  );
  return 'CLAIMED';
}

export async function completeIdempotencyKey(
  client: PoolClient,
  record: Pick<IdempotencyRecord, 'tenantId' | 'operation' | 'key'>,
  resultReference: string
): Promise<void> {
  await client.query(
    `UPDATE idempotency_records
        SET result_reference = $4
      WHERE tenant_id = $1 AND operation = $2 AND idempotency_key = $3`,
    [record.tenantId, record.operation, record.key, resultReference]
  );
}
