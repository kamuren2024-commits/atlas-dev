# P0 Evaluation OS Render Incident

Status: `RESOLVED_IN_PART`

## Summary

The Evaluation OS previously lost its reliable render path by depending on a large, mixed runtime graph of modules and mock procurement state. While the wider platform remained bootable, the Evaluation OS module did not consistently present a definite, trustworthy shell when authoritative tender context was absent.

This was treated as a P0 runtime incident because the requirement is to render a minimal operational shell before reconnecting deeper evaluation features. The safe default in this case is not to fake live data or silently pretend procurement authority exists. The system must show a fail-closed initialization state until the correct subsystem chain is restored.

## Decision

- Keep the shell minimal and deterministic.
- Show an explicit `System initializing...` state rather than a synthetic live dashboard.
- Require authoritative tender context before enabling evaluation features.
- Do not reintroduce mock defaults, default tenders, or fabricated AI/report outputs.
- Reconnect subsystems incrementally after the shell is stable.

## Current state

The app is now protected by a minimal render boundary in the Evaluation OS entry path. When the module fails or is intentionally unavailable, it falls back to a static shell that clearly communicates that the system is in a fail-closed initialization state.

This does not represent a procurement-ready evaluation engine; it is a controlled intermediate checkpoint that keeps the platform honest, inspectable, and recoverable.

## Follow-up

1. Reconnect navigation and tenant context.
2. Reconnect API client and evidence retrieval.
3. Reconnect evaluation workflow and scoring modules.
4. Reconnect governance, reporting, and audit evidence only after the shell is stable.
