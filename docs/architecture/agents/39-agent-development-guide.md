# 39. Agent Development Guide
## Salience Atlas v5

This guide details how to build and register custom Enterprise Agents using the EAF APIs.

### Developer Steps

1. **Define Configuration**: Set up metadata, required capabilities, policies, and authorization rules.
2. **Build Agent**: Use `AgentFactory` or write a custom class implementing `EnterpriseAgent`.
3. **Register**: Register the agent inside the `AgentRegistry` during application boot.

### Coding Example

```typescript
import { AgentFactory, AgentRegistry } from './src/core/agents/runtime';

const factory = new AgentFactory();
const complianceAgent = factory.createAgent({
  metadata: {
    id: "legal-review-agent",
    name: "Legal Review Agent",
    description: "Evaluates legislative amendments",
    version: "1.0.0"
  },
  capabilities: ["COMPLIANCE", "VALIDATION"],
  policies: { timeoutMs: 10000 },
  permissions: [{ type: "EXECUTE", resource: "*", authorized: true }]
});

AgentRegistry.getInstance().register(complianceAgent);
```
