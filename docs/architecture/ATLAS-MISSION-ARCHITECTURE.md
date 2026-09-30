# Atlas Mission Architecture

## Mission lifecycle

```text
CREATED
 -> OBSERVE
 -> CONTEXTUALIZE
 -> RETRIEVE
 -> PLAN
 -> SIMULATE
 -> POLICY_CHECK
 -> APPROVAL_CHECK
 -> EXECUTE
 -> VERIFY
 -> EVALUATE
 -> REFLECT
 -> LEARN / REPLAN
```

The existing `backend/mission-engine` and `backend/ai-federation/agents`
implement overlapping portions of this lifecycle. They remain the source
implementations until a compatibility layer is proven; no replacement runtime
should be introduced.

## Mission record requirements

A production mission must bind:

- tenant, principal, mission identity, and classification;
- objective, risk, budget, deadline, and autonomy level;
- agents, skills, models, tools, policies, and approvals;
- evidence and assumptions used for reasoning;
- actions, execution receipts, verification results, and outcome;
- trace, audit, evaluation, and replay references.

## Safety invariants

Mission context is authoritative over model output. A model cannot grant
itself tools, permissions, tenant access, approval, or a higher autonomy level.
Missing evidence or stale evaluation blocks autonomous execution.

