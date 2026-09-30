# Execution Graph

```text
Mission
 -> Agent
 -> Model
 -> Skill
 -> Tool
 -> Policy
 -> Approval
 -> Workflow
 -> Evidence
 -> Evaluation
 -> Outcome
```

`AtlasMission.metadata.traceId` is the root trace identifier. The orchestrator
emits typed mission events and audit adapter calls while preserving
`tenantId`, `principalId`, `missionId`, `traceId`, and classification. The
kernel contracts provide identifiers and references; existing event, audit,
workflow, and persistence systems remain responsible for durable storage.

**Status: PARTIAL.** Planning edges are implemented; durable event storage,
workflow checkpoints, evidence persistence, and post-execution evaluation
remain adapter work.
