# Evidence and audit baseline

## Current state

The repository contains an in-memory audit ledger in `backend/ai-federation/compliance/audit-ledger.ts` and a durable DB path in `backend/database/db-core.ts`. However, the audit model is not yet a full, durable, hash-chained evidence pipeline suitable for government-grade accountability.

## What is demonstrated

- hash chaining exists in the audit ledger
- integrity verification exists
- a ledger is built as a sequence of records

## What is still missing

- durable persistence across process restarts in a fail-closed way
- evidence object schema and provenance chain for decisions
- automatic tamper detection across storage boundaries
- clear mapping from mission, tool, model, and approval to durable evidence references

## Verdict

Audit integrity is partially present, but durable, standardized evidence provenance is not yet established for production-grade operations.
