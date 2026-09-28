# Phase 05 — National Procurement Intelligence

**Status:** PARTIAL  
**Change IDs:** ATLAS-NPI-001, ATLAS-NPI-BE-001, ATLAS-NPI-DATA-001, ATLAS-NPI-SEC-001  

This module establishes an evidence-backed procurement case contract. It does
not treat Tender Studio fixtures or seeded graph examples as production facts.
The API returns `UNAVAILABLE`, `MARKET_DATA_UNAVAILABLE`, or
`INSUFFICIENT_EVIDENCE` where persisted evidence is absent.

## Implemented

- Tenant-scoped procurement cases, lifecycle events, and price observations.
- Authenticated, read-only summary, case, market, and bounded graph endpoints.
- Deterministic pipeline aggregation and competition signal classification.
- Bid confidentiality boundary: bid details are never returned by these routes.
- Human approval remains required for award, supplier selection, contract, and
  budget actions.

## Blockers

Canonical requisition, tender, bid, award, contract, and market-price sources
are not yet available. Existing UI and agent fixtures remain isolated and are
not evidence. Node 24 SQLite native binding availability remains an environment
blocker for runtime migration smoke tests.

## Dossier

See documents `01_CURRENT_STATE_AUDIT.md` through `16_PRODUCTION_READINESS.md`.
