# Atlas Platform Kernel

The kernel is an additive contract boundary, not a replacement runtime.
Canonical projections live in
[`platform/kernel/contracts.ts`](../../platform/kernel/contracts.ts) and
mission planning is coordinated by
[`platform/kernel/mission-orchestrator.ts`](../../platform/kernel/mission-orchestrator.ts).

The kernel preserves tenant, principal, classification, trace, eligibility,
policy, evidence, and evaluation references. Mature domain services remain
responsible for persistence and execution.

## Admission rule

Agents, models, and skills with `FAILED`, `REVOKED`, `EXPIRED`, or
`UNVERIFIED` evaluation status are blocked from autonomous mission planning.
Required tools and workflows must resolve before policy is evaluated. Policy
denial and review requirements also block planning; approval requirements
produce `APPROVAL_REQUIRED` rather than silently allowing execution.

## Delivery status

**IMPLEMENTED:** typed projections, explicit mission transitions, fail-closed
planning checks, and event/audit adapter seams.

**PARTIAL:** durable persistence, approval completion, workflow execution,
evidence/evaluation feedback, and migration of existing domain consumers.

**UNVERIFIED:** global-scale operational characteristics and full cross-tenant
security coverage.
