# Procurement Control Engine

`DeterministicControlEvaluator` implements the non-AI path for required evidence, date validity, numeric thresholds, and exact configured values.

AI may extract or recommend evidence mappings, but it cannot produce an authoritative pass, award, authorization, or legal conclusion. Evidence with `INVALID` status fails a control; missing required evidence produces `INSUFFICIENT_EVIDENCE`.

The engine is intentionally small and composable. Tender-specific requirements are represented by `RequirementControl` rather than hardcoded into the evaluator.

## Required production wiring

V2 mutation services must invoke policy authorization, deterministic controls, evidence persistence, audit, and durable workflow transitions in one PostgreSQL transaction before this engine can be considered production-complete.
