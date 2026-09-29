# Committee Workflow

**Status: NOT IMPLEMENTED AS AN AUTHORITATIVE WORKFLOW**

## Existing artifacts

The schema includes `committee_sessions`, quorum fields, members/deliberations JSON, consensus fields, and recommendation fields. `EvaluationDbService` contains a committee-session writer. The previous API supplied fallback quorum and consensus values, and the in-memory workflow/contracts carried seeded committee participants.

The committee session read now returns `404` if no persisted session exists. The consensus command returns `503 UNAVAILABLE` until authenticated committee assignments and decision controls exist. In-memory committee, quorum, and workflow responses have been removed from the Evaluation OS route surface.

## Missing controls

- Authenticated committee membership, appointment, tenant, assignment, recusal, and quorum checks.
- Append-only individual evaluator assessments and transparent aggregation/variance review.
- Recorded dissent and unresolved conflict handling backed by durable records.
- Distinct committee recommendation, professional opinion, accounting-officer approval, award, and notification commands.
- Concurrency, command idempotency, audit-diff, and reviewable actor/reason/policy metadata.

The system must not manufacture consensus or infer quorum from a default value.
