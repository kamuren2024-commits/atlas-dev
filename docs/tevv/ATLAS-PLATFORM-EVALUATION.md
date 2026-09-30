# Atlas Platform Evaluation

## Evidence vocabulary

Use only these result states:

`IMPLEMENTED`, `PARTIAL`, `UNVERIFIED`, `MISSING`, `BLOCKED`.

`IMPLEMENTED` means the contract and relevant behavior are present and
validated. `PARTIAL` means only a bounded subset is present. `UNVERIFIED`
means runtime or integration evidence is absent. `MISSING` means no coherent
implementation was found. `BLOCKED` means a safety gate correctly prevents
execution.

## Current evaluation

| Capability | Result | Evidence |
|---|---|---|
| Shared contracts | PARTIAL | `packages/contracts`, domain contracts |
| Mission lifecycle | PARTIAL | `backend/mission-engine`, `AgentRuntime` |
| Skill integrity and admission | IMPLEMENTED | `SkillRegistry`, skill tests |
| Evidence schema and validation | IMPLEMENTED | `backend/evaluation/evidence-*` |
| Model runtime eligibility | PARTIAL | Ollama evaluator and TEVV artifacts |
| Autonomous local-model execution | BLOCKED | Models remain unverified when Ollama is unavailable |
| Connector lifecycle | PARTIAL | `connector-framework.ts` |
| Digital twin and simulation | PARTIAL | grid and logistics simulation services |
| Cross-fabric durable replay | UNVERIFIED | no complete end-to-end evidence record |
| Global tenant/residency deployment | UNVERIFIED | deployment-specific evidence required |
| SDK/API/CLI/MCP/A2A parity | PARTIAL | APIs and MCP contracts exist; parity suite is absent |

## Required validation

For each newly admitted primitive, run unit, integration, security, failure,
evaluation, observability, and audit tests. Record actual runtime values and
retain failure classifications; never replace unavailable evidence with a
synthetic PASS.

