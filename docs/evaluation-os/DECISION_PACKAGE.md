# Decision Package

**Status: NOT IMPLEMENTED**

## Current position

The reporting engine contains fixed bidder names, scores, prices, dates, committee members, recommendation text, and a generated hash-like seal. It is not a trustworthy evaluation report generator. The `/api/v2/evaluation/reports/*` and SCM-08 routes now return `503 UNAVAILABLE` rather than expose that fixed content as a government decision record.

No complete decision package is currently assembled from a locked tender version, evaluation plan, bidder results, evidence, calculations, committee decision, professional opinion, approval, award, and audit references. No immutable report version store or package replay/export authorization is active.

## Required package contract

A later implementation must snapshot the governing versions and include source references, calculation manifests, unresolved matters, actor/policy events, and the audit-chain verification result. Each report/package version must have its own immutable content hash, author, timestamp, source-state version, and approval status. Export must generate a recorded audit event.

The existing `reporting-engine.ts` is legacy/mock material and must not be re-enabled until fixed content is removed and the report is generated exclusively from authoritative records.
