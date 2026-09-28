# Redis Cognitive State Fabric

## Status

DB-03 is **PARTIAL**. The repository has one centralized `RedisService` and now has a canonical namespace implementation, but no live Redis endpoint is configured in this workspace. Fallback mode is explicitly degraded and is not a distributed production substitute.

## Namespace

Keys use:

```text
atlas:{environment}:{tenant}:{domain}:{resource}:{id}
```

Tenant-owned values must use tenant-scoped builders from `backend/database/redis-namespace.ts`. The legacy public cache/session APIs remain system-scoped to preserve existing callers and must not receive tenant-owned data.

## Role boundaries

| Role | Persistence | TTL | Failure behavior |
| --- | --- | --- | --- |
| Cache | Redis derived state | Caller-defined positive seconds | Read-through callers may use source of truth |
| Session | Redis ephemeral state | Caller-defined positive seconds | Session unavailable |
| Lock | Redis lease | Positive milliseconds | Acquisition fails closed |
| Rate limit | Redis counter | Window seconds | Request is rejected if Redis unavailable |
| Agent memory | Redis ephemeral state | Positive seconds | Write fails closed |
| Queue/worker | Redis coordination | Queue policy | Worker must report failure |

Redis must not be the only copy of approvals, contracts, financial commitments, regulatory records, audit history, or permanent asset state.

## Security

`REDIS_TLS=true` enables TLS. Credentials are read from environment configuration and are not written to keys or logs. Lock release and renewal require the original cryptographic ownership token.

## Validation still required

Provision isolated test Redis and run the existing harness plus tenant isolation, 100+ concurrency, restart/failure injection, and p95/p99 performance tests before marking DB-03 complete.
