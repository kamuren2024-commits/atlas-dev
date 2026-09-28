# Phase 02 Replay Architecture

Status: `PARTIALLY_IMPLEMENTED`

`EvaluationReplayService` validates required manifest artifacts, content hashes,
missing versions, and produces deterministic replay diagnostics without mutating
original state. Full replay remains blocked until tender, bid, criteria, evidence,
verification, workflow, and decision versions are all persisted by the canonical
repository.
