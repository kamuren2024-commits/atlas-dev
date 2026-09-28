# OPA Deployment

Status: `CONTRACT_ONLY`

Configure `OPA_URL` and the policy path used by `OpaPolicyClient`. The client
calls OPA over HTTP, validates the returned decision enum, propagates a trace ID,
and fails closed on timeout, non-2xx responses, malformed results, or unavailable
policy data.

The application must persist the returned policy decision in PostgreSQL inside
the same transaction as any material state change. This repository does not claim
OPA deployment success until a real OPA service returns ALLOW, DENY, and approval
decisions in integration tests.
