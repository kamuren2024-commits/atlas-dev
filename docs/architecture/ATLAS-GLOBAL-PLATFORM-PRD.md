# Atlas Global Platform PRD

## North star

Salience Atlas is an enterprise intelligence operating layer: it turns
organization data into governed, evidence-backed decisions and mission
execution. KETRACO is the reference deployment, not the platform boundary.

The platform must preserve the sequence:

`observe -> contextualize -> reason -> simulate -> decide -> approve -> execute -> verify -> learn`

## Product primitives

Atlas exposes typed contracts for these reusable fabrics:

| Fabric | Repository anchor | Status |
|---|---|---|
| Data | `backend/data-fabric` | PARTIAL |
| Knowledge | `backend/ontology`, `backend/graph` | PARTIAL |
| Evidence | `backend/evaluation/evidence-*` | IMPLEMENTED |
| Intelligence | `backend/ai-federation` | PARTIAL |
| Agents | `backend/ai-federation/agents`, `backend/agents` | PARTIAL |
| Skills | `backend/ai-federation/skills/SkillRegistry.ts` | IMPLEMENTED |
| Tools / MCP | `backend/tools`, `backend/integrations/mcp` | PARTIAL |
| Workflow | `backend/workflow`, `backend/event-fabric` | PARTIAL |
| Simulation | `backend/mission-engine/scenarios.ts`, `backend/domains/logistics/simulation-fabric.ts` | PARTIAL |
| Governance | `backend/security`, `backend/governance`, `backend/evaluation/governance` | PARTIAL |
| Evaluation / TEVV | `backend/evaluation`, `docs/tevv` | PARTIAL |
| Observability | `backend/event-fabric`, audit ledgers, runtime telemetry | PARTIAL |

The canonical machine-readable status is
[atlas-platform-capability-map.json](./atlas-platform-capability-map.json).

## Non-goals

- Do not reproduce competitor feature checklists.
- Do not create a second mission, skill, evidence, model, or connector service.
- Do not treat model inventory metadata as runtime trust evidence.
- Do not let model output alter tenant, identity, authorization, policy, or approval context.
- Do not claim production readiness where integration or runtime evidence is absent.

## Global requirements

Every new platform primitive must have a typed contract, unit and failure
tests, security coverage, observability, audit evidence, and an evaluation
record. Existing domain modules may adopt shared contracts incrementally.

## Delivery sequence

1. Stabilize shared contracts and identity/tenant boundaries.
2. Normalize registries and evaluation gates.
3. Connect mission, evidence, approval, workflow, and outcome records.
4. Generalize domain packs without weakening KETRACO controls.
5. Expose the same contracts through API, SDK, CLI, MCP, and events.

