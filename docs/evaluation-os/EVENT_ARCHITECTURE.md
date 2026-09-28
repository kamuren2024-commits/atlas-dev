# Event Architecture

Status: `PARTIALLY_IMPLEMENTED`

Material domain mutations first commit PostgreSQL state, audit, and outbox data.
Only after commit may an outbox publisher send versioned envelopes to a
Redpanda/Kafka-compatible backend. Consumers must validate schema, tenant context,
payload hash, and consumer receipt before invoking handlers.

The current event bus and SQLite event store remain development/test infrastructure.
