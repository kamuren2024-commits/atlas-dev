# Agent SDK Federation and Control Plane

## Architecture

Atlas remains authoritative. SDK integrations are adapters that normalize requests and responses; Atlas retains tenant, policy, approval, tool, evidence, mission, evaluation, and audit controls.

```text
Mission -> Agent -> Adapter -> SDK/Runtime -> Model
   -> Skill -> ToolGateway -> Policy/Approval -> Evidence
   -> Evaluation -> Workflow -> Audit
```

The additive contracts and gate live in `backend/ai-federation/agents/AgentControlPlane.ts`. `AgentRuntime` remains the Atlas-native mission loop. `AtlasNativeAdapter` is a bridge to that runtime, not a replacement. It is available as code, but adapter evaluation and production readiness are not implied.

## Provider status

OpenAI Agents SDK, Anthropic Agent SDK, Google ADK, Microsoft Agent Framework, and Ollama agent-runtime adapters are not implemented or represented as configured here. Existing model inference providers are not interchangeable with agent SDK adapters. Their adapter registry entries are explicitly `UNAVAILABLE`; no vendor SDK was installed.

The Atlas adapter implementation is present but its status is `UNVERIFIED`, so the orchestrator will not dispatch through it. Health is not inferred from a package or model inventory.

## Eligibility and execution

`AgentEligibilityGate` rejects absent, stale-version, expired, failed, revoked, and restricted-autonomous evaluation profiles; checks declared capabilities, skills, tools, tenant scope, and model policy; then invokes policy, tenant, skill, tool, and approval checks in that order. `AgentOrchestrator` dispatches only after every gate passes and normalizes the result into the canonical response and trace shape.

Every application composition must provide real governance checks and persist traces. A permissive check stub is not production authorization. Existing AgentRuntime's governance and tool behavior remains in effect after bridge invocation.

## Runtime graph status

| Edge | Status | Evidence |
|---|---|---|
| Mission -> Agent | PARTIAL | Existing AgentRuntime accepts an AgentDefinition and mission ID |
| Agent -> Adapter | PARTIAL | New registry and orchestrator provide an explicit adapter boundary |
| Adapter -> SDK/Runtime | PARTIAL | Atlas bridge implemented; vendor agent SDK bridges are unavailable |
| SDK/Runtime -> Model | UNVERIFIED | No universal SDK runtime integration test |
| Model -> Skill | PARTIAL | Skill refs and declared requirements are typed; automated compatibility routing is not wired |
| Skill -> ToolGateway | PARTIAL | Instructions require Atlas ToolGateway; registry itself cannot execute tools |
| ToolGateway -> Policy/Approval | PARTIAL | Existing runtime tool path retained; cross-runtime proof remains incomplete |
| Policy/Approval -> Evidence | UNVERIFIED | Canonical trace fields exist; durable end-to-end evidence wiring is not implemented here |
| Evidence -> Evaluation | PARTIAL | Existing evaluators remain; new evaluation contracts are additive |
| Evaluation -> Workflow -> Audit | UNVERIFIED | No new production persistence or stale-evaluation invalidation wiring |

## Known limitations

- The profile and trace contracts are in-memory interfaces; durable profile/evaluation storage is not added.
- The registry does not implement health probes, SDK conformance suites, provider discovery, model evaluation routing, or regression invalidation.
- Multi-agent delegation, budget enforcement at this new adapter boundary, and full mission TEVV remain on the existing platform backlog.
- No claim of production readiness is made.
