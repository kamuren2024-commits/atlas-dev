# Atlas Graph Architecture

Phase 2 extends the existing in-memory `KnowledgeGraphService`; it does not introduce a second graph database. Existing evaluation, collusion, digital-twin, and entity-resolution consumers continue to use the same singleton.

Modules call bounded graph APIs through `/api/v3/graph`: full graph (legacy), traversal, search, relationship filtering, path analysis, and impact analysis. Query results are capped by depth and callers should apply authorization before exposing restricted records.

Graph edges may carry `provenance`, `relationshipClass`, confidence, source record, observation time, and verification state. AI-inferred relationships must not be treated as verified facts.
