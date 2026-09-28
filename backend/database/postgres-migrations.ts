import { PostgresConnection } from './postgres';

export class PostgresMigrationRunner {
  constructor(private readonly connection: PostgresConnection) {}

  public async migrate(): Promise<void> {
    await this.connection.query(`
      CREATE TABLE IF NOT EXISTS evaluation_schema_migrations (
        version TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS outbox_events (
        event_id UUID PRIMARY KEY,
        aggregate_id TEXT NOT NULL,
        aggregate_type TEXT NOT NULL,
        event_type TEXT NOT NULL,
        event_version INTEGER NOT NULL,
        payload JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        published_at TIMESTAMPTZ,
        attempt_count INTEGER NOT NULL DEFAULT 0,
        last_error TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_outbox_unpublished
        ON outbox_events (created_at) WHERE published_at IS NULL;

      CREATE TABLE IF NOT EXISTS audit_events (
        event_id UUID PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        actor_type TEXT NOT NULL,
        action TEXT NOT NULL,
        resource_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        event_timestamp TIMESTAMPTZ NOT NULL,
        request_id TEXT NOT NULL,
        trace_id TEXT NOT NULL,
        canonical_event JSONB NOT NULL,
        previous_hash TEXT,
        event_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS policy_decisions (
        decision_id UUID PRIMARY KEY,
        policy_id TEXT NOT NULL,
        policy_version TEXT NOT NULL,
        subject JSONB NOT NULL,
        action TEXT NOT NULL,
        resource JSONB NOT NULL,
        tenant_id TEXT NOT NULL,
        input_hash TEXT NOT NULL,
        decision TEXT NOT NULL CHECK (decision IN ('ALLOW', 'DENY', 'REQUIRE_APPROVAL', 'ESCALATE')),
        reason_codes JSONB NOT NULL,
        trace_id TEXT NOT NULL,
        decided_at TIMESTAMPTZ NOT NULL
      );

      CREATE TABLE IF NOT EXISTS idempotency_records (
        tenant_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        idempotency_key TEXT NOT NULL,
        request_hash TEXT NOT NULL,
        actor_id TEXT NOT NULL,
        result_reference TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (tenant_id, operation, idempotency_key)
      );

      CREATE TABLE IF NOT EXISTS event_consumer_receipts (
        consumer_group TEXT NOT NULL,
        event_id UUID NOT NULL,
        processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        result JSONB,
        PRIMARY KEY (consumer_group, event_id)
      );

      CREATE TABLE IF NOT EXISTS event_dead_letters (
        event_id UUID NOT NULL,
        event_type TEXT NOT NULL,
        consumer TEXT NOT NULL,
        attempt_count INTEGER NOT NULL,
        first_failure TIMESTAMPTZ NOT NULL,
        last_failure TIMESTAMPTZ NOT NULL,
        error_code TEXT NOT NULL,
        error_message TEXT NOT NULL,
        trace_id TEXT NOT NULL,
        payload_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (event_id, consumer)
      );

      CREATE TABLE IF NOT EXISTS legal_frameworks (
        framework_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        jurisdiction TEXT NOT NULL,
        version TEXT NOT NULL,
        effective_from TIMESTAMPTZ NOT NULL,
        effective_to TIMESTAMPTZ,
        status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SUPERSEDED', 'DRAFT')),
        source_ids JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS legal_versions (
        version_id TEXT PRIMARY KEY,
        framework_id TEXT NOT NULL REFERENCES legal_frameworks(framework_id),
        source_id TEXT NOT NULL,
        version TEXT NOT NULL,
        effective_from TIMESTAMPTZ NOT NULL,
        effective_to TIMESTAMPTZ,
        official_citation TEXT NOT NULL,
        verification_source TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'SUPERSEDED', 'REQUIRES_LEGAL_REVIEW'))
      );

      CREATE TABLE IF NOT EXISTS procurement_controls (
        control_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        legal_source_id TEXT NOT NULL,
        legal_version TEXT NOT NULL,
        provision TEXT NOT NULL,
        effective_from TIMESTAMPTZ NOT NULL,
        effective_to TIMESTAMPTZ,
        applicability TEXT NOT NULL,
        mandatory BOOLEAN NOT NULL,
        severity TEXT NOT NULL,
        evaluation_method TEXT NOT NULL,
        required_evidence JSONB NOT NULL,
        failure_state TEXT NOT NULL,
        human_review_required BOOLEAN NOT NULL,
        stage TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS decision_traces (
        decision_id UUID PRIMARY KEY,
        tenant_id TEXT NOT NULL,
        evaluation_id TEXT NOT NULL,
        criteria_version TEXT NOT NULL,
        legal_version TEXT NOT NULL,
        policy_version TEXT NOT NULL,
        trace_payload JSONB NOT NULL,
        trace_hash TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_decision_traces_evaluation
        ON decision_traces (tenant_id, evaluation_id, created_at);
    `);
  }
}
