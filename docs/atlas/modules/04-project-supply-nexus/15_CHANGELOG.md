# Changelog

## ATLAS-PSN-001 — 2026-09-06

- Added migration 005 for tenant-scoped project supply requirements.
- Added read-only `/api/project-supply` requirement and supply-position routes.
- Added deterministic material gap calculation with formula and source metadata.
- Added bounded requirement graph projection with provenance.
- Replaced hardcoded Nexus BOM readiness presentation with evidence/unavailable
  states.
- Changed Project Supply Agent readiness scorer to return `UNAVAILABLE` without
  governed evidence.
- Added authorization permissions, audit records and production-readiness
  limitations.
- Validation: PSN type checks, deterministic calculations, documentation
  checks and production build pass; SQLite runtime smoke test is environment
  blocked by the unavailable Node 24 native binding.

Rollback: remove the route mount and migration invocation, revert the PSN
domain/UI/agent changes, and retain existing logistics/supplier behavior.
