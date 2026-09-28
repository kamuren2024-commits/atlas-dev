# Security Technical Debt

## Confirmed protections

- Production authentication selects OIDC/JWKS validation.
- V2 routes enforce authenticated identity and tenant checks.
- Production rejects SQLite-backed `EvaluationDbService` construction.
- MCP destinations require HTTPS, host allowlisting, DNS resolution, and private/loopback/link-local address blocking.
- S3 object hashes and production configuration checks exist.

## Remaining findings

| ID | Severity | Evidence | Required action |
|---|---|---|---|
| SEC-P0-01 | P0 | V2 persistence still reaches SQLite outside the production constructor guard. | Complete PostgreSQL repository injection before production enablement. |
| SEC-P1-01 | P1 | MCP validation is performed before an actual connector client exists. | Enforce destination again at socket connection, block redirects, restrict ports, and cap response bytes. |
| SEC-P1-02 | P1 | Durable approval/rate-limit/invocation persistence is not wired. | Persist every material MCP invocation and approval decision. |
| SEC-P1-03 | P1 | Live deployment security tests are unavailable. | Run OIDC, OPA, PostgreSQL, object-store, and connector tests against approved environments. |

No finding is marked resolved merely because a contract exists.
