# Trust Plane

Trust is evidence-backed and fail-closed. Discovery is not verification.
Eligibility must be derived from evaluation records bound to the relevant
version, content hash, runtime, or policy context.

The canonical trust projections are defined in
[`platform/kernel/contracts.ts`](../../platform/kernel/contracts.ts), and
mission admission is enforced by
[`platform/kernel/mission-orchestrator.ts`](../../platform/kernel/mission-orchestrator.ts).
The Ollama runtime evaluation artifacts under `docs/tevv` are the source of
current local-model evidence. When the runtime is unavailable, local models
remain `UNVERIFIED` and autonomous execution is blocked.

**Status: PARTIAL.** The kernel preserves tenant and principal continuity and
provides policy, approval, evidence, identity, and audit seams. Durable
cross-service enforcement and the full security regression suite remain
migration work.
