# Evaluation OS Architecture Rules

1. Production statutory state uses PostgreSQL; SQLite, JSON files, maps, and fixtures are development/test-only.
2. Routes do not perform direct database access; they call application services and repositories.
3. Legal rules are versioned data and registered controls, not scattered untraceable conditionals.
4. Deterministic controls cannot be replaced by AI recommendations.
5. AI cannot authorize, finalize, or mutate statutory state directly.
6. External connectors pass through policy, tenant scope, SSRF validation, provenance, evidence registration, and audit.
7. Every material event has tenant, trace, correlation, causation, version, classification, and payload integrity metadata.
8. In-memory workflow/event providers are rejected by production configuration.
9. Existing V2 capability is upgraded in place; no parallel production Evaluation OS is created.
10. Unknown legal applicability and unavailable authoritative services fail closed or require human/legal review.
