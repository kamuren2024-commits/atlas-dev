# Phase 02 Integration Tests

Status: `NOT_IMPLEMENTED`

The repository currently has no deployment-backed PostgreSQL, OIDC, OPA, or
MinIO test service available in this environment. Existing `npm.cmd test` is a
SQLite/platform regression harness and does not satisfy deployment integration
criteria. No fake success tests are being added.

Required environment-backed scenarios:

- PostgreSQL migration, rollback, concurrency, restart persistence, audit, and outbox
- OIDC issuer/audience/signature/expiry/JWKS rotation and tenant isolation
- OPA ALLOW, DENY, and REQUIRE_APPROVAL
- MinIO upload, version, metadata, checksum, retention, and unavailable service
- Cross-service score submission with audit and outbox in one transaction
