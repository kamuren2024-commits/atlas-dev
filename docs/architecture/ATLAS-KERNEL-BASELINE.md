# Atlas Kernel Baseline

This baseline is a forensic map of the existing repository. It distinguishes
implemented behavior from contracts that are only partial or unverified.

| Primitive | Current implementation | Canonical location | Consumers | Gaps / risk | Recommended action |
|---|---|---|---|---|---|
| Mission | Grid mission engine and agent cognitive missions | `backend/mission-engine`, `backend/ai-federation/agents/AgentRuntime.ts` | Command Center, agent harness | Two lifecycle vocabularies; cross-fabric trace is incomplete | Use `platform/kernel` mission contract as an additive boundary |
| Agent | Agent definitions, registry, runtime, harness | `backend/ai-federation/agents`, `backend/agents` | Orchestrators and harnesses | Eligibility is not uniformly enforced before autonomous execution | Resolve through kernel orchestrator and existing registries |
| Model | Federation, routing, Ollama evaluation | `backend/ai-federation` | Gateway, failover, providers | Cloud/local eligibility and fallback evidence remain uneven | Preserve fail-closed Ollama gate; bind evaluations to selection |
| Skill | Hash-bound discovery, evaluation, activation, tenant authorization | `backend/ai-federation/skills/SkillRegistry.ts` | Skill consumers | Cross-model/tool compatibility is caller responsibility | Reuse registry; expose kernel `AtlasSkill` projection |
| Tool | Policy-enforced `ToolGateway`, tool registries, MCP contracts | `backend/ai-federation/agents/ToolGateway.ts`, `backend/integrations/mcp` | Agent runtime, adapters | Canonical schemas, idempotency, and result evidence vary | Keep gateway as execution boundary; normalize manifests |
| Workflow | Durable evaluation workflow and workflow engines | `backend/workflow`, `backend/evaluation/governance` | Evaluation and domain workflows | Multiple workflow implementations; no replacement is safe | Add adapters, not another workflow engine |
| Event | Event fabric, SQLite event store, shared event envelope | `backend/event-fabric`, `packages/contracts/atlas-fabric.ts` | Platform and domain modules | Trace fields are not universal | Extend existing envelope for mission events |
| Evidence | Evidence atom schema, repositories, validators, provenance | `backend/evaluation/evidence-*`, `backend/ai-federation/governance` | Evaluation, procurement, governance | AI conclusions can still be represented outside canonical evidence | Require explicit evidence references in mission outcomes |
| Evaluation | Evaluation OS, agent/model evaluators, TEVV artifacts | `backend/evaluation`, `backend/ai-federation/evaluation`, `docs/tevv` | Runtime and reports | Continuous invalidation and cross-fabric gate are partial | Use `EligibilityStatus` and evidence-backed admission |
| Policy | Policy engines and security authorization | `backend/governance`, `backend/security`, `backend/evaluation/governance` | Gateway, tools, workflows | Policy contracts differ between subsystems | Treat policy decision as authoritative kernel input |
| Approval | Mission approval gates and governance workflows | `backend/mission-engine/approvals.ts`, `backend/evaluation/governance` | Mission and evaluation paths | No single approval projection | Keep mature gates and project into `AtlasApproval` |
| Knowledge | Ontology, persistent graph, knowledge fabric | `backend/ontology`, `backend/graph`, `platform/knowledge-graph` | Domain services and context | Resolver interface and tenant continuity vary | Add resolver adapters |
| Memory | Operational, episodic, semantic, institutional, memory fabric | `backend/ai-federation/memory`, `backend/memory`, `platform` | Agent runtime and domains | Retrieval authorization and provenance need uniform contract | Add `AtlasMemoryObject` projection and resolver boundary |
| Digital Twin | Grid and domain twin services | `backend/digital-twin`, `backend/evaluation/digital-twin-service` | Planning, telemetry, simulation | Several domain-specific twin APIs | Wrap existing services; do not rebuild |
| Simulation | Mission scenarios and logistics simulation fabric | `backend/mission-engine/scenarios.ts`, `backend/domains/logistics/simulation-fabric.ts` | Mission engine and planning | Simulated output needs explicit state labeling | Use `AtlasSimulation.resultState` |
| Identity | Identity service, auth middleware, tenant fields | `backend/security`, federation request metadata | API, routing, governance | Client/server identity continuity needs broader integration tests | Preserve authenticated principal through kernel trace |
| Audit | Audit ledgers, DB logs, connector audit | `backend/ai-federation/compliance`, `backend/database`, `backend/integration` | Gateway, tools, workflows | Audit records are not one universal graph | Add trace references without replacing ledgers |

## Kernel delta

The additive [platform/kernel](../../platform/kernel/index.ts) package now
provides canonical typed projections, explicit mission transitions, and a
provider-neutral mission planning gate. It delegates agent, model, skill,
policy, and persistence behavior to existing implementations.

