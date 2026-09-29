# Evaluation State Machine

**Status: PARTIAL / NOT AUTHORITATIVE**

## Current implementation

The relational domain stores `evaluation_tenders.status`, `stage_number`, and `evaluation_workflow_history`. The history table can persist transitions. However, no active command currently governs that table through tender-version-aware stage policy and prerequisites. The older `ProcurementWorkflowStateMachine` is an in-memory singleton with a seeded tender/history and a fixed transition matrix; its Evaluation OS API endpoints now return `503 UNAVAILABLE` instead of presenting that state as real.

The database-backed status endpoint only reports the stored tender status. Its `evaluationPlanStatus` is explicitly `NOT_CONFIGURED`; it does not infer a stage sequence or claim a transition is authorized.

## Required invariants before activation

- Resolve stages from the selected procurement method, immutable tender version, approved evaluation plan, governing rules, and configured workflow.
- Require authenticated actor, role, tenant, reason, current version, policy decision, and correlation ID on each transition.
- Validate stage-specific controls before advancing; write state, audit record, and event atomically or through a transactional outbox.
- Reject stale versions and idempotently process repeated command IDs.
- Keep professional opinion, approval, notification, award, and contract as distinct stages where applicable.

## Not implemented

The full requested lifecycle (`DRAFT` through `CONTRACT`), configurable branching, transition-control evaluation, persistent transition command, tenant scoping, and concurrency protection are not implemented. The in-memory state machine is not an authoritative fallback.
