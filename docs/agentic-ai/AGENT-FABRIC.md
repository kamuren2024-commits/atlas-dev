# Atlas Agent Fabric

## Responsibilities

The Agent Fabric coordinates agent identity, planning, runtime execution,
memory, tools, policy, approvals, evidence, and evaluation. It does not make
provider-specific assumptions.

## Existing implementation

- Agent definitions and cognitive loop: `backend/ai-federation/agents/AgentRuntime.ts`
- Agent registration and control plane:
  `backend/ai-federation/agents/AgentRegistry.ts`
- Tool authorization boundary: `backend/ai-federation/agents/ToolGateway.ts`
- High-level agent harness: `backend/agents/harness/agent-harness.ts`

## Admission gate

An agent can enter autonomous production execution only when its required
skills, models, tools, policies, and evaluation evidence are compatible with
the mission. A missing or stale dependency blocks execution.

## Current status

Agent lifecycle and cognitive execution are PARTIAL: the runtime exists, but
durable cross-fabric trace linkage and an end-to-end local-model mission
evaluation remain UNVERIFIED. Existing harness success must not be interpreted
as proof of substantive model execution.

