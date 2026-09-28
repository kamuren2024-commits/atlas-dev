import { PostgresConnection } from '../../database/postgres';
import { DecisionTrace, hashDecisionTrace } from './contracts';

export interface DecisionTraceRepository {
  append(trace: DecisionTrace): Promise<void>;
  get(decisionId: string): Promise<DecisionTrace | null>;
}

export class PostgresDecisionTraceRepository implements DecisionTraceRepository {
  constructor(private readonly connection: PostgresConnection) {}

  public async append(trace: DecisionTrace): Promise<void> {
    const { traceHash: _traceHash, ...traceWithoutHash } = trace;
    const expectedHash = hashDecisionTrace(traceWithoutHash);
    if (trace.traceHash !== expectedHash) throw new Error('DECISION_TRACE_INTEGRITY_FAILURE');
    await this.connection.query(
      `INSERT INTO decision_traces
        (decision_id, tenant_id, evaluation_id, criteria_version, legal_version, policy_version,
         trace_payload, trace_hash, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9)
       ON CONFLICT (decision_id) DO NOTHING`,
      [
        trace.decisionId,
        trace.tenantId,
        trace.evaluationId,
        trace.criteriaVersion,
        trace.legalVersion,
        trace.policyVersion,
        JSON.stringify(trace),
        trace.traceHash,
        trace.createdAt
      ]
    );
  }

  public async get(decisionId: string): Promise<DecisionTrace | null> {
    const result = await this.connection.query<{ trace_payload: DecisionTrace }>(
      'SELECT trace_payload FROM decision_traces WHERE decision_id = $1',
      [decisionId]
    );
    return result.rows[0]?.trace_payload || null;
  }
}
