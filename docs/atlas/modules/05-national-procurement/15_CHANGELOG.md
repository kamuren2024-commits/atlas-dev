# Changelog

## ATLAS-NPI-001

- **Date:** 2025-02-14
- **Purpose:** Establish evidence-backed National Procurement Intelligence.
- **Implementation:** Added migration 006, deterministic lifecycle/competition
  calculations, authenticated read APIs, bounded graph projection, and
  confidentiality-safe responses.
- **Dependencies:** DatabaseCore, AuthorizationService, KnowledgeGraphService,
  EvaluationAuditService.
- **Tests:** Pending targeted validation; runtime SQLite smoke test blocked.
- **Risk:** Canonical source systems are not yet connected.
- **Rollback:** Remove API mount and migration hook; tables are additive.
- **Status:** PARTIAL.
