# Atlas Platform Primitives

## Canonical object graph

```text
Organization -> Tenant -> Mission -> Agent -> Skill -> Model
                                  -> Tool -> Policy -> Approval
                                  -> Workflow -> Action -> Evidence
                                  -> Evaluation -> Outcome -> Memory
Entity <-> Knowledge Graph <-> Digital Twin <-> Simulation <-> Mission
```

## Contract rules

- Every cross-fabric reference carries `tenantId`, source identity, version,
  observed time, and provenance where applicable.
- Evidence is typed as FACT, INFERENCE, PREDICTION, ASSUMPTION,
  RECOMMENDATION, SIMULATION, USER_INPUT, or UNVERIFIED.
- Runtime trust is determined by evaluation evidence, not registration.
- A restricted capability can only be used when mission requirements fit the
  recorded restriction.
- Failover is a policy decision and must be visible in trace and audit data.

## Existing contracts to reuse

- Shared entity and event envelopes: `packages/contracts/atlas-fabric.ts`
- Mission, scenario, approval, and evidence types:
  `backend/mission-engine/types.ts`
- Evidence atoms and provenance: `backend/evaluation/evidence-schema.ts`
- Skill lifecycle and content integrity:
  `backend/ai-federation/skills/SkillRegistry.ts`
- Connector lifecycle and audit: `backend/integration/connector-framework.ts`
- Model federation and runtime evaluation:
  `backend/ai-federation`

## Missing normalization

The next implementation delta is a shared cross-fabric identity envelope and
durable linkage between mission, evidence, evaluation, approval, and outcome.
That work should extend `packages/contracts`, not introduce parallel domain
models.

